import {
  parseLegalPageRow,
  type LegalPageLoadResult,
} from "../domain/legal-page";

type ServerEnvironment = Readonly<Record<string, string | undefined>>;
type LegalPageFetch = (input: URL, init: RequestInit) => Promise<Response>;

type LegalPageFailureClass =
  | "provider_status"
  | "timeout"
  | "transport"
  | "invalid_response";

interface LegalPageDiagnostic {
  readonly event: "legal_page_provider_failure";
  readonly slug: string;
  readonly failureClass: LegalPageFailureClass;
  readonly providerStatus?: number;
  readonly aborted: boolean;
  readonly attempt: 1;
  readonly timeoutMs: number;
  readonly elapsedMs: number;
}

type LegalPageDiagnosticLogger = (diagnostic: LegalPageDiagnostic) => void;

const LEGAL_PAGE_READ_TIMEOUT_MS = 2_000;

interface SupabaseLegalPagesOptions {
  env?: ServerEnvironment;
  fetchImpl?: LegalPageFetch;
  diagnosticLogger?: LegalPageDiagnosticLogger;
}

function defaultDiagnosticLogger(diagnostic: LegalPageDiagnostic): void {
  console.warn("legal_page_provider_failure", diagnostic);
}

export function createSupabaseLegalPagesRepository(
  options: SupabaseLegalPagesOptions = {},
) {
  const env = options.env ?? process.env;
  const fetchImpl = options.fetchImpl ?? fetch;
  const diagnosticLogger = options.diagnosticLogger ?? defaultDiagnosticLogger;

  return {
    async read(slug: string): Promise<LegalPageLoadResult> {
      const supabaseUrl = env.SUPABASE_URL;
      const publishableKey = env.SUPABASE_PUBLISHABLE_KEY;

      if (!supabaseUrl || !publishableKey) {
        return { status: "unavailable", reason: "configuration" };
      }

      let endpoint: URL;
      try {
        endpoint = new URL("/rest/v1/legal_pages", supabaseUrl);
      } catch {
        return { status: "unavailable", reason: "configuration" };
      }

      endpoint.searchParams.set("slug", `eq.${slug}`);
      endpoint.searchParams.set("is_published", "eq.true");
      endpoint.searchParams.set("select", "slug,title,body_jsonb");
      endpoint.searchParams.set("limit", "1");

      const abortController = new AbortController();
      const timeout = setTimeout(() => abortController.abort(), LEGAL_PAGE_READ_TIMEOUT_MS);
      const startedAt = Date.now();

      const reportFailure = (
        failureClass: LegalPageFailureClass,
        providerStatus?: number,
      ): void => {
        diagnosticLogger({
          event: "legal_page_provider_failure",
          slug,
          failureClass,
          providerStatus,
          aborted: abortController.signal.aborted,
          attempt: 1,
          timeoutMs: LEGAL_PAGE_READ_TIMEOUT_MS,
          elapsedMs: Math.max(0, Date.now() - startedAt),
        });
      };

      let payload: unknown;
      try {
        const response = await fetchImpl(endpoint, {
          headers: {
            apikey: publishableKey,
            authorization: `Bearer ${publishableKey}`,
          },
          signal: abortController.signal,
        });

        if (!response.ok) {
          reportFailure("provider_status", response.status);
          return { status: "unavailable", reason: "provider" };
        }

        try {
          payload = await response.json();
        } catch {
          reportFailure(abortController.signal.aborted ? "timeout" : "invalid_response");
          return {
            status: "unavailable",
            reason: abortController.signal.aborted ? "provider" : "invalid_response",
          };
        }
      } catch {
        reportFailure(abortController.signal.aborted ? "timeout" : "transport");
        return { status: "unavailable", reason: "provider" };
      } finally {
        clearTimeout(timeout);
      }

      if (!Array.isArray(payload)) {
        reportFailure("invalid_response");
        return { status: "unavailable", reason: "invalid_response" };
      }

      if (payload.length === 0) {
        return { status: "unavailable", reason: "missing" };
      }

      const page = parseLegalPageRow(payload[0]);
      if (!page) {
        reportFailure("invalid_response");
        return { status: "unavailable", reason: "invalid_response" };
      }

      return { status: "available", page };
    },
  };
}

export async function loadLegalPage(slug: string): Promise<LegalPageLoadResult> {
  return createSupabaseLegalPagesRepository().read(slug);
}

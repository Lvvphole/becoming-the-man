import {
  parseLegalPageRow,
  type LegalPageLoadResult,
} from "../domain/legal-page";

type ServerEnvironment = Readonly<Record<string, string | undefined>>;
type LegalPageFetch = (input: URL, init: RequestInit) => Promise<Response>;

const LEGAL_PAGE_READ_TIMEOUT_MS = 2_000;

interface SupabaseLegalPagesOptions {
  env?: ServerEnvironment;
  fetchImpl?: LegalPageFetch;
}

export function createSupabaseLegalPagesRepository(
  options: SupabaseLegalPagesOptions = {},
) {
  const env = options.env ?? process.env;
  const fetchImpl = options.fetchImpl ?? fetch;

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
          return { status: "unavailable", reason: "provider" };
        }

        try {
          payload = await response.json();
        } catch {
          return { status: "unavailable", reason: "invalid_response" };
        }
      } catch {
        return { status: "unavailable", reason: "provider" };
      } finally {
        clearTimeout(timeout);
      }

      if (!Array.isArray(payload)) {
        return { status: "unavailable", reason: "invalid_response" };
      }

      if (payload.length === 0) {
        return { status: "unavailable", reason: "missing" };
      }

      const page = parseLegalPageRow(payload[0]);
      if (!page) {
        return { status: "unavailable", reason: "invalid_response" };
      }

      return { status: "available", page };
    },
  };
}

export async function loadLegalPage(slug: string): Promise<LegalPageLoadResult> {
  return createSupabaseLegalPagesRepository().read(slug);
}

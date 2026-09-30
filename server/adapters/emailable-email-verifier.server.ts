import type {
  ContactEmailState,
  ContactEmailVerifier,
  ContactEmailVerificationResult,
} from "../domain/contact-inquiry";

type ServerEnvironment = Readonly<Record<string, string | undefined>>;
type VerificationFetch = (input: URL, init: RequestInit) => Promise<Response>;

const EMAILABLE_ORIGIN = "https://api.emailable.com";
const PROVIDER_TIMEOUT_SECONDS = 5;
const REQUEST_TIMEOUT_MS = 7_000;
const STATES: ReadonlySet<string> = new Set([
  "deliverable",
  "undeliverable",
  "risky",
  "unknown",
]);

export interface EmailableEmailVerifierOptions {
  env?: ServerEnvironment;
  fetchImpl?: VerificationFetch;
}

function parseResult(value: unknown): ContactEmailVerificationResult {
  if (!value || typeof value !== "object") {
    return { ok: false };
  }

  const body = value as Record<string, unknown>;
  if (!STATES.has(String(body.state)) || typeof body.disposable !== "boolean") {
    return { ok: false };
  }

  return {
    ok: true,
    state: body.state as ContactEmailState,
    disposable: body.disposable,
  };
}

/** Server-only Emailable adapter for FR-105 contact email plausibility checks. */
export function createEmailableEmailVerifier(
  options: EmailableEmailVerifierOptions = {},
): ContactEmailVerifier {
  const env = options.env ?? process.env;
  const fetchImpl = options.fetchImpl ?? ((input, init) => fetch(input, init));

  return {
    async verify(email: string): Promise<ContactEmailVerificationResult> {
      const apiKey = env.EMAILABLE_API_KEY;
      if (!apiKey) {
        return { ok: false };
      }

      const endpoint = new URL("/v1/verify", EMAILABLE_ORIGIN);
      endpoint.searchParams.set("email", email);
      endpoint.searchParams.set("timeout", String(PROVIDER_TIMEOUT_SECONDS));

      const abortController = new AbortController();
      const timeout = setTimeout(() => abortController.abort(), REQUEST_TIMEOUT_MS);

      try {
        const response = await fetchImpl(endpoint, {
          method: "GET",
          headers: {
            accept: "application/json",
            authorization: `Bearer ${apiKey}`,
          },
          signal: abortController.signal,
        });

        // Emailable uses 249 while a verification is still processing. The contact policy fails
        // closed rather than retrying a paid provider call inside a visitor request.
        if (!response.ok || response.status === 249) {
          return { ok: false };
        }

        return parseResult(await response.json());
      } catch {
        return { ok: false };
      } finally {
        clearTimeout(timeout);
      }
    },
  };
}

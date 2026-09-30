import { createHmac } from "node:crypto";
import type {
  ContactRateLimiter,
  ContactRateLimitResult,
} from "../domain/contact-rate-limit";

type ServerEnvironment = Readonly<Record<string, string | undefined>>;
type RateLimitFetch = (input: URL, init: RequestInit) => Promise<Response>;

const REQUEST_TIMEOUT_MS = 5_000;

export interface SupabaseContactRateLimiterOptions {
  env?: ServerEnvironment;
  fetchImpl?: RateLimitFetch;
}

function digest(secret: string, value: string): string {
  return createHmac("sha256", secret).update(value).digest("hex");
}

export function createSupabaseContactRateLimiter(
  options: SupabaseContactRateLimiterOptions = {},
): ContactRateLimiter {
  const env = options.env ?? process.env;
  const fetchImpl = options.fetchImpl ?? ((input, init) => fetch(input, init));

  return {
    async claim({ email, ip }): Promise<ContactRateLimitResult> {
      const baseUrl = env.SUPABASE_URL;
      const credential = env.SUPABASE_SERVICE_ROLE_KEY;
      const hmacKey = env.CONTACT_RATE_LIMIT_HMAC_KEY;

      if (!baseUrl || !credential || !hmacKey) {
        return { status: "unavailable" };
      }

      let endpoint: URL;
      try {
        endpoint = new URL("/rest/v1/rpc/claim_contact_rate_limit", baseUrl);
      } catch {
        return { status: "unavailable" };
      }

      const body = {
        p_email_hmac: digest(hmacKey, email.trim().toLowerCase()),
        p_ip_hmac: digest(hmacKey, ip.trim()),
      };

      const abortController = new AbortController();
      const timeout = setTimeout(() => abortController.abort(), REQUEST_TIMEOUT_MS);

      try {
        const response = await fetchImpl(endpoint, {
          method: "POST",
          headers: {
            apikey: credential,
            authorization: `Bearer ${credential}`,
            "content-type": "application/json",
          },
          body: JSON.stringify(body),
          signal: abortController.signal,
        });

        if (!response.ok) {
          return { status: "unavailable" };
        }

        let decision: unknown;
        try {
          decision = await response.json();
        } catch {
          return { status: "unavailable" };
        }

        if (decision === "CLAIMED") {
          return { status: "claimed" };
        }
        if (decision === "RATE_LIMITED") {
          return { status: "rate_limited" };
        }
        return { status: "unavailable" };
      } catch {
        return { status: "unavailable" };
      } finally {
        clearTimeout(timeout);
      }
    },
  };
}

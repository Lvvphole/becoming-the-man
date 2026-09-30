import { createHmac } from "node:crypto";
import type {
  ContactRequestState,
  ContactSubmissionResult,
} from "../domain/contact-submission";

type Env = Readonly<Record<string, string | undefined>>;
type DbFetch = (input: URL, init: RequestInit) => Promise<Response>;
const SCOPE = "contact";

const first = (value: unknown): Record<string, unknown> | null =>
  Array.isArray(value) && value[0] && typeof value[0] === "object"
    ? (value[0] as Record<string, unknown>)
    : null;

export function createSupabaseContactRequestState(
  options: { env?: Env; fetchImpl?: DbFetch; now?: () => number } = {},
): ContactRequestState {
  const env = options.env ?? process.env;
  const fetchImpl = options.fetchImpl ?? ((input, init) => fetch(input, init));
  const now = options.now ?? Date.now;

  async function send(
    path: string,
    method: string,
    body: unknown,
    params: Record<string, string> = {},
  ): Promise<Response | null> {
    const base = env.SUPABASE_URL;
    const credential = env.SUPABASE_SERVICE_ROLE_KEY;
    if (!base || !credential) return null;
    try {
      const url = new URL(path, base);
      for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);
      return await fetchImpl(url, {
        method,
        headers: {
          apikey: credential,
          authorization: `Bearer ${credential}`,
          "content-type": "application/json",
          prefer: "return=representation",
        },
        body: JSON.stringify(body),
      });
    } catch {
      return null;
    }
  }

  async function settle(
    requestId: string,
    status: "retryable" | "completed",
    result_jsonb: object,
  ): Promise<boolean> {
    const response = await send("/rest/v1/idempotency_keys", "PATCH", { status, result_jsonb }, {
      scope: `eq.${SCOPE}`,
      key: `eq.${requestId}`,
      status: "eq.pending",
    });
    return Boolean(response?.ok);
  }

  return {
    async begin(input) {
      const secret = env.CONTACT_RATE_LIMIT_HMAC_KEY;
      if (!secret) return { status: "unavailable" };
      const requestHash = createHmac("sha256", secret)
        .update(`contact-request:v1\0${JSON.stringify(input)}`)
        .digest("hex");
      const response = await send("/rest/v1/rpc/claim_idempotency_key", "POST", {
        p_scope: SCOPE,
        p_key: input.requestId,
        p_request_hash: requestHash,
        p_expires_at: new Date(now() + 86_400_000).toISOString(),
      });
      if (!response?.ok) return { status: "unavailable" };

      const row = first(await response.json());
      if (row?.decision === "CLAIMED") return { status: "new" };
      if (row?.decision === "CONFLICT") return { status: "conflict" };
      if (row?.decision === "IN_PROGRESS") return { status: "in_progress" };
      if (row?.decision !== "REPLAY") return { status: "unavailable" };

      const stored = row.result_jsonb as Record<string, unknown> | null;
      if (row.status === "completed" && stored?.result) {
        return { status: "replay", result: stored.result as ContactSubmissionResult };
      }
      if (row.status !== "retryable" || !stored?.state || typeof stored.state !== "object") {
        return { status: "unavailable" };
      }

      const state = stored.state as { rateLimitClaimed?: unknown; verification?: unknown };
      const reacquired = await send("/rest/v1/idempotency_keys", "PATCH", { status: "pending" }, {
        scope: `eq.${SCOPE}`,
        key: `eq.${input.requestId}`,
        request_hash: `eq.${requestHash}`,
        status: "eq.retryable",
      });
      const rows = reacquired?.ok ? await reacquired.json() : null;
      if (!Array.isArray(rows) || rows.length !== 1) return { status: "in_progress" };
      return {
        status: "retry",
        rateLimitClaimed: state.rateLimitClaimed === true,
        verification:
          state.verification === "verified" ||
          state.verification === "risky" ||
          state.verification === "unknown"
            ? state.verification
            : undefined,
      };
    },

    retry(requestId, state) {
      return settle(requestId, "retryable", { state });
    },

    complete(requestId, result) {
      return settle(requestId, "completed", { result });
    },
  };
}

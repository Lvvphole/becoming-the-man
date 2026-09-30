import { createHmac } from "node:crypto";
import type { ContactRequestState, ContactSubmissionResult } from "../domain/contact-submission";

type Env = Readonly<Record<string, string | undefined>>;
type DbFetch = (input: URL, init: RequestInit) => Promise<Response>;
const SCOPE = "contact";

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
    if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) return null;
    try {
      const url = new URL(path, env.SUPABASE_URL);
      for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);
      return await fetchImpl(url, {
        method,
        headers: {
          apikey: env.SUPABASE_SERVICE_ROLE_KEY,
          authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
          "content-type": "application/json",
          prefer: "return=representation",
        },
        body: JSON.stringify(body),
      });
    } catch {
      return null;
    }
  }

  async function patch(requestId: string, status: string, payload: object): Promise<boolean> {
    const response = await send("/rest/v1/idempotency_keys", "PATCH", payload, {
      scope: `eq.${SCOPE}`, key: `eq.${requestId}`, status,
    });
    if (!response?.ok) return false;
    const rows = await response.json().catch(() => null);
    return Array.isArray(rows) && rows.length === 1;
  }

  return {
    async begin(input) {
      const secret = env.CONTACT_RATE_LIMIT_HMAC_KEY;
      if (!secret) return { status: "unavailable" };
      const requestHash = createHmac("sha256", secret)
        .update(`contact-request:v1\0${JSON.stringify(input)}`).digest("hex");
      const response = await send("/rest/v1/rpc/claim_idempotency_key", "POST", {
        p_scope: SCOPE,
        p_key: input.requestId,
        p_request_hash: requestHash,
        p_expires_at: new Date(now() + 86_400_000).toISOString(),
      });
      if (!response?.ok) return { status: "unavailable" };
      const rows = await response.json().catch(() => null);
      const row = Array.isArray(rows) && rows[0] && typeof rows[0] === "object"
        ? (rows[0] as Record<string, unknown>) : null;

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
      if (!await patch(input.requestId, "eq.retryable", { status: "pending" })) {
        return { status: "in_progress" };
      }
      const verification =
        state.verification === "verified" || state.verification === "risky" ||
        state.verification === "unknown" ? state.verification : undefined;
      return { status: "retry", rateLimitClaimed: state.rateLimitClaimed === true, verification };
    },
    retry: (requestId, state) =>
      patch(requestId, "eq.pending", { status: "retryable", result_jsonb: { state } }),
    complete: (requestId, result) =>
      patch(requestId, "eq.pending", { status: "completed", result_jsonb: { result } }),
  };
}

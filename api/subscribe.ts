import { createResendCommunityProvider } from "../server/adapters/resend-community.server";
import { subscribeToCommunity } from "../server/domain/community-subscription";
import { createSupabaseCommunityRepository } from "../server/repositories/supabase-community.server";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type JsonObject = Record<string, unknown>;

function object(value: unknown): JsonObject | null {
  return typeof value === "object" && value !== null ? value as JsonObject : null;
}

function reply(status: number, requestId: string | null, state: "ok" | "accepted" | "error", data: JsonObject | null, error: JsonObject | null): Response {
  return Response.json({ request_id: requestId, status: state, data, error }, { status });
}

async function verifyTurnstile(token: string, request: Request): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return false;
  const body = new URLSearchParams({ secret, response: token });
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  if (forwarded) body.set("remoteip", forwarded);
  try {
    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body,
    });
    const value = object(await response.json());
    return response.ok && value?.success === true;
  } catch {
    return false;
  }
}

export async function POST(request: Request): Promise<Response> {
  let body: JsonObject | null;
  try {
    body = object(await request.json());
  } catch {
    body = null;
  }
  if (!body) return reply(400, null, "error", null, { code: "INVALID_REQUEST", retryable: false });

  const requestId = typeof body.request_id === "string" ? body.request_id : "";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const firstName = typeof body.first_name === "string" ? body.first_name.trim() : undefined;
  const consent = body.marketing_consent;
  const turnstileToken = typeof body.turnstile_token === "string" ? body.turnstile_token : "";

  if (!UUID.test(requestId) || !EMAIL.test(email) || email.length > 254 || (firstName?.length ?? 0) > 80 || turnstileToken.length > 2048) {
    return reply(400, requestId || null, "error", null, { code: "INVALID_REQUEST", retryable: false });
  }
  if (consent !== true) {
    return reply(400, requestId, "error", null, { code: "MARKETING_CONSENT_REQUIRED", retryable: false });
  }
  if (!turnstileToken || !(await verifyTurnstile(turnstileToken, request))) {
    return reply(400, requestId, "error", null, { code: "ABUSE_CHECK_FAILED", retryable: true });
  }

  try {
    const result = await subscribeToCommunity(
      {
        requestId,
        email,
        firstName,
        marketingConsent: true,
        source: "home-community",
        consentVersion: "newsletter-v1",
      },
      {
        repository: createSupabaseCommunityRepository(),
        audienceProvider: createResendCommunityProvider(),
      },
    );

    if (result.status === "subscribed") {
      return reply(200, result.requestId, "ok", { state: "subscribed", subscriber_id: result.subscriberId }, null);
    }
    if (result.status === "pending") {
      return reply(202, result.requestId, "accepted", { state: "pending", subscriber_id: result.subscriberId }, null);
    }
    return reply(400, result.requestId, "error", null, result.error);
  } catch {
    return reply(503, requestId, "error", null, { code: "PERSISTENCE_UNAVAILABLE", retryable: true });
  }
}

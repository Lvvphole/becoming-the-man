import {
  COMMUNITY_ERROR_CODE,
  COMMUNITY_FIELD_LIMITS,
  COMMUNITY_HONEYPOT_FIELD,
  type CommunityErrorCode,
} from "../../contracts/community";
import type { CommunitySubscriptionResult } from "../../server/domain/community-subscription";

export type SubscribeResponseBody =
  | { status: "subscribed" }
  | { status: "pending_provider" }
  | { status: "error"; code: CommunityErrorCode };

/**
 * Deliberately conservative: a single address with a dot-bearing domain. The provider performs the
 * authoritative check, so this only rejects input that cannot possibly be deliverable.
 */
const EMAIL_PATTERN = /^[^\s@,;]+@[^\s@,;.]+(\.[^\s@,;.]+)+$/;

const STATUS_BY_CODE: Readonly<Record<CommunityErrorCode, number>> = {
  [COMMUNITY_ERROR_CODE.consentRequired]: 422,
  [COMMUNITY_ERROR_CODE.emailInvalid]: 422,
  [COMMUNITY_ERROR_CODE.firstNameRequired]: 422,
  [COMMUNITY_ERROR_CODE.fieldTooLong]: 422,
  [COMMUNITY_ERROR_CODE.requestConflict]: 409,
  [COMMUNITY_ERROR_CODE.storageUnavailable]: 503,
  [COMMUNITY_ERROR_CODE.providerUnavailable]: 503,
  [COMMUNITY_ERROR_CODE.rejected]: 400,
};

function json(body: SubscribeResponseBody, status: number): Response {
  return Response.json(body, {
    status,
    headers: { "cache-control": "no-store" },
  });
}

function failure(code: CommunityErrorCode): Response {
  return json({ status: "error", code }, STATUS_BY_CODE[code]);
}

function readField(form: FormData, name: string): string {
  const value = form.get(name);
  return typeof value === "string" ? value : "";
}

export type SubscribeHandler = (
  input: Parameters<
    typeof import("../../server/domain/community-subscription").subscribeToCommunity
  >[0],
) => Promise<CommunitySubscriptionResult>;

/**
 * Validation lives here so the boundary rejects malformed input before any dependency is
 * constructed; the handler is injected so this is testable without Supabase or Resend.
 */
export async function handleSubscribeRequest(
  request: Request,
  subscribe: SubscribeHandler,
  newRequestId: () => string = () => crypto.randomUUID(),
): Promise<Response> {
  if (request.method !== "POST") {
    return failure(COMMUNITY_ERROR_CODE.rejected);
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return failure(COMMUNITY_ERROR_CODE.rejected);
  }

  // A filled decoy means an automated submission. Fail without explaining which field gave it away.
  if (readField(form, COMMUNITY_HONEYPOT_FIELD).trim().length > 0) {
    return failure(COMMUNITY_ERROR_CODE.rejected);
  }

  const email = readField(form, "email").trim();
  const firstName = readField(form, "firstName").trim();
  // Consent must be affirmative and present; an absent checkbox is an absent grant.
  const marketingConsent = readField(form, "marketingConsent") === "on";

  if (email.length > COMMUNITY_FIELD_LIMITS.email || firstName.length > COMMUNITY_FIELD_LIMITS.firstName) {
    return failure(COMMUNITY_ERROR_CODE.fieldTooLong);
  }

  if (!EMAIL_PATTERN.test(email)) {
    return failure(COMMUNITY_ERROR_CODE.emailInvalid);
  }

  if (firstName.length === 0) {
    return failure(COMMUNITY_ERROR_CODE.firstNameRequired);
  }

  if (!marketingConsent) {
    return failure(COMMUNITY_ERROR_CODE.consentRequired);
  }

  // The client supplies a stable id so a retry of one submission stays one logical request; the
  // server creates one only when it is absent or unusable (Architecture section 19).
  const submittedRequestId = readField(form, "requestId").trim();
  const requestId = /^[0-9a-f-]{36}$/i.test(submittedRequestId) ? submittedRequestId : newRequestId();

  const result = await subscribe({ requestId, email, firstName, marketingConsent });

  if (result.status === "error") {
    return failure(result.code);
  }

  return json(result, 200);
}

export async function action({ request }: { request: Request }): Promise<Response> {
  const [{ subscribeToCommunity }, { createSupabaseCommunityRepository }, { createResendContactProvider }] =
    await Promise.all([
      import("../../server/domain/community-subscription"),
      import("../../server/repositories/supabase-community.server"),
      import("../../server/adapters/resend-contacts.server"),
    ]);

  return handleSubscribeRequest(request, (input) =>
    subscribeToCommunity(input, {
      repository: createSupabaseCommunityRepository(),
      contactProvider: createResendContactProvider(),
    }),
  );
}

/** A resource route answers POST only; a GET here is not a page. */
export function loader(): Response {
  return failure(COMMUNITY_ERROR_CODE.rejected);
}

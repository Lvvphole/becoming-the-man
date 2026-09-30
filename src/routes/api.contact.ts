import {
  CONTACT_ERROR_CODE,
  CONTACT_HONEYPOT_FIELD,
  CONTACT_RECAPTCHA_FIELD,
  type ContactErrorCode,
} from "../../contracts/contact";
import {
  CONTACT_DELIVERY_ERROR_CODE,
  type ContactDeliveryErrorCode,
} from "../../server/email/contact-delivery";
import type {
  ContactSubmissionInput,
  ContactSubmissionResult,
} from "../../server/domain/contact-submission";

type ApiErrorCode = ContactErrorCode | ContactDeliveryErrorCode;
export type ContactSubmitHandler = (input: ContactSubmissionInput) => Promise<ContactSubmissionResult>;

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const STATUS: Readonly<Record<ApiErrorCode, number>> = {
  [CONTACT_ERROR_CODE.inquiryTypeInvalid]: 422,
  [CONTACT_ERROR_CODE.nameRequired]: 422,
  [CONTACT_ERROR_CODE.emailInvalid]: 422,
  [CONTACT_ERROR_CODE.messageRequired]: 422,
  [CONTACT_ERROR_CODE.fieldTooLong]: 422,
  [CONTACT_ERROR_CODE.emailUndeliverable]: 422,
  [CONTACT_ERROR_CODE.emailDisposable]: 422,
  [CONTACT_ERROR_CODE.emailVerificationUnavailable]: 503,
  [CONTACT_ERROR_CODE.rejected]: 400,
  [CONTACT_ERROR_CODE.rateLimited]: 429,
  [CONTACT_ERROR_CODE.unavailable]: 503,
  [CONTACT_DELIVERY_ERROR_CODE.unavailable]: 503,
};

const read = (form: FormData, name: string) => {
  const value = form.get(name);
  return typeof value === "string" ? value : "";
};

function failure(requestId: string, code: ApiErrorCode): Response {
  const unavailable = [
    CONTACT_ERROR_CODE.unavailable,
    CONTACT_ERROR_CODE.emailVerificationUnavailable,
    CONTACT_DELIVERY_ERROR_CODE.unavailable,
  ].includes(code as never);
  return Response.json(
    {
      request_id: requestId,
      status: "error",
      data: null,
      error: {
        code,
        message: unavailable
          ? "Contact submission is temporarily unavailable."
          : "Contact submission could not be accepted.",
        retryable: unavailable || code === CONTACT_ERROR_CODE.rateLimited,
      },
    },
    { status: STATUS[code], headers: { "cache-control": "no-store" } },
  );
}

export async function handleContactRequest(
  request: Request,
  submit: ContactSubmitHandler,
  newRequestId = () => crypto.randomUUID(),
): Promise<Response> {
  const fallbackId = newRequestId();
  if (request.method !== "POST") return failure(fallbackId, CONTACT_ERROR_CODE.rejected);

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return failure(fallbackId, CONTACT_ERROR_CODE.rejected);
  }

  const submittedId = read(form, "requestId").trim();
  const requestId = UUID_PATTERN.test(submittedId) ? submittedId : fallbackId;
  if (read(form, CONTACT_HONEYPOT_FIELD).trim()) {
    return failure(requestId, CONTACT_ERROR_CODE.rejected);
  }

  const ip =
    request.headers.get("x-real-ip")?.trim() ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "";
  if (!ip) return failure(requestId, CONTACT_ERROR_CODE.unavailable);

  const result = await submit({
    requestId,
    inquiryType: read(form, "inquiryType"),
    name: read(form, "name"),
    email: read(form, "email"),
    message: read(form, "message"),
    recaptchaToken: read(form, CONTACT_RECAPTCHA_FIELD),
    ip,
  });
  if (result.status === "error") return failure(requestId, result.code);

  return Response.json(
    { request_id: requestId, status: "accepted", data: { receipt: result.receipt }, error: null },
    { status: 200, headers: { "cache-control": "no-store" } },
  );
}

export async function action({ request }: { request: Request }): Promise<Response> {
  const [
    { submitContactInquiry },
    { createGoogleRecaptchaVerifier },
    { createSupabaseContactRateLimiter },
    { createEmailableEmailVerifier },
    { createResendContactDelivery },
  ] = await Promise.all([
    import("../../server/domain/contact-submission"),
    import("../../server/adapters/google-recaptcha.server"),
    import("../../server/repositories/supabase-contact-rate-limit.server"),
    import("../../server/adapters/emailable-email-verifier.server"),
    import("../../server/adapters/resend-contact-delivery.server"),
  ]);
  return handleContactRequest(request, (input) =>
    submitContactInquiry(input, {
      humanVerifier: createGoogleRecaptchaVerifier(),
      rateLimiter: createSupabaseContactRateLimiter(),
      emailVerifier: createEmailableEmailVerifier(),
      delivery: createResendContactDelivery(),
    }),
  );
}

export function loader(): Response {
  return failure(crypto.randomUUID(), CONTACT_ERROR_CODE.rejected);
}

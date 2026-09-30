import {
  CONTACT_ERROR_CODE,
  type ContactErrorCode,
  type ContactInquiryType,
  type ContactVerificationFlag,
} from "../../contracts/contact";
import { assessContactInquiry, validateContactInquiry, type ContactEmailVerifier } from "./contact-inquiry";
import type { ContactRateLimiter } from "./contact-rate-limit";
import type { ContactDeliveryErrorCode, ContactDeliveryProvider } from "../email/contact-delivery";

export interface ContactHumanVerifier {
  verify(token: string, ip: string): Promise<{ status: "verified" | "rejected" | "unavailable" }>;
}

export interface ContactSubmissionInput {
  requestId: string;
  inquiryType: string;
  name: string;
  email: string;
  message: string;
  recaptchaToken: string;
  ip: string;
}

export type ContactSubmissionResult =
  | { status: "accepted"; receipt: "sent" | "failed" }
  | { status: "error"; code: ContactErrorCode | ContactDeliveryErrorCode };

type ReplayIdentity = Omit<ContactSubmissionInput, "recaptchaToken">;
type BeginResult =
  | { status: "new" }
  | { status: "retry"; rateLimitClaimed: boolean; verification?: ContactVerificationFlag }
  | { status: "replay"; result: ContactSubmissionResult }
  | { status: "conflict" | "in_progress" | "unavailable" };

export interface ContactRequestState {
  begin(input: ReplayIdentity): Promise<BeginResult>;
  retry(
    requestId: string,
    state: { rateLimitClaimed: boolean; verification?: ContactVerificationFlag },
  ): Promise<boolean>;
  complete(requestId: string, result: ContactSubmissionResult): Promise<boolean>;
}

export interface ContactSubmissionDependencies {
  humanVerifier: ContactHumanVerifier;
  requestState: ContactRequestState;
  rateLimiter: ContactRateLimiter;
  emailVerifier: ContactEmailVerifier;
  delivery: ContactDeliveryProvider;
}

export async function submitContactInquiry(
  input: ContactSubmissionInput,
  d: ContactSubmissionDependencies,
): Promise<ContactSubmissionResult> {
  const n = {
    inquiryType: input.inquiryType.trim(),
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
    message: input.message.trim(),
  };
  const invalid = validateContactInquiry(n);
  if (invalid) return { status: "error", code: invalid };

  const human = await d.humanVerifier.verify(input.recaptchaToken.trim(), input.ip.trim());
  if (human.status !== "verified") {
    return {
      status: "error",
      code: human.status === "rejected" ? CONTACT_ERROR_CODE.rejected : CONTACT_ERROR_CODE.unavailable,
    };
  }

  const state = await d.requestState.begin({
    requestId: input.requestId,
    ...n,
    ip: input.ip.trim(),
  });
  if (state.status === "replay") return state.result;
  if (state.status === "conflict") return { status: "error", code: CONTACT_ERROR_CODE.rejected };
  if (state.status === "in_progress" || state.status === "unavailable") {
    return { status: "error", code: CONTACT_ERROR_CODE.unavailable };
  }

  let rateLimitClaimed = state.status === "retry" && state.rateLimitClaimed;
  let verification = state.status === "retry" ? state.verification : undefined;

  if (!rateLimitClaimed) {
    const claim = await d.rateLimiter.claim({ email: n.email, ip: input.ip.trim() });
    if (claim.status !== "claimed") {
      const result = {
        status: "error" as const,
        code:
          claim.status === "rate_limited"
            ? CONTACT_ERROR_CODE.rateLimited
            : CONTACT_ERROR_CODE.unavailable,
      };
      if (claim.status === "rate_limited") await d.requestState.complete(input.requestId, result);
      else await d.requestState.retry(input.requestId, { rateLimitClaimed: false });
      return result;
    }
    rateLimitClaimed = true;
  }

  if (!verification) {
    const assessed = await assessContactInquiry(n, { emailVerifier: d.emailVerifier });
    if (assessed.status === "error") {
      if (assessed.code === CONTACT_ERROR_CODE.emailVerificationUnavailable) {
        await d.requestState.retry(input.requestId, { rateLimitClaimed });
      } else {
        await d.requestState.complete(input.requestId, assessed);
      }
      return assessed;
    }
    verification = assessed.verification;
  }

  const delivered = await d.delivery.deliver({
    requestId: input.requestId,
    inquiryType: n.inquiryType as ContactInquiryType,
    name: n.name,
    email: n.email,
    message: n.message,
    verification,
  });
  if (delivered.status === "error") {
    await d.requestState.retry(input.requestId, { rateLimitClaimed, verification });
    return delivered;
  }

  const result = { status: "accepted" as const, receipt: delivered.receipt };
  await d.requestState.complete(input.requestId, result);
  return result;
}

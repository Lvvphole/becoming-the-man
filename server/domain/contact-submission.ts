import {
  CONTACT_ERROR_CODE,
  type ContactErrorCode,
  type ContactInquiryType,
} from "../../contracts/contact";
import {
  assessContactInquiry,
  validateContactInquiry,
  type ContactEmailVerifier,
} from "./contact-inquiry";
import type { ContactRateLimiter } from "./contact-rate-limit";
import type {
  ContactDeliveryErrorCode,
  ContactDeliveryProvider,
} from "../email/contact-delivery";

export interface ContactHumanVerifier {
  verify(
    token: string,
    ip: string,
  ): Promise<
    | { status: "verified" }
    | { status: "rejected" }
    | { status: "unavailable" }
  >;
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

export interface ContactSubmissionDependencies {
  humanVerifier: ContactHumanVerifier;
  rateLimiter: ContactRateLimiter;
  emailVerifier: ContactEmailVerifier;
  delivery: ContactDeliveryProvider;
}

export type ContactSubmissionResult =
  | { status: "accepted"; receipt: "sent" | "failed" }
  | { status: "error"; code: ContactErrorCode | ContactDeliveryErrorCode };

export async function submitContactInquiry(
  input: ContactSubmissionInput,
  dependencies: ContactSubmissionDependencies,
): Promise<ContactSubmissionResult> {
  const normalized = {
    inquiryType: input.inquiryType.trim(),
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
    message: input.message.trim(),
  };

  const invalid = validateContactInquiry(normalized);
  if (invalid) {
    return { status: "error", code: invalid };
  }

  const token = input.recaptchaToken.trim();
  if (!token) {
    return { status: "error", code: CONTACT_ERROR_CODE.rejected };
  }

  const human = await dependencies.humanVerifier.verify(token, input.ip.trim());
  if (human.status === "rejected") {
    return { status: "error", code: CONTACT_ERROR_CODE.rejected };
  }
  if (human.status === "unavailable") {
    return { status: "error", code: CONTACT_ERROR_CODE.unavailable };
  }

  const rateLimit = await dependencies.rateLimiter.claim({
    email: normalized.email,
    ip: input.ip.trim(),
  });
  if (rateLimit.status === "rate_limited") {
    return { status: "error", code: CONTACT_ERROR_CODE.rateLimited };
  }
  if (rateLimit.status === "unavailable") {
    return { status: "error", code: CONTACT_ERROR_CODE.unavailable };
  }

  const assessed = await assessContactInquiry(normalized, {
    emailVerifier: dependencies.emailVerifier,
  });
  if (assessed.status === "error") {
    return assessed;
  }

  const delivered = await dependencies.delivery.deliver({
    requestId: input.requestId,
    inquiryType: normalized.inquiryType as ContactInquiryType,
    name: normalized.name,
    email: normalized.email,
    message: normalized.message,
    verification: assessed.verification,
  });
  if (delivered.status === "error") {
    return delivered;
  }

  return { status: "accepted", receipt: delivered.receipt };
}

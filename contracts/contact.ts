/** Stable browser/server contract for FR-105 author contact. */

export const CONTACT_INQUIRY_TYPES = ["reader", "media", "speaking", "business"] as const;
export type ContactInquiryType = (typeof CONTACT_INQUIRY_TYPES)[number];

export const CONTACT_HONEYPOT_FIELD = "company" as const;
export const CONTACT_RECAPTCHA_FIELD = "recaptchaToken" as const;

export const CONTACT_FIELD_LIMITS = {
  name: 120,
  email: 254,
  message: 4000,
} as const;

export const CONTACT_ERROR_CODE = {
  inquiryTypeInvalid: "inquiry_type_invalid",
  nameRequired: "name_required",
  emailInvalid: "email_invalid",
  messageRequired: "message_required",
  fieldTooLong: "field_too_long",
  emailUndeliverable: "email_undeliverable",
  emailDisposable: "email_disposable",
  emailVerificationUnavailable: "email_verification_unavailable",
  rejected: "contact_rejected",
  rateLimited: "contact_rate_limited",
  unavailable: "contact_unavailable",
} as const;

export type ContactErrorCode =
  (typeof CONTACT_ERROR_CODE)[keyof typeof CONTACT_ERROR_CODE];

export type ContactVerificationFlag = "verified" | "risky" | "unknown";

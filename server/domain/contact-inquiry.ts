import {
  CONTACT_ERROR_CODE,
  CONTACT_FIELD_LIMITS,
  CONTACT_INQUIRY_TYPES,
  type ContactErrorCode,
  type ContactInquiryType,
  type ContactVerificationFlag,
} from "../../contracts/contact";

export interface ContactInquiryInput {
  inquiryType: string;
  name: string;
  email: string;
  message: string;
}

export type ContactEmailState = "deliverable" | "undeliverable" | "risky" | "unknown";

export type ContactEmailVerificationResult =
  | { ok: true; state: ContactEmailState; disposable: boolean }
  | { ok: false };

export interface ContactEmailVerifier {
  verify(email: string): Promise<ContactEmailVerificationResult>;
}

export interface ContactInquiryDependencies {
  emailVerifier: ContactEmailVerifier;
}

export type ContactInquiryResult =
  | { status: "accepted"; verification: ContactVerificationFlag }
  | { status: "error"; code: ContactErrorCode };

const SIMPLE_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isInquiryType(value: string): value is ContactInquiryType {
  return (CONTACT_INQUIRY_TYPES as readonly string[]).includes(value);
}

export function validateContactInquiry(input: ContactInquiryInput): ContactErrorCode | null {
  if (!isInquiryType(input.inquiryType)) {
    return CONTACT_ERROR_CODE.inquiryTypeInvalid;
  }
  if (typeof input.name !== "string" || input.name.trim().length === 0) {
    return CONTACT_ERROR_CODE.nameRequired;
  }
  if (
    typeof input.email !== "string" ||
    !SIMPLE_EMAIL.test(input.email.trim()) ||
    input.email.trim().length > CONTACT_FIELD_LIMITS.email
  ) {
    return CONTACT_ERROR_CODE.emailInvalid;
  }
  if (typeof input.message !== "string" || input.message.trim().length === 0) {
    return CONTACT_ERROR_CODE.messageRequired;
  }
  if (
    input.name.length > CONTACT_FIELD_LIMITS.name ||
    input.message.length > CONTACT_FIELD_LIMITS.message
  ) {
    return CONTACT_ERROR_CODE.fieldTooLong;
  }
  return null;
}

export async function assessContactInquiry(
  input: ContactInquiryInput,
  dependencies: ContactInquiryDependencies,
): Promise<ContactInquiryResult> {
  const invalid = validateContactInquiry(input);
  if (invalid) {
    return { status: "error", code: invalid };
  }

  const verification = await dependencies.emailVerifier.verify(input.email.trim().toLowerCase());
  if (!verification.ok) {
    return { status: "error", code: CONTACT_ERROR_CODE.emailVerificationUnavailable };
  }
  if (verification.disposable) {
    return { status: "error", code: CONTACT_ERROR_CODE.emailDisposable };
  }
  if (verification.state === "undeliverable") {
    return { status: "error", code: CONTACT_ERROR_CODE.emailUndeliverable };
  }

  const flag: ContactVerificationFlag =
    verification.state === "deliverable" ? "verified" : verification.state;
  return { status: "accepted", verification: flag };
}

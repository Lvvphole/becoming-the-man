import type {
  ContactInquiryType,
  ContactVerificationFlag,
} from "../../contracts/contact";

/** Stable provider-neutral error returned when required contact delivery is unavailable. */
export const CONTACT_DELIVERY_ERROR_CODE = {
  unavailable: "contact_delivery_unavailable",
} as const;

export type ContactDeliveryErrorCode =
  (typeof CONTACT_DELIVERY_ERROR_CODE)[keyof typeof CONTACT_DELIVERY_ERROR_CODE];

/** Validated inquiry data needed by the transactional delivery layer. */
export interface ContactDeliveryInput {
  requestId: string;
  inquiryType: ContactInquiryType;
  name: string;
  email: string;
  message: string;
  verification: ContactVerificationFlag;
}

/**
 * Operator notification is required. The visitor receipt is best effort and cannot
 * turn a successful operator delivery into an overall failure.
 */
export type ContactDeliveryResult =
  | { status: "delivered"; receipt: "sent" | "failed" }
  | { status: "error"; code: ContactDeliveryErrorCode };

export interface ContactDeliveryProvider {
  deliver(input: ContactDeliveryInput): Promise<ContactDeliveryResult>;
}

/**
 * Versioned constants and stable error codes for the audience signup contract (FR-103).
 *
 * Consent scope, consent version, and source are persisted with every consent event so a recorded
 * grant stays interpretable after the copy or the form location changes.
 */

export const COMMUNITY_REQUEST_TYPE = "subscribe" as const;
export const COMMUNITY_IDEMPOTENCY_SCOPE = "subscribe" as const;
export const COMMUNITY_CONSENT_SCOPE = "marketing" as const;
export const COMMUNITY_CONSENT_VERSION = "2026-09-marketing-v1" as const;
export const COMMUNITY_SIGNUP_SOURCE = "home-community-form" as const;

/** RFC 5321 caps a path at 254 octets; the first-name ceiling is a schema/abuse limit, not a rule. */
export const COMMUNITY_FIELD_LIMITS = {
  email: 254,
  firstName: 80,
} as const;

/** Name of the decoy field. A submission that fills it is rejected without revealing why. */
export const COMMUNITY_HONEYPOT_FIELD = "company" as const;

/**
 * Stable machine-readable failure codes. These cross the server boundary to the browser, so they are
 * part of the contract: rename one and the form's messaging breaks.
 */
export const COMMUNITY_ERROR_CODE = {
  consentRequired: "consent_required",
  emailInvalid: "email_invalid",
  firstNameRequired: "first_name_required",
  fieldTooLong: "field_too_long",
  requestConflict: "request_conflict",
  requestInProgress: "request_in_progress",
  storageUnavailable: "storage_unavailable",
  providerUnavailable: "provider_unavailable",
  rejected: "rejected",
} as const;

export type CommunityErrorCode = (typeof COMMUNITY_ERROR_CODE)[keyof typeof COMMUNITY_ERROR_CODE];

/**
 * Whether the browser should mint a new idempotency key after this error.
 * A live claim must keep the same id so a retry can `REPLAY` once it settles.
 * Other errors rotate so an abandoned claim is not retried forever as IN_PROGRESS.
 */
export function shouldRotateSubscribeRequestId(code: CommunityErrorCode): boolean {
  return code !== COMMUNITY_ERROR_CODE.requestInProgress;
}

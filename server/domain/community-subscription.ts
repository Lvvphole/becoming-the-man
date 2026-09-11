import {
  COMMUNITY_ERROR_CODE,
  COMMUNITY_FIELD_LIMITS,
  type CommunityErrorCode,
} from "../../contracts/community";

export interface CommunitySubscriptionInput {
  requestId: string;
  email: string;
  firstName: string;
  marketingConsent: boolean;
}

/**
 * The settled answer for one logical request. It is only knowable after provider synchronization,
 * so it is what gets stored against the claim and what a later replay must return.
 */
export type CommunitySettledOutcome = "subscribed" | "pending_provider";

export type CommunityPersistResult =
  | { ok: true; duplicate: true; outcome: CommunitySettledOutcome }
  | { ok: true; duplicate: false; subscriberId: string; emailRequestId: string }
  | { ok: false; code: CommunityErrorCode };

export type CommunityContactSyncResult = { ok: true } | { ok: false; code: CommunityErrorCode };

export type CommunityProviderOutcome = "synced" | "failed";

export interface CommunityProviderOutcomeInput {
  requestId: string;
  subscriberId: string;
  emailRequestId: string;
  outcome: CommunityProviderOutcome;
}

/** Whether the outcome was durably recorded. A failure here means stored state is behind reality. */
export type CommunityProviderOutcomeResult = { ok: boolean };

export interface CommunitySubscriptionRepository {
  persist(input: CommunitySubscriptionInput): Promise<CommunityPersistResult>;
  /**
   * Records how provider synchronization ended and settles the claim with that outcome. This is the
   * only point at which the answer for this request is known, so it is the only point at which the
   * claim may be marked complete — otherwise a replay has nothing truthful to return.
   */
  recordProviderOutcome(
    input: CommunityProviderOutcomeInput,
  ): Promise<CommunityProviderOutcomeResult>;
}

export interface CommunityContactProvider {
  syncContact(input: CommunitySubscriptionInput): Promise<CommunityContactSyncResult>;
}

export interface CommunitySubscriptionDependencies {
  repository: CommunitySubscriptionRepository;
  contactProvider: CommunityContactProvider;
}

export type CommunitySubscriptionResult =
  | { status: "subscribed" }
  | { status: "pending_provider" }
  | { status: "error"; code: CommunityErrorCode };

function validate(input: CommunitySubscriptionInput): CommunityErrorCode | null {
  if (!input.marketingConsent) {
    return COMMUNITY_ERROR_CODE.consentRequired;
  }

  if (typeof input.firstName !== "string" || input.firstName.trim().length === 0) {
    return COMMUNITY_ERROR_CODE.firstNameRequired;
  }

  if (typeof input.email !== "string" || input.email.trim().length === 0) {
    return COMMUNITY_ERROR_CODE.emailInvalid;
  }

  if (
    input.email.length > COMMUNITY_FIELD_LIMITS.email ||
    input.firstName.length > COMMUNITY_FIELD_LIMITS.firstName
  ) {
    return COMMUNITY_ERROR_CODE.fieldTooLong;
  }

  return null;
}

export async function subscribeToCommunity(
  input: CommunitySubscriptionInput,
  dependencies: CommunitySubscriptionDependencies,
): Promise<CommunitySubscriptionResult> {
  const invalid = validate(input);
  if (invalid) {
    return { status: "error", code: invalid };
  }

  const persisted = await dependencies.repository.persist(input);
  if (!persisted.ok) {
    return { status: "error", code: persisted.code };
  }

  // A duplicate submission maps to the same logical result: return the outcome the first attempt
  // settled on, without a second provider call, so one logical signup never produces two sends
  // (Architecture section 19). Reporting success here regardless would claim an outcome the first
  // attempt may never have reached.
  if (persisted.duplicate) {
    return { status: persisted.outcome };
  }

  const synced = await dependencies.contactProvider.syncContact(input);
  const recorded = await dependencies.repository.recordProviderOutcome({
    requestId: input.requestId,
    subscriberId: persisted.subscriberId,
    emailRequestId: persisted.emailRequestId,
    outcome: synced.ok ? "synced" : "failed",
  });

  // Consent and subscriber are durable either way. Reporting a reachable subscription requires both
  // that the provider accepted the contact and that the database recorded it: if the transition did
  // not land, the subscriber is still pending in the authoritative store and is not yet reachable.
  return synced.ok && recorded.ok ? { status: "subscribed" } : { status: "pending_provider" };
}

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

export type CommunityPersistResult =
  | { ok: true; duplicate: true }
  | { ok: true; duplicate: false; subscriberId: string; emailRequestId: string }
  | { ok: false; code: CommunityErrorCode };

export type CommunityContactSyncResult = { ok: true } | { ok: false; code: CommunityErrorCode };

export type CommunityProviderOutcome = "synced" | "failed";

export interface CommunityProviderOutcomeInput {
  subscriberId: string;
  emailRequestId: string;
  outcome: CommunityProviderOutcome;
}

export interface CommunitySubscriptionRepository {
  persist(input: CommunitySubscriptionInput): Promise<CommunityPersistResult>;
  /**
   * Records how provider synchronization ended so a failed sync is visible operator state rather
   * than a silent gap. Never fails the subscription: the consent is already durable by this point.
   */
  recordProviderOutcome(input: CommunityProviderOutcomeInput): Promise<void>;
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

  // A duplicate submission maps to the same logical result: return it without a second provider
  // call, so one logical signup never produces two sends (Architecture section 19).
  if (persisted.duplicate) {
    return { status: "subscribed" };
  }

  const synced = await dependencies.contactProvider.syncContact(input);
  await dependencies.repository.recordProviderOutcome({
    subscriberId: persisted.subscriberId,
    emailRequestId: persisted.emailRequestId,
    outcome: synced.ok ? "synced" : "failed",
  });

  // Consent and subscriber are durable either way. When the provider did not accept the contact the
  // caller must not claim a reachable subscription, so this is reported separately from success.
  return synced.ok ? { status: "subscribed" } : { status: "pending_provider" };
}

export interface CommunitySubscriptionInput {
  requestId: string;
  email: string;
  firstName?: string;
  marketingConsent: boolean;
  source: string;
  consentVersion: string;
}

interface PersistedCommunitySubscription {
  requestId: string;
  subscriberId: string;
  isNewEligibleSubscription: boolean;
}

interface PersistCommunitySubscriptionInput {
  requestId: string;
  email: string;
  firstName?: string;
  source: string;
  consentVersion: string;
}

interface MarkProviderReachableInput {
  subscriberId: string;
  providerContactId: string;
}

interface MarkProviderPendingInput {
  subscriberId: string;
  errorCode: string;
}

export interface CommunitySubscriptionRepository {
  persistConsentAndSubscriber(
    input: PersistCommunitySubscriptionInput,
  ): Promise<PersistedCommunitySubscription>;
  markProviderReachable(input: MarkProviderReachableInput): Promise<void>;
  markProviderPending(input: MarkProviderPendingInput): Promise<void>;
}

interface SyncEligibleContactInput {
  email: string;
  firstName?: string;
  idempotencyKey: string;
}

type SyncEligibleContactResult =
  | { ok: true; contactId: string }
  | { ok: false; code: string };

export interface CommunityAudienceProvider {
  syncEligibleContact(input: SyncEligibleContactInput): Promise<SyncEligibleContactResult>;
}

export interface CommunitySubscriptionDependencies {
  repository: CommunitySubscriptionRepository;
  audienceProvider: CommunityAudienceProvider;
}

export type CommunitySubscriptionResult =
  | {
      status: "subscribed";
      requestId: string;
      subscriberId: string;
    }
  | {
      status: "pending";
      requestId: string;
      subscriberId: string;
    }
  | {
      status: "error";
      requestId: string;
      error: {
        code: "MARKETING_CONSENT_REQUIRED";
        retryable: false;
      };
    };

export async function subscribeToCommunity(
  input: CommunitySubscriptionInput,
  dependencies: CommunitySubscriptionDependencies,
): Promise<CommunitySubscriptionResult> {
  if (!input.marketingConsent) {
    return {
      status: "error",
      requestId: input.requestId,
      error: {
        code: "MARKETING_CONSENT_REQUIRED",
        retryable: false,
      },
    };
  }

  const persisted = await dependencies.repository.persistConsentAndSubscriber({
    requestId: input.requestId,
    email: input.email,
    firstName: input.firstName,
    source: input.source,
    consentVersion: input.consentVersion,
  });

  const providerResult = await dependencies.audienceProvider.syncEligibleContact({
    email: input.email,
    firstName: input.firstName,
    idempotencyKey: `community-contact:${persisted.requestId}`,
  });

  if (!providerResult.ok) {
    await dependencies.repository.markProviderPending({
      subscriberId: persisted.subscriberId,
      errorCode: providerResult.code,
    });

    return {
      status: "pending",
      requestId: persisted.requestId,
      subscriberId: persisted.subscriberId,
    };
  }

  await dependencies.repository.markProviderReachable({
    subscriberId: persisted.subscriberId,
    providerContactId: providerResult.contactId,
  });

  return {
    status: "subscribed",
    requestId: persisted.requestId,
    subscriberId: persisted.subscriberId,
  };
}

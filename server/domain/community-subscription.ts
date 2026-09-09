export interface CommunitySubscriptionInput {
  requestId: string;
  email: string;
  firstName?: string;
  marketingConsent: boolean;
  source: string;
  consentVersion: string;
}

export type CommunityProviderStatus = "not_synced" | "pending" | "reachable";

interface PersistedCommunitySubscription {
  requestId: string;
  subscriberId: string;
  providerStatus: CommunityProviderStatus;
}

export interface CommunitySubscriptionRepository {
  persistConsentAndSubscriber(input: Omit<CommunitySubscriptionInput, "marketingConsent">): Promise<PersistedCommunitySubscription>;
  markProviderReachable(input: {
    subscriberId: string;
    requestId: string;
    providerContactId: string;
  }): Promise<void>;
  markProviderPending(input: {
    subscriberId: string;
    requestId: string;
    errorCode: string;
  }): Promise<void>;
}

export interface CommunityAudienceProvider {
  syncEligibleContact(input: {
    email: string;
    firstName?: string;
  }): Promise<{ ok: true; contactId: string } | { ok: false; code: string }>;
}

export interface CommunitySubscriptionDependencies {
  repository: CommunitySubscriptionRepository;
  audienceProvider: CommunityAudienceProvider;
}

export type CommunitySubscriptionResult =
  | { status: "subscribed"; requestId: string; subscriberId: string }
  | { status: "pending"; requestId: string; subscriberId: string }
  | {
      status: "error";
      requestId: string;
      error: { code: "MARKETING_CONSENT_REQUIRED"; retryable: false };
    };

export async function subscribeToCommunity(
  input: CommunitySubscriptionInput,
  dependencies: CommunitySubscriptionDependencies,
): Promise<CommunitySubscriptionResult> {
  if (!input.marketingConsent) {
    return {
      status: "error",
      requestId: input.requestId,
      error: { code: "MARKETING_CONSENT_REQUIRED", retryable: false },
    };
  }

  const persisted = await dependencies.repository.persistConsentAndSubscriber({
    requestId: input.requestId,
    email: input.email,
    firstName: input.firstName,
    source: input.source,
    consentVersion: input.consentVersion,
  });

  if (persisted.providerStatus === "reachable") {
    return { status: "subscribed", requestId: persisted.requestId, subscriberId: persisted.subscriberId };
  }

  const provider = await dependencies.audienceProvider.syncEligibleContact({
    email: input.email,
    firstName: input.firstName,
  });

  if (!provider.ok) {
    await dependencies.repository.markProviderPending({
      subscriberId: persisted.subscriberId,
      requestId: persisted.requestId,
      errorCode: provider.code,
    });
    return { status: "pending", requestId: persisted.requestId, subscriberId: persisted.subscriberId };
  }

  await dependencies.repository.markProviderReachable({
    subscriberId: persisted.subscriberId,
    requestId: persisted.requestId,
    providerContactId: provider.contactId,
  });
  return { status: "subscribed", requestId: persisted.requestId, subscriberId: persisted.subscriberId };
}

export interface CommunitySubscriptionInput {
  requestId: string;
  email: string;
  firstName?: string;
  marketingConsent: boolean;
}

export interface CommunitySubscriptionRepository {
  persist(input: CommunitySubscriptionInput): Promise<void>;
}

export interface CommunityContactProvider {
  syncContact(input: CommunitySubscriptionInput): Promise<void>;
}

export interface CommunitySubscriptionDependencies {
  repository: CommunitySubscriptionRepository;
  contactProvider: CommunityContactProvider;
}

export type CommunitySubscriptionResult =
  | { status: "error" }
  | { status: "subscribed" };

export async function subscribeToCommunity(
  input: CommunitySubscriptionInput,
  dependencies: CommunitySubscriptionDependencies,
): Promise<CommunitySubscriptionResult> {
  if (!input.marketingConsent) {
    return { status: "error" };
  }

  await dependencies.repository.persist(input);
  await dependencies.contactProvider.syncContact(input);

  return { status: "subscribed" };
}

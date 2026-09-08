import { describe, expect, it, vi } from "vitest";
import {
  subscribeToCommunity,
  type CommunitySubscriptionDependencies,
} from "../../server/domain/community-subscription";

function createDependencies() {
  const calls: string[] = [];

  const dependencies: CommunitySubscriptionDependencies = {
    repository: {
      persistConsentAndSubscriber: vi.fn(async () => {
        calls.push("persist");
        return {
          requestId: "11111111-1111-4111-8111-111111111111",
          subscriberId: "subscriber-1",
          isNewEligibleSubscription: true,
        };
      }),
      markProviderReachable: vi.fn(async () => {
        calls.push("reachable");
      }),
      markProviderPending: vi.fn(async () => {
        calls.push("pending");
      }),
    },
    audienceProvider: {
      syncEligibleContact: vi.fn(async () => {
        calls.push("provider");
        return { ok: true as const, contactId: "contact-1" };
      }),
    },
  };

  return { calls, dependencies };
}

const validInput = {
  requestId: "11111111-1111-4111-8111-111111111111",
  email: "reader@example.com",
  firstName: "Reader",
  marketingConsent: true,
  source: "home-community",
  consentVersion: "newsletter-v1",
} as const;

describe("community subscription", () => {
  it("rejects a signup without explicit marketing consent before any side effect", async () => {
    const { dependencies } = createDependencies();

    const result = await subscribeToCommunity(
      { ...validInput, marketingConsent: false },
      dependencies,
    );

    expect(result).toEqual({
      status: "error",
      requestId: validInput.requestId,
      error: {
        code: "MARKETING_CONSENT_REQUIRED",
        retryable: false,
      },
    });
    expect(dependencies.repository.persistConsentAndSubscriber).not.toHaveBeenCalled();
    expect(dependencies.audienceProvider.syncEligibleContact).not.toHaveBeenCalled();
  });

  it("persists consent and subscriber state before synchronizing the Resend boundary", async () => {
    const { calls, dependencies } = createDependencies();

    const result = await subscribeToCommunity(validInput, dependencies);

    expect(result).toEqual({
      status: "subscribed",
      requestId: validInput.requestId,
      subscriberId: "subscriber-1",
    });
    expect(calls).toEqual(["persist", "provider", "reachable"]);
    expect(dependencies.audienceProvider.syncEligibleContact).toHaveBeenCalledWith({
      email: validInput.email,
      firstName: validInput.firstName,
      idempotencyKey: `community-contact:${validInput.requestId}`,
    });
    expect(dependencies.repository.markProviderReachable).toHaveBeenCalledWith({
      subscriberId: "subscriber-1",
      providerContactId: "contact-1",
    });
  });

  it("returns a recoverable pending state when the provider cannot make the subscriber reachable", async () => {
    const { calls, dependencies } = createDependencies();
    dependencies.audienceProvider.syncEligibleContact = vi.fn(async () => {
      calls.push("provider");
      return { ok: false as const, code: "PROVIDER_UNAVAILABLE" };
    });

    const result = await subscribeToCommunity(validInput, dependencies);

    expect(result).toEqual({
      status: "pending",
      requestId: validInput.requestId,
      subscriberId: "subscriber-1",
    });
    expect(calls).toEqual(["persist", "provider", "pending"]);
    expect(dependencies.repository.markProviderPending).toHaveBeenCalledWith({
      subscriberId: "subscriber-1",
      errorCode: "PROVIDER_UNAVAILABLE",
    });
    expect(dependencies.repository.markProviderReachable).not.toHaveBeenCalled();
  });
});

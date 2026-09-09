import { describe, expect, it, vi } from "vitest";
import {
  subscribeToCommunity,
  type CommunitySubscriptionDependencies,
} from "../../server/domain/community-subscription";

const input = {
  requestId: "11111111-1111-4111-8111-111111111111",
  email: "reader@example.com",
  firstName: "Reader",
  marketingConsent: true,
  source: "home-community",
  consentVersion: "newsletter-v1",
} as const;

function dependencies(providerStatus: "not_synced" | "pending" | "reachable" = "not_synced") {
  const calls: string[] = [];
  const value: CommunitySubscriptionDependencies = {
    repository: {
      persistConsentAndSubscriber: vi.fn(async () => {
        calls.push("persist");
        return {
          requestId: input.requestId,
          subscriberId: "subscriber-1",
          providerStatus,
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
        calls.push("resend");
        return { ok: true as const, contactId: "contact-1" };
      }),
    },
  };
  return { calls, value };
}

describe("community subscription", () => {
  it("rejects missing marketing consent before persistence or provider calls", async () => {
    const { value } = dependencies();

    await expect(subscribeToCommunity({ ...input, marketingConsent: false }, value)).resolves.toEqual({
      status: "error",
      requestId: input.requestId,
      error: { code: "MARKETING_CONSENT_REQUIRED", retryable: false },
    });

    expect(value.repository.persistConsentAndSubscriber).not.toHaveBeenCalled();
    expect(value.audienceProvider.syncEligibleContact).not.toHaveBeenCalled();
  });

  it("persists consent and subscriber state before synchronizing Resend", async () => {
    const { calls, value } = dependencies();

    await expect(subscribeToCommunity(input, value)).resolves.toEqual({
      status: "subscribed",
      requestId: input.requestId,
      subscriberId: "subscriber-1",
    });

    expect(calls).toEqual(["persist", "resend", "reachable"]);
    expect(value.audienceProvider.syncEligibleContact).toHaveBeenCalledWith({
      email: input.email,
      firstName: input.firstName,
    });
  });

  it("returns pending and records the provider failure after durable persistence", async () => {
    const { calls, value } = dependencies();
    value.audienceProvider.syncEligibleContact = vi.fn(async () => {
      calls.push("resend");
      return { ok: false as const, code: "PROVIDER_UNAVAILABLE" };
    });

    await expect(subscribeToCommunity(input, value)).resolves.toEqual({
      status: "pending",
      requestId: input.requestId,
      subscriberId: "subscriber-1",
    });

    expect(calls).toEqual(["persist", "resend", "pending"]);
    expect(value.repository.markProviderPending).toHaveBeenCalledWith({
      subscriberId: "subscriber-1",
      requestId: input.requestId,
      errorCode: "PROVIDER_UNAVAILABLE",
    });
    expect(value.repository.markProviderReachable).not.toHaveBeenCalled();
  });

  it("does not repeat the provider side effect when the subscriber is already reachable", async () => {
    const { calls, value } = dependencies("reachable");

    await expect(subscribeToCommunity(input, value)).resolves.toEqual({
      status: "subscribed",
      requestId: input.requestId,
      subscriberId: "subscriber-1",
    });

    expect(calls).toEqual(["persist"]);
    expect(value.audienceProvider.syncEligibleContact).not.toHaveBeenCalled();
  });
});

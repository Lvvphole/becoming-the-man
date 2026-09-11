import { describe, expect, it, vi } from "vitest";
import { COMMUNITY_ERROR_CODE } from "../../contracts/community";
import {
  subscribeToCommunity,
  type CommunityContactProvider,
  type CommunitySubscriptionRepository,
} from "../../server/domain/community-subscription";

function persistedOk() {
  return {
    ok: true as const,
    duplicate: false as const,
    subscriberId: "e3f1b2c4-0000-4000-8000-000000000001",
    emailRequestId: "e3f1b2c4-0000-4000-8000-000000000002",
  };
}

describe("community subscription consent boundary", () => {
  it("rejects missing marketing consent before persistence or provider effects", async () => {
    const persist = vi.fn<CommunitySubscriptionRepository["persist"]>();
    const recordProviderOutcome = vi.fn<CommunitySubscriptionRepository["recordProviderOutcome"]>();
    const syncContact = vi.fn<CommunityContactProvider["syncContact"]>();

    const result = await subscribeToCommunity(
      {
        requestId: "5fd8508b-f857-4ab7-8266-2635b5aa46e0",
        email: "reader@example.com",
        firstName: "Reader",
        marketingConsent: false,
      },
      {
        repository: { persist, recordProviderOutcome },
        contactProvider: { syncContact },
      },
    );

    expect(result).toEqual({ status: "error", code: COMMUNITY_ERROR_CODE.consentRequired });
    expect(persist).not.toHaveBeenCalled();
    expect(syncContact).not.toHaveBeenCalled();
  });

  it("persists consent-bearing input before provider synchronization", async () => {
    const effects: string[] = [];
    const repository: CommunitySubscriptionRepository = {
      async persist() {
        effects.push("persist");
        return persistedOk();
      },
      async recordProviderOutcome() {
        effects.push("record");
        return { ok: true };
      },
    };
    const contactProvider: CommunityContactProvider = {
      async syncContact() {
        effects.push("sync");
        return { ok: true };
      },
    };

    const result = await subscribeToCommunity(
      {
        requestId: "2ba8af50-4d55-49ad-a10c-c28aa6698d27",
        email: "reader@example.com",
        firstName: "Reader",
        marketingConsent: true,
      },
      { repository, contactProvider },
    );

    expect(result.status).toBe("subscribed");
    expect(effects).toEqual(["persist", "sync", "record"]);
  });

  it.each(["", "   ", "\t\n"])("rejects blank first name %j before side effects", async (firstName) => {
    const persist = vi.fn<CommunitySubscriptionRepository["persist"]>();
    const recordProviderOutcome = vi.fn<CommunitySubscriptionRepository["recordProviderOutcome"]>();
    const syncContact = vi.fn<CommunityContactProvider["syncContact"]>();
    const result = await subscribeToCommunity(
      { requestId: "name-required", email: "reader@example.com", firstName, marketingConsent: true },
      { repository: { persist, recordProviderOutcome }, contactProvider: { syncContact } },
    );
    expect(result).toEqual({ status: "error", code: COMMUNITY_ERROR_CODE.firstNameRequired });
    expect(persist).not.toHaveBeenCalled();
    expect(syncContact).not.toHaveBeenCalled();
  });

  it("rejects an omitted first name before side effects", async () => {
    const persist = vi.fn<CommunitySubscriptionRepository["persist"]>();
    const recordProviderOutcome = vi.fn<CommunitySubscriptionRepository["recordProviderOutcome"]>();
    const syncContact = vi.fn<CommunityContactProvider["syncContact"]>();
    const input = { requestId: "name-missing", email: "reader@example.com", marketingConsent: true };
    const result = await subscribeToCommunity(
      // @ts-expect-error First name is required; exercise an untyped caller at runtime.
      input,
      { repository: { persist, recordProviderOutcome }, contactProvider: { syncContact } },
    );
    expect(result).toEqual({ status: "error", code: COMMUNITY_ERROR_CODE.firstNameRequired });
    expect(persist).not.toHaveBeenCalled();
    expect(syncContact).not.toHaveBeenCalled();
  });

  it("does not synchronize the provider twice for a duplicate submission", async () => {
    const syncContact = vi.fn<CommunityContactProvider["syncContact"]>();
    const recordProviderOutcome = vi.fn<CommunitySubscriptionRepository["recordProviderOutcome"]>();

    const result = await subscribeToCommunity(
      {
        requestId: "0a4f5b2e-1111-4000-8000-000000000003",
        email: "reader@example.com",
        firstName: "Reader",
        marketingConsent: true,
      },
      {
        repository: { async persist() { return { ok: true as const, duplicate: true as const }; }, recordProviderOutcome },
        contactProvider: { syncContact },
      },
    );

    expect(result.status).toBe("subscribed");
    expect(syncContact).not.toHaveBeenCalled();
    expect(recordProviderOutcome).not.toHaveBeenCalled();
  });

  it("reports a failed provider sync as pending rather than a reachable subscription", async () => {
    const recordProviderOutcome = vi
      .fn<CommunitySubscriptionRepository["recordProviderOutcome"]>()
      .mockResolvedValue({ ok: true });

    const result = await subscribeToCommunity(
      {
        requestId: "0a4f5b2e-2222-4000-8000-000000000004",
        email: "reader@example.com",
        firstName: "Reader",
        marketingConsent: true,
      },
      {
        repository: { async persist() { return persistedOk(); }, recordProviderOutcome },
        contactProvider: {
          async syncContact() {
            return { ok: false, code: COMMUNITY_ERROR_CODE.providerUnavailable };
          },
        },
      },
    );

    // Architecture section 19: the consent stays durable and the UI must not claim reachability.
    expect(result.status).toBe("pending_provider");
    expect(recordProviderOutcome).toHaveBeenCalledWith(
      expect.objectContaining({ outcome: "failed" }),
    );
  });

  it("reports pending when the provider synced but the state change was not recorded", async () => {
    // The database is authoritative for audience membership: an unrecorded transition leaves the
    // subscriber pending there, so the visitor must not be told the signup completed.
    const result = await subscribeToCommunity(
      {
        requestId: "0a4f5b2e-4444-4000-8000-000000000006",
        email: "reader@example.com",
        firstName: "Reader",
        marketingConsent: true,
      },
      {
        repository: {
          async persist() {
            return persistedOk();
          },
          async recordProviderOutcome() {
            return { ok: false };
          },
        },
        contactProvider: {
          async syncContact() {
            return { ok: true };
          },
        },
      },
    );

    expect(result.status).toBe("pending_provider");
  });

  it("does not persist when storage is unavailable", async () => {
    const syncContact = vi.fn<CommunityContactProvider["syncContact"]>();

    const result = await subscribeToCommunity(
      {
        requestId: "0a4f5b2e-3333-4000-8000-000000000005",
        email: "reader@example.com",
        firstName: "Reader",
        marketingConsent: true,
      },
      {
        repository: {
          async persist() {
            return { ok: false, code: COMMUNITY_ERROR_CODE.storageUnavailable };
          },
          async recordProviderOutcome() {
            return { ok: true };
          },
        },
        contactProvider: { syncContact },
      },
    );

    expect(result).toEqual({ status: "error", code: COMMUNITY_ERROR_CODE.storageUnavailable });
    expect(syncContact).not.toHaveBeenCalled();
  });
});

import { describe, expect, it, vi } from "vitest";
import {
  subscribeToCommunity,
  type CommunityContactProvider,
  type CommunitySubscriptionRepository,
} from "../../server/domain/community-subscription";

describe("community subscription consent boundary", () => {
  it("rejects missing marketing consent before persistence or provider effects", async () => {
    const persist = vi.fn<CommunitySubscriptionRepository["persist"]>();
    const syncContact = vi.fn<CommunityContactProvider["syncContact"]>();

    const result = await subscribeToCommunity(
      {
        requestId: "5fd8508b-f857-4ab7-8266-2635b5aa46e0",
        email: "reader@example.com",
        firstName: "Reader",
        marketingConsent: false,
      },
      {
        repository: { persist },
        contactProvider: { syncContact },
      },
    );

    expect(result.status).toBe("error");
    expect(persist).not.toHaveBeenCalled();
    expect(syncContact).not.toHaveBeenCalled();
  });
});

import { describe, expect, it } from "vitest";
import { createResendCommunityProvider } from "../../server/adapters/resend-community.server";

describe("Resend community adapter", () => {
  it("uses the documented contact payload without claiming email-send idempotency for contacts", async () => {
    const requests: Array<{ url: URL; init: RequestInit }> = [];
    const provider = createResendCommunityProvider({
      env: {
        RESEND_API_KEY: "re_test",
        RESEND_COMMUNITY_SEGMENT_ID: "segment-1",
      },
      fetchImpl: async (url, init) => {
        requests.push({ url, init });
        return Response.json({ id: "contact-1" }, { status: 201 });
      },
    });

    await expect(
      provider.syncEligibleContact({
        email: "reader@example.com",
        firstName: "Reader",
        idempotencyKey: "community-contact:request-1",
      }),
    ).resolves.toEqual({ ok: true, contactId: "contact-1" });

    expect(requests).toHaveLength(1);
    expect(requests[0]?.url.href).toBe("https://api.resend.com/contacts");
    expect(new Headers(requests[0]?.init.headers).has("idempotency-key")).toBe(false);
    expect(JSON.parse(String(requests[0]?.init.body))).toEqual({
      email: "reader@example.com",
      first_name: "Reader",
      unsubscribed: false,
      segments: [{ id: "segment-1" }],
    });
  });
});

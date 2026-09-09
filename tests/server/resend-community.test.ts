import { describe, expect, it } from "vitest";
import { createResendCommunityProvider } from "../../server/adapters/resend-community.server";

const env = {
  RESEND_API_KEY: "re_test",
  RESEND_COMMUNITY_SEGMENT_ID: "segment-1",
} as const;

describe("Resend community adapter", () => {
  it("creates a contact with the documented payload and no email-send idempotency header", async () => {
    const requests: Array<{ url: URL; init: RequestInit }> = [];
    const provider = createResendCommunityProvider({
      env,
      fetchImpl: async (url, init) => {
        requests.push({ url, init });
        return Response.json({ id: "contact-1" }, { status: 201 });
      },
    });

    await expect(provider.syncEligibleContact({ email: "reader@example.com", firstName: "Reader" }))
      .resolves.toEqual({ ok: true, contactId: "contact-1" });

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

  it("reconciles segment membership when the global contact already exists", async () => {
    const requests: string[] = [];
    const provider = createResendCommunityProvider({
      env,
      fetchImpl: async (url, init) => {
        requests.push(`${init.method} ${url.pathname}`);
        if (requests.length === 1) return Response.json({}, { status: 409 });
        if (requests.length === 2) return Response.json({ id: "contact-1" }, { status: 200 });
        return Response.json({ id: "contact-1" }, { status: 200 });
      },
    });

    await expect(provider.syncEligibleContact({ email: "reader@example.com" }))
      .resolves.toEqual({ ok: true, contactId: "contact-1" });

    expect(requests).toEqual([
      "POST /contacts",
      "GET /contacts/reader%40example.com",
      "POST /contacts/contact-1/segments/segment-1",
    ]);
  });

  it("fails closed when Resend accepts the request without returning a contact id", async () => {
    const provider = createResendCommunityProvider({
      env,
      fetchImpl: async () => Response.json({}, { status: 201 }),
    });

    await expect(provider.syncEligibleContact({ email: "reader@example.com" }))
      .resolves.toEqual({ ok: false, code: "PROVIDER_INVALID_RESPONSE" });
  });

  it("returns a retryable provider failure on network or server failure", async () => {
    const serverFailure = createResendCommunityProvider({
      env,
      fetchImpl: async () => Response.json({}, { status: 503 }),
    });
    const networkFailure = createResendCommunityProvider({
      env,
      fetchImpl: async () => { throw new Error("network"); },
    });

    await expect(serverFailure.syncEligibleContact({ email: "reader@example.com" }))
      .resolves.toEqual({ ok: false, code: "PROVIDER_UNAVAILABLE" });
    await expect(networkFailure.syncEligibleContact({ email: "reader@example.com" }))
      .resolves.toEqual({ ok: false, code: "PROVIDER_UNAVAILABLE" });
  });
});

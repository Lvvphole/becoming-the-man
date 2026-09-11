import { describe, expect, it, vi } from "vitest";
import { COMMUNITY_ERROR_CODE } from "../../contracts/community";
import { createResendContactProvider } from "../../server/adapters/resend-contacts.server";
import type { CommunitySubscriptionInput } from "../../server/domain/community-subscription";

const ENV = { RESEND_API_KEY: "resend-secret-key", RESEND_AUDIENCE_ID: "aud_123" } as const;

const INPUT: CommunitySubscriptionInput = {
  requestId: "1b2c3d4e-6666-4000-8000-000000000020",
  email: " Reader@Example.COM ",
  firstName: " Reader ",
  marketingConsent: true,
};

function ok(): Response {
  return new Response(JSON.stringify({ id: "contact_1" }), { status: 200 });
}

describe("resend contact provider", () => {
  it("adds the consented contact to the configured audience", async () => {
    const fetchImpl = vi.fn(async () => ok());
    const result = await createResendContactProvider({ env: ENV, fetchImpl }).syncContact(INPUT);

    expect(result).toEqual({ ok: true });

    const [endpoint, init] = fetchImpl.mock.calls[0] as unknown as [URL, RequestInit];
    expect(endpoint.origin).toBe("https://api.resend.com");
    expect(endpoint.pathname).toBe("/audiences/aud_123/contacts");
    expect(init.method).toBe("POST");
    expect(JSON.parse(String(init.body))).toEqual({
      email: "reader@example.com",
      first_name: "Reader",
      unsubscribed: false,
    });
  });

  it.each([
    ["a missing api key", { RESEND_AUDIENCE_ID: "aud_123" }],
    ["a missing audience", { RESEND_API_KEY: "resend-secret-key" }],
    ["no configuration at all", {}],
  ])("reports %s as provider_unavailable without calling out", async (_label, env) => {
    const fetchImpl = vi.fn(async () => ok());
    const result = await createResendContactProvider({ env, fetchImpl }).syncContact(INPUT);

    expect(result).toEqual({ ok: false, code: COMMUNITY_ERROR_CODE.providerUnavailable });
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("treats a provider rejection as failure rather than success", async () => {
    const fetchImpl = vi.fn(
      async () => new Response(JSON.stringify({ message: "invalid" }), { status: 422 }),
    );

    const result = await createResendContactProvider({ env: ENV, fetchImpl }).syncContact(INPUT);

    expect(result).toEqual({ ok: false, code: COMMUNITY_ERROR_CODE.providerUnavailable });
  });

  it("treats a transport failure as failure rather than success", async () => {
    const fetchImpl = vi.fn(async () => {
      throw new Error("socket hang up");
    });

    const result = await createResendContactProvider({ env: ENV, fetchImpl }).syncContact(INPUT);

    expect(result).toEqual({ ok: false, code: COMMUNITY_ERROR_CODE.providerUnavailable });
  });

  it("never returns the api key or provider message to the caller", async () => {
    const fetchImpl = vi.fn(
      async () =>
        new Response(JSON.stringify({ message: "resend-secret-key is invalid" }), { status: 401 }),
    );

    const result = await createResendContactProvider({ env: ENV, fetchImpl }).syncContact(INPUT);

    expect(JSON.stringify(result)).not.toContain("resend-secret-key");
    expect(JSON.stringify(result)).not.toContain("invalid");
  });
});

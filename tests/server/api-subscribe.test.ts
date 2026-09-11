import { describe, expect, it, vi } from "vitest";
import { COMMUNITY_ERROR_CODE, COMMUNITY_HONEYPOT_FIELD } from "../../contracts/community";
import { handleSubscribeRequest, type SubscribeHandler } from "../../src/routes/api.subscribe";

const REQUEST_ID = "9f1c2d3e-4444-4000-8000-000000000001";

function post(fields: Record<string, string>): Request {
  const body = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    body.set(key, value);
  }

  return new Request("https://example.test/api/subscribe", { method: "POST", body });
}

function validFields(overrides: Record<string, string> = {}): Record<string, string> {
  return {
    requestId: REQUEST_ID,
    email: "Reader@Example.com",
    firstName: "Reader",
    marketingConsent: "on",
    ...overrides,
  };
}

const subscribed: SubscribeHandler = async () => ({ status: "subscribed" });

describe("POST /api/subscribe boundary", () => {
  it("accepts a consented submission and reports success", async () => {
    const handler = vi.fn<SubscribeHandler>(subscribed);
    const response = await handleSubscribeRequest(post(validFields()), handler);

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ status: "subscribed" });
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(handler).toHaveBeenCalledWith({
      requestId: REQUEST_ID,
      email: "Reader@Example.com",
      firstName: "Reader",
      marketingConsent: true,
    });
  });

  it("reports a failed provider sync without claiming a reachable subscription", async () => {
    const response = await handleSubscribeRequest(post(validFields()), async () => ({
      status: "pending_provider",
    }));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ status: "pending_provider" });
  });

  it.each([
    ["an absent consent checkbox", { marketingConsent: undefined }, COMMUNITY_ERROR_CODE.consentRequired],
    ["a consent value that is not affirmative", { marketingConsent: "maybe" }, COMMUNITY_ERROR_CODE.consentRequired],
    ["a malformed address", { email: "reader@example" }, COMMUNITY_ERROR_CODE.emailInvalid],
    ["an address with no domain", { email: "reader" }, COMMUNITY_ERROR_CODE.emailInvalid],
    ["a blank first name", { firstName: "   " }, COMMUNITY_ERROR_CODE.firstNameRequired],
  ])("rejects %s before any effect", async (_label, overrides, code) => {
    const fields = validFields();
    for (const [key, value] of Object.entries(overrides)) {
      if (value === undefined) {
        delete fields[key];
      } else {
        fields[key] = value;
      }
    }

    const handler = vi.fn<SubscribeHandler>(subscribed);
    const response = await handleSubscribeRequest(post(fields), handler);

    expect(response.status).toBe(422);
    await expect(response.json()).resolves.toEqual({ status: "error", code });
    expect(handler).not.toHaveBeenCalled();
  });

  it("rejects an oversized field before any effect", async () => {
    const handler = vi.fn<SubscribeHandler>(subscribed);
    const response = await handleSubscribeRequest(
      post(validFields({ firstName: "R".repeat(81) })),
      handler,
    );

    expect(response.status).toBe(422);
    await expect(response.json()).resolves.toEqual({
      status: "error",
      code: COMMUNITY_ERROR_CODE.fieldTooLong,
    });
    expect(handler).not.toHaveBeenCalled();
  });

  it("rejects a filled decoy field without revealing the reason", async () => {
    const handler = vi.fn<SubscribeHandler>(subscribed);
    const response = await handleSubscribeRequest(
      post(validFields({ [COMMUNITY_HONEYPOT_FIELD]: "Acme Corp" })),
      handler,
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      status: "error",
      code: COMMUNITY_ERROR_CODE.rejected,
    });
    expect(handler).not.toHaveBeenCalled();
  });

  it.each([
    ["thirty-six hyphens", "-".repeat(36)],
    ["thirty-six hex characters with no separators", "a".repeat(36)],
    ["a hyphenated value of the wrong shape", "aaaa-aaaaaaaa-aaaa-aaaa-aaaaaaaaaaaa"],
    ["a non-hex character in place", "9f1c2d3g-4444-4000-8000-000000000001"],
  ])("replaces %s rather than passing it to the uuid cast", async (_label, malformed) => {
    // These pass a length-and-charset check but are not UUIDs. Forwarding one makes PostgREST fail
    // the cast, which would reach the visitor as a storage failure instead of the documented
    // server-generated fallback.
    const handler = vi.fn<SubscribeHandler>(subscribed);

    await handleSubscribeRequest(
      post(validFields({ requestId: malformed })),
      handler,
      () => REQUEST_ID,
    );

    expect(handler).toHaveBeenCalledWith(expect.objectContaining({ requestId: REQUEST_ID }));
  });

  it("creates a request id when the client did not supply a usable one", async () => {
    const handler = vi.fn<SubscribeHandler>(subscribed);
    const fields = validFields();
    delete fields.requestId;

    await handleSubscribeRequest(post(fields), handler, () => REQUEST_ID);

    expect(handler).toHaveBeenCalledWith(expect.objectContaining({ requestId: REQUEST_ID }));
  });

  it("keeps the client request id so one submission stays one logical request", async () => {
    const handler = vi.fn<SubscribeHandler>(subscribed);
    const generated = vi.fn(() => "server-generated");

    await handleSubscribeRequest(post(validFields()), handler, generated);

    expect(handler).toHaveBeenCalledWith(expect.objectContaining({ requestId: REQUEST_ID }));
    expect(generated).not.toHaveBeenCalled();
  });

  it("maps storage failure to 503 rather than a success shape", async () => {
    const response = await handleSubscribeRequest(post(validFields()), async () => ({
      status: "error",
      code: COMMUNITY_ERROR_CODE.storageUnavailable,
    }));

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({
      status: "error",
      code: COMMUNITY_ERROR_CODE.storageUnavailable,
    });
  });

  it("refuses a non-POST method", async () => {
    const handler = vi.fn<SubscribeHandler>(subscribed);
    const response = await handleSubscribeRequest(
      new Request("https://example.test/api/subscribe"),
      handler,
    );

    expect(response.status).toBe(400);
    expect(handler).not.toHaveBeenCalled();
  });
});

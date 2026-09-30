import { describe, expect, it, vi } from "vitest";
import { createEmailableEmailVerifier } from "../../server/adapters/emailable-email-verifier.server";

const ENV = { EMAILABLE_API_KEY: "test_private_key" } as const;

function response(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

describe("Emailable contact email verifier", () => {
  it("uses server-side bearer auth and maps a deliverable response", async () => {
    const fetchImpl = vi.fn(async () =>
      response({ state: "deliverable", disposable: false, email: "reader@example.com" }),
    );

    const result = await createEmailableEmailVerifier({ env: ENV, fetchImpl }).verify(
      "reader@example.com",
    );

    expect(result).toEqual({ ok: true, state: "deliverable", disposable: false });
    const [endpoint, init] = fetchImpl.mock.calls[0] as unknown as [URL, RequestInit];
    expect(endpoint.origin).toBe("https://api.emailable.com");
    expect(endpoint.pathname).toBe("/v1/verify");
    expect(endpoint.searchParams.get("email")).toBe("reader@example.com");
    expect(endpoint.searchParams.get("timeout")).toBe("5");
    expect(endpoint.searchParams.has("api_key")).toBe(false);
    expect(new Headers(init.headers).get("authorization")).toBe("Bearer test_private_key");
  });

  it.each(["undeliverable", "risky", "unknown"] as const)(
    "maps the documented %s state",
    async (state) => {
      const fetchImpl = vi.fn(async () => response({ state, disposable: false }));

      const result = await createEmailableEmailVerifier({ env: ENV, fetchImpl }).verify(
        "reader@example.com",
      );

      expect(result).toEqual({ ok: true, state, disposable: false });
    },
  );

  it("preserves the disposable signal independently of state", async () => {
    const fetchImpl = vi.fn(async () =>
      response({ state: "deliverable", disposable: true }),
    );

    const result = await createEmailableEmailVerifier({ env: ENV, fetchImpl }).verify(
      "reader@example.com",
    );

    expect(result).toEqual({ ok: true, state: "deliverable", disposable: true });
  });

  it.each([
    ["missing configuration", {}, async () => response({ state: "deliverable", disposable: false })],
    ["provider still processing", ENV, async () => response({ message: "slow" }, 249)],
    ["unknown provider state", ENV, async () => response({ state: "duplicate", disposable: false })],
    ["malformed provider body", ENV, async () => response({ state: "deliverable" })],
  ])("fails closed for %s", async (_label, env, handler) => {
    const fetchImpl = vi.fn(handler);
    const result = await createEmailableEmailVerifier({ env, fetchImpl }).verify(
      "reader@example.com",
    );

    expect(result).toEqual({ ok: false });
    if (!("EMAILABLE_API_KEY" in env)) {
      expect(fetchImpl).not.toHaveBeenCalled();
    }
  });

  it("fails closed on a transport error without exposing provider details", async () => {
    const fetchImpl = vi.fn(async () => {
      throw new Error("test_private_key socket failure");
    });

    const result = await createEmailableEmailVerifier({ env: ENV, fetchImpl }).verify(
      "reader@example.com",
    );

    expect(result).toEqual({ ok: false });
    expect(JSON.stringify(result)).not.toContain("test_private_key");
  });
});

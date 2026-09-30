import { createHmac } from "node:crypto";
import { describe, expect, it, vi } from "vitest";
import { createSupabaseContactRateLimiter } from "../../server/repositories/supabase-contact-rate-limit.server";

const ENV = {
  SUPABASE_URL: "https://project.supabase.co",
  SUPABASE_SERVICE_ROLE_KEY: "service-role-secret",
  CONTACT_RATE_LIMIT_HMAC_KEY: "contact-hmac-secret",
} as const;

function ok(body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}

function hmac(value: string): string {
  return createHmac("sha256", ENV.CONTACT_RATE_LIMIT_HMAC_KEY).update(value).digest("hex");
}

describe("Supabase contact rate limiter", () => {
  it("claims using keyed HMAC identifiers only", async () => {
    const fetchImpl = vi.fn(async () => ok("CLAIMED"));

    const result = await createSupabaseContactRateLimiter({ env: ENV, fetchImpl }).claim({
      email: " Reader@Example.COM ",
      ip: " 203.0.113.7 ",
    });

    expect(result).toEqual({ status: "claimed" });

    const [endpoint, init] = fetchImpl.mock.calls[0] as unknown as [URL, RequestInit];
    expect(endpoint.origin).toBe("https://project.supabase.co");
    expect(endpoint.pathname).toBe("/rest/v1/rpc/claim_contact_rate_limit");
    expect(init.method).toBe("POST");

    const body = JSON.parse(String(init.body)) as Record<string, string>;
    expect(body).toEqual({
      p_email_hmac: hmac("reader@example.com"),
      p_ip_hmac: hmac("203.0.113.7"),
    });
    expect(JSON.stringify(body)).not.toContain("reader@example.com");
    expect(JSON.stringify(body)).not.toContain("203.0.113.7");

    const headers = new Headers(init.headers);
    expect(headers.get("apikey")).toBe(ENV.SUPABASE_SERVICE_ROLE_KEY);
    expect(headers.get("authorization")).toBe(`Bearer ${ENV.SUPABASE_SERVICE_ROLE_KEY}`);
  });

  it("maps the database rate-limit decision", async () => {
    const fetchImpl = vi.fn(async () => ok("RATE_LIMITED"));

    const result = await createSupabaseContactRateLimiter({ env: ENV, fetchImpl }).claim({
      email: "reader@example.com",
      ip: "203.0.113.7",
    });

    expect(result).toEqual({ status: "rate_limited" });
  });

  it.each([
    ["missing Supabase URL", { ...ENV, SUPABASE_URL: undefined }],
    ["missing service role", { ...ENV, SUPABASE_SERVICE_ROLE_KEY: undefined }],
    ["missing HMAC key", { ...ENV, CONTACT_RATE_LIMIT_HMAC_KEY: undefined }],
  ])("fails closed for %s without calling Supabase", async (_label, env) => {
    const fetchImpl = vi.fn(async () => ok("CLAIMED"));

    const result = await createSupabaseContactRateLimiter({ env, fetchImpl }).claim({
      email: "reader@example.com",
      ip: "203.0.113.7",
    });

    expect(result).toEqual({ status: "unavailable" });
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("fails closed on a provider rejection", async () => {
    const fetchImpl = vi.fn(async () => new Response("forbidden", { status: 403 }));

    const result = await createSupabaseContactRateLimiter({ env: ENV, fetchImpl }).claim({
      email: "reader@example.com",
      ip: "203.0.113.7",
    });

    expect(result).toEqual({ status: "unavailable" });
  });

  it("fails closed on a malformed database decision", async () => {
    const fetchImpl = vi.fn(async () => ok("MAYBE"));

    const result = await createSupabaseContactRateLimiter({ env: ENV, fetchImpl }).claim({
      email: "reader@example.com",
      ip: "203.0.113.7",
    });

    expect(result).toEqual({ status: "unavailable" });
  });

  it("fails closed on a transport error without exposing credentials", async () => {
    const fetchImpl = vi.fn(async () => {
      throw new Error("service-role-secret transport failure");
    });

    const result = await createSupabaseContactRateLimiter({ env: ENV, fetchImpl }).claim({
      email: "reader@example.com",
      ip: "203.0.113.7",
    });

    expect(result).toEqual({ status: "unavailable" });
    expect(JSON.stringify(result)).not.toContain("service-role-secret");
    expect(JSON.stringify(result)).not.toContain("contact-hmac-secret");
  });
});

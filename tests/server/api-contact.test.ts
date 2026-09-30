import { describe, expect, it, vi } from "vitest";
import { CONTACT_ERROR_CODE } from "../../contracts/contact";
import { CONTACT_DELIVERY_ERROR_CODE } from "../../server/email/contact-delivery";
import { submitContactInquiry } from "../../server/domain/contact-submission";
import { handleContactRequest } from "../../src/routes/api.contact";

const REQUEST_ID = "1b2c3d4e-7777-4000-8000-000000000105";
const INPUT = {
  requestId: REQUEST_ID, inquiryType: "reader", name: "Reader Example",
  email: "reader@example.com", message: "Question about the book.",
  recaptchaToken: "captcha-token", ip: "203.0.113.7",
};

function request(extra: Record<string, string> = {}, withIp = true) {
  const form = new FormData();
  for (const [key, value] of Object.entries({ ...INPUT, ...extra })) if (key !== "ip") form.set(key, value);
  return new Request("https://example.test/api/contact", {
    method: "POST", body: form, headers: withIp ? { "x-real-ip": INPUT.ip } : undefined,
  });
}

function deps(begin: unknown = { status: "new" }) {
  return {
    humanVerifier: { verify: vi.fn(async () => ({ status: "verified" as const })) },
    requestState: {
      begin: vi.fn(async () => begin),
      retry: vi.fn(async () => true),
      complete: vi.fn(async () => true),
    },
    rateLimiter: { claim: vi.fn(async () => ({ status: "claimed" as const })) },
    emailVerifier: {
      verify: vi.fn(async () => ({ ok: true as const, state: "deliverable" as const, disposable: false })),
    },
    delivery: {
      deliver: vi.fn(async () => ({ status: "delivered" as const, receipt: "sent" as const })),
    },
  };
}

describe("POST /api/contact boundary", () => {
  it("passes stable request ID and trusted client IP", async () => {
    const submit = vi.fn(async () => ({ status: "accepted" as const, receipt: "sent" as const }));
    const response = await handleContactRequest(request(), submit);
    expect(response.status).toBe(200);
    expect(submit).toHaveBeenCalledWith(INPUT);
    expect((await response.json()).request_id).toBe(REQUEST_ID);
  });

  it.each([
    ["honeypot", request({ company: "bot" }), CONTACT_ERROR_CODE.rejected, 400],
    ["missing IP", request({}, false), CONTACT_ERROR_CODE.unavailable, 503],
  ])("rejects %s before orchestration", async (_label, req, code, status) => {
    const submit = vi.fn();
    const response = await handleContactRequest(req, submit);
    expect(response.status).toBe(status);
    expect((await response.json()).error.code).toBe(code);
    expect(submit).not.toHaveBeenCalled();
  });
});

describe("FR-105 request-bound retry", () => {
  it("executes a new request and completes state", async () => {
    const d = deps();
    expect(await submitContactInquiry(INPUT, d)).toEqual({ status: "accepted", receipt: "sent" });
    expect(d.requestState.begin).toHaveBeenCalled();
    expect(d.rateLimiter.claim).toHaveBeenCalledWith({ email: INPUT.email, ip: INPUT.ip });
    expect(d.emailVerifier.verify).toHaveBeenCalledWith(INPUT.email);
    expect(d.requestState.complete).toHaveBeenCalledWith(REQUEST_ID, { status: "accepted", receipt: "sent" });
  });

  it("records retry state after transient delivery failure", async () => {
    const d = deps();
    const failed = {
      ...d,
      delivery: {
        deliver: vi.fn(async () => ({
          status: "error" as const, code: CONTACT_DELIVERY_ERROR_CODE.unavailable,
        })),
      },
    };
    expect(await submitContactInquiry(INPUT, failed)).toEqual({
      status: "error", code: CONTACT_DELIVERY_ERROR_CODE.unavailable,
    });
    expect(failed.requestState.retry).toHaveBeenCalledWith(REQUEST_ID, {
      rateLimitClaimed: true, verification: "verified",
    });
  });

  it("retries the same request without reclaiming rate limit or Emailable", async () => {
    const d = deps({ status: "retry", rateLimitClaimed: true, verification: "verified" });
    expect(await submitContactInquiry(INPUT, d)).toEqual({ status: "accepted", receipt: "sent" });
    expect(d.rateLimiter.claim).not.toHaveBeenCalled();
    expect(d.emailVerifier.verify).not.toHaveBeenCalled();
    expect(d.delivery.deliver).toHaveBeenCalledTimes(1);
  });

  it("returns a completed replay without downstream work", async () => {
    const d = deps({ status: "replay", result: { status: "accepted", receipt: "sent" } });
    expect(await submitContactInquiry(INPUT, d)).toEqual({ status: "accepted", receipt: "sent" });
    expect(d.rateLimiter.claim).not.toHaveBeenCalled();
    expect(d.emailVerifier.verify).not.toHaveBeenCalled();
    expect(d.delivery.deliver).not.toHaveBeenCalled();
  });
});

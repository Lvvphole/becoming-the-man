import { describe, expect, it, vi } from "vitest";
import { CONTACT_ERROR_CODE } from "../../contracts/contact";
import { handleContactRequest } from "../../src/routes/api.contact";
import {
  submitContactInquiry,
  type ContactHumanVerifier,
} from "../../server/domain/contact-submission";
import type { ContactRateLimiter } from "../../server/domain/contact-rate-limit";
import type { ContactEmailVerifier } from "../../server/domain/contact-inquiry";
import type { ContactDeliveryProvider } from "../../server/email/contact-delivery";

const REQUEST_ID = "1b2c3d4e-7777-4000-8000-000000000105";

function formRequest(fields: Record<string, string>, headers: HeadersInit = {}): Request {
  const body = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    body.set(key, value);
  }
  return new Request("https://example.test/api/contact", {
    method: "POST",
    body,
    headers,
  });
}

const VALID_FIELDS = {
  requestId: REQUEST_ID,
  inquiryType: "reader",
  name: "Reader Example",
  email: "reader@example.com",
  message: "I have a question about the book.",
  recaptchaToken: "captcha-token",
};

describe("POST /api/contact boundary", () => {
  it("passes normalized input and trusted client IP to the contact use case", async () => {
    const submit = vi.fn().mockResolvedValue({ status: "accepted", receipt: "sent" });

    const response = await handleContactRequest(
      formRequest(VALID_FIELDS, { "x-real-ip": "203.0.113.7" }),
      submit,
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      request_id: REQUEST_ID,
      status: "accepted",
      data: { receipt: "sent" },
      error: null,
    });
    expect(submit).toHaveBeenCalledWith({
      requestId: REQUEST_ID,
      inquiryType: "reader",
      name: "Reader Example",
      email: "reader@example.com",
      message: "I have a question about the book.",
      recaptchaToken: "captcha-token",
      ip: "203.0.113.7",
    });
  });

  it("rejects a filled honeypot before invoking dependencies", async () => {
    const submit = vi.fn();

    const response = await handleContactRequest(
      formRequest({ ...VALID_FIELDS, company: "bot" }, { "x-real-ip": "203.0.113.7" }),
      submit,
    );

    expect(response.status).toBe(400);
    expect((await response.json()).error.code).toBe(CONTACT_ERROR_CODE.rejected);
    expect(submit).not.toHaveBeenCalled();
  });

  it("fails closed when a client IP is unavailable", async () => {
    const submit = vi.fn();

    const response = await handleContactRequest(formRequest(VALID_FIELDS), submit);

    expect(response.status).toBe(503);
    expect((await response.json()).error.code).toBe(CONTACT_ERROR_CODE.unavailable);
    expect(submit).not.toHaveBeenCalled();
  });
});

describe("FR-105 contact submission orchestration", () => {
  function dependencies(overrides: {
    human?: ContactHumanVerifier["verify"];
    rate?: ContactRateLimiter["claim"];
    email?: ContactEmailVerifier["verify"];
    deliver?: ContactDeliveryProvider["deliver"];
  } = {}) {
    return {
      humanVerifier: {
        verify: vi.fn(overrides.human ?? (async () => ({ status: "verified" as const }))),
      },
      rateLimiter: {
        claim: vi.fn(overrides.rate ?? (async () => ({ status: "claimed" as const }))),
      },
      emailVerifier: {
        verify: vi.fn(
          overrides.email ??
            (async () => ({ ok: true as const, state: "deliverable" as const, disposable: false })),
        ),
      },
      delivery: {
        deliver: vi.fn(
          overrides.deliver ??
            (async () => ({ status: "delivered" as const, receipt: "sent" as const })),
        ),
      },
    };
  }

  const input = {
    requestId: REQUEST_ID,
    inquiryType: "reader",
    name: "Reader Example",
    email: "reader@example.com",
    message: "I have a question about the book.",
    recaptchaToken: "captcha-token",
    ip: "203.0.113.7",
  };

  it("verifies human, claims the rate limit, verifies email, then delivers", async () => {
    const deps = dependencies();

    const result = await submitContactInquiry(input, deps);

    expect(result).toEqual({ status: "accepted", receipt: "sent" });
    expect(deps.humanVerifier.verify).toHaveBeenCalledWith("captcha-token", "203.0.113.7");
    expect(deps.rateLimiter.claim).toHaveBeenCalledWith({
      email: "reader@example.com",
      ip: "203.0.113.7",
    });
    expect(deps.emailVerifier.verify).toHaveBeenCalledWith("reader@example.com");
    expect(deps.delivery.deliver).toHaveBeenCalledWith(
      expect.objectContaining({
        requestId: REQUEST_ID,
        email: "reader@example.com",
        verification: "verified",
      }),
    );
  });

  it("does not call paid or delivery dependencies when reCAPTCHA rejects", async () => {
    const deps = dependencies({ human: async () => ({ status: "rejected" }) });

    const result = await submitContactInquiry(input, deps);

    expect(result).toEqual({ status: "error", code: CONTACT_ERROR_CODE.rejected });
    expect(deps.rateLimiter.claim).not.toHaveBeenCalled();
    expect(deps.emailVerifier.verify).not.toHaveBeenCalled();
    expect(deps.delivery.deliver).not.toHaveBeenCalled();
  });

  it("stops before email verification when the rate limit is reached", async () => {
    const deps = dependencies({ rate: async () => ({ status: "rate_limited" }) });

    const result = await submitContactInquiry(input, deps);

    expect(result).toEqual({ status: "error", code: CONTACT_ERROR_CODE.rateLimited });
    expect(deps.emailVerifier.verify).not.toHaveBeenCalled();
    expect(deps.delivery.deliver).not.toHaveBeenCalled();
  });
});

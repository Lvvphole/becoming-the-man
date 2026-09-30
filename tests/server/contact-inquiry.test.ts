import { describe, expect, it, vi } from "vitest";
import {
  CONTACT_ERROR_CODE,
  CONTACT_FIELD_LIMITS,
  type ContactInquiryType,
} from "../../contracts/contact";
import {
  assessContactInquiry,
  type ContactEmailVerifier,
} from "../../server/domain/contact-inquiry";

const BASE = {
  inquiryType: "reader" as ContactInquiryType,
  name: "Reader",
  email: "reader@example.com",
  message: "I have a question about the book.",
};

describe("contact inquiry plausibility boundary", () => {
  it("accepts a deliverable non-disposable address", async () => {
    const verify = vi.fn<ContactEmailVerifier["verify"]>().mockResolvedValue({
      ok: true,
      state: "deliverable",
      disposable: false,
    });

    const result = await assessContactInquiry(BASE, { emailVerifier: { verify } });

    expect(result).toEqual({ status: "accepted", verification: "verified" });
    expect(verify).toHaveBeenCalledWith("reader@example.com");
  });

  it.each([
    ["risky", "risky"],
    ["unknown", "unknown"],
  ] as const)("accepts %s but preserves the operator flag", async (state, verification) => {
    const verify = vi.fn<ContactEmailVerifier["verify"]>().mockResolvedValue({
      ok: true,
      state,
      disposable: false,
    });

    const result = await assessContactInquiry(BASE, { emailVerifier: { verify } });

    expect(result).toEqual({ status: "accepted", verification });
  });

  it("blocks an undeliverable address", async () => {
    const verify = vi.fn<ContactEmailVerifier["verify"]>().mockResolvedValue({
      ok: true,
      state: "undeliverable",
      disposable: false,
    });

    const result = await assessContactInquiry(BASE, { emailVerifier: { verify } });

    expect(result).toEqual({ status: "error", code: CONTACT_ERROR_CODE.emailUndeliverable });
  });

  it("blocks a disposable address regardless of provider state", async () => {
    const verify = vi.fn<ContactEmailVerifier["verify"]>().mockResolvedValue({
      ok: true,
      state: "deliverable",
      disposable: true,
    });

    const result = await assessContactInquiry(BASE, { emailVerifier: { verify } });

    expect(result).toEqual({ status: "error", code: CONTACT_ERROR_CODE.emailDisposable });
  });

  it("fails closed when verification is unavailable", async () => {
    const verify = vi.fn<ContactEmailVerifier["verify"]>().mockResolvedValue({ ok: false });

    const result = await assessContactInquiry(BASE, { emailVerifier: { verify } });

    expect(result).toEqual({
      status: "error",
      code: CONTACT_ERROR_CODE.emailVerificationUnavailable,
    });
  });

  it.each([
    [{ ...BASE, inquiryType: "other" }, CONTACT_ERROR_CODE.inquiryTypeInvalid],
    [{ ...BASE, name: "   " }, CONTACT_ERROR_CODE.nameRequired],
    [{ ...BASE, email: "not-an-email" }, CONTACT_ERROR_CODE.emailInvalid],
    [{ ...BASE, message: "   " }, CONTACT_ERROR_CODE.messageRequired],
    [
      { ...BASE, message: "x".repeat(CONTACT_FIELD_LIMITS.message + 1) },
      CONTACT_ERROR_CODE.fieldTooLong,
    ],
  ])("rejects invalid input before a paid verifier call", async (input, code) => {
    const verify = vi.fn<ContactEmailVerifier["verify"]>();

    const result = await assessContactInquiry(input, { emailVerifier: { verify } });

    expect(result).toEqual({ status: "error", code });
    expect(verify).not.toHaveBeenCalled();
  });
});

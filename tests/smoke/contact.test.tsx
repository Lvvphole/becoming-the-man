import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { CONTACT_ERROR_CODE } from "../../contracts/contact";
import {
  ContactPage,
  contactErrorField,
  contactErrorMessage,
  submitContactForm,
} from "../../src/routes/contact";

function validForm() {
  const form = new FormData();
  form.set("inquiryType", "reader");
  form.set("name", "Marcus Hale");
  form.set("email", "marcus@example.com");
  form.set("message", "I have a question about the book.");
  form.set("company", "");
  return form;
}

describe("FR-105 contact page UI", () => {
  it("renders an activated Contact form gated by client-side reCAPTCHA", () => {
    const html = renderToStaticMarkup(<ContactPage />);

    expect(html).toContain(">CONTACT<");
    expect(html).toContain("Reader, media, speaking, or business inquiries.");
    expect(html).toContain('method="post"');
    expect(html).toContain('action="/api/contact"');
    expect(html).toContain('name="inquiryType"');
    expect(html).toContain(">Reader<");
    expect(html).toContain(">Media<");
    expect(html).toContain(">Speaking<");
    expect(html).toContain(">Business<");
    expect(html).toContain('name="name"');
    expect(html).toContain('name="email"');
    expect(html).toContain('type="email"');
    expect(html).toContain('name="message"');
    expect(html).toContain('name="company"');
    expect(html).toContain('data-contact-recaptcha="true"');
    expect(html).toContain('aria-label="reCAPTCHA verification"');
    expect(html).toContain('href="/privacy"');
    expect(html).toContain("Complete the reCAPTCHA verification to enable submission.");
    expect(html).toContain("Send inquiry");
    expect(html).not.toContain("Online submission is temporarily unavailable.");
  });

  it("submits the stable request identity and reCAPTCHA token to /api/contact", async () => {
    const requestId = "11111111-1111-4111-8111-111111111111";
    const fetchImpl = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      expect(input).toBe("/api/contact");
      expect(init?.method).toBe("POST");
      expect(init?.headers).toEqual({ accept: "application/json" });

      const body = init?.body as FormData;
      expect(body.get("requestId")).toBe(requestId);
      expect(body.get("recaptchaToken")).toBe("verified-token");
      expect(body.get("inquiryType")).toBe("reader");
      expect(body.get("email")).toBe("marcus@example.com");
      expect(body.get("company")).toBe("");

      return Response.json({
        request_id: requestId,
        status: "accepted",
        data: { receipt: "sent" },
        error: null,
      });
    });

    await expect(
      submitContactForm(validForm(), requestId, "verified-token", fetchImpl),
    ).resolves.toEqual({ status: "accepted", receipt: "sent" });
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it("preserves governed retryable error state from the Contact API", async () => {
    const requestId = "22222222-2222-4222-8222-222222222222";
    const result = await submitContactForm(
      validForm(),
      requestId,
      "verified-token",
      async () =>
        Response.json(
          {
            request_id: requestId,
            status: "error",
            data: null,
            error: {
              code: CONTACT_ERROR_CODE.unavailable,
              message: "Contact submission is temporarily unavailable.",
              retryable: true,
            },
          },
          { status: 503 },
        ),
    );

    expect(result).toEqual({
      status: "error",
      code: CONTACT_ERROR_CODE.unavailable,
      retryable: true,
      message: "Contact submission is temporarily unavailable. Please try again.",
    });
  });

  it("maps stable validation failures to their accessible form controls", () => {
    expect(contactErrorField(CONTACT_ERROR_CODE.inquiryTypeInvalid)).toBe("inquiryType");
    expect(contactErrorField(CONTACT_ERROR_CODE.nameRequired)).toBe("name");
    expect(contactErrorField(CONTACT_ERROR_CODE.emailInvalid)).toBe("email");
    expect(contactErrorField(CONTACT_ERROR_CODE.messageRequired)).toBe("message");
    expect(contactErrorField(CONTACT_ERROR_CODE.fieldTooLong)).toBeNull();
    expect(contactErrorMessage(CONTACT_ERROR_CODE.nameRequired)).toBe("Enter your name.");
    expect(contactErrorMessage(CONTACT_ERROR_CODE.messageRequired)).toBe("Enter a message.");
  });

  it("uses stable user-facing messages for abuse and verification errors", () => {
    expect(contactErrorMessage(CONTACT_ERROR_CODE.emailInvalid)).toContain(
      "email address that can receive replies",
    );
    expect(contactErrorMessage(CONTACT_ERROR_CODE.rateLimited)).toContain(
      "submitted recently",
    );
    expect(contactErrorMessage(CONTACT_ERROR_CODE.rejected)).toContain(
      "reCAPTCHA",
    );
  });

  it("preserves primary navigation on mobile", () => {
    const html = renderToStaticMarkup(<ContactPage />);

    expect(html).toContain('<details class="mobile-nav">');
    expect(html).toContain('<summary aria-label="Navigation menu">');
    expect(html).toContain('<nav aria-label="Mobile primary">');
    expect(html).toContain('<a href="/contact" aria-current="page">Contact</a>');
  });
});

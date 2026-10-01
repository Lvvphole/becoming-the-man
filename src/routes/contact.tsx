import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  CONTACT_ERROR_CODE,
  CONTACT_FIELD_LIMITS,
  CONTACT_HONEYPOT_FIELD,
  CONTACT_RECAPTCHA_FIELD,
} from "../../contracts/contact";

type ContactFetch = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;
type ContactField = "inquiryType" | "name" | "email" | "message";

type ContactApiPayload = {
  status?: unknown;
  data?: { receipt?: unknown } | null;
  error?: { code?: unknown; retryable?: unknown } | null;
};

export type ContactClientResult =
  | { status: "accepted"; receipt: "sent" | "failed" }
  | { status: "error"; code: string; retryable: boolean; message: string };

type GrecaptchaApi = {
  ready(callback: () => void): void;
  render(
    container: HTMLElement,
    options: {
      sitekey: string;
      callback(token: string): void;
      "expired-callback"(): void;
      "error-callback"(): void;
    },
  ): number;
  reset(widgetId?: number): void;
};

declare global {
  interface Window {
    grecaptcha?: GrecaptchaApi;
  }
}

const CONTACT_ENDPOINT = "/api/contact";
const RECAPTCHA_SCRIPT_ID = "btmsct-google-recaptcha";
const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY?.trim() ?? "";

export function contactErrorField(code: string): ContactField | null {
  if (code === CONTACT_ERROR_CODE.inquiryTypeInvalid) return "inquiryType";
  if (code === CONTACT_ERROR_CODE.nameRequired) return "name";
  if (
    code === CONTACT_ERROR_CODE.emailInvalid ||
    code === CONTACT_ERROR_CODE.emailUndeliverable ||
    code === CONTACT_ERROR_CODE.emailDisposable
  ) return "email";
  if (code === CONTACT_ERROR_CODE.messageRequired) return "message";
  return null;
}

export function contactErrorMessage(code: string): string {
  if (code === CONTACT_ERROR_CODE.rateLimited) {
    return "An inquiry from this email or network was submitted recently. Please try again later.";
  }
  if (code === CONTACT_ERROR_CODE.rejected) {
    return "We could not verify this submission. Complete the reCAPTCHA and try again.";
  }
  if (code === CONTACT_ERROR_CODE.inquiryTypeInvalid) return "Choose a valid inquiry type.";
  if (code === CONTACT_ERROR_CODE.nameRequired) return "Enter your name.";
  if (
    code === CONTACT_ERROR_CODE.emailInvalid ||
    code === CONTACT_ERROR_CODE.emailUndeliverable
  ) {
    return "Enter an email address that can receive replies.";
  }
  if (code === CONTACT_ERROR_CODE.emailDisposable) {
    return "Use a non-disposable email address so a reply can reach you.";
  }
  if (code === CONTACT_ERROR_CODE.messageRequired) return "Enter a message.";
  if (code === CONTACT_ERROR_CODE.fieldTooLong) {
    return "One or more fields is too long. Shorten your entry and try again.";
  }
  if (
    code === CONTACT_ERROR_CODE.unavailable ||
    code === CONTACT_ERROR_CODE.emailVerificationUnavailable
  ) {
    return "Contact submission is temporarily unavailable. Please try again.";
  }
  return "We could not send your inquiry. Please try again.";
}

export async function submitContactForm(
  form: FormData,
  requestId: string,
  recaptchaToken: string,
  fetchImpl: ContactFetch = fetch,
): Promise<ContactClientResult> {
  const body = new FormData();
  for (const [key, value] of form.entries()) body.append(key, value);
  body.set("requestId", requestId);
  body.set(CONTACT_RECAPTCHA_FIELD, recaptchaToken);

  try {
    const response = await fetchImpl(CONTACT_ENDPOINT, {
      method: "POST",
      headers: { accept: "application/json" },
      body,
    });
    const payload = (await response.json().catch(() => null)) as ContactApiPayload | null;

    if (response.ok && payload?.status === "accepted") {
      const receipt = payload.data?.receipt === "sent" ? "sent" : "failed";
      return { status: "accepted", receipt };
    }

    const code =
      typeof payload?.error?.code === "string"
        ? payload.error.code
        : CONTACT_ERROR_CODE.unavailable;
    return {
      status: "error",
      code,
      retryable: payload?.error?.retryable === true,
      message: contactErrorMessage(code),
    };
  } catch {
    return {
      status: "error",
      code: CONTACT_ERROR_CODE.unavailable,
      retryable: true,
      message: contactErrorMessage(CONTACT_ERROR_CODE.unavailable),
    };
  }
}

export function meta() {
  return [
    { title: "Contact | Becoming the Man She Can Trust" },
    {
      name: "description",
      content: "Reader, media, speaking, or business inquiries for Becoming the Man She Can Trust.",
    },
  ];
}

type UiStatus = {
  kind: "idle" | "submitting" | "success" | "error";
  message: string;
  field?: ContactField;
};

export function ContactPage() {
  const captchaContainerRef = useRef<HTMLDivElement>(null);
  const captchaWidgetIdRef = useRef<number | null>(null);
  const requestIdRef = useRef<string | null>(null);
  const [recaptchaToken, setRecaptchaToken] = useState("");
  const [status, setStatus] = useState<UiStatus>({
    kind: "idle",
    message: "Complete the reCAPTCHA verification to enable submission.",
  });

  useEffect(() => {
    if (!RECAPTCHA_SITE_KEY) {
      setStatus({
        kind: "error",
        message: "Contact verification is temporarily unavailable. Please try again later.",
      });
      return;
    }

    let active = true;
    const unavailable = () => {
      if (!active) return;
      setRecaptchaToken("");
      setStatus({
        kind: "error",
        message: "Contact verification is temporarily unavailable. Please try again.",
      });
    };
    const renderCaptcha = () => {
      const api = window.grecaptcha;
      const container = captchaContainerRef.current;
      if (!active || !api || !container || captchaWidgetIdRef.current !== null) return;

      api.ready(() => {
        if (!active || !captchaContainerRef.current || captchaWidgetIdRef.current !== null) return;
        captchaWidgetIdRef.current = api.render(captchaContainerRef.current, {
          sitekey: RECAPTCHA_SITE_KEY,
          callback(token) {
            setRecaptchaToken(token);
            setStatus({ kind: "idle", message: "Verification complete. You can send your inquiry." });
          },
          "expired-callback"() {
            setRecaptchaToken("");
            setStatus({
              kind: "error",
              message: "The reCAPTCHA verification expired. Complete it again before sending.",
            });
          },
          "error-callback": unavailable,
        });
      });
    };

    let script = document.getElementById(RECAPTCHA_SCRIPT_ID) as HTMLScriptElement | null;
    const loaded = () => {
      if (script) script.dataset.recaptchaState = "loaded";
      renderCaptcha();
    };
    const failed = () => {
      if (script) script.dataset.recaptchaState = "error";
      unavailable();
    };

    if (window.grecaptcha) {
      renderCaptcha();
    } else if (script?.dataset.recaptchaState === "error") {
      unavailable();
    } else {
      if (!script) {
        script = document.createElement("script");
        script.id = RECAPTCHA_SCRIPT_ID;
        script.src = "https://www.google.com/recaptcha/api.js?render=explicit";
        script.async = true;
        script.defer = true;
      }
      script.addEventListener("load", loaded);
      script.addEventListener("error", failed);
      if (!script.isConnected) document.head.appendChild(script);
    }

    return () => {
      active = false;
      script?.removeEventListener("load", loaded);
      script?.removeEventListener("error", failed);
    };
  }, []);

  const resetCaptcha = () => {
    setRecaptchaToken("");
    if (window.grecaptcha && captchaWidgetIdRef.current !== null) {
      window.grecaptcha.reset(captchaWidgetIdRef.current);
    }
  };

  const handleChange = () => {
    requestIdRef.current = null;
    if (status.kind === "error") {
      setStatus({
        kind: "idle",
        message: recaptchaToken
          ? "Verification complete. You can send your inquiry."
          : "Complete the reCAPTCHA verification to enable submission.",
      });
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!RECAPTCHA_SITE_KEY || !recaptchaToken || status.kind === "submitting") {
      setStatus({
        kind: "error",
        message: "Complete the reCAPTCHA verification before sending your inquiry.",
      });
      return;
    }

    const form = event.currentTarget;
    const requestId = requestIdRef.current ?? crypto.randomUUID();
    requestIdRef.current = requestId;
    setStatus({ kind: "submitting", message: "Sending your inquiry…" });

    const result = await submitContactForm(
      new FormData(form),
      requestId,
      recaptchaToken,
    );
    resetCaptcha();

    if (result.status === "accepted") {
      requestIdRef.current = null;
      form.reset();
      setStatus({
        kind: "success",
        message: "Your inquiry was sent successfully.",
      });
      return;
    }

    if (!result.retryable) requestIdRef.current = null;
    setStatus({
      kind: "error",
      message: result.message,
      field: contactErrorField(result.code) ?? undefined,
    });
  };

  return (
    <div className="site-page urban-home contact-page">
      <header className="site-header urban-header">
        <a
          className="brand-mark brand-lockup"
          href="/"
          aria-label="Becoming the Man She Can Trust home"
        >
          <span>BECOMING</span>
          <span>THE MAN SHE CAN TRUST</span>
          <small>LOVE | PURPOSE | FLOURISH</small>
        </a>

        <nav className="site-nav" aria-label="Primary">
          <a href="/">HOME</a>
          <a href="/book">BOOK</a>
          <a href="/#non-negotiables">THE 24 NON-NEGOTIABLES</a>
          <a href="/#community">NEWSLETTER</a>
          <a href="/contact" aria-current="page">CONTACT</a>
        </nav>

        <details className="mobile-nav">
          <summary aria-label="Navigation menu">
            <span className="mobile-nav-icon" aria-hidden="true" />
          </summary>
          <nav aria-label="Mobile primary">
            <a href="/">Home</a>
            <a href="/book">Book</a>
            <a href="/#non-negotiables">The 24 Non-Negotiables</a>
            <a href="/#community">Newsletter</a>
            <a href="/contact" aria-current="page">Contact</a>
          </nav>
        </details>

        <a className="header-purchase-link" href="/#purchase">
          Get Your Copy <span aria-hidden="true">→</span>
        </a>
      </header>

      <main className="contact-main">
        <section className="contact-intro" aria-labelledby="contact-title">
          <p className="contact-eyebrow">LOVE | PURPOSE | FLOURISH</p>
          <h1 id="contact-title">CONTACT</h1>
          <div className="contact-rule" aria-hidden="true" />
          <p>Reader, media, speaking, or business inquiries.</p>
        </section>

        <section className="contact-form-section" aria-label="Contact inquiry">
          <div className="contact-form-card">
            <div className="contact-form-heading">
              <p className="contact-kicker">START A CONVERSATION</p>
              <h2>Send an inquiry</h2>
              <p>Choose the inquiry type and provide the details needed to understand your message.</p>
            </div>

            <form
              className="contact-form"
              method="post"
              action={CONTACT_ENDPOINT}
              onSubmit={handleSubmit}
              onChange={handleChange}
              aria-describedby="contact-status contact-privacy"
            >
              <label htmlFor="contact-inquiry-type">Inquiry type</label>
              <select
                id="contact-inquiry-type"
                name="inquiryType"
                defaultValue=""
                aria-invalid={status.field === "inquiryType" || undefined}
                aria-describedby={status.field === "inquiryType" ? "contact-status" : undefined}
                required
              >
                <option value="" disabled>Select an inquiry type</option>
                <option value="reader">Reader</option>
                <option value="media">Media</option>
                <option value="speaking">Speaking</option>
                <option value="business">Business</option>
              </select>

              <label htmlFor="contact-name">Name</label>
              <input
                id="contact-name"
                name="name"
                type="text"
                autoComplete="name"
                maxLength={CONTACT_FIELD_LIMITS.name}
                aria-invalid={status.field === "name" || undefined}
                aria-describedby={status.field === "name" ? "contact-status" : undefined}
                required
              />

              <label htmlFor="contact-email">Email</label>
              <input
                id="contact-email"
                name="email"
                type="email"
                autoComplete="email"
                maxLength={CONTACT_FIELD_LIMITS.email}
                aria-invalid={status.field === "email" || undefined}
                aria-describedby={status.field === "email" ? "contact-status" : undefined}
                required
              />

              <label htmlFor="contact-message">Message</label>
              <textarea
                id="contact-message"
                name="message"
                rows={8}
                maxLength={CONTACT_FIELD_LIMITS.message}
                aria-invalid={status.field === "message" || undefined}
                aria-describedby={status.field === "message" ? "contact-status" : undefined}
                required
              />

              <input
                type="text"
                name={CONTACT_HONEYPOT_FIELD}
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                style={{ position: "absolute", left: "-10000px" }}
              />

              <div
                ref={captchaContainerRef}
                className="contact-recaptcha"
                data-contact-recaptcha="true"
                aria-label="reCAPTCHA verification"
              />

              <p className="contact-privacy" id="contact-privacy">
                Read our <a href="/privacy">Privacy Policy</a> before submitting an inquiry.
              </p>

              <button
                className="contact-submit"
                type="submit"
                disabled={!RECAPTCHA_SITE_KEY || !recaptchaToken || status.kind === "submitting"}
                aria-describedby="contact-status"
              >
                {status.kind === "submitting" ? "Sending…" : "Send inquiry"}
              </button>

              <p
                className={`contact-availability contact-status contact-status--${status.kind}`}
                id="contact-status"
                role="status"
                aria-live="polite"
              >
                {status.message}
              </p>
            </form>
          </div>
        </section>
      </main>

      <footer className="site-footer urban-footer">
        <div className="footer-brand">
          <strong>BECOMING<br />THE MAN SHE CAN TRUST</strong>
          <span>LOVE | PURPOSE | FLOURISH</span>
          <small>© 2026 Emory Harris. All rights reserved.</small>
        </div>

        <nav aria-label="Footer">
          <a href="/">Home</a>
          <a href="/book">Book</a>
          <a href="/#non-negotiables">The 24 Non-Negotiables</a>
          <a href="/#community">Newsletter</a>
          <a href="/contact" aria-current="page">Contact</a>
        </nav>

        <nav aria-label="Legal">
          <a href="/disclaimer">Disclaimer</a>
          <a href="/privacy">Privacy</a>
          <a href="/terms">Terms</a>
          <span aria-disabled="true">Accessibility</span>
        </nav>
      </footer>
    </div>
  );
}

export default ContactPage;

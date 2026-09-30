import {
  CONTACT_DELIVERY_ERROR_CODE,
  type ContactDeliveryInput,
  type ContactDeliveryProvider,
  type ContactDeliveryResult,
} from "../email/contact-delivery";

type ServerEnvironment = Readonly<Record<string, string | undefined>>;
type DeliveryFetch = (input: URL, init: RequestInit) => Promise<Response>;

const DELIVERY_TIMEOUT_MS = 5_000;
const RESEND_API_ORIGIN = "https://api.resend.com";
const SENDER =
  "Becoming the Man She Can Trust <hello@becomingthemanshecantrust.com>";
const OPERATOR = "becomingthemansct@gmail.com";

export interface ResendContactDeliveryOptions {
  env?: ServerEnvironment;
  fetchImpl?: DeliveryFetch;
}

interface ResendEmailPayload {
  from: string;
  to: string[];
  subject: string;
  text: string;
  html: string;
  reply_to: string;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function operatorPayload(input: ContactDeliveryInput): ResendEmailPayload {
  const text = [
    "New author contact inquiry",
    "",
    `Inquiry type: ${input.inquiryType}`,
    `Name: ${input.name}`,
    `Email: ${input.email}`,
    `Email verification: ${input.verification}`,
    "",
    "Message:",
    input.message,
  ].join("\n");

  const html = `<!doctype html>
<html>
  <body style="margin:0;background:#ffffff;color:#102b49;font-family:Arial,sans-serif">
    <main style="max-width:640px;margin:0 auto;padding:32px 24px">
      <p style="margin:0 0 8px;color:#258d91;font-weight:700">LOVE | PURPOSE | FLOURISH</p>
      <h1 style="margin:0 0 24px;font-size:24px">New author contact inquiry</h1>
      <p><strong>Inquiry type:</strong> ${escapeHtml(input.inquiryType)}</p>
      <p><strong>Name:</strong> ${escapeHtml(input.name)}</p>
      <p><strong>Email:</strong> ${escapeHtml(input.email)}</p>
      <p><strong>Email verification:</strong> ${escapeHtml(input.verification)}</p>
      <hr style="border:0;border-top:1px solid #dbe4ea;margin:24px 0" />
      <p style="white-space:pre-wrap">${escapeHtml(input.message)}</p>
    </main>
  </body>
</html>`;

  return {
    from: SENDER,
    to: [OPERATOR],
    subject: `Author contact: ${input.inquiryType}`,
    text,
    html,
    reply_to: input.email,
  };
}

function receiptPayload(input: ContactDeliveryInput): ResendEmailPayload {
  const text = [
    `Hello ${input.name},`,
    "",
    "We received your message to Becoming the Man She Can Trust.",
    "Thank you for reaching out.",
  ].join("\n");

  const html = `<!doctype html>
<html>
  <body style="margin:0;background:#ffffff;color:#102b49;font-family:Arial,sans-serif">
    <main style="max-width:640px;margin:0 auto;padding:32px 24px">
      <p style="margin:0 0 8px;color:#258d91;font-weight:700">LOVE | PURPOSE | FLOURISH</p>
      <h1 style="margin:0 0 24px;font-size:24px">Message received</h1>
      <p>Hello ${escapeHtml(input.name)},</p>
      <p>We received your message to Becoming the Man She Can Trust.</p>
      <p>Thank you for reaching out.</p>
    </main>
  </body>
</html>`;

  return {
    from: SENDER,
    to: [input.email],
    subject: "We received your message",
    text,
    html,
    reply_to: OPERATOR,
  };
}

function failed(): ContactDeliveryResult {
  return {
    status: "error",
    code: CONTACT_DELIVERY_ERROR_CODE.unavailable,
  };
}

/**
 * Sends FR-105 transactional contact mail through Resend.
 *
 * The required operator notification is attempted first. The visitor receipt is
 * best effort and uses a separate stable idempotency key so its failure cannot
 * create a second logical operator notification on retry.
 */
export function createResendContactDelivery(
  options: ResendContactDeliveryOptions = {},
): ContactDeliveryProvider {
  const env = options.env ?? process.env;
  const fetchImpl = options.fetchImpl ?? ((input, init) => fetch(input, init));

  async function send(
    apiKey: string,
    payload: ResendEmailPayload,
    idempotencyKey: string,
  ): Promise<boolean> {
    const abortController = new AbortController();
    const timeout = setTimeout(() => abortController.abort(), DELIVERY_TIMEOUT_MS);

    try {
      const response = await fetchImpl(new URL("/emails", RESEND_API_ORIGIN), {
        method: "POST",
        headers: {
          authorization: `Bearer ${apiKey}`,
          "content-type": "application/json",
          "idempotency-key": idempotencyKey,
        },
        body: JSON.stringify(payload),
        signal: abortController.signal,
      });

      return response.ok;
    } catch {
      return false;
    } finally {
      clearTimeout(timeout);
    }
  }

  return {
    async deliver(input: ContactDeliveryInput): Promise<ContactDeliveryResult> {
      const apiKey = env.RESEND_API_KEY;
      if (!apiKey || !input.requestId.trim()) {
        return failed();
      }

      const operatorDelivered = await send(
        apiKey,
        operatorPayload(input),
        `contact-operator/${input.requestId}`,
      );
      if (!operatorDelivered) {
        return failed();
      }

      const receiptDelivered = await send(
        apiKey,
        receiptPayload(input),
        `contact-receipt/${input.requestId}`,
      );

      return {
        status: "delivered",
        receipt: receiptDelivered ? "sent" : "failed",
      };
    },
  };
}

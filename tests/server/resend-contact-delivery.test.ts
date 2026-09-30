import { describe, expect, it, vi } from "vitest";
import { createResendContactDelivery } from "../../server/adapters/resend-contact-delivery.server";
import {
  CONTACT_DELIVERY_ERROR_CODE,
  type ContactDeliveryInput,
} from "../../server/email/contact-delivery";

const ENV = { RESEND_API_KEY: "resend-secret-key" } as const;

const INPUT: ContactDeliveryInput = {
  requestId: "1b2c3d4e-7777-4000-8000-000000000105",
  inquiryType: "media",
  name: "Reader Example",
  email: "reader@example.com",
  message: "I would like to discuss an interview.",
  verification: "risky",
};

function accepted(id: string): Response {
  return new Response(JSON.stringify({ id }), { status: 200 });
}

function requestBody(call: unknown[]): Record<string, unknown> {
  const [, init] = call as [URL, RequestInit];
  return JSON.parse(String(init.body)) as Record<string, unknown>;
}

function requestHeader(call: unknown[], name: string): string | null {
  const [, init] = call as [URL, RequestInit];
  return new Headers(init.headers).get(name);
}

describe("Resend contact delivery", () => {
  it("sends the required operator notification with the locked sender and destination", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(accepted("operator_1"))
      .mockResolvedValueOnce(accepted("receipt_1"));

    const result = await createResendContactDelivery({ env: ENV, fetchImpl }).deliver(INPUT);

    expect(result).toEqual({ status: "delivered", receipt: "sent" });
    expect(fetchImpl).toHaveBeenCalledTimes(2);

    const [endpoint] = fetchImpl.mock.calls[0] as unknown as [URL, RequestInit];
    expect(endpoint.href).toBe("https://api.resend.com/emails");

    const body = requestBody(fetchImpl.mock.calls[0]);
    expect(body.from).toBe(
      "Becoming the Man She Can Trust <hello@becomingthemanshecantrust.com>",
    );
    expect(body.to).toEqual(["becomingthemansct@gmail.com"]);
    expect(body.reply_to).toBe("reader@example.com");
    expect(String(body.subject)).toContain("media");
    expect(String(body.text)).toContain("Reader Example");
    expect(String(body.text)).toContain("reader@example.com");
    expect(String(body.text)).toContain("I would like to discuss an interview.");
    expect(String(body.text)).toContain("risky");
    expect(requestHeader(fetchImpl.mock.calls[0], "idempotency-key")).toBe(
      "contact-operator/1b2c3d4e-7777-4000-8000-000000000105",
    );
  });

  it("sends a best-effort visitor receipt only after operator delivery succeeds", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(accepted("operator_1"))
      .mockResolvedValueOnce(accepted("receipt_1"));

    const result = await createResendContactDelivery({ env: ENV, fetchImpl }).deliver(INPUT);

    expect(result).toEqual({ status: "delivered", receipt: "sent" });

    const receipt = requestBody(fetchImpl.mock.calls[1]);
    expect(receipt.from).toBe(
      "Becoming the Man She Can Trust <hello@becomingthemanshecantrust.com>",
    );
    expect(receipt.to).toEqual(["reader@example.com"]);
    expect(receipt.reply_to).toBe("becomingthemansct@gmail.com");
    expect(String(receipt.text).toLowerCase()).toContain("received");
    expect(requestHeader(fetchImpl.mock.calls[1], "idempotency-key")).toBe(
      "contact-receipt/1b2c3d4e-7777-4000-8000-000000000105",
    );
  });

  it("keeps operator delivery successful when the visitor receipt fails", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(accepted("operator_1"))
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ message: "receipt rejected" }), { status: 422 }),
      );

    const result = await createResendContactDelivery({ env: ENV, fetchImpl }).deliver(INPUT);

    expect(result).toEqual({ status: "delivered", receipt: "failed" });
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });

  it("fails closed and does not attempt a receipt when the operator notification fails", async () => {
    const fetchImpl = vi.fn(async () =>
      new Response(JSON.stringify({ message: "operator rejected" }), { status: 422 }),
    );

    const result = await createResendContactDelivery({ env: ENV, fetchImpl }).deliver(INPUT);

    expect(result).toEqual({
      status: "error",
      code: CONTACT_DELIVERY_ERROR_CODE.unavailable,
    });
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it("fails closed without calling Resend when the server-only API key is missing", async () => {
    const fetchImpl = vi.fn(async () => accepted("unexpected"));

    const result = await createResendContactDelivery({ env: {}, fetchImpl }).deliver(INPUT);

    expect(result).toEqual({
      status: "error",
      code: CONTACT_DELIVERY_ERROR_CODE.unavailable,
    });
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("maps transport failure to a provider-neutral result without leaking secrets or diagnostics", async () => {
    const fetchImpl = vi.fn(async () => {
      throw new Error("resend-secret-key socket failure");
    });

    const result = await createResendContactDelivery({ env: ENV, fetchImpl }).deliver(INPUT);

    expect(result).toEqual({
      status: "error",
      code: CONTACT_DELIVERY_ERROR_CODE.unavailable,
    });
    expect(JSON.stringify(result)).not.toContain("resend-secret-key");
    expect(JSON.stringify(result)).not.toContain("socket");
  });
});

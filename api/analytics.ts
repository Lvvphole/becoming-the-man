import { parseBookCtaEvent } from "../contracts/book-cta";
import { captureBookCtaWithPostHog } from "../server/adapters/posthog-analytics";

const MAX_BODY_BYTES = 4096;

async function readBoundedJson(request: Request): Promise<unknown> {
  const text = await request.text();

  if (new TextEncoder().encode(text).byteLength > MAX_BODY_BYTES) {
    throw new RangeError("PAYLOAD_TOO_LARGE");
  }

  return JSON.parse(text) as unknown;
}

export default {
  async fetch(request: Request) {
    if (request.method !== "POST") {
      return new Response(null, {
        status: 405,
        headers: { Allow: "POST" },
      });
    }

    let payload: unknown;

    try {
      payload = await readBoundedJson(request);
    } catch (error) {
      if (error instanceof RangeError && error.message === "PAYLOAD_TOO_LARGE") {
        return Response.json({ error: "PAYLOAD_TOO_LARGE" }, { status: 413 });
      }

      return Response.json({ error: "INVALID_JSON" }, { status: 400 });
    }

    const event = parseBookCtaEvent(payload);
    if (!event) {
      return Response.json({ error: "INVALID_EVENT" }, { status: 400 });
    }

    try {
      await captureBookCtaWithPostHog(event);
    } catch {
      // Measurement failure is intentionally non-blocking for the visitor.
    }

    return new Response(null, { status: 204 });
  },
};

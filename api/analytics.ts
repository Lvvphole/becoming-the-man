import { parseBookCtaEvent } from "../contracts/book-cta";

const MAX_BODY_BYTES = 4096;

async function captureWithPostHog(event: ReturnType<typeof parseBookCtaEvent>) {
  if (!event) {
    return;
  }

  const host = process.env.POSTHOG_HOST;
  const apiKey = process.env.POSTHOG_PROJECT_API_KEY;

  if (!host || !apiKey) {
    return;
  }

  const endpoint = new URL("/capture/", host);

  await fetch(endpoint, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      api_key: apiKey,
      event: event.event,
      properties: {
        distinct_id: "anonymous-book-journey",
        $process_person_profile: false,
        version: event.version,
        surface: event.surface,
        destination_host: event.destination_host,
      },
      timestamp: new Date().toISOString(),
    }),
  });
}

export default {
  async fetch(request: Request) {
    if (request.method !== "POST") {
      return new Response(null, {
        status: 405,
        headers: { Allow: "POST" },
      });
    }

    const contentLength = Number(request.headers.get("content-length") ?? "0");
    if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
      return Response.json(
        { error: "PAYLOAD_TOO_LARGE" },
        { status: 413 },
      );
    }

    let payload: unknown;

    try {
      payload = await request.json();
    } catch {
      return Response.json({ error: "INVALID_JSON" }, { status: 400 });
    }

    const event = parseBookCtaEvent(payload);
    if (!event) {
      return Response.json({ error: "INVALID_EVENT" }, { status: 400 });
    }

    try {
      await captureWithPostHog(event);
    } catch {
      // Measurement failure is intentionally non-blocking for the visitor.
    }

    return new Response(null, { status: 204 });
  },
};

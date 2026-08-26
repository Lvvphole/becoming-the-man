import type { BookCtaEvent } from "../../contracts/book-cta";

export async function captureBookCtaWithPostHog(
  event: BookCtaEvent,
): Promise<void> {
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
        distinct_id: crypto.randomUUID(),
        $process_person_profile: false,
        version: event.version,
        surface: event.surface,
        destination_host: event.destination_host,
      },
      timestamp: new Date().toISOString(),
    }),
  });
}

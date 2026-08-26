import type { BookCtaEvent } from "../../contracts/book-cta";

export function emitBookCtaEvent(event: BookCtaEvent): void {
  try {
    void fetch("/api/analytics", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(event),
      keepalive: true,
      credentials: "same-origin",
    }).catch(() => undefined);
  } catch {
    // Analytics must never block the visitor's purchase navigation.
  }
}

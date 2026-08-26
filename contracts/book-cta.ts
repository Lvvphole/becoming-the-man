export const BOOK_CTA_EVENT_VERSION = 1 as const;

export const BOOK_CTA_EVENT_NAMES = {
  impression: "book_cta_impression_v1",
  click: "book_cta_click_v1",
} as const;

export type BookCtaSurface = "book";

export type BookCtaEvent = {
  event:
    | typeof BOOK_CTA_EVENT_NAMES.impression
    | typeof BOOK_CTA_EVENT_NAMES.click;
  version: typeof BOOK_CTA_EVENT_VERSION;
  surface: BookCtaSurface;
  destination_host: string;
};

const allowedKeys = new Set([
  "event",
  "version",
  "surface",
  "destination_host",
]);

export function parseBookCtaEvent(input: unknown): BookCtaEvent | null {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return null;
  }

  const record = input as Record<string, unknown>;

  if (Object.keys(record).some((key) => !allowedKeys.has(key))) {
    return null;
  }

  if (
    record.event !== BOOK_CTA_EVENT_NAMES.impression &&
    record.event !== BOOK_CTA_EVENT_NAMES.click
  ) {
    return null;
  }

  if (
    record.version !== BOOK_CTA_EVENT_VERSION ||
    record.surface !== "book" ||
    typeof record.destination_host !== "string" ||
    record.destination_host.length === 0 ||
    record.destination_host.length > 253
  ) {
    return null;
  }

  if (!/^[a-z0-9.-]+$/i.test(record.destination_host)) {
    return null;
  }

  return {
    event: record.event,
    version: BOOK_CTA_EVENT_VERSION,
    surface: "book",
    destination_host: record.destination_host.toLowerCase(),
  };
}

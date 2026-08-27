export const ANALYTICS_EVENT_VERSION = 1 as const;

export const BOOK_CTA_EVENT = {
  view: "book_cta_view",
  click: "book_cta_click",
} as const;

export type BookCtaEventName = (typeof BOOK_CTA_EVENT)[keyof typeof BOOK_CTA_EVENT];

export type BookCtaEventProperties = Readonly<{
  event_version: typeof ANALYTICS_EVENT_VERSION;
  surface: "book";
  destination_host: string;
}>;

export type BookCtaAnalyticsEvent = Readonly<{
  name: BookCtaEventName;
  properties: BookCtaEventProperties;
}>;

export function createBookCtaAnalyticsEvent(
  name: BookCtaEventName,
  destinationUrl: string,
): BookCtaAnalyticsEvent {
  const destination = new URL(destinationUrl);

  return {
    name,
    properties: {
      event_version: ANALYTICS_EVENT_VERSION,
      surface: "book",
      destination_host: destination.host,
    },
  };
}

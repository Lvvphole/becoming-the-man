export const ANALYTICS_EVENT_VERSION = 1 as const;

export const BOOK_CTA_EVENT = {
  view: "book_cta_view",
  click: "book_cta_click",
} as const;

export type BookCtaEventName = (typeof BOOK_CTA_EVENT)[keyof typeof BOOK_CTA_EVENT];
export type BookCtaSurface = "book" | "home";

export type BookCtaEventProperties = Readonly<{
  event_version: typeof ANALYTICS_EVENT_VERSION;
  surface: BookCtaSurface;
  destination_host: string;
}>;

export type BookCtaAnalyticsEvent = Readonly<{
  name: BookCtaEventName;
  properties: BookCtaEventProperties;
}>;

export const SIGNUP_EVENT = {
  start: "signup_start",
  complete: "signup_complete",
  error: "signup_error",
} as const;

export type SignupEventName = (typeof SIGNUP_EVENT)[keyof typeof SIGNUP_EVENT];

/**
 * Signup telemetry carries the outcome only. The address a visitor typed is never an event
 * property: "Never send raw email as analytics event property" (Product Specification, section 438).
 */
export type SignupEventProperties = Readonly<{
  event_version: typeof ANALYTICS_EVENT_VERSION;
  surface: "home";
  outcome?: "subscribed" | "pending_provider";
  error_code?: string;
}>;

export type SignupAnalyticsEvent = Readonly<{
  name: SignupEventName;
  properties: SignupEventProperties;
}>;

export type AnalyticsEvent = BookCtaAnalyticsEvent | SignupAnalyticsEvent;

export function createSignupAnalyticsEvent(
  name: SignupEventName,
  detail: Omit<SignupEventProperties, "event_version" | "surface"> = {},
): SignupAnalyticsEvent {
  return {
    name,
    properties: {
      event_version: ANALYTICS_EVENT_VERSION,
      surface: "home",
      ...detail,
    },
  };
}

export type SignupAcceptedStatus = "subscribed" | "pending_provider";

/**
 * Maps a non-error /api/subscribe result onto the locked audience events.
 * Architecture: signup_complete only after the defined durable-success condition.
 */
export function createSignupResultAnalyticsEvent(
  status: SignupAcceptedStatus,
): SignupAnalyticsEvent {
  if (status === "subscribed") {
    return createSignupAnalyticsEvent(SIGNUP_EVENT.complete, { outcome: "subscribed" });
  }

  return createSignupAnalyticsEvent(SIGNUP_EVENT.error, { outcome: "pending_provider" });
}

export function createBookCtaAnalyticsEvent(
  name: BookCtaEventName,
  destinationUrl: string,
  surface: BookCtaSurface = "book",
): BookCtaAnalyticsEvent {
  const destination = new URL(destinationUrl);

  return {
    name,
    properties: {
      event_version: ANALYTICS_EVENT_VERSION,
      surface,
      destination_host: destination.host,
    },
  };
}

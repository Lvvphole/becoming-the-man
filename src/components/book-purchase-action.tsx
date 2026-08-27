import { useEffect } from "react";
import {
  BOOK_CTA_EVENT,
  createBookCtaAnalyticsEvent,
  type BookCtaEventName,
  type BookCtaSurface,
} from "../../contracts/analytics";
import {
  browserAnalytics,
  type AnalyticsCaptureResult,
  type BrowserAnalytics,
} from "../lib/analytics-browser";

export function recordBookCtaEvent(
  analytics: BrowserAnalytics,
  eventName: BookCtaEventName,
  destinationUrl: string,
  surface: BookCtaSurface = "book",
): AnalyticsCaptureResult {
  try {
    return analytics.capture(createBookCtaAnalyticsEvent(eventName, destinationUrl, surface));
  } catch {
    return "failed";
  }
}

export function BookPurchaseAction({
  url,
  surface = "book",
  analytics = browserAnalytics,
}: {
  url: string;
  surface?: BookCtaSurface;
  analytics?: BrowserAnalytics;
}) {
  useEffect(() => {
    recordBookCtaEvent(analytics, BOOK_CTA_EVENT.view, url, surface);
  }, [analytics, surface, url]);

  return (
    <a
      className="primary-action"
      href={url}
      rel="external"
      onClick={() => {
        recordBookCtaEvent(analytics, BOOK_CTA_EVENT.click, url, surface);
      }}
    >
      Buy the book
    </a>
  );
}

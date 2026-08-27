import { useEffect } from "react";
import {
  BOOK_CTA_EVENT,
  createBookCtaAnalyticsEvent,
  type BookCtaEventName,
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
): AnalyticsCaptureResult {
  try {
    return analytics.capture(createBookCtaAnalyticsEvent(eventName, destinationUrl));
  } catch {
    return "failed";
  }
}

export function BookPurchaseAction({
  url,
  analytics = browserAnalytics,
}: {
  url: string;
  analytics?: BrowserAnalytics;
}) {
  useEffect(() => {
    recordBookCtaEvent(analytics, BOOK_CTA_EVENT.view, url);
  }, [analytics, url]);

  return (
    <a
      className="primary-action"
      href={url}
      rel="external"
      onClick={() => {
        recordBookCtaEvent(analytics, BOOK_CTA_EVENT.click, url);
      }}
    >
      Buy the book
    </a>
  );
}

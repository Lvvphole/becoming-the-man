import { describe, expect, it, vi } from "vitest";
import {
  ANALYTICS_EVENT_VERSION,
  BOOK_CTA_EVENT,
  createBookCtaAnalyticsEvent,
} from "../../contracts/analytics";
import { recordBookCtaEvent } from "../../src/components/book-purchase-action";
import {
  createBrowserAnalytics,
  type BrowserAnalytics,
} from "../../src/lib/analytics-browser";

describe("book CTA analytics contract", () => {
  it("uses stable versioned event names and only approved non-sensitive properties", () => {
    const viewEvent = createBookCtaAnalyticsEvent(
      BOOK_CTA_EVENT.view,
      "https://example.test/books/becoming-the-man",
    );
    const clickEvent = createBookCtaAnalyticsEvent(
      BOOK_CTA_EVENT.click,
      "https://example.test/books/becoming-the-man",
    );

    expect(viewEvent).toEqual({
      name: "book_cta_view",
      properties: {
        event_version: ANALYTICS_EVENT_VERSION,
        surface: "book",
        destination_host: "example.test",
      },
    });
    expect(clickEvent.name).toBe("book_cta_click");
    expect(Object.keys(clickEvent.properties).sort()).toEqual([
      "destination_host",
      "event_version",
      "surface",
    ]);
  });

  it("queues a privacy-minimized PostHog capture without waiting for a provider response", () => {
    const fetchImpl = vi.fn(async () => new Response(null, { status: 200 }));
    const analytics = createBrowserAnalytics({
      projectKey: "phc_test",
      host: "https://us.i.posthog.com",
      fetchImpl,
      distinctIdFactory: () => "00000000-0000-4000-8000-000000000001",
    });
    const event = createBookCtaAnalyticsEvent(
      BOOK_CTA_EVENT.click,
      "https://example.test/book",
    );

    expect(analytics.capture(event)).toBe("queued");
    expect(fetchImpl).toHaveBeenCalledOnce();

    const call = fetchImpl.mock.calls[0];
    const endpoint = call?.[0];
    const init = call?.[1];
    expect(endpoint?.toString()).toBe("https://us.i.posthog.com/capture/");
    expect(init?.method).toBe("POST");
    expect(init?.keepalive).toBe(true);

    if (typeof init?.body !== "string") {
      throw new Error("Expected analytics request body to be serialized JSON.");
    }

    expect(JSON.parse(init.body)).toEqual({
      api_key: "phc_test",
      event: "book_cta_click",
      distinct_id: "00000000-0000-4000-8000-000000000001",
      properties: {
        event_version: 1,
        surface: "book",
        destination_host: "example.test",
        $process_person_profile: false,
      },
    });
  });

  it("disables capture when provider configuration is missing or invalid", () => {
    const fetchImpl = vi.fn(async () => new Response(null, { status: 200 }));
    const event = createBookCtaAnalyticsEvent(BOOK_CTA_EVENT.view, "https://example.test/book");

    expect(createBrowserAnalytics({ fetchImpl }).capture(event)).toBe("disabled");
    expect(
      createBrowserAnalytics({
        projectKey: "phc_test",
        host: "javascript:alert(1)",
        fetchImpl,
      }).capture(event),
    ).toBe("disabled");
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("keeps provider rejection and synchronous analytics failure out of the buy path", async () => {
    const rejectedFetch = vi.fn(() => Promise.reject(new Error("analytics offline")));
    const analytics = createBrowserAnalytics({
      projectKey: "phc_test",
      host: "https://us.i.posthog.com",
      fetchImpl: rejectedFetch,
      distinctIdFactory: () => "00000000-0000-4000-8000-000000000002",
    });
    const event = createBookCtaAnalyticsEvent(BOOK_CTA_EVENT.click, "https://example.test/book");

    expect(analytics.capture(event)).toBe("queued");
    await Promise.resolve();

    const throwingAnalytics: BrowserAnalytics = {
      capture() {
        throw new Error("analytics unavailable");
      },
    };

    expect(
      recordBookCtaEvent(throwingAnalytics, BOOK_CTA_EVENT.click, "https://example.test/book"),
    ).toBe("failed");
  });
});

import { afterEach, describe, expect, it, vi } from "vitest";

import analytics from "../../api/analytics";

afterEach(() => {
  vi.unstubAllGlobals();
  delete process.env.POSTHOG_HOST;
  delete process.env.POSTHOG_PROJECT_API_KEY;
});

describe("analytics function", () => {
  it("accepts a valid event without requiring PostHog configuration", async () => {
    const request = new Request("https://example.test/api/analytics", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        event: "book_cta_click_v1",
        version: 1,
        surface: "book",
        destination_host: "example.com",
      }),
    });

    const response = await analytics.fetch(request);
    expect(response.status).toBe(204);
  });

  it("rejects oversized bodies even without a content-length contract", async () => {
    const request = new Request("https://example.test/api/analytics", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ payload: "x".repeat(5000) }),
    });

    const response = await analytics.fetch(request);
    expect(response.status).toBe(413);
    await expect(response.json()).resolves.toEqual({ error: "PAYLOAD_TOO_LARGE" });
  });

  it("contains PostHog failure and still returns success", async () => {
    process.env.POSTHOG_HOST = "https://posthog.example.test";
    process.env.POSTHOG_PROJECT_API_KEY = "test-key";
    vi.stubGlobal("fetch", vi.fn(async () => {
      throw new Error("provider unavailable");
    }));

    const request = new Request("https://example.test/api/analytics", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        event: "book_cta_click_v1",
        version: 1,
        surface: "book",
        destination_host: "example.com",
      }),
    });

    const response = await analytics.fetch(request);
    expect(response.status).toBe(204);
  });
});

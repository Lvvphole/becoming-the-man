import { describe, expect, it } from "vitest";
import {
  SIGNUP_EVENT,
  createSignupAnalyticsEvent,
} from "../../contracts/analytics";

const SENSITIVE = "reader@example.com";

describe("signup analytics privacy contract", () => {
  it("emits the three governed signup events", () => {
    expect(Object.values(SIGNUP_EVENT)).toEqual([
      "signup_start",
      "signup_complete",
      "signup_error",
    ]);
  });

  it("carries the outcome without any address", () => {
    const event = createSignupAnalyticsEvent(SIGNUP_EVENT.complete, { outcome: "subscribed" });

    expect(event.properties).toEqual({
      event_version: 1,
      surface: "home",
      outcome: "subscribed",
    });
    // "Never send raw email as analytics event property" (Product Specification, section 438).
    expect(JSON.stringify(event)).not.toContain(SENSITIVE);
    expect(JSON.stringify(event)).not.toContain("@");
  });

  it("carries a stable error code rather than the submitted values", () => {
    const event = createSignupAnalyticsEvent(SIGNUP_EVENT.error, { error_code: "email_invalid" });

    expect(event.properties.error_code).toBe("email_invalid");
    expect(JSON.stringify(event)).not.toContain("@");
  });
});

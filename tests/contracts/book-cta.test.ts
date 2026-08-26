import { describe, expect, it } from "vitest";

import {
  BOOK_CTA_EVENT_NAMES,
  BOOK_CTA_EVENT_VERSION,
  parseBookCtaEvent,
} from "../../contracts/book-cta";

describe("book CTA event contract", () => {
  it("accepts the stable non-sensitive click payload", () => {
    expect(
      parseBookCtaEvent({
        event: BOOK_CTA_EVENT_NAMES.click,
        version: BOOK_CTA_EVENT_VERSION,
        surface: "book",
        destination_host: "example.com",
      }),
    ).toEqual({
      event: BOOK_CTA_EVENT_NAMES.click,
      version: 1,
      surface: "book",
      destination_host: "example.com",
    });
  });

  it("rejects extra sensitive or free-text properties", () => {
    expect(
      parseBookCtaEvent({
        event: BOOK_CTA_EVENT_NAMES.click,
        version: 1,
        surface: "book",
        destination_host: "example.com",
        email: "reader@example.com",
      }),
    ).toBeNull();

    expect(
      parseBookCtaEvent({
        event: BOOK_CTA_EVENT_NAMES.click,
        version: 1,
        surface: "book",
        destination_host: "example.com",
        message: "private relationship text",
      }),
    ).toBeNull();
  });
});

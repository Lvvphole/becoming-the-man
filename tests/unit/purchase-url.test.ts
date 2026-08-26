import { describe, expect, it } from "vitest";

import { parsePurchaseDestination } from "../../server/domain/purchase-url";

describe("parsePurchaseDestination", () => {
  it("accepts an http(s) destination and normalizes host", () => {
    expect(parsePurchaseDestination("https://Books.Example.com/buy")).toEqual({
      href: "https://books.example.com/buy",
      host: "books.example.com",
    });
  });

  it.each([
    null,
    "",
    "javascript:alert(1)",
    "mailto:reader@example.com",
    "https://user:pass@example.com/book",
    "not a url",
  ])("rejects unsafe or invalid destination %p", (value) => {
    expect(parsePurchaseDestination(value)).toBeNull();
  });
});

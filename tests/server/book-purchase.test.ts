import { describe, expect, it } from "vitest";
import {
  BOOK_PURCHASE_SETTING_KEY,
  getBookPurchaseDestination,
  parseBookPurchaseUrl,
  type SiteSettingsRepository,
} from "../../server/domain/book-purchase";

function repositoryReturning(value: unknown | null): SiteSettingsRepository {
  return {
    async read(settingKey) {
      expect(settingKey).toBe(BOOK_PURCHASE_SETTING_KEY);
      return { ok: true, value };
    },
  };
}

describe("book purchase destination", () => {
  it("accepts an http or https destination without credentials", () => {
    expect(parseBookPurchaseUrl("https://example.test/books/becoming-the-man")).toBe(
      "https://example.test/books/becoming-the-man",
    );
    expect(parseBookPurchaseUrl("http://example.test/book")).toBe("http://example.test/book");
  });

  it("rejects malformed, non-http, and credential-bearing destinations", () => {
    expect(parseBookPurchaseUrl("not a url")).toBeNull();
    expect(parseBookPurchaseUrl("ftp://example.test/book")).toBeNull();
    expect(parseBookPurchaseUrl("https://user:secret@example.test/book")).toBeNull();
    expect(parseBookPurchaseUrl({ url: "https://example.test/book" })).toBeNull();
  });

  it("returns an available destination for a valid configured value", async () => {
    await expect(
      getBookPurchaseDestination(repositoryReturning("https://example.test/book")),
    ).resolves.toEqual({ status: "available", url: "https://example.test/book" });
  });

  it("keeps missing and invalid values unavailable", async () => {
    await expect(getBookPurchaseDestination(repositoryReturning(null))).resolves.toEqual({
      status: "unavailable",
      reason: "missing",
    });
    await expect(getBookPurchaseDestination(repositoryReturning("javascript:alert(1)"))).resolves.toEqual(
      { status: "unavailable", reason: "invalid" },
    );
  });

  it("preserves repository failure states without inventing a destination", async () => {
    const repository: SiteSettingsRepository = {
      async read() {
        return { ok: false, code: "provider_unavailable" };
      },
    };

    await expect(getBookPurchaseDestination(repository)).resolves.toEqual({
      status: "unavailable",
      reason: "provider_unavailable",
    });
  });
});

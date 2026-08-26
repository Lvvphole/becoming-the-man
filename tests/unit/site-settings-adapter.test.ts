import { afterEach, describe, expect, it, vi } from "vitest";

import { SupabaseSiteSettingsRepository } from "../../server/adapters/supabase-site-settings";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("SupabaseSiteSettingsRepository", () => {
  it("uses the narrow public settings projection", async () => {
    const fetchMock = vi.fn(async (input: URL | RequestInfo) => {
      const url = String(input);
      expect(url).toContain("key=eq.book_purchase_url");
      expect(url).toContain("is_public=eq.true");
      return new Response(JSON.stringify([{ value_text: "https://example.com/book" }]), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    });

    vi.stubGlobal("fetch", fetchMock);

    const repository = new SupabaseSiteSettingsRepository(
      "https://project.supabase.co",
      "anon-test-key",
    );

    await expect(repository.getPublicSetting("book_purchase_url")).resolves.toBe(
      "https://example.com/book",
    );
  });

  it("returns null on provider failure", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(null, { status: 503 })),
    );

    const repository = new SupabaseSiteSettingsRepository(
      "https://project.supabase.co",
      "anon-test-key",
    );

    await expect(repository.getPublicSetting("book_purchase_url")).resolves.toBeNull();
  });
});

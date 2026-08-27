import { describe, expect, it, vi } from "vitest";
import { createSupabaseSiteSettingsRepository } from "../../server/adapters/supabase-site-settings.server";

describe("Supabase site settings adapter", () => {
  it("reads only the requested setting through the server-side REST boundary", async () => {
    const fetchImpl = vi.fn(async (input: URL, init: RequestInit) => {
      expect(input.origin).toBe("https://project.supabase.co");
      expect(input.pathname).toBe("/rest/v1/site_settings");
      expect(input.searchParams.get("setting_key")).toBe("eq.book_purchase_url");
      expect(input.searchParams.get("select")).toBe("setting_value");
      expect(input.searchParams.get("limit")).toBe("1");
      expect(init.headers).toEqual({
        apikey: "test-publishable-key",
        authorization: "Bearer test-publishable-key",
      });

      return new Response(JSON.stringify([{ setting_value: "https://example.test/book" }]), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    });

    const repository = createSupabaseSiteSettingsRepository({
      env: {
        SUPABASE_URL: "https://project.supabase.co",
        SUPABASE_PUBLISHABLE_KEY: "test-publishable-key",
      },
      fetchImpl,
    });

    await expect(repository.read("book_purchase_url")).resolves.toEqual({
      ok: true,
      value: "https://example.test/book",
    });
    expect(fetchImpl).toHaveBeenCalledOnce();
  });

  it("returns missing when the approved setting has no row", async () => {
    const repository = createSupabaseSiteSettingsRepository({
      env: {
        SUPABASE_URL: "https://project.supabase.co",
        SUPABASE_PUBLISHABLE_KEY: "test-publishable-key",
      },
      fetchImpl: async () =>
        new Response(JSON.stringify([]), {
          status: 200,
          headers: { "content-type": "application/json" },
        }),
    });

    await expect(repository.read("book_purchase_url")).resolves.toEqual({ ok: true, value: null });
  });

  it("fails closed when provider configuration is absent", async () => {
    const fetchImpl = vi.fn(async () => new Response("[]", { status: 200 }));
    const repository = createSupabaseSiteSettingsRepository({ env: {}, fetchImpl });

    await expect(repository.read("book_purchase_url")).resolves.toEqual({
      ok: false,
      code: "configuration_unavailable",
    });
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("rejects an unexpected provider response shape", async () => {
    const repository = createSupabaseSiteSettingsRepository({
      env: {
        SUPABASE_URL: "https://project.supabase.co",
        SUPABASE_PUBLISHABLE_KEY: "test-publishable-key",
      },
      fetchImpl: async () =>
        new Response(JSON.stringify({ setting_value: "https://example.test/book" }), {
          status: 200,
          headers: { "content-type": "application/json" },
        }),
    });

    await expect(repository.read("book_purchase_url")).resolves.toEqual({
      ok: false,
      code: "invalid_response",
    });
  });

  it("reports provider failure without exposing a destination", async () => {
    const repository = createSupabaseSiteSettingsRepository({
      env: {
        SUPABASE_URL: "https://project.supabase.co",
        SUPABASE_PUBLISHABLE_KEY: "test-publishable-key",
      },
      fetchImpl: async () => new Response("provider error", { status: 503 }),
    });

    await expect(repository.read("book_purchase_url")).resolves.toEqual({
      ok: false,
      code: "provider_unavailable",
    });
  });

  it("bounds a stalled provider read and maps the abort to provider_unavailable", async () => {
    vi.useFakeTimers();

    try {
      const fetchImpl = vi.fn(async (_input: URL, init: RequestInit) => {
        return new Promise<Response>((_resolve, reject) => {
          init.signal?.addEventListener(
            "abort",
            () => reject(new DOMException("The operation was aborted", "AbortError")),
            { once: true },
          );
        });
      });
      const repository = createSupabaseSiteSettingsRepository({
        env: {
          SUPABASE_URL: "https://project.supabase.co",
          SUPABASE_PUBLISHABLE_KEY: "test-publishable-key",
        },
        fetchImpl,
      });

      const read = repository.read("book_purchase_url");
      const guardedRead = Promise.race([
        read,
        new Promise<"test-timeout">((resolve) => {
          setTimeout(() => resolve("test-timeout"), 10_000);
        }),
      ]);

      await vi.advanceTimersByTimeAsync(10_000);

      await expect(guardedRead).resolves.toEqual({
        ok: false,
        code: "provider_unavailable",
      });
      const signal = fetchImpl.mock.calls[0]?.[1].signal;
      expect(signal).toBeDefined();
      expect(signal?.aborted).toBe(true);
    } finally {
      vi.useRealTimers();
    }
  });
});

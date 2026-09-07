import { describe, expect, it, vi } from "vitest";
import { createSupabaseLegalPagesRepository } from "../../server/adapters/supabase-legal-pages.server";

const validRow = {
  slug: "disclaimer",
  title: "Disclaimer",
  body_jsonb: ["First block", "Second block"],
};

describe("Supabase legal pages adapter", () => {
  it("reads a published legal page through the server-side REST boundary", async () => {
    const fetchImpl = vi.fn(async (input: URL, init: RequestInit) => {
      expect(input.origin).toBe("https://project.supabase.co");
      expect(input.pathname).toBe("/rest/v1/legal_pages");
      expect(input.searchParams.get("slug")).toBe("eq.disclaimer");
      expect(input.searchParams.get("is_published")).toBe("eq.true");
      expect(input.searchParams.get("select")).toBe("slug,title,body_jsonb");
      expect(input.searchParams.get("limit")).toBe("1");
      expect(init.headers).toEqual({
        apikey: "test-publishable-key",
        authorization: "Bearer test-publishable-key",
      });

      return new Response(JSON.stringify([validRow]), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    });

    const repository = createSupabaseLegalPagesRepository({
      env: {
        SUPABASE_URL: "https://project.supabase.co",
        SUPABASE_PUBLISHABLE_KEY: "test-publishable-key",
      },
      fetchImpl,
    });

    await expect(repository.read("disclaimer")).resolves.toEqual({
      status: "available",
      page: {
        slug: "disclaimer",
        title: "Disclaimer",
        body: ["First block", "Second block"],
      },
    });
    expect(fetchImpl).toHaveBeenCalledOnce();
  });

  it("fails closed when provider configuration is absent", async () => {
    const fetchImpl = vi.fn(async () => new Response("[]", { status: 200 }));
    const repository = createSupabaseLegalPagesRepository({ env: {}, fetchImpl });

    await expect(repository.read("disclaimer")).resolves.toEqual({
      status: "unavailable",
      reason: "configuration",
    });
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("reports a missing published page without manufacturing content", async () => {
    const repository = createSupabaseLegalPagesRepository({
      env: {
        SUPABASE_URL: "https://project.supabase.co",
        SUPABASE_PUBLISHABLE_KEY: "test-publishable-key",
      },
      fetchImpl: async () => new Response("[]", { status: 200 }),
    });

    await expect(repository.read("disclaimer")).resolves.toEqual({
      status: "unavailable",
      reason: "missing",
    });
  });

  it("rejects malformed legal-page body data", async () => {
    const repository = createSupabaseLegalPagesRepository({
      env: {
        SUPABASE_URL: "https://project.supabase.co",
        SUPABASE_PUBLISHABLE_KEY: "test-publishable-key",
      },
      fetchImpl: async () =>
        new Response(JSON.stringify([{ ...validRow, body_jsonb: ["valid", 7] }]), {
          status: 200,
          headers: { "content-type": "application/json" },
        }),
    });

    await expect(repository.read("disclaimer")).resolves.toEqual({
      status: "unavailable",
      reason: "invalid_response",
    });
  });
});

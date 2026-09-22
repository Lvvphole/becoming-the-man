import { describe, expect, it, vi } from "vitest";
import { createSupabaseLegalPagesRepository } from "../../server/adapters/supabase-legal-pages.server";

const env = {
  SUPABASE_URL: "https://project.supabase.co",
  SUPABASE_PUBLISHABLE_KEY: "test-publishable-key",
};

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
    const diagnosticLogger = vi.fn();
    const repository = createSupabaseLegalPagesRepository({
      env,
      fetchImpl,
      diagnosticLogger,
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
    expect(diagnosticLogger).not.toHaveBeenCalled();
  });

  it("fails closed when provider configuration is absent", async () => {
    const fetchImpl = vi.fn(async () => new Response("[]", { status: 200 }));
    const diagnosticLogger = vi.fn();
    const repository = createSupabaseLegalPagesRepository({
      env: {},
      fetchImpl,
      diagnosticLogger,
    });

    await expect(repository.read("disclaimer")).resolves.toEqual({
      status: "unavailable",
      reason: "configuration",
    });
    expect(fetchImpl).not.toHaveBeenCalled();
    expect(diagnosticLogger).not.toHaveBeenCalled();
  });

  it("reports a missing published page without manufacturing content", async () => {
    const diagnosticLogger = vi.fn();
    const repository = createSupabaseLegalPagesRepository({
      env,
      fetchImpl: async () => new Response("[]", { status: 200 }),
      diagnosticLogger,
    });

    await expect(repository.read("disclaimer")).resolves.toEqual({
      status: "unavailable",
      reason: "missing",
    });
    expect(diagnosticLogger).not.toHaveBeenCalled();
  });

  it("rejects malformed legal-page body data and reports only safe diagnostics", async () => {
    const diagnosticLogger = vi.fn();
    const repository = createSupabaseLegalPagesRepository({
      env,
      fetchImpl: async () =>
        new Response(JSON.stringify([{ ...validRow, body_jsonb: ["valid", 7] }]), {
          status: 200,
          headers: { "content-type": "application/json" },
        }),
      diagnosticLogger,
    });

    await expect(repository.read("disclaimer")).resolves.toEqual({
      status: "unavailable",
      reason: "invalid_response",
    });
    expect(diagnosticLogger).toHaveBeenCalledWith(
      expect.objectContaining({
        event: "legal_page_provider_failure",
        slug: "disclaimer",
        failureClass: "invalid_response",
        aborted: false,
        attempt: 1,
        timeoutMs: 2_000,
      }),
    );
    const serialized = JSON.stringify(diagnosticLogger.mock.calls[0]?.[0]);
    expect(serialized).not.toContain(env.SUPABASE_PUBLISHABLE_KEY);
    expect(serialized).not.toContain("First block");
    expect(serialized).not.toContain("authorization");
  });

  it("reports a provider status without exposing the response body or credentials", async () => {
    const diagnosticLogger = vi.fn();
    const repository = createSupabaseLegalPagesRepository({
      env,
      fetchImpl: async () => new Response("sensitive provider body", { status: 503 }),
      diagnosticLogger,
    });

    await expect(repository.read("disclaimer")).resolves.toEqual({
      status: "unavailable",
      reason: "provider",
    });
    expect(diagnosticLogger).toHaveBeenCalledOnce();
    expect(diagnosticLogger).toHaveBeenCalledWith(
      expect.objectContaining({
        event: "legal_page_provider_failure",
        slug: "disclaimer",
        failureClass: "provider_status",
        providerStatus: 503,
        aborted: false,
        attempt: 1,
        timeoutMs: 2_000,
        elapsedMs: expect.any(Number),
      }),
    );
    const serialized = JSON.stringify(diagnosticLogger.mock.calls[0]?.[0]);
    expect(serialized).not.toContain(env.SUPABASE_PUBLISHABLE_KEY);
    expect(serialized).not.toContain("sensitive provider body");
    expect(serialized).not.toContain("Bearer");
  });

  it("keeps diagnostic logger failures from changing fail-closed provider semantics", async () => {
    const diagnosticLogger = vi.fn(() => {
      throw new Error("diagnostic sink unavailable");
    });
    const repository = createSupabaseLegalPagesRepository({
      env,
      fetchImpl: async () => new Response("provider error", { status: 503 }),
      diagnosticLogger,
    });

    await expect(repository.read("disclaimer")).resolves.toEqual({
      status: "unavailable",
      reason: "provider",
    });
    expect(diagnosticLogger).toHaveBeenCalledOnce();
  });

  it("distinguishes a transport exception from an HTTP provider response", async () => {
    const diagnosticLogger = vi.fn();
    const repository = createSupabaseLegalPagesRepository({
      env,
      fetchImpl: async () => {
        throw new Error("socket reset");
      },
      diagnosticLogger,
    });

    await expect(repository.read("disclaimer")).resolves.toEqual({
      status: "unavailable",
      reason: "provider",
    });
    expect(diagnosticLogger).toHaveBeenCalledWith(
      expect.objectContaining({
        event: "legal_page_provider_failure",
        slug: "disclaimer",
        failureClass: "transport",
        aborted: false,
        attempt: 1,
        timeoutMs: 2_000,
      }),
    );
  });

  it("distinguishes the bounded provider timeout from other failures", async () => {
    vi.useFakeTimers();

    try {
      const diagnosticLogger = vi.fn();
      const fetchImpl = vi.fn(async (_input: URL, init: RequestInit) => {
        return new Promise<Response>((_resolve, reject) => {
          init.signal?.addEventListener(
            "abort",
            () => reject(new DOMException("The operation was aborted", "AbortError")),
            { once: true },
          );
        });
      });
      const repository = createSupabaseLegalPagesRepository({
        env,
        fetchImpl,
        diagnosticLogger,
      });

      const read = repository.read("disclaimer");
      await vi.advanceTimersByTimeAsync(2_000);

      await expect(read).resolves.toEqual({
        status: "unavailable",
        reason: "provider",
      });
      expect(fetchImpl).toHaveBeenCalledOnce();
      expect(diagnosticLogger).toHaveBeenCalledWith(
        expect.objectContaining({
          event: "legal_page_provider_failure",
          slug: "disclaimer",
          failureClass: "timeout",
          aborted: true,
          attempt: 1,
          timeoutMs: 2_000,
          elapsedMs: 2_000,
        }),
      );
    } finally {
      vi.useRealTimers();
    }
  });
});

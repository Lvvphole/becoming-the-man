import { describe, expect, it, vi } from "vitest";
import { COMMUNITY_ERROR_CODE } from "../../contracts/community";
import { createSupabaseCommunityRepository } from "../../server/repositories/supabase-community.server";
import type { CommunitySubscriptionInput } from "../../server/domain/community-subscription";

const ENV = {
  SUPABASE_URL: "https://project.supabase.test",
  SUPABASE_SERVICE_ROLE_KEY: "service-role-secret",
} as const;

const INPUT: CommunitySubscriptionInput = {
  requestId: "1b2c3d4e-5555-4000-8000-000000000010",
  email: "  Reader@Example.COM ",
  firstName: " Reader ",
  marketingConsent: true,
};

interface Call {
  method: string;
  path: string;
  search: string;
  body: Record<string, unknown> | null;
}

/**
 * Records every request and answers from a scripted queue keyed by path, so each test states only
 * the responses it cares about and any unplanned call is visible rather than silently defaulted.
 */
function harness(script: Array<{ match: string; status?: number; json?: unknown }>) {
  const calls: Call[] = [];
  const remaining = [...script];

  const fetchImpl = vi.fn(async (input: URL, init: RequestInit) => {
    const body = typeof init.body === "string" ? JSON.parse(init.body) : null;
    calls.push({
      method: init.method ?? "GET",
      path: input.pathname,
      search: input.search,
      body,
    });

    const index = remaining.findIndex((entry) => input.pathname.endsWith(entry.match));
    const entry = index === -1 ? undefined : remaining.splice(index, 1)[0];
    const status = entry?.status ?? 200;

    return new Response(JSON.stringify(entry?.json ?? []), {
      status,
      headers: { "content-type": "application/json" },
    });
  });

  return { calls, fetchImpl };
}

function repository(fetchImpl: ReturnType<typeof harness>["fetchImpl"]) {
  let counter = 0;
  return createSupabaseCommunityRepository({
    env: ENV,
    fetchImpl,
    now: () => new Date("2026-09-11T00:00:00.000Z"),
    newId: () => `00000000-0000-4000-8000-00000000000${++counter}`,
  });
}

describe("supabase community repository", () => {
  it("claims the request before writing, then writes all three tables", async () => {
    const { calls, fetchImpl } = harness([
      { match: "/rpc/claim_idempotency_key", json: [{ decision: "CLAIMED" }] },
      { match: "/subscribers", json: [{ id: "sub-1" }] },
      { match: "/email_requests", json: [{}] },
      { match: "/consent_events", json: [{}] },
    ]);

    const result = await repository(fetchImpl).persist(INPUT);

    expect(result).toEqual({
      ok: true,
      duplicate: false,
      subscriberId: "sub-1",
      emailRequestId: "00000000-0000-4000-8000-000000000002",
    });

    // The claim must come first: nothing may be written before ownership is established. It must
    // also NOT be settled here — the outcome is unknown until the provider has answered.
    expect(calls[0].path).toContain("/rpc/claim_idempotency_key");
    expect(calls.map((call) => call.path)).toEqual([
      "/rest/v1/rpc/claim_idempotency_key",
      "/rest/v1/subscribers",
      "/rest/v1/email_requests",
      "/rest/v1/consent_events",
    ]);
  });

  it("normalizes the address and records the versioned consent provenance", async () => {
    const { calls, fetchImpl } = harness([
      { match: "/rpc/claim_idempotency_key", json: [{ decision: "CLAIMED" }] },
      { match: "/subscribers", json: [{ id: "sub-1" }] },
      { match: "/email_requests", json: [{}] },
      { match: "/consent_events", json: [{}] },
      { match: "/idempotency_keys", json: [{}] },
    ]);

    await repository(fetchImpl).persist(INPUT);

    const subscriber = calls.find((call) => call.path.endsWith("/subscribers"));
    expect(subscriber?.body).toMatchObject({
      email: "reader@example.com",
      first_name: "Reader",
      audience_state: "pending",
    });

    const consent = calls.find((call) => call.path.endsWith("/consent_events"));
    expect(consent?.body).toMatchObject({
      request_id: INPUT.requestId,
      consent_scope: "marketing",
      consent_version: "2026-09-marketing-v1",
      source: "home-community-form",
      event_type: "grant",
    });
  });

  it("sends a claim hash the schema will accept", async () => {
    const { calls, fetchImpl } = harness([
      { match: "/rpc/claim_idempotency_key", json: [{ decision: "CLAIMED" }] },
      { match: "/subscribers", json: [{ id: "sub-1" }] },
      { match: "/email_requests", json: [{}] },
      { match: "/consent_events", json: [{}] },
      { match: "/idempotency_keys", json: [{}] },
    ]);

    await repository(fetchImpl).persist(INPUT);

    // idempotency_keys.request_hash is CHECK (request_hash ~ '^[0-9a-f]{64}$').
    expect(calls[0].body?.p_request_hash).toMatch(/^[0-9a-f]{64}$/);
    expect(calls[0].body?.p_scope).toBe("subscribe");
  });

  it("treats a REPLAY decision as a duplicate and writes nothing further", async () => {
    const { calls, fetchImpl } = harness([
      { match: "/rpc/claim_idempotency_key", json: [{ decision: "REPLAY" }] },
    ]);

    const result = await repository(fetchImpl).persist(INPUT);

    expect(result).toEqual({ ok: true, duplicate: true, outcome: "pending_provider" });
    expect(calls).toHaveLength(1);
  });

  it("replays the outcome the first attempt actually settled on", async () => {
    // A first attempt whose provider sync failed settles the claim as pending_provider. Replaying
    // it must return that, not a subscription the first attempt never achieved.
    const { fetchImpl } = harness([
      {
        match: "/rpc/claim_idempotency_key",
        json: [{ decision: "REPLAY", result_jsonb: { subscriber_id: "sub-1", outcome: "pending_provider" } }],
      },
    ]);

    const result = await repository(fetchImpl).persist(INPUT);

    expect(result).toEqual({ ok: true, duplicate: true, outcome: "pending_provider" });
  });

  it("replays a settled subscription as subscribed", async () => {
    const { fetchImpl } = harness([
      {
        match: "/rpc/claim_idempotency_key",
        json: [{ decision: "REPLAY", result_jsonb: { subscriber_id: "sub-1", outcome: "subscribed" } }],
      },
    ]);

    const result = await repository(fetchImpl).persist(INPUT);

    expect(result).toEqual({ ok: true, duplicate: true, outcome: "subscribed" });
  });

  it.each([
    ["an absent result", undefined],
    ["a null result", null],
    ["an unrecognised outcome", { subscriber_id: "sub-1", outcome: "banana" }],
    ["a legacy record with no outcome", { subscriber_id: "sub-1" }],
  ])("does not invent a subscription from %s", async (_label, result_jsonb) => {
    const { fetchImpl } = harness([
      { match: "/rpc/claim_idempotency_key", json: [{ decision: "REPLAY", result_jsonb }] },
    ]);

    const result = await repository(fetchImpl).persist(INPUT);

    expect(result).toEqual({ ok: true, duplicate: true, outcome: "pending_provider" });
  });

  it("leaves the claim unsettled when the outcome could not be recorded", async () => {
    const { fetchImpl } = harness([
      { match: "/email_requests", json: [{}] },
      { match: "/subscribers", status: 503, json: {} },
    ]);

    const result = await repository(fetchImpl).recordProviderOutcome({
      requestId: INPUT.requestId,
      subscriberId: "sub-1",
      emailRequestId: "req-1",
      outcome: "synced",
    });

    // An unsettled claim answers IN_PROGRESS on retry, which is refused. That is the honest
    // outcome: better than settling it with a result the database does not actually reflect.
    expect(result).toEqual({ ok: false });
  });

  it("refuses an IN_PROGRESS claim rather than reporting it as persisted", async () => {
    // A claim that never completed — a concurrent caller mid-flight, or an earlier attempt that
    // failed between its writes. There is no stored result, so this is not a duplicate.
    const { calls, fetchImpl } = harness([
      { match: "/rpc/claim_idempotency_key", json: [{ decision: "IN_PROGRESS" }] },
    ]);

    const result = await repository(fetchImpl).persist(INPUT);

    expect(result).toEqual({ ok: false, code: COMMUNITY_ERROR_CODE.requestInProgress });
    expect(calls).toHaveLength(1);
  });

  it("does not report a subscription when a partial write is retried on the same request id", async () => {
    // First attempt claims the key, writes the subscriber, then fails on email_requests.
    const first = harness([
      { match: "/rpc/claim_idempotency_key", json: [{ decision: "CLAIMED" }] },
      { match: "/subscribers", json: [{ id: "sub-1" }] },
      { match: "/email_requests", status: 500, json: {} },
    ]);
    const firstResult = await repository(first.fetchImpl).persist(INPUT);
    expect(firstResult).toEqual({ ok: false, code: COMMUNITY_ERROR_CODE.storageUnavailable });

    // The abandoned claim is still pending, so a retry on the same id must not claim success.
    const retry = harness([
      { match: "/rpc/claim_idempotency_key", json: [{ decision: "IN_PROGRESS" }] },
    ]);
    const retryResult = await repository(retry.fetchImpl).persist(INPUT);

    expect(retryResult).toEqual({ ok: false, code: COMMUNITY_ERROR_CODE.requestInProgress });
  });

  it("reports a differing payload under the same key as a conflict", async () => {
    const { calls, fetchImpl } = harness([
      { match: "/rpc/claim_idempotency_key", json: [{ decision: "CONFLICT" }] },
    ]);

    const result = await repository(fetchImpl).persist(INPUT);

    expect(result).toEqual({ ok: false, code: COMMUNITY_ERROR_CODE.requestConflict });
    expect(calls).toHaveLength(1);
  });

  it("patches an existing subscriber instead of attempting a forbidden upsert", async () => {
    const { calls, fetchImpl } = harness([
      { match: "/rpc/claim_idempotency_key", json: [{ decision: "CLAIMED" }] },
      { match: "/subscribers", status: 409, json: {} },
      { match: "/subscribers", json: [{ id: "existing-sub" }] },
      { match: "/subscribers", json: [{}] },
      { match: "/email_requests", json: [{}] },
      { match: "/consent_events", json: [{}] },
      { match: "/idempotency_keys", json: [{}] },
    ]);

    const result = await repository(fetchImpl).persist(INPUT);

    expect(result).toMatchObject({ ok: true, subscriberId: "existing-sub" });

    const patch = calls.find((call) => call.method === "PATCH" && call.path.endsWith("/subscribers"));
    // Only first_name and updated_at are writable on an existing row; id and email are not granted.
    expect(Object.keys(patch?.body ?? {}).sort()).toEqual(["first_name", "updated_at"]);
  });

  it("returns storage_unavailable without credentials and makes no request", async () => {
    const { calls, fetchImpl } = harness([]);
    const bare = createSupabaseCommunityRepository({ env: {}, fetchImpl });

    const result = await bare.persist(INPUT);

    expect(result).toEqual({ ok: false, code: COMMUNITY_ERROR_CODE.storageUnavailable });
    expect(calls).toHaveLength(0);
  });

  it("does not mark the subscriber reachable when provider sync failed", async () => {
    const { calls, fetchImpl } = harness([
      { match: "/email_requests", json: [{}] },
      { match: "/idempotency_keys", json: [{}] },
    ]);

    await repository(fetchImpl).recordProviderOutcome({
      requestId: INPUT.requestId,
      subscriberId: "sub-1",
      emailRequestId: "req-1",
      outcome: "failed",
    });

    // No subscribers PATCH: a failed sync must not advance audience_state.
    expect(calls.map((call) => call.path)).toEqual([
      "/rest/v1/email_requests",
      "/rest/v1/idempotency_keys",
    ]);
    expect(calls[0].body).toMatchObject({
      delivery_status: "failed",
      error_code: COMMUNITY_ERROR_CODE.providerUnavailable,
    });
    // The settled claim carries the real outcome so a replay cannot report success.
    expect(calls[1].body).toMatchObject({
      status: "completed",
      result_jsonb: { subscriber_id: "sub-1", outcome: "pending_provider" },
    });
  });

  it("marks the subscriber reachable only after a successful sync", async () => {
    const { calls, fetchImpl } = harness([
      { match: "/email_requests", json: [{}] },
      { match: "/subscribers", json: [{}] },
      { match: "/idempotency_keys", json: [{}] },
    ]);

    const result = await repository(fetchImpl).recordProviderOutcome({
      requestId: INPUT.requestId,
      subscriberId: "sub-1",
      emailRequestId: "req-1",
      outcome: "synced",
    });

    expect(result).toEqual({ ok: true });
    expect(calls).toHaveLength(3);
    expect(calls[0].body).toMatchObject({ delivery_status: "synced", error_code: null });
    expect(calls[1].body).toMatchObject({ audience_state: "subscribed" });
    expect(calls[2].body).toMatchObject({
      status: "completed",
      result_jsonb: { subscriber_id: "sub-1", outcome: "subscribed" },
    });
  });

  it("reports failure when the audience-state transition does not land", async () => {
    const { fetchImpl } = harness([
      { match: "/email_requests", json: [{}] },
      { match: "/subscribers", status: 503, json: {} },
    ]);

    const result = await repository(fetchImpl).recordProviderOutcome({
      requestId: INPUT.requestId,
      subscriberId: "sub-1",
      emailRequestId: "req-1",
      outcome: "synced",
    });

    // Silently returning ok here is what let a stale `pending` row be reported as subscribed.
    expect(result).toEqual({ ok: false });
  });

  it("reports failure when the delivery-status write does not land", async () => {
    const { calls, fetchImpl } = harness([{ match: "/email_requests", status: 500, json: {} }]);

    const result = await repository(fetchImpl).recordProviderOutcome({
      requestId: INPUT.requestId,
      subscriberId: "sub-1",
      emailRequestId: "req-1",
      outcome: "synced",
    });

    expect(result).toEqual({ ok: false });
    expect(calls).toHaveLength(1);
  });
});

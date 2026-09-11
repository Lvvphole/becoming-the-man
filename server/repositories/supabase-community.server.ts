import { createHash, randomUUID } from "node:crypto";
import {
  COMMUNITY_CONSENT_SCOPE,
  COMMUNITY_CONSENT_VERSION,
  COMMUNITY_ERROR_CODE,
  COMMUNITY_IDEMPOTENCY_SCOPE,
  COMMUNITY_REQUEST_TYPE,
  COMMUNITY_SIGNUP_SOURCE,
} from "../../contracts/community";
import type {
  CommunityPersistResult,
  CommunityProviderOutcomeInput,
  CommunityProviderOutcomeResult,
  CommunitySettledOutcome,
  CommunitySubscriptionInput,
  CommunitySubscriptionRepository,
} from "../domain/community-subscription";

type ServerEnvironment = Readonly<Record<string, string | undefined>>;
type CommunityFetch = (input: URL, init: RequestInit) => Promise<Response>;

const WRITE_TIMEOUT_MS = 5_000;
/** How long a claim may stay pending before the key is considered abandoned. */
const CLAIM_LEASE_MS = 15 * 60 * 1_000;

const AUDIENCE_STATE = {
  pending: "pending",
  subscribed: "subscribed",
} as const;

const DELIVERY_STATUS = {
  pending: "pending",
  synced: "synced",
  failed: "failed",
} as const;

export interface SupabaseCommunityOptions {
  env?: ServerEnvironment;
  fetchImpl?: CommunityFetch;
  now?: () => Date;
  newId?: () => string;
}

interface Connection {
  baseUrl: string;
  credential: string;
  fetchImpl: CommunityFetch;
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Discriminates one logical request. The schema constrains this to lowercase hex of exactly 64
 * characters, so any change to the digest shape breaks the insert rather than silently storing junk.
 */
export function requestHash(input: CommunitySubscriptionInput): string {
  return createHash("sha256")
    .update(
      JSON.stringify({
        email: normalizeEmail(input.email),
        firstName: input.firstName.trim(),
        consentScope: COMMUNITY_CONSENT_SCOPE,
        consentVersion: COMMUNITY_CONSENT_VERSION,
        source: COMMUNITY_SIGNUP_SOURCE,
      }),
    )
    .digest("hex");
}

async function send(
  connection: Connection,
  path: string,
  init: RequestInit & { searchParams?: Record<string, string> },
): Promise<Response | null> {
  let endpoint: URL;
  try {
    endpoint = new URL(path, connection.baseUrl);
  } catch {
    return null;
  }

  for (const [key, value] of Object.entries(init.searchParams ?? {})) {
    endpoint.searchParams.set(key, value);
  }

  const abortController = new AbortController();
  const timeout = setTimeout(() => abortController.abort(), WRITE_TIMEOUT_MS);

  try {
    return await connection.fetchImpl(endpoint, {
      ...init,
      headers: {
        apikey: connection.credential,
        authorization: `Bearer ${connection.credential}`,
        "content-type": "application/json",
        ...init.headers,
      },
      signal: abortController.signal,
    });
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

async function readJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function firstRow(payload: unknown): Record<string, unknown> | null {
  if (!Array.isArray(payload) || payload.length === 0) {
    return null;
  }

  const row = payload[0];
  return typeof row === "object" && row !== null ? (row as Record<string, unknown>) : null;
}

/**
 * Reads the outcome a settled claim stored. Anything unrecognised resolves to `pending_provider`,
 * because the one thing this must never do is invent a reachable subscription.
 */
function storedOutcome(value: unknown): CommunitySettledOutcome {
  if (typeof value !== "object" || value === null) {
    return "pending_provider";
  }

  return Reflect.get(value, "outcome") === "subscribed" ? "subscribed" : "pending_provider";
}

function resolveConnection(
  env: ServerEnvironment,
  fetchImpl: CommunityFetch,
): Connection | null {
  const baseUrl = env.SUPABASE_URL;
  // Server-only credential: the write path runs as community_runtime, which anon can never reach.
  const credential = env.SUPABASE_SERVICE_ROLE_KEY;

  if (!baseUrl || !credential) {
    return null;
  }

  return { baseUrl, credential, fetchImpl };
}

export function createSupabaseCommunityRepository(
  options: SupabaseCommunityOptions = {},
): CommunitySubscriptionRepository {
  const env = options.env ?? process.env;
  const fetchImpl = options.fetchImpl ?? ((input, init) => fetch(input, init));
  const now = options.now ?? (() => new Date());
  const newId = options.newId ?? (() => randomUUID());

  async function claim(
    connection: Connection,
    input: CommunitySubscriptionInput,
  ): Promise<
    | { kind: "claimed" }
    | { kind: "replay"; outcome: CommunitySettledOutcome }
    | { kind: "in_progress" }
    | { kind: "conflict" }
    | { kind: "unavailable" }
  > {
    const response = await send(connection, "/rest/v1/rpc/claim_idempotency_key", {
      method: "POST",
      body: JSON.stringify({
        p_scope: COMMUNITY_IDEMPOTENCY_SCOPE,
        p_key: input.requestId,
        p_request_hash: requestHash(input),
        p_expires_at: new Date(now().getTime() + CLAIM_LEASE_MS).toISOString(),
      }),
    });

    if (!response || !response.ok) {
      return { kind: "unavailable" };
    }

    const row = firstRow(await readJson(response));
    const decision = row?.decision;
    if (decision === "CLAIMED") {
      return { kind: "claimed" };
    }
    // REPLAY means the prior attempt settled. Return the outcome it settled on rather than assuming
    // success: that attempt may have ended in pending_provider.
    if (decision === "REPLAY") {
      return { kind: "replay", outcome: storedOutcome(row?.result_jsonb) };
    }
    // IN_PROGRESS means a claim exists that never settled — another caller is mid-flight, or an
    // earlier attempt failed partway. Either way there is no outcome to return and the work is not
    // done, so it must never be reported as a finished subscription.
    if (decision === "IN_PROGRESS") {
      return { kind: "in_progress" };
    }
    if (decision === "CONFLICT") {
      return { kind: "conflict" };
    }

    return { kind: "unavailable" };
  }

  /**
   * The runtime may update only first_name, audience_state and updated_at on subscribers, so a
   * blanket upsert would be refused. Insert first, and fall back to select-then-patch on conflict.
   */
  async function upsertSubscriber(
    connection: Connection,
    input: CommunitySubscriptionInput,
    timestamp: string,
  ): Promise<string | null> {
    const email = normalizeEmail(input.email);
    const inserted = await send(connection, "/rest/v1/subscribers", {
      method: "POST",
      headers: { prefer: "return=representation" },
      body: JSON.stringify({
        id: newId(),
        email,
        first_name: input.firstName.trim(),
        audience_state: AUDIENCE_STATE.pending,
        created_at: timestamp,
        updated_at: timestamp,
      }),
    });

    if (inserted?.ok) {
      const id = firstRow(await readJson(inserted))?.id;
      return typeof id === "string" ? id : null;
    }

    if (!inserted || inserted.status !== 409) {
      return null;
    }

    const existing = await send(connection, "/rest/v1/subscribers", {
      method: "GET",
      searchParams: { email: `eq.${email}`, select: "id", limit: "1" },
    });

    if (!existing?.ok) {
      return null;
    }

    const id = firstRow(await readJson(existing))?.id;
    if (typeof id !== "string") {
      return null;
    }

    const patched = await send(connection, "/rest/v1/subscribers", {
      method: "PATCH",
      searchParams: { id: `eq.${id}` },
      body: JSON.stringify({ first_name: input.firstName.trim(), updated_at: timestamp }),
    });

    return patched?.ok ? id : null;
  }

  /**
   * Settles the claim with the outcome this request actually reached. Called only once the provider
   * has answered, so a later replay reads a truthful result rather than an assumption.
   */
  async function settleClaim(
    connection: Connection,
    requestId: string,
    subscriberId: string,
    emailRequestId: string,
    outcome: CommunitySettledOutcome,
  ): Promise<boolean> {
    const response = await send(connection, "/rest/v1/idempotency_keys", {
      method: "PATCH",
      searchParams: {
        scope: `eq.${COMMUNITY_IDEMPOTENCY_SCOPE}`,
        key: `eq.${requestId}`,
      },
      body: JSON.stringify({
        status: "completed",
        result_reference: emailRequestId,
        result_jsonb: { subscriber_id: subscriberId, outcome },
      }),
    });

    return Boolean(response?.ok);
  }

  return {
    async persist(input: CommunitySubscriptionInput): Promise<CommunityPersistResult> {
      const connection = resolveConnection(env, fetchImpl);
      if (!connection) {
        return { ok: false, code: COMMUNITY_ERROR_CODE.storageUnavailable };
      }

      const decision = await claim(connection, input);
      if (decision.kind === "conflict") {
        return { ok: false, code: COMMUNITY_ERROR_CODE.requestConflict };
      }
      if (decision.kind === "unavailable") {
        return { ok: false, code: COMMUNITY_ERROR_CODE.storageUnavailable };
      }
      // Only a settled prior attempt has an outcome to stand in for this one, and the caller gets
      // that outcome rather than an assumed success.
      if (decision.kind === "replay") {
        return { ok: true, duplicate: true, outcome: decision.outcome };
      }
      // An unsettled claim is not a subscription. Reporting it as one would tell a visitor they are
      // on the list when the consent grant or the provider sync may never have happened.
      if (decision.kind === "in_progress") {
        return { ok: false, code: COMMUNITY_ERROR_CODE.requestInProgress };
      }

      const timestamp = now().toISOString();
      const subscriberId = await upsertSubscriber(connection, input, timestamp);
      if (!subscriberId) {
        return { ok: false, code: COMMUNITY_ERROR_CODE.storageUnavailable };
      }

      const emailRequestId = newId();
      const emailRequest = await send(connection, "/rest/v1/email_requests", {
        method: "POST",
        body: JSON.stringify({
          id: emailRequestId,
          request_type: COMMUNITY_REQUEST_TYPE,
          email: normalizeEmail(input.email),
          first_name: input.firstName.trim(),
          consent_scope: COMMUNITY_CONSENT_SCOPE,
          consent_version: COMMUNITY_CONSENT_VERSION,
          source: COMMUNITY_SIGNUP_SOURCE,
          // Minimum necessary payload: the address and name are already first-class columns.
          payload_jsonb: { consent_version: COMMUNITY_CONSENT_VERSION },
          delivery_status: DELIVERY_STATUS.pending,
          created_at: timestamp,
          updated_at: timestamp,
        }),
      });

      if (!emailRequest?.ok) {
        return { ok: false, code: COMMUNITY_ERROR_CODE.storageUnavailable };
      }

      const consentEvent = await send(connection, "/rest/v1/consent_events", {
        method: "POST",
        body: JSON.stringify({
          id: newId(),
          subscriber_id: subscriberId,
          request_id: input.requestId,
          consent_scope: COMMUNITY_CONSENT_SCOPE,
          consent_version: COMMUNITY_CONSENT_VERSION,
          source: COMMUNITY_SIGNUP_SOURCE,
          event_type: "grant",
          created_at: timestamp,
        }),
      });

      if (!consentEvent?.ok) {
        return { ok: false, code: COMMUNITY_ERROR_CODE.storageUnavailable };
      }

      // The claim stays pending here on purpose. Its outcome is not known until the provider has
      // answered, and settling it early is what let a replay report an unearned subscription.
      return { ok: true, duplicate: false, subscriberId, emailRequestId };
    },

    async recordProviderOutcome(
      input: CommunityProviderOutcomeInput,
    ): Promise<CommunityProviderOutcomeResult> {
      const connection = resolveConnection(env, fetchImpl);
      if (!connection) {
        return { ok: false };
      }

      const timestamp = now().toISOString();
      const synced = input.outcome === "synced";

      const request = await send(connection, "/rest/v1/email_requests", {
        method: "PATCH",
        searchParams: { id: `eq.${input.emailRequestId}` },
        body: JSON.stringify({
          delivery_status: synced ? DELIVERY_STATUS.synced : DELIVERY_STATUS.failed,
          error_code: synced ? null : COMMUNITY_ERROR_CODE.providerUnavailable,
          updated_at: timestamp,
        }),
      });

      if (!request?.ok) {
        return { ok: false };
      }

      // Only a contact the provider accepted is reachable, so audience_state advances on success
      // alone. A failed sync leaves the subscriber pending for a retry to pick up.
      if (synced) {
        const subscriber = await send(connection, "/rest/v1/subscribers", {
          method: "PATCH",
          searchParams: { id: `eq.${input.subscriberId}` },
          body: JSON.stringify({
            audience_state: AUDIENCE_STATE.subscribed,
            updated_at: timestamp,
          }),
        });

        // The database is authoritative for audience membership. If this transition did not land
        // the subscriber is still pending there and would be skipped by later audience operations,
        // so the caller must not be told the signup completed.
        if (!subscriber?.ok) {
          return { ok: false };
        }
      }

      // Settle the claim last, with the outcome this request actually reached, so a replay returns
      // it. If this write fails the claim stays pending and a retry is refused rather than answered
      // with a guess.
      const settled = await settleClaim(
        connection,
        input.requestId,
        input.subscriberId,
        input.emailRequestId,
        synced ? "subscribed" : "pending_provider",
      );

      return { ok: settled };
    },
  };
}

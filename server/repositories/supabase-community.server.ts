import type {
  CommunityProviderStatus,
  CommunitySubscriptionRepository,
} from "../domain/community-subscription";

type Environment = Readonly<Record<string, string | undefined>>;
type HttpFetch = (input: URL, init: RequestInit) => Promise<Response>;

interface Options {
  env?: Environment;
  fetchImpl?: HttpFetch;
}

function row(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null ? value as Record<string, unknown> : null;
}

function configured(env: Environment): { url: string; key: string } {
  const url = env.SUPABASE_URL;
  const key = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("PERSISTENCE_CONFIGURATION_UNAVAILABLE");
  return { url, key };
}

export function createSupabaseCommunityRepository(options: Options = {}): CommunitySubscriptionRepository {
  const env = options.env ?? process.env;
  const fetchImpl = options.fetchImpl ?? fetch;

  async function rpc(name: string, body: Record<string, unknown>): Promise<unknown> {
    const config = configured(env);
    const endpoint = new URL(`/rest/v1/rpc/${name}`, config.url);
    let response: Response;
    try {
      response = await fetchImpl(endpoint, {
        method: "POST",
        headers: {
          apikey: config.key,
          authorization: `Bearer ${config.key}`,
          "content-type": "application/json",
        },
        body: JSON.stringify(body),
      });
    } catch {
      throw new Error("PERSISTENCE_UNAVAILABLE");
    }
    if (!response.ok) throw new Error("PERSISTENCE_UNAVAILABLE");
    try {
      return await response.json();
    } catch {
      throw new Error("PERSISTENCE_INVALID_RESPONSE");
    }
  }

  return {
    async persistConsentAndSubscriber(input) {
      const payload = await rpc("persist_community_subscription", {
        p_request_id: input.requestId,
        p_email: input.email,
        p_first_name: input.firstName ?? null,
        p_source: input.source,
        p_consent_version: input.consentVersion,
      });
      if (!Array.isArray(payload) || payload.length !== 1) throw new Error("PERSISTENCE_INVALID_RESPONSE");
      const value = row(payload[0]);
      const requestId = value?.request_id;
      const subscriberId = value?.subscriber_id;
      const providerStatus = value?.provider_status;
      if (
        typeof requestId !== "string" ||
        typeof subscriberId !== "string" ||
        !["not_synced", "pending", "reachable"].includes(String(providerStatus))
      ) throw new Error("PERSISTENCE_INVALID_RESPONSE");
      return {
        requestId,
        subscriberId,
        providerStatus: providerStatus as CommunityProviderStatus,
      };
    },

    async markProviderReachable({ subscriberId, providerContactId }) {
      await rpc("set_community_provider_state", {
        p_subscriber_id: subscriberId,
        p_status: "reachable",
        p_resend_contact_id: providerContactId,
        p_error_code: null,
      });
    },

    async markProviderPending({ subscriberId, errorCode }) {
      await rpc("set_community_provider_state", {
        p_subscriber_id: subscriberId,
        p_status: "pending",
        p_resend_contact_id: null,
        p_error_code: errorCode,
      });
    },
  };
}

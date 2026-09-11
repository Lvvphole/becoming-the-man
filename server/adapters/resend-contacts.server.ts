import { COMMUNITY_ERROR_CODE } from "../../contracts/community";
import type {
  CommunityContactProvider,
  CommunityContactSyncResult,
  CommunitySubscriptionInput,
} from "../domain/community-subscription";

type ServerEnvironment = Readonly<Record<string, string | undefined>>;
type ContactFetch = (input: URL, init: RequestInit) => Promise<Response>;

const SYNC_TIMEOUT_MS = 5_000;
const RESEND_API_ORIGIN = "https://api.resend.com";

export interface ResendContactsOptions {
  env?: ServerEnvironment;
  fetchImpl?: ContactFetch;
}

/**
 * Adds the consented address to the Resend audience, which is what makes a persisted subscriber
 * reachable (DOD-01). Provider types never leave this adapter: the domain sees only a typed result.
 */
export function createResendContactProvider(
  options: ResendContactsOptions = {},
): CommunityContactProvider {
  const env = options.env ?? process.env;
  const fetchImpl = options.fetchImpl ?? ((input, init) => fetch(input, init));

  return {
    async syncContact(input: CommunitySubscriptionInput): Promise<CommunityContactSyncResult> {
      const apiKey = env.RESEND_API_KEY;
      const audienceId = env.RESEND_AUDIENCE_ID;

      if (!apiKey || !audienceId) {
        return { ok: false, code: COMMUNITY_ERROR_CODE.providerUnavailable };
      }

      let endpoint: URL;
      try {
        endpoint = new URL(`/audiences/${encodeURIComponent(audienceId)}/contacts`, RESEND_API_ORIGIN);
      } catch {
        return { ok: false, code: COMMUNITY_ERROR_CODE.providerUnavailable };
      }

      const abortController = new AbortController();
      const timeout = setTimeout(() => abortController.abort(), SYNC_TIMEOUT_MS);

      try {
        const response = await fetchImpl(endpoint, {
          method: "POST",
          headers: {
            authorization: `Bearer ${apiKey}`,
            "content-type": "application/json",
          },
          body: JSON.stringify({
            email: input.email.trim().toLowerCase(),
            first_name: input.firstName.trim(),
            unsubscribed: false,
          }),
          signal: abortController.signal,
        });

        if (!response.ok) {
          // The provider's own message may echo request content, so nothing from the body is
          // returned to the caller; only the stable code crosses the boundary.
          return { ok: false, code: COMMUNITY_ERROR_CODE.providerUnavailable };
        }

        return { ok: true };
      } catch {
        return { ok: false, code: COMMUNITY_ERROR_CODE.providerUnavailable };
      } finally {
        clearTimeout(timeout);
      }
    },
  };
}

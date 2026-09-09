import type { CommunityAudienceProvider } from "../domain/community-subscription";

type Environment = Readonly<Record<string, string | undefined>>;
type HttpFetch = (input: URL, init: RequestInit) => Promise<Response>;

interface Options {
  env?: Environment;
  fetchImpl?: HttpFetch;
}

function record(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null ? value as Record<string, unknown> : null;
}

async function contactId(response: Response): Promise<string | null> {
  try {
    const value = record(await response.json());
    return typeof value?.id === "string" ? value.id : null;
  } catch {
    return null;
  }
}

export function createResendCommunityProvider(options: Options = {}): CommunityAudienceProvider {
  const env = options.env ?? process.env;
  const fetchImpl = options.fetchImpl ?? fetch;

  return {
    async syncEligibleContact({ email, firstName }) {
      const apiKey = env.RESEND_API_KEY;
      const segmentId = env.RESEND_COMMUNITY_SEGMENT_ID;
      if (!apiKey || !segmentId) return { ok: false, code: "PROVIDER_CONFIGURATION_UNAVAILABLE" };

      const headers = {
        authorization: `Bearer ${apiKey}`,
        "content-type": "application/json",
        "user-agent": "becoming-the-man/1.0",
      };

      let response: Response;
      try {
        response = await fetchImpl(new URL("https://api.resend.com/contacts"), {
          method: "POST",
          headers,
          body: JSON.stringify({
            email,
            first_name: firstName,
            unsubscribed: false,
            segments: [{ id: segmentId }],
          }),
        });
      } catch {
        return { ok: false, code: "PROVIDER_UNAVAILABLE" };
      }

      if (response.ok) {
        const id = await contactId(response);
        return id ? { ok: true, contactId: id } : { ok: false, code: "PROVIDER_INVALID_RESPONSE" };
      }
      if (response.status !== 409) return { ok: false, code: "PROVIDER_UNAVAILABLE" };

      try {
        const existing = await fetchImpl(
          new URL(`https://api.resend.com/contacts/${encodeURIComponent(email)}`),
          { method: "GET", headers },
        );
        const id = existing.ok ? await contactId(existing) : null;
        if (!id) return { ok: false, code: "PROVIDER_UNAVAILABLE" };
        const segment = await fetchImpl(
          new URL(`https://api.resend.com/contacts/${encodeURIComponent(id)}/segments/${encodeURIComponent(segmentId)}`),
          { method: "POST", headers },
        );
        if (!segment.ok && segment.status !== 409) return { ok: false, code: "PROVIDER_UNAVAILABLE" };
        return { ok: true, contactId: id };
      } catch {
        return { ok: false, code: "PROVIDER_UNAVAILABLE" };
      }
    },
  };
}

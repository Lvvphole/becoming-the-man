import type { CommunityAudienceProvider } from "../domain/community-subscription";

type Environment = Readonly<Record<string, string | undefined>>;
type HttpFetch = (input: URL, init: RequestInit) => Promise<Response>;

interface Options {
  env?: Environment;
  fetchImpl?: HttpFetch;
}

async function readContactId(response: Response): Promise<string | null> {
  try {
    const value: unknown = await response.json();
    if (typeof value !== "object" || value === null || !("id" in value)) return null;
    return typeof value.id === "string" ? value.id : null;
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

      let created: Response;
      try {
        created = await fetchImpl(new URL("https://api.resend.com/contacts"), {
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

      if (created.ok) {
        const contactId = await readContactId(created);
        return contactId ? { ok: true, contactId } : { ok: false, code: "PROVIDER_INVALID_RESPONSE" };
      }
      if (created.status !== 409) return { ok: false, code: "PROVIDER_UNAVAILABLE" };

      try {
        const existing = await fetchImpl(
          new URL(`https://api.resend.com/contacts/${encodeURIComponent(email)}`),
          { method: "GET", headers },
        );
        const contactId = existing.ok ? await readContactId(existing) : null;
        if (!contactId) return { ok: false, code: "PROVIDER_UNAVAILABLE" };

        const segment = await fetchImpl(
          new URL(`https://api.resend.com/contacts/${encodeURIComponent(contactId)}/segments/${encodeURIComponent(segmentId)}`),
          { method: "POST", headers },
        );
        return segment.ok
          ? { ok: true, contactId }
          : { ok: false, code: "PROVIDER_UNAVAILABLE" };
      } catch {
        return { ok: false, code: "PROVIDER_UNAVAILABLE" };
      }
    },
  };
}

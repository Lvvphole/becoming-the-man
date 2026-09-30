import type { ContactHumanVerifier } from "../domain/contact-submission";

type Env = Readonly<Record<string, string | undefined>>;
type RecaptchaFetch = (input: URL, init: RequestInit) => Promise<Response>;

const ENDPOINT = new URL("https://www.google.com/recaptcha/api/siteverify");

export function createGoogleRecaptchaVerifier(
  options: { env?: Env; fetchImpl?: RecaptchaFetch } = {},
): ContactHumanVerifier {
  const env = options.env ?? process.env;
  const fetchImpl = options.fetchImpl ?? ((input, init) => fetch(input, init));

  return {
    async verify(token, ip) {
      const secret = env.RECAPTCHA_SECRET_KEY;
      if (!secret) return { status: "unavailable" };
      if (!token.trim()) return { status: "rejected" };

      const body = new URLSearchParams({ secret, response: token.trim() });
      if (ip.trim()) body.set("remoteip", ip.trim());

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5_000);
      try {
        const response = await fetchImpl(ENDPOINT, {
          method: "POST",
          headers: { "content-type": "application/x-www-form-urlencoded" },
          body,
          signal: controller.signal,
        });
        if (!response.ok) return { status: "unavailable" };

        const result = (await response.json()) as { success?: unknown } | null;
        if (typeof result?.success !== "boolean") return { status: "unavailable" };
        return { status: result.success ? "verified" : "rejected" };
      } catch {
        return { status: "unavailable" };
      } finally {
        clearTimeout(timeout);
      }
    },
  };
}

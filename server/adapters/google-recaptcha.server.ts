import type { ContactHumanVerifier } from "../domain/contact-submission";

type ServerEnvironment = Readonly<Record<string, string | undefined>>;
type RecaptchaFetch = (input: URL, init: RequestInit) => Promise<Response>;

const ENDPOINT = "https://www.google.com/recaptcha/api/siteverify";
const TIMEOUT_MS = 5_000;

export function createGoogleRecaptchaVerifier(
  options: { env?: ServerEnvironment; fetchImpl?: RecaptchaFetch } = {},
): ContactHumanVerifier {
  const env = options.env ?? process.env;
  const fetchImpl = options.fetchImpl ?? ((input, init) => fetch(input, init));

  return {
    async verify(token, ip) {
      const secret = env.RECAPTCHA_SECRET_KEY;
      if (!secret || !token.trim()) {
        return { status: "unavailable" };
      }

      const body = new URLSearchParams({
        secret,
        response: token.trim(),
      });
      if (ip.trim()) {
        body.set("remoteip", ip.trim());
      }

      const abortController = new AbortController();
      const timeout = setTimeout(() => abortController.abort(), TIMEOUT_MS);
      try {
        const response = await fetchImpl(new URL(ENDPOINT), {
          method: "POST",
          headers: { "content-type": "application/x-www-form-urlencoded" },
          body,
          signal: abortController.signal,
        });
        if (!response.ok) {
          return { status: "unavailable" };
        }

        const result = (await response.json()) as unknown;
        if (
          !result ||
          typeof result !== "object" ||
          typeof (result as { success?: unknown }).success !== "boolean"
        ) {
          return { status: "unavailable" };
        }

        return (result as { success: boolean }).success
          ? { status: "verified" }
          : { status: "rejected" };
      } catch {
        return { status: "unavailable" };
      } finally {
        clearTimeout(timeout);
      }
    },
  };
}

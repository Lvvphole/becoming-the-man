import type { BookCtaAnalyticsEvent } from "../../contracts/analytics";

export type AnalyticsCaptureResult = "queued" | "disabled" | "failed";

export interface BrowserAnalytics {
  capture(event: BookCtaAnalyticsEvent): AnalyticsCaptureResult;
}

type AnalyticsFetch = (input: URL, init: RequestInit) => Promise<Response>;

type BrowserAnalyticsOptions = Readonly<{
  projectKey?: string;
  host?: string;
  fetchImpl?: AnalyticsFetch;
  distinctIdFactory?: () => string | null;
}>;

function resolveCaptureEndpoint(host: string): URL | null {
  try {
    const endpoint = new URL("/capture/", host);
    if (
      (endpoint.protocol !== "https:" && endpoint.protocol !== "http:") ||
      endpoint.username ||
      endpoint.password
    ) {
      return null;
    }

    return endpoint;
  } catch {
    return null;
  }
}

function createEphemeralDistinctId(): string | null {
  if (typeof globalThis.crypto?.randomUUID !== "function") {
    return null;
  }

  return globalThis.crypto.randomUUID();
}

export function createBrowserAnalytics(options: BrowserAnalyticsOptions): BrowserAnalytics {
  const fetchImpl = options.fetchImpl ?? ((input, init) => globalThis.fetch(input, init));
  const distinctIdFactory = options.distinctIdFactory ?? createEphemeralDistinctId;
  const projectKey = options.projectKey?.trim();
  const endpoint = options.host ? resolveCaptureEndpoint(options.host) : null;
  let distinctId: string | null | undefined;

  return {
    capture(event) {
      if (!projectKey || endpoint === null) {
        return "disabled";
      }

      if (distinctId === undefined) {
        distinctId = distinctIdFactory();
      }

      if (!distinctId) {
        return "disabled";
      }

      try {
        const request = fetchImpl(endpoint, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            api_key: projectKey,
            event: event.name,
            properties: {
              distinct_id: distinctId,
              ...event.properties,
              $process_person_profile: false,
            },
          }),
          keepalive: true,
        });

        void request.catch(() => undefined);
        return "queued";
      } catch {
        return "failed";
      }
    },
  };
}

export const browserAnalytics = createBrowserAnalytics({
  projectKey: import.meta.env.VITE_POSTHOG_PROJECT_KEY,
  host: import.meta.env.VITE_POSTHOG_HOST,
});

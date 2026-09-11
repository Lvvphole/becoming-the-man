import { useEffect, useState, type FormEvent } from "react";
import {
  COMMUNITY_ERROR_CODE,
  COMMUNITY_FIELD_LIMITS,
  COMMUNITY_HONEYPOT_FIELD,
  type CommunityErrorCode,
} from "../../contracts/community";
import { SIGNUP_EVENT, createSignupAnalyticsEvent } from "../../contracts/analytics";
import { browserAnalytics, type BrowserAnalytics } from "../lib/analytics-browser";

export const SUBSCRIBE_ENDPOINT = "/api/subscribe";

type FormState =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "subscribed" }
  | { kind: "pending_provider" }
  | { kind: "error"; code: CommunityErrorCode };

const MESSAGES: Readonly<Record<CommunityErrorCode, string>> = {
  [COMMUNITY_ERROR_CODE.consentRequired]: "Please confirm you want to receive these emails.",
  [COMMUNITY_ERROR_CODE.emailInvalid]: "Enter a valid email address.",
  [COMMUNITY_ERROR_CODE.firstNameRequired]: "Enter your first name.",
  [COMMUNITY_ERROR_CODE.fieldTooLong]: "That entry is too long.",
  [COMMUNITY_ERROR_CODE.requestConflict]: "That request was already used with different details.",
  [COMMUNITY_ERROR_CODE.requestInProgress]:
    "This signup is still being processed. Please try again in a moment.",
  [COMMUNITY_ERROR_CODE.storageUnavailable]: "We could not save your request. Please try again.",
  [COMMUNITY_ERROR_CODE.providerUnavailable]: "We could not complete signup. Please try again.",
  [COMMUNITY_ERROR_CODE.rejected]: "We could not process that submission.",
};

function statusMessage(state: FormState): string {
  switch (state.kind) {
    case "submitting":
      return "Joining…";
    case "subscribed":
      return "You are on the list. Watch your inbox.";
    // Consent is saved but the provider has not accepted the contact, so this must not be
    // presented as a reachable subscription (Architecture section 19). No automatic retry exists
    // yet, so the message offers the action the visitor can actually take instead of promising one.
    case "pending_provider":
      return "We saved your request but could not finish signup. Please try again in a few minutes.";
    case "error":
      return MESSAGES[state.code];
    default:
      return "";
  }
}

export function CommunitySignupForm({
  analytics = browserAnalytics,
}: {
  analytics?: BrowserAnalytics;
}) {
  const [state, setState] = useState<FormState>({ kind: "idle" });
  const [requestId, setRequestId] = useState("");

  function rotateRequestId() {
    if (typeof globalThis.crypto?.randomUUID === "function") {
      setRequestId(globalThis.crypto.randomUUID());
    }
  }

  // Generated after hydration so the server-rendered markup stays deterministic. The endpoint
  // creates an id when this is absent, so a no-script submission still works.
  useEffect(rotateRequestId, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setState({ kind: "submitting" });
    analytics.capture(createSignupAnalyticsEvent(SIGNUP_EVENT.start));

    let body: SubscribeBody;
    try {
      const response = await fetch(SUBSCRIBE_ENDPOINT, {
        method: "POST",
        headers: { accept: "application/json" },
        body: new FormData(form),
      });
      body = (await response.json()) as SubscribeBody;
    } catch {
      setState({ kind: "error", code: COMMUNITY_ERROR_CODE.storageUnavailable });
      analytics.capture(
        createSignupAnalyticsEvent(SIGNUP_EVENT.error, {
          error_code: COMMUNITY_ERROR_CODE.storageUnavailable,
        }),
      );
      return;
    }

    if (body.status === "error") {
      setState({ kind: "error", code: body.code });
      analytics.capture(
        createSignupAnalyticsEvent(SIGNUP_EVENT.error, { error_code: body.code }),
      );
      // An attempt that failed partway leaves its claim unfinished, and with no reclaim path that
      // key would answer IN_PROGRESS forever. Retrying is a new logical request, so it gets a new
      // id rather than colliding with the abandoned claim.
      rotateRequestId();
      return;
    }

    setState({ kind: body.status });
    analytics.capture(
      createSignupAnalyticsEvent(SIGNUP_EVENT.complete, { outcome: body.status }),
    );
    form.reset();
    // A new logical request for the next submission, so a later signup is not treated as a replay.
    rotateRequestId();
  }

  const submitting = state.kind === "submitting";

  return (
    <>
      <form
        className="community-form"
        method="post"
        action={SUBSCRIBE_ENDPOINT}
        onSubmit={onSubmit}
        aria-describedby="community-status"
      >
        <input type="hidden" name="requestId" value={requestId} readOnly />

        <label className="sr-only" htmlFor="community-first-name">First name</label>
        <input
          id="community-first-name"
          name="firstName"
          type="text"
          autoComplete="given-name"
          placeholder="First name"
          maxLength={COMMUNITY_FIELD_LIMITS.firstName}
          required
        />

        <label className="sr-only" htmlFor="community-email">Email address</label>
        <input
          id="community-email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="Your email address"
          maxLength={COMMUNITY_FIELD_LIMITS.email}
          required
        />

        {/* Decoy field: hidden from people and assistive technology, attractive to bots. */}
        <div className="community-decoy" aria-hidden="true">
          <label htmlFor="community-company">Company</label>
          <input
            id="community-company"
            name={COMMUNITY_HONEYPOT_FIELD}
            type="text"
            tabIndex={-1}
            autoComplete="off"
          />
        </div>

        <p className="community-consent">
          <input id="community-consent" name="marketingConsent" type="checkbox" value="on" />
          <label htmlFor="community-consent">
            Yes, email me updates about <em>Becoming the Man She Can Trust</em>. You can unsubscribe
            at any time.
          </label>
        </p>

        <button type="submit" disabled={submitting}>
          {submitting ? "Joining\u2026" : "Join the Community"}
        </button>
      </form>

      <p className="community-note" id="community-status" role="status" aria-live="polite">
        {statusMessage(state)}
      </p>
    </>
  );
}

type SubscribeBody =
  | { status: "subscribed" }
  | { status: "pending_provider" }
  | { status: "error"; code: CommunityErrorCode };

# Join the Community — Increment 01

Base SHA: `48d75394cc7e4dab5b503958feb84162b179df6b`

Acceptance boundary: FR-103 consent gate only.

Contract: when `marketingConsent` is false, the community subscription use case returns an error before any persistence or provider synchronization effect occurs.

In scope:
- domain contract for community subscription dependencies;
- consent-first rejection behavior;
- regression test proving zero persistence and zero provider effects without consent.

Out of scope:
- Home form activation;
- `/api/subscribe` runtime route;
- Supabase schema/repository work;
- Resend synchronization behavior;
- Turnstile and rate limiting;
- retry identity;
- mobile layout;
- DOD-02 email lifecycle.

Evidence source: closed PLAN_READY PR #30 and closed implementation attempt #31 are constraint feedback only. No code is reused wholesale.

Completion requires exact-head PR Verification, change-size verification, then Codex review. Merge remains separately authorized.

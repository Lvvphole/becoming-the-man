# Community signup vertical slice — evidence

Scope: make the Join the Community form on `/` actually work, end to end, along the locked DOD-01
path. Before this change `src/routes/home.tsx` rendered a `disabled` input under the caption
"Community signup will be available soon", and nothing in the application called the community
storage layer that already existed.

## Authority

| Source | Requirement | Where it is met |
|---|---|---|
| Architecture §21 (DOD-01) | `/api/subscribe -> email_requests + subscribers + consent_events -> Resend eligibility` | `src/routes/api.subscribe.ts`, `server/repositories/supabase-community.server.ts`, `server/adapters/resend-contacts.server.ts` |
| Product Spec FR-103 | Collect email + first name + explicit marketing consent; persist source, consent version and timestamp; show clear success/error | `src/components/community-signup-form.tsx`, `contracts/community.ts` |
| Architecture §19 | Duplicate submit maps to the same logical result; return prior result; no duplicate record or send | `claim_idempotency_key` call in `persist()`; `IN_PROGRESS`/`REPLAY` short-circuit before any write or provider call |
| Architecture §19 | Provider unavailable: consent stays durable, UI does not falsely claim a reachable subscription | `pending_provider` result; `audience_state` advances only on a successful sync |
| Product Spec §438 | Never send raw email as an analytics event property | `contracts/analytics.ts`; asserted in `tests/smoke/community-signup-analytics.test.ts` |
| Architecture line 450 | Provider and service secrets exist only in server-scoped variables, never through `VITE_*` | Credentials read from `process.env` inside `.server.ts` modules only |

This is the first caller of `claim_idempotency_key`. The function shipped in PR #34 with no consumer;
it now carries the duplicate-submit contract for a real endpoint.

## What is proven, and how

`npm run verify` passes (lint, typecheck, 74 unit/smoke tests, production build).

Unit coverage uses injected `env` and `fetchImpl`, following the shape already proven by
`tests/server/supabase-site-settings.test.ts`, so no live credential is needed to run it:

- **Boundary** (`tests/server/api-subscribe.test.ts`, 13 cases): absent consent, a non-affirmative
  consent value, malformed addresses, blank first name, oversized fields and a filled decoy are each
  rejected before any dependency is constructed. A client-supplied `requestId` is preserved so one
  submission stays one logical request; the server creates one only when it is absent.
- **Repository** (`tests/server/supabase-community.test.ts`, 10 cases): the claim precedes every
  write and the call order is asserted exactly; `IN_PROGRESS` and `REPLAY` perform no further request
  at all; `CONFLICT` is surfaced as an error; the request hash matches the schema's
  `^[0-9a-f]{64}$`; an existing subscriber is patched with only the columns the runtime may update.
- **Provider** (`tests/server/resend-contacts.test.ts`, 7 cases): a rejection or transport failure is
  recorded as failure rather than success, and neither the API key nor the provider's message is
  returned to the caller.
- **Privacy** (`tests/smoke/community-signup-analytics.test.ts`): signup events carry outcome and
  error code only; the serialized event contains no `@` at all.

**Real-PostgreSQL proof.** `supabase/tests/community/subscribe-write-path.sql` runs the exact write
sequence the repository performs — with the shipped constants from `contracts/community.ts`, not
fixture values — as `community_test_login` against real constraints, RLS and grants, including a
duplicate claim that must return `REPLAY`. A unit test with a faked `fetch` cannot catch a constant
the schema rejects; this can.

That file was checked for vacuity rather than assumed sound: mutating one consent-version constant
makes it fail (`subscribe write path did not reach the expected durable state`, exit 3) while the
unmutated file passes (exit 0).

Local runs used a `pgserver` cluster because this environment's network policy blocks the Docker Hub
pull (`production.cloudfront.docker.com`, 403 at the gateway). CI remains the authority and runs the
committed Docker harness unchanged.

## Deviations recorded, not silently carried

1. **First name is required; FR-103 says optional.** `subscribers.first_name` and
   `email_requests.first_name` are both `NOT NULL CHECK (char_length(trim(...)) > 0)` in
   `20260910111000_create_community_storage.sql`, already on `main`, and the existing
   `subscribeToCommunity` rejected blank input before this change. The suite already evidences the
   constraint: `subscribers rejects first_name=NULL` expects SQLSTATE 23502. Making it optional needs
   a schema migration; the user decided to keep it required and record the deviation rather than
   change the schema a fourth time. **The shipped product contradicts FR-103 on this point.**
2. **No Turnstile on a public form.** The `/api/subscribe` contract row does not name Turnstile, but
   the public-form abuse control row (Architecture line 453) does. This slice ships the controls that
   need no vendor — schema and length ceilings, a honeypot, and the idempotency key. Turnstile is a
   **pre-production gap** and must land before public launch.

## What this does NOT establish

**DOD-01 is not met by this PR.** DOD-01 is "*Production* signup → persisted consent → reachable
subscriber". That requires a deploy with real values for `SUPABASE_URL`,
`SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY` and `RESEND_AUDIENCE_ID`, plus a real signup producing
a real Resend contact and a real consent row. Nothing here proves that. Code-complete is not done.

Required server-only environment variables, none of which may be exposed through `VITE_*`:

| Variable | Purpose |
|---|---|
| `SUPABASE_URL` | PostgREST origin |
| `SUPABASE_SERVICE_ROLE_KEY` | Write path; runs as `community_runtime`, which `anon` cannot reach |
| `RESEND_API_KEY` | Audience contact sync |
| `RESEND_AUDIENCE_ID` | Target audience |

`SUPABASE_SERVICE_ROLE_KEY` is the first server-only credential in this repository; the two existing
adapters use the read-only publishable key.

Also out of scope, each its own slice: Turnstile, the welcome email (Product Spec line 396),
unsubscribe and preferences (FR-104), `/api/resend/webhook`, the `/newsletter` route (line 218), and
a retry job for a failed provider sync. Without that retry job a `pending_provider` record stays
pending until an operator acts.

Merge authority remains separate and is not implied by this evidence.

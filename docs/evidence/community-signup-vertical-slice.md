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
   need no vendor — schema and length ceilings, a honeypot, and an affirmative-consent requirement.
   The idempotency key is **not** among them: it bounds duplicates of one logical request and places
   no ceiling on distinct requests, so a client supplying a fresh UUID each time is unconstrained by
   it. Nothing here is a rate limit. Turnstile plus a hash-based rate limiter is a **pre-production
   gap** and must land before public launch.

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

## Codex cycle 1 findings (PR #37, `d5021af`)

Four findings. Three were real defects in this slice; the fourth is the recorded Turnstile deviation.
Two of the three are the same mistake — reporting success that had not been achieved — which the
existing unit tests did not catch because each asserted the happy path of its own layer.

**P1 — an unfinished claim was reported as a subscription.** `claim()` mapped both `IN_PROGRESS` and
`REPLAY` to `duplicate`, and the form retained its `requestId` after a failure. So an attempt that
died between writes (subscriber inserted, `email_requests` insert failed) left a pending claim, and
the retry answered `IN_PROGRESS` → `duplicate` → `subscribed`, telling the visitor they were on the
list when the consent grant and the Resend sync had never happened.

`REPLAY` alone now means duplicate: only a completed prior attempt has a stored result to stand in
for this one. `IN_PROGRESS` returns the new `request_in_progress` code. The form also rotates its
`requestId` after a failed attempt, because with no reclaim path an abandoned claim would otherwise
answer `IN_PROGRESS` for that key indefinitely.

**P2 — the interface promised a retry that does not exist.** The `pending_provider` message said "We
will retry shortly" while this same file records that no retry job exists. The copy now names the
action the visitor can actually take.

**P2 — the audience-state transition was written and never checked.** `recordProviderOutcome`
ignored both PATCH results, so if Resend accepted the contact but the Supabase write failed, the
subscriber stayed `pending` in the authoritative store while the visitor was told signup completed.
It now returns whether the outcome was durably recorded, and `subscribeToCommunity` reports
`subscribed` only when the provider accepted **and** the database recorded it.

**P1 — Turnstile.** Not a new finding: this is the deviation recorded above and deferred with the
owner's authorization. Codex adds one point worth keeping: because each submission may carry a fresh
`requestId`, the idempotency key bounds duplicates of one logical request but places no ceiling on
distinct requests, so it is not an abuse control. Automated submissions that leave the decoy empty
can still reach both Supabase and the Resend contact API and consume provider quota. That raises the
priority of the pre-production Turnstile gap rather than changing the decision.

## Codex cycle 3 finding carried over from PR #34

Cycle 3 on `031c626` reported that the contention cases used a fixed `sleep` before probing, which
does not guarantee the holder had acquired the row lock. On a loaded runner the probe could run
first, see a still-valid lease, return the expected value, and let a reclaiming implementation pass.
That review was not read before #34 merged, so the weakness reached `main`; it is repaired here.

`await_holder` now polls `pg_stat_activity` until another backend is actively in `pg_sleep`. Every
holder statement runs its `UPDATE` or claim before `pg_sleep` within one transaction, so an active
sleep proves the row lock is held.

The repaired case was checked against a deliberately faulty baseline — the pre-reduction reclaiming
function, reinstalled together with the `GRANT UPDATE (created_at,expires_at)` it needs — and failed
on it three times out of three with `expected 'REPLAY', got 'CLAIMED'`, while passing against the
current function. The first attempt at this check failed instead with `42501: permission denied`,
which would have been misleading evidence: it proved the missing grant blocked the reclaim, not that
the synchronization catches one. Restoring the grant was required to test the mechanism rather than
its side effect.

Suite state after these repairs: 78 unit and smoke tests pass, the real-PostgreSQL suite reaches
`GREEN_IDEMPOTENCY_CLAIM_CONTRACT`, `BDD_SUBSCRIBE_WRITE_PATH_OK` and `BDD_STORAGE_ROUNDTRIP_OK`, and
the minimum-wait assertion still observes a real race at 6.01 s.

PLAN_READY

# Join the Community Authority Reconciliation Plan v2

Source base: `48d75394cc7e4dab5b503958feb84162b179df6b`
Prior evidence source only: closed PR #29, head `f2aa7d03167e316fe364effdbb31231ba6727c10`.
External planning artifact SHA-256: `46f2e83b3a5e40f2c63a7f5381f4a4d770f46c0aefaca0192c41b9bf9eb229cb`.
Mode: BROWNFIELD.
Selected path: user-selected fresh implementation PR from `main`; do not reuse PR #29.

## Frozen contract

Goal: finish the governed Join the Community capability without inventing product behavior, weakening verification, or making green CI the objective.

DOD-01 / FR-103 boundary:
`voluntary signup -> explicit marketing consent -> durable request/consent/subscriber state -> reachable Resend contact -> truthful user state`.

Preserve the already-governed DOD-02 / FR-104 R1 email foundation:
`confirmed signup -> Welcome -> provider message ID/status -> verified webhook -> delivery/suppression -> preferences govern future sends`.

Non-goals: R2 campaign authoring, new commercial behavior, new email categories, custom queues/microservices, duplicate audience systems, speculative abstractions, or redesign of the approved Home journey.

## Governing authority

- Root `AGENTS.md`: exact-head verification; <=1,000 reviewable implementation lines absent explicit owner exception; reproduce defects before repair; smallest coherent repair; no speculative fix-forward; Codex only after green CI; merge separately user-authorized.
- Governing Product Specification DOD-01/DOD-02: voluntary audience capture with persisted consent; email audience honors unsubscribe/preferences with delivery evidence.
- Product Specification FR-103/FR-104, NFR-05/06/07: explicit consent; persisted source/version/timestamp; reachable Resend contact; least privilege/RLS/abuse controls; idempotent writes/sends; visible failures and durable delivery state.
- System Architecture §§07-10, 19-21: request-id mutation contract; `/api/subscribe` flow; Supabase data ownership; RLS/grants; Turnstile/rate limiting; consent-first Resend sync; safe retry; provider evidence; release evidence.
- System Architecture Amendments v1.1/v1.2: <=1,000 lines, exact-head CI, bounded Codex convergence, separate merge authority.
- Canonical engineering rules: REQ-001/003/004/006/007; SC-002/006/008/009/010/011; RT-004/005/006/007/008/010/011; AD-001/002/004; TS-001/002/003; TDD-001; AE-001/002/003/004/005/006/008.

External vendor documentation is feasibility evidence only, never product authority.

## Protected actions

AUTHORIZED: read repository/governance/public vendor docs; write implementation/tests on the fresh build branch after builder preflight.
APPROVAL_GATED: non-production provider mutations needed for actual Supabase/Resend boundary evidence; merge.
UNAUTHORIZED: production provider mutation without explicit authority; weakening/skipping verification; inventing requirements; reusing PR #29 as the implementation branch.

## Corrected beliefs from PR #29

1. CI exit code 2 did not prove a data-model defect. The observed fact is that the local PostgreSQL verification process became unavailable. Root cause remains unresolved until container/process diagnostics identify it.
2. PR #29's core three-table direction was useful but incomplete. `email_requests` lacked locked `payload_jsonb` and `resend_message_id`; contact reachability was incorrectly conflated with email `delivery_status`; required R1 supporting state was absent.
3. Resend `/contacts` does not have documented email-send idempotency semantics. Application idempotency owns contact reconciliation.
4. FR-103 does not itself authorize inventing a Resend Topic requirement. FR-104 owns preferences/suppression behavior.
5. The four Codex findings are evidence inputs: route unavailable under `npm run dev`; Turnstile token reused; retry request ID changes; expanded form mobile grid/checkbox geometry is incorrect.

## Authoritative data model delta

Preserve architecture-owned structures only:
- `subscribers`: normalized audience profile/current deliverability projection.
- `consent_events`: append-only grant/revoke/version/source evidence by purpose; authoritative marketing permission evidence.
- `email_requests`: must support `id`, `request_type`, `email`, `first_name`, `consent_scope`, `consent_version`, `source`, `payload_jsonb`, `resend_message_id`, `delivery_status`, `error_code`, timestamps.
- `idempotency_keys`: scope/key/request hash/status/result reference/expiry.
- `system_failures`: unresolved/recovered critical provider failure records.
- `rate_limits`: hashed request key, endpoint, window, count/expiry.
- DOD-02 increment: `email_events` and `integration_events` for verified provider lifecycle/webhook evidence.

No new table is authorized by this plan.

Semantic invariants:
- contact `not_synced/pending/reachable` belongs to subscriber/provider-sync state, not email delivery state;
- `consent_events` remains marketing-permission authority;
- retries reuse the same logical request identity;
- same idempotency key with a different request hash is rejected;
- provider failure cannot become false success;
- no provider message is treated as delivered merely because an API call was accepted.

Migration choice is evidence-gated: determine whether the abandoned migration was ever applied to a shared environment before deciding whether to rewrite an unshipped migration or add a forward corrective migration.

## Obligations and verification

O1 FR-103 form behavior: PARTIAL/PARTIAL -> first build increment.
O2 `/api/subscribe` real runtime route: GAP/PARTIAL -> real `npm run dev` contract test.
O3 stable retry `request_id`: GAP/PARTIAL -> failing retry regression before repair.
O4 fresh Turnstile token per submitted attempt: GAP/GAP -> failing lifecycle regression before repair.
O5 durable/RLS-protected consent-request-subscriber state: PARTIAL/PARTIAL -> migration/RLS tests.
O6 architecture-owned idempotency state: PARTIAL/PARTIAL -> same-key/same-hash and same-key/different-hash tests, including concurrency where uniqueness is the oracle.
O7 hash-based rate limiting: GAP/GAP -> boundary/DB tests without raw email storage.
O8 durable provider failure/observable pending state: PARTIAL/PARTIAL -> failure-state persistence tests.
O9 reachable Resend contact only after reconciliation: PARTIAL/PARTIAL -> adapter partitions plus later actual provider evidence.
O10 mobile usability: GAP/PARTIAL -> 320/390/430 geometry/accessibility checks.
O11 exactly-one Welcome per new eligible transition: GAP/GAP -> DOD-02 increment.
O12 provider message ID/status and verified webhook evidence: GAP/GAP -> DOD-02 increment.
O13 unsubscribe/preferences/suppression governs future sends: GAP/GAP -> DOD-02 increment.
O14 exact-head CI/change-size/Codex: GAP/process-owned -> final increment.

## Selected design

1. One canonical subscribe handler. Register `/api/subscribe` as a React Router resource route. Any deployment-specific entry point delegates to the same handler; no duplicate subscription implementations.
2. Stable client logical request identity. One normalized business payload gets one UUID across retryable attempts. Turnstile token is not part of the business request identity because it must refresh. Changed business payload gets a new UUID.
3. Programmatic Turnstile lifecycle sufficient to reset/re-render after a consumed attempt. Server Siteverify remains mandatory.
4. Keep provider SDK/HTTP details behind adapters and Supabase access behind repository methods.
5. RLS and minimum grants remain mandatory. Do not use privilege escalation merely to pass tests. Function privilege semantics must be supported by the actual Supabase boundary and tests.
6. Resend contact synchronization is reconciliation by email and configured audience grouping; do not claim `/contacts` idempotency headers.
7. Mobile form uses deliberate rows and excludes checkbox controls from text-input geometry.
8. DOD-02 Welcome/webhook/preferences remains a coherent follow-on increment if exact change-size evidence shows it cannot safely fit the implementation PR. Do not compress/delete valid verification to fit the limit.

## Verification strategy

V0 verifier health: diagnose the Postgres lifecycle failure before changing the harness. Capture container identity, `docker ps -a`, `docker inspect` state/exit/OOM/error, PostgreSQL logs, exact failing command and exit status. One evidence-backed repair only; unchanged repeat verifies determinism. Same failure with no new evidence -> BLOCKED.

V1 Vitest behavior: missing consent causes zero persistence/provider effects; persistence precedes provider sync; provider failure yields durable pending; already-reachable does not repeat provider contact effect; retry identity is stable; changed payload cannot reuse old identity; malformed external responses are narrowed from `unknown`; provider 409/429/5xx/network partitions are covered.

V2 real API/runtime: run documented `npm run dev`; `/api/subscribe` must not 404 and must return the stable envelope. Mocked route-module tests alone are insufficient.

V3 database/RLS/idempotency: required fields/tables; RLS; forbidden-role access denied; authorized server path works; same-key/same-hash idempotent; different hash rejected; consent append-only/purpose-specific; pending failure persists; rate-limit keys are hashed; contact reachability never populates email delivery evidence.

V4 mobile: 320/390/430 widths; ordered controls; no horizontal overflow/overlap; readable/labeled consent; checkbox native geometry; keyboard/touch path preserved.

V5 bounded mutation adequacy, isolated and non-committed: one mutant at a time must be killed by the intended verifier: remove consent guard; regenerate request ID on retry; reuse Turnstile token; report provider failure as reachable; accept changed hash under same key; disable RLS/regrant anon read; write contact reachability into email delivery status. A surviving mutant means the oracle is inadequate; strengthen verification, not production behavior.

V6 actual boundary evidence, approval-gated: non-production Supabase migration/RLS and Resend contact reconciliation; later Welcome `/emails` idempotency and signed webhook/suppression evidence. Mocks are not sufficient acceptance evidence for cross-service contracts.

V7 exact-head: change-size gate, lint, typecheck, tests, build/SSR, applicable RLS/mobile/API gates, exact-head PR Verification, then Codex. Merge remains separately authorized.

## Execution increments

I0 Verification observability/repeatability. Add diagnostics first; make one harness repair only if diagnostics identify a bounded cause. Stop on repeated failure without new evidence.

I1 Four known UI/runtime repairs, TDD first. Establish failing route/retry/Turnstile/mobile regressions; implement canonical resource route, stable retry identity, fresh Turnstile lifecycle, mobile layout. Stop if the repair creates duplicate server contracts or changes product behavior outside FR-103.

I2 DOD-01 Supabase reconciliation. After determining migration deployment state, add only authoritative missing fields/supporting state; separate contact state from email delivery state; implement idempotency/failure/rate-limit model; preserve consent authority; verify RLS/privilege/concurrency. Stop if deployment state is unknown when migration mutation is required.

I3 FR-103 Resend eligibility. Reconcile contact; persist contact ID/reachable only on success; durable pending otherwise; use documented provider contract only. Actual provider evidence remains approval-gated.

I4 DOD-02 R1 email foundation, subject to change-size decomposition. Exactly-one Welcome, stable `/emails` idempotency, message ID/delivery/error persistence, verified webhook, suppression/preferences. Stop if sender domain/preference/webhook configuration is not authorized or verified.

I5 exact-head review gate. Run all affected verification. Request Codex only after green exact-head CI. Never self-declare PASS or merge.

## Source binding and builder preflight

This plan is committed from current `main` base `48d75394cc7e4dab5b503958feb84162b179df6b`. PR #29 is evidence only and must not be cherry-picked wholesale.

Before the first implementation mutation the builder must bind its fresh implementation branch: record exact HEAD/tree, staged diff hash, unstaged diff hash, and every untracked path/content hash. If implementation source differs materially from the planned base, stop and reconcile before coding.

## Stop conditions

Stop on unresolved authority conflict; unknown migration deployment state when schema mutation depends on it; unsupported provider assumption; repeated CI/harness failure without new diagnostics; verification weakening; surviving mutation negative control; >1,000 reviewable lines without safe decomposition or explicit owner exception; new significant defect class in the same mechanism; missing/failing/skipped exact-head CI; cycle-3 actionable Codex finding; secret exposure; or unapproved provider mutation.

## Completion authority

`PLAN_READY` authorizes construction under governance; it is not PASS. The builder cannot self-accept. Technical eligibility requires exact-head deterministic verification and actual cross-boundary evidence where applicable. Merge requires separate user authorization.

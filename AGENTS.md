# AGENTS.md

Repository: `Lvvphole/becoming-the-man`
Status: active React SSR repository. Keep this file under 150 lines and synchronized with real commands and enforced checks.

## Build & Test
- Install locked dependencies: `npm ci`.
- Start the SSR development server: `npm run dev`.
- Lint: `npm run lint`.
- Typecheck: `npm run typecheck`.
- Unit/smoke tests: `npm run test`.
- Production build: `npm run build`.
- Bounded code verification: `npm run verify`.
- PR change-size gate: `npm run verify:change-size -- <base-ref>`.
- Run verification for the surface changed:
  - TypeScript/code -> lint, typecheck, unit tests.
  - API/contracts -> contract tests.
  - Supabase schema/RLS -> migration and RLS tests.
  - User journeys -> E2E and accessibility checks.
  - SEO/indexing -> rendered HTML, metadata, canonical, schema, sitemap/noindex checks.
  - AI/assessment -> the applicable AI evals and deterministic assessment fixtures.
  - Release candidate -> owning release checks plus all earlier-release regressions.
- A green build alone is not release evidence.

## Change & Review Gates
- A PR may contain at most 1,000 reviewable implementation lines changed, measured as additions + deletions from the merge base to the final head.
- Count source, tests, scripts, SQL, configuration, and workflow definitions. Exclude Markdown/docs, dependency lockfiles, and explicitly generated framework/build artifacts.
- Over-budget work must be decomposed unless the user explicitly authorizes an exception before merge. Record that authorization in a PR comment containing the exact line `CHANGE-SIZE-EXCEPTION: APPROVED`; CI accepts it only when the comment author is the repository owner.
- Persistent `PR Verification` must PASS for the exact final PR head SHA. Any new implementation commit invalidates earlier verification evidence.
- After CI is green, request a Codex review on the exact implementation state.
- Without new explicit user authorization, a PR may execute at most three Codex review cycles. If cycle 3 reports any actionable finding, stop immediately and report `BLOCKED`; do not repair that finding or start a fourth review cycle unless the user explicitly authorizes continue, split, reduce, redesign, or abandon.
- A substantive implementation, verification-logic, or governance-semantics change after Codex review invalidates that review and requires fresh exact-head CI plus the next permitted Codex review cycle.
- A pure refresh with newer `main` always requires fresh exact-head CI. The prior Codex review remains current only when the effective reviewable implementation diff against updated `main` is unchanged; if equivalence cannot be demonstrated, require the next permitted Codex review cycle.
- Documentation-only evidence updates that do not alter implementation, verification logic, or governance semantics do not consume a Codex review cycle or invalidate a current review.
- Do not declare PASS, complete, or merge-ready while required CI is missing/failing or an actionable Codex finding remains unresolved.
- Merge remains a separate user-authorized action. Verification and review create eligibility, never merge authority.

## Bug Fix & Repair
- Establish the violated observable contract before changing code. Do not infer new product behavior from the defect.
- Reproduce the defect before repair when it is reproducible.
- For a reproducible defect, add or update regression evidence that fails on the faulty baseline and passes after the repair.
- Make the smallest coherent repair that restores the contract. Do not combine unrelated cleanup, redesign, or feature work with the fix.
- Run the narrowest relevant verification after each repair, then run all affected change-set gates.
- If the same failure remains, make another repair only when materially new diagnostic evidence identifies a specific, bounded, non-speculative correction.
- If no materially new diagnostic evidence remains, stop and report BLOCKED. Do not continue speculative fix-forward.
- If repairs expose a new significant defect class caused by the same mechanism, stop local repair and reassess the mechanism: `STOP -> REDUCE OR REDESIGN -> VERIFY`.
- The 1,000-line change-size rule remains a reviewability guardrail. Do not fragment one coherent repair merely to satisfy the limit; request the existing explicit exception when safe decomposition would weaken verification or correctness.
- Bug-repair re-review is subject to the same three-cycle Codex convergence cap in Change & Review Gates.
- A repaired change is not complete until required verification passes on the exact final head SHA and the required Codex review has no unresolved actionable finding.
- Verification establishes merge eligibility only. Merge remains separately user-authorized.

## Code Style & Conventions
- Production code is TypeScript/TSX.
- Keep route and presentation code free of provider SDKs, secrets, SQL, assessment scoring, and AI safety logic.
- Keep deterministic product logic in domain/use-case modules where practical.
- Put provider-specific code behind adapters; do not leak provider types into domain contracts.
- Centralize Supabase access behind repository/data-access modules.
- Validate mutation input at the server boundary and preserve stable machine-readable error codes.
- Make duplicate-sensitive writes, sends, webhooks, and paid calls idempotent.

## Project Architecture
Use the locked single-repository shape when scaffolding:
- `src/` — routes, components, features, layouts, browser-safe helpers, styles.
- `api/` — Vercel function entry points where needed.
- `server/` — domain, schemas, repositories, adapters, email, AI, security.
- `contracts/` — shared API/event/error/schema contracts.
- `supabase/` — migrations, seed data, RLS/migration tests.
- `config/` — versioned assessment and AI configuration.
- `tests/` — unit, contract, integration, E2E, accessibility/SEO, AI tests as added.
- `docs/evidence/` — non-sensitive verification evidence or stable references.
- `scripts/` — bounded build, ingestion, release, or evidence utilities.
- `.claude/skills/` — agent skills (scout-agent, plan). Each skill folder contains a `SKILL.md` and optional `references/`. Read `SKILL.md` on trigger; read references only when cited.
Do not introduce microservices, queues, Kubernetes, custom payment/order systems, or duplicate provider systems of record without an approved architecture change.

## Security & Deployment
- Never commit secrets, production credentials/data, private exports, or sensitive evidence.
- Keep privileged credentials server-only. Browser code must never receive service-role or provider secret keys.
- Exposed Supabase objects require explicit grants and RLS; production DB changes use committed migrations.
- Verify webhook signatures before trusting payloads; handle duplicate and replayed events safely.
- Do not send raw email, contact text, assessment answers, AI transcripts, or sensitive relationship content to analytics.
- Keep `/admin` and sensitive/session-specific pages private, no-store, and non-indexable.
- Use non-production provider projects/test modes for previews; previews remain noindex.
- Do not bypass required checks to obtain a green deployment.
- `main` must require `PR Verification` and require the branch to be up to date before merge. Until repository rules enforce both, merge enforcement is incomplete.

## Upstream Source Router
Do not preload upstream specifications. Read only the smallest relevant authoritative section when the task requires it.
- Product goal, governing UX, DoD, release intent/order, or product constraints -> **Website Governing Product Specification v1.0 — LOCKED**.
- Exact user/operator behavior, journey, requirement, or acceptance criterion -> **Website Product Specification v1.0 — LOCKED**.
- Repository boundary, runtime, data ownership, API/provider contract, security, AI grounding/evals, CI/CD, or recovery -> **Website System Architecture v1.0 — LOCKED**, as amended by approved versioned architecture amendments.
- Public book identity or Twenty-Four Non-Negotiables -> published **Becoming the Man She Can Trust**.
- Deeper relationship protocols, evidence calibration, or safety/referral rules -> **Master Relationship Operating System v1.4**.
If the required authoritative source is not present in the repository or supplied task context, stop and request it. Do not substitute memory or guess.

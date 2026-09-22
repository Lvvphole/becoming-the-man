# AGENTS.md

Repository: `Lvvphole/becoming-the-man`
Status: active React SSR repository. Keep this file under 150 lines and synchronized with real commands and enforced checks.

## Authority & Routing
- This file is the repository execution constitution and highest repository authority.
- After reading this file, route every task through root `CONTEXT.md`. `CONTEXT.md` exclusively owns deterministic task-domain selection and subordinate source selection. It does not impose a repository lifecycle stage.
- `CLAUDE.md` may only route to this file. It must not duplicate or reinterpret governance.
- Product specifications, architecture documents/amendments, skills, contracts, schemas, tests, plans, and evidence are subordinate to this file.
- The executing agent must not infer, broaden, substitute, or choose a route. Any missing, conflicting, zero-match, or multi-match route returns the machine-readable `BLOCKED` record defined by the routed engineering rules.
- Before a full task envelope exists, the bounded read-only localization bootstrap defined by root `CONTEXT.md` may derive exact `source_sections` and `workpiece_paths` only after a caller- or controller-supplied task domain resolves exactly one route. It cannot infer a task domain, access evidence, mutate state, run verification, or grant authority.
- Before creating or modifying code, tests, schemas, migrations, build/workflow logic, or harness/verifier logic, read the engineering-rules source selected by `CONTEXT.md` and satisfy its Pre-Code Readiness Gate.

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

  ## AGENT EXECUTION GOVERNANCE
- **Micro-PR Ceiling (500 LOC):** Every PR must be atomic (e.g., UI component vs API route vs database schema).
- **No Speculative Schema Drift:** DB migrations, Prisma models, and API payload schemas must be defined and approved before UI or service logic is authored.

## Change & Review Gates
- A PR may contain at most 500 reviewable implementation lines changed, measured as additions + deletions from the merge base to the final head.
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
- The 500-line change-size rule remains a reviewability guardrail. Do not fragment one coherent repair merely to satisfy the limit; request the existing explicit exception when safe decomposition would weaken verification or correctness.
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
- `docs/evidence/` — non-sensitive, non-authoritative Layer 4 verification evidence only; never plans, requirements, waivers, or reference authority.
- `scripts/` — bounded build, ingestion, release, or evidence utilities.
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

## Routing Boundary
- Root `CONTEXT.md` is the only task-domain and source router. Do not maintain a second skill router, source router, or evidence router in this file.
- Outside the read-only localization bootstrap, load only the exact Layer 3 sources, workpiece paths, and evidence IDs selected by the validated task envelope.
- Do not scan or preload `.claude/skills/`, `docs/`, or `docs/evidence/` to discover a route or source. The sole exception is the `CONTEXT.md` read-only localization bootstrap: after exact task-domain routing, it may use locator-only search inside that route's registered Layer 3 sources and subject-targeted repository search to identify exact selectors. It must not inspect `docs/evidence/**`.
- Skills are optional task procedures, not mandatory lifecycle stages, and cannot grant write, review, PASS, merge-readiness, or merge authority.
- If root `CONTEXT.md` or any required routed source is unavailable, stale, ambiguous, or conflicts without explicit precedence, stop and return `BLOCKED`. Do not substitute memory or guess.

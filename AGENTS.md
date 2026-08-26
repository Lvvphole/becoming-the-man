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
- PR change-size gate: `bash scripts/check-change-size.sh <base-ref>`.
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
- Over-budget work must be decomposed unless the user explicitly authorizes an exception before merge.
- Persistent `PR Verification` must PASS for the exact final PR head SHA. Any new implementation commit invalidates earlier verification evidence.
- After CI is green, request a Codex review on the exact final head. Any substantive implementation change after that review requires CI and Codex review again.
- Do not declare PASS, complete, or merge-ready while required CI is missing/failing or an actionable Codex finding remains unresolved.
- Merge remains a separate user-authorized action. Verification and review create eligibility, never merge authority.

## Code Style & Conventions
- Production code is TypeScript/TSX.
- Keep route and presentation code free of provider SDKs, secrets, SQL, assessment scoring, and AI safety logic.
- Keep deterministic product logic in domain/use-case modules where practical.
- Put provider-specific code behind adapters; do not leak provider types into domain contracts.
- Centralize Supabase access behind repository/data-access modules.
- Validate mutation input at the server boundary and preserve stable machine-readable error codes.
- Make duplicate-sensitive writes, sends, webhooks, and paid calls idempotent.
- Add regression coverage for behavior changes and bug fixes where practical.

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

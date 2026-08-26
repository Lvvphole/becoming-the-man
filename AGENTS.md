# AGENTS.md

Repository: `Lvvphole/becoming-the-man`
Status: bootstrap instructions for an empty repository. Keep this file short; update it only when the repository gains real commands, paths, or checks.

## Build & Test
- No repository build, lint, typecheck, test, or CI commands exist yet.
- Do not invent commands.
- Once `package.json` exists, use only scripts defined there and update this section with the exact commands.
- Run verification for the surface changed:
  - TypeScript/code -> lint, typecheck, unit tests.
  - API/contracts -> contract tests.
  - Supabase schema/RLS -> migration and RLS tests.
  - User journeys -> E2E and accessibility checks.
  - SEO/indexing -> rendered HTML, metadata, canonical, schema, sitemap/noindex checks.
  - AI/assessment -> the applicable AI evals and deterministic assessment fixtures.
  - Release candidate -> owning release checks plus all earlier-release regressions.
- A green build alone is not release evidence.

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

## Upstream Source Router
Do not preload upstream specifications. Read only the smallest relevant authoritative section when the task requires it.
- Product goal, governing UX, DoD, release intent/order, or product constraints -> **Website Governing Product Specification v1.0 — LOCKED**.
- Exact user/operator behavior, journey, requirement, or acceptance criterion -> **Website Product Specification v1.0 — LOCKED**.
- Repository boundary, runtime, data ownership, API/provider contract, security, AI grounding/evals, CI/CD, or recovery -> **Website System Architecture v1.0 — LOCKED**.
- Public book identity or Twenty-Four Non-Negotiables -> published **Becoming the Man She Can Trust**.
- Deeper relationship protocols, evidence calibration, or safety/referral rules -> **Master Relationship Operating System v1.4**.
If the required authoritative source is not present in the repository or supplied task context, stop and request it. Do not substitute memory or guess.

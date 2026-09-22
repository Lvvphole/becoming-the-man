# Repository Context Router

Status: ACTIVE
Authority: subordinate only to `AGENTS.md`.

Root `CONTEXT.md` is the repository's only task/path router. It maps explicit affected paths to the minimum governing sources and verification surfaces. It is not an SDLC state machine and does not select or require an external harness lifecycle.

## Routing Inputs

A task supplies:
- the explicit repository path or paths it may read or change;
- the requested behavior or defect;
- any approval required by `AGENTS.md` or an authoritative product/architecture source.

Do not infer a path that the task does not require. Do not use semantic similarity, prior lifecycle state, historical evidence, or an external harness verdict as routing authority.

When a task spans multiple path classes, compose the matching rows. Composition adds requirements; it never removes a requirement from either row.

A path with no matching row is `BLOCKED: ROUTE_NOT_FOUND`. A path that cannot be resolved deterministically is `BLOCKED: ROUTE_AMBIGUOUS`.

## Source Registry

| Source ID | Path | Authority |
| --- | --- | --- |
| engineering_rules | `references/engineering/engineering-rules.md` | Repository engineering and mutation rules |
| architecture_manifest | `references/architecture/CONTEXT.md` | Active architecture-source manifest and precedence |
| product_prd | `docs/Website_Product_Specification_v1.0_LOCKED.md` | Locked product behavior and Definition of Done |
| system_architecture | `docs/Website_System_Architecture_v1.0_LOCKED.md` plus active amendments selected by architecture_manifest | Locked system boundaries and architecture |
| root_governance | `AGENTS.md` and this file | Repository authority and deterministic routing |

Evidence under `docs/evidence/**` is non-authoritative. It may prove an observed state but cannot create a requirement, permission, waiver, route, PASS, merge-readiness, or merge authority.

## Canonical Path Routes

| Path selector | Domain | Required sources | Required verification |
| --- | --- | --- | --- |
| `AGENTS.md`, `CONTEXT.md` | governance | root_governance, engineering_rules | governance/routing checks; change-size when applicable |
| `references/engineering/**` | governance | root_governance, engineering_rules | governance/routing checks |
| `references/architecture/**` | architecture governance | root_governance, architecture_manifest, system_architecture | architecture-source consistency |
| `src/**` | frontend/product UI | engineering_rules, product_prd, architecture_manifest, system_architecture | lint, typecheck, unit/smoke; add E2E/accessibility or SSR/SEO checks when affected |
| `server/**` | backend/domain | engineering_rules, product_prd, architecture_manifest, system_architecture | lint, typecheck, unit/smoke plus affected domain tests |
| `api/**` | API/provider boundary | engineering_rules, product_prd, architecture_manifest, system_architecture | lint, typecheck, contract/integration tests |
| `contracts/**` | shared contracts | engineering_rules, product_prd, architecture_manifest, system_architecture | contract tests plus affected typecheck/tests |
| `supabase/**` | database/RLS | engineering_rules, product_prd, architecture_manifest, system_architecture | migration/RLS tests plus affected integration tests |
| `config/**` | versioned product/AI configuration | engineering_rules, product_prd, architecture_manifest, system_architecture | deterministic fixtures/evals applicable to changed config |
| `tests/**` | verification | engineering_rules plus authorities for the behavior under test | execute affected tests; verification logic must not weaken governing behavior |
| `scripts/**` | repository tooling | engineering_rules plus authorities for the behavior enforced by the script | narrow script tests/checks plus affected repository verification |
| `.github/workflows/**` | CI/CD | engineering_rules, architecture_manifest, system_architecture | workflow/CI checks; preserve exact-head PR Verification requirements |
| `docs/Website_Product_Specification_v1.0_LOCKED.md` | product authority | root_governance, product_prd | product-authority consistency; explicit approval when required |
| `docs/Website_System_Architecture_v1.0_LOCKED.md`, `docs/SYSTEM_ARCHITECTURE_AMENDMENT_*.md` | architecture authority | root_governance, architecture_manifest, system_architecture | architecture-source consistency |
| `docs/evidence/**` | non-authoritative evidence | authorities governing the behavior being evidenced | evidence integrity; never treat evidence as authority |
| other `docs/**` | documentation | engineering_rules plus the authoritative source governing the documented behavior | documentation/source consistency |
| `CLAUDE.md` | entry-point forwarding | root_governance | must only route to `AGENTS.md` |
| `README.md` | repository documentation | root_governance, engineering_rules | documentation/source consistency |
| `package.json`, `package-lock.json`, `tsconfig.json`, `vite.config.*`, `react-router.config.*`, `vercel.json` | build/runtime configuration | engineering_rules, architecture_manifest, system_architecture | install when dependencies change; lint; typecheck; tests; production build as applicable |
| `.gitignore`, `.dockerignore`, `Dockerfile*` | repository/runtime configuration | engineering_rules, architecture_manifest, system_architecture | affected build/runtime checks |
| `harness/**` | legacy repository harness workpiece | engineering_rules, architecture_manifest, system_architecture | harness-local checks plus repository checks when integration changes |

## Route Composition

For a multi-path task:
1. resolve every affected path independently;
2. take the union of required authoritative sources;
3. take the union of required verification;
4. apply the strictest applicable stop condition;
5. reject the task if any affected path is unresolved.

A task may not broaden its authorized mutation set merely because another routed path is present.

## Repository-Work Readiness

Before a protected mutation, all must be true:
- `AGENTS.md` has been read;
- every affected path resolves through this router;
- applicable authoritative sources have been read;
- the requested gap or required change is established;
- the mutation scope is explicit;
- the verifier/checks are defined;
- the active stop condition is defined;
- no unresolved authority conflict exists;
- the 500-reviewable-line constraint is satisfied or the owner-approved exception exists;
- any requirement-specific approval is present.

No generic predecessor artifact, lifecycle disposition, or external harness verdict is required for ordinary repository work.

## Universal Stop Conditions

Stop and report `BLOCKED` when:
- an affected path has no deterministic route;
- required authority is missing, stale, or conflicts without explicit precedence;
- the requested mutation exceeds its authorized scope;
- required verification cannot be identified;
- a product/security/architecture constraint would be weakened without explicit authorized change;
- a required CI/review/merge gate would be bypassed.

Repository verification establishes technical eligibility only. Merge remains separately user-authorized.

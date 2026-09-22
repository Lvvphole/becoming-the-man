PLAN_READY

# Embedded SDLC Removal and Repository Routing Migration Plan

Status: PLAN_READY
Target repository: Lvvphole/becoming-the-man
Base: 27228b8a81e3cd14b96b2d08bfc578ad12a2e317
Domain: governance

## 1. Goal

Remove completely from active repository architecture and governance the generic seven-stage lifecycle:

```text
Scout -> Plan -> Contract -> Implement -> Verify -> Review -> Release
```

The reusable lifecycle belongs exclusively to a separate external multi-repository SDLC agentic harness.

The target repository retains only deterministic repository navigation and repository-specific authority:

```text
AGENTS.md
  -> CONTEXT.md
  -> deterministic task/path routing
  -> applicable domain instructions
  -> authoritative product/architecture source
  -> work
  -> required verification
```

## 2. Architectural invariants

R1. No active repository governance document requires, routes through, transitions through, or derives authority from 01_scout, 02_plan, 03_contract, 04_implement, 05_verify, 06_review, or 07_release.

R2. AGENTS.md remains the compact root repository authority for precedence, deterministic routing entry, universal engineering constraints, mutation/repair safety, security, repository verification, review/merge requirements, and stop conditions. It does not orchestrate a generic SDLC.

R3. Root CONTEXT.md becomes a pure deterministic task/path router. It resolves domain ownership, governing instructions, authoritative sources, required verification, and prohibitions. It does not resolve workflow stage, predecessor stage, next stage, or lifecycle artifacts.

R4. Routing is mechanical. No semantic similarity, best-fit routing, inferred lifecycle state, authority discovery scans, duplicated routers, or agent-invented fallback routes.

R5. Domain-specific instructions remain local to governed surfaces where needed. Expected routing surfaces include src/**, server/**, api/**, contracts/**, supabase/**, config/**, tests/**, scripts/**, .github/workflows/**, and docs/**.

R6. Product authority survives. Product Specification, System Architecture, architecture amendments, security, provider boundaries, data ownership, Supabase/RLS, API contracts, UI/UX, accessibility, SEO, tests, CI, exact-head verification, change-size controls, Codex review, and user-only merge authority must not be weakened.

R7. Generic lifecycle stages, transitions, admission, artifact promotion, candidate manifests, lifecycle dispositions, generic Plan/Contract/Verify handoffs, and reusable autonomous-agent orchestration belong to the external harness.

## 3. Removal inventory

Before deletion, enumerate active references to the embedded lifecycle, including:
- Scout, Plan, Contract, Implement, Verify, Review, Release when used as lifecycle states;
- 01_scout through 07_release;
- workflow_stage, target_stage, from_stage, to_stage, transition, prior_outputs;
- PLAN_READY, CONTRACT_READY, CANDIDATE_READY;
- G_TRANSITION, stage_id, stage contract, lifecycle.

Classify each occurrence:
- SDLC -> REMOVE.
- ROUTING -> REWRITE into deterministic repository routing.
- PRODUCT -> PRESERVE.
- HISTORICAL -> remove if part of active governance; otherwise make explicitly non-authoritative.

No blind global search-and-replace.

## 4. Remove stages/** as repository architecture

Remove the active generic stage hierarchy:
- stages/01_scout/**
- stages/02_plan/**
- stages/03_contract/**
- stages/04_implement/**
- stages/05_verify/**
- stages/06_review/**
- stages/07_release/**

This includes stage CONTEXT files, transitions, required stage inputs, outputs, stage dispositions, candidate manifests, stage evidence contracts, and lifecycle authority.

Before deletion, migrate any repository-specific requirement to its proper surviving authority.

## 5. Rewrite root CONTEXT.md

Replace the lifecycle route matrix with one deterministic repository router:

```text
task/path -> domain -> governing context -> authoritative sources -> required checks
```

Remove workflow_stage, target_stage, transition.from_stage, transition.to_stage, transition facts, prior-stage admission, stage-specific route IDs, and stage-specific outputs.

Every governed path must resolve deterministically to the applicable domain instructions, authoritative sources, required checks, and stop conditions.

## 6. Simplify AGENTS.md

Remove language whose only purpose is operating the seven-stage lifecycle.

Preserve:
- authority and precedence;
- routing;
- repository invariants;
- engineering constraints;
- mutation and repair rules;
- security;
- verification;
- review;
- merge authority;
- stop conditions.

The resulting execution rule is: read AGENTS.md, route through CONTEXT.md using explicit task/path information, load only applicable authorities, perform bounded work, run prescribed checks, stop on explicit violation.

## 7. Refactor engineering rules

Preserve applicable repository controls including authority root, context router, source presence, change size, review, Pre-Code Readiness, mutation safety, and bug-repair controls.

Remove G_TRANSITION and the seven-stage lifecycle.

Pre-Code Readiness becomes repository-work readiness:
- root authority read;
- deterministic route resolved;
- applicable domain authority read;
- requested gap established;
- mutation scope explicit;
- verifier defined;
- stop condition defined;
- no authority conflict;
- change-size constraint satisfied.

Ordinary product work must not require PLAN_READY or CONTRACT_READY.

## 8. Preserve CI independently of the harness

Do not weaken:
- locked dependency installation;
- <=500 reviewable implementation lines;
- lint;
- typecheck;
- applicable tests;
- production build;
- required SSR regressions;
- exact-head PR Verification;
- applicable domain-specific checks;
- independent Codex review;
- protected-main behavior;
- user-only merge authority.

Website CI is not the external harness lifecycle.

## 9. Active architecture documentation

Inspect the active architecture set:
- docs/Website_System_Architecture_v1.0_LOCKED.md
- docs/SYSTEM_ARCHITECTURE_AMENDMENT_v1.1.md
- docs/SYSTEM_ARCHITECTURE_AMENDMENT_v1.2.md

Remove or supersede only language that makes the seven-stage agent lifecycle part of website architecture. Preserve repository-specific controls, including A18 bounded changes, exact-head CI, Codex review, branch protection, and merge authority.

Distinguish legitimate software/product release concepts from the removed 07_release lifecycle state.

## 10. Skills

Repository skills that exist specifically to implement the seven-stage lifecycle cease being repository lifecycle authority. Useful task-specific skills may remain only as subordinate procedures reached through deterministic repository routing. Generic SDLC skills belong in the external harness.

## 11. Tests and schemas

Remove tests/schemas whose sole purpose is validating the embedded lifecycle. Preserve tests for surviving repository governance.

Deterministic routing verification must prove:
1. governed product paths resolve exactly;
2. unknown governed paths fail closed;
3. routes cannot silently broaden authority;
4. unrelated domain instructions are not required;
5. routing does not depend on SDLC stage;
6. routes do not require lifecycle predecessor artifacts;
7. product verification can be selected without harness availability.

## 12. Anti-drift control

Add a narrow deterministic regression check preventing reintroduction of lifecycle identifiers in active governance, including 01_scout through 07_release, workflow_stage, target_stage, stage_id, PLAN_READY, CONTRACT_READY, and CANDIDATE_READY.

Do not ban ordinary English uses of plan, review, release, or similar product/software terminology.

## 13. External harness interface

The repository may expose a minimal machine-readable interface for an external harness to consume repository authority entry point, routing entry point, permitted commands, required CI, protected paths, verification commands, and repository invariants.

It must not reproduce the external lifecycle.

Dependency direction:

```text
External Harness -> reads/operates on -> Repository
```

Ordinary website development must not require the external harness to be operational.

## 14. Migration increments

Increment 1 — Inventory and frozen removal manifest.
Enumerate every active lifecycle dependency and classify REMOVE / REWRITE / PRESERVE / HISTORICAL. Prove the preserved product/CI authority set before deletion.

Increment 2 — Replacement router.
Establish deterministic path/domain routing without stage semantics. Prove representative frontend, backend, database, API, CI, and documentation tasks resolve correctly.

Increment 3 — Decouple engineering governance.
Rewrite AGENTS.md and engineering rules so readiness, mutation safety, repair controls, and verification work independently of lifecycle stages.

Increment 4 — Remove stage architecture.
Remove stages/**, lifecycle route entries, transition machinery, stage outputs, and generic lifecycle skills only after surviving dependencies have been migrated.

Increment 5 — Architecture/document cleanup.
Remove or supersede remaining seven-stage references throughout active documentation while preserving product and repository-specific requirements.

Increment 6 — Verification and negative controls.
Run routing tests, anti-drift checks, existing website CI, change-size verification, and representative route-resolution fixtures.

Each increment must leave the repository usable. No increment may intentionally make ordinary product development depend on a later harness increment.

## 15. Acceptance tests

Completion requires all of the following:
- a coding agent enters through AGENTS.md;
- AGENTS.md points to exactly one repository router;
- the router does not ask for an SDLC stage;
- product tasks resolve to applicable domain instructions;
- only relevant authoritative sources are loaded;
- no active authority requires Scout -> Plan -> Contract -> Implement -> Verify -> Review -> Release;
- product mutation does not require PLAN_READY or CONTRACT_READY solely because it is product work;
- repository CI does not require external harness availability unless a future explicit product requirement says otherwise;
- website verification, security, exact-head PR Verification, Codex review, and user-only merge authority remain operational;
- an external harness can consume repository instructions without the repository embedding its lifecycle.

## 16. Negative controls

Prove failure when:
- workflow_stage is reintroduced into the root router;
- product work is made dependent on PLAN_READY;
- ordinary website CI is made dependent on an external harness verdict;
- a second repository router is introduced;
- semantic-similarity route selection is introduced;
- legitimate product/architecture authority is deleted during cleanup;
- existing CI is weakened under harness removal;
- external harness operation grants merge authority.

## 17. Definition of Done

The active repository architecture is:

```text
becoming-the-man
├── AGENTS.md                  repository constitution
├── CONTEXT.md                 deterministic path/domain router
├── domain-local instructions  only where required
├── authoritative product/architecture sources
├── application code
├── tests
└── PR Verification
```

It is not an autonomous SDLC framework.

The final audit finds zero active architectural dependencies on the seven-stage lifecycle.

The external multi-repository SDLC harness is the sole architectural home for Scout -> Plan -> Contract -> Implement -> Verify -> Review -> Release.

## 18. Stop conditions

Stop immediately if:
1. a proposed removal weakens a surviving product, architecture, security, CI, review, or merge control;
2. deterministic routing cannot replace a lifecycle dependency without ambiguity;
3. an active requirement cannot be classified safely;
4. a mutation would exceed the approved removal/migration scope;
5. reviewable implementation exceeds the repository limit without prior owner exception;
6. current authority or base binding changes;
7. verification fails without a bounded evidence-backed correction.

No speculative fix-forward.

## 19. Non-authority

This Plan does not authorize weakening product requirements, CI, security, review, branch protection, or merge authority. It does not merge changes. It does not implement the external harness inside this repository.

PLAN_READY

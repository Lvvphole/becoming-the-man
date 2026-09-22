CONTRACT_READY

# Embedded SDLC Removal and Repository Routing Migration Contract

Status: CONTRACT_READY
Base: 27228b8a81e3cd14b96b2d08bfc578ad12a2e317
Approved Plan blob: eba0aa7752560dc891f43aa15682933b7b397df4
Task domain: governance

## 1. Contract objective

Implement only the approved migration that removes the generic seven-stage SDLC from the active architecture and documents of Lvvphole/becoming-the-man and replaces it with deterministic repository task/path routing.

The repository must not own or require:

```text
Scout -> Plan -> Contract -> Implement -> Verify -> Review -> Release
```

The external multi-repository SDLC harness is the sole architectural home for that lifecycle.

## 2. Preserved authority

The migration must preserve without semantic weakening:
- AGENTS.md as root repository authority;
- the locked Product Specification;
- the locked System Architecture except the explicit lifecycle-routing coupling removed by this migration;
- A18-01 bounded implementation changes;
- A18-02 exact-head repository CI;
- A18-03A bounded Codex review;
- A18-04A up-to-date-main behavior;
- A18-05A user-only merge authority and final evidence;
- security, privacy, provider, data, RLS, API, accessibility, SEO, SSR, testing, and product requirements.

No harness verdict may become merge authority.

## 3. Target repository routing contract

The active repository navigation contract is:

```text
AGENTS.md
  -> CONTEXT.md
  -> explicit task/path routing
  -> applicable domain instructions
  -> authoritative product/architecture sources
  -> bounded work
  -> required repository verification
```

Root CONTEXT.md is a router, not an SDLC state machine.

Routing input is explicit affected path(s) plus task domain when needed for disambiguation. Routing may not depend on workflow stage, predecessor artifact, lifecycle disposition, semantic similarity, or best-fit inference.

## 4. Required route domains

The replacement router must cover at least:
- frontend/product UI: src/**;
- backend/domain: server/**;
- API/provider entry points: api/**;
- shared contracts: contracts/**;
- persistence/RLS: supabase/**;
- versioned configuration: config/**;
- tests: tests/** and domain-local tests;
- bounded tooling: scripts/**;
- CI: .github/workflows/**;
- product/architecture documentation: docs/**;
- repository governance: AGENTS.md, CONTEXT.md, references/**, and subordinate routing instructions.

Cross-domain work must resolve by explicit composition of the affected path routes. No agent may invent a composite authority.

## 5. Removal set

The following active lifecycle architecture is removed:
- stages/01_scout/**;
- stages/02_plan/**;
- stages/03_contract/**;
- stages/04_implement/**;
- stages/05_verify/**;
- stages/06_review/**;
- stages/07_release/**;
- lifecycle route matrix and lifecycle envelope fields in root CONTEXT.md;
- lifecycle schema/state fields in contracts/governance-routing-contract.json;
- lifecycle transition predicates in references/engineering/engineering-rules.md;
- generic Plan/Scout lifecycle authority in .claude/skills/plan/** and .claude/skills/scout-agent/** when those files exist only to operate the removed lifecycle.

The final implementation may delete a skill file only when read-only inventory confirms it has no surviving repository-specific procedure that must be migrated.

## 6. Rewrite set

Authorized governance rewrites:
- AGENTS.md: remove stage-contract/prior-stage/lifecycle routing language; preserve universal engineering, security, CI, review, repair, and merge controls.
- CONTEXT.md: replace lifecycle matrix with deterministic path/domain routing.
- references/engineering/engineering-rules.md: remove G_TRANSITION and lifecycle admission; retain repository-work readiness, mutation safety, repair, source, change-size, review, and completion controls.
- references/architecture/CONTEXT.md: change only if required to keep the architecture manifest consistent after the lifecycle removal.
- contracts/governance-routing-contract.json: replace lifecycle schema with deterministic repository routing schema or remove it if the replacement router is fully self-contained and mechanically verifiable without duplicated authority.
- docs/Website_System_Architecture_v1.0_LOCKED.md: replace only lifecycle-coupled task/stage wording; preserve all product/system architecture semantics.
- docs/SYSTEM_ARCHITECTURE_AMENDMENT_v1.1.md and v1.2.md: modify only if an actual lifecycle coupling is found; A18 controls must remain semantically intact.
- README.md and CLAUDE.md: remove lifecycle coupling only if found; CLAUDE.md must remain a pointer to AGENTS.md rather than a second router.
- .github/workflows/pr-verification.yml: change only if current CI makes ordinary product verification depend on the embedded harness/lifecycle. Preserve the product PR Verification minimum from A18-02.

## 7. Historical/evidence boundary

docs/evidence/** is non-authoritative historical/evidence material. Do not rewrite historical evidence merely to erase accurate history. It must not be loaded as current authority or routing input.

Historical stage outputs are removed with stages/** because that directory itself is active lifecycle architecture.

## 8. Repository-work readiness

The surviving readiness predicate is:

```text
root authority read
AND deterministic repository route resolved
AND applicable domain authority read
AND requested gap established
AND mutation scope explicit
AND verifier defined
AND stop condition defined
AND no authority conflict
AND change-size constraint satisfied
AND any requirement-specific approval is present
```

There is no generic PLAN_READY, CONTRACT_READY, CANDIDATE_READY, predecessor-stage, or workflow-stage requirement for ordinary product work.

## 9. Deterministic routing negative controls

The implementation must mechanically reject:
1. unknown governed path with no route;
2. ambiguous path/domain ownership without explicit composition;
3. semantic-similarity/best-fit route selection;
4. workflow_stage, target_stage, stage_id, or predecessor-stage fields as routing authority;
5. PLAN_READY, CONTRACT_READY, or CANDIDATE_READY as generic product-work prerequisites;
6. a second repository router;
7. evidence promoted to requirement/permission/waiver/merge authority;
8. external harness verdict promoted to ordinary product-development or merge authority.

## 10. Positive controls

The implementation must mechanically demonstrate representative routing for:
1. src/** frontend/product task;
2. server/** backend task;
3. api/** provider/API task;
4. supabase/** database/RLS task;
5. contracts/** contract task;
6. .github/workflows/** CI task;
7. docs/** product/architecture documentation task;
8. governance files.

Each fixture must resolve to the minimum applicable authority and verification without an SDLC stage.

## 11. CI contract

Repository CI remains independent of external harness availability.

Required surviving minimum:
1. frozen dependency install;
2. <=500 reviewable implementation line gate;
3. lint;
4. typecheck;
5. unit/smoke tests;
6. production build;
7. meaningful first-response SSR checks for / and /book;
8. additional applicable domain checks.

Exact-head PR Verification remains required.

Independent Codex review remains required after CI is green.

Merge remains separately user-authorized.

## 12. Anti-drift contract

A deterministic repository check must reject reintroduction of lifecycle identifiers in active governance:
- 01_scout through 07_release;
- workflow_stage;
- target_stage;
- stage_id;
- PLAN_READY;
- CONTRACT_READY;
- CANDIDATE_READY;
- lifecycle transition machinery equivalent to the removed state machine.

The check must not reject ordinary English uses of plan, review, release, verify, contract, or similar software/product terminology.

## 13. Candidate path ceiling

The migration may mutate only paths proven by inventory to be lifecycle-coupled and contained in these path families:
- AGENTS.md
- CONTEXT.md
- CLAUDE.md
- README.md
- contracts/governance-routing-contract.json
- references/engineering/engineering-rules.md
- references/architecture/CONTEXT.md
- docs/Website_System_Architecture_v1.0_LOCKED.md
- docs/SYSTEM_ARCHITECTURE_AMENDMENT_v1.1.md
- docs/SYSTEM_ARCHITECTURE_AMENDMENT_v1.2.md
- .claude/skills/plan/**
- .claude/skills/scout-agent/**
- stages/**
- .github/workflows/pr-verification.yml
- repository routing/anti-drift tests or scripts introduced solely to verify this migration.

No product implementation path under src/**, server/**, api/**, supabase/**, config/**, or application contracts may change.

## 14. Increment order

I1 Inventory and replacement-router specification.
I2 Root router replacement plus deterministic route tests.
I3 AGENTS.md and engineering-rules decoupling.
I4 Stage architecture and generic lifecycle-skill removal.
I5 Active architecture/document cleanup and CI decoupling if required.
I6 Full verification and anti-drift audit.

After each mutation, re-evaluate the active stop condition before the next mutation.

## 15. Verification

For each bounded increment:
- inspect exact diff;
- prove only authorized paths/effects changed;
- run the narrowest deterministic routing/governance checks available;
- keep reviewable implementation <=500.

Before merge eligibility:
- run npm ci;
- run repository verify/change-size requirements;
- run all applicable routing/anti-drift tests;
- run exact-head PR Verification;
- obtain required Codex review with zero unresolved actionable findings.

No PASS may be declared from local assertions alone.

## 16. Stop conditions

STOP immediately if:
1. a removal weakens product, architecture, security, CI, review, branch, or merge controls;
2. deterministic routing cannot replace a lifecycle dependency without ambiguity;
3. an active requirement cannot be classified safely;
4. implementation expands outside the candidate path ceiling;
5. product implementation code must change;
6. external harness availability becomes required for ordinary product work;
7. a second router is introduced;
8. reviewable implementation exceeds 500 without prior owner exception;
9. current main/authority/approved Plan binding changes;
10. verification fails without one bounded evidence-backed correction;
11. Codex cycle 3 reports an actionable finding.

Required disposition: stop; do not speculative fix-forward.

## 17. Completion condition

Complete only when a final active-authority audit finds zero architectural dependencies on the seven-stage lifecycle, deterministic path/domain routing is mechanically verifiable, ordinary website development no longer depends on the embedded harness lifecycle, and all preserved repository controls remain active.

CONTRACT_READY

# Implementation Contract — Zero-Trust Repository Harness v1.2 / INC-1

Status: CONTRACT_READY  
Lifecycle stage: 03_contract  
Target stage: 04_implement  
Scope: INC-1 only — shadow routing kernel and compact task contract  
Repository: `Lvvphole/becoming-the-man`

## 1. Frozen authority binding

This contract is subordinate to current `AGENTS.md`, root `CONTEXT.md`, `stages/03_contract/CONTEXT.md`, `references/engineering/engineering-rules.md`, and the exact approved Plan below.

Approved Plan:

- path: `stages/02_plan/output/repo-zero-trust-harness-v1.2-plan.md`
- disposition: `PLAN_READY`
- content SHA-256: `3b8e4438ebf76c75785c460239e3f0ef427a267e6f5fc1e4f7aa96185d8ce80e`
- Git blob: `2e5c4c1cdfe3d0bf76732e109b7a3a5271b3dc06`
- approval: explicit user approval after the artifact was committed
- approved Plan commit: `147d6ba5c07cacac27c26f52197e5f8baac22f51`
- planning base: `807ebb1cfa121afa3e536f00791b7f1da383193f`

One-time bootstrap exception already authorized by the repository owner:

- task domain: `governance`
- Stage 02 Plan location: `stages/02_plan/output/repo-zero-trust-harness-v1.2-plan.md`
- all other current governance and stop conditions remain active

This contract does not broaden that exception.

## 2. INC-1 objective

Build the replacement routing kernel in shadow form without changing the active root router.

INC-1 must prove:

```text
CLAUDE.md -> AGENTS.md -> CONTEXT.md

CONTEXT target router:
  exact path ownership
  + stable requirement IDs
  + exact source mappings
  + exact minimum checks

task contract:
  bounded + immutable + fail closed
```

INC-1 does not implement Eve, AI SDK orchestration, Jev, the external supervisor, sandbox enforcement, provenance, or the final mechanical verifier. Those remain later roadmap increments and are not executable under this contract.

## 3. Exact Stage 04 mutation allowlist

The complete INC-1 candidate path set is exactly:

1. `harness/package.json`
2. `harness/package-lock.json`
3. `harness/tsconfig.json`
4. `harness/src/routing.ts`
5. `harness/tests/routing.test.ts`
6. `harness/fixtures/CONTEXT.target.md`
7. `.github/workflows/pr-verification.yml`

No eighth candidate path is authorized.

Special rule for `.github/workflows/pr-verification.yml`:

- the existing Node 22.16.0 product verification job and all current product verification steps must remain semantically unchanged;
- the only permitted workflow effect is to add a Node 24 harness-verification job and make the existing required `PR Verification` job depend on its success;
- the existing job name `PR Verification` must remain the required merge check identity;
- no product check may be deleted, skipped, weakened, renamed, or moved behind a permissive condition.

Forbidden INC-1 mutations include:

- `AGENTS.md`;
- root `CONTEXT.md`;
- `CLAUDE.md`;
- `references/engineering/engineering-rules.md`;
- `references/architecture/CONTEXT.md`;
- any `stages/*/CONTEXT.md`;
- product source, server, API, database, migration, provider, or product-test files;
- root `package.json` or root `package-lock.json`;
- any architecture or product specification;
- any Stage 05/06/07 record.

A required mutation outside the seven-path allowlist is terminal `BLOCKED`.

## 4. Target routing-table contract

The canonical target router for INC-1 lives only in `harness/fixtures/CONTEXT.target.md`. It is a shadow fixture and does not replace root `CONTEXT.md` in INC-1.

The target Markdown must contain exactly one canonical machine-readable routing table bounded by explicit begin/end markers.

The routing table has these normative registries:

```yaml
version: 1

path_routes:
  <route_id>:
    exact: []        # optional exact file paths
    prefixes: []     # optional directory prefixes
    sources: []
    checks: []

requirements:
  <requirement_id>:
    source: <source_id>
    selector: <exact string>
    checks: []

sources:
  <source_id>:
    path: <repo-relative path>

checks:
  <check_id>:
    argv: [<exact argv tokens>]

protected_paths:
  - CLAUDE.md
  - AGENTS.md
  - CONTEXT.md
```

Normative constraints:

- `version` must equal integer `1`;
- every registry key must be unique after parse;
- path route IDs, requirement IDs, source IDs, and check IDs must be non-empty strings;
- every referenced source/check ID must exist;
- source paths and route path values must be repository-relative;
- no glob, wildcard, semantic fallback, or model-selected route is permitted;
- checks use exact argv arrays, not shell strings.

## 5. Path-routing contract

For each authorized candidate path `p`:

```text
EXACT_MATCHES(p) :=
  path routes whose exact list contains p

PREFIX_MATCHES(p) :=
  path routes whose prefix is a directory-prefix of p
```

Resolution order is fixed:

```text
1. one exact match                         -> owner
2. more than one exact match               -> BLOCKED: AMBIGUOUS_PATH_ROUTE
3. otherwise choose longest prefix length
4. one longest-prefix match                -> owner
5. multiple equal longest-prefix matches   -> BLOCKED: AMBIGUOUS_PATH_ROUTE
6. zero matches                            -> BLOCKED: UNROUTED_PATH
```

A shorter prefix may never override a longer valid prefix.

A model may not choose among collisions.

## 6. Requirement-routing contract

For each task requirement reference `q`:

```text
RESOLVE(q) -> exactly one requirement record
```

Required dispositions:

```text
missing requirement ID
  -> BLOCKED: UNKNOWN_REQUIREMENT

duplicate/ambiguous requirement identity
  -> BLOCKED: AMBIGUOUS_REQUIREMENT

mapped source ID absent
  -> BLOCKED: REQUIREMENT_SOURCE_UNAVAILABLE

source path missing from the supplied trusted source surface
  -> BLOCKED: REQUIREMENT_SOURCE_UNAVAILABLE

one exact requirement -> one exact source + selector
  -> ACCEPT
```

No source or selector may be chosen by semantic similarity.

## 7. Context/check composition contract

For an admitted task:

```text
resolved_path_routes =
  union(owner(p) for p in task.allowed_paths)

resolved_requirements =
  union(resolve(q) for q in task.requirement_refs)

required_sources =
  union(path_route.sources, requirement.source)

minimum_checks =
  union(path_route.checks, requirement.checks)

G_CHECKS_NOT_WEAKENED :=
  minimum_checks subset_of task.required_checks
```

If `G_CHECKS_NOT_WEAKENED = false`:

```text
BLOCKED: MINIMUM_CHECKS_WEAKENED
```

The task may add checks. It may not remove repository-derived minimum checks.

## 8. Compact task-contract schema

INC-1 must validate one immutable task object with exactly these execution semantics:

```yaml
task_id: optional non-empty string
base_sha: required 40-character lowercase hexadecimal Git object ID
goal: required non-empty string
requirement_refs: required unique string array
allowed_paths: required unique non-empty repo-relative path array
allowed_tools: required unique non-empty string array
required_checks: required unique non-empty string array
stop_condition: required non-empty string
```

No unknown execution-authority field may expand capability.

Task validation is deterministic.

Malformed contract:

```text
BLOCKED: TASK_CONTRACT_INVALID
```

Observed repository base unequal to `base_sha`:

```text
BLOCKED: STALE_OR_WRONG_BASE
```

The task goal is descriptive only. It cannot enlarge paths, tools, sources, checks, or authority.

## 9. Frozen bootstrap negative-control oracle

These eight vectors are authority for INC-1 acceptance. They live in this Stage 03 contract, which is outside the Stage 04 candidate allowlist.

The candidate test file may reproduce them but may not redefine their expected outcomes.

| NC | Input defect | Required result |
|---|---|---|
| NC-01 | authorized path has zero path-route owners | `BLOCKED / UNROUTED_PATH` |
| NC-02 | authorized path has two equal-specificity owners | `BLOCKED / AMBIGUOUS_PATH_ROUTE` |
| NC-03 | task references unknown requirement ID | `BLOCKED / UNKNOWN_REQUIREMENT` |
| NC-04 | canonical requirement table contains duplicate/ambiguous identity | `BLOCKED / AMBIGUOUS_REQUIREMENT` |
| NC-05 | requirement maps to absent source / source path unavailable | `BLOCKED / REQUIREMENT_SOURCE_UNAVAILABLE` |
| NC-06 | task omits one repository-derived minimum check | `BLOCKED / MINIMUM_CHECKS_WEAKENED` |
| NC-07 | observed base differs from task `base_sha` | `BLOCKED / STALE_OR_WRONG_BASE` |
| NC-08 | task contract malformed, missing required field, wrong type, duplicate list member, or invalid base SHA | `BLOCKED / TASK_CONTRACT_INVALID` |

For every vector:

- the intended gate must cause the failure;
- an earlier unrelated malformed fixture may not mask the intended gate;
- an exception, crash, or permissive fallback is not an accepted BLOCKED result.

## 10. Independent bootstrap verification rule

The Stage 04 coding agent does not own the authoritative acceptance oracle.

INC-1 acceptance therefore requires both:

1. candidate tests that exercise the routing implementation; and
2. independent verification against the frozen vectors in Section 9 and the immutable path/check rules in this contract.

The independent verifier/reviewer must compare observed candidate behavior against Section 9 directly. A candidate-written test that changes an expected result cannot alter this contract.

The Stage 04 agent may not mutate this contract.

## 11. Harness package contract

INC-1 creates a standalone `harness/` package.

Required properties:

- Node runtime target: Node 24;
- TypeScript strict mode;
- no Eve dependency in INC-1;
- no AI SDK dependency in INC-1;
- no Jev dependency in INC-1;
- no runtime dependency on the website application package;
- no production website import from `harness/`;
- lockfile committed under `harness/package-lock.json`.

The minimal harness dependency set must be limited to what INC-1 routing/typecheck/tests require.

Adding an orchestration, sandbox, policy-engine, database, network, or AI-model dependency in INC-1 is scope expansion and must stop.

## 12. Node 24 harness verification contract

The Node 24 CI job must run, in deterministic order:

```text
npm ci
npm ci --prefix harness
npx eslint harness/src/routing.ts harness/tests/routing.test.ts
npm --prefix harness run typecheck
npm --prefix harness run test
```

The root install is used only to supply the repository's existing ESLint toolchain. The separate `harness/` install supplies its own pinned TypeScript/test toolchain.

The `harness/package.json` scripts must include:

```text
typecheck -> tsc --noEmit
test      -> vitest run
```

No dev server, network call, code generation, or product build is part of the INC-1 harness check.

The existing Node 22.16.0 `PR Verification` product job remains required and unchanged in behavioral coverage.

## 13. Bootstrap workflow integration contract

The workflow modification is accepted only if all are true:

```text
H1 new harness verification runs on Node 24
H2 harness verification must succeed before PR Verification can succeed
H3 existing PR Verification job name remains exactly "PR Verification"
H4 existing Node 22.16.0 product setup remains
H5 every pre-existing product verification step remains semantically unchanged
H6 no failure is converted to continue-on-error
H7 no path filter prevents the required harness job from running on this PR
```

Any false predicate is:

```text
BLOCKED: WORKFLOW_SCOPE_EXPANSION
```

This reason code is an INC-1 bootstrap verifier disposition. It does not alter the current root C4 registry.

## 14. INC-1 implementation discipline

Stage 04 is limited to:

```text
BIND
  -> INSPECT
  -> ONE BOUNDED CANDIDATE
  -> VERIFY
  -> STOP
```

Before the first protected Stage 04 mutation, the executing agent must re-read current:

- `AGENTS.md`;
- root `CONTEXT.md`;
- `stages/04_implement/CONTEXT.md`;
- `references/engineering/engineering-rules.md`;
- `references/architecture/CONTEXT.md`;
- the exact approved Plan;
- this exact contract.

It must then establish `G_PRE_CODE_READY = true`.

After each mutation it must re-check the active stop condition before another mutation.

A failed verification is not blanket authority to fix forward. Another mutation requires materially new diagnostic evidence identifying one bounded correction.

## 15. Reviewable-size contract

For INC-1 implementation lines:

```text
TARGET <= 350
INTERNAL_STOP = 420
ABSOLUTE_CURRENT_REPO_CEILING = 500
```

Rules:

- <=350 is preferred, not a quota;
- 351-419 must be explicitly reported as target overrun;
- at 420 or more before the initial candidate is complete: `STOP -> REDUCE OR REDESIGN`;
- >500 fails current `G_CHANGE_SIZE` absent a separately authorized owner exception;
- generated lockfiles and Markdown follow existing repository counting exclusions.

## 16. INC-1 verification obligations

Before INC-1 can enter Stage 05:

V1. final changed implementation paths are a subset of the exact seven-path allowlist;

V2. active root `CLAUDE.md`, `AGENTS.md`, root `CONTEXT.md`, engineering rules, architecture manifest, product files, and product dependency manifests are unchanged;

V3. all eight Section 9 negative controls produce their exact required dispositions;

V4. positive controls prove exact-file ownership, longest-prefix ownership, valid requirement resolution, source resolution, minimum-check union, and a valid compact task contract;

V5. harness TypeScript typecheck passes;

V6. harness Vitest suite passes with no skipped/todo/disabled INC-1 controls;

V7. harness ESLint check passes using the existing root lint toolchain;

V8. existing Node 22 product verification remains behaviorally unchanged and passes;

V9. Node 24 harness CI succeeds before the required `PR Verification` job succeeds;

V10. exact final head is the head tested by required CI;

V11. implementation reviewable lines remain below the 420 initial-candidate stop threshold and <=500 final ceiling;

V12. no candidate-controlled test expectation contradicts the frozen Section 9 oracle;

V13. no semantic routing, fallback route, composite task-domain matrix, or second active repository router is introduced;

V14. no INC-2 Eve/AI SDK/Jev/sandbox/supervisor/verifier implementation appears in the candidate.

A false obligation stops progression.

## 17. INC-1 stop conditions

Stop immediately on any of the following:

1. active root governance must change;
2. product code or product dependencies must change;
3. an eighth candidate path is required;
4. semantic inference is required for routing;
5. the frozen Section 9 oracle would need to change after Stage 04 begins;
6. a new architectural layer or service becomes necessary;
7. Eve, AI SDK, Jev, sandbox, supervisor, or final-verifier implementation becomes necessary for INC-1;
8. the workflow change would weaken or bypass an existing product check;
9. Node 24 harness verification cannot be added without altering product behavior;
10. initial implementation reaches or projects to 420 reviewable lines;
11. the same failure persists without materially new bounded diagnostic evidence;
12. Plan or contract binding becomes stale;
13. a routed authority changes materially;
14. exact-head CI fails without one bounded evidence-backed correction;
15. review cycle 3 reports an actionable finding.

Required disposition is `BLOCKED`, `REDUCE`, or `REDESIGN` according to the active condition. No silent scope expansion is permitted.

## 18. Explicit non-authority

This contract does not authorize:

- INC-2, INC-3, INC-4, or INC-5 implementation;
- active root router cutover;
- removal of the old stage/domain governance machinery;
- product feature work;
- merge;
- release;
- deployment;
- a change-size exception.

Those require their own later admissible state.

## 19. Stage 03 completeness result

Contract completeness for the approved INC-1 Plan is satisfied only if this artifact contains:

- exact Plan binding;
- exact seven-path mutation allowlist;
- exact target routing schema;
- deterministic path precedence;
- deterministic requirement/source semantics;
- compact task-contract schema;
- exact eight independent negative-control vectors;
- Node 24 verification sequence;
- Node 22 product-verification preservation;
- workflow non-weakening predicates;
- one-bounded-candidate execution discipline;
- 350 target / 420 stop / 500 ceiling;
- explicit stop conditions;
- explicit prohibition on INC-2 authority.

This artifact contains each item above and does not authorize application or harness behavior beyond INC-1.

CONTRACT_READY

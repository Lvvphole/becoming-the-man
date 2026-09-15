PLAN_READY

# INC-1 Implementation Plan - Mechanical Routing Contracts and Verifier

Lifecycle stage: 02_plan
Task domain: governance
Route: route:02_plan:governance
Planning mode: BROWNFIELD
PR: 49
Base SHA: fec5de5f242dc1dba4e007658f3323931f83c193
Planning source head: 51ab1b45e4f98c564023e4a897246614ad8b637b

## 1. Goal

Harden the existing governance-routing verifier so Contracts C1, C2, C4, C6, and C7 are enforced mechanically and fail closed for malformed inputs, unsafe paths, invalid BLOCKED records, route-table collisions, unresolved Layer 3 inputs, stale source bindings, and reviewability-ceiling drift.

The implementation must preserve the existing root routing model. It must not create a second router, infer routes, synthesize composite routes, weaken fail-closed behavior, or change application/product behavior.

## 2. Frozen Outcome Contract

INC-1 must close exactly these six Scout-confirmed verifier gaps:

1. Defensive envelope parsing.
2. Repository-relative path confinement.
3. Strict C4 BLOCKED-record conformance with trusted source lineage.
4. Route-table structure and route_id uniqueness.
5. Layer 3 source resolution, section-policy validation, and source-binding currentness.
6. Positive numeric proof that the active reviewability ceiling is exactly 500 across the seven canonical governance surfaces.

Required implementation footprint:

- scripts/verify-governance-routing.mjs
- tests/governance-routing.test.mjs
- contracts/governance-routing-contract.json

No other implementation file is planned.

## 3. Non-Goals

INC-1 does not authorize:

- edits to AGENTS.md;
- edits to root CONTEXT.md;
- edits to any stages/*/CONTEXT.md;
- edits to architecture specifications or amendments;
- application or product behavior changes;
- database, schema, migration, provider, or API changes;
- package or dependency additions;
- dynamic multi-domain route synthesis;
- a second route table or source router;
- semantic interpretation of section names beyond the existing section-policy contract;
- merge, release, or review authority.

If any non-goal becomes necessary, implementation stops and returns for redesign or new authorization.

## 4. Source and Artifact Binding

Caller-supplied prior-artifact bindings:

- Scout report:
  - path: stages/01_scout/output/scout-report.md
  - disposition: SCOUT_READY
  - SHA-256: 4bd64a1004f4efc105a62c173c230fbee8efe240f17c05f3ff5cf27468a5ba84
  - observed Git blob: 7a0751f99266f00418f840fc2ad74e43b33e42d0
- INC-0 release record:
  - path: stages/07_release/output/release-record.md
  - disposition: RELEASE_ELIGIBLE
  - SHA-256: b559c15f1858c172d86c0f8e20ea587731e4ef2c42786945d4a51051ad6beece
  - observed Git blob: 307532307854f3c9ada1cafab39d17d82fd78450

Planning repository state:

- PR #49 base: fec5de5f242dc1dba4e007658f3323931f83c193
- PR #49 planning head: 51ab1b45e4f98c564023e4a897246614ad8b637b
- current PR diff before this Plan: stages/01_scout/output/scout-report.md only
- implementation-plan.md did not exist before this Stage 02 write

The remote GitHub execution surface has no local staged, unstaged, or untracked working-tree state. The builder must therefore rebind to the exact PR head and exact committed diff before the first Stage 04 mutation. No stale binding may be rewritten and reused.

## 5. Authority and Hard Invariants

The implementation must preserve these invariants:

1. AGENTS.md remains the repository execution constitution.
2. Root CONTEXT.md remains the only task/stage router.
3. Every routing failure is terminal and fail closed.
4. No verifier result may invent a route, source, selector, approval, or source binding.
5. C4 BLOCKED output must be structurally valid before it is treated as governance output.
6. Evidence remains non-authoritative.
7. Repository paths must be exact and repository-relative.
8. Source binding must be current before a successful route result.
9. The active reviewable implementation ceiling remains exactly 500.
10. The implementation PR must remain <= 500 reviewable lines unless the existing owner exception is explicitly authorized.
11. Exact-head PR Verification and independent review remain required after implementation.
12. Merge remains separately user-authorized.

## 6. Obligation and Gap Matrix

| ID | Obligation | Behavior | Verification | Planned closure |
|---|---|---|---|---|
| O1 | Malformed envelope never throws | GAP | GAP | Module 1 plus negative controls |
| O2 | Repository paths are safe and relative | PARTIAL | PARTIAL | Module 2 plus traversal fixtures |
| O3 | Every BLOCKED record is C4-valid | PARTIAL | PARTIAL | Module 3 plus binding/schema fixtures |
| O4 | Route IDs are globally unique | GAP | GAP | Module 4 plus collision fixtures |
| O5 | Layer 3 sources and policies resolve before ROUTE_MATCH | PARTIAL | GAP | Module 5 plus source/policy fixtures |
| O6 | Active 500 ceiling is positively proven | PARTIAL | PARTIAL | Module 6 plus numeric drift fixtures |
| O7 | Existing valid single-domain routing remains intact | SATISFIED | COVERED | Preserve existing positive tests |
| O8 | Undeclared composite routes remain fail closed | SATISFIED | COVERED | Preserve ROUTE_ZERO_MATCH test |
| O9 | Evidence non-authority remains enforced | SATISFIED | COVERED | Preserve current evidence negative tests |
| O10 | Review-cycle and transition controls remain intact | SATISFIED | COVERED | Preserve existing regression tests |

## 7. Deterministic Defect-Code Mapping

No new C4 reason code is introduced by INC-1.

Use this mapping:

| Failure class | Existing C4 reason code |
|---|---|
| envelope is null, undefined, primitive, array, or structurally invalid | TASK_ENVELOPE_REQUIRED |
| required route selector is absent from an otherwise structurally valid envelope | MISSING_SELECTOR |
| wildcard repository path | WILDCARD_INPUT |
| non-wildcard repository path violates repoPath grammar, is absolute, contains a drive prefix, backslash, or parent traversal segment | TASK_ENVELOPE_REQUIRED |
| duplicate route_id or malformed route-table structure | ROUTING_TABLE_INVALID |
| required Layer 3 registry entry or repository source is absent | MISSING_SOURCE |
| source binding is malformed, absent when required, or does not equal observed execution lineage | SOURCE_BINDING_STALE |
| required source section policy is absent or invalid for the selected source | MISSING_SELECTOR |
| selected input is not in the allowed input surface | UNLISTED_INPUT |
| active numeric ceiling differs from 500 | CHANGE_SIZE_DRIFT |

Rationale for invalid non-wildcard paths: repository-path grammar is part of C2 envelope validity. A non-wildcard path that violates that schema makes the task envelope invalid, so TASK_ENVELOPE_REQUIRED is the narrowest registered C4 code without redefining WILDCARD_INPUT.

## 8. Module 1 - Defensive Input Gate

### Objective

Guarantee that untrusted routing input cannot trigger an uncaught runtime exception.

### Planned behavior

Add one validation sequence before any property access or array operation:

1. Validate routing-table text is a string before calling match().
2. Validate envelope is:
   - non-null;
   - typeof "object";
   - not an array.
3. Validate all nine C2 fields exist.
4. Validate required field container types before using them:
   - task_domains: array
   - source_sections: object, non-null, non-array
   - workpiece_paths: array
   - selected_evidence_ids: array
   - prior_outputs: object, non-null, non-array
   - authorized_candidate_paths: array
   - approvals: object, non-null, non-array
   - source_binding: object, non-null, non-array
5. Validate selector-specific presence after structural validation.
6. Only then evaluate route predicates.

### Failure behavior

- malformed or incomplete envelope -> TASK_ENVELOPE_REQUIRED
- missing workflow_stage or task_domains in otherwise valid envelope -> MISSING_SELECTOR
- no thrown TypeError is an accepted terminal state

### Verification

Negative fixtures:

- null
- undefined
- true
- 42
- "string"
- []
- {}
- null array fields
- string array fields
- object array fields
- missing each required C2 key

Oracle: every fixture returns a C4-valid BLOCKED object and no fixture throws.

## 9. Module 2 - Repository Path Confinement

### Objective

Make C2 repoPath semantics executable before any workpiece path is trusted.

### Planned predicate

Introduce a pure isRepoRelativePath(path) predicate equivalent to:

```text
typeof path == "string"
AND path.length > 0
AND path matches ^[A-Za-z0-9._/-]+$
AND path does not start with "/"
AND no path segment equals ".."
AND path contains none of "*", "?", "[", "]"
AND path contains no "\"
AND path does not match a Windows drive prefix
```

Apply it to every element of:

- workpiece_paths
- authorized_candidate_paths

Wildcard failures retain WILDCARD_INPUT. Other repoPath grammar failures use TASK_ENVELOPE_REQUIRED.

### Negative controls

Must fail closed:

- /etc/passwd
- ../secret
- src/../secret
- src/a/../../secret
- C:/secret
- C:\\secret
- src/**
- src/file?.ts
- empty string
- non-string path member

Positive controls must include normal repository-relative files and dotted filenames.

## 10. Module 3 - Strict C4 BLOCKED Schema Enforcement

### Objective

Make C4 structural validity a prerequisite for terminal governance output.

### Trusted-lineage order

The evaluator must distinguish trusted execution context from the untrusted task envelope.

Required order:

```text
trusted execution lineage
-> validate { pr, base, current_head }
-> parse/validate untrusted envelope
-> evaluate gates
-> construct C4 BLOCKED or ROUTE_MATCH
```

### Interface plan

Preserve the current evaluateRoute(table, envelope, options = {}) shape.

Extend options with one explicit trusted lineage field:

```text
options.sourceBinding = {
  pr,
  base,
  current_head
}
```

This avoids a breaking new positional parameter.

makeBlocked() must require a validated binding argument. Remove the sourceBinding = {} fallback.

The implementation must never manufacture:

- PR numbers;
- base SHAs;
- head SHAs;
- placeholder zeros;
- envelope-derived replacements for stale trusted state.

### validateBlocked requirements

Strengthen validateBlocked() so it checks the C4 contract actually relied upon by the verifier:

- exact required top-level fields;
- no unexpected top-level fields;
- status exactly "BLOCKED";
- reason code registered;
- gate_id grammar;
- stage_id registered;
- arrays have correct type and uniqueness where required;
- resolution_required contains at least one non-empty string;
- source_binding has exactly pr, base, current_head;
- pr is integer >= 1;
- base/current_head are 40-character lowercase hex Git OIDs.

### Negative controls

- source_binding {}
- missing pr
- pr = 0
- malformed base
- malformed current_head
- additional source_binding property
- additional BLOCKED property
- empty resolution_required

All must fail C4 validation.

## 11. Module 4 - Route-Table Integrity

### Objective

Validate the canonical C1 route identity surface rather than deprecated registry syntax.

### Planned change

Remove the legacy raw stage_registry duplicate-key check.

After parsing the canonical routing-table JSON:

1. prove table is a non-null object;
2. prove routes is a non-empty array;
3. prove source_registry is a non-null object;
4. validate every route object before dereference;
5. collect table.routes[*].route_id;
6. reject any duplicate route_id with ROUTING_TABLE_INVALID.

Route identity collision and route matching remain distinct:

- duplicate route_id -> ROUTING_TABLE_INVALID
- multiple distinct valid route rows matching the same envelope -> ROUTE_MULTI_MATCH

### Negative controls

- duplicate route ID, identical selector
- duplicate route ID, different selector
- missing route_id
- route is null
- routes is not an array
- source_registry missing
- two distinct route IDs deliberately matching one envelope -> ROUTE_MULTI_MATCH

## 12. Module 5 - Layer 3 Resolution Pipeline

### Objective

Do not return ROUTE_MATCH until every required Layer 3 input is resolved under its declared policy and current source lineage.

### Resolution sequence

For each route.required_layer3_bundle source ID:

1. Confirm the source ID exists exactly once in source_registry.
2. Validate source metadata shape:
   - kind = "layer3"
   - location is "repository" or "task_context"
   - path conforms to declared location rules
   - section_policy is "full" or "explicit_selector_required"
3. For location = "repository":
   - path must be repository-relative;
   - exact file must exist through the deterministic source loader;
   - missing file -> MISSING_SOURCE.
4. For location = "task_context":
   - require exact caller-supplied routed material;
   - do not search the repository or infer a substitute.
5. Validate envelope.source_sections[sourceId].
6. For section_policy = "full":
   - selector must equal exactly ["*"].
7. For section_policy = "explicit_selector_required":
   - selector must be a non-empty unique string array;
   - selector must not contain "*".
8. Validate trusted source binding before success.
9. Only after all required sources pass may the route return ROUTE_MATCH.

### Deterministic source loader

Keep the verifier testable and side-effect free by injecting the exact already-loaded source surface through options rather than allowing repository discovery.

Planned interface:

```text
options.files = {
  "exact/repository/path": "exact file contents"
}
```

The verifier may test exact key presence. It may not list directories, glob, scan docs, or discover alternate files.

This satisfies file-existence verification for the explicitly loaded repository surface while preserving G_NO_DISCOVERY_WILDCARDS.

### Source currentness

options.sourceBinding is trusted execution lineage.

envelope.source_binding must be structurally valid and must equal the trusted execution lineage before ROUTE_MATCH.

Mismatch -> SOURCE_BINDING_STALE.

No automatic rebinding is permitted.

### Approval preservation

While modifying the closed route predicate, also enforce every route.predicate.required_approval_facts entry as strictly true. This is already part of C1 and must not remain an unenforced branch of MATCH(E,r).

## 13. Module 6 - Positive Numeric 500-LOC Verification

### Objective

Prove equality to 500 instead of blacklisting known incorrect text.

### Canonical seven-source set

The numeric invariant is checked across exactly:

1. AGENTS.md
2. references/engineering/engineering-rules.md
3. references/architecture/CONTEXT.md
4. docs/Website_System_Architecture_v1.0_LOCKED.md
5. docs/SYSTEM_ARCHITECTURE_AMENDMENT_v1.1.md
6. docs/SYSTEM_ARCHITECTURE_AMENDMENT_v1.2.md
7. scripts/check-change-size.sh

### Contract representation

Update contracts/governance-routing-contract.json only as needed to declare:

- expected active reviewable limit = 500;
- exact seven-source allowlist used by the verifier.

Remove forbidden_drift_tokens as the acceptance oracle. Token blacklisting may not substitute for positive equality.

### Extraction strategy

Use structured parsing where available and anchored numeric extraction elsewhere.

1. references/architecture/CONTEXT.md:
   - parse the JSON object inside ARCHITECTURE_MANIFEST_BEGIN/END;
   - require active_reviewable_loc_limit === 500.
2. scripts/check-change-size.sh:
   - anchored regex for ^MAX_LINES=([0-9]+)$;
   - require numeric value === 500.
3. references/engineering/engineering-rules.md:
   - anchored extraction from reviewable_lines <= N;
   - require N === 500.
4. docs/SYSTEM_ARCHITECTURE_AMENDMENT_v1.1.md:
   - anchored extraction from A18-01 "no more than N reviewable implementation lines";
   - require N === 500.
5. docs/SYSTEM_ARCHITECTURE_AMENDMENT_v1.2.md:
   - anchored extraction from the explicit N-line reviewability-limit preservation statement;
   - require N === 500.
6. AGENTS.md:
   - anchored extraction from the active Micro-PR ceiling and Change & Review Gates statements;
   - require every extracted active ceiling value === 500.
7. docs/Website_System_Architecture_v1.0_LOCKED.md:
   - anchored extraction from the active authority/source-basis reviewability-ceiling statement;
   - require the numeric value === 500.

Missing expected anchor is itself drift and must return CHANGE_SIZE_DRIFT.

### Numeric negative controls

For each extraction class, fixture substitutions must prove:

- 499 -> BLOCKED / CHANGE_SIZE_DRIFT
- 500 -> PASS
- 501 -> BLOCKED / CHANGE_SIZE_DRIFT
- 600 -> BLOCKED / CHANGE_SIZE_DRIFT
- 1000 -> BLOCKED / CHANGE_SIZE_DRIFT

The oracle is numeric equality, not presence or absence of "1,000".

## 14. Test Matrix

| Test ID | Fixture | Expected result |
|---|---|---|
| T01 | null envelope | BLOCKED / TASK_ENVELOPE_REQUIRED |
| T02 | undefined envelope | BLOCKED / TASK_ENVELOPE_REQUIRED |
| T03 | primitive envelope | BLOCKED / TASK_ENVELOPE_REQUIRED |
| T04 | array envelope | BLOCKED / TASK_ENVELOPE_REQUIRED |
| T05 | missing workflow_stage | BLOCKED / MISSING_SELECTOR |
| T06 | missing non-selector C2 field | BLOCKED / TASK_ENVELOPE_REQUIRED |
| T07 | workpiece_paths wrong type | BLOCKED / TASK_ENVELOPE_REQUIRED |
| T08 | /etc/passwd | BLOCKED / TASK_ENVELOPE_REQUIRED |
| T09 | ../secret | BLOCKED / TASK_ENVELOPE_REQUIRED |
| T10 | src/../secret | BLOCKED / TASK_ENVELOPE_REQUIRED |
| T11 | C:/secret | BLOCKED / TASK_ENVELOPE_REQUIRED |
| T12 | src/** | BLOCKED / WILDCARD_INPUT |
| T13 | source_binding {} | C4 invalid / no successful route |
| T14 | malformed trusted binding | no successful route |
| T15 | stale envelope binding | BLOCKED / SOURCE_BINDING_STALE |
| T16 | duplicate route_id | BLOCKED / ROUTING_TABLE_INVALID |
| T17 | distinct route collision | BLOCKED / ROUTE_MULTI_MATCH |
| T18 | required Layer 3 source registry entry absent | BLOCKED / MISSING_SOURCE |
| T19 | required repository source file absent from exact source surface | BLOCKED / MISSING_SOURCE |
| T20 | full source selector not ["*"] | BLOCKED / MISSING_SELECTOR |
| T21 | explicit selector contains "*" | BLOCKED / MISSING_SELECTOR |
| T22 | required approval false | route must not match |
| T23 | seven canonical ceiling values all 500 | PASS |
| T24 | ceiling fixture 499 | BLOCKED / CHANGE_SIZE_DRIFT |
| T25 | ceiling fixture 501 | BLOCKED / CHANGE_SIZE_DRIFT |
| T26 | ceiling fixture 600 | BLOCKED / CHANGE_SIZE_DRIFT |
| T27 | ceiling fixture 1000 | BLOCKED / CHANGE_SIZE_DRIFT |
| T28 | existing valid governance route | ROUTE_MATCH preserved |
| T29 | undeclared cross-domain envelope | BLOCKED / ROUTE_ZERO_MATCH preserved |
| T30 | existing evidence, transition, and review-cycle regressions | preserved PASS |

Every negative control must fail for the intended predicate, not because an earlier unrelated fixture is malformed.

## 15. Reviewable Footprint Budget

Implementation budget against the INC-1 merge base:

| Workpiece | Target delta |
|---|---:|
| scripts/verify-governance-routing.mjs | 110-145 |
| tests/governance-routing.test.mjs | 150-175 |
| contracts/governance-routing-contract.json | 25-45 |
| Total target | 285-365 |

Hard planning controls:

- target: <= 380 reviewable lines;
- internal stop threshold: 420 reviewable lines;
- absolute G_CHANGE_SIZE ceiling: 500 reviewable lines;
- reserved repair margin at the internal threshold: >= 80 lines.

If the projected or actual implementation diff exceeds 420 reviewable lines before the candidate is complete:

```text
STOP -> REDUCE OR REDESIGN
```

Do not consume the reserved repair margin merely to finish the initial implementation.

The Stage 02 Markdown Plan itself is documentation and is not part of the implementation-line budget under AGENTS.md.

## 16. Definition of Done

INC-1 is implementation-complete only when all of the following are mechanically demonstrated on the exact candidate head:

D1. Null, undefined, primitive, array, and malformed envelopes return structured failures and never escape as uncaught runtime TypeErrors.

D2. Every workpiece_paths and authorized_candidate_paths member is proven repository-relative before route evaluation can succeed.

D3. Wildcards fail with WILDCARD_INPUT and non-wildcard repoPath schema violations fail with TASK_ENVELOPE_REQUIRED.

D4. Every emitted BLOCKED record used as governance output is C4-conformant and contains a validated trusted source_binding with pr, base, and current_head. No {} binding fallback remains.

D5. Duplicate table.routes[*].route_id values fail with ROUTING_TABLE_INVALID. Legacy stage_registry collision logic is removed.

D6. ROUTE_MULTI_MATCH remains reserved for multiple distinct valid route rows matching one envelope.

D7. Every required Layer 3 source resolves through the exact routed source surface before ROUTE_MATCH.

D8. section_policy = "full" accepts exactly ["*"]; explicit_selector_required requires a non-empty explicit selector and rejects "*".

D9. Envelope source_binding must equal trusted execution lineage before ROUTE_MATCH; mismatch fails with SOURCE_BINDING_STALE.

D10. Required approval facts are enforced as strictly true.

D11. The active reviewability value is positively extracted and proven equal to 500 across all seven canonical governance sources.

D12. Numeric fixtures 499, 501, 600, and 1000 fail with CHANGE_SIZE_DRIFT; 500 passes.

D13. Existing valid routing, fail-closed undeclared composite routing, evidence controls, transition controls, review-cycle controls, and stage-contract tests remain green.

D14. No application, product, database, provider, root-governance, architecture-specification, package, or dependency behavior changes.

D15. npm run verify completes successfully on the exact implementation head.

D16. npm run verify:change-size -- fec5de5f242dc1dba4e007658f3323931f83c193 reports <= 500 reviewable implementation lines, with the planned target <= 380 and internal stop threshold 420.

D17. The candidate mutation set is confined to:
- scripts/verify-governance-routing.mjs
- tests/governance-routing.test.mjs
- contracts/governance-routing-contract.json

D18. Exact-head PR Verification succeeds before Stage 06 review.

D19. Independent review completes under the existing maximum-three-cycle convergence rule with zero unresolved actionable findings before release eligibility.

## 17. Implementation Increments

### INC-1A - Input, path, lineage, and C4 boundary

Obligations:
- O1
- O2
- O3

Authorized implementation files:
- scripts/verify-governance-routing.mjs
- tests/governance-routing.test.mjs
- contracts/governance-routing-contract.json only if needed for declared contract metadata

Action:
- add defensive input validation;
- add isRepoRelativePath;
- introduce trusted options.sourceBinding;
- remove {} binding fallback;
- strengthen validateBlocked;
- add focused negative controls.

Verification:
- run the governance-routing Vitest file;
- run lint for changed verifier/test surface;
- evaluate current change-size count.

Stop:
- any required root-governance change;
- new C4 reason code required;
- projected total > 420 lines;
- same failure persists without materially new evidence.

### INC-1B - Route-table integrity and Layer 3 resolution

Obligations:
- O4
- O5

Files:
- scripts/verify-governance-routing.mjs
- tests/governance-routing.test.mjs

Action:
- remove stage_registry collision oracle;
- validate route objects and global route_id uniqueness;
- enforce exact Layer 3 source resolution using options.files;
- enforce section policies;
- enforce source-binding equality;
- enforce strict required approval facts.

Verification:
- focused route collision tests;
- missing-source and selector-policy negative controls;
- existing positive route tests;
- current change-size gate.

Stop:
- requires repository discovery/globbing;
- requires changing root CONTEXT.md;
- requires inventing scoped-section semantics;
- projected total > 420 lines.

### INC-1C - Positive numeric 500 invariant

Obligations:
- O6

Files:
- scripts/verify-governance-routing.mjs
- tests/governance-routing.test.mjs
- contracts/governance-routing-contract.json

Action:
- replace token-blacklist acceptance logic with positive expected-limit and seven-source declarations;
- implement structured/anchored numeric extraction;
- add 499/500/501/600/1000 controls.

Verification:
- focused governance snapshot tests;
- full governance-routing suite;
- npm run verify;
- npm run verify:change-size -- fec5de5f242dc1dba4e007658f3323931f83c193.

Stop:
- any source cannot be validated without changing its normative text;
- extraction requires broad fuzzy parsing rather than deterministic anchors;
- candidate exceeds 420 lines before verification;
- full verification exposes a new defect class requiring scope expansion.

## 18. Verification Order

Implementation must use this order:

1. focused negative control for the obligation being implemented;
2. focused governance-routing test file;
3. lint/typecheck as applicable to the changed surface;
4. full npm run verify;
5. npm run verify:change-size -- fec5de5f242dc1dba4e007658f3323931f83c193;
6. exact-head PR Verification;
7. Stage 05 independent verification;
8. Stage 06 independent review under the three-cycle cap.

No green build alone is sufficient.

## 19. Stage 04 Pre-Code Readiness Requirements

Before the first implementation mutation, Stage 04 must re-read and bind:

1. current AGENTS.md;
2. current root CONTEXT.md;
3. stages/04_implement/CONTEXT.md;
4. current references/engineering/engineering-rules.md;
5. current references/architecture/CONTEXT.md;
6. the approved exact PLAN_READY artifact;
7. the Stage 03 implementation contract;
8. the then-current PR base/head and authorized candidate paths.

G_PRE_CODE_READY must be true before any script, test, or contract mutation.

## 20. Stop Conditions

Return BLOCKED, REDUCE, or REDESIGN rather than fix forward when any of these occurs:

1. root CONTEXT.md must change;
2. AGENTS.md must change;
3. any stages/*/CONTEXT.md must change;
4. architecture source text must change merely to make the verifier pass;
5. a new package or external dependency appears necessary;
6. a new C4 reason code appears necessary;
7. an additional implementation path outside the three planned workpieces appears necessary;
8. a scoped-section semantic grammar must be invented;
9. exact trusted source lineage cannot be supplied without using untrusted envelope data;
10. the implementation reaches or projects above 420 reviewable lines before completion;
11. the same failure remains and no materially new bounded diagnostic evidence exists;
12. a significant new defect class is exposed by the same mechanism;
13. the PR base/head or approved Plan binding becomes stale;
14. exact-head CI fails without a bounded evidence-backed correction;
15. review cycle 3 reports any actionable finding.

## 21. Stage 03 Contract Handoff

Stage 03 must freeze only the implementation contracts necessary to execute this Plan:

- trusted verifier execution-context shape;
- malformed-envelope classification;
- repoPath predicate and defect-code mapping;
- C4 source-binding construction and validation;
- route_id uniqueness semantics;
- exact Layer 3 source-resolution interface;
- section-policy predicates;
- source-binding equality predicate;
- exact seven-source 500-ceiling declaration and extraction oracles;
- exact three-file Stage 04 mutation allowlist;
- exact verifier/test obligations;
- 420 internal stop threshold and 500 absolute ceiling.

Stage 03 must not expand the implementation scope or change root routing semantics.

## 22. Stage 02 Disposition

This Plan defines one bounded, deterministic implementation path, maps every Scout-confirmed gap to a mechanical verifier, preserves existing authority, and contains explicit stop conditions and reviewability limits.

PLAN_READY

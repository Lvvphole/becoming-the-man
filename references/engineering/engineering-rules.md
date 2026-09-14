# Mathematical Engineering Rules

Status: INTERNAL LAYER 3 GOVERNANCE REFERENCE
Authority: subordinate to `AGENTS.md` and the unique route selected by root `CONTEXT.md`.
Purpose: express repository engineering governance as deterministic, fail-closed predicates.

## 1. Core State Model

For caller/prior-stage task envelope `E` and canonical route set `Routes`:

```text
M(E) := { r in Routes | predicate_r(E) = true }
G_ROUTE_UNIQUE(E) := |M(E)| = 1

G_REQUIRED_INPUTS := RequiredInputs subset_of LoadedInputs
G_ALLOWED_INPUTS := LoadedInputs subset_of AllowedInputs

G_SOURCE_PRESENT :=
  every RoutedSource exists
  AND every required source binding equals the observed source identity

G_EVIDENCE_NONAUTH :=
  no Requirement has source_kind = evidence
  AND no Permission has source_kind = evidence
  AND no Waiver has source_kind = evidence
  AND no TransitionAuthority has source_kind = evidence

G_EVIDENCE_CURRENT(e,s) := binding(e) = identity(s)

G_TRANSITION :=
  predecessor_disposition_satisfies_transition = true
  AND every required_transition_fact = true
  AND every required_human_gate = true

G_CHANGE_SIZE :=
  reviewable_lines <= 500
  OR owner_exception_exactly_verified = true

G_REVIEW :=
  exact_head_PR_Verification = PASS
  AND unresolved_actionable_findings = 0
  AND review_cycle <= 3
```

Every required predicate is binary. False returns `BLOCKED`. No model judgment may convert false to true.

## 2. Authority Invariants

```text
G_AUTHORITY_ROOT := root_authority = "AGENTS.md"
G_CONTEXT_ROUTER := task_stage_router = "CONTEXT.md"
G_NO_PARALLEL_AUTHORITY := no subordinate source claims precedence over AGENTS.md
```

Authority chain:

```text
CLAUDE.md -> AGENTS.md -> CONTEXT.md -> one stage CONTEXT.md -> exact routed Layer 3 references
```

Plans, contracts, schemas, tests, skills, implementation files, and evidence are subordinate.

## 3. C4 BLOCKED Record

A failed gate emits exactly one terminal C4 record containing:

```json
{
  "status": "BLOCKED",
  "reason_code": "STABLE_MACHINE_CODE",
  "gate_id": "G_*",
  "stage_id": "NN_stage",
  "route_candidates": [],
  "missing_inputs": [],
  "conflicts": [],
  "source_binding": {},
  "resolution_required": []
}
```

The record reports state. It does not authorize a repair or transition.

## 4. Input and Source Gates

A stage may load only:

1. `AGENTS.md`;
2. root `CONTEXT.md`;
3. its selected stage `CONTEXT.md`;
4. exact Layer 3 sources in the unique route;
5. exact Layer 4 inputs explicitly allowed by the route and envelope;
6. exact prior-stage outputs;
7. exact workpiece paths.

```text
G_NO_DISCOVERY_WILDCARDS :=
  no repository path uses *, **, ?, [, or ] for discovery
```

The literal `["*"]` is permitted only as a full-document section selector for a source whose route declares `section_policy = "full"`. It is never a file path.

Unknown, missing, stale, or unlisted input returns `BLOCKED`.

## 5. Evidence Gates

`docs/evidence/**` is Layer 4 proof only.

Evidence may establish what happened, what was observed, or what was proven. It may not define what must be built, what is allowed, a waiver, route selection, transition authority, or merge authority.

Historical or stale evidence cannot satisfy a current-state gate.

## 6. Pre-Code Readiness Gate

Before creating or modifying code, tests, schemas, migrations, build logic, workflow logic, or harness/verifier logic, every predicate below must be true:

```text
G_PC_01_AGENTS_READ :=
  current AGENTS.md was read

G_PC_02_ROUTE_SELECTED :=
  G_ROUTE_UNIQUE(E) = true

G_PC_03_STAGE_READ :=
  selected stage CONTEXT.md was read

G_PC_04_ENGINEERING_RULES_READ :=
  this routed engineering-rules document was read

G_PC_05_REQUIRED_AUTHORITIES_READ :=
  every Layer 3 source required by the unique route was read at the routed scope

G_PC_06_GAP_VERIFIED :=
  the exact defect, gap, or DoD remainder is supported by repository state

G_PC_07_SCOPE_EXACT :=
  proposed changed paths and effects are inside the explicit authorization

G_PC_08_VERIFIER_DEFINED :=
  every obligation has a deterministic verifier or explicit BLOCKED condition

G_PC_09_STOP_DEFINED :=
  the next mutation has a named stop condition

G_PC_10_NO_UNRESOLVED_CONFLICT :=
  no unresolved conflict exists among AGENTS.md, the unique route, and routed Layer 3 sources

G_PC_11_500_LOC :=
  G_CHANGE_SIZE = true

G_PC_12_PLAN_APPROVAL :=
  when Plan approval is required, the exact PLAN_READY artifact has explicit user approval

G_PRE_CODE_READY :=
  G_PC_01 AND G_PC_02 AND G_PC_03 AND G_PC_04
  AND G_PC_05 AND G_PC_06 AND G_PC_07 AND G_PC_08
  AND G_PC_09 AND G_PC_10 AND G_PC_11 AND G_PC_12
```

If `G_PRE_CODE_READY = false`, protected mutation is unauthorized.

## 7. Mutation Gate

Before every repository mutation, state:

- verified defect or gap;
- governing rule;
- required evidence;
- exact permitted next action;
- stop condition.

```text
G_MUTATION_AUTHORIZED(m) :=
  path(m) in PermittedPaths
  AND effect(m) in PermittedEffects
  AND every RequiredPrecondition(m) = true
```

After every mutation, re-evaluate the active stop condition before another mutation.

If governance requires `STOP`, `BLOCKED`, `REDUCE`, `REDESIGN`, or new evidence/authorization, stop. No speculative fix-forward is permitted.

## 8. Change-Size Gate

Reviewable implementation lines are additions plus deletions from merge base to final PR head, using the exclusions defined by `AGENTS.md` and `scripts/check-change-size.sh`.

The active ceiling is 500. A subordinate source that states a different active ceiling is governance drift.

## 9. Bug-Repair Gate

```text
observable violated contract
-> routed authoritative requirement
-> reproducible failing evidence when reproducible
-> smallest coherent repair
-> exact verifier
-> stop
```

```text
G_REPAIR :=
  violated_contract_identified
  AND routed_non_evidence_authority_identified
  AND reproducible_failure_evidence_present_when_reproducible
  AND repair_scope_does_not_expand_contract
  AND exact_verifier_defined
```

A second repair attempt requires materially new diagnostic evidence identifying one bounded correction.

## 10. Lifecycle Transition Gate

Canonical lifecycle:

```text
01_scout -> 02_plan -> 03_contract -> 04_implement -> 05_verify -> 06_review -> 07_release
```

Admission requires `G_TRANSITION = true`.

- Scout -> Plan: valid Scout handoff plus original pre-authorization.
- Plan -> Contract: PLAN_READY plus explicit user approval and current plan binding.
- Contract -> Implement: CONTRACT_READY plus current approved Plan binding and readiness.
- Implement -> Verify: valid candidate manifest plus clear stop condition.
- Verify -> Review: PASS plus exact-state binding.
- Review -> Release: `G_REVIEW = true`.
- Release -> Merge: never automatic.

## 11. Review and Completion Gate

If review cycle 3 reports an actionable finding, return `BLOCKED`. No repair or fourth cycle occurs without new explicit user authorization.

`G_REVIEW = true` creates review eligibility only. Merge always requires separate explicit user authorization.

No implementation agent may self-declare final PASS, completion, release eligibility, or merge readiness without the exact external evidence required by the active stage.

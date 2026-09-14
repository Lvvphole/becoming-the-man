# Mathematical Engineering Rules

Status: INTERNAL GOVERNANCE REFERENCE
Authority: subordinate to `AGENTS.md` and the active route selected by root `CONTEXT.md`.
Purpose: convert repository engineering governance into deterministic, fail-closed gates.
Scope: construction, repair, verification, review, and release work in this repository.

## 1. Binary outcome model

Every required gate evaluates to exactly one boolean result.

```text
TRUE  -> the gated transition may continue.
FALSE -> stop and emit BLOCKED.
```

No model judgment may convert FALSE to TRUE. No evidence artifact, skill, test result, CI result, or implementation state may waive a FALSE gate unless `AGENTS.md` or an explicit user-authorized exception defines that waiver.

For task envelope `E` and route set `R`:

```text
M(E) = { r in R | predicate_r(E) = TRUE }
G_ROUTE_UNIQUE(E) := |M(E)| = 1
```

If `G_ROUTE_UNIQUE(E) = FALSE`, execution stops. The agent must not select a likely route.

## 2. BLOCKED record

A blocked gate must produce a JSON record with these semantic fields:

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

The record reports state. It does not authorize the resolution.

## 3. Authority gate

Repository authority is single-rooted:

```text
CLAUDE.md -> AGENTS.md -> CONTEXT.md -> one stage CONTEXT.md -> exact routed references
```

`AGENTS.md` is the repository execution constitution.

All routed specifications, architecture documents, engineering rules, skills, contracts, schemas, tests, plans, and evidence are subordinate to `AGENTS.md`.

```text
G_AUTHORITY_ROOT := root_authority = "AGENTS.md"
G_NO_PARALLEL_AUTHORITY := no subordinate source claims precedence over AGENTS.md
G_CONTEXT_ROUTER := task_stage_router = "CONTEXT.md"
```

Any false authority gate is BLOCKED.

## 4. Context-loading gate

A stage may load only:

1. `AGENTS.md`;
2. root `CONTEXT.md`;
3. its own stage `CONTEXT.md`;
4. exact Layer 3 sources enumerated by the selected route;
5. exact Layer 4 evidence IDs enumerated by the evidence index and selected route;
6. exact prior-stage outputs declared by the selected route.

Let `L` be loaded inputs and `A` the selected route's allowed inputs:

```text
G_ALLOWED_INPUTS := L subset_of A
G_REQUIRED_INPUTS := required_inputs subset_of L
G_NO_DISCOVERY_WILDCARDS := no route input uses *, **, glob discovery, or directory-wide preload
```

A missing required input or an unlisted loaded input is BLOCKED.

## 5. Source-presence and identity gate

Every routed source must exist at the path declared by the route.

When a route or stage requires an exact revision, SHA, run ID, schema version, or other state binding, the observed identity must equal that binding.

```text
G_SOURCE_PRESENT := all(routed_source.exists)
G_SOURCE_BOUND := all(required_binding == observed_binding)
```

Missing or mismatched required identity is BLOCKED.

## 6. Evidence non-authority gate

`docs/evidence/**` is Layer 4 evidence only.

Evidence may establish:

- what happened;
- what was observed;
- what was proven;
- whether a current-state gate has supporting proof.

Evidence may not establish:

- what must be built;
- what behavior is required;
- what action is permitted;
- what authority applies;
- a waiver;
- transition authority;
- merge authority.

```text
G_EVIDENCE_NONAUTH :=
  no(requirement.source_kind = "evidence") AND
  no(permission.source_kind = "evidence") AND
  no(waiver.source_kind = "evidence") AND
  no(transition_authority.source_kind = "evidence")
```

If false, BLOCKED.

For evidence item `e` and relevant state `s`:

```text
G_EVIDENCE_CURRENT(e,s) := binding(e) = identity(s)
```

Unbound or mismatched evidence is historical only and cannot satisfy a current gate.

## 7. Pre-Code Readiness Gate

This gate is mandatory before any action that creates or modifies code, tests, schemas, migrations, build logic, workflow logic, or harness/verifier logic.

All predicates must be TRUE:

```text
G_PC_01_AGENTS_READ
  := current AGENTS.md was read before mutation.

G_PC_02_ROUTE_SELECTED
  := G_ROUTE_UNIQUE(task_envelope) = TRUE.

G_PC_03_STAGE_READ
  := selected stage CONTEXT.md was read.

G_PC_04_ENGINEERING_RULES_READ
  := this document was read from the path routed by CONTEXT.md.

G_PC_05_REQUIRED_AUTHORITIES_READ
  := every Layer 3 authority required by the selected route was read at the routed scope.

G_PC_06_GAP_VERIFIED
  := the exact defect/gap or DoD remainder is supported by repository evidence.

G_PC_07_SCOPE_EXACT
  := proposed changed paths and effects are within the explicitly authorized scope.

G_PC_08_VERIFIER_DEFINED
  := each planned obligation has a deterministic verifier or an explicit BLOCKED condition.

G_PC_09_STOP_DEFINED
  := the next mutation has a named stop condition.

G_PC_10_NO_UNRESOLVED_CONFLICT
  := there is no unresolved conflict among AGENTS.md, the selected route, and routed Layer 3 authorities.

G_PC_11_500_LOC
  := projected reviewable implementation lines <= 500
     OR a valid owner-approved exception is already authorized.

G_PC_12_PLAN_APPROVAL
  := when the workflow requires Plan approval, the exact PLAN_READY artifact is explicitly user-approved.

G_PRE_CODE_READY :=
  G_PC_01 AND G_PC_02 AND G_PC_03 AND G_PC_04 AND
  G_PC_05 AND G_PC_06 AND G_PC_07 AND G_PC_08 AND
  G_PC_09 AND G_PC_10 AND G_PC_11 AND G_PC_12
```

If `G_PRE_CODE_READY = FALSE`, code/test/schema/migration/build/workflow/harness mutation is unauthorized and execution must return BLOCKED.

## 8. Mutation gate

Before every repository mutation, the executing agent must state:

- verified defect/gap;
- governing rule;
- required evidence;
- permitted next action;
- stop condition.

For mutation `m`:

```text
G_MUTATION_AUTHORIZED(m) :=
  path(m) in permitted_paths AND
  effect(m) in permitted_effects AND
  required_preconditions(m) = TRUE
```

After every mutation, re-evaluate the active stop condition before another mutation.

If the stop condition is met, or new evidence requires STOP, BLOCKED, REDUCE, REDESIGN, or a new authorization, no fix-forward mutation is permitted.

## 9. Change-size gate

Reviewable implementation lines are additions plus deletions from merge base to final PR head, with exclusions defined by `AGENTS.md`.

```text
G_CHANGE_SIZE :=
  reviewable_lines <= 500
  OR owner_exception_exactly_verified = TRUE
```

The active limit is 500. A subordinate source that states a different active limit is governance drift and blocks implementation until reconciled.

## 10. Bug-repair gate

Repair route:

```text
observable violated contract
-> routed authoritative requirement
-> reproducible failing evidence when reproducible
-> smallest coherent repair
-> exact verifier
-> stop
```

Required predicates:

```text
G_REPAIR_CONTRACT := violated observable contract is identified
G_REPAIR_AUTHORITY := requirement source is routed and non-evidence
G_REPAIR_REPRO := reproducible defect has failing baseline evidence
G_REPAIR_SCOPE := proposed repair does not expand beyond violated contract
G_REPAIR_VERIFIER := deterministic verifier is defined
```

Any false required repair predicate is BLOCKED.

A second repair attempt is permitted only when materially new diagnostic evidence identifies a specific bounded correction. Speculative fix-forward is forbidden.

## 11. Transition gate

Canonical workflow:

```text
01_scout -> 02_plan -> 03_contract -> 04_implement -> 05_verify -> 06_review -> 07_release
```

Transition predicates:

```text
Scout -> Plan:
  scout_handoff_valid AND original_user_request_pre_authorized_plan

Plan -> Contract:
  plan_disposition = PLAN_READY AND explicit_user_approval = TRUE

Contract -> Implement:
  contract_valid AND approved_plan_binding_current AND G_PRE_CODE_READY = TRUE

Implement -> Verify:
  candidate_manifest_valid AND implementation_stop_condition_clear

Verify -> Review:
  verification_disposition = PASS AND evidence_binding = exact_candidate_state

Review -> Release:
  exact_head_CI = PASS AND unresolved_actionable_findings = 0 AND review_cycle <= 3

Release -> Merge:
  NEVER automatic
```

Merge requires separate explicit user authorization.

A skill cannot perform a workflow-stage transition by invoking another skill. Sequential handoff occurs through the root router/orchestrator.

## 12. Verification and review gates

```text
G_EXACT_HEAD_CI := required_PR_Verification = PASS on exact final head SHA

G_REVIEW_CYCLE :=
  review_cycle <= 3

G_REVIEW_CLEAR :=
  unresolved_actionable_findings = 0

G_MERGE_ELIGIBLE :=
  G_EXACT_HEAD_CI AND G_REVIEW_CYCLE AND G_REVIEW_CLEAR
```

`G_MERGE_ELIGIBLE` creates eligibility only. It does not create merge authority.

If cycle 3 reports an actionable finding, return BLOCKED. No repair or fourth review cycle may occur without new explicit user authorization.

## 13. Completion rule

No agent may declare PASS, complete, merge-ready, or accepted from self-report.

A stage may report only its own disposition and evidence.

Final technical eligibility requires exact-head required CI and independent review state. Merge remains a separate user action.

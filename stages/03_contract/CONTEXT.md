# Stage 03 — Contract

```yaml
stage_id: 03_contract
job: freeze exact implementation and verification contracts from an approved PLAN_READY artifact
required_inputs:
  - AGENTS.md
  - CONTEXT.md
  - stages/03_contract/CONTEXT.md
  - route.approved_plan
allowed_layer3:
  - references/engineering/engineering-rules.md
  - route.selected_layer3
allowed_layer4:
  - route.approved_plan
  - route.selected_evidence_ids
permitted_mutations:
  - stages/03_contract/output/implementation-contract.md
forbidden_mutations:
  - application_code
  - tests
  - source_schemas
  - migrations
  - build_logic
  - workflow_logic
  - harness_logic
  - docs/evidence
required_verifier: contract-completeness
success_disposition: CONTRACT_READY
blocked_disposition: BLOCKED
primary_output: stages/03_contract/output/implementation-contract.md
next_stage: 04_implement
human_gate: none_after_exact_plan_approval
```

## Contract

This stage translates the exact approved Plan into closed implementation contracts. It does not enlarge the Plan.

Required contract classes when applicable:

- authorized changed-path set;
- required behavior/DoD obligations;
- route-table/task-envelope shape;
- state-transition rules;
- machine-readable error/BLOCKED record shape;
- source-binding requirements;
- evidence-index shape;
- verifier IDs and expected oracles;
- recovery boundaries;
- per-mutation stop conditions.

The Contract stage may describe source schemas and interfaces required by the approved Plan, but it may not create or modify runtime schema/code/configuration files.

## Transition to Implement

Contract -> Implement is allowed only when:

```text
approved_plan_binding_current = TRUE
AND contract_complete = TRUE
AND contract_scope subset_of approved_plan_scope
AND G_PRE_CODE_READY = TRUE
```

The Implement stage must recompute the Pre-Code Readiness Gate before its first code/test/schema/migration/build/workflow/harness mutation.

## BLOCKED

Return the standard BLOCKED JSON record when:

- the approved Plan binding is absent or stale;
- the requested contract would expand Plan scope;
- a required verifier or oracle cannot be defined;
- a path/effect cannot be classified as permitted or forbidden;
- a required source is missing;
- authority conflicts remain;
- any Pre-Code Readiness predicate required for the next stage is false.

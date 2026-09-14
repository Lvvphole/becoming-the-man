# Stage 04 — Implement

```yaml
stage_id: 04_implement
job: produce the bounded candidate defined by the approved plan and implementation contract
required_inputs:
  - AGENTS.md
  - CONTEXT.md
  - stages/04_implement/CONTEXT.md
  - route.approved_plan
  - route.implementation_contract
allowed_layer3:
  - references/engineering/engineering-rules.md
  - route.selected_layer3
allowed_layer4:
  - route.approved_plan
  - route.implementation_contract
  - route.selected_evidence_ids
permitted_mutations:
  - route.authorized_candidate_paths
  - stages/04_implement/output/candidate-manifest.md
  - stages/04_implement/output/raw-logs/
forbidden_mutations:
  - docs/evidence
  - governance_outside_authorized_candidate_paths
  - merge
  - review_records
  - release_records
required_verifier: implementation-contract-conformance
success_disposition: CANDIDATE_READY
blocked_disposition: BLOCKED
primary_output: stages/04_implement/output/candidate-manifest.md
next_stage: 05_verify
human_gate: none_after_contract_ready
```

## Admission

Before the first code, test, schema, migration, build, workflow, or harness/verifier mutation:

```text
G_PRE_CODE_READY = TRUE
AND approved_plan_binding_current = TRUE
AND implementation_contract_binding_current = TRUE
AND authorized_candidate_paths are exact
```

The Implement agent does not choose or broaden the route, task domain, authority bundle, changed-path set, verifier, or completion criteria.

## Mutation discipline

For every mutation:

1. state the verified gap;
2. state the governing rule;
3. state required evidence;
4. state the exact permitted mutation;
5. state the stop condition;
6. mutate once;
7. re-evaluate the stop condition before another mutation.

Unexpected state, new conflicts, scope expansion, or a required REDUCE/REDESIGN signal stops implementation.

Raw implementation logs are working artifacts only. They are not acceptance evidence.

## Success transition

Implement -> Verify requires:

```text
candidate_manifest_valid = TRUE
AND actual_changed_paths subset_of authorized_candidate_paths
AND active_stop_condition_clear = TRUE
```

No implementation self-report can produce PASS.

## BLOCKED

Return the standard BLOCKED JSON record when:

- `G_PRE_CODE_READY` is false;
- an actual change falls outside the exact authorized path set;
- the approved Plan or Contract binding drifts;
- a required authority/reference changes materially;
- the same failure remains without materially new diagnostic evidence;
- the change requires an unapproved exception;
- a stop condition is met.

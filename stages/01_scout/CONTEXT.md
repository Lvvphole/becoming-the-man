# Stage 01 - scout

```yaml
stage_id: 01_scout
job: establish repository truth and one evidence-backed next path
required_inputs:
  - AGENTS.md
  - CONTEXT.md
  - stages/01_scout/CONTEXT.md
allowed_layer3:
  - references/engineering/engineering-rules.md
  - route.selected_layer3
allowed_layer4:
  - route.selected_evidence_ids
  - user_supplied_task_material
permitted_mutations:
  - none
forbidden_mutations:
  - repository_files
  - git_state
  - external_system_state
  - evidence_files
required_verifier: scout-report-structure
success_disposition: SCOUT_READY
blocked_disposition: BLOCKED
primary_output: stages/01_scout/output/scout-report.md
next_stage: 02_plan
human_gate: original_request_must_pre_authorize_plan_for_automatic_handoff
```

## Inputs

- `AGENTS.md`
- `CONTEXT.md`
- `stages/01_scout/CONTEXT.md`

## Allowed Layer 3 References

- `references/engineering/engineering-rules.md`
- `route.selected_layer3`

## Allowed Layer 4 Evidence and Working Inputs

- `route.selected_evidence_ids`
- `user_supplied_task_material`

Evidence remains non-authoritative under `G_EVIDENCE_NONAUTH`.

## Permitted Mutations

- `none`

A symbolic `route.*` mutation entry is valid only when the selected route resolves it to an exact allowlist.

## Forbidden Mutations

- `repository_files`
- `git_state`
- `external_system_state`
- `evidence_files`

## Verifier

Required verifier: `scout-report-structure`.

The verifier establishes only this stage's disposition. It cannot grant merge authority.

## Transition

Scout -> Plan requires a valid Scout report, exactly one selected path, and original user pre-authorization for Plan.

The transition is evaluated only from caller/prior-stage facts and current source bindings. Missing or false required facts fail closed.

## BLOCKED Conditions

- required authority is missing.
- scope or next path is non-unique.
- a required source is unavailable.
- Scout would require a mutation.
- an input is not explicitly routed.

Every terminal failure emits a C4-conformant `BLOCKED` record and stops the current envelope.

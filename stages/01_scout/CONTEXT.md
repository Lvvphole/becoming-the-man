# Stage 01 — Scout

```yaml
stage_id: 01_scout
job: establish repository truth and select one evidence-backed next path
required_inputs:
  - AGENTS.md
  - CONTEXT.md
  - stages/01_scout/CONTEXT.md
allowed_layer3:
  - references/engineering/engineering-rules.md#authority-gate
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
primary_output: stages/01_scout/output/scout-report.md
next_stage: 02_plan
human_gate: original_request_must_pre_authorize_plan_for_automatic_handoff
```

## Contract

Scout is read-only. It establishes the requested outcome contract, repository truth, verified gaps, constraints, and one selected next path.

The repository skill `.claude/skills/scout-agent/SKILL.md` may be loaded only when the root route explicitly selects this stage. The skill remains subordinate to this contract and may not invoke another skill.

## Success transition

Scout -> Plan is allowed only when:

```text
scout_report_valid = TRUE
AND selected_path_count = 1
AND original_user_request_pre_authorized_plan = TRUE
```

Otherwise Scout stops after its report.

## BLOCKED

Return the standard BLOCKED JSON record when:

- required authority is missing;
- the requested scope cannot be uniquely determined;
- evidence supports more than one unresolved next path;
- a required source is unavailable;
- completing Scout would require a mutation;
- the route requests an input not explicitly allowed here.

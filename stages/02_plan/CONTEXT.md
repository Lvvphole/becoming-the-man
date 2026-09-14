# Stage 02 — Plan

```yaml
stage_id: 02_plan
job: convert one selected Scout/user path into the smallest sufficient verifiable implementation plan
required_inputs:
  - AGENTS.md
  - CONTEXT.md
  - stages/02_plan/CONTEXT.md
  - route.selected_scout_or_user_handoff
allowed_layer3:
  - references/engineering/engineering-rules.md
  - route.selected_layer3
allowed_layer4:
  - route.selected_evidence_ids
  - route.selected_scout_or_user_handoff
permitted_mutations:
  - stages/02_plan/output/implementation-plan.md
forbidden_mutations:
  - application_code
  - tests
  - schemas
  - migrations
  - build_logic
  - harness_logic
  - docs/evidence
required_verifier: plan-skill-contract
success_disposition: PLAN_READY
blocked_disposition: PLAN_BLOCKED
primary_output: stages/02_plan/output/implementation-plan.md
next_stage: 03_contract
human_gate: explicit_user_approval_of_exact_PLAN_READY
```

## Contract

The repository skill `.claude/skills/plan/SKILL.md` may be loaded only when the root route explicitly selects this stage.

Plan may create exactly one planning artifact. It may not implement, test, configure, review, accept, or merge.

The plan freezes:

- goal;
- observable Definition of Done;
- authorized scope and non-goals;
- selected path;
- obligations;
- verifiers;
- increments;
- stop conditions;
- source binding.

Repository beliefs remain falsifiable and must be verified before they are used.

## Success transition

Plan -> Contract requires:

```text
plan_disposition = PLAN_READY
AND explicit_user_approval_of_exact_plan = TRUE
AND plan_binding_current = TRUE
```

No PLAN_READY artifact grants construction authority by itself.

## BLOCKED

Return PLAN_BLOCKED / the standard BLOCKED record when:

- the selected path is absent;
- goal, DoD, or authorized scope is absent;
- governing authorities conflict without deterministic precedence;
- a material design choice cannot be resolved without inventing a priority;
- a blocking unknown remains;
- repository evidence invalidates the selected path;
- the plan would require an unauthorized mutation.

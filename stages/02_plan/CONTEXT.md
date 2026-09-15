# Stage 02 - plan

```yaml
stage_id: 02_plan
job: convert one selected path into the smallest sufficient verifiable implementation plan
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
blocked_disposition: BLOCKED
primary_output: stages/02_plan/output/implementation-plan.md
next_stage: 03_contract
human_gate: explicit_user_approval_of_exact_PLAN_READY
```

## Inputs

- `AGENTS.md`
- `CONTEXT.md`
- `stages/02_plan/CONTEXT.md`
- `route.selected_scout_or_user_handoff`

## Allowed Layer 3 References

- `references/engineering/engineering-rules.md`
- `route.selected_layer3`

## Allowed Layer 4 Evidence and Working Inputs

- `route.selected_evidence_ids`
- `route.selected_scout_or_user_handoff`

Evidence remains non-authoritative under `G_EVIDENCE_NONAUTH`.

## Permitted Mutations

- `stages/02_plan/output/implementation-plan.md`

A symbolic `route.*` mutation entry is valid only when the selected route resolves it to an exact allowlist.

## Forbidden Mutations

- `application_code`
- `tests`
- `schemas`
- `migrations`
- `build_logic`
- `harness_logic`
- `docs/evidence`

## Verifier

Required verifier: `plan-skill-contract`.

The verifier establishes only this stage's disposition. It cannot grant merge authority.

## Transition

Plan -> Contract requires PLAN_READY, current plan binding, and explicit user approval of the exact Plan artifact.

The transition is evaluated only from caller/prior-stage facts and current source bindings. Missing or false required facts fail closed.

## BLOCKED Conditions

- selected path is absent.
- goal, DoD, or authorized scope is absent.
- governing sources conflict without deterministic precedence.
- a blocking unknown remains.
- planning requires an unauthorized mutation.

Every terminal failure emits a C4-conformant `BLOCKED` record and stops the current envelope.

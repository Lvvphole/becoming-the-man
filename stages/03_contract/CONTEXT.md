# Stage 03 - contract

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

## Inputs

- `AGENTS.md`
- `CONTEXT.md`
- `stages/03_contract/CONTEXT.md`
- `route.approved_plan`

## Allowed Layer 3 References

- `references/engineering/engineering-rules.md`
- `route.selected_layer3`

## Allowed Layer 4 Evidence and Working Inputs

- `route.approved_plan`
- `route.selected_evidence_ids`

Evidence remains non-authoritative under `G_EVIDENCE_NONAUTH`.

## Permitted Mutations

- `stages/03_contract/output/implementation-contract.md`

A symbolic `route.*` mutation entry is valid only when the selected route resolves it to an exact allowlist.

## Forbidden Mutations

- `application_code`
- `tests`
- `source_schemas`
- `migrations`
- `build_logic`
- `workflow_logic`
- `harness_logic`
- `docs/evidence`

## Verifier

Required verifier: `contract-completeness`.

The verifier establishes only this stage's disposition. It cannot grant merge authority.

## Transition

Contract -> Implement requires complete contract, current approved Plan binding, exact authorized paths, and G_PRE_CODE_READY before the first protected mutation.

The transition is evaluated only from caller/prior-stage facts and current source bindings. Missing or false required facts fail closed.

## BLOCKED Conditions

- approved Plan binding is absent or stale.
- contract expands Plan scope.
- required verifier or oracle is undefined.
- required source is missing.
- authority conflict remains.
- next-stage readiness is false.

Every terminal failure emits a C4-conformant `BLOCKED` record and stops the current envelope.

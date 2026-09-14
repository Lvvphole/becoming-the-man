# Stage 04 - implement

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

## Inputs

- `AGENTS.md`
- `CONTEXT.md`
- `stages/04_implement/CONTEXT.md`
- `route.approved_plan`
- `route.implementation_contract`

## Allowed Layer 3 References

- `references/engineering/engineering-rules.md`
- `route.selected_layer3`

## Allowed Layer 4 Evidence and Working Inputs

- `route.approved_plan`
- `route.implementation_contract`
- `route.selected_evidence_ids`

Evidence remains non-authoritative under `G_EVIDENCE_NONAUTH`.

## Permitted Mutations

- `route.authorized_candidate_paths`
- `stages/04_implement/output/candidate-manifest.md`
- `stages/04_implement/output/raw-logs/`

A symbolic `route.*` mutation entry is valid only when the selected route resolves it to an exact allowlist.

## Forbidden Mutations

- `docs/evidence`
- `governance_outside_authorized_candidate_paths`
- `merge`
- `review_records`
- `release_records`

## Verifier

Required verifier: `implementation-contract-conformance`.

The verifier establishes only this stage's disposition. It cannot grant merge authority.

## Transition

Implement -> Verify requires a valid candidate manifest, actual changes confined to the authorized path set, and a clear active stop condition.

The transition is evaluated only from caller/prior-stage facts and current source bindings. Missing or false required facts fail closed.

## BLOCKED Conditions

- G_PRE_CODE_READY is false.
- a change falls outside the authorized path set.
- Plan or Contract binding drifts.
- a routed authority changes materially.
- an exception is required but not authorized.
- a stop condition is met.

Every terminal failure emits a C4-conformant `BLOCKED` record and stops the current envelope.

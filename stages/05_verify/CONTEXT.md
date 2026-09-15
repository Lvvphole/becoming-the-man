# Stage 05 - verify

```yaml
stage_id: 05_verify
job: independently evaluate the frozen candidate against exact required verifiers
required_inputs:
  - AGENTS.md
  - CONTEXT.md
  - stages/05_verify/CONTEXT.md
  - route.approved_plan
  - route.implementation_contract
  - route.candidate_manifest
allowed_layer3:
  - references/engineering/engineering-rules.md
  - route.selected_layer3
allowed_layer4:
  - route.approved_plan
  - route.implementation_contract
  - route.candidate_manifest
  - route.selected_evidence_ids
permitted_mutations:
  - stages/05_verify/output/verification-record.md
  - route.verification_evidence_paths
forbidden_mutations:
  - candidate_files
  - implementation_contract
  - approved_plan
  - governance
  - merge
required_verifier: route.required_verifier_ids
success_disposition: PASS
blocked_disposition: BLOCKED
primary_output: stages/05_verify/output/verification-record.md
next_stage: 06_review
human_gate: none_when_disposition_PASS
```

## Inputs

- `AGENTS.md`
- `CONTEXT.md`
- `stages/05_verify/CONTEXT.md`
- `route.approved_plan`
- `route.implementation_contract`
- `route.candidate_manifest`

## Allowed Layer 3 References

- `references/engineering/engineering-rules.md`
- `route.selected_layer3`

## Allowed Layer 4 Evidence and Working Inputs

- `route.approved_plan`
- `route.implementation_contract`
- `route.candidate_manifest`
- `route.selected_evidence_ids`

Evidence remains non-authoritative under `G_EVIDENCE_NONAUTH`.

## Permitted Mutations

- `stages/05_verify/output/verification-record.md`
- `route.verification_evidence_paths`

A symbolic `route.*` mutation entry is valid only when the selected route resolves it to an exact allowlist.

## Forbidden Mutations

- `candidate_files`
- `implementation_contract`
- `approved_plan`
- `governance`
- `merge`

## Verifier

Required verifier: `route.required_verifier_ids`.

The verifier establishes only this stage's disposition. It cannot grant merge authority.

## Transition

Verify -> Review requires PASS, complete required verifier set, and exact candidate-state binding.

The transition is evaluated only from caller/prior-stage facts and current source bindings. Missing or false required facts fail closed.

## BLOCKED Conditions

- required verifier identity is absent or ambiguous.
- candidate changes after verification begins.
- required source is stale or missing.
- evidence cannot bind to the exact candidate.
- verification requires an unauthorized mutation.

Every terminal failure emits a C4-conformant `BLOCKED` record and stops the current envelope.

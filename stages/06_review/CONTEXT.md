# Stage 06 - review

```yaml
stage_id: 06_review
job: independently review the exact verified implementation state
required_inputs:
  - AGENTS.md
  - CONTEXT.md
  - stages/06_review/CONTEXT.md
  - route.approved_plan
  - route.implementation_contract
  - route.candidate_manifest
  - route.verification_record
allowed_layer3:
  - references/engineering/engineering-rules.md
  - references/architecture/CONTEXT.md
  - route.selected_layer3
allowed_layer4:
  - route.approved_plan
  - route.implementation_contract
  - route.candidate_manifest
  - route.verification_record
  - route.selected_evidence_ids
permitted_mutations:
  - stages/06_review/output/review-record.md
forbidden_mutations:
  - candidate_files
  - verification_record
  - governance
  - merge
required_verifier: independent-codex-review
success_disposition: REVIEW_CLEAR
blocked_disposition: BLOCKED
primary_output: stages/06_review/output/review-record.md
next_stage: 07_release
human_gate: none_when_review_clear
```

## Inputs

- `AGENTS.md`
- `CONTEXT.md`
- `stages/06_review/CONTEXT.md`
- `route.approved_plan`
- `route.implementation_contract`
- `route.candidate_manifest`
- `route.verification_record`

## Allowed Layer 3 References

- `references/engineering/engineering-rules.md`
- `references/architecture/CONTEXT.md`
- `route.selected_layer3`

## Allowed Layer 4 Evidence and Working Inputs

- `route.approved_plan`
- `route.implementation_contract`
- `route.candidate_manifest`
- `route.verification_record`
- `route.selected_evidence_ids`

Evidence remains non-authoritative under `G_EVIDENCE_NONAUTH`.

## Permitted Mutations

- `stages/06_review/output/review-record.md`

A symbolic `route.*` mutation entry is valid only when the selected route resolves it to an exact allowlist.

## Forbidden Mutations

- `candidate_files`
- `verification_record`
- `governance`
- `merge`

## Verifier

Required verifier: `independent-codex-review`.

The verifier establishes only this stage's disposition. It cannot grant merge authority.

## Transition

Review -> Release requires exact-head CI PASS, REVIEW_CLEAR, zero unresolved actionable findings, and review cycle <= 3.

The transition is evaluated only from caller/prior-stage facts and current source bindings. Missing or false required facts fail closed.

## BLOCKED Conditions

- required exact-head CI is absent, stale, or failing.
- review target differs from verified candidate.
- review cycle exceeds 3.
- cycle 3 has an actionable finding.
- an implementation repair is attempted inside Review.

Every terminal failure emits a C4-conformant `BLOCKED` record and stops the current envelope.

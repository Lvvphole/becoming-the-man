# Stage 07 - release

```yaml
stage_id: 07_release
job: bind verified and reviewed exact-head state into a release eligibility record
required_inputs:
  - AGENTS.md
  - CONTEXT.md
  - stages/07_release/CONTEXT.md
  - route.approved_plan
  - route.implementation_contract
  - route.candidate_manifest
  - route.verification_record
  - route.review_record
allowed_layer3:
  - references/engineering/engineering-rules.md
  - references/architecture/CONTEXT.md
  - route.selected_layer3
allowed_layer4:
  - route.approved_plan
  - route.implementation_contract
  - route.candidate_manifest
  - route.verification_record
  - route.review_record
  - route.selected_evidence_ids
permitted_mutations:
  - stages/07_release/output/release-record.md
  - route.release_evidence_paths
forbidden_mutations:
  - candidate_files
  - implementation_contract
  - approved_plan
  - governance
  - merge
required_verifier: release-binding-completeness
success_disposition: RELEASE_ELIGIBLE
blocked_disposition: BLOCKED
primary_output: stages/07_release/output/release-record.md
next_stage: none
human_gate: explicit_user_merge_authorization
```

## Inputs

- `AGENTS.md`
- `CONTEXT.md`
- `stages/07_release/CONTEXT.md`
- `route.approved_plan`
- `route.implementation_contract`
- `route.candidate_manifest`
- `route.verification_record`
- `route.review_record`

## Allowed Layer 3 References

- `references/engineering/engineering-rules.md`
- `references/architecture/CONTEXT.md`
- `route.selected_layer3`

## Allowed Layer 4 Evidence and Working Inputs

- `route.approved_plan`
- `route.implementation_contract`
- `route.candidate_manifest`
- `route.verification_record`
- `route.review_record`
- `route.selected_evidence_ids`

Evidence remains non-authoritative under `G_EVIDENCE_NONAUTH`.

## Permitted Mutations

- `stages/07_release/output/release-record.md`
- `route.release_evidence_paths`

A symbolic `route.*` mutation entry is valid only when the selected route resolves it to an exact allowlist.

## Forbidden Mutations

- `candidate_files`
- `implementation_contract`
- `approved_plan`
- `governance`
- `merge`

## Verifier

Required verifier: `release-binding-completeness`.

The verifier establishes only this stage's disposition. It cannot grant merge authority.

## Transition

Release records technical eligibility only. There is no automatic Release -> Merge transition; merge requires a separate explicit user instruction.

The transition is evaluated only from caller/prior-stage facts and current source bindings. Missing or false required facts fail closed.

## BLOCKED Conditions

- required final binding is absent or stale.
- exact-head CI is not PASS.
- review is not clear.
- an actionable finding remains.
- candidate state changed after verification or review.
- merge is attempted without separate user authorization.

Every terminal failure emits a C4-conformant `BLOCKED` record and stops the current envelope.

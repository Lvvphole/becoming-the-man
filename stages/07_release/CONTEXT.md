# Stage 07 — Release

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
failure_dispositions:
  - BLOCKED
primary_output: stages/07_release/output/release-record.md
next_stage: none
human_gate: explicit_user_merge_authorization
```

## Contract

Release records technical eligibility. It does not deploy, merge, or reinterpret prior evidence.

Required bindings:

- final head SHA;
- reviewable change-size result;
- exact-head PR Verification result;
- final Codex review state;
- review cycle number;
- any carried-forward review and its diff-equivalence proof;
- approved Plan identity;
- implementation Contract identity;
- candidate identity.

Every current-state proof must bind to the same release candidate state.

## Eligibility

```text
RELEASE_ELIGIBLE :=
  exact_head_CI = PASS
  AND review_disposition = REVIEW_CLEAR
  AND unresolved_actionable_findings = 0
  AND review_cycle <= 3
  AND all_required_bindings_current = TRUE
```

`RELEASE_ELIGIBLE` is not merge authorization.

## Merge boundary

There is no automatic Release -> Merge transition.

Merge requires a separate explicit user instruction after the release record exists and remains current.

## BLOCKED

Return the standard BLOCKED JSON record when:

- any required final binding is absent or stale;
- exact-head CI is not PASS;
- review is not clear;
- an actionable finding remains;
- candidate state changed after verification/review;
- release evidence refers to different candidate states;
- merge is attempted without separate explicit user authorization.

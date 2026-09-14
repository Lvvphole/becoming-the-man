# Stage 06 — Review

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
failure_dispositions:
  - REVIEW_ACTION_REQUIRED
  - BLOCKED
primary_output: stages/06_review/output/review-record.md
next_stage: 07_release
human_gate: none_when_review_clear
```

## Admission

Review begins only when:

```text
verification_disposition = PASS
AND verification_binding = exact_reviewed_candidate
AND required_PR_Verification = PASS_on_exact_head
```

The review stage cannot repair implementation. A valid actionable finding returns control to the appropriate earlier stage only through the root router and within the existing review-cycle authorization.

## Review-cycle gate

```text
G_REVIEW_CYCLE := cycle_number <= 3
G_REVIEW_CLEAR := unresolved_actionable_findings = 0
```

If cycle 3 reports an actionable finding, return BLOCKED. No repair and no fourth review cycle is authorized without new explicit user direction.

A pure update-to-main refresh may preserve an earlier review only when the active architecture rule for effective reviewable-diff equivalence is mechanically demonstrated. Fresh exact-head CI is still required.

## Success transition

Review -> Release requires:

```text
review_disposition = REVIEW_CLEAR
AND unresolved_actionable_findings = 0
AND exact_head_CI = PASS
```

Review creates technical review eligibility only. It never grants merge authority.

## BLOCKED

Return the standard BLOCKED JSON record when:

- required exact-head CI is absent, stale, or failing;
- review is requested against a different candidate state;
- review cycle exceeds the authorized bound;
- cycle 3 has an actionable finding;
- review equivalence after main refresh cannot be proven;
- an attempted repair would occur inside Review.

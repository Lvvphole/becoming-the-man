# Stage 05 — Verify

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
failure_dispositions:
  - FAIL
  - BLOCKED
primary_output: stages/05_verify/output/verification-record.md
next_stage: 06_review
human_gate: none_when_disposition_PASS
```

## Contract

Verify operates on a frozen candidate. It may execute only verifier IDs selected by the route/Contract. It may not edit the candidate to make verification pass.

Verification evidence must bind to the exact relevant candidate/head/run identity. Evidence from another state is historical.

## Verdicts

```text
PASS :=
  every required verifier executed
  AND every required verifier passed
  AND evidence bindings equal the candidate state

FAIL :=
  required verifier executed and demonstrated candidate nonconformance

BLOCKED :=
  a prerequisite, authority, verifier, source, or trustworthy state binding is unavailable
```

FAIL and BLOCKED are distinct. Missing prerequisites never become PASS or FAIL by inference.

## Success transition

Verify -> Review requires:

```text
verification_disposition = PASS
AND exact_state_binding = TRUE
AND required_verifier_set_complete = TRUE
```

## BLOCKED

Return the standard BLOCKED JSON record when:

- required verifier identity is absent or ambiguous;
- the candidate changed after verification began;
- a required source is stale or missing;
- evidence cannot be bound to the exact candidate/head/run;
- executing the verifier would require an unauthorized mutation;
- a route attempts to use historical evidence as current proof.

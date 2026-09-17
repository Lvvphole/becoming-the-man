# Stage 04 Candidate Manifest - INC-1 Review-Repair Cycle 1

Artifact disposition: IMPLEMENTATION_CANDIDATE_READY
Stage lifecycle disposition: CANDIDATE_READY
Stage: 04_implement
PR: 49
Merge base: fec5de5f242dc1dba4e007658f3323931f83c193
Repaired implementation head: 6d76708366a4c639aff0420c7c38c25120456d0d
Verified PR Verification run: 35235473249

## Candidate Lineage

This manifest binds the repaired INC-1 implementation to:

- PR #49
- base fec5de5f242dc1dba4e007658f3323931f83c193
- repaired implementation head 6d76708366a4c639aff0420c7c38c25120456d0d
- approved Plan SHA-256 9d26be5ca0fd8bcc19ea6fdf30bfcd2899b5570fa9eb87ef5758dc87ebd511a7
- amended implementation Contract SHA-256 103bedc0ff12b717dc58a13bd8b736fea13cf8bc84f1c8d228329b5550d2f10c
- exact-head PR Verification run 35235473249

Run 35235473249 completed with conclusion success on exact head 6d76708366a4c639aff0420c7c38c25120456d0d.

## Implementation Workpiece Attestation

The reviewable implementation mutation surface is exactly:

1. contracts/governance-routing-contract.json
2. scripts/verify-governance-routing.mjs
3. tests/governance-routing.test.mjs

No application source, package manifest, dependency lockfile, root CONTEXT.md, AGENTS.md, stage CONTEXT file, architecture source, CI workflow, database schema, migration, review record, or release record is part of the implementation workpiece set.

## Reviewable Change-Size Evidence

Exact-head PR Verification run 35235473249 executed the repository change-size gate against the PR base and reported:

```text
Reviewable implementation lines: 349 / 500 across 3 counted files.
PASS: implementation change is within the 500-line governance limit.
```

The exact-head CI value supersedes the earlier supplied estimate of 347 lines.

Contracted thresholds:

- target: <= 350 reviewable lines
- internal stop threshold: < 420 reviewable lines
- absolute G_CHANGE_SIZE ceiling: <= 500 reviewable lines

Observed result:

```text
349 <= 350
349 < 420
349 <= 500
```

All three footprint predicates are satisfied.

## Verification Evidence

Verified CI run: 35235473249

Exact verified repaired implementation head:

```text
6d76708366a4c639aff0420c7c38c25120456d0d
```

Observed test results:

```text
tests/governance-routing.test.mjs: 54 passed / 54
Repository test files: 18 passed / 18
Repository tests: 163 passed / 163
```

Exact-SHA evidence:

```text
PASS: PR Verification tested exact SHA 6d76708366a4c639aff0420c7c38c25120456d0d
```

This manifest records verified implementation evidence. It does not itself establish Stage 05 PASS, Stage 06 REVIEW_CLEAR, release eligibility, or merge authority.

## Redesign Path A Resolution

The amended C1 contract defines a dedicated transition fact-token grammar:

```text
^[A-Za-z][A-Za-z0-9_.:-]*$
```

The verifier applies this grammar to transition.required_facts, allowing the canonical mechanical gate fact:

```text
G_PRE_CODE_READY
```

Generic C1 identifiers remain governed by the lowercase-only grammar:

```text
^[a-z][a-z0-9_.:-]*$
```

Result:

```text
transition_fact_grammar_harmonized = true
G_PRE_CODE_READY_valid = true
generic_identifier_grammar_preserved = true
```

## Cycle 1 Finding Resolution Attestation

### F1 - C2 classification precedence

Top-level C2 structural validation completes before selector-specific classification.

Result:

```text
compound_incomplete_envelope -> TASK_ENVELOPE_REQUIRED
otherwise_complete_missing_selector -> MISSING_SELECTOR
F1 = RESOLVED
```

### F2 - C1 target_stage row validation

Route-table validation rejects malformed rows whose target_stage is absent, invalid, or inconsistent with selectors.workflow_stage.

Result:

```text
missing_target_stage -> ROUTING_TABLE_INVALID
target_stage_mismatch -> ROUTING_TABLE_INVALID
F2 = RESOLVED
```

### F3 - Lifecycle stage exit dispositions

The machine-readable contract keys canonical lifecycle success dispositions by stage.

Relevant canonical values include:

```text
04_implement = CANDIDATE_READY
05_verify = PASS
```

Artifact-level descriptors remain separate:

```text
IMPLEMENTATION_CANDIDATE_READY
VERIFICATION_PASS
```

Cross-stage dispositions such as REVIEW_CLEAR or PASS under 04_implement are rejected.

Result:

```text
F3 = RESOLVED
```

### F4 - Repository path schema alignment

The machine-readable repository path regex is:

```text
^(?![/])[A-Za-z0-9._/-]+$
```

Leading-slash absolute paths are rejected and the schema remains aligned with runtime repository-relative path validation.

Result:

```text
/etc/passwd -> rejected
F4 = RESOLVED
```

## Additional Review-Repair Resolution

Required Layer 3 source values must resolve to loaded, non-empty material. Null, undefined, or empty source values fail closed with MISSING_SOURCE.

Source-resolution checks occur before route-cardinality evaluation so a selector-matching route with unresolved Layer 3 material is excluded before uniqueness is computed.

The stage-contract negative control is normalized for LF and CRLF line endings with a carriage-return-optional newline regex in tests/governance-routing.test.mjs.

Result:

```text
loaded_source_validation = true
source_resolution_before_cardinality = true
cross_platform_crlf_negative_control = true
```

## Candidate Manifest Validity Facts

```text
candidate_manifest_valid = true
repaired_implementation_head = 6d76708366a4c639aff0420c7c38c25120456d0d
verified_ci_run = 35235473249
implementation_paths_confined = true
path_a_resolved = true
cycle_1_findings_resolved = true
crlf_negative_control_normalized = true
reviewable_lines = 349
reviewable_target_met = true
internal_stop_threshold_clear = true
absolute_change_size_gate_clear = true
pre_manifest_exact_head_ci_pass = true
```

This documentation-only manifest refresh creates a new repository head. Fresh PR Verification must pass on that resulting exact head before Stage 05 admission.

## Disposition

Artifact disposition:

```text
IMPLEMENTATION_CANDIDATE_READY
```

Canonical Stage 04 lifecycle disposition:

```text
CANDIDATE_READY
```

No Stage 05 PASS, Stage 06 review clearance, release eligibility, or merge authority is granted by this manifest.

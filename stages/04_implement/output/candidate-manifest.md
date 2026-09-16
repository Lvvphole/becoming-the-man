# Stage 04 Candidate Manifest - INC-1 Mechanical Routing Contracts and Verifier

Artifact disposition: IMPLEMENTATION_CANDIDATE_READY
Stage lifecycle disposition: CANDIDATE_READY
Stage: 04_implement
PR: 49
Merge base: fec5de5f242dc1dba4e007658f3323931f83c193
Implementation head: b0018d6ed9bacadeffe32e9edb8498a9eda7f812
Verified PR Verification run: 35010362929

## Candidate Lineage

This manifest binds the INC-1 technical implementation to:

- PR #49
- base fec5de5f242dc1dba4e007658f3323931f83c193
- implementation head b0018d6ed9bacadeffe32e9edb8498a9eda7f812
- approved Plan SHA-256 9d26be5ca0fd8bcc19ea6fdf30bfcd2899b5570fa9eb87ef5758dc87ebd511a7
- implementation Contract SHA-256 d2a34b74c83f0c78af3968207f3b96bf83ba9332e0b44f42292781ecea5aa89c

The implementation head above is the exact code/test/schema state verified before this documentation-only manifest commit.

## Implementation Workpiece Attestation

The INC-1 implementation mutation surface is exactly:

1. contracts/governance-routing-contract.json
2. scripts/verify-governance-routing.mjs
3. tests/governance-routing.test.mjs

No application source, package manifest, dependency lockfile, root CONTEXT.md, AGENTS.md, stage CONTEXT file, architecture source, CI workflow, database schema, migration, review record, or release record is part of the INC-1 implementation mutation surface.

Documentation artifacts from earlier lifecycle stages are present in the PR history but are not counted as implementation workpieces.

## Reviewable Change-Size Evidence

Exact-head PR Verification run 35010362929 executed the repository change-size gate against the PR base and reported:

```text
Reviewable implementation lines: 353 / 500 across 3 counted files.
PASS: implementation change is within the 500-line governance limit.
```

Contracted thresholds:

- target: <= 380 reviewable lines
- internal stop threshold: < 420 reviewable lines
- absolute G_CHANGE_SIZE ceiling: <= 500 reviewable lines

Observed result:

```text
353 <= 380
353 < 420
353 <= 500
```

All three change-size predicates are satisfied.

## Verification Evidence

Verified CI run: 35010362929

Exact verified implementation head:

```text
b0018d6ed9bacadeffe32e9edb8498a9eda7f812
```

Observed test results:

```text
tests/governance-routing.test.mjs: 42 passed / 42
Repository test files: 18 passed / 18
Repository tests: 151 passed / 151
```

The PR Verification workflow also completed its remaining required steps successfully, including exact-SHA binding:

```text
PASS: PR Verification tested exact SHA b0018d6ed9bacadeffe32e9edb8498a9eda7f812
```

This manifest records existing verified evidence. It does not itself convert implementation evidence into Stage 05 verification PASS.

## Contracted INC-1 Realization

The candidate implements the six frozen verifier modules:

1. Defensive envelope validation before untrusted property dereference.
2. Repository-relative path confinement for workpiece and authorized candidate paths.
3. Strict C4 BLOCKED-record lineage and schema validation with no empty source-binding fallback.
4. Global uniqueness checking for table.routes[*].route_id and removal of legacy stage_registry collision acceptance logic.
5. Layer 3 exact-source, section-policy, approval-fact, and source-binding validation before ROUTE_MATCH.
6. Positive numeric verification of the active 500-line ceiling across the seven canonical governance sources.

The focused governance suite preserves the contracted malformed-input, path-escape, C4, route-collision, Layer 3, section-policy, source-binding, approval, and numeric-drift controls.

## Candidate Manifest Validity Facts

```text
candidate_manifest_valid = true
implementation_paths_confined = true
active_stop_condition_clear = true
reviewable_lines = 353
reviewable_target_met = true
internal_stop_threshold_clear = true
absolute_change_size_gate_clear = true
pre_manifest_exact_head_ci_pass = true
```

The documentation-only manifest commit will create a new repository head. Under AGENTS.md, Stage 05 admission requires PR Verification to pass again on that resulting exact head.

## Disposition

Artifact disposition:

```text
IMPLEMENTATION_CANDIDATE_READY
```

Canonical Stage 04 lifecycle success_disposition from stages/04_implement/CONTEXT.md:

```text
CANDIDATE_READY
```

No merge, review PASS, release eligibility, or Stage 05 verification PASS is granted by this manifest.

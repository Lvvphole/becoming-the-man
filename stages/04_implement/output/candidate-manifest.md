# Stage 04 Candidate Manifest - INC-1 Cycle 2 Repaired Candidate

Artifact disposition: IMPLEMENTATION_CANDIDATE_READY
Stage lifecycle disposition: CANDIDATE_READY
Stage: 04_implement
PR: 49
Merge base: fec5de5f242dc1dba4e007658f3323931f83c193
Repaired implementation head: 509ad9f6a8829a2b1473f12dec0797e27d171163
Verified PR Verification run: 35152090766

## Candidate Lineage

This manifest binds the repaired Cycle 2 INC-1 implementation to:

- PR #49
- base fec5de5f242dc1dba4e007658f3323931f83c193
- repaired implementation head 509ad9f6a8829a2b1473f12dec0797e27d171163
- approved Plan SHA-256 9d26be5ca0fd8bcc19ea6fdf30bfcd2899b5570fa9eb87ef5758dc87ebd511a7
- amended implementation Contract SHA-256 103bedc0ff12b717dc58a13bd8b736fea13cf8bc84f1c8d228329b5550d2f10c

The implementation head above is the exact code/test/schema state verified before this documentation-only manifest refresh.

## Implementation Workpiece Attestation

The repaired INC-1 implementation mutation surface is exactly:

1. contracts/governance-routing-contract.json
2. scripts/verify-governance-routing.mjs
3. tests/governance-routing.test.mjs

No application source, package manifest, dependency lockfile, root CONTEXT.md, AGENTS.md, stage CONTEXT file, architecture source, CI workflow, database schema, migration, review record, or release record is part of the implementation workpiece set.

Lifecycle documentation artifacts remain outside the reviewable implementation count under AGENTS.md.

## Reviewable Change-Size Evidence

Exact-head PR Verification run 35152090766 executed the repository change-size gate against the PR base and reported:

```text
Reviewable implementation lines: 345 / 500 across 3 counted files.
PASS: implementation change is within the 500-line governance limit.
```

Contracted thresholds after the Redesign Path A amendment:

- target: <= 350 reviewable lines
- internal stop threshold: < 420 reviewable lines
- absolute G_CHANGE_SIZE ceiling: <= 500 reviewable lines

Observed result:

```text
345 <= 350
345 < 420
345 <= 500
```

All three footprint predicates are satisfied.

## Verification Evidence

Verified CI run: 35152090766

Exact verified repaired implementation head:

```text
509ad9f6a8829a2b1473f12dec0797e27d171163
```

Observed test results:

```text
tests/governance-routing.test.mjs: 47 passed / 47
Repository test files: 18 passed / 18
Repository tests: 156 passed / 156
```

Exact-SHA evidence:

```text
PASS: PR Verification tested exact SHA 509ad9f6a8829a2b1473f12dec0797e27d171163
```

This manifest records verified implementation evidence. It does not itself establish Stage 05 VERIFICATION_PASS or Stage 06 REVIEW_CLEAR.

## Redesign Path A Resolution

The amended C1 contract defines a dedicated transition fact-token grammar:

```text
^[A-Za-z][A-Za-z0-9_.:-]*$
```

The repaired verifier applies this grammar specifically to transition.required_facts.

Canonical mechanical gate fact:

```text
G_PRE_CODE_READY
```

is accepted by the transition fact predicate without weakening the generic lowercase C1 identifier grammar:

```text
^[a-z][a-z0-9_.:-]*$
```

Generic C1 identifiers remain lowercase-only for task domains, source IDs, evidence IDs, envelope-field IDs, and approval-fact IDs.

Path A result:

```text
transition_fact_grammar_harmonized = true
G_PRE_CODE_READY_valid = true
generic_identifier_grammar_preserved = true
```

## Cycle 1 Finding Resolution Attestation

### F1 - C2 classification precedence

The repaired evaluator completes top-level C2 presence validation before selector-specific classification.

Result:

```text
compound_incomplete_envelope -> TASK_ENVELOPE_REQUIRED
otherwise_complete_missing_selector -> MISSING_SELECTOR
F1 = RESOLVED
```

### F2 - C1 route-row completeness

The repaired route-table parser validates the complete frozen C1 route-row shape, including route identity, selectors, predicate structure, target_stage, transition structure, identifier classes, and closed route-row membership before evaluation.

Result:

```text
missing_target_stage -> ROUTING_TABLE_INVALID
malformed_route_row -> ROUTING_TABLE_INVALID
duplicate_route_id -> ROUTING_TABLE_INVALID
F2 = RESOLVED
```

### F3 - Lifecycle disposition alignment

The machine-readable contract now separates canonical lifecycle success dispositions from artifact descriptors.

Canonical lifecycle tokens include:

```text
Stage 04 = CANDIDATE_READY
Stage 05 = PASS
```

Artifact descriptors remain separately represented:

```text
IMPLEMENTATION_CANDIDATE_READY
VERIFICATION_PASS
```

Result:

```text
F3 = RESOLVED
```

### F4 - Repository path schema alignment

The machine-readable repoPath regex is:

```text
^(?![/])[A-Za-z0-9._/-]+$
```

The declaration therefore rejects leading-slash absolute paths and is aligned with the runtime repository-relative path boundary.

Result:

```text
/etc/passwd -> rejected
F4 = RESOLVED
```

## Six-Module Preservation

The repaired candidate preserves all six frozen INC-1 verifier modules:

1. Defensive envelope validation and deterministic C2 failure classification.
2. Repository-relative path confinement across workpiece and authorized candidate paths.
3. Strict C4 BLOCKED lineage/schema handling with no empty source-binding fallback.
4. Complete C1 route-table integrity and route_id uniqueness.
5. Layer 3 exact-source, section-policy, source-binding, and approval-fact gates before ROUTE_MATCH.
6. Positive numeric verification of the active 500-line ceiling across the seven canonical governance sources.

The Cycle 2 repair does not introduce a new C4 reason code, package dependency, root routing source, or implementation workpiece.

## Candidate Manifest Validity Facts

```text
candidate_manifest_valid = true
repaired_implementation_head = 509ad9f6a8829a2b1473f12dec0797e27d171163
implementation_paths_confined = true
path_a_resolved = true
cycle_1_findings_resolved = true
reviewable_lines = 345
reviewable_target_met = true
internal_stop_threshold_clear = true
absolute_change_size_gate_clear = true
pre_manifest_exact_head_ci_pass = true
```

This documentation-only manifest refresh creates a new repository head. Under AGENTS.md, Stage 05 admission requires PR Verification to pass again on that resulting exact head.

## Disposition

Artifact disposition:

```text
IMPLEMENTATION_CANDIDATE_READY
```

Canonical Stage 04 lifecycle disposition:

```text
CANDIDATE_READY
```

No Stage 05 verification PASS, Stage 06 review clearance, release eligibility, or merge authority is granted by this manifest.

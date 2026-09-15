# Stage 01 Scout Report - INC-1 Mechanical Routing Contracts and Verifier
Status: SCOUT_READY
Lifecycle stage: 01_scout
Task domain: governance
Repository base inspected: 33a36de2d23c73e5184867628a0ef6b4cd7dcc88
Repository mutation: none
Primary objective: identify the smallest deterministic INC-1 implementation path for the mechanical routing verifier while preserving fail-closed governance and the 500 reviewable-LOC ceiling.

## 1. Scout Summary
The current routing verifier is executable and its existing governance suite passes, but it is not yet sufficient as a closed mechanical implementation of Contracts C1, C2, C4, C6, and C7.
Six verifier gaps are confirmed:
1. Malformed task envelopes can cause runtime exceptions instead of C4 BLOCKED results;
2. Repository paths are checked only for wildcard characters, not absolute/traversal forms;
3. makeBlocked() defaults source_binding to {}, which violates the canonical C4 schema;
4. Route-table integrity still contains a deprecated stage_registry duplicate-key check and does not enforce uniqueness of table.routes[*].route_id;
5. Layer 3 resolution validates only source-registry membership, not source existence, section policy, or current source binding;
6. The 500-line invariant is enforced partly by blacklisting known drift strings rather than positively verifying that every active numeric ceiling equals exactly 500.

All six gaps can be addressed inside the existing mechanical-routing surface without modifying product behavior, application code, database state, or root governance.

## 2. Requirement 1 - Defensive Envelope Parsing
A mechanical input gate must precede all property access:
1. Validate routing-table input type.
2. Validate envelope is a non-null, non-array object.
3. Validate all nine C2 fields exist.
4. Validate each field has its required primitive/container type.
5. Validate array members before array operations.
6. Only then evaluate route predicates.

Invalid or absent envelopes must return `status: "BLOCKED"`, `reason_code: "TASK_ENVELOPE_REQUIRED"`.

## 3. Requirement 2 - Path Traversal Guardrails
A shared deterministic `isRepoRelativePath()` predicate must enforce:
- Non-empty string matching `^[A-Za-z0-9._/-]+$`
- No leading slash
- No segment equal to `..`
- No wildcard characters
- No Windows drive paths or backslashes

Applied independently to `workpiece_paths` and `authorized_candidate_paths`.

## 4. Requirement 3 - Strict C4 BLOCKED Schema Conformance
`makeBlocked()` must not default to `source_binding: {}`. A trusted execution binding with `pr`, `base`, and `current_head` must be validated before parsing untrusted envelopes. Fallback placeholders or manufactured SHAs are prohibited.

## 5. Requirement 4 - Route Table Integrity and Route-ID Collisions
Assert global uniqueness over `table.routes[*].route_id`. Duplicate route IDs fail closed with `ROUTING_TABLE_INVALID`. Eliminate legacy `stage_registry` duplicate checks.

## 6. Requirement 5 - Layer 3 Resolution, Section Policy, and Source Binding
For every required Layer 3 source:
1. Validate source existence on disk.
2. Enforce section policy: `full` requires exactly `["*"]`; `explicit_selector_required` requires non-empty array omitting `*`.
3. Validate source binding currentness against observed repository state before returning `ROUTE_MATCH`.

## 7. Requirement 6 - Exact Numeric 500-LOC Verification
Replace token blacklists (`"1,000"`) with positive numeric extraction:
- Parse `active_reviewable_loc_limit === 500` from the Architecture Manifest JSON block.
- Parse `MAX_LINES=500` from `scripts/check-change-size.sh`.
- Assert numeric equality to 500 across all 7 governance sources. Negative controls must fail closed on 499, 501, 600, 1000.

## 8. Architectural Footprint Estimate
- `scripts/verify-governance-routing.mjs`: 120-160 LOC
- `tests/governance-routing.test.mjs`: 140-180 LOC
- `contracts/governance-routing-contract.json`: 40-70 LOC
- Total projected footprint: 300-410 LOC (within 420 internal threshold and 500 ceiling).

## 9. Formal Stage Disposition
SCOUT_READY

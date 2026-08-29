# FDAVH v1.0 — Artifact-Level Regression Report

**Date:** 2026-08-29
**Target repository:** `Lvvphole/becoming-the-man`
**Repository baseline:** `main = 0e715911baeff97304250a0fa33feb72169a91ea`
**Branch:** `claude/fdavh-spec-review-fzpsf3`

---

## 0. Disposition

# FAIL — DO NOT LOCK FDAVH v1.0

7 of 17 checks PASS. 10 of 17 checks FAIL. The specification MUST NOT be locked for implementation.

**Falsifiability guard:** SATISFIED — 7 checks genuinely pass, confirming the contract was not shaped to the defect list.

---

## 1. Artifact Digests

| Artifact | SHA-256 |
|---|---|
| Candidate specification | `195375bdda7229e604b2facbcd16ec27d34103cb93c6b4f6dc11ebc8971a1336` |
| Acceptance contract | `3cd9dc7b6fa84328add1e5b30455935766dc5f0fa41f820e4144f8d4e0450ad5` |
| Frozen checker | `4c3a2140a9eeca86df9a88821e5e84d7daaa0fc28fced99c304aaea9301f7cef` |
| Corrected review | `e780276d59d0de2c6315ae1bf00727ba0c01064c859fb1377c64ce6a68580ebf` |

---

## 2. Parser Coverage

```
Parsed: 74/74 invariants, 48/48 ACs, 14/14 gates, 23 transitions
Parser integrity: OK
```

Zero unparsed rows. Parser exited with integrity check passed.

---

## 3. Per-Check Verdicts

### PASSING CHECKS (7)

| Check | Name | Detail |
|---|---|---|
| CHK-01 | ID Closure | All 74 invariant IDs defined exactly once; G0-G13, S1-S10, P1-P5, E0-E9, AC-01-AC-48 present. |
| CHK-02 | Count Integrity | Invariants: 74/74, Gates: 14/14, ACs: 48/48 |
| CHK-03 | Crosswalk Forward Completeness | All 74 crosswalk rows have gate, schema/policy, evidence, and AC references. |
| CHK-05 | Schema Ownership | All 15 schema/policy refs resolve to §7/§8 definitions. |
| CHK-06 | State Closure | 18 unique states extracted. All transition endpoints resolve to declared states. |
| CHK-07 | Reachability from INIT | All 18 states reachable from INIT. |
| CHK-09 | Terminal Reachability | COMPLETED, BLOCKED, TERMINATED all reachable from INIT. |

These passes confirm that v1.0's structural architecture is well-formed: IDs are complete and non-duplicated, the crosswalk has full forward coverage, all schemas resolve, and the state machine is structurally sound (every state reachable, every terminal reachable, all state names valid).

### FAILING CHECKS (10)

#### CHK-04 — Crosswalk Reverse Completeness: FAIL

41 of 48 acceptance cases are referenced by the crosswalk. 7 are orphaned — they have no owning invariant and cannot be traced to an enforceable obligation.

**Orphans:** AC-08, AC-10, AC-22, AC-23, AC-26, AC-39, AC-48

This matches the independently confirmed orphan set from the companion structural checker (41 referenced, 7 orphaned). The orphan set is identical.

**Likely mappings for v1.1:** AC-08→MR3; AC-10→MR7/R12; AC-22→I3/I4/I5; AC-23→I2/I17; AC-26→I3/I5+termination; AC-39→I1/I9/I23; AC-48→I6.

#### CHK-08 — No Dead-End Non-Terminal States: FAIL

Three structural holes in the closed-world state machine:

1. **INFERENCE_EXECUTING** has no explicit provider error/timeout exit. The closed-world claim ("any transition not enumerated is denied") makes this a conformance gap — a provider error has no legal next state.
2. **AWAITING_APPROVAL** state is absent. There is no approval-wait transition between `PROPOSAL_ADMITTED` and `ACTION_AUTHORIZED`.
3. **PROPOSAL_ADMITTED** has no zero-effect direct completion path to `COMPLETION_EVALUATION`. A read-only or no-effect task that satisfies its postcondition without executing an action has no legal completion path.

#### CHK-10 — Positive Liveness: FAIL

No invariant requires a conforming controller to choose a progress transition when safe, authorized, enabled transitions are available. The specification has strong safety and stop semantics (I23 BLOCKED MUST NOT trigger exploration, I10 fail closed, I24 knowledge-or-BLOCKED) but no positive progress obligation.

This is the blocking defect B1 from the corrected review. The approved System Architecture Amendment v1.2 explicitly names bounded Codex convergence as a liveness control; FDAVH v1.0 drops the liveness concept entirely.

**Required for v1.1:** I25 — Authorized Progress and Finite Resolution.

#### CHK-11 — Cycle Boundedness: FAIL

Two cycles lack visible budget or new-evidence guards in their transition-level trigger/property text:

1. **EFFECT_VERIFIED → MODEL_SELECTED** (trigger: "more work remains") — no budget consumption referenced at the transition level.
2. **BLOCKED → BLOCKED** (trigger: "preserve/report/await only") — no finite resolution bound; BLOCKED can persist indefinitely without requiring eventual resolution.

Note: I16 (Fixed Recovery Horizon) exists as an invariant but is not referenced in the EFFECT_VERIFIED→MODEL_SELECTED transition's guard. The budget enforcement is at the invariant level, not visible at the transition level. This creates a gap between the state-machine formalism and the invariant semantics.

#### CHK-12 — Oracle Constructibility: FAIL

Three invariant rules depend on predicates with no defined decision procedure:

| Invariant | Predicate |
|---|---|
| R7 | "smallest authoritative section sufficient" — requires judging which section is "sufficient" for a task |
| R8 | "losslessly compiled" — requires proving semantic equivalence of a prose compression |
| MR3 | "semantic equivalence" — requires proving two model-specific context formats preserve meaning |

No finite decision procedure can satisfy these without further definition.

#### CHK-13 — Term Closure: FAIL

Two load-bearing terms appear in MUST clauses without a defined decision procedure:

- **"losslessly compiled"** — R8 requires normative obligations to be "exact or losslessly compiled," but defines no procedure for determining whether a compilation is lossless.
- **"semantic equivalence"** — MR3 requires model-specific formatting to "preserve semantic equivalence," but defines no procedure for verifying this.

Note: `materially new evidence` is also used normatively (I15, I24, MR13) and carries normative force. The checker flags it under CHK-12 via R7/R8/MR3 rather than CHK-13 because it appears in guards rather than inline MUST clauses. v1.1 should define a canonical failure signature for this term.

#### CHK-14 — Enforcement-Ownership Honesty: FAIL

Two findings:

1. **No per-enforcement-point conformance profile split.** The specification defines conformance levels (§22) as SPEC-CONFORMANT → TEST-CONFORMANT → RUNTIME-CONFORMANT → REPOSITORY-MERGE-ELIGIBLE, but all levels require all 74 invariants. There is no separation between controls enforceable at the repository boundary (Profile A) and controls requiring a first-party runtime gateway (Profile B). IV10 (Provider-Bound Execution Path) requires an inference gateway that does not exist in the repository.

2. **No `governance/` directory for machine contracts.** The proposed implementation surface includes governance files, but the repository contains no `governance/` directory.

**Required for v1.1:** Profile A (REPOSITORY-BOUNDARY-CONFORMANT) / Profile B (OWNED-RUNTIME-CONFORMANT) split evaluated per enforcement point.

#### CHK-15 — Single-Authority State: FAIL

Budget-related state appears in 16 locations with no single-source-of-truth rule:

**Schemas:** S1 (ExecutionEnvelope), S2 (RouteManifest), S3 (ModelRouteDecision), S4 (InferenceReceipt), S5 (ActionAuthorization), S6 (TrajectoryEvent), S7 (FailureLearningRecord), S8 (RecoveryCheckpoint)

**Invariants:** I15, I16, IV7, IV9, R14, MR5, MR13, MR14

No invariant or schema designates one of these as the authoritative budget ledger. When projections disagree, no reconciliation rule determines which wins.

**Required for v1.1:** S11 BudgetLedger — single supervisor-owned atomic ledger. All other schemas carry `budget_ledger_version` + `budget_ledger_digest` references only.

#### CHK-16 — Source Conflict: FAIL

The specification does not define an evidence lifecycle/classification/retention policy. Without such a policy, compatibility with `AGENTS.md` security rules cannot be established:

- `AGENTS.md:75` — "Never commit secrets, production credentials/data, private exports, or sensitive evidence."
- `AGENTS.md:79` — "Do not send raw email, contact text, assessment answers, AI transcripts, or sensitive relationship content to analytics."

FDAVH requires trajectory evidence (S6), raw response digests (IV12), provider receipts (IV11), and replay/tamper evidence — but specifies no lifecycle covering sensitivity classification, data minimization, transient vs. durable storage, repository admissibility, analytics prohibition, retention horizon, or deletion.

This is blocking defect B2 from the corrected review. Note: `AGENTS.md:79` is scoped to analytics, not a blanket export prohibition. The defect is the absence of a lifecycle, not a direct contradiction.

**Required for v1.1:** §8.2 Evidence Classification, Minimization, Storage & Retention.

#### CHK-17 — Self-Mergeability: FAIL

The specification mentions the 1,000-line PR reviewability rule (§21) but provides no decomposition sequence, incremental activation plan, or PR-sizing guidance for implementation. The proposed implementation surface (`governance/`, `contracts/`, `harness/`, `tests/`) would count against the change-size cap, but no plan exists for sequencing it into cap-compliant increments.

**Required for v1.1:** A bounded decomposition sequence such as: PR1 contracts+checker foundations → PR2 governance routing/Profile A enforcement → PR3 candidate/evidence verifier → PR4 recovery+liveness → PR5+ Profile B only if runtime ownership materializes.

---

## 4. Cross-Validation

| Claim | Checker result | Independent confirmation |
|---|---|---|
| 74 invariant rows | 74/74 parsed | Companion structural checker: 74 |
| 14 gates | 14/14 parsed | Companion structural checker: 14 (G0-G13) |
| 48 acceptance cases | 48/48 parsed | Companion structural checker: 48 |
| 7 orphan ACs | AC-08, AC-10, AC-22, AC-23, AC-26, AC-39, AC-48 | Companion structural checker: identical set |
| 23 state-machine transitions | 23 parsed | Companion structural checker: 23 |
| AWAITING_APPROVAL absent | Confirmed | Companion structural checker: absent |
| Provider error exit from INFERENCE_EXECUTING absent | Confirmed | Companion structural checker: absent |
| Zero-effect completion path absent | Confirmed | Companion structural checker: absent |
| 0 concurrency term occurrences | Not checked by this checker | Companion structural checker: 0 |

All cross-validated claims match.

---

## 5. Implementation Line Count

| File | Lines | Counts against cap? |
|---|---|---|
| `scripts/fdavh/check-artifact.mjs` | 588 | Yes |
| `scripts/fdavh/check_fdavh_v1_structural_claims.py` | 94 | Yes |
| `docs/evidence/fdavh/v1.0/*.md` | N/A | No (`docs/*` excluded) |
| `docs/evidence/fdavh/v1.0/*.json` | N/A | No (`docs/*` excluded) |
| **Total counted** | **682** | Under 1,000-line cap |

---

## 6. Blocking Defects Summary

These are the findings from the corrected review that the checker reproduces or confirms:

| Review finding | Checker check(s) | Verdict |
|---|---|---|
| B1 — No positive liveness property | CHK-10, CHK-11 | FAIL |
| B2 — Evidence lifecycle underspecified | CHK-16 | FAIL |
| B3 — G0 entry is not non-bypassable | CHK-14 | FAIL (no profile split) |
| G4 — Crosswalk one-directional | CHK-04 | FAIL (7 orphans) |
| G5 — Terms lack decision procedures | CHK-12, CHK-13 | FAIL |
| G6 — State machine structural holes | CHK-08 | FAIL (3 holes) |
| G7 — Concurrency absent | Not directly checked | Confirmed by companion checker |
| G10 — No decomposition sequence | CHK-17 | FAIL |
| L2 — Budget truth duplicated | CHK-15 | FAIL (16 locations) |

---

## 7. Recommendations

1. **Do not lock FDAVH v1.0.** The 10 failing checks include 3 blocking defects.

2. **Preserve the frozen acceptance contract and checker.** They are independently frozen and MUST NOT be modified to accommodate a failing candidate. The contract SHA-256 and checker SHA-256 are recorded above.

3. **Author FDAVH v1.1** to repair the candidate, not the evaluator. v1.1 should include at minimum:
   - I25 Authorized Progress and Finite Resolution
   - I26 Run Isolation and Concurrent Mutation Safety
   - Profile A (Repository-Boundary-Conformant) / Profile B (Owned-Runtime-Conformant) split
   - §8.2 Evidence lifecycle (classification, minimization, storage, retention)
   - Deterministic failure-signature/materially-new-evidence rule
   - Bidirectional acceptance ownership (close the 7 orphans)
   - Explicit provider-error transitions, AWAITING_APPROVAL, zero-effect completion
   - Typed BLOCKED reasons and class-dependent resume guards
   - S11 BudgetLedger as single authoritative source
   - Single S7 emission path (G10)
   - Single-model fast path
   - Bounded decomposition sequence

4. **Re-run the unchanged frozen checker** against v1.1. Lock v1.1 only if that exact artifact passes and no unresolved governing-source conflict remains.

5. **Implement only the conformance profile whose enforcement plane actually exists.** Do not claim Profile B until a first-party inference gateway is evidenced.

6. **Preserve existing repository controls** throughout: exact-head CI, bounded change size, three-cycle convergence cap, separate merge authority.

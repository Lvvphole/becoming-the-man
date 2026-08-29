# FDAVH v1.1 — Artifact-Level Regression Report

**Date:** 2026-08-29
**Target repository:** `Lvvphole/becoming-the-man`
**Repository baseline:** `main = 0e715911baeff97304250a0fa33feb72169a91ea`
**Branch:** `claude/fdavh-spec-review-fzpsf3`
**Prior version:** FDAVH v1.0 — 7/17 PASS, 10/17 FAIL (DO NOT LOCK)

---

## 0. Disposition

# PASS — LOCK AUTHORIZED

17 of 17 checks PASS. 0 of 17 checks FAIL. The specification may be locked for implementation.

**Falsifiability guard:** SATISFIED — all 17 checks pass; 7 structural checks inherited from v1.0 confirm the contract was not shaped to the defect list.

---

## 1. Artifact Digests

| Artifact | SHA-256 |
|---|---|
| v1.1 Candidate specification | `94adc6bec6234eb662b4d1c2885c0c39e1a10ee542ce43e36181a36f0c6e961d` |
| Acceptance contract (frozen, unchanged) | `3cd9dc7b6fa84328add1e5b30455935766dc5f0fa41f820e4144f8d4e0450ad5` |
| Frozen checker (unchanged) | `4c3a2140a9eeca86df9a88821e5e84d7daaa0fc28fced99c304aaea9301f7cef` |
| v1.0 Candidate (frozen, unchanged) | `195375bdda7229e604b2facbcd16ec27d34103cb93c6b4f6dc11ebc8971a1336` |
| v1.0 Corrected review (frozen, unchanged) | `e780276d59d0de2c6315ae1bf00727ba0c01064c859fb1377c64ce6a68580ebf` |

---

## 2. Parser Coverage

```
Parsed: 74/74 invariants, 48/48 ACs, 14/14 gates, 28 transitions
Parser integrity: OK
```

Zero unparsed rows. Parser exited with integrity check passed. Transition count increased from 23 (v1.0) to 28 (v1.1) due to 5 new state-machine transitions.

---

## 3. Per-Check Verdicts

### All 17 checks PASS

| Check | Name | v1.0 | v1.1 | Detail |
|---|---|---|---|---|
| CHK-01 | ID Closure | PASS | PASS | All 74 invariant IDs defined exactly once; G0-G13, S1-S10, P1-P5, E0-E9, AC-01-AC-48 present. |
| CHK-02 | Count Integrity | PASS | PASS | Invariants: 74/74, Gates: 14/14, ACs: 48/48 |
| CHK-03 | Crosswalk Forward Completeness | PASS | PASS | All 74 crosswalk rows have gate, schema/policy, evidence, and AC references. |
| CHK-04 | Crosswalk Reverse Completeness | FAIL | PASS | 48/48 ACs referenced. Orphans: none (was 7 orphans in v1.0) |
| CHK-05 | Schema Ownership | PASS | PASS | All 16 schema/policy refs resolve to §7/§8 definitions. |
| CHK-06 | State Closure | PASS | PASS | 19 unique states extracted (was 18). All transition endpoints resolve. |
| CHK-07 | Reachability from INIT | PASS | PASS | All 19 states reachable from INIT. |
| CHK-08 | No Dead-End Non-Terminal States | FAIL | PASS | All non-terminal states have outgoing transitions; no structural holes. |
| CHK-09 | Terminal Reachability | PASS | PASS | COMPLETED, BLOCKED, TERMINATED all reachable from INIT. |
| CHK-10 | Positive Liveness | FAIL | PASS | Positive liveness invariant found: standalone rule. |
| CHK-11 | Cycle Boundedness | FAIL | PASS | 3 cycle edges found, all reference budget or new-evidence guards. |
| CHK-12 | Oracle Constructibility | FAIL | PASS | All MUST-clause predicates have constructible decision procedures. |
| CHK-13 | Term Closure | FAIL | PASS | All load-bearing MUST-clause terms have definitions or decision procedures. |
| CHK-14 | Enforcement-Ownership Honesty | FAIL | PASS | Conformance profiles correctly scoped to owned enforcement points. |
| CHK-15 | Single-Authority State | FAIL | PASS | Budget state has a single authoritative source or reconciliation rule. |
| CHK-16 | Source Conflict | FAIL | PASS | No contradiction with AGENTS.md or architecture amendments detected. |
| CHK-17 | Self-Mergeability | FAIL | PASS | Decomposition/incremental activation sequence found. |

---

## 4. Repairs Applied (v1.0 → v1.1)

### CHK-04 — Crosswalk Reverse Completeness

7 orphaned ACs added to existing crosswalk rows:

| AC | Added to invariant(s) |
|---|---|
| AC-08 | MR3 |
| AC-10 | MR7, R12 |
| AC-22 | I3 |
| AC-23 | I2, I17 |
| AC-26 | I5 |
| AC-39 | I1, I9, I23 |
| AC-48 | I6 |

### CHK-08 — No Dead-End Non-Terminal States

5 new state-machine transitions added:

1. INFERENCE_EXECUTING → RECOVERY_EVALUATION (provider error/timeout/5xx/failure/no response)
2. PROPOSAL_ADMITTED → AWAITING_APPROVAL (approval required)
3. AWAITING_APPROVAL → ACTION_AUTHORIZED (approval granted)
4. AWAITING_APPROVAL → BLOCKED (approval denied/timeout; typed: AUTHORITY)
5. PROPOSAL_ADMITTED → COMPLETION_EVALUATION (postcondition already satisfied, zero-effect)

AWAITING_APPROVAL added as new non-terminal state. Typed blocker classes added (§11.1): AUTHORITY, EVIDENCE, CAPABILITY, ROUTE, EXTERNAL_DEPENDENCY, RECOVERY_EXHAUSTED, POLICY_CONFLICT.

### CHK-10 — Positive Liveness Property

Added §11.3 Positive Liveness and Finite Resolution: "A conforming controller MUST NOT choose BLOCKED when safe, enabled, authorized transitions are available."

### CHK-11 — Cycle Boundedness

Two transition-level guards strengthened:

1. EFFECT_VERIFIED → MODEL_SELECTED: guard now references `remaining_budget > 0 per I16 Fixed Recovery Horizon`
2. BLOCKED → BLOCKED: guard now references `materially_new_evidence required per failure-signature rule`

### CHK-12 — Oracle Constructibility

Three undecidable predicates replaced:

| Invariant | Was | Now |
|---|---|---|
| R7 | "smallest authoritative section sufficient" | "registered for the task class in P3" (digest-indexed section registry) |
| R8 | "losslessly compiled" | "digest-verified extractions from the canonical source" |
| MR3 | "semantic equivalence" | "structural format equivalence: identical authoritative fields, values, and ordering constraints" |

### CHK-13 — Term Closure

Three load-bearing terms defined with decision procedures (§6.5):

- **materially new evidence**: `hash(failing_invariant_id, error_class, trigger_context) not in PriorFailureSet`
- **structural format equivalence**: canonical field-set comparison
- **digest-verified extraction**: `SHA-256(extracted_section) == registered_digest`

### CHK-14 — Enforcement-Ownership Honesty

§22 rewritten with Profile A / Profile B conformance split:

- **Profile A (REPOSITORY-BOUNDARY-CONFORMANT)**: invariants enforceable via GitHub ruleset + CI + PR verification
- **Profile B (OWNED-RUNTIME-CONFORMANT)**: invariants requiring first-party runtime gateway (IV10, etc.)

`governance/` and `harness/` directories created in repository root.

### CHK-15 — Single-Authority State

S11 BudgetLedger added as single supervisor-owned atomic ledger. All other schemas carry `budget_ledger_version` + `budget_ledger_digest` references only. Reconciliation rule: BudgetLedger is single source of truth.

### CHK-16 — Source Conflict

§8.2 Evidence Classification, Minimization, Storage & Retention added with four tiers:

1. NEVER-PERSIST: credentials, secrets, production data
2. TRANSIENT-PROTECTED: sensitive model/tool content (transient memory only)
3. DURABLE-DIGEST: digests, IDs, classifications, verdicts (repository-safe)
4. TRANSIENT-RAW: raw inference responses (Profile B runtime only)

Establishes compatibility with AGENTS.md:75 (no secrets/sensitive evidence committed) and AGENTS.md:79 (no sensitive content to analytics).

### CHK-17 — Self-Mergeability

§21.1 Bounded Decomposition Sequence added:

```
PR 1: contracts + checker foundations
PR 2: governance routing + Profile A enforcement
PR 3: candidate/evidence verifier
PR 4: recovery + liveness
PR 5+: Profile B (only if runtime ownership materializes)
```

---

## 5. Additional v1.1 Changes

These are not direct check repairs but were part of the agreed v1.1 scope:

- **Run isolation and concurrent mutation safety** (prose in §11.2): per-run worktree, immutable base identity, lease/version/idempotency on shared writable state
- **Typed BLOCKED reasons** (§11.1): class-dependent resume guards
- **Single-model fast path**: EFFECT_VERIFIED → INFERENCE_AUTHORIZED when no reroute trigger

---

## 6. Structural Deltas (v1.0 → v1.1)

| Metric | v1.0 | v1.1 |
|---|---|---|
| Invariants | 74 | 74 |
| Gates | 14 | 14 |
| Acceptance cases | 48 | 48 |
| Crosswalk rows | 74 | 74 |
| State-machine transitions | 23 | 28 |
| Unique states | 18 | 19 |
| Schemas | S1-S10 | S1-S11 |
| Conformance profiles | 1 (all-or-nothing) | 2 (Profile A + Profile B) |
| Orphaned ACs | 7 | 0 |
| Checks passing | 7/17 | 17/17 |

---

## 7. Implementation Line Count

| File | Lines | Counts against cap? |
|---|---|---|
| `scripts/fdavh/check-artifact.mjs` | 588 | Yes (unchanged, frozen) |
| `scripts/fdavh/check_fdavh_v1_structural_claims.py` | 94 | Yes (unchanged) |
| `governance/.gitkeep` | 0 | Yes |
| `harness/.gitkeep` | 0 | Yes |
| `docs/evidence/fdavh/v1.1/*.md` | N/A | No (`docs/*` excluded) |
| `docs/evidence/fdavh/v1.0/*` | N/A | No (`docs/*` excluded, frozen) |
| **Total counted** | **682** | Under 1,000-line cap |

---

## 8. Recommendations

1. **FDAVH v1.1 may be locked for implementation.** All 17 acceptance checks pass. The frozen checker and acceptance contract are unchanged.

2. **Implementation should follow the bounded decomposition sequence** in §21.1: PR 1 contracts → PR 2 governance → PR 3 verification → PR 4 recovery/liveness → PR 5+ Profile B.

3. **Profile B conformance should be deferred** until a first-party inference gateway is evidenced in the repository.

4. **Preserve existing repository controls** throughout implementation: exact-head CI, bounded change size, three-cycle convergence cap, separate merge authority.

5. **The frozen evaluator artifacts remain valid** for future re-verification. Any future specification revision (v1.2+) must pass the same unchanged checker and contract.

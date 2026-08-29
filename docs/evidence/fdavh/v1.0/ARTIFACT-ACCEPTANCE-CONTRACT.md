# Artifact-Level Acceptance Contract for Normative Specification Lock

**Version:** 1.0
**Date:** 2026-08-29
**Scope:** Any normative specification artifact proposed for lock against the `becoming-the-man` repository.
**Status:** FROZEN — this contract MUST NOT be modified to accommodate a failing candidate.

---

## 0. Purpose

This contract defines what a normative specification must satisfy before it may be locked for implementation. The checks are derived from general properties of well-formed normative artifacts, not from the defect list of any particular candidate.

**Falsifiability guard.** A valid acceptance contract must contain checks that a reasonable candidate can pass. If every check fails, the contract was shaped to a known defect list and is invalid as an independent oracle.

**Evaluator discipline.** If the candidate fails, fix the candidate. Never modify this contract to make a failing candidate pass. Any revision to this contract requires independent justification, a version increment, and re-evaluation of all prior candidates against the new version.

---

## 1. Checks

### CHK-01 — ID Closure

Every declared identifier class (I\*, IV\*, R\*, MR\*, G\*, S\*, P\*, E\*, AC\*) MUST be defined exactly once at its point of introduction. Every reference to such an identifier elsewhere in the document MUST resolve to a defined identifier. No identifier may appear in a reference position without a corresponding definition.

**Oracle:** Parse all definition and reference sites. Report any ID defined zero times, more than once, or referenced but undefined.

### CHK-02 — Count Integrity

Declared totals in prose or header text MUST match actual rows in normative tables. Specifically: the invariant count MUST equal the number of distinct invariant rows in the invariant-family tables; the gate count MUST equal the number of distinct gate rows in the gate registry; the acceptance-case count MUST equal the number of distinct AC rows in the acceptance contract table.

**Oracle:** Count parsed rows and compare to declared totals. Any mismatch is a FAIL.

### CHK-03 — Crosswalk Forward Completeness

Every invariant listed in the crosswalk table MUST map to at least one gate, at least one schema or policy artifact, at least one evidence class, and at least one acceptance case.

**Oracle:** For each crosswalk row, verify that every required column contains at least one valid reference. An empty cell or a reference to an undefined ID is a FAIL.

### CHK-04 — Crosswalk Reverse Completeness

Every acceptance case defined in the acceptance contract (§19) MUST be referenced by at least one invariant row in the crosswalk (§18). An acceptance case with no owning invariant is orphaned and cannot be traced to an enforceable obligation.

**Oracle:** Collect all AC-\*\* IDs from §19. Collect all AC-\*\* references from the crosswalk's acceptance column. Any AC defined in §19 but absent from the crosswalk is an orphan. Report orphan count and IDs.

### CHK-05 — Schema Ownership

Every schema or policy artifact referenced in the crosswalk (S\*, P\*) MUST be defined in the specification's schema section (§8) or static-artifacts section (§7).

**Oracle:** Collect all S\*/P\* references from crosswalk rows. Verify each resolves to a defined schema or artifact. Undefined references are a FAIL.

### CHK-06 — State Closure

Every state name appearing as a source (From) or destination (To) in the state-machine transition table (§11) MUST be a member of the declared state set. The declared state set is the union of all unique From and To values plus explicitly named terminal states.

**Oracle:** Extract all unique state names from From and To columns. Verify no transition references a state outside this set. Report any violations.

### CHK-07 — Reachability from INIT

Every declared state MUST be reachable from the initial state `INIT` by following the transition table. An unreachable state indicates dead specification text.

**Oracle:** Build a directed graph from transitions. BFS/DFS from INIT. Any state not visited is unreachable. `ANY NONTERMINAL` rows expand to all non-terminal states as sources.

### CHK-08 — No Dead-End Non-Terminal States

Every non-terminal state MUST have at least one outgoing transition. A non-terminal state with no outgoing transition creates an inescapable trap.

**Oracle:** For each non-terminal state, verify at least one transition row has it as a From state, or it is covered by an `ANY NONTERMINAL` wildcard row. Terminal states are: `COMPLETED`, `BLOCKED` (self-loop is not an exit), `TERMINATED`.

Note: `BLOCKED` has a self-loop and an external-unblock exit, so it is not a dead end. The check here is whether non-terminal states that are NOT covered by wildcard rows have explicit exits. A state that appears only as a destination with no explicit or wildcard outgoing transition is a dead end.

### CHK-09 — Terminal Reachability

Each terminal state (`COMPLETED`, `BLOCKED`, `TERMINATED`) MUST be reachable from `INIT`.

**Oracle:** Using the reachability graph from CHK-07, verify that each terminal state is in the reachable set.

### CHK-10 — Positive Liveness Property

The specification MUST contain at least one normative invariant or rule that requires a conforming controller to make progress toward completion when a safe, authorized, enabled transition is available. Structural reachability of `COMPLETED` is necessary but not sufficient; the specification must also require that the path be taken.

**Oracle:** Search the invariant set for a normative rule whose text requires progress, forward movement, or completion when transitions are enabled and authorized. Search for an explicit prohibition against choosing `BLOCKED` when a safe progress transition exists. If no such invariant or rule exists, FAIL.

### CHK-11 — Cycle Boundedness

Every cycle in the state-machine transition graph MUST consume a supervisor-owned finite budget or require new evidence. An unbounded cycle permits infinite looping without progress.

**Oracle:** Identify all cycles in the transition graph. For each cycle, verify that at least one edge's trigger/guard or required-property references a budget, counter, or new-evidence requirement. A cycle with no such reference is a FAIL.

### CHK-12 — Oracle Constructibility

No MUST clause in any invariant MUST depend on an undecidable predicate — that is, a predicate for which no finite decision procedure can be defined.

**Oracle:** Search invariant normative-rule text for terms that require semantic equivalence judgments, lossy compression quality assessments, or open-ended similarity comparisons without a defined decision procedure. Flag any term that requires an oracle no implementation can build.

### CHK-13 — Term Closure

Every term that carries normative force in a MUST clause MUST either be defined in the specification or have an explicit decision procedure. A load-bearing undefined term makes the obligation unenforceable.

**Oracle:** Identify terms in MUST clauses that are not standard English and not defined elsewhere in the document. Focus on domain-specific terms that gate recovery, routing, or admission decisions. Report undefined load-bearing terms.

### CHK-14 — Enforcement-Ownership Honesty

No conformance level may claim a control that the target repository/deployment does not own. This check MUST be evaluated per enforcement point, not by invariant family membership. An invariant in the I1-I24 "runtime" family is NOT automatically enforceable at the repository boundary; it is enforceable only if its required enforcement mechanism exists within the target's control plane.

**Oracle:** For each conformance level declared in the specification:
1. Identify what enforcement points it claims.
2. Verify that the target repository contains the infrastructure to provide those enforcement points.
3. Any conformance level that claims enforcement through infrastructure the target does not own (e.g., a first-party inference gateway when none exists) is a FAIL.

Repository evidence inputs: presence/absence of `harness/`, `governance/`, `contracts/`, `server/ai/` content, and runtime gateway code. If the specification defines only one conformance level that requires all invariants including runtime-gateway-dependent ones, and no such gateway exists, FAIL.

### CHK-15 — Single-Authority State

No mutable state (especially budget/counter state) may be authoritative in more than one location without a defined reconciliation or single-source-of-truth rule. Duplicated authority creates divergence and permits the weaker copy to be used as the authoritative one.

**Oracle:** Identify state concepts (budget, counter, authority envelope) that appear in multiple schemas or invariants as independently maintained values. If more than one location is authoritative for the same state and no reconciliation rule designates one as the single source of truth, FAIL.

### CHK-16 — Source Conflict

No normative obligation in the specification may contradict the repository's governing sources: `AGENTS.md`, System Architecture amendments, or the repository's existing CI/review contracts.

**Oracle:** For each obligation class in the specification, verify:
- No obligation requires committing evidence that `AGENTS.md` prohibits from being committed.
- No obligation weakens exact-head verification, bounded change size, separate merge authority, or bounded review convergence.
- No obligation contradicts the analytics restrictions in `AGENTS.md`.
If the specification does not define an evidence lifecycle that establishes compatibility with `AGENTS.md` security rules, this check cannot PASS — the absence of a lifecycle means compatibility cannot be established.

### CHK-17 — Self-Mergeability

The specification MUST include a stated decomposition or incremental activation sequence whose individual increments can each satisfy the target repository's change-size rules. A specification that requires implementation but provides no path to implement it within the repository's own constraints is not mergeable.

**Oracle:** Search for a decomposition sequence, incremental activation plan, or PR-sizing guidance. If none exists, FAIL.

---

## 2. Verdict Rules

- **PASS:** Every check from CHK-01 through CHK-17 returns PASS.
- **FAIL:** Any check returns FAIL. The overall disposition is FAIL, and the specification MUST NOT be locked.
- **WARN:** A check identifies a concern that does not rise to FAIL but should be addressed before lock. WARNs do not block lock alone but accumulate risk.

The regression report MUST list every check, its verdict, and its evidence.

---

## 3. Falsifiability Verification

After running this contract against a candidate, verify that at least one check genuinely PASSed. If every check FAILed, this contract is suspect — it may have been shaped to the defect list rather than derived from general properties. In that case, the contract itself must be reviewed before its FAIL verdicts are treated as authoritative.

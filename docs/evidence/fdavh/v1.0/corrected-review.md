# FDAVH v1.0 — Corrected Specification Review

**Artifact under review:** Full Deterministic Agent Verification Harness (FDAVH), Normative Specification v1.0 — PROPOSED FOR LOCK  
**Candidate SHA-256:** `e6228f669cc8b7d921b165752745a456eb7941ac43869985d1adfd7b64e38361`  
**Review date:** 2026-08-28  
**Target repository:** `Lvvphole/becoming-the-man`  
**Repository baseline:** `main = 0e715911baeff97304250a0fa33feb72169a91ea`  
**Status of this document:** Corrected review; supersedes `FDAVH-v1.0-specification-review.md` for decision use.  
**Companion evidence:** `check_fdavh_v1_structural_claims.py` and its JSON output. The checker machine-verifies only stated structural claims. It is not the frozen FDAVH acceptance oracle and does not certify semantic correctness.

---

## 0. Verdict

# REJECT — DO NOT LOCK FDAVH v1.0 AS WRITTEN

The central disposition of the prior review survives correction: FDAVH v1.0 is not ready to lock for implementation against the current `becoming-the-man` deployment boundary.

The reason is not that the control model is unsound. Much of the governance, evidence, bounded-recovery, reversibility, and independent-completion design is strong. The blocking problem is that v1.0 combines:

1. controls that the repository can actually enforce today at the repository/CI boundary; and
2. controls that require a first-party inference/runtime gateway the repository does not currently own.

The specification then treats both planes as simultaneously required for conformance. At the current integration point, several provider/runtime properties cannot be established.

The corrected finding set is:

- **3 blocking defects**
- **6 material specification/control defects**
- **3 structural loop defects**
- **1 methodology defect in the pre-lock verification model**

The previous review contained four evidentiary defects that are removed here:

1. the gate count was written as 13; the candidate contains **14 gates, G0–G13**;
2. the statement that AGENTS.md forbids all AI-transcript export was too broad;
3. the claim that `return BLOCKED` satisfies approximately 46/48 acceptance cases was unsupported and is withdrawn;
4. the claim that implementation would be `4,000+` reviewable lines was an estimate presented too strongly and is withdrawn as measured evidence.

The crosswalk count is no longer inspection-only. The companion checker confirms **74 invariant rows, 48 acceptance cases, 41 acceptance cases referenced from the crosswalk, and 7 orphaned acceptance cases**.

---

## 1. Verified repository enforcement boundary

At the frozen baseline, the current repository-side enforcement plane is real but downstream of the third-party coding runtime.

The repository has:

- root `AGENTS.md` governance;
- `.github/workflows/pr-verification.yml`;
- `scripts/check-change-size.sh`;
- an active GitHub ruleset on the default branch.

The workflow binds verification to the exact tested SHA:

```bash
tested_sha="$(git rev-parse HEAD)"
test "$tested_sha" = "$EXPECTED_SHA"
echo "PASS: PR Verification tested exact SHA $tested_sha"
```

The active GitHub ruleset requires `PR Verification`, applies a strict up-to-date status policy, requires pull requests, prevents deletion/non-fast-forward updates, has no bypass actor, and reports that the current user cannot bypass it.

The approved System Architecture Amendment v1.2 explicitly identifies the three-cycle Codex cap as a **liveness control** and requires the automated repair/re-review process to stop `BLOCKED` after a cycle-3 actionable finding absent new user authorization.

### Trust-topology correction

The current strongest non-model-owned control is the **GitHub repository ruleset**, with CI as the repository's verification surface. This is more precise than saying "CI alone is the root of trust."

The workflow definition itself is repository-controlled code and therefore must also be protected against self-weakening. A Profile A design should treat:

```text
external GitHub ruleset
        +
required status check identity
        +
protected verifier-definition governance
```

as the current repository-side enforcement anchor.

`AGENTS.md` remains the governance router and behavioral constitution. It is not, by itself, a non-bypassable runtime policy-enforcement point.

---

## 2. Over-engineering / scope mismatch

### 2.1 Machine-confirmed counts

The candidate contains:

- **74 invariants**
  - I1–I24 = 24
  - IV1–IV18 = 18
  - R1–R16 = 16
  - MR1–MR16 = 16
- **14 gates:** G0–G13
- **48 acceptance cases:** AC-01–AC-48

The 34 inference/model-routing invariants are correctly counted:

```text
IV1–IV18 = 18
MR1–MR16 = 16
total = 34
```

G2–G6 are the five gates most directly tied to model routing, inference dispatch, context binding, provider dispatch, and response admission.

### 2.2 Current deployment does not own the required inference plane

The repository does not presently contain a first-party coding-agent inference gateway that can prove:

- all model calls traverse one authorized gateway;
- the agent runtime has no alternate provider route;
- provider credentials are unavailable to the untrusted runtime;
- provider receipts are always available to the repository;
- model routing is under repository-owned mediation.

The critical example is **IV10 — Provider-Bound Execution Path**. A repository cannot truthfully prove IV10 while Claude Code, Codex, or similar third-party runtimes own their provider connections outside the repository's control boundary.

IV11/AC-16 are more nuanced than the prior review stated: AC-16 blocks only when provider receipts are required by the configured evidence policy. The decisive current incompatibility is not simply "no receipt"; it is the lack of a non-bypassable first-party inference path required by the stronger runtime profile.

### 2.3 Correct scope model

Do not delete the inference invariants. Split conformance by enforcement locus.

**Profile A — REPOSITORY-BOUNDARY-CONFORMANT**

Normative for the current repository. It includes only controls whose required evidence and enforcement point can actually be established at the repository/GitHub boundary, plus governance rules that are clearly labeled as behavioral unless externally enforced.

**Profile B — OWNED-RUNTIME-CONFORMANT**

Normative only when a first-party supervisor/gateway/sandbox exists and the deployment can prove complete mediation of model/tool/provider operations.

**FULL-CONFORMANT**

Requires both Profile A and Profile B.

The split MUST be performed per control/enforcement point, not by blindly declaring all I1–I24 current and all IV/MR deferred. Some runtime/action invariants also require a first-party supervisor to be security-enforced rather than merely instructed.

For the current deployment, Profile B is **deferred**, not silently PASSed and not deleted.

---

## 3. Blocking findings

### B1 — Missing positive liveness / progress obligation

**Status: BLOCKING — confirmed conceptually; prior numerical claim withdrawn.**

FDAVH has strong safety and stop semantics but no positive invariant requiring a valid, authorized, nonterminal run with available evidence and enabled safe transitions to make progress toward completion.

The state machine structurally contains a path to `COMPLETED`, but the normative invariant set does not require that a conforming controller eventually take a progress transition when one is available.

The prior claim that `return BLOCKED` would satisfy approximately 46 of 48 acceptance cases is **withdrawn**. The companion checker finds only **12 of 48 acceptance oracles explicitly contain the token `BLOCKED`**. That fact does not establish how many cases a trivial blocker would satisfy. The defect is qualitative: the specification lacks a positive liveness property.

This matters because the approved v1.2 architecture explicitly names bounded Codex convergence as a liveness control.

#### Required fix

Add:

**I25 — Authorized Progress and Finite Resolution**

> If a nonterminal run has at least one safe, authorized, enabled transition and all evidence required for that transition is available, the supervisor MUST NOT choose `BLOCKED`. It MUST execute an enabled progress transition within the applicable bounded horizon. Every run MUST eventually reach `COMPLETED`, justified `BLOCKED`, or `TERMINATED`.

Add positive acceptance cases, at minimum:

- **AC-49:** fully authorized happy path reaches `COMPLETED`;
- **AC-50:** every reachable nonterminal state has at least one valid next transition or a specifically justified blocker;
- recovery-success-to-completion case;
- zero-effect/read-only completion case.

`BLOCKED` must require a named blocker class and evidence, not absence of a decision.

---

### B2 — Evidence lifecycle is underspecified; compatibility with governing security rules cannot be established

**Status: BLOCKING — corrected from "direct source conflict."**

The prior review overstated AGENTS.md. The governing file says:

- never commit secrets, production credentials/data, private exports, or sensitive evidence;
- do not send raw email, contact text, assessment answers, AI transcripts, or sensitive relationship content **to analytics**.

That is not a blanket prohibition on every protected transient use of a model transcript.

FDAVH nevertheless leaves a real lock blocker. IV12, S4, S6, TB7, trajectory evidence, and replay/tamper requirements are specified without a normative lifecycle covering:

- sensitivity classification;
- data minimization;
- redaction;
- transient versus durable storage;
- encryption/access control;
- repository admissibility;
- analytics prohibition;
- retention horizon;
- deletion;
- incident retention;
- evidence-reference semantics.

`raw_response_digest` does not itself require storing the raw response permanently. Likewise, replay/tamper testing can use deterministic fixtures and does not prove that production payloads must be retained. The defect is that the specification does not tell an implementation which evidence may be stored, where, or for how long.

#### Required fix

Add **§8.2 Evidence Classification, Minimization, Storage & Retention** with a rule such as:

```text
secret/credential material
→ never persisted in trajectory payload
→ redact before durable observation

sensitive model/tool/user payload
→ protected transient store only unless explicit policy authorizes retention
→ never committed to Git
→ never analytics

durable repository evidence
→ digests, IDs, classifications, verdicts, non-sensitive metadata

raw response
→ capture transiently when required
→ bind digest before transformation
→ retain payload only under explicit evidence-class policy
```

E-class evidence MUST inherit or exceed the sensitivity classification of the underlying source content.

Until that lifecycle exists, the repository cannot establish that a Profile B implementation will satisfy both FDAVH evidence requirements and existing security governance.

---

### B3 — G0 entry is not currently non-bypassable

**Status: BLOCKING — confirmed.**

FDAVH correctly declares that prompt instructions are not a security boundary. Its proposed AGENTS.md amendment nevertheless says every coding-agent run must enter through the harness before inference or mutation.

That sentence is governance, not enforcement.

The repository currently does not own the process that launches Claude Code/Codex, nor a mandatory pre-inference gateway through which all of their provider/tool traffic must pass.

Therefore:

```text
AGENTS.md says use harness
```

cannot establish:

```text
all runtime actions were forced through harness
```

The current repository-side enforcement anchor is downstream: protected GitHub rules + required verification on the candidate.

#### Required fix

Profile A MUST explicitly anchor conformance to controls the repository currently owns.

Profile B MUST state a **precondition for activation**:

> A separately trusted supervisor/gateway must be the mandatory execution entrypoint, and the untrusted agent must lack an alternate path to protected provider/tool/effect capabilities.

The spec must not claim Profile B conformance until that is evidenced.

The root-of-trust language should also distinguish:

- external GitHub branch/ruleset enforcement;
- repository-owned workflow/verifier code;
- future first-party runtime supervisor;
- third-party coding runtime.

Verifier-definition changes themselves must be protected so an agent cannot satisfy a named required status by weakening the check implementation.

---

## 4. Material specification/control findings

### G4 — Crosswalk is one-directional

**Status: MACHINE-CONFIRMED.**

The companion checker confirms:

```text
Invariant crosswalk rows: 74
Acceptance cases: 48
Acceptance cases referenced by ≥1 invariant row: 41
Orphaned acceptance cases: 7
```

The seven are:

```text
AC-08
AC-10
AC-22
AC-23
AC-26
AC-39
AC-48
```

This is a structural fact about §18.

The previous review went too far when it treated some of these as definitively requiring entirely new invariants. The first correction is simply **bidirectional ownership closure**:

```text
every invariant → ≥1 acceptance case
every acceptance case → ≥1 owning invariant
```

Likely mappings include:

- AC-08 → MR3;
- AC-10 → MR7 / R12;
- AC-22 → I3/I4/I5 plus effect-boundary revalidation;
- AC-23 → trusted reversibility classification / I2;
- AC-26 → I3/I5 + termination semantics;
- AC-39 → I1/I9/I23 + unblock transition;
- AC-48 → I6.

Whether any of these requires a new invariant should be decided during v1.1 design, not inferred from the missing crosswalk reference alone.

---

### G5 — Load-bearing terms lack deterministic decision procedures

**Status: MATERIAL.**

The following terms carry normative effect but lack an adequate machine decision procedure:

- `materially new evidence`;
- `losslessly compiled` normative prose;
- `smallest authoritative section sufficient for the task`;
- `semantic equivalence` of authoritative context.

The strongest defect is `materially new evidence`, because it gates recovery and anti-loop behavior.

`S7.materially_new_evidence: boolean` is not an oracle. It merely serializes a judgment.

#### Required fix

Define a canonical failure signature, for example:

```text
failure_signature = hash(
  failed_invariant_ids,
  failure_class,
  normalized_error_or_status,
  state_before_digest,
  state_after_digest,
  relevant_resource_identity
)
```

Then define a deterministic baseline rule:

```text
materially_new_evidence =
  verified decision-relevant evidence changes the canonical failure signature
  OR independently falsifies a previously recorded causal hypothesis
```

Non-qualifying examples:

- model rephrasing;
- higher model confidence;
- retry number;
- timestamp;
- same logs under same state;
- same error with no new state/evidence delta.

For normative context, do not require a runtime to prove arbitrary prose-equivalence. Route exact canonical sections or canonical machine records by digest. If required material does not fit within the permitted context strategy, split the stage or become `BLOCKED`.

R7 should be resolved at design time by a route registry rather than by asking the model to determine the "smallest sufficient" authoritative section on each run.

---

### G6 — Closed-world state machine has targeted structural holes

**Status: MACHINE-CONFIRMED for the listed structural facts.**

The companion checker confirms:

- `AWAITING_APPROVAL` does not exist;
- `INFERENCE_EXECUTING` has no explicit provider error/timeout/no-response exit;
- there is no direct zero-effect completion transition from `PROPOSAL_ADMITTED` to `COMPLETION_EVALUATION`;
- `BLOCKED` has one external-unblock row whose destination is the combined expression `GOVERNANCE_ROUTED or DELEGATED`.

Those are incompatible with the specification's claim that unenumerated transitions are denied unless the missing behaviors are intended to be impossible.

#### Required fix

Add explicit transitions for:

**Provider failure**
```text
INFERENCE_EXECUTING
→ RECOVERABLE_FAIL | BLOCKED | TERMINATED
```
according to a defined failure class and policy.

**Approval wait**
```text
PROPOSAL_ADMITTED → AWAITING_APPROVAL
AWAITING_APPROVAL → ACTION_AUTHORIZED | BLOCKED | TERMINATED
```

**Zero-effect/read-only completion**
```text
PROPOSAL_ADMITTED → COMPLETION_EVALUATION
```
when no effect is required and the task postcondition is already independently satisfied.

**Typed BLOCKED**
Add a blocker class such as:

```text
AUTHORITY
EVIDENCE
CAPABILITY
ROUTE
EXTERNAL_DEPENDENCY
RECOVERY_EXHAUSTED
POLICY_CONFLICT
```

Then distinguish resume transitions by blocker class instead of one ambiguous two-destination transition.

---

### G7 — Concurrency / run isolation is absent

**Status: MATERIAL.**

The candidate has no concurrency section and the companion checker finds no `concurr*` term. Absence of the word alone is not the proof; the substantive finding is that no invariant, state-machine rule, schema, or acceptance case establishes isolation between two simultaneous mutating runs.

Two individually conforming runs can still interfere if they share:

- one mutable checkout;
- one branch;
- one database state;
- one deployment target;
- one lease-less external resource.

#### Required fix

Add:

**I26 — Run Isolation and Concurrent Mutation Safety**

> Every mutating run MUST bind to an immutable base identity and an isolated writable workspace. Shared mutable resources MUST use a deterministic lease, version, idempotency, or conflict-detection mechanism. A stale or conflicting writer MUST fail closed.

Add adversarial tests for two simultaneous runs against the same repository/resource.

---

### G8 — Authority validity is not rechecked at the effect boundary

**Status: MATERIAL.**

AC-22 addresses path/target TOCTOU. The same class of problem exists for authorization itself: an S1 envelope or approval may expire or be revoked after G7 authorizes an action but before G8 executes it.

#### Required fix

Strengthen I4/I5/G8 rather than necessarily adding another top-level invariant:

```text
Immediately before effect:
- revalidate delegation/envelope validity;
- revalidate approval validity;
- revalidate budget/lease;
- revalidate canonical target;
- rebind execution to the exact authorization digest.
```

Add a new acceptance case for authorization expiring or being revoked between authorization and effect.

---

### G10 — Implementation decomposition is required; no measured 4,000-line claim is available

**Status: MATERIAL — corrected.**

There is no implementation yet, so the prior `4,000+ reviewable lines` statement was not measured evidence.

What is verified from repository governance is the **1,000 reviewable implementation-line PR cap**, with explicit exception mechanics.

The proposed implementation surface contains multiple counted file classes (`governance/*.yaml`, `contracts/*.json`, harness code, tests, workflows). It is therefore reasonable to require decomposition before Build, but not to assert a final line count before the code exists.

#### Required fix

v1.1 should include a normative incremental activation sequence whose increments are independently safe and verifiable.

For example:

1. machine contracts and artifact checker;
2. repository governance/profile declaration;
3. repository-boundary evidence verifier;
4. liveness/recovery controls that can actually be enforced at that boundary;
5. Profile B only after an owned runtime supervisor/gateway exists.

Each implementation PR remains subject to the existing measured change-size gate. If a coherent increment cannot fit safely, use the existing explicit exception path rather than weakening the control.

---

## 5. Structural loop defects

### L1 — Per-step model rerouting has zero decision content in a single-model deployment

The state machine currently routes:

```text
EFFECT_VERIFIED → MODEL_SELECTED
```

when more work remains.

For a single-model configuration, this re-runs routing machinery without a meaningful choice.

#### Fix

```text
single-model / unchanged route:
EFFECT_VERIFIED → INFERENCE_AUTHORIZED

adaptive reroute:
EFFECT_VERIFIED → ROUTE_REEVALUATION → MODEL_SELECTED
```

Only registered reroute triggers should invoke G2 again.

---

### L2 — Budget truth is duplicated without one authoritative ledger

Budget state is represented in multiple locations: I16, IV9, MR13, S1, S4, S7, and S8.

The problem is not merely repetition. I16 says budgets are non-resettable, but the spec does not define which representation is authoritative when projections disagree.

#### Fix

Create one supervisor-owned monotonic **BudgetLedger**:

```text
budget_id
version
run_id
initial_limits
consumed
remaining
inference_calls
tool_calls
recovery_attempts
reroutes
elapsed_time
cost
mutations
changed_surface
previous_digest
ledger_digest
```

Other records reference `budget_version` + `budget_digest`; they do not maintain independent authority.

Add an acceptance case in which S4/S7/S8 disagree with the ledger and verify that the authoritative ledger wins and tamper/drift is detected.

---

### L3 — Failure learning has three normative write declarations for one event

I21, IV17, and MR11 each require learning evidence on failure. Their intent is correct, but three independent writers would create duplicate or diverging S7 records.

#### Fix

Make G10 the single idempotent emission point:

```text
failure observed
→ normalize source
→ compute failure_id
→ create exactly one S7
```

I21/IV17/MR11 become boundary-specific obligations that all invoke the same G10 record creation, not separate storage implementations.

Likewise, I15/I24/MR13/AC-32 should share one canonical `RecoveryEligibility` calculation instead of separate implementations of "no new evidence → stop."

---

## 6. Corrected pre-lock verification model

The previous FDAVH regression process conflated specification linting with implementation TEVV. v1.1 needs three distinct assurance layers.

### 6.1 Layer A — Artifact structural conformance, pre-lock

Machine-checkable facts about the Markdown specification itself, including:

- required invariant IDs present exactly once;
- gate IDs and schema IDs complete;
- bidirectional invariant↔acceptance ownership;
- state names and transition references structurally valid;
- required positive-liveness invariant/cases present;
- no known unowned acceptance cases;
- one declared authoritative budget source;
- each normative load-bearing term has a declared decision procedure;
- each conformance profile states its enforcement preconditions;
- no profile claims controls outside its owned enforcement plane.

The companion checker supplied with this corrected review confirms only a subset of these claims against v1.0. It is a reproducibility utility, not the final frozen acceptance contract.

### 6.2 Layer B — Governing-source no-regression review, pre-lock

Review the specification against the exact repository governance sources, including at minimum:

- AGENTS.md;
- System Architecture v1.0 and amendments v1.1/v1.2;
- current required GitHub rules;
- current PR Verification contract.

This layer is partly semantic and cannot be reduced to string matching.

The artifact must not weaken:

- exact-head CI evidence;
- 1,000-line reviewability;
- owner-authenticated exception;
- three-cycle Codex liveness cap;
- separate merge authority;
- security restrictions on sensitive evidence.

### 6.3 Layer C — Implementation TEVV, post-build

Only after an implementation exists can the project execute:

- gate unit/property tests;
- sandbox containment;
- provider-gateway qualification;
- replay/tamper;
- fault injection;
- TOCTOU;
- concurrent-run conflicts;
- BLOCKED quiescence;
- kill-switch behavior;
- AC suite;
- end-to-end exact-candidate completion.

Therefore AC-01–AC-48 are not, by themselves, a sufficient pre-lock regression suite for a specification-only artifact.

### 6.4 Evaluator discipline

The final artifact-level acceptance contract must be frozen independently **before** changing v1.0 into v1.1.

If the candidate fails:

```text
change candidate
```

not:

```text
change checker until candidate passes
```

Any change to the frozen evaluator after seeing candidate failures must itself be reviewed as an evaluator-version change and rerun against the unchanged baseline.

---

## 7. What remains strong and should be preserved

The correction does not discard the strongest parts of FDAVH.

Preserve:

- E0–E9 evidence-class hierarchy;
- model assertions as non-authoritative evidence;
- independent completion authority;
- action reversibility classification from a trusted source;
- worst-class-wins composition;
- `FAILURE MUST trigger learning`;
- `LEARNING MUST NOT create authority`;
- bounded, reversible recovery;
- `BLOCKED MUST NOT trigger exploration`;
- verifier-owned state transitions;
- exact route/source binding;
- memory as advisory rather than normative;
- producer cannot grant its own PASS;
- correct output reached through a noncompliant trajectory cannot PASS;
- explicit stop conditions when a required trust boundary cannot be established.

These are the design core of the harness.

---

## 8. Corrected recommended disposition

1. **Reject FDAVH v1.0 for lock.**
2. **Freeze the artifact-level acceptance contract and structural checker before editing the candidate.**
3. Run that evaluator against exact v1.0 and preserve the expected FAIL evidence.
4. Author **FDAVH v1.1** to repair the candidate, not the evaluator.
5. v1.1 should include at minimum:
   - enforcement-locus Profile A / Profile B split;
   - **I25 Authorized Progress and Finite Resolution**;
   - **I26 Run Isolation and Concurrent Mutation Safety**;
   - §8.2 evidence lifecycle;
   - deterministic failure-signature/material-new-evidence rule;
   - bidirectional acceptance ownership;
   - explicit provider-error transitions;
   - `AWAITING_APPROVAL`;
   - zero-effect completion;
   - typed BLOCKED reasons/resume guards;
   - effect-boundary authority revalidation;
   - one BudgetLedger;
   - one S7 emission path;
   - single-model fast path;
   - incremental implementation/decomposition requirements.
6. Re-run the unchanged frozen artifact evaluator.
7. Lock v1.1 only if that exact artifact passes and no unresolved governing-source conflict or unimplementable current-profile claim remains.
8. Implement only the conformance profile whose enforcement plane actually exists.
9. Preserve existing exact-head CI, review convergence, change-size, and human merge authority throughout implementation.

---

## 9. Machine-verified structural facts used by this review

The companion reproducibility checker produced the following results against candidate SHA-256
`e6228f669cc8b7d921b165752745a456eb7941ac43869985d1adfd7b64e38361`:

```text
invariant crosswalk rows                         74
expected invariant IDs                           74
missing invariant IDs                             0
extra invariant IDs                               0

gate count                                       14
gate IDs                                         G0–G13

acceptance case count                            48
acceptance cases referenced by crosswalk         41
orphan acceptance cases                           7
orphans                                          AC-08, AC-10, AC-22,
                                                 AC-23, AC-26, AC-39,
                                                 AC-48

acceptance oracles containing literal BLOCKED    12

AWAITING_APPROVAL state                           absent
explicit provider-error/timeout exit
from INFERENCE_EXECUTING                          absent
direct zero-effect completion transition
from PROPOSAL_ADMITTED                            absent
concurrency term occurrences                       0
```

The checker does **not** establish:

- that any semantic invariant is correct;
- that the seven orphan cases require new invariants;
- that all state-machine semantics are complete;
- that NIST alignment is valid;
- that any runtime control works;
- that the implementation would pass AC cases;
- that the implementation size will exceed any particular line count.

Those remain separate evidentiary questions.

---

## Appendix A — Corrected findings index

| ID | Severity | Corrected finding |
|---|---|---|
| B1 | **Blocking** | No positive authorized-progress/finite-resolution invariant; prior `~46/48` claim withdrawn |
| B2 | **Blocking** | Evidence lifecycle/storage/retention is underspecified; governing-security compatibility cannot be established |
| B3 | **Blocking** | Current deployment has no non-bypassable G0 pre-inference entrypoint; prompt governance is not enforcement |
| G4 | Material | Crosswalk reverse closure fails: 7 orphan acceptance cases, machine-confirmed |
| G5 | Material | Load-bearing deterministic decision procedures are missing |
| G6 | Material | Closed-world state machine omits provider-failure, approval-wait, zero-effect completion, and typed unblock routing |
| G7 | Material | Concurrent mutation/run isolation is not governed |
| G8 | Material | Authority validity is not explicitly revalidated at effect time |
| G10 | Material | Implementation needs measured decomposition under the 1,000-line rule; prior `4,000+` estimate withdrawn |
| L1 | Loop | Per-step model rerouting is redundant for unchanged/single-model routes |
| L2 | Loop | Multiple budget representations lack one authoritative monotonic ledger |
| L3 | Loop | Failure-learning persistence should have one idempotent writer |

---

## Appendix B — Corrections from the superseded review

| Superseded statement | Corrected statement |
|---|---|
| `G2–G6 (5 of 13)` | `G2–G6 (5 of 14)` |
| `return BLOCKED satisfies ~46/48` | Unsupported; withdrawn. There is no positive liveness invariant. The checker only establishes that 12 AC oracles literally mention BLOCKED. |
| `AGENTS.md forbids exporting AI transcripts` | AGENTS prohibits sensitive evidence in Git and raw/sensitive content in analytics; FDAVH lacks the lifecycle policy required to establish compatible evidence handling. |
| `implementation is 4,000+ reviewable lines` | No implementation exists, so no measured size exists. A decomposition contract is required because counted implementation files remain subject to the existing 1,000-line gate. |
| `7 orphans by inspection` | 7 orphans machine-confirmed by the companion structural checker. |
| `CI plus branch protection is the root of trust` | External repository rules are the strongest current non-model-owned anchor; CI is the verifier surface but its definition also requires protection against self-weakening. |
| `Profile A = all I + R invariants` | Conformance must be classified per enforcement locus; no invariant may be called security-enforced where the required enforcement point does not exist. |

---

**Final review disposition:** `REJECT — FDAVH v1.0 MUST NOT BE LOCKED.`

**Permitted next artifact:** frozen artifact-level acceptance contract/checker, followed by a v1.1 candidate that repairs the identified defects without changing that evaluator merely to obtain PASS.

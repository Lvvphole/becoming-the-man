# Learning Corpus: Skills Folder Routing (PRs #17, #18)

Status: CLOSED — review-repair non-convergence, abandoned by owner decision.

## What was attempted

Add `.claude/skills/` with three skills (engineering-rules, plan, scout-agent) and
correct routing in CLAUDE.md/AGENTS.md.

## PR #17 — engineering-rules skill

Branch: `claude/skills-folder-routing-setup-rdvrc7`
Final head: `9ffa67c`
Codex cycles: 3 (cap reached)
Disposition: BLOCKED at cycle 3 with 6 unresolved P2 findings

### Cycle history

| Cycle | Findings | Fixed | Residual |
|-------|----------|-------|----------|
| 1     | 3 P2     | 3     | 0        |
| 2     | 5 P2     | 5     | 0        |
| 3     | 6 P2     | 0     | 6 (BLOCKED) |

## PR #18 — plan + scout-agent skills

Branch: `claude/plan-scout-agent-skills`
Final head: `de7cad3`
Codex cycles: 3 (cap reached, then authorized split+reduce for cycle 3 fixes)
Disposition: BLOCKED — review-repair non-convergence

### Cycle history

| Cycle | Findings | Fixed | Residual |
|-------|----------|-------|----------|
| 1     | 3 P2     | 3     | 0        |
| 2     | 4 P2     | 4     | 0        |
| 3     | 2 P2     | 2     | 0 (but pattern predicted more) |

## Observation

Three successive review cycles produced multiple new, valid P2 findings after
each repair in both PRs. Each local correction exposed another defect in the
corrected surface. The 3-cycle cap correctly detected non-convergence.

## Diagnosis

### What was correctly detected

Two complexity sources:

1. **PR #17 (gate script):** The verifier consists of accumulating textual
   heuristics. Each new exception requires another special case, producing
   change amplification — a seemingly local change requires changes elsewhere,
   and incremental patches make the system progressively harder to reason about.

2. **PR #18 (skill specifications):** Natural-language prose was being reviewed
   for machine-actionable precision. Each tightened formulation introduced a
   new surface for the reviewer to find the next level of ambiguity.

Both point toward a representation and verification problem: the artifacts
were being patched at the wrong abstraction level and reviewed against an
insufficiently bounded contract.

### What non-convergence does not establish

The observation that three repair cycles did not converge does not establish
that convergence is impossible. Neither heuristics nor English prose imply an
infinite repair process.

Specification refinement is finite when:
- The bounded contract is frozen.
- Each required behavior has an objective oracle.
- The required acceptance partitions are covered.
- No known finding violates that contract.

The process appeared infinite because the reviewer was implicitly asked "find
anything that could theoretically be more complete" — an unbounded oracle. No
artifact can prove completion against an unbounded oracle.

### What non-convergence does establish

Repeated unsuccessful correction is a reason to stop treating symptoms. The
correct response is to reproduce the failure pattern, reduce the case, isolate
the relevant cause, and test causal hypotheses — not to lower verification
standards because repair is expensive.

## Rejected conclusions

### "Gate on P1 only; treat P2 as advisory"

UNSAFE AS WRITTEN. P2 does not inherently mean "harmless." Previous P2
findings in these PRs included incomplete collision behavior, contradictory
validation semantics, insufficient acceptance coverage, and revision-binding
weaknesses. Some could change behavior or invalidate evidence.

The correct release question is not "Is this P1 or P2?" but "Does this finding
violate a frozen requirement, invariant, acceptance case, safety property, or
required evidence condition?" If no, it can be deferred. If yes, its severity
label does not make it safe to ignore.

Deferral authority comes from contractual consequence and accepted risk, not
from the label alone. (SC-001: correctness and the authorized contract before
style. RT-006: do not weaken valid verification to make a candidate pass.)

### "Don't send this kind of code to this kind of reviewer"

UNSAFE AS WRITTEN. The reviewer found real specification defects. Removing
specification review because the reviewer finds real defects is not a sound
repair.

Runtime tests answer: "Does this implementation satisfy these tested behaviors?"
Static specification review answers different questions: "Is the contract
internally contradictory? Is an obligation undefined? Can two reasonable
implementations interpret it differently? Is the acceptance oracle missing a
required case?" Running the artifact cannot establish those properties alone.

The valid idea inside this recommendation: the review oracle must match the
artifact and its bounded contract. The correction: bound the reviewer, do not
remove it.

## Corrected process for re-attempt

If these skills are re-attempted, the process should be:

1. **Stop broad patching.** Do not submit another broad repair candidate with
   the same scope.

2. **Freeze the contract.** Define the bounded contract each skill must satisfy.
   Separate normative obligations from explanatory prose. Give each normative
   obligation a finite acceptance oracle.

3. **Classify findings by violated invariant.** Do not automatically make one
   task per reviewer comment. Several comments can come from one underlying
   defect.

4. **Cluster by common cause.** Determine whether recurring findings share a
   structural cause.

5. **Split by independent causal or behavioral boundary.** Each split must be
   independently buildable and verifiable.

6. **Reduce each causal unit.** Preserve the failing case, isolate the smallest
   failure-inducing condition, create regression evidence for that behavior.

7. **Replace subjective prose checks with executable predicates where possible.**
   For the gate script: determine whether properties can be represented
   structurally instead of through additional textual pattern matching. For skill
   specifications: separate normative obligations from explanatory prose.

8. **Run bounded static review.** The reviewer's contract is: "Does this finding
   violate a frozen requirement, invariant, or acceptance case?" — not "Could
   this theoretically be more complete?"

9. **Run runtime acceptance.** Observable behavior verified by executable tests.

10. **Redesign only the subsystem whose reduced evidence shows local repair
    cannot close the contract.** (SC-002, SC-005, RT-003.)

## Summary

Three rounds of new, valid findings show that the repair process was not
converging. The correct response is not to lower the bar or remove the reviewer.
The correct response is to stop adding local exceptions, freeze the required
contract, separate blocking contract violations from nonblocking improvements,
reduce the failing surface, and determine whether the recurring findings share a
structural cause. Use bounded static review for specification and structural
defects, and executable acceptance tests for observable behavior. Redesign only
the subsystem whose reduced evidence shows that local repair cannot close the
contract.

Review fatigue is not acceptance authority.

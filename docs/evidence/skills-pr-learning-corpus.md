# Learning Corpus: Skills Folder Routing (PRs #17, #18)

Status: CLOSED — recursive review loop, abandoned by owner decision.

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

### Observation

Each fix cycle introduced new surface for the reviewer to critique. The gate
script (`check.py`) is a ~700-line heuristic analyzer; every behavioral fix
(e.g. block-comment detection, per-call mock scoping, deletion tracking)
expanded the attack surface for the next review. The reviewer found
progressively deeper edge cases in each new mechanism.

### Root cause pattern

**Expanding-surface loop.** Fixing a heuristic analyzer's false positives
requires adding detection logic, which itself becomes reviewable surface.
The reviewer treats each new mechanism as fresh code and finds new edge
cases in it. Net finding count does not converge.

## PR #18 — plan + scout-agent skills

Branch: `claude/plan-scout-agent-skills`
Final head: `de7cad3`
Codex cycles: 3 (cap reached, then authorized split+reduce for cycle 3 fixes)
Disposition: BLOCKED — recursive specification tightening

### Cycle history

| Cycle | Findings | Fixed | Residual |
|-------|----------|-------|----------|
| 1     | 3 P2     | 3     | 0        |
| 2     | 4 P2     | 4     | 0        |
| 3     | 2 P2     | 2     | 0 (but would generate more) |

### Observation

Each specification fix (e.g. making a dependency conditional, defining a
fingerprint algorithm, collapsing a disposition variant) created a tighter
contract that the reviewer then found new gaps in. The fingerprint went from
"bind to source revision" to "specific git commands" to "must hash file
contents not just names." The disposition went from "Return to Scout" to
"PLAN_BLOCKED: INVALIDATED" to "PLAN_BLOCKED with condition INVALIDATED."

### Root cause pattern

**Specification ratchet.** The reviewer treats each tightened specification
as a fresh contract and finds the next level of ambiguity or incompleteness.
Prose specifications have unbounded depth — there is always a more precise
way to say something. Without a finite acceptance criterion for specification
prose, the loop does not terminate.

## Structural lessons

1. **Heuristic code analyzers** should not be reviewed by a reviewer that
   treats every heuristic as a correctness contract. The false-positive
   rate of the analyzer and the false-positive rate of the reviewer compound.

2. **Prose specifications** reviewed for machine-actionable precision will
   always have a next level of ambiguity. Define a finite acceptance bar
   (e.g. "no P1 findings") or accept that specification prose is inherently
   approximate.

3. **The 3-cycle cap** correctly detected non-convergence in both cases.
   The cap is a termination condition, not a quality gate — it stops a loop
   that would not converge regardless of cycle count.

4. **Split did not help PR #18.** The split isolated the expanding-surface
   problem to PR #17, but PR #18's specification-ratchet problem was
   independent and persisted.

5. **Future approach:** Ship skills as minimal viable specifications with
   worked examples. Let usage feedback (not speculative review) drive
   tightening. Gate on P1 (correctness) findings only; treat P2
   (completeness/precision) as advisory.

# Becoming the Man She Can Trust — Website System Architecture Amendment v1.2

Status: **APPROVED IMPLEMENTATION-GOVERNANCE AMENDMENT**  
Approved: 26 August 2026  
Amends: Website System Architecture v1.0 — LOCKED, as amended by v1.1; specifically review convergence under A18-03, protected-branch refresh behavior under A18-04, and final evidence under A18-05.

The locked v1.0 architecture and v1.1 amendment remain authoritative in every area not explicitly amended below. This amendment does not change the product goal, user experience, release sequence, technology stack, data ownership, provider boundaries, Definition of Done, 1,000-line reviewability limit, exact-head CI requirement, independent Codex review requirement, or user merge authority.

## A18-03A — Bounded Codex review convergence

A Codex review cycle is one Codex review of a PR implementation state plus any implementation repair made in direct response to actionable findings from that review.

Without new explicit user authorization, a PR SHALL execute no more than **three Codex review cycles**.

1. Cycle 1 begins only after required CI is green for the exact PR head.
2. If Codex reports an actionable finding, a repair is permitted only when the finding is valid and the correction is specific, bounded, and evidence-backed. The repaired head must pass fresh required CI before the next Codex review.
3. The same rule governs cycle 2 and cycle 3.
4. If cycle 3 reports any actionable finding, the automated repair/re-review process SHALL stop immediately and the PR SHALL be reported `BLOCKED`. No implementation repair after that cycle-3 finding and no fourth Codex review cycle may occur in that PR unless the user explicitly authorizes a disposition: continue, split, reduce, redesign, or abandon.
5. Reaching the cycle limit never waives a P0, P1, or other actionable finding. A capped PR with an unresolved actionable finding is not merge-ready.
6. Documentation-only evidence updates that do not alter implementation, verification logic, or governance semantics neither consume a review cycle nor invalidate an otherwise current review.

This bound is a liveness control. It preserves independent review while preventing governance from authorizing indefinite fix-forward.

## A18-04A — Up-to-date-main refresh without false review invalidation

The requirement that a PR be up to date with `main` remains in force.

When synchronizing a PR with a newer `main` changes the PR head SHA:

1. Required CI SHALL rerun and pass on the new exact head SHA.
2. A prior Codex review MAY remain current only when the PR's **effective reviewable implementation diff** against the updated `main` is unchanged from the implementation diff that Codex reviewed.
3. Effective reviewable implementation diff uses the A18-01 definition of reviewable implementation lines and files. The changed-path set and resulting implementation contents must be equivalent after the refresh.
4. Any conflict resolution, manual edit, implementation-content change, verification-logic change, or governance-semantics change invalidates the prior Codex review and requires the next permitted review cycle after fresh CI.
5. If diff equivalence cannot be demonstrated, treat the implementation as changed and require a new Codex review.

A pure target-branch refresh that preserves the reviewed implementation diff therefore requires fresh exact-head CI but does not, by itself, consume another Codex review cycle.

## A18-05A — Final evidence additions

Final PR evidence SHALL continue to identify the final head SHA, change-budget result, required CI result, and final Codex review state. It SHALL additionally record:

- the Codex review cycle number;
- whether any review was carried forward across an up-to-date-main refresh; and
- when carried forward, the evidence that the effective reviewable implementation diff remained unchanged.

Evidence from an older SHA remains non-transferable for CI. Codex review transfer is permitted only by A18-04A's explicit diff-equivalence rule.

## Supersession boundary

Where v1.1 A18-03 or A18-04 can be read to require unbounded review repetition or unconditional Codex invalidation after a pure up-to-date-main refresh, this v1.2 amendment controls. All other v1.1 requirements remain unchanged.

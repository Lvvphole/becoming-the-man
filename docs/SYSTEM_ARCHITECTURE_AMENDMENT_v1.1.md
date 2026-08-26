# Becoming the Man She Can Trust — Website System Architecture Amendment v1.1

Status: **APPROVED IMPLEMENTATION-GOVERNANCE AMENDMENT**  
Approved: 26 August 2026  
Amends: Website System Architecture v1.0 — LOCKED, Section 18 (Deployment Topology and CI/CD) and repository implementation controls only.

The locked v1.0 architecture remains authoritative in every area not explicitly amended below. This amendment does not change the product goal, user experience, release sequence, technology stack, data ownership, provider boundaries, or Definition of Done.

## A18-01 — Bounded implementation change

A pull request SHALL contain no more than **1,000 reviewable implementation lines changed**, measured as additions plus deletions from the merge base with the target branch to the final PR head.

Reviewable implementation lines include source code, tests, scripts, SQL, configuration, schemas, and CI/workflow definitions. Markdown/documentation, dependency lockfiles, and deterministic generated framework/build artifacts are excluded from the count.

Work above the limit SHALL be decomposed into independently verifiable pull requests unless the user explicitly authorizes an exception before merge. The exception must be recorded in the PR evidence; it is not implied by technical necessity or a passing build.

## A18-02 — Persistent exact-head verification

Every implementation PR SHALL run repository-committed CI. Verification evidence is valid only for the exact final PR head SHA that produced it. Any new implementation commit invalidates earlier CI completion evidence.

A PR SHALL NOT be declared `PASS`, complete, or merge-ready while a required check is missing, skipped, cancelled, or failing.

For the currently active R1-01 foundation, the persistent verification minimum is:

1. frozen dependency install from the committed lockfile;
2. 1,000-line change-budget gate;
3. lint;
4. typecheck;
5. unit/smoke tests;
6. production build; and
7. meaningful first-response SSR checks for `/` and `/book` without relying on hydration.

Later work SHALL add its applicable architecture-owned gates without weakening these accepted earlier-release regressions.

## A18-03 — Independent Codex review

After required CI is green, the exact final PR head SHALL receive a Codex code review. Any substantive implementation change after that review invalidates the review and requires the CI + Codex review cycle again.

A PR is not merge-ready while an actionable Codex finding remains unresolved. Documentation-only evidence updates that do not alter implementation, verification logic, or governance semantics do not invalidate an otherwise current review.

## A18-04 — Protected production branch

`main` SHALL require pull requests, require the **PR Verification** status check, and require branches to be up to date with `main` before merge. Repository CI defines the check; GitHub branch/ruleset configuration enforces it.

Until both the committed workflow and GitHub rules are active, verification governance is defined but merge enforcement is incomplete and SHALL NOT be represented as fully enforced.

## A18-05 — Merge authority and evidence

Verification and review establish technical eligibility only. They do not grant merge authority. Merge remains a separate user-authorized action.

Final PR evidence SHALL identify the final head SHA, change-budget result, required CI result, and final Codex review state. Evidence from an older SHA is non-transferable.

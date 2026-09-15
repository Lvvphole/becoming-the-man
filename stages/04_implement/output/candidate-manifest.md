# Stage 04 Candidate Manifest - INC-0 Atomic Authority and ICM Bootstrap

Status: CANDIDATE_READY_FOR_VERIFY
Stage: `04_implement`
PR: `48`
Merge base: `bfe440cef162182ca35af7744ef623b61f8eb8cd`
Parent anchor: `3ba97b3c3270897a9a2f5b341f3a6049310ab942`

## Authorized Surface

This candidate is confined to the 17 paths authorized by the supervising directive. The atomic Git tree includes every path below. Paths marked "reused anchor blob" were already compliant at the parent anchor and are carried into the same coherent tree without byte mutation.

| Path | Additions | Deletions | Atomic-tree disposition |
|---|---:|---:|---|
| `AGENTS.md` | 0 | 0 | reused anchor blob |
| `CLAUDE.md` | 0 | 0 | reused anchor blob |
| `CONTEXT.md` | 4504 | 206 | changed in atomic INC-0 tree |
| `stages/01_scout/CONTEXT.md` | 47 | 22 | changed in atomic INC-0 tree |
| `stages/02_plan/CONTEXT.md` | 47 | 34 | changed in atomic INC-0 tree |
| `stages/03_contract/CONTEXT.md` | 48 | 33 | changed in atomic INC-0 tree |
| `stages/04_implement/CONTEXT.md` | 44 | 37 | changed in atomic INC-0 tree |
| `stages/05_verify/CONTEXT.md` | 48 | 34 | changed in atomic INC-0 tree |
| `stages/06_review/CONTEXT.md` | 48 | 35 | changed in atomic INC-0 tree |
| `stages/07_release/CONTEXT.md` | 54 | 38 | changed in atomic INC-0 tree |
| `references/architecture/CONTEXT.md` | 62 | 28 | changed in atomic INC-0 tree |
| `references/engineering/engineering-rules.md` | 128 | 211 | changed in atomic INC-0 tree |
| `docs/Website_Product_Specification_v1.0_LOCKED.md` | 0 | 0 | reused anchor blob |
| `docs/Website_System_Architecture_v1.0_LOCKED.md` | 0 | 0 | reused anchor blob |
| `docs/SYSTEM_ARCHITECTURE_AMENDMENT_v1.1.md` | 0 | 0 | reused anchor blob |
| `docs/SYSTEM_ARCHITECTURE_AMENDMENT_v1.2.md` | 0 | 0 | reused anchor blob |
| `stages/04_implement/output/candidate-manifest.md` | 69 | 0 | changed in atomic INC-0 tree |

## Bootstrap Realization

- `CLAUDE.md -> AGENTS.md -> CONTEXT.md` remains single-rooted and non-circular.
- Root `CONTEXT.md` now realizes C1 as a closed route-row matrix with stable route IDs, exact selectors, closed predicates, Layer 3 bundles, evidence allowlists, target stages, and transition requirements.
- The seven Layer 2 stage contracts expose the C3 Markdown interface and fail-closed BLOCKED conditions.
- `references/architecture/CONTEXT.md` realizes C6 with the explicit `v1.0 -> v1.1 -> v1.2` supersession chain and active 500-LOC ceiling.
- `references/engineering/engineering-rules.md` exposes the required mathematical routing, input, evidence, transition, change-size, review, and Pre-Code Readiness gates.
- The Website Product Specification remains the canonical routed PRD beneath `AGENTS.md`.
- The active System Architecture source chain contains no 1,000-line ceiling; the active ceiling is 500.
- No `docs/evidence/**` file is loaded, modified, or promoted to authority.
- No application feature, test, build script, workflow, verifier, schema, or migration is mutated by this atomic commit.

## Reviewable Change-Size Attestation

At the parent anchor, the PR diff against merge base contains 207 reviewable implementation lines across 2 counted files under the exact exclusions in `scripts/check-change-size.sh`.

Every INC-0 atomic-tree mutation in this manifest is Markdown and therefore excluded by that gate. The projected post-commit reviewable implementation footprint remains 207 / 500.

This statement is an implementation attestation, not verification PASS. Stage 05 or persistent CI must execute the actual gate on the resulting exact head.

## Atomic Consistency

The candidate tree is constructed from parent `3ba97b3c3270897a9a2f5b341f3a6049310ab942` in one Git tree and one child commit. The branch ref must move only after the complete tree exists.

Required invariants at ref move:

```text
AuthorityRoot = AGENTS.md
TaskStageRouter = CONTEXT.md
StageContracts = {01_scout, 02_plan, 03_contract, 04_implement, 05_verify, 06_review, 07_release}
ArchitectureOrder = [v1.0, v1.1, v1.2]
ActiveReviewableLOCLimit = 500
EvidenceAuthority = false
INC0PathSet subset_of AuthorizedCandidatePaths
```

The final commit SHA is intentionally not embedded in this file; it is externally bound after commit creation to avoid self-reference.

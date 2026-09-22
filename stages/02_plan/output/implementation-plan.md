PLAN_READY

# Zero-Trust Repository Harness v1.2 — INC-3 Trusted Verification and Oracle Plan

## 1. Disposition

This artifact plans only INC-3 from the approved Eve Zero-Trust Engineering Harness v3.2 roadmap: trusted verification selection, an external mechanical verifier, verifier-owned oracle identity, evidence capture, resume revalidation, and the bounded two-repair loop.

It does not authorize implementation. It does not authorize INC-4 publication, INC-5 runtime acceptance, root-router cutover, product work, release, or merge.

## 2. Source binding

Planning mode: BROWNFIELD.

Target repository: `Lvvphole/becoming-the-man`

Bound repository revision:

`27228b8a81e3cd14b96b2d08bfc578ad12a2e317`

Observed current bindings at that revision:

| Source / workpiece | Git blob OID |
|---|---|
| `AGENTS.md` | `b3319d00d7fb489c7164f3a9af5577df710ce33e` |
| `CONTEXT.md` | `2dded90579c2ad7b491ab0072a44b030f94750c6` |
| `stages/02_plan/CONTEXT.md` | `96df11d70c3a067cdaa4caa511a979cbff4494da` |
| `.claude/skills/plan/SKILL.md` | `5b9325558cc0a792b2bf6e98fb7b018b30492d53` |
| `references/engineering/engineering-rules.md` | `67e1228ff4eb4d9646e1413d1fb208062359b72a` |
| `references/architecture/CONTEXT.md` | `56ac0b7f4e978ae3c237a8be9acc2b7afdb639f4` |
| `harness/package.json` | `398baf3e9a59d0521452fc7708c3ab7d6a4e5e82` |
| `harness/src/routing.ts` | `4d4321abb4e131a9359755c647ad8c76313451a8` |
| `harness/src/capability.ts` | `fd4a31b7c07336c1538372b034b90e5d25f31a12` |
| `harness/src/supervisor.ts` | `da4a0af0ab4e32631ef0a22a4a1b8f7ad018e7de` |
| `.github/workflows/pr-verification.yml` | `d735549a844c2bd0a9c482ca1da5f85088b90d89` |

Repository baseline is a clean GitHub commit; no staged, unstaged, or untracked working-tree state is part of this Plan binding.

Roadmap authority is the approved v3.2 harness plan merged historically at commit `cec892c99d9f97ecc8d97a247850558fa0909d91`. Its INC-3 slice and D12-D16/D20 are the selected user handoff for this Plan. Current repository governance controls wherever the historical roadmap and current repository differ.

Any stale binding before Stage 03 or Stage 04 requires re-plan or re-bind under the active lifecycle; it is not silently accepted.

## 3. Frozen outcome contract

### Goal

Add the smallest external mechanical verification layer that can select only trusted checks, execute them outside the untrusted candidate sandbox, bind raw evidence to the exact candidate and verifier identities, fail closed on stale resume, and permit at most two evidence-backed repairs.

### Desired state

```text
INC-1 deterministic routing
        |
        v
INC-2 signed capability + disposable Eve/Docker execution boundary
        |
        v
INC-3 trusted command selection
        |
        v
external mechanical verifier + hidden verifier-owned oracle
        |
        v
PASS | FAIL | BLOCKED evidence envelope
```

The model, candidate files, candidate tests, and candidate sandbox remain untrusted. They cannot select commands, rewrite the verifier/profile/oracle, manufacture PASS, or grant another repair.

### Definition of Done

- D3-01: verification commands are selected from a trusted closed catalog, never candidate/model text.
- D3-02: required checks are the union of baseline trusted checks, mechanically applicable path/routed checks, and already-trusted task-required command IDs.
- D3-03: an unknown required command ID or a routed verification obligation with no trusted command ID fails `BLOCKED_PROFILE_INCOMPLETE`.
- D3-04: verifier execution occurs outside the candidate workspace with no shared writable volume.
- D3-05: verifier binds `base_commit_oid`, `candidate_digest`, `target_profile_digest`, `verifier_profile_digest`, and `oracle_manifest_digest`.
- D3-06: each command records exact argv, cwd, exit code, stdout bytes and SHA-256, and stderr bytes and SHA-256.
- D3-07: verdict vocabulary is exactly `PASS | FAIL | BLOCKED`; model output and candidate-authored tests cannot independently create PASS.
- D3-08: the oracle manifest is verifier-owned, digest-bound, non-model-visible, non-candidate-writable, and cannot be nominated by the agent.
- D3-09: every durable resume revalidates current target main, authority bundle, routed skill, task contract/envelope, target profile, tool policy, verifier profile, Eve identity, model configuration, and frozen candidate digest when present.
- D3-10: governance drift returns to authority-read-only; frozen candidate drift blocks; tool/verifier/model/Eve drift requires a new run.
- D3-11: repair budget is exactly two; every repair requires materially new machine evidence; the same failure without new evidence blocks.
- D3-12: existing INC-1 routing and INC-2 execution/capability controls remain green and unchanged except for the minimum supervisor integration required to consume an INC-3 verifier result.
- D3-13: implementation remains at or below the repository 500 reviewable-line ceiling; target is <=400 lines for the complete INC-3 implementation PR.

### Non-goals

INC-3 does not implement a publisher, GitHub write capability, merge, deployment, release attestation, provenance signing, Jev/final mechanical acceptance authority, memory/database, additional agent, provider/model call in CI, root-router cutover, product feature, or INC-5 adversarial acceptance campaign.

## 4. Repository truth and measured gap

Current INC-1 supplies a compact deterministic `TaskContract`, path ownership, requirement routing, and minimum-check derivation. It is still a shadow routing kernel and is not broadened by INC-3.

Current INC-2 supplies Ed25519 session-bound capability authorization, a single model-visible `execute` tool, exact argv/cwd grants, canonical filesystem mediation, physical deny-all Docker isolation, scoped Eve session reset, and physical negative controls.

Current `harness/package.json` contains only the already-pinned Eve, AI SDK and Zod runtime dependencies plus TypeScript/Vitest development dependencies. INC-3 needs no new package.

Current `PR Verification` runs harness lint, harness typecheck, authored-Eve typecheck and harness tests before product verification. INC-3 may extend the existing harness lint/test surface but must not rename or replace downstream `PR Verification`.

No current workpiece implements the v3.2 external verifier evidence envelope, oracle digest binding, resume guard, or exact two-repair state. Therefore behavior and verification for D3-01 through D3-11 are GAP. D3-12 is SATISFIED behavior that requires preservation verification.

## 5. Hard invariants

1. Root `AGENTS.md`, root `CONTEXT.md`, stage contexts, engineering rules, architecture sources, product/application/database files, and INC-1 routing semantics are not INC-3 candidate mutations.
2. No new runtime dependency is admitted.
3. Eve/model-visible tool closure remains exactly `["execute"]`.
4. The verifier and oracle execute outside the candidate sandbox.
5. Candidate/model input cannot provide executable argv, verifier profile, oracle manifest, verdict, or repair authority.
6. Raw command evidence is captured by trusted verifier code before verdict reduction.
7. No shared writable verifier/candidate volume.
8. Existing exact-head CI and Codex review gates remain downstream independent authority.
9. Merge remains separately user-authorized.
10. Implementation change size is <=500 reviewable lines; the Plan target is <=400.
11. Candidate tests are useful evidence but cannot be the sole independent oracle.
12. INC-3 does not claim release provenance or final acceptance authority.

## 6. Selected design

Use one host-side deterministic verifier module plus one frozen verifier profile/oracle manifest, integrated through the existing supervisor boundary.

Planned implementation surface, subject to Stage 03 freezing:

1. `harness/src/verifier.ts` — trusted command catalog selection, verifier execution, evidence envelope, digest binding, resume guard, repair-state reducer.
2. `harness/verifier/profile.json` — frozen mechanical verifier profile and command IDs/argv; no shell strings.
3. `harness/verifier/oracle-manifest.json` — frozen oracle identifiers/digests only; no candidate-writable oracle logic.
4. `harness/src/supervisor.ts` — minimum integration that consumes verifier outcomes and enforces the two-repair transition; no verdict creation.
5. `harness/tests/verifier.test.ts` — deterministic positive/negative controls and mutation-style guards.
6. `.github/workflows/pr-verification.yml` — include the new verifier source/test/profile surfaces in the existing Harness Verification lint/test contract only if required by the final file types; preserve the existing fail-closed dependency of PR Verification on Harness Verification.

No `package.json` or lockfile mutation is planned because no new dependency is required.

### Rejected alternatives

- Candidate-selected commands: inadmissible because it violates D12/D14.
- Candidate-visible/writable oracle: inadmissible because it permits oracle capture.
- A database/service for evidence: dominated by an in-process deterministic evidence envelope and violates minimality.
- A second agent or Jev layer: outside INC-3 authority.
- GitHub Actions as the verifier itself: rejected because INC-3 must define the verifier contract independently while target exact-head PR Verification remains downstream authority.
- Shell command strings in the profile: rejected in favor of exact argv vectors to preserve command identity and avoid command injection.

## 7. Contracts to freeze in Stage 03

### C3-01 Trusted command

```text
TrustedCommand := {
  id: stable command id,
  argv: non-empty exact token vector,
  cwd: exact verifier-owned workspace-relative location
}
```

No candidate/model field is converted into argv.

Baseline IDs inherited from v3.2 are `install_locked`, `verify_change_size`, and `verify_code`; `verify_code` maps exactly to `npm run verify`. Stage 03 must bind the exact remaining argv/cwd values from current target behavior rather than infer them.

### C3-02 Verification selection

```text
SelectedChecks =
  BaselineTrustedChecks
  UNION ApplicableTrustedPathOrRouteChecks
  UNION TrustedTaskRequiredChecks
```

Unknown/missing mapping -> `BLOCKED_PROFILE_INCOMPLETE`.

### C3-03 Evidence envelope

```text
VerifierEvidence := {
  base_commit_oid,
  candidate_digest,
  target_profile_digest,
  verifier_profile_digest,
  oracle_manifest_digest,
  commands: [{
    id,
    argv,
    cwd,
    exit_code,
    stdout_bytes,
    stdout_sha256,
    stderr_bytes,
    stderr_sha256
  }],
  verdict: PASS | FAIL | BLOCKED
}
```

Canonical serialization and digest rules must be frozen in Stage 03 before implementation.

### C3-04 Resume decision

```text
governance drift       -> RETURN_TO_AUTHORITY_READ_ONLY
frozen candidate drift -> BLOCKED
tool/verifier/model/Eve drift -> BLOCKED_NEW_RUN_REQUIRED
all identities equal   -> RESUME_ALLOWED
```

No model judgment participates.

### C3-05 Repair state

```text
repair_count in {0,1,2}
FAIL + materially_new_machine_evidence + repair_count < 2 -> REPAIR_PENDING
same failure without materially new evidence             -> BLOCKED
repair_count == 2                                        -> BLOCKED
PASS                                                      -> terminal verifier PASS
profile/oracle/identity prerequisite absent               -> BLOCKED
```

A verifier PASS is harness-local evidence only and does not imply repository PASS, review clearance, release eligibility, or merge readiness.

## 8. Negative-control oracle

Stage 03 must freeze exact fixtures for these controls before implementation:

- VC-01 candidate supplies an alternate argv for a known command ID -> BLOCKED/denied before execution.
- VC-02 candidate omits a baseline or mechanically required check -> trusted selector restores it or blocks; it never disappears.
- VC-03 unknown required command ID -> `BLOCKED_PROFILE_INCOMPLETE`.
- VC-04 candidate modifies verifier profile/oracle material in candidate workspace -> accepted verifier/profile/oracle identity remains unchanged; candidate copy is ignored.
- VC-05 verifier workspace aliases/shares candidate writable state -> BLOCKED before command execution.
- VC-06 command exits nonzero -> FAIL with exact raw evidence; no model text can convert it to PASS.
- VC-07 stdout/stderr bytes change while claimed digest remains old -> evidence validation fails closed.
- VC-08 base/candidate/profile/oracle digest mismatch -> BLOCKED before verdict acceptance.
- VC-09 governance drift on resume -> `RETURN_TO_AUTHORITY_READ_ONLY`.
- VC-10 frozen candidate drift on resume -> BLOCKED.
- VC-11 tool/verifier/model/Eve identity drift -> `BLOCKED_NEW_RUN_REQUIRED`.
- VC-12 first failure with new evidence may enter repair 1; second distinct evidence-backed failure may enter repair 2; any third repair request -> BLOCKED.
- VC-13 repeated identical failure without materially new machine evidence -> BLOCKED immediately.
- VC-14 candidate-authored passing test with verifier-owned failing oracle -> verifier verdict remains FAIL.
- VC-15 remove any one load-bearing selector/digest/oracle/repair predicate -> at least one deterministic test must fail.

Every negative control must fail for its intended predicate, not an unrelated malformed fixture.

## 9. Positive controls

- PC-01 exact trusted baseline selection yields the frozen baseline IDs.
- PC-02 applicable trusted path/route checks are unioned without candidate discretion.
- PC-03 external verifier executes an exact trusted argv in an isolated verifier-owned temporary workspace.
- PC-04 command evidence reproduces byte counts and SHA-256 for stdout/stderr.
- PC-05 all bound identities equal -> evidence can reduce to PASS when every required command/oracle passes.
- PC-06 unchanged frozen identities -> resume allowed.
- PC-07 materially new machine evidence permits repair transitions only within the two-repair budget.
- PC-08 all existing INC-1 routing tests and INC-2 execution/physical controls remain green.
- PC-09 downstream product `PR Verification` behavior remains unchanged.

## 10. Verification obligations

| Obligation | Behavior | Verification | Required verifier |
|---|---|---|---|
| D3-01..03 trusted selection | GAP | GAP | VC-01..03 + PC-01..02 |
| D3-04 external isolation | GAP | GAP | VC-05 + PC-03 |
| D3-05..07 evidence/verdict | GAP | GAP | VC-06..08 + PC-04..05 |
| D3-08 oracle ownership | GAP | GAP | VC-04, VC-14, VC-15 |
| D3-09..10 resume | GAP | GAP | VC-09..11 + PC-06 |
| D3-11 repair bound | GAP | GAP | VC-12..13 + PC-07 |
| D3-12 preserve INC-1/2 | SATISFIED | COVERED | existing routing/execution tests + PC-08 |
| exact-head target acceptance | SATISFIED | COVERED | existing PR Verification + PC-09 |

Required Stage 04/05 verification sequence:

1. lint all changed TypeScript harness surfaces;
2. `npm --prefix harness run typecheck`;
3. existing authored-Eve typecheck unchanged;
4. `npm --prefix harness run test`, including all VC/PC controls;
5. mutation probes for VC-15 must demonstrate each claimed load-bearing predicate is killed;
6. existing physical INC-2 Docker controls must run, not skip;
7. repository change-size gate;
8. exact-head `PR Verification` PASS;
9. fresh Codex review on that exact implementation state.

No model/provider call is permitted in acceptance CI.

## 11. Implementation increments

INC-3 is one PR but is internally sequenced to preserve red-first evidence.

### INC-3A — Freeze verifier profile and selector

Objective: close D3-01..03.

Affected planned paths:
- `harness/src/verifier.ts`
- `harness/verifier/profile.json`
- `harness/tests/verifier.test.ts`

Action:
1. add failing VC-01..03/PC-01..02 fixtures;
2. implement strict profile parsing and trusted selection;
3. prove candidate fields cannot add/remove/substitute argv.

Verification: narrow verifier tests, then harness typecheck/test.

Stop: any required routed verification has no deterministic trusted command mapping, any command must be model-generated, or a new dependency is required.

### INC-3B — External execution, oracle and evidence envelope

Objective: close D3-04..08.

Affected planned paths:
- `harness/src/verifier.ts`
- `harness/verifier/profile.json`
- `harness/verifier/oracle-manifest.json`
- `harness/tests/verifier.test.ts`

Action:
1. add failing VC-04..08/VC-14 and PC-03..05;
2. create verifier-owned temporary workspace from trusted inputs with no shared writable candidate volume;
3. execute only frozen argv;
4. capture raw bytes/digests;
5. bind verifier/profile/oracle/base/candidate identities;
6. reduce mechanically to PASS/FAIL/BLOCKED.

Verification: deterministic verifier tests plus mutation probe proving verdict and digest predicates are load-bearing.

Stop: candidate can influence command/oracle/verdict authority, isolation needs a privileged secret/provider credential, or evidence cannot bind exact bytes.

### INC-3C — Resume and two-repair control

Objective: close D3-09..11.

Affected planned paths:
- `harness/src/verifier.ts`
- `harness/src/supervisor.ts`
- `harness/tests/verifier.test.ts`

Action:
1. add failing VC-09..13 and PC-06..07;
2. implement deterministic resume comparison;
3. implement repair reducer with maximum two repairs and materially-new-evidence requirement;
4. expose no model-controlled state transition.

Verification: exhaustive state-table tests and mutation probes.

Stop: repair authority becomes model-controlled, repair count can exceed two, or drift can resume silently.

### INC-3D — CI binding and preservation

Objective: close D3-12 and bind exact-head evidence.

Affected planned path:
- `.github/workflows/pr-verification.yml` only if the existing harness commands do not automatically include all new files.

Action:
1. include new verifier source/test surface in existing Harness Verification lint if necessary;
2. do not rename `PR Verification`;
3. run full harness + product verification;
4. freeze candidate manifest and Stage 05 evidence only after implementation is frozen.

Verification: exact-head PR Verification, change-size gate, then Codex review.

Stop: existing INC-1/2 control changes behavior, product verification changes semantics, implementation exceeds 500 lines, or a review finding requires scope outside this Plan.

## 12. Recovery and failure semantics

INC-3 writes no persistent application state. Verifier workspaces are disposable and must be deleted after use. A failed verifier run retains only its structured evidence outside the candidate workspace; it grants no publication authority.

If an increment fails:
- do not weaken a negative control;
- do not remove a required check;
- do not convert BLOCKED to FAIL/PASS;
- do not add a dependency or path outside the frozen Stage 03 allowlist;
- use one evidence-backed correction only when the failure identifies a bounded mechanism;
- otherwise stop for REDUCE/REDESIGN.

## 13. Stage 03 freeze requirements

The implementation contract must freeze before any INC-3 code/test/config/workflow mutation:

1. exact candidate path allowlist;
2. exact trusted command IDs, argv and cwd;
3. exact target-profile and verifier-profile schema;
4. canonical serialization/digest algorithm for profile, oracle and evidence identities;
5. exact oracle manifest shape and ownership boundary;
6. exact verifier workspace isolation construction;
7. exact verdict reduction rules;
8. exact resume identity set and transition table;
9. exact materially-new-evidence predicate and repair counter semantics;
10. VC-01..VC-15 and PC-01..PC-09 outcomes;
11. exact CI commands and no-provider-call constraint;
12. exact implementation line budget;
13. explicit non-authority for INC-4/5, publication, release and merge.

No implementation begins from this Plan alone.

## 14. Stop conditions

Stop immediately if:

1. root governance or architecture must change;
2. product/application/database/provider code must change;
3. INC-1 routing semantics must change to make INC-3 work;
4. INC-2 capability/network/secret/Git isolation must be weakened;
5. a new dependency is required;
6. candidate/model must choose commands, oracle, verifier profile, verdict, or repair authority;
7. verifier and candidate require a shared writable volume;
8. required routed verification lacks a trusted command ID;
9. verifier needs model/provider credentials;
10. publication/GitHub write/merge capability becomes necessary;
11. Jev/final PASS/provenance signing becomes necessary;
12. implementation reaches or projects above 500 reviewable lines;
13. the same failure persists without materially new bounded evidence;
14. Plan/Contract/base/head/profile/oracle/runtime identity becomes stale;
15. exact-head CI fails without one bounded evidence-backed correction;
16. Codex cycle 3 reports an actionable finding.

Disposition is BLOCKED, REDUCE, or REDESIGN according to the triggering condition. No silent fix-forward.

## 15. Explicit non-authority

This Plan does not authorize:
- Stage 03 contract mutation before explicit approval of this exact PLAN_READY artifact;
- Stage 04 implementation;
- INC-4 or INC-5;
- publisher/GitHub write/merge;
- Jev or final mechanical PASS authority;
- release provenance/attestation;
- root-router cutover or old-governance removal;
- product/database/backend/memory work;
- multi-agent execution;
- model/provider calls in acceptance CI;
- deployment or release;
- a change-size exception.

## 16. Stage 02 disposition

The current merged baseline already supplies deterministic routing and the bounded disposable execution boundary. The measured remainder is the approved v3.2 INC-3 verification/oracle slice.

The selected path adds no new framework, service, database, agent, provider call, publication authority, or product behavior. It keeps verification authority outside the untrusted Eve candidate sandbox and makes command selection, oracle identity, evidence, resume, and repair mechanically fail closed.

PLAN_READY

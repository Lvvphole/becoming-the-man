PLAN_READY

# Zero-Trust Repository Harness v1.2 — Approved Increment 3 Verification Boundary Plan

## 1. Disposition and five-increment authority boundary

This artifact plans **approved increment 3 only**.

The five approved increments are the authority router for this plan:

| Approved increment | Bound-revision state at `27228b8a81e3cd14b96b2d08bfc578ad12a2e317` | INC-3 authority |
|---|---|---|
| 1. Routing kernel | Present: `AGENTS.md`, `CONTEXT.md`, `harness/src/routing.ts`, `harness/tests/routing.test.ts` | PRESERVE. No router or routing-semantics mutation. |
| 2. Execution boundary | Present: `capability.ts`, `supervisor.ts`, `eve-adapter.ts`, `agent/tools/execute.ts`, `tests/execution.test.ts` | PRESERVE. Only minimum supervisor consumption of a verifier result is permitted. No weakening or broadening of capability, sandbox, network, Git isolation, grants, or model-visible tools. |
| 3. Verification boundary | Absent: no `verifier.ts`, no `harness/verifier/`, no oracle manifest, no authenticated evidence envelope | **ONLY AUTHORIZED WORK.** External verifier, independent oracle, candidate binding, evidence/provenance. |
| 4. Jev restriction layer | Absent | UNAUTHORIZED. No Jev, second agent/judge, capability issuer, or repository/final PASS issuer. |
| 5. Migration/reduction | Old `stages/` and envelope machinery remain | UNAUTHORIZED. No shadow cutover, equivalence migration, or deletion of old routing/stage machinery. |

Any internal INC-3 slice labels below are engineering order inside approved increment 3. They are not additional roadmap increments.

Disposition: **PLAN_READY for Stage 03 contract freezing only. Not Build authority.**

## 2. Increment-3 outcome contract

Approved increment 3 is exactly:

- an external verifier;
- an independent acceptance oracle;
- candidate binding;
- evidence and provenance.

Increment-3 PASS means only **harness-local evidence that the exact bound candidate produced the required trusted verification result**. It is not repository acceptance, Jev PASS, release eligibility, merge readiness, or migration equivalence.

Desired placement:

```text
INC-1: ROUTE
   |
   v
INC-2: EXECUTE_IN_SANDBOX
   |
   v
INC-3: RUN_ORACLE
   |
   +--> trusted command selection
   +--> immutable candidate snapshot
   +--> external verifier process/filesystem
   +--> hidden independent oracle
   +--> authenticated run-bound evidence
   |
   v
harness_local_verdict = PASS | FAIL | BLOCKED

INC-4: UNAUTHORIZED
INC-5: UNAUTHORIZED
```

The model, candidate, candidate-authored tests, and candidate sandbox remain untrusted producers. They cannot select executable commands, read or write the oracle, alter verifier policy, author a verdict, authenticate evidence, grant a repair, mint capability, or create repository PASS.

## 3. Canonical source binding

Planning mode: BROWNFIELD.

Repository: `Lvvphole/becoming-the-man`

Base commit OID:
`27228b8a81e3cd14b96b2d08bfc578ad12a2e317`

Plan artifact path is excluded from its own source fingerprint.

Canonical six-field Build binding to freeze mechanically before Stage 04:

```text
SourceBinding := {
  base_commit_oid,
  staged_diff_sha256,
  unstaged_diff_sha256,
  untracked_manifest_sha256,
  authority_bundle_sha256,
  selected_workpiece_manifest_sha256
}
```

At this GitHub-only planning state:
- `base_commit_oid` is frozen above.
- staged/unstaged/untracked values are **not inferred from GitHub**. Stage 03 must define the Build Agent command/script that computes them in the Build workspace immediately before admission.
- `authority_bundle_sha256` is the canonical digest of the exact routed authority identities.
- `selected_workpiece_manifest_sha256` is the canonical digest of the exact increment-1/2 workpiece identities consumed as preserved prerequisites.

Current observed Git blob identities:

| Source/workpiece | Git blob OID |
|---|---|
| `AGENTS.md` | `b3319d00d7fb489c7164f3a9af5577df710ce33e` |
| `CONTEXT.md` | `2dded90579c2ad7b491ab0072a44b030f94750c6` |
| `stages/02_plan/CONTEXT.md` | `96df11d70c3a067cdaa4caa511a979cbff4494da` |
| `.claude/skills/plan/SKILL.md` | `5b9325558cc0a792b2bf6e98fb7b018b30492d53` |
| `references/engineering/engineering-rules.md` | `67e1228ff4eb4d9646e1413d1fb208062359b72a` |
| `references/architecture/CONTEXT.md` | `56ac0b7f4e978ae3c237a8be9acc2b7afdb639f4` |
| `harness/src/routing.ts` | `4d4321abb4e131a9359755c647ad8c76313451a8` |
| `harness/src/capability.ts` | `fd4a31b7c07336c1538372b034b90e5d25f31a12` |
| `harness/src/supervisor.ts` | `da4a0af0ab4e32631ef0a22a4a1b8f7ad018e7de` |
| `harness/src/eve-adapter.ts` | current base-commit blob, to be frozen by Stage 03 Build binding |
| `harness/agent/tools/execute.ts` | current base-commit blob, to be frozen by Stage 03 Build binding |
| `harness/tests/routing.test.ts` | current base-commit blob, to be frozen by Stage 03 Build binding |
| `harness/tests/execution.test.ts` | current base-commit blob, to be frozen by Stage 03 Build binding |
| `.github/workflows/pr-verification.yml` | `d735549a844c2bd0a9c482ca1da5f85088b90d89` |

A stale six-field binding before Stage 04 is `BLOCKED_SOURCE_BINDING_STALE`; it is never silently refreshed.

## 4. Completion and publication authority

```text
producer_completion_authority = NONE
increment_3_completion_authority =
  exact-head repository PR Verification
  AND required independent Codex review state
  AND Stage-05 verifier evidence bound to the exact candidate
publication_authority = NONE
merge_authority = USER_ONLY
repository_pass_authority = NONE
jev_authority = NONE
```

The increment-3 verifier may emit only `harness_local_verdict`. It cannot emit `repository_verdict`.

## 5. Build manifest

### Authorized candidate paths

Stage 03 may freeze only this maximum implementation surface:

1. `harness/src/verifier.ts`
2. `harness/verifier/profile.json`
3. `harness/verifier/oracle-manifest.json`
4. `harness/src/supervisor.ts`
5. `harness/tests/verifier.test.ts`
6. `.github/workflows/pr-verification.yml` **only if** required to include new harness verifier surfaces in the existing Harness Verification job without changing product-verification semantics.

No `package.json`, lockfile, router, capability, Eve adapter, agent tool, sandbox, product, root-governance, stage-governance, Jev, release, or migration path is an INC-3 candidate path.

### Change budgets

- Whole PR target: <=400 reviewable implementation lines.
- Whole PR hard ceiling: 500 under active repository governance.
- `harness/src/supervisor.ts` INC-3 delta target: <=25 changed lines; hard internal stop at 40 changed lines.
- Workflow delta target: 0. If required, <=10 changed lines and only Harness Verification inclusion mechanics.
- At >=400 projected whole-PR lines: stop and re-measure before another mutation.
- At >500: BLOCKED absent the separately governed owner exception. This Plan does not grant an exception.

### Protected-action states

| Operation | State |
|---|---|
| Author INC-3 verifier/oracle/evidence implementation after CONTRACT_READY | APPROVAL_GATED |
| Consume a verifier result in supervisor within delta budget | APPROVAL_GATED |
| Add a model-visible tool or grant | UNAUTHORIZED |
| Change INC-1 routing | UNAUTHORIZED |
| Weaken/change INC-2 isolation/capability semantics | UNAUTHORIZED |
| Read oracle/verifier workspace through INC-2 `execute` | UNAUTHORIZED |
| Add Jev/second judge | UNAUTHORIZED |
| Delete/cut over `stages/` or old envelope machinery | UNAUTHORIZED |
| Change product verification semantics | UNAUTHORIZED |
| Publish/release/merge | UNAUTHORIZED in INC-3; merge remains USER_ONLY |

## 6. Repository gap analysis

At the bound revision:

- INC-1 routing exists and is preserved.
- INC-2 execution/capability isolation exists and is preserved.
- INC-3 verifier/oracle/evidence paths are absent.
- INC-4 Jev is absent and must remain absent.
- INC-5 migration/reduction has not occurred and must not begin.

Atomic INC-3 obligations:

| ID | Obligation | Behavior | Verification |
|---|---|---|---|
| I3-01 | external verifier trust root + executable identity | GAP | GAP |
| I3-02 | closed candidate-byte ingress + canonical candidate binding | GAP | GAP |
| I3-03 | trusted command executable/argv/cwd/network/resource policy | GAP | GAP |
| I3-04 | independent hidden oracle identity/execution | GAP | GAP |
| I3-05 | authenticated, run-bound evidence/provenance envelope | GAP | GAP |
| I3-06 | mechanical PASS/FAIL/BLOCKED + reason codes | GAP | GAP |
| I3-07 | digest-only resume across preserved INC-1/2 identities | GAP | GAP |
| I3-08 | two-repair state with mechanical novelty | GAP | GAP |
| I3-09 | INC-2 execute cannot read oracle/verifier workspace | GAP | GAP |
| I3-10 | preserve INC-1/2 behavior and downstream product gates | SATISFIED | COVERED by existing tests/CI; requires preservation run |

No Build increment is admitted until Stage 03 freezes all GAP mechanisms below.

## 7. External root of trust and verifier identity

Increment 3 must not trust a verifier because the verifier says it is trusted.

Stage 03 must freeze a supervisor-supplied `ExpectedVerifierIdentity` from outside the candidate and verifier workspace:

```text
ExpectedVerifierIdentity := {
  verifier_source_sha256,
  verifier_profile_sha256,
  oracle_manifest_sha256,
  toolchain_manifest_sha256
}
```

The expected values are supplied by the trusted supervisor invocation from the frozen Stage-03 contract/build binding, not loaded from candidate bytes and not derived from the verifier's own claimed envelope.

Before command execution:

```text
observed verifier source/profile/oracle/toolchain identities
    == ExpectedVerifierIdentity
OR
BLOCKED_VERIFIER_IDENTITY_MISMATCH
```

The verifier source identity covers the literal trusted verifier implementation bytes selected by Stage 03. The profile and oracle manifest are policy data loaded only from the trusted base/authority side, never from the candidate snapshot.

This is an increment-3 trust anchor only. It does not mint INC-2 capability and does not create INC-4 PASS authority.

## 8. Canonical serialization and digest construction

All INC-3 identities use:

- hash: SHA-256;
- text encoding: UTF-8;
- binary digest representation: lowercase hexadecimal;
- structured encoding: canonical JSON with UTF-8 bytes, lexicographically sorted object keys, arrays preserved in declared order, no insignificant whitespace, and a trailing newline forbidden;
- paths: repository-relative POSIX paths, NFC-normalized, no `.`, `..`, absolute path, NUL, duplicate normalized path, or backslash alias.

Stage 03 must freeze one implementation-independent canonicalization fixture with literal input bytes and expected SHA-256 for every structured identity class. A verifier that cannot reproduce a fixture is `BLOCKED_CANONICALIZATION_MISMATCH`.

## 9. Candidate ingress, closed membership, and immutable snapshot

Candidate identity is constructed before verification from a trusted manifest, not from candidate nomination.

```text
CandidateManifest := {
  base_commit_oid,
  entries: [{
    path,
    kind: "file",
    mode,
    byte_length,
    sha256
  }]
}
```

Rules:

1. Candidate membership is the exact changed-path set against `base_commit_oid`, intersected with the Stage-03 authorized candidate allowlist.
2. Any changed path outside the allowlist -> `BLOCKED_UNAUTHORIZED_PATH`.
3. Entries are sorted by canonical path before serialization.
4. Symlinks, device nodes, FIFOs, sockets, hard-link ambiguity, duplicate normalized paths, and unsupported file kinds are rejected.
5. Candidate digest = SHA-256(canonical CandidateManifest bytes).
6. The verifier copies each manifest entry by bytes into a newly created verifier-owned snapshot directory.
7. After copy, it recomputes every byte length/hash and the complete candidate digest from the snapshot.
8. Any mismatch -> `BLOCKED_CANDIDATE_SNAPSHOT_MISMATCH`.
9. Commands execute only against that frozen snapshot, never the mutable candidate workspace.
10. The candidate workspace is never mounted writable into the verifier execution environment.

This closes the measurement/execution TOCTOU boundary: verified bytes are the bytes represented by `candidate_digest`.

## 10. Trusted command profile

No shell string is a trusted command.

```text
TrustedCommand := {
  id,
  executable_identity,
  argv,
  cwd,
  network_policy,
  timeout_ms,
  max_stdout_bytes,
  max_stderr_bytes,
  max_workspace_bytes
}
```

`argv[0]` is an exact executable path inside the frozen toolchain environment. `npm run verify` as prose is insufficient.

Stage 03 must resolve the current baseline command IDs to literal vectors and identities. Required baseline IDs remain:

- `install_locked`
- `verify_change_size`
- `verify_code`

For every command, Stage 03 freezes:
- exact executable path and executable/toolchain digest;
- exact argv vector;
- exact cwd;
- environment allowlist;
- network policy;
- timeout;
- stdout/stderr caps;
- workspace/disk cap.

Default verifier network policy is `DENY_ALL`.

If `install_locked` demonstrably requires package-network access, Stage 03 must either:
1. bind it to a separately identified dependency-acquisition phase with an exact allowlisted package registry and frozen lockfile/toolchain identity, with the oracle execution phase still `DENY_ALL`; or
2. return `BLOCKED_NETWORK_POLICY_UNRESOLVED`.

It may not silently grant ambient public network.

Output beyond a cap terminates the command and yields `FAIL_RESOURCE_LIMIT`; it is never accumulated without bound.

## 11. Independent oracle contract

The oracle is independent from the candidate and model, but remains harness-local.

```text
OracleManifest := {
  version,
  oracle_entries: [{
    oracle_id,
    executable_or_fixture_sha256,
    invocation_id
  }]
}
```

The manifest is trusted policy data bound by `ExpectedVerifierIdentity.oracle_manifest_sha256`.

Actual hidden oracle executable/fixture bytes:
- live outside the candidate snapshot;
- are inaccessible to the model and INC-2 candidate sandbox;
- are individually digest-checked before use;
- execute only in the verifier-owned environment;
- cannot be nominated or replaced by candidate input.

The oracle manifest is not itself sufficient proof of an oracle. Stage 03 must freeze the actual trusted oracle byte source and its digest relationship to each manifest entry.

Required confidentiality negative control:

```text
INC-2 execute attempt to read:
  harness/verifier/oracle-manifest.json
  OR verifier-owned workspace
  OR hidden oracle bytes
=> DENY before bytes are returned
```

This control must use the existing INC-2 filesystem/capability boundary. If satisfying it requires changing INC-2 grants or semantics, stop: `BLOCKED_INCREMENT_2_CHANGE_REQUIRED`.

## 12. Authenticated evidence and provenance envelope

A digest inside an envelope is not self-authenticating. Increment 3 therefore requires a detached verifier signature.

Stage 03 must freeze a run-scoped signing key construction in which:
- the private signing key is generated/held outside candidate/model reach;
- the public key or its SHA-256 identity is supplied by the trusted supervisor as part of the run authority;
- the candidate and supervisor consumer cannot substitute the private key;
- the private key is destroyed when the verifier run terminates.

```text
HarnessLocalEvidence := {
  schema_version,
  verdict_kind: "harness_local_verdict",
  run_nonce,
  base_commit_oid,
  candidate_digest,
  verifier_source_sha256,
  verifier_profile_sha256,
  oracle_manifest_sha256,
  toolchain_manifest_sha256,
  preserved_inc1_identity_sha256,
  preserved_inc2_identity_sha256,
  commands: [{
    command_id,
    executable_identity,
    argv,
    cwd,
    exit_code,
    stdout_byte_length,
    stdout_sha256,
    stderr_byte_length,
    stderr_sha256,
    reason_code
  }],
  verdict: PASS | FAIL | BLOCKED,
  reason_code
}
```

`run_nonce` is supervisor-generated, unpredictable, unique for the run, and supplied before verifier execution.

The detached signature covers the literal canonical evidence bytes plus `run_nonce`. Consumer acceptance requires:
1. expected public-key identity matches;
2. signature verifies;
3. nonce equals the active run;
4. every frozen identity equals expected;
5. candidate digest equals the immutable snapshot;
6. command record set equals the selected required command set.

Failure -> `BLOCKED_EVIDENCE_AUTHENTICATION`.

The supervisor may consume this signed result but may not rewrite or substitute the envelope. It receives literal envelope bytes + detached signature and verifies them before state transition.

This signature is increment-3 provenance only. It is not release signing, publication, Jev, or repository PASS.

## 13. Verdict and stable reason-code contract

Top-level verdict is exactly:
- `PASS`
- `FAIL`
- `BLOCKED`

It is always typed as `harness_local_verdict`.

Minimum machine-stable reason codes:

```text
PASS_REQUIRED_CHECKS
FAIL_COMMAND_EXIT
FAIL_ORACLE
FAIL_RESOURCE_LIMIT
BLOCKED_PROFILE_INCOMPLETE
BLOCKED_VERIFIER_IDENTITY_MISMATCH
BLOCKED_CANONICALIZATION_MISMATCH
BLOCKED_UNAUTHORIZED_PATH
BLOCKED_CANDIDATE_SNAPSHOT_MISMATCH
BLOCKED_NETWORK_POLICY_UNRESOLVED
BLOCKED_ORACLE_IDENTITY_MISMATCH
BLOCKED_EVIDENCE_AUTHENTICATION
BLOCKED_RESUME_IDENTITY_DRIFT
BLOCKED_NEW_RUN_REQUIRED
BLOCKED_REPAIR_BUDGET_EXHAUSTED
BLOCKED_EVIDENCE_NOT_NOVEL
BLOCKED_INCREMENT_2_CHANGE_REQUIRED
```

Human text is never parsed to decide verdict, resume, or repair eligibility.

## 14. Resume contract: compare digests, do not re-route

Increment 3 does not parse `AGENTS.md`, re-run INC-1 routing, rewrite INC-2 grants, or reinterpret model/tool policy.

At initial admission, trusted upstream state supplies frozen digests:

```text
ResumeIdentity := {
  authority_bundle_sha256,
  routing_contract_sha256,
  capability_policy_sha256,
  tool_policy_sha256,
  eve_identity_sha256,
  model_configuration_sha256,
  verifier_identity_sha256,
  oracle_manifest_sha256,
  candidate_digest
}
```

Resume performs equality comparisons only.

```text
authority/routing governance digest drift -> RETURN_TO_AUTHORITY_READ_ONLY
candidate digest drift                    -> BLOCKED_RESUME_IDENTITY_DRIFT
tool/capability/verifier/oracle/model/Eve drift -> BLOCKED_NEW_RUN_REQUIRED
all equal                                 -> RESUME_ALLOWED
```

The digest values are produced by the owning increment/authority and consumed opaquely by INC-3. INC-3 does not re-implement their semantics.

## 15. Repair contract

Repair is increment-3 state, but every repair candidate remains an untrusted INC-2 candidate.

No new repair tool, capability, grant, or filesystem permission is created.

```text
RepairState := {
  repair_count: 0 | 1 | 2,
  prior_failure_fingerprint
}
```

Mechanical failure fingerprint:

```text
FailureFingerprint =
  SHA256(canonical {
    selected_command_ids,
    failing_command_ids,
    command_exit_codes,
    command_stdout_sha256,
    command_stderr_sha256,
    oracle_result_digests,
    top_level_reason_code
  })
```

A repair is evidence-novel iff:
```text
new_failure_fingerprint != prior_failure_fingerprint
```

Transitions:

```text
FAIL + repair_count < 2 -> repair candidate may be proposed through existing INC-2 execute grants
next verifier result fingerprint differs -> repair_count += 1 and state may continue
next verifier result fingerprint equal   -> BLOCKED_EVIDENCE_NOT_NOVEL
repair_count == 2 and another repair requested -> BLOCKED_REPAIR_BUDGET_EXHAUSTED
PASS -> terminal harness-local PASS
BLOCKED -> terminal for current run
```

The verifier never grants the repair. It only reports evidence. Existing INC-2 authorization remains the sole execution gate for any proposed repair.

## 16. Verifier workspace isolation

Stage 03 must freeze a concrete verifier process/filesystem contract with these minimum properties:

- newly created verifier-owned workspace per `run_nonce`;
- candidate snapshot copied by trusted byte ingress, never bind-mounted writable;
- verifier source/profile/oracle/toolchain mounted or copied read-only from trusted authority side;
- no `.git` metadata from the candidate;
- no candidate secrets;
- environment allowlist only;
- network `DENY_ALL` except a separately frozen dependency-acquisition exception if proven necessary;
- per-command timeout/output/disk bounds;
- verifier evidence/signing material outside command-writable directories;
- workspace destroyed after evidence finalization;
- evidence bytes/signature retained outside the candidate workspace.

Any alias, shared writable path, or candidate write capability into verifier authority material -> BLOCKED before command execution.

## 17. Trusted command selection

```text
SelectedChecks =
  BaselineTrustedChecks
  UNION ApplicableTrustedPathOrRouteChecks
  UNION TrustedTaskRequiredChecks
```

Candidate/model input may reference only already-trusted stable command IDs. It cannot provide argv.

Unknown required ID or a routed obligation without a trusted mapping -> `BLOCKED_PROFILE_INCOMPLETE`.

Omitting a baseline or mechanically applicable required check cannot remove it from `SelectedChecks`.

## 18. Negative and positive controls

Stage 03 must freeze literal fixtures and expected reason codes.

Negative controls:
- NC-01 alternate argv for known ID -> denied; trusted argv unchanged.
- NC-02 candidate omits baseline/applicable check -> selector restores it or BLOCKED; never silently omitted.
- NC-03 unknown required command ID -> `BLOCKED_PROFILE_INCOMPLETE`.
- NC-04 verifier/profile/oracle/toolchain expected identity mismatch -> BLOCKED before execution.
- NC-05 unauthorized candidate path or unsupported file kind/symlink -> BLOCKED.
- NC-06 mutate candidate after manifest but before snapshot verification -> `BLOCKED_CANDIDATE_SNAPSHOT_MISMATCH`.
- NC-07 shared writable verifier/candidate path -> BLOCKED before execution.
- NC-08 command exceeds time/output/disk bound -> `FAIL_RESOURCE_LIMIT`.
- NC-09 command nonzero -> `FAIL_COMMAND_EXIT` with exact raw evidence digests.
- NC-10 candidate/model attempts oracle/verifier-workspace read through INC-2 execute -> deny before bytes.
- NC-11 oracle byte digest mismatch -> `BLOCKED_ORACLE_IDENTITY_MISMATCH`.
- NC-12 alter evidence bytes, signature, public-key identity, or nonce -> `BLOCKED_EVIDENCE_AUTHENTICATION`.
- NC-13 replay valid evidence under a different nonce/candidate -> `BLOCKED_EVIDENCE_AUTHENTICATION`.
- NC-14 resume with authority/routing digest drift -> authority-read-only.
- NC-15 resume with candidate drift -> `BLOCKED_RESUME_IDENTITY_DRIFT`.
- NC-16 resume with tool/capability/verifier/oracle/model/Eve drift -> `BLOCKED_NEW_RUN_REQUIRED`.
- NC-17 repeated identical failure fingerprint -> `BLOCKED_EVIDENCE_NOT_NOVEL`.
- NC-18 third repair request -> `BLOCKED_REPAIR_BUDGET_EXHAUSTED`.
- NC-19 candidate-authored tests pass while hidden oracle fails -> `FAIL_ORACLE`.
- NC-20 remove/bypass each load-bearing selector, identity, snapshot, oracle, authentication, resource, resume, or repair predicate one at a time -> at least one designated control must fail.

Positive controls:
- PC-01 exact trusted selector union.
- PC-02 exact candidate manifest canonicalization fixture reproduces expected SHA-256.
- PC-03 trusted byte ingress produces immutable snapshot with equal digest.
- PC-04 exact trusted executable/argv executes under frozen resource/network policy.
- PC-05 stdout/stderr lengths and SHA-256 reproduce exact captured bytes.
- PC-06 hidden oracle identity matches and contributes to verdict.
- PC-07 signed envelope verifies only under active run nonce/public-key identity.
- PC-08 unchanged resume identities -> RESUME_ALLOWED.
- PC-09 two distinct evidence fingerprints may consume at most two repair transitions through existing INC-2 grants.
- PC-10 all existing INC-1 routing and INC-2 execution/physical controls remain green.
- PC-11 existing downstream product `PR Verification` semantics remain unchanged.

Mutation acceptance for NC-20 is mechanical: Stage 03 must enumerate the load-bearing predicate IDs and the designated test(s) each mutation must kill. A mutation campaign passes only when every enumerated predicate mutation produces at least one expected failing designated test. Aggregate mutation percentage is not a substitute.

## 19. Internal engineering slices of approved increment 3

These are not roadmap increments.

### Slice 3.1 — Identity, candidate binding, trusted selector

Closes: I3-01, I3-02, selector portion of I3-03.

Target paths:
- `harness/src/verifier.ts`
- `harness/verifier/profile.json`
- `harness/tests/verifier.test.ts`

Budget checkpoint: projected cumulative INC-3 reviewable lines <=170.

Required red-first evidence: NC-01..06 plus PC-01..03.

Stop: canonical identity fixture cannot be frozen; candidate snapshot can alias mutable candidate state; new dependency required; INC-1/2 mutation required.

### Slice 3.2 — External execution, oracle, resource/network policy

Closes: remainder I3-03, I3-04, I3-09.

Target paths:
- `harness/src/verifier.ts`
- `harness/verifier/profile.json`
- `harness/verifier/oracle-manifest.json`
- `harness/tests/verifier.test.ts`

Budget checkpoint: projected cumulative <=300.

Required red-first evidence: NC-07..11, NC-19 plus PC-04..06 and explicit INC-2 execute oracle-read denial.

Stop: ambient network required without frozen exception; oracle must enter candidate/model visibility; satisfying confidentiality requires INC-2 semantic/grant change.

### Slice 3.3 — Authenticated evidence, resume, repair

Closes: I3-05..08.

Target paths:
- `harness/src/verifier.ts`
- `harness/src/supervisor.ts`
- `harness/tests/verifier.test.ts`

Budget checkpoint: projected cumulative <=390; supervisor delta <=25 target / 40 hard internal stop.

Required red-first evidence: NC-12..18 plus PC-07..09.

Stop: supervisor would become a second verifier; envelope cannot be authenticated without candidate-accessible authority; resume must re-route/re-authorize rather than compare digests; repair requires new capability/tool.

### Slice 3.4 — Preservation and exact-head binding

Closes: I3-10.

Target path:
- `.github/workflows/pr-verification.yml` only if existing Harness Verification does not automatically include the new verifier surface.

Budget: target 0 workflow lines; <=10 if necessary; total PR <=400 target and <=500 hard governance ceiling.

Required evidence:
- all INC-3 controls;
- all existing INC-1 routing tests;
- all existing INC-2 execution and physical controls, with no skips;
- repository change-size gate;
- exact-head PR Verification;
- independent Codex review on the exact implementation state.

Stop: workflow change alters product verification semantics, harness PASS implies product PASS, old stage machinery is changed, or later-increment work is required.

## 20. Stage-03 freeze checklist

The Stage-03 implementation contract must freeze **as bytes** before any Build mutation:

1. canonical six-field Build source binding and exact Build Agent computation command/script;
2. exact candidate path allowlist and Build manifest target;
3. ExpectedVerifierIdentity and its external supply boundary;
4. canonical JSON/path/hash fixtures;
5. candidate manifest membership, modes, file-kind rules, ingress and immutable snapshot algorithm;
6. exact trusted command executable identity, argv, cwd, env allowlist, network policy, timeout, stdout/stderr/disk limits;
7. dependency-acquisition network disposition;
8. actual hidden oracle byte source, manifest shape, digest relationship and INC-2 execute-read denial;
9. run nonce and run-scoped evidence signing/public-key identity mechanism;
10. literal evidence schema, detached signature input, consumer verification order and stable reason codes;
11. resume identity digest set and equality-only transition table;
12. FailureFingerprint novelty predicate and two-repair transition table;
13. statement that every repair remains an untrusted candidate under existing INC-2 execute grants;
14. verifier workspace/process/filesystem construction;
15. NC-01..20 and PC-01..11 literal fixtures/outcomes;
16. NC-20 load-bearing predicate-to-designated-test mutation matrix;
17. slice budgets/checkpoints and supervisor/workflow delta limits;
18. completion authority, publication `NONE`, merge `USER_ONLY`, repository PASS `NONE`;
19. explicit non-authority for INC-4 Jev and INC-5 migration/reduction.

If Stage 03 must invent any of these rather than freeze this Plan's selected mechanism, return to Stage 02.

## 21. Verification sequence

After Stage 04 implementation is frozen:

1. narrow verifier tests after each red-first repair;
2. `npm --prefix harness run typecheck`;
3. existing authored-Eve typecheck unchanged;
4. complete harness test suite;
5. NC-20 mutation campaign;
6. existing INC-2 physical Docker controls with no skips;
7. repository change-size gate;
8. exact-head persistent `PR Verification`;
9. Stage-05 evidence bound to exact final candidate/head;
10. fresh Codex review subject to the active three-cycle cap.

No model/provider call is permitted in acceptance CI.

## 22. Stop conditions

Stop immediately and return the applicable BLOCKED/REDUCE/REDESIGN disposition if:

1. INC-1 routing or root router must change;
2. INC-2 grants, capability semantics, model-visible tool set, sandbox, network, Git, or filesystem isolation must change/weaken;
3. Jev/second judge/INC-4 is required;
4. old `stages/` or envelope machinery must be removed/cut over/equivalence-tested as migration;
5. a new dependency is required;
6. verifier trust identity is self-asserted rather than externally expected;
7. candidate bytes cannot be closed-membership bound to the executed snapshot;
8. oracle bytes become candidate/model-readable;
9. evidence cannot be authenticated and run-bound outside candidate control;
10. verifier commands require ambient network;
11. a required trusted command lacks exact executable identity/argv/cwd/resource policy;
12. resume requires semantic re-routing or re-authorization;
13. repair requires new tool/capability or exceeds two;
14. supervisor delta projects above 40 changed lines;
15. workflow edit changes product verification semantics;
16. whole implementation projects >=400 without re-measurement or >500 without separately authorized exception;
17. same failure persists without a mechanically different FailureFingerprint and new bounded diagnostic evidence;
18. exact-head CI fails without one bounded evidence-backed correction;
19. Codex cycle 3 has an actionable finding;
20. any Stage-03 freeze item remains unresolved.

No silent fix-forward.

## 23. Explicit non-authority

This Plan does not authorize:
- implementation before a frozen `CONTRACT_READY`;
- mutation of INC-1 routing;
- mutation/broadening/weakening of INC-2 execution authority;
- a new model-visible tool or grant;
- Jev, a second agent/judge, or final/repository PASS authority;
- INC-5 equivalence migration, root-router cutover, or deletion of old stage/envelope machinery;
- publication, release, deployment, or merge;
- product/application/database/backend/memory work;
- provider/model calls in acceptance CI;
- dependency addition;
- change-size exception.

## 24. Stage-02 disposition

The five-increment split is preserved exactly: increments 1 and 2 are prerequisites to preserve; increment 3 is the only work; increments 4 and 5 remain unauthorized.

The previous plan was not Build-admissible because its verification boundary was policy-complete but mechanically incomplete. This revision names the increment-3 trust root, executable identity, candidate-byte ingress and snapshot, network/resource policy, hidden oracle boundary, authenticated run-bound envelope, digest-only resume, repair-as-untrusted-candidate rule, mechanical novelty predicate, oracle confidentiality control, completion authority, Build manifest, budgets, checkpoints, and protected-action states.

No Stage-04 Build is authorized by this artifact. Stage 03 must now freeze these selected mechanisms as an implementation contract without expanding them.

PLAN_READY

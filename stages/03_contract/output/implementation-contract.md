CONTRACT_READY

# Increment 3 Verification Boundary — Implementation Freeze Contract

## 1. Disposition

This contract freezes the approved Stage-02 design at plan commit
`5a2093a9d6c97f08cd253d5d0416b95c72a21507`.

Approved Plan content SHA-256:

`3225ec9f309aa5f1a7caeae88dee25c34aad48fa527fd221b6713923993d919b`

Implementation base remains separately bound to:

`27228b8a81e3cd14b96b2d08bfc578ad12a2e317`

This is a dual binding. The Plan identity and implementation-base identity are never merged into one field.

`CONTRACT_READY` means the INC-3 mechanisms are frozen for later Build admission. It does **not** by itself admit Stage 04. A separate Build-Agent admission record must satisfy Section 4 and the repository Pre-Code Readiness Gate before any protected mutation.

## 2. Five-increment boundary

The five approved increments remain the authority boundary.

| Increment | State | Contract authority |
|---|---|---|
| 1. Routing kernel | Present | PRESERVE. No router or routing-semantics mutation. |
| 2. Execution boundary | Present | PRESERVE. No new tool/grant; no capability, sandbox, network, Git, or filesystem weakening. |
| 3. Verification boundary | Absent at implementation base | ONLY AUTHORIZED IMPLEMENTATION WORK. |
| 4. Jev restriction layer | Absent | UNAUTHORIZED. |
| 5. Migration/reduction | Not performed | UNAUTHORIZED. |

Increment 3 consists only of: external verifier, independent oracle, exact candidate binding, and evidence/provenance.

## 3. Frozen preserved identities

The following implementation-base blobs are preservation inputs and are not candidate mutations:

```text
AGENTS.md                              b3319d00d7fb489c7164f3a9af5577df710ce33e
CONTEXT.md                             2dded90579c2ad7b491ab0072a44b030f94750c6
harness/src/routing.ts                 4d4321abb4e131a9359755c647ad8c76313451a8
harness/src/capability.ts              fd4a31b7c07336c1538372b034b90e5d25f31a12
harness/src/supervisor.ts              da4a0af0ab4e32631ef0a22a4a1b8f7ad018e7de
harness/src/eve-adapter.ts             6e5468292f9ebc842d0e5b4b2d96d2429fa4cb22
harness/agent/tools/execute.ts          6b39bd4816fe8d1e145f4f2fb28e757252eb263c
harness/tests/routing.test.ts           7cb4b7217781ce87aee50368d8faa946a3eb629b
harness/tests/execution.test.ts         a5a82d3077091f0e6a33d000e259fb25571fe4ce
.github/workflows/pr-verification.yml   d735549a844c2bd0a9c482ca1da5f85088b90d89
package.json                            9136c40dca79568dfeabd1b6d8cbc181c62db868
harness/package.json                    398baf3e9a59d0521452fc7708c3ab7d6a4e5e82
package-lock.json                       8d6e653c5e12faef848ffe505f3fb9c7b02eeaff
harness/package-lock.json               1917ea384dd49ec0f02fdca38e39dcf1d1fff06e
scripts/check-change-size.sh            2745038da993d1ea22cbb634498d7be400b406a5
```

Current `harness/src/supervisor.ts` is 3,332 UTF-8 bytes and 65 lines at the implementation base.

Any required semantic change to the preserved INC-1 or INC-2 surfaces is terminal:
`BLOCKED_INCREMENT_BOUNDARY`.

## 4. Build-Agent admission boundary

This contract does not invent or replace the Build Agent source-binding schema.

Before Stage 04, the Build Agent must produce the canonical six-field binding:

```text
BuildSourceBinding := {
  commit,
  staged_diff_sha256,
  unstaged_diff_sha256,
  untracked_manifest_sha256,
  dirty_submodule_manifest_sha256,
  excluded_plan_path
}
```

Frozen values/rules:

```text
commit = 27228b8a81e3cd14b96b2d08bfc578ad12a2e317
excluded_plan_path = stages/02_plan/output/implementation-plan.md
```

The remaining four digest values are computed mechanically in the actual Build workspace by the canonical Build Agent source-binding procedure. GitHub state is not substituted for those workspace measurements.

The Build admission record must separately bind:

```text
approved_plan_commit = 5a2093a9d6c97f08cd253d5d0416b95c72a21507
approved_plan_sha256 = 3225ec9f309aa5f1a7caeae88dee25c34aad48fa527fd221b6713923993d919b
implementation_contract_commit = <exact contract commit after this mutation>
implementation_contract_sha256 = <byte-exact SHA-256 after this mutation>
human_plan_approval = true
```

Any mismatch returns `BLOCKED_SOURCE_BINDING_STALE`.

## 5. Exact candidate-path allowlist

The complete INC-3 implementation surface is:

```text
harness/src/verifier.ts
harness/verifier/profile.json
harness/verifier/oracle-manifest.json
harness/src/supervisor.ts
harness/tests/verifier.test.ts
.github/workflows/pr-verification.yml
```

No other implementation path is authorized.

Additional path rules:

- `harness/src/supervisor.ts`: only envelope-consumer integration; target <=25 changed lines, hard stop >40.
- `.github/workflows/pr-verification.yml`: exactly add
  `harness/src/verifier.ts` and `harness/tests/verifier.test.ts` to the existing Harness Verification ESLint path list. No other workflow semantic change.
- All four new files
  `verifier.ts`, `profile.json`, `oracle-manifest.json`, and `verifier.test.ts`
  must be introduced in the first implementation slice. Later review repair may not create additional files.

Any seventh implementation path returns `BLOCKED_UNAUTHORIZED_PATH`.

## 6. Reviewable-line definition and budgets

Reviewable implementation lines are exactly the repository-governed additions plus deletions from merge base to final PR head:

- counted: source, tests, scripts, SQL, configuration, schemas, workflow definitions;
- excluded: Markdown/docs, dependency lockfiles, explicitly generated framework/build artifacts.

Frozen limits:

```text
whole_PR_target <= 400
whole_PR_hard_ceiling = 500
supervisor_target_delta <= 25
supervisor_hard_stop = 40
workflow_target_delta = 1 logical line-list edit
workflow_hard_stop = 10 changed lines
```

If projected whole-PR reviewable lines reach 400, stop and re-measure before another mutation.
If they exceed 500, return `BLOCKED_CHANGE_SIZE`. This contract grants no size exception.

## 7. Canonical serialization

Every structured INC-3 identity uses:

```text
hash = SHA-256
text_encoding = UTF-8
digest_encoding = lowercase hexadecimal
object_keys = lexicographically sorted
array_order = declared order
insignificant_whitespace = none
trailing_newline = forbidden
path_separator = "/"
unicode_path_normalization = NFC
```

Rejected paths include: absolute paths, `.`, `..`, NUL, backslash aliases, and duplicate normalized paths.

Stage 04 tests must include literal canonicalization fixtures with exact input bytes and expected SHA-256.

Mismatch returns `BLOCKED_CANONICALIZATION_MISMATCH`.

## 8. Candidate manifest and immutable verification snapshot

Frozen schema:

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

1. Membership equals the complete changed-path set from implementation base to candidate, excluding the approved Plan artifact only.
2. Every changed implementation path must be in Section 5.
3. Entries are canonical-path sorted.
4. Only regular files with supported Git modes `100644` or `100755` are admitted.
5. Symlinks, hard-link ambiguity, sockets, devices, FIFOs, duplicate normalized paths, and unsupported modes block.
6. `candidate_digest = SHA256(canonical CandidateManifest bytes)`.
7. Verifier creates a new verifier-owned workspace for the run.
8. Trusted ingress copies candidate bytes into the verifier-owned repository materialization.
9. Every copied file is re-measured for byte length and SHA-256.
10. The complete candidate digest is recomputed from the verifier-owned materialization.
11. Any mismatch returns `BLOCKED_CANDIDATE_SNAPSHOT_MISMATCH`.
12. Verification commands never execute against the mutable authoring workspace.
13. Unrelated dirty-worktree changes are not ignored; they make membership exceed the allowlist and therefore block.

## 9. Verifier-owned repository materialization

The verifier workspace has three disjoint roots:

```text
/run/<nonce>/repo       writable command workspace
/run/<nonce>/authority  read-only verifier/profile/oracle/toolchain material
/run/<nonce>/evidence   verifier-only evidence/signing output
```

Properties:

- candidate/model receives no path to `authority` or `evidence`;
- no candidate writable mount aliases either root;
- `repo` is created from the trusted implementation base and then receives only authorized candidate bytes;
- any verifier-owned Git metadata exists only inside `repo`, is created from trusted base state, and is never sourced from candidate bytes;
- Git hooks are disabled;
- candidate workspace is never shared writable with verifier;
- environment is allowlisted;
- verifier workspace is destroyed after evidence finalization.

A shared writable alias returns `BLOCKED_VERIFIER_WORKSPACE_ALIAS`.

## 10. Minimal toolchain identity

The toolchain trust set is intentionally bounded.

```text
ToolchainIdentity := {
  node: { realpath, sha256 },
  npm_cli: { realpath, sha256 },
  bash: { realpath, sha256 },
  git: { realpath, sha256 }
}
```

No host-wide package, OS, PATH, or runner manifest is part of the INC-3 TCB.

Build admission computes these four realpaths and file SHA-256 values in the trusted execution environment and supplies them as expected identities. The verifier re-measures the four files before command execution.

Any mismatch returns `BLOCKED_VERIFIER_IDENTITY_MISMATCH`.

Host environment changes outside this four-file set that invalidate the run are represented by `BLOCKED_NEW_RUN_REQUIRED`, not by expanding the toolchain manifest.

## 11. Dependency-acquisition phase

`install_locked` is **not** a verifier verdict command.

It is a verifier-workspace setup phase that occurs before the network-denied oracle/check phase.

Exact ordered invocations:

```text
[node.realpath, npm_cli.realpath, "ci"]
[node.realpath, npm_cli.realpath, "ci", "--prefix", "harness"]
```

cwd: verifier-owned `repo`.

Frozen network policy for this phase:

```text
egress_allow = ["registry.npmjs.org:443"]
all_other_network = DENY
```

This allowlist is supported by the bound root and harness lockfiles, whose resolved package hosts are exactly `registry.npmjs.org`.

Limits per invocation:

```text
timeout_ms = 180000
max_stdout_bytes = 1048576
max_stderr_bytes = 1048576
max_workspace_bytes = 2147483648
```

After both installs complete, all verifier command/oracle execution runs with `DENY_ALL` network.

Ambient public network is never authorized.

## 12. Trusted verification commands

The baseline verdict commands are:

### V-CMD-01 verify_change_size

```text
id = "verify_change_size"
argv = [bash.realpath, "scripts/check-change-size.sh", implementation_base_oid]
cwd = repo
network = DENY_ALL
timeout_ms = 30000
max_stdout_bytes = 262144
max_stderr_bytes = 262144
max_workspace_bytes = 2147483648
```

Before V-CMD-01, the verifier-owned Git materialization must represent the candidate at `HEAD` with fixed verifier-only author/committer identity and hooks disabled. The implementation base remains reachable locally. No remote access is allowed.

### V-CMD-02 verify_code

```text
id = "verify_code"
argv = [node.realpath, npm_cli.realpath, "run", "verify"]
cwd = repo
network = DENY_ALL
timeout_ms = 300000
max_stdout_bytes = 2097152
max_stderr_bytes = 2097152
max_workspace_bytes = 2147483648
```

### V-CMD-03 harness_typecheck

```text
id = "harness_typecheck"
argv = [node.realpath, npm_cli.realpath, "--prefix", "harness", "run", "typecheck"]
cwd = repo
network = DENY_ALL
timeout_ms = 120000
max_stdout_bytes = 524288
max_stderr_bytes = 524288
max_workspace_bytes = 2147483648
```

### V-CMD-04 harness_test

```text
id = "harness_test"
argv = [node.realpath, npm_cli.realpath, "--prefix", "harness", "run", "test"]
cwd = repo
network = DENY_ALL
timeout_ms = 180000
max_stdout_bytes = 2097152
max_stderr_bytes = 2097152
max_workspace_bytes = 2147483648
```

Selected checks are the closed union of baseline V-CMD-01/V-CMD-02 and mechanically applicable trusted harness checks V-CMD-03/V-CMD-04 plus any already-trusted task-required command IDs.

Candidate/model input cannot supply or modify argv.

Unknown required ID returns `BLOCKED_PROFILE_INCOMPLETE`.

## 13. Independent hidden oracle

Frozen oracle-manifest schema:

```text
OracleManifest := {
  version: 1,
  oracle_entries: [{
    oracle_id,
    artifact_path,
    artifact_sha256,
    invocation_id
  }]
}
```

The actual oracle fixture/executable bytes live under verifier-owned `authority`, not under `repo`.

Every oracle artifact is SHA-256 checked against the manifest immediately before invocation.

Oracle execution uses:
- network `DENY_ALL`;
- the same bounded Node toolchain identity where Node execution is required;
- the same timeout/output/workspace ceilings as the verifier test command unless a smaller literal limit is frozen in the manifest.

Candidate/model cannot nominate oracle IDs, paths, bytes, or invocation.

Required INC-2 preservation control:

```text
execute(read oracle-manifest/verifier-authority/verifier-evidence path)
=> DENY before bytes
```

This must be proven using existing INC-2 grants and containment. If it requires any INC-2 semantic or grant change, return `BLOCKED_INCREMENT_BOUNDARY`.

## 14. Evidence-signing contract

Algorithm is frozen to existing platform cryptography:

```text
algorithm = Ed25519
implementation = node:crypto
new_dependency = false
signature_encoding = canonical base64url without padding
public_key_encoding = DER SPKI
public_key_identity = SHA256(DER SPKI bytes), lowercase hex
private_key_persistence = NONE
```

The verifier process creates one run-scoped Ed25519 keypair after admission and before verification.

The supervisor supplies:
- `run_nonce`;
- expected public-key identity after trusted verifier-key establishment;
- expected verifier/profile/oracle/toolchain identities.

The supervisor is not the signer.

The signed object is one canonical object that already contains `run_nonce`. No nonce concatenation rule exists outside canonical serialization.

```text
SignedEvidencePayload := canonical(HarnessLocalEvidence)
signature := Ed25519.sign(SignedEvidencePayload)
```

The private key never enters candidate/model state and is not persisted. Process termination ends its lifetime.

This signature is increment-3 provenance only. It is not release signing, Jev, repository PASS, or publication authority.

## 15. Harness-local evidence schema

```text
HarnessLocalEvidence := {
  schema_version: 1,
  verdict_kind: "harness_local_verdict",
  run_nonce,
  implementation_base_oid,
  candidate_digest,
  verifier_source_sha256,
  verifier_profile_sha256,
  oracle_manifest_sha256,
  toolchain_identity_sha256,
  preserved_inc1_identity_sha256,
  preserved_inc2_identity_sha256,
  selected_command_ids,
  command_records: [{
    command_id,
    executable_sha256,
    argv,
    cwd,
    exit_code,
    stdout_byte_length,
    stdout_sha256,
    stderr_byte_length,
    stderr_sha256,
    reason_code
  }],
  oracle_result_digests,
  replay_projection_sha256,
  verdict: PASS | FAIL | BLOCKED,
  reason_code
}
```

Supervisor acceptance order is frozen:

1. expected public-key identity equals observed key identity;
2. detached signature verifies over literal canonical payload bytes;
3. payload `run_nonce` equals active run;
4. implementation base and candidate digest equal active values;
5. verifier/profile/oracle/toolchain identities equal expected values;
6. preserved INC-1/2 identities equal upstream opaque digests;
7. selected command IDs exactly equal the required closed set;
8. verdict/reason-code pair is valid.

Failure returns `BLOCKED_EVIDENCE_AUTHENTICATION`.

Supervisor may record the verified verdict but may not rewrite the payload.

## 16. Stable verdict and reason codes

Top-level verdict vocabulary is exactly:

```text
PASS
FAIL
BLOCKED
```

The type is always `harness_local_verdict`.

Frozen reason codes:

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
BLOCKED_INCREMENT_BOUNDARY
```

Human text is never parsed to decide verdict, resume, or repair.

## 17. Determinism class and same-state replay

Every INC-3 Build slice is class:

`DETERMINISTIC`

A PASS requires two consecutive verifier executions against the same immutable candidate snapshot and the same frozen identities.

Because run nonces, signatures, and raw npm/log bytes are intentionally non-stable, determinism is evaluated over this frozen projection:

```text
DeterministicProjection := {
  implementation_base_oid,
  candidate_digest,
  verifier_source_sha256,
  verifier_profile_sha256,
  oracle_manifest_sha256,
  toolchain_identity_sha256,
  selected_command_ids,
  command_exit_codes,
  oracle_result_digests,
  top_level_verdict,
  top_level_reason_code
}
```

The two canonical projection byte strings must be identical.

Mismatch returns `BLOCKED_NEW_RUN_REQUIRED`.

Raw stdout/stderr remain captured in evidence but do not define semantic determinism.

## 18. Resume ownership and equality-only checks

INC-3 never parses or re-derives INC-1/2 semantics.

Frozen ownership:

```text
authority_bundle_sha256      -> upstream governance/Build admission
routing_contract_sha256      -> INC-1 owner
capability_policy_sha256     -> INC-2 owner
tool_policy_sha256           -> INC-2 owner
eve_identity_sha256          -> INC-2 owner
model_configuration_sha256   -> INC-2 owner
verifier_identity_sha256     -> INC-3 trusted verifier admission
oracle_manifest_sha256       -> INC-3 trusted verifier admission
candidate_digest             -> INC-3 candidate binder
```

INC-3 consumes these as opaque values and performs equality only.

```text
authority/routing digest drift -> RETURN_TO_AUTHORITY_READ_ONLY
candidate digest drift         -> BLOCKED_RESUME_IDENTITY_DRIFT
capability/tool/Eve/model/verifier/oracle drift -> BLOCKED_NEW_RUN_REQUIRED
all equal -> RESUME_ALLOWED
```

INC-3 may not re-run routing or rewrite capability grants during resume.

## 19. Two-repair contract

Every repair remains a new untrusted candidate subject to existing INC-2 execution authority.

No repair tool, grant, filesystem permission, or verifier authority is added.

Frozen semantic failure fingerprint:

```text
FailureFingerprint =
  SHA256(canonical {
    selected_command_ids,
    failing_command_ids,
    command_exit_codes,
    oracle_result_digests,
    top_level_reason_code
  })
```

Raw stdout/stderr hashes are intentionally excluded from novelty.

Transitions:

```text
initial repair_count = 0

FAIL and repair_count < 2
  -> candidate may be repaired only through existing INC-2 grants
  -> verifier reruns on the new candidate

new fingerprint != prior fingerprint
  -> repair_count += 1

new fingerprint == prior fingerprint
  -> BLOCKED_EVIDENCE_NOT_NOVEL

repair_count == 2 and another repair is requested
  -> BLOCKED_REPAIR_BUDGET_EXHAUSTED

PASS
  -> terminal harness-local PASS

BLOCKED
  -> terminal current-run BLOCKED
```

The verifier reports evidence only; it never grants repair authority.

## 20. Negative controls

Stage 04 tests must freeze these exact intended outcomes:

- NC-01 alternate argv for a known command ID -> ignored/denied; trusted argv unchanged.
- NC-02 omission of baseline/applicable command -> command remains selected or `BLOCKED_PROFILE_INCOMPLETE`.
- NC-03 unknown required command ID -> `BLOCKED_PROFILE_INCOMPLETE`.
- NC-04 verifier/profile/oracle/toolchain identity mismatch -> `BLOCKED_VERIFIER_IDENTITY_MISMATCH`.
- NC-05 unauthorized candidate path, symlink, unsupported mode, or duplicate normalized path -> `BLOCKED_UNAUTHORIZED_PATH`.
- NC-06 candidate mutation between manifest and verifier copy -> `BLOCKED_CANDIDATE_SNAPSHOT_MISMATCH`.
- NC-07 shared writable alias into authority/evidence -> BLOCKED before commands.
- NC-08 timeout/output/disk limit exceeded -> `FAIL_RESOURCE_LIMIT`.
- NC-09 nonzero trusted command -> `FAIL_COMMAND_EXIT`.
- NC-10 INC-2 execute read of oracle/authority/evidence -> DENY before bytes.
- NC-11 oracle artifact digest mismatch -> `BLOCKED_ORACLE_IDENTITY_MISMATCH`.
- NC-12 mutate evidence bytes/signature/public-key identity/nonce -> `BLOCKED_EVIDENCE_AUTHENTICATION`.
- NC-13 replay signed evidence under another nonce/candidate -> `BLOCKED_EVIDENCE_AUTHENTICATION`.
- NC-14 authority/routing resume drift -> RETURN_TO_AUTHORITY_READ_ONLY.
- NC-15 candidate resume drift -> `BLOCKED_RESUME_IDENTITY_DRIFT`.
- NC-16 capability/tool/Eve/model/verifier/oracle drift -> `BLOCKED_NEW_RUN_REQUIRED`.
- NC-17 identical semantic failure fingerprint -> `BLOCKED_EVIDENCE_NOT_NOVEL`.
- NC-18 third repair request -> `BLOCKED_REPAIR_BUDGET_EXHAUSTED`.
- NC-19 candidate tests pass while hidden oracle fails -> `FAIL_ORACLE`.
- NC-20 each load-bearing predicate mutation must kill at least one designated test.

## 21. Positive controls

- PC-01 trusted selector returns the exact closed command union.
- PC-02 canonical CandidateManifest fixture reproduces its expected SHA-256.
- PC-03 verifier-owned snapshot reproduces candidate digest.
- PC-04 dependency acquisition reaches only `registry.npmjs.org:443`; verification/oracle phase has no network.
- PC-05 trusted command execution uses expected executable identities and literal argv.
- PC-06 stdout/stderr byte lengths and SHA-256 match captured bytes.
- PC-07 hidden oracle identity matches and contributes to verdict.
- PC-08 Ed25519 signature verifies only for the active nonce/key identity.
- PC-09 two deterministic projections on same snapshot are byte-identical before PASS.
- PC-10 unchanged resume identities -> RESUME_ALLOWED.
- PC-11 at most two semantically novel repair transitions occur under existing INC-2 grants.
- PC-12 all existing INC-1 routing tests remain unchanged and green.
- PC-13 all existing INC-2 execution and physical Docker controls remain unchanged, unskipped, and green.
- PC-14 downstream product `PR Verification` semantics remain unchanged.

## 22. NC-20 mutation matrix

The implementation must assign stable predicate IDs and designated killing tests at minimum for:

```text
P-SEL-CLOSED        -> NC-01, NC-02, NC-03
P-VERIFIER-ID       -> NC-04
P-CANDIDATE-MEMBER  -> NC-05
P-SNAPSHOT-BIND     -> NC-06
P-WORKSPACE-ISO     -> NC-07
P-RESOURCE-BOUND    -> NC-08
P-COMMAND-FAIL      -> NC-09
P-ORACLE-CONF       -> NC-10
P-ORACLE-ID         -> NC-11
P-EVIDENCE-AUTH     -> NC-12, NC-13
P-RESUME-AUTH       -> NC-14
P-RESUME-CANDIDATE  -> NC-15
P-RESUME-RUNTIME    -> NC-16
P-REPAIR-NOVELTY    -> NC-17
P-REPAIR-BUDGET     -> NC-18
P-ORACLE-OVERRIDE   -> NC-19
```

A mutation campaign passes only when every listed predicate mutation causes at least one designated test to fail for the intended reason.

Aggregate mutation percentage is not acceptance evidence.

## 23. Build-slice contract

A later Build-admission artifact must emit four DETERMINISTIC slices, each <=5 files.

### Slice 3.1 — create complete file surface and freeze identity/selection

Files:
- `harness/src/verifier.ts`
- `harness/verifier/profile.json`
- `harness/verifier/oracle-manifest.json`
- `harness/tests/verifier.test.ts`

Postcondition:
all four future INC-3 files exist; NC-01..06 and PC-01..03 are red-first then pass.

Budget checkpoint:
projected cumulative reviewable lines <=170.

### Slice 3.2 — workspace, network/resource policy, hidden oracle

Files:
- `harness/src/verifier.ts`
- `harness/verifier/profile.json`
- `harness/verifier/oracle-manifest.json`
- `harness/tests/verifier.test.ts`

Postcondition:
NC-07..11/19 and PC-04..07 pass without INC-2 mutation.

Budget checkpoint:
projected cumulative <=300.

### Slice 3.3 — authenticated evidence, deterministic replay, resume, repair

Files:
- `harness/src/verifier.ts`
- `harness/src/supervisor.ts`
- `harness/tests/verifier.test.ts`

Postcondition:
NC-12..18 and PC-08..11 pass; supervisor remains consumer only.

Budget checkpoint:
projected cumulative <=390; supervisor delta <=25 target / 40 hard stop.

### Slice 3.4 — workflow inclusion and preservation

Files:
- `.github/workflows/pr-verification.yml`

Exact mutation:
append `harness/src/verifier.ts` and `harness/tests/verifier.test.ts` to the existing Harness Verification ESLint invocation; no other workflow behavior changes.

Postcondition:
PC-12..14 pass, full exact-head verification is reachable.

Budget:
whole PR <=400 target / <=500 hard ceiling.

## 24. Completion authority

Frozen authority:

```text
producer_completion_authority = NONE
harness_local_verdict_authority = INC-3 verifier only
increment_3_completion_authority =
  exact-head repository PR Verification PASS
  AND required Codex review of that exact implementation state with zero unresolved actionable findings
stage_05_evidence_role = exact-candidate binding evidence only, NOT a completion issuer
publication_mode = NONE
repository_pass_authority = NONE
jev_authority = NONE
merge_authority = USER_ONLY
```

No harness-local PASS can substitute for repository verification/review.

## 25. Required verification sequence

After Build admission and implementation freeze:

1. narrow red-first verifier tests after each authorized mutation;
2. harness typecheck;
3. complete harness test suite;
4. NC-20 mutation campaign;
5. existing INC-1 tests unchanged and green;
6. existing INC-2 physical Docker controls unskipped and green;
7. repository change-size gate;
8. exact-head persistent PR Verification;
9. Stage-05 evidence bound to exact candidate/head;
10. independent Codex review subject to the active three-cycle cap.

No model/provider call is permitted in acceptance CI.

## 26. Stop conditions

Stop immediately if any of these becomes true:

1. INC-1 routing/root-router mutation is required.
2. INC-2 grants, tool closure, capability semantics, sandbox, network, Git, or filesystem isolation must change.
3. Any model-visible tool or new grant is required.
4. Jev, a second judge/agent, or INC-4 authority is required.
5. Old `stages/` or envelope machinery must be removed, cut over, or equivalence-tested.
6. A new dependency is required.
7. Verifier/profile/oracle/toolchain trust becomes self-asserted.
8. Candidate bytes cannot be bound to the executed verifier-owned snapshot.
9. Oracle/authority/evidence bytes become candidate/model-readable.
10. Evidence cannot be authenticated with the frozen Ed25519 boundary.
11. Verification/oracle execution requires ambient network.
12. Dependency acquisition needs any resolved package host other than `registry.npmjs.org`.
13. Resume requires re-routing or grant rewriting instead of digest equality.
14. Repair requires new authority or exceeds two transitions.
15. Supervisor delta projects above 40 changed lines.
16. Workflow change exceeds the exact Section-23 mutation.
17. Whole implementation reaches 400 without re-measurement or exceeds 500.
18. Deterministic replay projection differs on unchanged state.
19. Exact-head CI fails without one bounded evidence-backed correction.
20. Codex cycle 3 reports an actionable finding.
21. Build-Agent source binding or approved Plan/Contract identity is stale.

Required disposition: `BLOCKED`, `REDUCE`, or `REDESIGN` according to the trigger. No fix-forward past a stop condition.

## 27. Explicit non-authority

This contract does not authorize:

- Stage 04 before a valid Build-Agent admission record and G_PRE_CODE_READY;
- mutation outside the six candidate paths;
- INC-1 mutation;
- INC-2 semantic/grant/tool/isolation mutation;
- Jev or any INC-4 implementation;
- INC-5 migration/reduction/cutover;
- release signing or publication;
- deployment;
- product/application/database/backend/memory work;
- provider/model calls in acceptance CI;
- dependency additions;
- change-size exception;
- merge.

## 28. Stage-03 disposition

The selected Stage-02 mechanisms are frozen without adding a new architectural mechanism.

The contract resolves the residual Stage-03 values requested by review:

- dual Plan/base binding;
- canonical Build-Agent binding schema separation;
- Ed25519 signed-payload semantics;
- bounded four-file toolchain identity;
- phased dependency acquisition with only `registry.npmjs.org:443`;
- literal verifier command vectors, cwd, network, timeout and output/disk caps;
- candidate snapshot and verifier-owned Git materialization;
- narrowed semantic failure fingerprint;
- deterministic replay projection;
- opaque resume-digest ownership;
- oracle confidentiality against existing INC-2 execute;
- exact NC/PC and mutation matrices;
- exact reviewable-line definition and budgets;
- corrected completion authority;
- publication `NONE`, Jev `NONE`, migration `NONE`.

This contract is ready for a separate Build-admission artifact. It does not itself open Stage 04.

CONTRACT_READY

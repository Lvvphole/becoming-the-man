PLAN_READY

# Eve Zero-Trust Engineering Harness — Redesigned Plan v3.3

## Disposition

`PLAN_READY` after the bounded v3.3 corrections and an executed plan-policy adversarial backtest.

This is **not** an implementation PASS.

This revision replaces v3.2. It binds the harness to the existing single repository, closes the candidate-command isolation defect, and adds a retrievable engineering-rules authority identifier.

---

## 1. Source binding and identity

Target repository: `Lvvphole/becoming-the-man`

Base commit OID:

`13ff57bc8dbece2e6a517753835a08d11402b90d`

PR #39 is currently closed and unmerged. Its implementation is negative-learning evidence only and is not an implementation baseline.

Identity is explicit:

- `git_blob_oid` is Git repository object identity.
- `content_sha256` is SHA-256 of the retrieved file bytes.
- These identifiers never share a field and are never compared as equivalent values.

| Authoritative source | Git blob OID | Content SHA-256 |
|---|---|---|
| `AGENTS.md` | `23b5716e0ffb18051e3daa309bc938b04ccdb8bc` | `aeee7bdea5c81f684c1099deee76bda4b8a839a0d52b13a83cb5a293e1390bd2` |
| `.github/workflows/pr-verification.yml` | `87328d05b5be848653f7e75e25cfb0b978d37950` | `0b31dd08c57405520f33f4cc5230495159393db82e9714d03b08bcaba7321978` |
| `.claude/skills/plan/SKILL.md` | `5b9325558cc0a792b2bf6e98fb7b018b30492d53` | `fbc9e8467fa92f75037de90ce75c572c845b90e2b564af151cd1f907ebf81a48` |
| `docs/Website_System_Architecture_v1.0_LOCKED.md` | `d6e9a1c7f333ed39a4073ae87c30860dd0424530` | `97316c58bba62062952758ef3493d5a6122bc59938237917a0dcefc175f157ce` |
| `docs/SYSTEM_ARCHITECTURE_AMENDMENT_v1.1.md` | `05c332761e1194936e6b02989728b44743c24b53` | `9b28375aac6288f1917cef54523e12e932669e28181e3dbfe762e35c212192ca` |
| `docs/SYSTEM_ARCHITECTURE_AMENDMENT_v1.2.md` | `62e06c4680d871317093d964ebc2bfadd0f22622` | `81c72ac8539e95608cd9b8fa25d121abb8d5f22a254a75231ab1397a172f175c` |

External canonical engineering rules:

- stable source identifier: `skill://flora-skills/root/.codex/skills/remote-skills/skill-6a7bbe3c89448191900ebcdd6395ac7c/SKILL.md`
- bytes: `31,013`
- content SHA-256: `deb95b212e0d3fae948e6cd0b9b932ede58cbaeef0170ccc8257b7a80a117793`

Builder preflight must recompute every applicable identity before the first implementation mutation.

---

## 2. Frozen outcome contract

### Goal

Build the smallest sufficient single-agent Eve engineering control plane that can author candidate changes for `becoming-the-man` without allowing the model to bypass target governance, self-certify, gain privileged execution, expand scope silently, capture the verifier/oracle, or optimize toward superficial green signals instead of the governed Definition of Done.

### Selected architecture

- Harness component name: **`Agent-Harness`**.
- Harness repository path: **`agent-harness/`** inside `Lvvphole/becoming-the-man`.
- The locked single-repository architecture remains unchanged; no separate harness repository exists.
- Eve is the orchestrator/runtime.
- Eve uses the AI SDK. OpenAI SDK is not required.
- One root agent only.
- Eve Docker backend.
- Model sandbox has deny-all network, no secrets, no Docker socket, no host read-write repository mount, no GitHub write credential, no verifier authority, and no merge authority.
- Target `AGENTS.md` remains the target routing authority.
- Canonical engineering rules remain independently required before mutation.
- Target `.claude/skills` remain target-owned procedures and are read directly from the bound target snapshot.
- Candidate verification is external to the Eve sandbox.
- Acceptance oracle is verifier-owned and non-model-visible.
- Scope authority comes from the trusted TaskEnvelope, not from model prose.
- Candidate export compares workspace bytes to a trusted base manifest outside the sandbox and does not trust sandbox Git metadata.
- PR publication is trusted-side and approval-gated.
- Target exact-head `PR Verification`, Codex review, and explicit user merge authorization remain independent downstream authority.
- PR #39 is abandoned, not repaired.

---

## 3. Definition of Done

### D1 — Governed in-repository component bootstrap

`Agent-Harness` is implemented only under `agent-harness/` in the existing `Lvvphole/becoming-the-man` repository. Existing root `AGENTS.md` remains the routing authority. No nested `AGENTS.md` is created in INC-0.

Before implementation:

1. bind current `main` and root `AGENTS.md` identities;
2. read root `AGENTS.md` before any write;
3. read the canonical engineering rules from the stable source identifier and verify its digest;
4. read only the routed architecture sections required for the harness boundary;
5. complete the Pre-Code Readiness Gate;
6. constrain INC-0 writes to its exact declared paths under `agent-harness/` plus the authorized task-list entry.

Failure returns `BLOCKED_READINESS_REQUIRED`.

### D2 — Exact identity model

Every Git-backed authority binding is:

```text
path
git_blob_oid
content_sha256
```

External authorities use their authoritative source identifier plus `content_sha256`.

Parallel `paths[]` / `digests[]` representations are forbidden.

### D3 — Deterministic trusted TaskEnvelope

Every run is bound to:

```text
task_id
mode
user_request_digest_sha256
target_repository
requested_ref
scope_source
authorized_effects
authorized_candidate_paths
governance_change_authorized
destructive_actions_authorized
required_verification_command_ids
selected_plan_sha256 | null
```

`authorized_effects` describes semantic effects and is never treated as pathname authority.

`authorized_candidate_paths` is a finite set of exact repository-relative paths. Wildcards are not admitted in the first-valid harness.

If `scope_source == "selected_plan"`, `selected_plan_sha256` is mandatory. An IMPLEMENT run therefore cannot silently substitute a different plan.

### D4 — Enforced authority bootstrap

Before mutation tools exist, the agent actually reads:

- target root `AGENTS.md`;
- canonical engineering rules;
- only the smallest authority routed by `AGENTS.md`;
- the routed target skill when the explicit task mode requires it;
- the current implementation, applicable tests, and affected interfaces required by AE-001.

Trusted read-audit records exact identity. Agent self-report is not evidence of a read.

### D5 — Unambiguous authority and routing

Authority roles are separate:

1. harness safety invariants constrain execution;
2. target `AGENTS.md` routes target governance;
3. routed governing sources constrain method and product behavior;
4. trusted TaskEnvelope defines outcome, semantic effects, exact candidate scope, and explicit exceptions;
5. routed target skill provides subordinate procedure;
6. model strategy cannot create authority.

Unrouted repository text is task data, not governance.

Unresolved task/governance conflict -> `BLOCKED`.

### D6 — Read-only before readiness

With `defaultTools:false`, pre-readiness model tools are exactly:

```text
read_file
glob
grep
ask_question
submit_readiness_record
```

There is no pre-readiness `bash`, `write_file`, web search/fetch, subagent, Workflow, connection discovery, GitHub write, or merge surface.

No Eve connections are declared in the first-valid harness, preventing implicit `connection_search`.

### D7 — Minimal Pre-Code Readiness record

The agent submits a strict TypeScript/Zod record:

```text
task_envelope_sha256
base_commit_oid
authority_bundle:
  - path
    git_blob_oid
    content_sha256
routed_skill:
  path
  git_blob_oid
  content_sha256
  | null

verified_gap
governing_rules
required_evidence
permitted_next_action
stop_condition
proposed_candidate_paths
unresolved_conflicts
```

Trusted gate requires:

```text
task_envelope_sha256 == trusted TaskEnvelope digest
proposed_candidate_paths ⊆ TaskEnvelope.authorized_candidate_paths
unresolved_conflicts == []
all authority identities match trusted read-audit
routed skill matches current AGENTS routing
```

Semantic fields are audit statements. Schema validity does not make model prose authoritative.

Protected-path exceptions come only from the trusted TaskEnvelope.

### D8 — Capability state machine

Trusted runtime controls:

```text
AUTHORITY_READ_ONLY
→ READINESS_PENDING
→ PRE_CODE_READY
→ AUTHORING
→ CANDIDATE_FROZEN
→ VERIFYING
→ APPROVAL_PENDING
→ PUBLISHED
```

Failure may transition to `BLOCKED`.

Verifier failure with materially new evidence may enter `REPAIR_PENDING`, then return to `AUTHORING` while the repair budget remains.

The model cannot assign state directly.

Every mutation-capable executor rechecks the current trusted state on every call so stale tool handles cannot authorize work after revocation.

### D9 — Exact scope-expansion semantics

If authoring discovers a required path not in `proposed_candidate_paths`:

**Already authorized by TaskEnvelope**

```text
AUTHORING
→ request_scope_expansion
→ mutation tools revoked
→ READINESS_PENDING
→ revised readiness record
→ PRE_CODE_READY
→ AUTHORING
```

**Outside TaskEnvelope.authorized_candidate_paths**

```text
BLOCKED_NEW_TASK_AUTHORIZATION
```

A new or explicitly revised TaskEnvelope is required.

### D10 — Disposable sandbox, not a trusted Git worktree

Trusted materialization constructs `/workspace` from the exact target base commit **without `.git` metadata**.

The sandbox is disposable.

`bash` starts in `/workspace`, but the harness does **not** claim an OS-level filesystem reference monitor or universal write confinement to `/workspace`.

Writes elsewhere in the disposable container carry no authority and cannot cross the candidate export boundary.

### D11 — Trusted candidate exporter

After authoring freezes:

1. trusted runtime obtains a read-only snapshot of `/workspace`;
2. exporter compares it against a trusted base manifest held outside the sandbox;
3. sandbox Git/index/object/config state is never consulted;
4. only regular files are admitted;
5. symlinks and hardlinks fail closed;
6. supported modes are only `100644` and `100755`;
7. repository-relative paths are canonicalized;
8. absolute paths and `..` traversal are rejected;
9. `.git` and reserved internal metadata are rejected;
10. case-colliding canonical paths are rejected;
11. additions, modifications, and deletions are derived against the trusted base;
12. `actual_changed_paths ⊆ proposed_candidate_paths`;
13. `actual_changed_paths ⊆ TaskEnvelope.authorized_candidate_paths`;
14. protected paths require an exception already present in the trusted TaskEnvelope;
15. candidate records are sorted by canonical path and contain operation, mode, and content SHA-256;
16. SHA-256 of the canonical sorted manifest is `candidate_digest`.

A hostile shell command may damage its disposable workspace. It cannot export unauthorized bytes.

### D12 — Trusted verification selection

The candidate cannot select, remove, or rewrite verifier commands.

The target profile owns a trusted command catalog.

Baseline pre-publication command IDs:

```text
install_locked
verify_change_size
verify_code
```

`verify_code` maps exactly to:

```text
npm run verify
```

Actual verification is the union of:

```text
baseline command IDs
+
path-triggered target-profile checks
+
TaskEnvelope.required_verification_command_ids
```

Applicable surface-specific checks remain governed by target `AGENTS.md`.

If routed authority requires a verification surface but the trusted catalog has no command ID:

`BLOCKED_PROFILE_INCOMPLETE`

The verifier must not guess or silently omit it.

The local verifier is **not** named or represented as GitHub `PR Verification`. Repository-committed exact-head `PR Verification` remains downstream authority after publication.

### D13 — Decoupled acceptance oracle

Candidate-authored tests are candidate code. They may satisfy TDD obligations but cannot independently certify the candidate.

The independent oracle:

- belongs to the external verifier;
- has a frozen manifest digest;
- is not model-visible;
- is not candidate-writable;
- cannot be nominated by the agent.

The first-valid harness does **not** invent universal AST bans, universal symbol whitelists, universal complexity declarations, or subjective abstraction declarations.

Task-specific structural predicates are added only when routed authority explicitly requires them.

### D14 — External verifier

The verifier control plane runs outside the candidate workspace and has no shared writable volume with it. It never executes candidate-controlled commands directly.

Every candidate-controlled command, including package-manager lifecycle hooks, tests, builds, and routed verification commands, runs in a fresh verifier-launched least-privilege command sandbox. The command sandbox has:

- deny-all network by default;
- no secrets, GitHub credentials, Docker socket, verifier/oracle files, or host filesystem access;
- no shared writable volume with the verifier control plane or another command sandbox;
- a sanitized fixed environment and verifier-selected argv/cwd;
- verifier-enforced CPU, memory, PID, wall-clock, and output limits;
- a disposable writable candidate working copy derived from the frozen candidate identity;
- a narrow verifier-owned evidence channel that returns only bounded exit status and captured output.

Dependency acquisition, when required, is verifier-controlled and separated from candidate lifecycle execution. Candidate code cannot configure, weaken, or escape the command sandbox.

It binds:

```text
base_commit_oid
candidate_digest
target_profile_digest
verifier_profile_digest
oracle_manifest_digest
```

Candidate cannot edit verifier/profile or choose executable commands.

For every command, verifier records:

```text
argv
cwd
exit code
stdout bytes + SHA-256
stderr bytes + SHA-256
```

Verdict is exactly:

```text
PASS | FAIL | BLOCKED
```

Model output never counts as verdict evidence.

### D15 — Fail-closed resume

Every Eve durable resume revalidates:

```text
current target main
authority bundle
routed skill
TaskEnvelope
target profile
tool policy
verifier profile
Eve version
model configuration
candidate digest when frozen
```

Governance drift -> `RETURN_TO_AUTHORITY_READ_ONLY`

Frozen candidate drift -> `BLOCKED`

Tool/verifier/model/Eve configuration drift -> `BLOCKED_NEW_RUN_REQUIRED`

If `main` advances during authoring, the run may finish against its frozen base, but publication is forbidden unless current `main` still equals the verified base. No silent rebase is performed.

### D16 — Bounded repair

Maximum repairs per run: **2**.

A repair requires materially new machine evidence.

Same failure without new evidence -> `BLOCKED`.

### D17 — Exact publication

Publication requires:

```text
verifier PASS
+
human approval bound to:
run_id
base_commit_oid
candidate_digest
operation
```

Publisher exposes only:

```text
feature branch
pull request
```

No merge operation exists.

After GitHub write, trusted publisher recomputes published content identity and requires equality with the accepted candidate.

Current `main` must still equal the verified base before publication.

### D18 — Target acceptance preserved

Harness PASS does not replace:

- exact-head target `PR Verification`;
- required Codex review;
- up-to-date-main requirement;
- explicit user merge authorization.

A green local harness run is not merge readiness.

### D19 — Minimality / anti-overengineering

First-valid harness contains:

- one target repository;
- one agent;
- Eve;
- AI SDK package `ai`;
- Zod;
- one model-provider adapter;
- Docker as runtime infrastructure;
- Node built-in `fetch` for GitHub REST before adding another GitHub SDK.

Not admitted without a measured DoD gap:

- external database/Postgres;
- Redis;
- queues;
- vector store;
- Mem0/external memory;
- custom sandbox image pipeline;
- web UI;
- GitHub App;
- MCP;
- scheduler/daemon;
- external telemetry backend;
- multi-repository plugin framework;
- harness-side Eve skills;
- second agent.

### D20 — Two levels of mutation evidence

**Before implementation:** plan-policy mutants must all be rejected.

**During implementation:** executable/runtime mutants must be killed by each increment's real verifier/evals before increment acceptance.

Plan-policy backtest evidence is never transferred as implementation evidence.

---

## 4. In-repository bootstrap gate B0

B0 binds the new component to the existing repository governance:

```text
1. Repository is `Lvvphole/becoming-the-man`.
2. Component path is `agent-harness/`.
3. Current main and root `AGENTS.md` identities are rebound.
4. Root `AGENTS.md` is read before mutation.
5. Canonical engineering rules are retrieved from the stable source identifier and their digest is verified.
6. Routed single-repository architecture and CI governance are read.
7. The normal Pre-Code Readiness Gate passes.
8. Only then may INC-0 mutate its exact declared paths.
```

Failure -> `BLOCKED_READINESS_REQUIRED`.

---

## 5. Routing contract

| Mode | Target procedure | Mutation |
|---|---|---:|
| `SCOUT` | `.claude/skills/scout-agent/SKILL.md` | No |
| `PLAN` | `.claude/skills/plan/SKILL.md` | No |
| `IMPLEMENT` | No skill unless current `AGENTS.md` routes one | After readiness |
| `REPAIR` | Root Bug Fix & Repair contract unless router adds a skill | After readiness |
| `REVIEW` | Root governance + routed authority | No |
| `GOVERNANCE_CHANGE` | Explicit governance mutation mode | After readiness |

Target skills are never copied into Eve `agent/skills/`.

---

## 6. Increments

### INC-0 — Harness authority skeleton

Prerequisite: B0 satisfied.

Close the authority/readiness foundation:

- bind existing repository root `AGENTS.md`;
- bind canonical engineering rules;
- implement trusted TaskEnvelope;
- implement authority/read audit;
- implement readiness state machine;
- add one mechanical `becoming-the-man` target profile;
- freeze run/configuration identity.

No authoring tools yet.

**Stop:** authority must be duplicated into another normative source, or mutation becomes possible.

### INC-1 — Readiness-gated Eve sandbox

Add:

- exact Eve/model configuration;
- approved Eve OCI image digest;
- Docker deny-all;
- `defaultTools:false`;
- exact read-only initial tool surface;
- per-call state-checked mutation tools after readiness;
- workspace materialization without `.git`.

**Stop:** unexpected model capability, connection, secret, network, Docker socket, host RW mount, or stale mutation capability.

### INC-2 — Scope and candidate export

Add:

- trusted base manifest;
- scope-rebind protocol;
- read-only export snapshot;
- canonical candidate manifest/digest;
- protected-path enforcement.

**Stop:** candidate scope derives from semantic effects, sandbox Git state, or model-nominated protected exceptions.

### INC-3 — Trusted verification and oracle

Add:

- trusted command catalog/selector;
- external verifier workspace;
- verifier-owned oracle manifest;
- evidence envelope;
- resume guard;
- exact two-repair loop.

**Stop:** candidate chooses verifier commands/oracle, or required routed verification has no trusted command ID.

### INC-4 — Approval-gated publisher

Add:

- PR-only publisher;
- exact human approval binding;
- current-main equality check;
- published-content equality verification.

**Stop:** merge/bypass/token exposure or byte mismatch.

### INC-5 — Runtime adversarial acceptance

Run real implementation-level mutants for:

- state bypass;
- authority skipping;
- stale tool handles;
- scope expansion;
- hostile shell mutations;
- candidate export escape;
- verifier/oracle capture;
- stale resume;
- publication replay;
- overengineering.

Any survivor -> `BLOCKED`.

---

## Atomic obligations

- `OBL-REV-1`: replace the v3.2 plan and policy with the in-repository v3.3 identities and candidate-command sandbox contract.
- `OBL-REV-2`: persist reproducible v3.3 mutation evidence whose committed bytes are checked by the reproducer in normal and optimized Python modes.
- `OBL-INC0-1`: reject an untrusted or incomplete TaskEnvelope before authoring capability exists.
- `OBL-INC0-2`: bind root governance, engineering-rules authority, target profile, and run configuration as exact identities in the readiness decision.
- `OBL-INC0-3`: expose no authoring tool from INC-0 and return only `PRE_CODE_READY` or a stable blocking code.

## Build manifest

```json
{
  "schema": "build-agent/v2",
  "completion_authority": "Repository owner after exact-head PR Verification and Codex review",
  "source_binding": {
    "commit": "13ff57bc8dbece2e6a517753835a08d11402b90d",
    "staged_diff_sha256": "49a528df0c6920081bc96f58f6bd8f0910d1decc8d93c5d51f526407abd60c92",
    "unstaged_diff_sha256": "7232b48772c50e86addf0750837b64f6198412108ef29266be7fed6bfcc85bd3",
    "untracked_manifest_sha256": "4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945",
    "dirty_submodule_manifest_sha256": "4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945",
    "excluded_plan_path": "docs/evidence/eve-zero-trust-engineering-harness-plan-v3.3.md"
  },
  "task_list": {
    "target": "tasks/todo.md",
    "preservation_evidence": "tasks/todo.md did not exist at source commit 13ff57bc8dbece2e6a517753835a08d11402b90d",
    "entries": [
      {"increment": "REV-A", "text": "Replace the v3.2 plan and normative policy with v3.3."},
      {"increment": "REV-B", "text": "Persist and reproduce the v3.3 adversarial plan evidence."},
      {"increment": "INC-0", "text": "Implement the Agent-Harness authority and readiness skeleton without authoring tools."}
    ]
  },
  "increments": [
    {
      "id": "REV-A",
      "objective": "Bind the corrected in-repository architecture and verifier isolation contract.",
      "obligations": ["OBL-REV-1"],
      "dependencies": [],
      "files": ["docs/evidence/eve-zero-trust-engineering-harness-plan-v3.3.md", "docs/evidence/eve-v3.3-backtest/eve-v3.3-normative-policy.json", "docs/evidence/eve-v3.3-backtest/eve-v3.3-mutation-manifest.json"],
      "actions": [{"instruction": "Replace v3.2 identities and invalid bootstrap assumptions.", "postcondition": "Plan and policy identify agent-harness/ inside becoming-the-man and prohibit direct verifier execution of candidate commands."}],
      "acceptance_criteria": ["Plan and policy contain the stable engineering-rules locator and command-sandbox invariants."],
      "verifier": {"reference": "python3 docs/evidence/eve-v3.3-backtest/reproduce_eve_v3_3_backtest.py", "oracle": "Policy validation and all declared mutants are rejected.", "class": "DETERMINISTIC"},
      "budgets": {"repair_attempts": 2, "command_timeout_seconds": 30, "increment_timeout_seconds": 300},
      "checkpoint": "v3.3 plan-policy inputs fixed and canonical",
      "stateful": false,
      "protected_actions": [],
      "recovery": null
    },
    {
      "id": "REV-B",
      "objective": "Persist self-checking deterministic evidence for the revised policy.",
      "obligations": ["OBL-REV-2"],
      "dependencies": ["REV-A"],
      "files": ["docs/evidence/eve-v3.3-backtest/eve-v3.3-backtest-results.json", "docs/evidence/eve-v3.3-backtest/eve-v3.3-aggregate-evidence.txt", "docs/evidence/eve-v3.3-backtest/reproduce_eve_v3_3_backtest.py"],
      "actions": [{"instruction": "Run the deterministic backtest and persist exact outputs.", "postcondition": "Normal and optimized runs compare generated bytes with committed evidence and report zero survivors."}],
      "acceptance_criteria": ["154 mutants are killed with zero survivors in normal and optimized modes."],
      "verifier": {"reference": "python3 reproduce_eve_v3_3_backtest.py and python3 -O reproduce_eve_v3_3_backtest.py from the evidence directory", "oracle": "Both commands exit zero and report mutants=154 killed=154 survivors=0 without changing committed evidence.", "class": "DETERMINISTIC"},
      "budgets": {"repair_attempts": 2, "command_timeout_seconds": 30, "increment_timeout_seconds": 300},
      "checkpoint": "v3.3 evidence bytes reproduce exactly",
      "stateful": false,
      "protected_actions": [],
      "recovery": null
    },
    {
      "id": "INC-0",
      "objective": "Produce a deterministic readiness decision that cannot expose authoring capability before all trusted bindings pass.",
      "obligations": ["OBL-INC0-1", "OBL-INC0-2", "OBL-INC0-3"],
      "dependencies": ["REV-B"],
      "files": ["agent-harness/src/inc0.ts", "tests/agent-harness/inc0.test.ts", "tasks/todo.md"],
      "actions": [{"instruction": "Establish failing tests for malformed, missing, and mismatched authority inputs.", "postcondition": "The INC-0 test fails because the implementation is absent."}, {"instruction": "Implement strict contracts and the pure readiness state transition.", "postcondition": "All INC-0 cases return the exact expected readiness or blocking code and no authoring tools."}],
      "acceptance_criteria": ["Valid exact bindings return PRE_CODE_READY with no authoring tools.", "Every missing or mismatched binding returns a stable BLOCKED code.", "Mutation attempts against required gates are rejected by the test oracle."],
      "verifier": {"reference": "npx vitest run tests/agent-harness/inc0.test.ts", "oracle": "All positive, boundary, and negative-control assertions pass twice against an unchanged candidate.", "class": "DETERMINISTIC"},
      "budgets": {"repair_attempts": 2, "command_timeout_seconds": 120, "increment_timeout_seconds": 600},
      "checkpoint": "INC-0 authority/readiness skeleton verified locally; no authoring tool exists",
      "stateful": false,
      "protected_actions": [],
      "recovery": null
    }
  ],
  "publication": {
    "mode": "OPEN_PR",
    "branch": "agent-harness/plan-v3-3-inc0",
    "base_branch": "main",
    "commit_message": "Add Agent-Harness v3.3 plan and INC-0 readiness skeleton",
    "commit_paths": ["docs/evidence/eve-zero-trust-engineering-harness-plan-v3.3.md", "docs/evidence/eve-v3.3-backtest/eve-v3.3-normative-policy.json", "docs/evidence/eve-v3.3-backtest/eve-v3.3-mutation-manifest.json", "docs/evidence/eve-v3.3-backtest/eve-v3.3-backtest-results.json", "docs/evidence/eve-v3.3-backtest/eve-v3.3-aggregate-evidence.txt", "docs/evidence/eve-v3.3-backtest/reproduce_eve_v3_3_backtest.py", "agent-harness/src/inc0.ts", "tests/agent-harness/inc0.test.ts", "tasks/todo.md"],
    "pr_title": "Add Agent-Harness v3.3 plan and INC-0 readiness skeleton",
    "pr_body": "Replaces the invalid separate-repository v3.2 plan with the governed in-repository Agent-Harness path, closes the candidate-command isolation and engineering-rules locator findings, persists deterministic v3.3 evidence, and implements the bounded INC-0 readiness skeleton. Merge remains separately user-authorized.",
    "protected_actions": [
      {"action": "commit verified candidate", "state": "AUTHORIZED", "owner": "user", "evidence_ref": "explicit instruction to update the plan, create its artifacts, start INC-0, and open the replacement PR"},
      {"action": "push task branch", "state": "AUTHORIZED", "owner": "user", "evidence_ref": "explicit instruction to update the plan, create its artifacts, start INC-0, and open the replacement PR"},
      {"action": "create pull request", "state": "AUTHORIZED", "owner": "user", "evidence_ref": "explicit instruction to update the plan, create its artifacts, start INC-0, and open the replacement PR"},
      {"action": "merge pull request", "state": "UNAUTHORIZED", "owner": "repository owner", "evidence_ref": "root AGENTS.md merge gate"}
    ]
  }
}
```

---

## 7. Normative plan-policy backtest

The plan-policy backtest was executed against the exact policy represented in this artifact.

Canonical serialization for the evidence below:

```text
JSON UTF-8
sort_keys = true
separators = (",", ":")
ensure_ascii = false
```

Evidence identities:

- normative policy SHA-256: `97ce4d1aa6b7e40724a05960f00781f7fca448639fe879965f5cdade2cd4b874`
- mutation manifest SHA-256: `e4dfdf9ee2daabaf9a4297e9137a452682fc65075d9a2722e386cd4b2d111b5d`
- backtest results SHA-256: `335523c49a9ce63358dd78fbdd075f243e0f45661878bdc6c159c665b8630530`
- aggregate evidence SHA-256: `600d8ac075542abca8776a1fbcf3d9fba00b8c1c7211d0c02134c6f949041de7`

Results:

- hostile mutants tested: **154**
- killed: **154**
- survivors: **0**

| Category | Tested | Killed | Survivors |
|---|---:|---:|---:|
| `acceptance` | 6 | 6 | 0 |
| `authority` | 9 | 9 | 0 |
| `bootstrap` | 7 | 7 | 0 |
| `exporter` | 14 | 14 | 0 |
| `identity` | 3 | 3 | 0 |
| `minimality` | 18 | 18 | 0 |
| `oracle` | 9 | 9 | 0 |
| `profile` | 3 | 3 | 0 |
| `publication` | 7 | 7 | 0 |
| `readiness` | 8 | 8 | 0 |
| `repair` | 3 | 3 | 0 |
| `resume` | 6 | 6 | 0 |
| `sandbox` | 6 | 6 | 0 |
| `scope` | 5 | 5 | 0 |
| `scope_expansion` | 3 | 3 | 0 |
| `state` | 3 | 3 | 0 |
| `tools` | 11 | 11 | 0 |
| `verification` | 9 | 9 | 0 |
| `verifier` | 24 | 24 | 0 |

A mutant is killed only when the deterministic plan validator returns at least one finding.

This evidence proves only that the **plan policy** rejects the listed structural mutations. INC-0 must recreate executable policy/eval enforcement inside governed `Agent-Harness`; later increments must kill runtime mutants against the real implementation.

### Normative policy

```json
{
  "acceptance": {
    "codex_required": true,
    "green_build_not_acceptance": true,
    "human_merge_required": true,
    "plan_policy_backtest_not_implementation_pass": true,
    "runtime_mutants_required_per_increment": true,
    "target_pr_verification_required": true
  },
  "authority": {
    "actual_read_audit_required": true,
    "agent_self_reported_read_not_authoritative": true,
    "conflict_without_permitted_exception": "BLOCKED",
    "engineering_rules_before_mutation": true,
    "engineering_rules_sha256": "deb95b212e0d3fae948e6cd0b9b932ede58cbaeef0170ccc8257b7a80a117793",
    "engineering_rules_source_identifier": "skill://flora-skills/root/.codex/skills/remote-skills/skill-6a7bbe3c89448191900ebcdd6395ac7c/SKILL.md",
    "root_agents_first": true,
    "skills_subordinate_to_agents": true,
    "target_skills_copied_into_eve": false,
    "target_skills_loaded_from_target_snapshot": true,
    "task_cannot_silently_override_governance": true,
    "unrouted_repo_text_is_data": true
  },
  "bootstrap": {
    "component_name": "Agent-Harness",
    "component_path": "agent-harness/",
    "nested_agents_created_in_inc0": false,
    "readiness_gate_before_component_write": true,
    "repository_full_name": "Lvvphole/becoming-the-man",
    "repository_preexists": true,
    "root_agents_authoritative": true
  },
  "candidate_exporter": {
    "absolute_paths_rejected": true,
    "actual_changed_paths_subset_authorized": true,
    "actual_changed_paths_subset_proposed": true,
    "candidate_digest": "sha256(canonical_sorted_manifest)",
    "canonical_repo_relative_paths": true,
    "case_collision_rejected": true,
    "dotdot_paths_rejected": true,
    "hardlinks_allowed": false,
    "protected_paths_require_task_envelope_exception": true,
    "regular_files_only": true,
    "reserved_git_metadata_rejected": true,
    "snapshot_read_only_to_exporter": true,
    "supported_modes": [
      "100644",
      "100755"
    ],
    "symlinks_allowed": false,
    "trusted_base_manifest_outside_sandbox": true,
    "uses_sandbox_git_metadata": false
  },
  "identity": {
    "authority_binding_shape": "object:path+git_blob_oid+content_sha256",
    "base_commit_oid_required": true,
    "external_authority_content_sha256_required": true,
    "git_blob_oid_separate_from_content_sha256": true,
    "parallel_authority_arrays_forbidden": true
  },
  "minimality": {
    "agents": 1,
    "custom_image_pipeline": false,
    "docker_runtime_not_npm_dependency": true,
    "external_database": false,
    "github_app": false,
    "github_rest_transport": "node_builtin_fetch_first",
    "harness_eve_skills": 0,
    "mcp": false,
    "mem0": false,
    "multi_repo_plugin_system": false,
    "new_component_requires_verified_dod_gap": true,
    "npm_dependencies": [
      "eve",
      "ai",
      "zod",
      "model-provider-adapter"
    ],
    "queue": false,
    "redis": false,
    "scheduler": false,
    "targets": 1,
    "telemetry_backend": false,
    "vector_store": false,
    "web_ui": false
  },
  "oracle": {
    "candidate_tests_are_independent_oracle": false,
    "candidate_writable": false,
    "manifest_digest_required": true,
    "model_visible": false,
    "task_specific_predicates_only_when_authorized": true,
    "universal_ast_bans": false,
    "universal_complexity_declarations": false,
    "universal_symbol_whitelist": false,
    "verifier_owned": true
  },
  "publication": {
    "approval_binding": [
      "run_id",
      "base_commit_oid",
      "candidate_digest",
      "operation"
    ],
    "capabilities": [
      "feature_branch",
      "pull_request"
    ],
    "current_main_must_equal_verified_base": true,
    "merge": false,
    "post_publish_content_equality": true,
    "requires_human_approval": true,
    "requires_verifier_pass": true
  },
  "readiness": {
    "authority_bundle_shape": "array_of_identity_objects",
    "proposed_candidate_paths_exact": true,
    "proposed_paths_subset_of_authorized_candidate_paths": true,
    "protected_path_exceptions_from_task_envelope_only": true,
    "routed_skill_shape": "nullable_identity_object",
    "schema_language": "typescript",
    "schema_validator": "zod_strict",
    "semantic_audit_fields_not_self_proof": true,
    "task_envelope_digest_required": true,
    "trusted_gate_controls_transition": true,
    "unresolved_conflicts_must_equal": []
  },
  "repair": {
    "max_repairs": 2,
    "new_machine_evidence_required": true,
    "same_failure_without_new_evidence": "BLOCKED"
  },
  "resume": {
    "candidate_drift": "BLOCKED",
    "governance_drift": "RETURN_TO_AUTHORITY_READ_ONLY",
    "guard_every_resume": true,
    "revalidates": [
      "current_target_main",
      "authority_bundle",
      "routed_skill",
      "task_envelope",
      "target_profile",
      "tool_policy",
      "verifier_profile",
      "eve_version",
      "model_config",
      "candidate_if_frozen"
    ],
    "tool_verifier_model_eve_drift": "BLOCKED_NEW_RUN_REQUIRED"
  },
  "sandbox": {
    "backend": "docker",
    "bash_initial_cwd": "/workspace",
    "claims_os_write_confinement_to_workspace": false,
    "docker_socket_mounted": false,
    "host_repo_rw_mounted": false,
    "image_identity": "exact-human-approved-oci-digest",
    "network": "deny-all",
    "secrets_present": false,
    "workspace_contains_git_metadata": false
  },
  "schema": "eve-zero-trust-harness-plan-policy/v3.3",
  "scope_expansion": {
    "inside_authorized_paths": "REVOKE_TO_READINESS_REBIND",
    "outside_authorized_paths": "BLOCKED_NEW_TASK_AUTHORIZATION",
    "silent_scope_growth": false
  },
  "state": {
    "authoring_requires_pre_code_ready": true,
    "blocked_terminal": true,
    "direct_agent_assignment": false,
    "initial": "AUTHORITY_READ_ONLY",
    "scope_expansion_returns_to_readiness": true
  },
  "target_profile": {
    "authority_hashes_required": true,
    "drift_fail_closed": true,
    "mechanical_bindings_only": true,
    "normative_product_rules_forbidden": true,
    "protected_paths_derived_from_governance": true,
    "verification_command_catalog_trusted": true
  },
  "task_envelope": {
    "allowed_modes": [
      "SCOUT",
      "PLAN",
      "IMPLEMENT",
      "REPAIR",
      "REVIEW",
      "GOVERNANCE_CHANGE"
    ],
    "authorized_candidate_paths_exact": true,
    "authorized_effects_semantic_only": true,
    "destructive_actions_flag_required": true,
    "governance_change_flag_required": true,
    "mode_required": true,
    "requested_ref_required": true,
    "required_verification_command_ids_trusted": true,
    "scope_source_required": true,
    "scope_sources": [
      "selected_plan",
      "direct_user_authorization"
    ],
    "selected_plan_sha256_required_for_selected_plan_scope": true,
    "user_request_digest_required": true,
    "wildcards_in_authorized_candidate_paths": false
  },
  "tools": {
    "agent_tool": false,
    "authoring": [
      "read_file",
      "glob",
      "grep",
      "ask_question",
      "bash",
      "write_file",
      "request_scope_expansion"
    ],
    "candidate_frozen": [
      "read_file",
      "glob",
      "grep",
      "ask_question"
    ],
    "connections_declared": 0,
    "default_tools": false,
    "github_write_model_visible": false,
    "merge_tool": false,
    "mutation_executor_rechecks_state_every_call": true,
    "pre_readiness": [
      "read_file",
      "glob",
      "grep",
      "ask_question",
      "submit_readiness_record"
    ],
    "web_fetch": false,
    "web_search": false,
    "workflow_tool": false
  },
  "verification_selection": {
    "additional_checks_union_from_profile_and_task_envelope": true,
    "baseline_command_ids": [
      "install_locked",
      "verify_change_size",
      "verify_code"
    ],
    "candidate_cannot_omit_checks": true,
    "candidate_selects_commands": false,
    "github_pr_verification_downstream_authority": true,
    "local_verifier_named_pr_verification": false,
    "routed_required_check_without_command_id": "BLOCKED_PROFILE_INCOMPLETE",
    "trusted_command_catalog": true,
    "verify_code_exact_command": "npm run verify"
  },
  "verifier": {
    "binds_base_and_candidate": true,
    "candidate_command_sandbox": {
      "candidate_controls_sandbox_profile": false,
      "candidate_lifecycle_execution_separated": true,
      "dependency_acquisition_verifier_controlled": true,
      "disposable_candidate_working_copy": true,
      "docker_socket_mounted": false,
      "fresh_per_command": true,
      "github_credentials_present": false,
      "host_filesystem_mounted": false,
      "narrow_evidence_channel": true,
      "network": "deny-all",
      "resource_limits_enforced": [
        "cpu",
        "memory",
        "pids",
        "wall_clock",
        "output"
      ],
      "sanitized_fixed_environment": true,
      "secrets_present": false,
      "shared_writable_volume": false,
      "verifier_oracle_mounted": false,
      "verifier_selects_argv_and_cwd": true
    },
    "candidate_controls_command": false,
    "candidate_controls_profile": false,
    "executes_candidate_commands_directly": false,
    "outside_candidate_workspace": true,
    "raw_evidence_required": true,
    "self_reported_pass_authoritative": false,
    "shared_writable_volume": false,
    "verdicts": [
      "PASS",
      "FAIL",
      "BLOCKED"
    ]
  }
}
```

### Mutation manifest

The exact mutation manifest is frozen by SHA-256 `e4dfdf9ee2daabaf9a4297e9137a452682fc65075d9a2722e386cd4b2d111b5d`. Each mutation changes one declared plan-policy property or one explicit relational invariant. The manifest contains 154 cases; no mutation result is accepted by model judgment.

---

## 8. Stop conditions

Stop immediately if:

- target base or authority identity drifts without re-evaluation;
- the harness is routed outside `agent-harness/` or attempts to replace root governance;
- PR #39 is revived or reused as implementation baseline;
- Git blob identity is confused with content SHA-256;
- semantic `authorized_effects` is used as path authority;
- selected-plan digest is missing for plan-bound implementation;
- sandbox Git metadata enters candidate acceptance logic;
- actual candidate paths exceed proposed or authorized exact paths;
- protected-path authority comes from the model;
- routed required verification has no trusted command ID;
- candidate can choose verifier commands or oracle;
- plan-level backtest is represented as implementation proof;
- any implementation/runtime mutant survives;
- a new dependency/component is proposed without a verified DoD gap;
- existing target CI must be weakened to make the harness pass.

---

## 9. Builder preflight

Before INC-0:

1. B0 readiness bootstrap is complete.
2. Read existing repository root `AGENTS.md`.
3. Retrieve canonical engineering rules from the stable source identifier and verify SHA-256 `deb95b212e0d3fae948e6cd0b9b932ede58cbaeef0170ccc8257b7a80a117793`.
4. Rebind target commit and every required `{path, git_blob_oid, content_sha256}`.
5. Verify PR #39 remains closed/unmerged.
6. Verify task mode, TaskEnvelope, exact path authority, and selected-plan digest when applicable.
7. Resolve and obtain explicit approval for the exact Eve OCI sandbox digest.
8. Freeze Eve/model/tool/target-profile/verifier/oracle/repair configuration.
9. Run the plan-policy negative controls against that frozen implementation configuration.
10. State the exact compliant path: verified gap, governing rule, required evidence, permitted next action, stop condition.
11. Only then permit the first implementation mutation.

---

## 10. Completion authority

Planner, Eve agent, builder, candidate tests, and local harness cannot self-accept.

Harness increment acceptance requires executable mechanical evidence and the increment's required negative controls.

Any target PR remains independently governed by `becoming-the-man` exact-head `PR Verification`, required Codex review, up-to-date-main compliance, and explicit user merge authorization.

`PLAN_READY` means v3.3 is ready for governed execution **after B0 and the exact Eve image-digest approval gate**. It does not mean implementation has begun or passed.

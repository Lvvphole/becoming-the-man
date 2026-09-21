PLAN_READY

# Zero-Trust Repository Harness v1.2 — Bootstrap Migration Plan

Lifecycle stage: 02_plan  
Task domain: governance  
Route: one-time owner-authorized bootstrap exception using `task_domain=governance`  
Planning mode: BROWNFIELD  
Repository: `Lvvphole/becoming-the-man`  
Base SHA: `807ebb1cfa121afa3e536f00791b7f1da383193f`  
Planning branch: `harness-v1-2-bootstrap-plan`  
Approved PRD SHA-256: `4f96dc9d3233083b2587deb6a62a41a93cd1ae8e62114e8aa0e4ec0bbf6fb6d1`

## 1. Frozen goal

Replace the current stage/domain governance harness with the approved Portable Repository Zero-Trust Agent Harness v1.2 without changing product behavior.

The final harness must preserve this authority and execution shape:

```text
CLAUDE.md -> AGENTS.md -> CONTEXT.md
                         |
                         v
                deterministic routing
                         |
                         v
                external supervisor
                         |
                         v
                   Eve + AI SDK
                         |
                         v
              hard capability gate
                         |
                         v
                 Jev restriction
                         |
                         v
              disposable sandbox
                         |
                         v
              external verifier
                         |
                  PASS | FAIL | BLOCKED
```

The hard capability gate MUST run before Jev. Jev may veto, escalate, or reduce only. It may never grant a capability or PASS.

The external authority root binds policy identity. Ordinary product `base_sha` remains task identity, not authority-root identity.

## 2. Owner-authorized bootstrap exception

The repository owner explicitly authorized exactly this bootstrap exception:

- use `task_domain=governance` for this migration;
- permit this Plan at `stages/02_plan/output/repo-zero-trust-harness-v1.2-plan.md`;
- preserve every other current governance and stop condition.

No other current governance exception is implied.

## 3. Verified current state

At the planning base:

- `AGENTS.md` still requires root `CONTEXT.md` routing and the current Pre-Code Readiness Gate.
- Root `CONTEXT.md` still contains the seven-stage, nine-field task-envelope route matrix.
- `references/engineering/engineering-rules.md` still defines the canonical lifecycle as Scout -> Plan -> Contract -> Implement -> Verify -> Review -> Release.
- `scripts/verify-governance-routing.mjs`, `tests/governance-routing.test.mjs`, and `contracts/governance-routing-contract.json` mechanically enforce the current routing model.
- Root `package.json` has no Eve or AI SDK dependency.
- Current `PR Verification` uses Node 22.16.0 and runs the existing product verification unchanged.
- Current official Eve guidance requires Node 24+ for the Jev approval integration, supports a filesystem-first `agent/` directory, supports sandbox backends, and documents `defaultTools: false` to prevent unreviewed default capabilities from bypassing a gated tool.
- Current official Vercel guidance states Jev review occurs before an Eve tool executor, but also states resource permissions must still be enforced in code/sandbox controls; Jev cannot establish authorization.

## 4. Definition of Done

The migration is complete only when all of the following are mechanically proven:

D1. Provider entry converges on `CLAUDE.md -> AGENTS.md -> CONTEXT.md`, with `CONTEXT.md` the sole deterministic repository router.

D2. Routing is based on exact path ownership and stable requirement IDs. Zero-match or multi-match routing is BLOCKED. No semantic fallback or stage/domain matrix remains active.

D3. Each run uses one immutable compact task contract containing base identity, goal, requirement refs, allowed paths, allowed tools, required checks, and stop condition.

D4. A trusted external supervisor validates authority/task identity and completely mediates every privileged request.

D5. Eve is orchestration only; AI SDK supplies model/tool primitives; neither becomes route, capability, PASS, merge, or release authority.

D6. Eve exposes no side-effecting default capability outside the frozen task contract.

D7. The coding agent executes only inside a disposable sandbox with separate read, write, context, tool, network, secret, subprocess, and Git capabilities.

D8. Network defaults to deny; privileged Git credentials, merge authority, supervisor policy, verifier code, evidence-signing material, and host filesystem are unavailable to the candidate sandbox.

D9. Jev is invoked only after deterministic hard authorization. `LOW` risk cannot override a hard denial. Timeout/failure follows the frozen fail-closed policy.

D10. The external verifier independently checks base/candidate identity, changed paths, required checks, acceptance-oracle independence, tool/network use, authenticated evidence/provenance, and post-verification immutability.

D11. Candidate-controlled tests/configuration cannot be the sole acceptance oracle for the same candidate.

D12. Terminal states are exactly PASS, FAIL, or BLOCKED. PASS never grants merge/deploy authority.

D13. Required negative controls prove stale base, route ambiguity, path escape, capability smuggling, Jev bypass, acceptance-oracle mutation, provenance substitution, cross-run state leakage, and post-verification mutation fail closed.

D14. The final root router and harness can be ported to a second repository by changing routing/source/check data rather than verifier logic.

D15. Product application behavior, product requirements, database behavior, provider behavior, and existing product CI checks remain unchanged by the harness migration.

## 5. Permanent invariants

```text
RouteAuthority = externally-bound CONTEXT.md deterministic resolution

EffectiveCapabilities subset_of ContractCapabilities

EveAvailableCapabilities subset_of ContractCapabilities

HardPolicyDenial cannot be overridden by Jev or the coding model

JevAuthority subset_of {Veto, Escalate, Reduce}

MechanicalPASSAuthority = ExternalMechanicalVerifier

CandidateControlledState != sole acceptance oracle

SandboxReachability subset_of ContractCapabilities

PASS != merge_or_deploy_authority
```

The harness is infrastructure, not the product. New harness mechanisms are inadmissible unless a demonstrated gap cannot be closed by an existing simpler control, the control class has peer-reviewed support, the benefit is deterministically testable, and the control does not duplicate an existing mechanism.

## 6. Bootstrap trust model

The unfinished harness may not certify itself.

During construction:

- current repository governance, branch protection, and exact-head CI remain active;
- the implementation contract for each increment freezes the independent negative-control inputs before code mutation;
- the coding agent may mutate only the increment's authorized candidate paths;
- acceptance vectors, approval facts, and stop conditions live outside those candidate paths;
- a candidate implementation may not alter its own acceptance oracle to manufacture PASS;
- each increment stops after one bounded candidate plus external verification;
- a failed verifier or newly required path/capability is BLOCKED, not fix-forward authority.

Trust grows only after the previously trusted boundary proves the next boundary.

## 7. Selected design

Use a standalone `harness/` package inside the repository for portable harness runtime code while keeping the website application package unchanged.

Rationale:

- the harness is not product code;
- Eve currently requires Node 24+ for the documented Jev approval integration, while product CI is intentionally pinned to Node 22.16.0;
- a separate package avoids changing the website runtime dependency graph merely to operate the coding harness;
- the runtime can still mount an untrusted candidate snapshot independently of its own source;
- final root routing files remain repository-resident, while supervisor/verifier runtime remains outside candidate write capability.

Do not use `eve init` inside the existing repository because the documented initializer installs dependencies, initializes Git, and starts a development process. Author the minimal required Eve files directly and pin dependencies under the bounded implementation contract.

## 8. Five bounded implementation increments

### INC-1 — Shadow routing kernel and compact task contract

Objective: prove the replacement routing semantics without changing the active root router.

Planned candidate surface:

- `harness/package.json`
- `harness/package-lock.json`
- `harness/tsconfig.json`
- `harness/src/routing.ts`
- `harness/tests/routing.test.ts`
- `harness/fixtures/CONTEXT.target.md`
- `.github/workflows/pr-verification.yml` only to make the existing required `PR Verification` depend on a Node-24 harness verification job

Behavior:

- parse one canonical target routing table;
- resolve every allowed path to exactly one owner;
- resolve every requirement ref to exactly one authoritative source selector;
- union minimum checks mechanically;
- validate the compact immutable task contract;
- fail closed on unknown, ambiguous, stale, or malformed input;
- run in shadow mode only; do not change active `AGENTS.md`, root `CONTEXT.md`, engineering rules, or product code.

Independent negative controls frozen before mutation:

- unrouted path;
- equal-specificity path collision;
- unknown requirement;
- duplicate requirement mapping;
- missing source;
- task attempts to weaken minimum checks;
- stale base;
- malformed task contract.

Verification:

- harness lint/typecheck/unit tests under Node 24;
- existing product `PR Verification` remains unchanged and green under its existing Node 22 job;
- exact-head binding;
- reviewable implementation diff target <= 350 lines, hard ceiling 500.

Stop:

- active root governance would need to change in INC-1;
- product code or product dependency graph would need to change;
- routing requires semantic inference;
- negative-control oracle must be changed after implementation begins;
- projected implementation exceeds 420 reviewable lines;
- a blocking unknown remains.

### INC-2 — External supervisor, Eve orchestration, and hard capability gate

Objective: prove least-capability execution before adding Jev.

Planned candidate surface is confined to `harness/` plus the harness CI job unless an exact contract authorizes otherwise.

Behavior:

- add Eve as the orchestration runtime and AI SDK as the model/tool primitive layer;
- set `defaultTools: false`;
- expose only authored contract-derived tools;
- compile typed capability policy for tool, argv, cwd, canonical filesystem effects, subprocess, network, secret, and Git side effects;
- enforce hard policy for every privileged request;
- run the coding agent in a disposable Eve sandbox using a pinned sandbox/runtime identity;
- default network deny;
- no privileged Git/merge credentials;
- no cross-run writable state by default.

Independent negative controls:

- unauthorized tool;
- alternate built-in/default tool with equivalent side effect;
- parent traversal and symlink escape;
- unapproved argv/cwd/subprocess;
- network egress outside policy;
- Git side effect outside policy;
- attempt to reach supervisor/verifier/policy secrets;
- cross-run writable-state influence.

Stop:

- Eve requires a capability that cannot be bounded by the contract;
- sandbox policy cannot physically enforce the declared boundary;
- an unreviewed default capability remains reachable;
- a product runtime change becomes necessary;
- exact sandbox/toolchain identity cannot be frozen.

### INC-3 — External verifier, independent oracle, and authenticated evidence

Objective: make PASS independent of the coding agent.

Behavior:

- verify exact base and candidate identity;
- compute final changed paths outside the candidate sandbox;
- replay required deterministic checks under trusted command capture;
- protect the acceptance closure of every required check;
- reject candidate-controlled acceptance logic as sole proof unless an external oracle independently verifies it;
- capture argv, cwd, exit, stdout/stderr lengths and hashes, task identity, policy/verifier identity, sandbox/toolchain identity, and final candidate identity;
- authenticate the evidence manifest outside candidate control;
- invalidate PASS after any candidate mutation.

Independent negative controls:

- test prints PASS with nonzero exit;
- candidate weakens its own test/config oracle;
- evidence manifest substitution with internally consistent hashes;
- missing raw evidence;
- candidate changes after final verification;
- verifier/policy identity mismatch.

Stop:

- verifier source or evidence-signing material is reachable from the candidate sandbox;
- required behavior cannot be checked without trusting candidate-controlled state;
- evidence origin cannot be authenticated.

### INC-4 — Jev downgrade-only semantic sensor

Objective: add semantic risk sensing without increasing authority.

Behavior:

- implement a custom Eve/AI SDK approval policy that executes deterministic hard authorization first;
- only hard-authorized requests may reach Jev;
- Jev may return continue, veto, or review-required according to frozen policy;
- Jev failure/timeout follows the frozen fail-closed disposition;
- optional post-check may downgrade an otherwise mechanical PASS but can never create PASS.

Required proof:

```text
HardPolicyAllows = FALSE
AND JevResult = LOW
=> BLOCKED_BY_CAPABILITY_GATE
```

Additional negative controls:

- Jev LOW on prohibited write;
- Jev LOW on prohibited network request;
- evaluator timeout;
- missing/invalid evaluator answer;
- attempt to use another Eve tool to bypass Jev-reviewed tool;
- post-check suspicion can downgrade but not upgrade verifier state.

Stop:

- Jev becomes necessary for deterministic permission;
- a Jev result can create capability;
- a Jev result can create PASS;
- integration requires weakening the hard gate.

### INC-5 — Shadow comparison, authority cutover, and reduction

Objective: promote the proven replacement and remove obsolete governance machinery.

Precondition: INC-1 through INC-4 independently pass their exact negative controls and exact-head CI.

Actions:

- compare old and new harness on known-good and known-bad fixtures;
- freeze the approved external authority-root identity;
- replace root `CONTEXT.md` with the proven deterministic path/requirement router;
- reduce `AGENTS.md` to the concise repository constitution and external-harness boundary;
- preserve minimal `CLAUDE.md -> AGENTS.md` provider routing;
- retire the old seven-stage route matrix, nine-field envelope, mandatory stage-artifact lifecycle, and old governance verifier/contracts only after replacement proof is current;
- update required CI so harness verification is part of merge eligibility;
- retain ordinary PR CI, independent review, and separate human merge authority.

Stop:

- any old safety control lacks a proven equal-or-stronger replacement;
- product behavior changes;
- current exact-head CI is not green;
- independent review finds an unresolved actionable defect;
- cutover requires a new unapproved architectural layer.

## 9. Increment discipline

Five implementation increments are fixed for this migration. They are build increments, not a permanent product-development lifecycle.

Within each increment the coding agent is limited to:

```text
BIND -> INSPECT -> ONE BOUNDED CANDIDATE -> VERIFY EXTERNALLY -> STOP
```

No increment may autonomously begin the next increment. A discovered dependency, new path, new capability, or new architectural mechanism stops the current increment.

## 10. Change-size discipline

Each implementation increment targets <= 350 reviewable implementation lines.

Internal stop threshold: 420 reviewable lines.

Absolute current repository ceiling: 500 reviewable implementation lines.

Documentation and generated lockfiles follow the current repository counting rules. The line ceiling is not a quota; a smaller coherent implementation is preferred.

## 11. Non-goals

This migration does not authorize:

- website feature work;
- product requirement changes;
- database/schema migrations;
- product provider changes;
- application runtime redesign;
- microservices, queues, Kubernetes, or a policy microservice;
- semantic task-domain taxonomies;
- mandatory Scout/Plan/Contract artifacts after final cutover;
- subagents;
- autonomous merge or deployment;
- Jev as route authority, hard authorization, or PASS authority.

## 12. Current executable boundary

This Plan describes the full five-increment migration, but current governance still requires explicit user approval of this exact `PLAN_READY` artifact before Stage 03.

After approval, Stage 03 MUST freeze the implementation contract for INC-1 only. INC-2 through INC-5 remain non-executable roadmap increments until the immediately preceding increment has produced its required independent evidence and the next increment is explicitly admitted.

## 13. Stage 03 handoff for INC-1

The INC-1 contract must freeze:

- exact seven candidate paths listed in INC-1;
- exact base/head binding;
- exact target routing-table schema;
- compact task-contract schema;
- path-specificity and ambiguity rules;
- requirement-to-source uniqueness rules;
- minimum-check union rule;
- eight frozen negative-control inputs and expected dispositions;
- Node 24 harness verification command;
- existing Node 22 product verification preservation;
- 420-line internal stop threshold and 500-line absolute ceiling;
- no active root-governance mutation.

The contract must not design INC-2.

## 14. Final planning disposition

The approved v1.2 architecture can be built without first weakening the current harness.

The selected path is reduction-by-replacement: construct and prove the new routing/execution/verification boundary in shadow form, then cut over only after equal-or-stronger protection is mechanically demonstrated.

No blocking unknown remains for INC-1 planning.

PLAN_READY

PLAN_READY

# Zero-Trust Repository Harness v1.2 — INC-2 Implementation Plan

Lifecycle stage: 02_plan
Task domain: governance
Route: route:02_plan:governance
Planning mode: BROWNFIELD
Branch: harness-v1-2-inc2-plan
Bootstrap base: 93a2edc3f8729f30f6772ce8a8df7a955c5c2fff
Predecessor: merged INC-1 from PR #52
Bootstrap exception: one Plan mutation permitted before PR creation; no other governance or implementation exception applies

## 1. Goal

Build the smallest execution boundary that can take the already-validated INC-1 compact task contract and prove that an untrusted coding agent can exercise only explicitly granted capabilities inside a disposable sandbox.

INC-2 adds:

1. an external supervisor process;
2. a narrow Eve replaceability adapter;
3. AI SDK tool primitives only where needed to expose authored tools;
4. a typed hard capability policy;
5. per-request complete mediation before privileged execution;
6. disposable Docker-backed sandbox execution;
7. default-deny network, secret, Git, and cross-run state behavior.

INC-2 does not add semantic risk scoring, Jev, the final external verifier, authenticated provenance, memory, databases, provider integrations, multi-agent routing, product behavior, or release automation.

## 2. Authority and predecessor binding

INC-2 is subordinate to:

1. AGENTS.md;
2. root CONTEXT.md;
3. the uniquely selected stage CONTEXT.md;
4. references/engineering/engineering-rules.md;
5. references/architecture/CONTEXT.md;
6. the approved Zero-Trust Repository Harness v1.2 roadmap;
7. the merged INC-1 routing kernel.

INC-1 remains the only new shadow routing mechanism. Root CONTEXT.md remains active repository routing authority.

INC-2 may consume an INC-1 ALLOW result and compact task contract. It may not reinterpret routing, invent selectors, expand allowed paths, weaken required checks, or create authority from the free-form goal.

## 3. Verified current-state gap

At bootstrap base 93a2edc3f8729f30f6772ce8a8df7a955c5c2fff:

- harness/src/routing.ts implements the deterministic INC-1 shadow router and compact task validation;
- harness/tests/routing.test.ts freezes the eight INC-1 routing negative controls;
- harness/fixtures/CONTEXT.target.md is non-authoritative routing fixture data;
- the harness package contains no Eve dependency;
- the harness package contains no direct AI SDK dependency;
- no external supervisor exists;
- no hard per-request capability gate exists;
- no disposable coding-agent sandbox contract exists;
- no network, secret, Git, subprocess, or cross-run-state enforcement exists.

The gap is therefore execution authority, not routing authority.

## 4. Complexity admission

INC-2 adds no mechanism beyond the already-approved v1.2 roadmap. Each retained control satisfies the repository's harness-complexity admission rule.

| Gate | INC-2 evidence |
|---|---|
| C1 concrete gap demonstrated | INC-1 admits tasks but cannot physically constrain runtime tool, filesystem, subprocess, network, secret, Git, or cross-run effects. |
| C2 simpler existing control insufficient | Routing and prompt instructions can deny semantic authority but cannot physically mediate or remove runtime capabilities from an untrusted sandbox. |
| C3 peer-reviewed support | Saltzer & Schroeder, "The Protection of Information in Computer Systems," Proceedings of the IEEE 63(9), 1975, DOI 10.1109/PROC.1975.9939, supports fail-safe defaults, complete mediation, least privilege, and economy of mechanism. Jarkas et al., "A Container Security Survey: Exploits, Attacks, and Defenses," ACM Computing Surveys 57(7), 2025, DOI 10.1145/3715001, supports explicit layered controls for container isolation, access, network, and host-risk boundaries while documenting that container isolation alone is not sufficient. |
| C4 deterministic benefit testable | EC-01 through EC-08 and the positive controls mechanically test the hard gate and physical isolation properties. |
| C5 no duplicated control | INC-1 owns deterministic admission/routing; INC-2 owns execution capability enforcement. Neither duplicates the other. |

Complexity disposition:

```text
ADD:
  external supervisor
  hard capability gate
  disposable sandbox
  narrow Eve/AI SDK adapter

DO_NOT_ADD:
  policy engine
  service mesh
  database
  memory layer
  Jev
  final verifier
  multi-agent orchestration
  any other architectural layer
```

Peer-reviewed evidence is justification for the control classes only. It does not make Eve, Docker, or any specific package authoritative. Exact framework behavior remains subject to the deterministic compatibility and negative-control gates below.

## 5. Approved architectural boundary

The fixed execution order for INC-2 is:

```text
validated INC-1 task
        |
        v
EXTERNAL SUPERVISOR
        |
        +--> compile immutable capability policy
        |
        v
HARD REQUEST GATE
        |
        +--> DENY before execution when any requested effect exceeds policy
        |
        v
EVE ADAPTER
        |
        v
DISPOSABLE DOCKER SANDBOX
        |
        v
AUTHORED TOOL EXECUTION ONLY
```

The supervisor is trusted for enforcement in INC-2.

The coding agent, model output, generated command arguments, candidate repository, and sandbox are untrusted.

The sandbox cannot grant authority back to the supervisor.

## 6. Minimum trusted kernel

INC-2 adds only three logical responsibilities:

### 5.1 Supervisor

The supervisor:

- accepts the validated compact task plus supervisor-owned execution constraints;
- compiles one immutable CapabilityPolicy;
- constructs the authored tool set;
- mediates every privileged request;
- creates one disposable sandbox for the run;
- destroys or abandons that sandbox at terminal completion;
- returns observations but does not declare final repository PASS.

### 5.2 Capability gate

For request r:

```text
G_REQUEST_ALLOWED(r) :=
  tool_allowed(r)
  AND argv_allowed(r)
  AND cwd_allowed(r)
  AND filesystem_effects_allowed(r)
  AND subprocess_effects_allowed(r)
  AND network_effects_allowed(r)
  AND secret_effects_allowed(r)
  AND git_effects_allowed(r)
```

If false:

```text
DENY / CAPABILITY_NOT_GRANTED
```

The gate executes before the request reaches Eve or the sandbox backend.

### 5.3 Eve adapter

Eve is behind one narrow adapter:

```text
Supervisor
   |
EveAdapter
   |
Eve
   |
AI SDK
   |
Sandbox backend
```

No other harness module imports Eve directly.

This is a replaceability boundary, not another security layer.

## 7. CapabilityPolicy contract to freeze in Stage 03

Stage 03 must freeze the smallest typed policy that can express the approved INC-2 controls.

Required semantics:

```text
CapabilityPolicy
  task_identity
  allowed_tools
  allowed_argv
  allowed_cwds
  read_roots
  write_roots
  subprocess
  network
  secret_names
  git
```

Required policy behavior:

- allowed_tools is closed, not advisory;
- allowed_argv contains exact argv token vectors or an equally deterministic closed representation;
- allowed_cwds contains canonical authorized working roots;
- read_roots and write_roots are distinct;
- subprocess is deny unless explicitly granted;
- network is deny by default;
- secret_names is empty by default;
- git is deny by default.

No field may default from model output.

No free-form text field may expand policy.

## 8. Canonical filesystem rule

Every requested filesystem path must be canonicalized before authorization:

```text
for every p in filesystem_effects(request):
    canonical_realpath(p) is contained in an authorized root
```

Required failure cases include:

- parent traversal;
- absolute path outside the sandbox workspace;
- symlink escape;
- write through a permitted parent to an unpermitted canonical target.

String-prefix comparison alone is insufficient.

## 9. Tool and argv rule

A tool request is authorized only when:

1. the tool name is in allowed_tools;
2. its complete argv vector matches one allowed command contract;
3. cwd is an allowed canonical location;
4. declared and observed side effects remain within policy.

A generic unrestricted shell is not an allowed primitive.

If the implementation exposes an exec-like tool, its accepted commands must be exact or mechanically bounded argv contracts, never arbitrary shell text interpreted through eval, sh -c, bash -c, os.system, or equivalent dynamic command composition.

## 10. Sandbox rule

The sandbox is disposable and treated as untrusted.

For each run:

- create a fresh sandbox identity;
- mount or copy only the authorized workpiece surface required by the task;
- do not expose the host repository .git metadata;
- do not expose supervisor source, verifier source, policy secrets, promotion credentials, or deployment credentials;
- do not persist writable state into the next run unless a later explicit contract authorizes one content-addressed verified artifact;
- destroy or abandon writable runtime state after the run.

INC-2 must not treat prompt instructions as isolation.

Isolation must be enforced by the execution environment.

## 11. Network rule

Default:

```text
network = DENY
```

INC-2 does not require networked model/tool execution inside the coding sandbox.

If the selected Eve backend cannot create a sandbox with network denied, Stage 03 must return BLOCKED / REDESIGN.

A future allowlist is outside INC-2 unless the exact Stage 03 contract proves it necessary for the already-approved objective.

## 12. Secret rule

Default:

```text
secret_names = []
```

The coding sandbox receives no:

- GitHub token;
- Git credential;
- Vercel token;
- Supabase service-role key;
- provider API key;
- deployment secret;
- supervisor secret;
- verifier secret.

Any framework credential needed by the external supervisor must remain outside the candidate sandbox.

## 13. Git rule

Default:

```text
git = DENY
```

The coding sandbox must not be able to:

- push;
- merge;
- create or update remote refs;
- use repository-owner credentials;
- obtain host .git credentials.

Read-only source material may be copied into the sandbox without giving the sandbox Git authority.

## 14. Cross-run state rule

For run A and later run B:

```text
writable_state(A) ∩ inputs(B) = empty
```

unless a later explicit contract authorizes a specific verified transfer.

INC-2 negative controls must create a sentinel in run A and prove it is absent in fresh run B.

Framework caches outside the candidate writable namespace may not contain candidate-controlled mutable state that affects run B.

## 15. Eve and AI SDK compatibility gate

External framework documentation is compatibility evidence only. Repository authority remains the routed governance chain.

Current Eve documentation establishes:

- defineAgent from eve;
- defineSandbox from eve/sandbox;
- isolated sandbox execution;
- Docker as a supported sandbox backend/runtime;
- AI SDK as the underlying model/tool layer.

Current AI SDK documentation establishes the provider-agnostic ai package and typed tool primitives.

The inspected public Eve documentation did not establish the previously assumed defaultTools: false API.

Therefore Stage 03 must, before CONTRACT_READY:

1. pin an exact Eve package version;
2. pin an exact AI SDK package version;
3. verify from that pinned Eve package/API that all implicit/default tool capabilities can be disabled or absent;
4. verify the exact sandbox API required for disposable Docker execution;
5. freeze the exact adapter calls used by INC-2;
6. freeze the exact Docker image digest or other immutable sandbox/runtime identity.

If default capability suppression cannot be proven in the pinned Eve version:

```text
STOP -> REDESIGN
```

Do not emulate safety by hiding tools in prompts or by filtering model text after generation.

## 16. Dependency policy

Permitted new runtime dependencies are limited to those strictly required by the already-approved stack:

- Eve;
- AI SDK core/tool primitives;
- schema dependency only when required by the pinned Eve/AI SDK API and not already supplied transitively in a safe reusable form.

No Jev dependency.
No database dependency.
No memory dependency.
No provider SDK unless the pinned Eve API cannot compile without one and the Stage 03 contract explicitly proves it is required.
No policy engine.
No container-orchestration framework.
No service mesh.
No FastAPI.
No second agent framework.

Exact package names and versions are frozen only in Stage 03 after compatibility verification.

## 17. Maximum Stage 04 candidate surface

Stage 03 may reduce this set but may not expand it without returning to planning.

Maximum candidate paths:

1. harness/package.json
2. harness/package-lock.json
3. harness/src/capability.ts
4. harness/src/supervisor.ts
5. harness/src/eve-adapter.ts
6. harness/agent/agent.ts
7. harness/agent/sandbox/sandbox.ts
8. harness/tests/execution.test.ts
9. .github/workflows/pr-verification.yml

Rules:

- harness/agent/agent.ts is permitted only when the pinned Eve runtime requires an agent configuration file for this proof;
- harness/agent/sandbox/sandbox.ts is permitted only when the pinned Eve runtime requires the framework sandbox configuration file;
- if either optional Eve-owned file is unnecessary, Stage 03 must remove it from the implementation allowlist;
- no root package manifest may change;
- no application/product file may change;
- no root governance source may change.

## 18. Reviewable-size budget

The harness remains infrastructure, not the product.

Target initial reviewable implementation:

```text
<= 360 lines
```

Internal stop:

```text
420 lines
```

Repository ceiling:

```text
500 lines
```

Dependency lockfiles remain excluded under AGENTS.md.

If the planned implementation reaches or projects to 420 reviewable lines before the initial candidate is complete:

```text
STOP -> REDUCE OR REDESIGN
```

Do not request a size exception merely to avoid simplifying the harness.

## 19. Frozen INC-2 negative controls

Stage 03 must freeze exact fixtures and expected decisions for these eight roadmap controls.

### EC-01 Unauthorized tool

Request a tool absent from allowed_tools.

Expected:

```text
DENY / CAPABILITY_NOT_GRANTED
tool implementation not invoked
```

### EC-02 Alternate default/built-in capability

Attempt an equivalent side effect through an Eve default, built-in, auto-discovered, or undeclared tool.

Expected:

```text
UNREACHABLE
```

No such capability may appear in the model-visible or runtime-callable tool set.

### EC-03 Traversal and symlink escape

Attempt parent traversal and a symlink resolving outside the authorized root.

Expected:

```text
DENY / CAPABILITY_NOT_GRANTED
target outside root unchanged
```

### EC-04 argv/cwd/subprocess violation

Attempt:

- unapproved argv;
- approved argv from unapproved cwd;
- subprocess creation when subprocess = deny.

Expected:

```text
DENY / CAPABILITY_NOT_GRANTED
request not executed
```

### EC-05 Network egress

Attempt outbound network access from the candidate sandbox.

Expected:

```text
network request cannot complete
```

A model refusal is not evidence.

### EC-06 Git side effect

Attempt a Git write/push/ref-changing operation or credential use.

Expected:

```text
DENY or physically unreachable
no remote/ref mutation
```

### EC-07 Supervisor/verifier/policy secret reachability

Attempt to enumerate or read supervisor-only secret names and files.

Expected:

```text
UNREACHABLE
```

### EC-08 Cross-run writable-state influence

Create a unique sentinel during run A. Start independent run B from the same frozen input.

Expected:

```text
sentinel absent in run B
```

Every control must fail for the intended boundary, not for an unrelated malformed fixture.

## 20. Positive controls

Stage 03 must freeze at least these positive controls:

1. an explicitly allowed authored tool is callable;
2. one exact allowed argv vector executes;
3. allowed cwd succeeds;
4. read inside read_roots succeeds;
5. write inside write_roots succeeds;
6. candidate output is observable outside the sandbox only through the supervisor-defined result boundary;
7. two sequential runs receive distinct sandbox identities;
8. INC-1 routing behavior remains unchanged.

Positive controls must not weaken any negative control.

## 21. Verification strategy

INC-2 requires two evidence classes.

### 20.1 Pure deterministic unit verification

Run without network/model credentials:

- policy compilation;
- tool-set closure;
- exact argv matching;
- cwd matching;
- canonical path containment;
- secret-name denial;
- Git denial;
- subprocess denial;
- malformed request failure.

### 20.2 Physical sandbox integration verification

Run against the pinned local Docker/Eve sandbox identity:

- EC-02 default/built-in capability absence;
- EC-03 symlink escape;
- EC-05 network denial;
- EC-07 supervisor-secret isolation;
- EC-08 cross-run state isolation.

A mocked sandbox cannot satisfy physical-isolation obligations.

## 22. CI integration

Preserve the existing fail-closed ordering:

```text
Harness Verification
    -> required dependency of
PR Verification
```

The existing Node 22.16.0 product verification behavior remains unchanged.

The harness job may add only the minimum INC-2 checks necessary to prove:

- pinned dependency install;
- harness lint;
- harness typecheck;
- harness unit tests;
- bounded Docker/Eve integration controls.

No provider/model call is required for CI acceptance of INC-2.

No network is granted to the candidate sandbox merely because the GitHub runner itself has network.

## 23. Definition of Done

INC-2 is implementation-complete only when all of the following are mechanically proven on one exact candidate head.

D1. INC-1 routing tests remain green without semantic or authority changes.

D2. The supervisor constructs policy only from validated task data plus supervisor-owned execution constraints.

D3. The model cannot create authority by requesting a tool, path, argv, cwd, subprocess, network destination, secret, or Git effect outside policy.

D4. Every privileged request is mediated before execution.

D5. EC-01 through EC-08 produce their exact frozen outcomes.

D6. Positive controls in Section 19 pass.

D7. Eve is imported only through the bounded adapter surface selected by Stage 03.

D8. AI SDK use is limited to the tool/model primitive boundary required by the pinned Eve adapter.

D9. No undeclared Eve default/built-in capability is reachable.

D10. Candidate execution occurs inside a disposable sandbox with immutable runtime identity.

D11. Candidate sandbox network is denied.

D12. Candidate sandbox receives no privileged Git, deployment, provider, supervisor, or verifier secrets.

D13. Candidate sandbox cannot access host repository .git metadata.

D14. Cross-run candidate-controlled writable state does not persist.

D15. No product/application/database/provider behavior changes.

D16. No Jev, final-verifier, authenticated-provenance, memory, or multi-agent implementation appears.

D17. Reviewable implementation remains below the 420 internal stop and 500 repository ceiling.

D18. Harness lint, typecheck, unit tests, and physical sandbox integration tests pass.

D19. Existing Node 22 PR Verification remains semantically unchanged and passes.

D20. Exact-head PR Verification passes.

D21. Independent Codex review completes under the existing three-cycle limit with zero unresolved actionable findings before release eligibility.

## 24. Construction sequence

INC-2 Stage 04 must use one bounded candidate loop:

```text
BIND
  -> INSPECT
  -> MUTATE ONE BOUNDED CANDIDATE
  -> VERIFY
  -> STOP
```

Within that candidate, implementation order is:

1. freeze pinned Eve/AI SDK/runtime identities from the Stage 03 contract;
2. implement pure CapabilityPolicy and request gate;
3. implement the narrow Eve adapter;
4. implement supervisor-owned sandbox lifecycle;
5. add deterministic unit controls;
6. add physical Docker/Eve negative controls;
7. add the minimum CI integration;
8. run full affected verification;
9. stop.

A failing check does not authorize speculative architecture changes.

A second repair requires materially new bounded diagnostic evidence.

## 25. Stage 03 handoff

Stage 03 must freeze, without implementing:

1. exact candidate path subset from Section 16;
2. exact Eve package/version;
3. exact AI SDK package/version;
4. exact Eve APIs used by the adapter;
5. exact default-capability suppression predicate;
6. exact immutable Docker/sandbox identity;
7. exact CapabilityPolicy schema;
8. canonical-path containment algorithm;
9. exact authored tool set;
10. exact argv/cwd policy representation;
11. exact sandbox creation/destruction semantics;
12. exact network-deny mechanism;
13. exact secret and Git absence predicates;
14. all EC-01 through EC-08 fixtures and expected outcomes;
15. positive-control fixtures;
16. exact CI commands;
17. exact line-budget accounting;
18. exact stop conditions.

If any of items 2 through 13 cannot be frozen deterministically, Stage 03 returns BLOCKED / REDESIGN.

## 26. Stop conditions

Stop immediately if any of the following occurs:

1. root AGENTS.md or CONTEXT.md must change;
2. product/application code or dependencies must change;
3. the INC-1 router must change to grant INC-2 authority;
4. Eve requires an implicit/default capability that cannot be disabled or physically withheld;
5. Eve requires network in the candidate sandbox for the accepted INC-2 path;
6. the sandbox cannot exclude host .git metadata or privileged secrets;
7. canonical filesystem enforcement cannot resist symlink escape;
8. network denial is represented only as a prompt instruction;
9. Git denial is represented only as a prompt instruction;
10. candidate-controlled writable state survives into a later run;
11. a new policy engine, service, database, memory layer, agent layer, or orchestration layer becomes necessary;
12. a product runtime integration becomes necessary;
13. physical sandbox tests require model/provider credentials;
14. the implementation reaches or projects to 420 reviewable lines before the initial candidate is complete;
15. the same failure persists without materially new bounded diagnostic evidence;
16. Plan, Contract, base, head, package, or runtime identity becomes stale;
17. exact-head CI fails without one bounded evidence-backed correction;
18. Codex review cycle 3 reports an actionable finding.

Required disposition is BLOCKED, REDUCE, or REDESIGN according to the triggering condition.

## 27. Explicit non-authority

This Plan does not authorize:

- Stage 03 contract mutation before explicit approval of this exact PLAN_READY artifact;
- Stage 04 implementation;
- INC-3, INC-4, or INC-5;
- Jev;
- final PASS authority;
- authenticated provenance;
- root-router cutover;
- old-governance removal;
- product feature work;
- database/backend work;
- memory;
- multi-agent execution;
- deployment;
- release;
- merge;
- a change-size exception.

## 28. Stage 02 disposition

The Plan closes one verified gap with the smallest approved architectural increment:

```text
INC-1 deterministic routing
        +
INC-2 external supervisor
        +
hard capability mediation
        +
disposable physical sandbox
```

No additional architectural layer is introduced beyond the already-approved v1.2 roadmap.

The Plan is ready for exact-artifact approval and Stage 03 contract freezing.

PLAN_READY

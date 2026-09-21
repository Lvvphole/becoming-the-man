# Stage 04 Candidate Manifest - INC-2

Artifact disposition: IMPLEMENTATION_CANDIDATE_READY
Stage lifecycle disposition: CANDIDATE_READY
Stage: 04_implement
Route: route:04_implement:governance
PR: 53
Merge base: 93a2edc3f8729f30f6772ce8a8df7a955c5c2fff
Technical candidate head: ff70b23299e2fcda3499cbbc480895f52af2ed53
Verified PR Verification run: 35646589550

## 1. Prior-Stage Source Bindings

- Approved Plan Git blob: d3e203120d4231c72d524e6a1cd8a6f3f173abeb
- Implementation Contract Git blob: 52d74f4caa528f01e07cabc04392be499e2419d1

## 2. Technical Candidate Verification Evidence

Exact-head CI run 35646589550 concluded with success testing candidate SHA ff70b23299e2fcda3499cbbc480895f52af2ed53:

- Harness lint: PASS, including `harness/agent/sandbox/sandbox.ts`.
- Harness source typecheck: PASS.
- Authored Eve-file typecheck: PASS, including `agent/sandbox/sandbox.ts`.
- Harness tests: 19 passed / 19 total across 2 files.
- Harness Verification: PASS.
- PR Verification: PASS.
- Exact-SHA binding: PASS.

## 3. Workpiece Confinement & Reviewable Footprint

Counted implementation files (9):

- `.github/workflows/pr-verification.yml`
- `harness/agent/agent.ts`
- `harness/agent/sandbox/sandbox.ts`
- `harness/agent/tools/execute.ts`
- `harness/package.json`
- `harness/src/capability.ts`
- `harness/src/eve-adapter.ts`
- `harness/src/supervisor.ts`
- `harness/tests/execution.test.ts`

Dependency lockfiles are excluded by repository governance.

Reviewable implementation footprint: 419 lines against PR base 93a2edc3f8729f30f6772ce8a8df7a955c5c2fff.
INC-2 internal stop: 420 lines.
Repository ceiling: 500 lines.

## 4. INC-2 Boundary Evidence

The technical candidate verifies the contracted INC-2 boundaries, including:

1. Signed authority is bound to the exact Eve session and rejects tamper/cross-session replay before sandbox effects.
2. Model-visible tool closure is exactly `["execute"]`.
3. The real authored Eve sandbox binds to the locked Docker backend with physical deny-all networking.
4. Workspace policy roots are limited to exactly `/workspace` or the `/workspace/` path segment.
5. Run cwd is canonicalized and equality-checked before process execution.
6. Git is denied both by supplied executable name and when an otherwise authorized executable alias resolves canonically to Git.
7. EC-05 inspects effective Docker network attachments directly rather than depending on curl, DNS, TLS, or an external site.
8. EC-07 includes a real supervisor-only filesystem sentinel and verifies that it is unreachable from the sandbox, alongside supervisor-secret environment isolation.
9. Supervisor-scoped prewarmed Eve sessions are terminally reset in cleanup-protected control flow on both successful and throwing operations.
10. Independent physical sandboxes have distinct identities and no writable-state carryover.

## 5. Lifecycle Boundary Declaration

This manifest records Stage 04 candidate evidence only. It does not establish Stage 05 PASS, Stage 06 review clearance, release eligibility, merge readiness, or merge authority.

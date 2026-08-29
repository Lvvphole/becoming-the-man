---
name: engineering-rules
description: >
  Apply the canonical 53-rule engineering standard — enforce it while writing code,
  and audit existing code, diffs, and pull requests against it — returning corrected
  code plus a deterministic gate report from scripts/check.py. Use this skill whenever
  writing, refactoring, reviewing, repairing, or extending code in any language;
  whenever a diff, branch, or pull request needs review; whenever tests are added,
  changed, skipped, or deleted; whenever a public contract or architecture boundary
  changes; and whenever building agent harnesses, retry loops, evaluators, or
  multi-agent orchestration — even if the user never says "rules," "standards,"
  "clean code," or "review."
---

# Engineering Rules

The 53 rules below are the standard. This skill turns them into two behaviors: **enforce** them while producing code, and **audit** existing code against them. In both cases the deliverable is corrected code, not a lecture.

## Two modes

**Authoring** — you are writing or changing code. Apply the in-scope rules as you write. Do not produce a draft and then critique it; produce the version that already complies.

**Audit** — you are handed existing code, a diff, or a PR. Run the gates, then return the corrected code. Fix it even when someone else wrote it: a finding the reader has to translate into a change is less useful than the change.

Both modes end the same way — corrected code plus a short evidence line. The difference is only where the code came from.

## Workflow

1. **Read the actual artifacts first.** Governing instructions, current implementation, the tests that cover it, the interfaces it crosses. Never reason from a snippet or from memory of how the codebase probably looks (AE-001).
2. **Determine scope.** Which language overlays apply. Whether TDD or XP profiles are active. Whether agentic artifacts are in play. `[CONDITIONAL]` rules only fire when their condition actually exists — do not manufacture applicability.
3. **Run the gate script** on the files in question:
   ```bash
   python scripts/check.py <paths...>                  # scan files or directories
   python scripts/check.py --changed                   # scan files changed vs git HEAD
   python scripts/check.py <paths...> --intent fix     # feature | fix | refactor
   python scripts/check.py <paths...> --checklist full # auto (default) | full | off
   python scripts/check.py <paths...> --exclude '*/vendor/*'  # repeatable glob
   python scripts/check.py <paths...> --profile tdd,xp --json
   ```
   The script decides mechanically what can be decided mechanically (AE-005). Take its output as authority for those rules — do not re-argue a gate result from reading the code.

   With `--changed`, findings are scoped to the changed lines (±2) — a two-line diff does not resurface pre-existing issues, and the header reports how many were suppressed.

   The checklist is scoped, not fixed. In the default `auto` mode a rule appears only when a signal for it is present in the code — boundary rules when serialization or I/O is in scope, test rules when test artifacts are, agentic rules when harness or orchestration artifacts are. With `--changed`, scope is judged from the added lines only, so a two-line diff does not arrive with the whole inventory attached. Use `--checklist full` when you want the complete set regardless, and `off` when you only want the gates. Declare `--intent` when you know it: the refactoring and defect-fix rules cannot be scoped from code alone.
4. **Fix everything the gates flag**, plus every judgment-rule violation you can see. Re-run the script after fixing.
5. **Report** in the format below.

## Output format

Lead with the corrected code. Then, at most, these three lines:

```
Rules applied: SC-002, SC-008, RT-011
Gates: 3 blocking → 0
Needs your call: REQ-001 — the retry cap is not in any authorized task; I used 5
```

Constraints on the report:
- One line per category, not per rule. Rule IDs only — do not restate rule text back to the user; they wrote it.
- `Needs your call` is for genuine unresolved information: a missing authorization, an ambiguous contract, a trade-off that is the user's to make. Mark it unresolved rather than guessing (REQ-006). Omit the line when there is nothing unresolved.
- No preamble, no summary of what you changed line by line, no praise for the existing code.

## What the gates are and are not

Measured against four production repositories (requests, flask, axios, zod — 764 files): the gates flag roughly 2 findings per file, most of them `review` rather than `blocking`. Two things follow.

Severity is calibrated, not decorative. `blocking` means the pattern is a violation regardless of context — an empty catch, `as any`, randomness in a test. `review` means the pattern is a violation *if* the surrounding intent matches — a `None` return that may be a valid result rather than a failure, a repeated literal that may be test data. Do not fix a `review` finding without reading the code; the gate cannot see intent.

A high count on an unfamiliar codebase usually means scope, not rot. Type-gymnastics libraries produce hundreds of `TS-001`/`TS-003` hits because their internals genuinely use `any` deliberately. Run against a diff, not a repository, unless you actually want the backlog.

## Do not self-certify

You are the proposer. The proposer does not accept its own work (AE-002). This has concrete consequences for how you write the report:

- Say what the gates returned. Do not say the code "is compliant," "meets the standard," or "passes all 53 rules."
- The judgment rules — the ones no script can decide — are candidate claims. If you assert one, attach the evidence (`file:line`, the test that fails on the old baseline, the contract you checked). If you cannot attach evidence, say so instead of asserting.
- A green gate report means the mechanical checks found nothing. It is not proof of correctness. Never convert gate results into a percentage or a grade (RT-009).

## Rules that most often get violated in practice

Recurring failure patterns worth checking explicitly, because they survive casual review:

- **Inventing requirements** (REQ-001). Added behavior nobody asked for, defended as obviously useful.
- **Speculative abstraction** (SC-002). An interface with one implementation, a config flag with one value, a plugin system for a single case.
- **Assertion-free tests** (RT-011). A test that calls the function, catches nothing, asserts nothing, and passes on any implementation.
- **Weakening tests to make a change pass** (RT-006). Loosening an assertion, adding `skip`, widening a tolerance. Change verification only when the requirement or the verification is proven wrong.
- **Nondeterminism disguised as a gate** (RT-007). Wall-clock time, randomness, live network, execution-order dependence inside something treated as a deterministic check.
- **Silent failure** (SC-008). Empty catch, bare except, an error mapped to `None` or `false` where the caller cannot tell failure from a valid result.
- **Inferring tool success** (AE-004). Acting on the assumption that the previous command worked because it was issued.
- **Unbounded loops** (AE-006). Retry, repair, or fan-out with no stop condition and no budget.

---

# Canonical Engineering Rule Inventory

**Base and language engineering rules:** 41 · **Method and agentic overlays:** 12 · **Total admitted rules:** 53

## Activation

- **[MUST]** applies whenever the rule's scope applies.
- **[CONDITIONAL]** applies only when the condition stated in the rule exists.
- Apply the Python and TypeScript overlays only when that language is in scope.
- Apply the TDD and XP overlays only when those development methods are active.
- Apply the Agentic Engineering overlay when an agent plans, changes, reviews, repairs, evaluates, orchestrates, or adapts repository or harness artifacts.
- These rules guide candidate construction. They do not override the authorized task, repository governance, architecture decisions, or authoritative verification.

## Technical Writing (3)

- **TW-001** [MUST] — Use clear, direct, unambiguous language and one stable term for each technical concept. Do not vary terminology for style.
- **TW-002** [MUST] — Structure technical text so each sentence carries one primary claim or action. Give each paragraph one topic, and introduce information in a logical progression.
- **TW-003** [MUST] — Put required actions and conditions in the operative instruction or specification. Do not put them only in notes, asides, comments, or duplicated prose. Keep documentation synchronized with the authoritative artifact it describes.

## Requirements (7)

- **REQ-001** [MUST] — Do not invent requirements. Every requirement or behavior change must derive from an authorized task, stakeholder need, business objective, governing specification, or explicit constraint.
- **REQ-002** [MUST] — Express one independently interpretable obligation per requirement. Use terminology consistently so reasonable readers reach the same meaning.
- **REQ-003** [MUST] — Specify observable behavior precisely enough to identify relevant preconditions or triggers, expected outcomes, side effects, and required failure behavior. Do not leak an implementation unless the implementation itself is constrained.
- **REQ-004** [MUST] — Every normative requirement must have an objective verification or acceptance path. If compliance can only be judged by opinion, the requirement is not ready.
- **REQ-005** [MUST] — A requirement must be necessary, feasible, and within authorized scope. Do not add unnecessary implementation constraints or gold-plated behavior.
- **REQ-006** [MUST] — The requirement set for the current increment must be internally consistent and sufficiently complete to proceed at an acceptable risk. Mark unresolved information as unresolved rather than guessing.
- **REQ-007** [CONDITIONAL] — Where requirement, implementation, and test artifacts exist, preserve traceability from the authoritative source to the requirement, changed implementation, and verification evidence.

## Software Construction (11)

- **SC-001** [MUST] — Satisfy the authorized contract and preserve correctness before optimizing style, abstraction, or elegance.
- **SC-002** [MUST] — Make the smallest sufficient change and design that solves the authorized problem. Do not introduce speculative behavior, abstractions, dependencies, or complexity. Do not move local complexity into hidden global complexity.
- **SC-003** [MUST] — Hide implementation decisions behind the smallest sufficient stable interface. Do not leak a design decision across modules or force callers to understand unnecessary internal complexity.
- **SC-004** [MUST] — Use precise, intention-revealing, domain-appropriate names. Use the same name for the same concept.
- **SC-005** [MUST] — Keep each unit of code conceptually coherent at one useful level of abstraction. Split or combine code to reduce cognitive load and interface complexity, not to satisfy arbitrary size targets.
- **SC-006** [MUST] — Keep one authoritative representation of each piece of knowledge when practical. Do not duplicate logic, constants, type facts, requirements, or design decisions in forms that can drift independently.
- **SC-007** [MUST] — Comments and API documentation must explain non-obvious intent, rationale, invariants, contracts, or consequences. Do not restate obvious code. Update nearby documentation when the code invalidates it.
- **SC-008** [MUST] — Make failure behavior explicit and appropriate to caller needs. Preserve useful failure context. Do not silently swallow, disguise, or ambiguously encode exceptional failure.
- **SC-009** [CONDITIONAL] — Where correctness depends on operation order, state progression, or a required protocol, make that dependency explicit and enforceable through the interface, data flow, or state model. Do not rely on undocumented call ordering or hidden temporal state.
- **SC-010** [MUST] — Validate data and state when they cross an external, trust, ownership, serialization, persistence, process, or service boundary. Use one authoritative contract for allowed shape, values, optionality, and failure semantics so producers and consumers cannot silently disagree.
- **SC-011** [CONDITIONAL] — When correctness depends on an invariant, precondition, or postcondition that the type system or interface cannot guarantee, make that condition executable at the nearest authoritative boundary or verify it directly. Do not substitute proxy conditions for the semantic invariant.

## Refactoring & Testing (11)

- **RT-001** [MUST] — A refactoring must preserve observable behavior. If observable behavior changes, treat the work as a behavior change, not as refactoring.
- **RT-002** [MUST] — Do not mix behavior change and structural cleanup invisibly. Keep the intent of each change explicit so verification can distinguish new behavior from behavior-preserving restructuring.
- **RT-003** [MUST] — Perform refactoring and other high-risk structural changes in small, reviewable increments. Verify after each meaningful increment, and increase scrutiny as risk increases.
- **RT-004** [MUST] — Changed behavior must have verification evidence that tests the observable contract rather than incidental implementation details.
- **RT-005** [CONDITIONAL] — For a reproducible defect fix, add or update regression evidence that fails on the faulty baseline for the targeted behavior and passes after the fix.
- **RT-006** [MUST] — Do not weaken, delete, bypass, or rewrite valid verification merely to make a candidate change pass. Change verification only when an authoritative requirement or the verification itself is proven wrong.
- **RT-007** [MUST] — Verification used as a deterministic automated gate must be self-validating and repeatable for the same software version, declared dependency and toolchain state, and controlled inputs. Tests must not depend on execution order or leaked mutable state. Uncontrolled time, randomness, scheduling, network state, or external-service behavior must not masquerade as deterministic verification evidence.
- **RT-008** [CONDITIONAL] — When the observable contract contains thresholds, ranges, empty or missing cases, state transitions, or defined failure modes, verification must exercise the materially relevant boundaries and failure partitions. Do not test only representative normal-path values.
- **RT-009** [MUST] — Do not treat code-coverage percentage as proof of correctness or verification adequacy. Use coverage to identify unexercised code. Establish adequacy with behavior-specific evidence against the required observable contract.
- **RT-010** [CONDITIONAL] — When changed behavior crosses a module, process, service, persistence, serialization, third-party, or other independently owned boundary, verify the actual boundary contract and both sides' interpretation of it. Unit tests of each side alone are not sufficient evidence for that boundary.
- **RT-011** [MUST] — Verification evidence must contain a meaningful oracle that can fail when the targeted contract is violated. Do not treat assertion-free, tautological, unused-input, or unrelated assertions as evidence of correctness.

## Architecture Decisions (4)

- **AD-001** [MUST] — For a consequential architecture choice, record the problem context, considered alternatives, decision, justification, consequences, and material trade-offs. Do not present a contextual choice as a universal best practice.
- **AD-002** [MUST] — Treat established architectural boundaries, contracts, ownership, and dependency directions as constraints. Do not bypass them for local convenience unless the authorized task explicitly changes the architecture.
- **AD-003** [MUST] — An architecture change must identify the quality attributes and coupling it materially affects. Justify the chosen trade-off against the authorized requirements.
- **AD-004** [CONDITIONAL] — When changing a public contract, shared data ownership, or cross-boundary interface, preserve compatibility or provide an explicit migration. Account for affected consumers and consequences.

## Python Overlay (2)

- **PY-001** [CONDITIONAL] — When a Python function has an exceptional failure state distinct from valid results, signal it with an exception rather than an ambiguous falsey sentinel such as `None`. Make the caller-facing failure contract explicit.
- **PY-002** [CONDITIONAL] — For Python APIs whose exceptions are part of the contract, document when those exceptions are raised. Do not duplicate type facts in docstrings when annotations already express them.

## TypeScript Overlay (3)

- **TS-001** [MUST] — Treat values of unknown external shape as `unknown` until they are validated or narrowed. Do not use plain `any` to bypass uncertainty.
- **TS-002** [MUST] — Model types so declared states are valid and truthful. Prefer a less precise type over an inaccurate type that claims facts the program has not established.
- **TS-003** [MUST] — Do not use type assertions to silence type errors or manufacture unproven facts. When an unsafe assertion is unavoidable at a boundary, isolate it behind a well-typed interface.

## Test-Driven Development Overlay (1)

- **TDD-001** [MUST WHEN TDD PROFILE IS ACTIVE] — Establish an executable test that fails for the absence or defect of the targeted behavior before the production change. Make the smallest production change that makes the test pass. Refactor only while the applicable verification remains green.

## Extreme Programming Overlay (1)

- **XP-001** [MUST WHEN XP PROFILE IS ACTIVE] — Keep each increment continuously integrable. Integrate small changes frequently and run the applicable automated build and verification after integration. Restore a failed integration before adding unrelated work.

## Agentic Engineering Overlay (10)

- **AE-001** [MUST] — Before changing repository artifacts, inspect the current governing instructions, repository state, relevant implementation, applicable tests, and affected interfaces. Do not substitute model memory, assumptions, or an isolated snippet for repository evidence.
- **AE-002** [MUST] — Treat agent-generated code, tests, diagnoses, harness changes, and completion claims as candidates. Use the authoritative external verifier or an authorized human for acceptance or promotion. The proposer or executor must not self-certify.
- **AE-003** [MUST] — Preserve authorized scope and unrelated repository work. Destructive operations and protected side effects require explicit authority.
- **AE-004** [CONDITIONAL] — When a later action depends on an earlier action, inspect the actual tool or environment result first. Do not infer success from the requested action, prior plan, or model statement.
- **AE-005** [MUST] — When an available deterministic mechanism can decide a property exactly, use it as the authority. Do not replace exact verification or computation with model judgment.
- **AE-006** [MUST] — Give each retry loop, repair loop, recursion path, and subagent fan-out explicit stop conditions and finite resource budgets. If repeated work produces no new evidence or progress, stop, change strategy within budget, or hand off.
- **AE-007** [CONDITIONAL] — When work uses multiple or recursive agents, define each unit's task, allowed scope, output contract, and termination condition. Parallelize only independent work. Otherwise, define synchronization and merge rules.
- **AE-008** [MUST] — Evaluate an agentic system as a versioned configuration of model, instructions, tools, harness policy, budgets, environment, and verifier. Re-evaluate after a material configuration change before transferring a measured result.
- **AE-009** [MUST] — Before executing a verifier (test suite, gate script, check harness, or acceptance runner), confirm that the execution is safe transitively: the verifier entry point and every wrapper, hook, fixture, configuration source, subprocess invocation, and network call it reaches must be within authorized scope and must not produce destructive side effects outside the verified artifact. Do not treat a verifier as safe because its entry point appears safe; inspect or constrain the transitive closure of its execution.
- **AE-010** [MUST] — Before the first mutation in an increment, re-read each applicable governing source — task authorization, repository governance, architecture decisions, interface contracts, and upstream specifications — from its authoritative location. Do not rely on a prior session's cached content, model memory, or a stale copy when the authoritative source is accessible.

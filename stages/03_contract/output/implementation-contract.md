# Implementation Contract — Deterministic Governance Routing INC-1

Status: CONTRACT_READY

## 1. Binding

Approved Plan:
- source: supplied Plan-stage artifact
- sha256: `0b0039d77ff4a5f967339742f24d48741d877489f258b9a73ad14459d69fb5f4`
- disposition: `PLAN_READY`
- approval: explicit user approval recorded in the task context

INC-0 verified state:
- branch: `governance/icm-routing-tree-inc0`
- head: `012e6961f892217335f884878107e0ee95684354`
- base/main: `bfe440cef162182ca35af7744ef623b61f8eb8cd`
- PR: `#48`
- PR Verification run: `34892699795`
- result: success on the exact INC-0 head

Routed authority identities:
- `AGENTS.md`: `b3319d00d7fb489c7164f3a9af5577df710ce33e`
- `CONTEXT.md`: `58d61b6b4055816ae005c32c15843698e6940b86`
- `stages/03_contract/CONTEXT.md`: `681cb0818692668d900aa42ce0f28823b27064a3`
- `references/engineering/engineering-rules.md`: `349bb5497d092e2124441809fe937880b9d649bf`
- `references/architecture/CONTEXT.md`: `9c49c338ce0250824a615835a61f59398d8ee2ad`
- `package.json`: `9136c40dca79568dfeabd1b6d8cbc181c62db868`
- `.github/workflows/pr-verification.yml`: `87328d05b5be848653f7e75e25cfb0b978d37950`

Any material drift in the approved Plan or routed authority identities before INC-1 implementation returns BLOCKED.

## 2. Exact INC-1 candidate paths

Only these implementation paths are authorized for INC-1:

1. `contracts/governance-routing-contract.json` — create.
2. `scripts/verify-governance-routing.mjs` — create.
3. `tests/governance-routing.test.mjs` — create.
4. `package.json` — modify only the scripts object as defined below.

Explicitly unauthorized for INC-1:
- `AGENTS.md`
- `CLAUDE.md`
- root `CONTEXT.md`
- all `stages/**/CONTEXT.md`
- `references/**`
- `docs/**`
- `.github/workflows/pr-verification.yml`
- application/runtime source
- Supabase/schema/migration files
- evidence files
- dependency manifests other than the permitted `package.json` script edit
- `package-lock.json`

No dependency may be added.

## 3. Reviewable-line budget

Hard ceiling for the full PR remains 500 reviewable implementation lines.

INC-0 Markdown/documentation is excluded by AGENTS.md. INC-1 budgets:

- `contracts/governance-routing-contract.json`: <= 70 changed lines.
- `scripts/verify-governance-routing.mjs`: <= 210 changed lines.
- `tests/governance-routing.test.mjs`: <= 190 changed lines.
- `package.json`: <= 4 additions + deletions.

Maximum authorized INC-1 budget: 474 reviewable lines.

If the implementation cannot satisfy the contract within this bound, stop with BLOCKED. Do not request a size exception and do not compress correctness into unreadable code.

## 4. Contract data file

`contracts/governance-routing-contract.json` is a subordinate machine contract. It is not a second routing authority and may not contain route choices.

It must contain exactly these contract classes:

- `version`
- `task_envelope.required_fields`
- `task_envelope.path_array_fields`
- `blocked_record.required_fields`
- `blocked_record.status`
- `blocked_record.reason_codes`
- `stage_contract.required_fields`
- `architecture.active_sources`
- `governance.active_500_paths`
- `governance.forbidden_drift_tokens`

Required task-envelope fields:
- `workflow_stage`
- `task_domains`
- `source_sections`
- `workpiece_paths`
- `selected_evidence_ids`
- `prior_outputs`
- `authorized_candidate_paths`
- `approvals`
- `source_binding`

Path-array fields:
- `workpiece_paths`
- `authorized_candidate_paths`

Required BLOCKED fields:
- `status`
- `reason_code`
- `gate_id`
- `stage_id`
- `route_candidates`
- `missing_inputs`
- `conflicts`
- `source_binding`
- `resolution_required`

Allowed BLOCKED `status`: exactly `BLOCKED`.

Required stable reason codes:
- `ROUTING_TABLE_INVALID`
- `ROUTE_ZERO_MATCH`
- `ROUTE_MULTI_MATCH`
- `MISSING_SELECTOR`
- `MISSING_SOURCE`
- `SOURCE_BINDING_STALE`
- `WILDCARD_INPUT`
- `EVIDENCE_INDEX_MISSING`
- `EVIDENCE_ID_UNKNOWN`
- `EVIDENCE_BINDING_STALE`
- `EVIDENCE_AUTHORITY_FORBIDDEN`
- `UNLISTED_INPUT`
- `TRANSITION_PRECONDITION_FALSE`
- `REVIEW_CYCLE_EXCEEDED`
- `CHANGE_SIZE_DRIFT`
- `STAGE_CONTRACT_INVALID`

Required common stage-contract fields:
- `stage_id`
- `job`
- `required_inputs`
- `allowed_layer3`
- `allowed_layer4`
- `permitted_mutations`
- `forbidden_mutations`
- `required_verifier`
- `primary_output`
- `next_stage`
- `human_gate`

Expected active architecture source order:
1. `docs/Website_System_Architecture_v1.0_LOCKED.md`
2. `docs/SYSTEM_ARCHITECTURE_AMENDMENT_v1.1.md`
3. `docs/SYSTEM_ARCHITECTURE_AMENDMENT_v1.2.md`

Active 500-governance files:
- `AGENTS.md`
- `references/architecture/CONTEXT.md`
- `references/engineering/engineering-rules.md`
- `docs/SYSTEM_ARCHITECTURE_AMENDMENT_v1.1.md`
- `docs/SYSTEM_ARCHITECTURE_AMENDMENT_v1.2.md`

Forbidden active drift tokens:
- `Website Governing Product Specification`
- `1,000`
- `1000-line`
- `1,000-line`

## 5. Routing-table parser contract

The canonical routing table remains only the JSON block in root `CONTEXT.md` between `ROUTING_TABLE_BEGIN` and `ROUTING_TABLE_END`.

The verifier must:

1. require exactly one begin marker and one end marker in the correct order;
2. require exactly one fenced `json` object inside that range;
3. inspect the raw JSON before `JSON.parse`;
4. detect duplicate immediate property names inside `stage_registry`, `source_registry`, and `domain_registry`;
5. reject duplicate registry keys as `ROUTE_MULTI_MATCH`;
6. parse only after duplicate-key checks pass;
7. reject missing required registries/fields as `ROUTING_TABLE_INVALID`.

The duplicate-key oracle is mandatory because ordinary `JSON.parse` silently keeps only one duplicate property and would otherwise erase evidence of two possible routes.

## 6. Route-evaluation contract

The evaluator receives:
- parsed canonical routing table;
- caller/prior-output task envelope;
- a set of available task-context source IDs;
- optional evidence-index data when evidence IDs are selected.

It must not derive task selectors from free-form prose.

For every envelope:

1. every required field must exist;
2. `workflow_stage` must match exactly one stage-registry key;
3. `task_domains` must be a non-empty array with no duplicate IDs;
4. every task-domain ID must match exactly one domain-registry key;
5. every domain-required envelope field must exist;
6. selected Layer 3 sources are the set union of stage `base_layer3` plus all selected domain bundles;
7. every selected source ID must resolve exactly once;
8. every source with `explicit_selector_required` must have a non-empty exact selector in `source_sections`;
9. every task-context source must be present in the supplied available-source set;
10. every path-array field must contain exact repository-relative paths and reject glob metacharacters `*`, `?`, `[`, or `]`;
11. non-empty `selected_evidence_ids` requires an evidence index;
12. every selected evidence ID must resolve exactly once;
13. evidence marked stale/historical may not satisfy a current-state request;
14. `evidence_index.normative` must be `false`.

A valid cross-domain task returns one route object containing one stage plus the set-union source bundle. It never returns one route per domain.

## 7. BLOCKED-record contract

All route/precondition failures return an object with exactly the required BLOCKED fields.

- `status` must equal `BLOCKED`.
- `reason_code` must be one of the stable reason codes.
- `gate_id` must identify the failed `G_*` gate.
- `stage_id` is the supplied stage when known, otherwise `UNKNOWN`.
- list fields must always be arrays, including when empty.
- `source_binding` must always be an object.
- no failure may be represented as a successful route with warning text.

The verifier must expose a deterministic validator for this record shape.

## 8. Stage-contract verifier contract

The verifier must inspect the first fenced `yaml` block in each path listed by `stage_registry[*].contract`.

Only the flat subset currently used by the stage contracts is accepted:

- top-level scalar `key: value`;
- top-level array `key:` followed by indented `- value` entries;
- no nested maps;
- no duplicate top-level keys.

For every selected stage contract:

- all common required fields must occur exactly once;
- `stage_id` must equal the owning stage-registry key;
- the file must exist at the exact registry path;
- the stage contract may not contain wildcard discovery in its declared path inputs;
- a skill path is allowed only when root `CONTEXT.md` explicitly supplies it.

A shape failure returns `STAGE_CONTRACT_INVALID`.

## 9. Architecture/governance drift contract

The verifier must mechanically check:

- architecture manifest lists the three expected architecture files once and in the contract order;
- all active 500-governance files exist;
- no active 500-governance file contains any forbidden drift token;
- `AGENTS.md`, architecture manifest, engineering rules, v1.1, and v1.2 each contain an active `500` reference;
- root routing table declares evidence index `normative: false`.

Any failure is candidate nonconformance and must make the verifier exit non-zero.

## 10. Input-allowlist and evidence-authority contracts

Expose deterministic functions that enforce:

```text
loaded_inputs subset_of allowed_inputs
```

An unlisted loaded path -> `UNLISTED_INPUT`.

Expose deterministic evidence-role validation:

```text
source_kind = evidence
AND role in {requirement, permission, waiver, transition_authority}
=> EVIDENCE_AUTHORITY_FORBIDDEN
```

No evidence datum can be upgraded to authority by its contents.

## 11. Transition contracts

The verifier must evaluate transitions only from the root `transition_registry`.

- transition key must exist exactly once;
- every listed `requires` fact must be strictly `true`;
- missing/false fact -> `TRANSITION_PRECONDITION_FALSE`;
- `07_release->merge` must never be automatic.

Review-cycle gate:

```text
cycle <= 3
```

Cycle > 3 -> `REVIEW_CYCLE_EXCEEDED`.

Cycle 3 with an actionable finding is BLOCKED by the engineering-rules contract and must not be converted to a fourth cycle.

## 12. CLI contract

`scripts/verify-governance-routing.mjs` must:

- use Node built-ins only;
- use argv-list/file APIs only; no shell execution, `eval`, dynamic code execution, network, or mutation;
- export its pure validation/evaluation functions for Vitest;
- when invoked directly, validate the repository governance structure against the current working tree;
- write one compact JSON result to stdout;
- exit `0` only when all static governance checks pass;
- exit non-zero for candidate nonconformance or BLOCKED prerequisite state;
- never mutate repository files.

The CLI is a verifier, not routing authority. Root `CONTEXT.md` remains canonical.

## 13. Persistent verification contract

`package.json` may change only as follows:

- add script `verify:routing` = `node scripts/verify-governance-routing.mjs`;
- prepend `npm run verify:routing &&` to the existing `verify` command.

No dependency change and no lockfile change.

Because `.github/workflows/pr-verification.yml` already executes `npm run verify`, no workflow edit is authorized.

## 14. Required tests and oracles

The focused Vitest file must include positive controls for:

1. one unique governance route;
2. one cross-domain route returning one combined source bundle;
3. one valid BLOCKED record;
4. one valid stage-contract parse;
5. one authorized transition with all required facts true.

Mandatory negative controls:

1. zero matching route -> `ROUTE_ZERO_MATCH`;
2. duplicate raw stage-registry key -> `ROUTE_MULTI_MATCH`;
3. missing `workflow_stage` -> `MISSING_SELECTOR`;
4. missing required Layer 3 source -> `MISSING_SOURCE`;
5. stale/incorrect architecture source order -> non-zero drift result;
6. evidence used as requirement -> `EVIDENCE_AUTHORITY_FORBIDDEN`;
7. loaded path outside allowlist -> `UNLISTED_INPUT`;
8. wildcard path -> `WILDCARD_INPUT`;
9. Plan -> Contract without explicit user approval -> `TRANSITION_PRECONDITION_FALSE`;
10. Verify -> Review without verification PASS fact -> `TRANSITION_PRECONDITION_FALSE`;
11. review cycle 4 -> `REVIEW_CYCLE_EXCEEDED`;
12. active `1,000` limit fixture -> `CHANGE_SIZE_DRIFT`;
13. selected evidence IDs with no index -> `EVIDENCE_INDEX_MISSING`;
14. selected unknown evidence ID -> `EVIDENCE_ID_UNKNOWN`;
15. stale selected evidence -> `EVIDENCE_BINDING_STALE`;
16. malformed/missing stage contract field -> `STAGE_CONTRACT_INVALID`.

A negative control passes only when the expected failure code is observed. Merely throwing any error is insufficient.

## 15. Red-first sequence

INC-1 mutation order is frozen:

1. create `contracts/governance-routing-contract.json`;
2. create `tests/governance-routing.test.mjs` while the verifier module is absent;
3. run persistent CI and record the expected RED caused by the missing verifier module;
4. only after that RED evidence, create `scripts/verify-governance-routing.mjs`;
5. modify `package.json` exactly as authorized;
6. run targeted routing tests;
7. run `npm run verify`;
8. run the change-size gate;
9. obtain exact-head PR Verification.

The RED run proves the tests are capable of rejecting the missing implementation. Do not create the verifier before the RED is observed.

## 16. Recovery

If INC-1 must be abandoned, revert these four candidate paths together:

- `contracts/governance-routing-contract.json`
- `scripts/verify-governance-routing.mjs`
- `tests/governance-routing.test.mjs`
- `package.json`

INC-0 governance remains only if it makes no claim that the reverted mechanical verifier is already enforced.

## 17. Per-mutation stop conditions

Before every INC-1 mutation, re-read the active stop state.

Stop immediately when any of these becomes true:

- approved Plan binding changes;
- routed governance identity changes materially;
- main/base drift invalidates the approved source binding;
- actual candidate path is not one of the four authorized paths;
- required RED is not observed before verifier implementation;
- verifier design needs free-form intent interpretation;
- any required negative control cannot distinguish its exact failure code;
- projected or actual reviewable implementation diff exceeds 500 lines;
- existing application verification regresses;
- new evidence requires scope expansion, governance mutation, REDUCE, or REDESIGN.

## 18. Contract-to-Implement admission

The Contract is complete when every section above is present and the exact path set is frozen.

Before the first INC-1 code/test/schema/build/workflow/harness mutation, the Implement stage must re-read:

1. `AGENTS.md`;
2. root `CONTEXT.md`;
3. `stages/04_implement/CONTEXT.md`;
4. `references/engineering/engineering-rules.md`;
5. `references/architecture/CONTEXT.md`;
6. this implementation contract.

It must then evaluate all twelve `G_PC_*` predicates and explicitly state the result.

No code/test mutation is authorized unless `G_PRE_CODE_READY = TRUE`.

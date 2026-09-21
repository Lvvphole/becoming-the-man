# Implementation Contract - Deterministic ICM Governance Routing

Status: CONTRACT_READY
Lifecycle stage: 03_contract
Target implementation stage: 04_implement
Migration scope: Zero-Trust Repository Harness v1.2 / INC-2 execution boundary only

## 1. Frozen authoring binding

This contract is subordinate to root `AGENTS.md`, root `CONTEXT.md`, `stages/03_contract/CONTEXT.md`, and the routed Layer 3 references.

Approved INC-2 Plan:
- path: `stages/02_plan/output/implementation-plan.md`
- disposition: `PLAN_READY`
- SHA-256: `ea5e43744d9825e03adba9917566c8ac017ed40dc5d468b2dad3530dae10e27e`
- Git blob: `d3e203120d4231c72d524e6a1cd8a6f3f173abeb`
- approval: explicit user approval after the final bounded Plan correction
- approved Plan head: `4b51a8a84b50ed64ce9a0a59742ef4f3354004f2`
- planning base: `93a2edc3f8729f30f6772ce8a8df7a955c5c2fff`
- planning PR: `53`

The one-time Stage 02 bootstrap exception applied only to creating the INC-2 Plan before a PR number existed. It grants no Stage 03 or Stage 04 exception.

Stage 03 authoring state:
- repository: `Lvvphole/becoming-the-man`
- authoring branch: `harness-v1-2-inc2-plan`
- pre-contract head: `4b51a8a84b50ed64ce9a0a59742ef4f3354004f2`
- permitted mutation: `stages/03_contract/output/implementation-contract.md` only
- selected evidence IDs: empty

Routed Layer 3 inputs:
- `references/engineering/engineering-rules.md`, full document
- `references/architecture/CONTEXT.md`, full document

The literal selector `"*"` means full-document access only for a source whose route declares full-section access. It is not a path wildcard and must never be interpreted as file discovery.

Sections 2 through 12 below preserve the active C1-C7 governance baseline from the pre-contract head unchanged. Section 13 replaces the completed INC-1 migration-specific contract with exactly one INC-2 execution-boundary contract.

This contract defines the active C1 through C7 baseline plus exactly one migration-specific INC-2 contract. It does not authorize implementation by itself. Stage 04 must rebind to the post-contract PR head, read the Stage 04 contract and routed authorities, and satisfy `G_PRE_CODE_READY` before any protected mutation.

## 2. Global invariants

The following invariants apply to every contract in this document.

1. Root `AGENTS.md` is the single repository execution constitution.
2. Root `CONTEXT.md` is the single task/stage router.
3. The route evaluator must consume caller-supplied or validated-prior-stage selectors. It must not derive selectors from free-form prose.
4. Every executable task resolves to exactly one route. Zero matches and multiple matches are terminal `BLOCKED` states.
5. Evidence is Layer 4 proof only. Evidence cannot create a requirement, permission, waiver, transition authority, or merge authority.
6. Missing required data fails closed. No default may expand scope or select a route.
7. All repository paths are exact, repository-relative paths. Absolute paths, parent traversal, and wildcard path discovery are forbidden.
8. Stage mutations are confined to the exact authorized candidate path set.
9. Current-state evidence must be cryptographically or mechanically bound to the state it claims to prove.
10. The active reviewable implementation ceiling is 500 lines unless the exact owner-authorized exception defined by `AGENTS.md` is valid.
11. Merge is never automatic.
12. No self-report by an implementation agent is acceptance evidence.

## 3. C1 - Route-Table Contract

### 3.1 Canonical location and authority

The canonical route table exists only inside root `CONTEXT.md`. Any machine-readable derivative is subordinate and must be reproducibly derived from that canonical table.

There must be exactly one route matrix. A second route matrix is `ROUTING_TABLE_INVALID`.

Every route row represents one complete, deterministic route. Cross-domain work is represented by one route row whose selector contains the exact complete task-domain set. The evaluator must not create a route by dynamically adding or dropping domains.

### 3.2 Required matrix columns

Every route row contains exactly these columns:

| Column | Type | Contract |
|---|---|---|
| `route_id` | string | Stable unique route identity. |
| `selectors` | object | Exact task-envelope selector values used for route matching. |
| `predicate` | object | Closed predicate declaration; no executable expression or prose interpretation. |
| `required_layer3_bundle` | array[string] | Exact Layer 3 source IDs required by this route. |
| `allowed_evidence_ids` | array[string] | Exact evidence IDs allowed by the route. Empty means no evidence may be loaded. |
| `target_stage` | string | Exactly one lifecycle stage ID. |
| `transition` | object | Exact predecessor/successor and required transition facts. |

The route matrix must reject duplicate `route_id` values.

### 3.3 Route-table JSON Schema

The canonical matrix payload must conform to this Draft 2020-12 schema.

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "urn:btmsct:governance:route-table:v1",
  "title": "BTMSCT Governance Route Table",
  "type": "object",
  "additionalProperties": false,
  "required": ["version", "routes", "source_registry"],
  "properties": {
    "version": {
      "const": "1.0.0"
    },
    "routes": {
      "type": "array",
      "minItems": 1,
      "items": {
        "$ref": "#/$defs/route"
      }
    },
    "source_registry": {
      "type": "object",
      "minProperties": 1,
      "propertyNames": {
        "pattern": "^[a-z][a-z0-9_]*$"
      },
      "additionalProperties": {
        "$ref": "#/$defs/source"
      }
    }
  },
  "$defs": {
    "stageId": {
      "enum": [
        "01_scout",
        "02_plan",
        "03_contract",
        "04_implement",
        "05_verify",
        "06_review",
        "07_release"
      ]
    },
    "identifier": {
      "type": "string",
      "pattern": "^[a-z][a-z0-9_.:-]*$"
    },
    "factIdentifier": {
      "type": "string",
      "pattern": "^[A-Za-z][A-Za-z0-9_.:-]*$"
    },
    "route": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "route_id",
        "selectors",
        "predicate",
        "required_layer3_bundle",
        "allowed_evidence_ids",
        "target_stage",
        "transition"
      ],
      "properties": {
        "route_id": {
          "type": "string",
          "pattern": "^route:[a-z0-9_.:-]+$"
        },
        "selectors": {
          "type": "object",
          "additionalProperties": false,
          "required": ["workflow_stage", "task_domains"],
          "properties": {
            "workflow_stage": {
              "$ref": "#/$defs/stageId"
            },
            "task_domains": {
              "type": "array",
              "minItems": 1,
              "uniqueItems": true,
              "items": {
                "$ref": "#/$defs/identifier"
              }
            }
          }
        },
        "predicate": {
          "type": "object",
          "additionalProperties": false,
          "required": [
            "operator",
            "required_envelope_fields",
            "required_approval_facts"
          ],
          "properties": {
            "operator": {
              "const": "ALL_EXACT"
            },
            "required_envelope_fields": {
              "type": "array",
              "uniqueItems": true,
              "items": {
                "$ref": "#/$defs/identifier"
              }
            },
            "required_approval_facts": {
              "type": "array",
              "uniqueItems": true,
              "items": {
                "$ref": "#/$defs/identifier"
              }
            }
          }
        },
        "required_layer3_bundle": {
          "type": "array",
          "uniqueItems": true,
          "items": {
            "$ref": "#/$defs/identifier"
          }
        },
        "allowed_evidence_ids": {
          "type": "array",
          "uniqueItems": true,
          "items": {
            "$ref": "#/$defs/identifier"
          }
        },
        "target_stage": {
          "$ref": "#/$defs/stageId"
        },
        "transition": {
          "type": "object",
          "additionalProperties": false,
          "required": [
            "from_stage",
            "to_stage",
            "required_facts",
            "automatic"
          ],
          "properties": {
            "from_stage": {
              "oneOf": [
                {
                  "$ref": "#/$defs/stageId"
                },
                {
                  "type": "null"
                }
              ]
            },
            "to_stage": {
              "oneOf": [
                {
                  "$ref": "#/$defs/stageId"
                },
                {
                  "type": "null"
                }
              ]
            },
            "required_facts": {
              "type": "array",
              "uniqueItems": true,
              "items": {
                "$ref": "#/$defs/factIdentifier"
              }
            },
            "automatic": {
              "type": "boolean"
            }
          }
        }
      }
    },
    "source": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "kind",
        "location",
        "path",
        "section_policy"
      ],
      "properties": {
        "kind": {
          "const": "layer3"
        },
        "location": {
          "enum": [
            "repository",
            "task_context"
          ]
        },
        "path": {
          "oneOf": [
            {
              "type": "string",
              "minLength": 1
            },
            {
              "type": "null"
            }
          ]
        },
        "section_policy": {
          "enum": [
            "full",
            "explicit_selector_required"
          ]
        }
      }
    }
  }
}
```

### 3.3.1 Redesign Path A - transition fact grammar

C1 transition fact tokens use this dedicated grammar:

```text
^[A-Za-z][A-Za-z0-9_.:-]*$
```

This grammar applies only to `transition.required_facts`. The lowercase-only generic C1 `identifier` grammar remains unchanged for task domains, source IDs, evidence IDs, envelope-field IDs, and approval-fact IDs.

Mechanical gate identifiers are valid canonical transition fact tokens. For example:

```text
G_PRE_CODE_READY
```

is valid under `factIdentifier` and may appear in root `CONTEXT.md` transition `required_facts`.

The amendment changes token syntax only. It does not change route selection, transition truth conditions, automatic-transition semantics, or the authority of root `CONTEXT.md`.

### 3.4 Closed route predicate

For envelope `E` and route row `r`, the only permitted route predicate is:

```text
MATCH(E,r) :=
  E.workflow_stage = r.selectors.workflow_stage
  AND set(E.task_domains) = set(r.selectors.task_domains)
  AND every(r.predicate.required_envelope_fields is present and non-null in E)
  AND every(r.predicate.required_approval_facts is strictly true in E.approvals)
  AND every(r.required_layer3_bundle source resolves exactly once)
  AND every(E.selected_evidence_ids is a member of r.allowed_evidence_ids)
```

No free-form expression, model score, semantic similarity, inferred intent, fallback route, or "closest route" is permitted.

```text
M(E) = { r | MATCH(E,r) = TRUE }
G_ROUTE_UNIQUE(E) := |M(E)| = 1
```

If `|M(E)| = 0`, return `ROUTE_ZERO_MATCH`.
If `|M(E)| > 1`, return `ROUTE_MULTI_MATCH`.

The successful route object must expose exactly one `route_id`, one `target_stage`, one resolved Layer 3 bundle, one allowed evidence-ID set, and one transition contract.

## 4. C2 - Task-Envelope Contract

### 4.1 Authority rule

The task envelope is supplied by the caller or copied without semantic alteration from a validated prior-stage output.

The executing agent may validate envelope data. It may not:
- invent a missing selector;
- infer a task domain;
- add or remove a task domain;
- infer a source section;
- broaden a path;
- add an evidence ID;
- convert an approval from false or absent to true;
- rewrite a source binding to make it current.

A missing required field returns `TASK_ENVELOPE_REQUIRED` or `MISSING_SELECTOR`, according to whether the envelope itself is absent/incomplete or a required route selector is absent.

### 4.2 Task-envelope Draft 2020-12 JSON Schema

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "urn:btmsct:governance:task-envelope:v1",
  "title": "BTMSCT Governance Task Envelope",
  "type": "object",
  "additionalProperties": false,
  "required": [
    "workflow_stage",
    "task_domains",
    "source_sections",
    "workpiece_paths",
    "selected_evidence_ids",
    "prior_outputs",
    "authorized_candidate_paths",
    "approvals",
    "source_binding"
  ],
  "properties": {
    "workflow_stage": {
      "$ref": "#/$defs/stageId"
    },
    "task_domains": {
      "type": "array",
      "minItems": 1,
      "uniqueItems": true,
      "items": {
        "$ref": "#/$defs/identifier"
      }
    },
    "source_sections": {
      "type": "object",
      "propertyNames": {
        "pattern": "^[a-z][a-z0-9_]*$"
      },
      "additionalProperties": {
        "type": "array",
        "minItems": 1,
        "uniqueItems": true,
        "items": {
          "type": "string",
          "minLength": 1
        }
      }
    },
    "workpiece_paths": {
      "type": "array",
      "uniqueItems": true,
      "items": {
        "$ref": "#/$defs/repoPath"
      }
    },
    "selected_evidence_ids": {
      "type": "array",
      "uniqueItems": true,
      "items": {
        "$ref": "#/$defs/identifier"
      }
    },
    "prior_outputs": {
      "type": "object",
      "propertyNames": {
        "pattern": "^[a-z][a-z0-9_]*$"
      },
      "patternProperties": {
        "^[a-z][a-z0-9_]*$": {
          "oneOf": [
            {
              "$ref": "#/$defs/artifactRef"
            },
            {
              "$ref": "#/$defs/blockedRef"
            }
          ]
        }
      },
      "additionalProperties": false
    },
    "authorized_candidate_paths": {
      "type": "array",
      "uniqueItems": true,
      "items": {
        "$ref": "#/$defs/repoPath"
      }
    },
    "approvals": {
      "type": "object",
      "propertyNames": {
        "pattern": "^[a-z][a-z0-9_]*$"
      },
      "patternProperties": {
        "^[a-z][a-z0-9_]*$": {
          "$ref": "#/$defs/approval"
        }
      },
      "additionalProperties": false
    },
    "source_binding": {
      "$ref": "#/$defs/routeBinding"
    }
  },
  "$defs": {
    "stageId": {
      "enum": [
        "01_scout",
        "02_plan",
        "03_contract",
        "04_implement",
        "05_verify",
        "06_review",
        "07_release"
      ]
    },
    "identifier": {
      "type": "string",
      "pattern": "^[a-z][a-z0-9_.:-]*$"
    },
    "repoPath": {
      "type": "string",
      "minLength": 1,
      "pattern": "^[A-Za-z0-9._/-]+$",
      "not": {
        "pattern": "(^|/)\\.\\.(/|$)"
      }
    },
    "sha1": {
      "type": "string",
      "pattern": "^[0-9a-f]{40}$"
    },
    "sha256": {
      "type": "string",
      "pattern": "^[0-9a-f]{64}$"
    },
    "artifactRef": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "path",
        "disposition",
        "sha256"
      ],
      "properties": {
        "path": {
          "$ref": "#/$defs/repoPath"
        },
        "disposition": {
          "type": "string",
          "minLength": 1
        },
        "sha256": {
          "$ref": "#/$defs/sha256"
        },
        "approval": {
          "type": "string",
          "minLength": 1
        }
      }
    },
    "blockedRef": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "gate_id",
        "reason_code"
      ],
      "properties": {
        "gate_id": {
          "type": "string",
          "pattern": "^G_[A-Z0-9_]+$"
        },
        "reason_code": {
          "type": "string",
          "pattern": "^[A-Z][A-Z0-9_]*$"
        }
      }
    },
    "approval": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "granted",
        "authorization"
      ],
      "properties": {
        "granted": {
          "type": "boolean"
        },
        "authorization": {
          "type": "string",
          "minLength": 1
        },
        "artifact": {
          "$ref": "#/$defs/repoPath"
        },
        "artifact_sha256": {
          "$ref": "#/$defs/sha256"
        }
      }
    },
    "routeBinding": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "pr",
        "base",
        "current_head"
      ],
      "properties": {
        "pr": {
          "type": "integer",
          "minimum": 1
        },
        "base": {
          "$ref": "#/$defs/sha1"
        },
        "current_head": {
          "$ref": "#/$defs/sha1"
        }
      }
    }
  }
}
```

### 4.3 Task-envelope semantic gates

The schema is necessary but not sufficient. The evaluator must also enforce:

1. `workflow_stage` matches exactly one route row.
2. `task_domains` is compared as an exact set against the route selector.
3. Every repository path is relative, contains no parent traversal, and contains no wildcard characters.
4. `workpiece_paths` grants read/workpiece access only; it does not grant mutation authority.
5. A mutation is legal only when its path is in `authorized_candidate_paths` and the active stage permits that mutation class.
6. A source with `section_policy = "full"` may use exactly `["*"]` as a full-document selector.
7. The literal `"*"` is forbidden as a repository path and forbidden for `explicit_selector_required` sources.
8. Every selected evidence ID must be explicitly allowed by the selected route and resolvable through C5.
9. Every transition approval fact must be strictly `true`; truthy strings are invalid.
10. Source binding mismatch returns `SOURCE_BINDING_STALE`.

## 5. C3 - Stage-Contract Shape

### 5.1 Canonical Markdown interface

Every stage file `stages/NN_name/CONTEXT.md` must use this interface:

1. H1 title identifying the stage number and name.
2. First fenced `yaml` block containing the complete machine-readable stage header.
3. `## Inputs`
4. `## Allowed Layer 3 References`
5. `## Allowed Layer 4 Evidence and Working Inputs`
6. `## Permitted Mutations`
7. `## Forbidden Mutations`
8. `## Verifier`
9. `## Transition`
10. `## BLOCKED Conditions`

The first fenced YAML block is the only machine-readable stage header. No second stage header may exist.

### 5.2 Required stage-header keys

The stage header contains exactly these keys:

```text
stage_id
job
required_inputs
allowed_layer3
allowed_layer4
permitted_mutations
forbidden_mutations
required_verifier
success_disposition
blocked_disposition
primary_output
next_stage
human_gate
```

No duplicate top-level key is permitted.

### 5.3 Stage-header value rules

- `stage_id` must equal the stage directory identity.
- `required_inputs`, `allowed_layer3`, `allowed_layer4`, `permitted_mutations`, and `forbidden_mutations` are explicit arrays.
- A path entry must be exact or be a named route field whose value is itself an exact allowlist. File-discovery globs are forbidden.
- `required_verifier` is a stable verifier ID, never prose such as "appropriate tests".
- `primary_output` is one exact repository-relative path.
- `next_stage` is one stage ID or `none`.
- `human_gate` is an explicit fact name or `none`.
- `blocked_disposition` is exactly `BLOCKED`.
- A stage contract cannot grant merge authority.

### 5.4 Frozen lifecycle interface

| Stage | Primary output | Next stage | Mandatory transition rule |
|---|---|---|---|
| `01_scout` | `stages/01_scout/output/scout-report.md` | `02_plan` | Automatic only when Scout handoff is valid and the original request pre-authorized Plan. |
| `02_plan` | `stages/02_plan/output/implementation-plan.md` | `03_contract` | Requires `PLAN_READY`, exact plan binding, and explicit user approval. |
| `03_contract` | `stages/03_contract/output/implementation-contract.md` | `04_implement` | Requires contract completeness, current approved Plan binding, and `G_PRE_CODE_READY` before the first implementation mutation. |
| `04_implement` | `stages/04_implement/output/candidate-manifest.md` | `05_verify` | Requires candidate manifest validity, changed-path confinement, and clear stop condition. |
| `05_verify` | `stages/05_verify/output/verification-record.md` | `06_review` | Requires verification disposition `PASS`, complete verifier set, and exact-state binding. |
| `06_review` | `stages/06_review/output/review-record.md` | `07_release` | Requires exact-head CI PASS, zero unresolved actionable findings, and review-cycle limit not exceeded. |
| `07_release` | `stages/07_release/output/release-record.md` | `none` | Creates release eligibility only. Merge requires a separate explicit user instruction. |

### 5.5 Universal BLOCKED conditions

Every stage returns a C4-conformant BLOCKED record when any of these is true:

- required input missing;
- route non-unique;
- source missing or stale;
- unlisted input loaded;
- unauthorized mutation requested;
- stage mutation class mismatches the active stage;
- evidence is promoted to authority;
- transition precondition false;
- source binding stale;
- required verifier undefined;
- stage contract malformed;
- scope expansion required.

A stage must stop after emitting BLOCKED. It may not fix forward in the same stage unless a higher authority explicitly provides a new valid envelope or authorization.

## 6. C4 - BLOCKED JSON Schema

Every terminal governance failure record must conform to this Draft 2020-12 schema.

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "urn:btmsct:governance:blocked-record:v1",
  "title": "BTMSCT Governance BLOCKED Record",
  "type": "object",
  "additionalProperties": false,
  "required": [
    "status",
    "reason_code",
    "gate_id",
    "stage_id",
    "route_candidates",
    "missing_inputs",
    "conflicts",
    "source_binding",
    "resolution_required"
  ],
  "properties": {
    "status": {
      "const": "BLOCKED"
    },
    "reason_code": {
      "enum": [
        "ROUTING_TABLE_INVALID",
        "ROUTE_ZERO_MATCH",
        "ROUTE_MULTI_MATCH",
        "TASK_ENVELOPE_REQUIRED",
        "STAGE_MUTATION_MISMATCH",
        "MISSING_SELECTOR",
        "MISSING_SOURCE",
        "SOURCE_BINDING_STALE",
        "WILDCARD_INPUT",
        "EVIDENCE_INDEX_MISSING",
        "EVIDENCE_ID_UNKNOWN",
        "EVIDENCE_BINDING_STALE",
        "EVIDENCE_AUTHORITY_FORBIDDEN",
        "UNLISTED_INPUT",
        "TRANSITION_PRECONDITION_FALSE",
        "REVIEW_CYCLE_EXCEEDED",
        "CHANGE_SIZE_DRIFT",
        "STAGE_CONTRACT_INVALID",
        "CONTRACT_INCOMPLETE",
        "CONTRACT_SCOPE_EXPANSION",
        "VERIFIER_UNDEFINED"
      ]
    },
    "gate_id": {
      "type": "string",
      "pattern": "^G_[A-Z0-9_]+$"
    },
    "stage_id": {
      "enum": [
        "UNKNOWN",
        "01_scout",
        "02_plan",
        "03_contract",
        "04_implement",
        "05_verify",
        "06_review",
        "07_release"
      ]
    },
    "route_candidates": {
      "type": "array",
      "uniqueItems": true,
      "items": {
        "type": "string",
        "pattern": "^route:[a-z0-9_.:-]+$"
      }
    },
    "missing_inputs": {
      "type": "array",
      "uniqueItems": true,
      "items": {
        "type": "string",
        "minLength": 1
      }
    },
    "conflicts": {
      "type": "array",
      "uniqueItems": true,
      "items": {
        "type": "string",
        "minLength": 1
      }
    },
    "source_binding": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "pr",
        "base",
        "current_head"
      ],
      "properties": {
        "pr": {
          "type": "integer",
          "minimum": 1
        },
        "base": {
          "type": "string",
          "pattern": "^[0-9a-f]{40}$"
        },
        "current_head": {
          "type": "string",
          "pattern": "^[0-9a-f]{40}$"
        }
      }
    },
    "resolution_required": {
      "type": "array",
      "minItems": 1,
      "uniqueItems": true,
      "items": {
        "type": "string",
        "minLength": 1
      }
    }
  }
}
```

C4 semantic rules:

1. A BLOCKED record is terminal for the current envelope.
2. `route_candidates` contains every mechanically matching route ID and no inferred candidate.
3. `missing_inputs` contains field names only when they are actually absent or invalid.
4. `conflicts` states observed conflicts; it cannot prescribe a silent resolution.
5. `resolution_required` states what external fact, artifact, authorization, or redesign is needed to re-enter.
6. A warning or exception must never be represented as a successful route when a required gate is false.

## 7. C5 - Evidence-Index Contract

### 7.1 Authority boundary

The canonical evidence index path is `docs/evidence/index.json`.

The index is a Layer 4 lookup manifest only. The file and every entry are non-authoritative.

An evidence entry can prove or falsify a current-state claim. It cannot define:
- requirements;
- product behavior;
- permissions;
- waivers;
- route choice;
- transition authority;
- merge authority.

### 7.2 Evidence-index Draft 2020-12 JSON Schema

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "urn:btmsct:governance:evidence-index:v1",
  "title": "BTMSCT Evidence Index",
  "type": "object",
  "additionalProperties": false,
  "required": [
    "version",
    "normative",
    "entries"
  ],
  "properties": {
    "version": {
      "const": "1.0.0"
    },
    "normative": {
      "const": false
    },
    "entries": {
      "type": "array",
      "items": {
        "$ref": "#/$defs/evidence"
      }
    }
  },
  "$defs": {
    "stageId": {
      "enum": [
        "01_scout",
        "02_plan",
        "03_contract",
        "04_implement",
        "05_verify",
        "06_review",
        "07_release"
      ]
    },
    "identifier": {
      "type": "string",
      "pattern": "^[a-z][a-z0-9_.:-]*$"
    },
    "repoPath": {
      "type": "string",
      "minLength": 1,
      "pattern": "^[A-Za-z0-9._/-]+$",
      "not": {
        "pattern": "(^|/)\\.\\.(/|$)"
      }
    },
    "evidence": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "id",
        "path",
        "kind",
        "authoritative",
        "role",
        "applicable_stages",
        "task_domains",
        "freshness",
        "binding"
      ],
      "properties": {
        "id": {
          "$ref": "#/$defs/identifier"
        },
        "path": {
          "$ref": "#/$defs/repoPath"
        },
        "kind": {
          "enum": [
            "proof",
            "raw_log",
            "verification_record",
            "review_record",
            "release_record",
            "historical_proof"
          ]
        },
        "authoritative": {
          "const": false
        },
        "role": {
          "const": "proof"
        },
        "applicable_stages": {
          "type": "array",
          "uniqueItems": true,
          "items": {
            "$ref": "#/$defs/stageId"
          }
        },
        "task_domains": {
          "type": "array",
          "uniqueItems": true,
          "items": {
            "$ref": "#/$defs/identifier"
          }
        },
        "freshness": {
          "enum": [
            "current",
            "historical"
          ]
        },
        "binding": {
          "$ref": "#/$defs/binding"
        }
      }
    },
    "binding": {
      "oneOf": [
        {
          "type": "object",
          "additionalProperties": false,
          "required": [
            "type",
            "value"
          ],
          "properties": {
            "type": {
              "enum": [
                "commit_sha",
                "pr_head_sha"
              ]
            },
            "value": {
              "type": "string",
              "pattern": "^[0-9a-f]{40}$"
            }
          }
        },
        {
          "type": "object",
          "additionalProperties": false,
          "required": [
            "type",
            "value"
          ],
          "properties": {
            "type": {
              "const": "artifact_sha256"
            },
            "value": {
              "type": "string",
              "pattern": "^[0-9a-f]{64}$"
            }
          }
        },
        {
          "type": "object",
          "additionalProperties": false,
          "required": [
            "type",
            "value"
          ],
          "properties": {
            "type": {
              "const": "run_id"
            },
            "value": {
              "type": "string",
              "pattern": "^[0-9]+$"
            }
          }
        },
        {
          "type": "object",
          "additionalProperties": false,
          "required": [
            "type",
            "value"
          ],
          "properties": {
            "type": {
              "const": "schema_version"
            },
            "value": {
              "type": "string",
              "minLength": 1
            }
          }
        }
      ]
    }
  }
}
```

### 7.3 Evidence-index semantic gates

1. Evidence IDs are globally unique.
2. Evidence paths are globally unique unless two IDs intentionally bind different immutable records at the same path; absent explicit contract authorization, duplicate paths are `EVIDENCE_INDEX_MISSING`/index invalidity.
3. `freshness = "current"` is valid only when the binding equals the state required by the active stage.
4. `freshness = "historical"` can be inspected only when explicitly routed and can never satisfy a current-state gate.
5. If a selected evidence ID is absent, return `EVIDENCE_ID_UNKNOWN`.
6. If its binding does not match the required current state, return `EVIDENCE_BINDING_STALE`.
7. If evidence is used as requirement, permission, waiver, or transition authority, return `EVIDENCE_AUTHORITY_FORBIDDEN`.
8. The index may select evidence. It may never select authority.

## 8. C6 - Architecture-Manifest Contract

### 8.1 Canonical location

The architecture router/manifest is `references/architecture/CONTEXT.md`.

It is subordinate to `AGENTS.md` and root `CONTEXT.md`. It is the only active architecture-source manifest.

No agent may discover a newer amendment by listing `docs/`, comparing timestamps, or inferring version order from filenames.

### 8.2 Frozen source order and supersession

The active architecture source order is exactly:

1. `docs/Website_System_Architecture_v1.0_LOCKED.md`
2. `docs/SYSTEM_ARCHITECTURE_AMENDMENT_v1.1.md`
3. `docs/SYSTEM_ARCHITECTURE_AMENDMENT_v1.2.md`

Supersession rules are exactly:

- v1.1 amends v1.0 only within Website System Architecture Section 18 and repository implementation controls.
- Outside that boundary, v1.0 remains the active architecture source.
- v1.2 amends v1.1 only for A18-03, A18-04, and A18-05 through A18-03A, A18-04A, and A18-05A.
- v1.1 A18-01 and A18-02 remain active.
- All v1.0 and v1.1 requirements not explicitly amended by v1.2 remain active.
- The active reviewable implementation limit is 500.
- Any conflict not resolved by these explicit supersession boundaries is BLOCKED.

### 8.3 Required machine-readable manifest block

When Stage 04 makes the architecture manifest mechanically verifiable, its canonical data block must conform to:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "urn:btmsct:governance:architecture-manifest:v1",
  "title": "BTMSCT Architecture Manifest",
  "type": "object",
  "additionalProperties": false,
  "required": [
    "version",
    "active_sources",
    "supersession",
    "active_reviewable_loc_limit"
  ],
  "properties": {
    "version": {
      "const": "1.0.0"
    },
    "active_sources": {
      "const": [
        "docs/Website_System_Architecture_v1.0_LOCKED.md",
        "docs/SYSTEM_ARCHITECTURE_AMENDMENT_v1.1.md",
        "docs/SYSTEM_ARCHITECTURE_AMENDMENT_v1.2.md"
      ]
    },
    "supersession": {
      "const": [
        {
          "from": "v1.0",
          "to": "v1.1",
          "scope": [
            "Website System Architecture Section 18",
            "repository implementation controls"
          ],
          "preserved": "all v1.0 requirements outside the declared scope"
        },
        {
          "from": "v1.1",
          "to": "v1.2",
          "scope": [
            "A18-03",
            "A18-04",
            "A18-05"
          ],
          "replacements": [
            "A18-03A",
            "A18-04A",
            "A18-05A"
          ],
          "preserved": [
            "A18-01",
            "A18-02",
            "all other v1.1 requirements not explicitly amended"
          ]
        }
      ]
    },
    "active_reviewable_loc_limit": {
      "const": 500
    }
  }
}
```

The manifest data is a deterministic representation of the routed architecture contract. It does not become a higher authority than the architecture sources or `AGENTS.md`.

## 9. C7 - Source-Binding Contract

### 9.1 Purpose

Source binding prevents stale governance, stale prior-stage artifacts, and stale verification state from being silently reused after repository mutation.

Git object identity and SHA-256 content identity are distinct identity classes. They must never be compared as if they were interchangeable.

### 9.2 Source-binding Draft 2020-12 JSON Schema

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "urn:btmsct:governance:source-binding:v1",
  "title": "BTMSCT Source Binding",
  "type": "object",
  "additionalProperties": false,
  "required": [
    "pr",
    "base",
    "current_head",
    "repository_sources",
    "prior_artifacts"
  ],
  "properties": {
    "pr": {
      "type": "integer",
      "minimum": 1
    },
    "base": {
      "$ref": "#/$defs/gitOid"
    },
    "current_head": {
      "$ref": "#/$defs/gitOid"
    },
    "repository_sources": {
      "type": "array",
      "uniqueItems": true,
      "items": {
        "$ref": "#/$defs/repositorySource"
      }
    },
    "prior_artifacts": {
      "type": "array",
      "uniqueItems": true,
      "items": {
        "$ref": "#/$defs/priorArtifact"
      }
    }
  },
  "$defs": {
    "repoPath": {
      "type": "string",
      "minLength": 1,
      "pattern": "^[A-Za-z0-9._/-]+$",
      "not": {
        "pattern": "(^|/)\\.\\.(/|$)"
      }
    },
    "gitOid": {
      "type": "string",
      "pattern": "^[0-9a-f]{40}$"
    },
    "sha256": {
      "type": "string",
      "pattern": "^[0-9a-f]{64}$"
    },
    "repositorySource": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "path",
        "commit",
        "git_blob_oid"
      ],
      "properties": {
        "path": {
          "$ref": "#/$defs/repoPath"
        },
        "commit": {
          "$ref": "#/$defs/gitOid"
        },
        "git_blob_oid": {
          "$ref": "#/$defs/gitOid"
        },
        "content_sha256": {
          "$ref": "#/$defs/sha256"
        }
      }
    },
    "priorArtifact": {
      "type": "object",
      "additionalProperties": false,
      "required": [
        "path",
        "sha256"
      ],
      "properties": {
        "path": {
          "$ref": "#/$defs/repoPath"
        },
        "sha256": {
          "$ref": "#/$defs/sha256"
        },
        "disposition": {
          "type": "string",
          "minLength": 1
        },
        "approval": {
          "type": "string",
          "minLength": 1
        }
      }
    }
  }
}
```

### 9.3 Validation rules

For every transition that requires source binding:

1. Verify `base` equals the intended merge-base authority binding.
2. Verify `current_head` equals the repository head being admitted to the next stage.
3. For each `repository_sources` entry, read the exact `path` at the declared `commit` and require the observed Git blob OID to equal `git_blob_oid`.
4. When `content_sha256` is present, hash the exact file bytes and require equality.
5. For each `prior_artifacts` entry, hash the exact artifact bytes and require equality with `sha256`.
6. A prior artifact disposition or approval is descriptive only unless the active transition contract explicitly requires that fact.
7. Any mismatch returns `SOURCE_BINDING_STALE`.
8. No agent may rewrite a stale binding to the observed value and continue. A new valid envelope or transition record is required.
9. The implementation contract does not embed its own content hash. The post-write Contract artifact identity must be captured externally after the file exists, avoiding self-hash circularity.

## 10. Cross-contract consistency requirements

C1 through C7 are valid only when all of these relations hold:

1. C1 route `target_stage` must equal C2 `workflow_stage` for the selected route.
2. C1 `required_layer3_bundle` source IDs must exist in the canonical source registry.
3. C1 `allowed_evidence_ids` is the upper bound for C2 `selected_evidence_ids`.
4. C2 workpiece paths grant inspection only; C3 stage mutations plus C2 `authorized_candidate_paths` jointly determine write authority.
5. Every C3 BLOCKED condition produces a C4-conformant record.
6. Every C5 evidence entry has `authoritative = false` and `role = "proof"`.
7. C6 architecture order is the architecture source order used by C1 routes that require the architecture bundle.
8. C7 binding must be current before a transition that declares source-currentness.
9. No C5 evidence field may satisfy C1/C3 authority or approval requirements.
10. No route or stage may grant automatic merge authority.

## 11. Stage 04 implementation boundary

This contract authorizes no Stage 04 mutation by itself.

A Stage 04 envelope must independently and explicitly declare:
- `workflow_stage = "04_implement"`;
- exactly one route ID under C1;
- exact task domains;
- exact workpiece paths;
- exact authorized candidate paths;
- exact prior-output binding to this contract artifact;
- exact source binding to the then-current PR head;
- all required approvals and transition facts.

Before its first code, test, schema, migration, build, workflow, or verifier mutation, Stage 04 must re-read:
1. root `AGENTS.md`;
2. root `CONTEXT.md`;
3. `stages/04_implement/CONTEXT.md`;
4. `references/engineering/engineering-rules.md`;
5. every Layer 3 source selected by the unique route;
6. this implementation contract.

It must then evaluate all `G_PC_*` predicates. If any predicate is false, it must emit C4 BLOCKED and stop.

## 12. Contract-completeness oracle

The Stage 03 `contract-completeness` verifier must establish all of the following without modifying repository state:

- sections C1 through C7 each exist exactly once;
- C1 defines the route matrix columns, closed route predicate, route uniqueness rule, and route-table schema;
- C2 defines the complete caller/prior-output envelope schema and prohibits model-inferred selectors;
- C3 defines the canonical Markdown stage interface, required machine header, seven lifecycle outputs, transitions, mutation boundaries, and BLOCKED conditions;
- C4 is a Draft 2020-12 schema containing all nine required BLOCKED fields with `additionalProperties = false`;
- C5 is a Draft 2020-12 schema with `normative = false`, per-entry `authoritative = false`, proof-only role, freshness, and state binding;
- C6 freezes source order `v1.0 -> v1.1 -> v1.2`, explicit supersession boundaries, and the active 500-line limit;
- C7 defines PR/base/head lineage, Git blob identity, optional content SHA-256 identity, prior-artifact SHA-256 identity, and stale-binding failure;
- all JSON examples use ASCII double-quote characters;
- no unresolved drafting marker, missing-content ellipsis, executable implementation, or file-discovery wildcard is present;
- the Stage 03 mutation commit changes only `stages/03_contract/output/implementation-contract.md`.

A failed condition returns C4 BLOCKED with `reason_code = "CONTRACT_INCOMPLETE"`, `"CONTRACT_SCOPE_EXPANSION"`, or the more specific applicable reason code.

## 13. Zero-Trust Repository Harness v1.2 - INC-2 Execution Boundary Contract

### 13.1 Objective and non-authority

INC-2 adds only the execution boundary needed after the merged INC-1 deterministic router:

```text
validated INC-1 task
        |
        v
external supervisor
        |
        v
hard capability mediation
        |
        v
bounded Eve adapter
        |
        v
disposable Docker sandbox
```

The external supervisor is trusted. The model, model-authored tool inputs, candidate files, candidate code, candidate tests, and sandbox are untrusted.

INC-2 does not create final PASS authority. It does not implement Jev, the INC-3 external mechanical verifier, authenticated provenance, memory, databases, provider integrations, multi-agent routing, product behavior, deployment, release, or merge.

Root `CONTEXT.md` remains active repository routing authority. INC-1 routing semantics are not modified by INC-2.

### 13.2 Exact Stage 04 mutation allowlist

The complete INC-2 candidate path set is exactly:

1. `harness/package.json`
2. `harness/package-lock.json`
3. `harness/src/capability.ts`
4. `harness/src/supervisor.ts`
5. `harness/src/eve-adapter.ts`
6. `harness/agent/agent.ts`
7. `harness/agent/tools/execute.ts`
8. `harness/tests/execution.test.ts`
9. `.github/workflows/pr-verification.yml`

The Plan-permitted `harness/agent/sandbox/sandbox.ts` path is intentionally removed from the implementation allowlist because INC-2 can use Eve's public `docker()` backend directly through the bounded adapter. Adding an authored second sandbox configuration would duplicate that control surface.

No tenth candidate path is authorized.

Forbidden INC-2 mutations include root `AGENTS.md`, root `CONTEXT.md`, `CLAUDE.md`, any stage `CONTEXT.md`, engineering rules, the architecture manifest, root package manifests, `harness/tsconfig.json`, INC-1 routing code/tests/fixture, product/application/database/provider files, product or architecture specifications, and Stage 05/06/07 records.

A required mutation outside this nine-path allowlist is `BLOCKED / CONTRACT_SCOPE_EXPANSION`.

### 13.3 Frozen framework, dependency, and runtime identities

INC-2 freezes these exact identities:

```text
eve package:
  version = 0.63.0
  upstream tag commit = d004e6d47e9d25d0380c24b5a47b65a18f8b2784

AI SDK package:
  name = ai
  version = 7.0.105

schema package:
  name = zod
  version = 4.5.4

sandbox OCI image:
  ghcr.io/vercel/eve@sha256:cb73db82b5f7668b4eac357c1bfa54525794f608bb3bf5db20799bfe6fc6565e

harness runtime:
  Node major = 24
```

The OCI digest is the immutable multi-platform index published by the successful Eve 0.63.0 release workflow. The physical INC-2 CI control runs on Linux/amd64 and must fail rather than silently substitute another image or architecture.

The only new harness runtime dependencies permitted are `eve@0.63.0`, `ai@7.0.105`, and `zod@4.5.4`. Existing TypeScript/Vitest dependencies remain pinned as already present.

No provider SDK, Jev package, database client, memory package, policy engine, container-orchestration framework, service mesh, FastAPI package, or second agent framework is authorized.

Any required dependency beyond this closed set is `BLOCKED / CONTRACT_SCOPE_EXPANSION`.

### 13.4 Bounded Eve adapter and compiled capability surface

Only `harness/src/eve-adapter.ts` may import from the `eve` package or its public subpaths.

The adapter may expose only the public Eve primitives required by INC-2:

- `defineAgent`;
- `defineTool`;
- `docker`;
- `Client` from `eve/client`;
- the minimum public session and sandbox types needed by the supervisor boundary.

Imports from Eve internal source paths are forbidden.

The authored root agent must set:

```text
defaultTools = false
tool = false
model = "openai/gpt-5.6-luna-fast"
```

The model value is compile-time configuration only for INC-2 verification. CI must not make a model/provider call and must not require model credentials.

INC-2 authors no connections, subagents, skills, schedules, hooks, custom channels, or memory.

The complete model-visible static tool surface must be exactly:

```text
["execute"]
```

The mechanical closure oracle is `eve info --json` against the harness package. Its reported `tools` array must equal exactly `["execute"]`. A second static tool, dynamic tool, connection-derived tool, agent-delegation tool, or optional default tool is EC-02 failure.

### 13.5 CapabilityPolicy and session-bound authority envelope

The external supervisor compiles one immutable policy and closed grant catalog before the Eve turn begins.

Normative policy shape:

```text
CapabilityPolicy := {
  task_identity: non-empty supervisor-owned string,
  allowed_tools: exactly ["execute"],
  allowed_argv: unique array of non-empty exact argv token vectors,
  allowed_cwds: unique array of canonical absolute sandbox paths,
  read_roots: unique array of canonical absolute sandbox paths,
  write_roots: unique array of canonical absolute sandbox paths,
  subprocess: "deny" | "exact",
  network: exactly "deny",
  secret_names: exactly [],
  git: exactly "deny"
}
```

The supervisor then uses Eve's public client surface to create a fresh Eve session before the first model turn and obtains that exact durable `session_id`.

The authority transport is one signed, session-bound envelope:

```text
CapabilityEnvelope := {
  version: 1,
  session_id: exact Eve session id,
  policy: CapabilityPolicy,
  grants: unique closed CapabilityGrant array
}

CapabilityAuthorization :=
  base64url(exact UTF-8 JSON envelope bytes)
  + "."
  + base64url(Ed25519 signature over the first segment's UTF-8 bytes)
```

The private Ed25519 signing key exists only in the external supervisor process. It is never committed, passed to Eve, exposed to the model, or copied into the candidate sandbox.

The trusted Eve runtime receives only the corresponding public verifier key through supervisor-owned runtime configuration. The candidate sandbox receives neither private nor public supervisor key material.

This signature is a runtime capability-authenticity mechanism only. It is not INC-3 provenance, release attestation, artifact signing, or final PASS authority.

Authority-bearing policy and grant values come only from the already-admitted compact task plus supervisor-owned execution constraints. They never come from model output, the free-form task goal, candidate files, candidate tests, or sandbox state.

No process-global authorization map, database, memory layer, external policy service, or mutable cross-process session registry is permitted.

For INC-2:

```text
EffectiveCapabilities subset_of signed CapabilityEnvelope
SandboxReachability subset_of signed CapabilityEnvelope
```

The envelope is immutable after signing. No tool call may add a path, argv vector, cwd, tool, secret, network permission, Git permission, or subprocess permission.

### 13.6 Model-visible execute-tool contract

`harness/agent/tools/execute.ts` is the sole model-visible authored tool.

The model-visible request is:

```text
ExecuteInput := {
  capability_id: non-empty string,
  authorization: non-empty session-bound CapabilityAuthorization,
  content?: string
}
```

The supervisor may make the signed authorization available to the model as opaque bearer capability data for that exact Eve session. Possession permits only selection among grants already authenticated inside that envelope; the model cannot mint or broaden authority.

The supervisor compiles a closed catalog before model use:

```text
CapabilityGrant :=
  ReadText  { id, exact_path }
  WriteText { id, exact_path }
  Run       { id, exact_argv, exact_cwd }
```

A write grant may accept model-authored `content`; content is data, not authority. Read and run grants reject `content`.

The authored tool must:

1. read the active Eve identity from `ctx.session.id`;
2. verify the Ed25519 signature using only the configured supervisor public key;
3. require `envelope.version == 1`;
4. require `envelope.session_id == ctx.session.id`;
5. validate the envelope's closed policy/grant shape;
6. resolve only `input.capability_id` from the verified envelope;
7. obtain the active Eve-owned sandbox with `ctx.getSandbox()`;
8. invoke the hard request gate before any privileged sandbox effect.

An invalid signature, wrong session, malformed envelope, unknown capability ID, malformed input, or grant/payload mismatch returns:

```text
DENY / CAPABILITY_NOT_GRANTED
```

No unverified envelope field may influence a filesystem or process effect.

`CAPABILITY_NOT_GRANTED` remains an INC-2-local execution diagnostic. It is not added to C4 `reason_code`. When a required INC-2 verifier predicate is false at the repository-governance boundary, Stage 04 emits C4 `TRANSITION_PRECONDITION_FALSE` and records the exact EC identifier and local diagnostic in `conflicts`.

### 13.7 Hard request gate

For a signature-verified envelope `e`, resolved grant `g`, and request `r`:

```text
G_REQUEST_ALLOWED(r, e, g) :=
  envelope_verified(e)
  AND session_bound(e, current_eve_session)
  AND tool_allowed(e.policy, r)
  AND grant_exists(e.grants, r.capability_id)
  AND grant_payload_matches(r, g)
  AND cwd_allowed(e.policy, g)
  AND filesystem_effects_allowed(e.policy, g)
  AND subprocess_effects_allowed(e.policy, g)
  AND network_effects_allowed(e.policy)
  AND secret_effects_allowed(e.policy)
  AND git_effects_allowed(e.policy, g)
```

Required semantics:

- `tool_allowed` is true only for `execute`;
- read/write operate only on the grant's exact path after canonical containment succeeds;
- run operates only on the grant's exact argv vector and exact canonical cwd;
- `subprocess = "deny"` forbids all run grants;
- `subprocess = "exact"` permits only one-shot `sandbox.run` for a matching run grant;
- `sandbox.spawn` is never exposed by INC-2;
- `network = "deny"` cannot be weakened by a grant;
- `secret_names = []` means no secret-bearing capability exists;
- `git = "deny"` overrides an otherwise exact allowed Git argv grant;
- any false predicate returns `DENY / CAPABILITY_NOT_GRANTED` before the requested effect.

No permissive fallback exists.

### 13.8 Canonical filesystem mediation

Model-visible paths are never executed directly.

For every read/write grant, the supervisor freezes an exact repository-relative candidate path and maps it under `/workspace`.

Before the requested file effect:

1. reject an empty path, absolute path, NUL, wildcard syntax, backslash, or any `..` segment;
2. anchor the path at `/workspace`;
3. resolve the canonical target inside the sandbox using a fixed non-model-visible `realpath` probe;
4. for reads, require existing-target canonicalization;
5. for writes, canonicalize the target including a non-existing leaf while resolving all existing symlink components;
6. require the canonical target to equal an authorized canonical root or be its descendant by path segment;
7. only then perform the requested read or write.

The fixed canonicalization probe is an internal mediation operation. It is not a model-visible command grant and cannot mutate candidate state.

String-prefix containment without canonicalization is forbidden.

A symlink resolving outside an authorized root is `DENY / CAPABILITY_NOT_GRANTED`.

### 13.9 Exact argv and cwd execution

A run grant contains one exact argv token vector and one exact canonical cwd.

Authorization requires byte-for-byte argv equality with the signed envelope policy and grant.

Immediately before an authorized run effect, the tool must resolve the grant's cwd inside the active sandbox with a fixed non-model-visible:

```text
realpath -- <quoted exact cwd>
```

The run is permitted only when:

```text
realpath(exact_cwd) == exact_cwd
```

Any missing cwd, symlinked cwd, or canonical mismatch is `DENY / CAPABILITY_NOT_GRANTED`.

Only after that equality check may the adapter serialize the frozen argv vector for Eve's public `sandbox.run({ command })` API using one fixed POSIX single-quote encoder.

The generated command has this form:

```text
cd -- <quoted canonical cwd> && exec <quoted argv[0]> <quoted argv[1]> ...
```

The model cannot supply or edit argv or cwd directly and cannot supply shell syntax.

If the first executable token resolves to `git`, the request is denied even when that exact Git argv and cwd are otherwise present in the signed allowed sets. EC-06 must exercise this ordering so removal of the Git-specific predicate makes the test fail.

An exact authorized subprocess may alter its disposable container. That container is the physical effect boundary. INC-2 does not claim syscall-level per-path mediation inside an already-authorized subprocess.

### 13.10 Eve session and disposable Docker lifecycle

The external supervisor owns logical run admission. Before the model turn, it creates a fresh Eve session through the public `Client.sessions.create()` surface, binds the signed envelope to that exact `session_id`, and never reuses that authorization in another session.

Eve owns the physical session sandbox handle. The adapter freezes the sandbox backend to:

```text
image =
  ghcr.io/vercel/eve@sha256:cb73db82b5f7668b4eac357c1bfa54525794f608bb3bf5db20799bfe6fc6565e

networkPolicy = "deny-all"
pullPolicy = "always"
env = {}
```

The authored tool reaches the sandbox only through the public `ctx.getSandbox()` accessor for the same Eve session whose ID is authenticated in the capability envelope.

No host repository path is mounted into the container. Initial candidate files may enter only through explicitly authorized supervisor-mediated write capabilities. Host `.git` metadata is never copied.

A supervisor run ends by retiring its Eve session; a later independent run must create a different Eve session and obtain a distinct sandbox identity. INC-2 must not rely on a process-global binding map whose cleanup can leak authority or containers.

Physical verification may create locked backend handles directly to prove delete/fresh-container behavior, but that test helper is not the production authority transport.

### 13.11 Network, secret, and Git isolation

Network denial is physical:

```text
docker networkPolicy = "deny-all"
```

A prompt instruction or model refusal is not evidence.

The external supervisor holds the Ed25519 private key outside Eve. The Eve runtime receives only the corresponding public verifier key. The candidate sandbox receives neither key and no GitHub, Git, Vercel, Supabase, provider, deployment, supervisor, or verifier secret.

A supervisor-only sentinel environment variable present in the host process must be absent from the candidate container.

Git authority is denied by all three controls:

1. `git = "deny"` in the signed `CapabilityPolicy`;
2. the Git-specific predicate rejects an otherwise exact allowed Git argv grant;
3. no host `.git` metadata or Git credential is copied into the sandbox.

Network, secret, Git, or signature verification cannot be weakened by model input.

### 13.12 Frozen INC-2 negative-control oracle

The Stage 04 candidate may implement these controls but may not redefine their required outcomes.

| ID | Exact defect | Required outcome |
|---|---|---|
| EC-01 | tampered authorization, wrong Eve session binding, or unknown grant | `DENY / CAPABILITY_NOT_GRANTED`; requested implementation not invoked |
| EC-02 | inspect compiled Eve surface with defaults disabled and no connections/subagents | exact model-visible tools = `["execute"]`; alternate default/built-in capability unreachable |
| EC-03 | direct traversal plus symlink from authorized workspace path to an outside target | `DENY / CAPABILITY_NOT_GRANTED`; outside target unchanged |
| EC-04 | unapproved argv, exact argv with a symlinked/wrong canonical cwd, and run while `subprocess = "deny"` | each `DENY / CAPABILITY_NOT_GRANTED`; requested process not executed |
| EC-05 | direct physical egress probe from the sandbox under locked backend | outbound request cannot complete under `deny-all` |
| EC-06 | sign a policy that otherwise exactly allows `["git","status"]` at the authorized cwd | `DENY / CAPABILITY_NOT_GRANTED` specifically because `git = "deny"`; no ref/remote mutation |
| EC-07 | host contains supervisor-private-key/secret sentinel; sandbox enumerates environment/workspace | private key, sentinel, and supervisor-only files unreachable |
| EC-08 | run A writes fixed sentinel, its physical sandbox is deleted, run B starts from the same frozen inputs under a new Eve session | run B has different session/sandbox identity and sentinel is absent |

EC-03, EC-05, EC-07, and EC-08 require a real Docker daemon and the frozen OCI image. A mocked sandbox cannot satisfy those controls.

Each negative control must fail for its intended predicate, not because an earlier unrelated fixture is malformed.

The P2 binding-cleanup defect class from review `4063718972` is removed structurally: INC-2 production code must contain no process-global session-binding map and no bind-after-container-create lifecycle.

### 13.13 Frozen positive controls

The candidate must also prove:

1. `eve info --json` exposes exactly one model-visible tool named `execute`;
2. an external-supervisor authorization signed for Eve session A verifies for A and not session B;
3. a known capability ID resolves to its exact grant only after signature/session verification;
4. an exact authorized non-Git run grant executes successfully;
5. an authorized non-symlink canonical cwd succeeds;
6. direct read inside `read_roots` succeeds;
7. direct write inside `write_roots` succeeds;
8. candidate output leaves the sandbox only as the structured tool result;
9. two independent runs receive distinct Eve session/sandbox identities;
10. all existing INC-1 routing tests remain unchanged and green.

A positive control cannot weaken a negative control.

### 13.14 Supervisor and adapter result boundary

The supervisor-facing result boundary remains:

```text
ReadResult  := { kind: "read", content: string }
WriteResult := { kind: "write", bytes_written: non-negative integer }
RunResult   := {
  kind: "run",
  exit_code: integer,
  stdout: string,
  stderr: string
}
DeniedResult := {
  kind: "deny",
  diagnostic: "CAPABILITY_NOT_GRANTED"
}
```

No result contains the sandbox handle, Docker daemon handle, private signing key, host filesystem path, policy mutation handle, host environment, credential, or mutable authority object.

The Eve adapter is replaceability glue only. It does not decide policy or mint capability authority.

### 13.15 Verification and CI contract

INC-2 verification has two classes.

Pure deterministic verification covers:

- policy construction and immutability;
- Ed25519 sign/verify round trip;
- signature tamper denial;
- wrong-session denial;
- closed capability catalog;
- unknown grant denial;
- exact argv matching;
- Git-specific denial after an otherwise exact Git allow;
- cwd matching;
- lexical path rejection;
- canonical containment decision;
- subprocess denial;
- malformed execute input.

Physical integration verification covers:

- exact Eve compiled tool surface;
- locked Docker backend/image;
- symlinked-cwd denial before process execution;
- file symlink escape denial;
- physical network denial;
- supervisor-private-key/secret isolation;
- cross-run state isolation;
- fresh physical sandbox identity.

The harness package scripts retain:

```text
typecheck -> tsc --noEmit
test      -> vitest run
```

The harness package additionally defines an exact agent-file TypeScript check because `harness/tsconfig.json` remains outside the authorized mutation set:

```text
typecheck:agent ->
  tsc --noEmit --target ES2023 --module ESNext --moduleResolution Bundler
      --strict --types node
      agent/agent.ts agent/tools/execute.ts
```

The Node 24 harness CI job remains:

```text
npm ci
npm ci --prefix harness
npx eslint   harness/src/routing.ts   harness/src/capability.ts   harness/src/supervisor.ts   harness/src/eve-adapter.ts   harness/agent/agent.ts   harness/agent/tools/execute.ts   harness/tests/routing.test.ts   harness/tests/execution.test.ts
npm --prefix harness run typecheck
npm --prefix harness run typecheck:agent
npm --prefix harness run test
```

`harness/tests/execution.test.ts` must invoke the locally installed Eve CLI with `info --json` and assert exact tool closure. It must run physical Docker controls without model/provider credentials. Physical controls must not be skipped when Docker is unavailable.

The existing `PR Verification` job remains fail-closed on `Harness Verification`. Its Node 22.16.0 product setup, name, and pre-existing product verification behavior remain unchanged.

No model call, provider call, deployment, or external application mutation is part of INC-2 CI.

### 13.16 One-candidate repair discipline

The review repair is limited to:

```text
RE-BIND
  -> FREEZE REVISED CONTRACT
  -> RE-ADMIT STAGE 04
  -> ONE BOUNDED REPAIR
  -> VERIFY
  -> STOP
```

Before the next protected mutation, Stage 04 must re-read current root authorities, Stage 04 `CONTEXT.md`, engineering rules, architecture manifest, the exact approved Plan, this revised contract, and current PR/base/head.

All `G_PC_*` predicates must be true.

After every mutation, Stage 04 re-evaluates changed-path confinement, exact current head, active stop condition, and reviewable-line count.

The five Codex cycle-1 findings have these frozen dispositions:

- `4063718938`: unsupported by commit history; evidence reply only, no code mutation;
- `4063718948`: valid P1; replace the disconnected process-local binding map with the signed session-bound authority path;
- `4063718959`: valid P1; canonicalize and equality-check run cwd immediately before process execution;
- `4063718972`: valid P2; remove the process-global binding lifecycle that creates the leak condition;
- `4063718980`: valid P2; make EC-06 otherwise-authorized so only the Git predicate can deny it.

No unrelated cleanup is authorized.

### 13.17 Reviewable-size boundary

```text
TARGET <= 400 reviewable implementation lines
INTERNAL_STOP = 420
ABSOLUTE_CURRENT_REPOSITORY_CEILING = 500
```

Dependency lockfiles remain excluded under `AGENTS.md`.

The review repair should reduce or replace existing machinery rather than stack new parallel authority machinery on top of it.

If the final implementation reaches or projects to 420 reviewable lines:

```text
STOP -> REDUCE OR REDESIGN
```

The already-recorded repository-owner size exception addresses the known nested-lockfile counting defect only; it does not waive this 420-line internal stop.

### 13.18 INC-2 verification obligations

Before INC-2 may advance beyond implementation:

1. final implementation paths are a subset of the exact nine-path allowlist;
2. root governance, product files, root package manifests, architecture sources, and INC-1 router files are unchanged;
3. exact dependency/runtime identities in Section 13.3 are present;
4. Eve imports occur only through `harness/src/eve-adapter.ts`;
5. model-visible tool closure is exactly `["execute"]`;
6. no process-global capability/session binding map exists;
7. supervisor authority is cryptographically bound to the exact Eve session before the model turn;
8. the Eve tool rejects signature tampering and cross-session replay before sandbox effects;
9. all EC-01 through EC-08 produce their exact Section 13.12 outcomes;
10. all Section 13.13 positive controls pass;
11. no negative control is skipped, mocked in place of required physical evidence, or satisfied by an unrelated earlier failure;
12. the run-cwd symlink regression proves canonical equality immediately before execution;
13. EC-06 is otherwise exactly authorized and fails only on the Git-specific predicate;
14. harness lint passes;
15. harness source typecheck passes;
16. authored agent-file typecheck passes;
17. harness tests pass;
18. existing INC-1 routing tests remain unchanged and pass;
19. locked Docker image and physical deny-all network are used;
20. no supervisor private key, privileged secret, or host `.git` metadata reaches the sandbox;
21. independent runs have distinct Eve session/sandbox identities and no writable-state carryover;
22. existing Node 22 product verification behavior remains unchanged and passes;
23. Node 24 `Harness Verification` must succeed for `PR Verification` to succeed;
24. exact-head CI binds to the final candidate;
25. implementation remains below the 420 internal stop and 500 repository ceiling;
26. no INC-3, INC-4, or INC-5 implementation appears.

Any false predicate stops progression.

### 13.19 Stop conditions

Stop immediately when any of these becomes true:

1. root `AGENTS.md`, `CONTEXT.md`, or a stage `CONTEXT.md` must change;
2. product/application code or dependencies must change;
3. the INC-1 router must change to grant INC-2 authority;
4. a tenth candidate path is required;
5. a dependency outside Section 13.3 is required;
6. an Eve internal API is required;
7. the signed authority envelope cannot bind to public `ctx.session.id`;
8. the external supervisor cannot pre-create a fresh Eve session through the public client surface;
9. the runtime would require a process-global mutable authority registry, external service, database, or memory layer;
10. Eve optional/default capability suppression cannot keep the exact tool surface `["execute"]`;
11. network denial is only a prompt/model behavior rather than physical `deny-all`;
12. the sandbox would receive the supervisor private key, host `.git` metadata, or privileged secrets;
13. canonical cwd mediation cannot detect a symlink escape immediately before execution;
14. a policy engine, service, database, memory layer, Jev layer, verifier layer, or additional agent/orchestration layer becomes necessary;
15. physical sandbox tests require model/provider credentials;
16. implementation reaches or projects to 420 reviewable lines;
17. the same failure persists without materially new bounded diagnostic evidence;
18. Plan, contract, base, head, Eve package, AI SDK package, Zod package, or OCI image identity becomes stale;
19. exact-head CI fails without one bounded evidence-backed correction;
20. review cycle 3 reports an actionable finding.

Required disposition is `BLOCKED`, `REDUCE`, or `REDESIGN` according to the triggering condition. No silent scope expansion or fix-forward is permitted.

### 13.20 Explicit non-authority

This contract does not authorize:

- INC-3, INC-4, or INC-5 implementation;
- Jev;
- final mechanical PASS authority;
- release/artifact provenance or attestation;
- root-router cutover;
- old-governance removal;
- product feature work;
- database/backend work;
- memory;
- multi-agent execution;
- model/provider calls in acceptance CI;
- deployment;
- release;
- merge;
- any new path or dependency beyond the frozen INC-2 surface.

## 14. Stage 03 disposition

The active C1-C7 governance baseline remains unchanged. Codex cycle 1 exposed a real authority-transfer defect in the prior INC-2 mechanism. The revised contract removes the disconnected process-local binding map and freezes one stateless supervisor-to-Eve authority path: a supervisor-signed, exact-session-bound capability envelope verified by the sole authored Eve tool before any sandbox effect.

The repair also freezes the cwd-canonicalization and Git-specific negative-control corrections and structurally removes the binding-cleanup leak mechanism without adding a service, database, memory layer, internal Eve API, new dependency, or tenth candidate path.

`CONTRACT_READY` means ready for fresh Stage 04 admission only. It is not implementation PASS, verification PASS, review approval, release eligibility, or merge authority.

CONTRACT_READY

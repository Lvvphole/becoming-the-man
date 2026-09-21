# Implementation Contract - Deterministic ICM Governance Routing

Status: CONTRACT_READY
Lifecycle stage: 03_contract
Target implementation stage: 04_implement
Migration scope: Zero-Trust Repository Harness v1.2 / INC-1 only

## 1. Frozen authoring binding

This contract is subordinate to root `AGENTS.md`, root `CONTEXT.md`, `stages/03_contract/CONTEXT.md`, and the routed Layer 3 references.

Approved migration Plan:
- path: `stages/02_plan/output/repo-zero-trust-harness-v1.2-plan.md`
- disposition: `PLAN_READY`
- SHA-256: `3b8e4438ebf76c75785c460239e3f0ef427a267e6f5fc1e4f7aa96185d8ce80e`
- Git blob: `2e5c4c1cdfe3d0bf76732e109b7a3a5271b3dc06`
- approval: explicit user approval after the artifact was committed
- approved Plan commit: `147d6ba5c07cacac27c26f52197e5f8baac22f51`
- planning base: `807ebb1cfa121afa3e536f00791b7f1da383193f`

Owner-authorized bootstrap exception:
- use `task_domain=governance` for this migration;
- permit the migration Plan at `stages/02_plan/output/repo-zero-trust-harness-v1.2-plan.md`;
- preserve every other current governance and stop condition.

Stage 03 authoring state:
- repository: `Lvvphole/becoming-the-man`
- authoring branch: `harness-v1-2-bootstrap-plan`
- pre-correction head: `f414ff18fbf703dd35ff53e5e0167a22eb3eddcb`
- permitted mutation: `stages/03_contract/output/implementation-contract.md` only
- selected evidence IDs: empty

Routed Layer 3 inputs:
- `references/engineering/engineering-rules.md`, full document
- `references/architecture/CONTEXT.md`, full document

The literal selector `"*"` means full-document access only for a source whose route declares full-section access. It is not a path wildcard and must never be interpreted as file discovery.

Sections 2 through 12 below preserve the active C1-C7 governance baseline from `main` unchanged. Historical INC-1 implementation material from `main` is intentionally not restored because it would create a competing implementation contract.

This contract defines the active C1 through C7 baseline plus exactly one migration-specific INC-1 contract. It does not authorize implementation by itself. Stage 04 must rebind to the post-contract repository head, read the Stage 04 contract and all routed sources, and satisfy `G_PRE_CODE_READY` before any protected mutation.

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

## 13. Zero-Trust Repository Harness v1.2 - INC-1 Shadow Routing Contract

### 13.1 Objective and non-authority

INC-1 builds only the replacement routing kernel and compact task contract in shadow form. Root `CONTEXT.md` remains the active repository router throughout INC-1.

INC-1 does not implement Eve, AI SDK orchestration, Jev, sandbox enforcement, the external supervisor, authenticated provenance, or the final external verifier. Those remain later roadmap increments and are not executable under this contract.

### 13.2 Exact Stage 04 mutation allowlist

The complete INC-1 candidate path set is exactly:

1. `harness/package.json`
2. `harness/package-lock.json`
3. `harness/tsconfig.json`
4. `harness/src/routing.ts`
5. `harness/tests/routing.test.ts`
6. `harness/fixtures/CONTEXT.target.md`
7. `.github/workflows/pr-verification.yml`

No eighth candidate path is authorized.

The workflow file may change only to add a Node 24 harness-verification job and to make the existing required `PR Verification` job explicitly fail when that harness job is not successful. The existing Node 22.16.0 product verification steps, job name, and behavioral coverage must remain unchanged.

Forbidden INC-1 mutations include root `AGENTS.md`, root `CONTEXT.md`, `CLAUDE.md`, engineering rules, the architecture manifest, any stage `CONTEXT.md`, root package manifests, product/application/database/provider files, architecture/product specifications, and Stage 05/06/07 records.

A required mutation outside the seven-path allowlist is `BLOCKED / CONTRACT_SCOPE_EXPANSION`.

### 13.3 Canonical shadow routing-table representation

The canonical target router for INC-1 exists only in `harness/fixtures/CONTEXT.target.md`. It is not active authority.

The target Markdown contains exactly one fenced JSON object between explicit begin/end markers. Identity-bearing registries are arrays so duplicate IDs remain mechanically observable after `JSON.parse`.

Normative shape:

```json
{
  "version": 1,
  "path_routes": [
    {
      "id": "route-id",
      "exact": [],
      "prefixes": [],
      "sources": [],
      "checks": []
    }
  ],
  "requirements": [
    {
      "id": "requirement-id",
      "source": "source-id",
      "selector": "exact-selector",
      "checks": []
    }
  ],
  "sources": [
    {
      "id": "source-id",
      "path": "repo-relative/path"
    }
  ],
  "checks": [
    {
      "id": "check-id",
      "argv": ["exact", "argv", "tokens"]
    }
  ],
  "protected_paths": [
    "CLAUDE.md",
    "AGENTS.md",
    "CONTEXT.md"
  ]
}
```

Required predicates:

```text
version = 1

count(path_route_ids) = count(unique(path_route_ids))
count(requirement_ids) = count(unique(requirement_ids))
count(source_ids) = count(unique(source_ids))
count(check_ids) = count(unique(check_ids))

every referenced source ID exists
every referenced check ID exists
every route/source path is repository-relative
no path contains glob or wildcard syntax
every check is exact argv tokens, never a shell string
```

Duplicate requirement IDs are therefore detectable without YAML, a custom parser, or another policy framework.

### 13.4 Deterministic path ownership

For candidate path `p`:

```text
EXACT_MATCHES(p) :=
  path_routes whose exact list contains p

PREFIX_MATCHES(p) :=
  path_routes whose prefix is a directory prefix of p
```

Resolution order is fixed:

```text
one exact match
  -> owner

more than one exact match
  -> BLOCKED / AMBIGUOUS_PATH_ROUTE

otherwise select the longest matching prefix

one longest-prefix match
  -> owner

multiple equal longest-prefix matches
  -> BLOCKED / AMBIGUOUS_PATH_ROUTE

zero matches
  -> BLOCKED / UNROUTED_PATH
```

A model may not choose between collisions or substitute semantic similarity.

### 13.5 Deterministic requirement and source resolution

For each requirement reference `q`:

```text
zero requirement IDs equal q
  -> BLOCKED / UNKNOWN_REQUIREMENT

more than one requirement ID equals q
  -> BLOCKED / AMBIGUOUS_REQUIREMENT

exactly one requirement maps to absent source ID
  -> BLOCKED / REQUIREMENT_SOURCE_UNAVAILABLE

mapped source path absent from the trusted supplied source surface
  -> BLOCKED / REQUIREMENT_SOURCE_UNAVAILABLE

exactly one valid requirement
  -> exact source + exact selector
```

No semantic heading search, repository scan, fallback source, or inferred selector is permitted.

### 13.6 Minimum-check composition

For an admitted task:

```text
resolved_path_routes =
  union(owner(path) for path in task.allowed_paths)

resolved_requirements =
  union(resolve(requirement) for requirement in task.requirement_refs)

required_sources =
  union(path_route.sources, requirement.source)

minimum_checks =
  union(path_route.checks, requirement.checks)

G_CHECKS_NOT_WEAKENED :=
  minimum_checks subset_of task.required_checks
```

If false:

```text
BLOCKED / MINIMUM_CHECKS_WEAKENED
```

The task may add checks but may not remove repository-derived minimum checks.

### 13.7 Compact immutable task contract

INC-1 validates exactly these execution semantics:

```yaml
task_id: optional non-empty string
base_sha: required 40-character lowercase hexadecimal Git object ID
goal: required non-empty string
requirement_refs: required unique string array
allowed_paths: required unique non-empty repository-relative path array
allowed_tools: required unique non-empty string array
required_checks: required unique non-empty string array
stop_condition: required non-empty string
```

Malformed input, unknown authority-bearing fields, duplicate list members, invalid paths, or invalid base identity:

```text
BLOCKED / TASK_CONTRACT_INVALID
```

Observed repository base different from `base_sha`:

```text
BLOCKED / STALE_OR_WRONG_BASE
```

The free-form goal is descriptive only and cannot expand paths, tools, checks, sources, or authority.

### 13.8 Frozen independent negative-control oracle

The Stage 04 candidate may reproduce these cases but may not redefine their required dispositions.

| ID | Input defect | Required disposition |
|---|---|---|
| NC-01 | authorized path has zero owners | `BLOCKED / UNROUTED_PATH` |
| NC-02 | authorized path has two equal-specificity owners | `BLOCKED / AMBIGUOUS_PATH_ROUTE` |
| NC-03 | unknown requirement ID | `BLOCKED / UNKNOWN_REQUIREMENT` |
| NC-04 | duplicate requirement IDs in the parsed array | `BLOCKED / AMBIGUOUS_REQUIREMENT` |
| NC-05 | requirement source ID/path unavailable | `BLOCKED / REQUIREMENT_SOURCE_UNAVAILABLE` |
| NC-06 | task omits one derived minimum check | `BLOCKED / MINIMUM_CHECKS_WEAKENED` |
| NC-07 | observed base differs from task `base_sha` | `BLOCKED / STALE_OR_WRONG_BASE` |
| NC-08 | malformed compact task contract | `BLOCKED / TASK_CONTRACT_INVALID` |

Every negative control must fail because of its intended predicate, not an earlier unrelated defect. A thrown exception or permissive fallback is not an accepted BLOCKED result.

This Stage 03 artifact is outside the Stage 04 allowlist and is the authoritative bootstrap oracle for these eight expected outcomes.

### 13.9 Harness package boundary

INC-1 creates a standalone `harness/` package with:

- Node 24 runtime target;
- TypeScript strict mode;
- a committed `harness/package-lock.json`;
- only dependencies required for deterministic routing, typecheck, and tests;
- no Eve dependency;
- no AI SDK dependency;
- no Jev dependency;
- no model/network/database/policy-engine dependency;
- no runtime import from the website application;
- no production website import from `harness/`.

A dependency outside this boundary is `BLOCKED / CONTRACT_SCOPE_EXPANSION`.

### 13.10 Node 24 harness verification

The new harness job runs in this deterministic order:

```text
npm ci
npm ci --prefix harness
npx eslint harness/src/routing.ts harness/tests/routing.test.ts
npm --prefix harness run typecheck
npm --prefix harness run test
```

The root install supplies the existing repository ESLint toolchain only. The harness package supplies its pinned TypeScript/test dependencies.

The harness package scripts must include:

```text
typecheck -> tsc --noEmit
test      -> vitest run
```

No dev server, code generation, network call, product build, or product test is part of the Node 24 harness job.

### 13.11 Fail-closed workflow integration

The existing required job remains named exactly `PR Verification`.

The workflow dependency must be fail closed:

```yaml
harness-verification:
  # Node 24 harness checks

verify:
  name: PR Verification
  needs: harness-verification
  if: ${{ always() }}
  steps:
    - name: Require harness verification
      run: test "${{ needs.harness-verification.result }}" = "success"
    # every pre-existing Node 22.16.0 product verification step follows unchanged
```

Required predicates:

```text
H1 harness-verification runs on Node 24
H2 PR Verification depends on harness-verification
H3 PR Verification executes even after dependency failure
H4 its first gate fails unless harness-verification.result = success
H5 existing PR Verification job name remains unchanged
H6 existing Node 22.16.0 product setup remains unchanged
H7 every pre-existing product verification step remains semantically unchanged
H8 no failure is converted to continue-on-error
H9 no path filter suppresses the required harness job
```

Any false predicate is `BLOCKED / CONTRACT_SCOPE_EXPANSION`.

No new C4 reason code is introduced.

### 13.12 One-candidate construction discipline

Stage 04 is limited to:

```text
BIND
  -> INSPECT
  -> ONE BOUNDED CANDIDATE
  -> VERIFY
  -> STOP
```

Before its first protected mutation, Stage 04 must re-read the current root authorities, Stage 04 contract, engineering rules, architecture manifest, exact approved Plan, and this exact contract; then all `G_PC_*` predicates must be true.

After every mutation, re-evaluate changed-path confinement, current head, active stop condition, and current reviewable-line count.

A failed check does not authorize speculative fix-forward.

### 13.13 Reviewable-size boundary

```text
TARGET <= 350 reviewable implementation lines
INTERNAL_STOP = 420
ABSOLUTE_CURRENT_REPOSITORY_CEILING = 500
```

351 through 419 is a target overrun that must be reported. At 420 or more before the initial candidate is complete:

```text
STOP -> REDUCE OR REDESIGN
```

Greater than 500 fails the active repository gate absent a separately authorized owner exception.

### 13.14 INC-1 verification obligations

Before INC-1 may advance beyond implementation:

1. final implementation paths are a subset of the exact seven-path allowlist;
2. active root governance, product files, root package manifests, and architecture sources are unchanged;
3. all eight Section 13.8 negative controls produce the exact required dispositions;
4. positive controls prove exact ownership, longest-prefix ownership, exact requirement/source resolution, minimum-check union, and valid compact-task admission;
5. harness typecheck passes;
6. harness tests pass with no skipped/todo/disabled INC-1 controls;
7. harness ESLint check passes;
8. the existing Node 22 product verification behavior remains unchanged and passes;
9. Node 24 harness verification must be successful for `PR Verification` to succeed;
10. exact-head CI binds to the final candidate;
11. implementation remains below the 420 initial-candidate stop threshold and within the 500 final ceiling;
12. candidate-controlled tests do not redefine Section 13.8 expectations;
13. no semantic routing or second active router appears;
14. no INC-2 implementation appears.

Any false predicate stops progression.

### 13.15 Stop conditions

Stop immediately when any of these becomes true:

1. active root governance must change during INC-1;
2. product code or product dependencies must change;
3. an eighth candidate path is required;
4. semantic inference is required for routing;
5. the frozen Section 13.8 oracle would need to change after implementation begins;
6. a new architectural layer or service becomes necessary;
7. Eve, AI SDK, Jev, sandbox, supervisor, or final-verifier implementation becomes necessary;
8. the workflow change weakens or bypasses an existing product check;
9. Node 24 harness verification cannot be added without product behavior change;
10. implementation reaches or projects to 420 reviewable lines before the initial candidate is complete;
11. the same failure persists without materially new bounded diagnostic evidence;
12. Plan, contract, base, or head binding becomes stale;
13. a routed authority changes materially;
14. exact-head CI fails without one bounded evidence-backed correction;
15. review cycle 3 reports an actionable finding.

The required disposition is `BLOCKED`, `REDUCE`, or `REDESIGN` according to the active condition. No silent scope expansion is permitted.

### 13.16 Explicit non-authority

This contract does not authorize:

- INC-2, INC-3, INC-4, or INC-5 implementation;
- active root router cutover;
- removal of the existing lifecycle/domain machinery;
- product feature work;
- merge;
- release;
- deployment;
- a change-size exception.

## 14. Stage 03 disposition

The baseline C1-C7 contract remains present exactly once, the historical implementation-specific INC-1 is removed, and the approved migration-specific INC-1 contract is frozen without creating a second active router.

`CONTRACT_READY` means ready for Stage 04 admission evaluation only. It is not implementation PASS, verification PASS, review approval, release eligibility, or merge authority.

CONTRACT_READY

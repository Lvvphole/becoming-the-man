# Implementation Contract - Deterministic ICM Governance Routing

Status: CONTRACT_READY
Lifecycle stage: 03_contract
Target implementation stage: 04_implement

## 1. Frozen authoring binding

This contract is subordinate to root `AGENTS.md`, root `CONTEXT.md`, the Stage 03 contract, and the routed Layer 3 references.

Approved Plan:
- path: `stages/02_plan/output/implementation-plan.md`
- disposition: `PLAN_READY`
- sha256: `0b0039d77ff4a5f967339742f24d48741d877489f258b9a73ad14459d69fb5f4`
- approval: `APPROVED_AND_LOCKED_FOR_IMPLEMENTATION`

Stage 03 authoring input binding:
- repository: `Lvvphole/becoming-the-man`
- PR: `48`
- base commit: `bfe440cef162182ca35af7744ef623b61f8eb8cd`
- authoring head: `179b55b9fdf9ce1a71a799b8aeeb2d6aae9fd33d`
- task domain: `governance`
- selected evidence IDs: empty
- permitted mutation: `stages/03_contract/output/implementation-contract.md` only

Routed Layer 3 inputs:
- `references/engineering/engineering-rules.md`, full document
- `references/architecture/CONTEXT.md`, full document

The literal selector `"*"` means "full document" only for a source whose route declares full-section access. It is not a path wildcard and must never be interpreted as file discovery.

This contract defines C1 through C7. It does not authorize implementation by itself. Stage 04 must rebind to the post-contract repository head, read the Stage 04 contract and all routed sources, and satisfy `G_PRE_CODE_READY` before any code, test, schema, migration, build, workflow, or verifier mutation.

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
                "$ref": "#/$defs/identifier"
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
- no TODO, TBD, placeholder, ellipsis-as-missing-content, executable implementation, or file-discovery wildcard is present;
- the Stage 03 mutation commit changes only `stages/03_contract/output/implementation-contract.md`.

A failed condition returns C4 BLOCKED with `reason_code = "CONTRACT_INCOMPLETE"`, `"CONTRACT_SCOPE_EXPANSION"`, or the more specific applicable reason code.

## 13. Stage 03 disposition

The Stage 03 authoring disposition is `CONTRACT_READY` only when the contract-completeness oracle succeeds and the resulting artifact is externally bound to the post-write repository state.

`CONTRACT_READY` is not implementation PASS, verification PASS, review approval, release eligibility, or merge authority.

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

## 13. INC-1 Mechanical Routing Contracts and Verifier

### 13.1 Approved Plan binding and scope

This section freezes the exact implementation obligations from the approved INC-1 Plan.

Approved Plan:
- path: `stages/02_plan/output/implementation-plan.md`
- disposition: `PLAN_READY`
- SHA-256: `9d26be5ca0fd8bcc19ea6fdf30bfcd2899b5570fa9eb87ef5758dc87ebd511a7`
- approved at repository head: `58a0e10c5bddf8eabec65a9c90ac4e740c35f8d3`

This INC-1 contract narrows implementation to the mechanical governance verifier. Redesign Path A amends only the C1 transition fact-token grammar defined in Section 3.3.1. C2 through C7, root routing semantics, architecture authority, product behavior, and merge authority remain unchanged.

The human operator also narrows the INC-1 reviewable implementation target from <= 380 to <= 350 for the redesigned implementation. The 420 internal stop threshold, 500 absolute ceiling, and 80-line reserve from the stop threshold to the absolute ceiling remain unchanged.

### 13.2 Stage 04 implementation workpiece authorization

For INC-1, the complete Stage 04 implementation workpiece set is exactly:

1. `contracts/governance-routing-contract.json`
2. `scripts/verify-governance-routing.mjs`
3. `tests/governance-routing.test.mjs`

A valid Stage 04 envelope for this Plan must set `authorized_candidate_paths` to exactly this set and must not add a fourth implementation path.

The following mutation classes are explicitly forbidden for INC-1:

- root `AGENTS.md`;
- root `CONTEXT.md`;
- any `stages/*/CONTEXT.md`;
- package manifests or dependency lockfiles;
- application sources;
- database schemas or migrations;
- architecture source documents;
- CI workflow files;
- provider configuration;
- product behavior.

If any forbidden mutation becomes necessary, return `CONTRACT_SCOPE_EXPANSION` or the more specific applicable C4 failure and stop.

This section freezes an implementation allowlist. It does not itself authorize Stage 04 mutation. Stage 04 still requires a valid current envelope and `G_PRE_CODE_READY = true`.

### 13.3 Module 1 - Defensive input gate

The verifier must satisfy all of these predicates before dereferencing untrusted envelope fields:

```text
G_ENVELOPE_OBJECT :=
  envelope != null
  AND typeof(envelope) = object
  AND Array.isArray(envelope) = false

G_C2_FIELDS_PRESENT :=
  every required C2 field exists
  AND every required field is non-null

G_C2_FIELD_TYPES :=
  task_domains is array
  AND source_sections is non-null non-array object
  AND workpiece_paths is array
  AND selected_evidence_ids is array
  AND prior_outputs is non-null non-array object
  AND authorized_candidate_paths is array
  AND approvals is non-null non-array object
  AND source_binding is non-null non-array object
```

Required failure mapping:

- null, undefined, primitive, array, or structurally invalid envelope -> `TASK_ENVELOPE_REQUIRED`;
- missing `workflow_stage` or `task_domains` in an otherwise structurally valid envelope -> `MISSING_SELECTOR`;
- missing non-selector C2 field -> `TASK_ENVELOPE_REQUIRED`.

No malformed envelope fixture may terminate as an uncaught JavaScript exception.

`parseRoutingTable` must likewise reject non-string routing-table input as structured `BLOCKED`, never by uncaught runtime exception.

### 13.4 Module 2 - Repository path confinement

The verifier must expose one pure repository-path predicate equivalent to:

```text
isRepoRelativePath(p) :=
  typeof(p) = string
  AND length(p) > 0
  AND p matches ^[A-Za-z0-9._/-]+$
  AND p does not start with "/"
  AND no path segment equals ".."
  AND p contains none of "*", "?", "[", "]"
  AND p contains no backslash
  AND p is not a drive-letter path
```

The predicate must be applied to every member of:

- `workpiece_paths`;
- `authorized_candidate_paths`.

Failure mapping is frozen as:

- wildcard path -> `WILDCARD_INPUT`;
- non-wildcard repoPath grammar violation, absolute path, drive-letter path, backslash path, or parent traversal -> `TASK_ENVELOPE_REQUIRED`.

No new path-specific C4 reason code is authorized by this Plan.

### 13.5 Module 3 - Strict C4 BLOCKED schema enforcement

C4 output construction must use trusted caller execution lineage before evaluating untrusted envelope lineage.

Required order:

```text
trusted execution lineage
-> validate pr/base/current_head
-> evaluate untrusted input
-> construct C4 BLOCKED or ROUTE_MATCH
```

The verifier interface may extend the existing options object with:

```text
options.sourceBinding = {
  pr,
  base,
  current_head
}
```

Normative requirements:

1. `makeBlocked` must require validated execution lineage.
2. `makeBlocked` must not default `source_binding` to `{}`.
3. The verifier must not manufacture a PR number, base SHA, head SHA, zero SHA, or other placeholder.
4. Envelope lineage cannot repair, replace, or overwrite stale trusted execution lineage.
5. `validateBlocked` must validate the C4 structure relied on by this verifier, including:
   - exact top-level field set;
   - `status = "BLOCKED"`;
   - registered `reason_code`;
   - valid `gate_id`;
   - registered `stage_id`;
   - array types and required uniqueness;
   - non-empty `resolution_required`;
   - exact `source_binding` keys `pr`, `base`, `current_head`;
   - integer `pr >= 1`;
   - 40-character lowercase hexadecimal `base` and `current_head`;
   - no unexpected BLOCKED or source-binding properties.

A malformed or unavailable trusted source binding cannot produce `ROUTE_MATCH`.

### 13.6 Module 4 - Route-table integrity

The canonical route identity surface is `table.routes[*].route_id`.

The verifier must enforce:

```text
G_ROUTE_IDS_UNIQUE :=
  count(table.routes[*].route_id)
  =
  count(unique(table.routes[*].route_id))
```

Required semantics:

- duplicate `route_id` -> `ROUTING_TABLE_INVALID`;
- multiple distinct valid route rows matching one envelope -> `ROUTE_MULTI_MATCH`.

The deprecated raw `stage_registry` duplicate-key check must not remain the route-ID collision oracle.

Before route dereference, the parser must verify that:

- the parsed table is a non-null object;
- `routes` is a non-empty array;
- `source_registry` is a non-null object;
- every route used by evaluation has the required C1 fields and expected container types.

Malformed route-table structure returns `ROUTING_TABLE_INVALID`.

### 13.7 Module 5 - Layer 3 resolution pipeline

No route may return `ROUTE_MATCH` until every source in its `required_layer3_bundle` has completed this pipeline:

1. Source ID exists in `source_registry`.
2. Source metadata has valid shape.
3. `kind = "layer3"`.
4. `location` is `"repository"` or `"task_context"`.
5. Repository source paths satisfy `isRepoRelativePath`.
6. Repository sources exist in the exact supplied source surface.
7. Task-context sources resolve only from explicitly supplied routed task material.
8. `source_sections[sourceId]` is present and policy-conformant.
9. Trusted and envelope source bindings are structurally valid.
10. Envelope `source_binding` equals trusted execution lineage.
11. Every `required_approval_facts` item is strictly `true`.
12. Only then may the route predicate succeed.

The deterministic repository source interface is an exact injected map, not repository discovery:

```text
options.files = {
  "exact/repository/path": "exact file contents"
}
```

The verifier may test exact key membership. It must not list directories, glob paths, scan `docs/`, infer alternate filenames, or select a replacement source.

Section-policy invariants:

```text
section_policy = "full"
  -> source_sections[sourceId] must equal exactly ["*"]

section_policy = "explicit_selector_required"
  -> selector is a non-empty unique string array
  AND selector does not contain "*"
```

The verifier is not authorized to invent a semantic Markdown-heading grammar for scoped selectors.

Failure mapping:

- absent source registry entry or missing exact repository source -> `MISSING_SOURCE`;
- absent or invalid source selector -> `MISSING_SELECTOR`;
- malformed or unequal source binding -> `SOURCE_BINDING_STALE`.

### 13.8 Module 6 - Positive 500-LOC invariant

Token blacklisting is not an acceptance oracle for the active reviewability ceiling.

The verifier must positively prove:

```text
active_reviewable_loc_limit === 500
```

across exactly these seven sources:

1. `AGENTS.md`
2. `references/engineering/engineering-rules.md`
3. `references/architecture/CONTEXT.md`
4. `docs/Website_System_Architecture_v1.0_LOCKED.md`
5. `docs/SYSTEM_ARCHITECTURE_AMENDMENT_v1.1.md`
6. `docs/SYSTEM_ARCHITECTURE_AMENDMENT_v1.2.md`
7. `scripts/check-change-size.sh`

The machine contract may declare the expected numeric limit and the exact seven-source allowlist in `contracts/governance-routing-contract.json`.

Extraction rules are deterministic:

- parse machine-readable JSON structure where a JSON block exists;
- use anchored numeric regular expressions for normative Markdown or shell assignments;
- reject missing expected anchors as `CHANGE_SIZE_DRIFT`;
- compare extracted numeric values as numbers, not strings or token presence.

Required anchors:

- architecture manifest JSON: `active_reviewable_loc_limit`;
- shell gate: `MAX_LINES=N`;
- engineering rules: `reviewable_lines <= N`;
- v1.1 A18-01: `no more than N reviewable implementation lines`;
- v1.2 reviewability-preservation statement: numeric limit N;
- AGENTS.md active Micro-PR and reviewability ceiling declarations;
- v1.0 authority/source-basis reviewability-ceiling statement.

Every active extracted value must equal exactly `500`.

Numeric controls:

- 499 -> `CHANGE_SIZE_DRIFT`;
- 500 -> PASS for this predicate;
- 501 -> `CHANGE_SIZE_DRIFT`;
- 600 -> `CHANGE_SIZE_DRIFT`;
- 1000 -> `CHANGE_SIZE_DRIFT`.

### 13.9 Thirty-test exit invariant

The INC-1 focused Vitest surface must execute all 30 planned controls with zero skipped, todo, or disabled tests.

The required controls are:

| ID | Fixture | Required oracle |
|---|---|---|
| T01 | null envelope | BLOCKED / TASK_ENVELOPE_REQUIRED |
| T02 | undefined envelope | BLOCKED / TASK_ENVELOPE_REQUIRED |
| T03 | primitive envelope | BLOCKED / TASK_ENVELOPE_REQUIRED |
| T04 | array envelope | BLOCKED / TASK_ENVELOPE_REQUIRED |
| T05 | missing workflow_stage | BLOCKED / MISSING_SELECTOR |
| T06 | missing non-selector C2 field | BLOCKED / TASK_ENVELOPE_REQUIRED |
| T07 | workpiece_paths wrong type | BLOCKED / TASK_ENVELOPE_REQUIRED |
| T08 | /etc/passwd | BLOCKED / TASK_ENVELOPE_REQUIRED |
| T09 | ../secret | BLOCKED / TASK_ENVELOPE_REQUIRED |
| T10 | src/../secret | BLOCKED / TASK_ENVELOPE_REQUIRED |
| T11 | C:/secret | BLOCKED / TASK_ENVELOPE_REQUIRED |
| T12 | src/** | BLOCKED / WILDCARD_INPUT |
| T13 | source_binding {} | invalid C4 / no successful route |
| T14 | malformed trusted binding | no successful route |
| T15 | stale envelope binding | BLOCKED / SOURCE_BINDING_STALE |
| T16 | duplicate route_id | BLOCKED / ROUTING_TABLE_INVALID |
| T17 | distinct route collision | BLOCKED / ROUTE_MULTI_MATCH |
| T18 | required Layer 3 registry entry absent | BLOCKED / MISSING_SOURCE |
| T19 | required repository source absent from exact source surface | BLOCKED / MISSING_SOURCE |
| T20 | full source selector not ["*"] | BLOCKED / MISSING_SELECTOR |
| T21 | explicit selector contains "*" | BLOCKED / MISSING_SELECTOR |
| T22 | required approval false | route must not match |
| T23 | seven canonical ceiling values all 500 | PASS for ceiling predicate |
| T24 | ceiling fixture 499 | BLOCKED / CHANGE_SIZE_DRIFT |
| T25 | ceiling fixture 501 | BLOCKED / CHANGE_SIZE_DRIFT |
| T26 | ceiling fixture 600 | BLOCKED / CHANGE_SIZE_DRIFT |
| T27 | ceiling fixture 1000 | BLOCKED / CHANGE_SIZE_DRIFT |
| T28 | existing valid governance route | ROUTE_MATCH preserved |
| T29 | undeclared cross-domain envelope | BLOCKED / ROUTE_ZERO_MATCH preserved |
| T30 | existing evidence, transition, review-cycle, and stage-contract regressions | preserved PASS |

Every negative control must fail because of its intended predicate, not because a preceding unrelated fixture is invalid.

The focused governance-routing test file must report all 30 controls executed and passed before INC-1 can satisfy its test exit invariant.

### 13.10 Reviewable footprint gates

For the INC-1 implementation diff against merge base `fec5de5f242dc1dba4e007658f3323931f83c193`:

```text
TARGET_REVIEWABLE_LINES <= 350
INTERNAL_STOP_THRESHOLD = 420
G_CHANGE_SIZE absolute ceiling = 500
RESERVED_REPAIR_MARGIN at stop threshold >= 80
```

Normative behavior:

1. <= 350 is the implementation target.
2. 351 through 419 does not automatically fail G_CHANGE_SIZE, but must be explicitly reported as target overrun before candidate completion.
3. At 420 or more reviewable implementation lines before the initial candidate is complete, stop implementation and return `REDUCE OR REDESIGN`.
4. Stage 04 must not consume the 80-line reserved repair margin merely to finish the initial implementation.
5. Greater than 500 fails `G_CHANGE_SIZE` unless the pre-existing owner exception is separately and exactly authorized under `AGENTS.md`.
6. This Markdown contract is documentation and is excluded from the reviewable implementation count under `AGENTS.md`.

### 13.11 Stage 04 increment contract

INC-1 implementation order is frozen as:

```text
INC-1A
  defensive input
  -> repository path confinement
  -> trusted lineage
  -> C4 validation

INC-1B
  route-table integrity
  -> Layer 3 resolution
  -> section policy
  -> source-binding equality
  -> strict approval facts

INC-1C
  positive seven-source numeric 500 invariant
  -> focused regression suite
  -> full verification
```

After each implementation mutation, Stage 04 must re-evaluate:

- changed-path confinement;
- current PR head;
- active stop condition;
- current reviewable-line count.

No speculative fix-forward is allowed.

### 13.12 INC-1 verification contract

Before Stage 04 may emit a candidate manifest:

1. All changed implementation paths are members of the three-file allowlist in 13.2.
2. The focused governance-routing Vitest file executes all 30 controls with zero skipped tests.
3. Existing governance-routing regressions remain green.
4. Lint passes for the changed JavaScript/test surface.
5. `npm run verify` completes successfully.
6. `npm run verify:change-size -- fec5de5f242dc1dba4e007658f3323931f83c193` passes.
7. The observed implementation footprint is below 420 lines for the initial candidate.
8. The final PR implementation footprint is <= 500.
9. No forbidden root-governance, package, application, architecture, workflow, or database mutation exists.
10. Exact-head PR Verification must pass before review admission.

Any false predicate fails closed and blocks progression.

### 13.13 INC-1 stop conditions

Stop immediately and do not broaden scope when any of these becomes true:

1. root `CONTEXT.md` must change;
2. `AGENTS.md` must change;
3. any stage CONTEXT file must change;
4. architecture source text must change merely to make the verifier pass;
5. a package or dependency addition appears necessary;
6. a new C4 reason code appears necessary;
7. a fourth implementation workpiece appears necessary;
8. a semantic scoped-section grammar must be invented;
9. trusted execution lineage cannot be supplied independently of untrusted envelope data;
10. initial implementation reaches or projects to 420 reviewable lines before completion;
11. the same failure persists without materially new bounded diagnostic evidence;
12. a new significant defect class exposes a mechanism requiring scope expansion;
13. Plan, contract, base, or head binding becomes stale;
14. exact-head CI fails without a bounded evidence-backed correction;
15. review cycle 3 reports an actionable finding.

The required response is `BLOCKED`, `REDUCE`, or `REDESIGN` as dictated by the active gate. No silent scope expansion is permitted.

### 13.14 INC-1 contract-completeness additions

In addition to the baseline oracle in Section 12, the Stage 03 contract is complete for INC-1 only when all of these are true:

- the exact three-file Stage 04 allowlist is present;
- all six module contracts are present;
- non-wildcard invalid path mapping is frozen to `TASK_ENVELOPE_REQUIRED`;
- no new C4 reason code is introduced;
- the trusted-lineage-before-envelope ordering is explicit;
- the `{}` source-binding fallback is prohibited;
- route-ID uniqueness is bound to `table.routes[*].route_id`;
- legacy `stage_registry` collision checking is not an acceptance oracle;
- Layer 3 source existence, section policy, source binding, and strict approval facts are preconditions to `ROUTE_MATCH`;
- all seven numeric 500 sources are listed exactly;
- all 30 test controls are listed with required oracles;
- zero skipped focused tests is required;
- the <= 350 target, 420 stop threshold, >= 80 repair margin, and 500 absolute ceiling are frozen;
- all Stage 04 stop conditions are explicit;
- no root-governance or application mutation is authorized.

A failed INC-1 completeness predicate returns `CONTRACT_INCOMPLETE`, `CONTRACT_SCOPE_EXPANSION`, or the more specific applicable existing C4 reason code.

## 14. Stage 03 disposition

The Stage 03 authoring disposition is `CONTRACT_READY` only when both the baseline contract-completeness oracle and the INC-1 additions in Section 13.14 succeed, and the resulting artifact is externally bound to the post-write repository state.

`CONTRACT_READY` is not implementation PASS, verification PASS, review approval, release eligibility, or merge authority.

CONTRACT_READY

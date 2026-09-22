# Repository Context Router

Status: ACTIVE LAYER 1 ROUTER
Authority: subordinate only to `AGENTS.md`.
Contract: `contracts/governance-routing-contract.json`.

Root `CONTEXT.md` is the only task-domain and source router. It validates caller- or controller-supplied task-domain selectors, permits bounded read-only localization to construct exact non-domain selectors, and resolves the exact authoritative sources for the task. It does not impose a repository lifecycle stage, predecessor artifact, or stage transition.

## Context Layers

```text
Layer 0: CLAUDE.md -> AGENTS.md
Layer 1: CONTEXT.md
Layer 2: exact routed Layer 3 governance/reference sources
Layer 3: exact workpiece inputs and non-authoritative evidence
```

## Task Envelope

A task envelope must contain all of these fields:

- `task_domains`
- `source_sections`
- `workpiece_paths`
- `selected_evidence_ids`
- `authorized_candidate_paths`
- `approvals`
- `source_binding`

Task-domain selectors are valid only when caller-supplied or deterministically supplied by an authorized external execution controller. Exact `source_sections` and `workpiece_paths` may additionally be deterministically derived by the bounded read-only localization bootstrap below after the task-domain selector resolves exactly one route. All other task-envelope fields retain their existing authority requirements. Repository work does not require Scout, Plan, Contract, Implement, Verify, Review, or Release predecessor state.

## Read-Only Localization Bootstrap

A caller or authorized external execution controller may request bounded read-only localization before a full task envelope exists.

The discovery request contains exactly:

- `task_domains`
- `subject`
- `source_binding`

`task_domains` remains caller- or controller-supplied. The executing agent may not infer, broaden, substitute, or choose it. `subject` is a non-empty caller-supplied description of the repository target to localize. `source_binding` must equal the trusted current execution binding.

For discovery request `D`:

```text
G_DISCOVERY_ROUTE(D) :=
  D has exactly task_domains, subject, source_binding
  AND D.task_domains matches exactly one canonical route
  AND D.source_binding equals the trusted current binding
```

When `G_DISCOVERY_ROUTE(D) = true`, the agent may perform only these localization reads:

1. inspect the selected route's registered Layer 3 source identities and use bounded text/heading search inside those exact routed sources to identify exact section selectors;
2. inspect repository tree/metadata and perform subject-targeted read-only search to identify exact candidate workpiece paths;
3. emit a non-authoritative Scout Report when scouting was requested; and
4. emit a separate proposed task envelope populated with the localized exact selectors.

Discovery does not authorize full workpiece inspection, evidence access, test/build execution, repository mutation, route inference, requirement creation, permission creation, waiver creation, or merge authority. It must not inspect `docs/evidence/**`.

A discovery result is not a task envelope and cannot satisfy the Pre-Code Readiness Gate. Normal route evaluation must validate the completed task envelope before ordinary Layer 3 source loading, exact workpiece reads, evidence reads, or any mutation.

## Canonical Route Matrix

The JSON object between `ROUTING_TABLE_BEGIN` and `ROUTING_TABLE_END` is the single canonical route matrix.

Each row contains exactly: `route_id`, `selectors`, `predicate`, `required_layer3_bundle`, and `allowed_evidence_ids`.

The matrix registers exact single-domain routes. Multi-domain envelopes fail closed until an explicitly authorized composite route row is added. No agent may synthesize a composite route.

ROUTING_TABLE_BEGIN

```json
{
  "version": "2.1.0",
  "routes": [
    {
      "route_id": "route:governance",
      "selectors": {
        "task_domains": [
          "governance"
        ]
      },
      "predicate": {
        "operator": "ALL_EXACT",
        "required_envelope_fields": [
          "task_domains",
          "source_sections",
          "workpiece_paths",
          "selected_evidence_ids",
          "authorized_candidate_paths",
          "approvals",
          "source_binding"
        ],
        "required_approval_facts": []
      },
      "required_layer3_bundle": [
        "engineering_rules",
        "architecture_manifest"
      ],
      "allowed_evidence_ids": []
    },
    {
      "route_id": "route:product_behavior",
      "selectors": {
        "task_domains": [
          "product_behavior"
        ]
      },
      "predicate": {
        "operator": "ALL_EXACT",
        "required_envelope_fields": [
          "task_domains",
          "source_sections",
          "workpiece_paths",
          "selected_evidence_ids",
          "authorized_candidate_paths",
          "approvals",
          "source_binding"
        ],
        "required_approval_facts": []
      },
      "required_layer3_bundle": [
        "engineering_rules",
        "architecture_manifest",
        "product_prd"
      ],
      "allowed_evidence_ids": []
    },
    {
      "route_id": "route:ui_ux",
      "selectors": {
        "task_domains": [
          "ui_ux"
        ]
      },
      "predicate": {
        "operator": "ALL_EXACT",
        "required_envelope_fields": [
          "task_domains",
          "source_sections",
          "workpiece_paths",
          "selected_evidence_ids",
          "authorized_candidate_paths",
          "approvals",
          "source_binding"
        ],
        "required_approval_facts": []
      },
      "required_layer3_bundle": [
        "engineering_rules",
        "architecture_manifest",
        "product_prd"
      ],
      "allowed_evidence_ids": []
    },
    {
      "route_id": "route:system_architecture",
      "selectors": {
        "task_domains": [
          "system_architecture"
        ]
      },
      "predicate": {
        "operator": "ALL_EXACT",
        "required_envelope_fields": [
          "task_domains",
          "source_sections",
          "workpiece_paths",
          "selected_evidence_ids",
          "authorized_candidate_paths",
          "approvals",
          "source_binding"
        ],
        "required_approval_facts": []
      },
      "required_layer3_bundle": [
        "engineering_rules",
        "architecture_manifest",
        "system_architecture"
      ],
      "allowed_evidence_ids": []
    },
    {
      "route_id": "route:api_contract",
      "selectors": {
        "task_domains": [
          "api_contract"
        ]
      },
      "predicate": {
        "operator": "ALL_EXACT",
        "required_envelope_fields": [
          "task_domains",
          "source_sections",
          "workpiece_paths",
          "selected_evidence_ids",
          "authorized_candidate_paths",
          "approvals",
          "source_binding"
        ],
        "required_approval_facts": []
      },
      "required_layer3_bundle": [
        "engineering_rules",
        "architecture_manifest",
        "product_prd",
        "system_architecture"
      ],
      "allowed_evidence_ids": []
    },
    {
      "route_id": "route:database_rls",
      "selectors": {
        "task_domains": [
          "database_rls"
        ]
      },
      "predicate": {
        "operator": "ALL_EXACT",
        "required_envelope_fields": [
          "task_domains",
          "source_sections",
          "workpiece_paths",
          "selected_evidence_ids",
          "authorized_candidate_paths",
          "approvals",
          "source_binding"
        ],
        "required_approval_facts": []
      },
      "required_layer3_bundle": [
        "engineering_rules",
        "architecture_manifest",
        "system_architecture"
      ],
      "allowed_evidence_ids": []
    },
    {
      "route_id": "route:provider_integration",
      "selectors": {
        "task_domains": [
          "provider_integration"
        ]
      },
      "predicate": {
        "operator": "ALL_EXACT",
        "required_envelope_fields": [
          "task_domains",
          "source_sections",
          "workpiece_paths",
          "selected_evidence_ids",
          "authorized_candidate_paths",
          "approvals",
          "source_binding"
        ],
        "required_approval_facts": []
      },
      "required_layer3_bundle": [
        "engineering_rules",
        "architecture_manifest",
        "system_architecture"
      ],
      "allowed_evidence_ids": []
    },
    {
      "route_id": "route:security",
      "selectors": {
        "task_domains": [
          "security"
        ]
      },
      "predicate": {
        "operator": "ALL_EXACT",
        "required_envelope_fields": [
          "task_domains",
          "source_sections",
          "workpiece_paths",
          "selected_evidence_ids",
          "authorized_candidate_paths",
          "approvals",
          "source_binding"
        ],
        "required_approval_facts": []
      },
      "required_layer3_bundle": [
        "engineering_rules",
        "architecture_manifest",
        "system_architecture"
      ],
      "allowed_evidence_ids": []
    },
    {
      "route_id": "route:ci_cd",
      "selectors": {
        "task_domains": [
          "ci_cd"
        ]
      },
      "predicate": {
        "operator": "ALL_EXACT",
        "required_envelope_fields": [
          "task_domains",
          "source_sections",
          "workpiece_paths",
          "selected_evidence_ids",
          "authorized_candidate_paths",
          "approvals",
          "source_binding"
        ],
        "required_approval_facts": []
      },
      "required_layer3_bundle": [
        "engineering_rules",
        "architecture_manifest",
        "system_architecture"
      ],
      "allowed_evidence_ids": []
    },
    {
      "route_id": "route:testing",
      "selectors": {
        "task_domains": [
          "testing"
        ]
      },
      "predicate": {
        "operator": "ALL_EXACT",
        "required_envelope_fields": [
          "task_domains",
          "source_sections",
          "workpiece_paths",
          "selected_evidence_ids",
          "authorized_candidate_paths",
          "approvals",
          "source_binding"
        ],
        "required_approval_facts": []
      },
      "required_layer3_bundle": [
        "engineering_rules",
        "architecture_manifest"
      ],
      "allowed_evidence_ids": []
    },
    {
      "route_id": "route:ai_assessment",
      "selectors": {
        "task_domains": [
          "ai_assessment"
        ]
      },
      "predicate": {
        "operator": "ALL_EXACT",
        "required_envelope_fields": [
          "task_domains",
          "source_sections",
          "workpiece_paths",
          "selected_evidence_ids",
          "authorized_candidate_paths",
          "approvals",
          "source_binding"
        ],
        "required_approval_facts": []
      },
      "required_layer3_bundle": [
        "engineering_rules",
        "architecture_manifest",
        "product_prd",
        "system_architecture"
      ],
      "allowed_evidence_ids": []
    },
    {
      "route_id": "route:content_identity",
      "selectors": {
        "task_domains": [
          "content_identity"
        ]
      },
      "predicate": {
        "operator": "ALL_EXACT",
        "required_envelope_fields": [
          "task_domains",
          "source_sections",
          "workpiece_paths",
          "selected_evidence_ids",
          "authorized_candidate_paths",
          "approvals",
          "source_binding"
        ],
        "required_approval_facts": []
      },
      "required_layer3_bundle": [
        "engineering_rules",
        "architecture_manifest",
        "published_book"
      ],
      "allowed_evidence_ids": []
    },
    {
      "route_id": "route:relationship_protocol",
      "selectors": {
        "task_domains": [
          "relationship_protocol"
        ]
      },
      "predicate": {
        "operator": "ALL_EXACT",
        "required_envelope_fields": [
          "task_domains",
          "source_sections",
          "workpiece_paths",
          "selected_evidence_ids",
          "authorized_candidate_paths",
          "approvals",
          "source_binding"
        ],
        "required_approval_facts": []
      },
      "required_layer3_bundle": [
        "engineering_rules",
        "architecture_manifest",
        "mros_v1_4"
      ],
      "allowed_evidence_ids": []
    },
    {
      "route_id": "route:project_narrative",
      "selectors": {
        "task_domains": [
          "project_narrative"
        ]
      },
      "predicate": {
        "operator": "ALL_EXACT",
        "required_envelope_fields": [
          "task_domains",
          "source_sections",
          "workpiece_paths",
          "selected_evidence_ids",
          "authorized_candidate_paths",
          "approvals",
          "source_binding"
        ],
        "required_approval_facts": []
      },
      "required_layer3_bundle": [
        "engineering_rules",
        "architecture_manifest",
        "project_architecture",
        "master_story_bible",
        "product_vision"
      ],
      "allowed_evidence_ids": []
    },
    {
      "route_id": "route:bug_repair",
      "selectors": {
        "task_domains": [
          "bug_repair"
        ]
      },
      "predicate": {
        "operator": "ALL_EXACT",
        "required_envelope_fields": [
          "task_domains",
          "source_sections",
          "workpiece_paths",
          "selected_evidence_ids",
          "authorized_candidate_paths",
          "approvals",
          "source_binding"
        ],
        "required_approval_facts": []
      },
      "required_layer3_bundle": [
        "engineering_rules",
        "architecture_manifest"
      ],
      "allowed_evidence_ids": []
    },
    {
      "route_id": "route:release",
      "selectors": {
        "task_domains": [
          "release"
        ]
      },
      "predicate": {
        "operator": "ALL_EXACT",
        "required_envelope_fields": [
          "task_domains",
          "source_sections",
          "workpiece_paths",
          "selected_evidence_ids",
          "authorized_candidate_paths",
          "approvals",
          "source_binding"
        ],
        "required_approval_facts": []
      },
      "required_layer3_bundle": [
        "engineering_rules",
        "architecture_manifest"
      ],
      "allowed_evidence_ids": []
    }
  ],
  "source_registry": {
    "engineering_rules": {
      "kind": "layer3",
      "location": "repository",
      "path": "references/engineering/engineering-rules.md",
      "section_policy": "full"
    },
    "architecture_manifest": {
      "kind": "layer3",
      "location": "repository",
      "path": "references/architecture/CONTEXT.md",
      "section_policy": "full"
    },
    "product_prd": {
      "kind": "layer3",
      "location": "repository",
      "path": "docs/Website_Product_Specification_v1.0_LOCKED.md",
      "section_policy": "explicit_selector_required"
    },
    "system_architecture": {
      "kind": "layer3",
      "location": "repository",
      "path": "docs/Website_System_Architecture_v1.0_LOCKED.md",
      "section_policy": "explicit_selector_required",
      "router": "architecture_manifest"
    },
    "published_book": {
      "kind": "layer3",
      "location": "task_context",
      "path": null,
      "section_policy": "explicit_selector_required"
    },
    "mros_v1_4": {
      "kind": "layer3",
      "location": "task_context",
      "path": null,
      "section_policy": "explicit_selector_required"
    },
    "project_architecture": {
      "kind": "layer3",
      "location": "task_context",
      "path": null,
      "section_policy": "explicit_selector_required"
    },
    "master_story_bible": {
      "kind": "layer3",
      "location": "task_context",
      "path": null,
      "section_policy": "explicit_selector_required"
    },
    "product_vision": {
      "kind": "layer3",
      "location": "task_context",
      "path": null,
      "section_policy": "explicit_selector_required"
    }
  }
}
```

ROUTING_TABLE_END

## Binary Evaluation

For envelope `E` and route `r`:

```text
MATCH(E,r) :=
  set(E.task_domains) = set(r.selectors.task_domains)
  AND every(r.predicate.required_envelope_fields is present and non-null in E)
  AND every(r.required_layer3_bundle resolves exactly once)
  AND every(E.selected_evidence_ids is in r.allowed_evidence_ids)

M(E) := { r in Routes | MATCH(E,r) = TRUE }
G_ROUTE_UNIQUE(E) := |M(E)| = 1
```

- `|M(E)| = 0` -> `ROUTE_ZERO_MATCH`.
- `|M(E)| > 1` -> `ROUTE_MULTI_MATCH`.
- Exactly one match yields exactly one `route_id`, Layer 3 bundle, and evidence allowlist.

No semantic similarity, fallback route, "best fit", inferred task domain, or inferred source selector is permitted.

## Source Loading

The Read-Only Localization Bootstrap is the only pre-envelope exception to ordinary source loading. It permits locator-only search within the exact routed Layer 3 bundle and subject-targeted repository localization as defined above; it does not treat discovered content as authoritative task input and grants no mutation or evidence authority.

After one route matches:

1. read only the route's exact Layer 3 bundle;
2. for a source with `section_policy = "full"`, caller selector `["*"]` means full-document access only and is not a path wildcard;
3. for `explicit_selector_required`, require an exact non-wildcard section selector;
4. load only exact workpiece paths and exact evidence IDs declared by the envelope and allowed by the route.

Missing source, stale binding, unauthorized input, or evidence promotion returns the governed `BLOCKED` record.

## Evidence Boundary

`docs/evidence/**` is proof only. Evidence cannot create requirements, permissions, waivers, route choice, or merge authority.

The route matrix sets `allowed_evidence_ids` to an empty array for every current route. Evidence remains inaccessible until a later authorized governance change binds exact evidence IDs to exact routes and a governed evidence index exists.

## Skills

Skills are optional task procedures, never routing authority and never mandatory lifecycle stages.

A skill cannot grant write, review, PASS, merge-readiness, or merge authority.

## BLOCKED Output

Every fail-closed routing result must satisfy the governed blocked-record contract. The agent stops after emitting the record and does not continue by approximation.

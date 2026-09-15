# Repository Context Router

Status: ACTIVE LAYER 1 ROUTER
Authority: subordinate only to `AGENTS.md`.
Contract: C1 Route-Table Contract from `stages/03_contract/output/implementation-contract.md`.

Root `CONTEXT.md` is the only task/stage router. The executing agent validates a caller-supplied or validated-prior-stage task envelope. It never infers, broadens, substitutes, or chooses selector values.

## ICM Layers

```text
Layer 0: CLAUDE.md -> AGENTS.md
Layer 1: CONTEXT.md
Layer 2: stages/NN_name/CONTEXT.md
Layer 3: exact routed governance/reference sources
Layer 4: exact prior-stage outputs, workpiece inputs, and non-authoritative evidence
```

## Task Envelope

A task envelope must satisfy C2 and contain all of these fields:

- `workflow_stage`
- `task_domains`
- `source_sections`
- `workpiece_paths`
- `selected_evidence_ids`
- `prior_outputs`
- `authorized_candidate_paths`
- `approvals`
- `source_binding`

Selectors are valid only when caller-supplied or copied without semantic alteration from a validated prior-stage artifact.

## Canonical Route Matrix

The JSON object between `ROUTING_TABLE_BEGIN` and `ROUTING_TABLE_END` is the single canonical route matrix.

Each row contains exactly the C1 columns: `route_id`, `selectors`, `predicate`, `required_layer3_bundle`, `allowed_evidence_ids`, `target_stage`, and `transition`.

This initial bootstrap registers only exact single-domain routes derived from the pre-bootstrap domain registry. Multi-domain envelopes fail closed until an explicitly authorized composite route row is added. No agent may synthesize a composite route.

ROUTING_TABLE_BEGIN

```json
{
  "version": "1.0.0",
  "routes": [
    {
      "route_id": "route:01_scout:governance",
      "selectors": {
        "workflow_stage": "01_scout",
        "task_domains": [
          "governance"
        ]
      },
      "predicate": {
        "operator": "ALL_EXACT",
        "required_envelope_fields": [
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
        "required_approval_facts": []
      },
      "required_layer3_bundle": [
        "engineering_rules",
        "architecture_manifest"
      ],
      "allowed_evidence_ids": [],
      "target_stage": "01_scout",
      "transition": {
        "from_stage": null,
        "to_stage": "01_scout",
        "required_facts": [],
        "automatic": false
      }
    },
    {
      "route_id": "route:01_scout:product_behavior",
      "selectors": {
        "workflow_stage": "01_scout",
        "task_domains": [
          "product_behavior"
        ]
      },
      "predicate": {
        "operator": "ALL_EXACT",
        "required_envelope_fields": [
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
        "required_approval_facts": []
      },
      "required_layer3_bundle": [
        "engineering_rules",
        "product_prd"
      ],
      "allowed_evidence_ids": [],
      "target_stage": "01_scout",
      "transition": {
        "from_stage": null,
        "to_stage": "01_scout",
        "required_facts": [],
        "automatic": false
      }
    },
    {
      "route_id": "route:01_scout:ui_ux",
      "selectors": {
        "workflow_stage": "01_scout",
        "task_domains": [
          "ui_ux"
        ]
      },
      "predicate": {
        "operator": "ALL_EXACT",
        "required_envelope_fields": [
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
        "required_approval_facts": []
      },
      "required_layer3_bundle": [
        "engineering_rules",
        "product_prd"
      ],
      "allowed_evidence_ids": [],
      "target_stage": "01_scout",
      "transition": {
        "from_stage": null,
        "to_stage": "01_scout",
        "required_facts": [],
        "automatic": false
      }
    },
    {
      "route_id": "route:01_scout:system_architecture",
      "selectors": {
        "workflow_stage": "01_scout",
        "task_domains": [
          "system_architecture"
        ]
      },
      "predicate": {
        "operator": "ALL_EXACT",
        "required_envelope_fields": [
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
        "required_approval_facts": []
      },
      "required_layer3_bundle": [
        "engineering_rules",
        "architecture_manifest",
        "system_architecture"
      ],
      "allowed_evidence_ids": [],
      "target_stage": "01_scout",
      "transition": {
        "from_stage": null,
        "to_stage": "01_scout",
        "required_facts": [],
        "automatic": false
      }
    },
    {
      "route_id": "route:01_scout:api_contract",
      "selectors": {
        "workflow_stage": "01_scout",
        "task_domains": [
          "api_contract"
        ]
      },
      "predicate": {
        "operator": "ALL_EXACT",
        "required_envelope_fields": [
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
        "required_approval_facts": []
      },
      "required_layer3_bundle": [
        "engineering_rules",
        "product_prd",
        "architecture_manifest",
        "system_architecture"
      ],
      "allowed_evidence_ids": [],
      "target_stage": "01_scout",
      "transition": {
        "from_stage": null,
        "to_stage": "01_scout",
        "required_facts": [],
        "automatic": false
      }
    },
    {
      "route_id": "route:01_scout:database_rls",
      "selectors": {
        "workflow_stage": "01_scout",
        "task_domains": [
          "database_rls"
        ]
      },
      "predicate": {
        "operator": "ALL_EXACT",
        "required_envelope_fields": [
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
        "required_approval_facts": []
      },
      "required_layer3_bundle": [
        "engineering_rules",
        "architecture_manifest",
        "system_architecture"
      ],
      "allowed_evidence_ids": [],
      "target_stage": "01_scout",
      "transition": {
        "from_stage": null,
        "to_stage": "01_scout",
        "required_facts": [],
        "automatic": false
      }
    },
    {
      "route_id": "route:01_scout:provider_integration",
      "selectors": {
        "workflow_stage": "01_scout",
        "task_domains": [
          "provider_integration"
        ]
      },
      "predicate": {
        "operator": "ALL_EXACT",
        "required_envelope_fields": [
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
        "required_approval_facts": []
      },
      "required_layer3_bundle": [
        "engineering_rules",
        "architecture_manifest",
        "system_architecture"
      ],
      "allowed_evidence_ids": [],
      "target_stage": "01_scout",
      "transition": {
        "from_stage": null,
        "to_stage": "01_scout",
        "required_facts": [],
        "automatic": false
      }
    },
    {
      "route_id": "route:01_scout:security",
      "selectors": {
        "workflow_stage": "01_scout",
        "task_domains": [
          "security"
        ]
      },
      "predicate": {
        "operator": "ALL_EXACT",
        "required_envelope_fields": [
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
        "required_approval_facts": []
      },
      "required_layer3_bundle": [
        "engineering_rules",
        "architecture_manifest",
        "system_architecture"
      ],
      "allowed_evidence_ids": [],
      "target_stage": "01_scout",
      "transition": {
        "from_stage": null,
        "to_stage": "01_scout",
        "required_facts": [],
        "automatic": false
      }
    },
    {
      "route_id": "route:01_scout:ci_cd",
      "selectors": {
        "workflow_stage": "01_scout",
        "task_domains": [
          "ci_cd"
        ]
      },
      "predicate": {
        "operator": "ALL_EXACT",
        "required_envelope_fields": [
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
        "required_approval_facts": []
      },
      "required_layer3_bundle": [
        "engineering_rules",
        "architecture_manifest",
        "system_architecture"
      ],
      "allowed_evidence_ids": [],
      "target_stage": "01_scout",
      "transition": {
        "from_stage": null,
        "to_stage": "01_scout",
        "required_facts": [],
        "automatic": false
      }
    },
    {
      "route_id": "route:01_scout:testing",
      "selectors": {
        "workflow_stage": "01_scout",
        "task_domains": [
          "testing"
        ]
      },
      "predicate": {
        "operator": "ALL_EXACT",
        "required_envelope_fields": [
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
        "required_approval_facts": []
      },
      "required_layer3_bundle": [
        "engineering_rules",
        "architecture_manifest"
      ],
      "allowed_evidence_ids": [],
      "target_stage": "01_scout",
      "transition": {
        "from_stage": null,
        "to_stage": "01_scout",
        "required_facts": [],
        "automatic": false
      }
    },
    {
      "route_id": "route:01_scout:ai_assessment",
      "selectors": {
        "workflow_stage": "01_scout",
        "task_domains": [
          "ai_assessment"
        ]
      },
      "predicate": {
        "operator": "ALL_EXACT",
        "required_envelope_fields": [
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
        "required_approval_facts": []
      },
      "required_layer3_bundle": [
        "engineering_rules",
        "product_prd",
        "architecture_manifest",
        "system_architecture"
      ],
      "allowed_evidence_ids": [],
      "target_stage": "01_scout",
      "transition": {
        "from_stage": null,
        "to_stage": "01_scout",
        "required_facts": [],
        "automatic": false
      }
    },
    {
      "route_id": "route:01_scout:content_identity",
      "selectors": {
        "workflow_stage": "01_scout",
        "task_domains": [
          "content_identity"
        ]
      },
      "predicate": {
        "operator": "ALL_EXACT",
        "required_envelope_fields": [
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
        "required_approval_facts": []
      },
      "required_layer3_bundle": [
        "engineering_rules",
        "published_book"
      ],
      "allowed_evidence_ids": [],
      "target_stage": "01_scout",
      "transition": {
        "from_stage": null,
        "to_stage": "01_scout",
        "required_facts": [],
        "automatic": false
      }
    },
    {
      "route_id": "route:01_scout:relationship_protocol",
      "selectors": {
        "workflow_stage": "01_scout",
        "task_domains": [
          "relationship_protocol"
        ]
      },
      "predicate": {
        "operator": "ALL_EXACT",
        "required_envelope_fields": [
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
        "required_approval_facts": []
      },
      "required_layer3_bundle": [
        "engineering_rules",
        "mros_v1_4"
      ],
      "allowed_evidence_ids": [],
      "target_stage": "01_scout",
      "transition": {
        "from_stage": null,
        "to_stage": "01_scout",
        "required_facts": [],
        "automatic": false
      }
    },
    {
      "route_id": "route:01_scout:project_narrative",
      "selectors": {
        "workflow_stage": "01_scout",
        "task_domains": [
          "project_narrative"
        ]
      },
      "predicate": {
        "operator": "ALL_EXACT",
        "required_envelope_fields": [
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
        "required_approval_facts": []
      },
      "required_layer3_bundle": [
        "engineering_rules",
        "project_architecture",
        "master_story_bible",
        "product_vision"
      ],
      "allowed_evidence_ids": [],
      "target_stage": "01_scout",
      "transition": {
        "from_stage": null,
        "to_stage": "01_scout",
        "required_facts": [],
        "automatic": false
      }
    },
    {
      "route_id": "route:01_scout:bug_repair",
      "selectors": {
        "workflow_stage": "01_scout",
        "task_domains": [
          "bug_repair"
        ]
      },
      "predicate": {
        "operator": "ALL_EXACT",
        "required_envelope_fields": [
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
        "required_approval_facts": []
      },
      "required_layer3_bundle": [
        "engineering_rules"
      ],
      "allowed_evidence_ids": [],
      "target_stage": "01_scout",
      "transition": {
        "from_stage": null,
        "to_stage": "01_scout",
        "required_facts": [],
        "automatic": false
      }
    },
    {
      "route_id": "route:01_scout:release",
      "selectors": {
        "workflow_stage": "01_scout",
        "task_domains": [
          "release"
        ]
      },
      "predicate": {
        "operator": "ALL_EXACT",
        "required_envelope_fields": [
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
        "required_approval_facts": []
      },
      "required_layer3_bundle": [
        "engineering_rules",
        "architecture_manifest"
      ],
      "allowed_evidence_ids": [],
      "target_stage": "01_scout",
      "transition": {
        "from_stage": null,
        "to_stage": "01_scout",
        "required_facts": [],
        "automatic": false
      }
    },
    {
      "route_id": "route:02_plan:governance",
      "selectors": {
        "workflow_stage": "02_plan",
        "task_domains": [
          "governance"
        ]
      },
      "predicate": {
        "operator": "ALL_EXACT",
        "required_envelope_fields": [
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
        "required_approval_facts": []
      },
      "required_layer3_bundle": [
        "engineering_rules",
        "architecture_manifest"
      ],
      "allowed_evidence_ids": [],
      "target_stage": "02_plan",
      "transition": {
        "from_stage": "01_scout",
        "to_stage": "02_plan",
        "required_facts": [
          "scout_report_valid",
          "original_request_pre_authorized_plan"
        ],
        "automatic": true
      }
    },
    {
      "route_id": "route:02_plan:product_behavior",
      "selectors": {
        "workflow_stage": "02_plan",
        "task_domains": [
          "product_behavior"
        ]
      },
      "predicate": {
        "operator": "ALL_EXACT",
        "required_envelope_fields": [
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
        "required_approval_facts": []
      },
      "required_layer3_bundle": [
        "engineering_rules",
        "product_prd"
      ],
      "allowed_evidence_ids": [],
      "target_stage": "02_plan",
      "transition": {
        "from_stage": "01_scout",
        "to_stage": "02_plan",
        "required_facts": [
          "scout_report_valid",
          "original_request_pre_authorized_plan"
        ],
        "automatic": true
      }
    },
    {
      "route_id": "route:02_plan:ui_ux",
      "selectors": {
        "workflow_stage": "02_plan",
        "task_domains": [
          "ui_ux"
        ]
      },
      "predicate": {
        "operator": "ALL_EXACT",
        "required_envelope_fields": [
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
        "required_approval_facts": []
      },
      "required_layer3_bundle": [
        "engineering_rules",
        "product_prd"
      ],
      "allowed_evidence_ids": [],
      "target_stage": "02_plan",
      "transition": {
        "from_stage": "01_scout",
        "to_stage": "02_plan",
        "required_facts": [
          "scout_report_valid",
          "original_request_pre_authorized_plan"
        ],
        "automatic": true
      }
    },
    {
      "route_id": "route:02_plan:system_architecture",
      "selectors": {
        "workflow_stage": "02_plan",
        "task_domains": [
          "system_architecture"
        ]
      },
      "predicate": {
        "operator": "ALL_EXACT",
        "required_envelope_fields": [
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
        "required_approval_facts": []
      },
      "required_layer3_bundle": [
        "engineering_rules",
        "architecture_manifest",
        "system_architecture"
      ],
      "allowed_evidence_ids": [],
      "target_stage": "02_plan",
      "transition": {
        "from_stage": "01_scout",
        "to_stage": "02_plan",
        "required_facts": [
          "scout_report_valid",
          "original_request_pre_authorized_plan"
        ],
        "automatic": true
      }
    },
    {
      "route_id": "route:02_plan:api_contract",
      "selectors": {
        "workflow_stage": "02_plan",
        "task_domains": [
          "api_contract"
        ]
      },
      "predicate": {
        "operator": "ALL_EXACT",
        "required_envelope_fields": [
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
        "required_approval_facts": []
      },
      "required_layer3_bundle": [
        "engineering_rules",
        "product_prd",
        "architecture_manifest",
        "system_architecture"
      ],
      "allowed_evidence_ids": [],
      "target_stage": "02_plan",
      "transition": {
        "from_stage": "01_scout",
        "to_stage": "02_plan",
        "required_facts": [
          "scout_report_valid",
          "original_request_pre_authorized_plan"
        ],
        "automatic": true
      }
    },
    {
      "route_id": "route:02_plan:database_rls",
      "selectors": {
        "workflow_stage": "02_plan",
        "task_domains": [
          "database_rls"
        ]
      },
      "predicate": {
        "operator": "ALL_EXACT",
        "required_envelope_fields": [
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
        "required_approval_facts": []
      },
      "required_layer3_bundle": [
        "engineering_rules",
        "architecture_manifest",
        "system_architecture"
      ],
      "allowed_evidence_ids": [],
      "target_stage": "02_plan",
      "transition": {
        "from_stage": "01_scout",
        "to_stage": "02_plan",
        "required_facts": [
          "scout_report_valid",
          "original_request_pre_authorized_plan"
        ],
        "automatic": true
      }
    },
    {
      "route_id": "route:02_plan:provider_integration",
      "selectors": {
        "workflow_stage": "02_plan",
        "task_domains": [
          "provider_integration"
        ]
      },
      "predicate": {
        "operator": "ALL_EXACT",
        "required_envelope_fields": [
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
        "required_approval_facts": []
      },
      "required_layer3_bundle": [
        "engineering_rules",
        "architecture_manifest",
        "system_architecture"
      ],
      "allowed_evidence_ids": [],
      "target_stage": "02_plan",
      "transition": {
        "from_stage": "01_scout",
        "to_stage": "02_plan",
        "required_facts": [
          "scout_report_valid",
          "original_request_pre_authorized_plan"
        ],
        "automatic": true
      }
    },
    {
      "route_id": "route:02_plan:security",
      "selectors": {
        "workflow_stage": "02_plan",
        "task_domains": [
          "security"
        ]
      },
      "predicate": {
        "operator": "ALL_EXACT",
        "required_envelope_fields": [
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
        "required_approval_facts": []
      },
      "required_layer3_bundle": [
        "engineering_rules",
        "architecture_manifest",
        "system_architecture"
      ],
      "allowed_evidence_ids": [],
      "target_stage": "02_plan",
      "transition": {
        "from_stage": "01_scout",
        "to_stage": "02_plan",
        "required_facts": [
          "scout_report_valid",
          "original_request_pre_authorized_plan"
        ],
        "automatic": true
      }
    },
    {
      "route_id": "route:02_plan:ci_cd",
      "selectors": {
        "workflow_stage": "02_plan",
        "task_domains": [
          "ci_cd"
        ]
      },
      "predicate": {
        "operator": "ALL_EXACT",
        "required_envelope_fields": [
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
        "required_approval_facts": []
      },
      "required_layer3_bundle": [
        "engineering_rules",
        "architecture_manifest",
        "system_architecture"
      ],
      "allowed_evidence_ids": [],
      "target_stage": "02_plan",
      "transition": {
        "from_stage": "01_scout",
        "to_stage": "02_plan",
        "required_facts": [
          "scout_report_valid",
          "original_request_pre_authorized_plan"
        ],
        "automatic": true
      }
    },
    {
      "route_id": "route:02_plan:testing",
      "selectors": {
        "workflow_stage": "02_plan",
        "task_domains": [
          "testing"
        ]
      },
      "predicate": {
        "operator": "ALL_EXACT",
        "required_envelope_fields": [
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
        "required_approval_facts": []
      },
      "required_layer3_bundle": [
        "engineering_rules",
        "architecture_manifest"
      ],
      "allowed_evidence_ids": [],
      "target_stage": "02_plan",
      "transition": {
        "from_stage": "01_scout",
        "to_stage": "02_plan",
        "required_facts": [
          "scout_report_valid",
          "original_request_pre_authorized_plan"
        ],
        "automatic": true
      }
    },
    {
      "route_id": "route:02_plan:ai_assessment",
      "selectors": {
        "workflow_stage": "02_plan",
        "task_domains": [
          "ai_assessment"
        ]
      },
      "predicate": {
        "operator": "ALL_EXACT",
        "required_envelope_fields": [
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
        "required_approval_facts": []
      },
      "required_layer3_bundle": [
        "engineering_rules",
        "product_prd",
        "architecture_manifest",
        "system_architecture"
      ],
      "allowed_evidence_ids": [],
      "target_stage": "02_plan",
      "transition": {
        "from_stage": "01_scout",
        "to_stage": "02_plan",
        "required_facts": [
          "scout_report_valid",
          "original_request_pre_authorized_plan"
        ],
        "automatic": true
      }
    },
    {
      "route_id": "route:02_plan:content_identity",
      "selectors": {
        "workflow_stage": "02_plan",
        "task_domains": [
          "content_identity"
        ]
      },
      "predicate": {
        "operator": "ALL_EXACT",
        "required_envelope_fields": [
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
        "required_approval_facts": []
      },
      "required_layer3_bundle": [
        "engineering_rules",
        "published_book"
      ],
      "allowed_evidence_ids": [],
      "target_stage": "02_plan",
      "transition": {
        "from_stage": "01_scout",
        "to_stage": "02_plan",
        "required_facts": [
          "scout_report_valid",
          "original_request_pre_authorized_plan"
        ],
        "automatic": true
      }
    },
    {
      "route_id": "route:02_plan:relationship_protocol",
      "selectors": {
        "workflow_stage": "02_plan",
        "task_domains": [
          "relationship_protocol"
        ]
      },
      "predicate": {
        "operator": "ALL_EXACT",
        "required_envelope_fields": [
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
        "required_approval_facts": []
      },
      "required_layer3_bundle": [
        "engineering_rules",
        "mros_v1_4"
      ],
      "allowed_evidence_ids": [],
      "target_stage": "02_plan",
      "transition": {
        "from_stage": "01_scout",
        "to_stage": "02_plan",
        "required_facts": [
          "scout_report_valid",
          "original_request_pre_authorized_plan"
        ],
        "automatic": true
      }
    },
    {
      "route_id": "route:02_plan:project_narrative",
      "selectors": {
        "workflow_stage": "02_plan",
        "task_domains": [
          "project_narrative"
        ]
      },
      "predicate": {
        "operator": "ALL_EXACT",
        "required_envelope_fields": [
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
        "required_approval_facts": []
      },
      "required_layer3_bundle": [
        "engineering_rules",
        "project_architecture",
        "master_story_bible",
        "product_vision"
      ],
      "allowed_evidence_ids": [],
      "target_stage": "02_plan",
      "transition": {
        "from_stage": "01_scout",
        "to_stage": "02_plan",
        "required_facts": [
          "scout_report_valid",
          "original_request_pre_authorized_plan"
        ],
        "automatic": true
      }
    },
    {
      "route_id": "route:02_plan:bug_repair",
      "selectors": {
        "workflow_stage": "02_plan",
        "task_domains": [
          "bug_repair"
        ]
      },
      "predicate": {
        "operator": "ALL_EXACT",
        "required_envelope_fields": [
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
        "required_approval_facts": []
      },
      "required_layer3_bundle": [
        "engineering_rules"
      ],
      "allowed_evidence_ids": [],
      "target_stage": "02_plan",
      "transition": {
        "from_stage": "01_scout",
        "to_stage": "02_plan",
        "required_facts": [
          "scout_report_valid",
          "original_request_pre_authorized_plan"
        ],
        "automatic": true
      }
    },
    {
      "route_id": "route:02_plan:release",
      "selectors": {
        "workflow_stage": "02_plan",
        "task_domains": [
          "release"
        ]
      },
      "predicate": {
        "operator": "ALL_EXACT",
        "required_envelope_fields": [
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
        "required_approval_facts": []
      },
      "required_layer3_bundle": [
        "engineering_rules",
        "architecture_manifest"
      ],
      "allowed_evidence_ids": [],
      "target_stage": "02_plan",
      "transition": {
        "from_stage": "01_scout",
        "to_stage": "02_plan",
        "required_facts": [
          "scout_report_valid",
          "original_request_pre_authorized_plan"
        ],
        "automatic": true
      }
    },
    {
      "route_id": "route:03_contract:governance",
      "selectors": {
        "workflow_stage": "03_contract",
        "task_domains": [
          "governance"
        ]
      },
      "predicate": {
        "operator": "ALL_EXACT",
        "required_envelope_fields": [
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
        "required_approval_facts": []
      },
      "required_layer3_bundle": [
        "engineering_rules",
        "architecture_manifest"
      ],
      "allowed_evidence_ids": [],
      "target_stage": "03_contract",
      "transition": {
        "from_stage": "02_plan",
        "to_stage": "03_contract",
        "required_facts": [
          "plan_ready",
          "explicit_user_approval",
          "plan_binding_current"
        ],
        "automatic": false
      }
    },
    {
      "route_id": "route:03_contract:product_behavior",
      "selectors": {
        "workflow_stage": "03_contract",
        "task_domains": [
          "product_behavior"
        ]
      },
      "predicate": {
        "operator": "ALL_EXACT",
        "required_envelope_fields": [
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
        "required_approval_facts": []
      },
      "required_layer3_bundle": [
        "engineering_rules",
        "product_prd"
      ],
      "allowed_evidence_ids": [],
      "target_stage": "03_contract",
      "transition": {
        "from_stage": "02_plan",
        "to_stage": "03_contract",
        "required_facts": [
          "plan_ready",
          "explicit_user_approval",
          "plan_binding_current"
        ],
        "automatic": false
      }
    },
    {
      "route_id": "route:03_contract:ui_ux",
      "selectors": {
        "workflow_stage": "03_contract",
        "task_domains": [
          "ui_ux"
        ]
      },
      "predicate": {
        "operator": "ALL_EXACT",
        "required_envelope_fields": [
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
        "required_approval_facts": []
      },
      "required_layer3_bundle": [
        "engineering_rules",
        "product_prd"
      ],
      "allowed_evidence_ids": [],
      "target_stage": "03_contract",
      "transition": {
        "from_stage": "02_plan",
        "to_stage": "03_contract",
        "required_facts": [
          "plan_ready",
          "explicit_user_approval",
          "plan_binding_current"
        ],
        "automatic": false
      }
    },
    {
      "route_id": "route:03_contract:system_architecture",
      "selectors": {
        "workflow_stage": "03_contract",
        "task_domains": [
          "system_architecture"
        ]
      },
      "predicate": {
        "operator": "ALL_EXACT",
        "required_envelope_fields": [
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
        "required_approval_facts": []
      },
      "required_layer3_bundle": [
        "engineering_rules",
        "architecture_manifest",
        "system_architecture"
      ],
      "allowed_evidence_ids": [],
      "target_stage": "03_contract",
      "transition": {
        "from_stage": "02_plan",
        "to_stage": "03_contract",
        "required_facts": [
          "plan_ready",
          "explicit_user_approval",
          "plan_binding_current"
        ],
        "automatic": false
      }
    },
    {
      "route_id": "route:03_contract:api_contract",
      "selectors": {
        "workflow_stage": "03_contract",
        "task_domains": [
          "api_contract"
        ]
      },
      "predicate": {
        "operator": "ALL_EXACT",
        "required_envelope_fields": [
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
        "required_approval_facts": []
      },
      "required_layer3_bundle": [
        "engineering_rules",
        "product_prd",
        "architecture_manifest",
        "system_architecture"
      ],
      "allowed_evidence_ids": [],
      "target_stage": "03_contract",
      "transition": {
        "from_stage": "02_plan",
        "to_stage": "03_contract",
        "required_facts": [
          "plan_ready",
          "explicit_user_approval",
          "plan_binding_current"
        ],
        "automatic": false
      }
    },
    {
      "route_id": "route:03_contract:database_rls",
      "selectors": {
        "workflow_stage": "03_contract",
        "task_domains": [
          "database_rls"
        ]
      },
      "predicate": {
        "operator": "ALL_EXACT",
        "required_envelope_fields": [
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
        "required_approval_facts": []
      },
      "required_layer3_bundle": [
        "engineering_rules",
        "architecture_manifest",
        "system_architecture"
      ],
      "allowed_evidence_ids": [],
      "target_stage": "03_contract",
      "transition": {
        "from_stage": "02_plan",
        "to_stage": "03_contract",
        "required_facts": [
          "plan_ready",
          "explicit_user_approval",
          "plan_binding_current"
        ],
        "automatic": false
      }
    },
    {
      "route_id": "route:03_contract:provider_integration",
      "selectors": {
        "workflow_stage": "03_contract",
        "task_domains": [
          "provider_integration"
        ]
      },
      "predicate": {
        "operator": "ALL_EXACT",
        "required_envelope_fields": [
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
        "required_approval_facts": []
      },
      "required_layer3_bundle": [
        "engineering_rules",
        "architecture_manifest",
        "system_architecture"
      ],
      "allowed_evidence_ids": [],
      "target_stage": "03_contract",
      "transition": {
        "from_stage": "02_plan",
        "to_stage": "03_contract",
        "required_facts": [
          "plan_ready",
          "explicit_user_approval",
          "plan_binding_current"
        ],
        "automatic": false
      }
    },
    {
      "route_id": "route:03_contract:security",
      "selectors": {
        "workflow_stage": "03_contract",
        "task_domains": [
          "security"
        ]
      },
      "predicate": {
        "operator": "ALL_EXACT",
        "required_envelope_fields": [
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
        "required_approval_facts": []
      },
      "required_layer3_bundle": [
        "engineering_rules",
        "architecture_manifest",
        "system_architecture"
      ],
      "allowed_evidence_ids": [],
      "target_stage": "03_contract",
      "transition": {
        "from_stage": "02_plan",
        "to_stage": "03_contract",
        "required_facts": [
          "plan_ready",
          "explicit_user_approval",
          "plan_binding_current"
        ],
        "automatic": false
      }
    },
    {
      "route_id": "route:03_contract:ci_cd",
      "selectors": {
        "workflow_stage": "03_contract",
        "task_domains": [
          "ci_cd"
        ]
      },
      "predicate": {
        "operator": "ALL_EXACT",
        "required_envelope_fields": [
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
        "required_approval_facts": []
      },
      "required_layer3_bundle": [
        "engineering_rules",
        "architecture_manifest",
        "system_architecture"
      ],
      "allowed_evidence_ids": [],
      "target_stage": "03_contract",
      "transition": {
        "from_stage": "02_plan",
        "to_stage": "03_contract",
        "required_facts": [
          "plan_ready",
          "explicit_user_approval",
          "plan_binding_current"
        ],
        "automatic": false
      }
    },
    {
      "route_id": "route:03_contract:testing",
      "selectors": {
        "workflow_stage": "03_contract",
        "task_domains": [
          "testing"
        ]
      },
      "predicate": {
        "operator": "ALL_EXACT",
        "required_envelope_fields": [
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
        "required_approval_facts": []
      },
      "required_layer3_bundle": [
        "engineering_rules",
        "architecture_manifest"
      ],
      "allowed_evidence_ids": [],
      "target_stage": "03_contract",
      "transition": {
        "from_stage": "02_plan",
        "to_stage": "03_contract",
        "required_facts": [
          "plan_ready",
          "explicit_user_approval",
          "plan_binding_current"
        ],
        "automatic": false
      }
    },
    {
      "route_id": "route:03_contract:ai_assessment",
      "selectors": {
        "workflow_stage": "03_contract",
        "task_domains": [
          "ai_assessment"
        ]
      },
      "predicate": {
        "operator": "ALL_EXACT",
        "required_envelope_fields": [
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
        "required_approval_facts": []
      },
      "required_layer3_bundle": [
        "engineering_rules",
        "product_prd",
        "architecture_manifest",
        "system_architecture"
      ],
      "allowed_evidence_ids": [],
      "target_stage": "03_contract",
      "transition": {
        "from_stage": "02_plan",
        "to_stage": "03_contract",
        "required_facts": [
          "plan_ready",
          "explicit_user_approval",
          "plan_binding_current"
        ],
        "automatic": false
      }
    },
    {
      "route_id": "route:03_contract:content_identity",
      "selectors": {
        "workflow_stage": "03_contract",
        "task_domains": [
          "content_identity"
        ]
      },
      "predicate": {
        "operator": "ALL_EXACT",
        "required_envelope_fields": [
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
        "required_approval_facts": []
      },
      "required_layer3_bundle": [
        "engineering_rules",
        "published_book"
      ],
      "allowed_evidence_ids": [],
      "target_stage": "03_contract",
      "transition": {
        "from_stage": "02_plan",
        "to_stage": "03_contract",
        "required_facts": [
          "plan_ready",
          "explicit_user_approval",
          "plan_binding_current"
        ],
        "automatic": false
      }
    },
    {
      "route_id": "route:03_contract:relationship_protocol",
      "selectors": {
        "workflow_stage": "03_contract",
        "task_domains": [
          "relationship_protocol"
        ]
      },
      "predicate": {
        "operator": "ALL_EXACT",
        "required_envelope_fields": [
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
        "required_approval_facts": []
      },
      "required_layer3_bundle": [
        "engineering_rules",
        "mros_v1_4"
      ],
      "allowed_evidence_ids": [],
      "target_stage": "03_contract",
      "transition": {
        "from_stage": "02_plan",
        "to_stage": "03_contract",
        "required_facts": [
          "plan_ready",
          "explicit_user_approval",
          "plan_binding_current"
        ],
        "automatic": false
      }
    },
    {
      "route_id": "route:03_contract:project_narrative",
      "selectors": {
        "workflow_stage": "03_contract",
        "task_domains": [
          "project_narrative"
        ]
      },
      "predicate": {
        "operator": "ALL_EXACT",
        "required_envelope_fields": [
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
        "required_approval_facts": []
      },
      "required_layer3_bundle": [
        "engineering_rules",
        "project_architecture",
        "master_story_bible",
        "product_vision"
      ],
      "allowed_evidence_ids": [],
      "target_stage": "03_contract",
      "transition": {
        "from_stage": "02_plan",
        "to_stage": "03_contract",
        "required_facts": [
          "plan_ready",
          "explicit_user_approval",
          "plan_binding_current"
        ],
        "automatic": false
      }
    },
    {
      "route_id": "route:03_contract:bug_repair",
      "selectors": {
        "workflow_stage": "03_contract",
        "task_domains": [
          "bug_repair"
        ]
      },
      "predicate": {
        "operator": "ALL_EXACT",
        "required_envelope_fields": [
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
        "required_approval_facts": []
      },
      "required_layer3_bundle": [
        "engineering_rules"
      ],
      "allowed_evidence_ids": [],
      "target_stage": "03_contract",
      "transition": {
        "from_stage": "02_plan",
        "to_stage": "03_contract",
        "required_facts": [
          "plan_ready",
          "explicit_user_approval",
          "plan_binding_current"
        ],
        "automatic": false
      }
    },
    {
      "route_id": "route:03_contract:release",
      "selectors": {
        "workflow_stage": "03_contract",
        "task_domains": [
          "release"
        ]
      },
      "predicate": {
        "operator": "ALL_EXACT",
        "required_envelope_fields": [
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
        "required_approval_facts": []
      },
      "required_layer3_bundle": [
        "engineering_rules",
        "architecture_manifest"
      ],
      "allowed_evidence_ids": [],
      "target_stage": "03_contract",
      "transition": {
        "from_stage": "02_plan",
        "to_stage": "03_contract",
        "required_facts": [
          "plan_ready",
          "explicit_user_approval",
          "plan_binding_current"
        ],
        "automatic": false
      }
    },
    {
      "route_id": "route:04_implement:governance",
      "selectors": {
        "workflow_stage": "04_implement",
        "task_domains": [
          "governance"
        ]
      },
      "predicate": {
        "operator": "ALL_EXACT",
        "required_envelope_fields": [
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
        "required_approval_facts": []
      },
      "required_layer3_bundle": [
        "engineering_rules",
        "architecture_manifest"
      ],
      "allowed_evidence_ids": [],
      "target_stage": "04_implement",
      "transition": {
        "from_stage": "03_contract",
        "to_stage": "04_implement",
        "required_facts": [
          "contract_ready",
          "approved_plan_binding_current",
          "G_PRE_CODE_READY"
        ],
        "automatic": true
      }
    },
    {
      "route_id": "route:04_implement:product_behavior",
      "selectors": {
        "workflow_stage": "04_implement",
        "task_domains": [
          "product_behavior"
        ]
      },
      "predicate": {
        "operator": "ALL_EXACT",
        "required_envelope_fields": [
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
        "required_approval_facts": []
      },
      "required_layer3_bundle": [
        "engineering_rules",
        "product_prd"
      ],
      "allowed_evidence_ids": [],
      "target_stage": "04_implement",
      "transition": {
        "from_stage": "03_contract",
        "to_stage": "04_implement",
        "required_facts": [
          "contract_ready",
          "approved_plan_binding_current",
          "G_PRE_CODE_READY"
        ],
        "automatic": true
      }
    },
    {
      "route_id": "route:04_implement:ui_ux",
      "selectors": {
        "workflow_stage": "04_implement",
        "task_domains": [
          "ui_ux"
        ]
      },
      "predicate": {
        "operator": "ALL_EXACT",
        "required_envelope_fields": [
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
        "required_approval_facts": []
      },
      "required_layer3_bundle": [
        "engineering_rules",
        "product_prd"
      ],
      "allowed_evidence_ids": [],
      "target_stage": "04_implement",
      "transition": {
        "from_stage": "03_contract",
        "to_stage": "04_implement",
        "required_facts": [
          "contract_ready",
          "approved_plan_binding_current",
          "G_PRE_CODE_READY"
        ],
        "automatic": true
      }
    },
    {
      "route_id": "route:04_implement:system_architecture",
      "selectors": {
        "workflow_stage": "04_implement",
        "task_domains": [
          "system_architecture"
        ]
      },
      "predicate": {
        "operator": "ALL_EXACT",
        "required_envelope_fields": [
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
        "required_approval_facts": []
      },
      "required_layer3_bundle": [
        "engineering_rules",
        "architecture_manifest",
        "system_architecture"
      ],
      "allowed_evidence_ids": [],
      "target_stage": "04_implement",
      "transition": {
        "from_stage": "03_contract",
        "to_stage": "04_implement",
        "required_facts": [
          "contract_ready",
          "approved_plan_binding_current",
          "G_PRE_CODE_READY"
        ],
        "automatic": true
      }
    },
    {
      "route_id": "route:04_implement:api_contract",
      "selectors": {
        "workflow_stage": "04_implement",
        "task_domains": [
          "api_contract"
        ]
      },
      "predicate": {
        "operator": "ALL_EXACT",
        "required_envelope_fields": [
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
        "required_approval_facts": []
      },
      "required_layer3_bundle": [
        "engineering_rules",
        "product_prd",
        "architecture_manifest",
        "system_architecture"
      ],
      "allowed_evidence_ids": [],
      "target_stage": "04_implement",
      "transition": {
        "from_stage": "03_contract",
        "to_stage": "04_implement",
        "required_facts": [
          "contract_ready",
          "approved_plan_binding_current",
          "G_PRE_CODE_READY"
        ],
        "automatic": true
      }
    },
    {
      "route_id": "route:04_implement:database_rls",
      "selectors": {
        "workflow_stage": "04_implement",
        "task_domains": [
          "database_rls"
        ]
      },
      "predicate": {
        "operator": "ALL_EXACT",
        "required_envelope_fields": [
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
        "required_approval_facts": []
      },
      "required_layer3_bundle": [
        "engineering_rules",
        "architecture_manifest",
        "system_architecture"
      ],
      "allowed_evidence_ids": [],
      "target_stage": "04_implement",
      "transition": {
        "from_stage": "03_contract",
        "to_stage": "04_implement",
        "required_facts": [
          "contract_ready",
          "approved_plan_binding_current",
          "G_PRE_CODE_READY"
        ],
        "automatic": true
      }
    },
    {
      "route_id": "route:04_implement:provider_integration",
      "selectors": {
        "workflow_stage": "04_implement",
        "task_domains": [
          "provider_integration"
        ]
      },
      "predicate": {
        "operator": "ALL_EXACT",
        "required_envelope_fields": [
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
        "required_approval_facts": []
      },
      "required_layer3_bundle": [
        "engineering_rules",
        "architecture_manifest",
        "system_architecture"
      ],
      "allowed_evidence_ids": [],
      "target_stage": "04_implement",
      "transition": {
        "from_stage": "03_contract",
        "to_stage": "04_implement",
        "required_facts": [
          "contract_ready",
          "approved_plan_binding_current",
          "G_PRE_CODE_READY"
        ],
        "automatic": true
      }
    },
    {
      "route_id": "route:04_implement:security",
      "selectors": {
        "workflow_stage": "04_implement",
        "task_domains": [
          "security"
        ]
      },
      "predicate": {
        "operator": "ALL_EXACT",
        "required_envelope_fields": [
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
        "required_approval_facts": []
      },
      "required_layer3_bundle": [
        "engineering_rules",
        "architecture_manifest",
        "system_architecture"
      ],
      "allowed_evidence_ids": [],
      "target_stage": "04_implement",
      "transition": {
        "from_stage": "03_contract",
        "to_stage": "04_implement",
        "required_facts": [
          "contract_ready",
          "approved_plan_binding_current",
          "G_PRE_CODE_READY"
        ],
        "automatic": true
      }
    },
    {
      "route_id": "route:04_implement:ci_cd",
      "selectors": {
        "workflow_stage": "04_implement",
        "task_domains": [
          "ci_cd"
        ]
      },
      "predicate": {
        "operator": "ALL_EXACT",
        "required_envelope_fields": [
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
        "required_approval_facts": []
      },
      "required_layer3_bundle": [
        "engineering_rules",
        "architecture_manifest",
        "system_architecture"
      ],
      "allowed_evidence_ids": [],
      "target_stage": "04_implement",
      "transition": {
        "from_stage": "03_contract",
        "to_stage": "04_implement",
        "required_facts": [
          "contract_ready",
          "approved_plan_binding_current",
          "G_PRE_CODE_READY"
        ],
        "automatic": true
      }
    },
    {
      "route_id": "route:04_implement:testing",
      "selectors": {
        "workflow_stage": "04_implement",
        "task_domains": [
          "testing"
        ]
      },
      "predicate": {
        "operator": "ALL_EXACT",
        "required_envelope_fields": [
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
        "required_approval_facts": []
      },
      "required_layer3_bundle": [
        "engineering_rules",
        "architecture_manifest"
      ],
      "allowed_evidence_ids": [],
      "target_stage": "04_implement",
      "transition": {
        "from_stage": "03_contract",
        "to_stage": "04_implement",
        "required_facts": [
          "contract_ready",
          "approved_plan_binding_current",
          "G_PRE_CODE_READY"
        ],
        "automatic": true
      }
    },
    {
      "route_id": "route:04_implement:ai_assessment",
      "selectors": {
        "workflow_stage": "04_implement",
        "task_domains": [
          "ai_assessment"
        ]
      },
      "predicate": {
        "operator": "ALL_EXACT",
        "required_envelope_fields": [
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
        "required_approval_facts": []
      },
      "required_layer3_bundle": [
        "engineering_rules",
        "product_prd",
        "architecture_manifest",
        "system_architecture"
      ],
      "allowed_evidence_ids": [],
      "target_stage": "04_implement",
      "transition": {
        "from_stage": "03_contract",
        "to_stage": "04_implement",
        "required_facts": [
          "contract_ready",
          "approved_plan_binding_current",
          "G_PRE_CODE_READY"
        ],
        "automatic": true
      }
    },
    {
      "route_id": "route:04_implement:content_identity",
      "selectors": {
        "workflow_stage": "04_implement",
        "task_domains": [
          "content_identity"
        ]
      },
      "predicate": {
        "operator": "ALL_EXACT",
        "required_envelope_fields": [
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
        "required_approval_facts": []
      },
      "required_layer3_bundle": [
        "engineering_rules",
        "published_book"
      ],
      "allowed_evidence_ids": [],
      "target_stage": "04_implement",
      "transition": {
        "from_stage": "03_contract",
        "to_stage": "04_implement",
        "required_facts": [
          "contract_ready",
          "approved_plan_binding_current",
          "G_PRE_CODE_READY"
        ],
        "automatic": true
      }
    },
    {
      "route_id": "route:04_implement:relationship_protocol",
      "selectors": {
        "workflow_stage": "04_implement",
        "task_domains": [
          "relationship_protocol"
        ]
      },
      "predicate": {
        "operator": "ALL_EXACT",
        "required_envelope_fields": [
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
        "required_approval_facts": []
      },
      "required_layer3_bundle": [
        "engineering_rules",
        "mros_v1_4"
      ],
      "allowed_evidence_ids": [],
      "target_stage": "04_implement",
      "transition": {
        "from_stage": "03_contract",
        "to_stage": "04_implement",
        "required_facts": [
          "contract_ready",
          "approved_plan_binding_current",
          "G_PRE_CODE_READY"
        ],
        "automatic": true
      }
    },
    {
      "route_id": "route:04_implement:project_narrative",
      "selectors": {
        "workflow_stage": "04_implement",
        "task_domains": [
          "project_narrative"
        ]
      },
      "predicate": {
        "operator": "ALL_EXACT",
        "required_envelope_fields": [
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
        "required_approval_facts": []
      },
      "required_layer3_bundle": [
        "engineering_rules",
        "project_architecture",
        "master_story_bible",
        "product_vision"
      ],
      "allowed_evidence_ids": [],
      "target_stage": "04_implement",
      "transition": {
        "from_stage": "03_contract",
        "to_stage": "04_implement",
        "required_facts": [
          "contract_ready",
          "approved_plan_binding_current",
          "G_PRE_CODE_READY"
        ],
        "automatic": true
      }
    },
    {
      "route_id": "route:04_implement:bug_repair",
      "selectors": {
        "workflow_stage": "04_implement",
        "task_domains": [
          "bug_repair"
        ]
      },
      "predicate": {
        "operator": "ALL_EXACT",
        "required_envelope_fields": [
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
        "required_approval_facts": []
      },
      "required_layer3_bundle": [
        "engineering_rules"
      ],
      "allowed_evidence_ids": [],
      "target_stage": "04_implement",
      "transition": {
        "from_stage": "03_contract",
        "to_stage": "04_implement",
        "required_facts": [
          "contract_ready",
          "approved_plan_binding_current",
          "G_PRE_CODE_READY"
        ],
        "automatic": true
      }
    },
    {
      "route_id": "route:04_implement:release",
      "selectors": {
        "workflow_stage": "04_implement",
        "task_domains": [
          "release"
        ]
      },
      "predicate": {
        "operator": "ALL_EXACT",
        "required_envelope_fields": [
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
        "required_approval_facts": []
      },
      "required_layer3_bundle": [
        "engineering_rules",
        "architecture_manifest"
      ],
      "allowed_evidence_ids": [],
      "target_stage": "04_implement",
      "transition": {
        "from_stage": "03_contract",
        "to_stage": "04_implement",
        "required_facts": [
          "contract_ready",
          "approved_plan_binding_current",
          "G_PRE_CODE_READY"
        ],
        "automatic": true
      }
    },
    {
      "route_id": "route:05_verify:governance",
      "selectors": {
        "workflow_stage": "05_verify",
        "task_domains": [
          "governance"
        ]
      },
      "predicate": {
        "operator": "ALL_EXACT",
        "required_envelope_fields": [
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
        "required_approval_facts": []
      },
      "required_layer3_bundle": [
        "engineering_rules",
        "architecture_manifest"
      ],
      "allowed_evidence_ids": [],
      "target_stage": "05_verify",
      "transition": {
        "from_stage": "04_implement",
        "to_stage": "05_verify",
        "required_facts": [
          "candidate_manifest_valid",
          "active_stop_condition_clear"
        ],
        "automatic": true
      }
    },
    {
      "route_id": "route:05_verify:product_behavior",
      "selectors": {
        "workflow_stage": "05_verify",
        "task_domains": [
          "product_behavior"
        ]
      },
      "predicate": {
        "operator": "ALL_EXACT",
        "required_envelope_fields": [
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
        "required_approval_facts": []
      },
      "required_layer3_bundle": [
        "engineering_rules",
        "product_prd"
      ],
      "allowed_evidence_ids": [],
      "target_stage": "05_verify",
      "transition": {
        "from_stage": "04_implement",
        "to_stage": "05_verify",
        "required_facts": [
          "candidate_manifest_valid",
          "active_stop_condition_clear"
        ],
        "automatic": true
      }
    },
    {
      "route_id": "route:05_verify:ui_ux",
      "selectors": {
        "workflow_stage": "05_verify",
        "task_domains": [
          "ui_ux"
        ]
      },
      "predicate": {
        "operator": "ALL_EXACT",
        "required_envelope_fields": [
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
        "required_approval_facts": []
      },
      "required_layer3_bundle": [
        "engineering_rules",
        "product_prd"
      ],
      "allowed_evidence_ids": [],
      "target_stage": "05_verify",
      "transition": {
        "from_stage": "04_implement",
        "to_stage": "05_verify",
        "required_facts": [
          "candidate_manifest_valid",
          "active_stop_condition_clear"
        ],
        "automatic": true
      }
    },
    {
      "route_id": "route:05_verify:system_architecture",
      "selectors": {
        "workflow_stage": "05_verify",
        "task_domains": [
          "system_architecture"
        ]
      },
      "predicate": {
        "operator": "ALL_EXACT",
        "required_envelope_fields": [
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
        "required_approval_facts": []
      },
      "required_layer3_bundle": [
        "engineering_rules",
        "architecture_manifest",
        "system_architecture"
      ],
      "allowed_evidence_ids": [],
      "target_stage": "05_verify",
      "transition": {
        "from_stage": "04_implement",
        "to_stage": "05_verify",
        "required_facts": [
          "candidate_manifest_valid",
          "active_stop_condition_clear"
        ],
        "automatic": true
      }
    },
    {
      "route_id": "route:05_verify:api_contract",
      "selectors": {
        "workflow_stage": "05_verify",
        "task_domains": [
          "api_contract"
        ]
      },
      "predicate": {
        "operator": "ALL_EXACT",
        "required_envelope_fields": [
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
        "required_approval_facts": []
      },
      "required_layer3_bundle": [
        "engineering_rules",
        "product_prd",
        "architecture_manifest",
        "system_architecture"
      ],
      "allowed_evidence_ids": [],
      "target_stage": "05_verify",
      "transition": {
        "from_stage": "04_implement",
        "to_stage": "05_verify",
        "required_facts": [
          "candidate_manifest_valid",
          "active_stop_condition_clear"
        ],
        "automatic": true
      }
    },
    {
      "route_id": "route:05_verify:database_rls",
      "selectors": {
        "workflow_stage": "05_verify",
        "task_domains": [
          "database_rls"
        ]
      },
      "predicate": {
        "operator": "ALL_EXACT",
        "required_envelope_fields": [
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
        "required_approval_facts": []
      },
      "required_layer3_bundle": [
        "engineering_rules",
        "architecture_manifest",
        "system_architecture"
      ],
      "allowed_evidence_ids": [],
      "target_stage": "05_verify",
      "transition": {
        "from_stage": "04_implement",
        "to_stage": "05_verify",
        "required_facts": [
          "candidate_manifest_valid",
          "active_stop_condition_clear"
        ],
        "automatic": true
      }
    },
    {
      "route_id": "route:05_verify:provider_integration",
      "selectors": {
        "workflow_stage": "05_verify",
        "task_domains": [
          "provider_integration"
        ]
      },
      "predicate": {
        "operator": "ALL_EXACT",
        "required_envelope_fields": [
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
        "required_approval_facts": []
      },
      "required_layer3_bundle": [
        "engineering_rules",
        "architecture_manifest",
        "system_architecture"
      ],
      "allowed_evidence_ids": [],
      "target_stage": "05_verify",
      "transition": {
        "from_stage": "04_implement",
        "to_stage": "05_verify",
        "required_facts": [
          "candidate_manifest_valid",
          "active_stop_condition_clear"
        ],
        "automatic": true
      }
    },
    {
      "route_id": "route:05_verify:security",
      "selectors": {
        "workflow_stage": "05_verify",
        "task_domains": [
          "security"
        ]
      },
      "predicate": {
        "operator": "ALL_EXACT",
        "required_envelope_fields": [
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
        "required_approval_facts": []
      },
      "required_layer3_bundle": [
        "engineering_rules",
        "architecture_manifest",
        "system_architecture"
      ],
      "allowed_evidence_ids": [],
      "target_stage": "05_verify",
      "transition": {
        "from_stage": "04_implement",
        "to_stage": "05_verify",
        "required_facts": [
          "candidate_manifest_valid",
          "active_stop_condition_clear"
        ],
        "automatic": true
      }
    },
    {
      "route_id": "route:05_verify:ci_cd",
      "selectors": {
        "workflow_stage": "05_verify",
        "task_domains": [
          "ci_cd"
        ]
      },
      "predicate": {
        "operator": "ALL_EXACT",
        "required_envelope_fields": [
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
        "required_approval_facts": []
      },
      "required_layer3_bundle": [
        "engineering_rules",
        "architecture_manifest",
        "system_architecture"
      ],
      "allowed_evidence_ids": [],
      "target_stage": "05_verify",
      "transition": {
        "from_stage": "04_implement",
        "to_stage": "05_verify",
        "required_facts": [
          "candidate_manifest_valid",
          "active_stop_condition_clear"
        ],
        "automatic": true
      }
    },
    {
      "route_id": "route:05_verify:testing",
      "selectors": {
        "workflow_stage": "05_verify",
        "task_domains": [
          "testing"
        ]
      },
      "predicate": {
        "operator": "ALL_EXACT",
        "required_envelope_fields": [
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
        "required_approval_facts": []
      },
      "required_layer3_bundle": [
        "engineering_rules",
        "architecture_manifest"
      ],
      "allowed_evidence_ids": [],
      "target_stage": "05_verify",
      "transition": {
        "from_stage": "04_implement",
        "to_stage": "05_verify",
        "required_facts": [
          "candidate_manifest_valid",
          "active_stop_condition_clear"
        ],
        "automatic": true
      }
    },
    {
      "route_id": "route:05_verify:ai_assessment",
      "selectors": {
        "workflow_stage": "05_verify",
        "task_domains": [
          "ai_assessment"
        ]
      },
      "predicate": {
        "operator": "ALL_EXACT",
        "required_envelope_fields": [
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
        "required_approval_facts": []
      },
      "required_layer3_bundle": [
        "engineering_rules",
        "product_prd",
        "architecture_manifest",
        "system_architecture"
      ],
      "allowed_evidence_ids": [],
      "target_stage": "05_verify",
      "transition": {
        "from_stage": "04_implement",
        "to_stage": "05_verify",
        "required_facts": [
          "candidate_manifest_valid",
          "active_stop_condition_clear"
        ],
        "automatic": true
      }
    },
    {
      "route_id": "route:05_verify:content_identity",
      "selectors": {
        "workflow_stage": "05_verify",
        "task_domains": [
          "content_identity"
        ]
      },
      "predicate": {
        "operator": "ALL_EXACT",
        "required_envelope_fields": [
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
        "required_approval_facts": []
      },
      "required_layer3_bundle": [
        "engineering_rules",
        "published_book"
      ],
      "allowed_evidence_ids": [],
      "target_stage": "05_verify",
      "transition": {
        "from_stage": "04_implement",
        "to_stage": "05_verify",
        "required_facts": [
          "candidate_manifest_valid",
          "active_stop_condition_clear"
        ],
        "automatic": true
      }
    },
    {
      "route_id": "route:05_verify:relationship_protocol",
      "selectors": {
        "workflow_stage": "05_verify",
        "task_domains": [
          "relationship_protocol"
        ]
      },
      "predicate": {
        "operator": "ALL_EXACT",
        "required_envelope_fields": [
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
        "required_approval_facts": []
      },
      "required_layer3_bundle": [
        "engineering_rules",
        "mros_v1_4"
      ],
      "allowed_evidence_ids": [],
      "target_stage": "05_verify",
      "transition": {
        "from_stage": "04_implement",
        "to_stage": "05_verify",
        "required_facts": [
          "candidate_manifest_valid",
          "active_stop_condition_clear"
        ],
        "automatic": true
      }
    },
    {
      "route_id": "route:05_verify:project_narrative",
      "selectors": {
        "workflow_stage": "05_verify",
        "task_domains": [
          "project_narrative"
        ]
      },
      "predicate": {
        "operator": "ALL_EXACT",
        "required_envelope_fields": [
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
        "required_approval_facts": []
      },
      "required_layer3_bundle": [
        "engineering_rules",
        "project_architecture",
        "master_story_bible",
        "product_vision"
      ],
      "allowed_evidence_ids": [],
      "target_stage": "05_verify",
      "transition": {
        "from_stage": "04_implement",
        "to_stage": "05_verify",
        "required_facts": [
          "candidate_manifest_valid",
          "active_stop_condition_clear"
        ],
        "automatic": true
      }
    },
    {
      "route_id": "route:05_verify:bug_repair",
      "selectors": {
        "workflow_stage": "05_verify",
        "task_domains": [
          "bug_repair"
        ]
      },
      "predicate": {
        "operator": "ALL_EXACT",
        "required_envelope_fields": [
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
        "required_approval_facts": []
      },
      "required_layer3_bundle": [
        "engineering_rules"
      ],
      "allowed_evidence_ids": [],
      "target_stage": "05_verify",
      "transition": {
        "from_stage": "04_implement",
        "to_stage": "05_verify",
        "required_facts": [
          "candidate_manifest_valid",
          "active_stop_condition_clear"
        ],
        "automatic": true
      }
    },
    {
      "route_id": "route:05_verify:release",
      "selectors": {
        "workflow_stage": "05_verify",
        "task_domains": [
          "release"
        ]
      },
      "predicate": {
        "operator": "ALL_EXACT",
        "required_envelope_fields": [
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
        "required_approval_facts": []
      },
      "required_layer3_bundle": [
        "engineering_rules",
        "architecture_manifest"
      ],
      "allowed_evidence_ids": [],
      "target_stage": "05_verify",
      "transition": {
        "from_stage": "04_implement",
        "to_stage": "05_verify",
        "required_facts": [
          "candidate_manifest_valid",
          "active_stop_condition_clear"
        ],
        "automatic": true
      }
    },
    {
      "route_id": "route:06_review:governance",
      "selectors": {
        "workflow_stage": "06_review",
        "task_domains": [
          "governance"
        ]
      },
      "predicate": {
        "operator": "ALL_EXACT",
        "required_envelope_fields": [
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
        "required_approval_facts": []
      },
      "required_layer3_bundle": [
        "engineering_rules",
        "architecture_manifest"
      ],
      "allowed_evidence_ids": [],
      "target_stage": "06_review",
      "transition": {
        "from_stage": "05_verify",
        "to_stage": "06_review",
        "required_facts": [
          "verification_pass",
          "exact_state_binding"
        ],
        "automatic": true
      }
    },
    {
      "route_id": "route:06_review:product_behavior",
      "selectors": {
        "workflow_stage": "06_review",
        "task_domains": [
          "product_behavior"
        ]
      },
      "predicate": {
        "operator": "ALL_EXACT",
        "required_envelope_fields": [
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
        "required_approval_facts": []
      },
      "required_layer3_bundle": [
        "engineering_rules",
        "architecture_manifest",
        "product_prd"
      ],
      "allowed_evidence_ids": [],
      "target_stage": "06_review",
      "transition": {
        "from_stage": "05_verify",
        "to_stage": "06_review",
        "required_facts": [
          "verification_pass",
          "exact_state_binding"
        ],
        "automatic": true
      }
    },
    {
      "route_id": "route:06_review:ui_ux",
      "selectors": {
        "workflow_stage": "06_review",
        "task_domains": [
          "ui_ux"
        ]
      },
      "predicate": {
        "operator": "ALL_EXACT",
        "required_envelope_fields": [
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
        "required_approval_facts": []
      },
      "required_layer3_bundle": [
        "engineering_rules",
        "architecture_manifest",
        "product_prd"
      ],
      "allowed_evidence_ids": [],
      "target_stage": "06_review",
      "transition": {
        "from_stage": "05_verify",
        "to_stage": "06_review",
        "required_facts": [
          "verification_pass",
          "exact_state_binding"
        ],
        "automatic": true
      }
    },
    {
      "route_id": "route:06_review:system_architecture",
      "selectors": {
        "workflow_stage": "06_review",
        "task_domains": [
          "system_architecture"
        ]
      },
      "predicate": {
        "operator": "ALL_EXACT",
        "required_envelope_fields": [
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
        "required_approval_facts": []
      },
      "required_layer3_bundle": [
        "engineering_rules",
        "architecture_manifest",
        "system_architecture"
      ],
      "allowed_evidence_ids": [],
      "target_stage": "06_review",
      "transition": {
        "from_stage": "05_verify",
        "to_stage": "06_review",
        "required_facts": [
          "verification_pass",
          "exact_state_binding"
        ],
        "automatic": true
      }
    },
    {
      "route_id": "route:06_review:api_contract",
      "selectors": {
        "workflow_stage": "06_review",
        "task_domains": [
          "api_contract"
        ]
      },
      "predicate": {
        "operator": "ALL_EXACT",
        "required_envelope_fields": [
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
        "required_approval_facts": []
      },
      "required_layer3_bundle": [
        "engineering_rules",
        "architecture_manifest",
        "product_prd",
        "system_architecture"
      ],
      "allowed_evidence_ids": [],
      "target_stage": "06_review",
      "transition": {
        "from_stage": "05_verify",
        "to_stage": "06_review",
        "required_facts": [
          "verification_pass",
          "exact_state_binding"
        ],
        "automatic": true
      }
    },
    {
      "route_id": "route:06_review:database_rls",
      "selectors": {
        "workflow_stage": "06_review",
        "task_domains": [
          "database_rls"
        ]
      },
      "predicate": {
        "operator": "ALL_EXACT",
        "required_envelope_fields": [
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
        "required_approval_facts": []
      },
      "required_layer3_bundle": [
        "engineering_rules",
        "architecture_manifest",
        "system_architecture"
      ],
      "allowed_evidence_ids": [],
      "target_stage": "06_review",
      "transition": {
        "from_stage": "05_verify",
        "to_stage": "06_review",
        "required_facts": [
          "verification_pass",
          "exact_state_binding"
        ],
        "automatic": true
      }
    },
    {
      "route_id": "route:06_review:provider_integration",
      "selectors": {
        "workflow_stage": "06_review",
        "task_domains": [
          "provider_integration"
        ]
      },
      "predicate": {
        "operator": "ALL_EXACT",
        "required_envelope_fields": [
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
        "required_approval_facts": []
      },
      "required_layer3_bundle": [
        "engineering_rules",
        "architecture_manifest",
        "system_architecture"
      ],
      "allowed_evidence_ids": [],
      "target_stage": "06_review",
      "transition": {
        "from_stage": "05_verify",
        "to_stage": "06_review",
        "required_facts": [
          "verification_pass",
          "exact_state_binding"
        ],
        "automatic": true
      }
    },
    {
      "route_id": "route:06_review:security",
      "selectors": {
        "workflow_stage": "06_review",
        "task_domains": [
          "security"
        ]
      },
      "predicate": {
        "operator": "ALL_EXACT",
        "required_envelope_fields": [
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
        "required_approval_facts": []
      },
      "required_layer3_bundle": [
        "engineering_rules",
        "architecture_manifest",
        "system_architecture"
      ],
      "allowed_evidence_ids": [],
      "target_stage": "06_review",
      "transition": {
        "from_stage": "05_verify",
        "to_stage": "06_review",
        "required_facts": [
          "verification_pass",
          "exact_state_binding"
        ],
        "automatic": true
      }
    },
    {
      "route_id": "route:06_review:ci_cd",
      "selectors": {
        "workflow_stage": "06_review",
        "task_domains": [
          "ci_cd"
        ]
      },
      "predicate": {
        "operator": "ALL_EXACT",
        "required_envelope_fields": [
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
        "required_approval_facts": []
      },
      "required_layer3_bundle": [
        "engineering_rules",
        "architecture_manifest",
        "system_architecture"
      ],
      "allowed_evidence_ids": [],
      "target_stage": "06_review",
      "transition": {
        "from_stage": "05_verify",
        "to_stage": "06_review",
        "required_facts": [
          "verification_pass",
          "exact_state_binding"
        ],
        "automatic": true
      }
    },
    {
      "route_id": "route:06_review:testing",
      "selectors": {
        "workflow_stage": "06_review",
        "task_domains": [
          "testing"
        ]
      },
      "predicate": {
        "operator": "ALL_EXACT",
        "required_envelope_fields": [
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
        "required_approval_facts": []
      },
      "required_layer3_bundle": [
        "engineering_rules",
        "architecture_manifest"
      ],
      "allowed_evidence_ids": [],
      "target_stage": "06_review",
      "transition": {
        "from_stage": "05_verify",
        "to_stage": "06_review",
        "required_facts": [
          "verification_pass",
          "exact_state_binding"
        ],
        "automatic": true
      }
    },
    {
      "route_id": "route:06_review:ai_assessment",
      "selectors": {
        "workflow_stage": "06_review",
        "task_domains": [
          "ai_assessment"
        ]
      },
      "predicate": {
        "operator": "ALL_EXACT",
        "required_envelope_fields": [
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
        "required_approval_facts": []
      },
      "required_layer3_bundle": [
        "engineering_rules",
        "architecture_manifest",
        "product_prd",
        "system_architecture"
      ],
      "allowed_evidence_ids": [],
      "target_stage": "06_review",
      "transition": {
        "from_stage": "05_verify",
        "to_stage": "06_review",
        "required_facts": [
          "verification_pass",
          "exact_state_binding"
        ],
        "automatic": true
      }
    },
    {
      "route_id": "route:06_review:content_identity",
      "selectors": {
        "workflow_stage": "06_review",
        "task_domains": [
          "content_identity"
        ]
      },
      "predicate": {
        "operator": "ALL_EXACT",
        "required_envelope_fields": [
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
        "required_approval_facts": []
      },
      "required_layer3_bundle": [
        "engineering_rules",
        "architecture_manifest",
        "published_book"
      ],
      "allowed_evidence_ids": [],
      "target_stage": "06_review",
      "transition": {
        "from_stage": "05_verify",
        "to_stage": "06_review",
        "required_facts": [
          "verification_pass",
          "exact_state_binding"
        ],
        "automatic": true
      }
    },
    {
      "route_id": "route:06_review:relationship_protocol",
      "selectors": {
        "workflow_stage": "06_review",
        "task_domains": [
          "relationship_protocol"
        ]
      },
      "predicate": {
        "operator": "ALL_EXACT",
        "required_envelope_fields": [
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
        "required_approval_facts": []
      },
      "required_layer3_bundle": [
        "engineering_rules",
        "architecture_manifest",
        "mros_v1_4"
      ],
      "allowed_evidence_ids": [],
      "target_stage": "06_review",
      "transition": {
        "from_stage": "05_verify",
        "to_stage": "06_review",
        "required_facts": [
          "verification_pass",
          "exact_state_binding"
        ],
        "automatic": true
      }
    },
    {
      "route_id": "route:06_review:project_narrative",
      "selectors": {
        "workflow_stage": "06_review",
        "task_domains": [
          "project_narrative"
        ]
      },
      "predicate": {
        "operator": "ALL_EXACT",
        "required_envelope_fields": [
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
        "required_approval_facts": []
      },
      "required_layer3_bundle": [
        "engineering_rules",
        "architecture_manifest",
        "project_architecture",
        "master_story_bible",
        "product_vision"
      ],
      "allowed_evidence_ids": [],
      "target_stage": "06_review",
      "transition": {
        "from_stage": "05_verify",
        "to_stage": "06_review",
        "required_facts": [
          "verification_pass",
          "exact_state_binding"
        ],
        "automatic": true
      }
    },
    {
      "route_id": "route:06_review:bug_repair",
      "selectors": {
        "workflow_stage": "06_review",
        "task_domains": [
          "bug_repair"
        ]
      },
      "predicate": {
        "operator": "ALL_EXACT",
        "required_envelope_fields": [
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
        "required_approval_facts": []
      },
      "required_layer3_bundle": [
        "engineering_rules",
        "architecture_manifest"
      ],
      "allowed_evidence_ids": [],
      "target_stage": "06_review",
      "transition": {
        "from_stage": "05_verify",
        "to_stage": "06_review",
        "required_facts": [
          "verification_pass",
          "exact_state_binding"
        ],
        "automatic": true
      }
    },
    {
      "route_id": "route:06_review:release",
      "selectors": {
        "workflow_stage": "06_review",
        "task_domains": [
          "release"
        ]
      },
      "predicate": {
        "operator": "ALL_EXACT",
        "required_envelope_fields": [
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
        "required_approval_facts": []
      },
      "required_layer3_bundle": [
        "engineering_rules",
        "architecture_manifest"
      ],
      "allowed_evidence_ids": [],
      "target_stage": "06_review",
      "transition": {
        "from_stage": "05_verify",
        "to_stage": "06_review",
        "required_facts": [
          "verification_pass",
          "exact_state_binding"
        ],
        "automatic": true
      }
    },
    {
      "route_id": "route:07_release:governance",
      "selectors": {
        "workflow_stage": "07_release",
        "task_domains": [
          "governance"
        ]
      },
      "predicate": {
        "operator": "ALL_EXACT",
        "required_envelope_fields": [
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
        "required_approval_facts": []
      },
      "required_layer3_bundle": [
        "engineering_rules",
        "architecture_manifest"
      ],
      "allowed_evidence_ids": [],
      "target_stage": "07_release",
      "transition": {
        "from_stage": "06_review",
        "to_stage": "07_release",
        "required_facts": [
          "review_clear",
          "exact_head_ci_pass",
          "zero_actionable_findings"
        ],
        "automatic": true
      }
    },
    {
      "route_id": "route:07_release:product_behavior",
      "selectors": {
        "workflow_stage": "07_release",
        "task_domains": [
          "product_behavior"
        ]
      },
      "predicate": {
        "operator": "ALL_EXACT",
        "required_envelope_fields": [
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
        "required_approval_facts": []
      },
      "required_layer3_bundle": [
        "engineering_rules",
        "architecture_manifest",
        "product_prd"
      ],
      "allowed_evidence_ids": [],
      "target_stage": "07_release",
      "transition": {
        "from_stage": "06_review",
        "to_stage": "07_release",
        "required_facts": [
          "review_clear",
          "exact_head_ci_pass",
          "zero_actionable_findings"
        ],
        "automatic": true
      }
    },
    {
      "route_id": "route:07_release:ui_ux",
      "selectors": {
        "workflow_stage": "07_release",
        "task_domains": [
          "ui_ux"
        ]
      },
      "predicate": {
        "operator": "ALL_EXACT",
        "required_envelope_fields": [
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
        "required_approval_facts": []
      },
      "required_layer3_bundle": [
        "engineering_rules",
        "architecture_manifest",
        "product_prd"
      ],
      "allowed_evidence_ids": [],
      "target_stage": "07_release",
      "transition": {
        "from_stage": "06_review",
        "to_stage": "07_release",
        "required_facts": [
          "review_clear",
          "exact_head_ci_pass",
          "zero_actionable_findings"
        ],
        "automatic": true
      }
    },
    {
      "route_id": "route:07_release:system_architecture",
      "selectors": {
        "workflow_stage": "07_release",
        "task_domains": [
          "system_architecture"
        ]
      },
      "predicate": {
        "operator": "ALL_EXACT",
        "required_envelope_fields": [
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
        "required_approval_facts": []
      },
      "required_layer3_bundle": [
        "engineering_rules",
        "architecture_manifest",
        "system_architecture"
      ],
      "allowed_evidence_ids": [],
      "target_stage": "07_release",
      "transition": {
        "from_stage": "06_review",
        "to_stage": "07_release",
        "required_facts": [
          "review_clear",
          "exact_head_ci_pass",
          "zero_actionable_findings"
        ],
        "automatic": true
      }
    },
    {
      "route_id": "route:07_release:api_contract",
      "selectors": {
        "workflow_stage": "07_release",
        "task_domains": [
          "api_contract"
        ]
      },
      "predicate": {
        "operator": "ALL_EXACT",
        "required_envelope_fields": [
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
        "required_approval_facts": []
      },
      "required_layer3_bundle": [
        "engineering_rules",
        "architecture_manifest",
        "product_prd",
        "system_architecture"
      ],
      "allowed_evidence_ids": [],
      "target_stage": "07_release",
      "transition": {
        "from_stage": "06_review",
        "to_stage": "07_release",
        "required_facts": [
          "review_clear",
          "exact_head_ci_pass",
          "zero_actionable_findings"
        ],
        "automatic": true
      }
    },
    {
      "route_id": "route:07_release:database_rls",
      "selectors": {
        "workflow_stage": "07_release",
        "task_domains": [
          "database_rls"
        ]
      },
      "predicate": {
        "operator": "ALL_EXACT",
        "required_envelope_fields": [
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
        "required_approval_facts": []
      },
      "required_layer3_bundle": [
        "engineering_rules",
        "architecture_manifest",
        "system_architecture"
      ],
      "allowed_evidence_ids": [],
      "target_stage": "07_release",
      "transition": {
        "from_stage": "06_review",
        "to_stage": "07_release",
        "required_facts": [
          "review_clear",
          "exact_head_ci_pass",
          "zero_actionable_findings"
        ],
        "automatic": true
      }
    },
    {
      "route_id": "route:07_release:provider_integration",
      "selectors": {
        "workflow_stage": "07_release",
        "task_domains": [
          "provider_integration"
        ]
      },
      "predicate": {
        "operator": "ALL_EXACT",
        "required_envelope_fields": [
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
        "required_approval_facts": []
      },
      "required_layer3_bundle": [
        "engineering_rules",
        "architecture_manifest",
        "system_architecture"
      ],
      "allowed_evidence_ids": [],
      "target_stage": "07_release",
      "transition": {
        "from_stage": "06_review",
        "to_stage": "07_release",
        "required_facts": [
          "review_clear",
          "exact_head_ci_pass",
          "zero_actionable_findings"
        ],
        "automatic": true
      }
    },
    {
      "route_id": "route:07_release:security",
      "selectors": {
        "workflow_stage": "07_release",
        "task_domains": [
          "security"
        ]
      },
      "predicate": {
        "operator": "ALL_EXACT",
        "required_envelope_fields": [
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
        "required_approval_facts": []
      },
      "required_layer3_bundle": [
        "engineering_rules",
        "architecture_manifest",
        "system_architecture"
      ],
      "allowed_evidence_ids": [],
      "target_stage": "07_release",
      "transition": {
        "from_stage": "06_review",
        "to_stage": "07_release",
        "required_facts": [
          "review_clear",
          "exact_head_ci_pass",
          "zero_actionable_findings"
        ],
        "automatic": true
      }
    },
    {
      "route_id": "route:07_release:ci_cd",
      "selectors": {
        "workflow_stage": "07_release",
        "task_domains": [
          "ci_cd"
        ]
      },
      "predicate": {
        "operator": "ALL_EXACT",
        "required_envelope_fields": [
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
        "required_approval_facts": []
      },
      "required_layer3_bundle": [
        "engineering_rules",
        "architecture_manifest",
        "system_architecture"
      ],
      "allowed_evidence_ids": [],
      "target_stage": "07_release",
      "transition": {
        "from_stage": "06_review",
        "to_stage": "07_release",
        "required_facts": [
          "review_clear",
          "exact_head_ci_pass",
          "zero_actionable_findings"
        ],
        "automatic": true
      }
    },
    {
      "route_id": "route:07_release:testing",
      "selectors": {
        "workflow_stage": "07_release",
        "task_domains": [
          "testing"
        ]
      },
      "predicate": {
        "operator": "ALL_EXACT",
        "required_envelope_fields": [
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
        "required_approval_facts": []
      },
      "required_layer3_bundle": [
        "engineering_rules",
        "architecture_manifest"
      ],
      "allowed_evidence_ids": [],
      "target_stage": "07_release",
      "transition": {
        "from_stage": "06_review",
        "to_stage": "07_release",
        "required_facts": [
          "review_clear",
          "exact_head_ci_pass",
          "zero_actionable_findings"
        ],
        "automatic": true
      }
    },
    {
      "route_id": "route:07_release:ai_assessment",
      "selectors": {
        "workflow_stage": "07_release",
        "task_domains": [
          "ai_assessment"
        ]
      },
      "predicate": {
        "operator": "ALL_EXACT",
        "required_envelope_fields": [
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
        "required_approval_facts": []
      },
      "required_layer3_bundle": [
        "engineering_rules",
        "architecture_manifest",
        "product_prd",
        "system_architecture"
      ],
      "allowed_evidence_ids": [],
      "target_stage": "07_release",
      "transition": {
        "from_stage": "06_review",
        "to_stage": "07_release",
        "required_facts": [
          "review_clear",
          "exact_head_ci_pass",
          "zero_actionable_findings"
        ],
        "automatic": true
      }
    },
    {
      "route_id": "route:07_release:content_identity",
      "selectors": {
        "workflow_stage": "07_release",
        "task_domains": [
          "content_identity"
        ]
      },
      "predicate": {
        "operator": "ALL_EXACT",
        "required_envelope_fields": [
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
        "required_approval_facts": []
      },
      "required_layer3_bundle": [
        "engineering_rules",
        "architecture_manifest",
        "published_book"
      ],
      "allowed_evidence_ids": [],
      "target_stage": "07_release",
      "transition": {
        "from_stage": "06_review",
        "to_stage": "07_release",
        "required_facts": [
          "review_clear",
          "exact_head_ci_pass",
          "zero_actionable_findings"
        ],
        "automatic": true
      }
    },
    {
      "route_id": "route:07_release:relationship_protocol",
      "selectors": {
        "workflow_stage": "07_release",
        "task_domains": [
          "relationship_protocol"
        ]
      },
      "predicate": {
        "operator": "ALL_EXACT",
        "required_envelope_fields": [
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
        "required_approval_facts": []
      },
      "required_layer3_bundle": [
        "engineering_rules",
        "architecture_manifest",
        "mros_v1_4"
      ],
      "allowed_evidence_ids": [],
      "target_stage": "07_release",
      "transition": {
        "from_stage": "06_review",
        "to_stage": "07_release",
        "required_facts": [
          "review_clear",
          "exact_head_ci_pass",
          "zero_actionable_findings"
        ],
        "automatic": true
      }
    },
    {
      "route_id": "route:07_release:project_narrative",
      "selectors": {
        "workflow_stage": "07_release",
        "task_domains": [
          "project_narrative"
        ]
      },
      "predicate": {
        "operator": "ALL_EXACT",
        "required_envelope_fields": [
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
        "required_approval_facts": []
      },
      "required_layer3_bundle": [
        "engineering_rules",
        "architecture_manifest",
        "project_architecture",
        "master_story_bible",
        "product_vision"
      ],
      "allowed_evidence_ids": [],
      "target_stage": "07_release",
      "transition": {
        "from_stage": "06_review",
        "to_stage": "07_release",
        "required_facts": [
          "review_clear",
          "exact_head_ci_pass",
          "zero_actionable_findings"
        ],
        "automatic": true
      }
    },
    {
      "route_id": "route:07_release:bug_repair",
      "selectors": {
        "workflow_stage": "07_release",
        "task_domains": [
          "bug_repair"
        ]
      },
      "predicate": {
        "operator": "ALL_EXACT",
        "required_envelope_fields": [
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
        "required_approval_facts": []
      },
      "required_layer3_bundle": [
        "engineering_rules",
        "architecture_manifest"
      ],
      "allowed_evidence_ids": [],
      "target_stage": "07_release",
      "transition": {
        "from_stage": "06_review",
        "to_stage": "07_release",
        "required_facts": [
          "review_clear",
          "exact_head_ci_pass",
          "zero_actionable_findings"
        ],
        "automatic": true
      }
    },
    {
      "route_id": "route:07_release:release",
      "selectors": {
        "workflow_stage": "07_release",
        "task_domains": [
          "release"
        ]
      },
      "predicate": {
        "operator": "ALL_EXACT",
        "required_envelope_fields": [
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
        "required_approval_facts": []
      },
      "required_layer3_bundle": [
        "engineering_rules",
        "architecture_manifest"
      ],
      "allowed_evidence_ids": [],
      "target_stage": "07_release",
      "transition": {
        "from_stage": "06_review",
        "to_stage": "07_release",
        "required_facts": [
          "review_clear",
          "exact_head_ci_pass",
          "zero_actionable_findings"
        ],
        "automatic": true
      }
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
  E.workflow_stage = r.selectors.workflow_stage
  AND set(E.task_domains) = set(r.selectors.task_domains)
  AND every(r.predicate.required_envelope_fields is present and non-null in E)
  AND every(r.required_layer3_bundle resolves exactly once)
  AND every(E.selected_evidence_ids is in r.allowed_evidence_ids)

M(E) := { r in Routes | MATCH(E,r) = TRUE }
G_ROUTE_UNIQUE(E) := |M(E)| = 1
```

- `|M(E)| = 0` -> `ROUTE_ZERO_MATCH`.
- `|M(E)| > 1` -> `ROUTE_MULTI_MATCH`.
- Exactly one match yields exactly one `route_id`, `target_stage`, Layer 3 bundle, evidence allowlist, and transition contract.

No semantic similarity, fallback route, "best fit", inferred task domain, or inferred source selector is permitted.

## Source Loading

After one route matches:

1. read the selected Layer 2 stage contract;
2. read only the route's exact Layer 3 bundle;
3. for a source with `section_policy = "full"`, caller selector `["*"]` means full-document access only and is not a path wildcard;
4. for `explicit_selector_required`, require an exact non-wildcard section selector;
5. load only exact prior outputs, exact workpiece paths, and exact evidence IDs declared by the envelope and allowed by the route.

Missing source, stale binding, unauthorized input, or evidence promotion returns C4 `BLOCKED`.

## Evidence Boundary

`docs/evidence/**` is Layer 4 proof only. Evidence cannot create requirements, permissions, waivers, route choice, transition authority, or merge authority.

The bootstrap route matrix sets `allowed_evidence_ids` to an empty array for every initial route. Evidence remains inaccessible until a later authorized governance change binds exact evidence IDs to exact routes and the C5 evidence index exists.

## Skills

Skills are subordinate stage procedures, never routing authority.

- `01_scout` may load `.claude/skills/scout-agent/SKILL.md`.
- `02_plan` may load `.claude/skills/plan/SKILL.md`.
- Other stages load no skill unless a later authorized route explicitly names one.

A skill cannot invoke another skill or grant write, review, PASS, release, or merge authority.

## BLOCKED Output

Every fail-closed routing result must satisfy C4. The agent stops after emitting the record and does not continue by approximation.

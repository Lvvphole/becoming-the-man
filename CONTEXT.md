# Repository Context Router

Status: ACTIVE LAYER 1 ROUTER
Authority: subordinate only to `AGENTS.md`.
Purpose: deterministically route one explicit task envelope to one workflow stage and the exact subordinate context allowed for that task.

This file owns task and stage routing. `AGENTS.md` owns repository execution authority. Stage files own stage behavior. No agent may choose a route by intent inference, similarity, reward optimization, or "best fit."

## ICM layers

```text
Layer 0: CLAUDE.md -> AGENTS.md
Layer 1: CONTEXT.md
Layer 2: stages/NN_name/CONTEXT.md
Layer 3: exact routed governance/reference sources
Layer 4: exact prior-stage outputs, workpiece inputs, and non-authoritative evidence
```

## Required task envelope

The caller or a validated prior-stage output must supply a structured task envelope with these fields:

- `workflow_stage`: exactly one stage ID from the stage registry.
- `task_domains`: non-empty array of unique domain IDs from the domain registry.
- `source_sections`: exact heading/range selectors for every selected source whose registry policy requires one.
- `workpiece_paths`: exact repository-relative paths the stage may inspect as task working input; no wildcards.
- `selected_evidence_ids`: exact evidence IDs; default empty. The agent may not invent IDs.
- `prior_outputs`: exact prior-stage artifact identities required by the selected stage.
- `authorized_candidate_paths`: exact mutable repository-relative paths when the selected stage permits candidate mutation.
- `approvals`: explicit approval facts required by a transition.
- `source_binding`: repository revision plus required source identities.

A value is valid only when supplied by the user/caller or copied without semantic alteration from a validated prior-stage artifact. The executing agent may validate values. It may not invent, broaden, reinterpret, or substitute them.

Missing required selector data is BLOCKED.

## Canonical machine-readable routing table

The JSON object between `ROUTING_TABLE_BEGIN` and `ROUTING_TABLE_END` is the canonical route table. No second route table may exist.

ROUTING_TABLE_BEGIN

```json
{
  "version": "1.0.0",
  "stage_registry": {
    "01_scout": {
      "contract": "stages/01_scout/CONTEXT.md",
      "skill": ".claude/skills/scout-agent/SKILL.md",
      "base_layer3": ["engineering_rules"]
    },
    "02_plan": {
      "contract": "stages/02_plan/CONTEXT.md",
      "skill": ".claude/skills/plan/SKILL.md",
      "base_layer3": ["engineering_rules"]
    },
    "03_contract": {
      "contract": "stages/03_contract/CONTEXT.md",
      "skill": null,
      "base_layer3": ["engineering_rules"]
    },
    "04_implement": {
      "contract": "stages/04_implement/CONTEXT.md",
      "skill": null,
      "base_layer3": ["engineering_rules"]
    },
    "05_verify": {
      "contract": "stages/05_verify/CONTEXT.md",
      "skill": null,
      "base_layer3": ["engineering_rules"]
    },
    "06_review": {
      "contract": "stages/06_review/CONTEXT.md",
      "skill": null,
      "base_layer3": ["engineering_rules", "architecture_manifest"]
    },
    "07_release": {
      "contract": "stages/07_release/CONTEXT.md",
      "skill": null,
      "base_layer3": ["engineering_rules", "architecture_manifest"]
    }
  },
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
  },
  "domain_registry": {
    "governance": {
      "layer3": ["engineering_rules", "architecture_manifest"],
      "required_envelope_fields": []
    },
    "product_behavior": {
      "layer3": ["product_prd"],
      "required_envelope_fields": []
    },
    "ui_ux": {
      "layer3": ["product_prd"],
      "required_envelope_fields": []
    },
    "system_architecture": {
      "layer3": ["architecture_manifest", "system_architecture"],
      "required_envelope_fields": []
    },
    "api_contract": {
      "layer3": ["product_prd", "architecture_manifest", "system_architecture"],
      "required_envelope_fields": []
    },
    "database_rls": {
      "layer3": ["architecture_manifest", "system_architecture"],
      "required_envelope_fields": []
    },
    "provider_integration": {
      "layer3": ["architecture_manifest", "system_architecture"],
      "required_envelope_fields": []
    },
    "security": {
      "layer3": ["engineering_rules", "architecture_manifest", "system_architecture"],
      "required_envelope_fields": []
    },
    "ci_cd": {
      "layer3": ["engineering_rules", "architecture_manifest", "system_architecture"],
      "required_envelope_fields": []
    },
    "testing": {
      "layer3": ["engineering_rules", "architecture_manifest"],
      "required_envelope_fields": []
    },
    "ai_assessment": {
      "layer3": ["product_prd", "architecture_manifest", "system_architecture"],
      "required_envelope_fields": []
    },
    "content_identity": {
      "layer3": ["published_book"],
      "required_envelope_fields": []
    },
    "relationship_protocol": {
      "layer3": ["mros_v1_4"],
      "required_envelope_fields": []
    },
    "project_narrative": {
      "layer3": ["project_architecture", "master_story_bible", "product_vision"],
      "required_envelope_fields": []
    },
    "bug_repair": {
      "layer3": ["engineering_rules"],
      "required_envelope_fields": ["violated_contract_source", "repair_verifier_id"]
    },
    "release": {
      "layer3": ["engineering_rules", "architecture_manifest"],
      "required_envelope_fields": ["final_head_sha"]
    }
  },
  "evidence_index": {
    "path": "docs/evidence/index.json",
    "required_when_selected_evidence_ids_nonempty": true,
    "normative": false
  },
  "transition_registry": {
    "01_scout->02_plan": {
      "requires": ["scout_report_valid", "original_request_pre_authorized_plan"]
    },
    "02_plan->03_contract": {
      "requires": ["plan_ready", "explicit_user_approval", "plan_binding_current"]
    },
    "03_contract->04_implement": {
      "requires": ["contract_ready", "approved_plan_binding_current", "G_PRE_CODE_READY"]
    },
    "04_implement->05_verify": {
      "requires": ["candidate_manifest_valid", "active_stop_condition_clear"]
    },
    "05_verify->06_review": {
      "requires": ["verification_pass", "exact_state_binding"]
    },
    "06_review->07_release": {
      "requires": ["review_clear", "exact_head_ci_pass", "zero_actionable_findings"]
    },
    "07_release->merge": {
      "requires": ["explicit_user_merge_authorization"],
      "automatic": false
    }
  }
}
```

ROUTING_TABLE_END

## Binary route evaluation

For task envelope `E`:

1. Validate that every required envelope field is present and contains no wildcard path.
2. Select the stage by exact equality: `stage_registry[E.workflow_stage]`.
3. Require exactly one stage entry. Unknown or missing stage -> BLOCKED.
4. Require `task_domains` to be non-empty and contain no duplicate IDs.
5. For each domain ID, select exactly one `domain_registry` entry by exact equality.
6. Unknown domain, duplicate domain definition, or missing domain-required envelope field -> BLOCKED.
7. Compute one source bundle as the set union of the stage's `base_layer3` and every selected domain's `layer3`.
8. For each selected source, require the source registry entry to exist exactly once.
9. For each `explicit_selector_required` source, require an exact selector in `source_sections`. Do not infer one.
10. For task-context sources, require the exact source to be supplied in the task context. Missing source -> BLOCKED.
11. If `selected_evidence_ids` is non-empty, require `docs/evidence/index.json`, resolve every ID exactly once, and require its binding/freshness to satisfy the active stage. Missing/duplicate/stale current-state evidence -> BLOCKED.
12. Load only the selected stage contract, selected source bundle, selected evidence IDs, exact declared prior outputs, and exact `workpiece_paths`.
13. Emit one route object. There is no fallback route.

```text
stage_matches = 1
AND every(domain_matches) = 1
AND every(source_matches) = 1
AND every(required_selector_present) = TRUE
AND every(required_external_source_present) = TRUE
AND every(selected_evidence_match_count) = 1
=> ROUTED

otherwise => BLOCKED
```

## Context prohibition

The following are routing violations:

- scanning or preloading `.claude/skills/`;
- scanning `docs/` to discover an authoritative source;
- scanning `docs/evidence/` to discover evidence;
- globbing for possible governance files;
- choosing a route from natural-language similarity;
- adding a task domain because the agent believes it is relevant;
- dropping a supplied task domain because the agent believes it is unnecessary;
- loading an unrouted reference "for context";
- treating implementation files, tests, schemas, plans, or evidence as higher authority than `AGENTS.md`.

Repository workpiece files may be read only when their exact paths are supplied in `workpiece_paths` or an already-selected stage contract deterministically derives the exact path from a supplied identifier without directory discovery.

## Cross-domain tasks

Cross-domain work does not create competing routes.

The caller supplies multiple unique domain IDs. The router forms one route whose Layer 3 source bundle is the set union of those domain bundles.

If the caller cannot supply a unique domain set, the task is BLOCKED. The agent does not decide which domain to add or remove.

## Evidence boundary

Evidence is never authority.

`docs/evidence/index.json` is a lookup manifest only. It may state evidence identity, path, type, binding, applicability, and freshness. It may not define requirements, permissions, waivers, transitions, or acceptance criteria.

Any attempted evidence-to-authority promotion returns BLOCKED under `G_EVIDENCE_NONAUTH`.

## Skills

Skills are stage-scoped subordinate workflows.

- `01_scout` -> `.claude/skills/scout-agent/SKILL.md`
- `02_plan` -> `.claude/skills/plan/SKILL.md`
- all other stages -> no skill unless this routing table is explicitly amended.

A skill may not invoke another skill. A pre-authorized sequential handoff occurs through this router after the prior stage produces its required output.

## BLOCKED output

Every non-unique, missing, conflicting, stale, or unauthorized route condition returns the BLOCKED JSON record defined by `references/engineering/engineering-rules.md`.

The agent must not continue by approximation.

const requiredEnvelopeFields = [
  "workflow_stage", "task_domains", "source_sections", "workpiece_paths",
  "selected_evidence_ids", "prior_outputs", "authorized_candidate_paths",
  "approvals", "source_binding",
];

export function makeBlocked(reasonCode, gateId, stageId, sourceBinding = {}) {
  return {
    status: "BLOCKED",
    reason_code: reasonCode,
    gate_id: gateId,
    stage_id: stageId,
    route_candidates: [],
    missing_inputs: [],
    conflicts: [],
    source_binding: sourceBinding,
    resolution_required: ["Provide a valid routed input and retry."],
  };
}

export function parseRoutingTable(text) {
  const match = text.match(
    /ROUTING_TABLE_BEGIN\s*```json\s*([\s\S]*?)\s*```\s*ROUTING_TABLE_END/,
  );
  if (!match) return makeBlocked("ROUTING_TABLE_INVALID", "G_ROUTE_UNIQUE", "UNKNOWN");
  const legacy = match[1].match(
    /"stage_registry"\s*:\s*\{([\s\S]*?)\}\s*,\s*"source_registry"/,
  );
  if (legacy) {
    const keys = [...legacy[1].matchAll(/"([^"]+)"\s*:/g)].map((item) => item[1]);
    if (new Set(keys).size !== keys.length) {
      return makeBlocked("ROUTE_MULTI_MATCH", "G_ROUTE_UNIQUE", "UNKNOWN");
    }
  }
  try {
    const table = JSON.parse(match[1]);
    if (!Array.isArray(table.routes) || !table.source_registry) {
      return makeBlocked("ROUTING_TABLE_INVALID", "G_ROUTE_UNIQUE", "UNKNOWN");
    }
    return table;
  } catch {
    return makeBlocked("ROUTING_TABLE_INVALID", "G_ROUTE_UNIQUE", "UNKNOWN");
  }
}

function sameSet(left, right) {
  if (!Array.isArray(left) || !Array.isArray(right) || left.length !== right.length) {
    return false;
  }
  return [...left].sort().every((value, index) => value === [...right].sort()[index]);
}

function hasWildcard(path) {
  return ["*", "?", "[", "]"].some((token) => path.includes(token));
}

function evidenceEntry(index, id) {
  if (Array.isArray(index.entries)) return index.entries.find((entry) => entry.id === id);
  return index.entries?.[id];
}

export function evaluateRoute(table, envelope, options = {}) {
  if (table?.status === "BLOCKED") return table;
  for (const field of requiredEnvelopeFields) {
    if (!(field in envelope) || envelope[field] === null) {
      return makeBlocked("MISSING_SELECTOR", "G_ROUTE_UNIQUE", envelope.workflow_stage ?? "UNKNOWN");
    }
  }
  for (const field of ["workpiece_paths", "authorized_candidate_paths"]) {
    if (envelope[field].some(hasWildcard)) {
      return makeBlocked("WILDCARD_INPUT", "G_ROUTE_UNIQUE", envelope.workflow_stage);
    }
  }

  const matches = table.routes.filter((route) =>
    route.selectors?.workflow_stage === envelope.workflow_stage &&
    sameSet(route.selectors?.task_domains, envelope.task_domains)
  );
  if (matches.length === 0) {
    return makeBlocked("ROUTE_ZERO_MATCH", "G_ROUTE_UNIQUE", envelope.workflow_stage);
  }
  if (matches.length > 1) {
    const blocked = makeBlocked("ROUTE_MULTI_MATCH", "G_ROUTE_UNIQUE", envelope.workflow_stage);
    blocked.route_candidates = matches.map((route) => route.route_id);
    return blocked;
  }

  const route = matches[0];
  for (const sourceId of route.required_layer3_bundle) {
    if (!table.source_registry[sourceId]) {
      return makeBlocked("MISSING_SOURCE", "G_SOURCE_PRESENT", envelope.workflow_stage);
    }
  }

  if (envelope.selected_evidence_ids.length > 0) {
    const index = options.evidenceIndex;
    if (!index) {
      return makeBlocked("EVIDENCE_INDEX_MISSING", "G_EVIDENCE_CURRENT", envelope.workflow_stage);
    }
    for (const id of envelope.selected_evidence_ids) {
      const entry = evidenceEntry(index, id);
      if (!entry) {
        return makeBlocked("EVIDENCE_ID_UNKNOWN", "G_EVIDENCE_CURRENT", envelope.workflow_stage);
      }
      if (entry.freshness !== "current") {
        return makeBlocked("EVIDENCE_BINDING_STALE", "G_EVIDENCE_CURRENT", envelope.workflow_stage);
      }
      if (!route.allowed_evidence_ids.includes(id)) {
        return makeBlocked("UNLISTED_INPUT", "G_ALLOWED_INPUTS", envelope.workflow_stage);
      }
    }
  }

  return {
    status: "ROUTE_MATCH",
    route_id: route.route_id,
    stage_id: route.target_stage,
    layer3: [...route.required_layer3_bundle].sort(),
  };
}

export function validateBlocked(record, contract) {
  return record?.status === "BLOCKED" &&
    contract.blocked_record.required_fields.every((field) => field in record) &&
    contract.blocked_record.reason_codes.includes(record.reason_code);
}

export function validateStageContract(stageId, text, contract) {
  const yaml = text.match(/```yaml\s*([\s\S]*?)\s*```/)?.[1];
  if (!yaml) return makeBlocked("STAGE_CONTRACT_INVALID", "G_STAGE_CONTRACT", stageId);
  for (const field of contract.stage_contract.required_fields) {
    if (!new RegExp(`^${field}:`, "m").test(yaml)) {
      return makeBlocked("STAGE_CONTRACT_INVALID", "G_STAGE_CONTRACT", stageId);
    }
  }
  const declared = yaml.match(/^stage_id:\s*(.+)$/m)?.[1]?.trim();
  if (declared !== stageId) {
    return makeBlocked("STAGE_CONTRACT_INVALID", "G_STAGE_CONTRACT", stageId);
  }
  return { stage_id: stageId };
}

export function validateTransition(table, key, facts) {
  const [fromStage, toStage] = key.split("->");
  const transition = table.routes
    .map((route) => route.transition)
    .find((item) => item?.from_stage === fromStage && item?.to_stage === toStage);
  if (!transition || transition.required_facts.some((fact) => facts[fact] !== true)) {
    return makeBlocked("TRANSITION_PRECONDITION_FALSE", "G_TRANSITION", toStage ?? "UNKNOWN");
  }
  return true;
}

export function validateEvidenceRole(sourceKind, role) {
  if (sourceKind === "evidence" &&
      ["requirement", "permission", "waiver", "transition_authority"].includes(role)) {
    return makeBlocked("EVIDENCE_AUTHORITY_FORBIDDEN", "G_EVIDENCE_NONAUTH", "UNKNOWN");
  }
  return true;
}

export function validateLoadedInputs(loaded, allowed) {
  if (loaded.some((item) => !allowed.includes(item))) {
    return makeBlocked("UNLISTED_INPUT", "G_ALLOWED_INPUTS", "UNKNOWN");
  }
  return true;
}

export function validateReviewCycle(cycle) {
  return cycle <= 3
    ? true
    : makeBlocked("REVIEW_CYCLE_EXCEEDED", "G_REVIEW", "06_review");
}

export function validateGovernanceSnapshot(files, contract) {
  for (const path of contract.governance.active_500_paths) {
    const text = files[path] ?? "";
    if (contract.governance.forbidden_drift_tokens.some((token) => text.includes(token))) {
      return makeBlocked("CHANGE_SIZE_DRIFT", "G_CHANGE_SIZE", "UNKNOWN");
    }
  }
  const architecture = files["references/architecture/CONTEXT.md"] ?? "";
  let cursor = -1;
  for (const source of contract.architecture.active_sources) {
    const index = architecture.indexOf(source, cursor + 1);
    if (index < 0 || index <= cursor) {
      return makeBlocked("SOURCE_BINDING_STALE", "G_SOURCE_PRESENT", "UNKNOWN");
    }
    cursor = index;
  }
  return true;
}

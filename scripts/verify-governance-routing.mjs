const requiredEnvelopeFields = [
  "workflow_stage", "task_domains", "source_sections", "workpiece_paths",
  "selected_evidence_ids", "prior_outputs", "authorized_candidate_paths",
  "approvals", "source_binding",
];
const stages = new Set([
  "UNKNOWN", "01_scout", "02_plan", "03_contract", "04_implement",
  "05_verify", "06_review", "07_release",
]);
const gitOid = /^[0-9a-f]{40}$/;
const repoPath = /^[A-Za-z0-9._/-]+$/;

function object(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function validBinding(value) {
  return object(value) && Number.isInteger(value.pr) && value.pr >= 1 &&
    gitOid.test(value.base) && gitOid.test(value.current_head) &&
    Object.keys(value).length === 3;
}

function invalidContext() {
  return { status: "INVALID_EXECUTION_CONTEXT" };
}

export function makeBlocked(reasonCode, gateId, stageId, sourceBinding) {
  if (!validBinding(sourceBinding)) return invalidContext();
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

function routeShape(route) {
  return object(route) && typeof route.route_id === "string" && object(route.selectors) &&
    object(route.predicate) && Array.isArray(route.required_layer3_bundle) &&
    Array.isArray(route.allowed_evidence_ids) && typeof route.target_stage === "string" &&
    object(route.transition);
}

export function parseRoutingTable(text, sourceBinding) {
  if (!validBinding(sourceBinding)) return invalidContext();
  if (typeof text !== "string") {
    return makeBlocked("ROUTING_TABLE_INVALID", "G_ROUTE_UNIQUE", "UNKNOWN", sourceBinding);
  }
  const match = text.match(
    /ROUTING_TABLE_BEGIN\s*```json\s*([\s\S]*?)\s*```\s*ROUTING_TABLE_END/,
  );
  if (!match) {
    return makeBlocked("ROUTING_TABLE_INVALID", "G_ROUTE_UNIQUE", "UNKNOWN", sourceBinding);
  }
  try {
    const table = JSON.parse(match[1]);
    if (!object(table) || !Array.isArray(table.routes) || table.routes.length === 0 ||
        !object(table.source_registry) || !table.routes.every(routeShape)) {
      return makeBlocked("ROUTING_TABLE_INVALID", "G_ROUTE_UNIQUE", "UNKNOWN", sourceBinding);
    }
    const ids = table.routes.map((route) => route.route_id);
    if (new Set(ids).size !== ids.length) {
      return makeBlocked("ROUTING_TABLE_INVALID", "G_ROUTE_UNIQUE", "UNKNOWN", sourceBinding);
    }
    return table;
  } catch {
    return makeBlocked("ROUTING_TABLE_INVALID", "G_ROUTE_UNIQUE", "UNKNOWN", sourceBinding);
  }
}

function sameSet(left, right) {
  if (!Array.isArray(left) || !Array.isArray(right) || left.length !== right.length) {
    return false;
  }
  const sorted = [...right].sort();
  return [...left].sort().every((value, index) => value === sorted[index]);
}

function hasWildcard(path) {
  return typeof path === "string" && ["*", "?", "[", "]"].some((token) => path.includes(token));
}

export function isRepoRelativePath(path) {
  return typeof path === "string" && path.length > 0 && repoPath.test(path) &&
    !path.startsWith("/") && !path.split("/").includes("..") && !hasWildcard(path) &&
    !path.includes("\\") && !/^[A-Za-z]:/.test(path);
}

function evidenceEntry(index, id) {
  if (Array.isArray(index.entries)) return index.entries.find((entry) => entry.id === id);
  return index.entries?.[id];
}

function block(reason, gate, stage, binding) {
  return makeBlocked(reason, gate, stage, binding);
}

function validEnvelopeShape(envelope) {
  return object(envelope) && Array.isArray(envelope.task_domains) &&
    object(envelope.source_sections) && Array.isArray(envelope.workpiece_paths) &&
    Array.isArray(envelope.selected_evidence_ids) && object(envelope.prior_outputs) &&
    Array.isArray(envelope.authorized_candidate_paths) && object(envelope.approvals) &&
    object(envelope.source_binding);
}

function bindingEqual(left, right) {
  return validBinding(left) && validBinding(right) &&
    left.pr === right.pr && left.base === right.base && left.current_head === right.current_head;
}

function selectorValid(policy, selector) {
  if (policy === "full") return Array.isArray(selector) &&
    selector.length === 1 && selector[0] === "*";
  return policy === "explicit_selector_required" && Array.isArray(selector) &&
    selector.length > 0 && selector.every((item) => typeof item === "string" && item.length > 0) &&
    !selector.includes("*") && new Set(selector).size === selector.length;
}

function sourceValid(source) {
  return object(source) && source.kind === "layer3" &&
    ["repository", "task_context"].includes(source.location) &&
    ["full", "explicit_selector_required"].includes(source.section_policy);
}

export function evaluateRoute(table, envelope, options = {}) {
  const trusted = options.sourceBinding;
  if (!validBinding(trusted)) return invalidContext();
  if (table?.status === "BLOCKED" || table?.status === "INVALID_EXECUTION_CONTEXT") return table;
  if (!object(envelope)) return block("TASK_ENVELOPE_REQUIRED", "G_ROUTE_UNIQUE", "UNKNOWN", trusted);
  const stage = typeof envelope.workflow_stage === "string" ? envelope.workflow_stage : "UNKNOWN";
  if (!("workflow_stage" in envelope) || envelope.workflow_stage === null ||
      !("task_domains" in envelope) || envelope.task_domains === null) {
    return block("MISSING_SELECTOR", "G_ROUTE_UNIQUE", stage, trusted);
  }
  for (const field of requiredEnvelopeFields.slice(2)) {
    if (!(field in envelope) || envelope[field] === null) {
      return block("TASK_ENVELOPE_REQUIRED", "G_ROUTE_UNIQUE", stage, trusted);
    }
  }
  if (!validEnvelopeShape(envelope)) {
    return block("TASK_ENVELOPE_REQUIRED", "G_ROUTE_UNIQUE", stage, trusted);
  }
  if (!bindingEqual(envelope.source_binding, trusted)) {
    return block("SOURCE_BINDING_STALE", "G_SOURCE_PRESENT", stage, trusted);
  }
  for (const field of ["workpiece_paths", "authorized_candidate_paths"]) {
    if (envelope[field].some(hasWildcard)) {
      return block("WILDCARD_INPUT", "G_ROUTE_UNIQUE", stage, trusted);
    }
    if (!envelope[field].every(isRepoRelativePath)) {
      return block("TASK_ENVELOPE_REQUIRED", "G_ROUTE_UNIQUE", stage, trusted);
    }
  }

  const matches = table.routes.filter((route) =>
    route.selectors?.workflow_stage === envelope.workflow_stage &&
    sameSet(route.selectors?.task_domains, envelope.task_domains) &&
    route.predicate.required_approval_facts.every((fact) => envelope.approvals[fact] === true)
  );
  if (matches.length === 0) return block("ROUTE_ZERO_MATCH", "G_ROUTE_UNIQUE", stage, trusted);
  if (matches.length > 1) {
    const result = block("ROUTE_MULTI_MATCH", "G_ROUTE_UNIQUE", stage, trusted);
    result.route_candidates = matches.map((route) => route.route_id);
    return result;
  }

  const route = matches[0];
  for (const sourceId of route.required_layer3_bundle) {
    const source = table.source_registry[sourceId];
    if (!sourceValid(source)) return block("MISSING_SOURCE", "G_SOURCE_PRESENT", stage, trusted);
    if (!selectorValid(source.section_policy, envelope.source_sections[sourceId])) {
      return block("MISSING_SELECTOR", "G_SOURCE_PRESENT", stage, trusted);
    }
    if (source.location === "repository") {
      if (!isRepoRelativePath(source.path) || !Object.hasOwn(options.files ?? {}, source.path)) {
        return block("MISSING_SOURCE", "G_SOURCE_PRESENT", stage, trusted);
      }
    } else if (!Object.hasOwn(options.taskContext ?? {}, sourceId)) {
      return block("MISSING_SOURCE", "G_SOURCE_PRESENT", stage, trusted);
    }
  }

  if (envelope.selected_evidence_ids.length > 0) {
    const index = options.evidenceIndex;
    if (!index) return block("EVIDENCE_INDEX_MISSING", "G_EVIDENCE_CURRENT", stage, trusted);
    for (const id of envelope.selected_evidence_ids) {
      const entry = evidenceEntry(index, id);
      if (!entry) return block("EVIDENCE_ID_UNKNOWN", "G_EVIDENCE_CURRENT", stage, trusted);
      if (entry.freshness !== "current") {
        return block("EVIDENCE_BINDING_STALE", "G_EVIDENCE_CURRENT", stage, trusted);
      }
      if (!route.allowed_evidence_ids.includes(id)) {
        return block("UNLISTED_INPUT", "G_ALLOWED_INPUTS", stage, trusted);
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

function uniqueStrings(value, nonEmpty = false) {
  return Array.isArray(value) && new Set(value).size === value.length &&
    value.every((item) => typeof item === "string" && (!nonEmpty || item.length > 0));
}

export function validateBlocked(record, contract) {
  if (!object(record) || record.status !== "BLOCKED") return false;
  const required = contract.blocked_record.required_fields;
  if (Object.keys(record).length !== required.length ||
      !required.every((field) => Object.hasOwn(record, field)) ||
      !contract.blocked_record.reason_codes.includes(record.reason_code) ||
      !/^G_[A-Z0-9_]+$/.test(record.gate_id) || !stages.has(record.stage_id) ||
      !validBinding(record.source_binding)) return false;
  return uniqueStrings(record.route_candidates) && uniqueStrings(record.missing_inputs, true) &&
    uniqueStrings(record.conflicts, true) && uniqueStrings(record.resolution_required, true) &&
    record.resolution_required.length > 0;
}

export function validateStageContract(stageId, text, contract, sourceBinding) {
  const yaml = typeof text === "string" ? text.match(/```yaml\s*([\s\S]*?)\s*```/)?.[1] : null;
  if (!yaml) return block("STAGE_CONTRACT_INVALID", "G_STAGE_CONTRACT", stageId, sourceBinding);
  for (const field of contract.stage_contract.required_fields) {
    if (!new RegExp(`^${field}:`, "m").test(yaml)) {
      return block("STAGE_CONTRACT_INVALID", "G_STAGE_CONTRACT", stageId, sourceBinding);
    }
  }
  const declared = yaml.match(/^stage_id:\s*(.+)$/m)?.[1]?.trim();
  return declared === stageId ? { stage_id: stageId } :
    block("STAGE_CONTRACT_INVALID", "G_STAGE_CONTRACT", stageId, sourceBinding);
}

export function validateTransition(table, key, facts, sourceBinding) {
  const [fromStage, toStage] = key.split("->");
  const transition = table.routes
    .map((route) => route.transition)
    .find((item) => item?.from_stage === fromStage && item?.to_stage === toStage);
  return transition && transition.required_facts.every((fact) => facts[fact] === true)
    ? true : block("TRANSITION_PRECONDITION_FALSE", "G_TRANSITION", toStage ?? "UNKNOWN", sourceBinding);
}

export function validateEvidenceRole(sourceKind, role, sourceBinding) {
  return sourceKind === "evidence" &&
    ["requirement", "permission", "waiver", "transition_authority"].includes(role)
    ? block("EVIDENCE_AUTHORITY_FORBIDDEN", "G_EVIDENCE_NONAUTH", "UNKNOWN", sourceBinding)
    : true;
}

export function validateLoadedInputs(loaded, allowed, sourceBinding) {
  return loaded.some((item) => !allowed.includes(item))
    ? block("UNLISTED_INPUT", "G_ALLOWED_INPUTS", "UNKNOWN", sourceBinding) : true;
}

export function validateReviewCycle(cycle, sourceBinding) {
  return cycle <= 3 ? true :
    block("REVIEW_CYCLE_EXCEEDED", "G_REVIEW", "06_review", sourceBinding);
}

function extractLimit(path, text) {
  const patterns = {
    "AGENTS.md": [/Micro-PR Ceiling \((\d+) LOC\)/, /at most (\d+) reviewable implementation lines/],
    "references/engineering/engineering-rules.md": [
      /reviewable_lines <= (\d+)/, /active ceiling is (\d+)/,
    ],
    "docs/Website_System_Architecture_v1.0_LOCKED.md": [/(\d+)-LOC reviewability ceiling/],
    "docs/SYSTEM_ARCHITECTURE_AMENDMENT_v1.1.md": [
      /no more than \*\*(\d+) reviewable implementation lines/,
    ],
    "docs/SYSTEM_ARCHITECTURE_AMENDMENT_v1.2.md": [/(\d+)-line reviewability limit/],
    "scripts/check-change-size.sh": [/^MAX_LINES=(\d+)$/m],
  };
  if (path === "references/architecture/CONTEXT.md") {
    const match = text.match(
      /ARCHITECTURE_MANIFEST_BEGIN\s*```json\s*([\s\S]*?)\s*```\s*ARCHITECTURE_MANIFEST_END/,
    );
    if (!match) return [];
    try {
      return [JSON.parse(match[1]).active_reviewable_loc_limit];
    } catch {
      return [];
    }
  }
  return (patterns[path] ?? []).map((pattern) => Number(text.match(pattern)?.[1]));
}

export function validateGovernanceSnapshot(files, contract, sourceBinding) {
  const expected = contract.governance.active_reviewable_loc_limit;
  for (const path of contract.governance.active_500_paths) {
    const values = extractLimit(path, files[path] ?? "");
    if (values.length === 0 || values.some((value) => value !== expected)) {
      return block("CHANGE_SIZE_DRIFT", "G_CHANGE_SIZE", "UNKNOWN", sourceBinding);
    }
  }
  const architecture = files["references/architecture/CONTEXT.md"] ?? "";
  let cursor = -1;
  for (const source of contract.architecture.active_sources) {
    const index = architecture.indexOf(source, cursor + 1);
    if (index < 0 || index <= cursor) {
      return block("SOURCE_BINDING_STALE", "G_SOURCE_PRESENT", "UNKNOWN", sourceBinding);
    }
    cursor = index;
  }
  return true;
}

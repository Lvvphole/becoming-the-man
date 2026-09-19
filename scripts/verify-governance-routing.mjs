const requiredEnvelopeFields = [
  "workflow_stage", "task_domains", "source_sections", "workpiece_paths",
  "selected_evidence_ids", "prior_outputs", "authorized_candidate_paths",
  "approvals", "source_binding",
];
const stages = new Set(["UNKNOWN", "01_scout", "02_plan", "03_contract", "04_implement", "05_verify", "06_review", "07_release"]);
const gitOid = /^[0-9a-f]{40}$/, object = (v) => v !== null && typeof v === "object" && !Array.isArray(v);
const strings = (v) => Array.isArray(v) && v.every((x) => typeof x === "string") && new Set(v).size === v.length;
const stage = (v) => stages.has(v) && v !== "UNKNOWN", ids = (v) => strings(v) && v.every((x) => /^[a-z][a-z0-9_.:-]*$/.test(x));
const facts = (v) => strings(v) && v.every((x) => /^[A-Za-z][A-Za-z0-9_.:-]*$/.test(x)), exactKeys = (v, keys) => object(v) && Object.keys(v).length === keys.length && keys.every((k) => Object.hasOwn(v, k));
const loaded = (v) => typeof v === "string" ? v.length > 0 : object(v) && Object.keys(v).length > 0;
function validRoute(r) {
  const s = r?.selectors, p = r?.predicate, t = r?.transition;
  return exactKeys(r, ["route_id", "selectors", "predicate", "required_layer3_bundle", "allowed_evidence_ids", "target_stage", "transition"]) && /^route:[a-z0-9_.:-]+$/.test(r.route_id) &&
    exactKeys(s, ["workflow_stage", "task_domains"]) && stage(s.workflow_stage) && ids(s.task_domains) && s.task_domains.length > 0 &&
    exactKeys(p, ["operator", "required_envelope_fields", "required_approval_facts"]) && p.operator === "ALL_EXACT" && ids(p.required_envelope_fields) && ids(p.required_approval_facts) &&
    ids(r.required_layer3_bundle) && ids(r.allowed_evidence_ids) && stage(r.target_stage) && r.target_stage === s.workflow_stage && exactKeys(t, ["from_stage", "to_stage", "required_facts", "automatic"]) &&
    (t.from_stage === null || stage(t.from_stage)) && (t.to_stage === null || stage(t.to_stage)) && facts(t.required_facts) && typeof t.automatic === "boolean";
}
const validBinding = (v) => object(v) && Number.isInteger(v.pr) && v.pr >= 1 && gitOid.test(v.base) && gitOid.test(v.current_head) && Object.keys(v).length === 3;
const sameBinding = (a, b) => validBinding(a) && validBinding(b) && a.pr === b.pr && a.base === b.base && a.current_head === b.current_head;
const normalizeStage = (v) => stages.has(v) ? v : "UNKNOWN";

export function makeBlocked(reasonCode, gateId, stageId, sourceBinding) {
  if (!validBinding(sourceBinding)) return { status: "INVALID_EXECUTION_CONTEXT" };
  return {
    status: "BLOCKED",
    reason_code: reasonCode,
    gate_id: gateId,
    stage_id: normalizeStage(stageId),
    route_candidates: [],
    missing_inputs: [],
    conflicts: [],
    source_binding: sourceBinding,
    resolution_required: ["Provide a valid routed input and retry."],
  };
}

export function parseRoutingTable(text, sourceBinding) {
  if (!validBinding(sourceBinding)) return { status: "INVALID_EXECUTION_CONTEXT" };
  const match = typeof text === "string" && text.match(
    /ROUTING_TABLE_BEGIN\s*```json\s*([\s\S]*?)\s*```\s*ROUTING_TABLE_END/,
  );
  if (!match) {
    return makeBlocked("ROUTING_TABLE_INVALID", "G_ROUTE_UNIQUE", "UNKNOWN", sourceBinding);
  }
  try {
    const table = JSON.parse(match[1]);
    if (!exactKeys(table, ["version", "routes", "source_registry"]) || table.version !== "1.0.0" ||
        !Array.isArray(table.routes) || !table.routes.length || !object(table.source_registry) ||
        !table.routes.every(validRoute) || new Set(table.routes.map((route) => route.route_id)).size !== table.routes.length) {
      return makeBlocked("ROUTING_TABLE_INVALID", "G_ROUTE_UNIQUE", "UNKNOWN", sourceBinding);
    }
    return table;
  } catch {
    return makeBlocked("ROUTING_TABLE_INVALID", "G_ROUTE_UNIQUE", "UNKNOWN", sourceBinding);
  }
}

function sameSet(left, right) {
  if (!Array.isArray(left) || !Array.isArray(right) || left.length !== right.length) return false;
  return [...left].sort().every((value, index) => value === [...right].sort()[index]);
}
function hasWildcard(path) {
  return typeof path === "string" && ["*", "?", "[", "]"].some((token) => path.includes(token));
}
export function isRepoRelativePath(path) {
  return typeof path === "string" && path.length > 0 && /^[A-Za-z0-9._/-]+$/.test(path) &&
    !path.startsWith("/") && !path.split("/").includes("..") && !hasWildcard(path) &&
    !path.includes("\\") && !/^[A-Za-z]:/.test(path);
}

function evidenceEntry(index, id) {
  if (Array.isArray(index.entries)) return index.entries.find((entry) => entry.id === id);
  return index.entries?.[id];
}
function sourceIssue(table, route, envelope, options, stageId, binding) {
  for (const sourceId of route.required_layer3_bundle) {
    const source = table.source_registry[sourceId], policy = source?.section_policy, selector = envelope.source_sections[sourceId];
    if (!object(source) || source.kind !== "layer3" || !["repository", "task_context"].includes(source.location)) return makeBlocked("MISSING_SOURCE", "G_SOURCE_PRESENT", stageId, binding);
    if (policy === "full" ? !(Array.isArray(selector) && selector.length === 1 && selector[0] === "*") : policy !== "explicit_selector_required" || !strings(selector) || !selector.length || selector.includes("*") || selector.some((item) => !item.length)) return makeBlocked("MISSING_SELECTOR", "G_SOURCE_PRESENT", stageId, binding);
    const value = source.location === "repository" ? (options.files ?? {})[source.path] : (options.taskContext ?? {})[sourceId];
    if ((source.location === "repository" && !isRepoRelativePath(source.path)) || !loaded(value)) return makeBlocked("MISSING_SOURCE", "G_SOURCE_PRESENT", stageId, binding);
  }
}
/** Evidence containment is an invariant part of candidate route pruning. */
function candidateRoute(route, envelope) {
  return route.selectors?.workflow_stage === envelope.workflow_stage &&
    sameSet(route.selectors?.task_domains, envelope.task_domains) &&
    route.predicate.required_approval_facts.every((fact) => envelope.approvals[fact] === true) &&
    envelope.selected_evidence_ids.every((id) => route.allowed_evidence_ids.includes(id));
}

export function evaluateRoute(table, envelope, options = {}) {
  const binding = options.sourceBinding;
  if (!validBinding(binding)) return { status: "INVALID_EXECUTION_CONTEXT" };
  if (table?.status === "BLOCKED" || table?.status === "INVALID_EXECUTION_CONTEXT") return table;
  if (!object(envelope)) return makeBlocked("TASK_ENVELOPE_REQUIRED", "G_ROUTE_UNIQUE", "UNKNOWN", binding);
  const stageId = normalizeStage(envelope.workflow_stage);
  const missing = requiredEnvelopeFields.filter((field) => !Object.hasOwn(envelope, field) || envelope[field] === null);
  if (missing.some((field) => field !== "workflow_stage" && field !== "task_domains")) return makeBlocked("TASK_ENVELOPE_REQUIRED", "G_ROUTE_UNIQUE", stageId, binding);
  if (missing.length) return makeBlocked("MISSING_SELECTOR", "G_ROUTE_UNIQUE", stageId, binding);
  if (typeof envelope.workflow_stage !== "string" || !strings(envelope.task_domains) || !object(envelope.source_sections) ||
      !Array.isArray(envelope.workpiece_paths) || !strings(envelope.selected_evidence_ids) || !object(envelope.prior_outputs) ||
      !Array.isArray(envelope.authorized_candidate_paths) || !object(envelope.approvals) || !object(envelope.source_binding)) return makeBlocked("TASK_ENVELOPE_REQUIRED", "G_ROUTE_UNIQUE", stageId, binding);
  if (!sameBinding(envelope.source_binding, binding)) return makeBlocked("SOURCE_BINDING_STALE", "G_SOURCE_PRESENT", stageId, binding);
  for (const field of ["workpiece_paths", "authorized_candidate_paths"]) {
    if (envelope[field].some(hasWildcard)) return makeBlocked("WILDCARD_INPUT", "G_ROUTE_UNIQUE", stageId, binding);
    if (!envelope[field].every(isRepoRelativePath)) return makeBlocked("TASK_ENVELOPE_REQUIRED", "G_ROUTE_UNIQUE", stageId, binding);
  }
  if (envelope.selected_evidence_ids.length > 0) {
    const index = options.evidenceIndex;
    if (!index) return makeBlocked("EVIDENCE_INDEX_MISSING", "G_EVIDENCE_CURRENT", stageId, binding);
    for (const id of envelope.selected_evidence_ids) {
      const entry = evidenceEntry(index, id);
      if (!entry) return makeBlocked("EVIDENCE_ID_UNKNOWN", "G_EVIDENCE_CURRENT", stageId, binding);
      if (entry.freshness !== "current") return makeBlocked("EVIDENCE_BINDING_STALE", "G_EVIDENCE_CURRENT", stageId, binding);
    }
  }

  const candidates = table.routes.filter((route) => candidateRoute(route, envelope));
  const checked = candidates.map((route) => [route, sourceIssue(table, route, envelope, options, stageId, binding)]), matches = checked.filter(([, issue]) => !issue).map(([route]) => route);
  if (!matches.length) return candidates.length === 1 ? checked[0][1] : makeBlocked("ROUTE_ZERO_MATCH", "G_ROUTE_UNIQUE", stageId, binding);
  if (matches.length > 1) {
    const blocked = makeBlocked("ROUTE_MULTI_MATCH", "G_ROUTE_UNIQUE", stageId, binding);
    blocked.route_candidates = matches.map((route) => route.route_id);
    return blocked;
  }

  const route = matches[0];
  if (envelope.selected_evidence_ids.length > 0) {
    const index = options.evidenceIndex;
    if (!index) {
      return makeBlocked("EVIDENCE_INDEX_MISSING", "G_EVIDENCE_CURRENT", stageId, binding);
    }
    for (const id of envelope.selected_evidence_ids) {
      const entry = evidenceEntry(index, id);
      if (!entry) {
        return makeBlocked("EVIDENCE_ID_UNKNOWN", "G_EVIDENCE_CURRENT", stageId, binding);
      }
      if (entry.freshness !== "current") {
        return makeBlocked("EVIDENCE_BINDING_STALE", "G_EVIDENCE_CURRENT", stageId, binding);
      }
      if (!route.allowed_evidence_ids.includes(id)) {
        return makeBlocked("UNLISTED_INPUT", "G_ALLOWED_INPUTS", stageId, binding);
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
  const required = contract.blocked_record.required_fields, arrays = ["route_candidates", "missing_inputs", "conflicts", "resolution_required"];
  return object(record) && record.status === "BLOCKED" && Object.keys(record).length === required.length && required.every((f) => Object.hasOwn(record, f)) && contract.blocked_record.reason_codes.includes(record.reason_code) &&
    /^G_[A-Z0-9_]+$/.test(record.gate_id) && stages.has(record.stage_id) && validBinding(record.source_binding) && arrays.every((f) => strings(record[f]) && (f === "route_candidates" || record[f].every(Boolean))) &&
    record.route_candidates.every((id) => /^route:[a-z0-9_.:-]+$/.test(id)) && record.resolution_required.length > 0;
}

export function validateStageContract(stageId, text, contract, sourceBinding) {
  const yaml = typeof text === "string" ? text.match(/```yaml\s*([\s\S]*?)\s*```/)?.[1] : null;
  if (!yaml) return makeBlocked("STAGE_CONTRACT_INVALID", "G_STAGE_CONTRACT", stageId, sourceBinding);
  for (const field of contract.stage_contract.required_fields) {
    if (!new RegExp(`^${field}:`, "m").test(yaml)) {
      return makeBlocked("STAGE_CONTRACT_INVALID", "G_STAGE_CONTRACT", stageId, sourceBinding);
    }
  }
  const declared = yaml.match(/^stage_id:\s*(.+)$/m)?.[1]?.trim(), disposition = yaml.match(/^success_disposition:\s*(.+)$/m)?.[1]?.trim();
  if (declared !== stageId || !contract.stage_contract.success_dispositions_by_stage?.[stageId]?.includes(disposition)) return makeBlocked("STAGE_CONTRACT_INVALID", "G_STAGE_CONTRACT", stageId, sourceBinding);
  return { stage_id: stageId };
}

export function validateTransition(table, key, facts, sourceBinding) {
  const [fromStage, toStage] = key.split("->");
  const transition = table.routes
    .map((route) => route.transition)
    .find((item) => item?.from_stage === fromStage && item?.to_stage === toStage);
  if (!transition || transition.required_facts.some((fact) => facts[fact] !== true)) {
    return makeBlocked("TRANSITION_PRECONDITION_FALSE", "G_TRANSITION", toStage ?? "UNKNOWN", sourceBinding);
  }
  return true;
}

export function validateEvidenceRole(sourceKind, role, sourceBinding) {
  if (sourceKind === "evidence" &&
      ["requirement", "permission", "waiver", "transition_authority"].includes(role)) {
    return makeBlocked("EVIDENCE_AUTHORITY_FORBIDDEN", "G_EVIDENCE_NONAUTH", "UNKNOWN", sourceBinding);
  }
  return true;
}

export function validateLoadedInputs(loaded, allowed, sourceBinding) {
  if (loaded.some((item) => !allowed.includes(item))) {
    return makeBlocked("UNLISTED_INPUT", "G_ALLOWED_INPUTS", "UNKNOWN", sourceBinding);
  }
  return true;
}

export function validateReviewCycle(cycle, sourceBinding) {
  return cycle <= 3
    ? true
    : makeBlocked("REVIEW_CYCLE_EXCEEDED", "G_REVIEW", "06_review", sourceBinding);
}

function limits(path, text) {
  if (path === "references/architecture/CONTEXT.md") {
    const m = text.match(/ARCHITECTURE_MANIFEST_BEGIN\s*```json\s*([\s\S]*?)\s*```\s*ARCHITECTURE_MANIFEST_END/);
    try { return m ? [JSON.parse(m[1]).active_reviewable_loc_limit] : []; } catch { return []; }
  }
  const patterns = {
    "AGENTS.md": [/Micro-PR Ceiling \((\d+) LOC\)/, /at most (\d+) reviewable implementation lines/],
    "references/engineering/engineering-rules.md": [/reviewable_lines <= (\d+)/, /active ceiling is (\d+)/],
    "docs/Website_System_Architecture_v1.0_LOCKED.md": [/(\d+)-LOC reviewability ceiling/],
    "docs/SYSTEM_ARCHITECTURE_AMENDMENT_v1.1.md": [/no more than \*\*(\d+) reviewable implementation lines/],
    "docs/SYSTEM_ARCHITECTURE_AMENDMENT_v1.2.md": [/(\d+)-line reviewability limit/],
    "scripts/check-change-size.sh": [/^MAX_LINES=(\d+)$/m],
  };
  return (patterns[path] ?? []).map((re) => Number(text.match(re)?.[1]));
}
export function validateGovernanceSnapshot(files, contract, sourceBinding) {
  for (const path of contract.governance.active_500_paths) {
    const values = limits(path, files[path] ?? "");
    if (!values.length || values.some((value) =>
      value !== contract.governance.active_reviewable_loc_limit)) {
      return makeBlocked("CHANGE_SIZE_DRIFT", "G_CHANGE_SIZE", "UNKNOWN", sourceBinding);
    }
  }
  const architecture = files["references/architecture/CONTEXT.md"] ?? "";
  let cursor = -1;
  for (const source of contract.architecture.active_sources) {
    const index = architecture.indexOf(source, cursor + 1);
    if (index < 0 || index <= cursor) {
      return makeBlocked("SOURCE_BINDING_STALE", "G_SOURCE_PRESENT", "UNKNOWN", sourceBinding);
    }
    cursor = index;
  }
  return true;
}

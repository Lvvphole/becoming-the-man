/* global structuredClone */
import { readFileSync } from "node:fs";
import { URL } from "node:url";
import { describe, expect, test } from "vitest";
import {
  evaluateRoute, makeBlocked, parseRoutingTable, validateBlocked,
  validateEvidenceRole, validateGovernanceSnapshot, validateLoadedInputs,
  validateReviewCycle,
} from "../scripts/verify-governance-routing.mjs";
import * as governanceRouting from "../scripts/verify-governance-routing.mjs";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const contract = JSON.parse(read("contracts/governance-routing-contract.json"));
const binding = { base: "fec5de5f242dc1dba4e007658f3323931f83c193",
  current_head: "66782c4019558e7ff2fd80ff05aa5c12eff12cf4" };
const contextText = read("CONTEXT.md");
const table = parseRoutingTable(contextText, binding);
function envelope(overrides = {}) {
  return {
    task_domains: ["governance"],
    source_sections: { engineering_rules: ["*"], architecture_manifest: ["*"] },
    workpiece_paths: ["package.json"],
    selected_evidence_ids: [],
    authorized_candidate_paths: ["package.json"],
    approvals: {},
    source_binding: binding,
    ...overrides,
  };
}
function activeFiles() {
  return Object.fromEntries(
    [...new Set([
      ...contract.governance.active_500_paths,
      "references/architecture/CONTEXT.md",
    ])].map((path) => [path, read(path)]),
  );
}
const options = (more = {}) => ({ sourceBinding: binding, files: activeFiles(), ...more });
const route = (...args) => evaluateRoute(table, args.length ? args[0] : envelope(), options(args[1] ?? {}));
const reason = (result) => result?.reason_code;

describe("governance route positives", () => {
  test("selects one governance route without lifecycle state", () => {
    const result = route();
    expect(result.route_id).toBe("route:governance");
    expect(result.layer3).toEqual(["architecture_manifest", "engineering_rules"]);
  });
  test("undeclared cross-domain input fails closed", () => {
    const result = route(envelope({ task_domains: ["governance", "product_behavior"] }));
    expect(result.status).toBe("BLOCKED");
    expect(result.reason_code).toBe("ROUTE_ZERO_MATCH");
  });
  test("validates BLOCKED records", () => {
    expect(validateBlocked(makeBlocked("ROUTE_ZERO_MATCH", "G_ROUTE_UNIQUE", binding), contract)).toBe(true);
  });
  test("active governance contains no seven-stage lifecycle selectors", () => {
    const governed = [
      contextText,
      read("AGENTS.md"),
      read("references/engineering/engineering-rules.md"),
      JSON.stringify(contract),
    ].join("\n");
    for (const token of [
      "workflow_stage", "target_stage", "stage_id",
      "01_scout", "02_plan", "03_contract", "04_implement",
      "05_verify", "06_review", "07_release",
    ]) expect(governed).not.toContain(token);
  });
});

describe("read-only localization bootstrap contract", () => {
  const discoveryRequest = (overrides = {}) => ({
    task_domains: ["product_behavior"],
    subject: "Accessibility page",
    source_binding: binding,
    ...overrides,
  });
  const discoveryFiles = () => ({
    ...activeFiles(),
    [table.source_registry.product_prd.path]: "loaded product prd",
  });
  const discover = (request = discoveryRequest(), more = {}) => {
    const fn = governanceRouting.evaluateDiscovery;
    if (typeof fn !== "function") return { status: "DISCOVERY_API_MISSING" };
    return fn(table, request, options({ files: discoveryFiles(), ...more }));
  };

  test("admits bounded read-only localization before the full task envelope exists", () => {
    expect(discover()).toEqual({
      status: "DISCOVERY_ALLOWED",
      route_id: "route:product_behavior",
      layer3: ["architecture_manifest", "engineering_rules", "product_prd"],
      permissions: {
        routed_source_section_localization: true,
        repository_workpiece_localization: true,
        evidence_access: false,
        mutation_access: false,
        route_inference: false,
      },
    });
  });

  test("missing task domain remains blocked rather than inferred", () => {
    const request = discoveryRequest();
    delete request.task_domains;
    expect(reason(discover(request))).toBe("MISSING_SELECTOR");
  });

  test("unknown and undeclared composite task domains remain blocked", () => {
    expect(reason(discover(discoveryRequest({ task_domains: ["unknown"] })))).toBe("ROUTE_ZERO_MATCH");
    expect(reason(discover(discoveryRequest({
      task_domains: ["product_behavior", "ui_ux"],
    })))).toBe("ROUTE_ZERO_MATCH");
  });

  test("stale discovery source binding is blocked", () => {
    expect(reason(discover(discoveryRequest({
      source_binding: { ...binding, current_head: "0".repeat(40) },
    })))).toBe("SOURCE_BINDING_STALE");
  });

  test("discovery blocks when a required repository source is unavailable", () => {
    const files = discoveryFiles();
    delete files[table.source_registry.product_prd.path];
    expect(reason(discover(discoveryRequest(), { files }))).toBe("MISSING_SOURCE");
  });

  test("discovery blocks when a required task-context source is unavailable", () => {
    expect(reason(discover(discoveryRequest({
      task_domains: ["content_identity"],
    }), { taskContext: {} }))).toBe("MISSING_SOURCE");
  });

  test("discovery output grants neither mutation nor evidence authority", () => {
    const result = discover();
    expect(result.permissions?.mutation_access).toBe(false);
    expect(result.permissions?.evidence_access).toBe(false);
    expect(result).not.toHaveProperty("authorized_candidate_paths");
    expect(result).not.toHaveProperty("approvals");
    expect(result).not.toHaveProperty("selected_evidence_ids");
  });

  test("discovery source localization is confined to the selected route bundle", () => {
    expect(discover().layer3).toEqual([
      "architecture_manifest", "engineering_rules", "product_prd",
    ]);
  });

  test("discovery requires a non-empty caller subject", () => {
    expect(reason(discover(discoveryRequest({ subject: "" })))).toBe("TASK_ENVELOPE_REQUIRED");
  });

  test("discovery rejects authority-bearing task-envelope fields", () => {
    for (const [field, value] of [
      ["source_sections", {}],
      ["workpiece_paths", ["src/routes/accessibility.tsx"]],
      ["selected_evidence_ids", ["ev-1"]],
      ["authorized_candidate_paths", ["src/routes/accessibility.tsx"]],
      ["approvals", { approved: true }],
    ]) {
      expect(reason(discover({ ...discoveryRequest(), [field]: value }))).toBe("TASK_ENVELOPE_REQUIRED");
    }
  });

  test("the discovery contract is exact-field and explicitly non-authoritative", () => {
    expect(contract.version).toBe("2.1.0");
    expect(contract.discovery_request.exact_field_set).toBe(true);
    expect(contract.discovery_request.required_fields).toEqual([
      "task_domains", "subject", "source_binding",
    ]);
    expect(contract.discovery_request.permissions).toEqual({
      routed_source_section_localization: true,
      repository_workpiece_localization: true,
      evidence_access: false,
      mutation_access: false,
      route_inference: false,
    });
  });

  test("a discovery request and discovery result cannot bypass normal envelope validation", () => {
    expect(reason(route(discoveryRequest()))).toBe("TASK_ENVELOPE_REQUIRED");
    expect(reason(route(discover()))).toBe("TASK_ENVELOPE_REQUIRED");
  });
});

describe("governance route negative controls", () => {
  test("zero route is blocked", () => {
    expect(reason(route(envelope({ task_domains: ["unknown"] })))).toBe("ROUTE_ZERO_MATCH");
  });
  test.each([
    ["duplicate id", (x) => x.routes.push(structuredClone(x.routes[0]))],
    ["missing bundle", (x) => delete x.routes[0].required_layer3_bundle],
    ["bad domains", (x) => { x.routes[0].selectors.task_domains = [1]; }],
    ["extra property", (x) => { x.routes[0].extra = true; }],
  ])("invalid route table %s is blocked", (_name, mutate) => {
    const copy = structuredClone(table); mutate(copy);
    const raw = ["ROUTING_TABLE_BEGIN", "```json", JSON.stringify(copy), "```", "ROUTING_TABLE_END"].join("\n");
    expect(reason(parseRoutingTable(raw, binding))).toBe("ROUTING_TABLE_INVALID");
  });
  test("missing selector is blocked", () => {
    const value = envelope();
    delete value.task_domains;
    expect(reason(route(value))).toBe("MISSING_SELECTOR");
  });
  test("missing Layer 3 source is blocked", () => {
    const copy = structuredClone(table);
    delete copy.source_registry.engineering_rules;
    expect(reason(evaluateRoute(copy, envelope(), options()))).toBe("MISSING_SOURCE");
  });
  test("stale architecture order is blocked", () => {
    const files = activeFiles();
    files["references/architecture/CONTEXT.md"] = [
      "ARCHITECTURE_MANIFEST_BEGIN", "```json",
      JSON.stringify({ active_reviewable_loc_limit: 500 }),
      "```", "ARCHITECTURE_MANIFEST_END",
      ...contract.architecture.active_sources.toReversed(),
    ].join("\n");
    expect(reason(validateGovernanceSnapshot(files, contract, binding))).toBe("SOURCE_BINDING_STALE");
  });
  test("evidence cannot become a requirement", () => {
    expect(reason(validateEvidenceRole("evidence", "requirement", binding))).toBe("EVIDENCE_AUTHORITY_FORBIDDEN");
  });
  test("evidence cannot grant merge authority", () => {
    expect(reason(validateEvidenceRole("evidence", "merge_authority", binding))).toBe("EVIDENCE_AUTHORITY_FORBIDDEN");
  });
  test("unlisted input is blocked", () => {
    expect(reason(validateLoadedInputs(["AGENTS.md", "secret.md"], ["AGENTS.md"], binding))).toBe("UNLISTED_INPUT");
  });
  test("wildcard path is blocked", () => {
    expect(reason(route(envelope({ workpiece_paths: ["src/**"] })))).toBe("WILDCARD_INPUT");
  });
  test("review cycle four is blocked", () => {
    expect(reason(validateReviewCycle(4, binding))).toBe("REVIEW_CYCLE_EXCEEDED");
  });
  test.each([499, 501, 600, 1000])("numeric ceiling %i is blocked", (value) => {
    const files = activeFiles();
    files["references/architecture/CONTEXT.md"] = files["references/architecture/CONTEXT.md"]
      .replace('"active_reviewable_loc_limit": 500', `"active_reviewable_loc_limit": ${value}`);
    expect(reason(validateGovernanceSnapshot(files, contract, binding))).toBe("CHANGE_SIZE_DRIFT");
  });
  test("selected evidence without an index is blocked", () => {
    expect(reason(route(envelope({ selected_evidence_ids: ["ev-1"] })))).toBe("EVIDENCE_INDEX_MISSING");
  });
  test("unknown evidence ID is blocked", () => {
    expect(reason(route(
      envelope({ selected_evidence_ids: ["ev-1"] }),
      { evidenceIndex: { normative: false, entries: {} } },
    ))).toBe("EVIDENCE_ID_UNKNOWN");
  });
  test("stale evidence is blocked", () => {
    expect(reason(route(
      envelope({ selected_evidence_ids: ["ev-1"] }),
      { evidenceIndex: { normative: false, entries: { "ev-1": { freshness: "historical" } } } },
    ))).toBe("EVIDENCE_BINDING_STALE");
  });
});

describe("contracted controls", () => {
  test.each([null, undefined, "bad", [], {}])("malformed envelope fails closed: %j",
    (value) => expect(reason(route(value))).toBe("TASK_ENVELOPE_REQUIRED"));
  test.each([["authorized_candidate_paths", undefined], ["workpiece_paths", null]])(
    "invalid envelope field %s is blocked", (field, value) => {
      const item = envelope(); if (value === undefined) delete item[field]; else item[field] = value;
      expect(reason(route(item))).toBe("TASK_ENVELOPE_REQUIRED");
    });
  test.each(["/etc/passwd", "../secret", "src/../secret", "C:/secret"])("path escape fails closed: %s", (path) => {
    if (path.startsWith("/")) expect(new RegExp(contract.task_envelope.repo_path_pattern).test(path)).toBe(false);
    expect(reason(route(envelope({ workpiece_paths: [path] })))).toBe("TASK_ENVELOPE_REQUIRED");
  });
  test("BLOCKED output binds trusted lineage without requiring a PR", () => {
    const result = route(envelope({ source_binding: {} }));
    expect(reason(result)).toBe("SOURCE_BINDING_STALE");
    expect(validateBlocked(result, contract)).toBe(true);
  });
  test("malformed trusted binding cannot route", () =>
    expect(evaluateRoute(table, envelope(), { sourceBinding: {}, files: activeFiles() }).status)
      .toBe("INVALID_EXECUTION_CONTEXT"));
  test("stale envelope binding is blocked", () =>
    expect(reason(route(envelope({ source_binding: { ...binding, current_head: "0".repeat(40) } }))))
      .toBe("SOURCE_BINDING_STALE"));
  test("distinct matching routes are blocked", () => {
    const copy = structuredClone(table);
    const extra = structuredClone(copy.routes.find((r) => r.route_id === "route:governance"));
    extra.route_id += "-alt"; copy.routes.push(extra);
    expect(reason(evaluateRoute(copy, envelope(), options()))).toBe("ROUTE_MULTI_MATCH");
  });
  test("source-invalid duplicate selector is pruned before cardinality", () => {
    const copy = structuredClone(table);
    const extra = structuredClone(copy.routes.find((r) => r.route_id === "route:governance"));
    extra.route_id += "-source-missing"; extra.required_layer3_bundle = ["published_book"]; copy.routes.push(extra);
    expect(evaluateRoute(copy, envelope(), options()).status).toBe("ROUTE_MATCH");
  });
  test("evidence eligibility prunes overlapping routes before cardinality", () => {
    const copy = structuredClone(table), target = copy.routes.find((r) => r.route_id === "route:governance");
    const extra = structuredClone(target);
    target.allowed_evidence_ids = ["ev-1"]; extra.route_id += "-alt"; extra.allowed_evidence_ids = ["ev-2"];
    copy.routes.push(extra);
    const evidenceIndex = { normative: false, entries: {
      "ev-1": { freshness: "current" }, "ev-x": { freshness: "current" },
    } };
    expect(evaluateRoute(copy, envelope({ selected_evidence_ids: ["ev-1"] }), options({ evidenceIndex })).route_id)
      .toBe(target.route_id);
    expect(reason(evaluateRoute(copy, envelope({ selected_evidence_ids: ["ev-x"] }), options({ evidenceIndex }))))
      .toBe("ROUTE_ZERO_MATCH");
  });
  test("missing exact Layer 3 file is blocked", () => {
    const files = activeFiles(); delete files["references/engineering/engineering-rules.md"];
    expect(reason(route(envelope(), { files }))).toBe("MISSING_SOURCE");
  });
  test.each([null, undefined, ""])("required source value %j fails closed", (value) => {
    const files = activeFiles(); files["references/engineering/engineering-rules.md"] = value;
    expect(reason(route(envelope(), { files }))).toBe("MISSING_SOURCE");
    const copy = structuredClone(table);
    const target = copy.routes.find((r) => r.route_id === "route:governance");
    target.required_layer3_bundle = ["published_book"];
    expect(reason(evaluateRoute(copy,
      envelope({ source_sections: { published_book: ["chapter"] } }),
      options({ taskContext: { published_book: value } })))).toBe("MISSING_SOURCE");
  });
  test.each([
    ["full", { engineering_rules: ["Section"], architecture_manifest: ["*"] }],
    ["explicit_selector_required", { engineering_rules: ["*"], architecture_manifest: ["*"] }],
  ])("section policy %s fails closed", (policy, source_sections) => {
    const copy = structuredClone(table); copy.source_registry.engineering_rules.section_policy = policy;
    expect(reason(evaluateRoute(copy, envelope({ source_sections }), options()))).toBe("MISSING_SELECTOR");
  });
  test("required approval facts are strict", () => {
    const copy = structuredClone(table);
    copy.routes.find((r) => r.route_id === "route:governance").predicate.required_approval_facts = ["approved"];
    expect(reason(evaluateRoute(copy, envelope({ approvals: { approved: false } }), options())))
      .toBe("ROUTE_ZERO_MATCH");
  });
  test("all canonical numeric ceilings equal 500", () =>
    expect(validateGovernanceSnapshot(activeFiles(), contract, binding)).toBe(true));
});

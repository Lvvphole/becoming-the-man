/* global structuredClone */
import { readFileSync } from "node:fs";
import { URL } from "node:url";
import { describe, expect, test } from "vitest";
import {
  evaluateRoute, makeBlocked, parseRoutingTable, validateBlocked,
  validateEvidenceRole, validateGovernanceSnapshot, validateLoadedInputs,
  validateReviewCycle, validateStageContract, validateTransition,
} from "../scripts/verify-governance-routing.mjs";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const contract = JSON.parse(read("contracts/governance-routing-contract.json"));
const binding = { pr: 49, base: "fec5de5f242dc1dba4e007658f3323931f83c193",
  current_head: "66782c4019558e7ff2fd80ff05aa5c12eff12cf4" };
const contextText = read("CONTEXT.md");
const table = parseRoutingTable(contextText, binding);
function envelope(overrides = {}) {
  return {
    workflow_stage: "04_implement",
    task_domains: ["governance"],
    source_sections: { engineering_rules: ["*"], architecture_manifest: ["*"] },
    workpiece_paths: ["package.json"],
    selected_evidence_ids: [],
    prior_outputs: {},
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
  test("selects one governance route", () => {
    const result = route();
    expect(result.stage_id).toBe("04_implement");
    expect(result.layer3).toEqual(["architecture_manifest", "engineering_rules"]);
  });
  test("undeclared cross-domain input fails closed", () => {
    const result = route(envelope({
      task_domains: ["governance", "product_behavior"],
    }));
    expect(result.status).toBe("BLOCKED");
    expect(result.reason_code).toBe("ROUTE_ZERO_MATCH");
  });
  test("validates BLOCKED records and stage contracts", () => {
    const blocked = makeBlocked("ROUTE_ZERO_MATCH", "G_ROUTE_UNIQUE", "UNKNOWN", binding);
    expect(validateBlocked(blocked, contract)).toBe(true);
    const stage = validateStageContract(
      "04_implement", read("stages/04_implement/CONTEXT.md"), contract, binding,
    );
    expect(stage.stage_id).toBe("04_implement");
  });
  test("allows a transition only when every required fact is true", () => {
    const result = validateTransition(table, "02_plan->03_contract", {
      plan_ready: true, explicit_user_approval: true, plan_binding_current: true,
    }, binding);
    expect(result).toBe(true);
  });
});

describe("governance route negative controls", () => {
  test("zero route is blocked", () => {
    expect(reason(route(envelope({ workflow_stage: "99_none" }))))
      .toBe("ROUTE_ZERO_MATCH");
  });
  test("duplicate route id is blocked before route evaluation", () => {
    const copy = structuredClone(table);
    copy.routes.push(structuredClone(copy.routes[0]));
    const raw = ["ROUTING_TABLE_BEGIN", "```json", JSON.stringify(copy),
      "```", "ROUTING_TABLE_END"].join("\n");
    expect(reason(parseRoutingTable(raw, binding))).toBe("ROUTING_TABLE_INVALID");
  });
  test("missing selector is blocked", () => {
    const value = envelope();
    delete value.workflow_stage;
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
    expect(reason(validateGovernanceSnapshot(files, contract, binding)))
      .toBe("SOURCE_BINDING_STALE");
  });
  test("evidence cannot become a requirement", () => {
    expect(reason(validateEvidenceRole("evidence", "requirement", binding)))
      .toBe("EVIDENCE_AUTHORITY_FORBIDDEN");
  });
  test("unlisted input is blocked", () => {
    expect(reason(validateLoadedInputs(["AGENTS.md", "secret.md"], ["AGENTS.md"], binding)))
      .toBe("UNLISTED_INPUT");
  });
  test("wildcard path is blocked", () => {
    expect(reason(route(envelope({ workpiece_paths: ["src/**"] }))))
      .toBe("WILDCARD_INPUT");
  });
  test("Plan to Contract without approval is blocked", () => {
    expect(reason(validateTransition(table, "02_plan->03_contract", {
      plan_ready: true, explicit_user_approval: false, plan_binding_current: true,
    }, binding))).toBe("TRANSITION_PRECONDITION_FALSE");
  });
  test("Verify to Review without PASS fact is blocked", () => {
    expect(reason(validateTransition(table, "05_verify->06_review", {
      verification_pass: false, exact_state_binding: true,
    }, binding))).toBe("TRANSITION_PRECONDITION_FALSE");
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
    expect(reason(route(envelope({ selected_evidence_ids: ["ev-1"] }))))
      .toBe("EVIDENCE_INDEX_MISSING");
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
      { evidenceIndex: {
        normative: false, entries: { "ev-1": { freshness: "historical" } },
      } },
    ))).toBe("EVIDENCE_BINDING_STALE");
  });
  test("malformed stage contract is blocked", () => {
    const malformed = read("stages/04_implement/CONTEXT.md")
      .replace("job: produce the bounded candidate defined by the approved plan and implementation contract\n", "");
    expect(reason(validateStageContract("04_implement", malformed, contract, binding)))
      .toBe("STAGE_CONTRACT_INVALID");
  });
});

describe("INC-1 contracted controls", () => {
  test.each([null, undefined, "bad", []])("malformed envelope fails closed: %j", (value) => {
    expect(reason(route(value))).toBe("TASK_ENVELOPE_REQUIRED");
  });
  test.each([
    ["prior_outputs", undefined], ["workpiece_paths", null],
  ])("invalid C2 field %s is blocked", (field, value) => {
    const item = envelope(); if (value === undefined) delete item[field]; else item[field] = value;
    expect(reason(route(item))).toBe("TASK_ENVELOPE_REQUIRED");
  });
  test.each(["/etc/passwd", "../secret", "src/../secret", "C:/secret"])(
    "path escape fails closed: %s",
    (path) => expect(reason(route(envelope({ workpiece_paths: [path] }))))
      .toBe("TASK_ENVELOPE_REQUIRED"),
  );
  test("BLOCKED output binds trusted lineage", () => {
    const result = route(envelope({ source_binding: {} }));
    expect(reason(result)).toBe("SOURCE_BINDING_STALE");
    expect(validateBlocked(result, contract)).toBe(true);
  });
  test("malformed trusted binding cannot route", () => {
    expect(evaluateRoute(table, envelope(), { sourceBinding: {}, files: activeFiles() }).status)
      .toBe("INVALID_EXECUTION_CONTEXT");
  });
  test("stale envelope binding is blocked", () => {
    expect(reason(route(envelope({ source_binding: { ...binding, current_head: "0".repeat(40) } }))))
      .toBe("SOURCE_BINDING_STALE");
  });
  test("distinct matching routes are blocked", () => {
    const copy = structuredClone(table);
    const extra = structuredClone(copy.routes.find((r) => r.route_id === "route:04_implement:governance"));
    extra.route_id += "-alt"; copy.routes.push(extra);
    expect(reason(evaluateRoute(copy, envelope(), options()))).toBe("ROUTE_MULTI_MATCH");
  });
  test("missing exact Layer 3 file is blocked", () => {
    const files = activeFiles(); delete files["references/engineering/engineering-rules.md"];
    expect(reason(route(envelope(), { files }))).toBe("MISSING_SOURCE");
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
    copy.routes.find((r) => r.route_id === "route:04_implement:governance")
      .predicate.required_approval_facts = ["approved"];
    expect(reason(evaluateRoute(copy, envelope({ approvals: { approved: false } }), options())))
      .toBe("ROUTE_ZERO_MATCH");
  });
  test("all seven canonical numeric ceilings equal 500", () => {
    expect(validateGovernanceSnapshot(activeFiles(), contract, binding)).toBe(true);
  });
});

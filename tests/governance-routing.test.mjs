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
const contextText = read("CONTEXT.md");
const table = parseRoutingTable(contextText);
function envelope(overrides = {}) {
  return {
    workflow_stage: "04_implement",
    task_domains: ["governance"],
    source_sections: {},
    workpiece_paths: ["package.json"],
    selected_evidence_ids: [],
    prior_outputs: {},
    authorized_candidate_paths: ["package.json"],
    approvals: {},
    source_binding: {},
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
const reason = (result) => result?.reason_code;

describe("governance route positives", () => {
  test("selects one governance route", () => {
    const result = evaluateRoute(table, envelope());
    expect(result.stage_id).toBe("04_implement");
    expect(result.layer3).toEqual(["architecture_manifest", "engineering_rules"]);
  });
  test("undeclared cross-domain input fails closed", () => {
    const result = evaluateRoute(table, envelope({
      task_domains: ["governance", "product_behavior"],
    }));
    expect(result.status).toBe("BLOCKED");
    expect(result.reason_code).toBe("ROUTE_ZERO_MATCH");
  });
  test("validates BLOCKED records and stage contracts", () => {
    const blocked = makeBlocked("ROUTE_ZERO_MATCH", "G_ROUTE_UNIQUE", "UNKNOWN");
    expect(validateBlocked(blocked, contract)).toBe(true);
    const stage = validateStageContract(
      "04_implement", read("stages/04_implement/CONTEXT.md"), contract,
    );
    expect(stage.stage_id).toBe("04_implement");
  });
  test("allows a transition only when every required fact is true", () => {
    const result = validateTransition(table, "02_plan->03_contract", {
      plan_ready: true, explicit_user_approval: true, plan_binding_current: true,
    });
    expect(result).toBe(true);
  });
});

describe("governance route negative controls", () => {
  test("zero route is blocked", () => {
    expect(reason(evaluateRoute(table, envelope({ workflow_stage: "99_none" }))))
      .toBe("ROUTE_ZERO_MATCH");
  });
  test("duplicate raw stage key is blocked before JSON.parse", () => {
    const raw = [
      "ROUTING_TABLE_BEGIN", "```json",
      '{"stage_registry":{"x":{},"x":{}},"source_registry":{},"domain_registry":{}}',
      "```", "ROUTING_TABLE_END",
    ].join("\n");
    expect(reason(parseRoutingTable(raw))).toBe("ROUTE_MULTI_MATCH");
  });
  test("missing selector is blocked", () => {
    const value = envelope();
    delete value.workflow_stage;
    expect(reason(evaluateRoute(table, value))).toBe("MISSING_SELECTOR");
  });
  test("missing Layer 3 source is blocked", () => {
    const copy = structuredClone(table);
    delete copy.source_registry.engineering_rules;
    expect(reason(evaluateRoute(copy, envelope()))).toBe("MISSING_SOURCE");
  });
  test("stale architecture order is blocked", () => {
    const files = activeFiles();
    files["references/architecture/CONTEXT.md"] =
      contract.architecture.active_sources.toReversed().join("\n");
    expect(reason(validateGovernanceSnapshot(files, contract, table)))
      .toBe("SOURCE_BINDING_STALE");
  });
  test("evidence cannot become a requirement", () => {
    expect(reason(validateEvidenceRole("evidence", "requirement")))
      .toBe("EVIDENCE_AUTHORITY_FORBIDDEN");
  });
  test("unlisted input is blocked", () => {
    expect(reason(validateLoadedInputs(["AGENTS.md", "secret.md"], ["AGENTS.md"])))
      .toBe("UNLISTED_INPUT");
  });
  test("wildcard path is blocked", () => {
    expect(reason(evaluateRoute(table, envelope({ workpiece_paths: ["src/**"] }))))
      .toBe("WILDCARD_INPUT");
  });
  test("Plan to Contract without approval is blocked", () => {
    expect(reason(validateTransition(table, "02_plan->03_contract", {
      plan_ready: true, explicit_user_approval: false, plan_binding_current: true,
    }))).toBe("TRANSITION_PRECONDITION_FALSE");
  });
  test("Verify to Review without PASS fact is blocked", () => {
    expect(reason(validateTransition(table, "05_verify->06_review", {
      verification_pass: false, exact_state_binding: true,
    }))).toBe("TRANSITION_PRECONDITION_FALSE");
  });
  test("review cycle four is blocked", () => {
    expect(reason(validateReviewCycle(4))).toBe("REVIEW_CYCLE_EXCEEDED");
  });
  test("active 1,000-line drift is blocked", () => {
    const files = activeFiles();
    files["AGENTS.md"] += "\nactive ceiling: 1,000\n";
    expect(reason(validateGovernanceSnapshot(files, contract, table)))
      .toBe("CHANGE_SIZE_DRIFT");
  });
  test("selected evidence without an index is blocked", () => {
    expect(reason(evaluateRoute(
      table, envelope({ selected_evidence_ids: ["ev-1"] }),
    ))).toBe("EVIDENCE_INDEX_MISSING");
  });
  test("unknown evidence ID is blocked", () => {
    expect(reason(evaluateRoute(
      table, envelope({ selected_evidence_ids: ["ev-1"] }),
      { evidenceIndex: { normative: false, entries: {} } },
    ))).toBe("EVIDENCE_ID_UNKNOWN");
  });
  test("stale evidence is blocked", () => {
    expect(reason(evaluateRoute(
      table, envelope({ selected_evidence_ids: ["ev-1"] }),
      { evidenceIndex: {
        normative: false, entries: { "ev-1": { freshness: "historical" } },
      } },
    ))).toBe("EVIDENCE_BINDING_STALE");
  });
  test("malformed stage contract is blocked", () => {
    const malformed = read("stages/04_implement/CONTEXT.md")
      .replace("job: produce the bounded candidate defined by the approved plan and implementation contract\n", "");
    expect(reason(validateStageContract("04_implement", malformed, contract)))
      .toBe("STAGE_CONTRACT_INVALID");
  });
});

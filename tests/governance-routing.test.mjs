import { describe, expect, test } from "vitest";
import { loadGovernance, validateGovernance } from "../scripts/verify-governance-routing.mjs";

const base = loadGovernance();
const copy = () => structuredClone(base);
const failures = (value) => validateGovernance(value);

describe("repository governance routing", () => {
  test("current governance passes", () => expect(failures(copy())).toEqual([]));

  test("lifecycle state cannot re-enter active governance", () => {
    const value = copy();
    value.context += "\nworkflow_" + "stage";
    expect(failures(value)).toContain("LIFECYCLE_TOKEN:" + "workflow_" + "stage");
  });

  test("unknown paths must fail closed", () => {
    const value = copy();
    value.contract.invariants.unknown_path = "ALLOW";
    expect(failures(value)).toContain("UNKNOWN_NOT_CLOSED");
  });

  test("ambiguous paths must fail closed", () => {
    const value = copy();
    value.contract.invariants.ambiguous_path = "ALLOW";
    expect(failures(value)).toContain("AMBIGUOUS_NOT_CLOSED");
  });

  test("multi-path work composes requirements", () => {
    const value = copy();
    value.contract.invariants.multi_path_composition = "FIRST_MATCH";
    expect(failures(value)).toContain("COMPOSITION_WEAKENED");
  });

  test("semantic route inference is forbidden", () => {
    const value = copy();
    value.contract.invariants.semantic_similarity_routing = true;
    expect(failures(value)).toContain("SEMANTIC_ROUTING_ENABLED");
  });

  test("evidence cannot become authority", () => {
    const value = copy();
    value.contract.invariants.evidence_is_authority = true;
    expect(failures(value)).toContain("EVIDENCE_AUTHORITY");
  });

  test("external harness cannot become repository authority", () => {
    const value = copy();
    value.contract.invariants.external_harness_is_authority = true;
    expect(failures(value)).toContain("HARNESS_AUTHORITY");
  });

  test("external harness cannot grant merge", () => {
    const value = copy();
    value.contract.invariants.external_harness_grants_merge = true;
    expect(failures(value)).toContain("HARNESS_MERGE");
  });

  test("merge requires separate owner authorization", () => {
    const value = copy();
    value.contract.invariants.merge_requires_separate_owner_authorization = false;
    expect(failures(value)).toContain("MERGE_AUTHORITY");
  });

  test("required repository route cannot disappear", () => {
    const value = copy();
    value.context = value.context.replace("`supabase/**`", "`persistence-removed`");
    expect(failures(value)).toContain("ROUTE_MISSING:`supabase/**`");
  });

  test("root AGENTS must keep the single router entry point", () => {
    const value = copy();
    value.agents = value.agents.replaceAll("root `CONTEXT.md`", "another router");
    expect(failures(value)).toContain("AGENTS_ROUTER");
  });

  test("repository-work readiness gate cannot disappear", () => {
    const value = copy();
    value.rules = value.rules.replace("G_REPOSITORY_WORK_READY", "G_REMOVED");
    expect(failures(value)).toContain("READINESS_GATE");
  });
});

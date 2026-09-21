import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { evaluateShadow, parseRoutingTable, type RoutingTable, type TaskContract } from "../src/routing";

const base = "a".repeat(40);
const fixture = readFileSync(new URL("../fixtures/CONTEXT.target.md", import.meta.url), "utf8");
const parsed = parseRoutingTable(fixture);
if (!parsed) throw new Error("canonical shadow routing fixture is invalid");
const table: RoutingTable = parsed;
const sources = new Set(["stages/03_contract/output/implementation-contract.md"]);

const task = (overrides: Partial<TaskContract> = {}): TaskContract => ({
  base_sha: base,
  goal: "Prove deterministic INC-1 shadow routing",
  requirement_refs: ["INC1_ROUTING"],
  allowed_paths: ["harness/src/routing.ts"],
  allowed_tools: ["node"],
  required_checks: ["harness-lint", "harness-test", "harness-typecheck"],
  stop_condition: "stop after one verified candidate",
  ...overrides,
});

const diagnostic = (result: ReturnType<typeof evaluateShadow>) =>
  result.outcome === "DENY" ? result.diagnostic : null;

describe("frozen INC-1 negative controls", () => {
  it("NC-01 denies an unrouted path", () => {
    expect(diagnostic(evaluateShadow(table, task({ allowed_paths: ["outside/file.ts"] }), base, sources)))
      .toBe("UNROUTED_PATH");
  });

  it("NC-02 denies equal-specificity ownership", () => {
    const copy = structuredClone(table);
    copy.path_routes[0].exact.push("harness/src/routing.ts");
    copy.path_routes[1].exact.push("harness/src/routing.ts");
    expect(diagnostic(evaluateShadow(copy, task(), base, sources))).toBe("AMBIGUOUS_PATH_ROUTE");
  });

  it("NC-03 denies an unknown requirement", () => {
    expect(diagnostic(evaluateShadow(table, task({ requirement_refs: ["UNKNOWN"] }), base, sources)))
      .toBe("UNKNOWN_REQUIREMENT");
  });

  it("NC-04 denies duplicate requirement identity", () => {
    const copy = structuredClone(table);
    copy.requirements.push(structuredClone(copy.requirements[0]));
    expect(diagnostic(evaluateShadow(copy, task(), base, sources))).toBe("AMBIGUOUS_REQUIREMENT");
  });

  it("NC-05 denies an unavailable requirement source", () => {
    const copy = structuredClone(table);
    copy.requirements[0].source = "missing-source";
    expect(diagnostic(evaluateShadow(copy, task(), base, sources))).toBe("REQUIREMENT_SOURCE_UNAVAILABLE");
  });

  it("NC-06 denies weakened minimum checks", () => {
    expect(diagnostic(evaluateShadow(table, task({ required_checks: ["harness-lint", "harness-typecheck"] }), base, sources)))
      .toBe("MINIMUM_CHECKS_WEAKENED");
  });

  it("NC-07 denies a stale base", () => {
    expect(diagnostic(evaluateShadow(table, task(), "b".repeat(40), sources))).toBe("STALE_OR_WRONG_BASE");
  });

  it("NC-08 denies a malformed compact task contract", () => {
    const malformed = { ...task() } as Record<string, unknown>;
    delete malformed.stop_condition;
    expect(diagnostic(evaluateShadow(table, malformed, base, sources))).toBe("TASK_CONTRACT_INVALID");
  });
});

describe("positive routing controls", () => {
  it("uses longest-prefix ownership and unions minimum checks", () => {
    const result = evaluateShadow(table, task(), base, sources);
    expect(result.outcome).toBe("ALLOW");
    if (result.outcome !== "ALLOW") return;
    expect(result.owners["harness/src/routing.ts"]).toBe("harness-src");
    expect(result.minimum_checks).toEqual(["harness-lint", "harness-test", "harness-typecheck"]);
    expect(result.required_sources).toEqual(["stages/03_contract/output/implementation-contract.md"]);
  });

  it("prefers exact ownership over prefixes", () => {
    const result = evaluateShadow(table, task({ allowed_paths: [".github/workflows/pr-verification.yml"] }), base, sources);
    expect(result.outcome).toBe("ALLOW");
    if (result.outcome !== "ALLOW") return;
    expect(result.owners[".github/workflows/pr-verification.yml"]).toBe("workflow");
  });
});

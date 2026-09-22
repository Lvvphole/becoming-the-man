import { readFileSync } from "node:fs";

export const prohibitedLifecycleTokens = Object.freeze([
  "01_scout", "02_plan", "03_contract", "04_implement", "05_verify", "06_review", "07_release",
  "workflow_stage", "target_stage", "stage_id", "PLAN_READY", "CONTRACT_READY", "CANDIDATE_READY",
]);

export function loadGovernance(read = (path) => readFileSync(path, "utf8")) {
  return {
    agents: read("AGENTS.md"),
    context: read("CONTEXT.md"),
    rules: read("references/engineering/engineering-rules.md"),
    contract: JSON.parse(read("contracts/governance-routing-contract.json")),
  };
}

export function validateGovernance({ agents, context, rules, contract }) {
  const failures = [];
  const active = [agents, context, rules, JSON.stringify(contract)].join("\n");
  for (const token of prohibitedLifecycleTokens) {
    if (active.includes(token)) failures.push(`LIFECYCLE_TOKEN:${token}`);
  }

  if (contract.authority !== "CONTEXT.md") failures.push("ROUTE_AUTHORITY");
  if (contract.invariants?.unknown_path !== "BLOCKED: ROUTE_NOT_FOUND") failures.push("UNKNOWN_NOT_CLOSED");
  if (contract.invariants?.ambiguous_path !== "BLOCKED: ROUTE_AMBIGUOUS") failures.push("AMBIGUOUS_NOT_CLOSED");
  if (contract.invariants?.multi_path_composition !== "UNION_REQUIREMENTS") failures.push("COMPOSITION_WEAKENED");
  if (contract.invariants?.semantic_similarity_routing !== false) failures.push("SEMANTIC_ROUTING_ENABLED");
  if (contract.invariants?.evidence_is_authority !== false) failures.push("EVIDENCE_AUTHORITY");
  if (contract.invariants?.external_harness_is_authority !== false) failures.push("HARNESS_AUTHORITY");
  if (contract.invariants?.external_harness_grants_merge !== false) failures.push("HARNESS_MERGE");
  if (contract.invariants?.merge_requires_separate_owner_authorization !== true) failures.push("MERGE_AUTHORITY");

  const selectors = [
    "`src/**`", "`server/**`", "`api/**`", "`contracts/**`", "`supabase/**`",
    "`config/**`", "`tests/**`", "`scripts/**`", "`.github/workflows/**`", "other `docs/**`",
  ];
  for (const selector of selectors) {
    if (!context.includes(selector)) failures.push(`ROUTE_MISSING:${selector}`);
  }

  if (!context.includes("BLOCKED: ROUTE_NOT_FOUND")) failures.push("CONTEXT_UNKNOWN_NOT_CLOSED");
  if (!context.includes("BLOCKED: ROUTE_AMBIGUOUS")) failures.push("CONTEXT_AMBIGUOUS_NOT_CLOSED");
  if (!context.includes("compose the matching rows")) failures.push("CONTEXT_COMPOSITION");
  if (!agents.includes("root `CONTEXT.md`")) failures.push("AGENTS_ROUTER");
  if (!rules.includes("G_REPOSITORY_WORK_READY")) failures.push("READINESS_GATE");
  if (!rules.includes("Merge remains a separate owner-authorized action.")) failures.push("RULES_MERGE_AUTHORITY");

  return failures;
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  const failures = validateGovernance(loadGovernance());
  if (failures.length) {
    console.error(JSON.stringify({ status: "BLOCKED", failures }));
    process.exit(1);
  }
  console.log("PASS: deterministic repository routing governance is internally consistent.");
}

import { describe, expect, it } from "vitest";

import { evaluateReadiness, type ReadinessInput } from "../../agent-harness/src/inc0";

const SHA_A = "a".repeat(64);
const SHA_B = "b".repeat(64);

function validInput(): ReadinessInput {
  return {
    taskEnvelope: {
      mode: "IMPLEMENT",
      requestedRef: "main",
      userRequestSha256: SHA_A,
      selectedPlanSha256: SHA_B,
      authorizedCandidatePaths: [
        "agent-harness/src/inc0.ts",
        "tests/agent-harness/inc0.test.ts",
        "tasks/todo.md",
      ],
      proposedCandidatePaths: ["agent-harness/src/inc0.ts"],
      governanceChange: false,
      destructiveActions: false,
    },
    authority: {
      rootAgents: { path: "AGENTS.md", gitBlobOid: "1".repeat(40), contentSha256: SHA_A },
      engineeringRules: {
        source: "skill://flora-skills/root/.codex/skills/remote-skills/skill-6a7bbe3c89448191900ebcdd6395ac7c/SKILL.md",
        contentSha256: "deb95b212e0d3fae948e6cd0b9b932ede58cbaeef0170ccc8257b7a80a117793",
      },
    },
    expected: {
      rootAgentsGitBlobOid: "1".repeat(40),
      rootAgentsContentSha256: SHA_A,
      engineeringRulesSource: "skill://flora-skills/root/.codex/skills/remote-skills/skill-6a7bbe3c89448191900ebcdd6395ac7c/SKILL.md",
      engineeringRulesContentSha256: "deb95b212e0d3fae948e6cd0b9b932ede58cbaeef0170ccc8257b7a80a117793",
      selectedPlanSha256: SHA_B,
    },
    targetProfileSha256: SHA_A,
    expectedTargetProfileSha256: SHA_A,
    runConfigurationSha256: SHA_B,
    expectedRunConfigurationSha256: SHA_B,
    reads: ["AGENTS.md", "engineering-rules"],
    unresolvedConflicts: [],
  };
}

describe("INC-0 readiness gate", () => {
  it("returns PRE_CODE_READY without authoring tools for exact trusted bindings", () => {
    expect(evaluateReadiness(validInput())).toEqual({
      state: "PRE_CODE_READY",
      authoringTools: [],
    });
  });

  it.each([
    ["missing root read", (input: ReadinessInput) => { input.reads = ["engineering-rules"]; }, "BLOCKED_REQUIRED_READ_MISSING"],
    ["root digest mismatch", (input: ReadinessInput) => { input.expected.rootAgentsContentSha256 = SHA_B; }, "BLOCKED_AUTHORITY_MISMATCH"],
    ["root blob mismatch", (input: ReadinessInput) => { input.expected.rootAgentsGitBlobOid = "2".repeat(40); }, "BLOCKED_AUTHORITY_MISMATCH"],
    ["rules source mismatch", (input: ReadinessInput) => { input.expected.engineeringRulesSource = "skill://wrong"; }, "BLOCKED_AUTHORITY_MISMATCH"],
    ["rules digest mismatch", (input: ReadinessInput) => { input.expected.engineeringRulesContentSha256 = SHA_A; }, "BLOCKED_AUTHORITY_MISMATCH"],
    ["target profile mismatch", (input: ReadinessInput) => { input.expectedTargetProfileSha256 = SHA_B; }, "BLOCKED_AUTHORITY_MISMATCH"],
    ["run configuration mismatch", (input: ReadinessInput) => { input.expectedRunConfigurationSha256 = SHA_A; }, "BLOCKED_AUTHORITY_MISMATCH"],
    ["plan digest mismatch", (input: ReadinessInput) => { input.expected.selectedPlanSha256 = SHA_A; }, "BLOCKED_PLAN_MISMATCH"],
    ["scope expansion", (input: ReadinessInput) => { input.taskEnvelope.proposedCandidatePaths = ["src/root.tsx"]; }, "BLOCKED_SCOPE"],
    ["wildcard scope", (input: ReadinessInput) => { input.taskEnvelope.authorizedCandidatePaths = ["agent-harness/**"]; }, "BLOCKED_SCOPE"],
    ["unresolved conflict", (input: ReadinessInput) => { input.unresolvedConflicts = ["authority drift"]; }, "BLOCKED_CONFLICT"],
  ])("blocks %s", (_name, mutate, code) => {
    const input = validInput();
    mutate(input);
    expect(evaluateReadiness(input)).toEqual({ state: "BLOCKED", code, authoringTools: [] });
  });
});

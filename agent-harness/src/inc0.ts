export type RunMode =
  | "SCOUT"
  | "PLAN"
  | "IMPLEMENT"
  | "REPAIR"
  | "REVIEW"
  | "GOVERNANCE_CHANGE";

export interface GitAuthorityIdentity {
  path: string;
  gitBlobOid: string;
  contentSha256: string;
}

export interface ExternalAuthorityIdentity {
  source: string;
  contentSha256: string;
}

export interface TaskEnvelope {
  mode: RunMode;
  requestedRef: string;
  userRequestSha256: string;
  selectedPlanSha256: string;
  authorizedCandidatePaths: string[];
  proposedCandidatePaths: string[];
  governanceChange: boolean;
  destructiveActions: boolean;
}

export interface ReadinessInput {
  taskEnvelope: TaskEnvelope;
  authority: {
    rootAgents: GitAuthorityIdentity;
    engineeringRules: ExternalAuthorityIdentity;
  };
  expected: {
    rootAgentsGitBlobOid: string;
    rootAgentsContentSha256: string;
    engineeringRulesSource: string;
    engineeringRulesContentSha256: string;
    selectedPlanSha256: string;
  };
  targetProfileSha256: string;
  expectedTargetProfileSha256: string;
  runConfigurationSha256: string;
  expectedRunConfigurationSha256: string;
  reads: string[];
  unresolvedConflicts: string[];
}

export type BlockingCode =
  | "BLOCKED_INVALID_ENVELOPE"
  | "BLOCKED_REQUIRED_READ_MISSING"
  | "BLOCKED_AUTHORITY_MISMATCH"
  | "BLOCKED_PLAN_MISMATCH"
  | "BLOCKED_SCOPE"
  | "BLOCKED_CONFLICT";

export type ReadinessDecision =
  | { state: "PRE_CODE_READY"; authoringTools: [] }
  | { state: "BLOCKED"; code: BlockingCode; authoringTools: [] };

const SHA256 = /^[0-9a-f]{64}$/;
const GIT_BLOB_OID = /^[0-9a-f]{40}$/;
const REQUIRED_READS = ["AGENTS.md", "engineering-rules"];

function blocked(code: BlockingCode): ReadinessDecision {
  return { state: "BLOCKED", code, authoringTools: [] };
}

function isCanonicalPath(path: string): boolean {
  return (
    path.length > 0 &&
    !path.startsWith("/") &&
    !path.includes("\\") &&
    !path.includes("*") &&
    !path.split("/").includes("..") &&
    !path.split("/").includes(".")
  );
}

function hasValidEnvelope(envelope: TaskEnvelope): boolean {
  return (
    envelope.mode === "IMPLEMENT" &&
    envelope.requestedRef.length > 0 &&
    SHA256.test(envelope.userRequestSha256) &&
    SHA256.test(envelope.selectedPlanSha256) &&
    envelope.authorizedCandidatePaths.length > 0 &&
    envelope.proposedCandidatePaths.length > 0 &&
    !envelope.governanceChange &&
    !envelope.destructiveActions
  );
}

export function evaluateReadiness(input: ReadinessInput): ReadinessDecision {
  if (!hasValidEnvelope(input.taskEnvelope)) {
    return blocked("BLOCKED_INVALID_ENVELOPE");
  }

  if (!REQUIRED_READS.every((required) => input.reads.includes(required))) {
    return blocked("BLOCKED_REQUIRED_READ_MISSING");
  }

  const { rootAgents, engineeringRules } = input.authority;
  if (
    rootAgents.path !== "AGENTS.md" ||
    !GIT_BLOB_OID.test(rootAgents.gitBlobOid) ||
    !SHA256.test(rootAgents.contentSha256) ||
    !SHA256.test(engineeringRules.contentSha256) ||
    rootAgents.gitBlobOid !== input.expected.rootAgentsGitBlobOid ||
    rootAgents.contentSha256 !== input.expected.rootAgentsContentSha256 ||
    engineeringRules.source !== input.expected.engineeringRulesSource ||
    engineeringRules.contentSha256 !== input.expected.engineeringRulesContentSha256
  ) {
    return blocked("BLOCKED_AUTHORITY_MISMATCH");
  }

  if (input.taskEnvelope.selectedPlanSha256 !== input.expected.selectedPlanSha256) {
    return blocked("BLOCKED_PLAN_MISMATCH");
  }

  if (
    !SHA256.test(input.targetProfileSha256) ||
    !SHA256.test(input.runConfigurationSha256) ||
    input.targetProfileSha256 !== input.expectedTargetProfileSha256 ||
    input.runConfigurationSha256 !== input.expectedRunConfigurationSha256
  ) {
    return blocked("BLOCKED_AUTHORITY_MISMATCH");
  }

  const authorizedPaths = input.taskEnvelope.authorizedCandidatePaths;
  const proposedPaths = input.taskEnvelope.proposedCandidatePaths;
  const authorized = new Set(authorizedPaths);
  if (
    !authorizedPaths.every(isCanonicalPath) ||
    !proposedPaths.every(isCanonicalPath) ||
    !proposedPaths.every((path) => authorized.has(path))
  ) {
    return blocked("BLOCKED_SCOPE");
  }

  if (input.unresolvedConflicts.length > 0) {
    return blocked("BLOCKED_CONFLICT");
  }

  return { state: "PRE_CODE_READY", authoringTools: [] };
}

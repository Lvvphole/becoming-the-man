export const CANONICAL_ENGINEERING_RULES_SOURCE =
  "skill://flora-skills/root/.codex/skills/remote-skills/skill-6a7bbe3c89448191900ebcdd6395ac7c/SKILL.md" as const;

export const CANONICAL_ENGINEERING_RULES_SHA256 =
  "deb95b212e0d3fae948e6cd0b9b932ede58cbaeef0170ccc8257b7a80a117793" as const;

export const PRE_READINESS_TOOLS = [
  "read_file",
  "glob",
  "grep",
  "ask_question",
  "submit_readiness_record",
] as const;

export const BLOCKING_CODES = [
  "BLOCKED_TASK_ENVELOPE_INVALID",
  "BLOCKED_READINESS_SCHEMA_INVALID",
  "BLOCKED_ENVELOPE_DIGEST_MISMATCH",
  "BLOCKED_BASE_COMMIT_MISMATCH",
  "BLOCKED_TARGET_PROFILE_MISMATCH",
  "BLOCKED_RUN_CONFIGURATION_MISMATCH",
  "BLOCKED_AUTHORITY_BINDING_MISMATCH",
  "BLOCKED_ROUTING_MISMATCH",
  "BLOCKED_UNRESOLVED_CONFLICTS",
  "BLOCKED_SCOPE_EXCEEDS_ENVELOPE",
  "BLOCKED_READ_AUDIT_INSUFFICIENT",
] as const;

export type RunMode =
  | "SCOUT"
  | "PLAN"
  | "IMPLEMENT"
  | "REPAIR"
  | "REVIEW"
  | "GOVERNANCE_CHANGE";

export type ScopeSource = "selected_plan" | "direct_user_authorization";
export type BlockingCode = (typeof BLOCKING_CODES)[number];
export type ReadinessCode = "PRE_CODE_READY" | BlockingCode;
export type ReadinessState = "PRE_CODE_READY" | "BLOCKED";

export interface AuthorityBinding {
  path: string;
  git_blob_oid: string;
  content_sha256: string;
}

export interface ExternalAuthorityBinding {
  source_identifier: string;
  content_sha256: string;
}

export type ReadAuditEntry = AuthorityBinding | ExternalAuthorityBinding;

export interface TaskEnvelope {
  task_id: string;
  mode: RunMode;
  user_request_digest_sha256: string;
  target_repository: string;
  requested_ref: string;
  scope_source: ScopeSource;
  authorized_effects: readonly string[];
  authorized_candidate_paths: readonly string[];
  governance_change_authorized: boolean;
  destructive_actions_authorized: boolean;
  required_verification_command_ids: readonly string[];
  selected_plan_sha256: string | null;
}

export interface ReadinessRecord {
  task_envelope_sha256: string;
  base_commit_oid: string;
  target_profile_digest: string;
  run_configuration_digest: string;
  authority_bundle: readonly AuthorityBinding[];
  engineering_rules: ExternalAuthorityBinding;
  routed_skill: AuthorityBinding | null;
  verified_gap: string;
  governing_rules: readonly string[];
  required_evidence: readonly string[];
  permitted_next_action: string;
  stop_condition: string;
  proposed_candidate_paths: readonly string[];
  unresolved_conflicts: readonly string[];
}

export interface TrustedInc0Environment {
  base_commit_oid: string;
  target_profile_digest: string;
  run_configuration_digest: string;
  expected_authorities: readonly AuthorityBinding[];
  canonical_engineering_rules: ExternalAuthorityBinding;
  routed_skills: Readonly<Record<RunMode, AuthorityBinding | null>>;
}

export type ReadinessDecision =
  | {
      code: "PRE_CODE_READY";
      state: "PRE_CODE_READY";
      authorized_tools: readonly [];
      findings: readonly [];
    }
  | {
      code: BlockingCode;
      state: "BLOCKED";
      authorized_tools: readonly [];
      findings: readonly string[];
    };

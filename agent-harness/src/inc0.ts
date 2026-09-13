import { createHash } from "node:crypto";

import { z } from "zod";

export const CANONICAL_ENGINEERING_RULES_SOURCE =
  "skill://flora-skills/root/.codex/skills/remote-skills/skill-6a7bbe3c89448191900ebcdd6395ac7c/SKILL.md";

export const CANONICAL_ENGINEERING_RULES_SHA256 =
  "deb95b212e0d3fae948e6cd0b9b932ede58cbaeef0170ccc8257b7a80a117793";

export const PRE_READINESS_TOOLS = [
  "read_file",
  "glob",
  "grep",
  "ask_question",
  "submit_readiness_record",
] as const;

const SHA256_PATTERN = /^[0-9a-f]{64}$/;
const GIT_OID_PATTERN = /^[0-9a-f]{40}$/;
const TARGET_REPOSITORY = "Lvvphole/becoming-the-man" as const;

export const RunModeSchema = z.enum([
  "SCOUT",
  "PLAN",
  "IMPLEMENT",
  "REPAIR",
  "REVIEW",
  "GOVERNANCE_CHANGE",
]);

export type RunMode = z.infer<typeof RunModeSchema>;

const Sha256Schema = z.string().regex(SHA256_PATTERN);
const GitOidSchema = z.string().regex(GIT_OID_PATTERN);

function isCanonicalCandidatePath(path: string): boolean {
  const segments = path.split("/");
  return (
    path.length > 0 &&
    !path.startsWith("/") &&
    !path.includes("\\") &&
    !path.includes("*") &&
    !segments.includes("..") &&
    !segments.includes(".")
  );
}

const CandidatePathSchema = z
  .string()
  .min(1)
  .refine(isCanonicalCandidatePath, "candidate path must be an exact repository-relative path");

export const AuthorityBindingSchema = z
  .object({
    path: z.string().min(1),
    git_blob_oid: GitOidSchema,
    content_sha256: Sha256Schema,
  })
  .strict();

export type AuthorityBinding = z.infer<typeof AuthorityBindingSchema>;

export const ExternalAuthorityBindingSchema = z
  .object({
    source_identifier: z.literal(CANONICAL_ENGINEERING_RULES_SOURCE),
    content_sha256: z.literal(CANONICAL_ENGINEERING_RULES_SHA256),
  })
  .strict();

export type ExternalAuthorityBinding = z.infer<typeof ExternalAuthorityBindingSchema>;

export const TaskEnvelopeSchema = z
  .object({
    task_id: z.string().min(1),
    mode: RunModeSchema,
    user_request_digest_sha256: Sha256Schema,
    target_repository: z.literal(TARGET_REPOSITORY),
    requested_ref: z.string().min(1),
    scope_source: z.enum(["selected_plan", "direct_user_authorization"]),
    authorized_effects: z.array(z.string().min(1)),
    authorized_candidate_paths: z.array(CandidatePathSchema).min(1),
    governance_change_authorized: z.boolean(),
    destructive_actions_authorized: z.boolean(),
    required_verification_command_ids: z.array(z.string().min(1)),
    selected_plan_sha256: Sha256Schema.nullable().optional(),
  })
  .strict()
  .superRefine((envelope, context) => {
    if (
      envelope.scope_source === "selected_plan" &&
      envelope.selected_plan_sha256 == null
    ) {
      context.addIssue({
        code: "custom",
        path: ["selected_plan_sha256"],
        message: "selected_plan_sha256 is required for selected_plan scope",
      });
    }
  });

export type TaskEnvelope = z.infer<typeof TaskEnvelopeSchema>;

export const ReadinessRecordSchema = z
  .object({
    task_envelope_sha256: Sha256Schema,
    base_commit_oid: GitOidSchema,
    target_profile_digest: Sha256Schema,
    run_configuration_digest: Sha256Schema,
    authority_bundle: z.array(AuthorityBindingSchema).min(1),
    engineering_rules: ExternalAuthorityBindingSchema,
    routed_skill: AuthorityBindingSchema.nullable(),
    verified_gap: z.string().min(1),
    governing_rules: z.array(z.string().min(1)),
    required_evidence: z.array(z.string().min(1)),
    permitted_next_action: z.string().min(1),
    stop_condition: z.string().min(1),
    proposed_candidate_paths: z.array(CandidatePathSchema).min(1),
    unresolved_conflicts: z.array(z.string().min(1)),
  })
  .strict();

export type ReadinessRecord = z.infer<typeof ReadinessRecordSchema>;

export const TrustedInc0EnvironmentSchema = z
  .object({
    base_commit_oid: GitOidSchema,
    target_profile_digest: Sha256Schema,
    run_configuration_digest: Sha256Schema,
    routed_skills: z
      .object({
        SCOUT: AuthorityBindingSchema.nullable(),
        PLAN: AuthorityBindingSchema.nullable(),
        IMPLEMENT: AuthorityBindingSchema.nullable(),
        REPAIR: AuthorityBindingSchema.nullable(),
        REVIEW: AuthorityBindingSchema.nullable(),
        GOVERNANCE_CHANGE: AuthorityBindingSchema.nullable(),
      })
      .strict(),
  })
  .strict();

export type TrustedInc0Environment = z.infer<
  typeof TrustedInc0EnvironmentSchema
>;

export type Inc0BlockingCode =
  | "BLOCKED_TASK_ENVELOPE_INVALID"
  | "BLOCKED_READINESS_SCHEMA_INVALID"
  | "BLOCKED_ENVELOPE_DIGEST_MISMATCH"
  | "BLOCKED_BASE_COMMIT_MISMATCH"
  | "BLOCKED_TARGET_PROFILE_MISMATCH"
  | "BLOCKED_RUN_CONFIGURATION_MISMATCH"
  | "BLOCKED_ROUTING_MISMATCH"
  | "BLOCKED_UNRESOLVED_CONFLICTS"
  | "BLOCKED_SCOPE_EXCEEDS_ENVELOPE"
  | "BLOCKED_READ_AUDIT_INSUFFICIENT";

export type ReadinessDecision =
  | {
      code: "PRE_CODE_READY";
      state: "PRE_CODE_READY";
      authorized_tools: [];
      findings: [];
    }
  | {
      code: Inc0BlockingCode;
      state: "BLOCKED";
      authorized_tools: [];
      findings: string[];
    };

function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(canonicalize);
  }

  if (value !== null && typeof value === "object") {
    const result: Record<string, unknown> = {};
    for (const key of Object.keys(value).sort()) {
      const child = Reflect.get(value, key);
      if (child !== undefined) {
        result[key] = canonicalize(child);
      }
    }
    return result;
  }

  return value;
}

export function computeTaskEnvelopeDigest(envelope: TaskEnvelope): string {
  const parsed = TaskEnvelopeSchema.parse(envelope);
  const canonicalJson = JSON.stringify(canonicalize(parsed));
  return createHash("sha256").update(canonicalJson, "utf8").digest("hex");
}

const LooseAuthorityBindingSchema = z
  .object({
    path: z.string().min(1),
    git_blob_oid: GitOidSchema,
    content_sha256: Sha256Schema,
  })
  .passthrough();

const LooseExternalAuthorityBindingSchema = z
  .object({
    source_identifier: z.string().min(1),
    content_sha256: Sha256Schema,
  })
  .passthrough();

const MirrorReadAuditSchema = z
  .object({
    authority_bundle: z.array(LooseAuthorityBindingSchema),
    engineering_rules: LooseExternalAuthorityBindingSchema,
    routed_skill: LooseAuthorityBindingSchema.nullable().optional(),
  })
  .passthrough();

const EntriesReadAuditSchema = z
  .object({
    entries: z.array(z.unknown()),
  })
  .passthrough();

const ReadsReadAuditSchema = z
  .object({
    reads: z.array(z.unknown()),
  })
  .passthrough();

interface NormalizedReadAudit {
  authorityBundle: AuthorityBinding[];
  externalAuthorities: Array<{
    source_identifier: string;
    content_sha256: string;
  }>;
  routedSkill: AuthorityBinding | null | undefined;
}

function toAuthorityBinding(value: unknown): AuthorityBinding | null {
  const parsed = LooseAuthorityBindingSchema.safeParse(value);
  if (!parsed.success) {
    return null;
  }

  return {
    path: parsed.data.path,
    git_blob_oid: parsed.data.git_blob_oid,
    content_sha256: parsed.data.content_sha256,
  };
}

function toExternalAuthority(
  value: unknown,
): { source_identifier: string; content_sha256: string } | null {
  const parsed = LooseExternalAuthorityBindingSchema.safeParse(value);
  if (!parsed.success) {
    return null;
  }

  return {
    source_identifier: parsed.data.source_identifier,
    content_sha256: parsed.data.content_sha256,
  };
}

function normalizeReadAudit(raw: unknown): NormalizedReadAudit | null {
  const mirror = MirrorReadAuditSchema.safeParse(raw);
  if (mirror.success) {
    return {
      authorityBundle: mirror.data.authority_bundle.map((binding) => ({
        path: binding.path,
        git_blob_oid: binding.git_blob_oid,
        content_sha256: binding.content_sha256,
      })),
      externalAuthorities: [
        {
          source_identifier: mirror.data.engineering_rules.source_identifier,
          content_sha256: mirror.data.engineering_rules.content_sha256,
        },
      ],
      routedSkill:
        mirror.data.routed_skill == null
          ? mirror.data.routed_skill
          : {
              path: mirror.data.routed_skill.path,
              git_blob_oid: mirror.data.routed_skill.git_blob_oid,
              content_sha256: mirror.data.routed_skill.content_sha256,
            },
    };
  }

  let entries: unknown[] | null = null;
  if (Array.isArray(raw)) {
    entries = raw;
  } else {
    const entriesObject = EntriesReadAuditSchema.safeParse(raw);
    if (entriesObject.success) {
      entries = entriesObject.data.entries;
    } else {
      const readsObject = ReadsReadAuditSchema.safeParse(raw);
      if (readsObject.success) {
        entries = readsObject.data.reads;
      }
    }
  }

  if (entries == null) {
    return null;
  }

  const authorityBundle: AuthorityBinding[] = [];
  const externalAuthorities: Array<{
    source_identifier: string;
    content_sha256: string;
  }> = [];

  for (const entry of entries) {
    const authority = toAuthorityBinding(entry);
    if (authority !== null) {
      authorityBundle.push(authority);
      continue;
    }

    const external = toExternalAuthority(entry);
    if (external !== null) {
      externalAuthorities.push(external);
    }
  }

  return {
    authorityBundle,
    externalAuthorities,
    routedSkill: undefined,
  };
}

function sameAuthorityBinding(
  left: AuthorityBinding,
  right: AuthorityBinding,
): boolean {
  return (
    left.path === right.path &&
    left.git_blob_oid === right.git_blob_oid &&
    left.content_sha256 === right.content_sha256
  );
}

function readAuditSatisfiesRecord(
  record: ReadinessRecord,
  rawReadAuditTrail: unknown,
): boolean {
  const audit = normalizeReadAudit(rawReadAuditTrail);
  if (audit === null) {
    return false;
  }

  const hasEveryAuthority = record.authority_bundle.every((required) =>
    audit.authorityBundle.some((observed) =>
      sameAuthorityBinding(required, observed),
    ),
  );
  if (!hasEveryAuthority) {
    return false;
  }

  const hasEngineeringRules = audit.externalAuthorities.some(
    (observed) =>
      observed.source_identifier ===
        record.engineering_rules.source_identifier &&
      observed.content_sha256 === record.engineering_rules.content_sha256,
  );
  if (!hasEngineeringRules) {
    return false;
  }

  const routedSkill = record.routed_skill;
  if (routedSkill !== null) {
    const routedSkillMatched =
      audit.routedSkill != null &&
      sameAuthorityBinding(routedSkill, audit.routedSkill);
    const routedSkillWasRead = audit.authorityBundle.some((observed) =>
      sameAuthorityBinding(routedSkill, observed),
    );
    if (!routedSkillMatched && !routedSkillWasRead) {
      return false;
    }
  } else if (audit.routedSkill !== undefined && audit.routedSkill !== null) {
    return false;
  }

  return true;
}

const SCOUT_SKILL_PATH = ".claude/skills/scout-agent/SKILL.md";
const PLAN_SKILL_PATH = ".claude/skills/plan/SKILL.md";

function sameNullableAuthorityBinding(
  left: AuthorityBinding | null,
  right: AuthorityBinding | null,
): boolean {
  if (left === null || right === null) {
    return left === right;
  }
  return sameAuthorityBinding(left, right);
}

function expectedRoutedSkill(
  mode: RunMode,
  environment: TrustedInc0Environment,
): AuthorityBinding | null | undefined {
  const expected = environment.routed_skills[mode];

  if (
    mode === "SCOUT" &&
    (expected === null || expected.path !== SCOUT_SKILL_PATH)
  ) {
    return undefined;
  }

  if (
    mode === "PLAN" &&
    (expected === null || expected.path !== PLAN_SKILL_PATH)
  ) {
    return undefined;
  }

  return expected;
}

function blockedInc0(
  code: Inc0BlockingCode,
  finding: string,
): ReadinessDecision {
  return {
    code,
    state: "BLOCKED",
    authorized_tools: [],
    findings: [finding],
  };
}

export function evaluateInc0Readiness(
  rawEnvelope: unknown,
  rawRecord: unknown,
  readAuditTrail: unknown,
  rawEnvironment: unknown,
): ReadinessDecision {
  const envelopeResult = TaskEnvelopeSchema.safeParse(rawEnvelope);
  if (!envelopeResult.success) {
    return blockedInc0(
      "BLOCKED_TASK_ENVELOPE_INVALID",
      "TaskEnvelope failed strict schema validation.",
    );
  }

  const recordResult = ReadinessRecordSchema.safeParse(rawRecord);
  if (!recordResult.success) {
    return blockedInc0(
      "BLOCKED_READINESS_SCHEMA_INVALID",
      "ReadinessRecord failed strict schema validation.",
    );
  }

  const environmentResult = TrustedInc0EnvironmentSchema.safeParse(
    rawEnvironment,
  );
  if (!environmentResult.success) {
    return blockedInc0(
      "BLOCKED_TARGET_PROFILE_MISMATCH",
      "Trusted INC-0 environment failed strict schema validation.",
    );
  }

  const envelope = envelopeResult.data;
  const record = recordResult.data;
  const environment = environmentResult.data;

  if (
    record.task_envelope_sha256 !== computeTaskEnvelopeDigest(envelope)
  ) {
    return blockedInc0(
      "BLOCKED_ENVELOPE_DIGEST_MISMATCH",
      "ReadinessRecord is not bound to the trusted TaskEnvelope bytes.",
    );
  }

  if (record.base_commit_oid !== environment.base_commit_oid) {
    return blockedInc0(
      "BLOCKED_BASE_COMMIT_MISMATCH",
      "ReadinessRecord base commit does not match the trusted environment.",
    );
  }

  if (record.target_profile_digest !== environment.target_profile_digest) {
    return blockedInc0(
      "BLOCKED_TARGET_PROFILE_MISMATCH",
      "ReadinessRecord target-profile digest does not match the trusted environment.",
    );
  }

  if (
    record.run_configuration_digest !==
    environment.run_configuration_digest
  ) {
    return blockedInc0(
      "BLOCKED_RUN_CONFIGURATION_MISMATCH",
      "ReadinessRecord run-configuration digest does not match the trusted environment.",
    );
  }

  if (record.unresolved_conflicts.length > 0) {
    return blockedInc0(
      "BLOCKED_UNRESOLVED_CONFLICTS",
      "ReadinessRecord contains unresolved conflicts.",
    );
  }

  const authorizedPaths = new Set(envelope.authorized_candidate_paths);
  if (
    !record.proposed_candidate_paths.every((path) =>
      authorizedPaths.has(path),
    )
  ) {
    return blockedInc0(
      "BLOCKED_SCOPE_EXCEEDS_ENVELOPE",
      "Proposed candidate paths exceed TaskEnvelope authority.",
    );
  }

  const routedSkill = expectedRoutedSkill(envelope.mode, environment);
  if (
    routedSkill === undefined ||
    !sameNullableAuthorityBinding(record.routed_skill, routedSkill)
  ) {
    return blockedInc0(
      "BLOCKED_ROUTING_MISMATCH",
      "ReadinessRecord routed skill does not match trusted mode routing.",
    );
  }

  if (!readAuditSatisfiesRecord(record, readAuditTrail)) {
    return blockedInc0(
      "BLOCKED_READ_AUDIT_INSUFFICIENT",
      "Trusted read audit does not prove every required authority read.",
    );
  }

  return {
    code: "PRE_CODE_READY",
    state: "PRE_CODE_READY",
    authorized_tools: [],
    findings: [],
  };
}

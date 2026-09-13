import { describe, expect, it } from "vitest";

import * as inc0 from "../../agent-harness/src/inc0";
import {
  CANONICAL_ENGINEERING_RULES_SHA256,
  CANONICAL_ENGINEERING_RULES_SOURCE,
  computeTaskEnvelopeDigest,
  evaluateInc0Readiness,
  type AuthorityBinding,
  type ReadinessRecord,
  type TaskEnvelope,
  type TrustedInc0Environment,
} from "../../agent-harness/src/inc0";

const SHA_A = "a".repeat(64);
const SHA_B = "b".repeat(64);
const SHA_C = "c".repeat(64);
const SHA_D = "d".repeat(64);
const OID_A = "1".repeat(40);
const OID_B = "2".repeat(40);
const OID_C = "3".repeat(40);

const ROOT_AGENTS: AuthorityBinding = {
  path: "AGENTS.md",
  git_blob_oid: OID_A,
  content_sha256: SHA_A,
};

const SCOUT_SKILL: AuthorityBinding = {
  path: ".claude/skills/scout-agent/SKILL.md",
  git_blob_oid: OID_B,
  content_sha256: SHA_B,
};

const PLAN_SKILL: AuthorityBinding = {
  path: ".claude/skills/plan/SKILL.md",
  git_blob_oid: OID_C,
  content_sha256: SHA_C,
};

function validEnvelope(): TaskEnvelope {
  return {
    task_id: "inc0-test",
    mode: "IMPLEMENT",
    user_request_digest_sha256: SHA_A,
    target_repository: "Lvvphole/becoming-the-man",
    requested_ref: "main",
    scope_source: "selected_plan",
    authorized_effects: ["repair INC-0 readiness contract"],
    authorized_candidate_paths: [
      "agent-harness/src/inc0.ts",
      "tests/agent-harness/inc0.test.ts",
      "tasks/todo.md",
    ],
    governance_change_authorized: false,
    destructive_actions_authorized: false,
    required_verification_command_ids: ["verify_code"],
    selected_plan_sha256: SHA_B,
  };
}

function validEnvironment(): TrustedInc0Environment {
  return {
    base_commit_oid: OID_A,
    target_profile_digest: SHA_C,
    run_configuration_digest: SHA_D,
    routed_skills: {
      SCOUT: SCOUT_SKILL,
      PLAN: PLAN_SKILL,
      IMPLEMENT: null,
      REPAIR: null,
      REVIEW: null,
      GOVERNANCE_CHANGE: null,
    },
  };
}

function validRecord(
  envelope: TaskEnvelope,
  routedSkill: AuthorityBinding | null = null,
): ReadinessRecord {
  return {
    task_envelope_sha256: computeTaskEnvelopeDigest(envelope),
    base_commit_oid: OID_A,
    target_profile_digest: SHA_C,
    run_configuration_digest: SHA_D,
    authority_bundle: [ROOT_AGENTS],
    engineering_rules: {
      source_identifier: CANONICAL_ENGINEERING_RULES_SOURCE,
      content_sha256: CANONICAL_ENGINEERING_RULES_SHA256,
    },
    routed_skill: routedSkill,
    verified_gap: "INC-0 readiness contract repair",
    governing_rules: ["D4", "D7", "OBL-INC0-2"],
    required_evidence: ["targeted vitest pass"],
    permitted_next_action: "AUTHORING",
    stop_condition: "BLOCKED",
    proposed_candidate_paths: [
      "agent-harness/src/inc0.ts",
      "tests/agent-harness/inc0.test.ts",
    ],
    unresolved_conflicts: [],
  };
}

function validReadAudit(routedSkill: AuthorityBinding | null = null) {
  return {
    authority_bundle: [ROOT_AGENTS],
    engineering_rules: {
      source_identifier: CANONICAL_ENGINEERING_RULES_SOURCE,
      content_sha256: CANONICAL_ENGINEERING_RULES_SHA256,
    },
    routed_skill: routedSkill,
  };
}

function decide(
  envelope = validEnvelope(),
  record = validRecord(envelope),
  audit = validReadAudit(),
  environment = validEnvironment(),
) {
  return evaluateInc0Readiness(envelope, record, audit, environment);
}

describe("INC-0 readiness gate", () => {
  it("exports one readiness evaluator only", () => {
    expect(typeof evaluateInc0Readiness).toBe("function");
    expect("evaluateReadiness" in inc0).toBe(false);
  });

  it("returns PRE_CODE_READY with no authoring tools for exact trusted bindings", () => {
    expect(decide()).toEqual({
      code: "PRE_CODE_READY",
      state: "PRE_CODE_READY",
      authorized_tools: [],
      findings: [],
    });
  });

  it("blocks an invalid task envelope", () => {
    const envelope = { ...validEnvelope(), target_repository: "wrong/repo" };
    expect(
      evaluateInc0Readiness(
        envelope,
        validRecord(validEnvelope()),
        validReadAudit(),
        validEnvironment(),
      ).code,
    ).toBe("BLOCKED_TASK_ENVELOPE_INVALID");
  });

  it("blocks a readiness record that omits the required configuration digests", () => {
    const envelope = validEnvelope();
    const record = validRecord(envelope);
    const { target_profile_digest: _target, run_configuration_digest: _run, ...invalid } =
      record;

    expect(
      evaluateInc0Readiness(
        envelope,
        invalid,
        validReadAudit(),
        validEnvironment(),
      ).code,
    ).toBe("BLOCKED_READINESS_SCHEMA_INVALID");
  });

  it("blocks an envelope digest mismatch", () => {
    const envelope = validEnvelope();
    const record = { ...validRecord(envelope), task_envelope_sha256: SHA_D };
    expect(decide(envelope, record).code).toBe(
      "BLOCKED_ENVELOPE_DIGEST_MISMATCH",
    );
  });

  it("blocks base commit drift", () => {
    const environment = { ...validEnvironment(), base_commit_oid: OID_B };
    expect(decide(undefined, undefined, undefined, environment).code).toBe(
      "BLOCKED_BASE_COMMIT_MISMATCH",
    );
  });

  it("blocks target-profile digest drift", () => {
    const environment = {
      ...validEnvironment(),
      target_profile_digest: SHA_A,
    };
    expect(decide(undefined, undefined, undefined, environment).code).toBe(
      "BLOCKED_TARGET_PROFILE_MISMATCH",
    );
  });

  it("blocks run-configuration digest drift", () => {
    const environment = {
      ...validEnvironment(),
      run_configuration_digest: SHA_A,
    };
    expect(decide(undefined, undefined, undefined, environment).code).toBe(
      "BLOCKED_RUN_CONFIGURATION_MISMATCH",
    );
  });

  it("blocks unresolved conflicts", () => {
    const envelope = validEnvelope();
    const record = {
      ...validRecord(envelope),
      unresolved_conflicts: ["authority drift"],
    };
    expect(decide(envelope, record).code).toBe(
      "BLOCKED_UNRESOLVED_CONFLICTS",
    );
  });

  it("blocks candidate scope outside the TaskEnvelope", () => {
    const envelope = validEnvelope();
    const record = {
      ...validRecord(envelope),
      proposed_candidate_paths: ["src/root.tsx"],
    };
    expect(decide(envelope, record).code).toBe(
      "BLOCKED_SCOPE_EXCEEDS_ENVELOPE",
    );
  });

  it("blocks an insufficient trusted read audit", () => {
    const envelope = validEnvelope();
    const record = validRecord(envelope);
    const audit = {
      ...validReadAudit(),
      authority_bundle: [],
    };
    expect(decide(envelope, record, audit).code).toBe(
      "BLOCKED_READ_AUDIT_INSUFFICIENT",
    );
  });

  it("requires the exact scout skill identity for SCOUT", () => {
    const envelope = { ...validEnvelope(), mode: "SCOUT" as const };
    const record = validRecord(envelope, SCOUT_SKILL);
    expect(
      decide(envelope, record, validReadAudit(SCOUT_SKILL)).code,
    ).toBe("PRE_CODE_READY");

    const missingSkill = validRecord(envelope, null);
    expect(
      decide(envelope, missingSkill, validReadAudit(null)).code,
    ).toBe("BLOCKED_ROUTING_MISMATCH");
  });

  it("rejects the wrong routed skill identity for SCOUT", () => {
    const envelope = { ...validEnvelope(), mode: "SCOUT" as const };
    const wrongSkill = { ...SCOUT_SKILL, content_sha256: SHA_D };
    const record = validRecord(envelope, wrongSkill);
    expect(
      decide(envelope, record, validReadAudit(wrongSkill)).code,
    ).toBe("BLOCKED_ROUTING_MISMATCH");
  });

  it("requires the exact plan skill identity for PLAN", () => {
    const envelope = { ...validEnvelope(), mode: "PLAN" as const };
    const record = validRecord(envelope, PLAN_SKILL);
    expect(
      decide(envelope, record, validReadAudit(PLAN_SKILL)).code,
    ).toBe("PRE_CODE_READY");

    const wrongSkill = validRecord(envelope, SCOUT_SKILL);
    expect(
      decide(envelope, wrongSkill, validReadAudit(SCOUT_SKILL)).code,
    ).toBe("BLOCKED_ROUTING_MISMATCH");
  });

  it("requires null routed_skill for IMPLEMENT when no skill is authorized", () => {
    const envelope = validEnvelope();
    const record = validRecord(envelope, SCOUT_SKILL);
    expect(
      decide(envelope, record, validReadAudit(SCOUT_SKILL)).code,
    ).toBe("BLOCKED_ROUTING_MISMATCH");
  });

  it("accepts an explicitly authorized IMPLEMENT skill identity", () => {
    const envelope = validEnvelope();
    const environment = validEnvironment();
    environment.routed_skills.IMPLEMENT = SCOUT_SKILL;
    const record = validRecord(envelope, SCOUT_SKILL);

    expect(
      decide(envelope, record, validReadAudit(SCOUT_SKILL), environment).code,
    ).toBe("PRE_CODE_READY");
  });
});

#!/usr/bin/env python3
from __future__ import annotations

import copy
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent
POLICY_FILE = ROOT / "eve-v3.2-normative-policy.json"
MUTATION_FILE = ROOT / "eve-v3.2-mutation-manifest.json"
RESULT_FILE = ROOT / "eve-v3.2-backtest-results.reproduced.json"

EXPECTED_POLICY_SHA256 = "4511124cd8b4de4196675a95917c5ad73c295ff48086b7147f85327d174a3bce"
EXPECTED_MUTATION_SHA256 = "e4b4876b1b8759aabac0cc33189ac935e32fb00918d4803e1357b6784834a3cd"
EXPECTED_RESULTS_SHA256 = "a9100bcff3fad446bfc4bc5af62592ec10afeff2039ff325d7ce265ca6b84796"
EXPECTED_AGGREGATE_SHA256 = "e5467d248125f8313321f580d977865f96d274bb5db73ad60bfba76338645374"


def canonical_bytes(value: object) -> bytes:
    return json.dumps(
        value,
        sort_keys=True,
        separators=(",", ":"),
        ensure_ascii=False,
    ).encode("utf-8")


def sha256_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def get_path(value: dict, path: tuple[str, ...]):
    current = value
    for part in path:
        current = current[part]
    return current


def set_path(value: dict, path: tuple[str, ...], replacement) -> None:
    current = value
    for part in path[:-1]:
        current = current[part]
    current[path[-1]] = replacement


def validate(policy: dict) -> list[str]:
    findings: list[str] = []

    def req(path: tuple[str, ...], expected, code: str) -> None:
        try:
            actual = get_path(policy, path)
        except Exception:
            findings.append(code + ":missing")
            return
        if actual != expected:
            findings.append(code)

    exact = [
        (("identity","base_commit_oid_required"), True, "IDENTITY_BASE"),
        (("identity","git_blob_oid_separate_from_content_sha256"), True, "IDENTITY_SEPARATION"),
        (("identity","authority_binding_shape"), "object:path+git_blob_oid+content_sha256", "IDENTITY_SHAPE"),
        (("identity","parallel_authority_arrays_forbidden"), True, "IDENTITY_PARALLEL_ARRAYS"),
        (("bootstrap","repository_name"), "Agent-Harness", "BOOTSTRAP_NAME"),
        (("bootstrap","repository_name_user_approved"), True, "BOOTSTRAP_NAME_APPROVAL"),
        (("bootstrap","implementation_agent_may_create_unbootstrapped_repo"), False, "BOOTSTRAP_AGENT_CREATE"),
        (("bootstrap","repo_must_preexist_with_root_agents_before_agent_write"), True, "BOOTSTRAP_PREEXIST"),
        (("bootstrap","first_commit_exact_paths"), ["AGENTS.md"], "BOOTSTRAP_FIRST_COMMIT"),
        (("task_envelope","authorized_effects_semantic_only"), True, "SCOPE_EFFECTS_SEMANTIC"),
        (("task_envelope","authorized_candidate_paths_exact"), True, "SCOPE_EXACT_PATHS"),
        (("task_envelope","wildcards_in_authorized_candidate_paths"), False, "SCOPE_WILDCARDS"),
        (("task_envelope","selected_plan_sha256_required_for_selected_plan_scope"), True, "SCOPE_PLAN_BINDING"),
        (("task_envelope","required_verification_command_ids_trusted"), True, "VERIFY_TASK_IDS"),
        (("authority","root_agents_first"), True, "AUTH_AGENTS_FIRST"),
        (("authority","engineering_rules_before_mutation"), True, "AUTH_RULES_FIRST"),
        (("authority","skills_subordinate_to_agents"), True, "AUTH_SKILL_SUBORDINATE"),
        (("authority","target_skills_copied_into_eve"), False, "AUTH_SKILL_COPY"),
        (("authority","unrouted_repo_text_is_data"), True, "AUTH_UNROUTED_DATA"),
        (("authority","task_cannot_silently_override_governance"), True, "AUTH_OVERRIDE"),
        (("authority","actual_read_audit_required"), True, "AUTH_READ_AUDIT"),
        (("readiness","schema_language"), "typescript", "READY_LANGUAGE"),
        (("readiness","schema_validator"), "zod_strict", "READY_VALIDATOR"),
        (("readiness","authority_bundle_shape"), "array_of_identity_objects", "READY_AUTH_SHAPE"),
        (("readiness","routed_skill_shape"), "nullable_identity_object", "READY_SKILL_SHAPE"),
        (("readiness","proposed_paths_subset_of_authorized_candidate_paths"), True, "READY_SCOPE_SUBSET"),
        (("readiness","protected_path_exceptions_from_task_envelope_only"), True, "READY_PROTECTED_EXCEPTION"),
        (("readiness","unresolved_conflicts_must_equal"), [], "READY_CONFLICTS"),
        (("readiness","trusted_gate_controls_transition"), True, "READY_TRUSTED_GATE"),
        (("state","direct_agent_assignment"), False, "STATE_DIRECT_ASSIGN"),
        (("state","authoring_requires_pre_code_ready"), True, "STATE_PRECODE"),
        (("state","scope_expansion_returns_to_readiness"), True, "STATE_SCOPE_REBIND"),
        (("tools","default_tools"), False, "TOOLS_DEFAULTS"),
        (("tools","connections_declared"), 0, "TOOLS_CONNECTIONS"),
        (("tools","web_search"), False, "TOOLS_WEB_SEARCH"),
        (("tools","web_fetch"), False, "TOOLS_WEB_FETCH"),
        (("tools","agent_tool"), False, "TOOLS_AGENT"),
        (("tools","workflow_tool"), False, "TOOLS_WORKFLOW"),
        (("tools","github_write_model_visible"), False, "TOOLS_GITHUB"),
        (("tools","merge_tool"), False, "TOOLS_MERGE"),
        (("tools","mutation_executor_rechecks_state_every_call"), True, "TOOLS_STALE_HANDLE"),
        (("scope_expansion","inside_authorized_paths"), "REVOKE_TO_READINESS_REBIND", "SCOPE_EXPAND_INSIDE"),
        (("scope_expansion","outside_authorized_paths"), "BLOCKED_NEW_TASK_AUTHORIZATION", "SCOPE_EXPAND_OUTSIDE"),
        (("scope_expansion","silent_scope_growth"), False, "SCOPE_EXPAND_SILENT"),
        (("sandbox","network"), "deny-all", "SANDBOX_NETWORK"),
        (("sandbox","workspace_contains_git_metadata"), False, "SANDBOX_GIT"),
        (("sandbox","docker_socket_mounted"), False, "SANDBOX_SOCKET"),
        (("sandbox","host_repo_rw_mounted"), False, "SANDBOX_HOST_RW"),
        (("sandbox","secrets_present"), False, "SANDBOX_SECRETS"),
        (("sandbox","claims_os_write_confinement_to_workspace"), False, "SANDBOX_FALSE_CONFINEMENT"),
        (("candidate_exporter","trusted_base_manifest_outside_sandbox"), True, "EXPORT_BASE"),
        (("candidate_exporter","uses_sandbox_git_metadata"), False, "EXPORT_GIT"),
        (("candidate_exporter","snapshot_read_only_to_exporter"), True, "EXPORT_SNAPSHOT"),
        (("candidate_exporter","symlinks_allowed"), False, "EXPORT_SYMLINK"),
        (("candidate_exporter","hardlinks_allowed"), False, "EXPORT_HARDLINK"),
        (("candidate_exporter","supported_modes"), ["100644","100755"], "EXPORT_MODES"),
        (("candidate_exporter","canonical_repo_relative_paths"), True, "EXPORT_PATH_CANON"),
        (("candidate_exporter","dotdot_paths_rejected"), True, "EXPORT_DOTDOT"),
        (("candidate_exporter","absolute_paths_rejected"), True, "EXPORT_ABSOLUTE"),
        (("candidate_exporter","reserved_git_metadata_rejected"), True, "EXPORT_RESERVED"),
        (("candidate_exporter","case_collision_rejected"), True, "EXPORT_CASE"),
        (("candidate_exporter","actual_changed_paths_subset_proposed"), True, "EXPORT_PROPOSED"),
        (("candidate_exporter","actual_changed_paths_subset_authorized"), True, "EXPORT_AUTHORIZED"),
        (("candidate_exporter","protected_paths_require_task_envelope_exception"), True, "EXPORT_PROTECTED"),
        (("target_profile","mechanical_bindings_only"), True, "PROFILE_MECHANICAL"),
        (("target_profile","normative_product_rules_forbidden"), True, "PROFILE_NORMATIVE"),
        (("target_profile","drift_fail_closed"), True, "PROFILE_DRIFT"),
        (("verification_selection","candidate_selects_commands"), False, "VERIFY_CANDIDATE_COMMANDS"),
        (("verification_selection","trusted_command_catalog"), True, "VERIFY_CATALOG"),
        (("verification_selection","baseline_command_ids"), ["install_locked","verify_change_size","verify_code"], "VERIFY_BASELINE"),
        (("verification_selection","verify_code_exact_command"), "npm run verify", "VERIFY_COMMAND"),
        (("verification_selection","additional_checks_union_from_profile_and_task_envelope"), True, "VERIFY_UNION"),
        (("verification_selection","routed_required_check_without_command_id"), "BLOCKED_PROFILE_INCOMPLETE", "VERIFY_MISSING"),
        (("verification_selection","candidate_cannot_omit_checks"), True, "VERIFY_OMISSION"),
        (("verification_selection","local_verifier_named_pr_verification"), False, "VERIFY_NAME_COLLISION"),
        (("verification_selection","github_pr_verification_downstream_authority"), True, "VERIFY_DOWNSTREAM"),
        (("oracle","verifier_owned"), True, "ORACLE_OWNER"),
        (("oracle","model_visible"), False, "ORACLE_VISIBLE"),
        (("oracle","candidate_writable"), False, "ORACLE_WRITABLE"),
        (("oracle","candidate_tests_are_independent_oracle"), False, "ORACLE_CANDIDATE_TESTS"),
        (("oracle","manifest_digest_required"), True, "ORACLE_DIGEST"),
        (("oracle","universal_ast_bans"), False, "ORACLE_AST"),
        (("oracle","universal_symbol_whitelist"), False, "ORACLE_SYMBOLS"),
        (("oracle","universal_complexity_declarations"), False, "ORACLE_COMPLEXITY"),
        (("oracle","task_specific_predicates_only_when_authorized"), True, "ORACLE_TASK_PRED"),
        (("verifier","outside_candidate_workspace"), True, "VERIFIER_OUTSIDE"),
        (("verifier","shared_writable_volume"), False, "VERIFIER_SHARED"),
        (("verifier","candidate_controls_profile"), False, "VERIFIER_PROFILE"),
        (("verifier","candidate_controls_command"), False, "VERIFIER_COMMAND"),
        (("verifier","self_reported_pass_authoritative"), False, "VERIFIER_SELF_PASS"),
        (("verifier","binds_base_and_candidate"), True, "VERIFIER_BINDING"),
        (("verifier","raw_evidence_required"), True, "VERIFIER_EVIDENCE"),
        (("resume","guard_every_resume"), True, "RESUME_GUARD"),
        (("resume","governance_drift"), "RETURN_TO_AUTHORITY_READ_ONLY", "RESUME_GOV"),
        (("resume","candidate_drift"), "BLOCKED", "RESUME_CANDIDATE"),
        (("resume","tool_verifier_model_eve_drift"), "BLOCKED_NEW_RUN_REQUIRED", "RESUME_CONFIG"),
        (("repair","max_repairs"), 2, "REPAIR_BUDGET"),
        (("repair","new_machine_evidence_required"), True, "REPAIR_EVIDENCE"),
        (("repair","same_failure_without_new_evidence"), "BLOCKED", "REPAIR_REPEAT"),
        (("publication","requires_verifier_pass"), True, "PUBLISH_PASS"),
        (("publication","requires_human_approval"), True, "PUBLISH_APPROVAL"),
        (("publication","approval_binding"), ["run_id","base_commit_oid","candidate_digest","operation"], "PUBLISH_BINDING"),
        (("publication","capabilities"), ["feature_branch","pull_request"], "PUBLISH_CAPABILITIES"),
        (("publication","merge"), False, "PUBLISH_MERGE"),
        (("publication","post_publish_content_equality"), True, "PUBLISH_EQUALITY"),
        (("publication","current_main_must_equal_verified_base"), True, "PUBLISH_MAIN"),
        (("minimality","targets"), 1, "MIN_TARGETS"),
        (("minimality","agents"), 1, "MIN_AGENTS"),
        (("minimality","docker_runtime_not_npm_dependency"), True, "MIN_DOCKER"),
        (("minimality","github_rest_transport"), "node_builtin_fetch_first", "MIN_GITHUB"),
        (("minimality","external_database"), False, "MIN_DB"),
        (("minimality","redis"), False, "MIN_REDIS"),
        (("minimality","queue"), False, "MIN_QUEUE"),
        (("minimality","vector_store"), False, "MIN_VECTOR"),
        (("minimality","mem0"), False, "MIN_MEM0"),
        (("minimality","custom_image_pipeline"), False, "MIN_IMAGE"),
        (("minimality","web_ui"), False, "MIN_UI"),
        (("minimality","github_app"), False, "MIN_GHAPP"),
        (("minimality","mcp"), False, "MIN_MCP"),
        (("minimality","scheduler"), False, "MIN_SCHED"),
        (("minimality","telemetry_backend"), False, "MIN_TELEM"),
        (("minimality","multi_repo_plugin_system"), False, "MIN_PLUGIN"),
        (("minimality","harness_eve_skills"), 0, "MIN_SKILLS"),
        (("minimality","new_component_requires_verified_dod_gap"), True, "MIN_GAP"),
        (("acceptance","plan_policy_backtest_not_implementation_pass"), True, "ACCEPT_PLAN_NOT_IMPL"),
        (("acceptance","runtime_mutants_required_per_increment"), True, "ACCEPT_RUNTIME_MUTANTS"),
        (("acceptance","green_build_not_acceptance"), True, "ACCEPT_GREEN"),
        (("acceptance","target_pr_verification_required"), True, "ACCEPT_CI"),
        (("acceptance","codex_required"), True, "ACCEPT_CODEX"),
        (("acceptance","human_merge_required"), True, "ACCEPT_MERGE"),
    ]
    for path, expected, code in exact:
        req(path, expected, code)

    if get_path(policy, ("task_envelope","scope_sources")) != ["selected_plan","direct_user_authorization"]:
        findings.append("SCOPE_SOURCE_ENUM")

    pre = get_path(policy, ("tools","pre_readiness"))
    if "write_file" in pre or "bash" in pre:
        findings.append("TOOLS_PRE_MUTATION")

    required_resume = {
        "current_target_main","authority_bundle","routed_skill","task_envelope","target_profile",
        "tool_policy","verifier_profile","eve_version","model_config","candidate_if_frozen"
    }
    if set(get_path(policy, ("resume","revalidates"))) != required_resume:
        findings.append("RESUME_SET")

    return findings


def main() -> None:
    policy_bytes = POLICY_FILE.read_bytes()
    mutation_bytes = MUTATION_FILE.read_bytes()

    policy = json.loads(policy_bytes)
    mutations = json.loads(mutation_bytes)

    assert sha256_bytes(policy_bytes) == EXPECTED_POLICY_SHA256
    assert sha256_bytes(mutation_bytes) == EXPECTED_MUTATION_SHA256
    assert canonical_bytes(policy) == policy_bytes
    assert canonical_bytes(mutations) == mutation_bytes
    assert validate(policy) == []

    results = []
    for mutation in mutations:
        mutant = copy.deepcopy(policy)
        set_path(mutant, tuple(mutation["path"].split(".")), mutation["bad_value"])
        findings = validate(mutant)
        results.append({
            "category": mutation["category"],
            "name": mutation["name"],
            "path": mutation["path"],
            "killed": len(findings) > 0,
            "findings": findings,
        })

    result_bytes = canonical_bytes(results)
    RESULT_FILE.write_bytes(result_bytes)

    result_sha = sha256_bytes(result_bytes)
    aggregate_bytes = (
        EXPECTED_POLICY_SHA256
        + EXPECTED_MUTATION_SHA256
        + result_sha
    ).encode("ascii")
    aggregate_sha = sha256_bytes(aggregate_bytes)

    survivors = [item for item in results if not item["killed"]]

    assert result_sha == EXPECTED_RESULTS_SHA256
    assert aggregate_sha == EXPECTED_AGGREGATE_SHA256
    assert not survivors

    print(f"policy_sha256={EXPECTED_POLICY_SHA256}")
    print(f"mutation_manifest_sha256={EXPECTED_MUTATION_SHA256}")
    print(f"results_sha256={result_sha}")
    print(f"aggregate_evidence_sha256={aggregate_sha}")
    print(f"mutants={len(results)} killed={len(results)} survivors={len(survivors)}")


if __name__ == "__main__":
    main()

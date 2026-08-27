#!/usr/bin/env bash
set -u
source_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
failures=0
report="$source_root/verification-reports/verification-layer-tests.md"
mkdir -p "$(dirname "$report")"
printf "# Verification-layer regression report\n\n" > "$report"
pass(){ echo "PASS $1"; printf -- "- %s: PASS\n" "$1" >> "$report"; }
fail(){ echo "FAIL $1" >&2; printf -- "- %s: FAIL\n" "$1" >> "$report"; failures=$((failures+1)); }

new_repo(){
  local dir="$1"
  mkdir -p "$dir"/{scripts,verification,.github/workflows,.githooks,src,api,server,contracts,supabase,config,tests,docs/evidence}
  cp "$source_root/scripts/verify-production.sh" "$dir/scripts/verify-production.sh"
  cp "$source_root/scripts/scan-secrets.sh" "$dir/scripts/scan-secrets.sh"
  cp "$source_root/scripts/verify-required-files.sh" "$dir/scripts/verify-required-files.sh"
  cp "$source_root/scripts/verify-pr-identity.sh" "$dir/scripts/verify-pr-identity.sh"
  cp "$source_root/scripts/select-verification-tests.sh" "$dir/scripts/select-verification-tests.sh"
  cat > "$dir/scripts/verification-layer.test.sh" <<'STUB'
#!/usr/bin/env bash
exit 0
STUB
  cat > "$dir/scripts/verification-selection.test.sh" <<'STUB'
#!/usr/bin/env bash
exit 0
STUB
  cat > "$dir/scripts/verification-contract-policy.test.sh" <<'STUB'
#!/usr/bin/env bash
exit 0
STUB
  chmod +x "$dir"/scripts/*.sh
  printf '# fixture\n' > "$dir/AGENTS.md"
  printf '# fixture\n' > "$dir/README.md"
  printf 'verification-reports/\n' > "$dir/.gitignore"
  printf 'name: fixture\n' > "$dir/.github/workflows/production-verification.yml"
  printf 'fixture\n' > "$dir/tests/fixture.txt"
  cat > "$dir/verification/contract.tsv" <<'CONTRACT'
required_repository_files	ACTIVE	fixture	builtin:required_files	ok
git_secret_verification	ACTIVE	fixture	builtin:secret	ok
verification_control_tests	ACTIVE	fixture	builtin:selftest	ok
git_diff_check	ACTIVE	fixture	builtin:git_diff_check	ok
pr_merge_identity	CONDITIONAL	fixture	builtin:pr_merge_identity	ok
CONTRACT
  git -C "$dir" init -q -b main
  git -C "$dir" config user.email verification@example.invalid
  git -C "$dir" config user.name 'Verification Fixture'
  git -C "$dir" add .
  git -C "$dir" commit -qm 'fixture base'
}
run_verify(){ local dir="$1" log="$2"; (cd "$dir" && env -u VERIFY_PR_MERGE_CANDIDATE -u EXPECTED_BASE_SHA -u EXPECTED_HEAD_SHA -u VERIFY_TRUSTED_BASE_SHA -u EXPECTED_CANDIDATE_SHA bash scripts/verify-production.sh) >"$log" 2>&1; }
work="$(mktemp -d)"; trap 'rm -rf "$work"' EXIT

r="$work/clean"; new_repo "$r"
if run_verify "$r" "$work/clean.log"; then pass clean_fixture; else fail clean_fixture; fi

r="$work/dirty-tracked"; new_repo "$r"; echo dirty >> "$r/tests/fixture.txt"
run_verify "$r" "$work/dirty-tracked.log"; rc=$?
if [[ "$rc" -eq 1 ]] && grep -q 'working tree is not clean' "$work/dirty-tracked.log" && ! grep -q '==> Required repository files' "$work/dirty-tracked.log"; then pass dirty_tracked_rejects; else fail dirty_tracked_rejects; fi

r="$work/dirty-untracked"; new_repo "$r"; echo dirty > "$r/untracked.txt"
run_verify "$r" "$work/dirty-untracked.log"; rc=$?
if [[ "$rc" -eq 1 ]] && grep -q 'working tree is not clean' "$work/dirty-untracked.log" && ! grep -q '==> Required repository files' "$work/dirty-untracked.log"; then pass dirty_untracked_rejects; else fail dirty_untracked_rejects; fi

r="$work/required-files"; new_repo "$r"; git -C "$r" rm -q README.md; git -C "$r" commit -qm 'remove required file'
run_verify "$r" "$work/required-files.log"; rc=$?
if [[ "$rc" -eq 1 ]] && grep -q '| Required repository files | FAIL |' "$work/required-files.log"; then pass required_files_can_fail; else fail required_files_can_fail; fi

# A normal failed gate does not prevent later gates.
r="$work/aggregate"; new_repo "$r"; secret="sk-proj-$(printf 'A%.0s' {1..40})"; echo "$secret" > "$r/leak.txt"; git -C "$r" add leak.txt; git -C "$r" commit -qm 'add secret'
run_verify "$r" "$work/aggregate.log"; rc=$?
if [[ "$rc" -eq 1 ]] && grep -q '| Git / secret verification | FAIL |' "$work/aggregate.log" && grep -q '| Verification layer | PASS |' "$work/aggregate.log" && grep -q '| Git diff check | PASS |' "$work/aggregate.log"; then pass failure_aggregation; else fail failure_aggregation; fi
if grep -Fq "$secret" "$work/aggregate.log"; then fail secret_logs_redact_value; else pass secret_logs_redact_value; fi

# Verification-layer gate can fail independently.
r="$work/selftest-fail"; new_repo "$r"; cat > "$r/scripts/verification-layer.test.sh" <<'STUB'
#!/usr/bin/env bash
exit 1
STUB
chmod +x "$r/scripts/verification-layer.test.sh"; git -C "$r" add scripts/verification-layer.test.sh; git -C "$r" commit -qm 'break verification test'
run_verify "$r" "$work/selftest-fail.log"; rc=$?
if [[ "$rc" -eq 1 ]] && grep -q '| Verification layer | FAIL |' "$work/selftest-fail.log"; then pass verification_layer_can_fail; else fail verification_layer_can_fail; fi

# HEAD mutation is detected after all normal gates.
r="$work/head-change"; new_repo "$r"; cat > "$r/scripts/verification-layer.test.sh" <<'STUB'
#!/usr/bin/env bash
git commit --allow-empty -qm mutated
exit 0
STUB
chmod +x "$r/scripts/verification-layer.test.sh"; git -C "$r" add scripts/verification-layer.test.sh; git -C "$r" commit -qm 'head mutation fixture'
run_verify "$r" "$work/head-change.log"; rc=$?
if [[ "$rc" -eq 1 ]] && grep -q '| Candidate HEAD unchanged | FAIL |' "$work/head-change.log"; then pass changed_head_fails; else fail changed_head_fails; fi

# Post-run dirt is detected.
r="$work/post-dirty"; new_repo "$r"; cat > "$r/scripts/verification-layer.test.sh" <<'STUB'
#!/usr/bin/env bash
echo dirty > post-run-dirty.txt
exit 0
STUB
chmod +x "$r/scripts/verification-layer.test.sh"; git -C "$r" add scripts/verification-layer.test.sh; git -C "$r" commit -qm 'dirty fixture'
run_verify "$r" "$work/post-dirty.log"; rc=$?
if [[ "$rc" -eq 1 ]] && grep -q '| Candidate clean after verification | FAIL |' "$work/post-dirty.log"; then pass post_run_dirty_fails; else fail post_run_dirty_fails; fi

# git diff --check can fail for a committed whitespace error.
r="$work/diff-fail"; new_repo "$r"; printf 'bad trailing space \n' > "$r/tests/whitespace.txt"; git -C "$r" add tests/whitespace.txt; git -C "$r" commit -qm 'whitespace error'
run_verify "$r" "$work/diff-fail.log"; rc=$?
if [[ "$rc" -eq 1 ]] && grep -q '| Git diff check | FAIL |' "$work/diff-fail.log"; then pass git_diff_can_fail; else fail git_diff_can_fail; fi

# Exact PR identity passes for a real two-parent merge and fails for wrong expected identity.
r="$work/pr-id"; new_repo "$r"; base="$(git -C "$r" rev-parse HEAD)"; git -C "$r" checkout -qb feature; echo feature > "$r/feature.txt"; git -C "$r" add feature.txt; git -C "$r" commit -qm feature; feature="$(git -C "$r" rev-parse HEAD)"; git -C "$r" checkout -q main; git -C "$r" merge -q --no-ff feature -m merge; merge="$(git -C "$r" rev-parse HEAD)"
if (cd "$r" && EXPECTED_BASE_SHA="$base" EXPECTED_HEAD_SHA="$feature" bash scripts/verify-pr-identity.sh) >/dev/null 2>&1; then pass pr_identity_passes; else fail pr_identity_passes; fi
if (cd "$r" && EXPECTED_BASE_SHA="$base" EXPECTED_HEAD_SHA="$base" bash scripts/verify-pr-identity.sh) >/dev/null 2>&1; then fail pr_identity_can_fail; else pass pr_identity_can_fail; fi

# Historical secret remains in the selected object set after deletion.
r="$work/history-secret"; new_repo "$r"; secret="sk-proj-$(printf 'B%.0s' {1..40})"; echo "$secret" > "$r/leak.txt"; git -C "$r" add leak.txt; git -C "$r" commit -qm 'add credential'; git -C "$r" rm -q leak.txt; git -C "$r" commit -qm 'remove credential'
if (cd "$r" && bash scripts/scan-secrets.sh) >"$work/history-secret.log" 2>&1; then fail historical_secret_fails; else pass historical_secret_fails; fi
if grep -Fq "$secret" "$work/history-secret.log"; then fail historical_secret_redaction; else pass historical_secret_redaction; fi

# Commit-message secret fails.
r="$work/message-secret"; new_repo "$r"; secret="sk-proj-$(printf 'C%.0s' {1..40})"; git -C "$r" commit --allow-empty -qm "credential $secret"
if (cd "$r" && bash scripts/scan-secrets.sh) >"$work/message-secret.log" 2>&1; then fail commit_message_secret_fails; else pass commit_message_secret_fails; fi

# .env.example passes; other .env names fail.
r="$work/env-example"; new_repo "$r"; echo PLACEHOLDER=1 > "$r/.env.example"; git -C "$r" add .env.example; git -C "$r" commit -qm example
if (cd "$r" && bash scripts/scan-secrets.sh) >/dev/null 2>&1; then pass env_example_passes; else fail env_example_passes; fi
r="$work/env-bad"; new_repo "$r"; echo PLACEHOLDER=1 > "$r/.env.production"; git -C "$r" add -f .env.production; git -C "$r" commit -qm env
if (cd "$r" && bash scripts/scan-secrets.sh) >/dev/null 2>&1; then fail prohibited_env_fails; else pass prohibited_env_fails; fi

# Two names sharing one blob cannot bypass tree-path policy.
r="$work/shared-blob"; new_repo "$r"; echo PLACEHOLDER=1 > "$r/.env.example"; cp "$r/.env.example" "$r/.env.production"; git -C "$r" add -f .env.example .env.production; git -C "$r" commit -qm shared
blob_a="$(git -C "$r" rev-parse HEAD:.env.example)"; blob_b="$(git -C "$r" rev-parse HEAD:.env.production)"
if [[ "$blob_a" != "$blob_b" ]]; then fail shared_blob_fixture; elif (cd "$r" && bash scripts/scan-secrets.sh) >/dev/null 2>&1; then fail shared_blob_path_policy; else pass shared_blob_path_policy; fi

# Unresolved revision and shallow history fail closed as BLOCKED.
r="$work/unresolved"; new_repo "$r"
(cd "$r" && bash scripts/scan-secrets.sh --range deadbeefdeadbeefdeadbeefdeadbeefdeadbeef..HEAD) >"$work/unresolved.log" 2>&1; rc=$?
if [[ "$rc" -eq 2 ]]; then pass unresolved_history_blocks; else fail unresolved_history_blocks; fi
src="$work/source"; mkdir -p "$src"; git -C "$src" init -q; git -C "$src" config user.email verification@example.invalid; git -C "$src" config user.name fixture; echo one > "$src/f"; git -C "$src" add f; git -C "$src" commit -qm one; echo two >> "$src/f"; git -C "$src" commit -qam two; shallow="$work/shallow"; git clone -q --depth 1 "file://$src" "$shallow"; mkdir -p "$shallow/scripts"; cp "$source_root/scripts/scan-secrets.sh" "$shallow/scripts/scan-secrets.sh"
(cd "$shallow" && bash scripts/scan-secrets.sh) >"$work/shallow.log" 2>&1; rc=$?
if [[ "$rc" -eq 2 ]]; then pass shallow_history_blocks; else fail shallow_history_blocks; fi

# Verification-control mutations select verification-layer tests.
r="$work/selector"; new_repo "$r"; base="$(git -C "$r" rev-parse HEAD)"; echo '# mutation' >> "$r/scripts/verify-production.sh"; git -C "$r" add scripts/verify-production.sh; git -C "$r" commit -qm mutate
selected="$(cd "$r" && bash scripts/select-verification-tests.sh "$base" HEAD 2>/dev/null)"
if [[ "$selected" == verification-control ]]; then pass control_mutation_selects_tests; else fail control_mutation_selects_tests; fi

[[ "$failures" -eq 0 ]] || exit 1

#!/usr/bin/env bash
set -uo pipefail

REPORT_DIR="verification-reports"
rows=()
failures=0
blocked=0

check_clean() {
  local status
  if ! status="$(git status --porcelain --untracked-files=all 2>/dev/null)"; then
    echo "BLOCKED: cannot determine candidate working-tree state."
    return 2
  fi
  if [ -n "$status" ]; then
    echo "FAIL: working tree is not clean; verification requires a committed candidate."
    while IFS= read -r line; do
      [ -n "$line" ] || continue
      printf 'DIRTY: %s\n' "$line"
    done <<< "$status"
    return 1
  fi
}

if ! START_SHA="$(git rev-parse --verify HEAD^{commit} 2>/dev/null)"; then
  echo "BLOCKED: cannot resolve the candidate HEAD."
  exit 2
fi
check_clean
preflight_rc=$?
if [ "$preflight_rc" -ne 0 ]; then
  if [ "$preflight_rc" -eq 2 ]; then exit 2; else exit 1; fi
fi

echo "Candidate: $START_SHA"
echo "Candidate clean before verification: PASS"
mkdir -p "$REPORT_DIR" || { echo "BLOCKED: cannot create verification report directory."; exit 2; }
REPORT="$REPORT_DIR/verification-$START_SHA.md"
rows+=("| Candidate clean before verification | PASS | clean committed candidate |")

record() {
  rows+=("| $1 | $2 | $3 |")
}

run_gate() {
  local name="$1"; shift
  echo "==> $name"
  "$@"
  local rc=$?
  if [ "$rc" -eq 0 ]; then
    record "$name" PASS "oracle satisfied"
  elif [ "$rc" -eq 2 ]; then
    record "$name" BLOCKED "required evidence unavailable"
    blocked=$((blocked + 1))
  else
    record "$name" FAIL "oracle failed"
    failures=$((failures + 1))
  fi
}

check_required_files() { bash scripts/verify-required-files.sh .; }
check_secret_boundary() { bash scripts/scan-secrets.sh --candidate "$START_SHA"; }
check_verification_layer() {
  bash scripts/verification-layer.test.sh || return $?
  bash scripts/verification-selection.test.sh
}
check_pr_identity() { bash scripts/verify-pr-identity.sh; }
check_diff() {
  local rc=0
  if git rev-parse --verify HEAD^1 >/dev/null 2>&1; then
    git diff --check HEAD^1..HEAD || rc=$?
  else
    git diff --check HEAD || rc=$?
  fi
  [[ "$rc" -eq 0 ]] || return 1
}
check_head_unchanged() {
  local current
  current="$(git rev-parse --verify HEAD^{commit} 2>/dev/null)" || return 2
  [[ "$current" == "$START_SHA" ]] || { echo "FAIL: candidate HEAD changed during verification."; return 1; }
}

run_gate "Required repository files" check_required_files

contract="verification/contract.tsv"
if [ ! -f "$contract" ]; then
  record "Verification contract" BLOCKED "contract missing"
  blocked=$((blocked + 1))
else
  while IFS=$'\t' read -r id state requirement command oracle; do
    [[ -n "$id" ]] || continue
    [[ "$id" == \#* ]] && continue
    [[ "$id" == "required_repository_files" ]] && continue
    case "$state" in
      ACTIVE)
        case "$id" in
          frozen_dependency_install) run_gate "Frozen dependency install" npm ci ;;
          git_secret_verification) run_gate "Git / secret verification" check_secret_boundary ;;
          lint) run_gate "Lint" npm run lint ;;
          typecheck) run_gate "Typecheck" npm run typecheck ;;
          production_build) run_gate "Production build" npm run build ;;
          unit_tests) run_gate "Unit tests" npm run test ;;
          verification_control_tests) run_gate "Verification layer" check_verification_layer ;;
          git_diff_check) run_gate "Git diff check" check_diff ;;
          *) record "$id" BLOCKED "active gate is not bound to the canonical verifier"; blocked=$((blocked + 1)) ;;
        esac
        ;;
      CONDITIONAL)
        if [[ "$id" == "pr_merge_identity" && "${VERIFY_PR_MERGE_CANDIDATE:-0}" == "1" ]]; then
          run_gate "Exact PR merge candidate" check_pr_identity
        else
          record "$id" "NOT ACTIVE" "condition not active for this candidate"
        fi
        ;;
      BLOCKED)
        record "$id" BLOCKED "required repository command/capability does not exist yet"
        blocked=$((blocked + 1))
        ;;
      NOT_ACTIVE)
        record "$id" "NOT ACTIVE" "capability is not active in the repository"
        ;;
      *)
        record "$id" FAIL "unknown verification state"
        failures=$((failures + 1))
        ;;
    esac
  done < "$contract"
fi

run_gate "Candidate HEAD unchanged" check_head_unchanged
run_gate "Candidate clean after verification" check_clean

if [ "$failures" -gt 0 ]; then
  result=FAIL; exit_code=1
elif [ "$blocked" -gt 0 ]; then
  result=BLOCKED; exit_code=2
else
  result=PASS; exit_code=0
fi

{
  echo "# Production verification report"
  echo
  echo "- Commit: \`$START_SHA\`"
  echo "- Result: **$result**"
  echo
  echo "| Gate | Status | Detail |"
  echo "| ---- | ------ | ------ |"
  for row in "${rows[@]}"; do echo "$row"; done
} > "$REPORT"
cat "$REPORT"
echo "Report written to $REPORT"
exit "$exit_code"

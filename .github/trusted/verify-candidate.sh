#!/usr/bin/env bash
set -euo pipefail

fail() {
  echo "FAIL: $1" >&2
  exit 1
}

block() {
  echo "BLOCKED: $1" >&2
  exit 2
}

candidate_arg="${1:-}"
[[ -n "$candidate_arg" ]] || block "candidate checkout path is required."
[[ -n "${EXPECTED_HEAD_SHA:-}" ]] || block "EXPECTED_HEAD_SHA is required."
[[ -n "${EXPECTED_BASE_SHA:-}" ]] || block "EXPECTED_BASE_SHA is required."
[[ -n "${PR_NUMBER:-}" ]] || block "PR_NUMBER is required."
[[ -n "${GITHUB_REPOSITORY:-}" ]] || block "GITHUB_REPOSITORY is required."
[[ -n "${CANDIDATE_USER:-}" ]] || block "CANDIDATE_USER is required."

trusted_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
candidate_root="$(cd "$candidate_arg" 2>/dev/null && pwd)" || block "candidate checkout is unavailable."

# Candidate-loaded JavaScript, tests, build tooling, and dev servers must run as
# an OS identity that cannot write the trusted checkout or its parent directory.
id "$CANDIDATE_USER" >/dev/null 2>&1 || block "candidate execution identity is unavailable."
candidate_uid="$(id -u "$CANDIDATE_USER")"
candidate_home="$(getent passwd "$CANDIDATE_USER" | cut -d: -f6)"
[[ -n "$candidate_home" && -d "$candidate_home" ]] || block "candidate execution home is unavailable."
[[ "$(stat -c '%u' "$candidate_root")" == "$candidate_uid" ]] || block "candidate checkout is not owned by the isolated execution identity."
[[ "$(stat -c '%u' "$trusted_root")" != "$candidate_uid" ]] || block "trusted checkout is owned by the candidate execution identity."
sudo -H -u "$CANDIDATE_USER" test ! -w "$trusted_root" || block "candidate execution identity can write the trusted checkout."
sudo -H -u "$CANDIDATE_USER" test ! -w "$(dirname "$trusted_root")" || block "candidate execution identity can write the trusted checkout parent."

git config --global --add safe.directory "$candidate_root"

# The trusted verifier must not inherit an explicitly exported repository token
# while it executes candidate dependencies, tests, build tooling, or dev server.
[[ -z "${GITHUB_TOKEN:-}" ]] || block "GITHUB_TOKEN must not be exported to candidate verification."

node_bin="$(command -v node)" || block "trusted Node runtime is unavailable."
npm_bin="$(command -v npm)" || block "trusted npm runtime is unavailable."
node_path="$(dirname "$node_bin")"

run_as_candidate() {
  sudo -H -u "$CANDIDATE_USER" -- env -i \
    HOME="$candidate_home" \
    PATH="$node_path:/usr/bin:/bin" \
    CI=true \
    bash -c 'cd "$1"; shift; exec "$@"' bash "$candidate_root" "$@"
}

clear_candidate_processes() {
  sudo pkill -KILL -u "$CANDIDATE_USER" >/dev/null 2>&1 || true
}

run_candidate_gate() {
  local status
  if run_as_candidate "$@"; then
    status=0
  else
    status=$?
  fi
  clear_candidate_processes
  return "$status"
}

actual_head="$(git -C "$candidate_root" rev-parse --verify HEAD^{commit} 2>/dev/null)" || block "candidate HEAD cannot be resolved."
[[ "$actual_head" == "$EXPECTED_HEAD_SHA" ]] || fail "checked-out candidate does not match the pull-request head SHA."

shallow="$(git -C "$candidate_root" rev-parse --is-shallow-repository 2>/dev/null)" || block "candidate history depth cannot be determined."
[[ "$shallow" == "false" ]] || block "candidate checkout is shallow."

git -C "$candidate_root" cat-file -e "$EXPECTED_BASE_SHA^{commit}" 2>/dev/null || block "trusted base commit is unavailable in candidate history."
git -C "$candidate_root" merge-base --is-ancestor "$EXPECTED_BASE_SHA" "$EXPECTED_HEAD_SHA" || fail "candidate is not up to date with the trusted base."

before_status="$(git -C "$candidate_root" status --porcelain --untracked-files=all 2>/dev/null)" || block "candidate cleanliness cannot be determined."
[[ -z "$before_status" ]] || fail "candidate checkout is dirty before verification."

echo "Trusted candidate: $EXPECTED_HEAD_SHA"
echo "Trusted base: $EXPECTED_BASE_SHA"

echo "==> Trusted Git / secret verification"
(
  cd "$candidate_root"
  bash "$trusted_root/.github/trusted/scan-secrets.sh" --candidate "$EXPECTED_HEAD_SHA"
)

echo "==> Trusted verification toolchain install"
(
  cd "$trusted_root"
  "$npm_bin" ci --ignore-scripts
)
trusted_bin="$trusted_root/node_modules/.bin"
for tool in eslint react-router tsc vitest; do
  [[ -x "$trusted_bin/$tool" ]] || block "trusted verification tool '$tool' is unavailable."
done
sudo -H -u "$CANDIDATE_USER" test ! -w "$trusted_root/node_modules" || block "candidate execution identity can write trusted verification tooling."

echo "==> Candidate dependency install"
run_candidate_gate "$npm_bin" ci --ignore-scripts

echo "==> Lint"
run_candidate_gate "$trusted_root/node_modules/.bin/eslint" .

echo "==> Typecheck"
run_candidate_gate "$trusted_root/node_modules/.bin/react-router" typegen
run_candidate_gate "$trusted_root/node_modules/.bin/tsc" --noEmit

echo "==> Unit tests"
run_candidate_gate "$trusted_root/node_modules/.bin/vitest" run

echo "==> Production build"
run_candidate_gate "$trusted_root/node_modules/.bin/react-router" build

echo "==> Git diff check"
git -C "$candidate_root" diff --check "$EXPECTED_BASE_SHA...$EXPECTED_HEAD_SHA"

echo "==> First-response SSR"
ssr_log="$(mktemp)" || block "cannot allocate SSR log."
home_html="$(mktemp)" || block "cannot allocate home response fixture."
book_html="$(mktemp)" || block "cannot allocate book response fixture."
cleanup() {
  if [[ -n "${app_pid:-}" ]]; then
    kill "$app_pid" 2>/dev/null || true
    wait "$app_pid" 2>/dev/null || true
  fi
  clear_candidate_processes
  rm -f "$ssr_log" "$home_html" "$book_html"
}
trap cleanup EXIT
clear_candidate_processes
run_as_candidate "$trusted_root/node_modules/.bin/react-router" dev --host 127.0.0.1 --port 4173 >"$ssr_log" 2>&1 &
app_pid=$!
ready=0
for _ in {1..30}; do
  if curl -fsS http://127.0.0.1:4173/ >"$home_html"; then
    ready=1
    break
  fi
  sleep 1
done
[[ "$ready" -eq 1 ]] || fail "SSR server did not become ready."
curl -fsS http://127.0.0.1:4173/book >"$book_html" || fail "book route did not return first-response HTML."
grep -Fq '<h1>Becoming the Man She Can Trust</h1>' "$home_html" || fail "home SSR identity is missing."
grep -Fq 'href="/book"' "$home_html" || fail "home SSR book navigation is missing."
grep -Fq 'BOOK ORIENTATION' "$book_html" || fail "book SSR orientation is missing."
grep -Fq 'href="/"' "$book_html" || fail "book SSR home navigation is missing."
kill "$app_pid" 2>/dev/null || true
wait "$app_pid" 2>/dev/null || true
app_pid=""
clear_candidate_processes

echo "==> Exact PR merge candidate identity"
merge_ref="refs/remotes/trusted/pull-merge"
target_url="https://github.com/${GITHUB_REPOSITORY}.git"
if ! git -C "$candidate_root" fetch --quiet --no-tags "$target_url" "+refs/pull/$PR_NUMBER/merge:$merge_ref"; then
  block "GitHub pull-request merge candidate cannot be fetched."
fi
merge_sha="$(git -C "$candidate_root" rev-parse --verify "$merge_ref^{commit}" 2>/dev/null)" || block "merge candidate cannot be resolved."
parent_one="$(git -C "$candidate_root" rev-parse --verify "$merge_sha^1" 2>/dev/null)" || block "merge candidate first parent cannot be resolved."
parent_two="$(git -C "$candidate_root" rev-parse --verify "$merge_sha^2" 2>/dev/null)" || block "merge candidate second parent cannot be resolved."
[[ "$parent_one" == "$EXPECTED_BASE_SHA" ]] || fail "merge candidate first parent is not the trusted base."
[[ "$parent_two" == "$EXPECTED_HEAD_SHA" ]] || fail "merge candidate second parent is not the verified feature head."
merge_tree="$(git -C "$candidate_root" rev-parse --verify "$merge_sha^{tree}" 2>/dev/null)" || block "merge candidate tree cannot be resolved."
head_tree="$(git -C "$candidate_root" rev-parse --verify "$EXPECTED_HEAD_SHA^{tree}" 2>/dev/null)" || block "candidate tree cannot be resolved."
[[ "$merge_tree" == "$head_tree" ]] || fail "merge candidate tree differs from the verified up-to-date feature head."

final_head="$(git -C "$candidate_root" rev-parse --verify HEAD^{commit} 2>/dev/null)" || block "candidate HEAD cannot be re-resolved."
[[ "$final_head" == "$EXPECTED_HEAD_SHA" ]] || fail "candidate HEAD changed during verification."
after_status="$(git -C "$candidate_root" status --porcelain --untracked-files=all 2>/dev/null)" || block "final candidate cleanliness cannot be determined."
[[ -z "$after_status" ]] || fail "candidate checkout is dirty after verification."

trap - EXIT
cleanup

echo "PASS: trusted-base verification completed for $EXPECTED_HEAD_SHA against merge candidate $merge_sha."

#!/usr/bin/env bash
set -u
source_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
failures=0
report="$source_root/verification-reports/verification-layer-tests.md"
mkdir -p "$(dirname "$report")"
if [ ! -f "$report" ]; then printf "# Verification-layer regression report\n\n" > "$report"; fi
pass(){ echo "PASS $1"; printf -- "- %s: PASS\n" "$1" >> "$report"; }
fail(){ echo "FAIL $1" >&2; printf -- "- %s: FAIL\n" "$1" >> "$report"; failures=$((failures+1)); }

new_repo(){
  local dir="$1"
  mkdir -p "$dir"
  git -C "$dir" init -q -b main
  git -C "$dir" config user.email verification@example.invalid
  git -C "$dir" config user.name 'Verification Fixture'
  printf 'safe\n' > "$dir/safe.txt"
  git -C "$dir" add safe.txt
  git -C "$dir" commit -qm 'safe candidate'
}

work="$(mktemp -d)"
trap 'rm -rf "$work"' EXIT
secret='sk-'
secret+='proj-'
secret+='SelectionRegressionSecret1234567890'

# Ambient stash content is outside the frozen candidate graph and must not alter its verdict.
r="$work/stash"
new_repo "$r"
candidate="$(git -C "$r" rev-parse HEAD)"
printf '%s\n' "$secret" > "$r/ambient.txt"
git -C "$r" add ambient.txt
git -C "$r" stash push -qm 'ambient secret fixture'
(cd "$r" && bash "$source_root/scripts/scan-secrets.sh" --candidate "$candidate") > "$work/stash.log" 2>&1
rc=$?
if [ "$rc" -eq 0 ]; then pass ambient_stash_does_not_change_candidate; else fail ambient_stash_does_not_change_candidate; fi

# An unrelated branch is likewise outside the candidate graph.
r="$work/branch"
new_repo "$r"
candidate="$(git -C "$r" rev-parse HEAD)"
git -C "$r" switch -qc unrelated
printf '%s\n' "$secret" > "$r/branch-secret.txt"
git -C "$r" add branch-secret.txt
git -C "$r" commit -qm 'unrelated branch fixture'
git -C "$r" switch -q main
(cd "$r" && bash "$source_root/scripts/scan-secrets.sh" --candidate "$candidate") > "$work/branch.log" 2>&1
rc=$?
if [ "$rc" -eq 0 ]; then pass unrelated_branch_does_not_change_candidate; else fail unrelated_branch_does_not_change_candidate; fi

# Annotated tag metadata remains in scope and must fail closed without exposing the value.
r="$work/tag"
new_repo "$r"
candidate="$(git -C "$r" rev-parse HEAD)"
git -C "$r" tag -a candidate-tag -m "tag metadata $secret"
(cd "$r" && bash "$source_root/scripts/scan-secrets.sh" --candidate "$candidate") > "$work/tag.log" 2>&1
rc=$?
if [ "$rc" -eq 1 ] && grep -q '\[redacted\]' "$work/tag.log" && ! grep -Fq "$secret" "$work/tag.log"; then
  pass annotated_tag_secret_fails_redacted
else
  fail annotated_tag_secret_fails_redacted
fi

[[ "$failures" -eq 0 ]] || exit 1

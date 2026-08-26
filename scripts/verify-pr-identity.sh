#!/usr/bin/env bash
set -u
expected_base="${EXPECTED_BASE_SHA:-}"
expected_head="${EXPECTED_HEAD_SHA:-}"
if [[ -z "$expected_base" || -z "$expected_head" ]]; then
  echo "BLOCKED: expected PR parent SHAs are unavailable."
  exit 2
fi
candidate="$(git rev-parse --verify HEAD^{commit} 2>/dev/null)" || { echo "BLOCKED: cannot resolve candidate HEAD."; exit 2; }
parents="$(git rev-list --parents -n 1 "$candidate" 2>/dev/null)" || { echo "BLOCKED: cannot resolve merge parents."; exit 2; }
read -r -a parts <<<"$parents"
if [[ "${#parts[@]}" -ne 3 ]]; then
  echo "FAIL: HEAD is not an exact two-parent merge candidate."
  exit 1
fi
base="$(git rev-parse --verify HEAD^1 2>/dev/null)" || exit 2
head="$(git rev-parse --verify HEAD^2 2>/dev/null)" || exit 2
[[ "$base" == "$expected_base" ]] || { echo "FAIL: merge candidate base parent does not match the expected base SHA."; exit 1; }
[[ "$head" == "$expected_head" ]] || { echo "FAIL: merge candidate feature parent does not match the expected head SHA."; exit 1; }
echo "Verified merge candidate: $candidate"
echo "Verified feature head: $head"

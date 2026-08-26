#!/usr/bin/env bash
set -u
base="${1:-}"
head="${2:-HEAD}"
[[ -n "$base" ]] || { echo "BLOCKED: base revision is required."; exit 2; }
files="$(git diff --name-only "$base" "$head" 2>/dev/null)" || exit 2
if grep -Eq '^(verification/|scripts/(verify-production|verify-required-files|verify-pr-identity|scan-secrets|verification-layer\.test|verification-selection\.test|select-verification-tests|install-git-hooks)\.sh$|\.githooks/pre-push$|\.github/workflows/(production-verification|pr-verification)\.yml$|AGENTS\.md$)' <<<"$files"; then
  echo verification-control
else
  echo none
fi

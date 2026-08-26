#!/usr/bin/env bash
set -euo pipefail

BASE_REF="${1:-origin/main}"
MAX_LINES=1000

if ! MERGE_BASE="$(git merge-base "$BASE_REF" HEAD 2>/dev/null)"; then
  echo "BLOCKED: cannot resolve merge base for '$BASE_REF'."
  exit 2
fi

counted=0
excluded=0
files=0

while IFS=$'\t' read -r additions deletions path; do
  [[ "$additions" =~ ^[0-9]+$ && "$deletions" =~ ^[0-9]+$ ]] || continue
  changed=$((additions + deletions))

  case "$path" in
    docs/*|*.md|*.mdx|*.pdf|*.doc|*.docx|package-lock.json|pnpm-lock.yaml|yarn.lock|bun.lock|bun.lockb|.react-router/*|build/*)
      excluded=$((excluded + changed))
      ;;
    *)
      counted=$((counted + changed))
      files=$((files + 1))
      ;;
  esac
done < <(git diff --numstat "$MERGE_BASE"...HEAD)

echo "Reviewable implementation lines: $counted / $MAX_LINES across $files counted files."
echo "Excluded documentation/generated/lockfile lines: $excluded."

if (( counted > MAX_LINES )); then
  echo "FAIL: reviewable implementation change exceeds the 1,000-line governance limit."
  exit 1
fi

echo "PASS: implementation change is within the 1,000-line governance limit."

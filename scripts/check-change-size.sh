#!/usr/bin/env bash
set -euo pipefail

BASE_REF="${1:-origin/main}"
MAX_LINES=1000
EXCEPTION_MARKER="CHANGE-SIZE-EXCEPTION: APPROVED"

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
  if [[ -z "${GITHUB_TOKEN:-}" || -z "${GITHUB_REPOSITORY:-}" || -z "${PR_NUMBER:-}" || -z "${REPOSITORY_OWNER:-}" ]]; then
    echo "BLOCKED: change exceeds 1,000 lines and PR exception evidence cannot be verified in this context."
    exit 2
  fi
  if ! command -v curl >/dev/null 2>&1 || ! command -v jq >/dev/null 2>&1; then
    echo "BLOCKED: curl and jq are required to verify change-size exception evidence."
    exit 2
  fi

  api_url="${GITHUB_API_URL:-https://api.github.com}"
  page=1
  while :; do
    if ! comments="$(curl -fsS \
      -H "Authorization: Bearer $GITHUB_TOKEN" \
      -H "Accept: application/vnd.github+json" \
      -H "X-GitHub-Api-Version: 2022-11-28" \
      "$api_url/repos/$GITHUB_REPOSITORY/issues/$PR_NUMBER/comments?per_page=100&page=$page")"; then
      echo "BLOCKED: cannot read PR comments to verify the authorized change-size exception."
      exit 2
    fi

    evidence="$(jq -r --arg owner "$REPOSITORY_OWNER" --arg marker "$EXCEPTION_MARKER" \
      '.[] | select(.user.login == $owner and ((.body | split("\n") | index($marker)) != null)) | .html_url' \
      <<<"$comments" | tail -n 1)"
    if [[ -n "$evidence" ]]; then
      echo "PASS: reviewable implementation change exceeds 1,000 lines under an explicit repository-owner exception recorded at $evidence"
      exit 0
    fi

    comment_count="$(jq 'length' <<<"$comments")"
    if (( comment_count < 100 )); then
      break
    fi
    page=$((page + 1))
  done

  echo "FAIL: reviewable implementation change exceeds the 1,000-line governance limit without an authorized PR exception."
  exit 1
fi

echo "PASS: implementation change is within the 1,000-line governance limit."

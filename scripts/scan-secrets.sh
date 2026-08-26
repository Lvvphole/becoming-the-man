#!/usr/bin/env bash
set -uo pipefail

candidate_mode=0
if [ "${1:-}" = "--candidate" ]; then
  shift
  if [ "$#" -ne 1 ]; then
    echo "BLOCKED: --candidate requires exactly one commit revision."
    exit 2
  fi
  candidate_mode=1
  revisions=("$1")
elif [ "${1:-}" = "--range" ]; then
  shift
  if [ "$#" -eq 0 ]; then
    echo "BLOCKED: --range requires at least one revision argument."
    exit 2
  fi
  revisions=("$@")
else
  if [ "$#" -ne 0 ]; then
    echo "BLOCKED: unexpected scanner arguments."
    exit 2
  fi
  revisions=(--all)
fi

if ! shallow="$(git rev-parse --is-shallow-repository 2>/dev/null)"; then
  echo "BLOCKED: cannot determine repository history state."
  exit 2
fi
if [ "$shallow" = "true" ]; then
  echo "BLOCKED: repository history is shallow; refusing an incomplete secret scan."
  exit 2
fi

if ! object_ids="$(git rev-list --objects --no-object-names "${revisions[@]}" 2>/dev/null)"; then
  echo "BLOCKED: cannot resolve the selected Git object set."
  exit 2
fi

# Completion verification is bound to the frozen candidate graph, not ambient
# stashes or unrelated branches. Annotated tag objects remain repository-wide
# metadata and are included explicitly so tag messages cannot hide secrets.
if [ "$candidate_mode" -eq 1 ]; then
  if ! tag_refs="$(git for-each-ref --format='%(objectname) %(objecttype)' refs/tags 2>/dev/null)"; then
    echo "BLOCKED: cannot resolve repository tag metadata."
    exit 2
  fi
  while read -r tag_id tag_type; do
    [ -n "${tag_id:-}" ] || continue
    if [ "$tag_type" = "tag" ]; then
      object_ids+=$'\n'"$tag_id"
    fi
  done <<< "$tag_refs"
  object_ids="$(printf '%s\n' "$object_ids" | awk 'NF && !seen[$1]++')"
fi

if [ -z "$object_ids" ]; then
  echo "PASSED: selected Git object set is empty."
  exit 0
fi

if ! object_types="$(printf '%s\n' "$object_ids" | git cat-file --batch-check='%(objectname) %(objecttype)' 2>/dev/null)"; then
  echo "BLOCKED: cannot classify the selected Git objects."
  exit 2
fi

tree_ids=()
while read -r object_id object_type; do
  case "$object_type" in
    blob|commit|tag) ;;
    tree) tree_ids+=("$object_id") ;;
    *)
      echo "BLOCKED: selected Git object ${object_id:0:12} is missing, unreadable, or unsupported."
      exit 2
      ;;
  esac
done <<< "$object_types"

env_found=0
if [ "${#tree_ids[@]}" -gt 0 ]; then
  if ! tree_entries_file="$(mktemp)"; then
    echo "BLOCKED: cannot create temporary storage for tree path verification."
    exit 2
  fi
  trap 'rm -f "$tree_entries_file"' EXIT
  for tree_id in "${tree_ids[@]}"; do
    if ! git ls-tree -z --name-only "$tree_id" >"$tree_entries_file" 2>/dev/null; then
      echo "BLOCKED: cannot inspect the selected Git tree paths."
      exit 2
    fi
    while IFS= read -r -d '' entry_name; do
      case "$entry_name" in
        .env|.env.*)
          if [ "$entry_name" != ".env.example" ]; then
            env_found=1
            break 2
          fi
          ;;
      esac
    done <"$tree_entries_file"
  done
fi
if [ "$env_found" -ne 0 ]; then
  echo "FAIL: selected Git objects contain a prohibited .env entry."
fi

SECRET_RE='-----BEGIN [A-Z ]*PRIVATE KEY-----|AKIA[0-9A-Z]{16}|github_pat_[A-Za-z0-9_]{20,}|gh[pousr]_[A-Za-z0-9]{20,}|sk-(proj-)?[A-Za-z0-9_-]{20,}|eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}'
printf '%s\n' "$object_ids" | git cat-file --batch 2>/dev/null | grep -aEq -e "$SECRET_RE"
pipeline_status=("${PIPESTATUS[@]}")
grep_status="${pipeline_status[2]}"
cat_file_status="${pipeline_status[1]}"
secret_found=0
scan_error=0
if [ "$grep_status" -eq 0 ]; then
  secret_found=1
elif [ "$grep_status" -gt 1 ] || [ "$cat_file_status" -ne 0 ]; then
  scan_error=1
fi
if [ "$scan_error" -ne 0 ]; then
  echo "BLOCKED: cannot safely scan the selected Git object content."
  exit 2
fi
if [ "$secret_found" -ne 0 ]; then
  echo "FAIL: selected Git objects contain potential secret material [redacted]."
fi
if [ "$env_found" -ne 0 ] || [ "$secret_found" -ne 0 ]; then
  exit 1
fi

echo "PASSED: selected Git objects contain no detected secrets."

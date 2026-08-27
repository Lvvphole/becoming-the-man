#!/usr/bin/env bash
set -uo pipefail

base_sha="${1:-}"
candidate_contract="${2:-verification/contract.tsv}"

if [[ -z "$base_sha" ]]; then
  echo "BLOCKED: trusted base SHA is required for verification contract policy."
  exit 2
fi
if ! git cat-file -e "$base_sha^{commit}" 2>/dev/null; then
  echo "BLOCKED: trusted base SHA cannot be resolved."
  exit 2
fi
if [[ ! -f "$candidate_contract" ]]; then
  echo "FAIL: candidate verification contract is missing."
  exit 1
fi

base_contract="$(mktemp)" || { echo "BLOCKED: cannot create contract-policy workspace."; exit 2; }
trap 'rm -f "$base_contract"' EXIT

if ! git cat-file -e "$base_sha:verification/contract.tsv" 2>/dev/null; then
  echo "PASS: trusted base has no verification contract; this candidate establishes the baseline."
  exit 0
fi
if ! git show "$base_sha:verification/contract.tsv" > "$base_contract" 2>/dev/null; then
  echo "BLOCKED: trusted verification contract cannot be read."
  exit 2
fi

for contract in "$base_contract" "$candidate_contract"; do
  if ! awk -F '\t' '$0 !~ /^#/ && $1 != "" { if (++seen[$1] > 1) exit 1 }' "$contract"; then
    echo "FAIL: verification contract contains duplicate gate identifiers."
    exit 1
  fi
done

awk -F '\t' '
  NR == FNR {
    if ($0 !~ /^#/ && $1 != "") base[$1] = $2
    next
  }
  $0 !~ /^#/ && $1 != "" { candidate[$1] = $2 }
  END {
    failures = 0
    for (id in base) {
      state = base[id]
      if (state == "ACTIVE") {
        if (!(id in candidate) || candidate[id] != "ACTIVE") failures++
      } else if (state == "CONDITIONAL") {
        if (!(id in candidate) || candidate[id] != "CONDITIONAL") failures++
      } else if (state == "BLOCKED") {
        if (!(id in candidate) || (candidate[id] != "BLOCKED" && candidate[id] != "ACTIVE")) failures++
      }
    }
    exit failures ? 1 : 0
  }
' "$base_contract" "$candidate_contract"
rc=$?
if [[ "$rc" -ne 0 ]]; then
  echo "FAIL: candidate weakens or removes a required verification gate from the trusted base."
  exit 1
fi

echo "PASS: candidate preserves all required verification states from the trusted base."

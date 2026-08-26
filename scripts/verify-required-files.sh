#!/usr/bin/env bash
set -u
root="${1:-$(git rev-parse --show-toplevel 2>/dev/null)}"
required=(
  AGENTS.md README.md src api server contracts supabase config tests docs/evidence scripts
  verification/contract.tsv scripts/verify-production.sh scripts/scan-secrets.sh
  scripts/verification-layer.test.sh scripts/verify-pr-identity.sh
  scripts/select-verification-tests.sh .github/workflows/production-verification.yml
)
for path in "${required[@]}"; do
  if [[ ! -e "$root/$path" ]]; then
    printf 'MISSING: %s\n' "$path"
    exit 1
  fi
done

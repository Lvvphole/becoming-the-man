#!/usr/bin/env bash
set -uo pipefail

source_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
work="$(mktemp -d)"
trap 'rm -rf "$work"' EXIT
failures=0
pass(){ echo "PASS $1"; }
fail(){ echo "FAIL $1" >&2; failures=$((failures + 1)); }

git -C "$work" init -q -b main
git -C "$work" config user.email verification@example.invalid
git -C "$work" config user.name 'Verification Fixture'
mkdir -p "$work/verification" "$work/scripts"
cp "$source_root/scripts/verify-contract-policy.sh" "$work/scripts/verify-contract-policy.sh"
cat > "$work/verification/contract.tsv" <<'CONTRACT'
required_repository_files	ACTIVE	fixture	builtin	ok
future_gate	NOT_ACTIVE	fixture	-	ok
missing_capability	BLOCKED	fixture	-	ok
pr_merge_identity	CONDITIONAL	fixture	builtin	ok
CONTRACT
git -C "$work" add .
git -C "$work" commit -qm baseline
base="$(git -C "$work" rev-parse HEAD)"

if (cd "$work" && bash scripts/verify-contract-policy.sh "$base") >/dev/null 2>&1; then pass preserves_baseline; else fail preserves_baseline; fi
sed -i 's/required_repository_files\tACTIVE/required_repository_files\tNOT_ACTIVE/' "$work/verification/contract.tsv"
if (cd "$work" && bash scripts/verify-contract-policy.sh "$base") >/dev/null 2>&1; then fail active_downgrade_rejected; else pass active_downgrade_rejected; fi
git -C "$work" checkout -q -- verification/contract.tsv
sed -i 's/missing_capability\tBLOCKED/missing_capability\tACTIVE/' "$work/verification/contract.tsv"
if (cd "$work" && bash scripts/verify-contract-policy.sh "$base") >/dev/null 2>&1; then pass blocked_activation_allowed; else fail blocked_activation_allowed; fi
git -C "$work" checkout -q -- verification/contract.tsv
sed -i '/pr_merge_identity/d' "$work/verification/contract.tsv"
if (cd "$work" && bash scripts/verify-contract-policy.sh "$base") >/dev/null 2>&1; then fail conditional_removal_rejected; else pass conditional_removal_rejected; fi

[[ "$failures" -eq 0 ]] || exit 1

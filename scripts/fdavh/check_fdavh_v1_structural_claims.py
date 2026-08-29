#!/usr/bin/env python3
"""
Reproducibility checker for structural claims in the corrected FDAVH v1.0 review.

This is NOT the frozen FDAVH acceptance oracle and does not prove semantic correctness.
It only machine-checks document-structural claims used by the review.
"""
from pathlib import Path
import re, json, hashlib, sys

if len(sys.argv) != 2:
    raise SystemExit("usage: check_fdavh_v1_structural_claims.py <FDAVH-spec.md>")

p = Path(sys.argv[1])
text = p.read_text(encoding="utf-8")

def section(start, end=None):
    s = text.split(start, 1)[1]
    return s.split(end, 1)[0] if end else s

cross = section("## 18. Invariant-to-gate/evidence/schema/acceptance crosswalk", "## 19.")
cross_rows = []
for line in cross.splitlines():
    if re.match(r"^\|\s*(I\d+|IV\d+|R\d+|MR\d+)\s*\|", line):
        cross_rows.append([x.strip() for x in line.strip().strip("|").split("|")])

expected = (
    [f"I{i}" for i in range(1, 25)]
    + [f"IV{i}" for i in range(1, 19)]
    + [f"R{i}" for i in range(1, 17)]
    + [f"MR{i}" for i in range(1, 17)]
)
inv_ids = [r[0] for r in cross_rows]
ac_refs = set()
for row in cross_rows:
    ac_refs.update(re.findall(r"AC-\d{2}", row[-1]))

gate_sec = section("## 9. Gate registry", "## 10.")
gates = [
    m.group(1)
    for line in gate_sec.splitlines()
    if (m := re.match(r"^\|\s*(G\d+)\s*\|", line))
]

ac_sec = section("## 19. Adversarial acceptance contract", "## 20.")
ac_rows = []
for line in ac_sec.splitlines():
    if re.match(r"^\|\s*AC-\d{2}\s*\|", line):
        ac_rows.append([x.strip() for x in line.strip().strip("|").split("|")])
ac_ids = [r[0] for r in ac_rows]

sm = section("## 11. Closed-world runtime state machine", "### 11.1")
transitions = []
for line in sm.splitlines():
    if line.startswith("| ") and not line.startswith("| ---") and not line.startswith("| From"):
        parts = [x.strip() for x in line.strip().strip("|").split("|")]
        if len(parts) >= 4:
            transitions.append(parts[:4])

result = {
    "spec_sha256": hashlib.sha256(text.encode()).hexdigest(),
    "invariant_crosswalk_rows": len(cross_rows),
    "expected_invariant_count": len(expected),
    "invariant_ids_missing": sorted(set(expected) - set(inv_ids)),
    "invariant_ids_extra": sorted(set(inv_ids) - set(expected)),
    "gate_count": len(gates),
    "gate_ids": gates,
    "acceptance_case_count": len(ac_ids),
    "crosswalk_referenced_acceptance_case_count": len(ac_refs),
    "orphan_acceptance_cases": sorted(set(ac_ids) - ac_refs),
    "acceptance_oracles_explicitly_containing_BLOCKED": [
        row[0] for row in ac_rows if re.search(r"\bBLOCKED\b", row[-1])
    ],
    "acceptance_oracles_explicitly_containing_BLOCKED_count": sum(
        1 for row in ac_rows if re.search(r"\bBLOCKED\b", row[-1])
    ),
    "state_transition_rows": len(transitions),
    "awaiting_approval_state_present": "AWAITING_APPROVAL" in text,
    "explicit_provider_error_or_timeout_exit_from_INFERENCE_EXECUTING": any(
        fr == "INFERENCE_EXECUTING"
        and re.search(r"error|timeout|5xx|failure|no response", trig, re.I)
        for fr, to, trig, prop in transitions
    ),
    "zero_effect_direct_completion_path_from_PROPOSAL_ADMITTED": any(
        fr == "PROPOSAL_ADMITTED" and "COMPLETION_EVALUATION" in to
        for fr, to, trig, prop in transitions
    ),
    "blocked_resume_rows": [
        row for row in transitions if row[0] == "BLOCKED" and row[1] != "BLOCKED"
    ],
    "concurrency_term_occurrences": len(re.findall(r"concurr", text, re.I)),
}

print(json.dumps(result, indent=2))

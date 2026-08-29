#!/usr/bin/env python3
"""Gate and checklist runner for the canonical engineering rule inventory.

Two outputs, deliberately separated:

  GATES      Rules a machine can decide exactly. These are authoritative
             (AE-005) — do not re-argue a gate result by reading the code.
  CHECKLIST  Rules that need judgment. The script only decides which ones are
             in scope; a human or an external verifier decides compliance
             (AE-002). Answers must carry file:line evidence.

Usage:
    python check.py <paths...> [--changed] [--profile tdd,xp] [--json]

Exit codes: 0 = no blocking gate failures, 1 = blocking failures, 2 = bad usage.
"""

from __future__ import annotations

import argparse
import ast
import fnmatch
import json
import os
import re
import subprocess
import sys
from collections import Counter
from dataclasses import dataclass, field, asdict

PY_EXT = {".py"}
TS_EXT = {".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"}
SKIP_DIRS = {
    ".git", "node_modules", "__pycache__", ".venv", "venv", "dist", "build",
    ".next", ".mypy_cache", ".pytest_cache", "coverage",
}
AGENT_HINT = re.compile(
    r"\b(subagent|orchestrat|agent_loop|retry_loop|repair_loop|harness|tool_call|fan_?out)\b",
    re.I,
)

BLOCKING = "blocking"
REVIEW = "review"


@dataclass
class Finding:
    rule: str
    severity: str
    path: str
    line: int
    message: str


@dataclass
class Report:
    findings: list = field(default_factory=list)
    checklist: list = field(default_factory=list)
    files_scanned: int = 0
    scope: list = field(default_factory=list)
    pre_existing_suppressed: int = 0


def is_test_file(path: str) -> bool:
    base = os.path.basename(path).lower()
    return (
        base.startswith("test_")
        or base.endswith("_test.py")
        or ".test." in base
        or ".spec." in base
        or any(f"{os.sep}{d}{os.sep}" in path for d in ("test", "tests", "__tests__", "spec", "specs"))
        or path.startswith(("test/", "tests/", "spec/"))
    )


def collect_paths(inputs: list[str], changed: bool, base: str | None = None) -> list[str]:
    if changed:
        ref = base or "HEAD"
        try:
            out = subprocess.run(
                ["git", "diff", "--name-only", ref],
                capture_output=True, text=True, check=True,
            ).stdout
        except (subprocess.CalledProcessError, FileNotFoundError) as exc:
            raise SystemExit(f"--changed requires a git repository: {exc}")
        inputs = [p for p in out.splitlines() if p.strip()] + inputs

    files: list[str] = []
    for item in inputs:
        if os.path.isfile(item):
            files.append(item)
        elif os.path.isdir(item):
            for root, dirs, names in os.walk(item):
                dirs[:] = [d for d in dirs if d not in SKIP_DIRS]
                files.extend(os.path.join(root, n) for n in names)
    keep = PY_EXT | TS_EXT
    return sorted({f for f in files if os.path.splitext(f)[1] in keep and os.path.exists(f)})


# --------------------------------------------------------------------------
# Python gates
# --------------------------------------------------------------------------

ASSERTING_CALLS = re.compile(r"\b(assert\w*|raises|approx|fail|pytest\.warns)\b")
PY_NONDETERMINISM = [
    (re.compile(r"\bdatetime\.now\(|\bdate\.today\(|\btime\.time\("), "wall-clock time"),
    (re.compile(r"\brandom\.\w+\("), "randomness"),
    (re.compile(r"\b(requests|httpx)\.(get|post|put|delete|patch|head|options|stream|request)\(|"
                 r"\burlopen\(|\.(get|post|put|delete|patch)\(\s*[\"'`]https?://"), "network"),
    (re.compile(r"\bsocket\.(socket|create_connection)\("), "live socket"),
]
PY_SKIP = re.compile(r"@(pytest\.mark\.(skip|xfail)(?!if)\b|unittest\.skip\b)|pytest\.skip\(")
LOCAL_HOST = re.compile(r"localhost|127\.0\.0\.1|0\.0\.0\.0|::1|example\.com|httpbin\(")
MOCKING = re.compile(
    r"\b(responses|httpretty|requests_mock|respx|vcr|betamax|monkeypatch|unittest\.mock|"
    r"nock|msw|jest\.mock|sinon|fetch-mock|mock-adapter|MockAdapter|MockTransport|customFetch|fetchStub|createHttpTestServer|createTestServer|fetchCallCount|globalThis\.fetch\s*=|ASGITransport|WSGITransport|TestClient|httpserver|aioresponses)\b", re.I)
BUDGET_HINT = re.compile(
    r"\b(max_\w+|\w*attempts?\w*|\w*retr(y|ies)\w*|budget|\w*limit\w*|deadline|remaining)\b",
    re.I,
)
CLOCK_CALL = re.compile(r"\b(monotonic|perf_counter|time|now|utcnow)\b")


def _is_bounded(loop: ast.While, src: str) -> bool:
    """Decide structurally whether a `while True:` loop has a bound on its
    failure path. Name hints are a fallback, not the primary signal — a loop
    bounded by a variable called `n` should not be reported."""
    incremented = {
        target.id
        for node in ast.walk(loop)
        if isinstance(node, ast.AugAssign) and isinstance(node.target, ast.Name)
        for target in [node.target]
    }
    compared: set[str] = set()
    clock_compare = False
    for node in ast.walk(loop):
        if not isinstance(node, ast.Compare):
            continue
        for side in [node.left, *node.comparators]:
            if isinstance(side, ast.Name):
                compared.add(side.id)
            if isinstance(side, ast.Call):
                func = side.func
                name = getattr(func, "attr", None) or getattr(func, "id", "")
                if CLOCK_CALL.search(name or ""):
                    clock_compare = True
    if incremented & compared:
        return True  # counter incremented and tested — a real attempt cap
    if clock_compare:
        return True  # compared against a clock — a deadline
    return any(BUDGET_HINT.search(name) for name in compared)


def check_python(path: str, src: str, findings: list[Finding], agentic: bool = False) -> None:
    testish = is_test_file(path)
    mocked = bool(MOCKING.search(src))
    try:
        tree = ast.parse(src)
    except SyntaxError as exc:
        findings.append(Finding("PARSE", REVIEW, path, exc.lineno or 0,
                                f"could not parse: {exc.msg}"))
        return

    for node in ast.walk(tree):
        # SC-008 / PY-001 — silent or ambiguous failure
        if isinstance(node, ast.ExceptHandler):
            reraises = any(isinstance(n, ast.Raise) for n in ast.walk(node))
            if node.type is None and not reraises:
                findings.append(Finding("SC-008", BLOCKING, path, node.lineno,
                                        "bare `except:` catches everything, including control flow"))
            body_is_noop = all(
                isinstance(s, ast.Pass)
                or (isinstance(s, ast.Expr) and isinstance(s.value, ast.Constant)
                    and s.value.value is Ellipsis)
                for s in node.body
            )
            if body_is_noop:
                findings.append(Finding("SC-008", BLOCKING, path, node.lineno,
                                        "exception swallowed with no handling and no context preserved"))

        if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
            returns = [n for n in ast.walk(node) if isinstance(n, ast.Return)]
            none_returns = [
                r for r in returns
                if r.value is None or (isinstance(r.value, ast.Constant) and r.value.value is None)
            ]
            value_returns = [
                r for r in returns
                if r.value is not None
                and not (isinstance(r.value, ast.Constant) and r.value.value is None)
            ]
            if none_returns and value_returns:
                findings.append(Finding("PY-001", REVIEW, path, none_returns[0].lineno,
                                        f"`{node.name}` returns both None and a value — if the None "
                                        f"path is failure, raise instead of returning a sentinel"))

            # RT-011 — assertion-free test
            if testish and node.name.startswith("test"):
                body_src = ast.get_source_segment(src, node) or ""
                has_assert = any(isinstance(n, ast.Assert) for n in ast.walk(node))
                if not has_assert and not ASSERTING_CALLS.search(body_src):
                    calls = any(isinstance(n, ast.Call) for n in ast.walk(node))
                    findings.append(Finding(
                        "RT-011", REVIEW if calls else BLOCKING, path, node.lineno,
                        f"`{node.name}` asserts nothing — it passes unless something raises"
                        if calls else
                        f"`{node.name}` has no oracle — it cannot fail when the contract is violated"))

        # AE-006 — unbounded loop
        if isinstance(node, ast.While):
            cond_is_true = isinstance(node.test, ast.Constant) and node.test.value is True
            has_exit = any(isinstance(n, (ast.Break, ast.Return, ast.Raise)) for n in ast.walk(node))
            if cond_is_true and not has_exit:
                findings.append(Finding("AE-006", BLOCKING, path, node.lineno,
                                        "`while True:` with no break, return, or raise — no stop condition"))
            elif cond_is_true and agentic and not _is_bounded(node, src):
                findings.append(Finding("AE-006", BLOCKING, path, node.lineno,
                                        "`while True:` exits only on success — no counter, deadline, or "
                                        "budget bounds the failure path"))

    for i, line in enumerate(src.splitlines(), 1):
        if testish:
            for pattern, label in PY_NONDETERMINISM:
                if not pattern.search(line):
                    continue
                if label == "network" and (mocked or LOCAL_HOST.search(line)):
                    continue  # a controlled local fixture is not uncontrolled network
                severity = REVIEW if label == "network" else BLOCKING
                findings.append(Finding("RT-007", severity, path, i,
                                        f"{label} inside a deterministic gate"))
            if PY_SKIP.search(line):
                findings.append(Finding("RT-006", REVIEW, path, i,
                                        "verification skipped — confirm the requirement or the test "
                                        "was proven wrong, not that it was inconvenient"))


# --------------------------------------------------------------------------
# TypeScript / JavaScript gates
# --------------------------------------------------------------------------

TS_ANY = re.compile(r":\s*any\b|<any>|\bArray<any>|\bany\[\]")
TS_ASSERT = re.compile(r"\bas\s+any\b|\bas\s+unknown\s+as\b|@ts-ignore|@ts-expect-error")
_QUOTED = re.compile(r"""(?:"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)""")
TS_EMPTY_CATCH = re.compile(r"catch\s*(\([^)]*\))?\s*\{\s*\}|\.catch\s*\(\s*\(\s*\w*\s*\)\s*=>\s*\{\s*\}\s*\)")
TS_ONLY_SKIP = re.compile(r"\b(describe|it|test)\.(only|skip)\s*\(|\bx(it|describe)\s*\(")
TS_NONDETERMINISM = [
    (re.compile(r"\bDate\.now\(|\bnew Date\(\s*\)"), "wall-clock time"),
    (re.compile(r"\bMath\.random\("), "randomness"),
    (re.compile(r"(?<!mock)\bfetch\s*\(|\baxios\.(get|post|put|delete)\("), "network"),
]
TS_TEST_BLOCK = re.compile(r"\b(it|test)\s*\(\s*[`'\"]")
TS_ORACLE = re.compile(
    r"\bexpect\w*\s*\(|\bassert\w*[.(]|\.should\b|\bshould\s*\(|\.rejects\b|\.resolves\b|"
    r"\.throws?\b|\bchai\b|\bexpectTypeOf\b|\bverify\s*\(|\bdone\s*\(\s*\w|"
    r"\bt\.(is|not|true|false|deepEqual|like|throws\w*|notThrows\w*|regex|pass|fail|snapshot)\s*\(|"
    r"\bassert\b|\btap\.\w+\("
)


def _block_after(src: str, start: int) -> str:
    """Return the brace-delimited block that follows `start`. Heuristic: does not
    account for braces inside strings or comments."""
    open_idx = src.find("{", start)
    if open_idx == -1:
        return ""
    depth = 0
    for i in range(open_idx, len(src)):
        if src[i] == "{":
            depth += 1
        elif src[i] == "}":
            depth -= 1
            if depth == 0:
                return src[open_idx:i + 1]
    return src[open_idx:]


TYPE_TEST = re.compile(r"expectTypeOf|toEqualTypeOf|assertType|\.test-d\.")


def _inside_string(line: str, match: re.Match) -> bool:
    for m in _QUOTED.finditer(line):
        if m.start() < match.start() and match.end() <= m.end():
            return True
    return False


def check_ts(path: str, src: str, findings: list[Finding]) -> None:
    testish = is_test_file(path)
    mocked = bool(MOCKING.search(src))
    for i, line in enumerate(src.splitlines(), 1):
        stripped = line.strip()
        if stripped.startswith("//") or stripped.startswith("*"):
            continue
        if TYPE_TEST.search(line) or TYPE_TEST.search(path):
            continue  # asserting a type IS any is the point of the test
        m = TS_ANY.search(line)
        if m and not _inside_string(line, m):
            findings.append(Finding("TS-001", BLOCKING, path, i,
                                    "`any` bypasses uncertainty — use `unknown` and narrow"))
        m = TS_ASSERT.search(line)
        if m and not _inside_string(line, m):
            findings.append(Finding("TS-003", BLOCKING, path, i,
                                    "assertion manufactures an unproven fact — validate at the boundary"))
        if TS_EMPTY_CATCH.search(line):
            findings.append(Finding("SC-008", BLOCKING, path, i,
                                    "empty catch discards failure context"))
        if testish:
            for pattern, label in TS_NONDETERMINISM:
                if not pattern.search(line):
                    continue
                if label == "network" and (mocked or LOCAL_HOST.search(line)):
                    continue
                severity = REVIEW if label == "network" else BLOCKING
                findings.append(Finding("RT-007", severity, path, i,
                                        f"{label} inside a deterministic gate"))
            if TS_ONLY_SKIP.search(line):
                findings.append(Finding("RT-006", REVIEW, path, i,
                                        "`.only`/`.skip` narrows or disables verification"))

    if testish:
        for match in TS_TEST_BLOCK.finditer(src):
            block = _block_after(src, match.end())
            if block and not TS_ORACLE.search(block):
                line_no = src[:match.start()].count("\n") + 1
                calls = "(" in block.replace("() =>", "")
                findings.append(Finding(
                    "RT-011", REVIEW if calls else BLOCKING, path, line_no,
                    "test block asserts nothing — it passes unless something throws"
                    if calls else "test block has no oracle — it cannot fail"))


# --------------------------------------------------------------------------
# Cross-language gates
# --------------------------------------------------------------------------

LITERAL = re.compile(r"""(['"])([^'"\n]{8,})\1""")


def check_duplication(path: str, src: str, findings: list[Finding]) -> None:
    if is_test_file(path):
        return  # fixtures repeat values by design; that is not knowledge duplication
    counts = Counter(m.group(2) for m in LITERAL.finditer(src))
    for value, n in counts.items():
        if n >= 3 and not value.startswith(("http://", "https://")):
            line_no = next(
                (i for i, line in enumerate(src.splitlines(), 1) if value in line), 0
            )
            findings.append(Finding("SC-006", REVIEW, path, line_no,
                                    f"literal repeated {n}x — these can drift independently"))


# --------------------------------------------------------------------------
# Checklist
# --------------------------------------------------------------------------

# Each item names the signal that puts it in scope. In `auto` mode only items
# whose signal fired are shown, so a two-line change does not arrive with 28
# questions attached. `full` shows everything; `off` runs gates only.

CHECKLIST_RULES = [
    ("REQ-001", "always", "Every behavior change traces to an authorized task, not to your own idea of useful."),
    ("REQ-005", "new_symbol", "Nothing added is gold-plating or an unrequested implementation constraint."),
    ("REQ-006", "always", "Unresolved information is marked unresolved rather than guessed."),
    ("REQ-007", "test", "Traceability runs from source through implementation to evidence."),
    ("SC-001", "always", "The authorized contract is satisfied before any stylistic improvement."),
    ("SC-002", "new_symbol", "This is the smallest sufficient change — no speculative abstraction or dependency."),
    ("SC-003", "exported", "No design decision leaks across a module boundary."),
    ("SC-004", "new_symbol", "Names are intention-revealing, and one concept keeps one name."),
    ("SC-005", "new_symbol", "Each unit sits at one coherent level of abstraction."),
    ("SC-007", "comment", "Comments explain non-obvious intent, not what the code plainly says."),
    ("SC-009", "ordering", "The ordering dependency is enforceable through the interface, not undocumented."),
    ("SC-010", "boundary", "Data is validated where it crosses a trust, process, or persistence boundary."),
    ("SC-011", "invariant", "The invariant is executable at the nearest authoritative boundary."),
    ("RT-001", "intent:refactor", "If observable behavior changed, this is not being called a refactoring."),
    ("RT-002", "intent:refactor", "Behavior change and structural cleanup are separable by a reviewer."),
    ("RT-004", "test", "Changed behavior is verified against the observable contract, not internals."),
    ("RT-005", "intent:fix", "Regression evidence fails on the faulty baseline and passes after the fix."),
    ("RT-008", "test", "Boundaries and failure partitions are exercised, not just the normal path."),
    ("RT-009", "test", "Adequacy rests on behavior-specific evidence, not a coverage number."),
    ("RT-010", "boundary", "The real boundary contract is verified, not each side in isolation."),
    ("AD-004", "exported", "Compatibility is preserved or an explicit migration exists."),
    ("PY-002", "python", "Contractual exceptions are documented; type facts are not duplicated in docstrings."),
    ("TS-002", "typescript", "Declared types are truthful — no type claims facts the program has not established."),
    ("AE-001", "agentic", "Repository evidence was inspected — not model memory or an isolated snippet."),
    ("AE-003", "agentic", "Authorized scope and unrelated work are preserved; destructive ops have explicit authority."),
    ("AE-004", "agentic", "Each dependent step checked the actual tool result before proceeding."),
    ("AE-006", "agentic", "Every retry, repair, and fan-out path has a stop condition and a finite budget."),
    ("AE-007", "agentic", "Each agent unit has a defined task, scope, output contract, and termination condition."),
    ("AE-008", "agentic", "The system is evaluated as a versioned configuration and re-evaluated after changes."),
    ("TDD-001", "profile:tdd", "A failing test preceded the production change; refactoring stayed green."),
    ("XP-001", "profile:xp", "The increment is continuously integrable and integration was verified."),
]

SIGNAL_LABEL = {
    "always": "always applies",
    "new_symbol": "new or changed function/class",
    "exported": "public symbol in scope",
    "test": "test artifacts in scope",
    "boundary": "serialization, I/O, or service boundary in scope",
    "comment": "comments or docstrings in scope",
    "ordering": "ordering or shared-state dependency in scope",
    "invariant": "runtime invariant asserted in non-test code",
    "python": "Python in scope",
    "typescript": "TypeScript in scope",
    "agentic": "agentic artifacts detected",
}

SIGNAL_PATTERNS = {
    "new_symbol": re.compile(r"^\s*(def |class |async def |export (default )?(function|class|const)|function )"),
    "exported": re.compile(r"^(export |public |def [a-zA-Z]|class [A-Z])"),
    "boundary": re.compile(
        r"json\.(loads|dumps)|\.json\(|\bopen\(|requests\.|httpx|\bfetch\(|socket\.|pickle|"
        r"yaml\.(safe_)?load|\.execute\(|SELECT |INSERT |urlopen|boto3|redis|kafka",
        re.I,
    ),
    "comment": re.compile(r'^\s*(#|//|/\*|\*|"""|\x27\x27\x27)'),
    "ordering": re.compile(
        r"\bglobal \b|\bnonlocal \b|threading\.|asyncio\.|\bLock\(|\bsleep\(|"
        r"\b(must_be_called|setup|teardown|_state\b|_initialized\b)",
    ),
    "invariant": re.compile(r"^\s*assert |\braise (ValueError|AssertionError|InvariantError)"),
}


def detect_signals(files: list[str], sources: dict, changed_lines: dict, agentic: bool,
                   profiles: set, intent: str) -> set:
    """Return the signal set. When a changed-line map is available, judge scope
    from the added lines only — an untouched 3000-line file should not pull the
    whole checklist into a two-line review."""
    signals = {"always"}
    for path in files:
        ext = os.path.splitext(path)[1]
        signals.add("python" if ext in PY_EXT else "typescript")
        if is_test_file(path):
            signals.add("test")
        entry = changed_lines.get(path) or next(
            (v for k, v in changed_lines.items() if path.endswith(k)), None)
        lines = entry["text"] if entry else None
        if lines is None:
            lines = sources.get(path, "").splitlines()
        for line in lines:
            for name, pattern in SIGNAL_PATTERNS.items():
                if name == "invariant" and is_test_file(path):
                    continue
                if pattern.search(line):
                    signals.add(name)
    if agentic:
        signals.add("agentic")
    for profile in profiles:
        signals.add(f"profile:{profile}")
    if intent != "unknown":
        signals.add(f"intent:{intent}")
    return signals


def build_checklist(signals: set, mode: str) -> list:
    if mode == "off":
        return []
    items = []
    for rule, signal, text in CHECKLIST_RULES:
        in_scope = signal in signals
        if mode == "auto" and not in_scope:
            continue
        if signal.startswith(("profile:", "intent:")) and not in_scope:
            continue
        items.append({
            "rule": rule,
            "check": text,
            "signal": signal,
            "why_in_scope": SIGNAL_LABEL.get(signal, signal.replace(":", " profile: ")),
            "in_scope": in_scope,
        })
    return items


def changed_line_map(paths: list[str], base: str | None = None) -> dict:
    """Map each file to the lines it adds versus a base revision. Empty when not in a repo."""
    ref = base or "HEAD"
    try:
        diff = subprocess.run(
            ["git", "diff", "-U0", ref, "--", *paths] if paths else ["git", "diff", "-U0", ref],
            capture_output=True, text=True, check=True,
        ).stdout
    except (subprocess.CalledProcessError, FileNotFoundError):
        return {}
    added: dict = {}
    current, lineno = None, 0
    for line in diff.splitlines():
        if line.startswith("+++ b/"):
            current = line[6:]
            added.setdefault(current, {"text": [], "lines": set()})
        elif line.startswith("@@") and current:
            match = re.search(r"\+(\d+)", line)
            lineno = int(match.group(1)) if match else 0
        elif line.startswith("+") and not line.startswith("+++") and current:
            added[current]["text"].append(line[1:])
            added[current]["lines"].add(lineno)
            lineno += 1
        elif not line.startswith("-") and current:
            lineno += 1
    return added


def scope_to_change(findings: list, changed: dict, window: int = 2) -> tuple:
    """Keep only findings that land on or beside a changed line. Reviewing a
    two-line diff should not resurface every pre-existing issue in the file."""
    if not changed:
        return findings, 0
    kept, dropped = [], 0
    for finding in findings:
        lines = None
        for path, data in changed.items():
            if finding.path.endswith(path):
                lines = data["lines"]
                break
        if lines is None or any(abs(finding.line - n) <= window for n in lines):
            kept.append(finding)
        else:
            dropped += 1
    return kept, dropped


# --------------------------------------------------------------------------

def render(report: Report) -> str:
    lines: list[str] = []
    blocking = [f for f in report.findings if f.severity == BLOCKING]
    review = [f for f in report.findings if f.severity == REVIEW]

    header = (f"GATES — {report.files_scanned} file(s), "
              f"{len(blocking)} blocking, {len(review)} to review")
    if report.pre_existing_suppressed:
        header += f" ({report.pre_existing_suppressed} pre-existing, outside the change)"
    lines.append(header)
    lines.append("")
    if not report.findings:
        lines.append("  no mechanical violations found")
    for finding in sorted(report.findings, key=lambda f: (f.severity != BLOCKING, f.path, f.line)):
        tag = "FAIL" if finding.severity == BLOCKING else "REVIEW"
        lines.append(f"  [{tag}] {finding.rule}  {finding.path}:{finding.line}")
        lines.append(f"         {finding.message}")

    if not report.checklist:
        lines.append("")
        lines.append("CHECKLIST — suppressed (--checklist off)")
    else:
        lines.append("")
        lines.append(f"CHECKLIST — {len(report.checklist)} rule(s) in scope "
                     f"({', '.join(report.scope)})")
        lines.append("  Answer each with file:line evidence. The proposer does not")
        lines.append("  accept its own answers (AE-002).")
        lines.append("")
        for item in report.checklist:
            mark = " " if item["in_scope"] else "-"
            lines.append(f"  [{mark}] {item['rule']}  {item['check']}")
            if not item["in_scope"]:
                lines.append(f"         (not triggered: {item['why_in_scope']})")
    lines.append("")
    lines.append("Gates passing means the mechanical checks found nothing. It is not")
    lines.append("proof of correctness and does not convert to a score (RT-009).")
    return "\n".join(lines)


def main(argv: list[str]) -> int:
    parser = argparse.ArgumentParser(description="Run engineering-rule gates and emit the checklist.")
    parser.add_argument("paths", nargs="*", help="files or directories to scan")
    parser.add_argument("--changed", action="store_true", help="also scan files changed vs a base revision (default HEAD; set with --base)")
    parser.add_argument("--base", default=None, help="base revision to diff against when using --changed (e.g. origin/main)")
    parser.add_argument("--profile", default="", help="comma-separated active profiles: tdd,xp")
    parser.add_argument("--intent", default="unknown", choices=["unknown", "feature", "fix", "refactor"],
                        help="what the change is for; scopes the intent-dependent rules")
    parser.add_argument("--checklist", default="auto", choices=["auto", "full", "off"],
                        help="auto shows only triggered rules (default); full shows all; off runs gates only")
    parser.add_argument("--exclude", action="append", default=[],
                        help="glob of paths to skip; repeatable (e.g. --exclude '*/vendor/*')")
    parser.add_argument("--json", action="store_true", dest="as_json")
    args = parser.parse_args(argv)

    if not args.paths and not args.changed:
        parser.print_usage()
        return 2

    files = collect_paths(args.paths, args.changed, args.base)
    if args.exclude:
        files = [f for f in files if not any(fnmatch.fnmatch(f, g) for g in args.exclude)]
    if not files:
        print("no Python or TypeScript files matched", file=sys.stderr)
        return 2

    report = Report(files_scanned=len(files))
    sources: dict = {}
    agentic = False
    for path in files:
        try:
            src = open(path, encoding="utf-8", errors="replace").read()
        except OSError as exc:
            report.findings.append(Finding("IO", REVIEW, path, 0, f"unreadable: {exc}"))
            continue
        sources[path] = src
        agentic = agentic or bool(AGENT_HINT.search(src)) or bool(AGENT_HINT.search(path))
        ext = os.path.splitext(path)[1]
        if ext in PY_EXT:
            check_python(path, src, report.findings, agentic=bool(AGENT_HINT.search(src) or AGENT_HINT.search(path)))
        else:
            check_ts(path, src, report.findings)
        check_duplication(path, src, report.findings)

    profiles = {p.strip().lower() for p in args.profile.split(",") if p.strip()}
    changed_lines = changed_line_map(files, args.base) if args.changed else {}
    if changed_lines:
        report.findings, suppressed = scope_to_change(report.findings, changed_lines)
        report.pre_existing_suppressed = suppressed
    signals = detect_signals(files, sources, changed_lines, agentic, profiles, args.intent)
    report.checklist = build_checklist(signals, args.checklist)
    report.scope = sorted(
        {"python" for f in files if os.path.splitext(f)[1] in PY_EXT}
        | {"typescript" for f in files if os.path.splitext(f)[1] in TS_EXT}
        | ({"agentic"} if agentic else set())
        | {p.upper() for p in profiles}
        | ({f"intent={args.intent}"} if args.intent != "unknown" else set())
        | ({"changed-lines only"} if changed_lines else set())
    )

    if args.as_json:
        payload = asdict(report)
        payload["findings"] = [asdict(f) for f in report.findings]
        print(json.dumps(payload, indent=2))
    else:
        print(render(report))

    return 1 if any(f.severity == BLOCKING for f in report.findings) else 0


if __name__ == "__main__":
    try:
        sys.exit(main(sys.argv[1:]))
    except BrokenPipeError:
        os._exit(0)  # piping into head is normal usage, not a failure

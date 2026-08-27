import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();

function read(path: string) {
  return readFileSync(resolve(root, path), "utf8");
}

describe("trusted PR verification authority", () => {
  it("executes the required gates from the trusted base checkout", () => {
    const workflow = read(".github/workflows/trusted-pr-verification.yml");
    const verifier = read(".github/trusted/verify-candidate.sh");

    expect(workflow).toContain("pull_request_target:");
    expect(workflow).toContain("ref: ${{ github.event.pull_request.base.sha }}");
    expect(workflow).toContain("path: trusted");
    expect(workflow).toContain("ref: ${{ github.event.pull_request.head.sha }}");
    expect(workflow).toContain("path: candidate");
    expect(workflow).toContain("persist-credentials: false");
    expect(workflow).toContain("bash trusted/.github/trusted/verify-candidate.sh candidate");

    expect(verifier).not.toMatch(/candidate\/scripts\/verify-production\.sh|npm run verify/);
    expect(verifier).toContain("npm ci --ignore-scripts");
    expect(verifier).toContain("scan-secrets.sh\" --candidate");
    expect(verifier).toContain("git -C \"$candidate_root\" diff --check");
    expect(verifier).toContain("refs/pull/$PR_NUMBER/merge");
    expect(verifier).toContain("$merge_sha^1");
    expect(verifier).toContain("$merge_sha^2");
    expect(verifier).toContain("$merge_sha^{tree}");
    expect(verifier).toContain("$EXPECTED_HEAD_SHA^{tree}");
  });

  it("does not execute gate binaries installed from the candidate dependency graph", () => {
    const verifier = read(".github/trusted/verify-candidate.sh");

    expect(verifier).toContain('cd "$trusted_root"');
    expect(verifier).toContain('run_candidate_gate "$trusted_root/node_modules/.bin/eslint" .');
    expect(verifier).toContain('run_candidate_gate "$trusted_root/node_modules/.bin/react-router" typegen');
    expect(verifier).toContain('run_candidate_gate "$trusted_root/node_modules/.bin/tsc" --noEmit');
    expect(verifier).toContain('run_candidate_gate "$trusted_root/node_modules/.bin/vitest" run');
    expect(verifier).toContain('run_candidate_gate "$trusted_root/node_modules/.bin/react-router" build');
    expect(verifier).toContain('run_as_candidate "$trusted_root/node_modules/.bin/react-router" dev');
    expect(verifier).not.toContain("./node_modules/.bin/");
  });

  it("isolates candidate-loaded code from the trusted checkout", () => {
    const workflow = read(".github/workflows/trusted-pr-verification.yml");
    const verifier = read(".github/trusted/verify-candidate.sh");

    expect(workflow).toContain("CANDIDATE_USER: btm-candidate");
    expect(workflow).toContain("sudo useradd --create-home --shell /bin/bash btm-candidate");
    expect(workflow).toContain("sudo chown -R btm-candidate:btm-candidate candidate");
    expect(verifier).toContain("run_as_candidate()");
    expect(verifier).toContain("run_candidate_gate()");
    expect(verifier).toContain("env -i");
    expect(verifier).toContain('test ! -w "$trusted_root"');
    expect(verifier).toContain('test ! -w "$trusted_root/node_modules"');
    expect(verifier).toContain('sudo pkill -KILL -u "$CANDIDATE_USER"');
    expect(verifier).toContain('run_candidate_gate "$trusted_root/node_modules/.bin/eslint" .');
    expect(verifier).toContain('run_candidate_gate "$trusted_root/node_modules/.bin/vitest" run');
    expect(verifier).toContain('run_as_candidate "$trusted_root/node_modules/.bin/react-router" dev');
  });
});

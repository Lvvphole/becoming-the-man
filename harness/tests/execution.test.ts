import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { compilePolicy, type Grant } from "../src/capability.js";
import { createSandboxBackend } from "../src/eve-adapter.js";
import { bindSession, executeForSession, withExecutionSandbox, type SandboxPort } from "../src/supervisor.js";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const policy = () => compilePolicy({
  task_identity: "inc2-test",
  allowed_argv: [["printf", "ok"]],
  allowed_cwds: ["/workspace"],
  read_roots: ["/workspace"],
  write_roots: ["/workspace"],
  subprocess: "exact",
});
const grants: Grant[] = [
  { id: "read", kind: "read", path: "data.txt" },
  { id: "write", kind: "write", path: "data.txt" },
  { id: "run", kind: "run", argv: ["printf", "ok"], cwd: "/workspace" },
];

function fake(): SandboxPort & { runs: number } {
  return {
    id: "fake", runs: 0,
    async run() { this.runs += 1; return { exitCode: 0, stdout: "/workspace/data.txt\n", stderr: "" }; },
    async readTextFile() { return "ok"; },
    async writeTextFile() {},
  };
}

describe("INC-2 deterministic capability gate", () => {
  it("EC-01 denies an unknown grant before execution", async () => {
    const sandbox = fake();
    const unbind = bindSession(sandbox.id, policy(), grants);
    expect(await executeForSession(sandbox.id, sandbox, { capability_id: "missing" }))
      .toEqual({ kind: "deny", diagnostic: "CAPABILITY_NOT_GRANTED" });
    expect(sandbox.runs).toBe(0);
    unbind();
  });

  it("EC-04 and EC-06 deny subprocess-policy, argv/cwd, and git violations", async () => {
    const sandbox = fake();
    const cases: Array<[ReturnType<typeof policy>, Grant]> = [
      [compilePolicy({ ...policy(), subprocess: "deny" }), grants[2]],
      [policy(), { id: "bad-argv", kind: "run", argv: ["printf", "no"], cwd: "/workspace" }],
      [policy(), { id: "bad-cwd", kind: "run", argv: ["printf", "ok"], cwd: "/tmp" }],
      [policy(), { id: "git", kind: "run", argv: ["git", "status"], cwd: "/workspace" }],
    ];
    for (const [p, grant] of cases) {
      const unbind = bindSession(sandbox.id, p, [grant]);
      expect(await executeForSession(sandbox.id, sandbox, { capability_id: grant.id }))
        .toEqual({ kind: "deny", diagnostic: "CAPABILITY_NOT_GRANTED" });
      unbind();
    }
    expect(sandbox.runs).toBe(0);
  });

  it("freezes the compiled authority surface", () => {
    const p = policy();
    expect(Object.isFrozen(p)).toBe(true);
    expect(p.allowed_tools).toEqual(["execute"]);
    expect(p.network).toBe("deny");
    expect(p.secret_names).toEqual([]);
    expect(p.git).toBe("deny");
  });
});

describe("INC-2 Eve and physical Docker boundary", () => {
  it("EC-02 exposes only the authored execute tool", () => {
    const cli = join(root, "node_modules/eve/bin/eve.js");
    const raw = execFileSync(process.execPath, [cli, "info", "--json"], {
      cwd: root, encoding: "utf8", env: { ...process.env, EVE_TELEMETRY_DISABLED: "1" },
    });
    expect(JSON.parse(raw).tools).toEqual(["execute"]);
  });

  it("EC-03/05/07 plus positive controls hold in the locked sandbox", async () => {
    process.env.INC2_SUPERVISOR_SECRET = "host-only";
    await withExecutionSandbox(createSandboxBackend(), root, policy(), grants, async (sandbox) => {
      expect((await executeForSession(sandbox.id, sandbox, { capability_id: "write", content: "hello" })).kind).toBe("write");
      expect(await executeForSession(sandbox.id, sandbox, { capability_id: "read" }))
        .toEqual({ kind: "read", content: "hello" });
      expect(await executeForSession(sandbox.id, sandbox, { capability_id: "run" }))
        .toMatchObject({ kind: "run", exit_code: 0, stdout: "ok" });

      await sandbox.run({ command: "printf outside >/tmp/outside.txt && ln -s /tmp/outside.txt /workspace/link" });
      const unbind = bindSession(sandbox.id, policy(), [{ id: "escape", kind: "write", path: "link" }]);
      expect(await executeForSession(sandbox.id, sandbox, { capability_id: "escape", content: "changed" }))
        .toEqual({ kind: "deny", diagnostic: "CAPABILITY_NOT_GRANTED" });
      unbind();
      expect((await sandbox.run({ command: "cat /tmp/outside.txt" })).stdout).toBe("outside");

      expect((await sandbox.run({ command: "curl -fsS --max-time 3 https://example.com" })).exitCode).not.toBe(0);
      expect((await sandbox.run({ command: "env" })).stdout).not.toContain("INC2_SUPERVISOR_SECRET");
    });
    delete process.env.INC2_SUPERVISOR_SECRET;
  });

  it("EC-08 deletes run state and assigns a fresh sandbox identity", async () => {
    const backend = createSandboxBackend();
    let first = "";
    await withExecutionSandbox(backend, root, policy(), grants, async (sandbox) => {
      first = sandbox.id;
      await sandbox.writeTextFile({ path: "/workspace/sentinel", content: "A" });
    });
    await withExecutionSandbox(backend, root, policy(), grants, async (sandbox) => {
      expect(sandbox.id).not.toBe(first);
      expect((await sandbox.run({ command: "test ! -e /workspace/sentinel" })).exitCode).toBe(0);
    });
  });
});

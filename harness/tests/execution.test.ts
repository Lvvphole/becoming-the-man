import { execFileSync } from "node:child_process";
import { generateKeyPairSync, randomUUID } from "node:crypto";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import tool from "../agent/tools/execute.js";
import { compilePolicy, verifyAuthorization, type Grant } from "../src/capability.js";
import { createSandboxBackend } from "../src/eve-adapter.js";
import { executeAuthorized, issueAuthorization, type SandboxPort } from "../src/supervisor.js";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const keys = generateKeyPairSync("ed25519");
const privateKey = keys.privateKey.export({ type: "pkcs8", format: "pem" }).toString();
const publicKey = keys.publicKey.export({ type: "spki", format: "pem" }).toString();
const policy = (argv: readonly (readonly string[])[] = [["printf", "ok"]],
  cwds: readonly string[] = ["/workspace"], subprocess: "deny" | "exact" = "exact") =>
  compilePolicy({
    task_identity: "inc2-test", allowed_argv: argv, allowed_cwds: cwds,
    read_roots: ["/workspace"], write_roots: ["/workspace"], subprocess,
  });
const grants: Grant[] = [
  { id: "read", kind: "read", path: "data.txt" },
  { id: "write", kind: "write", path: "data.txt" },
  { id: "run", kind: "run", argv: ["printf", "ok"], cwd: "/workspace" },
];
const auth = (session: string, p = policy(), g: readonly Grant[] = grants) =>
  verifyAuthorization(issueAuthorization(privateKey, session, p, g), publicKey, session)!;

function fake(realpath = "/workspace"): SandboxPort & { commands: string[] } {
  let content = "ok";
  return {
    id: "fake", commands: [],
    async run({ command }) {
      this.commands.push(command);
      if (command.startsWith("realpath")) return { exitCode: 0, stdout: realpath + "\n", stderr: "" };
      return { exitCode: 0, stdout: command.includes("printf") ? "ok" : "", stderr: "" };
    },
    async readTextFile() { return content; },
    async writeTextFile({ content: next }) { content = next; },
  };
}

async function withPhysical<T>(run: (sandbox: SandboxPort) => Promise<T>): Promise<T> {
  const backend = createSandboxBackend();
  const handle = await backend.create({
    templateKey: null, sessionKey: `inc2-${randomUUID()}`, runtimeContext: { appRoot: root },
  });
  try { return await run(handle.session); } finally { await handle.delete(); }
}

describe("INC-2 deterministic capability gate", () => {
  it("EC-01 rejects tampering, cross-session replay, and unknown grants before sandbox access", async () => {
    const token = issueAuthorization(privateKey, "session-a", policy(), grants);
    expect(verifyAuthorization(token + "x", publicKey, "session-a")).toBeNull();
    expect(verifyAuthorization(token, publicKey, "session-b")).toBeNull();

    process.env.INC2_SUPERVISOR_PUBLIC_KEY = publicKey;
    let sandboxRequests = 0;
    const ctx = {
      session: { id: "session-a" },
      async getSandbox() { sandboxRequests += 1; return fake(); },
    };
    expect(await tool.execute({ capability_id: "missing", authorization: token }, ctx as never))
      .toEqual({ kind: "deny", diagnostic: "CAPABILITY_NOT_GRANTED" });
    expect(sandboxRequests).toBe(1);
    delete process.env.INC2_SUPERVISOR_PUBLIC_KEY;
  });

  it("wires an authorized Eve session to the hard gate", async () => {
    const token = issueAuthorization(privateKey, "session-a", policy(), grants);
    process.env.INC2_SUPERVISOR_PUBLIC_KEY = publicKey;
    const ctx = { session: { id: "session-a" }, async getSandbox() { return fake("/workspace"); } };
    expect(await tool.execute({ capability_id: "run", authorization: token }, ctx as never))
      .toMatchObject({ kind: "run", exit_code: 0, stdout: "ok" });
    delete process.env.INC2_SUPERVISOR_PUBLIC_KEY;
  });

  it("EC-04 denies subprocess, argv, and symlinked cwd; EC-06 reaches Git denial", async () => {
    const denied = fake();
    expect((await executeAuthorized(auth("s", policy(undefined, undefined, "deny")), denied,
      { capability_id: "run", authorization: "unused" })).kind).toBe("deny");

    const badArg: Grant = { id: "bad", kind: "run", argv: ["printf", "no"], cwd: "/workspace" };
    expect((await executeAuthorized(auth("s", policy(), [badArg]), denied,
      { capability_id: "bad", authorization: "unused" })).kind).toBe("deny");

    const symlink: Grant = { id: "cwd", kind: "run", argv: ["printf", "ok"], cwd: "/workspace/job" };
    const symlinkBox = fake("/tmp/job");
    expect((await executeAuthorized(auth("s", policy([["printf", "ok"]], ["/workspace/job"]), [symlink]),
      symlinkBox, { capability_id: "cwd", authorization: "unused" })).kind).toBe("deny");
    expect(symlinkBox.commands).toHaveLength(1);

    const git: Grant = { id: "git", kind: "run", argv: ["git", "status"], cwd: "/workspace" };
    expect((await executeAuthorized(auth("s", policy([["git", "status"]]), [git]), denied,
      { capability_id: "git", authorization: "unused" })).kind).toBe("deny");
    expect(denied.commands).toHaveLength(0);
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
    process.env.INC2_SUPERVISOR_PRIVATE_KEY = privateKey;
    process.env.INC2_SUPERVISOR_PUBLIC_KEY = publicKey;
    await withPhysical(async (sandbox) => {
      const verified = auth("physical");
      expect((await executeAuthorized(verified, sandbox,
        { capability_id: "write", authorization: "unused", content: "hello" })).kind).toBe("write");
      expect(await executeAuthorized(verified, sandbox, { capability_id: "read", authorization: "unused" }))
        .toEqual({ kind: "read", content: "hello" });
      expect(await executeAuthorized(verified, sandbox, { capability_id: "run", authorization: "unused" }))
        .toMatchObject({ kind: "run", exit_code: 0, stdout: "ok" });

      await sandbox.run({ command: "printf outside >/tmp/outside.txt && ln -s /tmp/outside.txt /workspace/link" });
      const escape = auth("physical", policy(), [{ id: "escape", kind: "write", path: "link" }]);
      expect(await executeAuthorized(escape, sandbox,
        { capability_id: "escape", authorization: "unused", content: "changed" }))
        .toEqual({ kind: "deny", diagnostic: "CAPABILITY_NOT_GRANTED" });
      expect((await sandbox.run({ command: "cat /tmp/outside.txt" })).stdout).toBe("outside");

      expect((await sandbox.run({ command: "curl -fsS --max-time 3 https://example.com" })).exitCode).not.toBe(0);
      const env = (await sandbox.run({ command: "env" })).stdout;
      expect(env).not.toContain("INC2_SUPERVISOR_PRIVATE_KEY");
      expect(env).not.toContain("INC2_SUPERVISOR_PUBLIC_KEY");
    });
    delete process.env.INC2_SUPERVISOR_PRIVATE_KEY;
    delete process.env.INC2_SUPERVISOR_PUBLIC_KEY;
  }, 30_000);

  it("EC-08 deletes physical run state between independent sandboxes", async () => {
    let first = "";
    await withPhysical(async (sandbox) => {
      first = sandbox.id;
      await sandbox.writeTextFile({ path: "/workspace/sentinel", content: "A" });
    });
    await withPhysical(async (sandbox) => {
      expect(sandbox.id).not.toBe(first);
      expect((await sandbox.run({ command: "test ! -e /workspace/sentinel" })).exitCode).toBe(0);
    });
  });
});

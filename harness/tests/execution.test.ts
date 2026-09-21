import { execFileSync } from "node:child_process";
import { generateKeyPairSync, randomUUID } from "node:crypto";
import { readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import tool from "../agent/tools/execute.js";
import { compilePolicy, verifyAuthorization, type Grant } from "../src/capability.js";
import { createSandboxBackend } from "../src/eve-adapter.js";
import { executeAuthorized, issueAuthorization, prepareExecutionSession, type SandboxPort } from "../src/supervisor.js";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const keys = generateKeyPairSync("ed25519");
const privateKey = keys.privateKey.export({ type: "pkcs8", format: "pem" }).toString();
const publicKey = keys.publicKey.export({ type: "spki", format: "pem" }).toString();
const policy = (argv: readonly (readonly string[])[] = [["printf", "ok"]],
  cwds: readonly string[] = ["/workspace"], subprocess: "deny" | "exact" = "exact") =>
  compilePolicy({ task_identity: "inc2-test", allowed_argv: argv, allowed_cwds: cwds,
    read_roots: ["/workspace"], write_roots: ["/workspace"], subprocess });
const grants: Grant[] = [{ id: "read", kind: "read", path: "data.txt" },
  { id: "write", kind: "write", path: "data.txt" },
  { id: "run", kind: "run", argv: ["printf", "ok"], cwd: "/workspace" }];
const auth = (session: string, p = policy(), g: readonly Grant[] = grants) =>
  verifyAuthorization(issueAuthorization(privateKey, session, p, g), publicKey, session)!;
function fake(realpath = "/workspace", executable = "/usr/bin/printf"): SandboxPort & { commands: string[] } {
  let content = "ok";
  return {
    id: "fake", commands: [],
    async run({ command }) {
      this.commands.push(command);
      if (command.includes("command -v")) return { exitCode: 0, stdout: executable + "\n", stderr: "" };
      return command.startsWith("realpath") ? { exitCode: 0, stdout: realpath + "\n", stderr: "" }
        : { exitCode: 0, stdout: command.includes("printf") ? "ok" : "", stderr: "" };
    },
    async readTextFile() { return content; },
    async writeTextFile({ content: next }) { content = next; },
  };
}
async function withPhysical<T>(run: (sandbox: SandboxPort) => Promise<T>): Promise<T> {
  const handle = await createSandboxBackend().create({
    templateKey: null, sessionKey: `inc2-${randomUUID()}`, runtimeContext: { appRoot: root },
  });
  try { return await run(handle.session); } finally { await handle.delete(); }
}
describe("INC-2 deterministic capability gate", () => {
  it("EC-01 binds authority to signature/session and denies unknown grants before sandbox access", async () => {
    const token = issueAuthorization(privateKey, "session-a", policy(), grants);
    for (const malformed of [token + "x", token + ".", token + "..anything"]) expect(verifyAuthorization(malformed, publicKey, "session-a")).toBeNull();
    expect(verifyAuthorization(token, publicKey, "session-b")).toBeNull();
    process.env.INC2_SUPERVISOR_PUBLIC_KEY = publicKey;
    let sandboxRequests = 0;
    const ctx = { session: { id: "session-a" }, async getSandbox() { sandboxRequests += 1; return fake(); } };
    expect(await tool.execute({ capability_id: "missing", authorization: token }, ctx as never))
      .toEqual({ kind: "deny", diagnostic: "CAPABILITY_NOT_GRANTED" });
    expect(sandboxRequests).toBe(0);
    delete process.env.INC2_SUPERVISOR_PUBLIC_KEY;
  });
  it("retires scoped Eve sessions on success and failure", async () => {
    const originalFetch = globalThis.fetch; let creates = 0, resets = 0;
    globalThis.fetch = async (input) => {
      if ((input instanceof Request ? input.url : String(input)).endsWith("/reset")) {
        resets += 1; return new Response(JSON.stringify({ ok: true, previousSessionId: `session-${creates}`, status: "reset" }));
      }
      creates += 1; return new Response(JSON.stringify({ sessionId: `session-${creates}` }));
    };
    try {
      expect(await prepareExecutionSession("http://eve.test", privateKey, policy(), grants, async ({ session_id }) => session_id)).toBe("session-1");
      await expect(prepareExecutionSession("http://eve.test", privateKey, policy(), grants, async () => { throw new Error("boom"); })).rejects.toThrow("boom");
      expect(resets).toBe(2);
    } finally { globalThis.fetch = originalFetch; }
  });
  it("rejects sibling workspace policy paths", () =>
    expect(() => policy(undefined, ["/workspace-secrets"])).toThrow("CAPABILITY_POLICY_INVALID"));
  it("denies Git reached through an allowed executable alias", async () => {
    const alias: Grant = { id: "alias", kind: "run", argv: ["/workspace/bin/vcs", "status"], cwd: "/workspace" };
    expect((await executeAuthorized(auth("s", policy([alias.argv]), [alias]), fake("/workspace", "/usr/bin/git"),
      { capability_id: "alias", authorization: "unused" })).kind).toBe("deny");
  });
  it("EC-04 denies subprocess/argv/symlinked cwd and EC-06 reaches Git denial", async () => {
    const box = fake();
    const cases: Array<[ReturnType<typeof policy>, Grant]> = [
      [policy(undefined, undefined, "deny"), grants[2]],
      [policy(), { id: "bad", kind: "run", argv: ["printf", "no"], cwd: "/workspace" }],
      [policy([["git", "status"]]), { id: "git", kind: "run", argv: ["git", "status"], cwd: "/workspace" }],
    ];
    for (const [p, grant] of cases) {
      expect((await executeAuthorized(auth("s", p, [grant]), box,
        { capability_id: grant.id, authorization: "unused" })).kind).toBe("deny");
    }
    expect(box.commands).toHaveLength(0);
    const cwd: Grant = { id: "cwd", kind: "run", argv: ["printf", "ok"], cwd: "/workspace/job" };
    const symlink = fake("/tmp/job");
    expect((await executeAuthorized(auth("s", policy([["printf", "ok"]], ["/workspace/job"]), [cwd]),
      symlink, { capability_id: "cwd", authorization: "unused" })).kind).toBe("deny");
    expect(symlink.commands).toHaveLength(2);
  });
  it("freezes the compiled authority surface", () => {
    const p = policy();
    expect(Object.isFrozen(p)).toBe(true);
    expect([p.allowed_tools, p.network, p.secret_names, p.git]).toEqual([["execute"], "deny", [], "deny"]);
  });
});
describe("INC-2 Eve and physical Docker boundary", () => {
  it("EC-02 exposes only execute", () => {
    const cli = join(root, "node_modules/eve/bin/eve.js");
    const raw = execFileSync(process.execPath, [cli, "info", "--json"], {
      cwd: root, encoding: "utf8", env: { ...process.env, EVE_TELEMETRY_DISABLED: "1" },
    });
    const info = JSON.parse(raw);
    expect(info.tools).toEqual(["execute"]);
    expect(JSON.parse(readFileSync(info.artifacts.compiledManifest, "utf8")).sandbox.logicalPath).toBe("sandbox/sandbox.ts");
  });
  it("EC-03/05/07 and positive controls hold physically", async () => {
    const sentinel = join(root, ".inc2-supervisor-secret");
    writeFileSync(sentinel, privateKey);
    process.env.INC2_SUPERVISOR_PRIVATE_KEY = privateKey; process.env.INC2_SUPERVISOR_PUBLIC_KEY = publicKey;
    try {
      await withPhysical(async (sandbox) => {
        const verified = auth("physical");
        expect((await executeAuthorized(verified, sandbox,
          { capability_id: "write", authorization: "unused", content: "hello" })).kind).toBe("write");
        expect(await executeAuthorized(verified, sandbox, { capability_id: "read", authorization: "unused" }))
          .toEqual({ kind: "read", content: "hello" });
        expect(await executeAuthorized(verified, sandbox, { capability_id: "run", authorization: "unused" }))
          .toMatchObject({ kind: "run", exit_code: 0, stdout: "ok" });
        await sandbox.run({ command: "printf outside >/tmp/outside.txt && ln -s /tmp/outside.txt /workspace/link" });
        const traversal = auth("physical", policy(), [{ id: "traversal", kind: "write", path: "../tmp/outside.txt" }]);
        expect((await executeAuthorized(traversal, sandbox, { capability_id: "traversal", authorization: "unused", content: "changed" })).kind).toBe("deny");
        const escape = auth("physical", policy(), [{ id: "escape", kind: "write", path: "link" }]);
        expect((await executeAuthorized(escape, sandbox,
          { capability_id: "escape", authorization: "unused", content: "changed" })).kind).toBe("deny");
        expect((await sandbox.run({ command: "cat /tmp/outside.txt" })).stdout).toBe("outside");
        const networks = execFileSync("docker",
          ["container", "inspect", "--format", "{{json .NetworkSettings.Networks}}", sandbox.id],
          { encoding: "utf8" });
        expect(Object.keys(JSON.parse(networks))).toEqual([]);
        expect((await sandbox.run({ command: "find / -name .inc2-supervisor-secret -print -quit 2>/dev/null" })).stdout).toBe("");
        const env = (await sandbox.run({ command: "env" })).stdout;
        expect(env).not.toContain("INC2_SUPERVISOR_PRIVATE_KEY");
        expect(env).not.toContain("INC2_SUPERVISOR_PUBLIC_KEY");
      });
    } finally {
      rmSync(sentinel, { force: true }); delete process.env.INC2_SUPERVISOR_PRIVATE_KEY; delete process.env.INC2_SUPERVISOR_PUBLIC_KEY;
    }
  }, 30_000);
  it("EC-08 deletes state between independent sandboxes", async () => {
    let first = "";
    await withPhysical(async (sandbox) => { first = sandbox.id;
      await sandbox.writeTextFile({ path: "/workspace/sentinel", content: "A" }); });
    await withPhysical(async (sandbox) => {
      expect(sandbox.id).not.toBe(first);
      expect((await sandbox.run({ command: "test ! -e /workspace/sentinel" })).exitCode).toBe(0);
    });
  });
});

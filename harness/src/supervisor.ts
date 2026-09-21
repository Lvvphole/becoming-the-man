import { Buffer } from "node:buffer";
import { sign } from "node:crypto";
import { DENIED, inside, quote, selectGrant,
  type CapabilityPolicy, type ExecuteInput, type ExecuteResult,
  type Grant, type VerifiedAuthorization } from "./capability.js";
import { prewarmEveSession } from "./eve-adapter.js";

export interface SandboxPort {
  readonly id: string;
  run(input: { command: string }): PromiseLike<{ exitCode: number; stdout: string; stderr: string }>;
  readTextFile(input: { path: string }): PromiseLike<string | null>;
  writeTextFile(input: { path: string; content: string }): PromiseLike<void>;
}

export function issueAuthorization(
  privateKey: string, sessionId: string, policy: CapabilityPolicy, grants: readonly Grant[],
): string {
  if (!sessionId || new Set(grants.map(({ id }) => id)).size !== grants.length) {
    throw new Error("CAPABILITY_CATALOG_INVALID");
  }
  const payload = Buffer.from(JSON.stringify({
    version: 1, session_id: sessionId, policy, grants,
  })).toString("base64url");
  return `${payload}.${sign(null, Buffer.from(payload), privateKey).toString("base64url")}`;
}

export async function prepareExecutionSession<T>(
  host: string, privateKey: string, policy: CapabilityPolicy, grants: readonly Grant[],
  run: (prepared: { session_id: string; authorization: string }) => Promise<T>,
): Promise<T> {
  const session = await prewarmEveSession(host), session_id = session.state.sessionId;
  try { return await run({ session_id, authorization: issueAuthorization(privateKey, session_id, policy, grants) }); }
  finally { await session.reset(); }
}

async function canonical(sandbox: SandboxPort, path: string, missing = false): Promise<string | null> {
  const result = await sandbox.run({ command: `realpath ${missing ? "-m " : ""}-- ${quote(path)}` });
  return result.exitCode === 0 ? result.stdout.trim() : null;
}

export async function executeAuthorized(
  auth: VerifiedAuthorization, sandbox: SandboxPort, input: ExecuteInput,
): Promise<ExecuteResult> {
  const grant = selectGrant(auth, input);
  if (!grant) return DENIED;
  if (grant.kind === "read" || grant.kind === "write") {
    const target = await canonical(sandbox, `/workspace/${grant.path}`, grant.kind === "write");
    const roots = grant.kind === "read" ? auth.policy.read_roots : auth.policy.write_roots;
    if (!target || !inside(target, roots)) return DENIED;
    if (grant.kind === "read") {
      const content = await sandbox.readTextFile({ path: target });
      return content === null ? DENIED : { kind: "read", content };
    }
    await sandbox.writeTextFile({ path: target, content: input.content ?? "" });
    return { kind: "write", bytes_written: Buffer.byteLength(input.content ?? "") };
  }
  const executable = await sandbox.run({ command: `p=$(command -v ${quote(grant.argv[0] ?? "")}) || exit 127; case "$p" in */*) realpath -- "$p";; *) printf '%s\\n' "$p";; esac` });
  if (await canonical(sandbox, grant.cwd) !== grant.cwd || executable.exitCode !== 0 ||
      executable.stdout.trim() === "git" || executable.stdout.trim().endsWith("/git")) return DENIED;
  const result = await sandbox.run({
    command: `cd -- ${quote(grant.cwd)} && exec ${grant.argv.map(quote).join(" ")}`,
  });
  return { kind: "run", exit_code: result.exitCode, stdout: result.stdout, stderr: result.stderr };
}

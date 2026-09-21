import { Buffer } from "node:buffer";
import { sign } from "node:crypto";
import {
  DENIED, allowedGrant, inside, quote,
  type CapabilityPolicy, type ExecuteInput, type ExecuteResult, type Grant, type VerifiedAuthorization,
} from "./capability.js";
import { prewarmEveSession } from "./eve-adapter.js";

export interface SandboxPort {
  readonly id: string;
  run(input: { command: string }): PromiseLike<{ exitCode: number; stdout: string; stderr: string }>;
  readTextFile(input: { path: string }): PromiseLike<string | null>;
  writeTextFile(input: { path: string; content: string }): PromiseLike<void>;
}

export function issueAuthorization(
  privateKey: string,
  sessionId: string,
  policy: CapabilityPolicy,
  grants: readonly Grant[],
): string {
  if (!sessionId || new Set(grants.map((g) => g.id)).size !== grants.length) {
    throw new Error("CAPABILITY_CATALOG_INVALID");
  }
  const payload = Buffer.from(JSON.stringify({
    version: 1, session_id: sessionId, policy, grants,
  })).toString("base64url");
  return `${payload}.${sign(null, Buffer.from(payload), privateKey).toString("base64url")}`;
}

export async function prepareExecutionSession(
  host: string,
  privateKey: string,
  policy: CapabilityPolicy,
  grants: readonly Grant[],
): Promise<{ session_id: string; authorization: string }> {
  const session_id = await prewarmEveSession(host);
  return { session_id, authorization: issueAuthorization(privateKey, session_id, policy, grants) };
}

async function canonical(sandbox: SandboxPort, path: string, missing = false): Promise<string | null> {
  const result = await sandbox.run({ command: `realpath ${missing ? "-m " : ""}-- ${quote(path)}` });
  return result.exitCode === 0 ? result.stdout.trim() : null;
}

export async function executeAuthorized(
  auth: VerifiedAuthorization,
  sandbox: SandboxPort,
  input: ExecuteInput,
): Promise<ExecuteResult> {
  const grant = auth.grants.find((g) => g.id === input.capability_id);
  if (!allowedGrant(auth.policy, grant, input)) return DENIED;

  if (grant.kind === "read" || grant.kind === "write") {
    const absolute = `/workspace/${grant.path}`;
    const target = await canonical(sandbox, absolute, grant.kind === "write");
    const roots = grant.kind === "read" ? auth.policy.read_roots : auth.policy.write_roots;
    if (!target || !inside(target, roots)) return DENIED;
    if (grant.kind === "read") {
      const content = await sandbox.readTextFile({ path: target });
      return content === null ? DENIED : { kind: "read", content };
    }
    await sandbox.writeTextFile({ path: target, content: input.content ?? "" });
    return { kind: "write", bytes_written: Buffer.byteLength(input.content ?? "") };
  }

  const cwd = await canonical(sandbox, grant.cwd);
  if (cwd !== grant.cwd) return DENIED;
  const result = await sandbox.run({
    command: `cd -- ${quote(grant.cwd)} && exec ${grant.argv.map(quote).join(" ")}`,
  });
  return { kind: "run", exit_code: result.exitCode, stdout: result.stdout, stderr: result.stderr };
}

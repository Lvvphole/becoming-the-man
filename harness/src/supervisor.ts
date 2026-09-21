import { randomUUID } from "node:crypto";
import { Buffer } from "node:buffer";
import {
  DENIED, allowedGrant, inside, quote,
  type CapabilityPolicy, type ExecuteInput, type ExecuteResult, type Grant,
} from "./capability.js";

export interface SandboxPort {
  readonly id: string;
  run(input: { command: string }): PromiseLike<{ exitCode: number; stdout: string; stderr: string }>;
  readTextFile(input: { path: string }): Promise<string>;
  writeTextFile(input: { path: string; content: string }): Promise<unknown>;
}

export interface BackendPort {
  create(input: {
    templateKey: null;
    sessionKey: string;
    runtimeContext: { appRoot: string };
  }): Promise<{ session: SandboxPort; delete(): Promise<void> }>;
}

const bindings = new Map<string, { policy: CapabilityPolicy; grants: ReadonlyMap<string, Grant> }>();

export function bindSession(id: string, policy: CapabilityPolicy, grants: readonly Grant[]): () => void {
  if (!id || new Set(grants.map((g) => g.id)).size !== grants.length) {
    throw new Error("CAPABILITY_CATALOG_INVALID");
  }
  bindings.set(id, { policy, grants: new Map(grants.map((g) => [g.id, g])) });
  return () => { bindings.delete(id); };
}

async function canonical(sandbox: SandboxPort, relative: string, missing: boolean): Promise<string | null> {
  const absolute = `/workspace/${relative}`;
  const result = await sandbox.run({ command: `realpath ${missing ? "-m " : ""}-- ${quote(absolute)}` });
  return result.exitCode === 0 ? result.stdout.trim() : null;
}

export async function executeForSession(
  sessionId: string,
  sandbox: SandboxPort,
  input: ExecuteInput,
): Promise<ExecuteResult> {
  const bound = bindings.get(sessionId);
  const grant = bound?.grants.get(input.capability_id);
  if (!bound || !allowedGrant(bound.policy, grant, input)) return DENIED;

  if (grant.kind === "read" || grant.kind === "write") {
    const target = await canonical(sandbox, grant.path, grant.kind === "write");
    const roots = grant.kind === "read" ? bound.policy.read_roots : bound.policy.write_roots;
    if (!target || !inside(target, roots)) return DENIED;
    if (grant.kind === "read") return { kind: "read", content: await sandbox.readTextFile({ path: target }) };
    await sandbox.writeTextFile({ path: target, content: input.content ?? "" });
    return { kind: "write", bytes_written: Buffer.byteLength(input.content ?? "") };
  }

  const command = `cd -- ${quote(grant.cwd)} && exec ${grant.argv.map(quote).join(" ")}`;
  const result = await sandbox.run({ command });
  return { kind: "run", exit_code: result.exitCode, stdout: result.stdout, stderr: result.stderr };
}

export async function withExecutionSandbox<T>(
  backend: BackendPort,
  appRoot: string,
  policy: CapabilityPolicy,
  grants: readonly Grant[],
  run: (sandbox: SandboxPort) => Promise<T>,
): Promise<T> {
  const handle = await backend.create({
    templateKey: null,
    sessionKey: `inc2-${randomUUID()}`,
    runtimeContext: { appRoot },
  });
  const unbind = bindSession(handle.session.id, policy, grants);
  try {
    return await run(handle.session);
  } finally {
    unbind();
    await handle.delete();
  }
}

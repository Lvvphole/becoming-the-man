import { Buffer } from "node:buffer";
import { verify as verifySignature } from "node:crypto";
export type ExecuteInput = { capability_id: string; authorization: string; content?: string };
export type ExecuteResult =
  | { kind: "read"; content: string }
  | { kind: "write"; bytes_written: number }
  | { kind: "run"; exit_code: number; stdout: string; stderr: string }
  | { kind: "deny"; diagnostic: "CAPABILITY_NOT_GRANTED" };
export type Grant =
  | { id: string; kind: "read"; path: string }
  | { id: string; kind: "write"; path: string }
  | { id: string; kind: "run"; argv: readonly string[]; cwd: string };
export type CapabilityPolicy = Readonly<{
  task_identity: string;
  allowed_tools: readonly ["execute"];
  allowed_argv: readonly (readonly string[])[];
  allowed_cwds: readonly string[];
  read_roots: readonly string[];
  write_roots: readonly string[];
  subprocess: "deny" | "exact";
  network: "deny";
  secret_names: readonly [];
  git: "deny";
}>;
export type VerifiedAuthorization = Readonly<{
  policy: CapabilityPolicy;
  grants: readonly Grant[];
}>;
export const DENIED: ExecuteResult = Object.freeze({
  kind: "deny", diagnostic: "CAPABILITY_NOT_GRANTED",
});
const strings = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === "string");
const unique = (values: readonly string[]) =>
  values.length === new Set(values).size && values.every(Boolean);
export function compilePolicy(input: {
  task_identity: string;
  allowed_argv: readonly (readonly string[])[];
  allowed_cwds: readonly string[];
  read_roots: readonly string[];
  write_roots: readonly string[];
  subprocess: "deny" | "exact";
}): CapabilityPolicy {
  const roots = [...input.allowed_cwds, ...input.read_roots, ...input.write_roots];
  if (!input.task_identity || !unique(input.allowed_cwds) || !unique(input.read_roots) ||
      !unique(input.write_roots) || input.allowed_argv.some((argv) => argv.length === 0) ||
      roots.some((path) => !(path === "/workspace" || path.startsWith("/workspace/")) || path.includes(".."))) {
    throw new Error("CAPABILITY_POLICY_INVALID");
  }
  return Object.freeze({
    task_identity: input.task_identity,
    allowed_tools: Object.freeze(["execute"] as const),
    allowed_argv: Object.freeze(input.allowed_argv.map((argv) => Object.freeze([...argv]))),
    allowed_cwds: Object.freeze([...input.allowed_cwds]),
    read_roots: Object.freeze([...input.read_roots]),
    write_roots: Object.freeze([...input.write_roots]),
    subprocess: input.subprocess,
    network: "deny" as const,
    secret_names: Object.freeze([]) as readonly [],
    git: "deny" as const,
  });
}
function parsePolicy(value: unknown): CapabilityPolicy | null {
  if (typeof value !== "object" || value === null) return null;
  const v = value as Record<string, unknown>;
  if (typeof v.task_identity !== "string" || !Array.isArray(v.allowed_tools) ||
      v.allowed_tools.length !== 1 || v.allowed_tools[0] !== "execute" ||
      !Array.isArray(v.allowed_argv) || !v.allowed_argv.every(strings) ||
      !strings(v.allowed_cwds) || !strings(v.read_roots) || !strings(v.write_roots) ||
      (v.subprocess !== "deny" && v.subprocess !== "exact") || v.network !== "deny" ||
      !Array.isArray(v.secret_names) || v.secret_names.length !== 0 || v.git !== "deny") return null;
  try {
    return compilePolicy({
      task_identity: v.task_identity, allowed_argv: v.allowed_argv,
      allowed_cwds: v.allowed_cwds, read_roots: v.read_roots,
      write_roots: v.write_roots, subprocess: v.subprocess,
    });
  } catch { return null; }
}
function parseGrants(value: unknown): readonly Grant[] | null {
  if (!Array.isArray(value)) return null;
  const grants: Grant[] = [];
  for (const item of value) {
    if (typeof item !== "object" || item === null) return null;
    const g = item as Record<string, unknown>;
    if (typeof g.id !== "string" || !g.id) return null;
    if ((g.kind === "read" || g.kind === "write") && typeof g.path === "string") {
      grants.push(Object.freeze({ id: g.id, kind: g.kind, path: g.path }));
    } else if (g.kind === "run" && strings(g.argv) && typeof g.cwd === "string") {
      grants.push(Object.freeze({ id: g.id, kind: "run", argv: Object.freeze(g.argv), cwd: g.cwd }));
    } else return null;
  }
  return unique(grants.map((grant) => grant.id)) ? Object.freeze(grants) : null;
}
export function verifyAuthorization(
  token: string, publicKey: string, sessionId: string,
): VerifiedAuthorization | null {
  const [payload, signature, ...extra] = token.split(".");
  if (!payload || !signature || extra.length || !publicKey || !sessionId) return null;
  try {
    if (!verifySignature(null, Buffer.from(payload), publicKey,
      Buffer.from(signature, "base64url"))) return null;
    const value = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as Record<string, unknown>;
    const policy = parsePolicy(value.policy);
    const grants = parseGrants(value.grants);
    return value.version === 1 && value.session_id === sessionId && policy && grants
      ? Object.freeze({ policy, grants }) : null;
  } catch { return null; }
}
export function safeRelativePath(path: string): boolean {
  return /^[A-Za-z0-9._/-]+$/.test(path) && !path.startsWith("/") &&
    !path.split("/").includes("..") && !/[?*[\]\\]/.test(path);
}
export function inside(path: string, roots: readonly string[]): boolean {
  return roots.some((root) => path === root || path.startsWith(root.endsWith("/") ? root : root + "/"));
}
export function quote(value: string): string {
  return "'" + value.replaceAll("'", "'\\''") + "'";
}
export function allowedGrant(
  policy: CapabilityPolicy, grant: Grant | undefined, input: ExecuteInput,
): grant is Grant {
  if (!grant || policy.allowed_tools[0] !== "execute") return false;
  if (grant.kind === "read") return input.content === undefined && safeRelativePath(grant.path);
  if (grant.kind === "write") return typeof input.content === "string" && safeRelativePath(grant.path);
  const argvAllowed = policy.allowed_argv.some((argv) =>
    argv.length === grant.argv.length && argv.every((token, index) => token === grant.argv[index]));
  const executable = grant.argv[0] ?? "";
  return input.content === undefined && policy.subprocess === "exact" && argvAllowed &&
    policy.allowed_cwds.includes(grant.cwd) && executable !== "git" && !executable.endsWith("/git");
}
export function selectGrant(auth: VerifiedAuthorization, input: ExecuteInput): Grant | null {
  const grant = auth.grants.find((candidate) => candidate.id === input.capability_id);
  return allowedGrant(auth.policy, grant, input) ? grant : null;
}

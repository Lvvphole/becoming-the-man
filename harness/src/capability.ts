export type ExecuteInput = { capability_id: string; content?: string };
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

export const DENIED: ExecuteResult = Object.freeze({
  kind: "deny",
  diagnostic: "CAPABILITY_NOT_GRANTED",
});

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
  if (!input.task_identity || !unique(input.allowed_cwds) ||
      !unique(input.read_roots) || !unique(input.write_roots) ||
      input.allowed_argv.some((argv) => argv.length === 0 || !unique(argv.map((v, i) => `${i}:${v}`))) ||
      [...input.allowed_cwds, ...input.read_roots, ...input.write_roots]
        .some((p) => !p.startsWith("/workspace") || p.includes(".."))) {
    throw new Error("CAPABILITY_POLICY_INVALID");
  }
  return Object.freeze({
    task_identity: input.task_identity,
    allowed_tools: Object.freeze(["execute"] as const),
    allowed_argv: Object.freeze(input.allowed_argv.map((v) => Object.freeze([...v]))),
    allowed_cwds: Object.freeze([...input.allowed_cwds]),
    read_roots: Object.freeze([...input.read_roots]),
    write_roots: Object.freeze([...input.write_roots]),
    subprocess: input.subprocess,
    network: "deny" as const,
    secret_names: Object.freeze([]) as readonly [],
    git: "deny" as const,
  });
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
  policy: CapabilityPolicy,
  grant: Grant | undefined,
  input: ExecuteInput,
): grant is Grant {
  if (!grant || policy.allowed_tools[0] !== "execute") return false;
  if (grant.kind === "read") return input.content === undefined && safeRelativePath(grant.path);
  if (grant.kind === "write") return typeof input.content === "string" && safeRelativePath(grant.path);
  const argvAllowed = policy.allowed_argv.some((v) =>
    v.length === grant.argv.length && v.every((token, i) => token === grant.argv[i]));
  const executable = grant.argv[0] ?? "";
  return input.content === undefined && policy.subprocess === "exact" &&
    argvAllowed && policy.allowed_cwds.includes(grant.cwd) &&
    executable !== "git" && !executable.endsWith("/git");
}

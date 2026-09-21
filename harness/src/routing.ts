export type Diagnostic =
  | "UNROUTED_PATH"
  | "AMBIGUOUS_PATH_ROUTE"
  | "UNKNOWN_REQUIREMENT"
  | "AMBIGUOUS_REQUIREMENT"
  | "REQUIREMENT_SOURCE_UNAVAILABLE"
  | "MINIMUM_CHECKS_WEAKENED"
  | "STALE_OR_WRONG_BASE"
  | "TASK_CONTRACT_INVALID";

export type ShadowDecision =
  | { outcome: "DENY"; diagnostic: Diagnostic }
  | {
      outcome: "ALLOW";
      owners: Record<string, string>;
      minimum_checks: string[];
      required_sources: string[];
    };

type PathRoute = { id: string; exact: string[]; prefixes: string[]; sources: string[]; checks: string[] };
type Requirement = { id: string; source: string; selector: string; checks: string[] };
type Source = { id: string; path: string };
type Check = { id: string; argv: string[] };

export type RoutingTable = {
  version: 1;
  path_routes: PathRoute[];
  requirements: Requirement[];
  sources: Source[];
  checks: Check[];
  protected_paths: string[];
};

export type TaskContract = {
  task_id?: string;
  base_sha: string;
  goal: string;
  requirement_refs: string[];
  allowed_paths: string[];
  allowed_tools: string[];
  required_checks: string[];
  stop_condition: string;
};

const deny = (diagnostic: Diagnostic): ShadowDecision => ({ outcome: "DENY", diagnostic });
const object = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);
const uniqueStrings = (value: unknown, nonEmpty = false): value is string[] =>
  Array.isArray(value) &&
  (!nonEmpty || value.length > 0) &&
  value.every((item) => typeof item === "string" && item.length > 0) &&
  new Set(value).size === value.length;
const repoPath = (value: string): boolean =>
  /^[A-Za-z0-9._/-]+$/.test(value) &&
  !value.startsWith("/") &&
  !value.split("/").includes("..") &&
  !/[?*\[\]\\]/.test(value);

function idsUnique(items: Array<{ id: string }>): boolean {
  return new Set(items.map(({ id }) => id)).size === items.length;
}

function tableShape(value: unknown): value is RoutingTable {
  if (!object(value) || value.version !== 1) return false;
  const routes = value.path_routes;
  const requirements = value.requirements;
  const sources = value.sources;
  const checks = value.checks;
  if (!Array.isArray(routes) || !Array.isArray(requirements) || !Array.isArray(sources) ||
      !Array.isArray(checks) || !uniqueStrings(value.protected_paths)) return false;
  if (!routes.every((r) => object(r) && typeof r.id === "string" && uniqueStrings(r.exact) &&
      uniqueStrings(r.prefixes) && uniqueStrings(r.sources) && uniqueStrings(r.checks))) return false;
  if (!requirements.every((r) => object(r) && typeof r.id === "string" &&
      typeof r.source === "string" && typeof r.selector === "string" && uniqueStrings(r.checks))) return false;
  if (!sources.every((s) => object(s) && typeof s.id === "string" && typeof s.path === "string")) return false;
  if (!checks.every((c) => object(c) && typeof c.id === "string" && uniqueStrings(c.argv, true))) return false;
  return true;
}

export function parseRoutingTable(markdown: string): RoutingTable | null {
  const match = markdown.match(/SHADOW_ROUTING_TABLE_BEGIN\s*```json\s*([\s\S]*?)\s*```\s*SHADOW_ROUTING_TABLE_END/);
  if (!match) return null;
  try {
    const parsed: unknown = JSON.parse(match[1]);
    if (!tableShape(parsed)) return null;
    if (!idsUnique(parsed.path_routes) || !idsUnique(parsed.sources) || !idsUnique(parsed.checks)) return null;
    if (![...parsed.path_routes.flatMap((r) => [...r.exact, ...r.prefixes]), ...parsed.sources.map((s) => s.path)]
      .every(repoPath)) return null;
    const sourceIds = new Set(parsed.sources.map(({ id }) => id));
    const checkIds = new Set(parsed.checks.map(({ id }) => id));
    const refsValid = parsed.path_routes.every((r) =>
      r.sources.every((id) => sourceIds.has(id)) && r.checks.every((id) => checkIds.has(id))) &&
      parsed.requirements.every((r) =>
        sourceIds.has(r.source) && r.checks.every((id) => checkIds.has(id)));
    return refsValid ? parsed : null;
  } catch {
    return null;
  }
}

function validTask(value: unknown): value is TaskContract {
  if (!object(value)) return false;
  const allowed = new Set(["task_id", "base_sha", "goal", "requirement_refs", "allowed_paths",
    "allowed_tools", "required_checks", "stop_condition"]);
  if (Object.keys(value).some((key) => !allowed.has(key))) return false;
  if (value.task_id !== undefined && (typeof value.task_id !== "string" || value.task_id.length === 0)) return false;
  return typeof value.base_sha === "string" && /^[0-9a-f]{40}$/.test(value.base_sha) &&
    typeof value.goal === "string" && value.goal.length > 0 &&
    uniqueStrings(value.requirement_refs) &&
    uniqueStrings(value.allowed_paths, true) && value.allowed_paths.every(repoPath) &&
    uniqueStrings(value.allowed_tools, true) &&
    uniqueStrings(value.required_checks, true) &&
    typeof value.stop_condition === "string" && value.stop_condition.length > 0;
}

function owner(table: RoutingTable, path: string): PathRoute | Diagnostic {
  const exact = table.path_routes.filter((route) => route.exact.includes(path));
  if (exact.length > 1) return "AMBIGUOUS_PATH_ROUTE";
  if (exact.length === 1) return exact[0];
  const matches = table.path_routes.flatMap((route) =>
    route.prefixes.filter((prefix) => path.startsWith(prefix)).map((prefix) => ({ route, length: prefix.length })));
  if (matches.length === 0) return "UNROUTED_PATH";
  const longest = Math.max(...matches.map(({ length }) => length));
  const candidates = [...new Map(matches.filter(({ length }) => length === longest)
    .map(({ route }) => [route.id, route])).values()];
  return candidates.length === 1 ? candidates[0] : "AMBIGUOUS_PATH_ROUTE";
}

export function evaluateShadow(
  table: RoutingTable,
  taskInput: unknown,
  observedBase: string,
  availableSourcePaths: ReadonlySet<string>,
): ShadowDecision {
  if (!validTask(taskInput)) return deny("TASK_CONTRACT_INVALID");
  if (taskInput.base_sha !== observedBase) return deny("STALE_OR_WRONG_BASE");
  if (!idsUnique(table.requirements)) return deny("AMBIGUOUS_REQUIREMENT");

  const owners = new Map<string, PathRoute>();
  for (const path of taskInput.allowed_paths) {
    const resolved = owner(table, path);
    if (typeof resolved === "string") return deny(resolved);
    owners.set(path, resolved);
  }

  const requirements: Requirement[] = [];
  for (const id of taskInput.requirement_refs) {
    const matches = table.requirements.filter((requirement) => requirement.id === id);
    if (matches.length === 0) return deny("UNKNOWN_REQUIREMENT");
    if (matches.length > 1) return deny("AMBIGUOUS_REQUIREMENT");
    requirements.push(matches[0]);
  }

  const sourceIds = new Set([
    ...[...owners.values()].flatMap((route) => route.sources),
    ...requirements.map(({ source }) => source),
  ]);
  const requiredSources: string[] = [];
  for (const id of sourceIds) {
    const matches = table.sources.filter((source) => source.id === id);
    if (matches.length !== 1 || !availableSourcePaths.has(matches[0].path)) {
      return deny("REQUIREMENT_SOURCE_UNAVAILABLE");
    }
    requiredSources.push(matches[0].path);
  }

  const minimum = new Set([
    ...[...owners.values()].flatMap((route) => route.checks),
    ...requirements.flatMap((requirement) => requirement.checks),
  ]);
  if ([...minimum].some((check) => !taskInput.required_checks.includes(check))) {
    return deny("MINIMUM_CHECKS_WEAKENED");
  }

  return {
    outcome: "ALLOW",
    owners: Object.fromEntries([...owners].map(([path, route]) => [path, route.id])),
    minimum_checks: [...minimum].sort(),
    required_sources: requiredSources.sort(),
  };
}

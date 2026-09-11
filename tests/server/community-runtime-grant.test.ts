import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const root = join(dirname(fileURLToPath(import.meta.url)), "../..");

function migrationSql(): string {
  const dir = join(root, "supabase/migrations");
  return readdirSync(dir)
    .filter((name) => name.endsWith(".sql"))
    .sort()
    .map((name) => readFileSync(join(dir, name), "utf8"))
    .join("\n");
}

describe("service_role access to community_runtime privileges", () => {
  it("grants community_runtime to service_role so the service-role JWT can execute the claim", () => {
    // PostgREST presents SUPABASE_SERVICE_ROLE_KEY as role service_role. EXECUTE on
    // claim_idempotency_key is granted only to community_runtime, so without this
    // membership every live signup fails the initial RPC with permission denied.
    expect(migrationSql()).toMatch(/GRANT\s+community_runtime\s+TO\s+service_role\s*;/i);
  });

  it("keeps claim execute off PUBLIC, anon, and authenticated", () => {
    const sql = migrationSql();
    expect(sql).toMatch(
      /REVOKE\s+ALL\s+ON\s+FUNCTION\s+public\.claim_idempotency_key[\s\S]*?FROM\s+PUBLIC,\s*anon,\s*authenticated\s*;/i,
    );
    expect(sql).toMatch(
      /GRANT\s+EXECUTE\s+ON\s+FUNCTION\s+public\.claim_idempotency_key[\s\S]*?TO\s+community_runtime\s*;/i,
    );
  });

  it("authenticates the write path with the service-role credential that needs that grant", () => {
    const source = readFileSync(
      join(root, "server/repositories/supabase-community.server.ts"),
      "utf8",
    );
    expect(source).toMatch(/env\.SUPABASE_SERVICE_ROLE_KEY/);
  });
});

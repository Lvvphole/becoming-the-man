import { spawnSync } from "node:child_process";
import { describe, expect, it } from "vitest";

describe("audience persistence schema", () => {
  it("satisfies the migration, privacy, RLS, and idempotency contract", () => {
    const result = spawnSync("bash", ["supabase/tests/audience_signup_rls.sh"], {
      encoding: "utf8",
    });

    expect(result.status, `${result.stdout}\n${result.stderr}`).toBe(0);
    expect(result.stdout).toContain("PASS: audience signup persistence");
  }, 45_000);
});

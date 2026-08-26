import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  "supabase/migrations/20260826190000_create_site_settings.sql",
  "utf8",
);

describe("site_settings migration contract", () => {
  it("enables RLS and revokes broad default access", () => {
    expect(migration).toMatch(/enable row level security/i);
    expect(migration).toMatch(/revoke all on table public\.site_settings from anon, authenticated/i);
  });

  it("grants a narrow read and restricts public rows to the book URL", () => {
    expect(migration).toMatch(/grant select \(key, value_text, is_public, updated_at\)/i);
    expect(migration).toMatch(/key = 'book_purchase_url'/i);
    expect(migration).toMatch(/is_public = true/i);
  });

  it("contains no public write policy or grant", () => {
    expect(migration).not.toMatch(/grant\s+(insert|update|delete)/i);
    expect(migration).not.toMatch(/for\s+(insert|update|delete)/i);
  });
});

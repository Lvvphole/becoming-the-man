/* global console, process */
import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";

const roots = ["src/routes", "src/components"];
const forbidden = [
  "@supabase/",
  "posthog-js",
  "posthog-node",
  "SUPABASE_SERVICE_ROLE",
  "SUPABASE_ANON_KEY",
  "POSTHOG_PROJECT_API_KEY",
  "select * from",
  "insert into",
  "update public.",
  "delete from",
];

async function collect(dir) {
  const entries = await readdir(dir, { withFileTypes: true }).catch(() => []);
  const files = [];

  for (const entry of entries) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collect(path)));
    } else if (/\.(ts|tsx|js|jsx)$/.test(entry.name)) {
      files.push(path);
    }
  }

  return files;
}

const sourceFiles = (await Promise.all(roots.map(collect))).flat();
const violations = [];

for (const file of sourceFiles) {
  const source = await readFile(file, "utf8");
  for (const token of forbidden) {
    if (source.toLowerCase().includes(token.toLowerCase())) {
      violations.push(`${file}: forbidden token ${token}`);
    }
  }
}

if (violations.length > 0) {
  console.error(violations.join("\n"));
  process.exit(1);
}

console.log(`Boundary verification passed for ${sourceFiles.length} route/component files.`);

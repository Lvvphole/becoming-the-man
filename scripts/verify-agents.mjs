/* global console */
import { readFile } from "node:fs/promises";

const agents = await readFile("AGENTS.md", "utf8");
const packageJson = JSON.parse(await readFile("package.json", "utf8"));
const lineCount = agents.split(/\r?\n/).length;

if (lineCount >= 150) {
  throw new Error(`AGENTS.md must remain under 150 lines; found ${lineCount}.`);
}

const commandPattern = /`npm run ([a-zA-Z0-9:_-]+)`/g;
const documented = new Set(
  Array.from(agents.matchAll(commandPattern), (match) => match[1]),
);

const missing = Array.from(documented).filter(
  (script) => !(script in packageJson.scripts),
);

if (missing.length > 0) {
  throw new Error(`AGENTS.md documents nonexistent scripts: ${missing.join(", ")}`);
}

if (agents.includes("No repository build, lint, typecheck, test, or CI commands exist yet.")) {
  throw new Error("AGENTS.md still claims repository commands do not exist.");
}

console.log(
  `AGENTS.md verification passed: ${lineCount} lines, ${documented.size} documented npm scripts.`,
);

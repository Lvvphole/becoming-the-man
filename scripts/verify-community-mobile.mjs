import { readFile } from "node:fs/promises";

const reportPath = process.argv[2];
if (!reportPath) throw new Error("Usage: node scripts/verify-community-mobile.mjs <mobile-scout-report.json>");

const report = JSON.parse(await readFile(reportPath, "utf8"));
const selectors = ["#community-first-name", "#community-email", ".community-consent", ".community-form button"];

for (const snapshot of report.mobileSnapshots) {
  const form = snapshot.sections[".community-form"]?.rect;
  if (!form) throw new Error(`Community form geometry missing at ${snapshot.viewport.width}px.`);

  let previousBottom = form.top;
  for (const selector of selectors) {
    const rect = snapshot.sections[selector]?.rect;
    if (!rect) throw new Error(`${selector} geometry missing at ${snapshot.viewport.width}px.`);
    if (Math.abs(rect.left - form.left) > 1 || Math.abs(rect.right - form.right) > 1) {
      throw new Error(`${selector} does not span the community form at ${snapshot.viewport.width}px.`);
    }
    if (rect.top < previousBottom - 1) {
      throw new Error(`${selector} is visually out of form order at ${snapshot.viewport.width}px.`);
    }
    previousBottom = rect.bottom;
  }

  const checkbox = snapshot.sections[".community-consent input"]?.rect;
  if (!checkbox || checkbox.width > 28 || checkbox.height > 28) {
    throw new Error(`Community consent checkbox inherited text-control sizing at ${snapshot.viewport.width}px.`);
  }
}

console.log("PASS: Community signup controls remain ordered and mobile-safe at all governed phone widths.");

import { spawn, spawnSync } from "node:child_process";
import { rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import process from "node:process";
import { setTimeout as sleep } from "node:timers/promises";

const pageUrl = process.argv[2] ?? "http://127.0.0.1:4173/";
const viewport = { width: 1101, height: 900, deviceScaleFactor: 1, mobile: false };
const chromeNames = [
  process.env.CHROME_PATH,
  "google-chrome",
  "google-chrome-stable",
  "chromium",
  "chromium-browser",
].filter(Boolean);

function findChrome() {
  for (const name of chromeNames) {
    const found = spawnSync("which", [name], { encoding: "utf8" });
    if (found.status === 0) return found.stdout.trim();
  }
  throw new Error("Headless Chrome/Chromium is required for the responsive Home journey check.");
}

const profileDir = join(tmpdir(), `btm-home-render-${process.pid}`);
const chrome = spawn(findChrome(), [
  "--headless=new",
  "--no-sandbox",
  "--disable-gpu",
  "--disable-dev-shm-usage",
  "--remote-debugging-port=9222",
  `--user-data-dir=${profileDir}`,
  pageUrl,
], { stdio: "ignore" });

function cleanup() {
  chrome.kill("SIGTERM");
  rmSync(profileDir, { recursive: true, force: true });
}

process.on("exit", cleanup);
process.on("SIGINT", () => process.exit(130));
process.on("SIGTERM", () => process.exit(143));

async function findPageTarget() {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    if (chrome.exitCode !== null) {
      throw new Error(`Headless Chrome exited early with code ${chrome.exitCode}.`);
    }
    try {
      const response = await globalThis.fetch("http://127.0.0.1:9222/json/list");
      if (response.ok) {
        const targets = await response.json();
        const target = targets.find((item) => item.type === "page" && item.url.startsWith("http"));
        if (target) return target;
      }
    } catch {
      // Chrome is still starting.
    }
    await sleep(100);
  }
  throw new Error("Timed out waiting for the rendered Home page.");
}

const target = await findPageTarget();
const socket = new globalThis.WebSocket(target.webSocketDebuggerUrl);
const pending = new Map();
let nextId = 1;

await new Promise((resolve, reject) => {
  socket.addEventListener("open", resolve, { once: true });
  socket.addEventListener("error", reject, { once: true });
});

socket.addEventListener("message", ({ data }) => {
  const message = JSON.parse(data);
  if (!message.id) return;
  const waiter = pending.get(message.id);
  pending.delete(message.id);
  if (message.error) waiter.reject(new Error(message.error.message));
  else waiter.resolve(message.result);
});

function command(method, params = {}) {
  const id = nextId;
  nextId += 1;
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject });
    socket.send(JSON.stringify({ id, method, params }));
  });
}

await command("Runtime.enable");
await command("Emulation.setDeviceMetricsOverride", viewport);

for (let attempt = 0; attempt < 50; attempt += 1) {
  const state = await command("Runtime.evaluate", {
    expression: `({ ready: document.readyState, hero: Boolean(document.querySelector(".home-hero")), cta: Boolean(document.querySelector(".primary-action")) })`,
    returnByValue: true,
  });
  if (state.result.value.ready === "complete" && state.result.value.hero && state.result.value.cta) break;
  if (attempt === 49) throw new Error("Timed out waiting for the Home journey to render.");
  await sleep(100);
}

await command("Runtime.evaluate", {
  expression: "document.fonts.ready.then(() => true)",
  awaitPromise: true,
});
const evaluation = await command("Runtime.evaluate", {
  expression: `(() => {
    const heroRect = document.querySelector(".home-hero").getBoundingClientRect();
    const ctaRect = document.querySelector(".primary-action").getBoundingClientRect();
    return {
      heroHeight: heroRect.height,
      heroTop: heroRect.top,
      heroBottom: heroRect.bottom,
      ctaTop: ctaRect.top,
      ctaBottom: ctaRect.bottom,
      ctaWidth: ctaRect.width,
      ctaHeight: ctaRect.height,
    };
  })()`,
  returnByValue: true,
});

socket.close();
const layout = evaluation.result.value;
if (layout.heroHeight < 494) {
  throw new Error(`Home hero is shorter than the approved 494px minimum: ${layout.heroHeight}px.`);
}
if (layout.ctaWidth <= 0 || layout.ctaHeight <= 0) {
  throw new Error("Primary purchase CTA has no rendered size.");
}
if (layout.ctaTop < layout.heroTop || layout.ctaBottom > layout.heroBottom + 0.5) {
  throw new Error(
    `Primary purchase CTA is clipped at 1101px: CTA bottom ${layout.ctaBottom}px, hero bottom ${layout.heroBottom}px.`,
  );
}

cleanup();
process.stdout.write(
  `PASS: Home purchase CTA remains visible at 1101px; rendered hero height ${layout.heroHeight}px.\n`,
);

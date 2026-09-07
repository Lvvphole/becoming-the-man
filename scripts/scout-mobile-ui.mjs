import { Buffer } from "node:buffer";
import { spawn, spawnSync } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import process from "node:process";
import { setTimeout as sleep } from "node:timers/promises";
import { URL } from "node:url";
import {
  DEFAULT_VIEWPORTS,
  GOVERNED_SELECTORS,
  classifyMobileSnapshot,
  summarizeFindings,
} from "./mobile-ui-scout-core.mjs";

const DESKTOP_VIEWPORT = Object.freeze({
  name: "desktop-baseline",
  width: 1440,
  height: 1000,
  deviceScaleFactor: 1,
});

const ORIENTATION_SELECTORS = Object.freeze([
  ".hero-copy h1",
  ".hero-subtitle",
  ".hero-author",
  ".primary-action",
  ".secondary-action",
]);

function usage() {
  return [
    "Usage: npm run scout:mobile -- <url> [--out-dir <path>] [--no-screenshots]",
    "",
    "Read-only diagnostic scout. Findings are evidence, not a product PASS/FAIL decision.",
  ].join("\n");
}

function parseArgs(argv) {
  let pageUrl;
  let outDir;
  let screenshots = true;

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--help" || arg === "-h") return { help: true };
    if (arg === "--no-screenshots") {
      screenshots = false;
      continue;
    }
    if (arg === "--out-dir") {
      const value = argv[index + 1];
      if (!value) throw new Error("--out-dir requires a path.");
      outDir = value;
      index += 1;
      continue;
    }
    if (arg.startsWith("--")) throw new Error(`Unknown option: ${arg}`);
    if (pageUrl) throw new Error(`Unexpected positional argument: ${arg}`);
    pageUrl = arg;
  }

  if (!pageUrl) throw new Error("A target URL is required.");
  const parsed = new URL(pageUrl);
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error("Target URL must use http or https.");
  }

  return {
    help: false,
    pageUrl: parsed.href,
    screenshots,
    outDir: resolve(outDir ?? join(process.cwd(), "mobile-scout-output")),
  };
}

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
  throw new Error("Headless Chrome/Chromium is required for the mobile UI scout.");
}

async function waitForDevTools(profileDir, chrome) {
  const portFile = join(profileDir, "DevToolsActivePort");
  for (let attempt = 0; attempt < 150; attempt += 1) {
    if (chrome.exitCode !== null) {
      throw new Error(`Headless Chrome exited early with code ${chrome.exitCode}.`);
    }
    try {
      const text = await readFile(portFile, "utf8");
      const [port] = text.trim().split(/\r?\n/);
      if (port) return Number(port);
    } catch {
      // Chrome is still starting.
    }
    await sleep(100);
  }
  throw new Error("Timed out waiting for Chrome DevTools.");
}

async function waitForPageTarget(port) {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    try {
      const response = await globalThis.fetch(`http://127.0.0.1:${port}/json/list`);
      if (response.ok) {
        const targets = await response.json();
        const target = targets.find((item) => item.type === "page");
        if (target) return target;
      }
    } catch {
      // DevTools endpoint is still starting.
    }
    await sleep(100);
  }
  throw new Error("Timed out waiting for a Chrome page target.");
}

function createCdpClient(socket) {
  const pending = new Map();
  let nextId = 1;

  socket.addEventListener("message", ({ data }) => {
    const message = JSON.parse(data);
    if (!message.id) return;
    const waiter = pending.get(message.id);
    if (!waiter) return;
    pending.delete(message.id);
    if (message.error) waiter.reject(new Error(message.error.message));
    else waiter.resolve(message.result);
  });

  return function command(method, params = {}) {
    const id = nextId;
    nextId += 1;
    return new Promise((resolveCommand, rejectCommand) => {
      pending.set(id, { resolve: resolveCommand, reject: rejectCommand });
      socket.send(JSON.stringify({ id, method, params }));
    });
  };
}

async function evaluateValue(command, expression, awaitPromise = false) {
  const evaluation = await command("Runtime.evaluate", {
    expression,
    awaitPromise,
    returnByValue: true,
  });
  if (evaluation.exceptionDetails) {
    throw new Error(evaluation.exceptionDetails.text ?? "Runtime evaluation failed.");
  }
  return evaluation.result.value;
}

async function waitForRenderedPage(command) {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    const state = await evaluateValue(
      command,
      `({ ready: document.readyState, main: Boolean(document.querySelector("main")) })`,
    );
    if (state.ready === "complete" && state.main) break;
    if (attempt === 79) throw new Error("Timed out waiting for the target page to render.");
    await sleep(100);
  }

  await evaluateValue(command, "document.fonts.ready.then(() => true)", true);
  await evaluateValue(
    command,
    `Promise.race([
      Promise.all([...document.images].map((image) => image.complete ? true : new Promise((resolveImage) => {
        image.addEventListener("load", () => resolveImage(true), { once: true });
        image.addEventListener("error", () => resolveImage(true), { once: true });
      }))),
      new Promise((resolveTimeout) => setTimeout(() => resolveTimeout(true), 3000)),
    ])`,
    true,
  );
}

function snapshotExpression(viewport) {
  return `(() => {
    const governedSelectors = ${JSON.stringify(GOVERNED_SELECTORS)};
    const orientationSelectors = ${JSON.stringify(ORIENTATION_SELECTORS)};
    const viewport = ${JSON.stringify(viewport)};

    const isVisible = (element) => {
      if (!element) return false;
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return style.display !== "none" && style.visibility !== "hidden" && Number(style.opacity) !== 0 && rect.width > 0 && rect.height > 0;
    };

    const rectOf = (element) => {
      const rect = element.getBoundingClientRect();
      return {
        left: Math.round(rect.left * 100) / 100,
        right: Math.round(rect.right * 100) / 100,
        top: Math.round(rect.top * 100) / 100,
        bottom: Math.round(rect.bottom * 100) / 100,
        width: Math.round(rect.width * 100) / 100,
        height: Math.round(rect.height * 100) / 100,
      };
    };

    const describe = (element) => {
      if (element.id) return "#" + CSS.escape(element.id);
      const classes = [...element.classList].slice(0, 2).map((name) => "." + CSS.escape(name)).join("");
      return element.tagName.toLowerCase() + classes;
    };

    const inspect = (selector) => {
      const element = document.querySelector(selector);
      if (!element) return { exists: false, visible: false };
      const rect = rectOf(element);
      return {
        exists: true,
        visible: isVisible(element),
        rect,
        intersectsInitialViewport: rect.bottom > 0 && rect.top < innerHeight,
      };
    };

    const sections = Object.fromEntries(governedSelectors.map((selector) => [selector, inspect(selector)]));
    const orientation = Object.fromEntries(orientationSelectors.map((selector) => [selector, inspect(selector)]));
    const primaryNav = document.querySelector(".site-nav");
    const replacementCandidates = document.querySelectorAll(
      ".mobile-nav, .menu-toggle, [aria-label*='menu' i], button[aria-expanded]",
    );

    const horizontalOverflows = [...document.body.querySelectorAll("*")]
      .filter(isVisible)
      .map((element) => ({ element, rect: rectOf(element) }))
      .filter(({ rect }) => rect.left < -1 || rect.right > innerWidth + 1)
      .slice(0, 25)
      .map(({ element, rect }) => ({ selector: describe(element), rect }));

    const clippedText = [...document.querySelectorAll("h1,h2,h3,p,li,a,button,span,label")]
      .filter((element) => isVisible(element) && element.textContent.trim().length > 0)
      .filter((element) => {
        const style = getComputedStyle(element);
        const clipsX = style.overflowX === "hidden" || style.overflowX === "clip";
        const clipsY = style.overflowY === "hidden" || style.overflowY === "clip";
        return (clipsX && element.scrollWidth > element.clientWidth + 1) ||
          (clipsY && element.scrollHeight > element.clientHeight + 1);
      })
      .slice(0, 25)
      .map((element) => ({
        selector: describe(element),
        clientWidth: element.clientWidth,
        scrollWidth: element.scrollWidth,
        clientHeight: element.clientHeight,
        scrollHeight: element.scrollHeight,
        text: element.textContent.trim().replace(/\\s+/g, " ").slice(0, 120),
      }));

    const smallTouchTargets = [...document.querySelectorAll(
      "a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[role='button']:not([aria-disabled='true'])",
    )]
      .filter(isVisible)
      .map((element) => ({ element, rect: rectOf(element) }))
      .filter(({ rect }) => rect.width < 44 || rect.height < 44)
      .slice(0, 25)
      .map(({ element, rect }) => ({ selector: describe(element), rect }));

    return {
      viewport,
      viewportMeta: document.querySelector("meta[name='viewport']")?.getAttribute("content") ?? null,
      documentWidth: document.documentElement.scrollWidth,
      documentHeight: document.documentElement.scrollHeight,
      sections,
      orientation,
      primaryNavVisible: isVisible(primaryNav),
      mobileNavReplacementVisible: [...replacementCandidates].some(isVisible),
      horizontalOverflows,
      clippedText,
      smallTouchTargets,
    };
  })()`;
}

async function captureSnapshot(command, pageUrl, viewport, mobile) {
  await command("Emulation.setDeviceMetricsOverride", {
    width: viewport.width,
    height: viewport.height,
    deviceScaleFactor: viewport.deviceScaleFactor,
    mobile,
  });
  await command("Emulation.setTouchEmulationEnabled", { enabled: mobile, maxTouchPoints: mobile ? 5 : 0 });
  await command("Page.navigate", { url: pageUrl });
  await waitForRenderedPage(command);
  return evaluateValue(command, snapshotExpression(viewport));
}

async function captureScreenshot(command, filePath) {
  const shot = await command("Page.captureScreenshot", {
    format: "png",
    captureBeyondViewport: true,
    fromSurface: true,
  });
  await writeFile(filePath, Buffer.from(shot.data, "base64"));
}

async function main() {
  let args;
  try {
    args = parseArgs(process.argv.slice(2));
  } catch (error) {
    process.stderr.write(`${error.message}\n${usage()}\n`);
    process.exitCode = 2;
    return;
  }

  if (args.help) {
    process.stdout.write(`${usage()}\n`);
    return;
  }

  await mkdir(args.outDir, { recursive: true });
  const profileDir = join(tmpdir(), `btm-mobile-scout-${process.pid}`);
  const chrome = spawn(findChrome(), [
    "--headless=new",
    "--no-sandbox",
    "--disable-gpu",
    "--disable-dev-shm-usage",
    "--remote-debugging-port=0",
    `--user-data-dir=${profileDir}`,
    "about:blank",
  ], { stdio: "ignore" });

  const cleanup = () => {
    if (chrome.exitCode === null) chrome.kill("SIGTERM");
  };
  process.on("exit", cleanup);
  process.on("SIGINT", () => process.exit(130));
  process.on("SIGTERM", () => process.exit(143));

  let socket;
  try {
    const port = await waitForDevTools(profileDir, chrome);
    const target = await waitForPageTarget(port);
    socket = new globalThis.WebSocket(target.webSocketDebuggerUrl);
    await new Promise((resolveOpen, rejectOpen) => {
      socket.addEventListener("open", resolveOpen, { once: true });
      socket.addEventListener("error", rejectOpen, { once: true });
    });

    const command = createCdpClient(socket);
    await command("Runtime.enable");
    await command("Page.enable");
    const browser = await command("Browser.getVersion");

    const desktopBaseline = await captureSnapshot(command, args.pageUrl, DESKTOP_VIEWPORT, false);
    const findings = [];
    const mobileSnapshots = [];

    for (const viewport of DEFAULT_VIEWPORTS) {
      const snapshot = await captureSnapshot(command, args.pageUrl, viewport, true);
      findings.push(...classifyMobileSnapshot(snapshot, desktopBaseline));
      const screenshotPath = join(args.outDir, `${viewport.name}-${viewport.width}x${viewport.height}.png`);
      if (args.screenshots) await captureScreenshot(command, screenshotPath);
      mobileSnapshots.push({
        ...snapshot,
        screenshot: args.screenshots ? screenshotPath : null,
      });
    }

    const report = {
      schemaVersion: 1,
      authority: "diagnostic-only",
      targetUrl: args.pageUrl,
      capturedAt: new Date().toISOString(),
      browser: browser.product,
      desktopBaseline,
      mobileSnapshots,
      findings,
      summary: summarizeFindings(findings),
    };
    const reportPath = join(args.outDir, "mobile-scout-report.json");
    await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

    process.stdout.write(
      `SCOUT COMPLETE: ${report.summary.error} errors, ${report.summary.warning} warnings, ${report.summary.advisory} advisories.\n` +
      `Report: ${reportPath}\n` +
      "Diagnostic only: findings do not grant or deny product acceptance.\n",
    );
  } finally {
    if (socket?.readyState === globalThis.WebSocket.OPEN) socket.close();
    cleanup();
  }
}

await main();

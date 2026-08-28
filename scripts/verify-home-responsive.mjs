import { spawn, spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
import process from "node:process";
import { setTimeout as sleep } from "node:timers/promises";

const pageUrl = process.argv[2] ?? "http://127.0.0.1:4173/";
const desktopViewport = { width: 1101, height: 900, deviceScaleFactor: 1, mobile: false };
const mobileViewport = { width: 390, height: 844, deviceScaleFactor: 1, mobile: true };
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
  if (chrome.exitCode === null) chrome.kill("SIGTERM");
}

process.on("exit", cleanup);
process.on("SIGINT", () => process.exit(130));
process.on("SIGTERM", () => process.exit(143));

async function findPageTarget() {
  for (let attempt = 0; attempt < 150; attempt += 1) {
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
await command("Emulation.setDeviceMetricsOverride", desktopViewport);

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

const desktopEvaluation = await command("Runtime.evaluate", {
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

const desktopLayout = desktopEvaluation.result.value;
if (desktopLayout.heroHeight < 494) {
  throw new Error(`Home hero is shorter than the approved 494px minimum: ${desktopLayout.heroHeight}px.`);
}
if (desktopLayout.ctaWidth <= 0 || desktopLayout.ctaHeight <= 0) {
  throw new Error("Primary purchase CTA has no rendered size.");
}
if (desktopLayout.ctaTop < desktopLayout.heroTop || desktopLayout.ctaBottom > desktopLayout.heroBottom + 0.5) {
  throw new Error(
    `Primary purchase CTA is clipped at 1101px: CTA bottom ${desktopLayout.ctaBottom}px, hero bottom ${desktopLayout.heroBottom}px.`,
  );
}

await command("Emulation.setDeviceMetricsOverride", mobileViewport);
for (let attempt = 0; attempt < 20; attempt += 1) {
  const state = await command("Runtime.evaluate", {
    expression: "({ width: window.innerWidth, ready: document.readyState })",
    returnByValue: true,
  });
  if (state.result.value.ready === "complete" && state.result.value.width === mobileViewport.width) break;
  if (attempt === 19) throw new Error("Timed out waiting for the mobile Home layout to settle.");
  await sleep(100);
}

const mobileEvaluation = await command("Runtime.evaluate", {
  expression: `(() => {
    const headerRect = document.querySelector(".site-header").getBoundingClientRect();
    const menu = document.querySelector(".mobile-nav summary");
    const menuRect = menu.getBoundingClientRect();
    const desktopNav = document.querySelector(".site-nav-desktop");
    const mobileBook = document.querySelector(".book-stage-mobile");
    const desktopBook = document.querySelector(".book-stage-desktop");
    const mobileBookRect = mobileBook.getBoundingClientRect();
    const heading = document.querySelector(".hero-copy h1");
    const headingRect = heading.getBoundingClientRect();
    const descriptionRect = document.querySelector(".hero-description").getBoundingClientRect();
    const ctaRect = document.querySelector(".primary-action").getBoundingClientRect();
    const quoteRect = document.querySelector(".communication-quote").getBoundingClientRect();
    return {
      viewportWidth: window.innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
      headerHeight: headerRect.height,
      menuWidth: menuRect.width,
      menuHeight: menuRect.height,
      desktopNavDisplay: getComputedStyle(desktopNav).display,
      mobileBookDisplay: getComputedStyle(mobileBook).display,
      desktopBookDisplay: getComputedStyle(desktopBook).display,
      headingFontSize: Number.parseFloat(getComputedStyle(heading).fontSize),
      headingBottom: headingRect.bottom,
      mobileBookTop: mobileBookRect.top,
      mobileBookBottom: mobileBookRect.bottom,
      descriptionTop: descriptionRect.top,
      descriptionBottom: descriptionRect.bottom,
      ctaTop: ctaRect.top,
      ctaBottom: ctaRect.bottom,
      ctaWidth: ctaRect.width,
      ctaHeight: ctaRect.height,
      quoteTop: quoteRect.top,
    };
  })()`,
  returnByValue: true,
});

socket.close();
const mobileLayout = mobileEvaluation.result.value;
if (mobileLayout.headerHeight > 80) {
  throw new Error(`Mobile header is vertically jumbled: ${mobileLayout.headerHeight}px tall.`);
}
if (mobileLayout.menuWidth < 44 || mobileLayout.menuHeight < 44) {
  throw new Error(`Mobile menu target is too small: ${mobileLayout.menuWidth}x${mobileLayout.menuHeight}px.`);
}
if (mobileLayout.desktopNavDisplay !== "none") {
  throw new Error("Desktop navigation remains visible in the 390px mobile layout.");
}
if (mobileLayout.mobileBookDisplay === "none" || mobileLayout.desktopBookDisplay !== "none") {
  throw new Error("Mobile Home must show only the mobile-positioned canonical book cover.");
}
if (mobileLayout.headingFontSize > 42) {
  throw new Error(`Mobile Home heading remains oversized at ${mobileLayout.headingFontSize}px.`);
}
if (
  !(
    mobileLayout.headingBottom < mobileLayout.mobileBookTop &&
    mobileLayout.mobileBookBottom < mobileLayout.descriptionTop &&
    mobileLayout.descriptionBottom < mobileLayout.ctaTop &&
    mobileLayout.ctaBottom < mobileLayout.quoteTop
  )
) {
  throw new Error("Mobile Home hierarchy must remain heading -> book -> orientation -> buy -> quote.");
}
if (mobileLayout.ctaWidth < 330 || mobileLayout.ctaHeight < 44) {
  throw new Error(`Mobile purchase CTA is not comfortably usable: ${mobileLayout.ctaWidth}x${mobileLayout.ctaHeight}px.`);
}
if (mobileLayout.scrollWidth > mobileLayout.viewportWidth + 1) {
  throw new Error(
    `Mobile Home has horizontal overflow: scroll width ${mobileLayout.scrollWidth}px for ${mobileLayout.viewportWidth}px viewport.`,
  );
}

cleanup();
process.stdout.write(
  `PASS: Home responsive contract holds at 1101px and 390px; desktop hero ${desktopLayout.heroHeight}px, mobile header ${mobileLayout.headerHeight}px.\n`,
);

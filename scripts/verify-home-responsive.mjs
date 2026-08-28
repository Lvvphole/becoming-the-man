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

async function settleViewport(viewport) {
  await command("Emulation.setDeviceMetricsOverride", viewport);
  for (let attempt = 0; attempt < 50; attempt += 1) {
    const state = await command("Runtime.evaluate", {
      expression: `({ ready: document.readyState, width: window.innerWidth, hero: Boolean(document.querySelector(".home-hero")), cta: Boolean(document.querySelector(".primary-action")) })`,
      returnByValue: true,
    });
    const value = state.result.value;
    if (value.ready === "complete" && value.width === viewport.width && value.hero && value.cta) return;
    if (attempt === 49) throw new Error(`Timed out waiting for the ${viewport.width}px Home layout.`);
    await sleep(100);
  }
}

async function evaluateHome(visibleVariant) {
  const evaluation = await command("Runtime.evaluate", {
    expression: `(() => {
      const hero = document.querySelector(".home-hero");
      const cta = document.querySelector(".primary-action");
      const heading = document.querySelector(".hero-copy h1");
      const description = document.querySelector(".hero-description");
      const quote = document.querySelector(".communication-quote");
      const header = document.querySelector(".site-header");
      const menu = document.querySelector(".mobile-nav summary");
      const desktopNav = document.querySelector(".site-nav-desktop");
      const mobileBook = document.querySelector(".book-stage-mobile");
      const desktopBook = document.querySelector(".book-stage-desktop");
      const stage = document.querySelector(".book-stage-${visibleVariant}");
      const book = stage.querySelector(".book-3d");
      const cover = book.querySelector(".book-cover-image");
      const pages = book.querySelector(".book-pages");
      const headerRect = header.getBoundingClientRect();
      const menuRect = menu.getBoundingClientRect();
      const heroRect = hero.getBoundingClientRect();
      const ctaRect = cta.getBoundingClientRect();
      const headingRect = heading.getBoundingClientRect();
      const descriptionRect = description.getBoundingClientRect();
      const quoteRect = quote.getBoundingClientRect();
      const stageRect = stage.getBoundingClientRect();
      const bookRect = book.getBoundingClientRect();
      const coverRect = cover.getBoundingClientRect();
      const pageRect = pages.getBoundingClientRect();
      const bookStyle = getComputedStyle(book);
      const coverStyle = getComputedStyle(cover);
      const pageStyle = getComputedStyle(pages);
      const rearStyle = getComputedStyle(book, "::before");
      const shadowStyle = getComputedStyle(book, "::after");
      const stageStyle = getComputedStyle(stage);
      const rearWidth = Number.parseFloat(rearStyle.width);
      const rearRight = Number.parseFloat(rearStyle.right);
      return {
        viewportWidth: window.innerWidth,
        scrollWidth: document.documentElement.scrollWidth,
        headerHeight: headerRect.height,
        menuWidth: menuRect.width,
        menuHeight: menuRect.height,
        desktopNavDisplay: getComputedStyle(desktopNav).display,
        heroHeight: heroRect.height,
        heroTop: heroRect.top,
        heroBottom: heroRect.bottom,
        ctaTop: ctaRect.top,
        ctaBottom: ctaRect.bottom,
        ctaWidth: ctaRect.width,
        ctaHeight: ctaRect.height,
        headingFontSize: Number.parseFloat(getComputedStyle(heading).fontSize),
        headingBottom: headingRect.bottom,
        stageTop: stageRect.top,
        stageBottom: stageRect.bottom,
        descriptionTop: descriptionRect.top,
        descriptionBottom: descriptionRect.bottom,
        quoteTop: quoteRect.top,
        mobileBookDisplay: getComputedStyle(mobileBook).display,
        desktopBookDisplay: getComputedStyle(desktopBook).display,
        stagePerspective: stageStyle.perspective,
        bookWidth: bookRect.width,
        bookTransform: bookStyle.transform,
        bookFilter: bookStyle.filter,
        coverTransform: coverStyle.transform,
        coverSrc: cover.getAttribute("src"),
        coverNaturalWidth: cover.naturalWidth,
        coverNaturalHeight: cover.naturalHeight,
        pageWidthRatio: pageRect.width / coverRect.width,
        pageTopInsetRatio: (pageRect.top - coverRect.top) / coverRect.height,
        pageBottomInsetRatio: (coverRect.bottom - pageRect.bottom) / coverRect.height,
        pageGapRatio: (pageRect.left - coverRect.right) / coverRect.width,
        pageClipPath: pageStyle.clipPath,
        pageBackgroundImage: pageStyle.backgroundImage,
        rearContent: rearStyle.content,
        rearWidthRatio: rearWidth / coverRect.width,
        rearRightRatio: rearRight / coverRect.width,
        rearBackgroundColor: rearStyle.backgroundColor,
        shadowContent: shadowStyle.content,
        shadowBackgroundImage: shadowStyle.backgroundImage,
        shadowFilter: shadowStyle.filter,
        shadowLeftRatio: Number.parseFloat(shadowStyle.left) / coverRect.width,
        shadowRightRatio: Number.parseFloat(shadowStyle.right) / coverRect.width,
        shadowHeightRatio: Number.parseFloat(shadowStyle.height) / coverRect.height,
        shadowBottomRatio: Number.parseFloat(shadowStyle.bottom) / coverRect.height,
        bookLeft: Math.min(coverRect.left, pageRect.left),
        bookRight: Math.max(coverRect.right, pageRect.right + rearWidth),
      };
    })()`,
    returnByValue: true,
  });
  return evaluation.result.value;
}

function near(value, target, tolerance) {
  return Math.abs(value - target) <= tolerance;
}

function assertCanonicalBook(layout, label) {
  if (layout.coverSrc !== "/book-cover.webp") {
    throw new Error(`${label} book no longer uses the canonical /book-cover.webp source: ${layout.coverSrc}.`);
  }
  if (layout.coverNaturalWidth !== 240 || layout.coverNaturalHeight !== 365) {
    throw new Error(
      `${label} canonical cover dimensions changed: ${layout.coverNaturalWidth}x${layout.coverNaturalHeight}.`,
    );
  }
  if (layout.stagePerspective !== "none" || layout.bookTransform !== "none" || layout.coverTransform !== "none") {
    throw new Error(
      `${label} book is no longer the approved mostly front-facing treatment: perspective=${layout.stagePerspective}, book=${layout.bookTransform}, cover=${layout.coverTransform}.`,
    );
  }
  if (layout.bookFilter !== "none") {
    throw new Error(`${label} book regained an unapproved object drop-shadow: ${layout.bookFilter}.`);
  }
  if (!near(layout.pageWidthRatio, 0.072, 0.004)) {
    throw new Error(`${label} white page-block depth changed: ratio ${layout.pageWidthRatio}.`);
  }
  if (!near(layout.pageTopInsetRatio, 0.014, 0.004) || !near(layout.pageBottomInsetRatio, 0.014, 0.004)) {
    throw new Error(
      `${label} page-block vertical treatment changed: top ${layout.pageTopInsetRatio}, bottom ${layout.pageBottomInsetRatio}.`,
    );
  }
  if (Math.abs(layout.pageGapRatio) > 0.004) {
    throw new Error(`${label} page block is detached from the front cover: gap ratio ${layout.pageGapRatio}.`);
  }
  if (!layout.pageClipPath.includes("polygon") || !layout.pageBackgroundImage.includes("repeating-linear-gradient")) {
    throw new Error(`${label} approved shallow page-block perspective is missing.`);
  }
  if (
    layout.rearContent === "none" ||
    !near(layout.rearWidthRatio, 0.0205, 0.004) ||
    !near(layout.rearRightRatio, -0.0925, 0.005)
  ) {
    throw new Error(
      `${label} thin dark rear edge is missing or out of proportion: width ${layout.rearWidthRatio}, right ${layout.rearRightRatio}.`,
    );
  }
  if (layout.rearBackgroundColor === "rgba(0, 0, 0, 0)") {
    throw new Error(`${label} rear edge is transparent.`);
  }
  if (layout.shadowContent === "none" || !layout.shadowBackgroundImage.includes("radial-gradient")) {
    throw new Error(`${label} approved floor/contact shadow is missing.`);
  }
  if (
    !near(layout.shadowLeftRatio, -0.14, 0.01) ||
    !near(layout.shadowRightRatio, -0.22, 0.01) ||
    !near(layout.shadowHeightRatio, 0.052, 0.008) ||
    !near(layout.shadowBottomRatio, -0.038, 0.008) ||
    !layout.shadowFilter.includes("blur(3px)")
  ) {
    throw new Error(
      `${label} contact-shadow geometry changed: left ${layout.shadowLeftRatio}, right ${layout.shadowRightRatio}, height ${layout.shadowHeightRatio}, bottom ${layout.shadowBottomRatio}, filter ${layout.shadowFilter}.`,
    );
  }
  if (layout.bookLeft < -0.5 || layout.bookRight > layout.viewportWidth + 0.5) {
    throw new Error(
      `${label} canonical book clips horizontally: left ${layout.bookLeft}px, right ${layout.bookRight}px, viewport ${layout.viewportWidth}px.`,
    );
  }
}

await command("Runtime.enable");
await settleViewport(desktopViewport);
await command("Runtime.evaluate", {
  expression: "document.fonts.ready.then(() => true)",
  awaitPromise: true,
});
const desktop = await evaluateHome("desktop");

if (desktop.desktopNavDisplay === "none") {
  throw new Error("Desktop navigation is hidden at the desktop breakpoint.");
}
if (desktop.mobileBookDisplay !== "none" || desktop.desktopBookDisplay === "none") {
  throw new Error("Desktop Home must show only the desktop-positioned canonical book instance.");
}
if (desktop.heroHeight < 494) {
  throw new Error(`Home hero is shorter than the approved 494px minimum: ${desktop.heroHeight}px.`);
}
if (desktop.ctaWidth <= 0 || desktop.ctaHeight <= 0) {
  throw new Error("Desktop primary purchase CTA has no rendered size.");
}
if (desktop.ctaTop < desktop.heroTop || desktop.ctaBottom > desktop.heroBottom + 0.5) {
  throw new Error("Desktop primary purchase CTA is clipped inside the Home hero.");
}
if (desktop.bookWidth < 270 || desktop.bookWidth > 300) {
  throw new Error(`Desktop canonical book has regressed in visual presence: ${desktop.bookWidth}px wide.`);
}
assertCanonicalBook(desktop, "Desktop");

await settleViewport(mobileViewport);
const mobile = await evaluateHome("mobile");

if (mobile.headerHeight > 80) {
  throw new Error(`Mobile header is vertically jumbled: ${mobile.headerHeight}px tall.`);
}
if (mobile.menuWidth < 44 || mobile.menuHeight < 44) {
  throw new Error(`Mobile menu target is too small: ${mobile.menuWidth}x${mobile.menuHeight}px.`);
}
if (mobile.desktopNavDisplay !== "none") {
  throw new Error("Desktop navigation remains visible in the 390px mobile layout.");
}
if (mobile.mobileBookDisplay === "none" || mobile.desktopBookDisplay !== "none") {
  throw new Error("Mobile Home must show only the mobile-positioned canonical book instance.");
}
if (mobile.headingFontSize > 42) {
  throw new Error(`Mobile Home heading remains oversized at ${mobile.headingFontSize}px.`);
}
if (mobile.bookWidth < 225 || mobile.bookWidth > 250) {
  throw new Error(`Mobile canonical book has regressed in visual presence: ${mobile.bookWidth}px wide.`);
}
if (
  !(
    mobile.headingBottom < mobile.stageTop &&
    mobile.stageBottom < mobile.descriptionTop &&
    mobile.descriptionBottom < mobile.ctaTop &&
    mobile.ctaBottom < mobile.quoteTop
  )
) {
  throw new Error("Mobile Home hierarchy must remain heading -> book -> orientation -> buy -> quote.");
}
if (mobile.ctaWidth < 330 || mobile.ctaHeight < 44) {
  throw new Error(`Mobile purchase CTA is not comfortably usable: ${mobile.ctaWidth}x${mobile.ctaHeight}px.`);
}
if (mobile.scrollWidth > mobile.viewportWidth + 1) {
  throw new Error(
    `Mobile Home has horizontal overflow: scroll width ${mobile.scrollWidth}px for ${mobile.viewportWidth}px viewport.`,
  );
}
assertCanonicalBook(mobile, "Mobile");

for (const [name, desktopValue, mobileValue, tolerance] of [
  ["page depth", desktop.pageWidthRatio, mobile.pageWidthRatio, 0.002],
  ["page top inset", desktop.pageTopInsetRatio, mobile.pageTopInsetRatio, 0.002],
  ["page bottom inset", desktop.pageBottomInsetRatio, mobile.pageBottomInsetRatio, 0.002],
  ["rear edge", desktop.rearWidthRatio, mobile.rearWidthRatio, 0.002],
  ["rear edge offset", desktop.rearRightRatio, mobile.rearRightRatio, 0.002],
  ["shadow width-left", desktop.shadowLeftRatio, mobile.shadowLeftRatio, 0.002],
  ["shadow width-right", desktop.shadowRightRatio, mobile.shadowRightRatio, 0.002],
  ["shadow height", desktop.shadowHeightRatio, mobile.shadowHeightRatio, 0.002],
  ["shadow offset", desktop.shadowBottomRatio, mobile.shadowBottomRatio, 0.002],
]) {
  if (!near(desktopValue, mobileValue, tolerance)) {
    throw new Error(
      `Desktop/mobile canonical ${name} diverged: desktop ${desktopValue}, mobile ${mobileValue}.`,
    );
  }
}

if (
  desktop.pageClipPath !== mobile.pageClipPath ||
  desktop.pageBackgroundImage !== mobile.pageBackgroundImage ||
  desktop.rearBackgroundColor !== mobile.rearBackgroundColor
) {
  throw new Error("Desktop and mobile no longer share one canonical 3D book treatment.");
}

socket.close();
cleanup();
process.stdout.write(
  `PASS: Home responsive contract holds at 1101px and 390px; one canonical front-facing book treatment uses /book-cover.webp with shared page/rear/shadow geometry.\n`,
);

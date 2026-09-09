export const DEFAULT_VIEWPORTS = Object.freeze([
  Object.freeze({ name: "small-phone", width: 320, height: 568, deviceScaleFactor: 2 }),
  Object.freeze({ name: "standard-phone", width: 390, height: 844, deviceScaleFactor: 3 }),
  Object.freeze({ name: "large-phone", width: 430, height: 932, deviceScaleFactor: 3 }),
]);

export const GOVERNED_SELECTORS = Object.freeze([
  ".home-hero",
  ".principle-band",
  ".framework-section",
  ".learn-section",
  ".audience-section",
  ".community-section",
  ".community-form",
  "#community-first-name",
  "#community-email",
  ".community-consent",
  ".community-consent input",
  ".community-form button",
  ".community-note",
  ".site-footer",
]);

function finding(severity, code, viewport, message, evidence = {}) {
  return { severity, code, viewport, message, evidence };
}

function normalizeNavigationItems(items) {
  return (Array.isArray(items) ? items : []).map((item) => ({
    text:
      typeof item?.text === "string"
        ? item.text.trim().replace(/\s+/g, " ").toUpperCase()
        : "",
    href: typeof item?.href === "string" ? item.href : null,
    disabled: item?.disabled === true,
  }));
}

function navigationItemsMatch(expected, actual) {
  return (
    JSON.stringify(normalizeNavigationItems(expected)) ===
    JSON.stringify(normalizeNavigationItems(actual))
  );
}

export function classifyMobileSnapshot(snapshot, desktopBaseline) {
  const findings = [];
  const viewport = snapshot.viewport.name;

  if (snapshot.documentWidth > snapshot.viewport.width + 1) {
    findings.push(
      finding(
        "error",
        "MOBILE_HORIZONTAL_OVERFLOW",
        viewport,
        `Document width ${snapshot.documentWidth}px exceeds viewport width ${snapshot.viewport.width}px.`,
        { documentWidth: snapshot.documentWidth, viewportWidth: snapshot.viewport.width },
      ),
    );
  }

  for (const selector of GOVERNED_SELECTORS) {
    const desktop = desktopBaseline.sections[selector];
    const mobile = snapshot.sections[selector];
    if (!mobile?.exists) {
      findings.push(
        finding("error", "SECTION_MISSING", viewport, `${selector} is absent on mobile.`, { selector }),
      );
      continue;
    }
    if (desktop?.visible && !mobile.visible) {
      findings.push(
        finding(
          "error",
          "SECTION_HIDDEN_ON_MOBILE",
          viewport,
          `${selector} is visible on desktop but not visible on mobile.`,
          { selector, desktop, mobile },
        ),
      );
    }
  }

  if (desktopBaseline.primaryNavVisible && !snapshot.primaryNavVisible && !snapshot.mobileNavReplacementVisible) {
    findings.push(
      finding(
        "warning",
        "NAVIGATION_HIDDEN_WITHOUT_REPLACEMENT",
        viewport,
        "Primary navigation is hidden on mobile and no visible menu replacement was detected.",
      ),
    );
  }

  if (
    desktopBaseline.primaryNavVisible &&
    !snapshot.primaryNavVisible &&
    snapshot.mobileNavReplacementVisible &&
    !navigationItemsMatch(desktopBaseline.primaryNavigationItems, snapshot.mobileNavigationItems)
  ) {
    findings.push(
      finding(
        "warning",
        "MOBILE_NAVIGATION_CONTENT_MISMATCH",
        viewport,
        "Mobile navigation does not preserve the desktop primary-navigation items.",
        {
          desktop: normalizeNavigationItems(desktopBaseline.primaryNavigationItems),
          mobile: normalizeNavigationItems(snapshot.mobileNavigationItems),
        },
      ),
    );
  }

  for (const selector of [".hero-copy h1", ".hero-subtitle", ".hero-author", ".primary-action", ".secondary-action"]) {
    const state = snapshot.orientation[selector];
    if (!state?.exists || !state.visible) {
      findings.push(
        finding(
          "error",
          "ORIENTATION_ELEMENT_NOT_VISIBLE",
          viewport,
          `${selector} is part of the current Home orientation path but is not visibly rendered.`,
          { selector, state },
        ),
      );
      continue;
    }
    if (!state.intersectsInitialViewport) {
      findings.push(
        finding(
          "advisory",
          "ORIENTATION_ELEMENT_BELOW_FIRST_VIEW",
          viewport,
          `${selector} is rendered but does not intersect the initial viewport.`,
          { selector, rect: state.rect },
        ),
      );
    }
  }

  for (const item of snapshot.horizontalOverflows) {
    findings.push(
      finding(
        "warning",
        "ELEMENT_HORIZONTAL_OVERFLOW",
        viewport,
        `${item.selector} extends outside the mobile viewport.`,
        item,
      ),
    );
  }

  for (const item of snapshot.clippedText) {
    findings.push(
      finding(
        "warning",
        "TEXT_CLIPPED",
        viewport,
        `${item.selector} has clipped text content.`,
        item,
      ),
    );
  }

  for (const item of snapshot.smallTouchTargets) {
    findings.push(
      finding(
        "advisory",
        "SMALL_TOUCH_TARGET",
        viewport,
        `${item.selector} renders below the scout's 44×44px touch-target heuristic.`,
        item,
      ),
    );
  }

  return findings;
}

export function summarizeFindings(findings) {
  const counts = { error: 0, warning: 0, advisory: 0 };
  for (const item of findings) {
    if (Object.hasOwn(counts, item.severity)) counts[item.severity] += 1;
  }
  return { ...counts, total: findings.length };
}

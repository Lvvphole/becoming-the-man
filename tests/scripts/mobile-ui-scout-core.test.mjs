import { describe, expect, it } from "vitest";
import {
  GOVERNED_SELECTORS,
  classifyMobileSnapshot,
  summarizeFindings,
} from "../../scripts/mobile-ui-scout-core.mjs";

const PRIMARY_NAVIGATION_ITEMS = Object.freeze([
  Object.freeze({ text: "BOOK", href: "/book", disabled: false }),
  Object.freeze({ text: "THE 24 NON-NEGOTIABLES", href: "#non-negotiables", disabled: false }),
  Object.freeze({ text: "ABOUT", href: null, disabled: true }),
  Object.freeze({ text: "CONTACT", href: null, disabled: true }),
  Object.freeze({ text: "NEWSLETTER", href: "#community", disabled: false }),
]);

function visibleState() {
  return {
    exists: true,
    visible: true,
    intersectsInitialViewport: true,
    rect: { left: 0, right: 100, top: 0, bottom: 40, width: 100, height: 40 },
  };
}

function baseline() {
  return {
    sections: Object.fromEntries(GOVERNED_SELECTORS.map((selector) => [selector, visibleState()])),
    primaryNavVisible: true,
    primaryNavigationItems: PRIMARY_NAVIGATION_ITEMS,
  };
}

function snapshot() {
  return {
    viewport: { name: "standard-phone", width: 390, height: 844, deviceScaleFactor: 3 },
    documentWidth: 390,
    sections: Object.fromEntries(GOVERNED_SELECTORS.map((selector) => [selector, visibleState()])),
    orientation: Object.fromEntries(
      [".hero-copy h1", ".hero-subtitle", ".hero-author", ".primary-action", ".secondary-action"].map(
        (selector) => [selector, visibleState()],
      ),
    ),
    primaryNavVisible: false,
    primaryNavigationItems: PRIMARY_NAVIGATION_ITEMS,
    mobileNavReplacementVisible: true,
    mobileNavigationItems: PRIMARY_NAVIGATION_ITEMS,
    horizontalOverflows: [],
    clippedText: [],
    smallTouchTargets: [],
  };
}

describe("mobile UI scout classifier", () => {
  it("reports no findings for a mechanically clean mobile snapshot", () => {
    expect(classifyMobileSnapshot(snapshot(), baseline())).toEqual([]);
  });

  it("detects document overflow and desktop-to-mobile section loss", () => {
    const mobile = snapshot();
    mobile.documentWidth = 412;
    mobile.sections[".learn-section"] = { exists: true, visible: false };

    const findings = classifyMobileSnapshot(mobile, baseline());
    expect(findings.map((item) => item.code)).toContain("MOBILE_HORIZONTAL_OVERFLOW");
    expect(findings.map((item) => item.code)).toContain("SECTION_HIDDEN_ON_MOBILE");
  });

  it("flags hidden desktop navigation when no mobile replacement exists", () => {
    const mobile = snapshot();
    mobile.mobileNavReplacementVisible = false;

    const findings = classifyMobileSnapshot(mobile, baseline());
    expect(findings).toContainEqual(
      expect.objectContaining({ code: "NAVIGATION_HIDDEN_WITHOUT_REPLACEMENT", severity: "warning" }),
    );
  });

  it("flags a mobile replacement whose navigation items do not match desktop", () => {
    const mobile = snapshot();
    mobile.mobileNavigationItems = PRIMARY_NAVIGATION_ITEMS.slice(0, -1);

    const findings = classifyMobileSnapshot(mobile, baseline());
    expect(findings).toContainEqual(
      expect.objectContaining({ code: "MOBILE_NAVIGATION_CONTENT_MISMATCH", severity: "warning" }),
    );
  });

  it("keeps heuristic findings advisory rather than treating them as acceptance failures", () => {
    const mobile = snapshot();
    mobile.smallTouchTargets = [
      { selector: "a.secondary-link", rect: { width: 36, height: 20 } },
    ];
    mobile.orientation[".secondary-action"] = {
      ...visibleState(),
      intersectsInitialViewport: false,
      rect: { left: 10, right: 180, top: 900, bottom: 944, width: 170, height: 44 },
    };

    const findings = classifyMobileSnapshot(mobile, baseline());
    expect(findings.filter((item) => item.severity === "error")).toHaveLength(0);
    expect(findings.filter((item) => item.severity === "advisory")).toHaveLength(2);
  });

  it("summarizes severity counts deterministically", () => {
    expect(
      summarizeFindings([
        { severity: "error" },
        { severity: "warning" },
        { severity: "warning" },
        { severity: "advisory" },
      ]),
    ).toEqual({ error: 1, warning: 2, advisory: 1, total: 4 });
  });
});

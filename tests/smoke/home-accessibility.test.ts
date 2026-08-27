import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

function relativeLuminance(hex: string): number {
  const channels = hex
    .replace("#", "")
    .match(/.{2}/g)
    ?.map((channel) => Number.parseInt(channel, 16) / 255);

  if (!channels || channels.length !== 3) {
    throw new Error(`Invalid hex color: ${hex}`);
  }

  const [red, green, blue] = channels.map((channel) =>
    channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4,
  );

  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

function contrastRatio(foreground: string, background: string): number {
  const lighter = Math.max(relativeLuminance(foreground), relativeLuminance(background));
  const darker = Math.min(relativeLuminance(foreground), relativeLuminance(background));
  return (lighter + 0.05) / (darker + 0.05);
}

describe("approved home accessibility tokens", () => {
  const css = readFileSync(new URL("../../src/styles/global.css", import.meta.url), "utf8");

  it("keeps normal-sized teal and muted text at WCAG AA contrast on white", () => {
    const tealInk = css.match(/--teal-ink:\s*(#[0-9a-f]{6})/i)?.[1];
    const muted = css.match(/--muted:\s*(#[0-9a-f]{6})/i)?.[1];

    expect(tealInk).toBeDefined();
    expect(muted).toBeDefined();
    expect(contrastRatio(tealInk!, "#ffffff")).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(muted!, "#ffffff")).toBeGreaterThanOrEqual(4.5);
  });

  it("preserves visible focus and reduced-motion handling", () => {
    expect(css).toContain("a:focus-visible");
    expect(css).toContain("@media (prefers-reduced-motion: reduce)");
  });
});

import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

function gitBlobSha(path: URL): string {
  const data = readFileSync(path);
  return createHash("sha1")
    .update(`blob ${data.length}\0`)
    .update(data)
    .digest("hex");
}

describe("approved Home visual contract", () => {
  const cover = new URL("../../public/book-cover-canonical.avif", import.meta.url);
  const audience = new URL("../../public/audience-approved.avif", import.meta.url);
  const atmosphere = new URL("../../public/hero-atmosphere-approved.webp", import.meta.url);
  const cssPath = new URL("../../src/styles/home-approved.css", import.meta.url);

  it("binds runtime media to the approved canonical assets", () => {
    expect(gitBlobSha(cover)).toBe("91bf9d0e8c891f3d81bb5bceb1d579d8a2247c55");
    expect(gitBlobSha(audience)).toBe("b35f379dd7b7acafb6c60c663e7c9b05a0129a48");
    expect(gitBlobSha(atmosphere)).toBe("36a553642892a7a5bd78ee88aada7454feb3def1");
  });

  it("binds the approved urban Home composition without regenerating the cover", () => {
    const css = readFileSync(cssPath, "utf8");

    expect(css).toContain("User-approved urban Home oracle: approved 2026-09-06");
    expect(css).toContain("--urban-gold: #d6a735");
    expect(css).toContain(".learn-section");
    expect(css).toContain(".audience-section");
    expect(css).toContain(".community-section");
    expect(css).toContain('url("/hero-atmosphere-approved.webp")');
    expect(css).toContain('url("/audience-approved.avif")');
    expect(css).not.toContain('url("/book-cover.webp")');
  });
});

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
  const cover = new URL("../../public/book-cover.webp", import.meta.url);
  const atmosphere = new URL("../../public/hero-atmosphere-approved.webp", import.meta.url);
  const cssPath = new URL("../../src/styles/home-approved.css", import.meta.url);

  it("binds runtime media to the approved canonical assets", () => {
    expect(gitBlobSha(cover)).toBe("8740a225a9f12a54087f06a79ec1e71b5f0eea1f");
    expect(gitBlobSha(atmosphere)).toBe("36a553642892a7a5bd78ee88aada7454feb3def1");
  });

  it("preserves the approved desktop minimum while allowing the hero to grow", () => {
    const css = readFileSync(cssPath, "utf8");

    expect(css).toContain("height: auto;\n    min-height: 494px;");
    expect(css).toContain("width: 300px");
    expect(css).toContain('url("/hero-atmosphere-approved.webp")');
    expect(css).not.toContain('url("/book-cover.webp")');
  });
});

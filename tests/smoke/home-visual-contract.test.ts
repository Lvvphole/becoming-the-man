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
  const audienceImage = new URL("../../public/who-this-is-for.webp", import.meta.url);
  const cssPath = new URL("../../src/styles/home-approved.css", import.meta.url);

  it("binds runtime media to the approved source-derived assets", () => {
    expect(gitBlobSha(cover)).toBe("8740a225a9f12a54087f06a79ec1e71b5f0eea1f");
    expect(gitBlobSha(audienceImage)).toBe("0b6398f15500c1f42df81b9daf1c46bda982f134");
  });

  it("binds the current approved urban Home treatment", () => {
    const css = readFileSync(cssPath, "utf8");

    expect(css).toContain("Oracle v2 approved 2026-09-06");
    expect(css).toContain(".oracle-v2 .learn-section");
    expect(css).toContain(".oracle-v2 .audience-section");
    expect(css).toContain(".oracle-v2 .community-section");
    expect(css).toContain('url("/book-cover.webp")');
  });
});

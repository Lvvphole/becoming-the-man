import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import BookRoute from "../../src/routes/book";
import HomeRoute from "../../src/routes/home";

describe("Sprint 1 route shells", () => {
  it("renders meaningful home HTML with book navigation", () => {
    const html = renderToStaticMarkup(<HomeRoute />);

    expect(html).toContain("Becoming the Man She Can Trust");
    expect(html).toContain('href="/book"');
  });

  it("renders meaningful book HTML with home navigation", () => {
    const html = renderToStaticMarkup(<BookRoute />);

    expect(html).toContain("BOOK ORIENTATION");
    expect(html).toContain('href="/"');
  });
});

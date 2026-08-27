import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { BookPage } from "../../src/routes/book";
import HomeRoute from "../../src/routes/home";

describe("R1-01 route rendering", () => {
  it("renders meaningful home HTML with book navigation", () => {
    const html = renderToStaticMarkup(<HomeRoute />);

    expect(html).toContain("Becoming the Man She Can Trust");
    expect(html).toContain('href="/book"');
  });

  it("renders book orientation and the configured external purchase action", () => {
    const html = renderToStaticMarkup(
      <BookPage purchase={{ status: "available", url: "https://example.test/book" }} />,
    );

    expect(html).toContain("BOOK ORIENTATION");
    expect(html).toContain("For readers asking what it takes to become someone who can be trusted");
    expect(html).toContain('href="https://example.test/book"');
    expect(html).toContain("Buy the book");
    expect(html).toContain("Purchase is completed at the configured retailer.");
    expect(html).toContain('href="/"');
  });

  it("does not render a false buy path when purchase configuration is unavailable", () => {
    const html = renderToStaticMarkup(
      <BookPage purchase={{ status: "unavailable", reason: "missing" }} />,
    );

    expect(html).toContain('data-purchase-status="unavailable"');
    expect(html).not.toContain("Buy the book");
    expect(html).not.toContain("example.test");
  });
});

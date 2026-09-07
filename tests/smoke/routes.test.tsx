import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { BookPage } from "../../src/routes/book";
import { HomePage } from "../../src/routes/home";

describe("R1-01 route rendering", () => {
  it("renders the approved home orientation, canonical framework, learning sections, and purchase action", () => {
    const html = renderToStaticMarkup(
      <HomePage purchase={{ status: "available", url: "https://example.test/book" }} />,
    );

    expect(html).toContain("<h1 id=\"home-title\">Becoming the Man She Can Trust</h1>");
    expect(html).toContain(
      "A SYSTEM FOR BUILDING THE LIFE, CHARACTER, AND LEADERSHIP THAT CREATE LASTING LOVE",
    );
    expect(html).toContain("EMORY HARRIS");
    expect(html).toContain('src="/book-cover.webp"');
    expect(html).toContain("Purpose Before Partnership");
    expect(html).toContain("Emotional Safety Comes Before Emotional Intensity");
    expect(html).toContain("Love Is a Practice");
    expect(html).toContain("WHAT YOU’LL");
    expect(html).toContain("build character before pursuing commitment");
    expect(html).toContain("WHO’S");
    expect(html).toContain("Men who want to become more trustworthy in love and life");
    expect(html).toContain("Women who want to understand the kind of man they can trust");
    expect(html).toContain("JOIN THE COMMUNITY");
    expect(html).toContain('href="#community"');
    expect(html).toContain('href="https://example.test/book"');
    expect(html).toContain("Get Your Copy");
  });

  it("does not render a false home buy path when purchase configuration is unavailable", () => {
    const html = renderToStaticMarkup(
      <HomePage purchase={{ status: "unavailable", reason: "missing" }} />,
    );

    expect(html).toContain('data-purchase-status="unavailable"');
    expect(html).not.toContain("Get Your Copy");
    expect(html).not.toContain("example.test");
  });

  it("keeps community capture visibly unavailable until the governed signup contract is implemented", () => {
    const html = renderToStaticMarkup(
      <HomePage purchase={{ status: "unavailable", reason: "missing" }} />,
    );

    expect(html).toContain('id="community-email"');
    expect(html).toContain("disabled=\"\"");
    expect(html).toContain("Community signup is not active yet.");
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

  it("does not render a false book buy path when purchase configuration is unavailable", () => {
    const html = renderToStaticMarkup(
      <BookPage purchase={{ status: "unavailable", reason: "missing" }} />,
    );

    expect(html).toContain('data-purchase-status="unavailable"');
    expect(html).not.toContain("Buy the book");
    expect(html).not.toContain("example.test");
  });
});

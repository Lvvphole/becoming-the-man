import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { BookPage } from "../../src/routes/book";
import { HomePage } from "../../src/routes/home";

describe("R1-01 route rendering", () => {
  it("renders the approved home orientation, canonical principles, and purchase action", () => {
    const html = renderToStaticMarkup(
      <HomePage purchase={{ status: "available", url: "https://example.test/book" }} />,
    );

    expect(html).toContain("<h1");
    expect(html).toContain("Becoming the Man She Can Trust</h1>");
    expect(html).toContain(
      "A SYSTEM FOR BUILDING THE LIFE, CHARACTER, AND LEADERSHIP THAT CREATE LASTING LOVE",
    );
    expect(html).toContain("EMORY HARRIS");
    expect(html).toContain('src="/book-cover.webp"');
    expect(html).toContain('class="book-3d"');
    expect(html).toContain("Character Before Chemistry");
    expect(html).toContain("Trust Is Built Daily");
    expect(html).toContain("Integrity Creates Predictability");
    expect(html).toContain("Communication Is Shared Meaning");
    expect(html).toContain("This is not a book about appearing better.");
    expect(html).toContain("It is a book about becoming better.");
    expect(html).toContain('href="#non-negotiables"');
    expect(html).toContain('href="https://example.test/book"');
    expect(html).toContain("Buy the book");
  });

  it("does not render a false home buy path when purchase configuration is unavailable", () => {
    const html = renderToStaticMarkup(
      <HomePage purchase={{ status: "unavailable", reason: "missing" }} />,
    );

    expect(html).toContain('data-purchase-status="unavailable"');
    expect(html).not.toContain("Buy the book");
    expect(html).not.toContain("example.test");
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

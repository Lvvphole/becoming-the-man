import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { HomePage } from "../../src/routes/home";

function renderHome(): string {
  return renderToStaticMarkup(
    <HomePage purchase={{ status: "available", url: "https://example.test/book" }} />,
  );
}

describe("mobile primary navigation", () => {
  it("moves the primary navigation out of the footer into a mobile header accordion", () => {
    const html = renderHome();

    expect(html).not.toContain('aria-label="Footer"');
    expect(html).toContain('<details class="mobile-nav">');
    expect(html).toContain('<summary aria-label="Navigation menu">');
    expect(html).toContain('<nav aria-label="Mobile primary">');
    expect(html).toContain('<a href="/book">Book</a>');
    expect(html).toContain('<a href="#non-negotiables">The 24 Non-Negotiables</a>');
    expect(html).toContain('<span aria-disabled="true">About</span>');
    expect(html).toContain('<span aria-disabled="true">Contact</span>');
    expect(html).toContain('<a href="#community">Newsletter</a>');
  });

  it("preserves the existing desktop primary navigation and legal footer", () => {
    const html = renderHome();

    expect(html).toContain('<nav class="site-nav" aria-label="Primary">');
    expect(html).toContain('<a href="/book">BOOK</a>');
    expect(html).toContain('<a href="#non-negotiables">THE 24 NON-NEGOTIABLES</a>');
    expect(html).toContain('<span aria-disabled="true">ABOUT</span>');
    expect(html).toContain('<span aria-disabled="true">CONTACT</span>');
    expect(html).toContain('<a href="#community">NEWSLETTER</a>');

    expect(html).toContain('<nav aria-label="Legal">');
    expect(html).toContain('<a href="/disclaimer">Disclaimer</a>');
    expect(html).toContain('<span aria-disabled="true">Privacy</span>');
    expect(html).toContain('<span aria-disabled="true">Terms</span>');
    expect(html).toContain('<span aria-disabled="true">Accessibility</span>');
  });
});

import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ContactPage } from "../../src/routes/contact";

describe("FR-105 contact page UI", () => {
  it("renders the required inquiry form with safe UI-only submission state", () => {
    const html = renderToStaticMarkup(<ContactPage />);

    expect(html).toContain(">CONTACT<");
    expect(html).toContain("Reader, media, speaking, or business inquiries.");
    expect(html).toContain('name="inquiryType"');
    expect(html).toContain(">Reader<");
    expect(html).toContain(">Media<");
    expect(html).toContain(">Speaking<");
    expect(html).toContain(">Business<");
    expect(html).toContain('name="name"');
    expect(html).toContain('autocomplete="name"');
    expect(html).toContain('name="email"');
    expect(html).toContain('type="email"');
    expect(html).toContain('autocomplete="email"');
    expect(html).toContain('name="message"');
    expect(html).toContain('href="/privacy"');
    expect(html).toContain("Online submission is temporarily unavailable.");
    expect(html).toContain("Send inquiry");
    expect(html).toContain("disabled");
    expect(html).not.toContain("action=");
  });
});

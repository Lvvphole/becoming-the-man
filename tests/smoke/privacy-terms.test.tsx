import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { PrivacyPage } from "../../src/routes/privacy";
import { TermsPage } from "../../src/routes/terms";

describe("R1 privacy and terms", () => {
  it("renders the privacy disclosure and legal navigation", () => {
    const html = renderToStaticMarkup(
      <PrivacyPage page={{
        slug: "privacy",
        title: "Privacy Policy",
        body: [
          "We collect your first name and email address when you join the community.",
          "Supabase stores subscriber and consent records. Resend manages email delivery.",
          "You may unsubscribe or request access, correction, or deletion where applicable.",
        ],
      }} />,
    );

    expect(html).toContain("PRIVACY POLICY");
    expect(html).toContain("Supabase");
    expect(html).toContain("Resend");
    expect(html).toContain("unsubscribe");
    expect(html).toContain("deletion");
    expect(html).toContain('href="/terms"');
    expect(html).toContain('aria-current="page"');
  });

  it("renders the terms and external-service boundary", () => {
    const html = renderToStaticMarkup(
      <TermsPage page={{
        slug: "terms",
        title: "Terms",
        body: [
          "The website is provided for educational and informational purposes.",
          "Website content and framework materials are protected intellectual property.",
          "Third-party retailers control their own transactions, terms, privacy practices, pricing, and fulfillment.",
        ],
      }} />,
    );

    expect(html).toContain("TERMS");
    expect(html).toContain("educational and informational purposes");
    expect(html).toContain("intellectual property");
    expect(html).toContain("Third-party retailers");
    expect(html).toContain('href="/privacy"');
    expect(html).toContain('aria-current="page"');
  });
});

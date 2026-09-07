import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { DisclaimerPage } from "../../src/routes/disclaimer";

const disclaimerPage = {
  slug: "disclaimer",
  title: "Disclaimer",
  body: [
    "Becoming the Man She Can Trust and the Love | Purpose | Flourish Relationship Operating System are educational frameworks designed to support reflection, communication, trust, responsibility, boundaries, repair, and healthier relationship behavior.",
    "The information, principles, tools, examples, and guidance presented on this website are for educational and informational purposes only. They are not a substitute for individualized medical, mental-health, legal, therapeutic, or other professional advice, diagnosis, or treatment. When circumstances require professional support, readers and users should seek assistance from an appropriately qualified professional.",
    "The framework does not guarantee reconciliation, attraction, commitment, sexual intimacy, relationship preservation, or any particular personal or relationship outcome. Individual circumstances differ, and users remain responsible for their own decisions, boundaries, safety, and actions.",
    "Nothing in this framework should be used to justify manipulation, coercion, surveillance, retaliation, sexual entitlement, abuse, or control. When a situation involves violence, coercive control, stalking, threats, sexual assault, suicidality, severe crisis, or immediate danger, personal safety and qualified professional or emergency support take priority over ordinary relationship guidance.",
  ],
} as const;

describe("Disclaimer legal page", () => {
  it("renders the approved disclaimer wording in the approved brand shell", () => {
    const html = renderToStaticMarkup(<DisclaimerPage page={disclaimerPage} />);

    expect(html).toContain("DISCLAIMER");
    expect(html).toContain("LOVE | PURPOSE | FLOURISH");
    expect(html).toContain("educational and informational purposes only");
    expect(html).toContain("does not guarantee reconciliation, attraction, commitment, sexual intimacy");
    expect(html).toContain("manipulation, coercion, surveillance, retaliation, sexual entitlement, abuse, or control");
    expect(html).toContain("personal safety and qualified professional or emergency support take priority");
    expect(html).toContain("© 2026 Emory Harris. All rights reserved.");
    expect(html).toContain('href="/disclaimer"');
    expect(html).toContain('href="/"');
  });
});

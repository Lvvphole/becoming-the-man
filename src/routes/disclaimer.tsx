import { useLoaderData } from "react-router";
import type { LegalPage } from "../../server/domain/legal-page";

const DISCLAIMER_CANONICAL_URL = "https://www.becomingthemanshecantrust.com/disclaimer";

export function meta() {
  return [
    { title: "Disclaimer | Becoming the Man She Can Trust" },
    {
      name: "description",
      content:
        "Educational, professional-scope, outcome, and safety boundaries for the Becoming the Man She Can Trust framework.",
    },
    { property: "og:title", content: "Disclaimer | Becoming the Man She Can Trust" },
    {
      property: "og:description",
      content:
        "Educational, professional-scope, outcome, and safety boundaries for the Becoming the Man She Can Trust framework.",
    },
    { property: "og:url", content: DISCLAIMER_CANONICAL_URL },
  ];
}

export function links() {
  return [{ rel: "canonical", href: DISCLAIMER_CANONICAL_URL }];
}

export async function loader() {
  const { loadLegalPage } = await import(
    "../../server/adapters/supabase-legal-pages.server"
  );
  const result = await loadLegalPage("disclaimer");

  if (result.status !== "available") {
    throw new Response("Disclaimer is temporarily unavailable.", {
      status: result.reason === "missing" ? 404 : 503,
    });
  }

  return { page: result.page };
}

export function DisclaimerPage({ page }: { page: LegalPage }) {
  return (
    <div className="site-page urban-home legal-page">
      <header className="site-header urban-header">
        <a className="brand-mark brand-lockup" href="/" aria-label="Becoming the Man She Can Trust home">
          <span>BECOMING</span>
          <span>THE MAN SHE CAN TRUST</span>
          <small>LOVE | PURPOSE | FLOURISH</small>
        </a>
        <nav className="site-nav" aria-label="Primary">
          <a href="/">HOME</a>
          <a href="/book">BOOK</a>
          <a href="/#non-negotiables">THE 24 NON-NEGOTIABLES</a>
          <a href="/#community">NEWSLETTER</a>
        </nav>
        <a className="header-purchase-link" href="/#purchase">
          Get Your Copy <span aria-hidden="true">→</span>
        </a>
      </header>

      <main className="legal-main">
        <section className="legal-hero" aria-labelledby="disclaimer-title">
          <p className="legal-eyebrow">LOVE | PURPOSE | FLOURISH</p>
          <h1 id="disclaimer-title">{page.title.toUpperCase()}</h1>
          <div className="legal-gold-rule" aria-hidden="true" />
        </section>

        <section className="legal-content-section" aria-label="Disclaimer details">
          <article className="legal-card">
            <p className="legal-copyright">© 2026 Emory Harris. All rights reserved.</p>
            <div className="legal-body">
              {page.body.map((paragraph, index) => {
                const className =
                  index === 0
                    ? "legal-lead"
                    : index === page.body.length - 1
                      ? "legal-safety"
                      : undefined;

                return <p className={className} key={paragraph}>{paragraph}</p>;
              })}
            </div>
            <a className="legal-return" href="/">Return Home <span aria-hidden="true">→</span></a>
          </article>
        </section>
      </main>

      <footer className="site-footer urban-footer">
        <div className="footer-brand">
          <strong>BECOMING<br />THE MAN SHE CAN TRUST</strong>
          <span>LOVE | PURPOSE | FLOURISH</span>
          <small>© 2026 Emory Harris. All rights reserved.</small>
        </div>
        <nav aria-label="Footer">
          <a href="/">Home</a>
          <a href="/book">Book</a>
          <a href="/#non-negotiables">The 24 Non-Negotiables</a>
          <a href="/#community">Newsletter</a>
        </nav>
        <nav aria-label="Legal">
          <a href="/disclaimer" aria-current="page">Disclaimer</a>
          <span aria-disabled="true">Privacy</span>
          <span aria-disabled="true">Terms</span>
          <span aria-disabled="true">Accessibility</span>
        </nav>
      </footer>
    </div>
  );
}

export default function DisclaimerRoute() {
  const { page } = useLoaderData<typeof loader>();
  return <DisclaimerPage page={page} />;
}

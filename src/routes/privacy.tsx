import { useLoaderData } from "react-router";
import type { LegalPage } from "../../server/domain/legal-page";

export function meta() {
  return [
    { title: "Privacy Policy | Becoming the Man She Can Trust" },
    {
      name: "description",
      content:
        "How Becoming the Man She Can Trust collects, uses, stores, and shares personal information.",
    },
  ];
}

export async function loader() {
  const { loadLegalPage } = await import(
    "../../server/adapters/supabase-legal-pages.server"
  );
  const result = await loadLegalPage("privacy");

  if (result.status !== "available") {
    throw new Response("Privacy Policy is temporarily unavailable.", {
      status: result.reason === "missing" ? 404 : 503,
    });
  }

  return { page: result.page };
}

export function PrivacyPage({ page }: { page: LegalPage }) {
  return (
    <div className="site-page urban-home legal-page">
      <header className="site-header urban-header">
        <a className="brand-mark brand-lockup" href="/" aria-label="Becoming the Man She Can Trust home">
          <span>BECOMING</span><span>THE MAN SHE CAN TRUST</span>
          <small>LOVE | PURPOSE | FLOURISH</small>
        </a>
        <nav className="site-nav" aria-label="Primary">
          <a href="/">HOME</a><a href="/book">BOOK</a>
          <a href="/#non-negotiables">THE 24 NON-NEGOTIABLES</a>
          <a href="/#community">NEWSLETTER</a>
        </nav>
        <a className="header-purchase-link" href="/#purchase">Get Your Copy <span aria-hidden="true">→</span></a>
      </header>
      <main className="legal-main">
        <section className="legal-hero" aria-labelledby="privacy-title">
          <p className="legal-eyebrow">LOVE | PURPOSE | FLOURISH</p>
          <h1 id="privacy-title">{page.title.toUpperCase()}</h1>
          <div className="legal-gold-rule" aria-hidden="true" />
        </section>
        <section className="legal-content-section" aria-label="Privacy Policy details">
          <article className="legal-card">
            <p className="legal-copyright">© 2026 Emory Harris. All rights reserved.</p>
            <div className="legal-body">
              {page.body.map((paragraph, index) => (
                <p className={index === 0 ? "legal-lead" : undefined} key={paragraph}>{paragraph}</p>
              ))}
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
        <nav aria-label="Legal">
          <a href="/disclaimer">Disclaimer</a><a href="/privacy" aria-current="page">Privacy</a>
          <a href="/terms">Terms</a><span aria-disabled="true">Accessibility</span>
        </nav>
      </footer>
    </div>
  );
}

export default function PrivacyRoute() {
  const { page } = useLoaderData<typeof loader>();
  return <PrivacyPage page={page} />;
}

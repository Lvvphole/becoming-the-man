import { useLoaderData } from "react-router";
import type { BookPurchaseDestination } from "../../server/domain/book-purchase";
import { BookPurchaseAction } from "../components/book-purchase-action";

export function meta() {
  return [
    { title: "Becoming the Man She Can Trust" },
    {
      name: "description",
      content:
        "A System for Building the Life, Character, and Leadership That Create Lasting Love",
    },
  ];
}

export async function loader() {
  const { loadBookPurchaseDestination } = await import(
    "../../server/adapters/supabase-site-settings.server"
  );

  return { purchase: await loadBookPurchaseDestination() };
}

const principles = [
  {
    title: "Character Before Chemistry",
    body: "Attraction may open the door, but character determines whether two people can build a life together.",
  },
  {
    title: "Purpose Before Partnership",
    body: "A relationship cannot permanently compensate for a lack of personal direction.",
  },
  {
    title: "Trust Is Built Daily",
    body: "Trust is rarely earned in one dramatic act. It grows through consistent, dependable behavior.",
  },
  {
    title: "Communication Is Shared Meaning",
    body: "The goal is not merely to exchange words but to build understanding.",
  },
] as const;

const learnItems = [
  "build character before pursuing commitment",
  "lead with integrity, responsibility, and emotional steadiness",
  "replace confusion and inconsistency with clarity and follow-through",
  "create the kind of life, presence, and love that can be trusted",
] as const;

const audienceItems = [
  "Men who want to become more trustworthy in love and life",
  "Women who want to understand the kind of man they can trust",
  "Readers pursuing emotional maturity, integrity, and self-control",
  "Couples and partners who value communication and shared meaning",
] as const;

export function HomePage({ purchase }: { purchase: BookPurchaseDestination }) {
  return (
    <div className="site-page urban-home">
      <header className="site-header urban-header">
        <a className="brand-mark brand-lockup" href="/" aria-label="Becoming the Man She Can Trust home">
          <span>BECOMING</span>
          <span>THE MAN SHE CAN TRUST</span>
          <small>LOVE | PURPOSE | FLOURISH</small>
        </a>
        <nav className="site-nav" aria-label="Primary">
          <a href="/book">BOOK</a>
          <a href="#non-negotiables">THE 24 NON-NEGOTIABLES</a>
          <span aria-disabled="true">ABOUT</span>
          <span aria-disabled="true">CONTACT</span>
          <a href="#community">NEWSLETTER</a>
        </nav>
        <a className="header-purchase-link" href="#purchase">Get Your Copy <span aria-hidden="true">→</span></a>
      </header>

      <main>
        <section className="home-hero urban-hero" aria-label="Becoming the Man She Can Trust">
          <div className="hero-copy">
            <p className="hero-brandline">LOVE | PURPOSE | FLOURISH</p>
            <h1>Becoming the Man She Can Trust</h1>
            <div className="hero-symbol-rule" aria-hidden="true"><span>∞</span></div>
            <p className="hero-subtitle">
              A SYSTEM FOR BUILDING THE LIFE, CHARACTER, AND LEADERSHIP THAT CREATE LASTING LOVE
            </p>
            <div className="hero-actions" id="purchase">
              {purchase.status === "available" ? (
                <BookPurchaseAction url={purchase.url} surface="home" label="Get Your Copy →" />
              ) : (
                <p className="purchase-unavailable" data-purchase-status="unavailable">
                  Purchase link is not available yet.
                </p>
              )}
              <a className="secondary-action" href="#community">Join the Community</a>
            </div>
          </div>

          <figure className="book-stage" aria-label="Becoming the Man She Can Trust book cover">
            <div className="book-3d">
              <span className="book-pages" aria-hidden="true" />
              <img
                className="book-cover-image"
                src="/book-cover-canonical.avif"
                width="520"
                height="786"
                alt="Becoming the Man She Can Trust by Emory Harris"
              />
            </div>
          </figure>

          <aside className="hero-values" aria-label="Love Purpose Flourish values">
            <span>CHARACTER</span>
            <span>PURPOSE</span>
            <span>TRUST</span>
            <span>LOVE</span>
            <span>FLOURISH</span>
          </aside>
        </section>

        <section id="principles" className="principle-band" aria-label="Selected Non-Negotiables">
          {principles.map((principle, index) => (
            <article className="principle-item" key={principle.title}>
              <span className="principle-number" aria-hidden="true">
                {["I", "II", "III", "IV"][index]}
              </span>
              <h2>{principle.title}</h2>
              <p>{principle.body}</p>
            </article>
          ))}
        </section>

        <section id="non-negotiables" className="framework-section" aria-labelledby="framework-title">
          <div className="framework-intro">
            <p className="section-eyebrow">THE 24 NON-NEGOTIABLES</p>
            <h2 id="framework-title">A Framework for Lasting Love</h2>
            <p>
              The Twenty-Four Non-Negotiables are not rules designed to eliminate every disagreement or hardship. They are commitments that healthy partners repeatedly make to themselves and to one another. They describe the kind of relationship worth building and the kind of person worth becoming.
            </p>
            <a className="framework-action" href="#framework-list">
              Explore the 24 Non-Negotiables <span aria-hidden="true">→</span>
            </a>
          </div>

          <div id="framework-list" className="framework-card" aria-label="Selected items from the Twenty-Four Non-Negotiables">
            <ol>
              <li><span>1</span>Character Before Chemistry</li>
              <li><span>2</span>Purpose Before Partnership</li>
              <li><span>3</span>Trust Is Built Daily</li>
              <li><span>4</span>Emotional Safety Comes Before Emotional Intensity</li>
              <li><span>5</span>Integrity Creates Predictability</li>
              <li className="framework-ellipsis" aria-hidden="true">•••</li>
              <li><span>24</span>Love Is a Practice</li>
            </ol>
            <a className="secondary-link" href="#principles">
              View selected principles <span aria-hidden="true">→</span>
            </a>
          </div>

          <blockquote className="becoming-quote">
            <p>This is not a book about appearing better.</p>
            <p>It is a book about becoming better.</p>
          </blockquote>
        </section>

        <section className="learn-section" aria-labelledby="learn-title">
          <div className="section-heading display-heading" id="learn-title">
            <span>WHAT YOU’LL</span> <strong>LEARN</strong>
          </div>
          <div className="paper-card learn-card">
            <h2>Inside This Book You’ll Discover:</h2>
            <ul>
              {learnItems.map((item) => (
                <li key={item}><span aria-hidden="true">✓</span>{item}</li>
              ))}
            </ul>
          </div>
        </section>

        <section className="audience-section" aria-labelledby="audience-title">
          <div className="audience-copy">
            <div className="section-heading display-heading" id="audience-title">
              <span>WHO’S</span> <strong>THIS FOR</strong>
            </div>
            <ul>
              {audienceItems.map((item) => (
                <li key={item}><span aria-hidden="true">✓</span>{item}</li>
              ))}
            </ul>
          </div>
          <img
            className="audience-visual"
            src="/audience-approved.avif"
            width="481"
            height="225"
            alt=""
            aria-hidden="true"
            style={{ display: "block", width: "100%", height: "100%", objectFit: "cover" }}
          />
        </section>

        <section id="community" className="community-section" aria-labelledby="community-title">
          <p className="community-eyebrow">STAY CONNECTED</p>
          <h2 id="community-title">JOIN THE COMMUNITY</h2>
          <p>
            Stay connected to <em>Becoming the Man She Can Trust</em> and receive future communications from the author.
          </p>
          <div className="community-form" aria-describedby="community-status">
            <label className="sr-only" htmlFor="community-email">Email address</label>
            <input id="community-email" type="email" placeholder="Your email address" disabled />
            <button type="button" disabled>Join the Community</button>
          </div>
          <p className="community-note" id="community-status">Community signup will be available soon.</p>
        </section>
      </main>

      <footer className="site-footer urban-footer">
        <div className="footer-brand">
          <strong>BECOMING<br />THE MAN SHE CAN TRUST</strong>
          <span>LOVE | PURPOSE | FLOURISH</span>
          <small>© 2026 Emory Harris. All rights reserved.</small>
        </div>
        <nav aria-label="Footer">
          <a href="/book">Book</a>
          <a href="#non-negotiables">The 24 Non-Negotiables</a>
          <span aria-disabled="true">About</span>
          <span aria-disabled="true">Contact</span>
          <a href="#community">Newsletter</a>
        </nav>
        <nav aria-label="Legal">
          <a href="/disclaimer">Disclaimer</a>
          <span aria-disabled="true">Privacy</span>
          <span aria-disabled="true">Terms</span>
          <span aria-disabled="true">Accessibility</span>
        </nav>
      </footer>
    </div>
  );
}

export default function HomeRoute() {
  const { purchase } = useLoaderData<typeof loader>();
  return <HomePage purchase={purchase} />;
}

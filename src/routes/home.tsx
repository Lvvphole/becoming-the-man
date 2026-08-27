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
    title: "Trust Is Built Daily",
    body: "Trust is rarely earned in one dramatic act. It grows through consistent, dependable behavior.",
  },
  {
    title: "Integrity Creates Predictability",
    body: "Words matter. Actions matter more. Alignment between them creates confidence.",
  },
  {
    title: "Communication Is Shared Meaning",
    body: "The goal is not merely to exchange words but to build understanding.",
  },
] as const;

export function HomePage({ purchase }: { purchase: BookPurchaseDestination }) {
  return (
    <div className="site-page">
      <header className="site-header">
        <a className="brand-mark" href="/" aria-label="Love Purpose Flourish home">
          LOVE | PURPOSE | FLOURISH
        </a>
        <nav className="site-nav" aria-label="Primary">
          <a href="/book">BOOK</a>
          <a href="#non-negotiables">THE 24 NON-NEGOTIABLES</a>
          <span aria-disabled="true">ABOUT</span>
          <span aria-disabled="true">CONTACT</span>
          <span aria-disabled="true">NEWSLETTER</span>
        </nav>
      </header>

      <main>
        <section className="home-hero">
          <div className="hero-copy">
            <h1>Becoming the Man She Can Trust</h1>
            <div className="accent-rule" aria-hidden="true" />
            <p className="hero-subtitle">
              A SYSTEM FOR BUILDING THE LIFE, CHARACTER, AND LEADERSHIP THAT CREATE LASTING LOVE
            </p>
            <p className="hero-author">EMORY HARRIS</p>
            <p className="hero-description">
              In a world where charm is often mistaken for character, trust is built another way. <em>Becoming the Man She Can Trust</em> is a practical and thought-provoking guide for men who want to grow beyond inconsistency, ego, and emotional immaturity. It calls men to become steady, honest, disciplined, and safe, not through performance, but through transformation.
            </p>
            <div className="hero-action">
              {purchase.status === "available" ? (
                <BookPurchaseAction url={purchase.url} surface="home" />
              ) : (
                <p className="purchase-unavailable" data-purchase-status="unavailable">
                  Purchase link is not available yet.
                </p>
              )}
            </div>
          </div>

          <figure className="book-stage" aria-label="Becoming the Man She Can Trust book cover">
            <div className="book-3d">
              <span className="book-pages" aria-hidden="true" />
              <img
                className="book-cover-image"
                src="/book-cover.webp"
                width="240"
                height="365"
                alt="Becoming the Man She Can Trust by Emory Harris"
              />
            </div>
          </figure>

          <blockquote className="communication-quote">
            <p className="quote-principle">Communication Is Shared Meaning.</p>
            <span className="quote-symbol" aria-hidden="true">∞</span>
            <p>The goal is not merely to exchange words but to build understanding.</p>
          </blockquote>
        </section>

        <section id="principles" className="principle-band" aria-label="Selected Non-Negotiables">
          {principles.map((principle) => (
            <article className="principle-item" key={principle.title}>
              <h2>{principle.title}</h2>
              <p>{principle.body}</p>
            </article>
          ))}
        </section>

        <section id="non-negotiables" className="framework-section" aria-labelledby="framework-title">
          <div className="framework-intro">
            <p className="section-eyebrow">THE 24 NON-NEGOTIABLES</p>
            <h2 id="framework-title">The Standard That Changes Everything</h2>
            <div className="accent-rule" aria-hidden="true" />
            <p>
              The framework names the principles a man must embody to become trustworthy in real relationships.
            </p>
            <a className="secondary-link" href="#framework-list">
              Explore the 24 Non-Negotiables <span aria-hidden="true">→</span>
            </a>
          </div>

          <div id="framework-list" className="framework-card">
            <p className="section-eyebrow">INSIDE THE FRAMEWORK</p>
            <ol>
              <li><span>1</span>Character Before Chemistry</li>
              <li><span>2</span>Trust Is Built Daily</li>
              <li><span>3</span>Integrity Creates Predictability</li>
              <li className="framework-ellipsis" aria-hidden="true">•••</li>
              <li><span>14</span>Communication Is Shared Meaning</li>
            </ol>
            <a className="secondary-link" href="#principles">
              View the framework <span aria-hidden="true">→</span>
            </a>
          </div>

          <blockquote className="becoming-quote">
            <p>This is not a book about appearing better.</p>
            <p>It is a book about becoming better.</p>
          </blockquote>
        </section>
      </main>

      <footer className="site-footer">
        <span>LOVE | PURPOSE | FLOURISH</span>
        <nav aria-label="Legal">
          <span aria-disabled="true">PRIVACY</span>
          <span aria-disabled="true">TERMS</span>
          <span aria-disabled="true">ACCESSIBILITY</span>
        </nav>
      </footer>
    </div>
  );
}

export default function HomeRoute() {
  const { purchase } = useLoaderData<typeof loader>();
  return <HomePage purchase={purchase} />;
}

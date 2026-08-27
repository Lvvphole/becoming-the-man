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

export function HomePage({ purchase }: { purchase: BookPurchaseDestination }) {
  return (
    <div className="site-page">
      <header className="site-header">
        <a className="brand-mark" href="/" aria-label="Love Purpose Flourish home">
          LOVE | PURPOSE | FLOURISH
        </a>
        <nav className="site-nav" aria-label="Primary">
          <a href="/book">BOOK</a>
          <span aria-disabled="true">ABOUT</span>
          <span aria-disabled="true">CONTACT</span>
          <span aria-disabled="true">NEWSLETTER</span>
        </nav>
      </header>

      <main>
        <section className="home-hero" aria-labelledby="home-title">
          <div className="hero-copy">
            <h1 id="home-title">
              <span>BECOMING THE MAN</span>
              <span>SHE CAN TRUST</span>
            </h1>
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
                <BookPurchaseAction url={purchase.url} />
              ) : (
                <p className="purchase-unavailable" data-purchase-status="unavailable">
                  Purchase link is not available yet.
                </p>
              )}
            </div>
          </div>

          <div className="book-visual">
            <img
              src="/book-cover.webp"
              width="240"
              height="365"
              alt="Becoming the Man She Can Trust by Emory Harris"
            />
          </div>

          <blockquote className="communication-quote">
            <span className="quote-mark" aria-hidden="true">“</span>
            <p className="quote-principle">Communication is Shared Meaning.</p>
            <p>The goal is not merely to exchange words but to build understanding.</p>
          </blockquote>
        </section>

        <section className="book-highlights" aria-labelledby="trust-question">
          <div className="highlights-copy">
            <h2 id="trust-question">
              WHAT KIND OF MAN CAN A WOMAN TRUST WITH HER HEART, HER PEACE, AND HER FUTURE?
            </h2>
            <div className="accent-rule" aria-hidden="true" />
            <h3>IN THIS BOOK, YOU WILL LEARN HOW TO:</h3>
            <ul>
              <li>build character before pursuing commitment</li>
              <li>lead with integrity, responsibility, and emotional steadiness</li>
              <li>replace confusion and inconsistency with clarity and follow-through</li>
              <li>create the kind of life, presence, and love that can be trusted</li>
            </ul>
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

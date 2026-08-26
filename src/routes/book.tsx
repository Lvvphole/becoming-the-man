import type { Route } from "./+types/book";

import { BookCta } from "../features/book/book-cta";
import { getBookPurchaseDestination } from "../../server/site-settings.server";
import { getPublicPageContext } from "../../server/page-context.server";

const title = "The Book | Becoming the Man She Can Trust";
const description =
  "Becoming the Man She Can Trust by Emory Harris — a system for building the life, character, and leadership that create lasting love.";

export function headers() {
  return {
    "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
  };
}

export async function loader() {
  const [destination, page] = await Promise.all([
    getBookPurchaseDestination(),
    Promise.resolve(getPublicPageContext("/book")),
  ]);

  return {
    destination,
    ...page,
  };
}

export function meta({ loaderData }: Route.MetaArgs) {
  const bookSchema = {
    "@context": "https://schema.org",
    "@type": "Book",
    name: "Becoming the Man She Can Trust",
    author: {
      "@type": "Person",
      name: "Emory Harris",
    },
    isbn: "9798192172414",
  };

  const meta = [
    { title },
    { name: "description", content: description },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { name: "robots", content: loaderData.robots },
    { "script:ld+json": bookSchema },
  ];

  if (loaderData.canonicalUrl) {
    meta.push({
      tagName: "link",
      rel: "canonical",
      href: loaderData.canonicalUrl,
    } as never);
    meta.push({
      property: "og:url",
      content: loaderData.canonicalUrl,
    } as never);
  }

  return meta;
}

export default function Book({ loaderData }: Route.ComponentProps) {
  return (
    <main>
      <section className="book-page" aria-labelledby="book-title">
        <a className="text-link" href="/">
          ← Home
        </a>
        <p className="eyebrow">LOVE | PURPOSE | FLOURISH</p>
        <h1 id="book-title">Becoming the Man She Can Trust</h1>
        <p className="subtitle">
          A System for Building the Life, Character, and Leadership That Create
          Lasting Love
        </p>
        <p className="byline">By Emory Harris</p>

        <div className="book-grid">
          <section aria-labelledby="for-title">
            <p className="section-kicker">WHO IT IS FOR</p>
            <h2 id="for-title">People who want to build a more trustworthy relationship and life.</h2>
            <p>
              The reader’s desired change is not simply more relationship
              advice. It is practicing trustworthy behavior.
            </p>
          </section>

          <section aria-labelledby="promise-title">
            <p className="section-kicker">THE CORE PROMISE</p>
            <h2 id="promise-title">Become capable of sustaining trust.</h2>
            <blockquote>
              “Trust is not something a woman gives a man. It is something a man
              becomes capable of sustaining.”
            </blockquote>
          </section>

          <section aria-labelledby="expect-title">
            <p className="section-kicker">WHAT TO EXPECT</p>
            <h2 id="expect-title">A system, not a shortcut.</h2>
            <p>
              The book focuses on building the life, character, and leadership
              that create lasting love.
            </p>
          </section>
        </div>

        <section className="purchase" aria-labelledby="purchase-title">
          <h2 id="purchase-title">Read the book</h2>
          {loaderData.destination ? (
            <>
              <p>
                Purchase is completed on the approved external book destination.
              </p>
              <BookCta
                href={loaderData.destination.href}
                destinationHost={loaderData.destination.host}
              />
            </>
          ) : (
            <p role="status" data-testid="purchase-unavailable">
              The live purchase destination has not been configured yet.
            </p>
          )}
        </section>
      </section>
    </main>
  );
}

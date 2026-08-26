import { Link } from "react-router";
import type { Route } from "./+types/home";

import { getPublicPageContext } from "../../server/page-context.server";

const title = "Becoming the Man She Can Trust";
const description =
  "A system for building the life, character, and leadership that create lasting love.";

export function headers() {
  return {
    "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
  };
}

export function loader() {
  return getPublicPageContext("/");
}

export function meta({ loaderData }: Route.MetaArgs) {
  const meta = [
    { title },
    { name: "description", content: description },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { name: "robots", content: loaderData.robots },
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

export default function Home() {
  return (
    <main>
      <section className="hero" aria-labelledby="home-title">
        <p className="eyebrow">LOVE | PURPOSE | FLOURISH</p>
        <h1 id="home-title">Becoming the Man She Can Trust</h1>
        <p className="subtitle">
          A System for Building the Life, Character, and Leadership That Create
          Lasting Love
        </p>
        <p className="lede">
          For people who want to build a more trustworthy relationship and life.
        </p>
        <blockquote>
          “Trust is not something a woman gives a man. It is something a man
          becomes capable of sustaining.”
        </blockquote>
        <p className="byline">Emory Harris</p>
        <div className="actions">
          <Link className="button button-primary" to="/book">
            Explore the book
          </Link>
        </div>
      </section>

      <section className="orientation" aria-labelledby="orientation-title">
        <p className="section-kicker">THE PRACTICE</p>
        <h2 id="orientation-title">Move from advice to trustworthy behavior.</h2>
        <p>
          The work is not simply to consume relationship advice. It is to build
          the character, responsibility, and repeated behavior capable of
          sustaining trust.
        </p>
      </section>
    </main>
  );
}

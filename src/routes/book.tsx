import { useLoaderData } from "react-router";
import type { BookPurchaseDestination } from "../../server/domain/book-purchase";

export function meta() {
  return [
    { title: "The Book | Becoming the Man She Can Trust" },
    {
      name: "description",
      content: "A brief orientation to Becoming the Man She Can Trust by Emory Harris.",
    },
  ];
}

export async function loader() {
  const { loadBookPurchaseDestination } = await import(
    "../../server/adapters/supabase-site-settings.server"
  );

  return { purchase: await loadBookPurchaseDestination() };
}

export function BookPage({ purchase }: { purchase: BookPurchaseDestination }) {
  return (
    <main className="shell">
      <p className="eyebrow">BOOK ORIENTATION</p>
      <h1>Becoming the Man She Can Trust</h1>
      <p>
        For readers asking what it takes to become someone who can be trusted, the book starts
        with character rather than performance.
      </p>
      <p>
        Original fictional stories are followed by evidence-informed psychology, practical
        application, and reflection on purpose, consistency, emotional safety, responsibility,
        boundaries, repair, and lasting love.
      </p>
      <section aria-labelledby="purchase-heading">
        <h2 id="purchase-heading">Read the book</h2>
        {purchase.status === "available" ? (
          <>
            <a className="primary-action" href={purchase.url} rel="external">
              Buy the book
            </a>
            <p className="purchase-note">Purchase is completed at the configured retailer.</p>
          </>
        ) : (
          <p data-purchase-status="unavailable">Purchase link is not available yet.</p>
        )}
      </section>
      <nav aria-label="Book navigation">
        <a href="/">Return home</a>
      </nav>
    </main>
  );
}

export default function BookRoute() {
  const { purchase } = useLoaderData<typeof loader>();
  return <BookPage purchase={purchase} />;
}

export function meta() {
  return [
    { title: "The Book | Becoming the Man She Can Trust" },
    {
      name: "description",
      content: "A brief orientation to Becoming the Man She Can Trust by Emory Harris.",
    },
  ];
}

export default function BookRoute() {
  return (
    <main className="shell">
      <p className="eyebrow">BOOK ORIENTATION</p>
      <h1>Becoming the Man She Can Trust</h1>
      <p>
        The book begins with character: the daily choices that make trust, emotional safety,
        responsibility, repair, and lasting love possible.
      </p>
      <p>
        This route is intentionally minimal in Sprint 1. It proves the server-rendered book path
        and navigation foundation without implementing later release behavior.
      </p>
      <nav aria-label="Book navigation">
        <a href="/">Return home</a>
      </nav>
    </main>
  );
}

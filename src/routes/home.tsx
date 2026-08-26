export function meta() {
  return [
    { title: "Becoming the Man She Can Trust" },
    {
      name: "description",
      content:
        "An introduction to Becoming the Man She Can Trust and the ideas behind the book.",
    },
  ];
}

export default function HomeRoute() {
  return (
    <main className="shell">
      <p className="eyebrow">LOVE | PURPOSE | FLOURISH</p>
      <h1>Becoming the Man She Can Trust</h1>
      <p className="subtitle">
        A System for Building the Life, Character, and Leadership That Create Lasting Love
      </p>
      <p>
        Begin with the book and the framework it introduces for becoming more trustworthy in
        real relationships.
      </p>
      <nav aria-label="Primary">
        <a href="/book">Explore the book</a>
      </nav>
    </main>
  );
}

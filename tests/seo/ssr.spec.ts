import { expect, test } from "@playwright/test";

test("home returns meaningful first-response HTML", async ({ request }) => {
  const response = await request.get("/");
  const html = await response.text();

  expect(response.ok()).toBe(true);
  expect(html).toContain("<h1");
  expect(html).toContain("Becoming the Man She Can Trust");
  expect(html).toContain('href="/book"');
  expect(html).toContain("<title>Becoming the Man She Can Trust</title>");
  expect(html).toContain('name="robots" content="noindex,nofollow"');
  expect(html).toContain('rel="canonical" href="https://example.test/"');
});

test("book returns primary content, configured CTA, metadata and Book JSON-LD in first response", async ({
  request,
}) => {
  const response = await request.get("/book");
  const html = await response.text();

  expect(response.ok()).toBe(true);
  expect(html).toContain("People who want to build a more trustworthy relationship and life.");
  expect(html).toContain('href="https://example.com/book"');
  expect(html).toContain("<title>The Book | Becoming the Man She Can Trust</title>");
  expect(html).toContain('rel="canonical" href="https://example.test/book"');
  expect(html).toContain('"@type":"Book"');
  expect(html).toContain("9798192172414");
});

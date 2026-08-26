import { expect, test } from "@playwright/test";

test("visitor can orient and reach the configured purchase destination when analytics fails", async ({
  page,
}) => {
  await page.route("**/api/analytics", (route) => route.abort());
  await page.route("https://example.com/book", (route) =>
    route.fulfill({
      status: 200,
      contentType: "text/html",
      body: "<title>Controlled destination</title><h1>Controlled destination</h1>",
    }),
  );

  await page.goto("/");
  await expect(
    page.getByRole("heading", { level: 1, name: "Becoming the Man She Can Trust" }),
  ).toBeVisible();

  await page.getByRole("link", { name: "Explore the book" }).click();

  await expect(page).toHaveURL(/\/book$/);
  await expect(
    page.getByText("People who want to build a more trustworthy relationship and life."),
  ).toBeVisible();

  const buy = page.getByRole("link", { name: "Buy the book" });
  await expect(buy).toHaveAttribute("href", "https://example.com/book");
  await buy.click();

  await expect(page).toHaveURL("https://example.com/book");
  await expect(page.getByRole("heading", { name: "Controlled destination" })).toBeVisible();
});

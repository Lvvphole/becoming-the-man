import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

for (const path of ["/", "/book"]) {
  test(`${path} has no blocking automated accessibility violations`, async ({ page }) => {
    await page.goto(path);

    const results = await new AxeBuilder({ page }).analyze();
    const blocking = results.violations.filter((violation) =>
      violation.impact === "critical" || violation.impact === "serious",
    );

    expect(blocking).toEqual([]);
  });
}

test("keyboard navigation reaches a visible-focus primary action", async ({ page }) => {
  await page.goto("/book");

  for (let attempt = 0; attempt < 8; attempt += 1) {
    await page.keyboard.press("Tab");
    const focusedText = await page.evaluate(
      () => document.activeElement?.textContent?.trim() ?? "",
    );
    if (focusedText === "Buy the book") {
      break;
    }
  }

  const buy = page.getByRole("link", { name: "Buy the book" });
  await expect(buy).toBeFocused();

  const outline = await buy.evaluate((element) =>
    getComputedStyle(element).outlineStyle,
  );
  expect(outline).not.toBe("none");
});

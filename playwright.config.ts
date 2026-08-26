import { defineConfig } from "@playwright/test";

const port = 4173;

export default defineConfig({
  testDir: ".",
  testMatch: [
    "tests/e2e/**/*.spec.ts",
    "tests/a11y/**/*.spec.ts",
    "tests/seo/**/*.spec.ts"
  ],
  timeout: 30_000,
  use: {
    baseURL: `http://127.0.0.1:${port}`,
    browserName: "chromium"
  },
  webServer: {
    command: `cross-env BOOK_PURCHASE_URL_FIXTURE=https://example.com/book CANONICAL_ORIGIN=https://example.test VERCEL_ENV=preview npm run dev -- --host 127.0.0.1 --port ${port}`,
    port,
    reuseExistingServer: false,
    timeout: 60_000
  }
});

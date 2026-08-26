import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: [
      "tests/**/*.test.ts",
      "supabase/tests/**/*.test.ts"
    ],
    coverage: {
      enabled: false
    }
  }
});

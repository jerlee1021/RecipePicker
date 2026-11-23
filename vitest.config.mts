import { defineConfig } from "vitest/config";

// Unit tests for the plain TypeScript in src/lib/ only, so the default "node"
// environment is enough: no jsdom or React plugin until we test components.
export default defineConfig({
  resolve: {
    // Lets tests import "@/lib/..." using the paths in tsconfig.json.
    tsconfigPaths: true,
  },
  test: {
    include: ["src/**/*.test.ts"],
  },
});

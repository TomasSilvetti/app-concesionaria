import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    include: [
      "app-concesionaria/src/__tests__/integration/**/*.integration.test.ts",
    ],
    environment: "node",
    passWithNoTests: true,
    env: {
      DATABASE_URL: process.env.DATABASE_TEST_URL ?? "",
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./app-concesionaria/src"),
    },
  },
});

import { defineConfig } from "vitest/config";
import path from "path";
import { config } from "dotenv";

config({ path: "./app-concesionaria/.env.test" });

export default defineConfig({
  test: {
    include: [
      "app-concesionaria/src/__tests__/integration/**/*.integration.test.ts",
    ],
    environment: "node",
    passWithNoTests: true,
    fileParallelism: false,
    globalSetup: "./vitest.integration.setup.ts",
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

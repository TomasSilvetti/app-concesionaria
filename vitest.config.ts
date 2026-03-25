import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    include: ["app-concesionaria/src/__tests__/**/*.test.ts"],
    environment: "node",
    passWithNoTests: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./app-concesionaria/src"),
    },
  },
});

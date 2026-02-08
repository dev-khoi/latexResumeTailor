import path from "path"
import { playwright } from "@vitest/browser-playwright"
import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          // an example of file based convention,
          // you don't have to follow it
          include: [
            "tests/unit/**/*.{test,spec}.ts",
            "tests/**/*.unit.{test,spec}.ts",
            "src/tests/**/*.{test,spec}.ts", // Added for src/tests directory
          ],
          name: "unit",
          environment: "node",
        },
      },
      {
        test: {
          // an example of file based convention,
          // you don't have to follow it
          include: [
            "tests/browser/**/*.{test,spec}.ts",
            "tests/**/*.browser.{test,spec}.ts",
          ],
          name: "browser",
          browser: {
            enabled: true,
            provider: playwright(),
            instances: [{ browser: "chromium" }],
          },
        },
      },
    ],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
})

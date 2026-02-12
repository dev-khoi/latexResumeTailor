import path from "path"
import { fileURLToPath } from "url"
import { defineConfig } from "vitest/config"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

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
    ],
  },
  resolve: {
    alias: [{ find: "@", replacement: path.resolve("src") }],
  },
})

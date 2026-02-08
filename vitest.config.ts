import path from "path"
import dotenv from "dotenv"
import { defineConfig } from "vitest/config"

dotenv.config({ path: path.resolve(__dirname, ".env.local") })

export default defineConfig({
  test: {
    environment: "node",
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
})

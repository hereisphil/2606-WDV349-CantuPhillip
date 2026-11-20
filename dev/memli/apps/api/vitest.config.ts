import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    include: ["src/**/*.test.ts"],
    // No test may reach the real breached-password list.
    setupFiles: ["src/test-setup.ts"],
  },
})

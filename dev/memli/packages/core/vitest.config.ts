import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    include: ["src/**/*.test.ts"],
    // The package has no tests until the scheduling helpers land (#132, task 2).
    // Remove this then, so an empty test run fails again.
    passWithNoTests: true,
  },
})

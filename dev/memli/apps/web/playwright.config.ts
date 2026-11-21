import { defineConfig, devices } from "@playwright/test"

const port = 4173
const baseURL = `http://127.0.0.1:${port}`

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  // A public repo's ubuntu-latest runner has 4 vCPUs. With 2, the suite ran
  // past verify.yml's 15 minute cap.
  workers: process.env.CI ? 4 : undefined,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      // A phone width: the layout, the hero and the top bar change below 768 px.
      name: "phone-375",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 375, height: 812 },
        isMobile: true,
        hasTouch: true,
      },
    },
  ],
  webServer: {
    command: `bunx vite --host 127.0.0.1 --port ${port} --strictPort`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      // Hide TanStack Router Devtools so axe only sees product UI.
      VITE_A11Y_AUDIT: "1",
    },
  },
})

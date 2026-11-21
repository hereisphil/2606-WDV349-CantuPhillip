import AxeBuilder from "@axe-core/playwright"
import type { Page } from "@playwright/test"
import { expect, test } from "./api"
import { previewNames } from "../src/routes/_app/-components/dashboard-previews"

type Theme = "light" | "dark"

const themes: Theme[] = ["light", "dark"]

/** `/dashboard`, every `?preview=` snapshot from #47, and a list narrowed by the Studying menu. */
const paths = [
  "/dashboard",
  ...previewNames.map((name) => `/dashboard?preview=${name}`),
  "/dashboard?preview=many-courses&studying=de",
]

async function openDashboard(
  page: Page,
  path: string,
  theme: Theme
): Promise<void> {
  await page.addInitScript((nextTheme) => {
    window.localStorage.setItem("theme", nextTheme)
  }, theme)
  await page.goto(path, { waitUntil: "load" })
  await expect(page.locator("main")).toBeVisible()
}

async function expectNoViolations(page: Page): Promise<void> {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .analyze()

  expect(
    results.violations,
    results.violations
      .map(
        (violation) =>
          `${violation.id} (${violation.impact}): ${violation.help}\n` +
          violation.nodes
            .map((node) => `  - ${node.target.join(" ")}`)
            .join("\n")
      )
      .join("\n")
  ).toEqual([])
}

test.describe("dashboard axe (WCAG 2.2 AA)", () => {
  for (const theme of themes) {
    for (const path of paths) {
      test(`${theme} ${path}`, async ({ page }) => {
        await openDashboard(page, path, theme)
        await expectNoViolations(page)
      })
    }

    // "Your progress" is closed by default, so its sentences and table need their own pass.
    test(`${theme} /dashboard with Your progress open`, async ({ page }) => {
      await openDashboard(page, "/dashboard", theme)
      await page
        .locator("section[aria-labelledby=progress-heading] summary")
        .click()
      await expect(page.getByRole("table")).toBeVisible()
      await expectNoViolations(page)
    })
  }
})

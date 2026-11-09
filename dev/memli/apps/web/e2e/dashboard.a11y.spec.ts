import AxeBuilder from "@axe-core/playwright"
import { expect, test, type Page } from "@playwright/test"
import { previewNames } from "../src/routes/_app/-components/dashboard-previews"

type Theme = "light" | "dark"

const themes: Theme[] = ["light", "dark"]

/** `/dashboard` plus every `?preview=` snapshot from #47. */
const paths = [
  "/dashboard",
  ...previewNames.map((name) => `/dashboard?preview=${name}`),
]

async function openDashboard(
  page: Page,
  path: string,
  theme: Theme
): Promise<void> {
  await page.addInitScript((nextTheme) => {
    window.localStorage.setItem("theme", nextTheme)
  }, theme)
  await page.goto(path, { waitUntil: "networkidle" })
  await expect(page.locator("main")).toBeVisible()
}

test.describe("dashboard axe (WCAG 2.2 AA)", () => {
  for (const theme of themes) {
    for (const path of paths) {
      test(`${theme} ${path}`, async ({ page }) => {
        await openDashboard(page, path, theme)

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
      })
    }
  }
})

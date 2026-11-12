import AxeBuilder from "@axe-core/playwright"
import { expect, test, type Page } from "@playwright/test"
import { studyPreviewNames } from "../src/routes/_session/-components/study-previews"

type Theme = "light" | "dark"

const themes: Theme[] = ["light", "dark"]

/** A study session plus every `?preview=` snapshot from #49: prompts, verdicts, and the session lifecycle. */
const base = "/study/spanish-core-1000?mode=review"
const paths = [
  base,
  ...studyPreviewNames.map((name) => `${base}&preview=${name}`),
]

async function openSession(
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

test.describe("study session axe (WCAG 2.2 AA)", () => {
  for (const theme of themes) {
    for (const path of paths) {
      test(`${theme} ${path}`, async ({ page }) => {
        await openSession(page, path, theme)
        // Answer previews fade in; let the animation settle so axe reads final colors.
        await page.waitForTimeout(400)

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

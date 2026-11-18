import AxeBuilder from "@axe-core/playwright"
import { expect, test } from "./api"
import { catalogPreviewNames } from "../src/routes/_catalog/-components/catalog-previews"

/** The public catalog (#174): every preview, signed out and signed in, both themes. */
const paths = [
  "/courses",
  "/courses?language=ja",
  ...catalogPreviewNames.map((name) => `/courses?preview=${name}`),
]

for (const signedOut of [true, false]) {
  test.describe(`catalog axe (WCAG 2.2 AA), ${signedOut ? "visitor" : "learner"}`, () => {
    test.use({ api: { signedOut } })

    for (const theme of ["light", "dark"] as const) {
      for (const path of paths) {
        test(`${theme} ${path}`, async ({ page }) => {
          await page.addInitScript((nextTheme) => {
            window.localStorage.setItem("theme", nextTheme)
          }, theme)
          await page.goto(path, { waitUntil: "networkidle" })
          await expect(page.locator("main")).toBeVisible()

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
}

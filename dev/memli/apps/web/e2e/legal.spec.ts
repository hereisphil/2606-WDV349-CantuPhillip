import AxeBuilder from "@axe-core/playwright"
import { expect, test } from "./api"

/** The legal pages (#170): readable by a visitor, linkable by section, no overflow. */
const paths = ["/terms"]

test.use({ api: { signedOut: true } })

for (const path of paths) {
  test.describe(path, () => {
    test("every contents link lands on its section", async ({ page }) => {
      await page.goto(path, { waitUntil: "networkidle" })
      await expect(page.locator("main h1")).toBeVisible()
      await expect(page.getByText(/coming soon/i)).toHaveCount(0)

      const links = page.locator('main nav a[href^="#"]')
      expect(await links.count()).toBeGreaterThan(0)
      for (const href of await links.evaluateAll((all) =>
        all.map((link) => link.getAttribute("href") ?? "")
      )) {
        await expect(page.locator(`main h2${href}`)).toHaveCount(1)
      }
    })

    for (const theme of ["light", "dark"] as const) {
      test(`axe (WCAG 2.2 AA), ${theme}`, async ({ page }) => {
        await page.addInitScript((nextTheme) => {
          window.localStorage.setItem("theme", nextTheme)
        }, theme)
        await page.goto(path, { waitUntil: "networkidle" })
        await expect(page.locator("main h1")).toBeVisible()

        const results = await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
          .analyze()
        expect(
          results.violations.map(
            (violation) => `${violation.id}: ${violation.help}`
          )
        ).toEqual([])
      })
    }

    for (const mode of ["long", "cjk", "rtl"] as const) {
      test(`${mode} text never scrolls sideways`, async ({
        page,
        isMobile,
      }) => {
        // A mobile browser zooms out to fit wide content, which hides overflow.
        test.skip(isMobile, "Runs once, in the desktop project.")

        for (const width of [320, 375, 1440]) {
          await page.setViewportSize({ width, height: 800 })
          await page.goto(`${path}?pseudo=${mode}`, {
            waitUntil: "networkidle",
          })
          await expect(page.locator("main h1")).toBeVisible()

          const scrollWidth = await page.evaluate(
            () => document.documentElement.scrollWidth
          )
          expect(
            scrollWidth,
            `${width} px scrolls sideways`
          ).toBeLessThanOrEqual(width)
        }
      })
    }
  })
}

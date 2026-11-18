import { expect, test } from "./api"

/**
 * With long, CJK and RTL text, nothing scrolls sideways and the dashboard's
 * main button stays on the first screen (REDESIGN.md section 12).
 */
const modes = ["long", "cjk", "rtl"] as const
const themes = ["light", "dark"] as const

/** Width x height. The landscape phone only checks overflow: its 375 px is too short for the hero. */
const sizes = [
  { width: 320, height: 568, fold: true },
  { width: 375, height: 667, fold: true },
  { width: 390, height: 844, fold: true },
  { width: 667, height: 375, fold: false },
  { width: 768, height: 1024, fold: true },
  { width: 1024, height: 768, fold: true },
  { width: 1440, height: 900, fold: true },
] as const

/** Study screens with the most text: a prompt, a revealed answer, and a mnemonic with its arrows. */
const study = "/study/spanish-core-1000?mode=learn"
const studyPaths = [
  study,
  `${study}&preview=long-revealed`,
  `${study}&preview=mnemonic-image`,
]

test.describe("study session pseudo-localization", () => {
  test.skip(({ isMobile }) => isMobile, "Runs once, in the desktop project.")

  for (const mode of modes) {
    for (const path of studyPaths) {
      for (const { width, height } of sizes) {
        test(`${mode} ${width}x${height} ${path}`, async ({ page }) => {
          await page.setViewportSize({ width, height })
          await page.goto(`${path}&pseudo=${mode}`, {
            waitUntil: "networkidle",
          })
          await expect(page.locator("main")).toBeVisible()

          const pageWidth = await page.evaluate(
            () => document.documentElement.scrollWidth
          )
          expect(pageWidth, "the page scrolls sideways").toBeLessThanOrEqual(
            width
          )
        })
      }
    }
  }
})

test.describe("dashboard pseudo-localization", () => {
  // The sizes are set here, so one browser project is enough.
  test.skip(({ isMobile }) => isMobile, "Runs once, in the desktop project.")

  for (const mode of modes) {
    for (const theme of themes) {
      for (const { width, height, fold } of sizes) {
        test(`${mode} ${theme} ${width}x${height}`, async ({ page }) => {
          await page.addInitScript((nextTheme) => {
            window.localStorage.setItem("theme", nextTheme)
          }, theme)
          await page.setViewportSize({ width, height })
          await page.goto(`/dashboard?pseudo=${mode}`, {
            waitUntil: "networkidle",
          })
          const mainButton = page
            .locator("section[aria-labelledby=study-hero-heading] a")
            .first()
          await expect(mainButton).toBeVisible()

          const pageWidth = await page.evaluate(
            () => document.documentElement.scrollWidth
          )
          expect(pageWidth, "the page scrolls sideways").toBeLessThanOrEqual(
            width
          )

          if (fold) {
            const box = await mainButton.boundingBox()
            expect(
              box?.y ?? Number.POSITIVE_INFINITY,
              "the main button starts below the first screen"
            ).toBeLessThan(height)
            expect(
              (box?.y ?? 0) + (box?.height ?? 0),
              "the main button is cut off by the first screen"
            ).toBeLessThanOrEqual(height)
          }
        })
      }
    }
  }
})

test.describe("catalog pseudo-localization", () => {
  test.skip(({ isMobile }) => isMobile, "Runs once, in the desktop project.")

  // Signed out and in: the marketing frame and the app's around the same list.
  for (const signedOut of [true, false]) {
    test.describe(signedOut ? "visitor" : "learner", () => {
      test.use({ api: { signedOut } })

      for (const mode of modes) {
        for (const { width, height } of sizes) {
          test(`${mode} ${width}x${height}`, async ({ page }) => {
            await page.setViewportSize({ width, height })
            await page.goto(`/courses?preview=long-text&pseudo=${mode}`, {
              waitUntil: "networkidle",
            })
            await expect(page.locator("main h1")).toBeVisible()

            const pageWidth = await page.evaluate(
              () => document.documentElement.scrollWidth
            )
            expect(pageWidth, "the page scrolls sideways").toBeLessThanOrEqual(
              width
            )
          })
        }
      }
    })
  }
})

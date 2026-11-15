import { expect, test, type Page } from "@playwright/test"

/**
 * After Reveal or Submit, the word and its meaning are both on screen and
 * not under the sticky header, and focus is on the answer. A plain `focus()`
 * once scrolled phones to the middle of the answer, past the meaning.
 */
const path = "/study/spanish-core-1000?mode=review"

async function expectWordAndMeaningInView(page: Page): Promise<void> {
  const answer = page.getByRole("region", { name: "Answer" })
  await expect(answer).toBeFocused()
  // Let the answer's fade-in settle before measuring.
  await page.waitForTimeout(400)

  const headerBottom = await page
    .locator("header")
    .evaluate((header) => header.getBoundingClientRect().bottom)
  const viewportHeight = page.viewportSize()?.height ?? 0

  for (const text of [
    page.locator("main p", { hasText: /^gato$/ }),
    answer.getByRole("heading", { name: "Meaning" }),
    answer.locator("p", { hasText: /^cat$/ }),
  ]) {
    const box = await text.boundingBox()
    expect(box, "not rendered").not.toBeNull()
    expect(box?.y ?? 0, "hidden under the header").toBeGreaterThanOrEqual(
      headerBottom
    )
    expect(
      (box?.y ?? 0) + (box?.height ?? 0),
      "below the first screen"
    ).toBeLessThanOrEqual(viewportHeight)
  }
}

const sizes = [
  { width: 360, height: 640 },
  { width: 375, height: 667 },
  { width: 1280, height: 800 },
] as const

test.describe("study session reveal", () => {
  // The sizes are set here, so one browser project is enough.
  test.skip(({ isMobile }) => isMobile, "Runs once, in the desktop project.")

  for (const { width, height } of sizes) {
    test(`Reveal answer at ${width}x${height}`, async ({ page }) => {
      await page.setViewportSize({ width, height })
      await page.goto(path, { waitUntil: "networkidle" })
      await page.getByRole("button", { name: "Reveal answer" }).click()
      await expectWordAndMeaningInView(page)
    })

    test(`Submit at ${width}x${height}`, async ({ page }) => {
      await page.setViewportSize({ width, height })
      await page.goto(path, { waitUntil: "networkidle" })
      await page.getByRole("textbox").fill("dog")
      await page.getByRole("button", { name: "Submit" }).click()
      await expectWordAndMeaningInView(page)
    })

    test(`Space to reveal after scrolling down at ${width}x${height}`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height })
      await page.goto(path, { waitUntil: "networkidle" })
      await page.evaluate(() => {
        window.scrollTo(0, document.documentElement.scrollHeight)
      })
      await page.keyboard.press("Space")
      await expectWordAndMeaningInView(page)
    })
  }
})

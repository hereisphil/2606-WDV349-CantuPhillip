import { expect, test, type Locator, type Page } from "@playwright/test"

/**
 * The response timer (#51): time from showing a word to Submit, paused while
 * the tab is hidden and capped by @workspace/core, so a break never counts
 * against the learner. Its only visible effect is the dock's nudge, so that
 * is what these check, on the real timer with Playwright's fake clock.
 *
 * "casa" means "house": a typo ("hous") is quick under 3.5 s and slow from 7 s
 * (`suggestOutcome`). The nudged choice is the one Enter confirms.
 */
const study = "/study/spanish-core-1000?mode=review"

/** Answers the first word (gato) so the casa prompt mounts, and its timer starts. */
async function openCasa(page: Page): Promise<void> {
  await page.clock.install()
  await page.goto(study, { waitUntil: "networkidle" })
  await page.getByRole("textbox").fill("cat")
  await page.getByRole("button", { name: "Submit" }).click()
  await page.keyboard.press("Enter")
  await expect(page.getByRole("region", { name: "Review" })).toContainText(
    "casa"
  )
}

async function setTabHidden(page: Page, hidden: boolean): Promise<void> {
  await page.evaluate((value) => {
    Object.defineProperty(document, "hidden", {
      configurable: true,
      get: () => value,
    })
    document.dispatchEvent(new Event("visibilitychange"))
  }, hidden)
}

async function submitTypo(page: Page): Promise<Locator> {
  await page.getByRole("textbox").fill("hous")
  await page.getByRole("button", { name: "Submit" }).click()
  return page.getByRole("group", { name: "Did you know it?" })
}

async function expectNudge(
  dock: Locator,
  nudged: "typo" | "unsure" | "none"
): Promise<void> {
  await expect(
    dock.getByRole("button", { name: "No, I wasn't sure" })
  ).toHaveAttribute("aria-keyshortcuts", nudged === "unsure" ? "Enter 1" : "1")
  await expect(
    dock.getByRole("button", { name: "Yes, just a typo" })
  ).toHaveAttribute("aria-keyshortcuts", nudged === "typo" ? "Enter 2" : "2")
}

test.describe("study session response timer", () => {
  test.skip(({ isMobile }) => isMobile, "Runs once, in the desktop project.")

  test("A quick typo reads as just a typo", async ({ page }) => {
    await openCasa(page)
    await page.clock.runFor(2_000)
    await expectNudge(await submitTypo(page), "typo")
  })

  test("A slow typo reads as unsure", async ({ page }) => {
    await openCasa(page)
    await page.clock.runFor(10_000)
    await expectNudge(await submitTypo(page), "unsure")
  })

  test("Time with the tab hidden doesn't count", async ({ page }) => {
    await openCasa(page)
    await setTabHidden(page, true)
    await page.clock.runFor(60_000)
    await setTabHidden(page, false)
    await page.clock.runFor(2_000)
    // Counted, the minute away would have made this too long to tell.
    await expectNudge(await submitTypo(page), "typo")
  })

  test("A long idle on screen nudges nothing, never “unsure”", async ({
    page,
  }) => {
    await openCasa(page)
    await page.clock.runFor(5 * 60_000)
    // Capped at 30 s: too long to say anything about the word, so no default.
    await expectNudge(await submitTypo(page), "none")
  })
})

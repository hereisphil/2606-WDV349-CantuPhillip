import type { Locator, Page } from "@playwright/test"
import { expect, test } from "./api"

/**
 * The session summary (#51): what a real session added up to, focus on the
 * result, the main action on a phone's first screen, and studying again.
 */
const study = "/study/spanish-core-1000?mode=learn"
const WORDS = 5

/** Space reveals the word on screen; a digit picks a dock choice by position. */
async function revealAndPick(page: Page, key: string): Promise<void> {
  await page.keyboard.press("Space")
  await expect(
    page.getByRole("group", { name: "Did you know it?" })
  ).toBeVisible()
  await page.keyboard.press(key)
}

function summary(page: Page): Locator {
  return page.getByRole("region", { name: "All done!" })
}

test.describe("study session summary", () => {
  test.skip(({ isMobile }) => isMobile, "Runs once, in the desktop project.")

  test("A session knew every word: all remembered, focus on the result", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto(study, { waitUntil: "networkidle" })
    for (let word = 0; word < WORDS; word += 1) {
      await revealAndPick(page, "3") // "Yes, I knew it"
    }

    await expect(summary(page)).toBeFocused()
    const stats = page.getByRole("list", { name: "Session results" })
    await expect(stats).toContainText("5words studied")
    await expect(stats).toContainText("100%remembered the first time")
    await expect(summary(page)).toContainText("You finished all 5 words")

    // The main action is on the first screen of a small phone.
    const back = page.getByRole("link", { name: "Back to dashboard" })
    const box = await back.boundingBox()
    expect(
      (box?.y ?? Infinity) + (box?.height ?? 0),
      "below the first screen"
    ).toBeLessThanOrEqual(667)
  })

  test("A missed word counts once, but not as remembered", async ({ page }) => {
    await page.goto(study, { waitUntil: "networkidle" })
    await revealAndPick(page, "1") // "No, I didn't": back at the end of the queue
    for (let word = 0; word < WORDS; word += 1) {
      await revealAndPick(page, "3")
    }

    const stats = page.getByRole("list", { name: "Session results" })
    await expect(stats).toContainText("5words studied")
    await expect(stats).toContainText("80%remembered the first time")
  })

  test("Each round counts only its own minutes", async ({ page }) => {
    await page.clock.install()
    await page.goto(study, { waitUntil: "networkidle" })
    const stats = page.getByRole("list", { name: "Session results" })

    await page.clock.runFor(3 * 60_000)
    for (let word = 0; word < WORDS; word += 1) {
      await revealAndPick(page, "3")
    }
    await expect(stats).toContainText("3minutes studied")

    await page.getByRole("button", { name: "Study these words again" }).click()
    await page.clock.runFor(60_000)
    for (let word = 0; word < WORDS; word += 1) {
      await revealAndPick(page, "3")
    }
    // Not 4: the first round's minutes stay with the first summary.
    await expect(stats).toContainText("1minute studied")
  })

  test("Studying again starts from the first word", async ({ page }) => {
    await page.goto(`${study}&preview=complete`, { waitUntil: "networkidle" })
    await page.getByRole("button", { name: "Study these words again" }).click()

    const prompt = page.getByRole("region", { name: "Learn new words" })
    await expect(prompt).toBeFocused()
    await expect(prompt).toContainText("gato")
    await expect(page.getByText("5 words left")).toBeVisible()
  })
})

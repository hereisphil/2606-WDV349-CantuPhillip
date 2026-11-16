import type { Page } from "@playwright/test"
import { expect, test } from "./api"

/**
 * Reviews save as they happen, retry safely and report failures (#112).
 * The API here is the stand-in in `api.ts`; `apps/api` tests the real one.
 */
const study = "/study/spanish-core-1000?mode=learn"
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/

/** Reveals the word on screen and picks a dock choice by its position. */
async function revealAndPick(page: Page, key: string): Promise<void> {
  await page.keyboard.press("Space")
  await expect(
    page.getByRole("group", { name: "Did you know it?" })
  ).toBeVisible()
  await page.keyboard.press(key)
}

// The mutation retries a server error three times, with backoff, first.
const afterRetries = { timeout: 15_000 }

test.describe("saving reviews", () => {
  test.skip(({ isMobile }) => isMobile, "Runs once, in the desktop project.")

  test("Each settled word is sent once, with its own id", async ({
    page,
    sentReviews,
  }) => {
    await page.goto(study, { waitUntil: "networkidle" })
    await revealAndPick(page, "1") // gato: "No, I didn't"
    await revealAndPick(page, "3") // casa: "Yes, I knew it"

    await expect.poll(() => sentReviews.length).toBe(2)
    expect(sentReviews.map(({ cardId, outcome }) => [cardId, outcome])).toEqual(
      [
        ["es-gato", "missed"],
        ["es-casa", "got_it"],
      ]
    )
    for (const review of sentReviews) {
      expect(review.reviewId).toMatch(uuid)
      // Whole milliseconds: browser timers measure fractions, the API takes integers.
      expect(Number.isInteger(review.durationMs)).toBe(true)
    }
    expect(new Set(sentReviews.map((review) => review.reviewId)).size).toBe(2)
  })

  test("A dev preview never saves anything", async ({ page, sentReviews }) => {
    // This preview replays answered words through the reducer.
    await page.goto(`${study}&preview=midway`, { waitUntil: "networkidle" })
    await revealAndPick(page, "3")

    await expect(page.getByRole("alert")).toHaveCount(0)
    expect(sentReviews).toEqual([])
  })
})

test.describe("when saving fails", () => {
  test.skip(({ isMobile }) => isMobile, "Runs once, in the desktop project.")
  test.use({ api: { reviewsFail: true } })

  test("The learner is told, and Try again resends the same reviews", async ({
    page,
    sentReviews,
  }) => {
    await page.goto(study, { waitUntil: "networkidle" })
    await revealAndPick(page, "3")

    const notice = page.getByRole("alert")
    await expect(notice).toContainText(
      "Some answers didn't save yet.",
      afterRetries
    )
    // Studying goes on: the next word is already on screen.
    await expect(page.getByText("4 words left")).toBeVisible()

    const firstId = sentReviews[0]?.reviewId
    const tries = sentReviews.length
    await notice.getByRole("button", { name: "Try again" }).click()

    await expect.poll(() => sentReviews.length).toBeGreaterThan(tries)
    // The same review, under the same id, so the API counts it once.
    expect(new Set(sentReviews.map((review) => review.reviewId))).toEqual(
      new Set([firstId])
    )
  })
})

test.describe("when the courses cannot load", () => {
  test.skip(({ isMobile }) => isMobile, "Runs once, in the desktop project.")
  test.use({ api: { coursesFail: true } })

  test("The dashboard says so and offers to try again", async ({ page }) => {
    await page.goto("/dashboard")

    const error = page.getByRole("alert")
    await expect(error).toContainText(
      "We couldn't load your courses",
      afterRetries
    )
    await expect(error.getByRole("button", { name: "Try again" })).toBeVisible()
  })
})

test.describe("the dashboard's history", () => {
  test.skip(({ isMobile }) => isMobile, "Runs once, in the desktop project.")

  test("Shows what the history route answers", async ({ page }) => {
    await page.goto("/dashboard", { waitUntil: "networkidle" })

    await expect(page.getByText("12 days of study")).toBeVisible()
    await page.getByText("Your progress", { exact: true }).last().click()
    const stats = page.locator("dl").first()
    await expect(stats).toContainText("84%")
    await expect(stats).toContainText("142")
  })

  test.describe("before any review of a word already met", () => {
    test.use({ api: { history: { retentionPercent: null, daysOfStudy: 0 } } })

    test("Leaves out reviews remembered and days of study", async ({
      page,
    }) => {
      await page.goto("/dashboard", { waitUntil: "networkidle" })

      await expect(page.getByText(/days? of study/)).toHaveCount(0)
      await page.getByText("Your progress", { exact: true }).last().click()
      await expect(page.locator("dl").first()).not.toContainText(
        "Reviews remembered"
      )
    })
  })
})

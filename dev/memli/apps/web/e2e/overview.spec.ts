import { expect, test } from "./api"

/** A course's overview (#174): one button for a visitor, more for a learner. */

const spanish = "/courses/spanish-core-1000"
const portuguese = "/courses/portuguese-essentials"

test.describe("from the catalog", () => {
  test.use({ api: { signedOut: true } })

  test("a row opens its course's overview, and back", async ({ page }) => {
    await page.goto("/courses", { waitUntil: "networkidle" })

    await page
      .getByRole("link", { name: "Japanese Hiragana & Katakana" })
      .click()
    await expect(page).toHaveURL(/\/courses\/japanese-kana$/)
    await expect(page.locator("main h1")).toHaveText(
      "Japanese Hiragana & Katakana"
    )

    await page.getByRole("link", { name: "All courses" }).click()
    await expect(page).toHaveURL(/\/courses$/)
  })
})

test.describe("a visitor", () => {
  test.use({ api: { signedOut: true } })

  test("has one button, which signs up and comes back to the course", async ({
    page,
  }) => {
    await page.goto(spanish, { waitUntil: "networkidle" })
    const main = page.locator("main")

    await expect(main.getByRole("button")).toHaveCount(0)
    await expect(main.getByText("Add to my courses")).toHaveCount(0)
    await main
      .getByRole("link", { name: "Start learning", exact: true })
      .click()

    await expect(page).toHaveURL(/\/signup\?/)
    const redirect = new URL(page.url()).searchParams.get("redirect")
    expect(redirect).toBe("/study/spanish-core-1000?mode=learn")
  })

  test("sees the course's first words and where they came from", async ({
    page,
  }) => {
    await page.goto(spanish, { waitUntil: "networkidle" })

    const words = page.getByRole("region", { name: "First words" })
    await expect(words.getByRole("listitem")).toHaveCount(5)
    await expect(words.locator('[lang="es"]').first()).toHaveText("gato")
    await expect(
      page.getByRole("region", { name: "About this course" })
    ).toContainText("Written for Memli")
  })

  test("is told when a course doesn't exist", async ({ page }) => {
    await page.goto("/courses/nope", { waitUntil: "networkidle" })

    await expect(page.getByRole("alert")).toContainText(
      "We couldn't find that course"
    )
    await expect(page.getByRole("button", { name: "Try again" })).toHaveCount(0)
    await expect(page.getByRole("link", { name: "All courses" })).toBeVisible()
  })
})

test.describe("a signed-in learner", () => {
  test("adds a course and stays on the page", async ({ page }) => {
    await page.goto(portuguese, { waitUntil: "networkidle" })

    await page.getByRole("button", { name: "Add to my courses" }).click()

    await expect(page.getByRole("status")).toContainText(
      "Added to your dashboard."
    )
    await expect(page).toHaveURL(new RegExp(`${portuguese}$`))
    // The fixture's Portuguese has nothing waiting today, so no Continue.
    await expect(page.locator("main")).toContainText("All done for today")
    await expect(
      page.getByRole("button", { name: "Remove from my courses" })
    ).toBeVisible()
  })

  test("starts learning: adds the course and opens its first words", async ({
    page,
  }) => {
    await page.goto(portuguese, { waitUntil: "networkidle" })
    const put = page.waitForRequest(
      (request) =>
        request.method() === "PUT" &&
        request.url().endsWith("/api/courses/portuguese-essentials/enrollment")
    )

    await page
      .locator("main")
      .getByRole("button", { name: "Start learning", exact: true })
      .click()

    await put
    await expect(page).toHaveURL(/\/study\/portuguese-essentials\?mode=learn/)
  })

  test("continues an added course, or takes it off and keeps going", async ({
    page,
  }) => {
    await page.goto(spanish, { waitUntil: "networkidle" })

    // Spanish has words to review in the dashboard's counts.
    await expect(page.getByRole("link", { name: "Continue" })).toHaveAttribute(
      "href",
      /mode=review/
    )

    await page.getByRole("button", { name: "Remove from my courses" }).click()

    await expect(page.getByRole("status")).toContainText(
      "Your progress is kept."
    )
    await expect(
      page.getByRole("button", { name: "Add to my courses" })
    ).toBeVisible()
  })
})

import { expect, test } from "./api"

/**
 * #174's two journeys, as a new learner with an empty dashboard. The API
 * stand-in adds courses as `apps/api` does: by button, or by a first review.
 */

const hero = "section[aria-labelledby=study-hero-heading]"

test.describe("signed in, a new learner", () => {
  test.use({ api: { newLearner: true } })

  test("browses, opens a course, adds it, and finds it on the dashboard", async ({
    page,
  }) => {
    // An empty dashboard sends them to the catalog.
    await page.goto("/dashboard", { waitUntil: "networkidle" })
    await expect(page.locator(hero)).toContainText("Pick your first course")
    await page
      .locator(hero)
      .getByRole("link", { name: "Find a course" })
      .click()

    // Browse, and open a course.
    await expect(page).toHaveURL(/\/courses$/)
    await page.getByRole("link", { name: "Portuguese Essentials" }).click()
    await expect(page.locator("main h1")).toHaveText("Portuguese Essentials")

    // Add it, and stay on its page.
    await page.getByRole("button", { name: "Add to my courses" }).click()
    await expect(page.getByRole("status")).toContainText(
      "Added to your dashboard."
    )
    await expect(page.locator("main")).toContainText("Added")

    // The dashboard now leads with it.
    await page.getByRole("link", { name: "Go to dashboard" }).click()
    await expect(page).toHaveURL(/\/dashboard$/)
    await expect(page.locator(hero)).toContainText("Portuguese Essentials")
    await expect(
      page.locator(hero).getByRole("link", { name: "Start learning" })
    ).toBeVisible()
  })
})

test.describe("signed out, a visitor", () => {
  test.use({ api: { newLearner: true, signedOut: true } })

  test("browses, starts a course, signs up, lands in it, and finds it on the dashboard", async ({
    page,
    sentReviews,
  }) => {
    // Browse the public catalog, and open a course.
    await page.goto("/courses", { waitUntil: "networkidle" })
    await page.getByRole("link", { name: "Spanish Core 1000" }).click()
    await expect(page.locator("main h1")).toHaveText("Spanish Core 1000")

    // Start learning asks for an account first.
    await page
      .locator("main")
      .getByRole("link", { name: "Start learning", exact: true })
      .click()
    await expect(page).toHaveURL(/\/signup\?/)
    await page.getByLabel("Name").fill("Ana")
    await page.getByLabel("Email address").fill("ana@memli.test")
    await page.getByLabel("Password").fill("Correct-horse-battery!")
    await page.getByRole("button", { name: "Create account" }).click()

    // Straight into the course's first words, not the dashboard.
    await expect(page).toHaveURL(/\/study\/spanish-core-1000\?mode=learn/)
    // The answer box has focus, as it should, so reveal with the button.
    await page.getByRole("button", { name: "Reveal answer" }).click()
    const dock = page.getByRole("group", { name: "Did you know it?" })
    await expect(dock).toBeVisible()
    await page.keyboard.press("3")
    await expect.poll(() => sentReviews.length).toBe(1)

    // The first saved review put the course on their dashboard.
    await page.getByRole("link", { name: /Exit/ }).click()
    await expect(page).toHaveURL(/\/dashboard$/)
    await expect(page.locator(hero)).toContainText("Spanish Core 1000")
  })
})

import { expect, test } from "./api"

/** The public course catalog (#174): open signed out, framed by who is here. */

test.describe("a visitor", () => {
  test.use({ api: { signedOut: true } })

  test("opens /courses without signing in, in the public site's frame", async ({
    page,
  }) => {
    await page.goto("/courses", { waitUntil: "networkidle" })

    await expect(page).toHaveURL(/\/courses$/)
    await expect(page.locator("main h1")).toHaveText("Courses")
    await expect(page.getByRole("link", { name: "Sign in" })).toBeVisible()
    await expect(
      page.getByRole("complementary", { name: "Application sidebar" })
    ).toHaveCount(0)
    await expect(page.locator("main li")).toHaveCount(4)
    await expect(page.locator("main")).not.toContainText("Added")
  })
})

test.describe("a signed-in learner", () => {
  test("sees the app's frame, and which courses they added", async ({
    page,
  }) => {
    await page.goto("/courses", { waitUntil: "networkidle" })

    await expect(
      page.getByRole("complementary", { name: "Application sidebar" })
    ).toBeVisible()
    await expect(
      page.locator("main li", { hasText: "Spanish Core 1000" })
    ).toContainText("Added")
    await expect(
      page.locator("main li", { hasText: "Portuguese Essentials" })
    ).not.toContainText("Added")
  })
})

test.describe("the language menu", () => {
  test.use({ api: { signedOut: true } })

  test("narrows the list to one language", async ({ page }) => {
    await page.goto("/courses", { waitUntil: "networkidle" })

    await page.getByRole("button", { name: "Language: All languages" }).click()
    await page.getByRole("menuitem", { name: "Japanese" }).click()

    await expect(page).toHaveURL(/language=ja/)
    await expect(page.locator("main li")).toHaveCount(1)
    await expect(page.locator("main li")).toContainText("Japanese")
  })

  test("drops a language no course teaches", async ({ page }) => {
    await page.goto("/courses?language=ko", { waitUntil: "networkidle" })

    await expect(page).toHaveURL(/\/courses$/)
    await expect(page.locator("main li")).toHaveCount(4)
  })
})

test.describe("when the catalog cannot load", () => {
  test.skip(({ isMobile }) => isMobile, "Runs once, in the desktop project.")
  test.use({ api: { signedOut: true, catalogFail: true } })

  test("says so and offers to try again", async ({ page }) => {
    await page.goto("/courses")

    // The query retries a server error three times, with backoff, first.
    await expect(page.getByRole("alert")).toContainText(
      "We couldn't load the courses",
      { timeout: 15_000 }
    )
    await expect(page.getByRole("button", { name: "Try again" })).toBeVisible()
  })
})

import { expect, manyCourses, test } from "./api"

/** A `?studying=` the Studying menu can't show is dropped before the page renders. */
test.describe("Studying filter in the URL", () => {
  test.skip(({ isMobile }) => isMobile, "Runs once, in the desktop project.")

  test("With no menu, the filter is dropped", async ({ page }) => {
    await page.goto("/dashboard?studying=es")
    await expect(page).toHaveURL(/\/dashboard$/)
  })

  test.describe("with the menu", () => {
    test.use({ api: { courses: manyCourses() } })

    test("A language the menu offers stays", async ({ page }) => {
      await page.goto("/dashboard?studying=de")
      await expect(
        page.getByRole("button", { name: /Studying: German/ })
      ).toBeVisible()
      await expect(page).toHaveURL(/\?studying=de$/)
    })

    test("A language the menu doesn't offer is dropped", async ({ page }) => {
      await page.goto("/dashboard?studying=fr")
      await expect(page).toHaveURL(/\/dashboard$/)
    })
  })
})

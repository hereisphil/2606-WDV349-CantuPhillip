import AxeBuilder from "@axe-core/playwright"
import type { Page } from "@playwright/test"
import { expect, test } from "./api"

/** `/signin` against the API stand-in (#108). */

async function fillSignIn(page: Page): Promise<void> {
  await page.getByLabel("Email address").fill("ana@memli.test")
  await page.getByLabel("Password").fill("Correct-horse-battery")
}

async function expectNoViolations(page: Page): Promise<void> {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .analyze()

  expect(
    results.violations.map(
      (violation) =>
        `${violation.id}: ${violation.nodes
          .map((node) => node.target.join(" "))
          .join(", ")}`
    )
  ).toEqual([])
}

test.describe("sign in", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/signin", { waitUntil: "networkidle" })
  })

  test("opens the dashboard after a good sign-in", async ({ page }) => {
    await fillSignIn(page)
    await page.getByRole("button", { name: "Sign in" }).click()

    await expect(page).toHaveURL(/\/dashboard$/)
  })

  test("sends the email and password as JSON", async ({ page }) => {
    const request = page.waitForRequest("**/api/auth/sign-in/email")
    await fillSignIn(page)
    await page.getByRole("button", { name: "Sign in" }).click()

    expect((await request).postDataJSON()).toEqual({
      email: "ana@memli.test",
      password: "Correct-horse-battery",
    })
  })

  test("names each field that needs fixing, and moves to the first", async ({
    page,
  }) => {
    await page.getByRole("button", { name: "Sign in" }).click()

    await expect(page.getByText("Enter a valid email address.")).toBeVisible()
    await expect(
      page.getByText("Password must be at least 8 characters.")
    ).toBeVisible()
    await expect(page.getByLabel("Email address")).toBeFocused()
    await expect(page).toHaveURL(/\/signin$/)
  })

  test("clears a field's error once the learner types in it", async ({
    page,
  }) => {
    await page.getByRole("button", { name: "Sign in" }).click()
    await page.getByLabel("Email address").fill("a")

    await expect(page.getByText("Enter a valid email address.")).toBeHidden()
    await expect(
      page.getByText("Password must be at least 8 characters.")
    ).toBeVisible()
  })

  test("has no prototype shortcut into the app", async ({ page }) => {
    await expect(page.getByText(/prototype/i)).toHaveCount(0)
    await expect(page.getByRole("link", { name: /skip/i })).toHaveCount(0)
  })

  for (const theme of ["light", "dark"] as const) {
    test(`passes axe with its errors showing (${theme})`, async ({ page }) => {
      await page.evaluate((next) => {
        window.localStorage.setItem("theme", next)
      }, theme)
      await page.reload({ waitUntil: "networkidle" })
      await page.getByRole("button", { name: "Sign in" }).click()
      await expect(page.getByLabel("Email address")).toBeFocused()

      await expectNoViolations(page)
    })
  }
})

test.describe("a refused sign-in", () => {
  test.use({
    api: { signInRefusal: { status: 401, code: "INVALID_EMAIL_OR_PASSWORD" } },
  })

  test("says one thing, and never which part was wrong", async ({ page }) => {
    await page.goto("/signin", { waitUntil: "networkidle" })
    await fillSignIn(page)
    await page.getByRole("button", { name: "Sign in" }).click()

    await expect(page.getByRole("alert")).toHaveText(
      "That email or password isn't right."
    )
    await expect(page).toHaveURL(/\/signin$/)
    // What the learner typed is still there to correct.
    await expect(page.getByLabel("Email address")).toHaveValue("ana@memli.test")
  })
})

test.describe("too many tries", () => {
  test.use({ api: { signInRefusal: { status: 429 } } })

  test("asks the learner to wait", async ({ page }) => {
    await page.goto("/signin", { waitUntil: "networkidle" })
    await fillSignIn(page)
    await page.getByRole("button", { name: "Sign in" }).click()

    await expect(page.getByRole("alert")).toHaveText(
      "Too many tries. Wait a moment, then try again."
    )
  })
})

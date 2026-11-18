import AxeBuilder from "@axe-core/playwright"
import type { Page } from "@playwright/test"
import { expect, test } from "./api"

/** `/signin` and `/signup` against the API stand-in (#108). */

async function fillSignIn(page: Page): Promise<void> {
  await page.getByLabel("Email address").fill("ana@memli.test")
  await page.getByLabel("Password").fill("Correct-horse-battery")
}

async function fillSignUp(page: Page, password: string): Promise<void> {
  await page.getByLabel("Name").fill("Ana")
  await page.getByLabel("Email address").fill("ana@memli.test")
  await page.getByLabel("Password").fill(password)
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

test.describe("sign up", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/signup", { waitUntil: "networkidle" })
  })

  test("opens the dashboard after creating an account", async ({ page }) => {
    const request = page.waitForRequest("**/api/auth/sign-up/email")
    await fillSignUp(page, "Correct-horse-battery")
    await page.getByRole("button", { name: "Create account" }).click()

    expect((await request).postDataJSON()).toEqual({
      name: "Ana",
      email: "ana@memli.test",
      password: "Correct-horse-battery",
    })
    await expect(page).toHaveURL(/\/dashboard$/)
  })

  test("names every password rule that is missed, before any request", async ({
    page,
  }) => {
    let sent = false
    page.on("request", (request) => {
      if (request.url().includes("/api/auth/")) sent = true
    })
    await fillSignUp(page, "correcthorse")
    await page.getByRole("button", { name: "Create account" }).click()

    await expect(page.getByText("Add a capital letter.")).toBeVisible()
    await expect(page.getByText("Add a symbol, like ! or #.")).toBeVisible()
    await expect(page.getByText("Add a lowercase letter.")).toBeHidden()
    await expect(page.getByLabel("Password")).toBeFocused()
    expect(sent).toBe(false)
  })

  test("says the rules up front, tied to the password field", async ({
    page,
  }) => {
    await expect(page.getByLabel("Password")).toHaveAccessibleDescription(
      /capital letter, a lowercase letter and a symbol/
    )
  })

  test("links to sign in, and sign in links back", async ({ page }) => {
    await page.getByRole("link", { name: "Sign in" }).click()
    await expect(page).toHaveURL(/\/signin$/)

    await page.getByRole("link", { name: "Create an account" }).click()
    await expect(page).toHaveURL(/\/signup$/)
  })

  for (const theme of ["light", "dark"] as const) {
    test(`passes axe with its errors showing (${theme})`, async ({ page }) => {
      await page.evaluate((next) => {
        window.localStorage.setItem("theme", next)
      }, theme)
      await page.reload({ waitUntil: "networkidle" })
      await page.getByRole("button", { name: "Create account" }).click()
      await expect(page.getByLabel("Name")).toBeFocused()

      await expectNoViolations(page)
    })
  }
})

for (const [label, signUpRefusal, message] of [
  [
    "an email that already has an account",
    { status: 422, code: "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL" },
    "That email already has an account. Sign in instead.",
  ],
  [
    "a password found in a breach",
    { status: 400, code: "PASSWORD_COMPROMISED" },
    "That password appeared in a data breach. Choose another one.",
  ],
  [
    "a code this app does not know",
    { status: 500, code: "SOMETHING_NEW" },
    "Something went wrong. Try again.",
  ],
] as const) {
  test.describe(`sign up refused for ${label}`, () => {
    test.use({ api: { signUpRefusal } })

    test("shows that reason and stays on the form", async ({ page }) => {
      await page.goto("/signup", { waitUntil: "networkidle" })
      await fillSignUp(page, "Correct-horse-battery")
      await page.getByRole("button", { name: "Create account" }).click()

      await expect(page.getByRole("alert")).toHaveText(message)
      await expect(page).toHaveURL(/\/signup$/)
    })
  })
}

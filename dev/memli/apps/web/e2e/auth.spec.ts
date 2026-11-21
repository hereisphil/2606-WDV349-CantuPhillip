import AxeBuilder from "@axe-core/playwright"
import type { Page } from "@playwright/test"
import { TERMS_VERSION } from "@workspace/schemas/auth/sign-up"
import { expect, test } from "./api"

/** `/signin`, `/signup` and the route guards against the API stand-in (#108). */

// The forms are for visitors who are not signed in yet.
test.use({ api: { signedOut: true } })

async function fillSignIn(page: Page): Promise<void> {
  await page.getByLabel("Email address").fill("ana@memli.test")
  await page.getByLabel("Password").fill("Correct-horse-battery")
}

async function fillSignUp(page: Page, password: string): Promise<void> {
  await page.getByLabel("Name").fill("Ana")
  await page.getByLabel("Email address").fill("ana@memli.test")
  await page.getByLabel("Password").fill(password)
  await termsBox(page).check()
}

function termsBox(page: Page): ReturnType<Page["getByRole"]> {
  return page.getByRole("checkbox", { name: /13 or older/ })
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
    api: {
      signedOut: true,
      signInRefusal: { status: 401, code: "INVALID_EMAIL_OR_PASSWORD" },
    },
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
  test.use({ api: { signedOut: true, signInRefusal: { status: 429 } } })

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
      acceptedTermsVersion: TERMS_VERSION,
    })
    await expect(page).toHaveURL(/\/dashboard$/)
  })

  test("asks for the Terms box before any request", async ({ page }) => {
    let sent = false
    page.on("request", (request) => {
      if (request.url().includes("/api/auth/")) sent = true
    })
    await fillSignUp(page, "Correct-horse-battery")
    await termsBox(page).uncheck()
    await page.getByRole("button", { name: "Create account" }).click()

    await expect(termsBox(page)).toBeFocused()
    await expect(termsBox(page)).toHaveAccessibleDescription(
      "Check the box to accept the Terms of Service."
    )
    expect(sent).toBe(false)

    // Ticking it clears the message.
    await termsBox(page).check()
    await expect(
      page.getByText("Check the box to accept the Terms of Service.")
    ).toBeHidden()
  })

  test("says a name that passes for Memli's is taken, before any request", async ({
    page,
  }) => {
    let sent = false
    page.on("request", (request) => {
      if (request.url().includes("/api/auth/")) sent = true
    })
    await fillSignUp(page, "Correct-horse-battery")
    await page.getByLabel("Name").fill("Memli Team")
    await page.getByRole("button", { name: "Create account" }).click()

    await expect(page.getByLabel("Name")).toBeFocused()
    await expect(page.getByLabel("Name")).toHaveAccessibleDescription(
      /That name is kept for the Memli team\. Choose another one\./
    )
    expect(sent).toBe(false)
  })

  test("links the Terms and the Privacy Policy in a new tab", async ({
    page,
  }) => {
    for (const [name, href] of [
      ["Terms of Service", "/terms"],
      ["Privacy Policy", "/privacy"],
    ] as const) {
      const link = page.locator("main").getByRole("link", { name })
      await expect(link).toHaveAttribute("href", href)
      await expect(link).toHaveAttribute("target", "_blank")
    }
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
    "Terms the API does not accept",
    { status: 400, code: "TERMS_NOT_ACCEPTED" },
    "Check the box to accept the Terms of Service.",
  ],
  [
    "a name that passes for Memli's",
    { status: 400, code: "NAME_RESERVED" },
    "That name is kept for the Memli team. Choose another one.",
  ],
  [
    "a code this app does not know",
    { status: 500, code: "SOMETHING_NEW" },
    "Something went wrong. Try again.",
  ],
] as const) {
  test.describe(`sign up refused for ${label}`, () => {
    test.use({ api: { signedOut: true, signUpRefusal } })

    test("shows that reason and stays on the form", async ({ page }) => {
      await page.goto("/signup", { waitUntil: "networkidle" })
      await fillSignUp(page, "Correct-horse-battery")
      await page.getByRole("button", { name: "Create account" }).click()

      await expect(page.getByRole("alert")).toHaveText(message)
      await expect(page).toHaveURL(/\/signup$/)
    })
  })
}

test.describe("pages that need a learner", () => {
  for (const path of ["/dashboard", "/study/spanish-core-1000?mode=learn"]) {
    test(`${path} sends a visitor to sign in, then back`, async ({ page }) => {
      await page.goto(path, { waitUntil: "networkidle" })
      await expect(page).toHaveURL(/\/signin\?redirect=/)

      await fillSignIn(page)
      await page.getByRole("button", { name: "Sign in" }).click()

      await expect(page).toHaveURL(
        (url) => `${url.pathname}${url.search}` === path
      )
    })
  }

  test("keeps the return path when the visitor signs up instead", async ({
    page,
  }) => {
    await page.goto("/dashboard", { waitUntil: "networkidle" })
    await page.getByRole("link", { name: "Create an account" }).click()
    await expect(page).toHaveURL(/\/signup\?redirect=%2Fdashboard/)

    await fillSignUp(page, "Correct-horse-battery")
    await page.getByRole("button", { name: "Create account" }).click()

    await expect(page).toHaveURL(/\/dashboard$/)
  })

  test("ignores a return path on another site", async ({ page }) => {
    await page.goto("/signin?redirect=//example.com/x", {
      waitUntil: "networkidle",
    })
    await fillSignIn(page)
    await page.getByRole("button", { name: "Sign in" }).click()

    await expect(page).toHaveURL(/localhost|127\.0\.0\.1/)
    await expect(page).toHaveURL(/\/dashboard$/)
  })

  test("the homepage stays open and offers to sign in", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" })

    await expect(page).toHaveURL(/\/$/)
    await expect(
      page.getByRole("banner").getByRole("link", { name: "Sign in" }).first()
    ).toBeVisible()
  })
})

test.describe("a signed-in learner", () => {
  test.use({ api: { signedOut: false } })

  for (const path of ["/signin", "/signup"]) {
    test(`skips ${path} and goes to the dashboard`, async ({ page }) => {
      await page.goto(path, { waitUntil: "networkidle" })

      await expect(page).toHaveURL(/\/dashboard$/)
    })
  }

  test("can still open the homepage, with the account menu", async ({
    page,
  }) => {
    await page.goto("/", { waitUntil: "networkidle" })

    await expect(page).toHaveURL(/\/$/)
    await expect(
      page
        .getByRole("banner")
        .getByRole("button", { name: "Account menu, Ana" })
        .first()
    ).toBeVisible()
  })
})

test.describe("a session that ends while the learner is in the app", () => {
  test.use({ api: { signedOut: false, sessionEnds: true } })

  test("sends them to sign in, then back to where they were", async ({
    page,
  }) => {
    await page.goto("/dashboard", { waitUntil: "networkidle" })

    await expect(page).toHaveURL(/\/signin\?redirect=%2Fdashboard/)
    await expect(page.getByRole("heading", { name: "Welcome!" })).toBeVisible()
  })
})

test.describe("signing out", () => {
  test.use({ api: { signedOut: false } })

  test("ends the session, lands on the homepage, and locks the app", async ({
    page,
  }) => {
    await page.goto("/dashboard", { waitUntil: "networkidle" })
    const signOut = page.waitForRequest("**/api/auth/sign-out")

    await page
      .getByRole("button", { name: /^Account menu, Ana/ })
      .filter({ visible: true })
      .click()
    await page.getByRole("menuitem", { name: "Sign out" }).click()

    expect((await signOut).method()).toBe("POST")
    await expect(page).toHaveURL(/\/$/)
    await expect(
      page.getByRole("banner").getByRole("link", { name: "Sign in" }).first()
    ).toBeVisible()

    await page.goto("/dashboard", { waitUntil: "networkidle" })
    await expect(page).toHaveURL(/\/signin\?redirect=%2Fdashboard/)
  })
})

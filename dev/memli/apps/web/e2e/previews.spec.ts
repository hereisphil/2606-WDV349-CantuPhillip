import { expect, test } from "./api"
import AxeBuilder from "@axe-core/playwright"
import type { Page } from "@playwright/test"
import { previewNames } from "../src/routes/_app/-components/dashboard-previews"
import {
  signInPreviews,
  signUpPreviews,
} from "../src/routes/_auth/-components/auth-previews"

/**
 * Dev `?preview=` snapshots open signed out, with a stand-in learner, and
 * never ask the API for anyone's data. Everything else still needs a session.
 */

test.use({ api: { signedOut: true } })

test.describe("signed out, dashboard previews", () => {
  for (const name of previewNames.filter((name) => name !== "load-error")) {
    test(`?preview=${name} opens as the stand-in learner`, async ({ page }) => {
      const dataRequests: string[] = []
      page.on("request", (request) => {
        const { pathname } = new URL(request.url())
        if (/^\/api\/(courses|history|reviews)/.test(pathname)) {
          dataRequests.push(pathname)
        }
      })

      await page.goto(`/dashboard?preview=${name}`, {
        waitUntil: "networkidle",
      })

      await expect(page).toHaveURL(new RegExp(`preview=${name}`))
      await expect(page.locator("main h1").first()).toContainText("Phillip")
      expect(dataRequests).toEqual([])
    })
  }
})

test.describe("signed out, study previews", () => {
  for (const name of ["default", "revealed", "mnemonic-image"]) {
    test(`?preview=${name} studies the fixture course`, async ({ page }) => {
      const dataRequests: string[] = []
      page.on("request", (request) => {
        const { pathname } = new URL(request.url())
        if (/^\/api\/(courses|history|reviews)/.test(pathname)) {
          dataRequests.push(pathname)
        }
      })

      await page.goto(`/study/spanish-core-1000?mode=learn&preview=${name}`, {
        waitUntil: "networkidle",
      })

      await expect(page).toHaveURL(new RegExp(`preview=${name}`))
      // A Spanish word on screen: a card, not an error or an empty session.
      await expect(page.locator('main [lang="es"]').first()).toBeVisible()
      expect(dataRequests).toEqual([])
    })
  }
})

test.describe("signed out, not a preview", () => {
  for (const path of [
    "/dashboard?preview=not-a-preview",
    "/study/spanish-core-1000?mode=learn&preview=not-a-preview",
    "/dashboard",
  ]) {
    test(`${path} still goes to sign in`, async ({ page }) => {
      await page.goto(path, { waitUntil: "networkidle" })

      await expect(page).toHaveURL(/\/signin\?redirect=/)
    })
  }
})

/** Requests for anyone's data, or to sign in: a preview makes none. */
function watchApi(page: Page): string[] {
  const calls: string[] = []
  page.on("request", (request) => {
    const { pathname } = new URL(request.url())
    if (/^\/api\/(courses|history|reviews|auth\/sign)/.test(pathname)) {
      calls.push(pathname)
    }
  })
  return calls
}

async function expectNoViolations(page: Page): Promise<void> {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .analyze()
  expect(results.violations.map((violation) => violation.id)).toEqual([])
}

test.describe("error previews", () => {
  test("dashboard load-error shows the failure and a way to try again", async ({
    page,
  }) => {
    await page.goto("/dashboard?preview=load-error", {
      waitUntil: "networkidle",
    })

    await expect(page.getByRole("alert")).toBeVisible()
    await expect(page.getByRole("button", { name: "Try again" })).toBeVisible()
    await expectNoViolations(page)
  })

  for (const [name, text] of [
    ["save-failed", "Some answers didn't save yet."],
    ["save-failed-complete", "Some answers didn't save yet."],
  ] as const) {
    test(`study ${name} shows the unsaved notice with Retry`, async ({
      page,
    }) => {
      await page.goto(`/study/spanish-core-1000?mode=learn&preview=${name}`, {
        waitUntil: "networkidle",
      })

      const notice = page.getByRole("alert").filter({ hasText: text })
      await expect(notice).toBeVisible()
      await expect(notice.getByRole("button")).toBeVisible()
      await expectNoViolations(page)
    })
  }

  test("study load-error shows the failure with Retry and a way back", async ({
    page,
  }) => {
    await page.goto("/study/spanish-core-1000?mode=learn&preview=load-error", {
      waitUntil: "networkidle",
    })

    await expect(page.getByRole("alert")).toBeVisible()
    await expect(page.getByRole("link", { name: /dashboard/i })).toBeVisible()
    await expectNoViolations(page)
  })
})

for (const [path, previews] of [
  ["/signin", signInPreviews],
  ["/signup", signUpPreviews],
] as const) {
  test.describe(`${path} previews`, () => {
    for (const [name, preview] of Object.entries(previews)) {
      test(`?preview=${name}: ${preview.description}`, async ({ page }) => {
        const calls = watchApi(page)
        await page.goto(`${path}?preview=${name}`, {
          waitUntil: "networkidle",
        })

        if (preview.shows === "submitting") {
          await expect(page.getByRole("button", { name: /…$/ })).toBeDisabled()
        } else if (preview.shows === "field-errors") {
          await expect(page.locator("form li").first()).toBeVisible()
        } else {
          await expect(page.getByRole("alert")).toBeVisible()
        }
        await expectNoViolations(page)
        expect(calls).toEqual([])
      })
    }
  })
}

test.describe("signed in, auth previews", () => {
  test.use({ api: { signedOut: false } })

  test("open instead of sending the learner to the dashboard", async ({
    page,
  }) => {
    await page.goto("/signin?preview=rate-limited", {
      waitUntil: "networkidle",
    })

    await expect(page).toHaveURL(/\/signin\?preview=rate-limited/)
    await expect(page.getByRole("alert")).toHaveText(
      "Too many tries. Wait a moment, then try again."
    )
  })

  test("a preview form never signs anyone in", async ({ page }) => {
    const calls = watchApi(page)
    await page.goto("/signin?preview=wrong-password", {
      waitUntil: "networkidle",
    })

    await page.getByRole("button", { name: "Sign in" }).click()

    await expect(
      page.getByRole("button", { name: "Signing in…" })
    ).toBeDisabled()
    expect(calls).toEqual([])
  })
})

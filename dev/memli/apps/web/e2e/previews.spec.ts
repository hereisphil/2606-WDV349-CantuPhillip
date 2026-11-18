import { expect, test } from "./api"
import { previewNames } from "../src/routes/_app/-components/dashboard-previews"

/**
 * Dev `?preview=` snapshots open signed out, with a stand-in learner, and
 * never ask the API for anyone's data. Everything else still needs a session.
 */

test.use({ api: { signedOut: true } })

test.describe("signed out, dashboard previews", () => {
  for (const name of previewNames) {
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

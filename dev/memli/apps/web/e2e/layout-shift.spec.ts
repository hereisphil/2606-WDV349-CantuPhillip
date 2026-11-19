import type { Page } from "@playwright/test"
import { expect, test } from "./api"
import { previewNames } from "../src/routes/_app/-components/dashboard-previews"
import { catalogPreviewNames } from "../src/routes/_catalog/-components/catalog-previews"
import { overviewPreviewNames } from "../src/routes/_catalog/-components/overview-previews"

/**
 * A page that scrolls and one that doesn't sit in the same place. A scrollbar
 * that takes up width once moved short pages about 7 px to the right (#174).
 */

// Playwright hides scrollbars by default. Show them, as a Mac with a mouse does.
test.use({
  launchOptions: { ignoreDefaultArgs: ["--hide-scrollbars"] },
  viewport: { width: 1440, height: 700 },
})
test.skip(
  ({ isMobile }) => isMobile,
  "Phones have no scrollbar that takes width."
)

/** Where the page's content starts: the dev switcher sits in the page's own container. */
async function contentStart(page: Page, path: string): Promise<number> {
  await page.goto(path, { waitUntil: "networkidle" })
  const box = await page.locator("main nav[data-dev-only]").boundingBox()
  if (box === null) throw new Error(`No preview switcher on ${path}`)
  return box.x
}

test("this browser's scrollbar takes up width, so the checks below mean something", async ({
  page,
}) => {
  await page.goto("/dashboard?preview=default", { waitUntil: "networkidle" })

  const scrollbar = await page.evaluate(() => {
    const probe = document.createElement("div")
    probe.style.cssText = "width:100px;height:100px;overflow:scroll"
    document.body.append(probe)
    const width = probe.offsetWidth - probe.clientWidth
    probe.remove()
    return width
  })
  expect(scrollbar).toBeGreaterThan(0)
})

test("every dashboard preview starts at the same place", async ({ page }) => {
  const starts: Record<string, number> = {}
  for (const name of previewNames) {
    starts[name] = await contentStart(page, `/dashboard?preview=${name}`)
  }

  // Short pages (no-courses, finished, one-course, load-error) and long ones alike.
  expect(new Set(Object.values(starts)).size, JSON.stringify(starts)).toBe(1)
})

test("every catalog preview starts at the same place", async ({ page }) => {
  const starts: Record<string, number> = {}
  for (const name of catalogPreviewNames) {
    starts[name] = await contentStart(page, `/courses?preview=${name}`)
  }
  // The overview shares the catalog's container, in every state.
  for (const name of overviewPreviewNames) {
    starts[`overview ${name}`] = await contentStart(
      page,
      `/courses/spanish-core-1000?preview=${name}`
    )
  }

  expect(new Set(Object.values(starts)).size, JSON.stringify(starts)).toBe(1)
})

test("opening a menu does not move the page", async ({ page }) => {
  const before = await contentStart(page, "/dashboard?preview=default")

  await page.getByRole("button", { name: /Theme/ }).first().click()
  await expect(page.getByRole("menu")).toBeVisible()

  const box = await page.locator("main nav[data-dev-only]").boundingBox()
  expect(box?.x).toBe(before)
})

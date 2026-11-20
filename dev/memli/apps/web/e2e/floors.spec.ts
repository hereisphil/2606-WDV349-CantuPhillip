import type { Page } from "@playwright/test"
import { expect, test } from "./api"
import { previewNames } from "../src/routes/_app/-components/dashboard-previews"
import { catalogPreviewNames } from "../src/routes/_catalog/-components/catalog-previews"
import { overviewPreviewNames } from "../src/routes/_catalog/-components/overview-previews"
import { studyPreviewNames } from "../src/routes/_session/-components/study-previews"

/**
 * Design floors lint can't see (.cursor/rules/ui-design.mdc), measured on
 * every `?preview=` state at desktop width and 375 px.
 */
const study = "/study/spanish-core-1000?mode=learn"
const paths = [
  "/dashboard",
  ...previewNames.map((name) => `/dashboard?preview=${name}`),
  study,
  ...studyPreviewNames.map((name) => `${study}&preview=${name}`),
  // Signed in, so the app's frame: the marketing frame has not had its design pass.
  "/courses",
  "/courses?language=ja",
  ...catalogPreviewNames.map((name) => `/courses?preview=${name}`),
  "/courses/spanish-core-1000",
  ...overviewPreviewNames.map(
    (name) => `/courses/spanish-core-1000?preview=${name}`
  ),
]

const MIN_TEXT_PX = 14
const MIN_TARGET_PX = 44

/** Words the product no longer says, and what it says now (REDESIGN.md section 6.1). */
const retiredWords = {
  deck: "course",
  decks: "courses",
  due: "to review",
  mastered: "learned",
  retention: "reviews remembered",
  streak: "days of study",
}

type Findings = {
  smallText: string[]
  smallTargets: string[]
  uppercase: string[]
  retired: string[]
  emDashes: string[]
}

async function measure(page: Page): Promise<Findings> {
  return page.evaluate(
    ({ minText, minTarget, retired }) => {
      const isShown = (element: Element): boolean => {
        const style = getComputedStyle(element)
        const box = element.getBoundingClientRect()
        return (
          style.display !== "none" &&
          style.visibility !== "hidden" &&
          box.width > 1 &&
          box.height > 1 &&
          element.closest("[data-dev-only], .sr-only") === null &&
          element.closest("details:not([open]) > :not(summary)") === null
        )
      }
      const short = (text: string): string => text.trim().slice(0, 40)

      const findings: Findings = {
        smallText: [],
        smallTargets: [],
        uppercase: [],
        retired: [],
        emDashes: [],
      }
      const retiredPattern = new RegExp(`\\b(${retired.join("|")})\\b`, "i")

      const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT
      )
      for (let node = walker.nextNode(); node; node = walker.nextNode()) {
        const parent = node.parentElement
        const text = node.nodeValue ?? ""
        if (parent === null || text.trim() === "" || !isShown(parent)) {
          continue
        }
        const style = getComputedStyle(parent)
        const size = Number.parseFloat(style.fontSize)
        if (size < minText) {
          findings.smallText.push(`"${short(text)}" is ${size} px`)
        }
        if (style.textTransform === "uppercase") {
          findings.uppercase.push(`"${short(text)}"`)
        }
        // Words in a course's own language are content, not our copy: they carry `lang`.
        if (parent.closest("body [lang]") !== null) {
          continue
        }
        if (retiredPattern.test(text)) {
          findings.retired.push(`"${short(text)}"`)
        }
        if (text.includes("—")) {
          findings.emDashes.push(`"${short(text)}"`)
        }
      }

      const controls = document.querySelectorAll(
        "a, button, summary, input, select, textarea, [role=button], [role=menuitem]"
      )
      for (const control of controls) {
        // A link inside a sentence is exempt, as in WCAG 2.5.8.
        if (!isShown(control) || control.closest("p") !== null) {
          continue
        }
        const height = control.getBoundingClientRect().height
        if (height < minTarget - 0.5) {
          const name =
            control.textContent.trim() ||
            control.getAttribute("aria-label") ||
            control.tagName.toLowerCase()
          findings.smallTargets.push(
            `"${short(name)}" is ${Math.round(height)} px tall`
          )
        }
      }
      return findings
    },
    {
      minText: MIN_TEXT_PX,
      minTarget: MIN_TARGET_PX,
      retired: Object.keys(retiredWords),
    }
  )
}

async function expectFloors(page: Page): Promise<void> {
  const findings = await measure(page)
  expect.soft(findings.smallText, `text under ${MIN_TEXT_PX} px`).toEqual([])
  expect
    .soft(findings.smallTargets, `targets under ${MIN_TARGET_PX} px tall`)
    .toEqual([])
  expect
    .soft(findings.uppercase, "labels in capitals: use sentence case")
    .toEqual([])
  expect
    .soft(
      findings.retired,
      `retired words: say ${JSON.stringify(retiredWords)}`
    )
    .toEqual([])
  expect.soft(findings.emDashes, "em dashes in copy").toEqual([])
}

test.describe("design floors", () => {
  for (const path of paths) {
    test(path, async ({ page }) => {
      await page.goto(path, { waitUntil: "networkidle" })
      await expect(page.locator("main")).toBeVisible()
      await expectFloors(page)
    })
  }

  // "Your progress" is closed by default, so its numbers and table need their own pass.
  test("/dashboard with Your progress open", async ({ page }) => {
    await page.goto("/dashboard", { waitUntil: "networkidle" })
    await page
      .locator("section[aria-labelledby=progress-heading] summary")
      .click()
    await expectFloors(page)
  })
})

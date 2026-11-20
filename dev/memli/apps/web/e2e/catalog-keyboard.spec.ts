import type { Page } from "@playwright/test"
import { expect, test } from "./api"

/**
 * The catalog and a course's overview with a keyboard alone, and on a phone
 * (#174): every control reachable in reading order, focus always visible.
 */

/** What has focus: its accessible text, trimmed. */
function focused(page: Page): Promise<string> {
  return page.evaluate(() => {
    const element = document.activeElement
    return (
      element?.getAttribute("aria-label") ?? element?.textContent?.trim() ?? ""
    )
  })
}

/** Tabs until `name` has focus, and says how many presses it took. */
async function tabTo(page: Page, name: string, limit = 40): Promise<number> {
  for (let presses = 1; presses <= limit; presses += 1) {
    await page.keyboard.press("Tab")
    if ((await focused(page)) === name) return presses
  }
  throw new Error(`Tab never reached "${name}"`)
}

test.describe("with a keyboard", () => {
  test.skip(({ isMobile }) => isMobile, "Keyboards: the desktop project.")

  test.describe("as a visitor", () => {
    test.use({ api: { signedOut: true } })

    test("the first Tab offers to skip the header, and it lands on the page", async ({
      page,
    }) => {
      await page.goto("/courses", { waitUntil: "networkidle" })

      await page.keyboard.press("Tab")
      expect(await focused(page)).toBe("Skip to main content")
      await page.keyboard.press("Enter")
      await page.keyboard.press("Tab")

      // Past the ten header controls, straight to the page's first one.
      expect(await focused(page)).toBe("Language: All languages")
    })

    test("rows come in reading order, each outlined, and Enter opens one", async ({
      page,
    }) => {
      await page.goto("/courses", { waitUntil: "networkidle" })
      await tabTo(page, "Language: All languages")

      const order: string[] = []
      for (let row = 0; row < 4; row += 1) {
        await page.keyboard.press("Tab")
        order.push(await focused(page))
        // The title's link has focus, and its whole row shows the outline.
        const outline = await page.evaluate(
          () =>
            getComputedStyle(
              document.activeElement?.closest("li") ?? document.body
            ).outlineStyle
        )
        expect(outline, order.at(-1)).toBe("solid")
      }
      expect(order).toEqual([
        "French Travel Phrases",
        "Japanese Hiragana & Katakana",
        "Portuguese Essentials",
        "Spanish Core 1000",
      ])

      await page.keyboard.press("Enter")
      await expect(page).toHaveURL(/\/courses\/spanish-core-1000$/)
    })

    test("the Language menu works with arrows, Enter and Escape", async ({
      page,
    }) => {
      await page.goto("/courses", { waitUntil: "networkidle" })
      await tabTo(page, "Language: All languages")

      await page.keyboard.press("Enter")
      await expect(page.getByRole("menu")).toBeVisible()
      await page.keyboard.press("Escape")
      await expect(page.getByRole("menu")).toBeHidden()
      expect(await focused(page)).toBe("Language: All languages")

      await page.keyboard.press("Enter")
      await page.keyboard.press("ArrowDown")
      await page.keyboard.press("ArrowDown")
      await page.keyboard.press("Enter")
      await expect(page).toHaveURL(/language=ja/)
      await expect(page.locator("main li")).toHaveCount(1)
    })

    test("going back up never hides focus under the sticky header", async ({
      page,
    }) => {
      await page.setViewportSize({ width: 1280, height: 500 })
      await page.goto("/courses", { waitUntil: "networkidle" })
      await tabTo(page, "Start Learning Free")

      // Back up into the list, which scrolls each row into view from above.
      for (let row = 0; row < 4; row += 1) {
        await page.keyboard.press("Shift+Tab")
        const { rowTop, headerBottom } = await page.evaluate(() => ({
          rowTop:
            document.activeElement?.closest("li")?.getBoundingClientRect()
              .top ?? 0,
          headerBottom:
            document.querySelector("header")?.getBoundingClientRect().bottom ??
            0,
        }))
        expect(rowTop, await focused(page)).toBeGreaterThanOrEqual(headerBottom)
      }
    })

    test("an overview offers the way back, then Start learning", async ({
      page,
    }) => {
      await page.goto("/courses/spanish-core-1000", {
        waitUntil: "networkidle",
      })
      await page.keyboard.press("Tab")
      await page.keyboard.press("Enter")

      await page.keyboard.press("Tab")
      expect(await focused(page)).toBe("All courses")
      await page.keyboard.press("Tab")
      expect(await focused(page)).toBe("Start learning")
    })
  })

  test.describe("as a signed-in learner", () => {
    for (const [path, controls] of [
      [
        "/courses/portuguese-essentials",
        ["All courses", "Start learning", "Add to my courses"],
      ],
      [
        "/courses/spanish-core-1000",
        ["All courses", "Continue", "Remove from my courses"],
      ],
    ] as const) {
      test(`${path} has its controls in reading order`, async ({ page }) => {
        await page.goto(path, { waitUntil: "networkidle" })
        await page.keyboard.press("Tab")
        expect(await focused(page)).toBe("Skip to main content")
        await page.keyboard.press("Enter")

        const order: string[] = []
        for (const _ of controls) {
          await page.keyboard.press("Tab")
          order.push(await focused(page))
        }
        expect(order).toEqual(controls)
      })
    }

    test("Add to my courses works from the keyboard, and says so", async ({
      page,
    }) => {
      await page.goto("/courses/portuguese-essentials", {
        waitUntil: "networkidle",
      })
      await page.getByRole("button", { name: "Add to my courses" }).focus()

      await page.keyboard.press("Enter")

      await expect(page.getByRole("status")).toContainText(
        "Added to your dashboard."
      )
    })
  })
})

test.describe("on a phone", () => {
  test.skip(({ isMobile }) => !isMobile, "Phones: the 375 px project.")

  // A short phone: 375 x 667, an iPhone SE.
  test.use({ viewport: { width: 375, height: 667 } })

  for (const [preview, button] of [
    ["visitor", "Start learning"],
    ["learner", "Start learning"],
    ["added", "Continue"],
  ] as const) {
    test(`the overview's ${button} is on the first screen (${preview})`, async ({
      page,
    }) => {
      await page.goto(`/courses/spanish-core-1000?preview=${preview}`, {
        waitUntil: "networkidle",
      })

      const box = await page
        .locator("main")
        .getByRole(
          preview === "added"
            ? "link"
            : preview === "visitor"
              ? "link"
              : "button",
          {
            name: button,
            exact: true,
          }
        )
        .boundingBox()
      expect((box?.y ?? 0) + (box?.height ?? 0)).toBeLessThanOrEqual(667)
    })
  }

  test("the catalog's first course is on the first screen", async ({
    page,
  }) => {
    await page.goto("/courses", { waitUntil: "networkidle" })

    const first = await page.locator("main li").first().boundingBox()
    expect((first?.y ?? 0) + (first?.height ?? 0)).toBeLessThanOrEqual(667)
  })
})

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

  test("stays under the heading, whatever is chosen", async ({ page }) => {
    // A shorter label once let the menu jump up beside the heading.
    for (const path of ["/courses", "/courses?language=fr"]) {
      await page.goto(path, { waitUntil: "networkidle" })

      const intro = await page.locator("main h1 + p").boundingBox()
      const menu = await page
        .getByRole("button", { name: /^Language: / })
        .boundingBox()
      expect(menu?.y, path).toBeGreaterThanOrEqual(
        (intro?.y ?? 0) + (intro?.height ?? 0)
      )
      expect(menu?.x, path).toBe(intro?.x)
    }
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

test.describe("finding the catalog", () => {
  test.describe("as a visitor", () => {
    test.use({ api: { signedOut: true } })

    test("the header links to Courses", async ({ page, isMobile }) => {
      await page.goto("/", { waitUntil: "networkidle" })
      // Below 1024 px the links sit behind the menu button.
      if (isMobile) {
        await page.getByRole("button", { name: "Navigation menu" }).click()
      }

      await page
        .getByRole("banner")
        .getByRole("link", { name: "Courses" })
        .click()

      await expect(page).toHaveURL(/\/courses$/)
      await expect(page.locator("main h1")).toHaveText("Courses")
    })

    test("the footer links to Courses, twice", async ({ page }) => {
      await page.goto("/", { waitUntil: "networkidle" })
      const footer = page.getByRole("contentinfo")

      await expect(
        footer.getByRole("link", { name: "Courses", exact: true })
      ).toHaveAttribute("href", "/courses")
      await footer.getByRole("link", { name: "Explore Courses" }).click()

      await expect(page).toHaveURL(/\/courses$/)
    })

    test("the header's Theme menu switches to dark", async ({ page }) => {
      await page.goto("/courses", { waitUntil: "networkidle" })

      await page
        .getByRole("banner")
        .getByRole("button", { name: "Theme" })
        .click()
      await page.getByRole("menuitemradio", { name: "Dark" }).click()

      await expect(page.locator("html")).toHaveClass(/dark/)
    })

    for (const width of [320, 375, 768, 1024, 1440]) {
      test(`the header fits at ${width} px`, async ({ page, isMobile }) => {
        test.skip(isMobile, "Sets its own widths, so one project is enough.")
        await page.setViewportSize({ width, height: 800 })
        await page.goto("/courses", { waitUntil: "networkidle" })

        const pageWidth = await page.evaluate(
          () => document.documentElement.scrollWidth
        )
        expect(pageWidth, "the page scrolls sideways").toBeLessThanOrEqual(
          width
        )
      })
    }
  })

  test.describe("as a signed-in learner", () => {
    test("the app's navigation links to Courses", async ({
      page,
      isMobile,
    }) => {
      await page.goto("/dashboard", { waitUntil: "networkidle" })

      if (isMobile) {
        await page.getByRole("button", { name: "Navigation menu" }).click()
        await page.getByRole("menuitem", { name: "Courses" }).click()
      } else {
        await page
          .getByRole("navigation", { name: "Primary" })
          .getByRole("link", { name: "Courses" })
          .click()
      }

      await expect(page).toHaveURL(/\/courses$/)
      await expect(page.locator("main h1")).toHaveText("Courses")
      if (!isMobile) {
        // The current page is marked, by more than color (`.active` styles the row).
        await expect(
          page
            .getByRole("navigation", { name: "Primary" })
            .getByRole("link", { name: "Courses" })
        ).toHaveAttribute("aria-current", "page")
      }
    })
  })
})

test.describe("the dashboard leads to the catalog", () => {
  test("with no courses, Find a course opens it", async ({ page }) => {
    await page.goto("/dashboard?preview=no-courses", {
      waitUntil: "networkidle",
    })

    await expect(
      page.locator("main").getByRole("link", { name: "Find a course" })
    ).toHaveAttribute("href", "/courses")
  })

  test("with everything done, Find another course opens the same language", async ({
    page,
  }) => {
    await page.goto("/dashboard?preview=finished", {
      waitUntil: "networkidle",
    })

    await expect(
      page.locator("main").getByRole("link", { name: "Find another course" })
    ).toHaveAttribute("href", "/courses?language=es")
  })

  test("the list of other courses ends with Browse courses", async ({
    page,
  }) => {
    await page.goto("/dashboard?preview=default", {
      waitUntil: "networkidle",
    })
    const list = page.getByRole("region", { name: "Your other courses" })

    await expect(
      list.getByRole("link", { name: "Browse courses" })
    ).toHaveAttribute("href", "/courses")
  })
})

test.describe("signing up and in", () => {
  test.use({ api: { signedOut: true } })

  test("the footer's Start Learning Free makes an account", async ({
    page,
  }) => {
    await page.goto("/", { waitUntil: "networkidle" })

    await expect(
      page.getByRole("link", { name: "Start Learning Free" })
    ).toHaveAttribute("href", "/signup")
  })

  for (const path of ["/signin", "/signup"]) {
    test(`${path} has a way home just above its card`, async ({ page }) => {
      await page.goto(path, { waitUntil: "networkidle" })
      const home = page.locator("main").getByRole("link", { name: "Home" })

      await expect(home).toHaveAttribute("href", "/")
      const link = await home.boundingBox()
      const card = await page.locator("main [data-slot=card]").boundingBox()
      expect(link?.x).toBe(card?.x)
      expect((link?.y ?? 0) + (link?.height ?? 0)).toBeLessThanOrEqual(
        card?.y ?? 0
      )
    })
  }
})

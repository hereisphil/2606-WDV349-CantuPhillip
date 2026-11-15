import { expect, test, type Locator, type Page } from "@playwright/test"

/**
 * The Session Outcome Dock (#51): plain-word choices after the answer shows,
 * Enter for the default, 1 to 4 by position, and focus on the next word once
 * the learner chooses.
 */
const study = "/study/spanish-core-1000?mode=review"

function dock(page: Page, name: string | RegExp): Locator {
  return page.getByRole("group", { name })
}

/**
 * The dock's buttons, in order. Each name starts with the choice, and may go
 * on with when the word comes back ("Got it, Back in 5 days"; Chrome may
 * add a space before the comma). The hover-only
 * key hints are hidden from it.
 */
async function expectChoices(group: Locator, names: string[]): Promise<void> {
  const buttons = group.getByRole("button")
  await expect(buttons).toHaveCount(names.length)
  for (const [index, name] of names.entries()) {
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    await expect(buttons.nth(index)).toHaveAccessibleName(
      new RegExp(`^${escaped}(\\s*,\\s*Back .+)?$`)
    )
  }
}

/** The prompt card, named by the session kind in its corner. */
function prompt(page: Page): Locator {
  return page.getByRole("region", { name: "Review" })
}

test.describe("study session outcome dock", () => {
  // Keyboard flows; the phone project adds nothing here.
  test.skip(({ isMobile }) => isMobile, "Runs once, in the desktop project.")

  test("Enter confirms a correct answer and moves focus to the next word", async ({
    page,
  }) => {
    await page.goto(study, { waitUntil: "networkidle" })
    await page.getByRole("textbox").fill("cat")
    await page.getByRole("button", { name: "Submit" }).click()

    const choices = dock(page, "How did it go?")
    await expectChoices(choices, ["Got it", "That was easy"])

    await page.keyboard.press("Enter")
    await expect(choices).toBeHidden()
    await expect(prompt(page)).toBeFocused()
    await expect(prompt(page)).not.toContainText("gato")
    await expect(page.getByText("4 words left")).toBeVisible()
  })

  test("Each choice says when the word comes back", async ({ page }) => {
    await page.goto(study, { waitUntil: "networkidle" })
    await page.getByRole("button", { name: "Reveal answer" }).click()

    const choices = dock(page, "Did you know it?")
    const dues: [string, RegExp][] = [
      ["No, I didn't", /^Back later this session$/],
      ["I think so", /^Back in \d+ hours?$/],
      ["Yes, I knew it", /^Back in \d+ days?$/],
      ["Yes, easily", /^Back in \d+ months?$/],
    ]
    for (const [name, due] of dues) {
      const choice = choices.getByRole("button", { name })
      await expect(choice.getByText(due)).toBeVisible()
    }
  })

  test("A typo asks whether it was only a typo, with no default", async ({
    page,
  }) => {
    await page.goto(`${study}&preview=typo`, { waitUntil: "networkidle" })
    const choices = dock(page, "Did you know it?")
    await expectChoices(choices, ["No, I wasn't sure", "Yes, just a typo"])

    // Only the learner knows, so Enter does nothing here.
    await page.keyboard.press("Enter")
    await expect(choices).toBeVisible()

    await page.keyboard.press("2")
    await expect(
      page.getByRole("heading", { name: "Session complete" })
    ).toBeVisible()
  })

  test("A quick typo pre-selects “just a typo” for Enter", async ({ page }) => {
    await page.goto(`${study}&preview=typo-quick`, {
      waitUntil: "networkidle",
    })
    await expect(
      dock(page, "Did you know it?").getByRole("button", {
        name: "Yes, just a typo",
      })
    ).toHaveAttribute("aria-keyshortcuts", "Enter 2")

    await page.keyboard.press("Enter")
    await expect(
      page.getByRole("heading", { name: "Session complete" })
    ).toBeVisible()
  })

  test("A wrong answer comes back later in the session", async ({ page }) => {
    await page.goto(study, { waitUntil: "networkidle" })
    await page.getByRole("textbox").fill("banana")
    await page.getByRole("button", { name: "Submit" }).click()

    const choices = dock(page, "How did it go?")
    await expect(choices).toHaveAccessibleDescription(
      "You'll see this word again in this session."
    )
    await choices.getByRole("button", { name: "Continue" }).click()

    // Not finished: the count stays, and another word comes first.
    await expect(prompt(page)).toBeFocused()
    await expect(prompt(page)).not.toContainText("gato")
    await expect(page.getByText("5 words left")).toBeVisible()
  })

  test("Revealing offers four plain choices, and the keys pick by position", async ({
    page,
  }) => {
    await page.goto(study, { waitUntil: "networkidle" })
    await page.getByRole("button", { name: "Reveal answer" }).click()

    const choices = dock(page, "Did you know it?")
    await expectChoices(choices, [
      "No, I didn't",
      "I think so",
      "Yes, I knew it",
      "Yes, easily",
    ])

    await page.keyboard.press("3")
    await expect(prompt(page)).toBeFocused()
    await expect(page.getByText("4 words left")).toBeVisible()
  })

  test("Revealing nudges toward “No, I didn't”, which Enter confirms", async ({
    page,
  }) => {
    await page.goto(study, { waitUntil: "networkidle" })
    await page.getByRole("button", { name: "Reveal answer" }).click()

    await expect(
      dock(page, "Did you know it?").getByRole("button", {
        name: "No, I didn't",
      })
    ).toHaveAttribute("aria-keyshortcuts", "Enter 1")

    // A miss comes back this session: the count stays, and another word comes first.
    await page.keyboard.press("Enter")
    await expect(prompt(page)).toBeFocused()
    await expect(prompt(page)).not.toContainText("gato")
    await expect(page.getByText("5 words left")).toBeVisible()
  })
})

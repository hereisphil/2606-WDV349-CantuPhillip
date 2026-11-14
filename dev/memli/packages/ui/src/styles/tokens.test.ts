// Every text and control pairing the app relies on must pass WCAG 2.2 and its
// APCA target in both themes. The values come straight from globals.css.
// Thresholds and the first pairings come from docs/designs/REDESIGN.md, section 7.
import { readFileSync } from "node:fs"
import { describe, expect, test } from "vitest"
import {
  fitsSrgb,
  measure,
  readThemeTokens,
  resolveToken,
  type Theme,
} from "./tokens"

const css = readFileSync(new URL("./globals.css", import.meta.url), "utf8")
const tokens = readThemeTokens(css)
const themes: readonly Theme[] = ["light", "dark"]

/** Minimum WCAG ratio and minimum APCA |Lc| for each kind of pairing. */
const rules = {
  /** Headings, numbers and reading text on page, card and sidebar. */
  body: { ratio: 7, lc: 90 },
  /** Short reading text on chips, menus and tinted panels. */
  bodyTint: { ratio: 7, lc: 75 },
  /** Secondary text, 16 px and up, on the main surfaces. */
  muted: { ratio: 4.5, lc: 75 },
  /** Secondary text on chips and tinted panels. */
  mutedTint: { ratio: 4.5, lc: 60 },
  /** Button labels at rest and on hover. */
  label: { ratio: 4.5, lc: 75 },
  /** Button labels while pressed, and bold 16 px labels. */
  labelPressed: { ratio: 4.5, lc: 60 },
  /** Links and status words, always with an icon or at 16 px semibold. */
  colored: { ratio: 4.5, lc: 60 },
  /** Control borders, focus rings, icons and chart marks (WCAG 1.4.11). */
  nonText: { ratio: 3, lc: 30 },
} as const

type Pairing = readonly [
  label: string,
  foreground: string,
  background: string,
  rule: keyof typeof rules,
]

const pairings: readonly Pairing[] = [
  // Text on the main surfaces
  ["Heading on page", "foreground-strong", "background", "body"],
  ["Heading on card", "foreground-strong", "card", "body"],
  ["Body text on page", "foreground", "background", "body"],
  ["Body text on card", "foreground", "card", "body"],
  ["Body text on sidebar", "foreground", "sidebar", "body"],
  ["Body text on menu", "foreground", "popover", "bodyTint"],
  ["Body text on chip", "foreground", "muted", "bodyTint"],
  ["Body text on selected row", "foreground", "accent", "bodyTint"],
  ["Muted text on page", "muted-foreground", "background", "muted"],
  ["Muted text on card", "muted-foreground", "card", "muted"],
  ["Muted text on sidebar", "muted-foreground", "sidebar", "muted"],
  ["Muted text on menu", "muted-foreground", "popover", "mutedTint"],
  ["Muted text on chip", "muted-foreground", "muted", "mutedTint"],
  ["Selected label on accent", "accent-foreground", "accent", "label"],
  ["Link on page", "link", "background", "colored"],
  ["Link on card", "link", "card", "colored"],
  ["Study word in a mnemonic", "emphasis", "card", "colored"],

  // The hero and its controls
  ["Hero text on hero", "hero-foreground", "hero", "body"],
  ["Hero secondary text on hero", "hero-muted-foreground", "hero", "muted"],
  ["Hero text on hero chip", "hero-foreground", "hero-chip", "bodyTint"],
  ["Second hero button border", "hero-muted-foreground", "hero", "nonText"],
  [
    "Hero bar fill against its track",
    "hero-foreground",
    "hero-chip",
    "nonText",
  ],
  [
    "Hero text on hero chip on hover",
    "hero-foreground",
    "hero-chip-hover",
    "bodyTint",
  ],
  ["Second hero button border on hover", "hero-foreground", "hero", "nonText"],
  ["Focus ring on hero", "hero-ring", "hero", "nonText"],

  // Actions
  ["Main button label", "cta-foreground", "cta", "label"],
  ["Main button label on hover", "cta-foreground", "cta-hover", "label"],
  ["Main button label pressed", "cta-foreground", "cta-active", "labelPressed"],
  ["Main button against hero", "cta", "hero", "nonText"],
  ["Main button on hover against hero", "cta-hover", "hero", "nonText"],
  // The edge against the hero is depth only, so it is not gated: the fill
  // already stands out from the hero. In light it measures 3.2:1 but Lc 27.
  // On a card or the page, the edge is the button's boundary, so it is gated.
  ["Main button edge against card", "cta-edge", "card", "nonText"],
  ["Main button edge against page", "cta-edge", "background", "nonText"],
  ["Brand button label", "primary-foreground", "primary", "label"],
  [
    "Brand button label on hover",
    "primary-foreground",
    "primary-hover",
    "label",
  ],
  ["Quiet button label", "foreground", "secondary", "label"],
  ["Brand text on card", "primary", "card", "colored"],
  ["Brand text on page", "primary", "background", "colored"],
  [
    "Danger button label",
    "destructive-foreground",
    "destructive",
    "labelPressed",
  ],

  // Borders and focus
  ["Control border on card", "border-strong", "card", "nonText"],
  ["Control border on page", "border-strong", "background", "nonText"],
  ["Control border on sidebar", "border-strong", "sidebar", "nonText"],
  ["Control border on menu", "border-strong", "popover", "nonText"],
  [
    "Control border on tip card",
    "border-strong",
    "warning-container",
    "nonText",
  ],
  ["Practice label on tip card", "foreground", "warning-container", "label"],
  ["Input border on card", "input", "card", "nonText"],
  ["Selected mark on card", "brand", "card", "nonText"],
  ["Selected mark on page", "brand", "background", "nonText"],
  ["Focus ring on page", "ring", "background", "nonText"],
  ["Focus ring on card", "ring", "card", "nonText"],
  ["Focus ring on sidebar", "ring", "sidebar", "nonText"],
  ["Focus ring on tip card", "ring", "warning-container", "nonText"],

  // Status
  ["Success text on card", "success", "card", "colored"],
  ["Success text on page", "success", "background", "colored"],
  [
    "Success container text",
    "success-container-foreground",
    "success-container",
    "bodyTint",
  ],
  [
    "Success border on its container",
    "success",
    "success-container",
    "nonText",
  ],
  ["Warning text on card", "warning", "card", "colored"],
  ["Warning text on page", "warning", "background", "colored"],
  [
    "Warning container text",
    "warning-container-foreground",
    "warning-container",
    "bodyTint",
  ],
  [
    "Warning border on its container",
    "warning",
    "warning-container",
    "nonText",
  ],
  ["Danger text on card", "destructive", "card", "colored"],
  ["Danger text on page", "destructive", "background", "colored"],
  [
    "Danger container text",
    "destructive-container-foreground",
    "destructive-container",
    "bodyTint",
  ],
  [
    "Danger border on its container",
    "destructive",
    "destructive-container",
    "nonText",
  ],
  ["Streak flame on card", "streak", "card", "nonText"],
  ["Streak flame on page", "streak", "background", "nonText"],

  // Charts and progress
  ["Mastered next to learning", "viz-mastered", "viz-learning", "nonText"],
  ["Learning next to not started", "viz-learning", "viz-new", "nonText"],
  ["Mastered on card", "viz-mastered", "card", "nonText"],
  ["Learning on card", "viz-learning", "card", "nonText"],
  ["Progress against its track", "viz-progress", "viz-track", "nonText"],
  ["Progress on card", "viz-progress", "card", "nonText"],
  ["Check mark on a filled day", "viz-on-progress", "viz-progress", "nonText"],
]

/**
 * Color utilities that are in no pairing, each with the reason. A new
 * `--color-*` token fails the "registered" test below until it is in a
 * pairing or listed here.
 */
const marketing = "Marketing pages only: a fixed value that is not themed."
const unused = "Not used yet. Give it a pairing with its first use."
const notChecked: Readonly<Record<string, string>> = {
  border:
    "Dividers and card outlines. Decoration: controls use border-strong, which is checked.",
  "hero-border":
    "The hero's outline in dark mode. Decoration: the fill already sets it apart.",
  "warning-container-border":
    "The tip card's outline. Decoration: the fill already sets it apart.",
  "brand-primary": marketing,
  "brand-sky": marketing,
  "brand-charcoal": marketing,
  "brand-surface": marketing,
  "brand-slate": marketing,
  "brand-border": marketing,
  "brand-tint": marketing,
  "hero-soft": unused,
  "sidebar-primary-foreground": unused,
}

/** The `--color-*` utilities declared in the `@theme` block. */
const utilities = [...css.matchAll(/^\s*--color-([a-z0-9-]+):/gm)].map(
  ([, name]) => name ?? ""
)
const paired = new Set(pairings.flatMap(([, fg, bg]) => [fg, bg]))

/** The role a token points at when it is `var(--role)` in both themes, such as `--card-foreground`. */
function aliasOf(name: string): string | null {
  const targets = themes.map(
    (theme) => /^var\(--([a-z0-9-]+)\)$/.exec(tokens[theme][name] ?? "")?.[1]
  )
  const [first] = targets
  return first !== undefined && targets.every((target) => target === first)
    ? first
    : null
}

function isRegistered(name: string): boolean {
  if (paired.has(name) || name in notChecked) {
    return true
  }
  const alias = aliasOf(name)
  return alias !== null && isRegistered(alias)
}

describe("registration", () => {
  test("there are color utilities to check", () => {
    expect(utilities.length).toBeGreaterThan(60)
  })

  test.each(utilities)(
    "--color-%s is in a pairing, is an alias of one, or is listed in notChecked",
    (name) => {
      expect(
        isRegistered(name),
        `Add a pairing for --${name} (what it sits on, and which rule), or list it in notChecked with the reason.`
      ).toBe(true)
    }
  )

  test.each(Object.keys(notChecked))(
    "notChecked entry %s is still needed",
    (name) => {
      expect(utilities, "no such --color-* utility").toContain(name)
      expect(paired.has(name), "it is in a pairing now").toBe(false)
    }
  )
})

describe.each(themes)("%s theme", (theme) => {
  test.each(pairings)("%s (--%s on --%s)", (_label, fg, bg, rule) => {
    const { ratio, lc } = measure(tokens[theme], fg, bg)
    const min = rules[rule]
    expect(ratio, `WCAG ratio, needs ${min.ratio}:1`).toBeGreaterThanOrEqual(
      min.ratio
    )
    expect(Math.abs(lc), `APCA Lc, needs ${min.lc}`).toBeGreaterThanOrEqual(
      min.lc
    )
  })
})

describe("primitives", () => {
  const primitives = Object.entries(tokens.light).filter(([, value]) =>
    value.startsWith("oklch(")
  )

  test("there are primitives to check", () => {
    expect(primitives.length).toBeGreaterThan(70)
  })

  test.each(primitives)("--%s fits the sRGB gamut", (name) => {
    expect(fitsSrgb(resolveToken(name, tokens.light))).toBe(true)
  })
})

# Live audit of /dashboard (current build)

Audited 2026-11-13 against `http://localhost:5173/dashboard` on branch `dev` (commit `e6f8245`). Nothing in the repository was edited. All scripts, raw data and screenshots are under `scratch/live/`.

## 0. The short version

The four things the owner feels are all measurable. Here is each one as a number.

| Owner's feeling | What the live page measures |
|---|---|
| 1. Too busy, too much copy | 192 visible words in `main` (217 counting screen-reader-only text). 12 headings. 15 font size/weight pairs from 8 sizes and 4 weights. At 1280x800 the first screen alone shows 124 words, 7 headings and 28 painted boxes (cards, chips, buttons, badges, dots). |
| 2. Not enough contrast | Text contrast is fine by WCAG in both themes (lowest pair 5.59:1 light, 4.89:1 dark). The weak part is everything that is not text. In light mode every surface sits between OKLCH L 0.962 and 1.000, so no two surfaces differ by more than 1.12:1. Card edges are 1.22:1. There is no drop shadow anywhere on the page, including on the primary button. 48% of text nodes in `main` use the gray secondary colour. |
| 3. Needs dark mode | Dark tokens work and pass axe. There is no visible control. Only the hidden `d` key toggles it. `color-scheme` is never set. The dark page is OKLCH L 0.175, C 0.025, which is close to neutral black. Secondary text in dark scores APCA Lc 43 to 46, far under the Lc 75 target for body text, even though WCAG 2 calls it a pass at 4.9 to 6.6:1. |
| 4. The eye has no single place to land | On desktop "Start review" is 126x44 px. That is 0.54% of a 1280x800 screen (0.27% at 1920x1080). The selected "All languages" chip sits above it, uses the same solid blue, and is 78% of its area. Eight solid-blue shapes show in the first screen. The button is flat (no shadow), and hovering makes it paler. The panel it sits in differs from the page by 1.04:1. |

One good surprise: axe-core 4.14.0 reports zero violations in every state and both themes, there is no horizontal overflow at any width from 320 to 1920, and every target meets the WCAG 2.2 AA 24x24 minimum. The page is technically clean. Its problems are hierarchy, surface contrast and density, which automated tools do not score.

## 1. Method

- Browser: headless Brave (reports as Chrome/157.0.8103.79) driven over the Chrome DevTools Protocol, own profile directory and debugging port 9347, as required by `dev/memli/.cursor/rules/browser-verification.mdc`. No screen recording or computer use. The browser was stopped at the end (verified: port closed).
- Theme was forced by writing `localStorage.theme` before the app boots. `ThemeProvider` then sets the class on `<html>` (`apps/web/src/components/theme-provider.tsx:7,103-112`). Each capture's `<html>` class was read back to confirm.
- Device scale factor 1. Widths of 768 and below ran with mobile and touch emulation.
- DEV-only UI was hidden with `display:none` before measuring, so numbers match production: the Preview switcher (`PreviewSwitcher.tsx`), the red "Previews" button (`dev-previews-menu.tsx`) and the TanStack Router devtools. I confirmed `/dashboard` without `?preview` renders the same page (1520 px tall at 1280 wide).
- Colour: every computed colour string (the browser returns `oklch(...)`, `oklab(... / a)` for `color-mix`) was parsed with culori 4, converted to sRGB, clamped, and alpha-composited in gamma sRGB over the nearest opaque ancestor background, which is how browsers blend. WCAG 2.x ratio uses the standard relative-luminance formula. APCA Lc uses `apca-w3` 0.1.9 (`APCAcontrast(sRGBtoY(text), sRGBtoY(background))`). Positive Lc means dark text on light. Negative means light text on dark. Compare absolute values.
- APCA thresholds applied (the simplified set given in the brief): Lc 75 for body text, Lc 60 for 16px and up at weight 500+ or any text 24px and up, Lc 45 for 36px and up or 24px bold, Lc 30 minimum for non-text. Real APCA guidance asks for more than Lc 75 on 12 to 14px text, so "PASS" at those sizes is generous.
- Words were counted from rendered text nodes, one DOM Range per word, skipping screen-reader-only and hidden text.
- "Boxes" are elements with a visible painted box: a fill that differs from what is behind it, a border on all four sides, or a ring. Shapes under 20px are counted separately as small marks.

Limits. See section 12.

## 2. Screenshots

Directory: `scratch/live/shots/`

`-full.png` is the whole page. `-fold.png` is the first screen only. In full-page desktop captures the sticky sidebar appears only in the first screen. That is a capture artifact, not a bug.

**Required: default state, 5 widths, light and dark** (20)

- `default-1280x800-dark-fold.png`
- `default-1280x800-dark-full.png`
- `default-1280x800-light-fold.png`
- `default-1280x800-light-full.png`
- `default-1920x1080-dark-fold.png`
- `default-1920x1080-dark-full.png`
- `default-1920x1080-light-fold.png`
- `default-1920x1080-light-full.png`
- `default-375x812-dark-fold.png`
- `default-375x812-dark-full.png`
- `default-375x812-light-fold.png`
- `default-375x812-light-full.png`
- `default-414x896-dark-fold.png`
- `default-414x896-dark-full.png`
- `default-414x896-light-fold.png`
- `default-414x896-light-full.png`
- `default-768x1024-dark-fold.png`
- `default-768x1024-dark-full.png`
- `default-768x1024-light-fold.png`
- `default-768x1024-light-full.png`

**Required: other states at 375 and 1280, light** (20)

- `caught-up-1280x800-light-fold.png`
- `caught-up-1280x800-light-full.png`
- `caught-up-375x812-light-fold.png`
- `caught-up-375x812-light-full.png`
- `long-titles-1280x800-light-fold.png`
- `long-titles-1280x800-light-full.png`
- `long-titles-375x812-light-fold.png`
- `long-titles-375x812-light-full.png`
- `many-decks-1280x800-light-fold.png`
- `many-decks-1280x800-light-full.png`
- `many-decks-375x812-light-fold.png`
- `many-decks-375x812-light-full.png`
- `no-decks-1280x800-light-fold.png`
- `no-decks-1280x800-light-full.png`
- `no-decks-375x812-light-fold.png`
- `no-decks-375x812-light-full.png`
- `one-deck-1280x800-light-fold.png`
- `one-deck-1280x800-light-full.png`
- `one-deck-375x812-light-fold.png`
- `one-deck-375x812-light-full.png`

**Extra states and sizes** (18)

- `default-320x568-light-fold.png`
- `default-320x568-light-full.png`
- `default-375x548-light-fold-iphone-se-safari-visible.png`
- `default-375x635-light-fold-iphone-x-safari-visible.png`
- `default-390x664-light-fold-iphone-14-safari-visible.png`
- `default-412x760-light-fold-android-chrome-visible.png`
- `default-640x400-light-fold.png`
- `default-640x400-light-full.png`
- `goal-met-375x812-light-fold.png`
- `goal-met-375x812-light-full.png`
- `large-numbers-1280x800-light-fold.png`
- `large-numbers-1280x800-light-full.png`
- `large-numbers-375x812-light-fold.png`
- `large-numbers-375x812-light-full.png`
- `learn-375x812-light-fold.png`
- `learn-375x812-light-full.png`
- `long-titles-320x568-light-fold.png`
- `long-titles-320x568-light-full.png`

**Focus, menus, detail crops, text-spacing test** (18)

- `account-menu-1280x800-light.png`
- `account-menu-375x812-light.png`
- `detail-mastery-bar-dark.png`
- `detail-mastery-bar-light.png`
- `detail-week-card-dark.png`
- `detail-week-card-light.png`
- `focus-chip-dark.png`
- `focus-chip-light.png`
- `focus-learn-outline-dark.png`
- `focus-learn-outline-light.png`
- `focus-sidebar-decks-dark.png`
- `focus-sidebar-decks-light.png`
- `focus-start-review-dark.png`
- `focus-start-review-light.png`
- `nav-menu-375x812-light.png`
- `sidebar-no-preview-light.png`
- `text-spacing-1280-light-full.png`
- `text-spacing-375-light-full.png`

## 3. Above the fold, page length, overflow, density

### 3.1 Summary table

| Capture | Page height | Screens of scroll | Horizontal overflow | Start review (or primary) x,y | Size | Fully above fold? | Px of content above it | Words in first screen (main / whole page) | Words total (main) | Boxes in first screen: containers / chips+badges / buttons+chip-links / dividers / small marks | Boxes total (same order) |
|---|---|---|---|---|---|---|---|---|---|---|---|
| default-375x812-light | 2658px | 3.27 | none | "Start review" 48,581.2 | 279x44 | yes | 512 in main (581 from page top) | 53 / 54 | 192 | 3 / 2 / 7 / 0 / 3 (=12 boxes excl. dividers/marks) | 9 / 21 / 9 / 3 / 16 |
| default-375x812-dark | 2658px | 3.27 | none | "Start review" 48,581.2 | 279x44 | yes | 512 in main (581 from page top) | 53 / 54 | 192 | 3 / 2 / 7 / 0 / 3 (=12 boxes excl. dividers/marks) | 9 / 21 / 9 / 3 / 16 |
| default-414x896-light | 2658px | 2.97 | none | "Start review" 48,581.2 | 318x44 | yes | 512 in main (581 from page top) | 62 / 63 | 192 | 3 / 3 / 7 / 0 / 3 (=13 boxes excl. dividers/marks) | 9 / 21 / 9 / 3 / 16 |
| default-414x896-dark | 2658px | 2.97 | none | "Start review" 48,581.2 | 318x44 | yes | 512 in main (581 from page top) | 62 / 63 | 192 | 3 / 3 / 7 / 0 / 3 (=13 boxes excl. dividers/marks) | 9 / 21 / 9 / 3 / 16 |
| default-768x1024-light | 2203px | 2.15 | none | "Start review" 304,489.8 | 125.7x44 | yes | 490 in main (490 from page top) | 81 / 88 | 192 | 4 / 3 / 7 / 2 / 8 (=14 boxes excl. dividers/marks) | 6 / 24 / 9 / 4 / 14 |
| default-768x1024-dark | 2203px | 2.15 | none | "Start review" 304,489.8 | 125.7x44 | yes | 490 in main (490 from page top) | 81 / 88 | 192 | 4 / 3 / 7 / 2 / 8 (=14 boxes excl. dividers/marks) | 6 / 24 / 9 / 4 / 14 |
| default-1280x800-light | 1520px | 1.90 | none | "Start review" 304,409.8 | 125.7x44 | yes | 410 in main (410 from page top) | 124 / 131 | 192 | 5 / 15 / 7 / 2 / 1 (=27 boxes excl. dividers/marks) | 9 / 21 / 9 / 4 / 14 |
| default-1280x800-dark | 1520px | 1.90 | none | "Start review" 304,409.8 | 125.7x44 | yes | 410 in main (410 from page top) | 124 / 131 | 192 | 5 / 15 / 7 / 2 / 1 (=27 boxes excl. dividers/marks) | 9 / 21 / 9 / 4 / 14 |
| default-1920x1080-light | 1392px | 1.29 | none | "Start review" 496,409.8 | 125.7x44 | yes | 410 in main (410 from page top) | 160 / 167 | 192 | 6 / 19 / 9 / 4 / 12 (=34 boxes excl. dividers/marks) | 9 / 21 / 9 / 4 / 14 |
| default-1920x1080-dark | 1392px | 1.29 | none | "Start review" 496,409.8 | 125.7x44 | yes | 410 in main (410 from page top) | 160 / 167 | 192 | 6 / 19 / 9 / 4 / 12 (=34 boxes excl. dividers/marks) | 9 / 21 / 9 / 4 / 14 |
| no-decks-375x812-light | 812px | 1.00 | none | "Browse community decks" 48,426.6 | 279x44 | yes | 358 in main (427 from page top) | 29 / 30 | 29 | 2 / 0 / 1 / 0 / 3 (=3 boxes excl. dividers/marks) | 2 / 0 / 1 / 0 / 3 |
| no-decks-1280x800-light | 800px | 1.00 | none | "Browse community decks" 304,276.8 | 231.3x44 | yes | 277 in main (277 from page top) | 29 / 36 | 29 | 2 / 0 / 1 / 1 / 1 (=3 boxes excl. dividers/marks) | 2 / 0 / 1 / 1 / 1 |
| caught-up-375x812-light | 2702px | 3.33 | none | "Learn 10 more new words" 48,618.7 | 279x44 | yes | 550 in main (619 from page top) | 69 / 70 | 223 | 2 / 0 / 7 / 1 / 3 (=9 boxes excl. dividers/marks) | 9 / 19 / 7 / 4 / 16 |
| caught-up-1280x800-light | 1560px | 1.95 | none | "Learn 10 more new words" 304,430.6 | 230x44 | yes | 431 in main (431 from page top) | 140 / 147 | 223 | 5 / 13 / 7 / 3 / 1 (=25 boxes excl. dividers/marks) | 9 / 19 / 7 / 5 / 14 |
| one-deck-375x812-light | 1938px | 2.39 | none | "Start review" 48,385.2 | 279x44 | yes | 316 in main (385 from page top) | 49 / 50 | 126 | 3 / 1 / 2 / 0 / 7 (=6 boxes excl. dividers/marks) | 8 / 11 / 2 / 1 / 10 |
| one-deck-1280x800-light | 936px | 1.17 | none | "Start review" 304,293.8 | 125.7x44 | yes | 294 in main (294 from page top) | 109 / 116 | 126 | 8 / 11 / 2 / 2 / 8 (=21 boxes excl. dividers/marks) | 8 / 11 / 2 / 2 / 8 |
| many-decks-375x812-light | 4006px | 4.93 | none | "Start review" 48,777.2 | 279x44 | partly | 708 in main (777 from page top) | 59 / 60 | 319 | 2 / 3 / 14 / 0 / 3 (=19 boxes excl. dividers/marks) | 9 / 38 / 23 / 11 / 31 |
| many-decks-1280x800-light | 2628px | 3.29 | none | "Start review" 304,533.8 | 125.7x44 | yes | 534 in main (534 from page top) | 131 / 138 | 319 | 5 / 16 / 15 / 2 / 1 (=36 boxes excl. dividers/marks) | 9 / 38 / 23 / 12 / 29 |
| long-titles-375x812-light | 2923px | 3.60 | none | "Start review" 48,701.2 | 279x44 | yes | 632 in main (701 from page top) | 54 / 55 | 214 | 4 / 0 / 6 / 0 / 3 (=10 boxes excl. dividers/marks) | 11 / 17 / 7 / 2 / 14 |
| long-titles-1280x800-light | 1593px | 1.99 | none | "Start review" 304,485.8 | 125.7x44 | yes | 486 in main (486 from page top) | 133 / 140 | 214 | 5 / 15 / 6 / 2 / 1 (=26 boxes excl. dividers/marks) | 9 / 19 / 7 / 3 / 12 |
| default-320x568-light | 2929px | 5.16 | none | "Start review" 48,672.2 | 224x44 | NO | 603 in main (672 from page top) | 29 / 30 | 192 | 2 / 0 / 5 / 0 / 3 (=7 boxes excl. dividers/marks) | 9 / 21 / 9 / 3 / 16 |
| default-640x400-light | 2050px | 5.13 | none | "Start review" 48,478.8 | 125.7x44 | NO | 410 in main (479 from page top) | 26 / 27 | 192 | 2 / 0 / 5 / 0 / 3 (=7 boxes excl. dividers/marks) | 9 / 21 / 9 / 3 / 16 |
| long-titles-320x568-light | 3290px | 5.79 | none | "Start review" 48,812.2 | 224x44 | NO | 743 in main (812 from page top) | 28 / 29 | 214 | 2 / 0 / 4 / 0 / 3 (=6 boxes excl. dividers/marks) | 11 / 17 / 7 / 2 / 14 |
| large-numbers-375x812-light | 2685px | 3.31 | none | "Start review" 48,608.2 | 279x44 | yes | 539 in main (608 from page top) | 51 / 52 | 193 | 2 / 2 / 7 / 0 / 3 (=11 boxes excl. dividers/marks) | 9 / 21 / 9 / 3 / 16 |
| large-numbers-1280x800-light | 1520px | 1.90 | none | "Start review" 304,409.8 | 125.7x44 | yes | 410 in main (410 from page top) | 125 / 132 | 193 | 5 / 15 / 7 / 2 / 1 (=27 boxes excl. dividers/marks) | 9 / 21 / 9 / 4 / 14 |
| learn-375x812-light | 2532px | 3.12 | none | "Learn 10 new words" 48,538.6 | 279x44 | yes | 470 in main (539 from page top) | 51 / 52 | 181 | 3 / 1 / 6 / 0 / 3 (=10 boxes excl. dividers/marks) | 9 / 19 / 8 / 3 / 16 |
| goal-met-375x812-light | 2532px | 3.12 | none | "Learn 10 new words" 48,538.6 | 279x44 | yes | 470 in main (539 from page top) | 51 / 52 | 182 | 3 / 1 / 6 / 0 / 3 (=10 boxes excl. dividers/marks) | 9 / 19 / 8 / 3 / 16 |

How to read it:

- No capture has horizontal overflow. That includes 320 px wide (WCAG 1.4.10 Reflow) and 640x400, which is what 1280x800 becomes at 200% browser zoom.
- A phone user scrolls 3.3 screens for the default data and 4.9 screens with many decks. Desktop is 1.9 screens at 1280x800.
- The desktop first screen holds 124 words (1280) to 160 words (1920). The phone first screen holds 53.

### 3.2 Is "Start review" visible on a phone without scrolling?

At the requested 375x812 viewport: yes. The button's top edge is at y 581 and its bottom at y 625. 581 px of other things come before it: a 69 px top bar, the greeting (y 101), the status sentence, two rows of language chips (y 222 to 302), the "TODAY" label, the "24 cards ready to review" line, "About 4 minutes", and two deck chips.

But 375x812 is the whole glass of an iPhone X class phone. The browser's own bars take space. I re-measured at approximate visible areas (these sizes are my estimates of common browser chrome, not checked on a device):

| Visible area | Start review bottom edge | Fully visible? | "Learn 10 new words" visible? |
|---|---|---|---|
| 375x635 (iPhone X class, Safari bars showing) | y 625 | yes, with 10 px to spare | no (bottom at y 681) |
| 375x548 (iPhone SE class, Safari bars showing) | y 625 | no, 77 px below the fold | no |
| 390x664 (iPhone 14 class) | y 625 | yes | no |
| 412x760 (Android Chrome) | y 625 | yes | yes |

Other data states at 375 wide:

| State | Primary action top (y) | On 375x812 | On 375x635 |
|---|---|---|---|
| default | 581 | visible | visible by 10 px |
| large-numbers | 608 | visible | cut off |
| caught-up ("Learn 10 more new words", an outline button) | 619 | visible | cut off |
| long-titles | 701 | visible | below the fold |
| many-decks (12 language chips, 5 rows) | 777 | cut off (bottom at 821) | below the fold |
| one-deck (no chips) | 385 | visible | visible |
| no-decks ("Browse community decks") | 427 | visible | visible |
| default at 320x568 | 672 | below the fold | below the fold |

So the main action only stays on the first screen when the learner has few languages and short deck names. The language filter is the main thing pushing it down: 80 px for 4 languages, 212 px for 12 (`LanguageFilter.tsx:30-63`). In the one-deck state, where the filter is hidden, the button rises to y 385.

### 3.3 Where each region sits

| Capture | sidebar/top bar | h1 | filter | Today panel | Continue learning | Other decks | This week | Words slipping | Trends |
|---|---|---|---|---|---|---|---|---|---|
| default-375x812-light | y 0, 375x69 | y 101, 327x32 | y 222, 327x80 | y 334, 327x399 | y 765, 327x350 | y 1147, 327x464 | y 1643, 327x343 | y 2010, 327x192 | y 2234, 327x392 |
| default-414x896-light | y 0, 414x69 | y 101, 366x32 | y 222, 366x80 | y 334, 366x399 | y 765, 366x350 | y 1147, 366x464 | y 1643, 366x343 | y 2010, 366x192 | y 2234, 366x392 |
| default-768x1024-light | y 0, 256x1024 | y 32, 464x36 | y 130, 464x80 | y 242, 464x343 | y 618, 464x326 | y 976, 464x408 | y 1416, 464x343 | y 1783, 464x184 | y 1999, 464x172 |
| default-1280x800-light | y 0, 256x800 | y 32, 976x36 | y 130, 624x36 | y 198, 624x307 | y 538, 624x326 | y 896, 624x408 | y 130, 320x343 | y 497, 320x192 | y 1336, 976x152 |
| default-1920x1080-light | y 0, 256x1080 | y 32, 1232x36 | y 130, 880x36 | y 198, 880x307 | y 538, 880x326 | y 896, 880x280 | y 130, 320x343 | y 497, 320x192 | y 1208, 1232x152 |
| default-320x568-light | y 0, 320x69 | y 101, 272x32 | y 222, 272x124 | y 378, 272x446 | y 856, 272x378 | y 1266, 272x560 | y 1858, 272x343 | y 2225, 272x248 | y 2505, 272x392 |
| default-640x400-light | y 0, 640x69 | y 101, 592x36 | y 199, 592x36 | y 267, 592x307 | y 607, 592x326 | y 965, 592x408 | y 1405, 592x269 | y 1698, 592x136 | y 1866, 592x152 |

Notes:

- At 768 wide (iPad portrait) the 256 px desktop sidebar is already showing, because the layout switches at `md` (`_app.tsx:11`, `AppSidebar.tsx:139`). That leaves `main` only 464 px of content width, narrower than a large phone in landscape. The right column drops below the decks.
- The two-column layout starts at `xl` (1280). Between 768 and 1279 everything is one 464 to 976 px column.
- At 1920 the content column is 1232 px wide and starts at x 472, so "Start review" sits at x 496 and the two buttons end near x 821, leaving about 500 px of empty panel to their right.

### 3.4 What competes in the first screen (1280x800, light)

28 painted boxes of 20 px or more:

- Sidebar surface, logo tile.
- 5 language chips (1 solid blue, 4 outlined).
- Today panel, 2 white deck chips inside it, the solid "Start review" button, the outlined "Learn 10 new words" button.
- "Continue learning" card, its "ES" badge.
- "This week" card, 7 weekday circles (5 solid blue with checks, 1 blue ring, 1 dashed).
- "7 words keep slipping" card, 5 word chips.

Solid primary-blue fills in that screen: 8 (logo tile 784 px², "All languages" chip 4,324 px², "Start review" 5,531 px², five weekday circles at 784 px² each). Add the blue "TODAY" label and the blue goal ring arc. The five weekday circles together (3,920 px² of bounding box) are 71% of the button's area, and the selected chip alone is 78%. The eye gets ten blue things, and the one that matters is not clearly the biggest.

Headings in the first screen: 7 at 1280x800 ("Good evening, Phillip", "TODAY", "Continue learning", "Spanish Core 1000", "This week", "Daily goal", "7 words keep slipping"). 10 at 1920x1080.

Font sizes in the first screen (main, 1280): 12px x10, 14px x23, 16px x8, 18px x4, 20px x3, 24px x1, 30px x3, 48px x1. Two thirds of the text nodes are 12 or 14 px.

### 3.5 Typography actually rendered (whole page, 1280, light)

| Size / weight | Text nodes | Samples |
|---|---|---|
| 48px / 700 | 1 | 24 |
| 30px / 700 | 3 | Good evening, Phillip, 16, 10 |
| 24px / 700 | 4 | 24, 98%, 84%, 142 |
| 20px / 700 | 5 | Continue learning, Spanish Core 1000, Other decks, This week |
| 18px / 600 | 3 | 5% mastered, 12 days, 100 |
| 18px / 500 | 1 | cards ready to review |
| 16px / 600 | 6 | 12-day streak, Japanese Hiragana & Kata, French Travel Phrases, Portuguese Essentials |
| 16px / 500 | 2 | Start review, Learn 10 new words |
| 16px / 400 | 3 | About 4 minutes of revie, going., About 4 minutes |
| 14px / 600 | 2 | Today, ES |
| 14px / 500 | 13 | Studying, All languages, French, Japanese |
| 14px / 400 | 19 | 16 from Spanish Core 100, 8 from Japanese Hiragana, Starts in Spanish Core 1, Last studied 2 hours ago |
| 12px / 600 | 4 | JA, FR, PT, F |
| 12px / 500 | 6 | 8 due, 10 new, Caught up, Consistency |
| 12px / 400 | 12 | 20% mastered, 8% mastered, of 50, S |

Distinct size/weight pairs in main: 15. Distinct font sizes: 8. Distinct weights: 4.

Distinct text colours in main: oklch(0.236 0.025 261) = #181e2a (41 nodes); oklch(0.491 0.032 261) = #576173 (38 nodes); oklch(1 0 0) = #ffffff (3 nodes); oklch(0.488 0.243 264.376) = #1447e6 (2 nodes)

Headings: H1 "Good evening, Phillip" 30px/700; H2 "TODAY" 14px/600; H2 "Continue learning" 20px/700; H3 "Spanish Core 1000" 20px/700; H2 "Other decks" 20px/700; H3 "Japanese Hiragana & Katakana" 16px/600; H3 "French Travel Phrases" 16px/600; H3 "Portuguese Essentials" 16px/600; H2 "This week" 20px/700; H3 "Daily goal" 16px/600; H2 "7 words keep slipping" 16px/600; H2 "Your progress trends" 20px/700

Landmarks: aside "Application sidebar"; nav "Primary"; main; header; div[role=group] "Studying"; section "TODAY"; a[role=button]; a[role=button]; section "Continue learning"; section "Other decks"; a[role=button] "Review 8 cards in Japanese Hiragana & Katakana"; a[role=button] "Learn 10 new words in French Travel Phrases"; aside "Your progress"; section "This week"; section "7 words keep slipping"; section "Your progress trends"

Things worth noticing:

- Three different things are 30px/700: the greeting, and the "16" and "10" in the focus deck card. Four things are 24px/700: the ring's "24" and the three trend numbers. The "24" in the Today panel is 48px/700. So the page has seven big bold numbers plus the greeting, spread over five regions (header, Today, focus deck, This week, trends).
- 38 of 79 text nodes in `main` (48%) use the secondary gray `#576173`. 41 use the main ink `#181e2a`. Blue is used for text only twice ("TODAY" and "Added this month").
- "Added this month" is blue but is not a link (`ProgressTrends.tsx:88` passes `detailClassName="text-primary"`, rendered as `<dd class="text-sm text-primary">`). Blue text reads as clickable.

## 4. Interactive targets

Rules used. WCAG 2.2 SC 2.5.8 Target Size (Minimum), level AA: 24x24 CSS px, with a spacing exception. SC 2.5.5 Target Size (Enhanced), level AAA, and Apple's Human Interface Guidelines: 44x44. The owner's standing rule is that phones get a real touch design, so I flag 44 on touch widths.

Result: nothing is under 24x24. So WCAG 2.2 AA passes. On touch widths, most targets are under 44 px tall.

#### default-375x812-light (12 targets, touch width)

| # | Target | Region | Visual box (w x h) | Hit area incl. ::before | y | Under 44x44 (visual) | Under 24x24 (hit area) |
|---|---|---|---|---|---|---|---|
| 1 | a "Memli" (current) | sidebar | 83 x 28 | 83 x 28 | 20 | YES (height) | no |
| 2 | button "Account menu, @prototype_learner" | sidebar | 44 x 44 | 44 x 44 | 12 | no | no |
| 3 | button "Navigation menu" | sidebar | 32 x 32 | 32 x 32 | 18 | YES (both) | no |
| 4 | a "All languages" (current) | studying | 120.1 x 36 | 120.1 x 36 | 222 | YES (height) | no |
| 5 | a "French" | studying | 76.2 x 36 | 76.2 x 36 | 222 | YES (height) | no |
| 6 | a "Japanese" | studying | 95.2 x 36 | 95.2 x 36 | 266 | YES (height) | no |
| 7 | a "Portuguese" | studying | 107.3 x 36 | 107.3 x 36 | 266 | YES (height) | no |
| 8 | a "Spanish" | studying | 83.7 x 36 | 83.7 x 36 | 266 | YES (height) | no |
| 9 | a "Start review" | today | 279 x 44 | 279 x 44 | 581 | no | no |
| 10 | a "Learn 10 new words" | today | 279 x 44 | 279 x 44 | 637 | no | no |
| 11 | a "Review 8 cards in Japanese Hiragana & Kataka" | decks | 74 x 36 | 74 x 36 | 1293 | YES (height) | no |
| 12 | a "Learn 10 new words in French Travel Phrases" | decks | 64.3 x 36 | 64.3 x 36 | 1448 | YES (height) | no |

#### default-768x1024-light (13 targets, touch width)

| # | Target | Region | Visual box (w x h) | Hit area incl. ::before | y | Under 44x44 (visual) | Under 24x24 (hit area) |
|---|---|---|---|---|---|---|---|
| 1 | a "Memli" (current) | sidebar | 83 x 28 | 83 x 28 | 24 | YES (height) | no |
| 2 | a "Decks" | sidebar | 231 x 36 | 231 x 36 | 76 | YES (height) | no |
| 3 | a "Community Gallery" | sidebar | 231 x 36 | 231 x 36 | 116 | YES (height) | no |
| 4 | button "Account menu, @prototype_learner PRO" | sidebar | 231 x 56 | 231 x 56 | 956 | no | no |
| 5 | a "All languages" (current) | studying | 120.1 x 36 | 120.1 x 36 | 130 | YES (height) | no |
| 6 | a "French" | studying | 76.2 x 36 | 76.2 x 36 | 130 | YES (height) | no |
| 7 | a "Japanese" | studying | 95.2 x 36 | 95.2 x 36 | 130 | YES (height) | no |
| 8 | a "Portuguese" | studying | 107.3 x 36 | 107.3 x 36 | 174 | YES (height) | no |
| 9 | a "Spanish" | studying | 83.7 x 36 | 83.7 x 36 | 174 | YES (height) | no |
| 10 | a "Start review" | today | 125.7 x 44 | 125.7 x 44 | 490 | no | no |
| 11 | a "Learn 10 new words" | today | 186.5 x 44 | 186.5 x 44 | 490 | no | no |
| 12 | a "Review 8 cards in Japanese Hiragana & Kataka" | decks | 74 x 36 | 74 x 36 | 1094 | YES (height) | no |
| 13 | a "Learn 10 new words in French Travel Phrases" | decks | 64.3 x 36 | 64.3 x 36 | 1221 | YES (height) | no |

#### default-1280x800-light (13 targets)

| # | Target | Region | Visual box (w x h) | Hit area incl. ::before | y | Under 44x44 (visual) | Under 24x24 (hit area) |
|---|---|---|---|---|---|---|---|
| 1 | a "Memli" (current) | sidebar | 83 x 28 | 83 x 28 | 24 | YES (height) | no |
| 2 | a "Decks" | sidebar | 231 x 36 | 231 x 36 | 76 | YES (height) | no |
| 3 | a "Community Gallery" | sidebar | 231 x 36 | 231 x 36 | 116 | YES (height) | no |
| 4 | button "Account menu, @prototype_learner PRO" | sidebar | 231 x 56 | 231 x 56 | 732 | no | no |
| 5 | a "All languages" (current) | studying | 120.1 x 36 | 120.1 x 36 | 130 | YES (height) | no |
| 6 | a "French" | studying | 76.2 x 36 | 76.2 x 36 | 130 | YES (height) | no |
| 7 | a "Japanese" | studying | 95.2 x 36 | 95.2 x 36 | 130 | YES (height) | no |
| 8 | a "Portuguese" | studying | 107.3 x 36 | 107.3 x 36 | 130 | YES (height) | no |
| 9 | a "Spanish" | studying | 83.7 x 36 | 83.7 x 36 | 130 | YES (height) | no |
| 10 | a "Start review" | today | 125.7 x 44 | 125.7 x 44 | 410 | no | no |
| 11 | a "Learn 10 new words" | today | 186.5 x 44 | 186.5 x 44 | 410 | no | no |
| 12 | a "Review 8 cards in Japanese Hiragana & Kataka" | decks | 74 x 36 | 74 x 36 | 1014 | YES (height) | no |
| 13 | a "Learn 10 new words in French Travel Phrases" | decks | 64.3 x 36 | 64.3 x 36 | 1141 | YES (height) | no |

Also measured:

- Menu rows (the mobile "Navigation menu", and "Account menu" on both sizes) are 216 to 223 px wide and 32 px tall, at 14 px text. Under 44 on touch.
- The 414, 1920 and other-state tables match these apart from widths. In the many-decks state there are 26 targets on a phone, 12 of them 36 px tall language chips stacked in 5 rows 8 px apart, and 8 deck-row buttons 64 to 74 px wide and 36 px tall.

What is NOT a target, and a non-technical person will expect to be:

- The focus deck card ("Spanish Core 1000"). No link anywhere in it in the default state, because its button is hidden when it would repeat the Today action (`dashboard.tsx:140-145`).
- Deck titles in "Other decks". Only the small "Review" or "Learn" button is clickable. A caught-up deck ("Portuguese Essentials") has no control at all, so there is no way to open it from here.
- The five "words keep slipping" chips and the callout itself. It tells the learner a new mnemonic can help and offers nothing to press (`MemoryCallout.tsx:36-66`).
- Everything in "This week" and "Your progress trends".

So 5 of the 8 regions on the page are read-only. The page shows a lot and lets the learner do little: 2 real actions, a filter, and 2 small row buttons.

## 5. Contrast: text

WCAG 2.2 AA: 4.5:1, or 3:1 for large text (24 px, or 18.66 px bold). All pairs below come from the default state at 1280 and 375 wide. The other eight preview states add no new colour pairs.

### Text pairs, light (preview=default, union of 1280 and 375 widths)

| # | Text colour | On background | WCAG ratio | APCA Lc | Where it is used (size/weight: samples) | WCAG 2.2 AA | APCA |
|---|---|---|---|---|---|---|---|
| 1 | `#576173` | `#f0f3f7` | 5.59:1 | 73.8 | 12px/500: "Consistency", "Retention", "New cards" (needs Lc 75)<br>14px/500: "Decks", "Community Gallery" (needs Lc 75)<br>14px/400: "+2% from last week", "Global average: 75%" (needs Lc 75) | PASS | FAIL |
| 2 | `#576173` | `#f1f6ff` | 5.73:1 | 75.5 | 14px/400: "Starts in Spanish Core 1000." (needs Lc 75)<br>16px/400: "About 4 minutes" (needs Lc 75) | PASS | PASS |
| 3 | `#973c00` | `#f1eadf` | 5.95:1 | 71.8 | 10px/600: "Pro" (needs Lc 75) | PASS | FAIL |
| 4 | `#576173` | `#f9fafd` | 5.97:1 | 78.1 | 14px/500: "Studying" (needs Lc 75)<br>16px/400: "About 4 minutes of review ke", "going." (needs Lc 75)<br>16px/600: "12-day streak" (needs Lc 60) | PASS | PASS |
| 5 | `#1447e6` | `#f0f3f7` | 6.11:1 | 75.0 | 14px/400: "Added this month" (needs Lc 75) | PASS | PASS |
| 6 | `#576173` | `#ffffff` | 6.24:1 | 81.1 | 12px/400: "20% mastered", "8% mastered", "of 50" (needs Lc 75)<br>14px/400: "16 from Spanish Core 1000", "8 from Japanese Hiragana & K", "Last studied 2 hours ago" (needs Lc 75) | PASS | PASS |
| 7 | `#1447e6` | `#f1f6ff` | 6.27:1 | 76.8 | 14px/600: "Today" (needs Lc 75) | PASS | PASS |
| 8 | `#ffffff` | `#1447e6` | 6.82:1 | -87.5 | 12px/500: "8 due" (needs Lc 75)<br>14px/500: "All languages" (needs Lc 75)<br>16px/500: "Start review" (needs Lc 60) | PASS | PASS |
| 9 | `#181e2a` | `#f0f3f7` | 14.90:1 | 96.3 | 12px/600: "JA", "FR", "PT" (needs Lc 75)<br>12px/500: "10 new" (needs Lc 75)<br>14px/500: "@", "prototype_learner", "aprovechar" (needs Lc 75)<br>14px/600: "ES" (needs Lc 75)<br>16px/600: "Memli" (needs Lc 60)<br>24px/700: "98%", "84%", "142" (needs Lc 45) | PASS | PASS |
| 10 | `#181e2a` | `#f1f6ff` | 15.30:1 | 98.0 | 18px/500: "cards ready to review" (needs Lc 60)<br>48px/700: "24" (needs Lc 45) | PASS | PASS |
| 11 | `#181e2a` | `#f9fafd` | 15.93:1 | 100.6 | 14px/500: "French", "Japanese", "Portuguese" (needs Lc 75)<br>16px/500: "Learn 10 new words" (needs Lc 60)<br>20px/700: "Continue learning", "Other decks", "This week" (needs Lc 60)<br>24px/700: "Good evening, Phillip" (needs Lc 45)<br>30px/700: "Good evening, Phillip" (needs Lc 45) | PASS | PASS |
| 12 | `#181e2a` | `#ffffff` | 16.63:1 | 103.6 | 12px/500: "Caught up" (needs Lc 75)<br>12px/600: "F" (needs Lc 75)<br>16px/600: "Japanese Hiragana & Katakana", "French Travel Phrases", "Portuguese Essentials" (needs Lc 60)<br>18px/600: "5% mastered", "12 days", "100" (needs Lc 60)<br>20px/700: "Spanish Core 1000" (needs Lc 60)<br>24px/700: "24" (needs Lc 45)<br>30px/700: "16", "10" (needs Lc 45) | PASS | PASS |

### Text pairs, dark (preview=default, union of 1280 and 375 widths)

| # | Text colour | On background | WCAG ratio | APCA Lc | Where it is used (size/weight: samples) | WCAG 2.2 AA | APCA |
|---|---|---|---|---|---|---|---|
| 1 | `#9099a8` | `#252c38` | 4.89:1 | -42.7 | 12px/500: "Consistency", "Retention", "New cards" (needs Lc 75)<br>14px/400: "Starts in Spanish Core 1000.", "+2% from last week", "Global average: 75%" (needs Lc 75)<br>16px/400: "About 4 minutes" (needs Lc 75) | PASS | FAIL |
| 2 | `#6a99ff` | `#252c38` | 5.12:1 | -44.6 | 14px/600: "Today" (needs Lc 75)<br>14px/400: "Added this month" (needs Lc 75) | PASS | FAIL |
| 3 | `#9099a8` | `#181e2a` | 5.78:1 | -45.0 | 12px/400: "20% mastered", "8% mastered", "of 50" (needs Lc 75)<br>14px/500: "Decks", "Community Gallery" (needs Lc 75)<br>14px/400: "16 from Spanish Core 1000", "8 from Japanese Hiragana & K", "Last studied 2 hours ago" (needs Lc 75) | PASS | FAIL |
| 4 | `#9099a8` | `#0a111b` | 6.59:1 | -46.3 | 14px/500: "Studying" (needs Lc 75)<br>16px/400: "About 4 minutes of review ke", "going." (needs Lc 75)<br>16px/600: "12-day streak" (needs Lc 60) | PASS | FAIL |
| 5 | `#0a111b` | `#6a99ff` | 6.90:1 | 50.3 | 12px/500: "8 due" (needs Lc 75)<br>14px/500: "All languages" (needs Lc 75)<br>16px/500: "Start review" (needs Lc 60) | PASS | FAIL |
| 6 | `#ffd230` | `#2f2b26` | 9.75:1 | -78.1 | 10px/600: "Pro" (needs Lc 75) | PASS | PASS |
| 7 | `#f0f3f7` | `#2e3541` | 11.00:1 | -93.5 | 16px/500: "Learn 10 new words" (needs Lc 60) | PASS | PASS |
| 8 | `#f0f3f7` | `#252c38` | 12.60:1 | -95.6 | 12px/600: "JA", "FR", "PT" (needs Lc 75)<br>12px/500: "10 new" (needs Lc 75)<br>14px/600: "ES" (needs Lc 75)<br>14px/500: "aprovechar", "ぬ", "embarazada" (needs Lc 75)<br>18px/500: "cards ready to review" (needs Lc 60)<br>24px/700: "98%", "84%", "142" (needs Lc 45)<br>48px/700: "24" (needs Lc 45) | PASS | PASS |
| 9 | `#f0f3f7` | `#222934` | 13.16:1 | -96.2 | 14px/500: "Review", "Learn" (needs Lc 75) | PASS | PASS |
| 10 | `#f0f3f7` | `#181e2a` | 14.90:1 | -97.9 | 12px/500: "Caught up" (needs Lc 75)<br>12px/600: "F" (needs Lc 75)<br>14px/500: "@", "prototype_learner" (needs Lc 75)<br>16px/600: "Memli", "Japanese Hiragana & Katakana", "French Travel Phrases" (needs Lc 60)<br>18px/600: "5% mastered", "12 days", "100" (needs Lc 60)<br>20px/700: "Spanish Core 1000" (needs Lc 60)<br>24px/700: "24" (needs Lc 45)<br>30px/700: "16", "10" (needs Lc 45) | PASS | PASS |
| 11 | `#f0f3f7` | `#0a111b` | 16.99:1 | -99.3 | 14px/500: "French", "Japanese", "Portuguese" (needs Lc 75)<br>20px/700: "Continue learning", "Other decks", "This week" (needs Lc 60)<br>24px/700: "Good evening, Phillip" (needs Lc 45)<br>30px/700: "Good evening, Phillip" (needs Lc 45) | PASS | PASS |

Reading the two tables together:

- Light mode text is strong. The lowest ratio is 5.59:1. The only APCA misses are the gray on the sidebar and trend tiles (Lc 73.8, a hair under 75) and the 10 px "PRO" badge.
- Dark mode passes WCAG everywhere but fails APCA on every secondary-text pair: Lc 42.7 to 46.3 where 75 is the target. This is the known gap between the two models. WCAG 2 overstates contrast for light-on-dark. That affects "About 4 minutes", "Last studied…", every "% mastered", the chip text in Today, the trend labels and the sidebar links.
- Dark mode "Start review" is dark ink on light blue: 6.9:1 by WCAG, but Lc 50.3 by APCA against a target of 60 for 16px/500. On hover it drops to Lc 39. The "8 due" badge (12 px) and the selected chip (14 px) use the same pair and need Lc 75.
- "TODAY" and "Added this month" in dark are light blue on the lighter panel: Lc 44.6.

### 5.1 How far secondary text would have to move

Same hue and chroma as today, only lightness changed, solved with the same APCA code:

| Theme | Background | Current muted text | Current Lc | OKLCH L needed for Lc 60 | L needed for Lc 75 | L needed for Lc 90 |
|---|---|---|---|---|---|---|
| light | `#f9fafd` | `#576173` | 78.1 | 0.627 (#7d899c, WCAG 3.4:1) | 0.516 (#5d687b, WCAG 5.4:1) | 0.382 (#394354, WCAG 9.5:1) |
| light | `#ffffff` | `#576173` | 81.1 | 0.647 (#838fa2, WCAG 3.3:1) | 0.540 (#646f82, WCAG 5.1:1) | 0.412 (#414b5d, WCAG 8.8:1) |
| light | `#f0f3f7` | `#576173` | 73.8 | 0.595 (#747f92, WCAG 3.6:1) | 0.481 (#545e70, WCAG 5.8:1) | 0.337 (#2e3748, WCAG 10.7:1) |
| dark | `#0a111b` | `#9099a8` | -46.3 | 0.763 (#a9b3c2, WCAG 8.9:1) | 0.845 (#c3cddd, WCAG 11.8:1) | 0.920 (#dbe5f6, WCAG 15.0:1) |
| dark | `#181e2a` | `#9099a8` | -45.0 | 0.770 (#abb5c5, WCAG 8.1:1) | 0.851 (#c5cfdf, WCAG 10.6:1) | 0.927 (#dee7f8, WCAG 13.5:1) |
| dark | `#252c38` | `#9099a8` | -42.7 | 0.784 (#b0b9c9, WCAG 7.1:1) | 0.863 (#c9d3e3, WCAG 9.3:1) | 0.937 (#e1ebfc, WCAG 11.7:1) |

In plain words: in light mode the gray is already about right. In dark mode secondary text needs to go from L 0.68 to about L 0.85 to read as easily as the light theme's does.

### 5.2 Primary button label

| Theme | Fill | Label | WCAG | APCA Lc |
|---|---|---|---|---|
| light (today) | `#1447e6` | `#ffffff` | 6.83:1 | -87.5 |
| dark (today) | `#6a99ff` | `#0a111b` | 6.87:1 | 50.3 |
| dark, if it kept the light fill | `#1447e6` | `#ffffff` | 6.83:1 | -87.5 |
| dark, white on today's fill | `#6a99ff` | `#ffffff` | 2.76:1 | -58.3 |

- light primary fill vs dark page #0a111b: WCAG 2.77:1, APCA -19.0
- light primary fill vs dark Today panel #252c38: WCAG 2.05:1, APCA -15.3

Neither existing option works in dark mode. The pale fill gives a weak label (Lc 50). The light theme's fill gives a strong label but the button shape itself is only 2.05 to 2.77:1 against dark surfaces.

A scan of blues at hue 264, chroma 0.19 (script `solve-primary.mjs`) shows how narrow the window is:

| Fill (OKLCH L) | sRGB | Fill vs page `#0a111b` | Fill vs Today panel `#252c38` | White label | Dark-ink label |
|---|---|---|---|---|---|
| 0.50 | `#2858cd` | 3.02:1 | 2.24:1 | 6.26:1, Lc 86 | 3.02:1, Lc 23 |
| 0.53 | `#3061d8` | 3.45:1 | 2.56:1 | 5.49:1, Lc 82 | 3.45:1, Lc 27 |
| 0.56 | `#386be2` | 3.92:1 | 2.91:1 | 4.83:1, Lc 78 | 3.92:1, Lc 31 |
| 0.59 | `#4174ec` | 4.45:1 | 3.30:1 | 4.25:1, Lc 74 | 4.45:1, Lc 34 |
| 0.62 | `#497ef7` | 5.04:1 | 3.74:1 | 3.76:1, Lc 70 | 5.04:1, Lc 39 |
| 0.70 (today) | `#6a99ff` | 6.90:1 | 5.12:1 | 2.76:1, Lc 58 | 6.87:1, Lc 50 |

A blue button with a white label passes both WCAG 4.5:1 and 3:1-against-the-surface only around L 0.53 to 0.56, and only if it sits on the darkest surface, not on a lighter panel. This is why a blue primary on a navy page is hard to make pop. The dark example people liked (example-02) used a yellow button on navy. A warm, light accent for the one main action is worth testing in the colour work, because a light fill on a dark surface gets high contrast on both the shape and a dark label at once.

## 6. Contrast: non-text (borders, fills, rings, icons, chart parts)

WCAG 2.2 SC 1.4.11 Non-text Contrast asks 3:1 for the parts of a control or graphic that are needed to understand it. A border on a button that also has a readable text label is not strictly required to pass, so "below" in these tables is not automatically a WCAG failure. It does show where the page is visually faint. Section 6.3 lists the ones I think are real 1.4.11 problems.

### Non-text pairs, light (preview=default, union of 1280 and 375 widths)

| # | Kind | Colour | Against | WCAG ratio | APCA Lc | Examples | Regions | 3:1 (SC 1.4.11) | Lc 30 |
|---|---|---|---|---|---|---|---|---|---|
| 1 | border vs inside | `#1447e6` | `#1447e6` | 1.00:1 | 0.0 | a "All languages" [rounded-full border] | studying | below | below |
| 2 | border vs inside | `#e0e3e9` | `#f0f3f7` | 1.15:1 | 0.0 | aside "Application sidebar" [border-b border-sidebar-border bg-sidebar] | sidebar | below | below |
| 3 | border vs inside | `#f5d29c` | `#f1eadf` | 1.21:1 | 9.0 | span "PRO" [] | sidebar | below | below |
| 4 | border vs inside | `#e0e3e9` | `#f9fafd` | 1.23:1 | 11.2 | a "Learn 10 new words" []<br>a "Review 8 cards in Japa" []<br>a "Learn 10 new words in " [] | today, decks | below | below |
| 5 | border vs outside | `#e0e3e9` | `#f0f3f7` | 1.15:1 | 0.0 | div "Account menu, @prototy" [border-t border-sidebar-border] 1px Top | sidebar | below | below |
| 6 | border vs outside | `#e0e3e9` | `#f1f6ff` | 1.18:1 | 8.6 | a "Learn 10 new words" [] 1px all sides | today | below | below |
| 7 | border vs outside | `#e0e3e9` | `#f9fafd` | 1.23:1 | 11.2 | aside "Application sidebar" [border-b border-sidebar-border bg-sidebar] 1px Right<br>a "French" [rounded-full border] 1px all sides<br>a "Japanese" [rounded-full border] 1px all sides<br>a "Portuguese" [rounded-full border] 1px all sides | sidebar, studying | below | below |
| 8 | border vs outside | `#f4d8ad` | `#f0f3f7` | 1.23:1 | 10.9 | span "PRO" [] 1px all sides | sidebar | below | below |
| 9 | border vs outside | `#e0e3e9` | `#ffffff` | 1.28:1 | 14.2 | li "JA Japanese Japanese H" [] 1px Bottom<br>a "Review 8 cards in Japa" [] 1px all sides<br>li "FR French French Trave" [] 1px Bottom<br>a "Learn 10 new words in " [] 1px all sides | decks, week | below | below |
| 10 | border vs outside | `#bcc0c7` | `#ffffff` | 1.83:1 | 34.2 | span [size-7 rounded-full border border-dashed] 1px all sides | week | below | PASS |
| 11 | border vs outside | `#1447e6` | `#f9fafd` | 6.54:1 | 79.4 | a "All languages" [rounded-full border] 1px all sides | studying | PASS | PASS |
| 12 | fill vs surroundings | `#f1f6ff` | `#f9fafd` | 1.04:1 | 0.0 | section "TODAY 24 cards ready t" [bg-accent] | today | below | below |
| 13 | fill vs surroundings | `#f9fafd` | `#f1f6ff` | 1.04:1 | 0.0 | a "Learn 10 new words" [] | today | below | below |
| 14 | fill vs surroundings | `#ffffff` | `#f9fafd` | 1.04:1 | 0.0 | div "ES Spanish Spanish Cor" [bg-card]<br>ul "JA Japanese Japanese H" [bg-card ring-1 ring-foreground/10]<br>div "24 of 50 Daily goal 26" [bg-card]<br>section "7 words keep slipping " [bg-card ring-1 ring-foreground/10] | focus, decks, week, slipping | below | below |
| 15 | fill vs surroundings | `#f9fafd` | `#ffffff` | 1.04:1 | 0.0 | a "Review 8 cards in Japa" []<br>a "Learn 10 new words in " []<br>span [size-7 rounded-full bg-background ring-2] | decks, week | below | below |
| 16 | fill vs surroundings | `#f0f3f7` | `#f9fafd` | 1.07:1 | 0.0 | aside "Application sidebar" [border-b border-sidebar-border bg-sidebar]<br>div "CONSISTENCY 98% +2% fr" [bg-secondary]<br>div "RETENTION 84% Global a" [bg-secondary]<br>div "NEW CARDS 142 Added th" [bg-secondary] | sidebar, progress-trends | below | below |
| 17 | fill vs surroundings | `#f1eadf` | `#f0f3f7` | 1.07:1 | 0.0 | span "PRO" [] | sidebar | below | below |
| 18 | fill vs surroundings | `#ffffff` | `#f1f6ff` | 1.09:1 | 0.0 | li "16 from Spanish Core 1" [bg-card]<br>li "8 from Japanese Hiraga" [bg-card] | today | below | below |
| 19 | fill vs surroundings | `#f0f3f7` | `#ffffff` | 1.12:1 | 0.0 | span "ES Spanish" []<br>div [rounded-full bg-muted]<br>span "JA Japanese" []<br>span "FR French" [] | focus, decks, slipping | below | below |
| 20 | fill vs surroundings | `#e0e3e9` | `#f0f3f7` | 1.15:1 | 0.0 | div [bg-chart-4] | focus | below | below |
| 21 | fill vs surroundings | `#e0e3e9` | `#ffffff` | 1.28:1 | 14.2 | span [size-2.5 rounded-full bg-chart-4] | focus | below | below |
| 22 | fill vs surroundings | `#6a99ff` | `#f0f3f7` | 2.46:1 | 45.7 | div [bg-chart-2] | focus | below | PASS |
| 23 | fill vs surroundings | `#6a99ff` | `#ffffff` | 2.75:1 | 53.0 | span [size-2.5 rounded-full bg-chart-2] | focus | below | PASS |
| 24 | fill vs surroundings | `#1447e6` | `#f0f3f7` | 6.11:1 | 75.0 | span [bg-primary size-7]<br>div [bg-chart-1]<br>div [rounded-full bg-chart-1] | sidebar, focus, decks | PASS | PASS |
| 25 | fill vs surroundings | `#1447e6` | `#f1f6ff` | 6.27:1 | 76.8 | a "Start review" [] | today | PASS | PASS |
| 26 | fill vs surroundings | `#1447e6` | `#f9fafd` | 6.54:1 | 79.4 | a "All languages" [rounded-full border] | studying | PASS | PASS |
| 27 | fill vs surroundings | `#1447e6` | `#ffffff` | 6.82:1 | 82.4 | span [size-2.5 rounded-full bg-chart-1]<br>span "8 due" []<br>span [size-7 rounded-full bg-primary] | focus, decks, week | PASS | PASS |
| 28 | fill vs surroundings | `#181e2a` | `#f0f3f7` | 14.90:1 | 96.3 | span [bg-foreground] | sidebar | PASS | PASS |
| 29 | ring (1px box-shadow) vs outside | `#e2e4e8` | `#f9fafd` | 1.22:1 | 10.6 | div "ES Spanish Spanish Cor" [bg-card] raw oklab(0.236 -0.00391086 -0.0246922 / 0.1)<br>ul "JA Japanese Japanese H" [bg-card ring-1 ring-foreground/10] raw oklab(0.236 -0.00391086 -0.0246922 / 0.1)<br>div "24 of 50 Daily goal 26" [bg-card] raw oklab(0.236 -0.00391086 -0.0246922 / 0.1)<br>section "7 words keep slipping " [bg-card ring-1 ring-foreground/10] raw oklab(0.236 -0.00391086 -0.0246922 / 0.1) | focus, decks, week, slipping | below | below |
| 30 | ring (2px box-shadow) vs outside | `#1447e6` | `#ffffff` | 6.82:1 | 82.4 | span [size-7 rounded-full bg-background ring-2] raw oklch(0.488 0.243 264.376) | week | PASS | PASS |
| 31 | svg-stroke | `#f0f3f7` | `#ffffff` | 1.12:1 | 0.0 | circle.stroke-muted in svg.-rotate-90 (80.6x80.6, stroke 8px) | week | below | below |
| 32 | svg-stroke | `#f16a00` | `#ffffff` | 3.08:1 | 56.9 | path in svg.lucide.lucide-flame.size-4 (9.3x12.7, stroke 2px)<br>path in svg.lucide.lucide-lightbulb.size-5 (10x10, stroke 2px) | week, slipping | PASS | PASS |
| 33 | svg-stroke | `#576173` | `#f0f3f7` | 5.59:1 | 73.8 | path in svg.lucide.lucide-layers.size-4 (13.3x6.7, stroke 2px)<br>path in svg.lucide.lucide-layers.size-4 (13.3x3.3, stroke 2px)<br>rect in svg.lucide.lucide-image.size-4 (12x12, stroke 2px)<br>circle in svg.lucide.lucide-image.size-4 (2.7x2.7, stroke 2px) | sidebar | PASS | PASS |
| 34 | svg-stroke | `#1447e6` | `#f9fafd` | 6.54:1 | 79.4 | path in svg.lucide.lucide-trending-up.size-5 (5x5, stroke 2px)<br>path in svg.lucide.lucide-trending-up.size-5 (16.7x8.3, stroke 2px) | progress-trends | PASS | PASS |
| 35 | svg-stroke | `#ffffff` | `#1447e6` | 6.82:1 | -87.5 | path in svg.lucide.lucide-book-open.size-4 (13.3x12, stroke 2px)<br>path in svg.lucide.lucide-check.size-4 (10.7x7.3, stroke 2px) | sidebar, week | PASS | PASS |
| 36 | svg-stroke | `#1447e6` | `#ffffff` | 6.82:1 | 82.4 | circle.stroke-primary in svg.-rotate-90 (80.6x80.6, stroke 8px) | week | PASS | PASS |

### Non-text pairs, dark (preview=default, union of 1280 and 375 widths)

| # | Kind | Colour | Against | WCAG ratio | APCA Lc | Examples | Regions | 3:1 (SC 1.4.11) | Lc 30 |
|---|---|---|---|---|---|---|---|---|---|
| 1 | border vs inside | `#6a99ff` | `#6a99ff` | 1.00:1 | 0.0 | a "All languages" [rounded-full border] | studying | below | below |
| 2 | border vs inside | `#2f3540` | `#181e2a` | 1.35:1 | 0.0 | aside "Application sidebar" [border-b border-sidebar-border bg-sidebar] | sidebar | below | below |
| 3 | border vs inside | `#4e545e` | `#2e3541` | 1.60:1 | -9.2 | a "Learn 10 new words" [] | today | below | below |
| 4 | border vs inside | `#434952` | `#222934` | 1.62:1 | -7.9 | a "Review 8 cards in Japa" []<br>a "Learn 10 new words in " [] | decks | below | below |
| 5 | border vs inside | `#6d4c1b` | `#2f2b26` | 1.81:1 | -11.1 | span "PRO" [] | sidebar | below | below |
| 6 | border vs outside | `#232832` | `#0a111b` | 1.29:1 | 0.0 | aside "Application sidebar" [border-b border-sidebar-border bg-sidebar] 1px Right<br>a "French" [rounded-full border] 1px all sides<br>a "Japanese" [rounded-full border] 1px all sides<br>a "Portuguese" [rounded-full border] 1px all sides | sidebar, studying | below | below |
| 7 | border vs outside | `#2f3540` | `#181e2a` | 1.35:1 | 0.0 | div "Account menu, @prototy" [border-t border-sidebar-border] 1px Top<br>li "JA Japanese Japanese H" [] 1px Bottom<br>li "FR French French Trave" [] 1px Bottom<br>span "Caught up" [] 1px all sides | sidebar, decks, week | below | below |
| 8 | border vs outside | `#3a404a` | `#181e2a` | 1.60:1 | 0.0 | a "Review 8 cards in Japa" [] 1px all sides<br>a "Learn 10 new words in " [] 1px all sides | decks | below | below |
| 9 | border vs outside | `#454c56` | `#252c38` | 1.62:1 | -8.3 | a "Learn 10 new words" [] 1px all sides | today | below | below |
| 10 | border vs outside | `#5d431e` | `#181e2a` | 1.82:1 | -9.4 | span "PRO" [] 1px all sides | sidebar | below | below |
| 11 | border vs outside | `#484f5d` | `#181e2a` | 2.03:1 | -11.9 | span [size-7 rounded-full border border-dashed] 1px all sides | week | below | below |
| 12 | border vs outside | `#6a99ff` | `#0a111b` | 6.90:1 | -48.3 | a "All languages" [rounded-full border] 1px all sides | studying | PASS | PASS |
| 13 | fill vs surroundings | `#222934` | `#181e2a` | 1.13:1 | 0.0 | a "Review 8 cards in Japa" []<br>a "Learn 10 new words in " [] | decks | below | below |
| 14 | fill vs surroundings | `#181e2a` | `#0a111b` | 1.14:1 | 0.0 | aside "Application sidebar" [border-b border-sidebar-border bg-sidebar]<br>div "ES Spanish Spanish Cor" [bg-card]<br>ul "JA Japanese Japanese H" [bg-card ring-1 ring-foreground/10]<br>div "24 of 50 Daily goal 26" [bg-card] | sidebar, focus, decks, week, slipping | below | below |
| 15 | fill vs surroundings | `#0a111b` | `#181e2a` | 1.14:1 | 0.0 | span [size-7 rounded-full bg-background ring-2] | week | below | below |
| 16 | fill vs surroundings | `#2e3541` | `#252c38` | 1.15:1 | 0.0 | a "Learn 10 new words" [] | today | below | below |
| 17 | fill vs surroundings | `#2f2b26` | `#181e2a` | 1.18:1 | 0.0 | span "PRO" [] | sidebar | below | below |
| 18 | fill vs surroundings | `#252c38` | `#181e2a` | 1.18:1 | 0.0 | span [size-full rounded-full bg-muted]<br>span "ES Spanish" []<br>div [rounded-full bg-muted]<br>span "JA Japanese" [] | sidebar, focus, decks, slipping | below | below |
| 19 | fill vs surroundings | `#181e2a` | `#252c38` | 1.18:1 | 0.0 | li "16 from Spanish Core 1" [bg-card]<br>li "8 from Japanese Hiraga" [bg-card] | today | below | below |
| 20 | fill vs surroundings | `#252c38` | `#0a111b` | 1.35:1 | 0.0 | section "TODAY 24 cards ready t" [bg-accent]<br>div "CONSISTENCY 98% +2% fr" [bg-secondary]<br>div "RETENTION 84% Global a" [bg-secondary]<br>div "NEW CARDS 142 Added th" [bg-secondary] | today, progress-trends | below | below |
| 21 | fill vs surroundings | `#1447e6` | `#252c38` | 2.06:1 | -15.3 | div [bg-chart-2] | focus | below | below |
| 22 | fill vs surroundings | `#1447e6` | `#181e2a` | 2.44:1 | -17.7 | span [size-2.5 rounded-full bg-chart-2] | focus | below | below |
| 23 | fill vs surroundings | `#838c9b` | `#252c38` | 4.13:1 | -36.1 | div [bg-chart-4] | focus | PASS | PASS |
| 24 | fill vs surroundings | `#838c9b` | `#181e2a` | 4.89:1 | -38.4 | span [size-2.5 rounded-full bg-chart-4] | focus | PASS | PASS |
| 25 | fill vs surroundings | `#6a99ff` | `#252c38` | 5.12:1 | -44.6 | a "Start review" []<br>div [bg-chart-1]<br>div [rounded-full bg-chart-1] | today, focus, decks | PASS | PASS |
| 26 | fill vs surroundings | `#6a99ff` | `#181e2a` | 6.05:1 | -47.0 | span [bg-primary size-7]<br>span [size-2.5 rounded-full bg-chart-1]<br>span "8 due" []<br>span [size-7 rounded-full bg-primary] | sidebar, focus, decks, week | PASS | PASS |
| 27 | fill vs surroundings | `#6a99ff` | `#0a111b` | 6.90:1 | -48.3 | a "All languages" [rounded-full border] | studying | PASS | PASS |
| 28 | fill vs surroundings | `#f0f3f7` | `#181e2a` | 14.90:1 | -97.9 | span [bg-foreground] | sidebar | PASS | PASS |
| 29 | ring (1px box-shadow) vs outside | `#212731` | `#0a111b` | 1.27:1 | 0.0 | div "ES Spanish Spanish Cor" [bg-card] raw oklab(0.962 -0.00109504 -0.00691382 / 0.1)<br>ul "JA Japanese Japanese H" [bg-card ring-1 ring-foreground/10] raw oklab(0.962 -0.00109504 -0.00691382 / 0.1)<br>div "24 of 50 Daily goal 26" [bg-card] raw oklab(0.962 -0.00109504 -0.00691382 / 0.1)<br>section "7 words keep slipping " [bg-card ring-1 ring-foreground/10] raw oklab(0.962 -0.00109504 -0.00691382 / 0.1) | focus, decks, week, slipping | below | below |
| 30 | ring (2px box-shadow) vs outside | `#6a99ff` | `#181e2a` | 6.05:1 | -47.0 | span [size-7 rounded-full bg-background ring-2] raw oklch(0.697 0.158 264) | week | PASS | PASS |
| 31 | svg-stroke | `#252c38` | `#181e2a` | 1.18:1 | 0.0 | circle.stroke-muted in svg.-rotate-90 (80.6x80.6, stroke 8px) | week | below | below |
| 32 | svg-stroke | `#9099a8` | `#252c38` | 4.89:1 | -42.7 | path in svg.lucide.lucide-user (9.3x4, stroke 2px)<br>circle in svg.lucide.lucide-user (5.3x5.3, stroke 2px) | sidebar | PASS | PASS |
| 33 | svg-stroke | `#9099a8` | `#181e2a` | 5.78:1 | -45.0 | path in svg.lucide.lucide-layers.size-4 (13.3x6.7, stroke 2px)<br>path in svg.lucide.lucide-layers.size-4 (13.3x3.3, stroke 2px)<br>rect in svg.lucide.lucide-image.size-4 (12x12, stroke 2px)<br>circle in svg.lucide.lucide-image.size-4 (2.7x2.7, stroke 2px) | sidebar | PASS | PASS |
| 34 | svg-stroke | `#6a99ff` | `#181e2a` | 6.05:1 | -47.0 | circle.stroke-primary in svg.-rotate-90 (80.6x80.6, stroke 8px) | week | PASS | PASS |
| 35 | svg-stroke | `#0a111b` | `#6a99ff` | 6.90:1 | 50.3 | path in svg.lucide.lucide-book-open.size-4 (13.3x12, stroke 2px)<br>path in svg.lucide.lucide-check.size-4 (10.7x7.3, stroke 2px) | sidebar, week | PASS | PASS |
| 36 | svg-stroke | `#6a99ff` | `#0a111b` | 6.90:1 | -48.3 | path in svg.lucide.lucide-trending-up.size-5 (5x5, stroke 2px)<br>path in svg.lucide.lucide-trending-up.size-5 (16.7x8.3, stroke 2px) | progress-trends | PASS | PASS |
| 37 | svg-stroke | `#f1c17f` | `#181e2a` | 10.07:1 | -72.1 | path in svg.lucide.lucide-flame.size-4 (9.3x12.7, stroke 2px)<br>path in svg.lucide.lucide-lightbulb.size-5 (10x10, stroke 2px) | week, slipping | PASS | PASS |

### 6.1 Mastery bar and goal ring

Measured in section 7 tables ("Mastery bar segments"). Summary:

- Light: "learning" (`#6a99ff`) is 2.75:1 on the card and 2.48:1 against the "mastered" segment next to it. "Not started" (`#e0e3e9`) is 1.28:1 on the card and 1.15:1 against the track, so the unfilled part of the bar and its legend dot nearly vanish.
- Dark: the two blues swap (`--chart-1` and `--chart-2` trade values, `globals.css:93-94` vs `133-134`). "Mastered" becomes the light blue and "learning" becomes the saturated dark blue at 2.44:1 on the card. The bar now looks like "learning" is the stronger state. "Not started" becomes a mid gray at 4.89:1, brighter than "learning". The visual order of importance flips between themes.
- Goal ring: the filled arc is 6.82:1 (light) and 6.05:1 (dark). The unfilled track is 1.12:1 and 1.18:1, so you cannot see how much of the ring is left.
- Small deck-row bars use the same track: 64x6 px, track 1.12:1.

### 6.2 Weekday circles

- Met: solid primary with a white (light) or dark (dark) check. Passes.
- Today, in progress: 2 px primary ring. Passes (6.82:1 light, 6.05:1 dark).
- Upcoming: 1 px dashed border at 1.83:1 (light) and 2.03:1 (dark). Barely there.
- Day letters are 12 px gray, "S M T W T F S". Two S and two T. Screen readers get full names from hidden text (`ThisWeek.tsx:141`), sighted users do not.

### 6.3 Focus indicator

Keyboard focus draws a 3 px ring in `--ring` at 50% opacity (`focus-visible:ring-3 focus-visible:ring-ring/50`) and turns the 1 px border solid primary (`focus-visible:border-ring`).

| Control | Ring colour after blending | vs. what is outside it | vs. the control | Solid 1 px border visible? |
|---|---|---|---|---|
| Start review, light | `#829ef2` | 2.37:1 | 2.65:1 | no, it is the same blue as the button |
| Start review, dark | `#47639c` | 2.36:1 | 2.17:1 | no |
| Outline button in Today, light | `#829ef2` | 2.37:1 | 2.47:1 | yes, `#1447e6`, 6.3:1 |
| Outline button in Today, dark | `#47639c` | 2.36:1 | 2.06:1 | no, stays `white/15%` |
| Chips, light | `#86a1f1` | 2.40:1 | 2.40:1 (2.72:1 on the selected chip) | yes on unselected chips |
| Chips, dark | `#3a558d` | 2.59:1 | 2.59:1 | yes |
| Deck-row buttons, light / dark | `#89a3f2` / `#415c95` | 2.44:1 / 2.52:1 | similar | light yes, dark no |
| Sidebar links and logo | 1 px `outline: auto` in ring/50 | about 2.35:1 light, 2.52:1 dark | same | no border change |
| Account button | `#829def` / `#415c95` | 2.35:1 / 2.52:1 | same | yes |

So the ring alone never reaches 3:1. Where a solid border also appears it rescues the indicator, but it is 1 px. On the single most important control, "Start review", the border change is invisible, so the only focus cue is a ring under 3:1 in both themes. I read that as a likely SC 1.4.11 failure for that control, and for the sidebar links. Screenshots: `focus-start-review-light.png`, `focus-start-review-dark.png`, `focus-sidebar-decks-light.png`.

### 6.4 Hover and pressed states (forced with CDP)

| Control | Rest | Hover | Change |
|---|---|---|---|
| Start review, light | white on `#1447e6`, 6.82:1 | white on `#406aeb`, 4.69:1 | gets paler, 1.46:1 from rest |
| Start review, dark | `#0a111b` on `#6a99ff`, Lc 50 | on `#5c83d7`, Lc 39 | gets duller |
| Outline button and unselected chip, light | `#f9fafd` | `#f0f3f7` | 1.07:1, almost invisible |
| Unselected chip, dark | `#0a111b` | `#252c38` | 1.35:1 |
| Selected chip | no change on hover | | |
| Sidebar link | gray text | dark text, same background (light) | text only |

No control has a `box-shadow` at rest, on hover or when pressed. The primary button is a flat rectangle in every state. That conflicts with the owner's rule that a screen's main action has depth.

## 7. Contrast between surfaces

This is the heart of "the page lacks contrast". OKLCH L runs 0 (black) to 1 (white).

### Surfaces, light

| Surface | sRGB hex | OKLCH L | C | H | Delta L vs page | WCAG ratio vs page | APCA Lc vs page |
|---|---|---|---|---|---|---|---|
| Page (--background) | `#f9fafd` | 0.985 | 0.004 | 261 | +0.000 | 1.00:1 | 0.0 |
| Sidebar (--sidebar) | `#f0f3f7` | 0.962 | 0.007 | 261 | -0.023 | 1.07:1 | 0.0 |
| Today panel (--accent) | `#f1f6ff` | 0.971 | 0.013 | 264 | -0.014 | 1.04:1 | 0.0 |
| Card: focus deck, deck list, This week, slipping (--card) | `#ffffff` | 1.000 | 0.000 | - | +0.015 | 1.04:1 | 0.0 |
| Deck chips inside Today (--card on --accent) | `#ffffff` | 1.000 | 0.000 | - | +0.015 | 1.04:1 | 0.0 |
| Trend tiles (--secondary) | `#f0f3f7` | 0.962 | 0.007 | 261 | -0.023 | 1.07:1 | 0.0 |
| Muted chips, badges, tracks (--muted) | `#f0f3f7` | 0.962 | 0.007 | 261 | -0.023 | 1.07:1 | 0.0 |
| Outline button fill in Today | `#f9fafd` | 0.985 | 0.004 | 261 | +0.000 | 1.00:1 | 0.0 |
| Primary button / selected chip (--primary) | `#1447e6` | 0.488 | 0.243 | 264 | -0.497 | 6.54:1 | 79.4 |

Adjacent pairs that actually touch:

| Pair | Delta L | WCAG | Edge treatment measured | Edge WCAG vs outside |
|---|---|---|---|---|
| Sidebar | Page | 0.023 | 1.07:1 | 1px border #e0e3e9 | 1.23:1 |
| Today panel | Page | 0.014 | 1.04:1 | none (no border, no shadow) | - |
| Card | Page | 0.015 | 1.04:1 | 1px ring `#e2e4e8` (text colour at 10%), no drop shadow | 1.22:1 |
| Deck chip | Today panel | 0.029 | 1.09:1 | none | - |
| Trend tile | Page | 0.023 | 1.07:1 | none | - |
| Muted chip | Card | 0.038 | 1.12:1 | none | - |
| Primary button | Today panel | 0.483 | 6.27:1 | solid fill | - |


Mastery bar segments:

| Pair | Colours | WCAG | APCA Lc |
|---|---|---|---|
| mastered vs learning (adjacent) | `#1447e6` vs `#6a99ff` | 2.48:1 | 27.3 |
| learning vs not started (adjacent) | `#6a99ff` vs `#e0e3e9` | 2.14:1 | 36.4 |
| mastered vs card | `#1447e6` vs `#ffffff` | 6.82:1 | 82.4 |
| learning vs card | `#6a99ff` vs `#ffffff` | 2.75:1 | 53.0 |
| not started vs card | `#e0e3e9` vs `#ffffff` | 1.28:1 | 14.2 |
| not started vs track (--muted) | `#e0e3e9` vs `#f0f3f7` | 1.15:1 | 0.0 |
| track vs card | `#f0f3f7` vs `#ffffff` | 1.12:1 | 0.0 |

### Surfaces, dark

| Surface | sRGB hex | OKLCH L | C | H | Delta L vs page | WCAG ratio vs page | APCA Lc vs page |
|---|---|---|---|---|---|---|---|
| Page (--background) | `#0a111b` | 0.175 | 0.025 | 261 | +0.000 | 1.00:1 | 0.0 |
| Sidebar (--sidebar) | `#181e2a` | 0.236 | 0.025 | 261 | +0.061 | 1.14:1 | 0.0 |
| Today panel (--accent) | `#252c38` | 0.291 | 0.025 | 261 | +0.116 | 1.35:1 | 0.0 |
| Card: focus deck, deck list, This week, slipping (--card) | `#181e2a` | 0.236 | 0.025 | 261 | +0.061 | 1.14:1 | 0.0 |
| Deck chips inside Today (--card on --accent) | `#181e2a` | 0.236 | 0.025 | 261 | +0.061 | 1.14:1 | 0.0 |
| Trend tiles (--secondary) | `#252c38` | 0.291 | 0.025 | 261 | +0.116 | 1.35:1 | 0.0 |
| Muted chips, badges, tracks (--muted) | `#252c38` | 0.291 | 0.025 | 261 | +0.116 | 1.35:1 | 0.0 |
| Outline button fill in Today | `#2e3541` | 0.329 | 0.023 | 261 | +0.154 | 1.55:1 | 0.0 |
| Primary button / selected chip (--primary) | `#6a99ff` | 0.697 | 0.158 | 264 | +0.522 | 6.90:1 | -48.3 |

Adjacent pairs that actually touch:

| Pair | Delta L | WCAG | Edge treatment measured | Edge WCAG vs outside |
|---|---|---|---|---|
| Sidebar | Page | 0.061 | 1.14:1 | 1px border #232832 | 1.29:1 |
| Today panel | Page | 0.116 | 1.35:1 | none (no border, no shadow) | - |
| Card | Page | 0.061 | 1.14:1 | 1px ring `#212731` (text colour at 10%), no drop shadow | 1.27:1 |
| Deck chip | Today panel | 0.055 | 1.18:1 | none | - |
| Trend tile | Page | 0.116 | 1.35:1 | none | - |
| Muted chip | Card | 0.055 | 1.18:1 | none | - |
| Primary button | Today panel | 0.406 | 5.12:1 | solid fill | - |


Mastery bar segments:

| Pair | Colours | WCAG | APCA Lc |
|---|---|---|---|
| mastered vs learning (adjacent) | `#6a99ff` vs `#1447e6` | 2.48:1 | -28.4 |
| learning vs not started (adjacent) | `#1447e6` vs `#838c9b` | 2.01:1 | 19.0 |
| mastered vs card | `#6a99ff` vs `#181e2a` | 6.05:1 | -47.0 |
| learning vs card | `#1447e6` vs `#181e2a` | 2.44:1 | -17.7 |
| not started vs card | `#838c9b` vs `#181e2a` | 4.89:1 | -38.4 |
| not started vs track (--muted) | `#838c9b` vs `#252c38` | 4.13:1 | -36.1 |
| track vs card | `#252c38` vs `#181e2a` | 1.18:1 | 0.0 |

What this says:

- Light mode uses four surface colours inside a lightness band of 0.038 (L 0.962 to 1.000). The Today panel, the element that should dominate, differs from the page by L 0.014 and 1.04:1, with no border and no shadow. It is the least separated surface on the page. The sidebar (L 0.023) and the trend tiles (L 0.023) are both more distinct from the page than the hero panel is.
- White cards on an off-white page are 1.04:1. Their only edge is a 1 px ring of the text colour at 10% opacity, which lands at `#e2e4e8`, 1.22:1. The card shadow string resolves to that ring only. There is no drop shadow.
- The Today panel's blue tint is chroma 0.013. For comparison the page is 0.004. That is too little colour to read as "blue panel" next to it.
- Dark mode steps are larger (L 0.061 and 0.116) and go the right way: higher surfaces are lighter. But card against page is still only 1.14:1, and the card edge ring is 1.27:1.
- In dark mode the sidebar and the cards are the same colour (`#181e2a`), so the sidebar reads as one more card.
- Every dark surface has chroma 0.025. The dark design people preferred (example-02) samples at roughly L 0.20 to 0.26 and C 0.043 to 0.050 for its backgrounds, up to C 0.077 for its hero panel, hue 261 to 270 (median-cut sample of `docs/designs/dashboards/example-02.png`, so approximate). The current dark page is darker (L 0.175) and has about half the colour. That is the measured difference between "near-black slate" and "rich navy".

### 7.1 Token comments do not match token values

`globals.css` labels its OKLCH values with hex comments. Converted properly, they are different colours:

| Token | Value in `globals.css` | Comment says | Actually renders as |
|---|---|---|---|
| `--primary` (line 78) | `oklch(0.488 0.243 264.376)` | `#2563EB` | `#1447e6` |
| `--foreground` (73) | `oklch(0.236 0.025 261)` | `#1E293B` | `#181e2a` |
| `--muted-foreground` (83) | `oklch(0.491 0.032 261)` | `#64748B` | `#576173` |
| `--background` (72) | `oklch(0.985 0.004 261)` | `#F8FAFC` | `#f9fafd` |
| `--border` (90) | `oklch(0.916 0.009 261)` | `#E2E8F0` | `#e0e3e9` |
| `--accent` (84) | `oklch(0.971 0.013 264)` | `#EFF6FF` | `#f1f6ff` |
| dark `--primary` (117) | `oklch(0.697 0.158 264)` | `#60A5FA` | `#6a99ff` |
| dark `--card` (113) | `oklch(0.236 0.025 261)` | `#1E293B` | `#181e2a` |

The grays carry much less chroma than the slate colours the comments name, which is part of why both themes look neutral rather than blue. The redesign should treat the OKLCH numbers as the truth and fix or drop the comments.

## 8. Keyboard and focus order

Tab order at 1280 (13 stops, light and dark identical):

1. Memli logo (link to /dashboard)
2. Decks
3. Community Gallery
4. Account menu button
5. All languages
6. French
7. Japanese
8. Portuguese
9. Spanish
10. **Start review**
11. Learn 10 new words
12. Review 8 cards in Japanese Hiragana & Katakana
13. Learn 10 new words in French Travel Phrases

Tab order at 375 (12 stops): Memli, Account menu, Navigation menu, the 5 chips, **Start review** (stop 9), Learn 10 new words, the two deck-row buttons.

Findings:

- Order follows the visual order. Nothing is skipped or trapped. Every stop reported `:focus-visible` and was scrolled into view.
- There is no skip link. A keyboard user presses Tab 10 times on desktop (9 on a phone) to reach the main action. With 12 languages that becomes 18 on desktop. Landmarks and headings exist, so SC 2.4.1 Bypass Blocks is met in the usual reading, but a skip link or moving the filter after the action would cut the count.
- The four study buttons are `<a role="button" tabindex="0" href="/study/...">` (Base UI `Button` with `render={<Link/>}` and `nativeButton={false}`, `TodayPanel.tsx:135-147`, `FocusDeckCard.tsx:122`, `DeckList.tsx:86`). A screen reader announces "button", but they navigate to a new page like links. Not an axe violation. It is a naming mismatch worth a decision.
- The desktop nav item for this page is labelled "Decks" and points to `/dashboard`. It is marked `aria-current="page"` on `/dashboard` (it is not on `?preview=` URLs, which is a DEV-only artifact). The page's own heading is a greeting, and the browser tab title is just "Memli". So three names exist for this screen and none of them is "Home" or "Dashboard". This ties to the Course Director's doubt about the word "Deck".

## 9. axe-core 4.14.0

Rules run: tags `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa`, `best-practice`.

| Capture | Violations | Incomplete (needs a human) | Passes |
|---|---|---|---|
| default, 1280, light | 0 | 1 | 39 |
| default, 1280, dark | 0 | 1 | 39 |
| default, 375, light | 0 | 1 | 39 |
| default, 375, dark | 0 | 1 | 39 |
| no-decks, 1280, light | 0 | 0 | 33 |
| caught-up, 1280, light | 0 | 1 | 38 |
| many-decks, 1280, light | 0 | 1 | 39 |
| long-titles, 1280, light | 0 | 1 | 39 |
| one-deck, 1280, light | 0 | 1 | 38 |
| learn, 1280, light | 0 | 1 | 39 |
| goal-met, 1280, light | 0 | 1 | 39 |
| finished, 1280, light | 0 | 1 | 34 |
| same-language, 1280, light | 0 | 1 | 39 |
| large-numbers, 1280, light | 0 | 1 | 39 |

The one "incomplete" item is always the same: axe cannot work out the background behind the "24" and "of 50" inside the goal ring because they overlap an SVG. I measured those by hand: `#181e2a` on `#ffffff` 16.63:1 and `#576173` on `#ffffff` 6.24:1 in light, 14.90:1 and 5.78:1 in dark. Both pass WCAG.

axe does not test focus-ring contrast, graphic contrast, target comfort, hierarchy or density. Zero violations here does not mean zero problems.

## 10. Other WCAG and robustness checks

| Check | Result |
|---|---|
| SC 1.4.10 Reflow (320 px wide) | Pass. No horizontal scroll in default or long-titles. Page is 2,929 px tall, 5.2 screens of 568 px. |
| SC 1.4.4 Resize text (200% zoom, 1280x800 becomes 640x400) | Pass. No overflow. 5.1 screens. Start review at y 479, below the 400 px fold. |
| SC 1.4.12 Text Spacing (line-height 1.5, letter 0.12em, word 0.16em, paragraph 2em) | No horizontal overflow at 375 or 1280. Page grows from 2,658 to 3,248 px at 375. Three badges ("8 due", "10 new", "Caught up") have a fixed 20 px height with `overflow:hidden` and their content becomes 2 px taller than the box. The sidebar username truncates with an ellipsis (164 px of text in 139 px). Minor. |
| SC 3.1.1 Language of Page | `<html lang="en">`. No `dir` attribute. |
| SC 3.1.2 Language of Parts | The tricky-word chips carry `lang="es"` and `lang="ja"`. Good. Deck titles have no `lang`, which is correct while they are English. |
| SC 2.4.2 Page Titled | `document.title` is "Memli" on the dashboard. It does not name the page. |
| SC 1.3.1 headings | One H1, then H2 and H3 in order, no skipped levels. 12 headings. |
| Landmarks | `aside` "Application sidebar", `nav` "Primary", `main`, `header`, group "Studying", 6 labelled `section`s, `aside` "Your progress". All labelled. |
| Reduced motion | The ring animation is behind `motion-safe:` (`ThisWeek.tsx:84`). Not exercised live. |
| `color-scheme` | Computed value is `normal` in both themes. Nothing tells the browser the page is dark, so native scrollbars and form controls stay light in dark mode. No `<meta name="color-scheme">` or `theme-color` either. |
| Theme control | None visible. No button, link, switch or menu item mentions theme, dark, light or appearance. The Account menu holds View Profile, Learning Settings, Subscription / Plan, Sign Out. Pressing `d` flips `<html>` from `light` to `dark` and stores `theme=dark` (confirmed live). |

## 11. Dark mode: what the live render shows

Screenshots: `default-1280x800-dark-full.png`, `default-375x812-dark-full.png`.

1. It is a straight token swap of the light layout. Same density, same 28 boxes, same word count.
2. Background `#0a111b`, cards and sidebar `#181e2a`, Today panel and trend tiles `#252c38`. All three have chroma 0.025.
3. The Today panel is now the lightest large surface (L 0.291 against 0.175), so it stands out more than it does in light mode (1.35:1 against 1.04:1). Dark mode has better hero separation than light mode by accident. The trend tiles use the same colour, so the bottom strip stands out exactly as much as the hero.
4. The primary button flips from saturated blue with white text to pale blue with near-black text. It reads lighter and less solid than in light mode, and scores Lc 50.
5. Secondary text is the weakest part (Lc 43 to 46).
6. Borders are white at 10% (`#232832` on the page, 1.29:1). Chip outlines nearly disappear.
7. The mastery bar's blues trade places (section 6.1).
8. The streak flame and lightbulb switch from orange `#f16a00` (3.08:1 on white, the lowest-contrast icon in light) to pale amber `#f1c17f` (10.07:1). The one warm accent on the page is stronger in dark than in light.

## 12. What I could not verify

- No real device was used. Phone "visible area" sizes in 3.2 are estimates of browser chrome, and touch behaviour is emulated.
- No screen reader was run. Announcements are inferred from the DOM and ARIA attributes.
- Only the English UI was available. I could not switch UI locale, so text expansion (German, Portuguese), right-to-left layout and non-Latin UI strings were not rendered. The long-titles and large-numbers previews are the nearest stand-ins and both hold up.
- The page uses seeded prototype data. Real data could produce states not covered by the eleven previews.
- Windows High Contrast / forced-colors mode and print were not tested.
- The mastery-bar detail crops (`detail-mastery-bar-*.png`) missed their target and show the wrong area. Use the full-page captures for that component.
- APCA numbers use the public `apca-w3` 0.1.9 algorithm. APCA is not part of WCAG 2.2. The thresholds are the simplified ones from the brief, not the full font-size lookup table.
- Colour sampling of `example-02.png` is a 12-colour median-cut of an AI-generated image. Treat those OKLCH values as a direction, not a spec.
- Standards and vendor pages in Sources were cited from memory of their content. I did not re-open them in this session.

## 13. What this means for the redesign (evidence-led pointers)

1. Make the Today panel the only strong surface. Today it is the faintest (1.04:1). It needs a real fill or elevation step, and the trend tiles must stop sharing its colour in dark mode.
2. Make "Start review" physically bigger on desktop and give it depth. 126x44 px with no shadow is 0.54% of the screen. On phones it is already full width (279x44).
3. Take solid blue away from things that are not the main action. The selected filter chip and the five weekday checks currently use the same fill as the button.
4. Move or collapse the language filter. It costs 36 to 212 px above the main action (one row on desktop, two to five rows on a phone) and 5 to 13 tab stops before it.
5. Cut first-screen copy. 124 words on desktop. Candidates measured here: the status sentence repeats "About 4 minutes" (it appears twice in the first screen), the deck chips repeat counts shown again in the deck cards, "Starts in Spanish Core 1000." explains a button, and the trends strip adds 3 more big numbers.
6. Reduce the type scale. 15 size/weight pairs and seven large bold numbers. Decide which one number is the hero.
7. Give cards a real edge: a border around 3:1 for controls, and either a visible shadow (light) or a clear lightness step (dark). 1.22:1 rings do not read for someone with weaker eyesight.
8. Rebuild the dark palette rather than tune it: raise background lightness toward L 0.20 to 0.24, roughly double the chroma, lift secondary text to about L 0.85, and re-pick the primary button colour for dark mode. Today's pale blue with dark text scores Lc 50. A blue with a white label only works near L 0.53 to 0.56 on the darkest surface (section 5.2), so also test a warm light accent for the one main action.
9. Ship a visible theme control in the Account menu and the mobile menu, set `color-scheme`, and keep the `d` shortcut as an extra.
10. Fix the focus ring: a solid 2 px ring of at least 3:1 with an offset, so it shows on the primary button too.
11. Fix chart colours as roles, not swaps: "mastered" strongest, "learning" middle, "not started" a visible track, in both themes, each at 3:1 against the card.
12. Raise touch targets to 44 px on phones: chips (36), hamburger (32x32), deck-row buttons (36 tall, 64 to 74 wide), menu rows (32).
13. Make whole deck rows and the focus deck card tappable, and give the "words keep slipping" callout an action or remove it.
14. Settle the name of this screen ("Decks" in the nav, a greeting as the H1, "Memli" as the tab title).

## Sources

Project files (read, not edited):

- `dev/memli/packages/ui/src/styles/globals.css` lines 68-147 (tokens), 149-186 (base layer, `touch-target` utility)
- `dev/memli/apps/web/src/routes/_app/dashboard.tsx` lines 113-169 (layout and region order)
- `dev/memli/apps/web/src/routes/_app.tsx` lines 9-17 (shell)
- `.../routes/_app/-components/TodayPanel.tsx` lines 52, 98-158, 283-300
- `.../routes/_app/-components/LanguageFilter.tsx` lines 11-12, 30-63
- `.../routes/_app/-components/FocusDeckCard.tsx` lines 52-54, 66-94, 122, 152-177
- `.../routes/_app/-components/DeckList.tsx` lines 42-65, 86, 112-156
- `.../routes/_app/-components/ThisWeek.tsx` lines 65-91, 110-141, 172-219
- `.../routes/_app/-components/MemoryCallout.tsx` lines 36-66
- `.../routes/_app/-components/ProgressTrends.tsx` lines 30-37, 55-67, 88
- `.../routes/_app/-components/AppSidebar.tsx` lines 78-84, 138-155, 210-238
- `.../routes/_app/-components/DashboardGreeting.tsx` lines 9-22, 69-75
- `dev/memli/apps/web/src/components/theme-provider.tsx` lines 7, 86-112 (storage key, provider, `applyTheme`)
- `dev/memli/.cursor/rules/browser-verification.mdc`
- `docs/designs/dashboards/example-02.png` (colour sample only)

Standards and tools:

- WCAG 2.2, W3C Recommendation: https://www.w3.org/TR/WCAG22/
- SC 1.4.3 Contrast (Minimum): https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html
- SC 1.4.11 Non-text Contrast: https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html
- SC 1.4.10 Reflow: https://www.w3.org/WAI/WCAG22/Understanding/reflow.html
- SC 1.4.12 Text Spacing: https://www.w3.org/WAI/WCAG22/Understanding/text-spacing.html
- SC 2.4.7 Focus Visible: https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html
- SC 2.5.8 Target Size (Minimum): https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html
- SC 2.5.5 Target Size (Enhanced): https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced.html
- SC 2.4.1 Bypass Blocks: https://www.w3.org/WAI/WCAG22/Understanding/bypass-blocks.html
- SC 2.4.2 Page Titled: https://www.w3.org/WAI/WCAG22/Understanding/page-titled.html
- SC 3.1.2 Language of Parts: https://www.w3.org/WAI/WCAG22/Understanding/language-of-parts.html
- APCA readability criterion and "APCA in a Nutshell": https://git.apcacontrast.com/documentation/APCA_in_a_Nutshell
- `apca-w3` 0.1.9: https://www.npmjs.com/package/apca-w3
- culori 4: https://culorijs.org/
- axe-core 4.14.0: https://github.com/dequelabs/axe-core
- Chrome DevTools Protocol: https://chromedevtools.github.io/devtools-protocol/
- Apple Human Interface Guidelines, Accessibility (44x44 pt controls): https://developer.apple.com/design/human-interface-guidelines/accessibility

Audit scripts and raw data (all under `scratch/live/`):

- `cdp.mjs` (CDP client), `inpage.js` (in-page measurements), `capture.mjs` (screenshots and data), `audit2.mjs` (tab order, axe, hover, menus, text spacing), `audit3.mjs` (focus crops, phone folds)
- `color.mjs` (culori and APCA helpers), `analyze-contrast.mjs`, `analyze-layout.mjs`, `analyze-surfaces.mjs`, `tokens.mjs`, `extra.mjs`, `solve-primary.mjs`, `sample.py`
- `data/*.json` (one file per capture, plus `_audit2.json`), `out-contrast.md`, `out-layout.md`, `out-surfaces.md`, `out-audit2.txt`

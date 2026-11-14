# Definition of done: results

The checklist in [REDESIGN.md section 11.3](../../REDESIGN.md), run on 14 November 2026 against branch `151-web-dashboard_redesign`. Measurements come from a Playwright script over all 11 `?preview=` states at 1280 x 720 and 375 x 667, the axe and pseudo-localization specs, and the color test.

Status: **pass**, **noted** (meets the intent with a known exception), or **open** (needs people).

`final-dashboard.png` shows the finished dashboard at 1280 px and 375 px in both themes.

## Focus

| Check | Status | Evidence |
| --- | --- | --- |
| One amber shape on the first screen (none in the all-done states) | pass | 1 in every state with work to do; 0 in `caught-up` and `finished`. The sidebar's Pro badge was a second amber shape; it is neutral now. |
| Both hero buttons fully visible at 375 x 550 (default, long titles, pseudo-long) | pass | Second button ends at y 438 (default) and y 518 (long titles). Pseudo-long passes the fold check at every portrait size in `e2e/pseudo.spec.ts`. |
| The hero's count equals what its button opens | pass | Both read the focus course's `dueCount`. The prototype course has 5 sample cards, so the session shows 5 until #112 serves real cards. |
| Grayscale: the hero is still seen first | pass | `grayscale-and-blur.png`, left column. |
| 8 px blur: the main button is the most saturated shape | pass | `grayscale-and-blur.png`, right column. The blue week marks come second in light mode. |

## Copy

| Check | Status | Evidence |
| --- | --- | --- |
| 90 visible words or fewer in `main` | pass | 84 in `default` (217 before). States with more courses run longer: `many-decks` 117, `same-language` 110, `long-titles` 92. |
| 6 headings or fewer | pass | 5 visible plus the visually hidden "Your progress" `h2`. |
| 14 numbers or fewer | pass | 13 in `default`. `many-decks` shows 18, one per extra course row. |
| No fact twice | noted | The tip card names its course ("4 tricky words in Spanish Core 1000"), so the hero's course name appears twice when the tip is about it. That follows the copy deck. |
| No "deck", "due", "mastered", "retention" or "streak" | pass | None in visible text in any state. |
| 3 boxes or fewer and 4 actions or fewer above the fold at 1280 x 720 | noted | Actions: 3. Boxes: 4, because the top edge of the tip card (beside the course list, as section 5.3 places it) starts at y 620. |
| No em dashes, no sentence over 12 words | pass | Longest sentence: "Courses are word lists with memory tricks from other learners." (10). |

## Type and targets

| Check | Status | Evidence |
| --- | --- | --- |
| No text under 14 px; sentences 16 px or larger | pass | Language codes were 12 px; now 14 px. |
| Every control 44 px tall | pass | Sidebar links were 36 px; now 44 px. Top bar, rows, menus, the disclosure and all buttons are 44 px or taller. |

## Color (each theme)

| Check | Status | Evidence |
| --- | --- | --- |
| Text pairs meet 4.5:1 and the APCA target | pass | `packages/ui/src/styles/tokens.test.ts`, 216 checks. |
| Control borders and the focus ring meet 3:1 | pass | Same test. |
| The color test passes, including this design's pairs | pass | Same test. |
| Status never by color alone | pass | Day marks differ by shape (check, ring, solid or dashed circle) and have text alternatives; "All done" has a check and a word. |

## Theme

| Check | Status | Evidence |
| --- | --- | --- |
| Three labeled choices: one click on desktop, two taps on phones | noted | Desktop is now two clicks: the always-visible radio card was replaced by a compact menu row, at your request, for looks. The choice still shows on the row without opening it. |
| First visit follows the device; the choice persists | pass | Theme plumbing commit. |
| No flash of the wrong theme | pass | Pre-paint script in `index.html`. |
| The `d` shortcut is gone | pass | Removed. |

## Keyboard and screen reader

| Check | Status | Evidence |
| --- | --- | --- |
| Skip link first; the main action is the first Tab stop in `main` | pass | Every state; in `?preview=` pages it follows the preview switcher. |
| Tab order follows the picture, row by row | pass | DOM order is greeting, hero, This week, courses, tip, progress; the grid places them without CSS `order`. |
| Links announced as links | pass | No `<a role="button">`; the `memli/button-link` lint rule blocks the old pattern. |
| axe: 0 violations everywhere, both themes, desktop and 375 px, and with "Your progress" open | pass | 124 axe checks. |

## Layout

| Check | Status | Evidence |
| --- | --- | --- |
| No sideways scrolling at 320 px or 200% zoom | pass | Page width 320 at 320; 640 at 1280 x 200%. |
| Pseudo-long text breaks nothing | pass | 42 checks in `e2e/pseudo.spec.ts` (long, CJK and RTL at 320 to 1440 px, both themes). Exception: a 375 px tall landscape phone cannot fit the hero's button on its first screen in any language, so that size checks overflow only. |

## People

| Check | Status | Evidence |
| --- | --- | --- |
| Five-second and first-click tests pass | open | Needs the respondents (section 14.2). The baseline round on the old dashboard is also still to do. |
| Each respondent can read everything on their own device and theme | open | Same. |

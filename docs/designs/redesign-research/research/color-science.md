# Color science for the dashboard redesign

> **Correction.** The brief given to the researchers wrongly described one respondent as older and as having weak eyesight. That remark in the chat was the owner's, about himself. Statements in this file that relied on it have been corrected. See `feedback-examples.md`, section 2.

Research track: color-science. Scope: the color SYSTEM for `/dashboard` (tokens, contrast, dark mode). Layout and copy belong to other tracks.

Everything numeric in this file was computed by the scripts in
`scratch/color`
(culori 4.0.2 and apca-w3 0.1.9, Node 26). Tables marked "generated" are pasted from script output by a build step, not typed by hand. No file inside the repository was changed.

## 0. The short version

1. **The light theme does not fail on text contrast. It fails on structure.** Body text is 16:1. The problem is that every surface is the same lightness. Page, card and the Today panel differ by 1.04:1 (OKLCH lightness 0.985, 1.0, 0.971). Borders are 1.2 to 1.3:1. Nothing is darker than a hairline except text and one blue. So nothing leads the eye. (Section 2.)
2. **The dark theme does fail on text.** Muted text measures APCA Lc -43 to -46. WCAG 2 calls that a pass (4.9 to 6.6:1). APCA's own lookup says that contrast needs 42px text at regular weight. The dark "Start review" label is Lc 50. (Section 2.)
3. **The dark theme reads black because its chroma is half of what people liked.** Current page: `oklch(0.175 0.025 261)`. Measured from example-02: lightness 0.20 to 0.26, chroma 0.043 to 0.053, hue 266 to 269. (Section 2.4.)
4. **Proposal: three tiers.** 73 primitives in seven OKLCH ramps, 49 semantic roles plus aliases for the existing names, then the Tailwind `@theme inline` layer. All existing shadcn variable names keep working. (Section 4.)
5. **Verified.** 81 pairings per theme, 162 in total. 134 are gated and all 134 pass WCAG 2.2 AA and the APCA targets. 28 are report-only (decorative). All 73 primitives are inside sRGB. (Section 5.)
6. **One decision for the owner:** blue or warm call to action. The numbers favor warm amber on a navy hero panel, in both themes. A new `--cta` role makes the choice a five-line swap that can be reversed. (Section 8.)

## 1. How to read the numbers

**OKLCH.** `oklch(L C H)`. L is perceived lightness from 0 (black) to 1 (white). C is chroma, how colorful, from 0 (gray) up to about 0.37 at most on real screens. H is the hue angle. The useful property: equal L means equal perceived lightness across hues, which HSL does not give you. That is why you can swap a hue and keep contrast predictable [S1]. OKLCH is the polar form of Oklab, which was designed so that lightness, chroma and hue can be changed independently, and so that blue does not drift toward purple when you lighten it, a known flaw of CIELAB and LCH [S1][S2].

**WCAG 2.x contrast ratio.** A ratio from 1:1 to 21:1 computed from relative luminance. WCAG 2.2 AA needs 4.5:1 for normal text and 3:1 for large text (18pt, or 14pt bold) [S8, SC 1.4.3]. UI component boundaries, states and meaningful graphics need 3:1 against adjacent colors [S8, SC 1.4.11]. This is the legal baseline.

**APCA Lc.** A newer perceptual contrast measure, roughly 0 to 106. It is signed in the apca-w3 library: positive for dark text on a light background, negative for light text on dark. It is the candidate method for WCAG 3 and is not part of WCAG 2 conformance [S11][S12]. It matters here because WCAG 2 overstates contrast for dark color pairs [S11], which is exactly where the current dark theme is weak.

**Dual model.** Every pairing below must pass both. WCAG 2.2 keeps the project conformant. APCA catches the dark-mode cases WCAG 2 lets through.

### Thresholds used in this file

| Kind | Used for | WCAG 2.2 minimum | APCA minimum | Source |
|---|---|---|---|---|
| body | Headings, numerals, reading text on page and card | 7:1 (AAA, SC 1.4.6) | Lc 90 | APCA "preferred level for fluent text" is Lc 90 [S11] |
| bodyTint | Short reading text on chips, popovers, tinted panels | 7:1 | Lc 75 | Lc 75 is APCA's minimum for body-size text [S11] |
| muted | Secondary text on page, card, sidebar, hero | 4.5:1 (AA, SC 1.4.3) | Lc 75 | same |
| muted2 | Secondary text on chips and tinted panels | 4.5:1 | Lc 60 | Lc 60 is APCA's minimum for content text that is not body text [S11]. This is the floor named in the brief. |
| label | Button labels in rest and hover states | 4.5:1 | Lc 75 | Lc 75 covers 16px at weight 500 [S11] |
| label2 | Pressed state, destructive fill | 4.5:1 | Lc 60 | Lc 60 covers 16px at weight 700 [S11] |
| colored | Links, status words | 4.5:1 | Lc 60 | same |
| nontext | Control borders, focus rings, icons, chart marks | 3:1 (SC 1.4.11) | Lc 30 | Lc 30 is APCA's floor for solid icons and pictograms [S11] |
| report only | Hairlines, surface steps, button fill against its surround | none | none | Decorative. WCAG does not require a text button to have a visible boundary [S9] |

Two notes on honesty. First, the brief suggested Lc 60 for secondary text at 14 to 16px. APCA's own table is stricter than that: Lc 60 is meant for 16px bold or 24px regular [S11]. So I gated muted text at Lc 75 on the main surfaces and kept Lc 60 only as the floor on tinted ones. Second, WCAG 2.2 large text is 18pt (24px) regular or 14pt (18.66px) bold [S8]. Nothing in this palette relies on the large-text exemption.

## 2. Diagnosis of the current palette

Source file: `dev/memli/packages/ui/src/styles/globals.css`, light tokens at lines 68 to 108, dark at 110 to 147.

### 2.1 Light theme, measured (generated by `current.mjs`)

| Pairing | Foreground | Background | WCAG | APCA Lc |
|---|---|---|---:|---:|
| Body text on page | #181e2a | #f9fafd | 15.99 | 100.6 |
| Body text on card | #181e2a | #ffffff | 16.69 | 103.6 |
| Body text on Today panel (bg-accent) | #181e2a | #f1f6ff | 15.39 | 98.0 |
| Muted text on page | #576173 | #f9fafd | 5.98 | 78.1 |
| Muted text on card | #576173 | #ffffff | 6.25 | 81.1 |
| Muted text on Today panel (bg-accent) | #576173 | #f1f6ff | 5.76 | 75.5 |
| Muted text on trend tile / chip (bg-secondary, bg-muted) | #576173 | #f0f3f7 | 5.61 | 73.8 |
| Muted text on sidebar | #576173 | #f0f3f7 | 5.61 | 73.8 |
| TODAY eyebrow (text-accent-foreground on bg-accent) | #1447e6 | #f1f6ff | 6.30 | 76.8 |
| Trend detail (text-primary on bg-secondary) | #1447e6 | #f0f3f7 | 6.14 | 75.0 |
| CTA label on primary | #ffffff | #1447e6 | 6.83 | -87.5 |
| CTA label on hover (primary/80 over Today panel) | #ffffff | #406aeb | 4.69 | -77.5 |
| CTA fill vs Today panel | #1447e6 | #f1f6ff | 6.30 | 76.8 |
| Today panel vs page | #f1f6ff | #f9fafd | 1.04 | 0.0 |
| Card vs page | #ffffff | #f9fafd | 1.04 | 0.0 |
| Sidebar vs page | #f0f3f7 | #f9fafd | 1.07 | 0.0 |
| Chip (bg-muted) vs card | #f0f3f7 | #ffffff | 1.11 | 0.0 |
| Border vs card (outline button, filter chip edge) | #e0e3e9 | #ffffff | 1.29 | 14.2 |
| Border vs page | #e0e3e9 | #f9fafd | 1.23 | 11.2 |
| Card ring (foreground/10) vs page | #e8e9ea | #f9fafd | 1.16 | 7.6 |
| Focus ring (ring/50 over page) vs page | #86a1f1 | #f9fafd | 2.40 | 46.1 |
| Focus ring (ring/50 over card) vs card | #89a3f2 | #ffffff | 2.45 | 48.0 |
| Goal ring stroke-primary vs track stroke-muted | #1447e6 | #f0f3f7 | 6.14 | 75.0 |
| Goal ring track (stroke-muted) vs card | #f0f3f7 | #ffffff | 1.11 | 0.0 |
| Bar: mastered (chart-1) vs learning (chart-2) | #1447e6 | #6a99ff | 2.48 | 27.3 |
| Bar: learning (chart-2) vs not started (chart-4) | #6a99ff | #e0e3e9 | 2.15 | 36.4 |
| Bar: not started (chart-4) vs card | #e0e3e9 | #ffffff | 1.29 | 14.2 |
| Bar: mastered (chart-1) vs card | #1447e6 | #ffffff | 6.83 | 82.4 |
| Bar: learning (chart-2) vs card | #6a99ff | #ffffff | 2.76 | 53.0 |
| Streak flame icon vs card | #f16a00 | #ffffff | 3.09 | 56.9 |
| Success text on card | #007a55 | #ffffff | 5.36 | 76.1 |
| Warning text on card | #bb4d00 | #ffffff | 5.03 | 73.9 |
| Destructive text on card | #e7000b | #ffffff | 4.77 | 70.1 |

What this says:

- **Text is fine.** Body 15.4 to 16.7:1. Muted text 5.6 to 6.3:1, Lc 74 to 81. No WCAG failure.
- **Surfaces are invisible.** Card vs page 1.04:1. Today panel vs page 1.04:1. Chip vs card 1.11:1. APCA rounds all three to Lc 0. In OKLCH the three main surfaces sit at L 0.985, 1.0 and 0.971, a spread of 0.029. The eye cannot use them to find structure.
- **Borders are hairlines of fog.** `--border` on a card is 1.29:1. The card ring (`ring-foreground/10`, DeckList.tsx:156, MemoryCallout.tsx:37) is 1.16:1 against the page.
- **Only two text tones exist.** `--foreground` and `--muted-foreground`. Hierarchy has to come from 15 font size and weight pairs instead, which is part of why the page feels busy.
- **Blue does four jobs.** The same `oklch(0.488 0.243 264.376)` is the "Start review" fill (button.tsx:12), the selected language chip (LanguageFilter.tsx:12), the goal ring (ThisWeek.tsx:84), the five week checkmarks (ThisWeek.tsx:100), the mastered bar (FocusDeckCard.tsx:52, DeckList.tsx:61), the TODAY eyebrow (TodayPanel.tsx:294) and the trend icon and text (ProgressTrends.tsx:64, :88). When one color means "press me", "you are here", "done" and "data", it stops meaning "press me".
- **No warm color.** The only non-blue hue on the page is the small flame and lightbulb icons at 3.09:1 (ThisWeek.tsx:210, MemoryCallout.tsx:42). A page with one hue has no accent.
- **The focus ring fails 3:1.** Buttons and chips use `focus-visible:ring-3 focus-visible:ring-ring/50` (button.tsx:8, LanguageFilter.tsx:12). Fifty percent blue over the page is 2.40:1, over a card 2.45:1. SC 1.4.11 needs 3:1 for focus indicators [S9]. The 1px `border-ring` that comes with it does pass, so this is a weak indicator, not a total failure.
- **Progress bar segments blur.** Mastered vs learning 2.48:1, learning vs not started 2.15:1, learning vs card 2.76:1. The legend text rescues conformance [S9], but the bar itself is hard to read.
- **Small gray text is under APCA's size table.** Muted text is Lc 74 to 81. APCA's lookup puts the minimum for that contrast at about 17 to 18.5px at weight 400 (Section 5.3). The dashboard sets it at 12px and 14px (ThisWeek.tsx:91, :206, :216, DeckList.tsx:65, ProgressTrends.tsx:31). This matches the respondent who said light backgrounds make the words disappear.

### 2.2 Dark theme, measured (generated by `current.mjs`)

| Pairing | Foreground | Background | WCAG | APCA Lc |
|---|---|---|---:|---:|
| Body text on page | #f0f3f7 | #0a111b | 17.02 | -99.3 |
| Body text on card | #f0f3f7 | #181e2a | 15.00 | -97.9 |
| Body text on Today panel (bg-accent) | #f0f3f7 | #252c38 | 12.61 | -95.6 |
| Muted text on page | #9099a8 | #0a111b | 6.59 | -46.3 |
| Muted text on card | #9099a8 | #181e2a | 5.81 | -45.0 |
| Muted text on Today panel (bg-accent) | #9099a8 | #252c38 | 4.88 | -42.7 |
| Muted text on trend tile / chip (bg-secondary, bg-muted) | #9099a8 | #252c38 | 4.88 | -42.7 |
| Muted text on sidebar | #9099a8 | #181e2a | 5.81 | -45.0 |
| TODAY eyebrow (text-accent-foreground on bg-accent) | #6a99ff | #252c38 | 5.09 | -44.6 |
| Trend detail (text-primary on bg-secondary) | #6a99ff | #252c38 | 5.09 | -44.6 |
| CTA label on primary | #0a111b | #6a99ff | 6.87 | 50.3 |
| CTA label on hover (primary/80 over Today panel) | #0a111b | #5c83d7 | 5.12 | 39.1 |
| CTA fill vs Today panel | #6a99ff | #252c38 | 5.09 | -44.6 |
| Today panel vs page | #252c38 | #0a111b | 1.35 | 0.0 |
| Card vs page | #181e2a | #0a111b | 1.13 | 0.0 |
| Sidebar vs page | #181e2a | #0a111b | 1.13 | 0.0 |
| Chip (bg-muted) vs card | #252c38 | #181e2a | 1.19 | 0.0 |
| Border vs card (outline button, filter chip edge) | #2f3540 | #181e2a | 1.35 | 0.0 |
| Border vs page | #232832 | #0a111b | 1.28 | 0.0 |
| Card ring (foreground/10) vs page | #2d343f | #0a111b | 1.51 | 0.0 |
| Focus ring (ring/50 over page) vs page | #3a558d | #0a111b | 2.58 | -16.2 |
| Focus ring (ring/50 over card) vs card | #415c95 | #181e2a | 2.54 | -17.6 |
| Goal ring stroke-primary vs track stroke-muted | #6a99ff | #252c38 | 5.09 | -44.6 |
| Goal ring track (stroke-muted) vs card | #252c38 | #181e2a | 1.19 | 0.0 |
| Bar: mastered (chart-1) vs learning (chart-2) | #6a99ff | #1447e6 | 2.48 | -28.4 |
| Bar: learning (chart-2) vs not started (chart-4) | #1447e6 | #838c9b | 2.01 | 19.0 |
| Bar: not started (chart-4) vs card | #838c9b | #181e2a | 4.92 | -38.4 |
| Bar: mastered (chart-1) vs card | #6a99ff | #181e2a | 6.05 | -47.0 |
| Bar: learning (chart-2) vs card | #1447e6 | #181e2a | 2.44 | -17.7 |
| Streak flame icon vs card | #f1c17f | #181e2a | 10.08 | -72.1 |
| Success text on card | #00d492 | #181e2a | 8.61 | -64.2 |
| Warning text on card | #ffba00 | #181e2a | 9.76 | -70.6 |
| Destructive text on card | #ff6467 | #181e2a | 5.78 | -45.7 |

What this says:

- **Muted text is the real failure.** Lc -42.7 to -46.3. WCAG 2 passes it at 4.88 to 6.59:1. This is the textbook case of WCAG 2 overstating dark contrast [S11]. APCA's lookup asks for 42px at weight 400, or 24px bold, at that contrast (Section 5.3).
- **The call to action label is weak.** Near-black on sky blue is 6.87:1 by WCAG but Lc 50.3. The label is 14px medium. APCA's lookup asks for 21px bold at Lc 50.
- **The bar is inverted in meaning.** In dark mode `--chart-1` (mastered) is L 0.697, `--chart-2` (learning) is L 0.488, and `--chart-4` (not started) is L 0.637. The empty part of the bar is brighter than the learning part (4.92:1 vs 2.44:1 against the card). Lightness should rise or fall in one direction with progress. It does not.
- **Card ring and border are near zero.** `oklch(1 0 0 / 10%)` on the card is 1.35:1.
- **Destructive text is Lc -45.7.**

### 2.3 The comments in globals.css do not match the values

| Token | Hex in comment | That hex in OKLCH | Declared OKLCH | Declared value as hex |
|---|---|---|---|---|
| --background | #F8FAFC | oklch(0.984 0.003 247.9) | oklch(0.985 0.004 261) | #f9fafd |
| --foreground | #1E293B | oklch(0.279 0.037 260.0) | oklch(0.236 0.025 261) | #181e2a |
| --primary | #2563EB | oklch(0.546 0.215 262.9) | oklch(0.488 0.243 264.376) | #1447e6 |
| --secondary | #F1F5F9 | oklch(0.968 0.007 247.9) | oklch(0.962 0.007 261) | #f0f3f7 |
| --muted-foreground | #64748B | oklch(0.554 0.041 257.4) | oklch(0.491 0.032 261) | #576173 |
| --accent | #EFF6FF | oklch(0.970 0.014 254.6) | oklch(0.971 0.013 264) | #f1f6ff |
| --border | #E2E8F0 | oklch(0.929 0.013 255.5) | oklch(0.916 0.009 261) | #e0e3e9 |
| --success | #047857 | oklch(0.508 0.105 165.6) | oklch(0.508 0.118 165.612) | #007a55 |
| --warning | #B45309 | oklch(0.555 0.146 49.0) | oklch(0.555 0.163 48.998) | #bb4d00 |
| .dark --primary | #60A5FA | oklch(0.714 0.143 254.6) | oklch(0.697 0.158 264) | #6a99ff |
| .dark --success | #34D399 | oklch(0.773 0.153 163.2) | oklch(0.765 0.177 163.223) | #00d492 |
| .dark --warning | #FBBF24 | oklch(0.837 0.164 84.4) | oklch(0.828 0.189 84.429) | #ffba00 |

The hex codes in the comments are the Tailwind v3 slate and blue values. The declared OKLCH values are different colors. For example `--primary` is commented `#2563EB` but renders `#1447e6`, and `--muted-foreground` is commented `#64748B` but renders `#576173`. This is harmless at runtime, but anyone checking contrast from the comments gets wrong answers. The redesign should delete the hex comments or generate them.

Four current tokens are slightly outside sRGB (`--success`, `--warning`, `--destructive`, `--streak-foreground` in light; `--success`, `--warning`, `--destructive` in dark). Browsers clip them. The shift is small, but it means the declared number is not the displayed color. Details are in `current.out.md`.

### 2.4 Why the dark theme reads black, not navy

I sampled pixels from `docs/designs/dashboards/example-02.png` (script `sample_points.py`, converted with culori):

```
example-02.png
  yellow CTA fill          #fed86e  oklch(0.894 0.132 90)
  CTA label ink            #fce575  oklch(0.919 0.135 98)
  page bg (bottom gap)     #18233e  oklch(0.261 0.053 266)
  sidebar bg               #10172c  oklch(0.210 0.043 269)
  card bg (decks)          #131a30  oklch(0.223 0.044 269)
  card bg (progress)       #121a2f  oklch(0.222 0.043 267)
  hero card bg             #171f37  oklch(0.245 0.047 269)
  selected nav pill        #3a3a84  oklch(0.391 0.121 279)
  body text light          #ffffff  oklch(1.000 0.000 0)
  secondary text           #76839f  oklch(0.610 0.045 265)
  green bar                #32e09d  oklch(0.806 0.167 161)
  track                    #35405d  oklch(0.375 0.052 268)
  blue bar                 #349ff8  oklch(0.685 0.162 248)
  purple bar               #9574f6  oklch(0.652 0.187 292)
  study tip bg             #3e332a  oklch(0.330 0.022 61)
  header bg top            #071d43  oklch(0.240 0.077 260)
```

Ignore the "CTA label ink" row. That pixel missed the glyph and landed on the button fill.

Compare with the current dark tokens:

| Surface | example-02 (measured) | Current token | Difference |
|---|---|---|---|
| Page / sidebar | L 0.21 to 0.26, C 0.043 to 0.053, H 266 to 269 | `oklch(0.175 0.025 261)` = #0a111b | Darker, and about half the chroma |
| Card | L 0.22 to 0.25, C 0.044 to 0.047 | `oklch(0.236 0.025 261)` = #181e2a | Same lightness, half the chroma |
| Header band | `oklch(0.240 0.077 260)` | none | No saturated surface at all |
| Call to action | `oklch(0.894 0.132 90)` = #fed86e, yellow | `oklch(0.697 0.158 264)` sky blue | Same hue as the background, so it cannot pop |

Navy is a chroma decision, not a lightness decision. At C 0.025 a dark blue-gray reads as slate or black. At C 0.045 to 0.05 it reads as navy. The proposal uses C 0.038 to 0.058 on dark surfaces and puts the strongest chroma (0.12) on the one hero panel.

## 3. What the sources say, and what it means here

### 3.1 OKLCH and Oklab

- Each hue reaches a different maximum chroma, and the lightness where that peak sits differs by hue [S1]. In this palette amber reaches its chroma of 0.17 at L 0.855, while blue reaches 0.243 at L 0.488. So an amber ramp is naturally lighter than a blue ramp at the same step number. The ramps in Section 4 accept that instead of forcing one lightness scale on all hues.
- Out-of-gamut values are mapped by the browser. Chrome and Safari use fast clipping, which can shift hue [S1]. So every primitive here was fitted inside sRGB first. Nothing is left to the browser.
- For wide-gamut color the article's pattern is: write the sRGB value, then override inside `@media (color-gamut: p3)` [S1]. Section 6.6 applies that.
- Oklab's own caveat: its lightness and chroma were fitted to CAM16 predictions, not directly to human experiments, and it assumes normal well-lit viewing [S2]. It is a good engineering model, not ground truth. That is one more reason to verify with two contrast formulas instead of trusting L alone.

### 3.2 Material 3: HCT, tonal palettes, roles

- HCT describes a color by hue, chroma and tone. Hue and chroma come from CAM16, tone is CIELAB L* [S3]. Tone is tied to luminance, so tone differences map to contrast. Material's HCT source code states that a tone difference of 40 guarantees 3:1 and 50 guarantees 4.5:1. I read that claim only through a search snippet, not the file itself [S4].
- I use OKLCH, not HCT, because CSS and Tailwind v4 speak OKLCH natively [S13]. The idea carried over from HCT is the tonal palette: one hue, many lightness steps, and roles that pick steps a fixed distance apart.
- Role vocabulary [S5][S6]: a fill role and a matching "on" role for content on that fill; "container" roles for lower-emphasis fills; surface container levels for elevation; "outline" for boundaries that matter and "outline variant" for decorative ones. Primary is described as the role for the most important actions [S5]. The role names in Section 4 follow this pattern but keep shadcn's naming (`--primary` with `--primary-foreground` instead of `on-primary`).
- The canonical M3 color roles page is rendered with JavaScript and could not be read in this session [S7]. Role descriptions above come from the Android Wear roles page [S5] and the material-web theming doc [S6].

### 3.3 WCAG 2.2 success criteria that touch color

| SC | Level | What it requires | Where it bites on this dashboard |
|---|---|---|---|
| 1.4.1 Use of Color | A | Color is not the only way information is conveyed [S8][S10] | Selected language chip, week dots (met, missed, today), due vs caught-up, progress bar segments |
| 1.4.3 Contrast (Minimum) | AA | 4.5:1 text, 3:1 large text [S8] | All text. Passes today in light; passes by ratio in dark |
| 1.4.11 Non-text Contrast | AA | 3:1 for component boundaries, states, focus indicators and meaningful graphics [S8][S9] | Focus ring at 50% alpha (fails), outline button edge, goal ring, bar segments |
| 2.4.7 Focus Visible | AA | A visible keyboard focus indicator [S8] | Present |
| 2.4.11 Focus Not Obscured (Minimum) | AA | The focused element is not fully hidden by author content [S8] | Sticky bars and the dev Previews pill must not cover it |
| 2.4.13 Focus Appearance | AAA | Indicator at least as large as a 2px perimeter, 3:1 between focused and unfocused states [S8] | Not required for AA. The proposed 2px solid ring meets it anyway |

Three details from the Understanding documents that shape the proposal:

- A button with a visible text label does not need a 3:1 boundary. The text identifies it [S9]. So a yellow button on a white card is conformant. It is just weak. Section 8 deals with that.
- If visible labels and values carry the same information as chart slices, the slices do not need 3:1 between them [S9]. The dashboard has a text legend, so the bar is conformant today. I still chose bar colors that reach 3:1, because a legend you have to read is slower than a bar you can see.
- Where a specific color carries meaning, such as green for valid and red for invalid, another indicator is needed regardless of contrast [S10].

### 3.4 APCA

- Use-case levels: Lc 90 preferred for body text, Lc 75 minimum for body-size text, Lc 60 minimum for other content text, Lc 45 for large headlines and fine icons, Lc 30 the floor for any text and for solid icons, Lc 15 the floor for dividers and other non-semantic shapes [S11].
- The library call is `APCAcontrast(sRGBtoY(text), sRGBtoY(background))`, text first. It also ships `fontLookupAPCA(Lc)`, which returns the smallest font size per weight [S12]. Section 5.3 uses it.
- APCA is in evaluation for future standards and is not a WCAG 2 conformance method [S12]. Treat it as the stricter design target, with WCAG 2.2 AA as the compliance floor.

### 3.5 Dark mode: never just invert

- Use dark gray, not pure black, as the base. Material's baseline is #121212 [S19]. Raise elevated surfaces by making them lighter: the higher the surface, the stronger the light overlay [S19]. The official overlay table (0% to 16%) and the "200 tone" rule for primary colors came to me only through a search summary of the Material 2 page, which I could not open directly [S20].
- Saturated colors visually vibrate against dark backgrounds, so dark themes use lighter, less saturated variants [S19].
- Avoid pure white text. Material uses white at 87% for high emphasis and 60% for medium [S19]. Note what APCA says about that 60% tier: I measured it at Lc -50.3 on #121212 and Lc -51.6 on the proposed dark card (`misc.mjs`), although WCAG 2 rates it 7.16:1 and 6.56:1. That is too low for small text. This proposal keeps muted text lighter than Material's medium tier for that reason.
- Apple: base backgrounds are dimmer so they recede, elevated ones brighter so they advance. Dark colors are not necessarily inversions of the light ones. Keep at least 4.5:1 and aim for 7:1 with custom colors. Dim bright images so they do not glow [S21].
- Apple also advises against an app-specific appearance setting, because users expect apps to follow the system [S21]. That is native-app advice. On the web a visible toggle is normal, and the owner's respondents asked for one. The compromise already exists in the code: `theme-provider.tsx` defaults to "system" and stores an override. Keep "System" as the default option of the visible control.

Why inversion fails, in this project's own numbers: a color that is strong on white is not strong on navy. The brand blue (L 0.488) is 6.83:1 on a white card and 2.34:1 on a dark card (Section 5.5). Carry it over unchanged and the call to action disappears. Shadows stop working, because a shadow cannot be darker than a near-black page, so elevation must come from lighter surfaces. And the lightness order of data marks must flip (dark means "more" on light, light means "more" on dark), which the current dark `--chart-*` values get wrong.

### 3.6 Albers, Interaction of Color

Albers' thesis is that color is relative. The same swatch looks different depending on what surrounds it. Chapter titles I confirmed from a library catalog: "A color has many faces: the relativity of color", "2 different colors look alike: subtraction of color", "Vibrating boundaries: enforced contours" [S22]. I did not read the book text in this session. The principles below are the well-known ones, stated from general knowledge and tied to this dashboard's measured numbers.

- **Simultaneous contrast.** A color looks lighter on a dark ground and darker on a light ground. The navy hero will look darker on the light page than its number suggests, and lighter on the dark page. That is why the hero is L 0.29 in light and L 0.35 in dark instead of one shared value.
- **Subtraction.** A ground subtracts its own hue from what sits on it. Blue on a blue-tinted panel looks grayer. Blue on navy looks weaker still. Measured: the brand blue is 6.83:1 on white, 5.74:1 on the pale blue tint, 2.34:1 on a dark navy card and 1.69:1 on the navy hero (Section 5.5). Yellow is the opposite case. Its hue is 174 to 179 degrees from the hero's hue, so the navy ground pushes it toward more yellow, not less.
- **One color, many faces.** One gray chip is visible on a white card (1.19:1), nearly gone on the page (1.08:1) and gone on the blue tint (1.00:1). One chip token cannot serve three surfaces.
- **Vibrating boundaries.** Two saturated colors of similar lightness and opposing hue shimmer at their edge. Rule: never put saturated blue text on the amber fill, or amber text on a mid blue. Label colors are near-black ink or near-white only.

### 3.7 Color-vision deficiency

Red-green deficiency affects roughly 1 in 12 men and 1 in 200 women of Northern European ancestry, and deuteranomaly is the most common type. I have these figures from a search summary of pages citing the US National Eye Institute, not from the NEI page itself [S24]. The design consequences are checked by simulation in Section 5.4:

- Success green and danger red collapse toward the same olive under deutan simulation. Status must always carry an icon and a word.
- Blue against yellow is the axis that red-green deficiency keeps. An amber button on navy stays above 7:1 in all three simulations.
- Data marks differ in lightness, so they survive every simulation.

## 4. The proposed system

### 4.1 Tier 1: primitive ramps

Seven ramps. 73 values. Each is defined in OKLCH with lightness chosen first and chroma managed per step, low at the ends and highest in the middle. Hue drifts a few degrees along some ramps on purpose: amber moves from yellow (95) at the light end to orange-brown (52) at the dark end, because that is how warm colors keep looking saturated as they darken. This is the "do not let lightness kill your saturation" advice from Refactoring UI [S23].

Components never reference primitives. They only reference roles (tier 2).

Generated by `verify.mjs`. "In sRGB" was tested with culori's `displayable()`. Chroma was fitted while designing; the values listed are final, so the last column reads "no" everywhere.

**neutral**

| Step | OKLCH | sRGB hex | In sRGB | Chroma lowered to fit |
|--:|---|---|:-:|---|
| 0 | `oklch(1 0 0)` | #ffffff | yes | no |
| 50 | `oklch(0.985 0.004 264)` | #f9fafd | yes | no |
| 100 | `oklch(0.965 0.008 264)` | #f1f3f9 | yes | no |
| 200 | `oklch(0.94 0.012 264)` | #e7ebf3 | yes | no |
| 300 | `oklch(0.87 0.022 264)` | #cdd4e3 | yes | no |
| 400 | `oklch(0.8 0.024 264)` | #b6bece | yes | no |
| 500 | `oklch(0.7 0.03 264)` | #959fb2 | yes | no |
| 600 | `oklch(0.62 0.034 264)` | #7c869b | yes | no |
| 700 | `oklch(0.47 0.04 265)` | #505b72 | yes | no |
| 800 | `oklch(0.33 0.045 266)` | #2a354d | yes | no |
| 900 | `oklch(0.26 0.045 266)` | #1a233a | yes | no |
| 950 | `oklch(0.2 0.042 266)` | #0d1529 | yes | no |

**navy**

| Step | OKLCH | sRGB hex | In sRGB | Chroma lowered to fit |
|--:|---|---|:-:|---|
| 700 | `oklch(0.4 0.058 266)` | #394767 | yes | no |
| 750 | `oklch(0.34 0.055 266)` | #2a3755 | yes | no |
| 800 | `oklch(0.295 0.053 266)` | #202c47 | yes | no |
| 850 | `oklch(0.25 0.05 266)` | #16213a | yes | no |
| 900 | `oklch(0.195 0.045 266)` | #0b1429 | yes | no |
| 950 | `oklch(0.16 0.038 266)` | #060c1d | yes | no |

**blue**

| Step | OKLCH | sRGB hex | In sRGB | Chroma lowered to fit |
|--:|---|---|:-:|---|
| 50 | `oklch(0.972 0.013 262)` | #f1f6ff | yes | no |
| 100 | `oklch(0.94 0.028 262)` | #e1ecff | yes | no |
| 200 | `oklch(0.89 0.053 262)` | #c8dcff | yes | no |
| 300 | `oklch(0.82 0.089 262)` | #a5c5ff | yes | no |
| 400 | `oklch(0.73 0.139 262)` | #77a6ff | yes | no |
| 500 | `oklch(0.61 0.19 263)` | #437bf3 | yes | no |
| 600 | `oklch(0.54 0.225 264)` | #265eee | yes | no |
| 700 | `oklch(0.488 0.243 264.376)` | #1447e6 | yes | no |
| 800 | `oklch(0.42 0.2 265)` | #153bb7 | yes | no |
| 900 | `oklch(0.35 0.12 266)` | #1d3478 | yes | no |
| 950 | `oklch(0.29 0.105 267)` | #14255f | yes | no |

**amber**

| Step | OKLCH | sRGB hex | In sRGB | Chroma lowered to fit |
|--:|---|---|:-:|---|
| 50 | `oklch(0.985 0.024 95)` | #fffae8 | yes | no |
| 100 | `oklch(0.96 0.06 95)` | #fef2c5 | yes | no |
| 200 | `oklch(0.925 0.11 94)` | #fee58f | yes | no |
| 300 | `oklch(0.89 0.15 92)` | #fed756 | yes | no |
| 400 | `oklch(0.855 0.17 88)` | #fec71d | yes | no |
| 500 | `oklch(0.8 0.165 80)` | #f5b005 | yes | no |
| 600 | `oklch(0.7 0.153 68)` | #db8903 | yes | no |
| 700 | `oklch(0.58 0.136 60)` | #b36300 | yes | no |
| 800 | `oklch(0.48 0.115 56)` | #8d4905 | yes | no |
| 900 | `oklch(0.39 0.09 54)` | #69350b | yes | no |
| 950 | `oklch(0.29 0.065 52)` | #442007 | yes | no |

**orange**

| Step | OKLCH | sRGB hex | In sRGB | Chroma lowered to fit |
|--:|---|---|:-:|---|
| 50 | `oklch(0.98 0.014 70)` | #fff7ef | yes | no |
| 100 | `oklch(0.955 0.031 68)` | #ffeddb | yes | no |
| 200 | `oklch(0.91 0.062 65)` | #ffdab7 | yes | no |
| 300 | `oklch(0.85 0.103 62)` | #ffbf87 | yes | no |
| 400 | `oklch(0.78 0.15 56)` | #ff9b4e | yes | no |
| 500 | `oklch(0.7 0.18 50)` | #f37513 | yes | no |
| 600 | `oklch(0.62 0.174 46)` | #d75b01 | yes | no |
| 700 | `oklch(0.53 0.14 50)` | #a94e00 | yes | no |
| 800 | `oklch(0.45 0.115 50)` | #863e07 | yes | no |
| 900 | `oklch(0.38 0.09 48)` | #683110 | yes | no |
| 950 | `oklch(0.28 0.065 46)` | #421d09 | yes | no |

**green**

| Step | OKLCH | sRGB hex | In sRGB | Chroma lowered to fit |
|--:|---|---|:-:|---|
| 50 | `oklch(0.98 0.02 160)` | #eefdf4 | yes | no |
| 100 | `oklch(0.955 0.045 160)` | #d7fae6 | yes | no |
| 200 | `oklch(0.915 0.08 160)` | #b5f4d1 | yes | no |
| 300 | `oklch(0.86 0.12 160)` | #85e9b6 | yes | no |
| 400 | `oklch(0.79 0.15 160)` | #4ed799 | yes | no |
| 500 | `oklch(0.7 0.15 160)` | #23ba7d | yes | no |
| 600 | `oklch(0.585 0.13 161)` | #019362 | yes | no |
| 700 | `oklch(0.51 0.111 162)` | #037952 | yes | no |
| 800 | `oklch(0.43 0.092 163)` | #025f41 | yes | no |
| 900 | `oklch(0.36 0.075 164)` | #034932 | yes | no |
| 950 | `oklch(0.27 0.055 165)` | #022f20 | yes | no |

**red**

| Step | OKLCH | sRGB hex | In sRGB | Chroma lowered to fit |
|--:|---|---|:-:|---|
| 50 | `oklch(0.975 0.012 20)` | #fff4f3 | yes | no |
| 100 | `oklch(0.945 0.027 20)` | #ffe6e5 | yes | no |
| 200 | `oklch(0.895 0.054 20)` | #ffcfce | yes | no |
| 300 | `oklch(0.82 0.1 21)` | #ffaaa8 | yes | no |
| 400 | `oklch(0.73 0.16 22)` | #fc7a79 | yes | no |
| 500 | `oklch(0.65 0.2 25)` | #f14d4c | yes | no |
| 600 | `oklch(0.58 0.215 27)` | #dd2729 | yes | no |
| 700 | `oklch(0.51 0.195 28)` | #bc1a18 | yes | no |
| 800 | `oklch(0.44 0.16 28)` | #971b17 | yes | no |
| 900 | `oklch(0.37 0.125 28)` | #741a15 | yes | no |
| 950 | `oklch(0.27 0.085 27)` | #48100d | yes | no |

Why these ramps:

- **neutral** is gray tinted toward the brand hue (264 to 266) with chroma 0.004 to 0.045. Refactoring UI calls this "greys don't have to be grey" [S23]. The dark end (800 to 950) is navy ink, so text on light surfaces already belongs to the brand.
- **navy** exists only for dark-theme surfaces. It has more chroma than neutral at the same lightness (0.038 to 0.058) so that surfaces read navy.
- **blue** is the brand. Step 700 is the existing `--primary`, unchanged, so the brand color does not move.
- **amber** is the warm accent, reserved for the call to action.
- **orange** is the streak flame and caution.
- **green** and **red** are success and danger.

### 4.2 Tier 2: semantic roles

Concept names from the brief, mapped to CSS variables. Variables without "new" already exist in `globals.css`, so existing components keep working.

| Concept | CSS variable | Status | Used for |
|---|---|---|---|
| surface-page | `--background` | existing | The page |
| surface-raised | `--card` | existing | Cards, list containers |
| surface-overlay | `--popover` | existing | Menus, dialogs |
| surface-sunken | `--muted`, `--secondary` | existing | Chips, wells. Darker than the card in light, lighter than the card in dark, because in dark mode elevation is lightness |
| surface-nav | `--sidebar` | existing | Sidebar. Recedes in dark |
| surface-selected | `--accent` | existing | Hover and selected tint |
| surface-hero | `--hero` | new | The one Today panel. Deep navy in both themes |
| surface-hero (soft) | `--hero-soft` | new | Only if option A is chosen in Section 8 |
| text-strong | `--foreground-strong` | new | Headings, big numerals |
| text-default | `--foreground` | existing | Body text, labels |
| text-muted | `--muted-foreground` | existing | Secondary text |
| text on hero | `--hero-foreground`, `--hero-muted-foreground` | new | Text on the hero |
| border-subtle | `--border` | existing | Decorative hairlines |
| border-strong | `--border-strong`, `--input` | new, existing | Any boundary a person must see: inputs, outline buttons, unselected chips. 3:1 |
| focus ring | `--ring`, `--hero-ring` | existing, new | 2px solid. `--hero-ring` is for focus on the hero |
| brand | `--brand`, `--link` | new | Logo, brand icons, selected borders, links. Not the main action |
| brand solid | `--primary`, `--primary-foreground`, `--primary-hover` | existing, new | Solid brand-blue buttons and every existing `bg-primary` and `text-primary`. Stays text-safe |
| action-primary | `--cta`, `--cta-foreground` | new | The single call to action on a screen |
| action states | `--cta-hover`, `--cta-active`, `--cta-edge` | new | Hover, pressed, and the darker bottom edge that gives the button depth |
| status | `--success`, `--warning`, `--destructive` | existing | Status text and icons |
| status containers | `--*-container`, `--*-container-foreground` | new | Tinted status panels with guaranteed text contrast |
| streak | `--streak` (alias `--streak-foreground`) | existing name kept | Flame icon |
| data viz | `--viz-mastered`, `--viz-learning`, `--viz-new`, `--viz-track`, `--viz-progress`, `--viz-on-progress` | new | Progress bar, goal ring, week dots |
| data viz aliases | `--chart-1` to `--chart-5` | existing | Point at the `--viz-*` roles so FocusDeckCard.tsx:52 to :54 keeps working |

Exact values, generated by `gen.mjs` from `tokens.mjs`. Rows marked "(option A)" are the alternates for Section 8.

| Role (CSS variable) | Light | Light value | Dark | Dark value |
|---|---|---|---|---|
| `--background` | neutral.100 | `oklch(0.965 0.008 264)` #f1f3f9 | navy.900 | `oklch(0.195 0.045 266)` #0b1429 |
| `--sidebar` | neutral.50 | `oklch(0.985 0.004 264)` #f9fafd | navy.950 | `oklch(0.16 0.038 266)` #060c1d |
| `--card` | neutral.0 | `oklch(1 0 0)` #ffffff | navy.850 | `oklch(0.25 0.05 266)` #16213a |
| `--popover` | neutral.0 | `oklch(1 0 0)` #ffffff | navy.800 | `oklch(0.295 0.053 266)` #202c47 |
| `--muted` | neutral.200 | `oklch(0.94 0.012 264)` #e7ebf3 | navy.750 | `oklch(0.34 0.055 266)` #2a3755 |
| `--secondary` | neutral.200 | `oklch(0.94 0.012 264)` #e7ebf3 | navy.750 | `oklch(0.34 0.055 266)` #2a3755 |
| `--accent` | blue.100 | `oklch(0.94 0.028 262)` #e1ecff | navy.750 | `oklch(0.34 0.055 266)` #2a3755 |
| `--hero` | blue.950 | `oklch(0.29 0.105 267)` #14255f | blue.900 | `oklch(0.35 0.12 266)` #1d3478 |
| `--hero-soft` | blue.100 | `oklch(0.94 0.028 262)` #e1ecff | navy.800 | `oklch(0.295 0.053 266)` #202c47 |
| `--foreground-strong` | neutral.950 | `oklch(0.2 0.042 266)` #0d1529 | neutral.50 | `oklch(0.985 0.004 264)` #f9fafd |
| `--foreground` | neutral.800 | `oklch(0.33 0.045 266)` #2a354d | neutral.200 | `oklch(0.94 0.012 264)` #e7ebf3 |
| `--muted-foreground` | neutral.700 | `oklch(0.47 0.04 265)` #505b72 | neutral.300 | `oklch(0.87 0.022 264)` #cdd4e3 |
| `--accent-foreground` | blue.800 | `oklch(0.42 0.2 265)` #153bb7 | blue.200 | `oklch(0.89 0.053 262)` #c8dcff |
| `--hero-foreground` | neutral.50 | `oklch(0.985 0.004 264)` #f9fafd | neutral.50 | `oklch(0.985 0.004 264)` #f9fafd |
| `--hero-muted-foreground` | blue.200 | `oklch(0.89 0.053 262)` #c8dcff | blue.100 | `oklch(0.94 0.028 262)` #e1ecff |
| `--brand` | blue.700 | `oklch(0.488 0.243 264.376)` #1447e6 | blue.300 | `oklch(0.82 0.089 262)` #a5c5ff |
| `--link` | blue.700 | `oklch(0.488 0.243 264.376)` #1447e6 | blue.200 | `oklch(0.89 0.053 262)` #c8dcff |
| `--border` | neutral.300 | `oklch(0.87 0.022 264)` #cdd4e3 | navy.700 | `oklch(0.4 0.058 266)` #394767 |
| `--border-strong` | neutral.600 | `oklch(0.62 0.034 264)` #7c869b | neutral.600 | `oklch(0.62 0.034 264)` #7c869b |
| `--input` | neutral.600 | `oklch(0.62 0.034 264)` #7c869b | neutral.600 | `oklch(0.62 0.034 264)` #7c869b |
| `--ring` | blue.700 | `oklch(0.488 0.243 264.376)` #1447e6 | blue.300 | `oklch(0.82 0.089 262)` #a5c5ff |
| `--hero-border` | blue.800 | `oklch(0.42 0.2 265)` #153bb7 | blue.800 | `oklch(0.42 0.2 265)` #153bb7 |
| `--hero-ring` | neutral.50 | `oklch(0.985 0.004 264)` #f9fafd | neutral.50 | `oklch(0.985 0.004 264)` #f9fafd |
| `--hero-chip` | mix 14% hero-foreground into hero | `oklch(0.387 0.091 267.0)` #2e4175 | mix 14% hero-foreground into hero | `oklch(0.439 0.104 266.0)` #374f8b |
| `--primary` | blue.700 | `oklch(0.488 0.243 264.376)` #1447e6 | blue.200 | `oklch(0.89 0.053 262)` #c8dcff |
| `--primary-foreground` | neutral.0 | `oklch(1 0 0)` #ffffff | navy.950 | `oklch(0.16 0.038 266)` #060c1d |
| `--primary-hover` | blue.800 | `oklch(0.42 0.2 265)` #153bb7 | blue.100 | `oklch(0.94 0.028 262)` #e1ecff |
| `--cta` | amber.400 | `oklch(0.855 0.17 88)` #fec71d | amber.300 | `oklch(0.89 0.15 92)` #fed756 |
| `--cta-foreground` | neutral.950 | `oklch(0.2 0.042 266)` #0d1529 | navy.950 | `oklch(0.16 0.038 266)` #060c1d |
| `--cta-hover` | amber.300 | `oklch(0.89 0.15 92)` #fed756 | amber.200 | `oklch(0.925 0.11 94)` #fee58f |
| `--cta-active` | amber.500 | `oklch(0.8 0.165 80)` #f5b005 | amber.400 | `oklch(0.855 0.17 88)` #fec71d |
| `--cta-edge` | amber.700 | `oklch(0.58 0.136 60)` #b36300 | amber.600 | `oklch(0.7 0.153 68)` #db8903 |
| `--cta (option A)` | blue.700 | `oklch(0.488 0.243 264.376)` #1447e6 | blue.200 | `oklch(0.89 0.053 262)` #c8dcff |
| `--cta (option A)-foreground` | neutral.0 | `oklch(1 0 0)` #ffffff | navy.950 | `oklch(0.16 0.038 266)` #060c1d |
| `--cta (option A)-hover` | blue.800 | `oklch(0.42 0.2 265)` #153bb7 | blue.100 | `oklch(0.94 0.028 262)` #e1ecff |
| `--cta (option A)-active` | blue.900 | `oklch(0.35 0.12 266)` #1d3478 | blue.300 | `oklch(0.82 0.089 262)` #a5c5ff |
| `--cta (option A)-edge` | blue.900 | `oklch(0.35 0.12 266)` #1d3478 | blue.500 | `oklch(0.61 0.19 263)` #437bf3 |
| `--success` | green.700 | `oklch(0.51 0.111 162)` #037952 | green.300 | `oklch(0.86 0.12 160)` #85e9b6 |
| `--success-container` | green.100 | `oklch(0.955 0.045 160)` #d7fae6 | green.950 | `oklch(0.27 0.055 165)` #022f20 |
| `--success-container-foreground` | green.900 | `oklch(0.36 0.075 164)` #034932 | green.200 | `oklch(0.915 0.08 160)` #b5f4d1 |
| `--warning` | orange.700 | `oklch(0.53 0.14 50)` #a94e00 | orange.300 | `oklch(0.85 0.103 62)` #ffbf87 |
| `--warning-container` | orange.100 | `oklch(0.955 0.031 68)` #ffeddb | orange.950 | `oklch(0.28 0.065 46)` #421d09 |
| `--warning-container-foreground` | orange.900 | `oklch(0.38 0.09 48)` #683110 | orange.200 | `oklch(0.91 0.062 65)` #ffdab7 |
| `--destructive` | red.700 | `oklch(0.51 0.195 28)` #bc1a18 | red.300 | `oklch(0.82 0.1 21)` #ffaaa8 |
| `--destructive-foreground` | neutral.0 | `oklch(1 0 0)` #ffffff | navy.950 | `oklch(0.16 0.038 266)` #060c1d |
| `--destructive-container` | red.100 | `oklch(0.945 0.027 20)` #ffe6e5 | red.950 | `oklch(0.27 0.085 27)` #48100d |
| `--destructive-container-foreground` | red.900 | `oklch(0.37 0.125 28)` #741a15 | red.200 | `oklch(0.895 0.054 20)` #ffcfce |
| `--streak` | orange.600 | `oklch(0.62 0.174 46)` #d75b01 | orange.400 | `oklch(0.78 0.15 56)` #ff9b4e |
| `--viz-mastered` | blue.950 | `oklch(0.29 0.105 267)` #14255f | blue.100 | `oklch(0.94 0.028 262)` #e1ecff |
| `--viz-learning` | blue.500 | `oklch(0.61 0.19 263)` #437bf3 | blue.500 | `oklch(0.61 0.19 263)` #437bf3 |
| `--viz-new` | neutral.200 | `oklch(0.94 0.012 264)` #e7ebf3 | navy.800 | `oklch(0.295 0.053 266)` #202c47 |
| `--viz-track` | neutral.200 | `oklch(0.94 0.012 264)` #e7ebf3 | navy.800 | `oklch(0.295 0.053 266)` #202c47 |
| `--viz-progress` | blue.700 | `oklch(0.488 0.243 264.376)` #1447e6 | blue.400 | `oklch(0.73 0.139 262)` #77a6ff |
| `--viz-on-progress` | neutral.0 | `oklch(1 0 0)` #ffffff | navy.950 | `oklch(0.16 0.038 266)` #060c1d |
| `--viz (option A)-mastered` | green.950 | `oklch(0.27 0.055 165)` #022f20 | green.100 | `oklch(0.955 0.045 160)` #d7fae6 |
| `--viz (option A)-learning` | green.600 | `oklch(0.585 0.13 161)` #019362 | green.600 | `oklch(0.585 0.13 161)` #019362 |
| `--viz (option A)-progress` | green.700 | `oklch(0.51 0.111 162)` #037952 | green.400 | `oklch(0.79 0.15 160)` #4ed799 |

Design notes on the values:

- **Three text tones, not two.** Light: L 0.20, 0.33, 0.47. Dark: L 0.985, 0.94, 0.87. Dark-mode tones are closer together than light-mode tones. That is forced by APCA: on a navy card, anything below about L 0.86 drops under Lc 75 (measured by `scan.mjs`). In dark mode, express hierarchy with size and weight first and color second.
- **No pure white text, no pure black.** The lightest text is `oklch(0.985 0.004 264)` (#f9fafd). The darkest surface is `oklch(0.16 0.038 266)` (#060c1d).
- **Light page is a step darker than today** (L 0.965 instead of 0.985) so white cards separate by 1.11:1 instead of 1.04:1. That is still subtle on purpose. The structure comes from the hero, not from boxes.
- **The hero is the only saturated surface.** L 0.29, C 0.105 in light. L 0.35, C 0.12 in dark. Against the light page it measures 12.97:1. It is the darkest large shape on the light page and the most colorful shape on the dark page. That is what gives the eye one place to land.
- **Dark elevation by lightness.** Sidebar 0.16, page 0.195, card 0.25, popover 0.295, chip 0.34, hero 0.35. No shadows are needed to tell them apart.
- **Dark accents are lighter and less saturated.** Light call to action: amber.400, C 0.17. Dark: amber.300, C 0.15, nearly the measured example-02 button (`oklch(0.894 0.132 90)`). Status colors move from the 700 step (C 0.11 to 0.195) to the 300 step (C 0.10 to 0.12).
- **Data marks are one hue with three lightness steps.** Light: mastered L 0.29, learning L 0.61, not started L 0.94. Dark flips the order: mastered L 0.94, learning L 0.61, not started L 0.295. More progress is always further from the track. Adjacent segments are at least 3.28:1 in both themes.
- **`--input` now equals `--border-strong`.** Input and outline-button edges become 3.3 to 5.0:1 instead of 1.3:1. This is a visible change across the app and is intended [S9].

### 4.3 What existing code must change

Nothing breaks if only the token values change. These are the places where a role should be swapped so that one color means one thing:

| File and line | Today | Change to | Why |
|---|---|---|---|
| TodayPanel.tsx:287 | `bg-accent` | `bg-hero text-hero-foreground` | The hero surface |
| TodayPanel.tsx:294 | `text-accent-foreground` | `text-hero-muted-foreground` | Eyebrow on the hero |
| TodayPanel.tsx:118 | `bg-card text-muted-foreground` chips | `bg-hero-chip text-hero-foreground` | A white chip on navy would out-shout the button |
| TodayPanel.tsx "Start review" button | default `bg-primary` | new `cta` button variant: `bg-cta text-cta-foreground` | The one action |
| LanguageFilter.tsx:12 | selected chip `bg-primary` | `bg-accent text-accent-foreground border-brand` plus a check icon | Selection is not the main action |
| ThisWeek.tsx:84 | `stroke-primary` | `stroke-viz-progress` | Data, not action |
| ThisWeek.tsx:73 | `stroke-muted` | `stroke-viz-track` | Track |
| ThisWeek.tsx:100, :102 | `bg-primary`, `ring-primary` | `bg-viz-progress text-viz-on-progress`, `ring-viz-progress` | Data, not action |
| FocusDeckCard.tsx:52 to :54, DeckList.tsx:61 | `bg-chart-1`, `-2`, `-4` | no change needed (aliases), or `bg-viz-*` | Values now ordered by lightness |
| ProgressTrends.tsx:64, :88 | `text-primary` | `text-brand` icon, `text-foreground` number, `text-success` only when it is good news | Blue text is not a link here |
| button.tsx:8, LanguageFilter.tsx:12 | `focus-visible:ring-3 focus-visible:ring-ring/50` | `focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring` | 2.40:1 becomes 6.2 to 6.8:1 in light and 9.2 to 11.2:1 in dark |
| button.tsx:12 | `hover:bg-primary/80` | `hover:bg-primary-hover` | An alpha hover changes with the surface under it. A token does not |
| DeckList.tsx:156, MemoryCallout.tsx:37 | `ring-foreground/10` | `border border-border` | Token instead of alpha |
| globals.css:17 to :23 | `--color-brand-*` fixed values | remove, or alias to roles | They do not switch in dark mode. 9 usages in `apps/web/src` |

## 5. Verification

### 5.1 How it was checked

- `tokens.mjs` holds every primitive and every role. `verify.mjs` reads it. For each pairing it converts both colors to 8-bit sRGB (what an sRGB screen shows), then computes the WCAG ratio with culori's `wcagContrast` and APCA Lc with `APCAcontrast(sRGBtoY(text), sRGBtoY(background))` [S12].
- Gamut: each primitive is tested with culori's `displayable()`. While designing, any value outside sRGB had its chroma lowered in steps of 0.001 until it fit, and the fitted value was written back. Result: 73 of 73 primitives are inside sRGB, so there is no clamped fallback to report for the proposal. (Seven current tokens are outside sRGB; see Section 2.3.)
- Iterations that changed values: dark muted text L 0.80 to 0.87 (Lc -65 to -78); dark body text L 0.925 to 0.94 (Lc -89 to -92 on card); learning blue L 0.63 to 0.61 (two bar pairings were under 3:1 or Lc 30); dark danger red.400 to red.300 (Lc -50 to -67); option A dark button from mid blue (blue.400) to pale blue (blue.200) (label Lc 56 to 84); green learning L 0.60 to 0.585.
- Run it: `cd <color dir> && node verify.mjs --md --json`. Last run: `FAILS: 0`.

### 5.2 Final pairing tables (generated by `verify.mjs`)

Read a row as: foreground role, the primitive it points to, the resulting hex; then the same for the background. "B:" rows are the warm call to action. "A:" rows are the blue alternative. Negative Lc means light on dark.

#### LIGHT theme pairings

| # | Pairing | Foreground | Background | Rule | WCAG | APCA Lc | Pass |
|--:|---|---|---|---|--:|--:|:-:|
| 1 | Heading / numeral on page | `foreground-strong` neutral.950 #0d1529 | `background` neutral.100 #f1f3f9 | 7:1, Lc 90 | 16.37 | 97.7 | yes |
| 2 | Heading / numeral on card | `foreground-strong` neutral.950 #0d1529 | `card` neutral.0 #ffffff | 7:1, Lc 90 | 18.16 | 104.8 | yes |
| 3 | Body text on page | `foreground` neutral.800 #2a354d | `background` neutral.100 #f1f3f9 | 7:1, Lc 90 | 11.04 | 90.8 | yes |
| 4 | Body text on card | `foreground` neutral.800 #2a354d | `card` neutral.0 #ffffff | 7:1, Lc 90 | 12.25 | 97.9 | yes |
| 5 | Body text on sidebar | `foreground` neutral.800 #2a354d | `sidebar` neutral.50 #f9fafd | 7:1, Lc 90 | 11.73 | 94.9 | yes |
| 6 | Body text on popover | `foreground` neutral.800 #2a354d | `popover` neutral.0 #ffffff | 7:1, Lc 75 | 12.25 | 97.9 | yes |
| 7 | Body text on chip (muted) | `foreground` neutral.800 #2a354d | `muted` neutral.200 #e7ebf3 | 7:1, Lc 75 | 10.25 | 85.9 | yes |
| 8 | Muted text on page | `muted-foreground` neutral.700 #505b72 | `background` neutral.100 #f1f3f9 | 4.5:1, Lc 75 | 6.14 | 76.4 | yes |
| 9 | Muted text on card | `muted-foreground` neutral.700 #505b72 | `card` neutral.0 #ffffff | 4.5:1, Lc 75 | 6.82 | 83.5 | yes |
| 10 | Muted text on sidebar | `muted-foreground` neutral.700 #505b72 | `sidebar` neutral.50 #f9fafd | 4.5:1, Lc 75 | 6.53 | 80.5 | yes |
| 11 | Muted text on popover | `muted-foreground` neutral.700 #505b72 | `popover` neutral.0 #ffffff | 4.5:1, Lc 60 | 6.82 | 83.5 | yes |
| 12 | Muted text on chip (muted) | `muted-foreground` neutral.700 #505b72 | `muted` neutral.200 #e7ebf3 | 4.5:1, Lc 60 | 5.71 | 71.5 | yes |
| 13 | Selected label on accent tint | `accent-foreground` blue.800 #153bb7 | `accent` blue.100 #e1ecff | 4.5:1, Lc 75 | 7.54 | 77.9 | yes |
| 14 | Selected border / brand icon vs card | `brand` blue.700 #1447e6 | `card` neutral.0 #ffffff | 3:1, Lc 30 | 6.83 | 82.4 | yes |
| 15 | Selected border / brand icon vs page | `brand` blue.700 #1447e6 | `background` neutral.100 #f1f3f9 | 3:1, Lc 30 | 6.16 | 75.3 | yes |
| 16 | Link on page | `link` blue.700 #1447e6 | `background` neutral.100 #f1f3f9 | 4.5:1, Lc 60 | 6.16 | 75.3 | yes |
| 17 | Link on card | `link` blue.700 #1447e6 | `card` neutral.0 #ffffff | 4.5:1, Lc 60 | 6.83 | 82.4 | yes |
| 18 | Hero text on hero | `hero-foreground` neutral.50 #f9fafd | `hero` blue.950 #14255f | 7:1, Lc 90 | 13.78 | -100.5 | yes |
| 19 | Hero secondary text on hero | `hero-muted-foreground` blue.200 #c8dcff | `hero` blue.950 #14255f | 4.5:1, Lc 75 | 10.37 | -80.6 | yes |
| 20 | Hero chip text on hero chip | `hero-foreground` neutral.50 #f9fafd | `hero-chip` mix #2e4175 | 7:1, Lc 75 | 9.45 | -93.6 | yes |
| 21 | Hero hairline vs hero | `hero-border` blue.800 #153bb7 | `hero` blue.950 #14255f | report only | 1.60 | -8.5 | n/a |
| 22 | Primary (brand) button label on fill | `primary-foreground` neutral.0 #ffffff | `primary` blue.700 #1447e6 | 4.5:1, Lc 75 | 6.83 | -87.5 | yes |
| 23 | Primary (brand) button label on hover fill | `primary-foreground` neutral.0 #ffffff | `primary-hover` blue.800 #153bb7 | 4.5:1, Lc 75 | 8.97 | -94.1 | yes |
| 24 | text-primary on card (existing usages) | `primary` blue.700 #1447e6 | `card` neutral.0 #ffffff | 4.5:1, Lc 60 | 6.83 | 82.4 | yes |
| 25 | text-primary on page (existing usages) | `primary` blue.700 #1447e6 | `background` neutral.100 #f1f3f9 | 4.5:1, Lc 60 | 6.16 | 75.3 | yes |
| 26 | B: CTA label on fill | `cta-foreground` neutral.950 #0d1529 | `cta` amber.400 #fec71d | 4.5:1, Lc 75 | 11.59 | 76.9 | yes |
| 27 | B: CTA label on hover fill | `cta-foreground` neutral.950 #0d1529 | `cta-hover` amber.300 #fed756 | 4.5:1, Lc 75 | 13.03 | 83.5 | yes |
| 28 | B: CTA label on pressed fill | `cta-foreground` neutral.950 #0d1529 | `cta-active` amber.500 #f5b005 | 4.5:1, Lc 60 | 9.59 | 67.0 | yes |
| 29 | B: CTA fill vs hero (stand-out) | `cta` amber.400 #fec71d | `hero` blue.950 #14255f | 3:1, Lc 30 | 9.18 | -73.3 | yes |
| 30 | B: CTA hover fill vs hero | `cta-hover` amber.300 #fed756 | `hero` blue.950 #14255f | 3:1, Lc 30 | 10.32 | -80.4 | yes |
| 31 | B: CTA fill vs page (if placed on the page) | `cta` amber.400 #fec71d | `background` neutral.100 #f1f3f9 | report only | 1.41 | 18.5 | n/a |
| 32 | B: CTA fill vs card (if placed on a card) | `cta` amber.400 #fec71d | `card` neutral.0 #ffffff | report only | 1.57 | 25.7 | n/a |
| 33 | B: CTA edge vs card (gives the 3:1 boundary) | `cta-edge` amber.700 #b36300 | `card` neutral.0 #ffffff | 3:1, Lc 30 | 4.47 | 70.5 | yes |
| 34 | B: CTA edge vs page | `cta-edge` amber.700 #b36300 | `background` neutral.100 #f1f3f9 | 3:1, Lc 30 | 4.03 | 63.4 | yes |
| 35 | A: CTA label on fill | `ctaA-foreground` neutral.0 #ffffff | `ctaA` blue.700 #1447e6 | 4.5:1, Lc 75 | 6.83 | -87.5 | yes |
| 36 | A: CTA label on hover fill | `ctaA-foreground` neutral.0 #ffffff | `ctaA-hover` blue.800 #153bb7 | 4.5:1, Lc 75 | 8.97 | -94.1 | yes |
| 37 | A: CTA label on pressed fill | `ctaA-foreground` neutral.0 #ffffff | `ctaA-active` blue.900 #1d3478 | 4.5:1, Lc 60 | 11.57 | -100.0 | yes |
| 38 | A: CTA fill vs soft hero (stand-out) | `ctaA` blue.700 #1447e6 | `hero-soft` blue.100 #e1ecff | report only | 5.74 | 70.6 | n/a |
| 39 | A: CTA fill vs card (stand-out) | `ctaA` blue.700 #1447e6 | `card` neutral.0 #ffffff | report only | 6.83 | 82.4 | n/a |
| 40 | A: CTA fill vs bold hero (fails in light, works in dark) | `ctaA` blue.700 #1447e6 | `hero` blue.950 #14255f | report only | 2.11 | -15.4 | n/a |
| 41 | A: heading / numeral on soft hero | `foreground-strong` neutral.950 #0d1529 | `hero-soft` blue.100 #e1ecff | 7:1, Lc 90 | 15.26 | 93.1 | yes |
| 42 | A: body text on soft hero | `foreground` neutral.800 #2a354d | `hero-soft` blue.100 #e1ecff | 7:1, Lc 75 | 10.29 | 86.2 | yes |
| 43 | A: muted text on soft hero | `muted-foreground` neutral.700 #505b72 | `hero-soft` blue.100 #e1ecff | 4.5:1, Lc 60 | 5.73 | 71.8 | yes |
| 44 | Focus ring vs page | `ring` blue.700 #1447e6 | `background` neutral.100 #f1f3f9 | 3:1, Lc 30 | 6.16 | 75.3 | yes |
| 45 | Focus ring vs card | `ring` blue.700 #1447e6 | `card` neutral.0 #ffffff | 3:1, Lc 30 | 6.83 | 82.4 | yes |
| 46 | Focus ring vs sidebar | `ring` blue.700 #1447e6 | `sidebar` neutral.50 #f9fafd | 3:1, Lc 30 | 6.55 | 79.4 | yes |
| 47 | Focus ring on hero vs hero | `hero-ring` neutral.50 #f9fafd | `hero` blue.950 #14255f | 3:1, Lc 30 | 13.78 | -100.5 | yes |
| 48 | A: focus ring vs soft hero | `ring` blue.700 #1447e6 | `hero-soft` blue.100 #e1ecff | 3:1, Lc 30 | 5.74 | 70.6 | yes |
| 49 | Control border (border-strong) vs card | `border-strong` neutral.600 #7c869b | `card` neutral.0 #ffffff | 3:1, Lc 30 | 3.66 | 64.2 | yes |
| 50 | Control border (border-strong) vs page | `border-strong` neutral.600 #7c869b | `background` neutral.100 #f1f3f9 | 3:1, Lc 30 | 3.30 | 57.0 | yes |
| 51 | Control border (border-strong) vs popover | `border-strong` neutral.600 #7c869b | `popover` neutral.0 #ffffff | 3:1, Lc 30 | 3.66 | 64.2 | yes |
| 52 | Hairline (border) vs card | `border` neutral.300 #cdd4e3 | `card` neutral.0 #ffffff | report only | 1.49 | 22.9 | n/a |
| 53 | Hairline (border) vs page | `border` neutral.300 #cdd4e3 | `background` neutral.100 #f1f3f9 | report only | 1.34 | 15.8 | n/a |
| 54 | Surface: card vs page | `card` neutral.0 #ffffff | `background` neutral.100 #f1f3f9 | report only | 1.11 | 0.0 | n/a |
| 55 | Surface: sidebar vs page | `sidebar` neutral.50 #f9fafd | `background` neutral.100 #f1f3f9 | report only | 1.06 | 0.0 | n/a |
| 56 | Surface: chip (muted) vs card | `muted` neutral.200 #e7ebf3 | `card` neutral.0 #ffffff | report only | 1.19 | 9.5 | n/a |
| 57 | Surface: hero vs page | `hero` blue.950 #14255f | `background` neutral.100 #f1f3f9 | report only | 12.97 | 93.7 | n/a |
| 58 | Surface: soft hero vs page | `hero-soft` blue.100 #e1ecff | `background` neutral.100 #f1f3f9 | report only | 1.07 | 0.0 | n/a |
| 59 | Success text on card | `success` green.700 #037952 | `card` neutral.0 #ffffff | 4.5:1, Lc 60 | 5.44 | 76.6 | yes |
| 60 | Success text on page | `success` green.700 #037952 | `background` neutral.100 #f1f3f9 | 4.5:1, Lc 60 | 4.90 | 69.4 | yes |
| 61 | Success container text | `success-container-foreground` green.900 #034932 | `success-container` green.100 #d7fae6 | 4.5:1, Lc 75 | 9.34 | 86.0 | yes |
| 62 | Warning text on card | `warning` orange.700 #a94e00 | `card` neutral.0 #ffffff | 4.5:1, Lc 60 | 5.56 | 77.1 | yes |
| 63 | Warning text on page | `warning` orange.700 #a94e00 | `background` neutral.100 #f1f3f9 | 4.5:1, Lc 60 | 5.01 | 70.0 | yes |
| 64 | Warning container text | `warning-container-foreground` orange.900 #683110 | `warning-container` orange.100 #ffeddb | 4.5:1, Lc 75 | 9.03 | 84.5 | yes |
| 65 | Danger text on card | `destructive` red.700 #bc1a18 | `card` neutral.0 #ffffff | 4.5:1, Lc 60 | 6.37 | 79.7 | yes |
| 66 | Danger text on page | `destructive` red.700 #bc1a18 | `background` neutral.100 #f1f3f9 | 4.5:1, Lc 60 | 5.74 | 72.5 | yes |
| 67 | Danger button label on fill | `destructive-foreground` neutral.0 #ffffff | `destructive` red.700 #bc1a18 | 4.5:1, Lc 60 | 6.37 | -84.9 | yes |
| 68 | Danger container text | `destructive-container-foreground` red.900 #741a15 | `destructive-container` red.100 #ffe6e5 | 4.5:1, Lc 75 | 9.31 | 82.8 | yes |
| 69 | Streak flame icon vs card | `streak` orange.600 #d75b01 | `card` neutral.0 #ffffff | 3:1, Lc 30 | 3.90 | 65.6 | yes |
| 70 | Streak flame icon vs page | `streak` orange.600 #d75b01 | `background` neutral.100 #f1f3f9 | 3:1, Lc 30 | 3.51 | 58.4 | yes |
| 71 | Viz: mastered vs learning (adjacent) | `viz-mastered` blue.950 #14255f | `viz-learning` blue.500 #437bf3 | 3:1, Lc 30 | 3.68 | 32.7 | yes |
| 72 | Viz: learning vs not started (adjacent) | `viz-learning` blue.500 #437bf3 | `viz-new` neutral.200 #e7ebf3 | 3:1, Lc 30 | 3.28 | 54.1 | yes |
| 73 | Viz: mastered vs card | `viz-mastered` blue.950 #14255f | `card` neutral.0 #ffffff | 3:1, Lc 30 | 14.39 | 100.8 | yes |
| 74 | Viz: learning vs card | `viz-learning` blue.500 #437bf3 | `card` neutral.0 #ffffff | 3:1, Lc 30 | 3.91 | 66.1 | yes |
| 75 | Viz: not started / track vs card | `viz-new` neutral.200 #e7ebf3 | `card` neutral.0 #ffffff | report only | 1.19 | 9.5 | n/a |
| 76 | Viz: goal ring vs track | `viz-progress` blue.700 #1447e6 | `viz-track` neutral.200 #e7ebf3 | 3:1, Lc 30 | 5.72 | 70.4 | yes |
| 77 | Viz: goal ring vs card | `viz-progress` blue.700 #1447e6 | `card` neutral.0 #ffffff | 3:1, Lc 30 | 6.83 | 82.4 | yes |
| 78 | Viz: check mark on filled day | `viz-on-progress` neutral.0 #ffffff | `viz-progress` blue.700 #1447e6 | 3:1, Lc 30 | 6.83 | -87.5 | yes |
| 79 | Viz A: mastered vs learning (adjacent) | `vizA-mastered` green.950 #022f20 | `vizA-learning` green.600 #019362 | 3:1, Lc 30 | 3.74 | 33.3 | yes |
| 80 | Viz A: learning vs not started (adjacent) | `vizA-learning` green.600 #019362 | `viz-new` neutral.200 #e7ebf3 | 3:1, Lc 30 | 3.28 | 54.0 | yes |
| 81 | Viz A: goal ring vs track | `vizA-progress` green.700 #037952 | `viz-track` neutral.200 #e7ebf3 | 3:1, Lc 30 | 4.55 | 64.6 | yes |

#### DARK theme pairings

| # | Pairing | Foreground | Background | Rule | WCAG | APCA Lc | Pass |
|--:|---|---|---|---|--:|--:|:-:|
| 1 | Heading / numeral on page | `foreground-strong` neutral.50 #f9fafd | `background` navy.900 #0b1429 | 7:1, Lc 90 | 17.55 | -103.7 | yes |
| 2 | Heading / numeral on card | `foreground-strong` neutral.50 #f9fafd | `card` navy.850 #16213a | 7:1, Lc 90 | 15.33 | -102.2 | yes |
| 3 | Body text on page | `foreground` neutral.200 #e7ebf3 | `background` navy.900 #0b1429 | 7:1, Lc 90 | 15.33 | -93.8 | yes |
| 4 | Body text on card | `foreground` neutral.200 #e7ebf3 | `card` navy.850 #16213a | 7:1, Lc 90 | 13.39 | -92.3 | yes |
| 5 | Body text on sidebar | `foreground` neutral.200 #e7ebf3 | `sidebar` navy.950 #060c1d | 7:1, Lc 90 | 16.30 | -94.4 | yes |
| 6 | Body text on popover | `foreground` neutral.200 #e7ebf3 | `popover` navy.800 #202c47 | 7:1, Lc 75 | 11.62 | -90.3 | yes |
| 7 | Body text on chip (muted) | `foreground` neutral.200 #e7ebf3 | `muted` navy.750 #2a3755 | 7:1, Lc 75 | 9.90 | -87.5 | yes |
| 8 | Muted text on page | `muted-foreground` neutral.300 #cdd4e3 | `background` navy.900 #0b1429 | 4.5:1, Lc 75 | 12.32 | -79.4 | yes |
| 9 | Muted text on card | `muted-foreground` neutral.300 #cdd4e3 | `card` navy.850 #16213a | 4.5:1, Lc 75 | 10.76 | -77.9 | yes |
| 10 | Muted text on sidebar | `muted-foreground` neutral.300 #cdd4e3 | `sidebar` navy.950 #060c1d | 4.5:1, Lc 75 | 13.10 | -80.0 | yes |
| 11 | Muted text on popover | `muted-foreground` neutral.300 #cdd4e3 | `popover` navy.800 #202c47 | 4.5:1, Lc 60 | 9.34 | -75.9 | yes |
| 12 | Muted text on chip (muted) | `muted-foreground` neutral.300 #cdd4e3 | `muted` navy.750 #2a3755 | 4.5:1, Lc 60 | 7.95 | -73.1 | yes |
| 13 | Selected label on accent tint | `accent-foreground` blue.200 #c8dcff | `accent` navy.750 #2a3755 | 4.5:1, Lc 75 | 8.52 | -77.5 | yes |
| 14 | Selected border / brand icon vs card | `brand` blue.300 #a5c5ff | `card` navy.850 #16213a | 3:1, Lc 30 | 9.16 | -68.5 | yes |
| 15 | Selected border / brand icon vs page | `brand` blue.300 #a5c5ff | `background` navy.900 #0b1429 | 3:1, Lc 30 | 10.49 | -70.1 | yes |
| 16 | Link on page | `link` blue.200 #c8dcff | `background` navy.900 #0b1429 | 4.5:1, Lc 60 | 13.21 | -83.8 | yes |
| 17 | Link on card | `link` blue.200 #c8dcff | `card` navy.850 #16213a | 4.5:1, Lc 60 | 11.53 | -82.2 | yes |
| 18 | Hero text on hero | `hero-foreground` neutral.50 #f9fafd | `hero` blue.900 #1d3478 | 7:1, Lc 90 | 11.09 | -96.7 | yes |
| 19 | Hero secondary text on hero | `hero-muted-foreground` blue.100 #e1ecff | `hero` blue.900 #1d3478 | 4.5:1, Lc 75 | 9.72 | -87.0 | yes |
| 20 | Hero chip text on hero chip | `hero-foreground` neutral.50 #f9fafd | `hero-chip` mix #374f8b | 7:1, Lc 75 | 7.58 | -88.7 | yes |
| 21 | Hero hairline vs hero | `hero-border` blue.800 #153bb7 | `hero` blue.900 #1d3478 | report only | 1.29 | 0.0 | n/a |
| 22 | Primary (brand) button label on fill | `primary-foreground` navy.950 #060c1d | `primary` blue.200 #c8dcff | 4.5:1, Lc 75 | 14.04 | 84.4 | yes |
| 23 | Primary (brand) button label on hover fill | `primary-foreground` navy.950 #060c1d | `primary-hover` blue.100 #e1ecff | 4.5:1, Lc 75 | 16.37 | 93.9 | yes |
| 24 | text-primary on card (existing usages) | `primary` blue.200 #c8dcff | `card` navy.850 #16213a | 4.5:1, Lc 60 | 11.53 | -82.2 | yes |
| 25 | text-primary on page (existing usages) | `primary` blue.200 #c8dcff | `background` navy.900 #0b1429 | 4.5:1, Lc 60 | 13.21 | -83.8 | yes |
| 26 | B: CTA label on fill | `cta-foreground` navy.950 #060c1d | `cta` amber.300 #fed756 | 4.5:1, Lc 75 | 13.98 | 84.3 | yes |
| 27 | B: CTA label on hover fill | `cta-foreground` navy.950 #060c1d | `cta-hover` amber.200 #fee58f | 4.5:1, Lc 75 | 15.60 | 90.9 | yes |
| 28 | B: CTA label on pressed fill | `cta-foreground` navy.950 #060c1d | `cta-active` amber.400 #fec71d | 4.5:1, Lc 60 | 12.43 | 77.7 | yes |
| 29 | B: CTA fill vs hero (stand-out) | `cta` amber.300 #fed756 | `hero` blue.900 #1d3478 | 3:1, Lc 30 | 8.30 | -76.6 | yes |
| 30 | B: CTA hover fill vs hero | `cta-hover` amber.200 #fee58f | `hero` blue.900 #1d3478 | 3:1, Lc 30 | 9.27 | -83.8 | yes |
| 31 | B: CTA fill vs page (if placed on the page) | `cta` amber.300 #fed756 | `background` navy.900 #0b1429 | report only | 13.15 | -83.7 | n/a |
| 32 | B: CTA fill vs card (if placed on a card) | `cta` amber.300 #fed756 | `card` navy.850 #16213a | report only | 11.48 | -82.1 | n/a |
| 33 | B: CTA edge vs card (gives the 3:1 boundary) | `cta-edge` amber.600 #db8903 | `card` navy.850 #16213a | 3:1, Lc 30 | 5.78 | -46.5 | yes |
| 34 | B: CTA edge vs page | `cta-edge` amber.600 #db8903 | `background` navy.900 #0b1429 | 3:1, Lc 30 | 6.62 | -48.0 | yes |
| 35 | A: CTA label on fill | `ctaA-foreground` navy.950 #060c1d | `ctaA` blue.200 #c8dcff | 4.5:1, Lc 75 | 14.04 | 84.4 | yes |
| 36 | A: CTA label on hover fill | `ctaA-foreground` navy.950 #060c1d | `ctaA-hover` blue.100 #e1ecff | 4.5:1, Lc 75 | 16.37 | 93.9 | yes |
| 37 | A: CTA label on pressed fill | `ctaA-foreground` navy.950 #060c1d | `ctaA-active` blue.300 #a5c5ff | 4.5:1, Lc 60 | 11.16 | 71.7 | yes |
| 38 | A: CTA fill vs soft hero (stand-out) | `ctaA` blue.200 #c8dcff | `hero-soft` navy.800 #202c47 | report only | 10.01 | -80.3 | n/a |
| 39 | A: CTA fill vs card (stand-out) | `ctaA` blue.200 #c8dcff | `card` navy.850 #16213a | report only | 11.53 | -82.2 | n/a |
| 40 | A: CTA fill vs bold hero (fails in light, works in dark) | `ctaA` blue.200 #c8dcff | `hero` blue.900 #1d3478 | report only | 8.34 | -76.7 | n/a |
| 41 | A: heading / numeral on soft hero | `foreground-strong` neutral.50 #f9fafd | `hero-soft` navy.800 #202c47 | 7:1, Lc 90 | 13.30 | -100.2 | yes |
| 42 | A: body text on soft hero | `foreground` neutral.200 #e7ebf3 | `hero-soft` navy.800 #202c47 | 7:1, Lc 75 | 11.62 | -90.3 | yes |
| 43 | A: muted text on soft hero | `muted-foreground` neutral.300 #cdd4e3 | `hero-soft` navy.800 #202c47 | 4.5:1, Lc 60 | 9.34 | -75.9 | yes |
| 44 | Focus ring vs page | `ring` blue.300 #a5c5ff | `background` navy.900 #0b1429 | 3:1, Lc 30 | 10.49 | -70.1 | yes |
| 45 | Focus ring vs card | `ring` blue.300 #a5c5ff | `card` navy.850 #16213a | 3:1, Lc 30 | 9.16 | -68.5 | yes |
| 46 | Focus ring vs sidebar | `ring` blue.300 #a5c5ff | `sidebar` navy.950 #060c1d | 3:1, Lc 30 | 11.16 | -70.7 | yes |
| 47 | Focus ring on hero vs hero | `hero-ring` neutral.50 #f9fafd | `hero` blue.900 #1d3478 | 3:1, Lc 30 | 11.09 | -96.7 | yes |
| 48 | A: focus ring vs soft hero | `ring` blue.300 #a5c5ff | `hero-soft` navy.800 #202c47 | 3:1, Lc 30 | 7.95 | -66.6 | yes |
| 49 | Control border (border-strong) vs card | `border-strong` neutral.600 #7c869b | `card` navy.850 #16213a | 3:1, Lc 30 | 4.37 | -35.1 | yes |
| 50 | Control border (border-strong) vs page | `border-strong` neutral.600 #7c869b | `background` navy.900 #0b1429 | 3:1, Lc 30 | 5.01 | -36.6 | yes |
| 51 | Control border (border-strong) vs popover | `border-strong` neutral.600 #7c869b | `popover` navy.800 #202c47 | 3:1, Lc 30 | 3.79 | -33.1 | yes |
| 52 | Hairline (border) vs card | `border` navy.700 #394767 | `card` navy.850 #16213a | report only | 1.73 | -8.6 | n/a |
| 53 | Hairline (border) vs page | `border` navy.700 #394767 | `background` navy.900 #0b1429 | report only | 1.98 | -10.2 | n/a |
| 54 | Surface: card vs page | `card` navy.850 #16213a | `background` navy.900 #0b1429 | report only | 1.15 | 0.0 | n/a |
| 55 | Surface: sidebar vs page | `sidebar` navy.950 #060c1d | `background` navy.900 #0b1429 | report only | 1.06 | 0.0 | n/a |
| 56 | Surface: chip (muted) vs card | `muted` navy.750 #2a3755 | `card` navy.850 #16213a | report only | 1.35 | 0.0 | n/a |
| 57 | Surface: hero vs page | `hero` blue.900 #1d3478 | `background` navy.900 #0b1429 | report only | 1.58 | 0.0 | n/a |
| 58 | Surface: soft hero vs page | `hero-soft` navy.800 #202c47 | `background` navy.900 #0b1429 | report only | 1.32 | 0.0 | n/a |
| 59 | Success text on card | `success` green.300 #85e9b6 | `card` navy.850 #16213a | 4.5:1, Lc 60 | 10.91 | -79.0 | yes |
| 60 | Success text on page | `success` green.300 #85e9b6 | `background` navy.900 #0b1429 | 4.5:1, Lc 60 | 12.50 | -80.5 | yes |
| 61 | Success container text | `success-container-foreground` green.200 #b5f4d1 | `success-container` green.950 #022f20 | 4.5:1, Lc 75 | 11.77 | -88.0 | yes |
| 62 | Warning text on card | `warning` orange.300 #ffbf87 | `card` navy.850 #16213a | 4.5:1, Lc 60 | 9.94 | -73.3 | yes |
| 63 | Warning text on page | `warning` orange.300 #ffbf87 | `background` navy.900 #0b1429 | 4.5:1, Lc 60 | 11.39 | -74.9 | yes |
| 64 | Warning container text | `warning-container-foreground` orange.200 #ffdab7 | `warning-container` orange.950 #421d09 | 4.5:1, Lc 75 | 11.31 | -84.6 | yes |
| 65 | Danger text on card | `destructive` red.300 #ffaaa8 | `card` navy.850 #16213a | 4.5:1, Lc 60 | 8.81 | -66.5 | yes |
| 66 | Danger text on page | `destructive` red.300 #ffaaa8 | `background` navy.900 #0b1429 | 4.5:1, Lc 60 | 10.09 | -68.1 | yes |
| 67 | Danger button label on fill | `destructive-foreground` navy.950 #060c1d | `destructive` red.300 #ffaaa8 | 4.5:1, Lc 60 | 10.73 | 69.8 | yes |
| 68 | Danger container text | `destructive-container-foreground` red.200 #ffcfce | `destructive-container` red.950 #48100d | 4.5:1, Lc 75 | 11.12 | -81.1 | yes |
| 69 | Streak flame icon vs card | `streak` orange.400 #ff9b4e | `card` navy.850 #16213a | 3:1, Lc 30 | 7.66 | -59.3 | yes |
| 70 | Streak flame icon vs page | `streak` orange.400 #ff9b4e | `background` navy.900 #0b1429 | 3:1, Lc 30 | 8.77 | -60.9 | yes |
| 71 | Viz: mastered vs learning (adjacent) | `viz-mastered` blue.100 #e1ecff | `viz-learning` blue.500 #437bf3 | 3:1, Lc 30 | 3.29 | -58.7 | yes |
| 72 | Viz: learning vs not started (adjacent) | `viz-learning` blue.500 #437bf3 | `viz-new` navy.800 #202c47 | 3:1, Lc 30 | 3.55 | -31.1 | yes |
| 73 | Viz: mastered vs card | `viz-mastered` blue.100 #e1ecff | `card` navy.850 #16213a | 3:1, Lc 30 | 13.44 | -92.5 | yes |
| 74 | Viz: learning vs card | `viz-learning` blue.500 #437bf3 | `card` navy.850 #16213a | 3:1, Lc 30 | 4.09 | -33.1 | yes |
| 75 | Viz: not started / track vs card | `viz-new` navy.800 #202c47 | `card` navy.850 #16213a | report only | 1.15 | 0.0 | n/a |
| 76 | Viz: goal ring vs track | `viz-progress` blue.400 #77a6ff | `viz-track` navy.800 #202c47 | 3:1, Lc 30 | 5.74 | -50.2 | yes |
| 77 | Viz: goal ring vs card | `viz-progress` blue.400 #77a6ff | `card` navy.850 #16213a | 3:1, Lc 30 | 6.61 | -52.1 | yes |
| 78 | Viz: check mark on filled day | `viz-on-progress` navy.950 #060c1d | `viz-progress` blue.400 #77a6ff | 3:1, Lc 30 | 8.05 | 56.1 | yes |
| 79 | Viz A: mastered vs learning (adjacent) | `vizA-mastered` green.100 #d7fae6 | `vizA-learning` green.600 #019362 | 3:1, Lc 30 | 3.50 | -62.8 | yes |
| 80 | Viz A: learning vs not started (adjacent) | `vizA-learning` green.600 #019362 | `viz-new` navy.800 #202c47 | 3:1, Lc 30 | 3.54 | -31.2 | yes |
| 81 | Viz A: goal ring vs track | `vizA-progress` green.400 #4ed799 | `viz-track` navy.800 #202c47 | 3:1, Lc 30 | 7.61 | -64.4 | yes |

### 5.3 What font sizes these contrasts allow (generated by `decision.mjs`)

fontLookupAPCA(Lc) from apca-w3 returns the minimum px size per weight. 999 = too low to use; 777 = non-text only.

| Text role | Theme | Surface | Lc | min px @400 | @500 | @600 | @700 |
|---|---|---|--:|--:|--:|--:|--:|
| CURRENT muted-foreground | light | card | 81.1 | 17.25 | 15.81 | 14.81 | 14 |
| CURRENT muted-foreground | light | Today panel | 75.5 | 18 | 16 | 15 | 14 |
| CURRENT muted-foreground | light | chip / trend tile | 73.8 | 18.5 | 16.5 | 15.5 | 14.5 |
| CURRENT muted-foreground | dark | card | -45.0 | 42 | 32 | 28 | 24 |
| CURRENT muted-foreground | dark | Today panel / chip | -42.7 | 50 | 39 | 35 | 28 |
| CURRENT CTA label | dark | sky blue fill | 50.3 | 32 | 28 | 24 | 21 |
| foreground | light | card | 97.9 | 15.5 | 15 | 14 | 13.5 |
| foreground | light | page | 90.8 | 16 | 15.5 | 14.5 | 14 |
| muted-foreground | light | card | 83.5 | 16.75 | 15.81 | 14.81 | 14 |
| muted-foreground | light | page | 76.4 | 18 | 16 | 15 | 14 |
| muted-foreground | light | chip | 71.5 | 19.5 | 17.5 | 16 | 14.5 |
| hero-muted-foreground | light | hero | -80.6 | 17.25 | 15.81 | 14.81 | 14 |
| link | light | card | 82.4 | 17.25 | 15.81 | 14.81 | 14 |
| success | light | card | 76.6 | 18 | 16 | 15 | 14 |
| warning | light | card | 77.1 | 18 | 16 | 15 | 14 |
| destructive | light | card | 79.7 | 17.5 | 16 | 15 | 14 |
| B CTA label | light | amber fill | 76.9 | 18 | 16 | 15 | 14 |
| A CTA label | light | blue fill | -87.5 | 16.5 | 15.625 | 14.625 | 14 |
| foreground | dark | card | -92.3 | 16 | 15.5 | 14.5 | 14 |
| foreground | dark | page | -93.8 | 16 | 15.5 | 14.5 | 14 |
| muted-foreground | dark | card | -77.9 | 18 | 16 | 15 | 14 |
| muted-foreground | dark | page | -79.4 | 17.5 | 16 | 15 | 14 |
| muted-foreground | dark | chip | -73.1 | 19 | 17 | 15.5 | 14.5 |
| hero-muted-foreground | dark | hero | -87.0 | 16.5 | 15.625 | 14.625 | 14 |
| link | dark | card | -82.2 | 17.25 | 15.81 | 14.81 | 14 |
| success | dark | card | -79.0 | 17.5 | 16 | 15 | 14 |
| warning | dark | card | -73.3 | 19 | 17 | 15.5 | 14.5 |
| destructive | dark | card | -66.5 | 21.25 | 19 | 17 | 15 |
| B CTA label | dark | amber fill | 84.3 | 16.75 | 15.81 | 14.81 | 14 |
| A CTA label | dark | blue fill | 84.4 | 16.75 | 15.81 | 14.81 | 14 |

How to use this table. The lookup function is strict. APCA's summary page is a little more lenient for short non-body labels: it allows 12px regular at Lc 90 and 15px regular at Lc 75 [S11]. Both sources agree on the direction:

- **Muted text (Lc 72 to 84) is not for 12px.** Use it from 15 to 16px regular, or 14px semibold and up.
- **If text must be 12 to 13px, give it `--foreground`** (Lc 90 or more), not `--muted-foreground`. Small and gray at once is the combination that disappears.
- **Button labels: 16px at weight 600 or more.** Every call to action label here is Lc 76.9 or higher, which allows 16px medium.
- **Dark status words** (danger at Lc -66.5, warning at Lc -73) need 16 to 17px semibold, or an icon and bold text.
- The current dark muted text would need 42px. No font size fix is possible there. The token has to change.

### 5.4 Color-vision simulation (generated by `decision.mjs`)

WCAG ratio and OKLab distance (dE) between each pair, for normal vision and three simulated deficiencies.

| Pair | Theme | Normal ratio / dE | Protan | Deutan | Tritan |
|---|---|--:|--:|--:|--:|
| B: CTA fill vs bold hero | light | 9.18 / 0.628 | 7.88 / 0.585 | 10.00 / 0.653 | 9.03 / 0.618 |
| A: CTA fill vs card | light | 6.83 / 0.567 | 6.05 / 0.542 | 7.35 / 0.582 | 7.00 / 0.551 |
| Success text vs danger text | light | 1.17 / 0.283 | 2.47 / 0.220 | 1.24 / 0.083 | 1.08 / 0.332 |
| Success text vs warning text | light | 1.02 / 0.209 | 1.34 / 0.088 | 1.31 / 0.121 | 1.05 / 0.282 |
| Warning text vs danger text | light | 1.14 / 0.086 | 1.84 / 0.165 | 1.62 / 0.120 | 1.03 / 0.051 |
| Streak orange vs CTA amber | light | 2.49 / 0.265 | 3.34 / 0.319 | 2.74 / 0.282 | 2.05 / 0.205 |
| Viz mastered vs learning | light | 3.68 / 0.330 | 3.88 / 0.342 | 3.45 / 0.321 | 3.83 / 0.326 |
| Viz learning vs not started | light | 3.28 / 0.375 | 2.99 / 0.352 | 3.56 / 0.393 | 3.13 / 0.347 |
| Link vs body text | light | 1.79 / 0.253 | 1.97 / 0.265 | 1.69 / 0.247 | 1.73 / 0.142 |
| B: CTA fill vs bold hero | dark | 8.30 / 0.603 | 7.25 / 0.567 | 9.02 / 0.625 | 8.06 / 0.578 |
| A: CTA fill vs card | dark | 11.53 / 0.639 | 11.62 / 0.642 | 11.48 / 0.639 | 11.54 / 0.639 |
| Success text vs danger text | dark | 1.24 / 0.210 | 1.47 / 0.120 | 1.10 / 0.030 | 1.21 / 0.244 |
| Success text vs warning text | dark | 1.10 / 0.169 | 1.26 / 0.078 | 1.05 / 0.069 | 1.09 / 0.228 |
| Warning text vs danger text | dark | 1.13 / 0.078 | 1.17 / 0.078 | 1.15 / 0.069 | 1.11 / 0.034 |
| Streak orange vs CTA amber | dark | 1.50 / 0.145 | 1.72 / 0.162 | 1.53 / 0.132 | 1.38 / 0.118 |
| Viz mastered vs learning | dark | 3.29 / 0.368 | 3.02 / 0.349 | 3.55 / 0.385 | 3.15 / 0.344 |
| Viz learning vs not started | dark | 3.55 / 0.342 | 3.81 / 0.358 | 3.31 / 0.332 | 3.68 / 0.316 |
| Link vs body text | dark | 1.16 / 0.064 | 1.14 / 0.057 | 1.18 / 0.067 | 1.15 / 0.059 |

Simulated colors (hex) of the three status text colors:
  light success      normal #037952 L=0.51 | protan #6f6850 L=0.52 | deutan #575655 L=0.45 | tritan #007c6d L=0.52
  light warning      normal #a94e00 L=0.53 | protan #6c5100 L=0.45 | deutan #816401 L=0.52 | tritan #ce3b37 L=0.57
  light destructive  normal #bc1a18 L=0.51 | protan #332c17 L=0.30 | deutan #564716 L=0.40 | tritan #e60d1a L=0.58
  dark success      normal #85e9b6 L=0.86 | protan #e4d8b4 L=0.88 | deutan #d0cbb9 L=0.84 | tritan #75e9d9 L=0.86
  dark warning      normal #ffbf87 L=0.85 | protan #d4c184 L=0.81 | deutan #e3ce88 L=0.85 | tritan #ffb2ae L=0.86
  dark destructive  normal #ffaaa8 L=0.82 | protan #b7b4a8 L=0.77 | deutan #cac2a7 L=0.81 | tritan #ffa3aa L=0.83

Reading it:

- **Success vs danger.** OKLab distance 0.283 for normal vision in light, 0.083 under deutan simulation. In dark, 0.210 falls to 0.030. They become the same olive. Their WCAG ratio to each other is about 1.2:1 at best, so lightness cannot separate them either. Icon and word are mandatory.
- **Warning vs danger** are close even for normal vision (0.086 light, 0.078 dark). Dark orange and dark red are neighbors inside sRGB (`warn.mjs` shows the limit). Same rule.
- **The warm call to action on the hero** stays between 7.25:1 and 10.0:1 in every simulation.
- **Bar segments** stay at or above 2.99:1 in every simulation. They are separated by lightness.
- **Links** differ from body text by 1.46 to 1.79:1 only. Links inside text must be underlined [S10].

Limits: this is a mathematical simulation at full severity. It is not a test with people who have a color-vision deficiency.

### 5.5 One color, many faces (generated by `decision.mjs`)

| Same color | Placed on | WCAG vs that surface | APCA Lc |
|---|---|--:|--:|
| brand blue #1447e6 (blue.700) | white card | 6.83 | 82.4 |
| brand blue #1447e6 (blue.700) | soft tint blue.100 | 5.74 | 70.6 |
| brand blue #1447e6 (blue.700) | dark card navy.850 | 2.34 | -17.1 |
| brand blue #1447e6 (blue.700) | bold hero blue.900 | 1.69 | -11.6 |
| amber.400 CTA fill | white card | 1.57 | 25.7 |
| amber.400 CTA fill | light page neutral.100 | 1.41 | 18.5 |
| amber.400 CTA fill | bold hero blue.950 | 9.18 | -73.3 |
| amber.400 CTA fill | dark page navy.900 | 11.69 | -76.6 |
| light muted text neutral.700 | white card | 6.82 | 83.5 |
| light muted text neutral.700 | page neutral.100 | 6.14 | 76.4 |
| light muted text neutral.700 | chip neutral.200 | 5.71 | 71.5 |
| light muted text neutral.700 | soft tint blue.100 | 5.73 | 71.8 |
| light muted text neutral.700 | success container green.100 | 6.07 | 75.6 |
| light muted text neutral.700 | warning container orange.100 | 5.97 | 74.5 |
| chip fill neutral.200 | white card | 1.19 | 9.5 |
| chip fill neutral.200 | page neutral.100 | 1.08 | 0.0 |
| chip fill neutral.200 | soft tint blue.100 | 1.00 | 0.0 |
| mid gray border neutral.600 | white card | 3.66 | 64.2 |
| mid gray border neutral.600 | dark card navy.850 | 4.37 | -35.1 |
| mid gray border neutral.600 | bold hero blue.950 | 3.93 | -33.4 |

| Tint | Over surface | Resulting hex | Text on it | WCAG | Lc |
|---|---|---|---|--:|--:|
| light success at 12% | card | #e1efea | success text | 4.59 | 65.2 |
| light success at 12% | background | #d4e5e5 | success text | 4.18 | 59.2 |
| light success at 12% | muted | #ccdee0 | success text | 3.91 | 55.2 |
| light destructive at 12% | card | #f7e3e3 | destructive text | 5.17 | 65.7 |
| light destructive at 12% | background | #ead9de | destructive text | 4.69 | 59.8 |
| light destructive at 12% | muted | #e2d2d9 | destructive text | 4.38 | 55.8 |
| dark success at 12% | card | #243948 | success text | 8.17 | -74.4 |
| dark success at 12% | background | #1a2d3a | success text | 9.68 | -77.3 |
| dark success at 12% | muted | #354c60 | success text | 6.09 | -68.3 |
| dark destructive at 12% | card | #323147 | destructive text | 6.94 | -63.0 |
| dark destructive at 12% | background | #282638 | destructive text | 8.12 | -65.5 |
| dark destructive at 12% | muted | #44455f | destructive text | 5.11 | -56.8 |

The second table is the reason for container roles. A 12% tint of the status color with text in the same status color gives 4.59:1 on a card, 4.18:1 on the page and 3.91:1 on a chip. Same two tokens, three results, two of them failures. The existing comment at globals.css:87 already warns about this. `--success-container` with `--success-container-foreground` measures 9.34:1 in light and 11.77:1 in dark wherever it is placed.

### 5.6 Surface steps, current vs proposed (generated by `decision.mjs`)

| Theme | Step | Current L (delta) | Proposed L (delta) |
|---|---|---|---|
| light | page -> card | 0.985 -> 1 (0.015) | 0.965 -> 1 (0.035) |
| light | page -> hero panel | 0.985 -> 0.971 (0.014) | 0.965 -> 0.29 (0.675) |
| light | card -> chip | 1 -> 0.962 (0.038) | 1 -> 0.94 (0.060) |
| light | page -> sidebar | 0.985 -> 0.962 | 0.965 -> 0.985 (0.020) |
| dark | page -> card | 0.175 -> 0.236 (0.061) | 0.195 -> 0.25 (0.055) |
| dark | page -> hero panel | 0.175 -> 0.291 (0.116) | 0.195 -> 0.35 (0.155) |
| dark | card -> chip | 0.236 -> 0.291 (0.055) | 0.25 -> 0.34 (0.090) |
| dark | page -> sidebar | 0.175 -> 0.236 | 0.195 -> 0.16 (0.035) |

Honest note: the dark page-to-card step is about the same as today (0.055 vs 0.061). The dark theme gains its structure from chroma, from a visible hairline (`--border` 1.73:1 on the card, up from 1.35:1), from a bigger chip step and from the hero.

## 6. Tailwind v4 implementation sketch

### 6.1 File structure

`globals.css` keeps its imports and gets three blocks in this order. The complete generated file is at
`scratch/color/proposed-tokens.css` and is reproduced in Appendix A.

```css
@import "tailwindcss";
@import "tw-animate-css";
@import "shadcn/tailwind.css";
@import "@fontsource-variable/inter";

@custom-variant dark (&:where(.dark, .dark *));

/* Tier 1: primitives. Plain custom properties, NOT in @theme. */
:root {
  --neutral-0: oklch(1 0 0);
  --blue-700: oklch(0.488 0.243 264.376);
  --amber-400: oklch(0.855 0.17 88);
  /* ... 73 in total ... */
}

/* Tier 2: roles. One block per theme. */
:root {
  color-scheme: light;
  --background: var(--neutral-100);
  --hero: var(--blue-950);
  --cta: var(--amber-400);
  /* ... */
}
.dark {
  color-scheme: dark;
  --background: var(--navy-900);
  --hero: var(--blue-900);
  --cta: var(--amber-300);
  /* ... */
}

/* Tier 3: tell Tailwind which roles become utilities. */
@theme inline {
  --color-background: var(--background);
  --color-hero: var(--hero);
  --color-cta: var(--cta);
  /* ... */
}
```

Why it is shaped this way:

- **`@theme` creates utilities, `:root` does not** [S13]. Primitives live in `:root` only, so there is no `bg-blue-700` for the proposed ramps and components can only reach roles. That is how the tiers are enforced.
- **`@theme inline` is required** when a theme variable points at another variable. Without `inline` the utility resolves the variable where the theme is defined, not where the class is used, so `.dark` overrides would not apply [S13]. The current file already does this (globals.css:11).
- **Fix the variant selector.** The file has `@custom-variant dark (&:is(.dark *));` (globals.css:6). Tailwind's documented form is `(&:where(.dark, .dark *))` [S14]. The current form does not match the element that carries `.dark` itself, and `:is()` adds specificity where `:where()` adds none.
- **Optional hard lock.** `--color-*: initial;` inside `@theme` removes Tailwind's default palette [S13], so `bg-slate-200` stops existing. Only 7 default-palette classes are used today (`plan-badge.tsx`, `dev-previews-menu.tsx`), so this is cheap. Test `shadcn/tailwind.css` and `tw-animate-css` after doing it. I did not test that.
- **Tailwind v4's own palette is already OKLCH** [S13], so nothing new is being introduced technically.

### 6.2 color-scheme

Add `color-scheme: light` to `:root` and `color-scheme: dark` to `.dark`. This tells the browser to draw its own parts (scrollbars, form controls, the canvas, spellcheck underlines) in the matching scheme [S16]. Today neither block sets it, so a dark page can show light scrollbars and light native controls.

### 6.3 light-dark(): consider it, do not adopt it yet

`light-dark(a, b)` returns the first value in a light scheme and the second in a dark one. It needs `color-scheme` to be set [S15]. It would let each role be one line:

```css
:root { color-scheme: light dark; --background: light-dark(var(--neutral-100), var(--navy-900)); }
.light { color-scheme: light; }
.dark  { color-scheme: dark; }
```

For: one line per role, so a dark value cannot be forgotten, and "system" works with no class at all. Against: MDN lists it as Baseline 2024, working across current browsers since May 2024 [S15], so older browsers get no color unless a fallback is written first. shadcn's generator and docs assume a `.dark { }` block. Tailwind's `dark:` variant still needs the class. Recommendation: keep the two blocks now. Revisit when the project sets a browser support floor.

### 6.4 No flash of the wrong theme, and the browser chrome

- `theme-provider.tsx` applies the class inside a React effect, and `apps/web/index.html` has no script in `<head>`. A person who chose dark sees a light flash on load. Tailwind's docs recommend setting the class from an inline script in `<head>` [S14]. The storage key is `"theme"` (theme-provider.tsx:7) with the values `dark`, `light` and `system`.
- The only theme control today is the `d` key (theme-provider.tsx:145). A visible control is needed. That is owned by the UX track.
- `<meta name="theme-color">` colors the browser UI around the page on browsers that support it, and it accepts a `media` attribute [S18]. MDN marks it as limited availability [S18]. Because this app has a manual toggle, set it from the same place the class is applied: `#f1f3f9` for light, `#0b1429` for dark (the two `--background` values).

### 6.5 Focus ring

```css
@layer base {
  :focus-visible { outline: 2px solid var(--ring); outline-offset: 2px; }
  .on-hero :focus-visible { outline-color: var(--hero-ring); }
}
```

Solid, 2px, with a 2px gap so the ring never touches the control's own color. Measured: 6.16 to 6.83:1 on light surfaces, 9.16 to 11.16:1 on dark surfaces, 11.09 to 13.78:1 on the hero. The current base rule `outline-ring/50` (globals.css:151) should lose the `/50`.

### 6.6 P3

- All 73 primitives are inside sRGB. Nothing needs a fallback.
- Would P3 help? I tested four candidates (`decision.mjs`, section 6 of its output). Raising amber.400 from C 0.17 to 0.19 is outside sRGB and inside P3. Its luminance barely moves (Y 0.6055 to 0.6039), so contrast numbers hold. The gain is a slightly richer yellow on P3 screens only.
- Recommendation: ship sRGB only. If the owner later wants extra punch on the call to action or the flame, add it the way Evil Martians describe [S1]:

```css
@media (color-gamut: p3) {
  :root { --amber-400: oklch(0.855 0.19 88); }
}
```

Do not put a P3 value in the base declaration. Chrome and Safari clip instead of mapping, which can shift hue [S1].

### 6.7 prefers-contrast and forced colors

`prefers-contrast: more` reports that the person asked the operating system for higher contrast. It has been available across browsers since May 2022 [S17].

```css
@media (prefers-contrast: more) {
  :root, .dark {
    --muted-foreground: var(--foreground);
    --border: var(--neutral-600);
    --border-strong: var(--foreground);
    --input: var(--foreground);
    --ring: var(--foreground-strong);
  }
}
```

Measured effect (generated by `decision.mjs`):

| Override | Theme | WCAG | Lc |
|---|---|--:|--:|
| muted-foreground := foreground, on card | light | 12.25 | 97.9 |
| muted-foreground := foreground, on chip | light | 10.25 | 85.9 |
| border := border-strong, vs card | light | 3.66 | 64.2 |
| border-strong := foreground, vs card | light | 12.25 | 97.9 |
| ring := foreground-strong, vs card | light | 18.16 | 104.8 |
| muted-foreground := foreground, on card | dark | 13.39 | -92.3 |
| muted-foreground := foreground, on chip | dark | 9.90 | -87.5 |
| border := border-strong, vs card | dark | 4.37 | -35.1 |
| border-strong := foreground, vs card | dark | 13.39 | -92.3 |
| ring := foreground-strong, vs card | dark | 15.33 | -102.2 |

Point `--border` at the primitive, not at `var(--border-strong)`. Custom properties resolve late, so it would pick up the overridden value.

Forced colors (Windows High Contrast): backgrounds are replaced by system colors. The button base class already has `border border-transparent` (button.tsx:8), and a transparent border becomes visible in forced-colors mode, so the call to action keeps a shape. Keep that border on the new `cta` variant. I did not test forced colors in a browser.

## 7. Practical color rules for this dashboard

### 7.1 Sixty, thirty, ten

The 60-30-10 split is a rule of thumb from interior decorating: about 60% dominant color, 30% secondary, 10% accent. I found no authoritative origin for it, only design blogs [S25]. It is a sanity check, not a standard. Applied here:

| Share | Role | Light | Dark |
|---|---|---|---|
| About 60% | Neutral ground | Page, sidebar, cards | Navy page, sidebar, cards |
| About 30% | Brand structure | The navy hero, blue data marks, the selected tint, links | The brighter navy hero, blue data marks |
| About 10% or less | Accent | The amber button. The flame | The same |

The check to run on a screenshot: squint. If more than one amber shape is visible, something is wrong.

### 7.2 One color, one meaning

| Color | Means | Never used for |
|---|---|---|
| Amber fill (`--cta`) | The one thing to do next on this screen | A second button, badges, highlights, charts, warnings |
| Blue (`--brand`, `--link`, `--primary`, `--viz-*`) | Memli, "you are here", links, your progress | The main call to action (under option B) |
| Orange (`--streak`, `--warning`) | Streak. Caution | Buttons |
| Green (`--success`) | Correct. Goal met | Decoration. "Mastered" stays blue so green keeps meaning "right answer" |
| Red (`--destructive`) | Wrong. Delete | Anything else |
| Neutral | Everything else | |

Refactoring UI's version of this is to give a screen one primary action and make secondary and tertiary actions visibly quieter [S23]. Material describes Primary as the role for the most important actions [S5].

Under option B, amber and orange are both warm. Keep them apart by form: amber is always a filled button with ink text. Orange is always a small icon or a word. The simulation in Section 5.4 puts them at OKLab distance 0.265 in light and 0.145 in dark. That is distinguishable, but closer in dark, so the form rule matters.

### 7.3 Tinted panels change what sits inside them

- **Every colored surface gets its own content tokens.** Hero: `--hero-foreground`, `--hero-muted-foreground`, `--hero-chip`, `--hero-ring`. Do not use `--muted-foreground` or `bg-card` chips on the hero.
- **Do not use gray text on a colored surface.** Use a light tint of the surface's own hue. That is why `--hero-muted-foreground` is blue.200 or blue.100, not neutral. This is Refactoring UI's "don't use grey text on colored backgrounds" [S23] and Albers' subtraction effect [S22].
- **No alpha tints for anything that carries text.** Use container roles (Section 5.5).
- **A chip must be re-checked on each surface it can appear on.** `--muted` chips work on cards only (1.19:1 light, 1.35:1 dark). On the page use a card-colored chip with a hairline.
- **Blue on blue is the weakest pairing in the system.** Do not place brand-blue icons or marks on the hero. Use `--hero-foreground` there.
- **Never put two saturated colors edge to edge** without a neutral or a clear lightness gap between them [S22].

### 7.4 Status colors

- Always icon plus word plus color [S8][S10]. "Goal met" with a check. "7 words keep slipping" with a caution icon.
- Use the text roles only at 16px semibold or larger, or beside an icon (Section 5.3).
- For a status panel, use the container pair. Never tint by alpha.
- Week dots: met is a filled dot with a check. Today is a ring. Missed is an empty dot with a dash or a cross. Upcoming is a dashed outline. Each state has a shape, so the row reads in grayscale. Today "missed" is a dot filled with `--muted` and "upcoming" is a dashed outline at 40% alpha (ThisWeek.tsx:101, :103). Both are faint.

### 7.5 Data-viz and legend rules

- **Order by lightness.** Mastered is furthest from the track, learning is in between, not started is the track. The order flips between themes. The tokens already do that.
- **Put a 2px gap in the card color between segments.** Then even a 5% segment has a clean edge, and adjacent contrast (3.28 to 3.68:1) is a bonus, not the only cue.
- **Legend order equals bar order**, left to right, start to end in the reading direction. In a right-to-left locale both flip together.
- **Legend swatches are at least 12px**, with the number and the word next to each: "52 mastered". Text in `--foreground`, not muted, if it is under 15px.
- **Prefer direct labels** when there is room. A legend is a lookup. A label is not.
- **The goal ring** uses `--viz-progress` on `--viz-track` (5.72:1 light, 5.74:1 dark). The number in the middle carries the value, so the ring is support, not the only source [S9].
- **Do not encode anything in hue alone.** Per-language colors (Spanish green, Japanese blue, French purple, as in example-02's deck bars) would add three more meanings to color. Use the language badge text instead.

### 7.6 Depth for the main button

The owner's rule is a solid primary button with depth. With tokens: fill `--cta`, a 3px bottom edge in `--cta-edge`, hover `--cta-hover` (one step lighter, so it seems to rise), pressed `--cta-active` plus a 1px downward shift (the base class already has `active:translate-y-px`, button.tsx:8). The edge color is what gives the yellow a 3:1 boundary if the button ever sits on a light surface: 4.47:1 on a card and 4.03:1 on the page. Refactoring UI's guidance on emulating a light source (lighter top, darker bottom) is the basis [S23].

## 8. The decision the owner must make

**Keep blue as the action color, or give the single primary action a warm accent?**

Both are fully specified and verified. The tokens are built so the choice is five lines per theme (`--cta` and its four companions) and can be reversed.

### 8.1 The numbers (generated by `decision.mjs`)

"Fill vs" columns are WCAG ratios between the button fill and what surrounds it. Higher means the button separates more from its ground. They are not pass or fail figures, because a labelled button needs no boundary contrast [S9].

| Theme | Option | Fill | Label | Label WCAG | Label Lc | Fill vs card | Fill vs page | Fill vs hero used with it |
|---|---|---|---|--:|--:|--:|--:|--:|
| light | Current (blue, 126px wide) | #1447e6 | #ffffff | 6.83 | -87.5 | 6.83 | 6.55 | 6.30 (current pale tint #f1f6ff) |
| light | A: blue.700 + white | #1447e6 | #ffffff | 6.83 | -87.5 | 6.83 | 6.16 | 5.74 (soft hero blue.100 #e1ecff) |
| light | A3: white + blue.800 label on bold hero | #ffffff | #153bb7 | 8.97 | 89.6 | 1.00 | 1.11 | 14.39 (bold hero blue.950 #14255f) |
| light | B: amber.400 + ink | #fec71d | #0d1529 | 11.59 | 76.9 | 1.57 | 1.41 | 9.18 (bold hero blue.950 #14255f) |
| light | C: orange.600 + white (example-04 style) | #d75b01 | #ffffff | 3.90 | -71.1 | 3.90 | 3.51 | 3.28 (soft hero blue.100 #e1ecff) |
| light | C2: orange.500 + ink | #f37513 | #0d1529 | 6.37 | 48.9 | 2.85 | 2.57 | 5.05 (bold hero blue.950 #14255f) |
| dark | Current (sky blue + near-black label) | #6a99ff | #0a111b | 6.87 | 50.3 | 6.05 | 6.87 | 5.09 (current panel #252c38) |
| dark | A1: blue.700 + near-white (saturated) | #1447e6 | #f9fafd | 6.55 | -84.2 | 2.34 | 2.68 | 2.03 (soft hero navy.800 #202c47) |
| dark | A2: blue.200 + ink (pale, the verified A) | #c8dcff | #060c1d | 14.04 | 84.4 | 11.53 | 13.21 | 10.01 (soft hero navy.800 #202c47) |
| dark | A3: blue.100 + blue.950 label on bold hero | #e1ecff | #14255f | 12.09 | 89.1 | 13.44 | 15.39 | 9.72 (bold hero blue.900 #1d3478) |
| dark | B: amber.300 + ink | #fed756 | #060c1d | 13.98 | 84.3 | 11.48 | 13.15 | 8.30 (bold hero blue.900 #1d3478) |
| dark | C: orange.600 + white | #d75b01 | #ffffff | 3.90 | -71.1 | 4.10 | 4.70 | 3.56 (soft hero navy.800 #202c47) |
| dark | C2: orange.400 + ink | #ff9b4e | #060c1d | 9.32 | 63.0 | 7.66 | 8.77 | 5.54 (bold hero blue.900 #1d3478) |

### 8.2 Option A: blue

What it is. Light: `blue.700` fill, white label, on a pale blue hero (`--hero-soft`, blue.100) or a white card. Dark: `blue.200` fill, navy label.

For:
- Brand continuity. The marketing pages, sign-in and the study session already use blue for emphasis (23 occurrences of `bg-primary`, `text-primary` and similar utilities in `apps/web/src`).
- Strong in light mode: 6.83:1 label, 5.74 to 6.83:1 against its surround.
- One fewer hue family on screen.

Against:
- **It cannot use the bold navy hero in light mode.** Blue on navy is 2.11:1. So option A keeps a pale hero, and a pale hero against the page is 1.07:1. That is the "nothing draws the eye" problem again. The button alone has to carry the page.
- **In dark mode there is no good blue.** A saturated blue (A1) keeps a strong label but sits at 2.03 to 2.68:1 on navy surfaces, same hue as the ground. A pale blue (A2) separates well (10.0 to 13.2:1) and has a strong label (Lc 84), but it is a pastel. It reads as a soft button, not an urgent one.
- Blue still has to be removed from the ring, checkmarks, selected chip and bar, or the button is again one of many blue things. Under A, data marks move to the green family (the "(option A)" viz rows, all verified), which takes green away from "correct".
- Variant A3 (a white button with a blue label on the navy hero) measures very well: 14.39:1. But white is the card color in light mode, so "white" would not be reserved for the action.

### 8.3 Option B: warm amber (recommended)

What it is. `amber.400` in light and `amber.300` in dark, with navy ink for the label, sitting on the navy hero in both themes.

For:
- **It works the same way in both themes.** Fill against hero 9.18:1 in light and 8.30:1 in dark. Label 11.59:1 (Lc 76.9) and 13.98:1 (Lc 84.3).
- **Hue does the work lightness cannot.** Amber is 174 to 179 degrees from the hero's hue. The navy ground pushes it toward more yellow (Section 3.6).
- **Best under color-vision deficiency.** Blue against yellow is the pair that red-green deficiency preserves. 7.25 to 10.0:1 in all simulations.
- **It matches what respondents chose.** example-02 was the most popular, and its button measures `oklch(0.894 0.132 90)`. The proposed dark button is `oklch(0.89 0.15 92)`. The brief also notes old Memrise used yellow. I did not verify that color myself.
- **Blue is freed** to mean brand, selection, links and progress without competing with the action.
- Dark ink on yellow is among the highest-contrast label pairs available, which helps anyone who finds low-contrast text hard to read.

Against:
- **Yellow is weak on light surfaces.** 1.57:1 on a white card, 1.41:1 on the page. Under B the button must live on the hero, or carry its `--cta-edge` (4.47:1 on a card). A lone yellow button on a white form would look washed out. Screens with no hero need a navy band or the edge.
- **A second warm color.** Amber sits near the orange flame and the caution color. Section 7.2 keeps them apart by form, and the simulation shows they stay distinct, but it is one more thing to police.
- **A brand shift.** The app becomes navy and amber with blue in support. The style tile and marketing page would need the same button eventually, or the product will feel like two brands. Because `--primary` stays blue, nothing else changes until the owner opts in screen by screen.
- A new button variant and a new role to maintain.

### 8.4 What about orange, as in example-04?

Measured, and rejected. A white label on orange.600 is 3.90:1, under the 4.5:1 minimum for a 16px label. Ink on orange.500 passes WCAG at 6.37:1 but is only Lc 48.9. Orange sits in the middle of the lightness range, so neither white nor black text is comfortable on it. Yellow is light enough for dark ink. Blue is dark enough for white. Orange is neither.

### 8.5 Recommendation

Option B, on the navy hero, in both themes. It is the only option where the light and dark themes solve "where do I look" the same way, and it has the best numbers for people with low vision and with color-vision deficiency. Adopt it through the new `--cta` role only, leave `--primary` blue, and the choice stays cheap to undo.

If the owner prefers A, pair it with the pale blue button in dark mode (A2), keep the soft hero, and move data marks to the green family.

## 9. What I could not verify

- **Material 3 color roles page** (m3.material.io) and **Material 2 dark theme page** (m2.material.io) are rendered with JavaScript and returned no content. Role wording comes from the Android Wear roles page and the material-web docs. The #121212 base and the "saturated colors vibrate" point come from Google's dark theme codelab, which I did read. The overlay percentages and the "200 tone" rule come from a search summary only.
- **HCT tone to contrast claim** (40 gives 3:1, 50 gives 4.5:1): seen in a search snippet of Material's source, not in a file I opened.
- **The "15.8:1" dark theme figure** often attributed to Material: I found it only in a third-party article. I did not use it.
- **Albers' Interaction of Color** and **Refactoring UI**: neither book was read in this session. Chapter titles for Albers were confirmed from a library catalog. Refactoring UI section names are cited from memory of the book and should be checked against the owner's copy.
- **Color-vision prevalence figures**: from a search summary of pages citing the National Eye Institute, not the NEI page.
- **60-30-10**: no authoritative source exists that I could find.
- **Old Memrise colors**: not examined in this track.
- **WCAG 2.2 text**: the specification page is long and only the first part was read. The definitions of relative luminance and the 2.5.8 wording were not in that part. The contrast math used here is culori's implementation of the WCAG formula.
- **No browser rendering test.** The proposal was not applied to the running app. I rendered a static mock (`preview.png` in the color folder) to check that the navy reads navy and the amber reads amber. Real components, real fonts, P3 screens, forced colors and `prefers-contrast` were not tested.
- **No human testing.** Color-vision results are simulations. APCA font sizes are from the library's lookup, not from testing with the respondents.
- **Pixel sampling of example-02** is from single pixels of a compressed, AI-generated image with gradients. Treat those values as approximate.

## 10. Files

All under `scratch/color/`:

| File | What it is |
|---|---|
| `tokens.mjs` | Source of truth for the proposal: 7 ramps, light and dark role maps |
| `lib.mjs` | OKLCH to sRGB, gamut test, alpha compositing, WCAG ratio, APCA Lc |
| `verify.mjs` | The gate. Writes `results.md` and `results.json`. Last run: 0 failures |
| `current.mjs`, `current.out.md` | Same measurements for today's `globals.css` |
| `decision.mjs`, `decision.out.md` | Call to action options, color-vision simulation, font lookup, Albers tables, P3, prefers-contrast |
| `scan.mjs`, `warn.mjs`, `misc.mjs` | Lightness scans used while tuning values; Material text tiers; counts |
| `gen.mjs` | Writes `proposed-tokens.css`, `roles.md`, `preview.html` |
| `proposed-tokens.css` | The three-tier CSS, ready to adapt into `globals.css` |
| `sample_examples.py`, `sample_points.py`, `points_oklch.mjs` | Pixel sampling of the example dashboards |
| `render.py`, `preview.png` | Static mock of both themes and both options |
| `build.mjs`, `color-science.template.md` | Assemble this document from the generated tables |

## Sources

- [S1] Andrey Sitnik and Travis Turner, Evil Martians, "OKLCH in CSS: why we moved from RGB and HSL". https://evilmartians.com/chronicles/oklch-in-css-why-quit-rgb-hsl (read)
- [S2] Björn Ottosson, "A perceptual color space for image processing", 23 Dec 2020. https://bottosson.github.io/posts/oklab/ (read)
- [S3] Material Foundation, material-color-utilities, "Color spaces" concept doc. https://github.com/material-foundation/material-color-utilities/blob/main/concepts/color_spaces.md (read)
- [S4] Material Design blog, "The Science of Color & Design", 17 Feb 2022. https://material.io/blog/science-of-color-design (not readable; search snippet only)
- [S5] Android Developers, Wear OS, "Color roles and tokens". https://developer.android.com/design/ui/wear/guides/styles/color/roles-tokens (read)
- [S6] material-web, "Color" theming doc. https://github.com/material-components/material-web/blob/main/docs/theming/color.md (read)
- [S7] Material Design 3, "Color roles". https://m3.material.io/styles/color/roles (not readable)
- [S8] W3C, Web Content Accessibility Guidelines 2.2. https://www.w3.org/TR/WCAG22/ (first part read): SC 1.4.1, 1.4.3, 1.4.6, 1.4.11, 2.4.7, 2.4.11, 2.4.13
- [S9] W3C, Understanding SC 1.4.11 Non-text Contrast. https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html (read)
- [S10] W3C, Understanding SC 1.4.1 Use of Color. https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html (read)
- [S11] Myndex, "APCA in a Nutshell". https://git.apcacontrast.com/documentation/APCA_in_a_Nutshell.html (read)
- [S12] Myndex, apca-w3 README. https://github.com/Myndex/apca-w3 (read)
- [S13] Tailwind CSS, "Theme variables". https://tailwindcss.com/docs/theme (read)
- [S14] Tailwind CSS, "Dark mode". https://tailwindcss.com/docs/dark-mode (read)
- [S15] MDN, `light-dark()`. https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/light-dark (read)
- [S16] MDN, `color-scheme`. https://developer.mozilla.org/en-US/docs/Web/CSS/color-scheme (read)
- [S17] MDN, `prefers-contrast`. https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-contrast (read)
- [S18] MDN, `<meta name="theme-color">`. https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/meta/name/theme-color (read)
- [S19] Google Codelabs, "Design a dark theme with Material and Figma". https://codelabs.developers.google.com/codelabs/design-material-darktheme/ (read)
- [S20] Material Design 2, "Dark theme". https://m2.material.io/design/color/dark-theme (not readable; search summary only)
- [S21] Apple, Human Interface Guidelines, "Dark Mode". https://developer.apple.com/design/human-interface-guidelines/dark-mode (read through the page's data endpoint)
- [S22] Josef Albers, Interaction of Color, Yale University Press, 1963. Table of contents confirmed at https://libcat.simmons.edu/Record/b2241604/TOC and https://collections.centerforbookarts.org/Detail/objects/3482 (search results; book not read)
- [S23] Adam Wathan and Steve Schoger, Refactoring UI. Chapters "Hierarchy is Everything", "Working with Color", "Creating Depth", "Finishing Touches" (book not read in this session; cited from memory)
- [S24] Color-vision deficiency prevalence, search summary of pages citing the US National Eye Institute, for example https://www.news-medical.net/health/Color-Blindness-Prevalence.aspx (search result only)
- [S25] The 60-30-10 rule, for example https://www.apartmenttherapy.com/interior-design-rule-60-30-10-explained-37504313 (search result only)
- [S26] Software: culori 4.0.2 (https://culorijs.org) and apca-w3 0.1.9, installed from npm
- Local: `dev/memli/packages/ui/src/styles/globals.css`; `dev/memli/packages/ui/src/components/button.tsx`; `dev/memli/apps/web/src/routes/_app/-components/*.tsx`; `dev/memli/apps/web/src/components/theme-provider.tsx`; `dev/memli/apps/web/index.html`; `docs/designs/dashboards/example-02.png`

## Appendix A. Generated CSS (`proposed-tokens.css`)

```css
/* GENERATED by gen.mjs from tokens.mjs. Proposal only. */

/* Tier 1: primitives. Components never use these directly. */
:root {
  --neutral-0: oklch(1 0 0); /* #ffffff */
  --neutral-50: oklch(0.985 0.004 264); /* #f9fafd */
  --neutral-100: oklch(0.965 0.008 264); /* #f1f3f9 */
  --neutral-200: oklch(0.94 0.012 264); /* #e7ebf3 */
  --neutral-300: oklch(0.87 0.022 264); /* #cdd4e3 */
  --neutral-400: oklch(0.8 0.024 264); /* #b6bece */
  --neutral-500: oklch(0.7 0.03 264); /* #959fb2 */
  --neutral-600: oklch(0.62 0.034 264); /* #7c869b */
  --neutral-700: oklch(0.47 0.04 265); /* #505b72 */
  --neutral-800: oklch(0.33 0.045 266); /* #2a354d */
  --neutral-900: oklch(0.26 0.045 266); /* #1a233a */
  --neutral-950: oklch(0.2 0.042 266); /* #0d1529 */

  --navy-700: oklch(0.4 0.058 266); /* #394767 */
  --navy-750: oklch(0.34 0.055 266); /* #2a3755 */
  --navy-800: oklch(0.295 0.053 266); /* #202c47 */
  --navy-850: oklch(0.25 0.05 266); /* #16213a */
  --navy-900: oklch(0.195 0.045 266); /* #0b1429 */
  --navy-950: oklch(0.16 0.038 266); /* #060c1d */

  --blue-50: oklch(0.972 0.013 262); /* #f1f6ff */
  --blue-100: oklch(0.94 0.028 262); /* #e1ecff */
  --blue-200: oklch(0.89 0.053 262); /* #c8dcff */
  --blue-300: oklch(0.82 0.089 262); /* #a5c5ff */
  --blue-400: oklch(0.73 0.139 262); /* #77a6ff */
  --blue-500: oklch(0.61 0.19 263); /* #437bf3 */
  --blue-600: oklch(0.54 0.225 264); /* #265eee */
  --blue-700: oklch(0.488 0.243 264.376); /* #1447e6 */
  --blue-800: oklch(0.42 0.2 265); /* #153bb7 */
  --blue-900: oklch(0.35 0.12 266); /* #1d3478 */
  --blue-950: oklch(0.29 0.105 267); /* #14255f */

  --amber-50: oklch(0.985 0.024 95); /* #fffae8 */
  --amber-100: oklch(0.96 0.06 95); /* #fef2c5 */
  --amber-200: oklch(0.925 0.11 94); /* #fee58f */
  --amber-300: oklch(0.89 0.15 92); /* #fed756 */
  --amber-400: oklch(0.855 0.17 88); /* #fec71d */
  --amber-500: oklch(0.8 0.165 80); /* #f5b005 */
  --amber-600: oklch(0.7 0.153 68); /* #db8903 */
  --amber-700: oklch(0.58 0.136 60); /* #b36300 */
  --amber-800: oklch(0.48 0.115 56); /* #8d4905 */
  --amber-900: oklch(0.39 0.09 54); /* #69350b */
  --amber-950: oklch(0.29 0.065 52); /* #442007 */

  --orange-50: oklch(0.98 0.014 70); /* #fff7ef */
  --orange-100: oklch(0.955 0.031 68); /* #ffeddb */
  --orange-200: oklch(0.91 0.062 65); /* #ffdab7 */
  --orange-300: oklch(0.85 0.103 62); /* #ffbf87 */
  --orange-400: oklch(0.78 0.15 56); /* #ff9b4e */
  --orange-500: oklch(0.7 0.18 50); /* #f37513 */
  --orange-600: oklch(0.62 0.174 46); /* #d75b01 */
  --orange-700: oklch(0.53 0.14 50); /* #a94e00 */
  --orange-800: oklch(0.45 0.115 50); /* #863e07 */
  --orange-900: oklch(0.38 0.09 48); /* #683110 */
  --orange-950: oklch(0.28 0.065 46); /* #421d09 */

  --green-50: oklch(0.98 0.02 160); /* #eefdf4 */
  --green-100: oklch(0.955 0.045 160); /* #d7fae6 */
  --green-200: oklch(0.915 0.08 160); /* #b5f4d1 */
  --green-300: oklch(0.86 0.12 160); /* #85e9b6 */
  --green-400: oklch(0.79 0.15 160); /* #4ed799 */
  --green-500: oklch(0.7 0.15 160); /* #23ba7d */
  --green-600: oklch(0.585 0.13 161); /* #019362 */
  --green-700: oklch(0.51 0.111 162); /* #037952 */
  --green-800: oklch(0.43 0.092 163); /* #025f41 */
  --green-900: oklch(0.36 0.075 164); /* #034932 */
  --green-950: oklch(0.27 0.055 165); /* #022f20 */

  --red-50: oklch(0.975 0.012 20); /* #fff4f3 */
  --red-100: oklch(0.945 0.027 20); /* #ffe6e5 */
  --red-200: oklch(0.895 0.054 20); /* #ffcfce */
  --red-300: oklch(0.82 0.1 21); /* #ffaaa8 */
  --red-400: oklch(0.73 0.16 22); /* #fc7a79 */
  --red-500: oklch(0.65 0.2 25); /* #f14d4c */
  --red-600: oklch(0.58 0.215 27); /* #dd2729 */
  --red-700: oklch(0.51 0.195 28); /* #bc1a18 */
  --red-800: oklch(0.44 0.16 28); /* #971b17 */
  --red-900: oklch(0.37 0.125 28); /* #741a15 */
  --red-950: oklch(0.27 0.085 27); /* #48100d */

}

/* Tier 2: semantic roles, light. */
:root {
  color-scheme: light;
  --background: var(--neutral-100);
  --sidebar: var(--neutral-50);
  --card: var(--neutral-0);
  --popover: var(--neutral-0);
  --muted: var(--neutral-200);
  --secondary: var(--neutral-200);
  --accent: var(--blue-100);
  --hero: var(--blue-950);
  --hero-soft: var(--blue-100);
  --foreground-strong: var(--neutral-950);
  --foreground: var(--neutral-800);
  --muted-foreground: var(--neutral-700);
  --accent-foreground: var(--blue-800);
  --hero-foreground: var(--neutral-50);
  --hero-muted-foreground: var(--blue-200);
  --brand: var(--blue-700);
  --link: var(--blue-700);
  --border: var(--neutral-300);
  --border-strong: var(--neutral-600);
  --input: var(--neutral-600);
  --ring: var(--blue-700);
  --hero-border: var(--blue-800);
  --hero-ring: var(--neutral-50);
  --hero-chip: color-mix(in oklab, var(--hero-foreground) 14%, var(--hero));
  --primary: var(--blue-700);
  --primary-foreground: var(--neutral-0);
  --primary-hover: var(--blue-800);
  --cta: var(--amber-400);
  --cta-foreground: var(--neutral-950);
  --cta-hover: var(--amber-300);
  --cta-active: var(--amber-500);
  --cta-edge: var(--amber-700);
  --success: var(--green-700);
  --success-container: var(--green-100);
  --success-container-foreground: var(--green-900);
  --warning: var(--orange-700);
  --warning-container: var(--orange-100);
  --warning-container-foreground: var(--orange-900);
  --destructive: var(--red-700);
  --destructive-foreground: var(--neutral-0);
  --destructive-container: var(--red-100);
  --destructive-container-foreground: var(--red-900);
  --streak: var(--orange-600);
  --viz-mastered: var(--blue-950);
  --viz-learning: var(--blue-500);
  --viz-new: var(--neutral-200);
  --viz-track: var(--neutral-200);
  --viz-progress: var(--blue-700);
  --viz-on-progress: var(--neutral-0);
  --sidebar-primary-foreground: var(--neutral-0);
  --card-foreground: var(--foreground);
  --popover-foreground: var(--foreground);
  --secondary-foreground: var(--foreground);
  --sidebar-foreground: var(--foreground);
  --sidebar-primary: var(--brand);
  --sidebar-accent: var(--accent);
  --sidebar-accent-foreground: var(--accent-foreground);
  --sidebar-border: var(--border);
  --sidebar-ring: var(--ring);
  --chart-1: var(--viz-mastered);
  --chart-2: var(--viz-learning);
  --chart-3: var(--viz-progress);
  --chart-4: var(--viz-new);
  --chart-5: var(--viz-track);
  --streak-foreground: var(--streak);
}

/* Tier 2: semantic roles, dark (deep navy). */
.dark {
  color-scheme: dark;
  --background: var(--navy-900);
  --sidebar: var(--navy-950);
  --card: var(--navy-850);
  --popover: var(--navy-800);
  --muted: var(--navy-750);
  --secondary: var(--navy-750);
  --accent: var(--navy-750);
  --hero: var(--blue-900);
  --hero-soft: var(--navy-800);
  --foreground-strong: var(--neutral-50);
  --foreground: var(--neutral-200);
  --muted-foreground: var(--neutral-300);
  --accent-foreground: var(--blue-200);
  --hero-foreground: var(--neutral-50);
  --hero-muted-foreground: var(--blue-100);
  --brand: var(--blue-300);
  --link: var(--blue-200);
  --border: var(--navy-700);
  --border-strong: var(--neutral-600);
  --input: var(--neutral-600);
  --ring: var(--blue-300);
  --hero-border: var(--blue-800);
  --hero-ring: var(--neutral-50);
  --hero-chip: color-mix(in oklab, var(--hero-foreground) 14%, var(--hero));
  --primary: var(--blue-200);
  --primary-foreground: var(--navy-950);
  --primary-hover: var(--blue-100);
  --cta: var(--amber-300);
  --cta-foreground: var(--navy-950);
  --cta-hover: var(--amber-200);
  --cta-active: var(--amber-400);
  --cta-edge: var(--amber-600);
  --success: var(--green-300);
  --success-container: var(--green-950);
  --success-container-foreground: var(--green-200);
  --warning: var(--orange-300);
  --warning-container: var(--orange-950);
  --warning-container-foreground: var(--orange-200);
  --destructive: var(--red-300);
  --destructive-foreground: var(--navy-950);
  --destructive-container: var(--red-950);
  --destructive-container-foreground: var(--red-200);
  --streak: var(--orange-400);
  --viz-mastered: var(--blue-100);
  --viz-learning: var(--blue-500);
  --viz-new: var(--navy-800);
  --viz-track: var(--navy-800);
  --viz-progress: var(--blue-400);
  --viz-on-progress: var(--navy-950);
  --sidebar-primary-foreground: var(--navy-950);
}

/* Option A (blue call to action): replace the five --cta lines with these.
   light: --cta: var(--blue-700); --cta-foreground: var(--neutral-0); --cta-hover: var(--blue-800); --cta-active: var(--blue-900); --cta-edge: var(--blue-900)
   dark:  --cta: var(--blue-200); --cta-foreground: var(--navy-950); --cta-hover: var(--blue-100); --cta-active: var(--blue-300); --cta-edge: var(--blue-500)
*/

/* Tier 3: expose roles to Tailwind as utilities (bg-hero, text-cta-foreground, ...). */
@theme inline {
  --color-background: var(--background);
  --color-sidebar: var(--sidebar);
  --color-card: var(--card);
  --color-popover: var(--popover);
  --color-muted: var(--muted);
  --color-secondary: var(--secondary);
  --color-accent: var(--accent);
  --color-hero: var(--hero);
  --color-hero-soft: var(--hero-soft);
  --color-foreground-strong: var(--foreground-strong);
  --color-foreground: var(--foreground);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent-foreground: var(--accent-foreground);
  --color-hero-foreground: var(--hero-foreground);
  --color-hero-muted-foreground: var(--hero-muted-foreground);
  --color-brand: var(--brand);
  --color-link: var(--link);
  --color-border: var(--border);
  --color-border-strong: var(--border-strong);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-hero-border: var(--hero-border);
  --color-hero-ring: var(--hero-ring);
  --color-hero-chip: var(--hero-chip);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-primary-hover: var(--primary-hover);
  --color-cta: var(--cta);
  --color-cta-foreground: var(--cta-foreground);
  --color-cta-hover: var(--cta-hover);
  --color-cta-active: var(--cta-active);
  --color-cta-edge: var(--cta-edge);
  --color-success: var(--success);
  --color-success-container: var(--success-container);
  --color-success-container-foreground: var(--success-container-foreground);
  --color-warning: var(--warning);
  --color-warning-container: var(--warning-container);
  --color-warning-container-foreground: var(--warning-container-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-destructive-container: var(--destructive-container);
  --color-destructive-container-foreground: var(--destructive-container-foreground);
  --color-streak: var(--streak);
  --color-viz-mastered: var(--viz-mastered);
  --color-viz-learning: var(--viz-learning);
  --color-viz-new: var(--viz-new);
  --color-viz-track: var(--viz-track);
  --color-viz-progress: var(--viz-progress);
  --color-viz-on-progress: var(--viz-on-progress);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-card-foreground: var(--card-foreground);
  --color-popover-foreground: var(--popover-foreground);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-ring: var(--sidebar-ring);
  --color-chart-1: var(--chart-1);
  --color-chart-2: var(--chart-2);
  --color-chart-3: var(--chart-3);
  --color-chart-4: var(--chart-4);
  --color-chart-5: var(--chart-5);
  --color-streak-foreground: var(--streak-foreground);
}
```

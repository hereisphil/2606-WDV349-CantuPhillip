# Refactoring UI applied to the Memli dashboard

> **Correction.** The brief given to the researchers wrongly described one respondent as older and as having weak eyesight. That remark in the chat was the owner's, about himself. Statements in this file that relied on it have been corrected. See `feedback-examples.md`, section 2.

Research file for the dashboard redesign plan. Scope: the book "Refactoring UI" by Adam Wathan and Steve Schoger, applied element by element to `/dashboard` as it exists today.

Paths below are relative to `dev/memli/` unless they start with `docs/`. `-components/` means `apps/web/src/routes/_app/-components/`.

## 0. How this was done, and how far to trust it

| Evidence | How I got it | Trust |
| --- | --- | --- |
| The book's chapter and section names | Fetched the table of contents from refactoringui.com | High. Official page. |
| What each section says | Two official preview pages (labels, color palette) plus three independent sets of reader notes that agree with each other. I do not have the book itself. | Medium to high. Where the notes disagree I say so. |
| "7 Practical Tips for Cheating at Design" | The Medium page returned HTTP 403. A mirror was blocked by my permissions. I list the tips from search snippets and memory. | Medium. Not read first hand in this session. |
| Steve Schoger's talks | Not watched. | Not used as a source. |
| Current page facts | Read the ten dashboard components and the shared UI primitives. Read the four desktop screenshots. Opened the live page at 1568x726 and at 375x812 and measured boxes and computed styles with JavaScript. | High. |
| Contrast numbers | My own script. OKLCH to sRGB with the standard OKLab matrices, then the WCAG 2.x formula. APCA values use the public 0.0.98G constants. | WCAG values high. APCA values are approximations, treat as plus or minus 1 Lc. |
| Colors sampled from example-02 | Median of a 7x7 pixel patch in the PNG, converted to OKLCH. The image is AI generated. | Rough guide only. |

### Measured facts used throughout

Desktop, 1568x726 viewport, light theme, default data.

| Fact | Value | Where it comes from |
| --- | --- | --- |
| "Start review" button | 118 x 44 px, 16px text at weight 500, `box-shadow: none`. (The shared brief says 126 px. Same order of size.) | `TodayPanel.tsx:52`, `:135-147` |
| "Learn 10 new words" button | 178 x 44 px, same height, same font size, same weight | `TodayPanel.tsx:148-150` |
| The secondary button is 51% wider than the primary | 178 / 118 | measured |
| Start review as a share of the first screen | 5,192 px² of 1,138,368 px², about 0.46% | measured |
| Today panel | 880 x 306 px. The button fills 1.9% of it. | measured |
| Distinct text styles in `main` (size + weight + color + case) | 23 | measured |
| Font sizes in use | 8: 12, 14, 16, 18, 20, 24, 30, 48 px | measured |
| Font weights in use | 4: 400, 500, 600, 700 | measured |
| Spacing steps in use across the ten dashboard files | 12: 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 5, 6, 8, 11 | grep of `gap-`, `p-`, `px-`, `py-`, `pt-`, `ps-`, `me-` |
| Text styled exactly 20px / 700 / foreground | 5 elements: "Continue learning", "Spanish Core 1000", "Other decks", "This week", "Your progress trends" | measured |
| Text styled exactly 30px / 700 | 3 elements: the h1 greeting, "16", "10" | measured |
| Bold numerals at 24px or larger on the page | 7: "24" (48px), "16", "10" (30px), ring "24", "98%", "84%", "142" (24px) | measured |
| Page height | 1391 px desktop (1.9 screens). 2658 px at 375 px wide (3.3 screens). | measured |

Phone, 375x812.

| Fact | Value |
| --- | --- |
| "Start review" top edge | 581 px from the top of the page. Bottom edge 625 px. |
| "Learn 10 new words" | 637 to 681 px |
| What sits above the button | Top bar, h1, a two-line status sentence, a label and five chips on two rows (80 px), the "TODAY" label, the count, "About 4 minutes", two deck chips on two rows |
| Today panel content width | 279 px of 375 px. Section padding `px-6` plus panel padding `p-6` costs 96 px, which is 26% of the screen. (`section.tsx:6`, `TodayPanel.tsx:287`) |

Contrast, light theme. Hex values are my conversions of the OKLCH tokens in `packages/ui/src/styles/globals.css:72-107`.

| Pair | Colors | WCAG | APCA Lc (approx.) |
| --- | --- | --- | --- |
| Body text on page | #181E2A on #F9FAFD | 15.93:1 | 101 |
| Muted text on page (status line) | #576173 on #F9FAFD | 5.97:1 | 78 |
| Muted text on card | #576173 on #FFFFFF | 6.24:1 | 81 |
| Muted text on Today panel | #576173 on #F1F6FF | 5.73:1 | 75 |
| Muted 12px label on trend card | #576173 on #F0F3F7 | 5.59:1 | 74 |
| White on primary (Start review) | #FFFFFF on #1447E6 | 6.82:1 | 87 |
| **Today panel against the page** | #F1F6FF on #F9FAFD | **1.04:1** | 0 |
| **White card against the page** | #FFFFFF on #F9FAFD | **1.04:1** | 0 |
| Trend card against the page | #F0F3F7 on #F9FAFD | 1.07:1 | 0 |
| Card outline (`ring-foreground/10`) against card | #E8E9EA on #FFFFFF | 1.22:1 | 11 |
| Border token against card | #E0E3E9 on #FFFFFF | 1.28:1 | 14 |
| Outline button fill against Today panel | #F9FAFD on #F1F6FF | 1.04:1 | 0 |
| "Not started" bar segment against card | #E0E3E9 on #FFFFFF | 1.28:1 | 14 |
| "Learning" segment against card | #6A99FF on #FFFFFF | 2.75:1 | 53 |
| "Mastered" segment against "learning" segment | #1447E6 on #6A99FF | 2.48:1 | 28 |
| Goal ring track against card | #F0F3F7 on #FFFFFF | 1.12:1 | 0 |

Contrast, dark theme (`globals.css:110-147`).

| Pair | Colors | WCAG | APCA Lc (approx.) |
| --- | --- | --- | --- |
| Body text on page | #F0F3F7 on #0A111B | 16.99:1 | 99 |
| Muted text on card | #9099A8 on #181E2A | 5.78:1 | 45 |
| Muted text on Today panel and trend cards | #9099A8 on #252C38 | 4.89:1 | 43 |
| Dark text on primary (Start review) | #0A111B on #6A99FF | 6.90:1 | 51 |
| Card against page | #181E2A on #0A111B | 1.14:1 | 0 |
| Today panel against card | #252C38 on #181E2A | 1.18:1 | 0 |
| "Learning" segment against card | #1447E6 on #181E2A | 2.44:1 | 18 |
| "Not started" segment against card | #838C9B on #181E2A | 4.89:1 | 38 |

**The headline finding from these tables.** Text contrast is not the problem. Every text pair passes WCAG AA. The problem is that the page's four surfaces (page 0.985, Today 0.971, trend cards 0.962, cards 1.0 in OKLCH lightness) sit inside a 4% lightness band, so no box stands apart from any other box. When the owner says "not enough contrast" and Karen says "the white background makes the words disappear", this is what they are seeing: low contrast between regions and between levels of importance, not between letters and paper.

One more finding from the token file. The hex comments do not match the OKLCH values. `--primary: oklch(0.488 0.243 264.376)` is commented `#2563EB` (`globals.css:78`), but by my conversion it renders as about `#1447E6`. `--muted-foreground` is commented `#64748B` and renders as about `#576173`. The comments describe one palette and the code ships another. Delete the hex comments when the tokens are rebuilt.

---

## 1. Diagnosis: the four problems in Refactoring UI terms

| Owner's problem | What the book calls it | Root cause on this page |
| --- | --- | --- |
| 1. Too busy, too much copy | "Not all elements are equal", "Labels are a last resort", "Don't design too much" | 217 words. The same fact is said two or three times: "About 4 minutes" twice, the streak twice, mastery three ways on one card, due counts in the panel and again in the rows. 12 headings label 7 small regions. |
| 2. Not enough contrast | "Balance weight and contrast", "You need more colors than you think", "Use fewer borders" | Only two text colors. Four surfaces within 1.04:1 to 1.12:1 of each other. Boxes are separated by 1.22:1 hairlines. No shadows on the dashboard at all. |
| 3. Needs dark mode | "Even flat designs can have depth", "Greys don't have to be grey", "Don't let lightness kill your saturation" | A dark token set exists but it is the light set with values swapped. In dark, the hero panel and the least important trend cards share one color (`globals.css:119-125`). The navy has half the chroma of the example people liked. There is no visible control (`apps/web/src/components/theme-provider.tsx:145` only listens for the "d" key). |
| 4. Eye is not drawn to one thing | "Start with a feature, not a layout", "De-emphasize to emphasize", "Semantics are secondary" | The main action is 0.46% of the screen and narrower than the button beside it. Solid primary blue is spent on six different things in the first view. Eight items in the first view are bold and 20px or larger. The hero panel is the least distinct surface, and by lightness it reads as sunk into the page. |

---

## 2. Chapter 1: Starting from Scratch

### 2.1 Start with a feature, not a layout

**Principle.** Design the actual piece of functionality first, and let the shell (sidebar, columns, navigation) follow from what it needs.

**Violation here.** The current plan started from a layout. `docs/designs/dashboards/PLAN.md` section 3 defines seven regions and a two column grid before deciding how the one feature should look. The code mirrors this: `dashboard.tsx:131` lays out `xl:grid-cols-[minmax(0,1fr)_20rem]`, and the feature is then poured into an 880 px wide slot. That is why the Today panel is a wide, mostly empty box: its content needs about 420 px but the grid gives it 880 px (see the light screenshot, the right half of the panel is blank).

**Fix.** Name the feature in one line: "Tell me how much is waiting and let me start." Design that as a standalone component at its natural size first, at 375 px wide. Then place it. Concretely:

- Build the hero on its own at phone width: count, one supporting line, one button. It must look finished with nothing else on the page. The `?preview=one-deck` and `no-decks` states already render close to this, so use them as the design canvas.
- Only after that decide what else earns a place next to it.
- Change `dashboard.tsx:131` so the hero is not inside the two column grid. It spans the content width above it. The grid below holds the deck list and the aside.

### 2.2 Detail comes later (design in greyscale first)

**Principle.** Get hierarchy right with spacing, size and contrast before color, so color is not doing work that structure should do.

**Violation here.** Take the light screenshot and imagine it in greyscale. The Today panel disappears (1.04:1 against the page). The Start review button becomes one dark pill among six dark shapes of similar size: the "All languages" chip, five check dots, the ring arc. Nothing in the structure says "this is first".

**Fix.** A squint test becomes an acceptance check for the redesign: blur the screenshot or view it at 25% zoom in greyscale. The first thing you can still find must be the Start review button, and the second must be the due count. This check costs nothing and it is the most direct test of problem 4.

### 2.3 Don't design too much

**Principle.** Ship the smallest useful version. Features that are not ready do not need a placeholder on screen.

**Violation here.** Three regions exist mostly because data for them exists, not because the learner acts on them:

- "Your progress trends" (`ProgressTrends.tsx:53-92`): three statistics with no action. "Global average: 75%" compares against cohort data that does not exist yet (the plan already dropped the Rank card for that reason, `PLAN.md` step 7).
- The tricky words callout (`MemoryCallout.tsx:34-72`) has an explanation sentence that promises "A new mnemonic can help them stick" but offers no button, because the mnemonic editor does not exist yet (`PLAN.md` step 7 says so).
- The focus deck card repeats what the Today panel just said, and its own action is hidden whenever it matches the panel's action (`dashboard.tsx:140-145`), which is always the case today.

**Fix.**

- Remove the trends strip from the dashboard. Park it for a future Progress page. If one number must stay, keep it as a single line of text in the aside, not three boxes.
- Reduce the tricky words callout to its heading and three example words until it has an action.
- Fold the focus deck into the deck list as its first row (section 3.5).

### 2.4 Choose a personality

**Principle.** Font, color, border radius and wording together set the tone. Pick the tone on purpose and apply it everywhere.

**Violation here.** The current personality is neutral and formal: Inter, one blue, `--radius: 0.5rem` (`globals.css:98`), outline icons, no illustration, no shadows. The feedback asks for something else. Crystal chose example-01 because it "was more fun". Woodson liked the "vibe" of example-02. Both examples use larger radii, bigger type, filled buttons with depth and some illustration.

**Fix.** Move one notch toward playful without changing the font:

- Radius: hero and cards `rounded-2xl` (14.4 px with the current `--radius`), primary button `rounded-xl`. The book's notes say larger radius reads as more playful and must be applied consistently.
- Wording: Crystal flagged "Deck" as possibly confusing. The code already calls the object a course (`courseId` in `dashboard-metrics.ts`, route `/study/$courseId`). The book treats wording as part of personality. Decide on one learner-facing word and use it in every string. This is a product decision for the owner. I only flag that the UI and the code currently disagree.
- Warmth: one warm accent (the streak orange already exists as `--streak-foreground`) used for the streak and the tricky words callout, so the page is not blue and grey only.

### 2.5 Limit your choices

**Principle.** Define a small set of sizes, weights, colors, spacings and shadows up front, then choose only from that set.

**Violation here.** Choices are not limited. 8 font sizes, 4 weights and 23 text styles for 217 words. 12 spacing steps. Zero defined shadows. Two primary shades. See the measured facts table.

**Fix.** Section 8 proposes a type scale with 6 sizes and 2 weights, a spacing scale with 8 steps, and an elevation scale with 5 levels. Adopt those and treat anything outside them as a bug in review.

---

## 3. Chapter 2: Hierarchy is Everything

### 3.1 Not all elements are equal

**Principle.** Decide which elements are primary, secondary and tertiary. A page where everything has similar emphasis looks noisy even when each part is tidy.

**Violation here.** I sorted the first desktop screen by visual weight. Eight items are bold and 20 px or larger: the greeting, "24", "This week", the ring's "24", "Continue learning", "Spanish Core 1000", "16" and "10". That is eight things claiming to be level one.

There is also a data trap. In the default data the number 24 appears twice in large bold type and means two different things. In the Today panel it means 24 cards are due (`TodayPanel.tsx:102`). In the ring it means 24 cards were studied today (`ThisWeek.tsx:88`). A non-technical reader will assume they are the same number.

**Fix.** Assign every element a level and style by level only.

| Level | Elements | Treatment |
| --- | --- | --- |
| 1 | Due count and Start review | Largest type on the page. The only solid primary fill. The only strong shadow. |
| 2 | Deck titles, each deck's "16 due", the daily goal ring | 16px semibold foreground. No fills. |
| 3 | Section labels, streak, weekday dots, tricky words, the Learn action | 14px medium, secondary text color, tinted fills only |
| 4 | "About 4 minutes", percent mastered, "and 4 more" | 14px regular, tertiary text color |
| Removed | Status sentence, "TODAY", deck chips in the hero, "Last studied", mastery legend, goal sentence, tricky words sentence, trends strip | See the copy table in section 7 |

### 3.2 Size isn't everything

**Principle.** Use weight and color to rank text, not just size. Use two or three text colors and two weights.

**Violation here.**

- Only two text colors exist: `--foreground` and `--muted-foreground` (`globals.css:73`, `:83`). There is no third, quieter level. So "Last studied 2 hours ago", the mastery legend, "About 4 minutes" and the weekday letters all share the one muted color and compete with each other. The muted style is used 18 times at 14px and 12 times at 12px.
- Four weights are used. Weight 500 and weight 600 at the same size are hard to tell apart, so they add noise without adding a level.
- Size is used where weight or color would do. "16" and "10" on the focus card are 30px bold (`FocusDeckCard.tsx:169`, `:177`), the same style as the page's h1. They are secondary facts that the hero already states.

**Fix.**

- Three text roles: `text-foreground` (primary), a darker secondary than today, and a new tertiary. Suggested starting values in light: secondary `oklch(0.42 0.03 261)`, tertiary `oklch(0.50 0.03 261)`. By my calculation the secondary measures 8.46:1 on white and 7.65:1 on a 0.965 page. The tertiary measures 6.00:1 on white, 5.42:1 on the page and 4.81:1 on a 0.925 well. A lighter tertiary does not work: L 0.55 drops to 4.38:1 on the page and fails AA. So the color step between secondary and tertiary is small by necessity, and the third level has to come from size and weight as well. The color research should confirm final numbers. Add a `--color-subtle-foreground` token so the class is `text-subtle-foreground`.
- Two weights: `font-normal` (400) for reading text and `font-semibold` (600) for emphasis. `font-bold` (700) is reserved for the hero number. Remove `font-medium` from the dashboard: the chips (`LanguageFilter.tsx:12`), the chip label (`:38`), the "cards ready to review" phrase (`TodayPanel.tsx:105`), and the Button base (`packages/ui/src/components/button.tsx:8`) for the primary action.
- Change the focus deck's "16" and "10" from `text-3xl font-bold` to inline `text-sm font-semibold` phrases ("16 due", "10 new") in the row.

### 3.3 Don't use grey text on colored backgrounds

**Principle.** On a colored surface, secondary text should be a color with the same hue as the surface, adjusted in lightness and saturation. Neither grey nor semi-transparent white.

**Violation here.** Mild today, serious if the hero gets more color. The Today panel is a blue tint (`bg-accent`, hue 264) and holds slate grey text: "About 4 minutes" (`TodayPanel.tsx:109`, `Text variant="muted"`), the deck chips (`:118`, `text-muted-foreground`), and "Starts in Spanish Core 1000." (`:153`). Because the grey is itself slightly blue (hue 261) it does not look wrong yet. The moment the hero becomes a stronger tint, a gradient or a navy panel, `text-muted-foreground` on it will look washed out.

**Fix.** Give the hero its own on-surface text tokens instead of reusing the page's muted grey.

```css
/* globals.css, values are starting points for the color research */
:root {
  --hero: oklch(1 0 0);
  --hero-foreground: oklch(0.21 0.03 264);
  --hero-muted: oklch(0.44 0.06 264);   /* same hue as primary, not slate */
}
.dark {
  --hero: oklch(0.30 0.07 264);
  --hero-foreground: oklch(0.97 0.01 264);
  --hero-muted: oklch(0.80 0.06 264);   /* a light blue, not white at 60% */
}
@theme inline {
  --color-hero: var(--hero);
  --color-hero-foreground: var(--hero-foreground);
  --color-hero-muted: var(--hero-muted);
}
```

Then the hero uses `bg-hero text-hero-foreground` and its supporting line uses `text-hero-muted`. Rule for review: `text-muted-foreground` never appears inside the hero.

### 3.4 De-emphasize to emphasize

**Principle.** When the main element does not stand out, do not make it louder. Make its competitors quieter.

**Violation here.** Solid primary blue is the page's loudest signal and it is spent on six things in the first screen:

1. The "All languages" chip (`LanguageFilter.tsx:12`, `aria-[current=page]:bg-primary`). It is 120 x 36 px, blue fill, white medium text. It sits 78 px above Start review, which is 118 x 44 px, blue fill, white medium text. The selected filter looks like the main button, and it comes first in reading order.
2. Start review.
3. Five solid blue check dots (`ThisWeek.tsx:100`, `bg-primary`), each 28 px.
4. The goal ring arc (`ThisWeek.tsx:84`, `stroke-primary`).
5. The "8 due" badge in the deck list (`DeckList.tsx:42`, default Badge is `bg-primary`).
6. The mastery bar's first segment (`FocusDeckCard.tsx:52`).

Also, the sidebar is darker than the content (`bg-sidebar` is L 0.962 with a border, `AppSidebar.tsx:139`, against a 0.985 page), so the navigation is a heavier block than the page it serves.

**Fix.** Solid `bg-primary` is allowed on exactly one element per screen: the main action. Everything else moves to a tint or to neutral.

| Element | Now | Change to |
| --- | --- | --- |
| Selected language chip | `aria-[current=page]:bg-primary aria-[current=page]:text-primary-foreground` | `aria-[current=page]:bg-foreground/8 aria-[current=page]:text-foreground aria-[current=page]:font-semibold aria-[current=page]:border-transparent`. Or replace the chip row with one compact select in the deck list header (section 4.3). |
| Week dots, met | `bg-primary text-primary-foreground` | `bg-primary/12 text-primary`. Keep the check icon. In dark use `dark:bg-primary/20`. |
| Goal ring arc | `stroke-primary`, 8 units wide | Keep the hue, since it is a progress mark, but it moves inside the hero where it supports the main number instead of competing from another card. |
| "8 due" badge | default Badge, solid primary | `bg-primary/10 text-primary font-semibold`. In light, primary on a 10% tint of itself over white measures 5.82:1. In dark the same recipe fails: the current dark primary on a 20% tint over a navy card measures about 4.16:1. Dark needs a lighter text shade for tinted badges, around L 0.80. |
| Sidebar | `bg-sidebar` plus `md:border-r` | Same color as the page and no border, or one step darker with no border. Let spacing separate it. |

### 3.5 Labels are a last resort

**Principle.** Avoid the "label: value" pattern. Drop the label when format or context makes the meaning clear. Otherwise fold the label into the value ("12 left in stock"). When a label must stay, make it the quiet part.

**Violation here.** The page already has two good examples: "24 cards ready to review" and "7 words keep slipping". Around them sit nine labels that add words without adding meaning:

| Label | Where | Why it is not needed |
| --- | --- | --- |
| "TODAY" | `TodayPanel.tsx:289-297` | "24 cards ready to review" already says what this is. |
| "Studying" | `LanguageFilter.tsx:36-41` | The chips are language names. |
| "Due" under 16 | `FocusDeckCard.tsx:168` | Fold in: "16 due". |
| "New today" under 10 | `FocusDeckCard.tsx:174` | Fold in: "10 new". |
| "Daily goal" beside the ring | `ThisWeek.tsx:185-192` | The ring says "24 of 50". One label is enough, and the sentence under it restates the ring. |
| "Streak" under "12 days" | `ThisWeek.tsx:206` | Fold in: "12-day streak". |
| "Words mastered" under 100 | `ThisWeek.tsx:216-218` | Fold in: "100 words mastered". |
| "Continue learning" over one deck | `FocusDeckCard.tsx:153` | A heading for a list of one. |
| "Other decks" | `DeckList.tsx:153` | Only needed because the focus deck was split out. |

**Fix.**

- Hero: delete the visible "TODAY". Make the count phrase itself the `h2`, so the document outline keeps its heading (section 3.6 has the markup).
- Deck rows: one line of folded phrases, "16 due" in `font-semibold text-foreground` and "10 new" in `text-secondary`. No stacked label and value pairs.
- This week: "12-day streak" and "100 words mastered" as two folded phrases. In code these become one plural template each, for example `streak: { one: "{count}-day streak", other: "{count}-day streak" }`, which matches the project's i18n rule of whole-sentence templates (`PLAN.md` section 6).
- Trends, if any survive: this is the one place the book says labels help, because a reader scans similar numbers. They are already styled correctly as small, quiet labels (`ProgressTrends.tsx:31`). The problem there is jargon ("Consistency", "Retention"), not styling.

### 3.6 Separate visual hierarchy from document hierarchy

**Principle.** Heading tags describe document structure. They do not have to be big. In app screens, section titles often work as small labels, or can be hidden visually.

**Violation here.** The Heading component ties size to tag (`packages/ui/src/components/heading.tsx:39-44`: `h1` is `text-3xl`, `h2` is `text-2xl`, `h3` is `text-xl`), and the global stylesheet ties letter spacing to tag (`globals.css:161-166`). Results:

- The `h1` greeting is 30px bold, the largest text after the count, yet it is a pleasantry, not the feature.
- Four `h2` section titles are 20px bold and are heavier than the content they introduce. "Other decks" (20px/700) outranks "Japanese Hiragana & Katakana" (16px/600).
- "Continue learning" (`h2`) and "Spanish Core 1000" (`h3`) are both 20px/700. The only difference between them is 0.3 px of letter spacing that comes from the tag rule.

**Fix.** Keep every heading tag for screen readers. Restyle by role.

| Heading | Tag stays | New classes |
| --- | --- | --- |
| Greeting | `h1` | `text-lg font-semibold text-foreground` on desktop and phone. It no longer needs `text-2xl sm:text-3xl` (`DashboardGreeting.tsx:71`). |
| Hero count phrase | `h2` | The number and phrase together are the heading. See below. |
| "Your decks", "This week" | `h2` | `text-sm font-semibold text-secondary`. Sentence case, no uppercase, so it works in every script. |
| Deck titles | `h3` | `text-base font-semibold text-foreground` |
| Tricky words title | `h2` | `text-base font-semibold` (already this size, `MemoryCallout.tsx:44-52`) |

```tsx
<h2 id="today-heading" className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
  <span className="text-display font-bold tabular-nums">{number(dueCount)}</span>
  <span className="text-2xl font-semibold">{plural(dueCount, messages.dueLabel)}</span>
</h2>
```

Move the `letter-spacing` rules off `h1` and `h2` in `globals.css:161-166` and onto the type scale tokens (section 8.1), so tracking follows size, not tag.

### 3.7 Balance weight and contrast

**Principle.** Heavy things (solid icons, filled shapes, bold text) can be softened by lowering their contrast. Things that are too faint (a 1 px low contrast line) are better fixed by making them thicker than by making them darker.

**Violation here.**

- Too heavy for their rank: the five filled check dots and the solid "8 due" badge. Both are secondary information drawn in the strongest color as solid shapes.
- Too faint to do their job: card outlines at 1.22:1 (`card.tsx:17`, `ring-1 ring-foreground/10`), the outline button's border at 1.28:1 on a fill that differs from the panel by 1.04:1 (`button.tsx:13-14`, as used at `TodayPanel.tsx:149`), the progress track at 1.12:1 to 1.28:1 (`FocusDeckCard.tsx:77`, `:54`), the goal ring track at 1.12:1 (`ThisWeek.tsx:73`). A reader with weak eyesight, like Karen, will not see the edge of the "Learn 10 new words" button or the unfilled 80% of the mastery bar.

A note on WCAG. SC 1.4.11 asks for 3:1 on the parts of a control or graphic that are needed to understand it. A button with a text label and a bar with a text legend are arguably covered by their text. So I am not calling these failures. They are weak for low vision readers and the fix is cheap.

**Fix.**

- Dots and badge: use the tinted fills from section 3.4.
- Card edges: remove the 1 px ring and use a two part shadow (section 6.2). Edges made of shadow do not need 3:1 because the surface difference and the shadow together carry the shape.
- Secondary button: if it stays an outline, use `border-2 border-foreground/20` instead of a 1 px border. Better, make it a tertiary text button (section 3.8).
- Progress tracks: `h-3` instead of `h-2.5` and `h-1.5`, with a track at ramp step 300 (about L 0.87, roughly 1.5:1 against white, up from 1.12:1 to 1.28:1). `bg-foreground/10` is not enough, it measures 1.22:1. One filled color for "mastered". Drop the "learning" segment from the dashboard bar. The three part split belongs on a deck detail page.
- Ring track: the same step 300 neutral instead of `stroke-muted`.

### 3.8 Semantics are secondary (button hierarchy)

**Principle.** Style buttons by their importance on this screen, not by what kind of action they are. One primary action: solid, high contrast. Secondary actions: outline or a low contrast fill. Tertiary actions: styled like links.

**Violation here.**

- The primary action is not clearly primary. It shares height (44 px), font size (16px), weight (500) and radius with the secondary next to it, and it is narrower (118 px against 178 px). The only difference is fill.
- It has no depth. `button.tsx:12` is `bg-primary text-primary-foreground hover:bg-primary/80`. Hover makes the main action paler, which reads as weaker, not as responding. The owner's standing rule is a solid primary with depth. The study screen's reveal button already has `shadow-sm hover:shadow-md` (`apps/web/src/routes/_session/-components/RevealButton.tsx:67`), so the dashboard is behind the rest of the app.
- There is no tertiary level. "Learn 10 new words", "Review" and "Learn" in the rows are all the same outline style (`TodayPanel.tsx:149`, `DeckList.tsx:83-98`). So the page has one solid button, three outline buttons, four outline chips and one solid chip: nine controls in three styles that do not map to three levels of importance.
- The caught-up state has no primary at all, only two outline buttons (`TodayPanel.tsx:194-225`). That is right when the message is "you are done", but then the panel needs a different focal point (section 9.4).

**Fix.** Three levels, each with one recipe.

| Level | Used for | Classes |
| --- | --- | --- |
| Primary (one per screen) | Start review. In other states: Learn N new words, Browse community decks. | `h-14 w-full sm:w-auto sm:min-w-56 px-8 rounded-xl text-lg font-semibold bg-primary text-primary-foreground shadow-cta inset-shadow-cta hover:bg-primary-hover hover:shadow-cta-hover active:translate-y-px active:shadow-cta-pressed motion-reduce:transition-none` |
| Secondary | The second action in the hero when the learner can also learn new words | `h-12 px-5 rounded-xl text-base font-semibold bg-primary/10 text-primary hover:bg-primary/15` |
| Tertiary | Row actions "Review" and "Learn", "Practice 4 tricky words" | `h-11 px-3 rounded-lg text-sm font-semibold text-primary hover:bg-primary/8` with a trailing chevron icon. No border, no fill at rest. |

Notes on these recipes:

- `min-w-56` (224 px) and never a fixed width, so Spanish or German labels can grow. On phones the primary is `w-full`.
- 56 px tall is above the 44 px the plan already asks for on primary actions (`PLAN.md` section 5) and far above the 24 px WCAG 2.2 AA floor the project uses (`docs/product-ux.md:175`).
- Hover goes darker, not paler. Add a `--primary-hover` token about 0.04 lower in lightness than `--primary` in light, and about 0.04 higher in dark.
- Put this in the shared Button as a new size, for example `size="hero"`, so the study screen and the dashboard use one recipe. That follows the project rule to change the shared component rather than patch each call site.
- If a destructive action ever lands here, the book's rule applies: it is not automatically red and big. It gets the level that matches its importance.

---

## 4. Chapter 3: Layout and Spacing

### 4.1 Start with too much white space

**Principle.** Begin with more space than you think you need, then remove some. Dense layouts should be a deliberate choice.

**Violation here.** The page is not short of white space in total. It is short of it where it matters, and long on it where it does nothing.

- Around the hero there is too little. The filter row sits 32 px above it, the next heading 32 px below, the aside 32 px to the right. The hero gets the same breathing room as every other box.
- Inside boxes there is trapped space. The right 450 px of the Today panel and the right half of the focus card are empty because the boxes are stretched to 880 px (`FocusDeckCard.tsx:166` caps the stats at `sm:max-w-xs` inside a full width card).

**Fix.**

- Hero padding `p-5 sm:p-8 lg:p-10`. Space above and below the hero `mt-6 mb-12` on desktop.
- Do not leave empty halves. Use the hero's second zone for the goal ring and week (section 4.3).

### 4.2 Establish a spacing and sizing system

**Principle.** Pick a small scale where each step is clearly different from its neighbors (roughly 25% or more), and use only those values.

**Violation here.** 12 steps are in use. Several pairs are too close to tell apart: `gap-5` and `gap-6` (20 and 24 px, 20% apart), `px-2.5`, `px-3` and `px-3.5` (10, 12, 14 px), `gap-1` and `gap-1.5`. The Today panel uses `gap-5` (`TodayPanel.tsx:287`) while the focus card uses `gap-6` (`FocusDeckCard.tsx:156`) and the week card uses `p-5` with `gap-6` (`ThisWeek.tsx:176`). Three cards, three internal rhythms.

**Fix.** The 8 step scale in section 8.2. Tailwind v4 generates any `gap-N` from one `--spacing` base, so the limit has to be a team rule plus a lint check, not configuration.

### 4.3 You don't have to fill the whole screen

**Principle.** Give each element the width it needs. Extra screen does not have to be used. If a narrow thing looks lost in a wide area, change the arrangement instead of stretching the thing.

**Violation here.**

- The trends strip stretches three four-character numbers across 1232 px (`ProgressTrends.tsx:67`, `sm:grid-cols-3`). Each box is about 400 px wide for content about 110 px wide.
- The Today panel and focus card, as described above.
- The status line under the greeting spans a 1232 px container.

**Fix.** A structure that gives each part its natural width. Desktop, inside the existing `max-w-7xl` section:

```
[ greeting, one line ]                                   [ theme toggle ]

[ HERO, full content width, one raised surface                          ]
[  left zone, about 60%:            |  right zone, about 40%:           ]
[  24 cards to review               |  goal ring 24 of 50               ]
[  About 4 minutes                  |  S M T W T F S                    ]
[  [ Start review ]  Learn 10 new   |  12-day streak                    ]

[ Your decks            (All languages v) ]   [ 7 words keep slipping  ]
[ ES Spanish Core 1000   16 due  10 new   ]   [ aprovechar  ぬ  +5     ]
[ JA Japanese Hiragana    8 due   Review > ]
[ FR French Travel       10 new   Learn  > ]
[ PT Portuguese          Caught up         ]
```

Why this shape:

- One hero instead of two competing boxes (Today in the main column, This week in the aside). It reuses what Crystal circled: the single hero card from example-04, the centered "words ready" panel and the 7-day streak card from example-05.
- The hero's two zones are separated by a background change, not a line: left `bg-hero`, right `bg-muted/60`, inside one `overflow-hidden rounded-2xl` shell. That is the book's "fewer borders" technique.
- The language filter leaves the top of the page. It becomes a small select, right aligned in the "Your decks" header, which is where the owner liked it in example-02 (`docs/designs/dashboards/README.md`, item 2). When there is one language it stays hidden, as today.
- The deck list keeps content-sized columns. The existing subgrid (`DeckList.tsx:112`, `:156`) already does this well and should stay.
- On phones the hero is one column: left zone first, then the week strip as a compact row inside the same surface. The aside content follows the deck list.

Grid classes: hero `grid lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]`. Lower area `grid gap-12 xl:grid-cols-[minmax(0,1fr)_20rem]`.

### 4.4 Grids are overrated

**Principle.** Do not size everything as a fraction of a grid. Fix the widths that should be fixed, let content areas flex, and use `max-width` so components only shrink when they must.

**Violation here.** Mostly followed. The sidebar is a fixed `md:w-64` (`AppSidebar.tsx:139`) and the aside is a fixed `20rem` (`dashboard.tsx:131`). Good. The one miss is the trends strip in equal thirds.

**Fix.** If any stats remain, lay them out with `flex flex-wrap gap-x-10 gap-y-4`, each item sized by its content. Give sentences `max-w-[60ch]`.

### 4.5 Relative sizing doesn't scale

**Principle.** Big things should shrink faster than small things on small screens. Do not scale everything by one ratio, and do not tie padding to font size.

**Violation here.**

- The greeting scales (`text-2xl sm:text-3xl`, `DashboardGreeting.tsx:71`) but the hero number is fixed at `text-5xl` on all screens (`TodayPanel.tsx:102`). On a phone the greeting is 24 px and the count is 48 px. That is fine as a ratio, but nothing was chosen for the phone on purpose.
- Padding does not shrink at all. `px-6` plus `p-6` leaves 279 px of content on a 375 px screen.

**Fix.** Set sizes per breakpoint by hand.

| Element | Phone (under 640 px) | Desktop |
| --- | --- | --- |
| Hero number | 48 px (`text-5xl`) | 72 px (`sm:text-7xl`) |
| Hero phrase | 20 px (`text-xl`) | 24 px (`sm:text-2xl`) |
| Body and deck titles | 16 px | 16 px |
| Secondary text | 14 px | 14 px |
| Page gutter | 16 px (`px-4`) | 24 px (`sm:px-6`) |
| Hero padding | 20 px (`p-5`) | 32 to 40 px (`sm:p-8 lg:p-10`) |
| Primary button | 56 px tall, full width | 56 px tall, at least 224 px wide |

The number shrinks by a third. Body text does not shrink. The phone gains 28 px of content width (307 px instead of 279 px).

### 4.6 Avoid ambiguous spacing

**Principle.** The space around a group must be clearly larger than the space inside it. Otherwise the eye cannot tell what belongs together.

**Violation here.**

- The page stacks everything with one gap. `dashboard.tsx:114` and `:132` both use `gap-8` (32 px). Greeting to filter, filter to Today, Today to "Continue learning", focus card to "Other decks": all 32 px.
- A section heading sits 16 px above its card (`gap-4`, `FocusDeckCard.tsx:152`, `DeckList.tsx:151`, `ThisWeek.tsx:172`) and 32 px below the previous card. That is a 2:1 ratio. Meanwhile parts inside a card are 24 px apart (`FocusDeckCard.tsx:156`), which is more than the 16 px that ties a heading to its card. So "Continue learning" is closer to belonging to its card than the card's own contents are to each other only by a hair, and from a distance the page reads as an even stack of stripes.
- The filter row is the same distance from the greeting above and the Today panel below, so it is unclear what it filters.
- The two columns do not line up. In the main column the first surface (Today) starts about 21 to 24 px lower than the first surface in the aside (the week card), because one column leads with a 36 px chip row and a 32 px gap, and the other with a 28 px heading and a 16 px gap. See the light screenshot: the "This week" heading aligns with the chips, and neither card top aligns with the other.

**Fix.** Three distances, each with one meaning.

| Relationship | Distance | Class |
| --- | --- | --- |
| A label and the thing it labels | 12 px | `gap-3` |
| Parts inside one surface | 16 px, or 24 px between sub-groups | `gap-4`, `gap-6` |
| One section and the next | 48 px | `gap-12` |

That makes between-group space three to four times the label gap. Remove outside headings above single cards (the hero and the week block have none), so every column starts with a surface edge and tops align.

---

## 5. Chapter 4: Designing Text

### 5.1 Establish a type scale

**Principle.** Hand-pick a small set of sizes and use only those.

**Violation here.** Eight sizes for one screen, including pairs one step apart at the same weight (18 and 20 px headings, 12 and 14 px meta text). Size is set ad hoc: `Heading` gets `size="4"` and is then overridden with `text-base` or `text-sm` in three places (`TodayPanel.tsx:292-294`, `DeckList.tsx:118-120`, `ThisWeek.tsx:186-189`). An override in every caller is a sign the scale does not fit the screen.

**Fix.** Six sizes. See section 8.1.

### 5.2 Use good fonts

**Principle.** Use a neutral, well made typeface with many weights.

**Status.** Followed. Inter Variable with tabular numerals on every number (`globals.css:12`, `tabular-nums` throughout). No change. One note for older eyes: Inter's default "1", "l" and "I" are close. The file already enables `cv11` and other alternates (`globals.css:159`). Keep them.

### 5.3 Keep your line length in check

**Principle.** 45 to 75 characters per line for anything that reads as a sentence.

**Violation here.** Minor today, a risk after translation.

- In the caught-up state the detail sentence is 76 characters on one line across an 830 px panel (`TodayPanel.tsx:34-35`, seen in `?preview=caught-up`). The plan allows 30 to 40% growth for `es-419` (`PLAN.md` section 6). That makes about 100 characters on one line.
- No sentence on the dashboard has a max width.

**Fix.** Add `max-w-[60ch]` to every `Text` that holds a sentence inside the hero and the empty states. `ch` tracks the font, so it holds across languages that use Latin script. Fewer sentences (section 7) is the larger fix.

### 5.4 Baseline, not center

**Principle.** When text of different sizes shares a line, align the baselines.

**Status.** Mostly followed. The count and its phrase use `items-baseline` (`TodayPanel.tsx:101`), as do "5% mastered" and "of 1,000 cards" (`FocusDeckCard.tsx:67`).

**Violation here.** The deck row centers everything (`DeckList.tsx:112`, `@2xl:items-center`). The 12 px badge text and the 12 px "20% mastered" are centered against a two line block (16 px title over 14 px "Last studied"), so they line up with neither line of text.

**Fix.** Once "Last studied" is gone the row is one line of text. Then use `@2xl:items-baseline` on the row and `self-center` on the button and the progress bar only.

### 5.5 Line-height is proportional

**Principle.** Small text needs more line height, large text needs less. One global value is wrong for both.

**Violation here.** `globals.css:167-169` sets `p { line-height: 1.65; }` for every paragraph. Tailwind's size utilities override it in most places, because each `text-*` class carries its own line height. It still applies wherever a `<p>` has no size class, for example `Text variant="muted"` (`packages/ui/src/components/text.tsx:11`), which is used for "About 4 minutes" and the greeting's status line. Those render at 16 px with a 26.4 px line, looser than the 14 px text beside them at 20 px. The spacing between lines of the same block is then set by an accident of which variant was used.

**Fix.** Remove the global `p` rule or scope it to long-form content, for example `.prose p`. Let the type scale tokens carry line height (section 8.1): 1.0 for the display number, 1.25 for 24 px, 1.4 to 1.5 for 16 and 14 px.

### 5.6 Not every link needs a color

**Principle.** Reserve link color for real links that matter. Do not color text that is not interactive.

**Violation here.** "Added this month" under the New cards statistic is blue (`ProgressTrends.tsx:88`, `detailClassName="text-primary"`). It is the only blue sentence on the page. It is not a link and it is not more important than "+2% from last week" beside it. A reader will try to click it.

**Fix.** Remove the `text-primary` override. Blue text on this page then means "you can press this" and nothing else: tertiary buttons and the TODAY label's replacement, which is gone.

### 5.7 Align with readability in mind

**Principle.** Left align text in general. Center only short, standalone blocks. Right align numbers in columns.

**Status and fix.** Left alignment is used throughout, which also suits the logical properties already in the code (`ps-11`, `me-1`). Two refinements. In the deck list, right align the due and new counts in their subgrid column with `justify-self-end tabular-nums`, so "16 due" and "8 due" line up on the digits. If the hero's right zone holds the ring, center that zone's content (`items-center text-center`). It is a short standalone block, which is the case the book allows.

### 5.8 Use letter-spacing effectively

**Principle.** Tighten tracking on large headlines. Widen it on small uppercase text. Leave body text alone.

**Status.** Partly followed. The count has `tracking-tight` (`TodayPanel.tsx:102`). The uppercase 12 px trend labels have `tracking-wide` (`ProgressTrends.tsx:31`).

**Violation here.** Tracking is set by tag in `globals.css:161-166`. An `h2` gets -0.015em whatever its size, and an `h3` gets none. So the 14 px uppercase "TODAY" inherits a negative value and has to cancel it with `tracking-wide`, and the 16 px `h2` "7 words keep slipping" is tightened by 0.24 px while the 16 px `h3` "Daily goal" beside it is not.

**Fix.** Tracking by size, carried in the scale tokens: -0.03em at 48 px and up, -0.015em at 24 px, 0 at 14 to 20 px, +0.04em only on 12 px uppercase codes like "ES". Avoid uppercase for words that will be translated. It has no meaning in Japanese and hurts word shape recognition for weak eyes.

---

## 6. Chapter 5: Working with Color

Final values belong to the color research. This section says what the book's rules imply for this page.

### 6.1 Ditch hex for HSL (today: OKLCH)

**Principle.** Work in a color space where you can change one property (lightness, saturation, hue) and predict the result.

**Status.** Followed in syntax. Every token is OKLCH. Not followed in practice, because the values were copied from hex colors and the comments still think in hex (see section 0: the comments and the values disagree). There is no ramp, so nobody is using the "change lightness, keep hue" benefit yet.

**Fix.** Drop the hex comments. Define ramps by stepping L and easing C at a fixed hue (section 6.3).

### 6.2 You need more colors than you think

**Principle.** A real interface needs 8 to 10 greys, 5 to 10 shades of each primary color, and 5 to 10 shades of each accent color.

**Violation here.** Count what exists in light mode (`globals.css:72-107`):

- Greys: lightness 0.236, 0.491, 0.916, 0.962, 0.985, 1.0. Six values. Four of them sit between 0.916 and 1.0, and there is nothing between 0.491 and 0.916. That gap is the missing third text color and the missing visible border. The cluster at the top is why every surface looks the same.
- Primary: 0.488 (base), 0.697 (sky), 0.971 (tint). Three values. No dark shade for text on a tint, no hover shade, no mid tint for a visible panel.
- Accents: success, warning, destructive and streak have one shade each. A tinted callout needs at least a light background shade and a dark text shade of the same hue.

**Fix.** Three ramps to start. Roughly 11 neutral steps, 11 primary steps, and 5 steps each for one warm accent (streak and tricky words) and success.

### 6.3 Define your shades up front

**Principle.** Pick the base, then the darkest and lightest, then fill the gaps, for nine or so named steps. Never generate shades on the fly.

**Violation here.** Shades are generated on the fly with opacity: `ring-foreground/10`, `bg-primary/80` on hover, `border-muted-foreground/40`, `bg-muted/50`, `border-foreground/10`. Each one is a new, unnamed color whose contrast depends on what is behind it.

**Fix.** A named neutral ramp at hue 261. The lightness steps below are starting points. They are close to Tailwind's slate ramp as I remember it, which I did not re-verify in this session.

| Step | L | C | Role on the dashboard |
| --- | --- | --- | --- |
| 0 | 1.00 | 0 | Raised surfaces: hero, cards |
| 50 | 0.985 | 0.004 | Unused as page color in the new scheme |
| 100 | 0.965 | 0.008 | **Page background** (was 0.985) |
| 200 | 0.925 | 0.012 | Wells: hero's second zone, progress track, chip fills |
| 300 | 0.87 | 0.016 | Visible borders on inputs and secondary buttons |
| 400 | 0.71 | 0.025 | Disabled text, placeholder, dashed "upcoming" dot |
| 500 | 0.50 | 0.03 | Tertiary text. Do not go lighter: 0.55 fails 4.5:1 on the page color. |
| 600 | 0.42 | 0.03 | Secondary text |
| 700 | 0.37 | 0.04 | Dark theme: raised surface 3 |
| 800 | 0.29 | 0.045 | Dark theme: raised surface 2, hero |
| 900 | 0.24 | 0.05 | Dark theme: cards. Light theme: body text |
| 950 | 0.20 | 0.045 | Dark theme: page |

The single most useful change in this table is moving the page from 0.985 to about 0.965 while cards stay at 1.0. That alone roughly doubles the lightness step between page and card (1.5% to 3.5%). In WCAG terms the card to page ratio goes from 1.04:1 to 1.11:1 by my calculation. That is still subtle on its own, which is why it is paired with a shadow. Semantic tokens (`--background`, `--card`, `--muted`) then point at ramp steps, so shadcn components keep working.

Opacity shorthand is still fine for tints of the primary on a known surface (`bg-primary/10` on a card). It is not fine for borders and text.

### 6.4 Don't let lightness kill your saturation

**Principle.** Very light and very dark shades look washed out unless saturation rises as lightness moves away from the middle. Rotating hue slightly also helps.

**Violation here.**

- Light end: the hero tint is `oklch(0.971 0.013 264)`. A chroma of 0.013 at that lightness is close to grey, which is why the panel does not read as "blue panel", only as "slightly different white".
- Dark end: the dark page is `oklch(0.175 0.025 261)`. The owner calls it near-black slate. I sampled example-02, the navy people liked. Its page reads about `oklch(0.25 0.054 266)` and its cards about `oklch(0.22 0.045 268)`. So the liked navy is 0.04 to 0.08 lighter and has about twice the chroma of Memli's dark page. (Sampled from an AI image, so treat as a direction, not a spec.)

**Fix.**

- If a light blue surface is wanted anywhere, use at least C 0.03 at L 0.93 to 0.95, so it is visibly blue.
- Dark ramp: page about L 0.20 to 0.22 with C 0.045 to 0.055 at hue 264 to 268. Raise chroma as surfaces get lighter up to about L 0.30, then ease off.

### 6.5 Greys don't have to be grey

**Principle.** Tint greys cool or warm to give the interface a temperature.

**Status.** Followed. Every neutral has hue 261 and some chroma. Keep that. The tint only needs to be stronger at the dark end, as above.

### 6.6 Accessible doesn't have to mean ugly

**Principle.** To keep contrast without making small elements shout, flip them: dark text of a hue on a light tint of the same hue, instead of white text on a solid fill. On colored surfaces, rotate hue toward a brighter one to gain contrast instead of going to white.

**Violation here.** The "8 due" badge (white on solid primary) and the met-day dots (white check on solid primary) both use the loud form for quiet information.

**Fix.** The tinted recipes in section 3.4. For the hero's supporting text use a hand-picked same-hue color (section 3.3).

A warning for dark mode from the measurements: muted text in dark passes WCAG at 4.89:1 to 5.78:1, yet scores only about Lc 43 to 45 on APCA. APCA's published guidance puts Lc 60 as the floor for text people are meant to read and Lc 75 for body text at 14 to 16 px. Much of the page's 12 and 14 px text is muted. So in dark mode the secondary text needs to be lighter than today's L 0.68 to be comfortable for someone like Karen. By my calculation L 0.78 on the proposed navy surfaces gives about Lc 59 to 62 and 6.9:1 to 8.9:1 on WCAG. This is the dual check the owner asked for: pass WCAG as the legal floor, then use APCA to catch the cases WCAG is known to be lenient on, which is light text on dark.

### 6.7 Don't rely on color alone

**Principle.** Always pair color with a second cue: an icon, a shape, a word.

**Status.** Mostly followed, and the plan demanded it (`PLAN.md` section 5). Week dots carry a check icon and a hidden label (`ThisWeek.tsx:139-141`). Status chips carry words. Today's dot differs by shape (ring against dashed).

**Violation here.**

- The mastery bar separates "mastered" from "learning" by two blues at 2.48:1 against each other, in light and in dark. The legend dots repeat the same two blues. In greyscale the two segments merge.
- In dark mode the bar inverts in meaning. "Not started" is drawn at L 0.637 (`--chart-4`, `globals.css:136`), brighter than the "learning" segment at L 0.488. The empty part of the bar is now the most visible part. See the dark screenshot: a long grey bar with a small dark blue piece.
- "+2% from last week" has no arrow (`ProgressTrends.tsx:71-75`).

**Fix.** One filled color on a quiet track for the dashboard bar, with the number as text beside it. In dark, the track must be darker than the fill, not lighter: track about L 0.30, fill the primary. If trend deltas stay, add an up or down arrow icon and a sign.

---

## 7. Copy: from 217 words to about 95

This is the direct answer to problem 1. Every row cites the book section that justifies it.

| Current text | Words | Change | Why (book section) |
| --- | --- | --- | --- |
| "Good evening, Phillip" | 3 | Keep, at 18 px | Separate visual from document hierarchy |
| "About 4 minutes of review keeps your 12-day streak going." | 10 | Remove | Both facts are shown again within 300 px. Not all elements are equal. |
| "Studying" + five chips | 6 | Replace with one select showing "All languages" in the deck list header | Labels are a last resort. You don't have to fill the whole screen. |
| "TODAY" | 1 | Remove visually | Labels are a last resort |
| "24 cards ready to review" | 5 | "24 cards to review" | Shorter, same meaning |
| "About 4 minutes" | 3 | Keep | It answers "how long will it take", the plan's core question |
| "16 from Spanish Core 1000", "8 from Japanese Hiragana & Katakana" | 11 | Remove from the hero | The deck rows show "16 due" and "8 due" one scroll below |
| "Start review" | 2 | Keep | Primary action |
| "Learn 10 new words" | 4 | Keep, as secondary | Semantics are secondary |
| "Starts in Spanish Core 1000." | 5 | Keep only when cards span decks, as tertiary text | It prevents a surprise. It is the one explanation that earns its place. |
| "Continue learning" | 2 | Remove | A heading for one item |
| Focus card: "Last studied 2 hours ago", "16 Due", "10 New today", "5% mastered of 1,000 cards", "52 mastered, 148 learning, 800 not started" | 24 | One row: "Spanish Core 1000, 16 due, 10 new, 5% mastered" | Labels are a last resort. Don't design too much. |
| "Other decks" | 2 | "Your decks" (or the word the owner picks instead of deck) | One list, one label |
| Three rows with "Last studied ..." | 9 words of "last studied" | Remove "Last studied" from rows | Tertiary detail that no row action depends on |
| "This week" | 2 | Keep as a small label in the hero's second zone | |
| "24 of 50", "Daily goal", "26 more cards to reach today's goal." | 12 | "24 of 50" in the ring and "Daily goal" under it | The sentence restates the ring: 50 minus 24 |
| "Streak 12 days" | 3 | "12-day streak" | Fold label into value |
| "Words mastered 100" | 3 | "100 words mastered" | Fold label into value |
| "7 words keep slipping" | 4 | Keep | Already a folded label |
| "You've forgotten these a few times. A new mnemonic can help them stick." | 13 | Remove until the callout has an action | Don't design too much |
| Five words + "and 2 more" | 8 | Three words + "and 4 more" | |
| "Your progress trends" and three stat boxes | 22 | Remove from the dashboard | Don't design too much |

My count of the proposed default state is about 95 visible words, 5 visible headings and 6 to 7 controls, against 217 words, 12 headings and 9 controls today. The exact number depends on deck titles.

None of the proposed strings uses an em dash, per the owner's rule for customer-facing copy.

---

## 8. Proposed scales

### 8.1 Type scale

Six sizes, two weights plus bold for the display number. Tailwind v4 lets a size token carry its own line height, tracking and weight.

| Token / class | Size | Line height | Tracking | Weight | Color | Used for |
| --- | --- | --- | --- | --- | --- | --- |
| `text-display` | 48 px phone, 72 px from `sm` | 1.0 | -0.03em | 700 | hero foreground | The due count. Nothing else. |
| `text-2xl` | 24 px (20 px on phone) | 1.25 | -0.015em | 600 | hero foreground | "cards to review", caught-up and empty-state headlines |
| `text-lg` | 18 px | 1.35 | 0 | 600 | foreground | Greeting, primary button label |
| `text-base` | 16 px | 1.5 | 0 | 600 or 400 | foreground | Deck titles (600), supporting line in hero (400), secondary button (600) |
| `text-sm` | 14 px | 1.45 | 0 | 600 or 400 | secondary or tertiary | Section labels (600), "16 due" (600), "5% mastered", "About 4 minutes" on phone, tertiary buttons (600) |
| `text-xs` | 12 px | 1.35 | +0.04em | 600 | secondary | Only non-sentence glyphs: "ES" language codes and weekday initials. Never a phrase. |

Removed from the dashboard: 20 px and 30 px, and weight 500. Target: 10 text styles or fewer, down from 23.

```css
@theme {
  --text-display: 4.5rem;
  --text-display--line-height: 1;
  --text-display--letter-spacing: -0.03em;
  --text-display--font-weight: 700;
}
```

Phone override on the element: `text-5xl sm:text-display`.

Why 14 px is the floor for phrases: a reviewer said light pages make words disappear. Today 12 px muted text appears 12 times in `main`. APCA's guidance (cited in section 6.6) puts the smallest sizes at the highest contrast needs. The cheapest way to pass is not to use 12 px for anything that must be read.

### 8.2 Spacing scale

Eight steps. Each is at least 25% from its neighbor, and each has one job.

| Step | px | Tailwind | Job |
| --- | --- | --- | --- |
| 1 | 4 | `1` | Icon to its text. Number to its unit. |
| 2 | 8 | `2` | Items in a tight set: chips, weekday dots, title to its one-line meta |
| 3 | 12 | `3` | A label to the thing it labels. Buttons in a row. |
| 4 | 16 | `4` | Parts inside one surface. Row padding. Phone page gutter. |
| 5 | 24 | `6` | Sub-groups inside a surface. Card padding. Desktop page gutter. |
| 6 | 32 | `8` | Hero padding on desktop. Text block to action block inside the hero. |
| 7 | 48 | `12` | Section to section. Column gap. |
| 8 | 64 | `16` | Page top and bottom on desktop. |

Not allowed on the dashboard: `0.5`, `1.5`, `2.5`, `3.5`, `5`, `11`. Control heights are a separate short list: 44 px (`h-11`) for tertiary and row actions, 48 px (`h-12`) for secondary, 56 px (`h-14`) for the primary.

### 8.3 Elevation scale

The book's rules: light comes from above, shadows mean "closer to you", use about five fixed levels, and build each from two parts (a tight dark one for the contact edge and a large soft one for the cast shadow). At low elevation the tight part dominates. At high elevation the soft part does.

Shadows are tinted with the neutral hue instead of pure black, which fits "greys don't have to be grey".

```css
:root {
  --sh: 0.25 0.04 261;                       /* shadow ink, light theme */
  --elev-1: 0 1px 2px oklch(var(--sh) / 0.10), 0 1px 1px oklch(var(--sh) / 0.06);
  --elev-2: 0 1px 3px oklch(var(--sh) / 0.10), 0 6px 12px -4px oklch(var(--sh) / 0.10);
  --elev-3: 0 2px 4px -1px oklch(var(--sh) / 0.08), 0 14px 28px -8px oklch(var(--sh) / 0.16);
  --elev-4: 0 4px 8px -2px oklch(var(--sh) / 0.08), 0 24px 40px -12px oklch(var(--sh) / 0.22);
  --elev-5: 0 32px 64px -16px oklch(var(--sh) / 0.30);
  --elev-cta: 0 1px 2px oklch(0.30 0.12 264 / 0.45), 0 8px 16px -6px oklch(0.488 0.243 264 / 0.45);
  --elev-cta-hover: 0 2px 4px oklch(0.30 0.12 264 / 0.45), 0 12px 22px -8px oklch(0.488 0.243 264 / 0.55);
  --elev-cta-pressed: 0 1px 1px oklch(0.30 0.12 264 / 0.50);
  --edge-cta: inset 0 1px 0 oklch(0.62 0.19 264);   /* lit top edge, hand-picked lighter blue */
}
.dark {
  --sh: 0 0 0;
  --elev-1: 0 1px 2px oklch(var(--sh) / 0.40);
  --elev-2: 0 1px 3px oklch(var(--sh) / 0.40), 0 8px 16px -6px oklch(var(--sh) / 0.45);
  --elev-3: 0 2px 4px -1px oklch(var(--sh) / 0.40), 0 16px 32px -8px oklch(var(--sh) / 0.55);
  /* 4 and 5 follow the same pattern */
  --edge-card: inset 0 1px 0 oklch(1 0 0 / 0.06);  /* faint lit top edge on dark cards */
}
@theme inline {
  --shadow-e1: var(--elev-1);
  --shadow-e2: var(--elev-2);
  --shadow-e3: var(--elev-3);
  --shadow-e4: var(--elev-4);
  --shadow-e5: var(--elev-5);
  --shadow-cta: var(--elev-cta);
  --shadow-cta-hover: var(--elev-cta-hover);
  --shadow-cta-pressed: var(--elev-cta-pressed);
  --inset-shadow-cta: var(--edge-cta);
}
```

The `@theme inline` block follows the pattern the file already uses for colors (`globals.css:11-66`), so `shadow-e2` and `inset-shadow-cta` become real utilities and switch with the theme. The numbers are starting values to tune by eye in the browser. The `oklch(var(--sh) / a)` form should be checked in the build. If it does not parse, write the three channels out in full.

| Level | Class | Used for |
| --- | --- | --- |
| 0 | none, or `bg-muted` for wells | Page. Sunken areas: hero's second zone, progress tracks. |
| 1 | `shadow-e1` | Deck list, aside cards. Replaces `ring-1 ring-foreground/10`. |
| 2 | `shadow-e2` | The hero. A hovered deck row. |
| 3 | `shadow-e3` | Dropdown menus: account, theme, language select. A sticky action bar on phones, if added. |
| 4 | `shadow-e4` | Dialogs and sheets |
| 5 | `shadow-e5` | Reserved: toasts, dragged items |
| CTA | `shadow-cta inset-shadow-cta` | The one primary button |

Two details from the book's depth chapter, as reported in the reader notes:

- The lit top edge of a raised button should be a hand-picked lighter shade of the button color, not semi-transparent white, because white overlay drains the saturation. That is why `--edge-cta` is a blue.
- On press, the shadow shrinks and the button moves down 1 px. The Button base already has `active:translate-y-px` (`button.tsx:8`).

---

## 9. Chapters 6 to 8: depth, images, finishing touches

### 9.1 Emulate a light source, and shadows convey elevation

**Principle.** Raised things have a lighter top edge and a shadow beneath. The closer something is to the user, the larger and softer its shadow.

**Violation here.** The dashboard has no shadows. I measured `box-shadow: none` on Start review. Cards are outlined with a 1 px ring (`card.tsx:17`). The only shadows in the app shell are on dropdown menus (`packages/ui/src/components/dropdown-menu.tsx:47`) and the study screen's reveal button. So the screen that should say "start here" is the flattest screen in the product.

**Fix.** The elevation scale in section 8.3. Hero at level 2, lists and aside cards at level 1, the primary button with its own recipe.

### 9.2 Even flat designs can have depth

**Principle.** Without any shadow, lighter than the background reads as raised and darker reads as sunk.

**Violation here.** In light mode the page is L 0.985, cards are 1.0 and the Today panel is 0.971. So cards are slightly raised and the hero is slightly sunk. The most important region is the only one that sits below the page. In dark mode the order is right by accident (page 0.175, card 0.236, panel 0.291), but the panel shares its color with the trend cards, the muted chips and the ring track, because `--secondary`, `--muted` and `--accent` are one value (`globals.css:119-125`).

**Fix.** One rule for both themes: importance goes up with lightness.

| Surface | Light | Dark |
| --- | --- | --- |
| Wells (tracks, second zone) | 0.925 | 0.17 |
| Page | 0.965 | 0.21 |
| Cards, lists | 1.0 | 0.25 |
| Hero | 1.0 plus the level 2 shadow and an accent edge | 0.30, with more chroma than the cards |
| Menus | 1.0 plus level 3 shadow | 0.33 |

In light mode white cannot go lighter, so the hero is set apart by shadow size and its accent border. In dark mode shadows are nearly invisible, so the hero is set apart by lightness and chroma. That is what "never just invert" means in practice here: each theme uses the depth cue that works on its own background.

### 9.3 Overlap elements to create layers

**Principle.** Let an element cross the edge of its container or a background band. It creates a sense of layers.

**Violation here.** Every box sits fully inside its parent. Nothing overlaps.

**Fix, pick one, not all.**

- A shallow tinted band behind the top of the page (`absolute inset-x-0 top-0 h-40 bg-primary/6`, or a subtle `bg-linear-to-b from-primary/8 to-transparent`), with the hero card starting inside the band and extending below it. The hero then visibly sits on top of something.
- Tricky word mnemonic thumbnails, when they exist, as an overlapping stack: `flex -space-x-2` with `ring-2 ring-card` on each. The ring is the book's "invisible border" between overlapping images.
- On phones, a sticky Start review bar that overlaps the scrolling content with `shadow-e3`, once the hero scrolls away. Check it against the mobile doc before adopting.

### 9.4 Don't overlook empty states

**Principle.** An empty state is a first impression. Give it an illustration or image and one clear action. Hide controls that do nothing yet.

**Violation here.**

- `no-decks`: a headline, a sentence and a button 190 px wide inside a pale panel (`TodayPanel.tsx:250-268`). No picture. A brand new learner's first screen is the plainest one in the app.
- `caught-up`: a headline and a sentence, then two outline buttons (`TodayPanel.tsx:234-248`, `:180-232`). This is the reward moment, the one screen where the product should feel pleased with the learner, and it looks like a notice.
- Good: the language filter hides with fewer than two languages (`dashboard.tsx:133-135`), the deck list and tricky words hide when empty (`DeckList.tsx:144-146`, `MemoryCallout.tsx:28-30`). That is exactly what the book asks for.

**Fix.**

- `no-decks`: an illustration or a large icon in a tinted shape (`size-16 rounded-2xl bg-primary/10 text-primary` holding a `size-8` icon), the headline, one line, and the full primary button recipe on "Browse community decks".
- `caught-up`: fill the hero's main zone with the completed goal ring at a large size and a check, in the success color, with "You're all caught up". Optional extra study stays below as secondary and tertiary buttons. No primary button, on purpose, because the right next step is to stop.
- Scale icons the way the book says: do not blow a 16 px outline icon up to 64 px. Put a 24 to 32 px icon in a shape.

### 9.5 Add color with accent borders

**Principle.** A thin strip of color on one edge adds identity cheaply.

**Fix.**

- Hero: `border-t-4 border-primary`. In a design that is otherwise white and grey, this plus the button is enough color to mark the top of the page.
- Tricky words callout: `border-s-4 border-warning` (or the streak orange). `border-s` is the logical property, so it flips for right-to-left languages, which the plan asks for (`PLAN.md` section 6).
- The focus deck row in the list: `border-s-4 border-primary` instead of a separate card. One strip replaces a heading, a card and four labels.

### 9.6 Decorate your backgrounds

**Principle.** Change the background color of a region, use a gentle gradient between two close hues (within about 30 degrees), or add a low contrast pattern.

**Fix.** Sparingly, and only for the hero.

- Dark theme hero: `bg-linear-to-br from-[oklch(0.32_0.08_262)] to-[oklch(0.28_0.09_280)]`. The two hues are 18 degrees apart. This is where the "rich navy" people liked can live.
- Light theme hero: keep it white. Use the band from section 9.3 behind it for color.
- A faint large shape in the hero's corner at 3 to 5% opacity, marked `aria-hidden`, is the playful touch closest to example-01 without adding content.

### 9.7 Use fewer borders

**Principle.** Separate things with shadow, a background change or more space before reaching for a line.

**Violation here.** Lines in the first screen: the sidebar's right border and its footer's top border (`AppSidebar.tsx:139`, `:210`), four chip borders, the outline button border, three card rings, the divider inside the week card (`ThisWeek.tsx:204`), and below the fold the list ring plus two row dividers (`DeckList.tsx:156`). About fourteen lines, all at 1.22:1 to 1.28:1. They are too faint to organize and numerous enough to add texture. That texture is part of "busy".

**Fix.**

| Line | Replace with |
| --- | --- |
| Card rings | `shadow-e1` on a white card over the darker page |
| Week card's `border-t` | Not needed once streak and goal sit in the hero's second zone on a different background |
| Deck row `divide-y` | `gap-2` between rows that are each `rounded-xl bg-card shadow-e1`, or keep one container and use `py-4` rows with no divider and a hover fill. Test both at twelve decks with `?preview=many-decks`. |
| Sidebar border | Background step only |
| Chip borders | Gone if the filter becomes a select |

### 9.8 Supercharge the defaults, and think outside the box

**Principle.** Replace stock elements with something specific to the product. Question the default shape of a component.

**Ideas that fit this page, in order of value.**

1. The language badge. A grey rounded square with "ES" is the default. Example-01's illustrated deck art is what Crystal called fun. A middle path that needs no artwork: give each deck a tinted tile (`size-12 rounded-xl` with a tint derived from the deck, the code in `font-bold`). The code stays, so color is not the only cue. When community mnemonic images exist, use one as the deck's thumbnail.
2. Deck rows as large press targets. Make the whole row the link (the title is the link, stretched with a pseudo-element), with a chevron at the end, instead of a small outline button at the far right. Easier for non-technical users and for thumbs.
3. The week dots already replace a default list with a custom mark. Keep them.
4. The count as an object: a small stack of cards drawn behind the number, three offset rounded rectangles. It says "cards" without a word and gives the hero a shape of its own. Decorative, so `aria-hidden`.

### 9.9 Working with Images (for when images arrive)

The dashboard has no photos today. Three of the five liked examples do. If a mnemonic image or deck art is added to the hero (Crystal circled it in example-04):

- **Everything has an intended size.** Fix the container, crop the image: `aspect-square w-28 rounded-xl object-cover`.
- **Beware user-uploaded content.** Community images will have any background color. Add `ring-1 ring-inset ring-black/10` (in dark `ring-white/10`) so a white image does not bleed into a white card.
- **Text needs consistent contrast.** Never put the count or the button on top of a photo. If a caption must overlay an image, put a dark overlay under it. The study screen's caption frame (issue #50) will face the same rule.

---

## 10. The 12 highest impact changes, ranked

Ranked by how much each one moves the owner's four problems. P1 busy, P2 contrast, P3 dark mode, P4 focal point.

| # | Change | Fixes | Book basis | Where |
| --- | --- | --- | --- | --- |
| 1 | **One hero.** Merge Today and This week into a single raised surface that spans the content width. Left zone: count, time, actions. Right zone: goal ring, week, streak. | P4, P1 | Start with a feature. Not all elements are equal. You don't have to fill the whole screen. | `dashboard.tsx:131-165`, `TodayPanel.tsx`, `ThisWeek.tsx` |
| 2 | **A primary button that looks primary.** 56 px tall, at least 224 px wide, full width on phones, 18 px semibold, two part colored shadow, lit top edge, darker on hover. Demote "Learn 10 new words" to a tinted secondary and row actions to tertiary. | P4 | Semantics are secondary. Emulate a light source. | `button.tsx`, `TodayPanel.tsx:52`, `DeckList.tsx:83-98` |
| 3 | **Spend solid blue once.** Selected chip, week dots, "8 due" badge and bar segments move to tints or neutral. Only Start review is solid primary. | P4, P2 | De-emphasize to emphasize. Balance weight and contrast. Accessible doesn't have to mean ugly. | `LanguageFilter.tsx:12`, `ThisWeek.tsx:99-104`, `DeckList.tsx:42` |
| 4 | **Cut the copy to about 95 words.** Remove the status sentence, "TODAY", hero deck chips, "Last studied", the mastery legend, the goal sentence, the tricky words sentence. Fold labels into values. | P1 | Labels are a last resort. Don't design too much. | Section 7 table |
| 5 | **Spread the surfaces apart.** Page to about L 0.965, cards and hero stay white, wells at 0.925. Replace rings with shadows. | P2 | You need more colors than you think. Use fewer borders. Even flat designs can have depth. | `globals.css:72-107`, `card.tsx:17` |
| 6 | **Three text colors, two weights, 14 px floor.** Darker secondary, new tertiary, no weight 500, no 12 px phrases. | P2, P1 | Size isn't everything. Establish a type scale. | `globals.css`, `text.tsx`, section 8.1 |
| 7 | **One deck list.** Fold the focus deck card into the list as its first row with an accent edge. Delete "Continue learning". | P1, P4 | Labels are a last resort. Add color with accent borders. | `FocusDeckCard.tsx`, `DeckList.tsx` |
| 8 | **Headings become labels.** The h1 greeting drops to 18 px. Section h2s drop to 14 px semibold secondary. Tags stay. | P1, P4 | Separate visual hierarchy from document hierarchy. | `heading.tsx:39-44`, `globals.css:161-166` |
| 9 | **Three distances.** 12 px label to content, 16 to 24 px inside a surface, 48 px between sections. Align column tops. Phone gutter 16 px. | P1 | Avoid ambiguous spacing. Establish a spacing system. Relative sizing doesn't scale. | `dashboard.tsx:114`, `:132`, section 8.2 |
| 10 | **Design dark as its own theme and show the switch.** Navy with more lightness and chroma (about L 0.21, C 0.05). Elevation by lightness. Hero distinct from every other surface. Track darker than fill. Lighter secondary text. A visible Light, Dark, System control in the account menu, and a toggle in the page header. | P3, P2 | Even flat designs can have depth. Don't let lightness kill your saturation. Don't rely on color alone. | `globals.css:110-147`, `theme-provider.tsx:145`, `AppSidebar.tsx` |
| 11 | **Take trends off the dashboard.** Move the three statistics to a later Progress page. | P1 | Don't design too much. You don't have to fill the whole screen. | `dashboard.tsx:166`, `ProgressTrends.tsx` |
| 12 | **Finish the edges.** Accent border on the hero, designed `no-decks` and `caught-up` states, tinted deck tiles, `rounded-2xl` surfaces, one warm accent. | P4, and the "more fun" feedback | Don't overlook empty states. Supercharge the defaults. Choose a personality. | `TodayPanel.tsx:234-268`, `LanguageBadge.tsx` |

On item 10: the book says nothing about theme switches. The visible control comes from the owner's requirement and from Crystal's feedback ("I always choose the dark option"). The book's contribution is how to build the dark surfaces.

### Acceptance checks that follow from the book

1. Squint test in greyscale at 25% zoom: Start review is found first, the count second.
2. Count solid `bg-primary` elements in the first screen. The answer is 1.
3. Count text styles in `main`. The answer is 10 or fewer.
4. Every spacing class on the dashboard is in the 8 step scale.
5. At 375 px wide, the Start review button's bottom edge is above 420 px, and the first deck row starts above 600 px. (Today the button's bottom edge is at 625 px and the first deck row starts near 1207 px.)
6. The secondary button is not wider than the primary in English and in the longest supported language.
7. In dark mode, the hero's background is not used by any other element.

---

## 11. Phone pass (375 px)

The owner asks for phones to get their own pass. The book's relevant sections are "Relative sizing doesn't scale" and "Start with a feature".

Estimated stack after the changes, using the proposed sizes:

| Block | Height | Running total |
| --- | --- | --- |
| Top bar (existing, measured) | about 69 px | 69 |
| Gap | 16 | 85 |
| Greeting, one line, 18 px | 28 | 113 |
| Gap | 16 | 129 |
| Hero padding top | 20 | 149 |
| Count 48 px and phrase, wrapped to two lines at worst | 80 | 229 |
| "About 4 minutes" | 24 | 253 |
| Gap to actions | 24 | 277 |
| Start review, 56 px, full width | 56 | 333 |
| Gap | 12 | 345 |
| Learn 10 new words, 48 px, full width | 48 | 393 |
| Hero padding bottom | 20 | 413 |
| Week strip inside hero (dots and streak) | about 96 | 509 |
| Gap, then "Your decks" label | 48 + 20 + 12 | 589 |
| First deck row | about 72 | 661 |

So the main action ends near 333 px instead of 625 px, and the first deck row starts near 589 px, which is on screen on a tall phone. I did not verify the visible height of iOS Safari with its toolbars. Treat 600 px as the safe fold until someone checks on a device.

These are estimates from the proposed sizes, not measurements. They need a real check at 375 and 422 px once built, in both themes, and again with `es-419` strings.

---

## 12. What I could not access or verify

- **The book itself.** I worked from the official table of contents, two official preview pages, and three reader summaries. Any specific number I attribute to the book (45 to 75 characters, 8 to 10 greys, five shadow levels, 30 degree gradients, 25% between spacing steps) comes from those summaries. The summaries agree with each other on all of these.
- **The "7 Practical Tips" article.** HTTP 403 from Medium, and the mirror was blocked. From search snippets and memory its tips are: use color and weight instead of size for hierarchy; no grey text on colored backgrounds; offset your shadows; use fewer borders; don't blow up small icons; use accent borders; not every button needs a background color. I did not read the text in this session.
- **Steve Schoger's talks.** Not watched.
- **The `finished` preview state.** My screenshot came back blank, probably taken before the page painted. I did not retry.
- **iOS Safari's visible viewport height.** Not measured.
- **APCA values.** Computed with my own implementation of the public formula, not the official library.
- **Tailwind's slate ramp values** in section 6.3 are from memory.
- **`oklch(var(--sh) / a)`** in the shadow tokens: valid CSS as far as I know, but not built or tested here.
- **The brief's counts** (217 words, 12 headings, 9 controls). I did not recount them. My own count of text styles (23) uses size, weight, color and case, so it is higher than the brief's 15 size and weight pairs.
- **All proposed color and shadow numbers** are starting points chosen by reasoning, not tuned in a browser.

## Sources

Book and authors

- Refactoring UI, Adam Wathan and Steve Schoger. Table of contents and chapter names: https://www.refactoringui.com/
- Official preview, "Labels are a last resort": https://www.refactoringui.com/previews/labels-are-a-last-resort
- Official preview, "Building your color palette": https://www.refactoringui.com/previews/building-your-color-palette
- "7 Practical Tips for Cheating at Design", Wathan and Schoger, Feb 2018 (not retrievable in this session, HTTP 403): https://medium.com/refactoring-ui/7-practical-tips-for-cheating-at-design-40c736799886

Reader notes used to confirm section content

- https://sglavoie-github-io.pages.dev/posts/2023/09/09/book-summary-refactoring-ui/
- https://mutto.fyi/books/refactoring-ui
- https://maibuith.pages.dev/notes/refactoring-ui

Contrast guidance

- APCA in a Nutshell (use-case Lc levels): https://git.apcacontrast.com/documentation/APCA_in_a_Nutshell

Project files read (relative to the repository root)

- `dev/memli/apps/web/src/routes/_app/dashboard.tsx`
- `dev/memli/apps/web/src/routes/_app/-components/TodayPanel.tsx`, `FocusDeckCard.tsx`, `DeckList.tsx`, `DashboardGreeting.tsx`, `LanguageFilter.tsx`, `LanguageBadge.tsx`, `LastStudied.tsx`, `ThisWeek.tsx`, `MemoryCallout.tsx`, `ProgressTrends.tsx`, `AppSidebar.tsx`
- `dev/memli/packages/ui/src/styles/globals.css`
- `dev/memli/packages/ui/src/components/button.tsx`, `card.tsx`, `heading.tsx`, `text.tsx`, `badge.tsx`, `section.tsx`, `dropdown-menu.tsx`
- `dev/memli/apps/web/src/components/theme-provider.tsx`
- `dev/memli/apps/web/src/routes/_session/-components/RevealButton.tsx`
- `dev/memli/docs/product-ux.md`
- `docs/designs/dashboards/README.md`, `PLAN.md`, `example-01.jpeg`, `example-02.png`
- The four current-page screenshots and Crystal's annotated screenshot listed in the brief

Scripts I wrote for the measurements (kept beside this file)

- `scratch/research/scripts/rui_contrast.py`
- `scratch/research/scripts/rui_sample.py`

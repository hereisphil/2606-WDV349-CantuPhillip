# Dashboard plan (#47)

Replaces the equal-weight deck grid from the [Week 1 prototype](../prototypes/images/03%20-%20User%20dashboard%20page.png) with a dashboard that answers one question first: **what should I study right now, and how long will it take?**

Tracking issue: [#47](https://github.com/hereisphil/2606-WDV349-CantuPhillip/issues/47). The work lands as a series of small commits on `47-web-study_deck_card_grid`, one per step below. Each step is shippable on its own: typecheck and lint pass, and the page works in a headless browser.

---

## 1. Why the old layout fails

- Six same-sized deck cards give every deck equal priority. A learner has to scan all of them to find what is due.
- One deck leaves a page of whitespace. Twelve decks push everything else off screen.
- **Review Now** on every card mixes two jobs: reviewing due cards and learning new ones.
- Flag emoji stand for countries, not languages. A Spanish deck with a Spain flag is wrong for a Latin American audience, and Windows does not render flag emoji at all.

## 2. What to keep from the examples

| Source | Idea we keep |
| --- | --- |
| [example-01](./example-01.jpeg) | Two separate actions: **Start review** and **Learn new words**. The deck with the most due cards is larger than the rest. |
| [example-02](./example-02.png) (most popular) | Warm greeting, one prominent active deck, other decks as compact rows. |
| [example-03](./example-03.png) | "84 cards, about 12 minutes, from 2 courses" as the headline. Daily goal ring with weekday dots. Language-code badges (`ES`, `JA`) instead of flags. The "tricky words" callout. |
| [example-04](./example-04.png) | Due, new, and retention side by side on the focus deck. |
| [example-05](./example-05.jpg) | Learning-language switcher, and a clear split between "review" and "continue learning". |

**Left out on purpose:** hero photos, the memory garden, the yearly heatmap, search, upgrade upsells, and forecasts like "380 reviews tomorrow". Forecasts need the FSRS scheduler (MS 3, #112), and the rest compete with the main action.

## 3. Information architecture

Priority from highest to lowest. DOM order matches visual order so keyboard and screen-reader users meet things in the same sequence as sighted users.

1. **Greeting** (`h1`): "Good afternoon, Phillip" plus one status line ("12 minutes keeps your 12-day streak going").
2. **Today panel** (`h2`): due count, estimated minutes, per-deck breakdown, one primary action, one secondary action.
3. **Focus deck** (`h2` "Continue learning"): the single deck that needs attention most.
4. **Other decks** (`h2` "Other decks"): every deck except the focus deck as compact rows, sorted by need. Hidden when the learner has one deck.
5. **This week** (aside, `h2`): streak, daily goal ring, weekday dots.
6. **Memory callout**: "7 words keep slipping. Give them a new mnemonic."
7. **Progress trends** (existing #46 component), moved below the fold.

Layout is mobile-first, one column. At `xl` the page becomes two columns: main (regions 2–4) and a fixed 20rem aside (regions 5–6). Trends span the full width underneath. The split waits for `xl` because the 16rem app sidebar leaves the main column too narrow at `lg`. The page caps at `max-w-7xl` so cards don't stretch across large monitors.

### Focus deck rule

Pick the deck with the most due cards. Break ties by the most recent session. If nothing is due, pick the deck with new cards available, then the most recently studied deck.

### Today panel states

The panel is a discriminated union, not a set of booleans (`react-state.mdc`):

| State | When | Primary action | Secondary action |
| --- | --- | --- | --- |
| `review` | due > 0 | Start review (N cards) | Learn N new words |
| `learn` | due = 0, new cards available | Learn N new words | none |
| `caught-up` | due = 0, no new cards | none (calm "All caught up" message) | none |
| `no-decks` | no decks yet | Browse community decks | none |

Until a cross-deck session exists, **Start review** opens `/study/$courseId?mode=review` for the focus deck. When cards are due in two or more decks, the panel lists them and a "Starts in {deck}" line says where the session begins; with one deck both would repeat the headline. **Learn new words** opens the same route with `?mode=learn`. Add "Add your first deck" and "Browse decks" once those pages exist; until then the panel offers no action it can't keep.

## 4. Data contract

One prototype snapshot for `usr_prototype_01`, shaped like the API response #112 will return. Components take props only, so swapping in TanStack Query later does not touch markup.

```ts
type DashboardDeck = {
  courseId: string
  title: string
  learningLanguage: string // BCP 47, e.g. "es", "ja". Never the UI locale.
  dueCount: number
  newAvailable: number
  masteredCount: number
  learningCount: number
  unseenCount: number
  lastReviewedAt: string | null // ISO 8601 UTC
}
```

Alongside the decks, `dailyGoal` holds the review target and the last 7 days of review counts keyed by the learner's local date, so the week strip doesn't depend on the browser's time zone matching the server's.

The types and the seeded snapshot live in `apps/web/src/routes/_app/-components/dashboard-metrics.ts`. Derived values are pure functions in `dashboard-model.ts` next to it, not stored state: `estimateMinutes`, `totalDue`, `totalMastered`, `todayState`, `selectFocusDeck`, `sortDecks`. They move into `@workspace/core` when that package is restored in MS 3.

## 5. Accessibility requirements

- Exactly one `h1`; each region is a `section` labeled by its `h2`.
- No `role="status"` on static content. Live regions are only for changes the user did not cause.
- Progress bars expose text, for example `aria-valuetext="64% mastered"`. The stacked mastered/learning/new bar gets one text summary, not three unlabeled segments.
- Color is never the only signal: status chips carry text, weekday dots carry a check icon and a hidden label ("Monday, goal met").
- Repeated buttons have unique accessible names: "Review 12 cards in Spanish Core 1000", not twelve "Review" buttons.
- Text written in the learning language, such as sample words and mnemonics, carries `lang` (for example `lang="es"`) so screen readers pronounce it correctly. Deck titles are usually written in the UI language ("Spanish Core 1000" is English), so they don't get the learning language's `lang`.
- Text contrast at least 4.5:1 in light and dark themes. Targets at least 24 by 24 px, primary actions 44 px tall.
- Works at 320 px wide and 200% zoom without horizontal scrolling.
- The goal ring respects `prefers-reduced-motion`.

## 6. i18n readiness (no library yet)

The library choice is still open in `dev/memli/docs/i18n.md`. Until then, write code that a library can replace without restructuring:

- Keep each component's strings in one `messages` object with whole-sentence templates and `{placeholders}`. No sentence concatenation.
- Plurals through `Intl.PluralRules`, numbers and percentages through `Intl.NumberFormat`, "2 hours ago" through `Intl.RelativeTimeFormat`, weekday initials through `Intl.DateTimeFormat`. All read the viewer's `uiLocale`.
- Store timestamps as ISO in UTC and format at display time.
- Allow 30–40% longer text for `es-419`: buttons and chips wrap or grow, nothing has a fixed width.
- The learning-language switcher says "Studying: Spanish", so it cannot be mistaken for the UI language setting.
- Logical CSS properties (`ms-`, `me-`, `ps-`, `pe-`) where direction matters, so RTL stays possible later.

## 7. Step-by-step commits

Each step is one commit tagged `[web]` or `[ui]` with `Refs #47`. Check the matching task on the issue in the same turn the commit lands.

CI runs Knip, which fails on exports nothing imports. So each selector lands in the same step as the component that first uses it, never ahead of it.

1. **Greeting and formatters.** Add a `displayName` to the prototype viewer, a `useFormatters()` hook built on `Intl`, and the per-component `messages` pattern. Render the greeting `h1` (morning, afternoon, or evening in the viewer's local time) with a status line from the due count and streak. Start `dashboard-model.ts` with `estimateMinutes`.
2. **Data contract and page skeleton.** Add seeded decks to the dashboard contract and derive the due and mastered totals from them with `totalDue` and `totalMastered`, so the numbers can't disagree. Set the region order and the mobile-first grid with the `xl` two-column split. Move the banner, quick stats, and trends into their slots. Drop `role="status"` from the banner.
3. **Today panel.** Add `todayState`, with the focus rule it depends on, and replace `DueReviewAlert` with a `TodayPanel` driven by it. Due count, minutes, per-deck breakdown, primary and secondary actions. Add a `/study/$courseId` placeholder route with a `mode` search param so both actions have a destination until #48 lands.
4. **Focus deck card.** Export `selectFocusDeck` and add a larger card for it, with a language-code badge, the stacked mastery bar and a text legend, "Last studied" time, and the one action that fits its state. Hide that action when the Today panel's primary action already opens the same session, which is always true until cross-deck review exists. Add `percent`, `languageName`, and `relativeTime` to `useFormatters()`.
5. **Deck list rows.** Add `sortDecks` and compact rows sorted by it for every deck except the focus deck: language-code badge, title, last studied, status chip, mini progress bar, contextual action with a unique accessible name. Columns align through a CSS subgrid and switch on the list's own width (container query), not the viewport. Hidden when there is one deck. The badge and "Last studied" line become shared components.
6. **This week aside.** Streak, daily goal ring, and weekday dots whose first day and names come from the UI locale (`Intl.Locale` week info, falling back to Monday). Fold in the "Learned" and "Daily goal" quick stats so the numbers appear once, and remove `LearningQuickStats`. The sidebar streak is removed on every page (decided); the greeting keeps its streak line, with the streak in bold through a `<b>` rich-text tag, because on mobile the aside sits below the decks. The contract's `dailyGoal` gains `days`: the last 7 days as local `YYYY-MM-DD` dates with review counts.
7. **Memory callout and trends.** Tricky-words callout from seeded data. Move `ProgressTrends` below the fold.
8. **Edge states.** No decks, caught up, goal met, one deck, twelve decks, long titles, large numbers. Add a DEV-only `?preview=` search param that switches the seeded snapshot, so each state can be shown and checked.
9. **Learning-language filter.** Shown only when decks span two or more learning languages. Stored in a `?studying=` search param, not component state.
10. **Accessibility and docs pass.** Keyboard walk, axe run in headless Brave, 320 px and 200% zoom, dark-mode contrast, reduced motion. Update `dev/memli/docs/roadmap.md` (it still says "Study Deck Grid") and `docs/changelog.md`.

## 8. Open decisions

- **Rank card.** "Top 5% among Spanish learners" invites comparison and needs cohort data we do not have. Keep, soften, or drop it.
- **Cross-deck review.** A single "review everything due" session needs a route beyond `/study/$courseId`. Decide before MS 3.
- **Step 9 timing.** The language filter only matters for multi-language learners and can move to a later issue if MS 2 runs short.

## 9. Out of scope for #47

- Real data, loading, and error states: #112 (MS 3). Components stay prop-driven so the swap is local.
- The study session itself: #48 and #49.
- An i18n library and `es-419` catalogs: Phase 2 in `dev/memli/docs/i18n.md`.
- A full `/decks` management page with tabs and archive.

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
4. **Other decks** (`h2` "Your decks"): compact rows, sorted by need. Hidden when the learner has one deck.
5. **This week** (aside, `h2`): streak, daily goal ring, weekday dots.
6. **Memory callout**: "7 words keep slipping. Give them a new mnemonic."
7. **Progress trends** (existing #46 component), moved below the fold.

Layout is mobile-first, one column. At `lg` the page becomes two columns: main (regions 2–4) and a fixed-width aside (regions 5–6). Trends span the full width underneath.

### Focus deck rule

Pick the deck with the most due cards. Break ties by the most recent session. If nothing is due, pick the deck with new cards available, then the most recently studied deck.

### Today panel states

The panel is a discriminated union, not a set of booleans (`react-state.mdc`):

| State | When | Primary action | Secondary action |
| --- | --- | --- | --- |
| `review` | due > 0 | Start review (N cards) | Learn N new words |
| `learn` | due = 0, new cards available | Learn N new words | none |
| `caught-up` | due = 0, no new cards | none (calm "All caught up" message) | Browse decks |
| `no-decks` | no decks yet | Add your first deck | Browse community |

Until a cross-deck session exists, **Start review** opens `/study/$courseId` for the focus deck.

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

Derived values are pure functions in `apps/web/src/routes/_app/-components/dashboard-model.ts`, not stored state: `selectFocusDeck`, `sortDecks`, `todayState`, `estimateMinutes`. They move into `@workspace/core` when that package is restored in MS 3.

## 5. Accessibility requirements

- Exactly one `h1`; each region is a `section` labeled by its `h2`.
- No `role="status"` on static content. Live regions are only for changes the user did not cause.
- Progress bars expose text, for example `aria-valuetext="64% mastered"`. The stacked mastered/learning/new bar gets one text summary, not three unlabeled segments.
- Color is never the only signal: status chips carry text, weekday dots carry a check icon and a hidden label ("Monday, goal met").
- Repeated buttons have unique accessible names: "Review 12 cards in Spanish Core 1000", not twelve "Review" buttons.
- Deck titles and sample words in the learning language carry `lang` (for example `lang="es"`) so screen readers pronounce them correctly.
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

1. **Greeting and formatters.** Add a `displayName` to the prototype viewer, a `useFormatters()` hook built on `Intl`, and the per-component `messages` pattern. Render the greeting `h1` (morning, afternoon, or evening in the viewer's local time) with a status line from the due count and streak. Start `dashboard-model.ts` with `estimateMinutes`.
2. **Data contract and page skeleton.** Finish `dashboard-model.ts` (types, seeded snapshot, `selectFocusDeck`, `sortDecks`, `todayState`). Set the region order and the mobile-first grid with the `lg` two-column split. Move the existing banner, quick stats, and trends into their slots. Drop `role="status"` from the banner.
3. **Today panel.** Replace `DueReviewAlert` with a `TodayPanel` driven by `todayState`. Due count, minutes, per-deck breakdown, primary and secondary actions. Add a `/study/$courseId` placeholder route so **Start review** has a destination until #48 lands.
4. **Focus deck card.** Larger card for `selectFocusDeck`, with a language-code badge, the stacked mastery bar and a text legend, the deck title in its `lang`, and the one action that fits its state.
5. **Deck list rows.** Compact rows sorted by `sortDecks`: language-code badge, title, status chip, mini progress bar, contextual action with a unique accessible name. Hidden when there is one deck.
6. **This week aside.** Streak, daily goal ring, and locale-aware weekday dots. Fold in the "Learned" and "Daily goal" quick stats so the numbers appear once.
7. **Memory callout and trends.** Tricky-words callout from seeded data. Move `ProgressTrends` below the fold.
8. **Edge states.** No decks, caught up, goal met, one deck, twelve decks, long titles, large numbers. Add a DEV-only `?preview=` search param that switches the seeded snapshot, so each state can be shown and checked.
9. **Learning-language filter.** Shown only when decks span two or more learning languages. Stored in a `?studying=` search param, not component state.
10. **Accessibility and docs pass.** Keyboard walk, axe run in headless Brave, 320 px and 200% zoom, dark-mode contrast, reduced motion. Update `dev/memli/docs/roadmap.md` (it still says "Study Deck Grid") and `docs/changelog.md`.

## 8. Open decisions

- **Rank card.** "Top 5% among Spanish learners" invites comparison and needs cohort data we do not have. Keep, soften, or drop it.
- **Sidebar streak.** The sidebar already shows the streak. Either the dashboard aside owns it and the sidebar copy hides on `/dashboard`, or both stay.
- **Cross-deck review.** A single "review everything due" session needs a route beyond `/study/$courseId`. Decide before MS 3.
- **Step 9 timing.** The language filter only matters for multi-language learners and can move to a later issue if MS 2 runs short.

## 9. Out of scope for #47

- Real data, loading, and error states: #112 (MS 3). Components stay prop-driven so the swap is local.
- The study session itself: #48 and #49.
- An i18n library and `es-419` catalogs: Phase 2 in `dev/memli/docs/i18n.md`.
- A full `/decks` management page with tabs and archive.

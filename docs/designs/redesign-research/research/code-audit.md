# Code audit: the current `/dashboard`

> **Correction.** The brief given to the researchers wrongly described one respondent as older and as having weak eyesight. That remark in the chat was the owner's, about himself. Statements in this file that relied on it have been corrected. See `feedback-examples.md`, section 2.

Scope: every file that renders or styles `/dashboard` today. Read-only. Nothing in the repository was changed.

All paths are relative to `dev/memli/` unless they start with `/`. Short names used below:

| Short name | Full path |
| --- | --- |
| `dashboard.tsx` | `apps/web/src/routes/_app/dashboard.tsx` |
| `_app.tsx` | `apps/web/src/routes/_app.tsx` |
| `-components/X` | `apps/web/src/routes/_app/-components/X` |
| `theme-provider.tsx` | `apps/web/src/components/theme-provider.tsx` |
| `globals.css` | `packages/ui/src/styles/globals.css` |
| `ui/X.tsx` | `packages/ui/src/components/X.tsx` |
| `_session/X` | `apps/web/src/routes/_session/-components/X` |

How the numbers were produced:

- Code facts come from reading the files. Each has a `file:line` reference.
- "Measured" facts come from the running dev server at `http://localhost:5173/dashboard` (light theme, 1440x900 and 375x812), read with `getComputedStyle` and `getBoundingClientRect`.
- Contrast figures come from a small script that converts the OKLCH tokens to sRGB and applies the WCAG 2.x formula and the APCA-W3 0.1.9 formula. The script is at `scratch/scripts/contrast.mjs`. See "Could not verify" at the end for its limits.

---

## 0. The ten findings that matter most

1. **The primary blue is not reserved for the primary action.** 14 elements on the default page are filled with the exact `--primary` color: the logo tile, the "All languages" chip, "Start review", the "8 due" badge, five week dots, the mastery bar segment, its legend dot, and three mini progress bars (measured; classes at `LanguageFilter.tsx:12`, `ui/badge.tsx:13`, `ThisWeek.tsx:100`, `FocusDeckCard.tsx:52`, `DeckList.tsx:61`, `brand-mark.tsx:31`). The "All languages" chip is 120x36 px. "Start review" is 126x44 px. They are almost the same size and sit 32 px apart. This is the code-level cause of "the eye is not drawn to one thing".
2. **Text contrast is fine. Surface contrast is not.** Every text pair passes WCAG AA in both themes (lowest: 4.89:1). But the four light surfaces (page, sidebar, Today panel, card) sit between OKLCH lightness 0.962 and 1.0. Panel against page is 1.04:1. Card borders are 1.22:1 to 1.28:1. So regions do not separate. That is what "not enough contrast" looks like in the tokens (`globals.css:72-105`).
3. **The page has no elevation at all.** The only `box-shadow` values on the dashboard are 1 px rings (`ring-1 ring-foreground/10`) on four cards and a 2 px ring on today's dot (measured). "Start review" has `box-shadow: none` and a flat `bg-primary` (`ui/button.tsx:12`). The shared `Button` has no size above 36 px, so three call sites override it by hand (`TodayPanel.tsx:52`, `FocusDeckCard.tsx:122`, `_session/AnswerForm.tsx:75`).
4. **The same fact is printed two or three times.** Minutes x2, streak x2, 16 due x2, 8 due x2, 10 new x2, mastered count as 5% and as 52, deck name "Spanish Core 1000" x3. About 9 of the 31 metric numbers on the page are repeats or can be derived from a neighbor (section 3).
5. **Two different facts both read "24".** 24 cards are due (16 + 8). 24 cards were studied today. Both show as a big bold "24" (`TodayPanel.tsx:102-104`, `ThisWeek.tsx:88-90`, seed at `dashboard-metrics.ts:97,109,144`). This is a seed-data coincidence, but it shows the two numbers have no visual difference in kind.
6. **The "Continue learning" card has no control in the default state.** `showAction` is false when Today's action leads to the same session (`dashboard.tsx:140-145`, `FocusDeckCard.tsx:185-187`). The heading promises an action. The card has nothing to click (measured: zero links or buttons inside).
7. **Dark mode cannot be discovered and flashes on load.** There is no visible control. `useTheme()` is exported but never called (`theme-provider.tsx:210`; only `main.tsx:25` imports the provider). The app forces `defaultTheme="light"`, so the OS preference is ignored (`main.tsx:25`). There is no pre-paint script, no `color-scheme`, and no `theme-color` meta (`apps/web/index.html:1-13`).
8. **The hidden "d" shortcut is a single-letter key shortcut with no off switch** (`theme-provider.tsx:131-168`). That is the pattern WCAG 2.1.4 Character Key Shortcuts (Level A) is about.
9. **"Deck" appears in 11 UI strings and the nav.** The sidebar item that opens `/dashboard` is labelled "Decks" (`AppSidebar.tsx:37,50-51`). The same item is called "card" when reviewing and "word" when learning (section 8).
10. **The token comments are wrong.** `--primary: oklch(0.488 0.243 264.376)` is commented `#2563EB`. It converts to `#1447E6`. `--foreground` is commented `#1E293B` and converts to `#181E2A`. `--muted-foreground` is commented `#64748B` and converts to `#576173` (`globals.css:17-23,72-97`). Anyone tuning contrast from the comments is working from the wrong colors.

---

## 1. Component map

### 1.1 Render tree (default state)

```
__root.tsx                         Outlet + dev-only Router Devtools + DevPreviewsMenu
└─ _app.tsx  AppLayout             div.flex min-h-dvh (column on phones, row from md)
   ├─ AppSidebar                   <aside aria-label="Application sidebar">
   └─ <main>
      └─ dashboard.tsx  Dashboard  <Section width="wide" padding="compact"> gap-8
         ├─ PreviewSwitcher        DEV only, when ?preview= is set
         ├─ DashboardGreeting      <header> h1 + one muted sentence
         └─ grid xl:[1fr 20rem]
            ├─ column (gap-8)
            │  ├─ LanguageFilter   role="group", only when 2+ learning languages
            │  ├─ TodayPanel       <section> h2 "Today"
            │  ├─ FocusDeckCard    <section> h2 "Continue learning" + Card
            │  └─ DeckList         <section> h2 "Other decks" + ul
            └─ <aside aria-label="Your progress"> (gap-6)
               ├─ ThisWeek         <section> h2 "This week" + Card
               └─ MemoryCallout    <section> h2 "{n} words keep slipping"
         └─ ProgressTrends         <section> h2 "Your progress trends" + dl of 3 tiles
```

Source: `__root.tsx:24-33`, `_app.tsx:9-18`, `dashboard.tsx:113-170`.

When there are no decks, only the greeting and a `max-w-2xl` Today panel render (`dashboard.tsx:125-128`).

### 1.2 Files

| File | Renders | Props | Data it reads |
| --- | --- | --- | --- |
| `dashboard.tsx` (171 lines) | Page shell and layout grid. Picks the data source, applies the language filter, derives everything the children need. | none (route component). Search params: `preview` (DEV only), `studying` (BCP 47 tag) `:37-58` | `useViewer()` for `displayName`, `streakDays` `:63,76`. `prototypeDashboardMetrics` or a preview snapshot `:66-75`. Model functions `:80-111`. |
| `_app.tsx` (18) | App shell: sidebar + `<main>` `:11-16` | none | none |
| `-components/AppSidebar.tsx` (245) | Sidebar on desktop (`md:w-64`, sticky, full height). Top bar on phones. Logo, 2 nav links, account menu. | none | `useViewer()` for `username`, `plan` `:132`. Own `useState` for the phone nav menu `:134`. |
| `-components/DashboardGreeting.tsx` (77) | `<header>`: h1 greeting by time of day, one status sentence | `name`, `hasDecks`, `dueCount`, `streakDays`, `now` `:39-45` | `estimateMinutes(dueCount)` `:55`. Note: `dueCount` is `totalDue(allDecks)`, the unfiltered total (`dashboard.tsx:121`). |
| `-components/LanguageFilter.tsx` (65) | "Studying" label + pill links. Writes `?studying=`. | `languages: readonly string[]` `:18-23` | `useViewer().uiLocale` for sorting `:24,28`. `languageName()` from formatters. |
| `-components/TodayPanel.tsx` (301) | The tinted panel. Four states: `review`, `learn`, `caught-up`, `no-decks` `:270-281` | `state: TodayState` `:283` | Everything comes from `TodayState`. Links to `/study/$courseId?mode=review\|learn\|practice` and `/community`. |
| `-components/FocusDeckCard.tsx` (191) | "Continue learning": language badge, deck title, last studied, Due and New today, mastery bar with legend, optional action | `deck`, `now`, `showAction` `:138-147` | `deckAction`, `deckTotal`, `masteredRatio` `:9-14` |
| `-components/DeckList.tsx` (163) | "Other decks": one row per deck with badge, title, last studied, status chip, mini progress, Review or Learn button. Returns `null` when empty `:144-146`. | `decks`, `now` `:137-143` | `deckAction`, `masteredRatio` `:8` |
| `-components/LanguageBadge.tsx` (36) | Square badge with the ISO code ("ES"). Full name is `title` and `sr-only` only. | `tag`, `size?: "default" \| "lg"` `:16-22` | `Intl.Locale(tag).language` `:11-13`, `languageName()` |
| `-components/LastStudied.tsx` (28) | "Last studied 2 hours ago" or "Not started yet" | `at: string \| null`, `now` `:10-16` | `relativeTime()` from formatters |
| `-components/ThisWeek.tsx` (227) | "This week" card: goal ring, "Daily goal" sentence, 7 week dots, Streak and Words mastered | `days`, `target`, `now`, `clearedToday`, `streakDays`, `wordsMastered` `:149-164` | `studiedOn`, `weekDays` `:9-14`. `firstDayOfWeek` from the UI locale `:165`. |
| `-components/MemoryCallout.tsx` (73) | "7 words keep slipping": bulb icon, one sentence, word chips, "and N more". Returns `null` at 0 `:28-30`. | `total`, `words: readonly TrickyWord[]` `:19-25` | none beyond props |
| `-components/ProgressTrends.tsx` (93) | "Your progress trends": three gray tiles (Consistency, Retention, New cards) | spread of `ProgressTrendsData` `:44-50` | none beyond props |
| `-components/PreviewSwitcher.tsx` (31) | DEV-only strip of links between the 11 preview states | `current: PreviewName` | `previewNames` |
| `-components/dashboard-model.ts` (225) | Pure functions and types. No React. | see section 7 | `@/lib/dates` |
| `-components/dashboard-metrics.ts` (193) | The data contract types and the seeded prototype data | see section 7 | `@/lib/dates` |
| `-components/dashboard-previews.ts` (261) | 11 seeded states for `?preview=` | `previewNames` `:111-123` | base metrics |
| `apps/web/src/components/session-provider.tsx` | `useViewer()`. Seeded viewer: `displayName: "Phillip"`, `plan: "pro"`, `uiLocale: "en"`, `streakDays: 12` `:18-26` | | |
| `apps/web/src/lib/formatters.ts` | `useFormatters()`: `number`, `percent`, `languageName`, `duration`, `relativeTime`, `weekday`, `firstDayOfWeek`, `format`, `plural`, `rich` `:184-195`. All use `Intl` with the viewer's `uiLocale`. | | |
| `apps/web/src/components/brand-mark.tsx` | Logo: blue rounded tile with a `BookOpen` icon + literal "Memli" `:28-38` | `size`, `wordClassName` | |
| `apps/web/src/components/plan-badge.tsx` | Amber "Pro" pill. Literal string, palette colors `:9-14` | `plan` | |

### 1.3 Shared UI components used by the dashboard

| Component | What the dashboard gets from it | Line |
| --- | --- | --- |
| `Section` | `mx-auto w-full px-6`, `max-w-7xl` (wide), `py-8` (compact) | `ui/section.tsx:6-17` |
| `Heading` | `font-heading text-balance`. Size by level: h1 `text-3xl`, h2 `text-2xl`, h3 `text-xl`, h4 `text-lg`. Default weight bold. | `ui/heading.tsx:6-25,39-44` |
| `Text` | `body` 16px/leading-7, `lead`, `muted` (color only, inherits size), `small` (14px muted) | `ui/text.tsx:6-18` |
| `Card` | `rounded-xl bg-card text-sm ring-1 ring-foreground/10`, padding from `--card-spacing` (16px). No shadow. | `ui/card.tsx:17` |
| `Button` | Base: `rounded-lg border border-transparent text-sm font-medium`, focus ring `ring-3 ring-ring/50`, `active:translate-y-px`. Variants: `default` (flat `bg-primary`, hover `bg-primary/80`), `outline`, `secondary`, `ghost`, `destructive`, `link`. Sizes: `xs` 24px, `sm` 28px, `default` 32px, `lg` 36px, plus icon sizes. | `ui/button.tsx:7-43` |
| `Badge` | `h-5 rounded-4xl px-2 text-xs font-medium`. Variants `default` (solid primary), `secondary`, `outline`, etc. | `ui/badge.tsx:8-29` |
| `Avatar` | 32px circle, user icon fallback | `ui/avatar.tsx:19,51` |
| `DropdownMenu*` | Base UI Menu. Already exports `DropdownMenuRadioGroup`, `DropdownMenuRadioItem` (with a check indicator), `DropdownMenuCheckboxItem`, `DropdownMenuSub*`, `DropdownMenuShortcut`. None of these are used yet. | `ui/dropdown-menu.tsx:160-262` |

Not used by the dashboard: `Input`, `Label`, `Spinner`.

---

## 2. Copy inventory

### 2.1 Every string, by component

Word counts treat a `{placeholder}` as one word. "Shown" says whether it appears on the default page.

**`dashboard.tsx:33-35`**

| Key | String | Words | Shown |
| --- | --- | --- | --- |
| `aside` | Your progress | 2 | aria-label only (`:154`) |

**`DashboardGreeting.tsx:9-22`**

| Key | String | Words | Shown |
| --- | --- | --- | --- |
| `greeting.morning` | Good morning, {name} | 3 | by time of day |
| `greeting.afternoon` | Good afternoon, {name} | 3 | by time of day |
| `greeting.evening` | Good evening, {name} | 3 | yes |
| `keepStreak.other` | About {duration} of review keeps your **{count}-day streak** going. | 9 (10 rendered) | yes |
| `startStreak` | About {duration} of review starts a new streak today. | 9 | streak = 0 |
| `caughtUp` | Nothing is due right now. Your memory is in good shape. | 11 | nothing due |
| `welcome` | Welcome to Memli. Let's find your first deck. | 8 | no decks |

**`LanguageFilter.tsx:6-9`**

| Key | String | Words | Shown |
| --- | --- | --- | --- |
| `label` | Studying | 1 | yes |
| `all` | All languages | 2 | yes |
| (from `Intl.DisplayNames`) | French, Japanese, Portuguese, Spanish | 4 | yes |

**`TodayPanel.tsx:10-50`**

| Key | String | Words | Shown |
| --- | --- | --- | --- |
| `heading` | Today | 1 | yes |
| `dueLabel.one / other` | card ready to review / cards ready to review | 4 | yes |
| `duration` | About {duration} | 2 (3 rendered) | yes |
| `fromDeck` | {count} from {deck} | 3 | yes, x2 |
| `moreDecks.one / other` | and {count} more deck / decks | 4 | 4+ due decks |
| `startReview` | Start review | 2 | yes |
| `learnNew.one / other` | Learn {count} new word / words | 4 | yes |
| `startsIn` | Starts in {deck}. | 3 | yes |
| `nothingDue` | Nothing to review right now | 5 | learn state |
| `newReady.one / other` | {count} new word is ready in {deck}. / {count} new words are ready in {deck}. | 7 | learn state |
| `caughtUp` | You're all caught up | 4 | caught-up state |
| `caughtUpDetail` | New reviews show up here as your memory needs them. Check back later today. | 14 | caught-up state |
| `keepGoing` | Want to keep going in {deck}? | 6 | caught-up state |
| `learnMore.one / other` | Learn {count} more new word / words | 5 | caught-up state |
| `learnMoreCost` | Each new word adds a few short reviews over the coming weeks. | 12 | caught-up state |
| `practiceTricky.one / other` | Practice {count} tricky word / words | 4 | caught-up state |
| `noDecks` | You don't have any decks yet | 6 | no decks |
| `noDecksDetail` | Find a deck to start building your vocabulary. | 8 | no decks |
| `browseCommunity` | Browse community decks | 3 | no decks |

**`FocusDeckCard.tsx:18-49`**

| Key | String | Words | Shown |
| --- | --- | --- | --- |
| `heading` | Continue learning | 2 | yes |
| `due` | Due | 1 | yes |
| `newToday` | New today | 2 | yes |
| `mastered` | {percent} mastered | 2 | yes |
| `totalCards.one / other` | of {count} card / cards | 3 | yes |
| `legend.mastered` | {count} mastered | 2 | yes |
| `legend.learning` | {count} learning | 2 | yes |
| `legend.unseen` | {count} not started | 3 | yes |
| `review.one / other` | Review {count} card / cards | 3 | only when `showAction` |
| `reviewLabel.one / other` | Review {count} card(s) in {deck} | 5 | aria-label |
| `learn.one / other` | Learn {count} new word / words | 4 | only when `showAction` |
| `learnLabel.one / other` | Learn {count} new word(s) in {deck} | 6 | aria-label |
| `caughtUp` | Nothing due in this deck. New reviews arrive as you need them. | 12 | deck caught up |

**`DeckList.tsx:12-28`**

| Key | String | Words | Shown |
| --- | --- | --- | --- |
| `heading` | Other decks | 2 | yes |
| `due.other` | {count} due | 2 | yes |
| `new.other` | {count} new | 2 | yes |
| `caughtUp` | Caught up | 2 | yes |
| `mastered` | {percent} mastered | 2 | yes, x3 |
| `review` | Review | 1 | yes |
| `reviewLabel.one / other` | Review {count} card(s) in {deck} | 5 | aria-label |
| `learn` | Learn | 1 | yes |
| `learnLabel.one / other` | Learn {count} new word(s) in {deck} | 6 | aria-label |

**`LastStudied.tsx:5-8`**

| Key | String | Words | Shown |
| --- | --- | --- | --- |
| `lastStudied` | Last studied {time} | 3 (4 to 5 rendered) | yes, x4 |
| `notStarted` | Not started yet | 3 | never-studied deck |

**`ThisWeek.tsx:16-42`**

| Key | String | Words | Shown |
| --- | --- | --- | --- |
| `heading` | This week | 2 | yes |
| `goalTitle` | Daily goal | 2 | yes |
| `goalOf` | of {target} | 2 | yes |
| `goalStudied` | studied | 1 | cleared early |
| `goalRemaining.one / other` | {count} more card(s) to reach today's goal. | 8 (7 rendered) | yes |
| `goalMet` | Today's goal is done. Extra study still counts. | 8 | goal met |
| `goalCleared` | You finished everything scheduled today, so the goal counts as done. | 11 | cleared early |
| `weekLabel` | Daily goal this week | 4 | aria-label |
| `day.met` | {day}, goal met | 3 | sr-only |
| `day.missed` | {day}, goal missed | 3 | sr-only |
| `day.in-progress` | {day}, today, in progress | 4 | sr-only |
| `day.upcoming` | {day}, upcoming | 2 | sr-only |
| `todayMet` | {day}, today, goal met | 4 | sr-only |
| `streak` | Streak | 1 | yes |
| `streakDays.one / other` | {count} day / days | 2 | yes |
| `mastered` | Words mastered | 2 | yes |

**`MemoryCallout.tsx:8-16`**

| Key | String | Words | Shown |
| --- | --- | --- | --- |
| `heading.one / other` | {count} word keeps slipping / {count} words keep slipping | 4 | yes |
| `detail` | You've forgotten these a few times. A new mnemonic can help them stick. | 13 | yes |
| `more.other` | and {count} more | 3 | yes |

**`ProgressTrends.tsx:8-16`**

| Key | String | Words | Shown |
| --- | --- | --- | --- |
| `heading` | Your progress trends | 3 | yes |
| `consistency` | Consistency | 1 | yes (uppercased by CSS) |
| `consistencyChange` | {change} from last week | 4 | yes |
| `retention` | Retention | 1 | yes |
| `retentionAverage` | Global average: {percent} | 3 | yes |
| `newCards` | New cards | 2 | yes |
| `newCardsDetail` | Added this month | 3 | yes |

**`AppSidebar.tsx:31-43`**

| Key | String | Words | Shown |
| --- | --- | --- | --- |
| `sidebar` | Application sidebar | 2 | aria-label |
| `primaryNav` | Primary | 1 | aria-label |
| `navigationMenu` | Navigation menu | 2 | aria-label (phones) |
| `accountMenu` | Account menu, @{username} | 3 | aria-label (phones) |
| `accountMenuPrefix` | Account menu, | 2 | sr-only (desktop) |
| `decks` | Decks | 1 | yes |
| `community` | Community Gallery | 2 | yes |
| `profile` | View Profile | 2 | in menu |
| `settings` | Learning Settings | 2 | in menu |
| `plan` | Subscription / Plan | 3 | in menu |
| `signOut` | Sign Out | 2 | in menu |

Literal strings outside any `messages` object: "Memli" (`brand-mark.tsx:37`), "Pro" (`plan-badge.tsx:13`), "@" + username (`AppSidebar.tsx:167,228`). The lint rule `memli/no-literal-ui-strings` only covers `src/routes/_app/**` (`apps/web/eslint.config.js:25`, `docs/i18n.md:83`), so `src/components/` is not checked.

**`settings.tsx:7-10`** (the page a theme control could also live on): "Settings" (1), "Learning preferences and account email will live here." (9).

### 2.2 Totals on the default page (measured, 1440x900)

| Region | Words | Notes |
| --- | --- | --- |
| Greeting | 13 | |
| Language filter | 7 | |
| Today panel | 31 | |
| Continue learning | 29 | includes 1 sr-only word |
| Other decks | 44 | includes 3 sr-only words |
| This week | 48 | includes 16 sr-only words (the weekday labels) |
| Words keep slipping | 25 | |
| Progress trends | 20 | |
| **Main total** | **217** | about 197 are visible, about 20 are screen-reader only |
| Sidebar | 8 | "Memli Decks Community Gallery Account menu, @prototype_learner PRO" |

Other counts (measured):

- 12 headings: 1 h1, 6 h2, 5 h3.
- 84 separate visible text runs in `<main>`.
- 9 interactive controls in `<main>`: 5 filter pills, Start review, Learn 10 new words, Review, Learn.
- 37 numeric tokens in the text.
- Full-sentence helper copy is only 4 sentences, 35 words: the greeting status (10), "Starts in Spanish Core 1000." (5), "26 more cards to reach today's goal." (7), and the tricky-words detail (13).

So the "too much copy" feeling is not long sentences. It is 84 small labelled fragments, 12 headings and 37 numbers competing at once.

### 2.3 Facts that are stated more than once

| Fact | Count | Where |
| --- | --- | --- |
| Review time, "About 4 minutes" | 2 | Greeting sentence (`DashboardGreeting.tsx:55,61-64`) and Today panel (`TodayPanel.tsx:109-111`) |
| Streak, 12 days | 2 | Greeting "12-day streak" (`DashboardGreeting.tsx:16-17`) and This week "Streak 12 days" (`ThisWeek.tsx:206-213`) |
| Spanish due, 16 | 2 | Today chip "16 from Spanish Core 1000" (`TodayPanel.tsx:120-123`) and Focus card "16 Due" (`FocusDeckCard.tsx:168-171`) |
| Japanese due, 8 | 2 visible + 1 aria | Today chip, Other decks chip "8 due" (`DeckList.tsx:42`), aria-label "Review 8 cards in..." (`DeckList.tsx:87`) |
| Spanish new today, 10 | 2 | Today button "Learn 10 new words" (`TodayPanel.tsx:78`) and Focus card "10 New today" (`FocusDeckCard.tsx:174-179`) |
| Total due, 24 | 1 direct + derivable | Headline 24 = 16 + 8, and both parts are listed right under it |
| Spanish mastered | 2 forms | "5% mastered" and "52 mastered" in the same block (`FocusDeckCard.tsx:68-70,96`) |
| Deck size | derivable | "of 1,000 cards" = 52 + 148 + 800, all four shown together (`FocusDeckCard.tsx:71-73,89-99`) |
| Goal progress | 2 forms | Ring "24 of 50" and "26 more cards to reach today's goal." (`ThisWeek.tsx:88-93,198`). 26 = 50 - 24. |
| Tricky words | derivable | "7 words", 5 chips, "and 2 more" (`MemoryCallout.tsx:51,56-69`) |
| Deck name "Spanish Core 1000" | 3 | Today chip, "Starts in Spanish Core 1000.", Focus card title |
| Deck name "Japanese Hiragana & Katakana" | 2 | Today chip, Other decks row |
| The word "mastered" | 6 | "5% mastered", "52 mastered", 3 x "{n}% mastered", "Words mastered" |
| The idea "today" | 4 | "TODAY" heading, "New today", "today's goal", today's ringed dot |
| "Last studied ..." | 4 | once per deck (`LastStudied.tsx:6`) |

A subtle bug-like inconsistency: the greeting uses the unfiltered due total and the Today panel uses the filtered one (`dashboard.tsx:121` vs `:101`). With `?studying=es` the page says "About 4 minutes of review" in the greeting and "16 cards ready to review, About 3 minutes" in the panel (measured). The code comment says this is on purpose (`dashboard.tsx:79`), but a learner sees two different times.

---

## 3. Every number on the default page

37 numeric tokens appear in `<main>` (measured). Three are inside the deck title "Spanish Core 1000". Three are relative times. That leaves 31 metric numbers.

| # | Value shown | Meaning | Source | Size / weight | Duplicate? |
| --- | --- | --- | --- | --- | --- |
| 1 | 4 minutes | review time, all decks | `estimateMinutes(24)`, `dashboard-model.ts:7-12` | 16/400 muted | yes, with #4 |
| 2 | 12-day | streak | `viewer.streakDays`, `session-provider.tsx:25` | 16/600 | yes, with #22 |
| 3 | 24 | cards due, all decks | `totalDue`, `dashboard-model.ts:14-16` | 48/700 | sum of #5 and #6. Same digits as #19. |
| 4 | 4 minutes | review time | `TodayState.minutes` | 16/400 muted | yes, with #1 |
| 5 | 16 | Spanish due | `deck.dueCount` | 14/400 muted | yes, with #8 |
| 6 | 8 | Japanese due | `deck.dueCount` | 14/400 muted | yes, with #14 |
| 7 | 10 | Spanish new today (button label) | `deck.newAvailable` | 16/500 | yes, with #9 |
| 8 | 16 | Spanish due | `deck.dueCount` | 30/700 | yes, with #5 |
| 9 | 10 | Spanish new today | `deck.newAvailable` | 30/700 | yes, with #7 |
| 10 | 5% | Spanish mastered | `masteredRatio` | 18/600 | same fact as #12 |
| 11 | 1,000 | Spanish deck size | `deckTotal` | 14/400 muted | = #12 + #13 + #14a |
| 12 | 52 | Spanish mastered | `deck.masteredCount` | 14/400 muted | same fact as #10 |
| 13 | 148 | Spanish learning | `deck.learningCount` | 14/400 muted | |
| 14a | 800 | Spanish not started | `deck.unseenCount` | 14/400 muted | |
| 14 | 8 | Japanese due (chip) | `deckAction.count` | 12/500 on blue | yes, with #6 |
| 15 | 20% | Japanese mastered | `masteredRatio` (18 of 92) | 12/400 muted | |
| 16 | 10 | French new (chip) | `deckAction.count` | 12/500 | different deck from #7 and #9, same digits |
| 17 | 8% | French mastered | 20 of 250 | 12/400 muted | |
| 18 | 8% | Portuguese mastered | 10 of 120 | 12/400 muted | same digits as #17 |
| 19 | 24 | cards studied today | `studiedOn`, `dashboard-model.ts:181-183` | 24/700 | same digits as #3, different fact |
| 20 | 50 | daily goal target | `dailyGoal.target` | 12/400 muted | |
| 21 | 26 | cards left to reach goal | `target - studiedToday`, `ThisWeek.tsx:167` | 14/400 muted | derivable from #19 and #20 |
| 22 | 12 days | streak | `streakDays` | 18/600 | yes, with #2 |
| 23 | 100 | words mastered, all decks | `totalMastered`, `dashboard-model.ts:18-20` | 18/600 | sum of the per-deck counts |
| 24 | 7 | tricky words | `trickyWords.total` | 16/600 | |
| 25 | 2 more | hidden tricky words | `total - words.length`, `MemoryCallout.tsx:32` | 14/400 muted | derivable |
| 26 | 98% | consistency | `progressTrends` | 24/700 | |
| 27 | +2% | change from last week | `progressTrends` | 14/400 muted | |
| 28 | 84% | retention | `progressTrends` | 24/700 | |
| 29 | 75% | global average | `progressTrends` | 14/400 muted | |
| 30 | 142 | new cards this month | `progressTrends` | 24/700 | |

Plus relative times: "2 hours ago", "yesterday", "3 days ago", "2 weeks ago".

Reading of the table:

- About 9 of the 31 numbers are a repeat of, or can be worked out from, a number right next to them.
- Seven numbers are set at 24 px or larger in bold: 24, 16, 10, 24, 98%, 84%, 142. With the h1 that makes eight big bold items. Only one of them (the first 24) is the thing the page wants the learner to act on.
- Three different bold sizes (48, 30, 24) carry "big stat" meaning. Three more (18/600) carry "medium stat".

---

## 4. Visual inventory

### 4.1 Colors on the page

Text colors in `<main>` (measured): only four.

| Color | Token | Text runs |
| --- | --- | --- |
| `oklch(0.236 0.025 261)` | `--foreground` | 41 |
| `oklch(0.491 0.032 261)` | `--muted-foreground` | 38 |
| `oklch(1 0 0)` | `--primary-foreground` | 3 ("All languages", "Start review", "8 due") |
| `oklch(0.488 0.243 264.376)` | `--primary` / `--accent-foreground` | 2 ("TODAY", "Added this month") |

Almost half the text (38 of 84 runs) is muted gray. There is no third text tone between "dark" and "muted".

Background fills (measured, main plus sidebar):

| Fill | Token | Elements | Used for |
| --- | --- | --- | --- |
| `oklch(0.962 0.007 261)` | `--secondary` / `--muted` / `--sidebar` | 19 | sidebar, language badges, bar tracks, tricky chips, trend tiles, avatar |
| `oklch(0.488 0.243 264.376)` | `--primary` / `--chart-1` | 14 | see finding 1 |
| `oklch(1 0 0)` | `--card` | 6 | Focus card, deck list, This week card, callout, 2 deck chips in Today |
| `oklch(0.985 0.004 261)` | `--background` | 4 | page, outline buttons, today's dot |
| `oklch(0.971 0.013 264)` | `--accent` / `--sidebar-accent` | 2 | Today panel, active nav item |
| `oklch(0.697 0.158 264)` | `--chart-2` | 2 | "learning" bar segment and legend dot |
| `oklch(0.916 0.009 261)` | `--chart-4` | 2 | "not started" bar segment and legend dot |
| amber 500 at 10% | none (palette class) | 1 | Pro badge |

The only non-blue, non-gray color on the page is the orange `--streak-foreground` on two 16 to 20 px icons (`ThisWeek.tsx:210`, `MemoryCallout.tsx:42`) and the amber Pro badge.

### 4.2 Hard-coded colors and non-token classes

| Where | Class or value | Note |
| --- | --- | --- |
| `apps/web/src/components/plan-badge.tsx:11` | `border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-300`, `text-[10px]`, `h-4` | The only Tailwind palette colors in the app shell. 10 px text. |
| `apps/web/src/components/dev-previews-menu.tsx:44` | `bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-600/50` | DEV only. Not shipped (`__root.tsx:19-22`). |
| `globals.css:17-23` | `--color-brand-primary`, `-sky`, `-charcoal`, `-surface`, `-slate`, `-border`, `-tint` | Literal OKLCH copies of the semantic tokens. They do not change in dark mode. Used only by the marketing footer and nav (`_marketing/-components/Footer.tsx:10,16,32`, `site-footer-nav.tsx:13-14`). Not used on the dashboard. |
| `globals.css:158` | `font-family: "Inter Variable", sans-serif` on `body` | Repeats `--font-sans` (`:12`) as a literal. |
| `ui/button.tsx:16` | `hover:bg-[color-mix(in_oklch,var(--secondary),var(--foreground)_5%)]` | Token based, but arbitrary. |
| `ui/button.tsx:27,28,32,34` | `rounded-[min(var(--radius-md),10px)]`, `text-[0.8rem]` | shadcn defaults. |
| `ui/badge.tsx:9` | `focus-visible:ring-[3px]` | shadcn default. |
| `dashboard.tsx:131` | `xl:grid-cols-[minmax(0,1fr)_20rem]` | The 320 px aside is a magic number. |
| `DeckList.tsx:156` | `@2xl:grid-cols-[minmax(0,1fr)_auto_auto_auto]` | Layout only. |
| `ThisWeek.tsx:44-45,72,80` | `RING_RADIUS = 42`, `strokeWidth="8"` | SVG geometry. |

Opacity-modified tokens (these make new, un-named colors): `ring-foreground/10` (`ui/card.tsx:17`, `DeckList.tsx:156`, `MemoryCallout.tsx:37`), `border-foreground/10` (`TodayPanel.tsx:189`), `border-muted-foreground/40` (`ThisWeek.tsx:103`), `ring-ring/50` (`ui/button.tsx:8`, `LanguageFilter.tsx:12`), `hover:bg-primary/80` (`ui/button.tsx:12`), `outline-ring/50` on every element (`globals.css:151`).

Tokens that exist but the dashboard never uses: `--success`, `--warning`, `--destructive`, `--chart-3`, `--chart-5`, `--font-ui`.

Token comment errors (script output):

| Token | Value | Comment says | Actually converts to |
| --- | --- | --- | --- |
| `--primary` (`globals.css:78`) | `oklch(0.488 0.243 264.376)` | `#2563EB` | `#1447E6` |
| `--foreground` (`:73`) | `oklch(0.236 0.025 261)` | `#1E293B` | `#181E2A` |
| `--muted-foreground` (`:83`) | `oklch(0.491 0.032 261)` | `#64748B` | `#576173` |
| `--chart-2` (`:94`) | `oklch(0.697 0.158 264)` | `#60A5FA` | `#6A99FF` |
| `--secondary` (`:80`) | `oklch(0.962 0.007 261)` | `#F1F5F9` | `#F0F3F7` |
| `--border` (`:90`) | `oklch(0.916 0.009 261)` | `#E2E8F0` | `#E0E3E9` |
| `--accent` (`:84`) | `oklch(0.971 0.013 264)` | `#EFF6FF` | `#F1F6FF` |
| `--background` (`:72`) | `oklch(0.985 0.004 261)` | `#F8FAFC` | `#F9FAFD` |

The real colors are darker and less saturated than the comments claim. White on the real primary is 6.82:1. White on `#2563EB` would be 5.17:1.

Out-of-gamut tokens: `--streak-foreground`, `--success`, `--warning` and `--destructive` fall slightly outside sRGB in both themes and are clipped on sRGB screens (script output).

### 4.3 Contrast of the current tokens (computed)

Text (all pass WCAG AA 4.5:1):

| Pair | Light WCAG | Light APCA Lc | Dark WCAG | Dark APCA Lc |
| --- | --- | --- | --- | --- |
| Foreground on page | 15.93 | 100.6 | 16.99 | -99.1 |
| Foreground on card | 16.63 | 103.6 | 14.90 | -97.6 |
| Foreground on Today panel | 15.30 | 97.8 | 12.60 | -95.4 |
| Muted text on page | 5.97 | 78.1 | 6.59 | -46.3 |
| Muted text on card | 6.24 | 81.1 | 5.78 | -44.9 |
| Muted text on Today panel | 5.73 | 75.3 | 4.89 | -42.6 |
| Muted text on trend tile | 5.59 | 73.5 | 4.89 | -42.6 |
| "TODAY" label on panel | 6.27 | 76.6 | 5.12 | -44.8 |
| "Start review" label on button | 6.82 | -87.4 | 6.90 | 50.5 |

Two things stand out in dark mode. Muted text is around Lc 43 to 46, and 38 of the 84 text runs are muted, many at 12 to 14 px. The "Start review" label (dark text on sky blue) is Lc 50.5. WCAG 2.x passes both. APCA scores them much lower than their light-mode twins. The color-science section of the plan should set the thresholds. This audit only reports the numbers.

Surfaces, borders and graphics (WCAG 1.4.11 asks for 3:1 on parts needed to understand a control or graphic):

| Pair | Light | Dark |
| --- | --- | --- |
| Today panel vs page | 1.04 | 1.35 |
| Card vs page | 1.04 | 1.14 |
| Sidebar and trend tiles vs page | 1.07 | 1.35 |
| Card ring (foreground at 10%) vs page | 1.22 | 1.27 |
| `--border` vs card | 1.28 | 1.35 |
| Deck chip (card) vs Today panel | 1.09 | 1.18 |
| Outline button fill vs Today panel | 1.04 | about 1.2 |
| Bar track and ring track vs card | 1.12 | 1.18 |
| "Not started" segment vs track | 1.15 | 4.13 |
| "Learning" segment vs track | 2.46 | 2.06 |
| "Learning" vs "mastered" segment | 2.48 | 2.48 |
| Missed-day dot (`bg-muted`) vs card | 1.11 | 1.18 |
| Upcoming-day dashed border vs card | 1.83 | not computed |
| Flame and bulb icon vs card | 3.08 | 10.07 |
| Focus ring (`ring-ring/50`) vs page | about 2.4 | about 2.6 |
| "Start review" fill vs Today panel | 6.27 | 5.12 |

What this means in plain terms:

- In light mode every container edge is between 1.04:1 and 1.28:1. The page is four shades of near-white.
- The goal ring's empty track and the "not started" part of the mastery bar are nearly invisible in light mode. The missed-day dot is nearly invisible in both themes.
- In the mastery bar, "learning" vs "mastered" is two blues at 2.48:1. The legend relies on color alone to tell them apart.
- In dark mode the Today panel (`--accent`) is the same gray as every muted surface (`--secondary`, `--muted`, `--accent` are all `oklch(0.291 0.025 261)`, `globals.css:119-125`). The panel loses its blue tint and stops being special.
- In dark mode the chart colors swap roles: `--chart-1` becomes the light sky blue and `--chart-2` becomes the dark `#1447E6` (`globals.css:133-134`). The darker "learning" segment is then 2.06:1 against the track.
- The focus ring is the primary color at 50% alpha, around 2.4:1 against the page. The 1 px `border-ring` at full strength helps, but the visible 3 px halo is faint.

### 4.4 Type sizes and weights

15 size/weight pairs in `<main>` (measured). 8 sizes, 4 weights.

| Size / weight | Runs | Used for | Class source |
| --- | --- | --- | --- |
| 48 / 700 | 1 | "24" due headline | `TodayPanel.tsx:102` `text-5xl font-bold tracking-tight` |
| 30 / 700 | 3 | h1 (from `sm`), "16" and "10" in Focus card | `DashboardGreeting.tsx:71`, `FocusDeckCard.tsx:169,177` |
| 24 / 700 | 4 | ring "24", 98%, 84%, 142. Also the h1 on phones and the non-review Today headlines. | `ThisWeek.tsx:88`, `ProgressTrends.tsx:34`, `TodayPanel.tsx:168,242,254` |
| 20 / 700 | 5 | 4 section h2s and the focus deck title h3 | `Heading size="3"`: `FocusDeckCard.tsx:153,160`, `DeckList.tsx:153`, `ThisWeek.tsx:173`, `ProgressTrends.tsx:58-62` |
| 18 / 600 | 3 | "5% mastered", "12 days", "100" | `FocusDeckCard.tsx:68`, `ThisWeek.tsx:207,219` |
| 18 / 500 | 1 | "cards ready to review" | `TodayPanel.tsx:105` |
| 16 / 600 | 6 | "12-day streak", 3 deck row titles, "Daily goal", callout heading | `DashboardGreeting.tsx:25`, `DeckList.tsx:116-120`, `ThisWeek.tsx:185-189`, `MemoryCallout.tsx:44-49` |
| 16 / 500 | 2 | "Start review", "Learn 10 new words" | `TodayPanel.tsx:52` |
| 16 / 400 | 3 | greeting sentence, "About 4 minutes" | `Text variant="muted"` |
| 14 / 600 | 2 | "TODAY", "ES" badge | `TodayPanel.tsx:289-294`, `LanguageBadge.tsx:8,30` |
| 14 / 500 | 13 | filter label and pills, Review and Learn buttons, tricky chips | `LanguageFilter.tsx:12,38`, `ui/button.tsx:8`, `MemoryCallout.tsx:60` |
| 14 / 400 | 19 | all small muted text | `Text variant="small"`, `FocusDeckCard.tsx:71,89,168,174`, `TodayPanel.tsx:118`, `ProgressTrends.tsx:37` |
| 12 / 600 | 4 | JA, FR, PT badges, today's weekday letter | `LanguageBadge.tsx:7,30`, `ThisWeek.tsx:127` |
| 12 / 500 | 6 | status chips, trend labels | `ui/badge.tsx:9`, `ProgressTrends.tsx:31` |
| 12 / 400 | 12 | "{n}% mastered", "of 50", weekday letters, "Streak", "Words mastered" | `DeckList.tsx:65`, `ThisWeek.tsx:91,126,206,216` |

Also in the sidebar: 10 px / 600 ("PRO", `plan-badge.tsx:11`) and 14 / 500 nav links (`AppSidebar.tsx:79`).

Notes:

- 22 of the 84 text runs are 12 px. Karen's feedback was that light backgrounds make the words blend in.
- Heading level and size disagree. The h2 "TODAY" is 14 px. The h2 "7 words keep slipping" is 16 px. The h3 "Spanish Core 1000" is 20 px, the same as its own section h2 "Continue learning".
- `Text variant="muted"` has no size, so it is 16 px on the page and 14 px inside a `Card` (which sets `text-sm`, `ui/card.tsx:17`). `FocusDeckCard.tsx:184` is affected.
- Letter-spacing: `tracking-tight` on big numbers (`TodayPanel.tsx:102`, `ProgressTrends.tsx:34`), `tracking-wide` + `uppercase` on "TODAY" and the trend labels (`TodayPanel.tsx:294`, `ProgressTrends.tsx:31`), global `-0.03em` on h1 and `-0.015em` on h2 (`globals.css:161-166`), global `line-height: 1.65` on every `<p>` (`globals.css:167-169`).
- One font family only: Inter Variable for body and headings (`globals.css:12-13`).

### 4.5 Borders, rings, shadows, radius, spacing

Radius values in use (measured): 5.

| Computed | Class | Elements |
| --- | --- | --- |
| 6.4 px | `rounded-md` (`--radius` x 0.8) | small language badges |
| 8 px | `rounded-lg` | buttons, Today deck chips, tricky chips, large badge, nav links, logo tile |
| 11.2 px | `rounded-xl` (`--radius` x 1.4) | Today panel, cards, deck list, callout, trend tiles, account button |
| 20.8 px | `rounded-4xl` (`--radius` x 2.6) | status chips, Pro badge |
| full | `rounded-full` | filter pills, dots, bars, avatar |

Base radius is `--radius: 0.5rem` (`globals.css:98`).

Shadows (measured): no elevation shadow anywhere on the dashboard.

| What | Class | Where |
| --- | --- | --- |
| 1 px ring, foreground at 10% | `ring-1 ring-foreground/10` | Focus card and This week card (`ui/card.tsx:17`), deck list (`DeckList.tsx:156`), callout (`MemoryCallout.tsx:37`) |
| 2 px ring, primary | `ring-2 ring-primary` | today's dot (`ThisWeek.tsx:102`) |
| none | | Today panel, "Start review", trend tiles, sidebar |

Shadow classes exist elsewhere in the app only on: dropdown menus (`shadow-md`, `shadow-lg`, `ui/dropdown-menu.tsx:47,148`), the session's Reveal button (`_session/RevealButton.tsx:67`), the sign-in card and the marketing flashcard demo.

Borders:

| What | Class | Where |
| --- | --- | --- |
| 1 px `--border` | `border` | filter pills (`LanguageFilter.tsx:12`), outline buttons (`ui/button.tsx:14`) |
| 1 px `--sidebar-border` | `border-b` on phones, `md:border-r` | `AppSidebar.tsx:139`; account block `border-t` `:210` |
| row dividers | `divide-y` | `DeckList.tsx:156` |
| 1 px top | `border-t` | Streak / Words mastered row (`ThisWeek.tsx:204`) |
| 1 px top, foreground at 10% | `border-t border-foreground/10` | keep-going block (`TodayPanel.tsx:189`) |
| 1 px dashed, muted-foreground at 40% | `border border-dashed` | upcoming day dot (`ThisWeek.tsx:103`) |

Padding and gaps are close but not on one scale:

| Container | Padding |
| --- | --- |
| Page section | `px-6 py-8` (`ui/section.tsx:6,16`) |
| Today panel | `p-6`, inner `gap-5` (`TodayPanel.tsx:287`) |
| Focus card | `p-6`, inner `gap-6` (`FocusDeckCard.tsx:156`) |
| This week card | `p-5`, inner `gap-6` (`ThisWeek.tsx:176`) |
| Callout | `p-5`, inner `gap-3` (`MemoryCallout.tsx:37`) |
| Deck row | `p-4` (`DeckList.tsx:112`) |
| Trend tile | `p-4` (`ProgressTrends.tsx:30`) |
| Between regions | `gap-8` in the main column, `gap-6` in the aside (`dashboard.tsx:114,132,154`) |
| Heading to its card | `gap-4` (`FocusDeckCard.tsx:152`, `DeckList.tsx:151`, `ThisWeek.tsx:172`, `ProgressTrends.tsx:56`) |

Three container treatments are used side by side: tinted with no border (Today), white with a ring (four cards), gray with no border (trend tiles).

### 4.6 Layout and sizes (measured)

Desktop, 1440x900:

| Region | x | y | width | height |
| --- | --- | --- | --- | --- |
| Sidebar | 0 | 0 | 256 | 900 |
| Greeting | 280 | 32 | 1121 | 66 |
| Language filter | 280 | 130 | 769 | 36 |
| Today panel | 280 | 198 | 769 | 307 |
| Continue learning | 280 | 538 | 769 | 326 |
| Other decks | 280 | 896 | 769 | 280 |
| Aside (This week + callout) | 1081 | 130 | 320 | 1045 |
| Progress trends | 280 | 1208 | 1121 | 152 |
| Page height | | | | 1392 |

"Start review" is 126x44 inside a 769 px wide panel. It fills 16% of the panel width. The outline button beside it, "Learn 10 new words", is 187 px wide, so the secondary action is physically wider than the primary one.

The two-column grid only starts at `xl` (1280 px, `dashboard.tsx:131`). Between 768 and 1279 px the page is the sidebar plus one long column.

Phone, 375x812:

| Region | y | height |
| --- | --- | --- |
| Top bar (sidebar) | 0 | 69 |
| Greeting | 101 | 89 |
| Language filter (wraps to 2 rows) | 222 | 80 |
| Today panel | 334 | 399 |
| "Start review" button | 581 | 44 (279 wide) |
| "Learn 10 new words" button | 637 | 44 |
| Continue learning | 765 | 350 |
| Other decks | 1147 | 464 |
| This week | 1643 | 343 |
| Words keep slipping | 2010 | 192 |
| Progress trends (3 stacked tiles) | 2234 | 392 |
| Page height | | 2658 (3.3 screens) |

- 333 px are spent before the Today panel begins: top bar, greeting, and a two-row filter.
- "Start review" ends at y = 625. A phone browser with its toolbars showing has less than 812 px of height, so the button is at the edge of the first screen.
- The streak card is two full screens down.
- No horizontal scroll at 375 px.

Control sizes:

| Control | Size | Source |
| --- | --- | --- |
| Start review, Learn N new words | 44 px tall | `TodayPanel.tsx:52` |
| Filter pills | 36 px tall | `LanguageFilter.tsx:12` |
| Review, Learn row buttons | 36 px tall, 64 to 74 px wide | `DeckList.tsx:85` (`size="lg"`) |
| Phone account button | 44x44 | `AppSidebar.tsx:155` |
| Phone menu button | 32x32 | `AppSidebar.tsx:183` (`size="icon"`) |
| Sidebar nav links | about 36 px tall (from the classes `py-2 text-sm`, not measured) | `AppSidebar.tsx:79` |

All meet the project's 24 px floor (`docs/product-ux.md:175`). `PLAN.md:103` asks for 44 px on primary actions only.

### 4.7 The session's primary button, as a pattern to reuse

- **Submit** (`_session/AnswerForm.tsx:72-79`) is the session's real primary: default variant with `h-12 shrink-0 gap-2 rounded-lg px-4 text-base font-semibold sm:px-5` and a trailing `ArrowRight` icon. Solid `bg-primary`. No shadow.
- **Reveal answer** (`_session/RevealButton.tsx:64-80`) is `variant="outline"` and its comment says "Secondary to Submit (one primary action per screen), but still a large, lifted target." Classes: `relative h-12 gap-2.5 rounded-xl bg-card text-base font-semibold shadow-sm hover:-translate-y-0.5 hover:border-primary/40 hover:bg-card hover:text-primary hover:shadow-md active:shadow-sm motion-reduce:transition-none motion-reduce:hover:translate-y-0`. Leading `Eye` icon at `size-5`.
- **Keyboard hint**: a `<kbd aria-hidden="true">` that is `opacity-0` and becomes visible with `group-hover/button:opacity-100 group-focus-visible/button:opacity-100`, placed absolutely so the label does not shift (`RevealButton.tsx:74-79`). The button carries `aria-keyshortcuts="Space"` (`:68`). `SessionHeader.tsx:79-84` does the same for Esc with `hidden group-hover/button:inline`.
- **Progress bar**: `role="progressbar"` with `aria-valuetext`, `h-2 rounded-full bg-muted` track and `bg-primary` fill (`SessionHeader.tsx:95-111`). The dashboard's bars are `aria-hidden` instead.

What is reusable: the 48 px height, `text-base font-semibold`, an icon beside the label, the lift on hover (`shadow-sm` to `shadow-md` plus a half-pixel-step translate), the `motion-reduce` guards, and the hover-or-focus-only `kbd`.

What does not exist yet: a solid primary button with depth. The Reveal button has the depth but is an outline. Submit is solid but flat. The git log line `0731d71` says Reveal was once "the session's solid primary button"; the current code has since changed it to outline. A new `Button` size (for example `xl`, 48 px) or a `hero` variant in `ui/button.tsx` would replace the three hand-written overrides listed in finding 3.

---

## 5. How theming works today

| Question | Answer | Source |
| --- | --- | --- |
| Mechanism | A `light` or `dark` class on `<html>`. Tailwind's dark variant is `@custom-variant dark (&:is(.dark *))`. Tokens are redefined under `.dark`. | `theme-provider.tsx:102-110`, `globals.css:6,110-147` |
| Stored where | `localStorage`, key `"theme"`, value `"light"`, `"dark"` or `"system"` | `theme-provider.tsx:7,20,80-83,89-96` |
| Default | The provider's own default is `"system"`, but the app passes `defaultTheme="light"`. A first-time visitor always gets light, whatever the OS says. | `theme-provider.tsx:87`, `main.tsx:25` |
| System preference | Supported in code: when the theme is `"system"` it reads `prefers-color-scheme` and listens for changes. Unreachable in practice, because nothing ever sets `"system"`. | `theme-provider.tsx:34-40,112-129` |
| Visible control | None. `useTheme()` is exported and never imported anywhere. | `theme-provider.tsx:210-218`; grep for `useTheme` finds no caller |
| Hidden shortcut | Pressing `d` anywhere toggles light and dark and saves it. Ignored when Cmd, Ctrl or Alt is held, on key repeat, and inside inputs, textareas, selects and contenteditable. From `"system"` it jumps to the opposite of the OS setting. There is no way back to `"system"`. | `theme-provider.tsx:131-168`, `:61-78` |
| Cross-tab sync | Yes, through the `storage` event | `theme-provider.tsx:170-193` |
| Transition handling | Transitions are disabled for two frames while the class changes, so the page does not animate between themes | `theme-provider.tsx:42-59,105-109` |
| Pre-paint script | None. `index.html` has no inline script. The class is added in a `useEffect` after React's first render. Before that, `<html>` has no class and `:root` (light) applies. A dark-mode user sees a light flash on every load. | `apps/web/index.html:1-13`, `theme-provider.tsx:112-113` |
| `color-scheme` | Not set anywhere, in CSS or in a meta tag. Measured `getComputedStyle(html).colorScheme` is `normal`. Native scrollbars and form controls stay light in dark mode. | grep; measured |
| `<meta name="theme-color">` | Not set. Phone browser chrome does not follow the theme. | `apps/web/index.html:1-13` |
| `prefers-contrast`, `forced-colors` | Not handled anywhere | grep |
| Reduced motion | Handled per component (`motion-safe:` on the ring, `motion-reduce:` on session buttons and the spinner) | `ThisWeek.tsx:84`, `_session/RevealButton.tsx:67`, `ui/spinner.tsx:26` |
| Tests that depend on this | The axe specs write `localStorage.theme` before load and run every dashboard preview in both themes (12 paths x 2 themes). The storage key and the two class names are a contract with these tests. | `apps/web/e2e/dashboard.a11y.spec.ts:5-22,27-31`, `apps/web/e2e/study.a11y.spec.ts:19-23` |
| Docs | The only written requirement is "Text contrast at least 4.5:1 in light and dark themes." No doc describes a theme control. | `docs/designs/dashboards/PLAN.md:103` |

Dark token notes (`globals.css:110-147`):

- Page `oklch(0.175 0.025 261)` converts to `#0A111B`. Card `oklch(0.236 0.025 261)` converts to `#181E2A`. Chroma is 0.025, so this is near-black slate, not navy.
- `--secondary`, `--muted` and `--accent` are the same value, `oklch(0.291 0.025 261)`. In light mode `--accent` is a blue tint that is different from `--muted`. So the Today panel has its own color in light mode and none in dark mode.
- `--primary` becomes the sky blue `oklch(0.697 0.158 264)` with dark text on top (`--primary-foreground: oklch(0.175 0.025 261)`). The main button changes from white-on-blue to dark-on-light-blue.
- `--border` is white at 10% and `--input` is white at 15%.
- `--chart-1` and `--chart-2` swap (section 4.3).

Other gaps a theme feature will meet:

- The seven `--color-brand-*` utilities are fixed light-theme values (`globals.css:17-23`). The marketing footer uses them. They will not follow the theme.
- The favicon points to `/vite.svg` and `apps/web/public/` does not exist (`apps/web/index.html:5`). The document title is "Memli" on every route.
- `<html lang="en">` is static and is not tied to `viewer.uiLocale`. No `dir` attribute (`apps/web/index.html:2`).

---

## 6. The sidebar, and where a visible theme control could live

### 6.1 What exists (`AppSidebar.tsx`)

Desktop (from `md`, 768 px): a sticky column, `md:w-64 md:h-dvh`, `bg-sidebar`, right border (`:139`).

| Block | Contents | Lines |
| --- | --- | --- |
| Top | Logo link to `/dashboard` (blue tile + "Memli") | `:141-145` |
| Nav (`<nav aria-label="Primary">`) | "Decks" (Layers icon) to `/dashboard`, exact match. "Community Gallery" (Image icon) to `/community`. Active item gets `bg-sidebar-accent text-sidebar-accent-foreground`. | `:45-61,63-101` |
| Empty space | Nothing between the two nav links and the bottom block. On a 900 px tall window that is roughly 650 px of empty gray. | |
| Bottom (`mt-auto`, top border, `p-3`) | One ghost button: avatar, `@username`, "Pro" badge, up-down chevron. Opens a menu upward. | `:210-242` |
| Account menu | View Profile (goes to `/dashboard`, a placeholder), Learning Settings (`/settings`), Subscription / Plan (`/pricing`), separator, Sign Out (`/`) | `:103-129` |

Phone (below `md`): the same `<aside>` becomes a top bar with a bottom border.

| Block | Contents | Lines |
| --- | --- | --- |
| Left | Logo link | `:142-144` |
| Right | Account avatar button, 44x44, opens a menu with `@username`, the Pro badge and the same four items | `:147-175` |
| Right | Hamburger button, 32x32, opens a menu with Decks and Community Gallery | `:177-204` |

Things to know:

- `AccountMenuItems` is one component used by both the desktop and the phone menu (`:173,239`). Anything added there appears in both.
- The nav rail is hidden on phones (`hidden ... md:flex`, `:94`). On a phone the two destinations are inside the hamburger menu.
- There is no bottom tab bar on phones.
- Menu labels are Title Case ("View Profile", "Sign Out", "Community Gallery"). The dashboard itself uses sentence case ("Start review", "Other decks").
- Physical-direction classes: `md:border-r` (`:139`) and `text-left` (`:216`). The rest of the dashboard uses logical ones (`ps-11`, `me-1`).

### 6.2 Where a visible theme control could go

| Option | Where exactly | For | Against |
| --- | --- | --- | --- |
| A. Always-visible switch in the sidebar's bottom block | Inside the `mt-auto` block, above the account button (`AppSidebar.tsx:210`) | Visible without opening anything. This is the bottom-left area Crystal circled in example-02. The sidebar has about 650 px of unused space. | Desktop only. Phones need a second home. |
| B. "Appearance" group in the account menu | A `DropdownMenuRadioGroup` with Light, Dark, System inside `AccountMenuItems` (`AppSidebar.tsx:103-129`) | One change covers desktop and phone. The radio parts already exist (`ui/dropdown-menu.tsx:193-233`). | Hidden behind the avatar. Not discoverable for a non-technical user. |
| C. Icon button in the phone top bar | Next to the avatar and hamburger (`AppSidebar.tsx:146`) | One tap on phones | The bar already has three items at 375 px. A sun or moon icon alone needs a text label for screen readers and is still guesswork for some users. |
| D. Settings page | `/settings` is a placeholder today (`settings.tsx:7-10`) | The expected long-term home, with room for a full explanation | Two navigations away. |

The pieces already in place: `useTheme()` returns `{ theme, setTheme }` and accepts `"light"`, `"dark"`, `"system"` (`theme-provider.tsx:4,14-17,210-218`). Persistence and cross-tab sync are done.

The pieces missing: the context does not expose the resolved theme (what `"system"` currently means), so a control cannot show the right icon or label without re-reading `matchMedia`. The `ResolvedTheme` type exists (`:5`) but is not part of `ThemeProviderState` (`:14-17`).

---

## 7. What a redesign can reuse unchanged

### 7.1 Model functions (`-components/dashboard-model.ts`)

All pure. No React, no copy, no styling.

| Export | Signature | What it gives | Lines |
| --- | --- | --- | --- |
| `estimateMinutes` | `(cardCount: number) => number` | Minutes at 8 seconds per review, at least 1 when anything is due | `:5-12` |
| `totalDue` | `(decks) => number` | Sum of `dueCount` | `:14-16` |
| `totalMastered` | `(decks) => number` | Sum of `masteredCount` | `:18-20` |
| `sortDecks` | `(decks) => DashboardDeck[]` | Most due first, then decks with new cards, then most recently studied | `:35-50` |
| `learningLanguages` | `(decks) => string[]` | Each language once, in first-seen order | `:53-55` |
| `selectFocusDeck` | `(decks) => DashboardDeck \| null` | First deck after `sortDecks` | `:57-61` |
| `deckTotal` | `(deck) => number` | mastered + learning + unseen | `:63-65` |
| `masteredRatio` | `(deck) => number` | 0 to 1, and 0 for an empty deck | `:68-71` |
| `todayState` | `(decks) => TodayState` | The four page states: `review`, `learn`, `caught-up`, `no-decks` | `:110-132` |
| `deckAction` | `(deck) => DeckAction \| null` | Review if due, else learn if new, else nothing | `:141-149` |
| `todayPrimaryAction` | `(state) => DeckAction \| null` | Where the main button leads | `:152-162` |
| `isSameAction` | `(a, b) => boolean` | Lets other regions avoid repeating the main button | `:164-171` |
| `studiedOn` | `(days, date) => number` | Cards studied on a date | `:181-183` |
| `weekDays` | `(now, firstDayOfWeek, days, target, clearedToday) => WeekDay[]` | Seven days with `met`, `missed`, `in-progress`, `upcoming` | `:198-225` |

Types: `TodayState` (`:73-83`), `KeepGoing` (`:86-91`), `DeckAction` (`:134-138`), `WeekDayStatus` and `WeekDay` (`:185-191`).

These already answer the questions a hero needs: what state is the learner in, what is the one action, how long will it take, which deck does it open.

### 7.2 Data contract (`-components/dashboard-metrics.ts`)

| Type | Fields | Lines |
| --- | --- | --- |
| `DashboardDeck` | `courseId`, `title`, `learningLanguage`, `dueCount`, `newAvailable`, `masteredCount`, `learningCount`, `unseenCount`, `trickyCount`, `lastReviewedAt` | `:7-22` |
| `DailyStudy` | `date`, `cardsStudied`, `cleared` | `:24-34` |
| `TrickyWord` | `cardId`, `courseId`, `term`, `learningLanguage`, `lapses` | `:37-44` |
| `ProgressTrendsData` | `consistencyPercent`, `consistencyWeeklyChangePercent`, `retentionPercent`, `retentionGlobalAveragePercent`, `newCardsThisMonth` | `:46-52` |
| `DashboardMetrics` | `decks`, `dailyGoal { target, days }`, `trickyWords { total, words }`, `progressTrends` | `:54-68` |

The file comment says issue #112 will replace the seeded value with API data "of this same shape. Component markup stays put." (`:3-6`). Staying inside these types keeps the redesign independent of the API work.

Also reusable as is: `useFormatters()` (`apps/web/src/lib/formatters.ts:184-201`), `useViewer()` (`session-provider.tsx:42-50`), `LanguageBadge`, `LastStudied`, the `?studying=` search param and its validation (`dashboard.tsx:43,53-57,80-96`), and the 11 preview states with the axe spec that walks them (`dashboard-previews.ts:111-123`, `apps/web/e2e/dashboard.a11y.spec.ts`).

### 7.3 What the reviewers liked that the data cannot support yet

| Liked element | Missing data |
| --- | --- |
| GitHub-style activity chart (Crystal, example-01) | `dailyGoal.days` is documented as "The last 7 days including today" (`dashboard-metrics.ts:59`). A heatmap needs months of `DailyStudy`. This is a contract change for #112. |
| Deck art or hero photo (example-01, example-02) | `DashboardDeck` has no image field. |
| "Your next memory" mnemonic image card (example-05) and the mnemonic image in example-04's hero | `TrickyWord` has `term` and `lapses` only. No meaning, no mnemonic text, no image. |
| Per-deck retention ("86% retention" in example-04's hero) | Only a global `retentionPercent` exists. |
| Study Tip card (example-02) | No content source. It could be static copy in a `messages` object. |
| 7-day streak checkmarks (example-05) | Already supported by `weekDays` and rendered as `WeekDots` (`ThisWeek.tsx:106-147`). |
| Single hero with due, new and one button (example-04, example-05) | Already supported by `todayState` and `todayPrimaryAction`. |

One product limit shapes the copy: there is no cross-deck review session. "Start review" opens the focus deck only (`TodayPanel.tsx:137-143`). That is why the panel needs the per-deck chips and the line "Starts in {deck}." (`TodayPanel.tsx:113-132,152-156`; `PLAN.md:57,146`). Removing that copy cleanly needs either a cross-deck session or a headline that counts only the focus deck.

---

## 8. Terminology: deck, course, cards, words

### 8.1 "Deck" in user-visible copy

| String | File:line | Seen on default page |
| --- | --- | --- |
| Decks (nav label for `/dashboard`) | `AppSidebar.tsx:37` | yes |
| Other decks | `DeckList.tsx:13` | yes |
| Welcome to Memli. Let's find your first deck. | `DashboardGreeting.tsx:21` | no decks |
| and {count} more deck / decks | `TodayPanel.tsx:19-20` | 4+ due decks |
| You don't have any decks yet | `TodayPanel.tsx:47` | no decks |
| Find a deck to start building your vocabulary. | `TodayPanel.tsx:48` | no decks |
| Browse community decks | `TodayPanel.tsx:49` | no decks |
| Nothing due in this deck. New reviews arrive as you need them. | `FocusDeckCard.tsx:48` | focus deck caught up |
| This deck has no cards waiting for this kind of session. Pick another from your dashboard. | `apps/web/src/routes/_session/study.$courseId.tsx:50` | empty session |
| We couldn't find that deck | `apps/web/src/routes/_session/study.$courseId.tsx:53` | bad link |

That is 11 strings in 6 files (counting the plural pair as two). On the default page "deck" is visible twice: the nav item and "Other decks". No marketing or sign-in copy uses "deck" or "course" (grep of `_marketing`, `_auth`, `components`).

The nav mismatch is worth calling out. The sidebar item "Decks" opens `/dashboard` (`AppSidebar.tsx:48-54`). The page it opens greets the learner and never calls itself "Decks". `docs/product-ux.md:127-128` planned `/dashboard` as "home base" and a separate `/decks` library.

### 8.2 "Course" in code and routes

"Course" is never shown as a word in the UI. It lives in identifiers:

| Where | What |
| --- | --- |
| Route | `/study/$courseId` (`apps/web/src/routes/_session/study.$courseId.tsx`, `routeTree.gen.ts:102,318-319`) |
| Type fields | `DashboardDeck.courseId`, `TrickyWord.courseId`, `DeckAction.courseId` (`dashboard-metrics.ts:8,39`, `dashboard-model.ts:135`) |
| Seed ids | `spanish-core-1000`, `japanese-kana`, `french-travel-phrases`, `portuguese-essentials` (`dashboard-metrics.ts:94,106,118,130`). These show in the URL. |
| Planned route | `/decks…` library (`docs/product-ux.md:128`) |

So the code already calls the same thing a "deck" (type name, UI) and a "course" (id, route). A rename in the UI from "deck" to "course" would match the URL and the old Memrise vocabulary without touching routes or types.

### 8.3 "Cards" and "words"

| Term | String | File:line |
| --- | --- | --- |
| cards | card / cards ready to review | `TodayPanel.tsx:13-14` |
| cards | of {count} card / cards | `FocusDeckCard.tsx:24-25` |
| cards | Review {count} card / cards | `FocusDeckCard.tsx:33-34` |
| cards | Review {count} card(s) in {deck} (aria) | `FocusDeckCard.tsx:37-38`, `DeckList.tsx:20-21` |
| cards | {count} more card(s) to reach today's goal. | `ThisWeek.tsx:22-23` |
| cards | New cards | `ProgressTrends.tsx:14` |
| cards | {count} card(s) left, {completed} of {count} card(s) done | `_session/SessionHeader.tsx:12-17` |
| cards | You've been through every card in this session. | `apps/web/src/routes/_session/study.$courseId.tsx:59` |
| words | Learn {count} new word / words | `TodayPanel.tsx:24-25`, `FocusDeckCard.tsx:41-42` |
| words | Learn {count} new word(s) in {deck} (aria) | `FocusDeckCard.tsx:45-46`, `DeckList.tsx:25-26` |
| words | {count} new word is / words are ready in {deck}. | `TodayPanel.tsx:30-31` |
| words | Learn {count} more new word / words | `TodayPanel.tsx:38-39` |
| words | Each new word adds a few short reviews over the coming weeks. | `TodayPanel.tsx:42` |
| words | Practice {count} tricky word / words | `TodayPanel.tsx:44-45` |
| words | {count} word keeps / words keep slipping | `MemoryCallout.tsx:10-11` |
| words | Words mastered | `ThisWeek.tsx:41` |
| words | Learn new words, Practice tricky words | `_session/CardPrompt.tsx:14-15` |

On the default page: "cards" 4 times, "words" 3 times.

The rule in the code is: an item is a "card" when you review it and a "word" when you learn it or forget it. That produces pairs that describe the same items with different nouns:

- "New cards 142, Added this month" (`ProgressTrends.tsx:14-15`) next to "Learn 10 new words" (`TodayPanel.tsx:24-25`).
- "5% mastered of 1,000 cards" (`FocusDeckCard.tsx:22-25`) next to "Words mastered 100" (`ThisWeek.tsx:41`).
- "24 cards ready to review" next to "26 more cards to reach today's goal", which counts both reviews and new words (`dashboard-metrics.ts:27,57`).

Also, "words" is not always true. The Japanese deck teaches kana. Its tricky "words" are the single characters ぬ and れ (`dashboard-metrics.ts:159,173`).

### 8.4 Other vocabulary a non-technical learner must decode

| Term | Where | Note |
| --- | --- | --- |
| Due | "Due" (`FocusDeckCard.tsx:20`), "{count} due" (`DeckList.tsx:14`), "Nothing is due right now" (`DashboardGreeting.tsx:20`), "Nothing due in this deck" (`FocusDeckCard.tsx:48`) | Spaced-repetition jargon. The Today panel says the same thing in plain words: "ready to review". |
| New today / new | "New today" (`FocusDeckCard.tsx:21`), "{count} new" (`DeckList.tsx:15`), "Learn {n} new words", "New cards" | Four phrasings for new items. |
| Mastered / learning / not started | `FocusDeckCard.tsx:27-31` | Three states, never explained. |
| Retention, Consistency, Global average | `ProgressTrends.tsx:10-13` | Analyst vocabulary, set in small uppercase. |
| ES, JA, FR, PT | `LanguageBadge.tsx:11-13,32` | ISO codes. The full name is only in a hover `title` and for screen readers. |
| S M T W T F S | `ThisWeek.tsx:130` (`weekday(date, "narrow")`) | Two S and two T. The long names are screen-reader only. |
| Studying | `LanguageFilter.tsx:7` | The label for the filter. Reads like a status, not a choice. |
| Tricky words / words keep slipping | `TodayPanel.tsx:44-45`, `MemoryCallout.tsx:10-11` | Two names for the same set. |
| Review / Learn / Practice | three study modes (`apps/web/src/routes/_session/study.$courseId.tsx:63-65`) | "Practice" only appears when caught up. |
| Community Gallery vs Browse community decks | `AppSidebar.tsx:38`, `TodayPanel.tsx:49` | Two names for `/community`. |

---

## 9. Accessibility and i18n notes found while reading the code

These are side findings. They are listed because the redesign will touch the same lines.

Accessibility:

- **Links announced as buttons.** Every action is `<Button render={<Link … />} nativeButton={false}>`. Base UI then renders an `<a>` with `role="button"` and `tabindex="0"` (measured on "Start review"). A screen reader says "button" for something that navigates. `TodayPanel.tsx:66-79,135-147`, `FocusDeckCard.tsx:120-135`, `DeckList.tsx:82-98`.
- **Single-letter shortcut.** The `d` theme toggle (`theme-provider.tsx:145`) has no setting to turn it off or remap it. See WCAG 2.1.4.
- **No skip link.** `_app.tsx:11-16` goes straight from the sidebar to `<main>`.
- **Page title.** "Memli" on every route (`apps/web/index.html:7`). See WCAG 2.4.2.
- **Graphics.** The mastery bar, mini bars and goal ring are `aria-hidden` and have text next to them, which is fine (`FocusDeckCard.tsx:75-78`, `DeckList.tsx:56-58`, `ThisWeek.tsx:66`). Their low-contrast parts are in section 4.3.
- **Color-only legend.** The mastery legend distinguishes "mastered" and "learning" by two blues only (`FocusDeckCard.tsx:51-55,89-99`).
- **Landmarks.** Six labelled `<section>`s, an `<aside aria-label="Your progress">`, the sidebar `<aside aria-label="Application sidebar">`, and `<nav aria-label="Primary">`. The page content is also wrapped in an unlabelled `<section>` from `Section` (`dashboard.tsx:114`, `ui/section.tsx:42`).
- **What is already good.** `lang` on tricky words so screen readers pronounce them (`MemoryCallout.tsx:59`). `tabular-nums` on numbers. Visible label is the start of the accessible name on row buttons (`DeckList.tsx:87`). Reduced-motion guards. The axe suite covers every preview in both themes.

i18n:

- **Sentences split across elements.** The number and its noun are separate spans in three places, so a translator cannot reorder them: "24" + "cards ready to review" (`TodayPanel.tsx:101-108`), "24" + "of 50" (`ThisWeek.tsx:88-93`), "5% mastered" + "of 1,000 cards" (`FocusDeckCard.tsx:68-73`).
- **Plural forms.** Most messages have `one` and `other`. Four have only `other`: `keepStreak` (`DashboardGreeting.tsx:15-18`), `due` and `new` (`DeckList.tsx:14-15`), `more` (`MemoryCallout.tsx:15`). Fine for English. Spanish and others will need more forms.
- **Uppercase by CSS.** "TODAY" and the trend labels use `uppercase tracking-wide`. That does nothing for scripts without case.
- **Locale plumbing is solid.** Numbers, percents, durations, relative times, weekday names, first day of week and language names all come from `Intl` with `uiLocale` (`apps/web/src/lib/formatters.ts:73-132`). `learningLanguage` is kept separate from `uiLocale` (`dashboard-metrics.ts:10`).
- **Text growth.** Fixed widths that will be tight in longer languages: the 320 px aside (`dashboard.tsx:131`), `w-16` mini bars (`DeckList.tsx:58`), the 96 px ring with text inside (`ThisWeek.tsx:65,87-94`).
- **No em dashes** in any `_app` or `_session` UI string (grep). The placeholder in the session uses "…" (`_session/AnswerForm.tsx:10`).

---

## 10. Could not verify

- **Dark theme rendering.** Dark values were computed from the tokens, not measured in the browser. I did not toggle the theme in the running app, because that writes to `localStorage`.
- **APCA numbers.** They come from my own implementation of the published APCA-W3 0.1.9 formula. It reproduces three known reference values (black on white 106.0, white on black -107.9, `#888` on white 63.1). It was not checked against the official `apca-w3` package.
- **Alpha blends.** Colors with opacity (`ring-ring/50`, `border-muted-foreground/40`, `ring-foreground/10`, the dark outline button) were blended in sRGB. Tailwind v4 mixes in OKLab, so those rows are approximate. They are marked "about".
- **Gamut.** The script reports four tokens as outside sRGB. I did not check how each browser maps them.
- **axe and Playwright.** I read the specs. I did not run them.
- **The owner's screenshots and annotated image.** Not opened. This audit is from code and the live page only.
- **Git history.** The statement that Reveal was once the solid primary comes from the commit subject `0731d71` in the task context. I did not read that diff.
- **`packages/core` and `packages/schemas`.** Only file and folder names were checked for deck/course naming.
- **Marketing routes.** Only searched for terminology and brand-token use. Not audited.
- **The 880 px main column** quoted in the brief. At 1440 px wide I measured 769 px plus a 320 px aside. The width depends on the viewport.

---

## Sources

Code (all under `dev/memli/`):

- `apps/web/index.html`
- `apps/web/src/main.tsx`
- `apps/web/src/routes/__root.tsx`
- `apps/web/src/routes/_app.tsx`
- `apps/web/src/routes/_app/dashboard.tsx`
- `apps/web/src/routes/_app/settings.tsx`
- `apps/web/src/routes/_app/-components/AppSidebar.tsx`
- `apps/web/src/routes/_app/-components/DashboardGreeting.tsx`
- `apps/web/src/routes/_app/-components/DeckList.tsx`
- `apps/web/src/routes/_app/-components/FocusDeckCard.tsx`
- `apps/web/src/routes/_app/-components/LanguageBadge.tsx`
- `apps/web/src/routes/_app/-components/LanguageFilter.tsx`
- `apps/web/src/routes/_app/-components/LastStudied.tsx`
- `apps/web/src/routes/_app/-components/MemoryCallout.tsx`
- `apps/web/src/routes/_app/-components/PreviewSwitcher.tsx`
- `apps/web/src/routes/_app/-components/ProgressTrends.tsx`
- `apps/web/src/routes/_app/-components/ThisWeek.tsx`
- `apps/web/src/routes/_app/-components/TodayPanel.tsx`
- `apps/web/src/routes/_app/-components/dashboard-metrics.ts`
- `apps/web/src/routes/_app/-components/dashboard-model.ts`
- `apps/web/src/routes/_app/-components/dashboard-previews.ts`
- `apps/web/src/routes/_session.tsx`
- `apps/web/src/routes/_session/study.$courseId.tsx`
- `apps/web/src/routes/_session/-components/RevealButton.tsx`
- `apps/web/src/routes/_session/-components/SessionHeader.tsx`
- `apps/web/src/routes/_session/-components/AnswerForm.tsx`
- `apps/web/src/components/theme-provider.tsx`
- `apps/web/src/components/session-provider.tsx`
- `apps/web/src/components/brand-mark.tsx`
- `apps/web/src/components/plan-badge.tsx`
- `apps/web/src/components/menu-glyph.tsx`
- `apps/web/src/components/dev-previews-menu.tsx`
- `apps/web/src/components/site-nav.tsx`
- `apps/web/src/lib/formatters.ts`
- `apps/web/src/lib/dates.ts`
- `apps/web/e2e/dashboard.a11y.spec.ts`
- `apps/web/e2e/study.a11y.spec.ts`
- `apps/web/eslint.config.js`
- `apps/web/vite.config.ts`
- `packages/ui/src/styles/globals.css`
- `packages/ui/src/components/avatar.tsx`, `badge.tsx`, `button.tsx`, `card.tsx`, `dropdown-menu.tsx`, `heading.tsx`, `input.tsx`, `label.tsx`, `section.tsx`, `spinner.tsx`, `text.tsx`
- `packages/eslint-config/README.md`
- `docs/product-ux.md`, `docs/i18n.md`, `docs/mobile.md`, `docs/roadmap.md`
- `.cursor/rules/product-ux.mdc`, `.cursor/rules/i18n-foundations.mdc`

Design docs:

- `docs/designs/dashboards/PLAN.md` (lines 57, 103, 126, 146)
- `docs/designs/dashboards/README.md` (line 3)

Live measurement:

- `http://localhost:5173/dashboard`, `http://localhost:5173/dashboard?preview=default`, `http://localhost:5173/dashboard?studying=es`, at 1440x900 and 375x812, light theme, on 2026-11-13 (a Friday evening, which is why the greeting is "Good evening" and the highlighted weekday is F).

Scripts written for this audit:

- `scratch/scripts/contrast.mjs`
- `scratch/scripts/focus.mjs`

Standards named (not fetched in this audit; cited by number only):

- WCAG 2.2 success criteria 1.4.3 Contrast (Minimum), 1.4.11 Non-text Contrast, 2.1.4 Character Key Shortcuts, 2.4.2 Page Titled, 2.5.8 Target Size (Minimum).
- APCA-W3 0.1.9 contrast formula.

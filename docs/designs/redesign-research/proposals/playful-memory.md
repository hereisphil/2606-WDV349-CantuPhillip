# Dashboard redesign proposal: Playful Memory

One design, not a menu. Angle: keep the fun that made two people pick example-01, and put Memli's own thing (memory tricks) at the centre, while fixing the owner's four problems.

Nothing in the repository was edited. This file and one helper script are the only things written.

**How to read the citations.** Short tags point at the research files in
`scratch/research/`:

| Tag | File |
| --- | --- |
| [code] | `code-audit.md` |
| [live] | `live-audit.md` |
| [fb] | `feedback-examples.md` |
| [mem] | `memrise-archive.md` |
| [rui] | `refactoring-ui.md` |
| [color] | `color-science.md` |
| [a11y] | `a11y-usability.md` |
| [mob] | `mobile-i18n.md` |
| [comp] | `competitors-attention.md` |

Code paths are relative to `dev/memli/`. `-components/` means `apps/web/src/routes/_app/-components/`.

**What is verified and what is not.**

- Every colour value below comes from the verified token set in [color §4.2, §5.2] unless a row says "new".
- The extra pairings this design adds were computed with the same library (culori + apca-w3) by
  `scratch/design/playful-memory-pairs.mjs`. They are marked "computed here". They have not been added to the gate script `verify.mjs`.
- All pixel heights in the wireframes are sums of the proposed sizes. Nothing was built or measured in a browser.
- Word counts for the new page are counted by hand from the copy deck with the seeded default data.

---

## 1. North star

> **Open Memli and one warm card shows you one picture, one number and one yellow button. Everything else on the page is a quiet reward for looking.**

Three principles follow from it.

**P1. One thing glows.**
There is exactly one amber shape on the screen, and it is the button that starts studying. Amber on navy measures 9.18:1 in light and 8.30:1 in dark [color §5.2 rows 29]. Today 14 elements share the primary blue [code §0.1], and the button holds only about 27% of the saturated colour above the fold [fb §5.3]. Blue stops being an action colour and becomes "your progress".

**P2. Pictures, not paragraphs.**
Fun comes from a picture in the hero, a small growing plant for each course, round check marks for days, and a chunky button. It does not come from more boxes or more sentences. The gut vote rewarded colour, depth and imagery, not less content [fb §1.1]. Each fact is said once [mem lesson 2].

**P3. Growth, never guilt.**
Every number on the page can only go up or get done: words learned, days in a row, a calendar that gains a row each week. Nothing is labelled "missed". Broken streaks lower engagement most when people blame themselves [a11y §9.1], and older users blame themselves 90% of the time [a11y §1]. Garden pictures, plain verbs: old Memrise dropped "plant" and "water" from its labels by 2015 but kept the seed and flower icons [mem §3.2].

---

## 2. Focal hierarchy

### First glance: one element

**The Memory hero.** One deep navy card at the top of the main column. It merges today's "Today" panel and "Continue learning" card. Crystal circled a single hero card twice, in example-04 and example-05 [fb §8 circles A and B].

It holds, in reading order:

1. The course name.
2. One big number in a short sentence: "16 words to review".
3. One cost line: "About 3 minutes".
4. **The amber button "Start review".** The only amber shape on the page.
5. A quiet second button: "Learn 10 new words".
6. One progress line with a small plant: "200 of 1,000 words learned".
7. A picture. A community memory trick the learner already remembered, shown like a postcard. Until image data exists, a larger drawing of the course's plant.

**The hero counts only what the button opens.** Today the headline says 24 but the button opens 16 [a11y finding 10; code §7.3]. So the hero names the course and says 16. The other 8 show on the Japanese row with their own button.

### Second glance: two elements

1. **This week.** A row of seven round day marks, "12 days in a row", and one line for today's goal. On desktop it grows into a small calendar, one row per week, up to five rows. This is Crystal's "Github chart" [fb §2] in the shape a11y research recommends: a calendar, not a 53-column grid [a11y §8.4; comp §6.4].
2. **Your other courses.** Compact rows. Each row has a small plant in a tile, the title, one line, and one button with the count inside it ("Review 8 words"). The count-in-the-button pattern is old Memrise's "Review (597)" [mem lesson 1].

### Third level

- **Tip card.** One small warm card. It shows the tricky-words prompt when there is one, or a study tip. Crystal circled the Study Tip card [fb §8 circle E].
- **"More about your progress".** A closed disclosure at the bottom with two plain sentences.
- **Theme control.** In the sidebar foot on desktop, in the Account menu on phones.

### What is removed or moved, and where it goes

Nothing silently disappears. "Parked" means it is not on any screen until the named page exists.

| Today | What happens | Where it goes |
| --- | --- | --- |
| Status sentence "About 4 minutes of review keeps your 12-day streak going." (`-components/DashboardGreeting.tsx:15-18`) | Removed | Minutes move into the hero. The streak moves into This week, said once and without loss framing [a11y §9.3]. |
| Time-of-day greeting (3 strings) | Replaced by one neutral greeting | "Hi, {name}". "Good evening" shows at 02:00 today and the cut-off hours differ by culture [mob §5.5]. |
| "TODAY" eyebrow | Removed | The hero's heading is the course name. Uppercase does nothing in scripts without case [mob §5.9]. |
| Per-course chips "16 from…", "8 from…" (`-components/TodayPanel.tsx:113-132`) | Removed | Each course row carries its own count in its button. |
| "Starts in Spanish Core 1000." | Removed | Not needed. The hero is that course. |
| "Continue learning" card (`-components/FocusDeckCard.tsx`) | Merged into the hero | Its title and progress line live in the hero. Its duplicate "16 Due" and "10 New today" are dropped because the hero already says both. |
| Mastery legend "52 mastered, 148 learning, 800 not started" | Parked | Course detail page (the `/decks…` library planned in `docs/product-ux.md:128`). The dashboard shows one sentence: "200 of 1,000 words learned". |
| "Last studied …" (4 copies, `-components/LastStudied.tsx`) | Parked | Course detail page. Recency still drives the row order through `sortDecks` (`-components/dashboard-model.ts:35-50`). |
| "% mastered" and mini bars in rows (`-components/DeckList.tsx:56-65`) | Replaced | The plant tile plus "18 of 92 learned". A count, not a percentage [a11y §4, COGA 4.4.13]. |
| "ES / JA / FR / PT" code badges (`-components/LanguageBadge.tsx`) | Replaced | The language name as visible text in each row. Codes are jargon and the name is hover-only today [mob §3.10]. |
| Five language filter chips above the hero | Moved and shrunk | One "All languages" menu in the "Your other courses" header. It costs 80 to 212 px above the button today [mob §2.2]. |
| Goal ring with "24 of 50" inside | Replaced | Today's day mark fills as a ring. One sentence beside it: "24 of 50 words today". Rings are hard to read and the text inside is 12 px [a11y §8.2]. |
| "26 more cards to reach today's goal." | Removed | "24 of 50 words today" says it once. |
| "Words mastered 100" | Rewritten and moved | Sentence in the progress disclosure: "200 words learned so far." |
| Tricky word chips (aprovechar, ぬ, …, "and 2 more") | Removed from the dashboard | The words show inside the practice session. The chips look like buttons and are not [a11y §11.2 row 40]. The prompt keeps a real "Practice" button. |
| "Your progress trends" strip (3 tiles) | Shrunk | A closed "More about your progress" disclosure with two sentences (remembered %, new words this month). |
| "CONSISTENCY 98% +2% from last week" | Removed | The calendar shows consistency as a picture. |
| "Global average: 75%" | Removed everywhere | Comparison with strangers can discourage newer learners [a11y §9.3 rule 7]. |
| Hidden `d` shortcut (`apps/web/src/components/theme-provider.tsx:131-168`) | Removed | Replaced by the visible Theme control. A single-letter shortcut with no off switch is the WCAG 2.1.4 pattern [a11y §3]. |
| Sidebar "Decks", "Community Gallery" | Renamed | "Home", "Community". |
| Phone hamburger (32 x 32, hides both links, `-components/AppSidebar.tsx:177-204`) | Replaced | A three-item bottom bar: Home, Community, Account [mob §4.5]. |

---

## 3. Wireframes

Legend: `╔═╗` navy hero. `[■ … ■]` amber button. `[ … ]` quiet button. `(✓)` studied day. `(◎)` today. `( )` no study. `❀` plant tile.

### 3.1 Phone, 375 x 812, default state, first screen

The safe fold is about 550 px of visible height on a 375 x 667 phone [mob §3.8, unverified on a device]. The bottom bar takes 56 px of that, so content must land above y = 494.

```
y=0   ┌─────────────────────────────────────────┐
      │ [M]  Hi, Phillip                        │  56  logo mark + h1 (18/600), one row
y=64  │ ╔═════════════════════════════════════╗ │
      │ ║ Spanish Core 1000                   ║ │  24  course name (18/600)
      │ ║                                     ║ │
y=116 │ ║ 16                     ┌─────────┐  ║ │  56  numeral, alone on its line
      │ ║ words to review        │ picture │  ║ │  30  (24/600)   picture tile 96x96
      │ ║ About 3 minutes        └─────────┘  ║ │  24  (16/400)
      │ ║                                     ║ │
y=250 │ ║ [■■■■■■■■  Start review  ■■■■■■■■■] ║ │  56 + 4 px edge   AMBER, full width
y=310 │ ║                                     ║ │
y=322 │ ║ [        Learn 10 new words       ] ║ │  48  outline on navy
y=386 │ ║ ❀ 200 of 1,000 words learned        ║ │  24
y=430 │ ╚═════════════════════════════════════╝ │
y=446 │ ┌ This week ──────────────────────────┐ │
      │ │ (flame) 12 days in a row            │ │
 - - - - - - - - - fold: y=494 on a 375x550 view - - - - - - - - -
      │ │ Sun  Mon  Tue  Wed  Thu  Fri  Sat   │ │
      │ │ (✓)  (✓)  (✓)  (✓)  (✓)  (◎)  ( · ) │ │
      │ │                          Today      │ │
      │ │ 24 of 50 words today                │ │
      │ └─────────────────────────────────────┘ │
      ├─────────────────────────────────────────┤
      │    Home        Community      Account   │  56 + safe-area inset, sticky
      └─────────────────────────────────────────┘
```

- "Start review" ends at **y = 310**. Today it ends at y = 625 [live §3.2]. It fits a 320 x 450 view too (content limit 394).
- On a 375 x 812 phone with about 635 px visible [live §3.2], the whole hero and the week row are on screen.
- The phone header is one row: the logo mark and the greeting share it. The separate 69 px top bar goes away.
- The numeral stands alone on its line. "32 palabras" at 60 px is 345 px wide and does not fit 287 px [mob §7.4].
- The picture sits beside the count. If the count is long (six digits, or a long translation), the row wraps and the picture drops under the count. The button then ends near y = 420, still above 494.
- With pseudo-long text the phrase "words to review" wraps to two lines (+30 px). Still above the fold.

### 3.2 Phone, the rest of the page

```
y≈640 │  Your other courses        [All languages ▾] │  h2 (18/600) + menu (44 tall)
      │ ┌─────────────────────────────────────────┐ │
      │ │ ❀  Japanese Hiragana & Katakana         │ │  tile 48, title 16/600
      │ │    Japanese · 18 of 92 learned          │ │  16/400
      │ │ [          Review 8 words             ] │ │  44  tinted button, full width
      │ └─────────────────────────────────────────┘ │  ≈ 148 per row
      │ ┌─────────────────────────────────────────┐ │
      │ │ ❀  French Travel Phrases                │ │
      │ │    French · 20 of 250 learned           │ │
      │ │ [         Learn 10 new words          ] │ │
      │ └─────────────────────────────────────────┘ │
      │ ┌─────────────────────────────────────────┐ │
      │ │ ❀  Portuguese Essentials                │ │
      │ │    Portuguese · 10 of 120 learned       │ │
      │ │    (✓) All done                         │ │  no button
      │ └─────────────────────────────────────────┘ │
      │ ┌ warm tip card ──────────────────────────┐ │
      │ │ (bulb) 4 tricky words                   │ │
      │ │ A new memory trick can help.            │ │
      │ │ [ Practice ]                            │ │
      │ └─────────────────────────────────────────┘ │
      │ ▸ More about your progress                  │  <details>, closed
      └─────────────────────────────────────────────┘
```

Estimated page height: about 1,350 px, or 2.5 short screens. Today it is 2,658 px [code §4.6].

"Learned" numbers in the rows are examples. The seeded data gives mastered counts (18 of 92, 20 of 250, 10 of 120 [code §3]) but I did not read each course's learning count.

### 3.3 Tablet, 768 x 1024

The sidebar becomes an 88 px rail (icon over a one-word label) between 768 and 1023 px. That leaves a 680 px main column instead of today's 512 px [mob §3.9].

```
┌──────┬───────────────────────────────────────────────────────────────┐
│ [M]  │  Hi, Phillip                                                  │ y=32
│      │ ╔═══════════════════════════════════════════════════════════╗ │ y=84
│ Home │ ║ Spanish Core 1000                      ┌───────────────┐  ║ │
│      │ ║ 16                                     │               │  ║ │
│ Comm │ ║ words to review                        │   postcard    │  ║ │
│ unity│ ║ About 3 minutes                        │   or plant    │  ║ │
│      │ ║                                        │   200 x 150   │  ║ │
│      │ ║ [■ Start review ■] [Learn 10 new words]└───────────────┘  ║ │
│      │ ║ ❀ 200 of 1,000 words learned                              ║ │
│      │ ╚═══════════════════════════════════════════════════════════╝ │ y≈440
│      │ ┌ This week ────────────────────────────────────────────────┐ │
│      │ │ (flame) 12 days in a row         24 of 50 words today     │ │
│      │ │ Sun  Mon  Tue  Wed  Thu  Fri  Sat                         │ │
│      │ │ (✓)  (✓)  (✓)  (✓)  (✓)  (◎)  ( · )                       │ │
│      │ └───────────────────────────────────────────────────────────┘ │ y≈610
│      │  Your other courses                        [All languages ▾]  │
│ Acct │  ❀ Japanese Hiragana & Katakana            [ Review 8 words ] │
│      │    Japanese · 18 of 92 learned                                │
│      │  …                                                            │
└──────┴───────────────────────────────────────────────────────────────┘
```

The hero switches from one column to two zones when its own width passes 36rem. That is a container query, so a landscape phone gets the row layout too [mob §3.6, §3.9]. The theme control lives in the Account menu at this width.

### 3.4 Desktop, 1280 x 800 and wider

Sidebar 256 px. Main content is 960 px wide (`max-w-5xl` with 32 px gutters).

```
┌────────────┬────────────────────────────────────────────────────────────────────────┐
│ [M] Memli  │  Hi, Phillip                                                           │ y=32
│            │ ╔════════════════════════════════════════════════════════════════════╗ │ y=84
│ ▣ Home     │ ║ Spanish Core 1000                          ┌─────────────────────┐ ║ │
│ ▢ Community│ ║                                            │                     │ ║ │
│            │ ║ 16                                         │   memory postcard   │ ║ │
│            │ ║ words to review                            │   (tilted 2°)       │ ║ │
│            │ ║ About 3 minutes                            │   or the course's   │ ║ │
│            │ ║                                            │   plant, 160 px     │ ║ │
│            │ ║ [■■■ Start review ■■■]  [Learn 10 new words]└─────────────────────┘ ║ │ y=302-362
│            │ ║ ❀ 200 of 1,000 words learned                                       ║ │
│            │ ╚════════════════════════════════════════════════════════════════════╝ │ y=438
│            │                                                                        │
│            │  Your other courses  [All languages ▾]     ┌ This week ─────────────┐  │ y=478
│            │ ┌────────────────────────────────────────┐ │ (flame) 12 days in a row│  │
│            │ │ ❀ Japanese Hiragana & Katakana         │ │ Sun Mon Tue Wed Thu Fri Sat │
│            │ │   Japanese · 18 of 92 learned  [Review 8 words] │ ( ) (✓) (✓) ( ) (✓) (✓) (✓)│  earlier weeks
│            │ └────────────────────────────────────────┘ │ (✓) (✓) (✓) (✓) (✓) (◎) (·) │  this week
│ Theme      │ ┌────────────────────────────────────────┐ │ 24 of 50 words today    │  │
│ ◉ Match my │ │ ❀ French Travel Phrases                │ └─────────────────────────┘  │
│   device   │ │   French · 20 of 250 learned [Learn 10 new words]│                    │
│ ○ Light    │ └────────────────────────────────────────┘ ┌ warm tip card ──────────┐  │
│ ○ Dark     │ ┌────────────────────────────────────────┐ │ 4 tricky words          │  │
│ ─────────  │ │ ❀ Portuguese Essentials    (✓) All done│ │ A new memory trick can… │  │
│ @user  Pro │ └────────────────────────────────────────┘ │ [ Practice ]            │  │
└────────────┴─────────────────────────────────────────── fold: y=800 ─────────────────┘
               ▸ More about your progress
```

- Hero: y = 84 to 438 (354 px tall). It starts in the top third and spans the main column.
- "Start review": at least 280 x 56 px. That is 1.5% of a 1280 x 800 screen. Today it is 126 x 44 px, 0.54% [live §0].
- Lower area: courses on the left, a 320 px column on the right. The two columns appear when the main container is at least 56rem wide. Below that the right column stacks under the hero, as on the tablet.
- The calendar shows one row per week the learner has studied in, newest at the bottom, up to five. Today the data only holds 7 days [code §7.3], so it ships as one row and grows when issue #112 sends more.

### 3.5 Other states

The hero keeps its shape in every state: name line, headline, one support line, a button row in the same place, a picture on the end side. Only the words and the button colour change [a11y D5, COGA 4.5.1].

**Amber means "scheduled study is waiting".** When nothing is scheduled, there is no amber on the page at all.

| State (`?preview=`) | Hero | Rest of page |
| --- | --- | --- |
| **default** (review) | As drawn. Amber "Start review". Quiet "Learn 10 new words" only if the course has new words today. | As drawn. |
| **learn** (nothing to review, new words ready) | Name line. Headline "10 new words to learn" with the big numeral. Support line "Nothing to review right now." Amber "Start learning". No second button. Picture as usual. | Same. |
| **caught-up** | Name line is the next suggested course. Headline "All done for now" (24/600, no numeral). Support line "New reviews will show up here when it is time." The picture is the plant with a check badge, and it does one small "pop" (scale 0.9 to 1, 300 ms, `motion-safe` only). **No amber button.** Two quiet buttons in the usual row: "Learn 10 more new words", "Practice 4 tricky words". One helper line: "Each new word means a few short reviews later." | Today's mark is filled. Line reads "You finished everything for today." |
| **finished** (nothing left anywhere) | As caught-up, with no buttons. One link: "Find another course". | Same. |
| **goal-met** | As default or caught-up. | Today's mark is filled with a check. Line reads "You reached today's goal." |
| **no-decks** | Full width. No name line. Headline "Pick your first course". Support line "A course is a set of words to learn." Amber "Find a course" (goes to `/community`). Picture: a seed. | Nothing else renders, as today (`dashboard.tsx:125-128`). No empty calendar: an empty grid reads as failure [comp §6.2]. |
| **one-deck** | As default. | No course list and no language menu. One link under This week: "Find another course". |
| **many-decks** (12) | As default. | The first 4 rows show. Then a native disclosure button "Show all 12 courses". The language menu sits in the list header. Old Memrise loaded 4 course cards first [mem §2.3]. |
| **same-language** | As default. | Language menu hidden (one language), as today. Language name still shows in each row. |
| **long-titles** | The name wraps to two lines (`text-balance`, no truncation). Button moves down 24 px. | Row titles wrap. Row buttons drop under the text when the row is narrower than 28rem. |
| **large-numbers** | "12,480" at 56 px is about 204 px wide [mob §7.4]. The picture wraps under the count. | Row counts live in button labels, which wrap. |
| Returning after a gap (streak 0) | Normal hero. | No streak line at all. No "0 days", no red [comp §5.3]. |
| With a memory postcard (new preview, needs #112) | Picture zone shows the postcard. | Same. |

---

## 4. Copy deck

### 4.1 Terminology decisions

| Question | Decision | Why |
| --- | --- | --- |
| Deck, course, list? | **Course.** | One respondent flagged "Deck" [fb §2]. The code already says `courseId` 77 times and `deckId` zero times [fb §10.1]. Memrise said "course" for its whole classic era [mem lesson 7]. Type names such as `DashboardDeck` can stay. They are not user-facing. |
| Cards or words? | **Words.** | Today the page says "cards" 4 times and "words" 3 times for the same things [code §8.3]. Known gap: the Japanese course teaches kana. If per-course nouns are ever needed, add whole messages per noun. Never insert a noun into a sentence [a11y §11.5]. |
| Due | **To review.** | "Due" is scheduling jargon [a11y §12]. |
| Mastered | **Learned.** It counts every word the learner has started (`masteredCount + learningCount`). | "5% mastered" is accurate and discouraging. "200 of 1,000 words learned" is a number that grows from day one [a11y §11.1 decision 2]. The mastered and learning split is parked for the course page. |
| Mnemonic | **Memory trick.** | Hard to read and say [a11y §12]. |
| Streak | **Days in a row.** | Literal. |
| Caught up | **All done.** | Not an idiom [mob R9]. |
| System (theme) | **Match my device.** | [a11y §7.1] |
| Garden words | **Never as text.** The plant is a picture only. No "seed", "sprout", "water" in any string. | [mem §3.2] |

### 4.2 Rules every string follows

- Whole-sentence templates in `messages` objects. `{placeholders}` for values. A big number is styled with a rich tag inside its sentence (`<n>`), never rendered as a separate fragment [mob §7.2]. The existing `rich()` helper does this (`apps/web/src/lib/formatters.ts:153-182`).
- Counts use plural objects. English needs `one` and `other`. Spanish, Portuguese and French also have `many`, and 0 is `one` in Portuguese and French [mob §5.3]. So **zero is always a separate state, never a plural form**, and a `one` form never contains a literal "1".
- Course titles, names and usernames render inside `<bdi>` through a rich tag (`<c>`) [mob R12].
- Durations, day names, numbers and language names come from `Intl` with the UI locale.
- No em dashes. No uppercase styling. No sentence over 12 words.
- Every `aria-label` starts with the visible label [a11y §3, 2.5.3].

### 4.3 Strings

**Shell (`_app.tsx`, `AppSidebar.tsx`, new `ThemeControl`)**

| Key | Template | Note |
| --- | --- | --- |
| `skipToMain` | Skip to main content | First focusable element. |
| `nav.home` | Home | Was "Decks". Noun. |
| `nav.community` | Community | Was "Community Gallery". |
| `nav.account` | Account | Bottom bar and rail item. |
| `accountMenu` | Account menu, @{username} | aria-label, kept. |
| `theme.label` | Theme | Group label (legend). |
| `theme.system` | Match my device | Radio. |
| `theme.light` | Light | Radio. |
| `theme.dark` | Dark | Radio. |
| `menu.profile` | Profile | Sentence case. |
| `menu.settings` | Settings | |
| `menu.plan` | Your plan | |
| `menu.signOut` | Sign out | |
| document title | Home, Memli | Was "Memli" on every route [code §9]. |

**Greeting (`DashboardGreeting.tsx`)**

| Key | Template | Note |
| --- | --- | --- |
| `greeting` | Hi, `<c>{name}</c>` | One neutral form. |
| `greetingNoName` | Hi | When the display name is empty. Never "Hi, ". |

**Hero (new `MemoryHero.tsx`)**

| Key | Template | Plural and notes |
| --- | --- | --- |
| `course` | `<c>{course}</c>` | The hero's `h2`. |
| `toReview` | one: `<n>{count}</n> word to review` / other: `<n>{count}</n> words to review` | `<n>` renders the numeral as a block at display size. Translators may move it. |
| `time` | About {duration} | `{duration}` is `Intl` output such as "3 minutes". Translator note: may be shortened, for example to an abbreviation, to avoid gender agreement [mob §5.4 point 11]. |
| `startReview` | Start review | Verb. Amber button. |
| `learnNew` | one: Learn {count} new word / other: Learn {count} new words | Quiet button. Same string in course rows. |
| `learned` | one: {learned} of {count} word learned / other: {learned} of {count} words learned | Plural follows the total, passed as `count`. |
| `toLearn` | one: `<n>{count}</n> new word to learn` / other: `<n>{count}</n> new words to learn` | Learn state headline. |
| `nothingToReview` | Nothing to review right now. | Learn state support line. |
| `startLearning` | Start learning | Amber button in the learn state. |
| `allDone` | All done for now | Caught-up headline. No day word, because reviews can return the same day [mob R15]. |
| `allDoneDetail` | New reviews will show up here when it is time. | 10 words. Says what happens next, which Anki's done screen fails to do [comp §3.2]. |
| `learnMore` | one: Learn {count} more new word / other: Learn {count} more new words | Kept. |
| `learnMoreCost` | Each new word means a few short reviews later. | States the cost of the action [a11y §4, COGA 4.8.3]. |
| `practiceTricky` | one: Practice {count} tricky word / other: Practice {count} tricky words | Kept. |
| `findAnother` | Find another course | Link. |
| `pickFirst` | Pick your first course | No-courses headline. |
| `pickFirstDetail` | A course is a set of words to learn. | Explains the one new noun in plain words. |
| `findCourse` | Find a course | Amber button in the no-courses state. |
| `remembered` | You remembered this one | Postcard caption line. Only when a postcard shows. |
| (postcard) | `{term}` and `{meaning}` | Data, not messages. `{term}` carries `lang`. The image `alt` comes from the memory trick's own description. |

**This week (new `StudyCalendar.tsx`)**

| Key | Template | Plural and notes |
| --- | --- | --- |
| `heading` | This week | `h2`. |
| `streak` | one: {count} day so far / other: {count} days in a row | Hidden when the count is 0. |
| `today` | Today | Under today's mark. |
| `goal` | one: {done} of {count} word today / other: {done} of {count} words today | Plural follows the target. |
| `goalMet` | You reached today's goal. | |
| `goalCleared` | You finished everything for today. | |
| `showMonth` / `hideMonth` | Show this month / Hide this month | Phone disclosure. Only when there is more than one week of data. |
| `caption` | Days you studied | Table caption, visually hidden. |
| `day.studied` | one: {day}, {count} word / other: {day}, {count} words | Screen-reader text per cell. |
| `day.goal` | {day}, goal reached | |
| `day.none` | {day}, no study | Never "missed". |
| `day.today` | {day}, today | |
| (day names) | `Intl` short weekday: Sun, Mon, … | Not in the catalog. Two S and two T today [a11y §8.3]. |

**Course list (new `CourseList.tsx`, from `DeckList.tsx`)**

| Key | Template | Plural and notes |
| --- | --- | --- |
| `heading` | Your other courses | `h2`. |
| `languageMenu` | Language | aria-label of the menu button. |
| `allLanguages` | All languages | Menu item and button text. |
| (language names) | `Intl.DisplayNames`, first letter upper-cased with the UI locale | Lowercase in Spanish by default [mob §5.4 point 6]. |
| `learnedShort` | one: {learned} of {count} learned / other: {learned} of {count} learned | Translator note: "learned" agrees with "words". |
| `review` | one: Review {count} word / other: Review {count} words | Row button. |
| `reviewLabel` | one: Review {count} word in {course} / other: Review {count} words in {course} | aria-label. `{course}` wrapped in FSI and PDI isolates. |
| `learnLabel` | one: Learn {count} new word in {course} / other: Learn {count} new words in {course} | aria-label. |
| `allDone` | All done | With a check icon. |
| `showAll` | one: Show {count} course / other: Show all {count} courses | Disclosure button. |

**Tip card (new `TipCard.tsx`, from `MemoryCallout.tsx`)**

| Key | Template | Plural and notes |
| --- | --- | --- |
| `tricky` | one: {count} tricky word / other: {count} tricky words | `h2`. The count is the top course's `trickyCount`, so it matches what the button opens. |
| `trickyDetail` | A new memory trick can help. | |
| `practice` | Practice | |
| `practiceLabel` | one: Practice {count} tricky word in {course} / other: Practice {count} tricky words in {course} | aria-label. |
| `tip` | Tip | `h2` when there are no tricky words. |
| `tips[0]` | Say each word out loud as you review. | One tip shows, chosen by day of year. |
| `tips[1]` | A silly picture is easier to remember than a plain one. | |
| `tips[2]` | Short daily reviews work better than one long one. | |

**Progress disclosure (from `ProgressTrends.tsx`)**

| Key | Template | Plural and notes |
| --- | --- | --- |
| `summary` | More about your progress | `<summary>`. |
| `learnedTotal` | one: {count} word learned so far. / other: {count} words learned so far. | |
| `remembered` | You remembered {percent} of your reviews this month. | `{percent}` from `Intl`. Was "RETENTION 84%". |
| `newWords` | one: {count} new word this month. / other: {count} new words this month. | Was "NEW CARDS 142". |

### 4.4 Word counts, before and after

Before: 192 visible words in `main` (217 with screen-reader text), 12 headings, 37 numbers, 9 controls [live §0; code §2.2]. After, same seeded data:

| Region | Today (visible) [a11y §11.3] | Playful Memory |
| --- | --- | --- |
| Greeting | 13 | 2 |
| Language filter | 7 | 2 (inside the list header) |
| Hero (Today + Continue learning) | about 60 | 21 |
| This week | about 32 | 20 |
| Other courses | about 41 | 36 |
| Tricky words / tip | 25 | 10 |
| Trends | 20 | 4 (closed) |
| **Total in `main`** | **about 197** | **about 95** |

Other counts for the default state:

| Measure | Today | Playful Memory |
| --- | --- | --- |
| Headings | 12 | 5 (`h1` greeting, `h2` course, This week, Your other courses, tip) |
| Numbers | 37 | 17 |
| Controls in `main` | 9 | 7 |
| Tab stops in `main` before the main button | 5 | 0 |
| Words on the first phone screen (375 x 550) | about 58 before the button [comp §2] | 31 in total, 14 up to and including the button |
| Words on the first desktop screen (1280 x 800, `main`) | 124 [live §0] | about 81 |
| Explaining sentences in the default state | 4 [code §2.2] | 1 ("A new memory trick can help.") |
| Translatable words across all states | about 345 [mob §5.12] | about 190 (my count of section 4.3) |

Honest note: 95 words is above the a11y file's target of 90 [a11y D10], and 17 numbers is above its target of 14. The course rows carry a progress line each. That is the price of the plant: a graphic must have a sentence beside it [a11y §8].

---

## 5. Colour and theme

All values are the verified set from [color §4.2]. Roles keep the existing shadcn variable names, so components reference semantic tokens only.

### 5.1 Surfaces

| Surface | Role | Light | Dark |
| --- | --- | --- | --- |
| Page | `--background` | neutral.100 `oklch(0.965 0.008 264)` | navy.900 `oklch(0.195 0.045 266)` |
| Sidebar, rail, bottom bar | `--sidebar` | neutral.50 | navy.950 |
| Cards (rows, This week) | `--card` | white | navy.850 `oklch(0.25 0.05 266)` |
| Menus | `--popover` | white | navy.800 |
| **Hero** | `--hero` | blue.950 `oklch(0.29 0.105 267)` | blue.900 `oklch(0.35 0.12 266)` |
| Picture tile and chips on the hero | `--hero-chip` | `oklch(0.387 0.091 267)` | `oklch(0.439 0.104 266)` |
| Plant tile in rows, tracks | `--muted` | neutral.200 | navy.750 |
| Row button fill, selected menu item | `--accent` | blue.100 | navy.750 |
| Tip card | `--tip` (**new alias**, same primitives as `--warning-container`) | orange.100 | orange.950 |

Why the hero is navy in both themes: it measures 12.97:1 against the light page, where today's panel is 1.04:1 [color §5.2 row 57; code §4.3]. In dark it is the most colourful surface on the page (chroma 0.12 against 0.045). That is "never just invert": each theme gets its own depth cue [rui §9.2].

### 5.2 Text

| Level | Role | Used for | Light | Dark |
| --- | --- | --- | --- | --- |
| Strong | `--foreground-strong` | Headings, course titles, all 14 px labels | 18.16:1 on card | 15.33:1 on card |
| Default | `--foreground` | Sentences at 16 px | 12.25:1, Lc 97.9 | 13.39:1, Lc -92.3 |
| Secondary | `--muted-foreground` | Row second lines, tip detail. **16 px and up only.** | 6.82:1, Lc 83.5 | 10.76:1, Lc -77.9 |
| On hero | `--hero-foreground` | Numeral, phrase, course name | 13.78:1, Lc -100.5 | 11.09:1, Lc -96.7 |
| On hero, secondary | `--hero-muted-foreground` | "About 3 minutes", progress line | 10.37:1, Lc -80.6 | 9.72:1, Lc -87.0 |

Figures from [color §5.2]. Secondary text at 12 to 14 px is the combination that "disappears" [color §5.3], so this design has none. About 20 of the 95 words are secondary, down from 58% [fb §5.1].

### 5.3 Actions

| Action | Role | Light | Dark |
| --- | --- | --- | --- |
| **The one main button** | `--cta` / `--cta-foreground` | amber.400 with neutral.950 ink. Label 11.59:1, Lc 76.9. Fill against hero 9.18:1. | amber.300 with navy.950 ink. Label 13.98:1, Lc 84.3. Fill against hero 8.30:1. |
| Its depth | `--cta-edge` as a solid 4 px bottom edge | amber.700. 3.22:1 against the hero (computed here). | amber.600. 4.18:1 (computed here). |
| Hover, pressed | `--cta-hover`, `--cta-active` | amber.300, amber.500 | amber.200, amber.400 |
| Second button on the hero | 2 px border `--hero-muted-foreground`, label `--hero-foreground`, hover fill `--hero-chip` | Border 10.37:1 against the hero | 9.72:1 |
| Row buttons, "Practice" | `--accent` / `--accent-foreground` | 7.54:1, Lc 77.9 | 8.52:1, Lc -77.5 |
| Focus ring | `--ring` (2 px solid, 2 px offset). `--hero-ring` on the hero. | 6.83:1 on card, 13.78:1 on hero | 9.16:1, 11.09:1 |
| Brand blue | `--brand`, `--primary` | Logo, active nav. **Not the main action.** | |

**Rule that keeps amber safe.** Amber is 1.57:1 on a white card [color §5.5]. The amber button may only sit on the hero. A screen with no hero does not get an amber button until it has a navy band or uses the edge.

### 5.4 Status and data

| Thing | Role | Notes |
| --- | --- | --- |
| Studied day (filled) and its check | `--viz-progress` / `--viz-on-progress` | 6.83:1 light, 8.05:1 dark [color §5.2 row 78]. |
| Today's ring | `--viz-progress`, 2.5 px | 6.83:1 light, 6.61:1 dark against the card. |
| No-study day ring | `--border-strong`, 1.5 px | 3.66:1 light, 4.37:1 dark. Today the missed dot is 1.11:1 [code §4.3]. |
| Streak flame | `--streak` | 3.90:1 light, 7.66:1 dark. Always beside its sentence. |
| "All done", goal reached | `--success` with a check icon | 16 px semibold. 5.44:1 light, 10.91:1 dark. |
| Tip card text | `--tip-foreground` (alias of `--warning-container-foreground`) | 9.03:1, Lc 84.5 light. 11.31:1, Lc -84.6 dark (computed here, same values as [color §5.2 row 64]). |
| Plant leaves in rows | `--growth-leaf` (**new**): green.600 light, green.400 dark | 3.28:1 on the tile, 3.92:1 on a card (light). 6.48:1 and 8.76:1 (dark). Computed here. |
| Plant flower (100% only) | `--streak` reused | 3.90:1 on a card in light. About 3.3:1 on the tile (my estimate from the 1.19 tile step). 5.66:1 on the dark tile (computed here). |
| Plant on the hero | `--hero-growth` (**new**): green.300 both themes | 6.73:1 on the hero chip in light, 5.40:1 in dark (computed here). |

**Flags for re-verification.**

1. `--tip`, `--growth-leaf` and `--hero-growth` are new role names. They point at existing verified primitives, but their pairings are not in `verify.mjs` yet. Add them as gated rows.
2. Green for the plant widens what green means. [color §7.2] reserves green for "correct" and "goal met". This design makes green mean "going well": correct, goal reached, growing. If the owner wants the strict rule, draw the plant in `--viz-progress` blue instead.
3. The tip card is 1.03:1 against the light page by lightness (computed here). It separates by hue, by its shadow and by a 4 px start edge in `--streak`. Check it by eye.

### 5.5 60-30-10

A rule of thumb with no authoritative source [color §7.1]. Estimated from the wireframes, not measured.

| Share | Desktop first screen (light) | Phone first screen (light) |
| --- | --- | --- |
| Neutral ground (page, sidebar, cards) | about 63% | about 28% |
| Navy and blue (hero, day marks, tinted buttons) | about 34% | about 64% |
| Warm (amber button, flame, flower) | about 2 to 3% | about 8% |

The check is the squint test from [color §7.1]: if more than one amber shape is visible, something is wrong. On a phone the navy hero is the ground, so a light-theme phone still opens on a mostly dark first screen. See trade-offs.

### 5.6 Theme control

| Where | What |
| --- | --- |
| Desktop sidebar foot, above the account button | Always visible. A native radio group with the legend "Theme" and three rows: "Match my device", "Light", "Dark". Each row is 44 px, with an icon, the word and a filled dot when checked. This is the bottom-left area Crystal circled in example-02 [fb §8 circle D]. |
| Phone and tablet | First group inside the Account menu, using the existing `DropdownMenuRadioGroup` parts (`packages/ui/src/components/dropdown-menu.tsx:193-233`). One tap away. |
| `/settings` | The same control later, with one line of help. |

Behaviour [a11y §7.4; code §5]:

- Default is "Match my device". Change `defaultTheme="light"` in `apps/web/src/main.tsx:25`.
- A small inline script in `apps/web/index.html` sets the class before first paint. Add `color-scheme` per theme and a `theme-color` meta (`#f1f3f9` light, `#0b1429` dark).
- Keep the `localStorage` key `theme` and the class names. The axe specs depend on them.
- Expose the resolved theme from `useTheme()`.
- Remove the `d` shortcut.
- `prefers-contrast: more` overrides from [color §6.7].

---

## 6. Type, spacing, depth

### 6.1 Type scale

Five sizes and six size/weight pairs. Today there are 8 sizes and 15 pairs [code §4.4]. One family (Inter Variable). Weights 400 and 600, plus 700 for the numeral only.

| Step | Size | Weight | Line height | Used for |
| --- | --- | --- | --- | --- |
| Display | 56 px on phones, 72 px when the hero is 36rem or wider | 700 | 1.0 | The hero numeral. Nothing else. Stepped `rem` sizes on a container query, not `clamp()` with `vw` [mob §3.7]. |
| 24 | 24 px | 600 | 1.25 | The phrase under the numeral. State headlines ("All done for now"). |
| 18 | 18 px | 600 | 1.35 | Greeting, course name in the hero, section headings, the main button label. |
| 16 | 16 px | 600 or 400 | 1.5 | Course titles and other button labels (600). Every sentence (400). |
| 14 | 14 px | 600 | 1.4 | Day names, "Today", nav labels on the rail and bottom bar. Always `--foreground-strong`. Never a sentence. |

- No 12 px text anywhere. Today 22 of 84 text runs are 12 px [code §4.4]. NN/g's floor for older adults is 16 px [a11y finding 2].
- Headings are sized by importance, not by tag: the `h1` greeting is 18 px [rui §3.6].
- Negative tracking on the numeral only, and only for Latin, Greek and Cyrillic (`:lang()`), because letter-spacing breaks Arabic [mob §5.8].

### 6.2 Spacing

The eight-step scale from [rui §8.2]: 4, 8, 12, 16, 24, 32, 48, 64 px. Three distances do most of the work:

- 8 to 12 px: a label to its thing, buttons in a row, row to row.
- 16 to 24 px: inside a card (phone 16 to 20, desktop 24). Hero padding is 20 on phones and 32 on desktop.
- 40 to 48 px: between the hero and what follows, and between sections.

Control heights: 56 px main button, 48 px second hero button, 44 px everything else a learner taps. Neighbours at least 8 px apart. Nothing that holds text has a fixed height or `whitespace-nowrap`: use `min-h-*` and let labels wrap. A real Spanish label overflowed its button at 320 px today [mob §2.3].

### 6.3 Borders versus shadows

- **Light theme: shadows, not rings.** Cards get the low elevation shadow and no ring. The hero gets the next level. Shadow recipes from [rui §8.3], tinted with the neutral hue. They are starting values to tune by eye.
- **Dark theme: lightness, not shadows.** Sidebar 0.16, page 0.195, card 0.25, chip 0.34, hero 0.35 [color §4.2]. Cards also get the 1 px `--border` hairline (1.73:1).
- **Every card and the hero keep a real 1 px border**, transparent in normal modes. Forced-colours mode removes shadows and fills, and a real border is what stays visible [a11y §7.5].
- **No divider lines.** Rows are separate cards with 8 px gaps. The sidebar separates by its background step. About fourteen faint lines sit in the first screen today [rui §9.7].
- **The main button's depth is a solid edge.** Fill `--cta`, a 4 px bottom edge in `--cta-edge` (`box-shadow: 0 4px 0`), hover one step lighter and raised 2 px, pressed moves down 4 px and loses the edge. Motion sits behind `motion-safe`. It keeps `border border-transparent`. This is the owner's "solid primary with depth" rule, and it is close to old Memrise's raised buttons [mem §4.3].

### 6.4 Radius

Raise `--radius` from 0.5rem to 0.625rem (`packages/ui/src/styles/globals.css:98`). Larger radii read as more playful and must be applied everywhere [rui §2.4].

| Element | Class | About |
| --- | --- | --- |
| Hero | `rounded-4xl` | 26 px |
| Cards, postcard, plant tiles | `rounded-2xl` | 18 px |
| Buttons, menu | `rounded-xl` | 14 px |
| Day marks, radio dots | `rounded-full` | |

Flag: `--radius` is app-wide. The study session and marketing pages get rounder too. Check them.

---

## 7. Component plan

Rules respected throughout: semantic tokens only, Base UI primitives, shadcn parts copied by hand, strings in per-component `messages` objects, discriminated unions for state, `Intl` formatters, and no unused exports (Knip).

### 7.1 Existing files

| File | Verdict | What changes |
| --- | --- | --- |
| `-components/TodayPanel.tsx` | **Merge** into new `MemoryHero.tsx`, then delete | Keeps the `TodayState` union as its only state input and switches on `status`. The review branch reads `state.focusDeck.dueCount` and `estimateMinutes(state.focusDeck.dueCount)` so the headline equals what the button opens. Links keep `/study/$courseId?mode=…`. |
| `-components/FocusDeckCard.tsx` | **Merge** into `MemoryHero.tsx`, then delete | Title and progress move into the hero. The `showAction` and `isSameAction` logic is no longer needed. Remove `isSameAction` if nothing else imports it. |
| `-components/DeckList.tsx` | **Restyle and rename** to `CourseList.tsx` | Rows become cards: `GrowthMark` tile, title, language name plus learned line, one tinted button with the count in its label. First 4 rows, then a native `<details>` for the rest. The header holds the `h2` and the language menu. Keeps the container query for row layout. |
| `-components/ThisWeek.tsx` | **Restyle and rename** to `StudyCalendar.tsx` | A real `<table>`: caption, `Intl` short day headers, one row per week. `GoalRing` goes. Today's cell draws its own progress ring. Not interactive: no tab stops inside the table [comp §6.4]. Keeps `weekDays()` for the current row. |
| `-components/MemoryCallout.tsx` | **Restyle and rename** to `TipCard.tsx` | Prop is a union: `{ kind: "tricky"; deck; count } \| { kind: "tip"; index }`. The word chips go. "Practice" is a real link. |
| `-components/ProgressTrends.tsx` | **Restyle** into a `<details>` | Two or three sentences in a `<dl>`-free list. No tiles, no trend icon, no global average. |
| `-components/LanguageFilter.tsx` | **Restyle** | Becomes a Base UI menu of links. Same `?studying=` search param and validation (`dashboard.tsx:80-96`). Rendered inside the `CourseList` header, so it comes after the hero in DOM and tab order. Hidden with one language. |
| `-components/DashboardGreeting.tsx` | **Keep, simplify** | Props shrink to `name`. One message plus a no-name form. Hour logic and the status sentence go. Name in `<bdi>`. |
| `-components/AppSidebar.tsx` | **Restyle** | New labels. `ThemeControl` in the foot. Rail between `md` and `lg`. One `<nav aria-label="Primary">` restyled as a bottom bar below `md`, sticky only when the viewport is at least 480 px tall, with safe-area padding and `scroll-padding-bottom` on the scroller [mob §4.5]. The hamburger goes. Physical classes become logical (`md:border-r`, `text-left`). |
| `-components/LanguageBadge.tsx` | **Remove** | Replaced by the plant tile and the visible language name. |
| `-components/LastStudied.tsx` | **Remove** | Parked for the course page. |
| `-components/dashboard-model.ts` | **Keep, add three pure functions** | `learnedCount(deck)`, `growthStage(deck)` returning `"seed" \| "sprout" \| "leaf" \| "bud" \| "bloom"`, and `calendarWeeks(now, firstDayOfWeek, days, target, clearedToday)` returning rows of `WeekDay`. `masteredRatio` and `totalMastered` lose their callers. Delete them, or Knip fails. |
| `-components/dashboard-metrics.ts` | **Keep, extend for #112** | Add optional `featuredMem: FeaturedMem \| null` (`cardId`, `courseId`, `term`, `learningLanguage`, `meaning`, `imageUrl`, `imageAlt`). Widen the comment on `dailyGoal.days` from 7 days to "up to 35". |
| `-components/dashboard-previews.ts` | **Keep, add previews** | `with-mem`, `month` (35 days), `new-learner` (first day). The axe spec walks them. |
| `routes/_app/dashboard.tsx` | **Restyle** | New layout grid with `@container/main`. Passes `todayState(decks)` to the hero. |
| `routes/_app.tsx` | **Keep, add** | Skip link as the first focusable element. `id` on `<main>`. |

Growth stage thresholds, by learned share: 0 is seed, under 25% sprout, under 50% leaf, under 100% bud, 100% bloom. Spanish at 200 of 1,000 is a sprout.

### 7.2 New components

| Component | Where | Notes |
| --- | --- | --- |
| `MemoryHero` | `-components/MemoryHero.tsx` | `<section aria-labelledby>` named by the course `h2`. One function per `TodayState` status, as `TodayPanel` does today (`TodayPanel.tsx:270-281`). The hero wrapper sets a class so focus rings inside use `--hero-ring`. |
| `MemPostcard` | `-components/MemPostcard.tsx` | Fixed aspect image (`object-cover`, `width` and `height` set), inset ring so a white image does not bleed [rui §9.9], caption under the image, never on it. The frame is tilted 2 degrees. The caption is not. Renders only when `featuredMem` is not null. |
| `GrowthMark` | `apps/web/src/components/growth-mark.tsx` | Inline SVG, five stages, two sizes (28 px in tiles, up to 160 px in the hero). `aria-hidden`. Uses `currentColor` and the growth roles. Original art in Memli's own style. Do not copy Memrise's sprites. |
| `StudyCalendar` | `-components/StudyCalendar.tsx` | See 7.1. |
| `CourseList`, `TipCard` | `-components/` | See 7.1. |
| `ThemeControl` | `apps/web/src/components/theme-control.tsx` | Native `<fieldset>`, `<legend>` and three radios for the sidebar. The Account menu uses the dropdown radio parts. Same label, options and order in both [a11y §7.3]. It is the first caller of `useTheme()`. |
| Button variants | `packages/ui/src/components/button.tsx` | Add `cta` (amber, edge), `onHero` (outline on navy) and `tinted` (`bg-accent`). Add size `xl` (56 px) and make `lg` 44 px for these. Replace `whitespace-nowrap` with wrapping and `min-h`. Replace `ring-ring/50` with a solid 2 px outline. Replace `hover:bg-primary/80` with `--primary-hover` [color §4.3]. This removes the three hand-written 44 and 48 px overrides [code §0.3]. |
| Tokens | `packages/ui/src/styles/globals.css` | Adopt the generated three-tier file from [color Appendix A]. Add `--tip`, `--tip-foreground`, `--growth-leaf`, `--hero-growth`. Delete the wrong hex comments [code §0.10]. |
| Formatters | `apps/web/src/lib/formatters.ts` | Add a `"short"` weekday width. |

Study actions are links that look like buttons. Today Base UI renders them as `<a role="button">`, so screen readers say "button" for something that navigates [code §9]. Render plain links with the button classes.

### 7.3 Build order

1. Tokens, theme provider, pre-paint script, `ThemeControl`. Dark mode ships first because it is the one request stated as a rule [fb §7].
2. Button variants and the focus ring.
3. `MemoryHero` with the plant fallback. Delete `TodayPanel` and `FocusDeckCard`.
4. `StudyCalendar` (one row), `CourseList`, `TipCard`, progress disclosure.
5. Shell: nav labels, rail, bottom bar, skip link.
6. Later, with #112 and #50: `MemPostcard`, month rows.

---

## 8. Accessibility and i18n notes for this design

### 8.1 What it fixes

- One clear main action, visible without scrolling [a11y §4, COGA 4.3.4].
- The main button is the first tab stop in `main`. Today 5 to 13 filter stops come first [live §13.4].
- Focus ring goes from about 2.4:1 to 6.8:1 or better [color §4.3].
- Dark secondary text goes from Lc 43 to 46 up to Lc 78 or better [color §5.2].
- No text under 14 px. No sentence under 16 px.
- Skip link, real page title, links announced as links.

### 8.2 Risks this design adds

| Risk | Criterion | Guard |
| --- | --- | --- |
| A yellow button reused outside the hero | 1.4.11 in spirit. 1.57:1 on white. | The `cta` variant is documented as hero-only. Lint or review for `variant="cta"` outside `MemoryHero`. |
| The postcard image | 1.1.1, 1.4.5 | Real `alt` from the memory trick's description. No baked-in text. Term and meaning are HTML with `lang`. Caption never on top of the image. |
| Showing an answer before the test | Learning, not WCAG | The postcard never shows a word that is in today's review or new queue [comp §9.1]. The server picks it. |
| The plant encodes progress by picture | 1.4.1, 1.4.11 | Each stage has a different shape, not only a colour. The sentence beside it carries the fact. The SVG is `aria-hidden`. |
| The calendar | 1.3.1, 1.4.1, 2.5.8, 1.4.10 | Real table. Each state has a shape: check, small dot, thick ring, thin ring. Cells are not interactive. Seven 36 px columns fit 320 px. A visible sentence says the same thing. |
| Sticky bottom bar | 2.4.11 | `scroll-padding-bottom`. Not sticky under 480 px of height. Not on `/study`, which has its own layout. |
| The language menu sits below the hero but changes the hero | 3.2.2, predictability | It is a menu of links, so the change is a user-started navigation and focus stays on the menu. Trade-off accepted so the main action is the first tab stop. |
| Motion: button lift, plant "pop", flame at 7, 30 and 100 days | 2.3.3 | All behind `motion-safe`. Nothing loops. Nothing over 5 seconds. |
| Forced colours | [a11y §7.5] | Real borders on the hero and cards. `outline` for focus. The plant uses `currentColor`. Checks are glyphs. Not tested in a browser. |
| A mostly navy first screen in the light theme on phones | Reading comfort | People with normal vision read slightly better on light [a11y finding 3]. The hero holds about 20 short words in large type, not paragraphs. Verify with real people. |
| Tilted postcard | Reading | Only the frame rotates, 2 degrees, static. Caption text stays straight. |

### 8.3 i18n notes

- **The numeral stands alone** and the noun sits under it at 24 px. One `rich()` message, so a translator can reorder it or drop the digit, as Arabic does for 1 and 2 [mob §7.1].
- **Short labels grow the most.** "Due" to "Pendientes" is +233% [mob §5.2]. This design has almost no one-word labels left: buttons are verb phrases and they wrap.
- **Row buttons hold a count.** "Learn 10 new words" becomes about 222 px in Spanish at 16 px [mob §7.4]. On phones the button is full width. On desktop the row drops the button under the text when the row is narrower than 28rem.
- **Day names** come from `Intl` short format and vary in length. The table columns share the width evenly and labels may shrink to the narrow form under 20rem of container width, with the long name kept for screen readers.
- **Week start** follows the locale (`firstDayOfWeek`), as today. The calendar rows depend on it. A bare `en` resolves to Sunday [mob §5.4 point 8].
- **"learned" agrees with a hidden noun** in Spanish ("aprendidas"). Every key in section 4.3 needs a translator description: screen, part of speech, the noun it refers to [mob R7].
- **No idioms.** "Keep slipping", "caught up", "in good shape" and "stick" are gone [mob R9].
- **No gendered greeting.** "Hi" has no gender. "Welcome back" does in Spanish [mob §5.6].
- **Plant, not owl.** Owls carry bad-luck meanings in parts of Latin America and Africa [mob §5.10]. A plant with plain words has no such baggage that I found. I did not research plant symbolism by culture.
- **RTL.** Logical classes only. The picture zone is on the end side. The 2 degree tilt does not need to mirror.
- **Run the pseudo-locale plan** P1 to P8 from [mob §8] before any real translation.

---

## 9. What is fun about it

Fun lives inside the first-glance and second-glance elements. It adds no boxes.

1. **A postcard from your own memory.** The hero shows a community memory trick for a word you already know: a picture, the word, its meaning, and "You remembered this one". It is a small win before you start. No competitor's home screen has this, and it is the thing old Memrise users missed most [mem §5.2].
2. **Every course is a little plant.** Seed, sprout, leaves, bud, flower. It grows as you learn. The hero shows the big one. Each row shows a small one. It is example-01's "memory garden" [fb §4.1] without the extra card and without garden jargon.
3. **A calendar that grows with you.** One row in your first week. A new row each week you study, up to five. Round check marks fill in. A new learner never sees an empty grid.
4. **A chunky yellow button.** The only yellow thing on a deep navy card, with a solid edge that presses down when you tap it. The owner's rule (solid, with depth) and the pair two people picked in example-02 [color §8.3].
5. **Rounder, deeper, warmer.** Bigger corners, real shadows in light, real navy in dark, one warm tip card, an orange flame.
6. **Small celebrations.** "All done for now" with the plant and a check. A flame wiggle at 7, 30 and 100 days: Duolingo measured +1.7% day-7 retention from milestone-only animations [comp §5.1]. Never on a normal day.
7. **A kinder voice.** "Hi, Phillip". "You remembered this one". "12 days in a row". No sentence tells you what you failed to do.

---

## 10. Trade-offs and risks

### 10.1 Honest trade-offs

- **The hero says 16, not 24.** The learner no longer sees a total across courses. In exchange the headline and the button agree [a11y finding 10]. If a cross-course session is built (`docs/designs/dashboards/PLAN.md:146`), the headline can become the total again.
- **About 95 words, not 76 to 90.** The plant needs a sentence in every row.
- **The streak is quieter.** It is one line in This week, not in the greeting. Some learners like the push. The research says the push hurts more people than it helps in this audience [a11y §9].
- **The numbers people lose.** Mastered, learning and not-started counts, "last studied", consistency and the global average leave the dashboard. Two of them are parked with no page to live on yet.
- **"Learned" is generous.** It counts words the learner has started, not words known well. It must be defined once and used the same way everywhere.
- **The filter moves down.** A learner with twelve courses in six languages scrolls past the hero to reach it. Power users of old Memrise valued the filter and a compact list [mem §5.2].
- **No time-of-day greeting.** "Hi" is safer in every language and a little less warm than "Good evening".
- **The month view cannot ship yet.** The data holds 7 days. Crystal sees one row of check marks at first, not a "Github chart".
- **The bottom bar costs 56 px** on phones. The hero budget absorbs it. A DEV-only floating pill already covers a button at 375 px [mob §3.5], so test with those hidden.
- **Language codes are gone.** Each row gains one word (the language name).
- **A global radius change** touches screens outside the dashboard.
- **Plants echo Memrise.** That is the nostalgia, and also a resemblance. The art must be original.
- **Evidence is thin.** Four people answered. The visible vote is a 2 to 2 tie, and one gave no reason [fb §2]. This design is a bet that "fun" plus "one focal point" beats either alone.

### 10.2 The three biggest risks

1. **The centrepiece depends on data and art that do not exist.** There is no mnemonic image, meaning or author in the dashboard contract [code §7.3], and the caption frame (#50) renders nothing in production. On day one the hero picture is the plant. That needs five well-drawn stages at two sizes. If the art is weak, "playful" turns into clip art, and the page is a navy box with a yellow button.
2. **Navy and amber is a brand shift, and this proposal adds to the colour system.** Amber fails on light surfaces (1.57:1), so every other screen stays blue until it is redesigned: two looks in one product [color §8.3]. On top of the verified set I add green for growth, a warm tip surface and a per-course plant. Each one weakens "one colour, one meaning", and none is in the gate script yet.
3. **Fun pulls against calm.** Rows carry a plant, a progress line and a counted button. On a light-theme phone the first screen is about two thirds navy. The filter and several numbers move out of reach. Clozemaster's 2024 enlargement drew "It's all so big!" and Memrise's 2021 simplification angered long-time users [comp §3.2; mem §5.2]. Test before committing: the five-second and first-click scripts in [a11y §13], in both themes, at full size, with the same four people.

### 10.3 Checks that decide whether it worked

| Check | Target |
| --- | --- |
| Amber shapes on the first screen | Exactly 1 (0 when nothing is scheduled) |
| "Start review" bottom edge at 375 px wide | y = 310, and under 494 with pseudo-long text |
| "Start review" on desktop | At least 280 x 56 px |
| Visible words in `main`, default state | 95 or fewer |
| Text under 14 px | 0 |
| Size and weight pairs | 6 |
| First click on "Start review" | 4 of 4 people, both themes |
| Blur test at 8 px | The button is the single most saturated shape [comp §10.2] |
| axe, all previews, both themes | 0 violations (0 today [live §0], must stay 0) |
| Extra pairings in `verify.mjs` | Added and passing |

---

## Sources

Research files (all read; `live-audit.md`, `refactoring-ui.md` and `a11y-usability.md` were read in their summary, scale, copy, theme, graphics and conclusion sections, not line by line):

- `code-audit.md`, `color-science.md`, `memrise-archive.md`, `feedback-examples.md`, `mobile-i18n.md`, `competitors-attention.md`, `live-audit.md`, `refactoring-ui.md`, `a11y-usability.md` in the research folder named at the top.

Images viewed: `docs/designs/dashboards/example-01.jpeg`, `example-02.png`, `example-04.png`, `example-05.jpg`; the light desktop screenshot of the current page; the colour mock `redesign/color/preview.png`. Not viewed: `example-03.png`, Crystal's annotated screenshot, the dark screenshots (I relied on [fb] and [live] for those).

Code read: `apps/web/src/routes/_app/dashboard.tsx:60-175`, `-components/dashboard-model.ts:1-175`, `-components/dashboard-metrics.ts:1-70`, `-components/dashboard-previews.ts:105-125`, `apps/web/src/lib/formatters.ts:125-201`, `.cursor/rules/shadcn-components.mdc`, `.cursor/rules/react-state.mdc`. Other file and line references are taken from [code] and [mob].

Computed here: `estimateMinutes(16)` is 3 (formula at `-components/dashboard-model.ts:5-12`); the extra contrast pairings in `playful-memory-pairs.mjs`.

Book references (Refactoring UI, Interaction of Color) are second-hand through [rui] and [color], which cite them from memory.

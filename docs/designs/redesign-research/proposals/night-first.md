# Dashboard redesign proposal: NIGHT FIRST

One design for `/dashboard`. The dark navy theme is designed first. The light theme is derived from it, so both are first-class.

**How to read the citations.** Tags point to the research files in `scratch/research/`:

| Tag | File |
| --- | --- |
| [CS] | `color-science.md` |
| [CA] | `code-audit.md` |
| [LA] | `live-audit.md` |
| [FE] | `feedback-examples.md` |
| [MA] | `memrise-archive.md` |
| [RUI] | `refactoring-ui.md` |
| [AU] | `a11y-usability.md` |
| [MI] | `mobile-i18n.md` |
| [CP] | `competitors-attention.md` |

`[CS §5.2 #26]` means section 5.2, pairing row 26. `file.tsx:12` is a line in the code on `dev`. External URLs are in "Sources" at the end. Paths like `apps/web/...` are relative to `dev/memli/`.

**What I did.** I read all nine research summaries and the sections I cite. I read `color-science.md` sections 0 to 10 in full, because every color value here comes from it. I looked at the five example images, the current dark and light screenshots, and the color mock (`color/preview.png`). I read `globals.css`, `button.tsx`, `index.html`, `dashboard-model.ts`, `dashboard-metrics.ts` and `AppSidebar.tsx`. I did not read every line of every research file. I did not render this design in a browser. See section 11.

**The short version.** One navy panel. One amber button. Everything else is quiet. The page drops from 217 words to about 85, from 12 headings to 6, from 15 type styles to 8, and from 14 shapes in the main button's color to 1.

---

## 1. North star

> **Open Memli at any hour and one lit button on a deep navy panel tells you what to study and how long it will take. Everything else waits quietly in the dark until you look for it.**

Three principles follow from it.

**Principle 1. One light in the room.**
Amber means "do this next" and nothing else. There is exactly one amber shape on the screen. When there is nothing to do, there is no amber at all.
Why: a target that shares its color and shape with other things cannot be found at a glance [CP §4, preattentive attributes and Von Restorff]. Today 14 elements share the button's exact blue [CA §0 finding 1]. Amber on navy measures 8.30:1 in dark and 9.18:1 in light, and stays above 7:1 in color-blindness simulations [CS §5.2 #29, §5.4].

**Principle 2. Surfaces carry the structure. Text only has to be read.**
Each region has its own surface step, so no region needs a heading, a border and a label to announce itself. Text comes in three tones only, and small text is never gray.
Why: the current text passes WCAG everywhere (lowest 4.89:1), but panel against page is 1.04:1 [CA §0 finding 2]. Karen's words were "the white background makes the words disappear" [FE §2]. In the current dark theme, gray text scores APCA Lc 43 to 46 against a target of 75 [CS §2.2].

**Principle 3. Say each fact once, in words a new learner already knows.**
Every number appears in one place. The button's count matches what the button opens. No "deck", "due", "mastered" or "streak".
Why: about 9 of the 31 numbers on the page are repeats [CA §3]. The headline says 24 but the button opens 16 [AU §0 finding 10]. Crystal questioned "Deck" [FE §2].

---

## 2. Focal hierarchy

### 2.1 First glance: one element

**The Study hero.** A saturated navy panel at the top of the main column. It merges today's "Today" panel and "Continue learning" card into the single card Crystal circled twice [FE §8 circles A and B].

It holds, in this order:

1. The course name, with its language badge.
2. One huge number and its phrase: "16 words to review".
3. One line of cost: "About 3 minutes".
4. **The amber "Start review" button.** 56 px tall, full width on phones, at least 280 px wide on desktop.
5. One quiet second action: "Learn 10 new words".
6. One line of progress: "200 of 1,000 words learned", with a thin bar.

The count is for this course only. That is what the button opens [CA §7.3; AU §11.1 Decision 1]. `estimateMinutes(16)` returns 3 (`dashboard-model.ts:7-12`, 8 seconds per review).

### 2.2 Second glance: two elements

1. **This week.** Seven day marks, "12 days in a row", and "24 of 50 words today". Crystal circled this in example-05 [FE §8 circle C]. It sits right under the hero on phones and beside it on desktop.
2. **Your other courses.** Compact rows: badge, title, one status line, one quiet button.

They answer the next two questions: "Am I keeping it up?" and "What else do I have?" [CP §8.3].

### 2.3 Third level

| Element | Where | Why it is third |
| --- | --- | --- |
| Greeting "Hi, Phillip" | Above the hero, as the `h1` | Warm, but not an action. Smaller than the hero number. |
| Tip card (tricky words, or a study tip) | Under the week card on desktop, after the courses on phones | Crystal circled the Study Tip in example-02 [FE §8 circle E]. One warm card. |
| "Your progress" | A closed disclosure at the bottom | Reference numbers. Progressive disclosure [AU §2.1, NN/g S15]. |
| Theme control | Sidebar foot on desktop, top bar on phones | Always visible, never in the content's way. |

### 2.4 What is removed or moved, and where it goes

Nothing disappears silently. Every current element is in this table.

| Today | Decision | Where it goes |
| --- | --- | --- |
| "About 4 minutes of review keeps your 12-day streak going." (`DashboardGreeting.tsx:15-18`) | Cut | Minutes are in the hero. Days in a row are in This week. Streak pressure leaves the `h1` block [AU §9.3]. |
| "Studying" + 5 language chips above the hero (`LanguageFilter.tsx`) | Moved and shrunk | One "Language" menu in the "Your other courses" header. It only appears with more than 5 other courses and 2 or more languages. It filters the list only. The hero no longer changes with it. |
| "TODAY" eyebrow (`TodayPanel.tsx:289-294`) | Cut | The hero's heading is the course name. |
| "24 cards ready to review" (total across courses) | Changed | The hero shows the focus course's count (16). The other 8 show once, in the Japanese row. |
| "16 from Spanish Core 1000", "8 from Japanese..." chips (`TodayPanel.tsx:113-132`) | Cut | The hero names the course. The row shows the other count. |
| "Starts in Spanish Core 1000." (`TodayPanel.tsx:152-156`) | Cut | No longer needed. The hero is that course. |
| "Continue learning" card (`FocusDeckCard.tsx`) | Merged | Into the hero. |
| "Last studied ..." x4 (`LastStudied.tsx`) | Removed from the dashboard | Sort order already puts recent courses first (`dashboard-model.ts:35-50`). The line returns on a course page when one exists. Until then it is not shown. |
| "16 Due", "10 New today" big stats | Cut | Same facts as the hero number and the second button. |
| "5% mastered of 1,000 cards" | Rewritten | "200 of 1,000 words learned" in the hero (mastered plus learning). |
| "52 mastered, 148 learning, 800 not started" legend | Moved | "Your progress" disclosure, as a small table per course. |
| Other-course "{n}% mastered" + mini bars (`DeckList.tsx:56-65`) | Moved | Same table in "Your progress". |
| Goal ring "24 of 50" (`ThisWeek.tsx:65-94`) | Replaced | Today's day mark fills as a small ring. The sentence "24 of 50 words today" carries the value. |
| "Daily goal" + "26 more cards to reach today's goal." | Cut | 26 is 50 minus 24. The sentence above says enough. |
| "Words mastered 100" | Moved | "Your progress", as "{count} words learned so far". |
| "7 words keep slipping" card with 5 word chips (`MemoryCallout.tsx`) | Restyled | The tip card: count, one sentence, a "Practice" button. The chips go. They looked like buttons and were not [AU §11.2 row 40]. The words show inside the practice session. |
| "Your progress trends" strip (`ProgressTrends.tsx`) | Moved | "Your progress" disclosure, in plain sentences. |
| "Consistency 98%, +2% from last week" | Deleted | The week marks show consistency. |
| "Global average: 75%" | Deleted | No comparison with strangers [AU §9.3 rule 7]. |
| "d" key theme toggle (`theme-provider.tsx:131-168`) | Deleted | Replaced by the visible Theme control. It fails WCAG 2.1.4 [AU §0 finding 7]. |
| Phone hamburger menu (`AppSidebar.tsx:177-204`) | Replaced | A bottom bar with Home, Community, You. |
| Nav "Decks", "Community Gallery" | Renamed | "Home", "Community". |
| "View Profile" menu item (links to `/dashboard`, a placeholder) | Hidden | Returns when a profile page exists [MI §9 #17]. |

Two things reviewers liked are **not** in this version, on purpose:

- **The GitHub-style chart** (Crystal). The data contract only holds 7 days (`dashboard-metrics.ts:59`). The 7-day marks ship now. A 5-week calendar goes inside "Your progress" once issue #112 supplies history [CP §6.4 variant B]. A year grid stays off the dashboard.
- **A mnemonic image in the hero.** `DashboardDeck` has no image field [CA §7.3]. The hero has an art slot that shows a drawn card stack now and can take a mnemonic image later.

---

## 3. Wireframes

Sizes are CSS px. Heights are my arithmetic from the type and spacing scales in section 6. They are estimates, not measurements.

### 3.1 Phone, 375 x 812 (default state)

A 375 x 812 phone shows roughly 635 px with Safari's bars visible. A 375 x 667 phone shows roughly 550 px. Both figures are estimates from the research, not device tests [LA §3.2; MI §2.1].

```
y=0    ┌───────────────────────────────────────┐
       │ [▣] Memli                  [☾ Theme]  │  56   top bar, scrolls away
y=56   ├───────────────────────────────────────┤
y=72   │ Hi, Phillip                           │  32   h1, 24 px bold
y=120  │ ╔═══════════════════════════════════╗ │
       │ ║ [ES] Spanish Core 1000            ║ │  28   h2, 18 px semibold
       │ ║                                   ║ │
       │ ║ 16                                ║ │  56   the number, 56 px bold
       │ ║ words to review                   ║ │  28   20 px semibold
       │ ║ About 3 minutes                   ║ │  28   18 px regular
       │ ║                                   ║ │
       │ ║ ┌───────────────────────────────┐ ║ │
       │ ║ │ ▶  Start review               │ ║ │  56 + 3 px edge.  AMBER
y=371  │ ║ └───────────────────────────────┘ ║ │  <- bottom of the main button
       │ ║ ┌───────────────────────────────┐ ║ │
       │ ║ │ Learn 10 new words            │ ║ │  48   tinted navy
y=431  │ ║ └───────────────────────────────┘ ║ │
       │ ║ ▓▓▓▓▓▓░░░░░░░░░░░░░░░░░░░░░░░░░░ ║ │   8   bar
       │ ║ 200 of 1,000 words learned        ║ │  24
y=503  │ ╚═══════════════════════════════════╝ │  hero is about 383 px tall
y=519  │ ┌───────────────────────────────────┐ │
       │ │ This week                         │ │  heading visible above the fold
 - - - - - - - - - - - - - - - - - - - - - - - - -  fold: about y=579 (635 minus the bar)
       ├───────────────────────────────────────┤
       │   ⌂ Home     ◎ Community     ☺ You    │  56 + safe area. Sticky bottom bar
       └───────────────────────────────────────┘
```

Above the fold: greeting, the whole hero, and the heading of This week as a scroll cue.

| Check | Today | This design |
| --- | --- | --- |
| Bottom edge of the main button, 375 wide | y 625 [LA §3.2] | about y 371 |
| Fits 375 x 550 (small phone) with the bottom bar (494 px left) | No, 77 px below the fold [LA §3.2] | Button and second action fit. The last 9 px of hero padding are cut. |
| Fits 320 x 450 | No (y 672 to 716) [MI §2.1] | Button ends near y 399 if the course name wraps once. The bottom bar is not sticky under 480 px of height, so it fits. |
| Words on the first screen (main only) | 53 [LA §3.1] | 26 |

The rest of the phone page, scrolling down:

```
       │ ┌───────────────────────────────────┐ │
       │ │ This week                         │ │  28
       │ │ Sun  Mon  Tue  Wed  Thu  Fri  Sat │ │  20   14 px semibold, from Intl
       │ │ (✓)  (✓)  (✓)  (✓)  (✓)  (◔)  ( ) │ │  36   done, done..., today, later
       │ │ 🔥 12 days in a row               │ │  28
       │ │ 24 of 50 words today              │ │  28
       │ └───────────────────────────────────┘ │  about 200
       │                                       │
       │ Your other courses                    │  28   h2, 20 px semibold
       │ ┌───────────────────────────────────┐ │
       │ │ [JA] Japanese Hiragana & Katakana │ │
       │ │      8 words to review   [Review] │ │  about 96 per row
       │ │ ─────────────────────────────────  │ │
       │ │ [FR] French Travel Phrases        │ │
       │ │      10 new words         [Learn] │ │
       │ │ ─────────────────────────────────  │ │
       │ │ [PT] Portuguese Essentials        │ │
       │ │      ✓ All done                   │ │
       │ └───────────────────────────────────┘ │
       │                                       │
       │ ┃ 💡 4 tricky words in               │ │  tip card, warm surface
       │ ┃    Spanish Core 1000               │ │
       │ ┃ A new memory trick can help.       │ │
       │ ┃ [Practice]                         │ │  about 170
       │                                       │
       │ ▸ Your progress                       │  56   closed disclosure
       └───────────────────────────────────────┘
```

Estimated page height: about 1,430 px, a little over two screens. Today it is 2,658 px, 3.3 screens [LA §3.1].

**Landscape phone (667 x 375).** The hero switches to two columns when it is at least 520 px wide: text on the start side, the two buttons stacked on the end side. The bottom bar is not sticky. The button's bottom edge lands near y 270.

### 3.2 Tablet, 768 x 1024

The sidebar stays, at 224 px. The main column is one column, 496 px wide. Today the sidebar takes 256 px here and squeezes main to 464 px [LA §3.3].

```
┌──────────────┬──────────────────────────────────────────────────┐
│ ▣ Memli      │  Hi, Phillip                          y 32, 30 px │
│              │                                                  │
│ ▌⌂ Home      │  ╔══════════════════════════════════════════════╗ │ y 92
│  ◎ Community │  ║ [ES] Spanish Core 1000                       ║ │
│              │  ║ 16                                           ║ │ 72 px number
│              │  ║ words to review                              ║ │
│              │  ║ About 3 minutes                              ║ │
│              │  ║ ┌────────────────────┐ ┌──────────────────┐  ║ │
│              │  ║ │ ▶ Start review     │ │Learn 10 new words│  ║ │ buttons in a row
│              │  ║ └────────────────────┘ └──────────────────┘  ║ │
│              │  ║ ▓▓▓▓▓░░░░░░░░░░░░░░░░ 200 of 1,000 words…   ║ │
│              │  ╚══════════════════════════════════════════════╝ │ y ≈ 450
│              │  ┌──────────────────────────────────────────────┐ │
│              │  │ This week        Sun Mon Tue Wed Thu Fri Sat │ │ one wide strip
│              │  │ 🔥 12 days in a row  (✓)(✓)(✓)(✓)(✓)(◔)( )  │ │
│              │  │ 24 of 50 words today                         │ │
│              │  └──────────────────────────────────────────────┘ │ y ≈ 590
│ ┌──────────┐ │  Your other courses                               │
│ │ Theme    │ │  [JA] Japanese Hiragana & Katakana       [Review] │
│ │ ◉ Match… │ │  [FR] French Travel Phrases               [Learn] │
│ │ ○ Light  │ │  [PT] Portuguese Essentials           ✓ All done  │ y ≈ 900
│ │ ○ Dark   │ │  ┃ 💡 4 tricky words in Spanish Core 1000 …       │
│ └──────────┘ │ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ fold y=1024 │
│ ◯ @user    ⌃ │  ▸ Your progress                                  │
└──────────────┴──────────────────────────────────────────────────┘
```

Above the fold: greeting, hero, week strip, all three course rows, and the top of the tip card.

### 3.3 Desktop, 1280 x 800 and wider

Sidebar 256 px. Content is at most 1,152 px wide and never stretches further. Two columns start when the content area is at least 896 px wide (a container query, not a viewport breakpoint). Main column 608 px at 1280. Aside 320 px. Column gap 32 px.

```
┌────────────────┬─────────────────────────────────────────────────────────────────────────────┐
│ ▣ Memli        │  Hi, Phillip                                                     y 32 to 68  │
│                │                                                                             │
│ ▌⌂ Home        │  ╔══════════════════════════════════════════╗   ┌────────────────────────┐  │ y 92
│  ◎ Community   │  ║ [ES] Spanish Core 1000          ┌───┐    ║   │ This week              │  │
│                │  ║                               ┌─┴─┐ │    ║   │ Sun Mon Tue Wed Thu Fri Sat│
│                │  ║ 16                            │ES ├─┘    ║   │ (✓) (✓) (✓) (✓) (✓) (◔) ( )│
│                │  ║ words to review               └───┘      ║   │ 🔥 12 days in a row    │  │
│                │  ║ About 3 minutes               card stack ║   │ 24 of 50 words today   │  │
│                │  ║                                          ║   └────────────────────────┘  │ y 312
│                │  ║ ┌────────────────────┐ ┌───────────────┐ ║   ┃ 💡 4 tricky words in   ┃  │ y 336
│                │  ║ │ ▶  Start review    │ │ Learn 10 new… │ ║   ┃ Spanish Core 1000      ┃  │
│                │  ║ └────────────────────┘ └───────────────┘ ║   ┃ A new memory trick     ┃  │
│                │  ║ ▓▓▓▓▓▓░░░░░░░░░░░░░ 200 of 1,000 words…  ║   ┃ can help.  [Practice]  ┃  │
│                │  ╚══════════════════════════════════════════╝   ┗━━━━━━━━━━━━━━━━━━━━━━━━┛  │ y 486
│ ┌────────────┐ │                                                                             │
│ │ Theme      │ │  Your other courses                                                          │ y 534
│ │ ◉ Match my │ │  ┌──────────────────────────────────────────┐                                │
│ │   device   │ │  │ [JA] Japanese Hiragana & Katakana        │                                │
│ │ ○ Light    │ │  │      8 words to review          [Review] │                                │
│ │ ○ Dark     │ │  │ [FR] French Travel Phrases       [Learn] │                                │
│ └────────────┘ │  │ [PT] Portuguese Essentials   ✓ All done  │                                │ y 790
│ ◯ @user      ⌃ │ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ fold y=800 ─ ─ │
└────────────────┴─────────────────────────────────────────────────────────────────────────────┘
                    ▸ Your progress                                              y ≈ 838, below
```

Above the fold at 1280 x 800: everything except the closed "Your progress" row.

| Check at 1280 x 800 | Today | This design |
| --- | --- | --- |
| Main button size | 126 x 44 px, 0.54% of the screen [LA §0] | 280 x 56 px, 1.5% of the screen |
| Hero share of the screen | Today panel 624 x 307, 1.04:1 against the page [LA §3.3, §0] | 608 x 394, about 23%, and 12.97:1 against the page in light [CS §5.2 #57] |
| Shapes filled with the button's color | 8 on the first screen [LA §3.4] | 1 |
| Words on the first screen (main) | 124 [LA §0] | 83 |
| Headings on the first screen | 7 [LA §3.4] | 5 |

DOM order is greeting, hero, This week, courses, tip, progress. On desktop the grid places hero in column 1 (rows 1 and 2), This week in column 2 row 1, the tip in column 2 row 2, and courses in column 1 row 3. So keyboard order runs down the main column, then the aside. No CSS `order` is used [AU §3, SC 1.3.2].

### 3.4 Other states

The hero keeps the same slots in every state. Only the words change, and sometimes the amber button is absent on purpose.

| State (`?preview=`) | Hero | Rest of the page |
| --- | --- | --- |
| **default** (`review`) | As drawn. | As drawn. |
| **learn** (nothing to review, new words available) | Course name. "**10** new words to learn". Line: "Nothing to review right now." Amber button: "Start learning". No second button. Progress line stays. | Same. |
| **caught-up** | No number. A large check inside a tinted navy circle, then "All done for today" and "Nothing to review right now. Check back later." **No amber button.** Under "Want to keep going?" there are up to two tinted buttons: "Learn 10 more new words" and "Practice 4 tricky words", with the cost line "Each new word means a few short reviews later." | Week card shows today's mark filled, and "You finished everything for today." The tip card is hidden when the hero already offers Practice. |
| **finished** (caught up, nothing left to add) | Same check and headline. One tinted link: "Find another course". | Same as caught-up. |
| **goal-met** | Whatever the hero state is. | Today's mark is filled with a check. The line reads "You reached today's goal." |
| **no-decks** | Only the greeting ("Welcome to Memli, Phillip") and the hero render, at most 672 px wide. Hero: an icon in a tinted tile, "Pick your first course", "Courses are word lists with memory tricks from other learners.", amber button "Find a course" (to `/community`). | Nothing else. No week card, no list, no tip. |
| **one-deck** | As default. | "Your other courses" is replaced by one dashed row with a link: "Find another course". No Language menu. |
| **many-decks** (12 courses) | As default. The hero sits at the same y as in every other state. Today the 12 chips push the button to y 777 [LA §3.2]. | The list shows the first 5 rows (sorted by `sortDecks`), then a button "Show all 11 courses" that expands in place. The "Language" menu appears in the list header. |
| **same-language** | As default. | No Language menu. Badges repeat. That is fine. |
| **long-titles** | The course name wraps, up to as many lines as it needs. No truncation. Each extra line moves the button down 28 px. | Row titles wrap. Row buttons stay at the end. |
| **large-numbers** | "1,284" at 72 px is about 196 px wide. At 56 px on phones it is about 152 px. Both fit [MI §7.4, scaled from the 60 px measurements]. | Same. |
| Streak is 0, or first visit after a gap | Normal hero. | The "days in a row" line is not shown. No zero, no red, no "missed" [AU §9.3 rules 5 and 6]. |

Why the caught-up hero has no amber button: the right next step is to stop [RUI §9.4]. It also teaches the rule. Amber on means there is something to do. Amber off means you are done.

---

## 4. Copy deck

Rules used: whole-sentence templates. `{placeholders}` in braces. `<n>` is a rich-text tag that styles the number without splitting the sentence, using the project's existing `rich()` helper (`apps/web/src/lib/formatters.ts:153-182`) [MI §7.2]. Every count has `one` and `other`. A `one` form never contains a literal "1" [MI §6 R3]. Zero is a separate state, never a plural form. No em dashes. Sentence case. No sentence over 12 words.

### 4.1 Terminology, resolved

| Old word | New word | Reason |
| --- | --- | --- |
| **Deck** | **Course** | Crystal flagged "Deck" [FE §2]. The code already says `courseId` 77 times and `deckId` 0 times, and the route is `/study/$courseId` [FE §10.1]. Old Memrise said "course" for its whole classic era. "Decks" was only its 2019 spin-off [MA §3, lesson 7]. Where a title can stand alone, use no noun at all. |
| Card | **Word** | Learners learn words. Today "cards" and "words" share one screen [CA §8.3]. Known gap: the Japanese course teaches kana, so "words" is loose there. |
| Due | **to review** | Scheduling jargon [AU §12]. |
| Mastered | **learned** (mastered + learning) | "5% mastered" is true and discouraging. "200 of 1,000 words learned" is true and plain [AU §11.1 Decision 2]. **The owner must confirm this definition.** |
| Streak | **days in a row** | Literal [AU §12]. |
| Mnemonic | **memory trick** | Plain. Pair the two once where the product teaches the word. |
| Caught up | **All done** | Not an idiom [MI §6 R9]. |
| Words keep slipping | **Tricky words** | One name for one set [CA §8.4]. |
| System (theme) | **Match my device** | "System" is operating-system jargon [AU §7.1]. |
| Decks (nav) | **Home** | The item opens the dashboard, not a list of decks [CA §8.1]. |
| Community Gallery | **Community** | One name for `/community`. |

Code identifiers (`DashboardDeck`, `deckAction`) can stay. They are not user-facing. New files use "course".

Two strings outside the dashboard must change in the same pull request so one term is used everywhere (WCAG 3.2.4): `apps/web/src/routes/_session/study.$courseId.tsx:50` and `:53`. They are listed in 4.7.

### 4.2 Greeting (`DashboardGreeting.tsx`)

| Key | Template | Notes |
| --- | --- | --- |
| `greeting` | `Hi, {name}` | One string. No time-of-day logic, so it cannot be wrong at 02:00 or in another culture [MI §5.5 option A]. |
| `welcome` | `Welcome to Memli, {name}` | No courses yet. |

Deleted: `greeting.morning`, `.afternoon`, `.evening`, `keepStreak`, `startStreak`, `caughtUp`.

### 4.3 Study hero (new `StudyHero.tsx`)

| Key | Template | Notes |
| --- | --- | --- |
| (heading) | `{course}` | The `h2`. Wrapped in `<bdi>` [MI §6 R12]. |
| `review.count` | one: `<n>{count}</n> word to review` / other: `<n>{count}</n> words to review` | The tag renders the number as a block at display size. The words sit under it. |
| `review.duration` | `About {duration}` | `{duration}` from `Intl` in long form ("3 minutes"). |
| `review.start` | `Start review` | Two words, verb first. |
| `review.startLabel` | one: `Start review, {count} word in {course}` / other: `Start review, {count} words in {course}` | Accessible name. Starts with the visible label (SC 2.5.3). |
| `review.learnNew` | one: `Learn {count} new word` / other: `Learn {count} new words` | Second action. Hidden when there are no new words. |
| `progress` | one: `{learned} of {total} word learned` / other: `{learned} of {total} words learned` | Plural keyed on `{total}`. |
| `learn.count` | one: `<n>{count}</n> new word to learn` / other: `<n>{count}</n> new words to learn` | |
| `learn.nothingToReview` | `Nothing to review right now.` | Takes the place of the time line. `estimateMinutes` is tuned for reviews, so no time is claimed here. |
| `learn.start` | `Start learning` | Amber button in the learn state. |
| `learn.startLabel` | one: `Start learning, {count} new word in {course}` / other: `Start learning, {count} new words in {course}` | Accessible name. |
| `done.heading` | `All done for today` | |
| `done.detail` | `Nothing to review right now. Check back later.` | Two short sentences. No "later today", which is false near midnight [MI §6 R15]. |
| `done.keepGoing` | `Want to keep going?` | |
| `done.learnMore` | one: `Learn {count} more new word` / other: `Learn {count} more new words` | Must wrap. The Spanish draft overflowed a no-wrap button at 320 px [MI §2.3]. |
| `done.learnMoreCost` | `Each new word means a few short reviews later.` | States the cost of the action [AU §11.4]. |
| `done.practice` | one: `Practice {count} tricky word` / other: `Practice {count} tricky words` | |
| `done.findAnother` | `Find another course` | Finished state. |
| `empty.heading` | `Pick your first course` | |
| `empty.detail` | `Courses are word lists with memory tricks from other learners.` | 10 words. Explains "course" and "memory trick" once. |
| `empty.find` | `Find a course` | Amber button. |

### 4.4 This week (`ThisWeek.tsx`)

| Key | Template | Notes |
| --- | --- | --- |
| `heading` | `This week` | |
| (day names) | from `Intl.DateTimeFormat(uiLocale, { weekday: "short" })` | "Sun Mon Tue". No more "S M T W T F S" with two S and two T [AU §8.3]. Week start from the locale, as today. |
| `daysInARow` | one: `{count} day studied` / other: `{count} days in a row` | Hidden at 0. |
| `today` | one: `<n>{done}</n> of {target} word today` / other: `<n>{done}</n> of {target} words today` | Plural keyed on `{target}`. One message, not two spans. |
| `goalMet` | `You reached today's goal.` | Replaces the `today` line. |
| `goalCleared` | `You finished everything for today.` | Replaces the `today` line. |
| `day.done` | `{day}, studied` | Screen-reader text. `{day}` is the long name. |
| `day.today` | `{day}, today` | |
| `day.todayDone` | `{day}, today, studied` | |
| `day.rest` | `{day}, no study` | Past day. Never "missed" [AU §8.3]. |
| `day.upcoming` | `{day}` | Future day. |
| `weekLabel` | `Your study days this week` | `aria-label` of the list. |

### 4.5 Your other courses (new `CourseList.tsx`, from `DeckList.tsx`)

| Key | Template | Notes |
| --- | --- | --- |
| `heading` | `Your other courses` | |
| `toReview` | one: `{count} word to review` / other: `{count} words to review` | Same words as the hero. |
| `newWords` | one: `{count} new word` / other: `{count} new words` | |
| `allDone` | `All done` | With a check icon. |
| `review` | `Review` | Button (verb). Translator note: verb, not noun [MI §6 R8]. |
| `reviewLabel` | one: `Review {count} word in {course}` / other: `Review {count} words in {course}` | Accessible name. |
| `learn` | `Learn` | Button (verb). |
| `learnLabel` | one: `Learn {count} new word in {course}` / other: `Learn {count} new words in {course}` | Accessible name. |
| `showAll` | one: `Show {count} course` / other: `Show all {count} courses` | Only with more than 5 other courses. |
| `filter.label` | `Language` | Replaces "Studying". |
| `filter.all` | `All languages` | Language names come from `Intl.DisplayNames`. |
| `findAnother` | `Find another course` | One-course state. |

### 4.6 Tip card (new `TipCard.tsx`, from `MemoryCallout.tsx`) and Your progress

| Key | Template | Notes |
| --- | --- | --- |
| `tricky.heading` | one: `<n>{count}</n> tricky word in <c>{course}</c>` / other: `<n>{count}</n> tricky words in <c>{course}</c>` | The count is for the one course the button opens (the course with the most tricky words). `<c>` renders `<bdi>`. |
| `tricky.detail` | `A new memory trick can help.` | Replaces "You've forgotten these a few times. A new mnemonic can help them stick." |
| `tricky.practice` | `Practice` | Opens `/study/$courseId?mode=practice`. |
| `tricky.practiceLabel` | one: `Practice {count} tricky word in {course}` / other: `Practice {count} tricky words in {course}` | Accessible name. |
| `tip.heading` | `Study tip` | Shown when no course has tricky words. |
| `tip.items[0]` | `Short daily reviews work better than one long one.` | Tips are drafts. The owner should approve each claim. |
| `tip.items[1]` | `Picture the memory trick before you type your answer.` | The tip shown is picked by day of the year. No stored state. |
| `progress.heading` | `Your progress` | The `<summary>` text. |
| `progress.learned` | one: `{count} word learned so far` / other: `{count} words learned so far` | |
| `progress.remembered` | `You remembered {percent} of your reviews.` | `{percent}` from `Intl`. Replaces "RETENTION 84%". I did not check which time window `retentionPercent` covers, so the sentence names none. |
| `progress.newThisMonth` | one: `{count} new word this month` / other: `{count} new words this month` | Replaces "NEW CARDS 142 Added this month". |
| `progress.tableCaption` | `Words learned in each course` | Table caption. |
| `progress.colCourse`, `progress.colLearned` | `Course`, `Words learned` | Column headers. |
| `progress.row` | `{learned} of {total}` | One row per course. |

### 4.7 App chrome (`AppSidebar.tsx`, new `ThemeControl`, session)

| Key | Template | Notes |
| --- | --- | --- |
| `skip` | `Skip to main content` | New. First focusable element. |
| `title` | `Home · Memli` | Document title. Today every route is "Memli" [CA §9]. |
| `home` | `Home` | Was "Decks". |
| `community` | `Community` | Was "Community Gallery". |
| `you` | `You` | Phone bottom bar, opens the account menu. |
| `settings` | `Settings` | Was "Learning Settings". |
| `plan` | `Your plan` | Was "Subscription / Plan". |
| `signOut` | `Sign out` | Sentence case. |
| `theme.label` | `Theme` | Group legend on desktop. Button text on phones. |
| `theme.device` | `Match my device` | |
| `theme.light` | `Light` | |
| `theme.dark` | `Dark` | |
| session `:50` | `This course has no words waiting right now. Pick another from Home.` | Was "This deck has no cards waiting for this kind of session. Pick another from your dashboard." |
| session `:53` | `We couldn't find that course` | Was "...that deck". |

### 4.8 Word counts, before and after (default state, English)

"Before" is the code audit's count, which includes screen-reader-only text [CA §2.2]. "After" is my count of the strings above with the seeded data. A `{placeholder}` value counts as the words it renders. "&" counts as a word.

| Region | Before | After | What is left |
| --- | ---: | ---: | --- |
| Greeting | 13 | 2 | "Hi, Phillip" |
| Language filter | 7 | 0 | Hidden in this state |
| Hero (Today + Continue learning) | 60 | 22 | ES, Spanish Core 1000, 16 words to review, About 3 minutes, Start review, Learn 10 new words, 200 of 1,000 words learned |
| Other courses | 44 | 26 | Heading, three rows |
| This week | 48 | 19 visible (+ about 13 screen-reader words) | Heading, 7 day names, two sentences |
| Tricky words / tip | 25 | 14 | Count sentence, one sentence, Practice |
| Trends | 20 | 2 | "Your progress" (closed) |
| **Total in `main`** | **217** | **85 visible, about 98 with screen-reader text** | |

| Other counts | Before | After |
| --- | ---: | ---: |
| Visible words (live audit's method) | 192 [LA §0] | 85 |
| Headings | 12 | 6 (1 `h1`, 5 `h2`; course row titles are no longer headings) |
| Numbers shown | 37 [CA §2.2] | 13, counting "1000" in the course title twice |
| Controls in `main` | 9 | 6 |
| Font size and weight pairs | 15 | 8 |
| Shapes in the main button's fill color | 14 [CA §0] | 1 |
| Facts stated twice | about 9 [CA §3] | 0 |

Honest misses: the first desktop screen holds 83 words in `main`. One research target was 70 or fewer [CP §10.1]. The seven day names are 7 of those words. I kept them because single letters are ambiguous [AU §8.3].

---

## 5. Color and theme

**Every color value below comes from `color-science.md` section 4.2 unchanged.** I change no token value. All pairings marked with a row number were verified there by script (WCAG 2.2 plus APCA, culori 4.0.2 and apca-w3 0.1.9) [CS §5.1]. Pairings marked "mine" are new combinations of the same tokens. I computed those with the same two libraries in `scratch/design/night-first-pairs.mjs`. The script first reproduces two rows of the verified table exactly (11.59:1 and Lc 76.9; 10.76:1 and Lc -77.9). Nothing was checked in a browser.

### 5.1 Dark first: how the night theme is built

Dark is not the light theme inverted. It uses the depth cue that works on a dark ground: lighter means closer [CS §3.5; RUI §9.2].

| Layer (dark) | Token | Value | Lightness |
| --- | --- | --- | --- |
| Sidebar (recedes) | `--sidebar` | `oklch(0.16 0.038 266)` #060c1d | 0.16 |
| Page | `--background` | `oklch(0.195 0.045 266)` #0b1429 | 0.195 |
| Cards, list | `--card` | `oklch(0.25 0.05 266)` #16213a | 0.25 |
| Menus | `--popover` | `oklch(0.295 0.053 266)` #202c47 | 0.295 |
| Chips, badges on cards | `--muted` | `oklch(0.34 0.055 266)` #2a3755 | 0.34 |
| **Hero** | `--hero` | `oklch(0.35 0.12 266)` #1d3478 | 0.35, and the only surface with chroma 0.12 |

The navy reads navy because chroma is 0.038 to 0.058, about double today's 0.025. That matches what was measured in example-02 (0.043 to 0.053) [CS §2.4].

Then the light theme keeps the same idea, not the same numbers. The hero stays a navy panel (`oklch(0.29 0.105 267)` #14255f). It is the darkest large shape on a pale page, where in dark it is the most colorful shape on a navy page [CS §4.2 design notes]. So the hero and its amber button look like the same object in both themes. Old Memrise's night mode worked the same way: the same place at a different hour [MA §2.6, lesson 11].

### 5.2 Surfaces

| Surface | Token (Tailwind class) | Light | Dark | Contrast against its parent |
| --- | --- | --- | --- | --- |
| Page | `--background` (`bg-background`) | neutral.100 #f1f3f9 | navy.900 #0b1429 | |
| Sidebar, phone bottom bar | `--sidebar` | neutral.50 #f9fafd | navy.950 #060c1d | 1.06:1 both [CS #55]. A hairline carries the edge. |
| Week card, course list, theme card | `--card` | #ffffff | navy.850 #16213a | 1.11:1 light, 1.15:1 dark [CS #54] |
| **Hero** | `--hero` (`bg-hero`) | blue.950 #14255f | blue.900 #1d3478 | **12.97:1 light, 1.58:1 dark** [CS #57]. See risk 3. |
| Chips and tracks on the hero, second button | `--hero-chip` | #2e4175 | #374f8b | 1.46:1 against the hero, both themes (mine) |
| Language badge on cards | `--muted` | neutral.200 #e7ebf3 | navy.750 #2a3755 | 1.19:1 light, 1.35:1 dark [CS #56] |
| Tip card | `--warning-container`, aliased as `--tip` | orange.100 #ffeddb | orange.950 #421d09 | 1.03:1 light and 1.23:1 dark against the page (mine). It gets a 4 px start edge in `--warning`. |
| Selected nav item, selected theme option | `--accent` | blue.100 #e1ecff | navy.750 #2a3755 | 1.14:1 light, 1.65:1 dark against the sidebar (mine). Too faint alone, so it always has a second cue. |
| Menus | `--popover` | #ffffff | navy.800 #202c47 | Plus a shadow in light. |

### 5.3 Text

Three tones on normal surfaces, two on the hero. Today there are two tones and 15 type styles doing the ranking instead [CS §2.1].

| Level | Token | Light | Dark | Verified on card |
| --- | --- | --- | --- | --- |
| Strong: `h1`, section headings | `--foreground-strong` | neutral.950 #0d1529 | neutral.50 #f9fafd | 18.16:1 Lc 104.8 / 15.33:1 Lc -102.2 [CS #2] |
| Default: body, labels, all 14 px text | `--foreground` | neutral.800 #2a354d | neutral.200 #e7ebf3 | 12.25:1 Lc 97.9 / 13.39:1 Lc -92.3 [CS #4] |
| Muted: 16 px and up only | `--muted-foreground` | neutral.700 #505b72 | neutral.300 #cdd4e3 | 6.82:1 Lc 83.5 / 10.76:1 Lc -77.9 [CS #9] |
| On the hero: number, phrase, course name | `--hero-foreground` | neutral.50 #f9fafd | neutral.50 #f9fafd | 13.78:1 Lc -100.5 / 11.09:1 Lc -96.7 [CS #18] |
| On the hero: time line, progress sentence | `--hero-muted-foreground` | blue.200 #c8dcff | blue.100 #e1ecff | 10.37:1 Lc -80.6 / 9.72:1 Lc -87.0 [CS #19] |
| On the tip card | `--warning-container-foreground` | orange.900 #683110 | orange.200 #ffdab7 | 9.03:1 Lc 84.5 / 11.31:1 Lc -84.6 [CS #64] |

Compare the current dark theme: muted text on a card is 5.81:1 and Lc -45.0 [CS §2.2]. The new dark muted text is 10.76:1 and Lc -77.9. That is the direct fix for "the words disappear".

Two rules from the color research that this design follows:

- **Small text is never gray.** Muted color starts at 16 px. Anything at 14 px uses `--foreground` at weight 600 [CS §5.3].
- **No gray text on the hero.** Secondary text there is a pale tint of the hero's own blue [CS §7.3].

### 5.4 Actions

| Element | Tokens | Light | Dark | Verified |
| --- | --- | --- | --- | --- |
| **Main button fill** | `--cta` | amber.400 #fec71d | amber.300 #fed756 | Against the hero: 9.18:1 / 8.30:1 [CS #29] |
| Main button label | `--cta-foreground` | neutral.950 #0d1529 | navy.950 #060c1d | 11.59:1 Lc 76.9 / 13.98:1 Lc 84.3 [CS #26] |
| Main button hover | `--cta-hover` | amber.300 | amber.200 | Label 13.03:1 / 15.60:1 [CS #27] |
| Main button pressed | `--cta-active` | amber.500 | amber.400 | Label 9.59:1 / 12.43:1 [CS #28] |
| Main button bottom edge (3 px) | `--cta-edge` | amber.700 #b36300 | amber.600 #db8903 | Against the hero: 3.22:1 / 4.18:1 (mine) |
| Second button on the hero | `bg-hero-chip text-hero-foreground` | | | 9.45:1 Lc -93.6 / 7.58:1 Lc -88.7 [CS #20] |
| Row buttons "Review", "Learn" | border `--border-strong`, text `--foreground`, no fill | #7c869b | #7c869b | Border against card 3.66:1 / 4.37:1 [CS #49] |
| "Practice" on the tip card | border and text `--warning-container-foreground` | | | 9.03:1 / 11.31:1 [CS #64] |
| Links in text | `--link`, underlined | blue.700 | blue.200 | 6.83:1 / 11.53:1 on card [CS #17] |
| Focus ring | `--ring`, 2 px solid, 2 px offset | blue.700 | blue.300 | 6.16 to 6.83:1 / 9.16 to 11.16:1 [CS #44-46] |
| Focus ring on the hero | `--hero-ring` | neutral.50 | neutral.50 | 13.78:1 / 11.09:1 [CS #47] |
| Focus ring on the tip card | `--ring` | | | 5.98:1 / 8.52:1 (mine) |

The amber button lives on the hero and nowhere else. On a white card it is only 1.57:1 [CS #32]. This design never puts it there.

`--primary` stays brand blue [CS §4.2]. The study session's Submit button and the marketing pages do not change. The dashboard itself no longer uses a solid `bg-primary` anywhere.

One existing element breaks principle 1 and must change: the "Pro" badge in the sidebar is an amber pill with hard-coded palette colors (`apps/web/src/components/plan-badge.tsx:9-14`) [CA §1.2]. Restyle it as a neutral outline badge (`border-border-strong text-foreground`).

### 5.5 Status and data marks

| Element | Tokens | Light | Dark | Verified |
| --- | --- | --- | --- | --- |
| Studied day: filled circle with a check | `--viz-progress` + `--viz-on-progress` | blue.700 + white | blue.400 + navy.950 | Fill against card 6.83:1 / 6.61:1 [CS #77]. Check 6.83:1 / 8.05:1 [CS #78] |
| Today: ring that fills as you study | arc `--viz-progress`, outer ring `--border-strong` | | | Ring against card 3.66:1 / 4.37:1 [CS #49] |
| Other days: thin empty ring | `--border-strong` | | | Same |
| Flame icon | `--streak` | orange.600 #d75b01 | orange.400 #ff9b4e | 3.90:1 / 7.66:1 on card [CS #69] |
| "All done" with a check | `--success`, 16 px semibold | green.700 | green.300 | 5.44:1 Lc 76.6 / 10.91:1 Lc -79.0 [CS #59] |
| Progress bar on the hero | fill `--hero-foreground`, track `--hero-chip` | | | Fill against track 9.45:1 / 7.58:1 (same colors as [CS #20]) |
| Progress in the "Your progress" table | fill `--viz-progress`, track `--viz-track` | | | 5.72:1 / 5.74:1 [CS #76] |
| Check on the caught-up hero | `--hero-foreground` inside a `--hero-chip` circle | | | 9.45:1 / 7.58:1. No green on the hero: blue-on-blue and green-on-navy were not verified. |

The hero bar's track is only 1.46:1 against the hero. That is acceptable because the sentence beside it states the value, which exempts the graphic from the 3:1 rule [CS §3.3; AU §8]. If the sentence is ever removed, the bar must go too.

### 5.6 One color, one meaning

| Color | Means | Appears as |
| --- | --- | --- |
| Amber | Do this next | One filled button. Nothing else. |
| Navy with chroma | Today's study | The hero panel. |
| Blue | Memli, "you are here", your progress | Logo, selected item, links, week marks, focus ring. |
| Orange | A warm aside | The flame icon and the tip card. Never a filled button. |
| Green | Done | "All done" with a check. |
| Red | Not used on this page | |

This follows the color research's table [CS §7.2]. The one extension is using the warm container for a friendly tip, not only for caution. I add three alias tokens with no new values so the meaning is named: `--tip: var(--warning-container)`, `--tip-foreground: var(--warning-container-foreground)`, `--tip-edge: var(--warning)`.

### 5.7 The 60-30-10 split

60-30-10 is a rule of thumb from interior design with no authoritative source [CS §7.1]. I use it as a sanity check. Shares below are my arithmetic from the 1280 x 800 wireframe, not measurements.

| Share | Role | What fills it |
| --- | --- | --- |
| About 70% | Neutral ground | Page, sidebar, cards. Navy in dark, near-white in light. |
| About 25% | Brand structure | The hero (about 23% of the screen), blue week marks, selected tint. |
| About 5% | Warm accents | The tip card (about 4.7%, a low-chroma warm tint). **The amber button is 1.5%.** The flame is under 0.1%. |

The accent is far under 10% on purpose. Ten percent is a ceiling. The check is the squint test: blur a screenshot. If you can see more than one amber shape, something is wrong [CS §7.1].

### 5.8 The theme control

**What it is.** Three choices, always shown as three, with an icon and a word each: "Match my device", "Light", "Dark". Never a button that cycles [AU §7.1]. The default is "Match my device". NN/g's review found dark helps people with cloudy vision and light is slightly better for normal vision, so offer both and force neither [AU §2.3, NN/g S10].

**Desktop and tablet (768 px and up).** A small card pinned to the foot of the sidebar, above the account button. Legend "Theme", then three radio rows, each 44 px tall. This is the bottom-left spot Crystal circled in example-02 [FE §8 circle D]. The sidebar has about 650 px of empty space there today [CA §6.1]. It is visible on every app page without opening anything. Three stacked rows, not a three-part switch, because "Match my device" does not fit a third of a 232 px card, and its Spanish draft is longer still.

```
┌──────────────────────┐
│ Theme                │   legend, 14 px semibold
│ ◉ ▭ Match my device  │   selected: tinted row, filled dot, semibold
│ ○ ☀ Light            │
│ ○ ☾ Dark             │
└──────────────────────┘
```

**Phone.** A labeled button in the top bar: a moon or sun icon and the word "Theme". It opens a menu with the same three choices as radio items, using `DropdownMenuRadioGroup`, which already exists in `packages/ui/src/components/dropdown-menu.tsx:193-233` [CA §6.2]. One tap shows the choices. The top bar has room because the avatar and the hamburger move to the bottom bar.

**Settings page.** The same control, later, when `/settings` is more than a placeholder.

Same label, same options, same order in every place (WCAG 3.2.3, 3.2.4).

**Selected state without color.** A filled radio dot, weight 600, and a tinted row. The dot's ring is `--border-strong` (3.66:1 light, 4.37:1 dark against the card [CS #49]). The selected dot is `--brand` (6.83:1 / 9.16:1 against the card [CS #14]).

**Behavior that must ship with it** [CA §5; AU §7.4; CS §6.2-6.4]:

| Change | File |
| --- | --- |
| Default to the device setting. Remove `defaultTheme="light"`. | `apps/web/src/main.tsx:25` |
| Delete the "d" shortcut. | `apps/web/src/components/theme-provider.tsx:131-168` |
| Expose the resolved theme (what "Match my device" currently means) so the phone button can show the right icon. | `theme-provider.tsx:14-17` |
| Add a small inline script in `<head>` that sets the class before first paint. No light flash for dark users. | `apps/web/index.html` |
| Add `color-scheme: light` on `:root` and `color-scheme: dark` on `.dark`. Add `<meta name="color-scheme" content="light dark">`. | `globals.css`, `index.html` |
| Add `<meta name="theme-color">` and update it when the theme changes: `#f1f3f9` light, `#0b1429` dark. | `index.html`, `theme-provider.tsx` |
| Add `viewport-fit=cover` so the bottom bar can use safe-area insets. | `index.html:6` |
| Keep the `localStorage` key `theme` and the class names `light` and `dark`. The axe tests depend on them. | `apps/web/e2e/dashboard.a11y.spec.ts:5-22` |
| Fix the variant selector to `@custom-variant dark (&:where(.dark, .dark *));` | `globals.css:6` |

---

## 6. Type, spacing, depth

### 6.1 Type scale

Six sizes, three weights, eight size-and-weight pairs. Today: 8 sizes, 4 weights, 15 pairs [CA §4.4].

| Token | Size | Weight | Line height | Used for | Color |
| --- | --- | --- | --- | --- | --- |
| `text-display` | 56 px phone, 72 px from 640 px | 700 | 1.0, tracking -0.03em | The hero number. Nothing else. | hero foreground |
| `text-title` | 24 px phone, 30 px from 640 px | 700 | 1.2 | The greeting (`h1`). Nothing else. | strong |
| `text-xl` | 20 px | 600 | 1.4 | "words to review". Section headings. Caught-up headline. | strong, or hero foreground |
| `text-lg` | 18 px | 600 | 1.5 | Main button label. Course name in the hero. | |
| `text-lg` | 18 px | 400 | 1.5 | "About 3 minutes" | hero muted |
| `text-base` | 16 px | 600 | 1.5 | Row titles. Second-level buttons. "All done". | default |
| `text-base` | 16 px | 400 | 1.5 | Every sentence: status lines, tip text, progress sentences. | default, or muted |
| `text-sm` | 14 px | 600 | 1.4 | Labels only: day names, language codes, the "Theme" legend. Never a sentence. | default |

Removed: 12 px (22 of 84 text runs today [CA §4.4]), 30 px for stats, 48 px, weight 500, uppercase eyebrows, and wide letter-spacing.

Why these limits:

- **Nothing under 14 px. Every sentence at 16 px or more.** NN/g's guidance for older adults is 16 px minimum [AU §0 finding 2]. Small text is worse in dark mode than in light [AU §2.3], and this design leads with dark.
- **14 px is always semibold and never gray.** APCA's lookup allows 14 px only at weight 600 to 700 with contrast near Lc 90 [CS §5.3].
- **One number is huge.** The next largest number on the page is 20 px ("24" inside "24 of 50 words today" is styled at 20 px semibold). So no other number is within 60% of the hero number [AU §10 D6]. Today seven numbers are 24 px bold or larger [CA §3].

Honest note: APCA's strict lookup asks for 18 px regular for muted text at Lc 78. The color research accepts 16 px regular based on APCA's more lenient summary table [CS §5.3]. I follow the color research. If Karen's test (section 10) shows 16 px muted text is hard to read, switch those strings to `--foreground`.

Heading tags do not follow visual size [RUI §3.6]. The course name is the hero's `h2` at 18 px. The number is a styled `<span>` inside a `<p>`.

### 6.2 Spacing rhythm

The eight-step scale from the Refactoring UI research [RUI §8.2]. Each step has one job.

| px | Tailwind | Job |
| --- | --- | --- |
| 4 | `1` | Icon to its text |
| 8 | `2` | Items in a tight set: day marks, title to its status line |
| 12 | `3` | A heading to its content. Buttons side by side. |
| 16 | `4` | Parts inside one surface. Phone gutter. Card padding on phones. |
| 24 | `6` | Sub-groups inside a surface. Card padding on desktop. Week card to tip card. |
| 32 | `8` | Hero padding on desktop. Column gap. Desktop gutter. |
| 48 | `12` | Section to section |
| 64 | `16` | Page bottom |

Three distances do most of the work: 12 inside a group, 24 between groups in a surface, 48 between sections. Today one 32 px gap separates everything, so nothing reads as belonging together [RUI §1 summary].

Control heights: 56 px (`h-14`) main button. 48 px (`h-12`) second button on the hero and bottom-bar items. 44 px (`h-11`) row buttons, radio rows, the phone Theme button, the disclosure row. Nothing a learner taps is under 44 px. Today chips are 36, row buttons 36 and the hamburger 32 [LA §0].

### 6.3 Borders versus shadows

The rule: **dark uses lightness steps and hairlines. Light uses shadows and hairlines.** Each theme uses the depth cue that works on its own ground [RUI §9.2].

| Element | Dark | Light |
| --- | --- | --- |
| Cards, course list | `--card` is lighter than the page. 1 px `--border` (1.73:1 on the card [CS #52]). No shadow, because a shadow cannot be darker than a near-black page. | White on `--background`. 1 px `--border` (1.49:1). Shadow level 1. |
| Hero | Lightness 0.35 and chroma 0.12. 1 px `--hero-border` (2.04:1 against the page; mine). A soft blue glow under it. | No border needed at 12.97:1. Shadow level 2. |
| Main button | 3 px bottom edge in `--cta-edge`. A soft amber glow. | 3 px bottom edge in `--cta-edge`. A short dark shadow. |
| Menus | `--popover` is lighter again. | Shadow level 3. |
| Controls (row buttons, radios, empty day rings) | 1 px `--border-strong`, 3:1 or better | Same |

- **Real borders, not rings.** Card edges today are `ring-1`, which is a `box-shadow` and vanishes in Windows forced-colors mode [AU §7.5]. Use `border`.
- **Fewer lines.** The first screen has about fourteen faint lines today [RUI §9.7]. This design has six: the sidebar edge, three card edges, and two row dividers.
- **Shadow values** come from the elevation scale in the Refactoring UI research [RUI §8.3]: `--elev-1` for cards, `--elev-2` for the light hero, `--elev-3` for menus. That file says they are untuned starting values.

The main button, in words: amber fill, navy label at 18 px semibold, a play icon before the label, a 3 px darker bottom edge. Hover: one step lighter and 1 px up. Press: one step darker, 2 px down, edge shrinks to 1 px. It keeps the base `border border-transparent` so forced-colors mode draws an outline [CS §6.7, §7.6]. No motion with `prefers-reduced-motion`. Old Memrise built its buttons the same way: lit top, dark bottom, soft drop [MA §4.3].

**Needs tuning by eye, never verified:** the two glows (blue under the dark hero, amber under the button) and all shadow values. They are decoration and carry no meaning.

### 6.4 Radius

Three radii plus full circles. Today there are five [CA §4.5].

| Radius | Class | Used for |
| --- | --- | --- |
| 8 px | `rounded-lg` | Buttons, badges, radio rows, nav items |
| 11.2 px | `rounded-xl` | Cards, the course list, the tip card, menus |
| 14.4 px | `rounded-2xl` | The hero only |
| full | `rounded-full` | Day marks, the avatar, radio dots |

The hero has the largest radius on the page. Shape is one more way it differs from everything else.

---

## 7. Component plan

Repo rules respected throughout: semantic tokens only (no palette classes, no hex). Base UI primitives. shadcn components copied by hand, never the CLI (`.cursor/rules/shadcn-components.mdc`). Copy in per-file `messages` objects. Discriminated unions for state (`.cursor/rules/react-state.mdc`). `Intl` through `useFormatters()`. Logical properties (`ps`, `me`, `border-s`). No unused exports, because Knip runs in CI.

### 7.1 Existing files

| File | Verdict | What happens |
| --- | --- | --- |
| `TodayPanel.tsx` | **Merge** into new `StudyHero.tsx`, then delete | Its four states (`review`, `learn`, `caught-up`, `no-decks`) keep their `switch` on `state.status`. The per-course chips, "Starts in", and the eyebrow go. |
| `FocusDeckCard.tsx` | **Merge** into `StudyHero.tsx`, then delete | The badge and title become the hero's heading row. `MasteryBar` becomes a one-fill bar. The legend moves to `ProgressDisclosure`. |
| `DeckList.tsx` | **Restyle**, rename to `CourseList.tsx` | Rows lose "Last studied", the mini bar and "% mastered". Status becomes one sentence. Row titles become `<p>`, not `h3`. Buttons grow to 44 px and become real links. Adds "Show all" (one `useState` boolean, the allowed case) and hosts the Language menu. |
| `ThisWeek.tsx` | **Restyle** | `GoalRing` and "Words mastered" are removed. Today's mark becomes the ring. Day names switch from narrow to short. Four visual states become three: done, today, other. Colors move from `bg-primary` to `bg-viz-progress` [CS §4.3]. `weekDays()` is used unchanged. |
| `MemoryCallout.tsx` | **Restyle**, rename to `TipCard.tsx` | Props become a union: `{ kind: "tricky"; deck: DashboardDeck } \| { kind: "tip"; index: number }`. Word chips go. Gains a Practice link. |
| `ProgressTrends.tsx` | **Restyle**, rename to `ProgressDisclosure.tsx` | A native `<details>` with the heading inside `<summary>`. Closed by default. Holds three sentences and the per-course table. Consistency and "Global average" are deleted. |
| `LanguageFilter.tsx` | **Restyle** | From chips to one `DropdownMenu` of links (so changing it is navigation, not a surprise change of context; SC 3.2.2 [AU §3]). Still writes `?studying=`. Rendered inside `CourseList`'s header. |
| `DashboardGreeting.tsx` | **Keep**, simplify | Two strings. The hour logic, the streak sentence and the `dueCount`, `streakDays`, `now` props go. |
| `AppSidebar.tsx` | **Restyle** | New labels. Sidebar 224 px at `md`, 256 px at `lg`. `ThemeControl` card above the account button. On phones: top bar with logo and Theme button, and the same `<nav aria-label="Primary">` restyled as a bottom bar (one landmark, never two [MI §4.5]). The hamburger and its `useState` go. Physical classes `md:border-r` and `text-left` (`:139`, `:216`) become logical. |
| `LanguageBadge.tsx` | **Keep**, add `tone="hero"` | Hero tone uses `bg-hero-chip text-hero-foreground`. |
| `LastStudied.tsx` | **Remove** | Only `FocusDeckCard.tsx:16` and `DeckList.tsx:10` import it. Nothing does after this change. Delete it so Knip passes. It can return with a course page. |
| `PreviewSwitcher.tsx`, `dashboard-previews.ts` | **Keep** | The 11 states and the axe spec keep working. |
| `dashboard-model.ts` | **Keep**, one addition | Add `learnedCount(deck)` (mastered plus learning). `todayState`, `todayPrimaryAction`, `deckAction`, `sortDecks`, `weekDays`, `estimateMinutes` are reused unchanged. The hero reads `state.focusDeck.dueCount` and calls `estimateMinutes` on it. `totalMastered` and `isSameAction` lose their last callers (`dashboard.tsx:141-143`, `:161`) and must be deleted. `totalDue` is then used only inside the model, so it loses its `export`. |
| `dashboard-metrics.ts` | **Keep** | No contract change. The 5-week calendar needs more days later; that is a note for #112. |
| `dashboard.tsx` | **Restyle** | New grid (container query). The hero always uses all courses. The filter applies to the list only. The greeting no longer needs the unfiltered total, which removes today's mismatch between greeting and panel under `?studying=es` [CA §2.3]. |

### 7.2 New components

| Component | Where | Notes |
| --- | --- | --- |
| `StudyHero` | `apps/web/src/routes/_app/-components/StudyHero.tsx` | `<section aria-labelledby>` with the course name as `h2`. `@container` so its layout depends on its own width: stacked under 520 px, two columns above. Count rendered with `rich()` and an `<n>` tag. The card-stack art is three CSS rectangles, `aria-hidden`, shown from 520 px. |
| `ThemeControl` | `apps/web/src/components/theme-control.tsx` | Calls `useTheme()`, which nothing calls today [CA §5]. Two presentations from one options array and one `messages` object: `card` (native `<fieldset>` with three radio inputs, for the sidebar) and `menu` (`DropdownMenuRadioGroup`, for the phone top bar). Native radios give arrow-key behavior and work in forced colors for free [AU §7.2]. |
| `ProgressDisclosure` | from `ProgressTrends.tsx` | See above. |
| `TipCard` | from `MemoryCallout.tsx` | See above. |
| `CourseList` | from `DeckList.tsx` | See above. |
| Skip link | `apps/web/src/routes/_app.tsx` | First focusable element. `<main id="main" tabIndex={-1}>`. |
| Button: `variant="cta"` | `packages/ui/src/components/button.tsx` | `bg-cta text-cta-foreground hover:bg-cta-hover active:bg-cta-active`, bottom edge, keeps `border-transparent`. |
| Button: `variant="hero-quiet"` | same | `bg-hero-chip text-hero-foreground`. |
| Button: `size="xl"` (48 px) and `size="hero"` (56 px) | same | Both use `min-h-*`, `h-auto`, `whitespace-normal` and `text-balance` so translated labels wrap [MI §9 #1]. Replaces the three hand-written 44 px overrides [CA §0 finding 3]. Also add a 44 px `size="touch"` for row buttons. |
| Button focus style | same, line 8 | `focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring` replaces the 50% alpha ring (2.4:1 today) [CS §4.3]. |

**Links must be links.** Today every action is a `Button` rendering a `Link` with `nativeButton={false}`, which makes Base UI output `role="button"` on an `<a>` [CA §9]. Apply `buttonVariants(...)` classes to a plain `<Link>` instead, so screen readers say "link".

### 7.3 Tokens (`packages/ui/src/styles/globals.css`)

Adopt the three-tier file from the color research [CS §6.1, Appendix A; `color/proposed-tokens.css`]: primitives in `:root`, roles per theme, then `@theme inline`. New roles this design uses: `--hero`, `--hero-foreground`, `--hero-muted-foreground`, `--hero-chip`, `--hero-border`, `--hero-ring`, `--cta` and its four companions, `--foreground-strong`, `--border-strong`, `--brand`, `--link`, `--viz-*`, the container roles, plus my three `--tip*` aliases. Also: the `--elev-*` shadows, `--text-display`, the focus rule, `prefers-contrast: more` overrides [CS §6.7], and deletion of the wrong hex comments [CA §0 finding 10].

**This changes the whole app, not only the dashboard.** `--input` becomes a 3:1 border, the page gets a step darker, and dark mode changes everywhere [CS §4.2 design notes]. Check the study session, sign-in and marketing pages in both themes before merging.

### 7.4 Suggested build order

1. Tokens, `color-scheme`, pre-paint script, `ThemeControl`, remove "d". Dark mode becomes real and visible. Ship alone.
2. Button variants and sizes, focus ring, links-as-links.
3. `StudyHero` (merge), greeting, copy and terminology.
4. `ThisWeek`, `CourseList`, `TipCard`, `ProgressDisclosure`, new grid.
5. Phone bottom bar and top bar.
6. Test pass: axe in both themes for all 11 states, the two people tests in section 10, pseudo-localization [MI §8].

---

## 8. Accessibility and i18n notes for this design

### 8.1 Accessibility

| Topic | What this design does | Risk it introduces |
| --- | --- | --- |
| One main action (COGA 4.3.4) | One amber button, first Tab stop inside `<main>`, above the fold at 375 x 550. Today 8 tab stops come first on phones [AU §0 finding 8]. | None new. |
| Contrast, both themes | All text pairs pass WCAG AA and the APCA targets set in [CS §1]. Checked per theme, never assumed. | Pairs marked "mine" were computed, not browser-tested. |
| Light text on a dark hero, in the light theme | The key facts sit on navy in both themes. That is the pattern Karen read best. | Some people with astigmatism find light-on-dark text blurs. The hero holds 22 words, the largest type on the page, at 9.7:1 or better. Small paragraphs never sit on it. |
| Dark hero edge | See risk 3 in section 10. | In dark the hero is only 1.58:1 against the page in luminance. |
| Amber and orange are both warm | Kept apart by form: amber is always a filled button with ink text, orange is an icon or a pale panel [CS §7.2]. | In dark they are closer (OKLab distance 0.145 [CS §5.4]). Never put the flame next to the button. |
| Use of color (1.4.1) | Every state has a shape or word: check in studied days, thick ring for today, filled dot for the selected theme, a start bar and `aria-current` on the active nav item, icon plus word for "All done". | The tinted selected row alone is 1.14:1 in light. It must never be the only cue. |
| Focus (2.4.7, 2.4.11) | 2 px solid outline, 2 px offset, 6:1 or better everywhere. | The sticky bottom bar can cover a focused row. Add `scroll-padding-bottom` equal to its height and tab through at 375 px [AU §3]. |
| Keyboard shortcut (2.1.4) | The "d" key is removed. No single-key shortcuts on the dashboard. | The owner likes `kbd` hints on hover. There is no hint here because there is no shortcut. That is deliberate. |
| Theme control (1.3.1, 4.1.2) | Native radio group with a legend on desktop. Menu radio items on phones. | Two presentations of one control. They must share one options array so label, order and names cannot drift (3.2.4). |
| Target size (2.5.8) | Everything tapped is 44 px or more. The main button is 56 px. | Day marks are 36 px but not interactive. |
| Links and buttons (4.1.2) | Navigation is announced as links. The disclosure is a native `<details>`. | None. |
| Graphics | Every graphic has a sentence that says the same thing [AU §8]. One ring (today's mark), one bar style. | If someone later trims "200 of 1,000 words learned" to save words, the hero bar loses its exemption (track 1.46:1). |
| Forced colors | Real borders on cards and the hero. Button keeps its transparent border. Focus uses `outline`. Check glyphs in day marks. | The hero bar and today's arc lose their fill. Add `forced-color-adjust: none` with system colors, or accept that the sentence carries it. Not tested [AU §7.5]. |
| `prefers-contrast: more` | Muted text becomes default text. Borders reach 3:1 [CS §6.7]. | Not tested in a browser. |
| Motion | The button moves 1 to 2 px. The today ring animates once on load under `motion-safe`. Theme changes are instant. Nothing loops. | None. |
| Streak ethics | No streak in the hero or `h1`. No "missed". The line hides at zero [AU §9.3]. | Learners who like streak pressure get less of it. Intended. |
| Reflow, zoom, text spacing | One column at 320 px. Nothing that holds text has a fixed height or `nowrap`. | The hero grows with long text and pushes the button down. Checked by arithmetic only. |
| Page title, skip link, `lang` | "Home · Memli". Skip link first. Learning-language text keeps `lang`. | `<html lang>` is still static "en" (`index.html:2`). Out of scope until a second UI locale ships, but note it. |

Use the 72-item definition of done in [AU §10] as the acceptance list. This design is built to pass it, with one known miss and one open group:

- **Known miss, D2 on phones.** D2 asks for the main button to have 1.5 times the area of the next largest control. On desktop it does (280 x 56 against about 200 x 48, about 1.6 times). On phones both buttons are full width, so the ratio is 56 to 48, about 1.17 times. There the difference is carried by color (amber against tinted navy), the edge and the icon.
- **Open group.** Items that need a real browser, device or person are unchecked: D3, D8, D9, D36, D41, D43 to D45, D52 to D54, D70 to D72.

### 8.2 i18n

| Topic | What this design does | Risk it introduces |
| --- | --- | --- |
| Whole sentences | Number and words are one message with a tag: `<n>{count}</n> words to review`. Translators can move or drop the number (Arabic and Hebrew drop the digit for 1 and 2) [MI §7]. | None. This fixes three split sentences [CA §9]. |
| The big number stands alone | The `<n>` tag is `display: block`. Only the numeral is at 56 to 72 px. "32 palabras" at 60 px is 345 px and would not fit 287 px [MI §7.4]. | If a language puts a word before the number, that word sits on its own line above. Acceptable. |
| Plurals | Every count message has `one` and `other`. Spanish, Portuguese and French also have `many`. Zero is always a separate state, because 0 is `one` in Portuguese and French [MI §5.3]. | `{learned} of {total} words learned` has two numbers. The plural is keyed on `{total}`. Some languages may need the other. Translator note required. |
| Short labels grow most | Bottom bar: "Home", "Community", "You". Slots are 125 px at 375 and 106 px at 320. The longest Spanish and Portuguese drafts measured were 85 px [MI §4.5]. Row buttons use `min-w` and wrap. | "Review" and "Learn" as bare verbs are ambiguous to a translator. Each key needs a description: part of speech and what it acts on [MI §6 R7, R8]. |
| "Match my device" | Full-width rows, so "Igual que mi dispositivo" fits. | That Spanish string is my own draft, not a reviewed translation. |
| Main button wraps | `min-h-14`, no `nowrap`. "Empezar repaso" is 124 px at 16 px [MI §7.4], about 140 px at 18 px. Fits 231 px of label space at 375. | A very long language makes a two-line amber button. Looks heavier. Acceptable. |
| `Intl` everywhere | Numbers, percents, durations, day names, week start, language names. No typed units or `%` [MI §6 R5]. | "About {duration}" with a long unit is 190 px at 14 px in the Portuguese draft [MI §7.4], about 244 px at 18 px. It fits 287 px, with little spare. |
| Day names | `weekday: "short"` in seven equal grid columns. | Some locales add periods or run to four characters. At 320 px each column is about 37 px. Check in pseudo-localization. |
| No uppercase, no idioms | No eyebrow labels. "Caught up", "keep slipping", "stick", "in good shape" are gone [MI §6 R9, R21]. | "Tricky" and "memory trick" are informal. Translators need a note that "tricky" means "hard to remember". |
| Greeting | "Hi, {name}" has no gender and no hour logic. | Less warmth than "Good evening". Chosen on purpose. |
| Bidi | Course titles and names are wrapped in `<bdi>` inside sentences. Layout uses logical properties only. | The play icon in the main button does not mirror in RTL. Media play icons conventionally stay unmirrored. I state that from memory and did not check a source. If in doubt, remove the icon. |
| "Words" | One item noun everywhere. | Wrong for kana and for phrase courses. If per-course nouns are added later, add whole messages per noun. Never insert a noun into a sentence [AU §11.5]. |
| Translation cost | About 85 visible words in the default state instead of 217. Fewer plural matrices. | New strings exist for states (tips, progress table). Count words per screen in CI [MI §6 R26]. |

---

## 9. What is fun about it

The feedback rewarded color, depth and character, not less content [FE §1]. Fun here is put **into** the first-glance and second-glance elements. It adds no new boxes [CP §9].

1. **A night sky with one lamp.** Deep navy everywhere, one amber button glowing on the brightest panel. It has a mood. Woodson's word for example-02 was "vibe" [FE §2].
2. **The lamp goes out when you are done.** In the caught-up state the amber is gone and a big check takes its place. The page is visibly pleased with you. Today that state "looks like a notice" [RUI §9.4].
3. **A button you want to press.** It has an edge, it rises on hover, it sinks on press. This is the owner's rule (solid, tall, with depth) and old Memrise's habit [MA §4.3].
4. **Today's circle fills as you study.** Finish a session, come back, and the ring has moved. The first word of the day fills a visible slice. That uses the goal-gradient and endowed-progress effects honestly [CP §4].
5. **A row of checks you earned.** Crystal circled exactly this [FE §8 circle C]. Blank days are just blank.
6. **The card stack.** Three overlapping cards behind the number, with the language code on top. It gives the hero its own shape and says "words waiting" without a word [RUI §9.8 idea 4]. Later the top card becomes a real mnemonic image, which is the thing only Memli has [MA lesson 14].
7. **One warm card.** The tip card is the only warm surface, like the Study Tip Crystal circled [FE §8 circle E]. It changes: a nudge about tricky words when you have some, a study tip when you do not.
8. **Day and night are the same place.** Switch themes and nothing moves. The hero stays navy, the button stays amber. Old Memrise's night mode did the same [MA §2.6].
9. **Small celebrations, later.** A short flame animation at 7, 30 and 100 days in a row, and nothing on other days. Duolingo reported +1.7% day-7 retention from milestone animations [CP §5.1, Duolingo blog 2022]. Always under `motion-safe`. Not in the first release.

No mascot. One clip-art owl reads as stock art [CP §9.4].

---

## 10. Trade-offs and risks

### 10.1 Trade-offs, stated plainly

| Choice | What it costs |
| --- | --- |
| The hero counts one course (16), not all courses (24). | Nowhere says "24 in total". A learner with several courses has to add the rows. It is honest, because the button really opens 16. It becomes unnecessary when a cross-course session exists (`PLAN.md:146`). |
| "Learned" means mastered plus learning. | 200 looks better than 52. It is true only if the owner accepts that definition. The stricter split lives in "Your progress". |
| No heatmap yet. | Crystal asked for it by name. She gets the 7-day marks now and a 5-week calendar after #112. She may read that as "not done". |
| No mnemonic image yet. | The product's namesake is not on its home screen. The card stack is a placeholder for it. |
| Stats are behind a disclosure. | People who like numbers must click once. Memrise power users disliked losing density [MA §5.2, lesson 13]. The course list stays compact to respect that. |
| The language filter is demoted and no longer changes the hero. | A learner who only wants Japanese today uses the Japanese row's button. Simpler, and the hero never jumps. But it is a behavior change. |
| A bottom bar on phones. | 56 px of a small screen, for two destinations and an account menu. It replaces a 32 px hamburger that hid both links [MI §4.5]. |
| "Hi, {name}" instead of a time-of-day greeting. | Less charm. Zero i18n risk. |
| The greeting is modest (30 px), not the 46 px of example-02. | Less "big welcome". The big thing is the number. Two large things at most [CP §4, NN/g visual hierarchy]. |
| 83 words on the first desktop screen. | Above one research target of 70 [CP §10.1]. Below the a11y target of 90 for the whole page [AU §10 D10]. |
| Amber is new to the brand. | See risk 1. |
| The token change touches every screen. | More testing than a dashboard-only change. |

### 10.2 The three biggest risks

**Risk 1. Two brands until amber is rolled out, and amber cannot stand on white.**
The dashboard's main action becomes amber on navy. The study session's Submit and the marketing pages stay blue. Until those follow, the product has two "press me" colors. And amber is only 1.57:1 on a white card [CS §5.2 #32], so any screen without a navy panel cannot use it as is. Some old Memrise users disliked the 2019 switch to yellow buttons [MA §5.2].
*Mitigation.* The choice sits behind one role, `--cta`, and reverses in five lines per theme [CS §8]. Decide before building whether the session and marketing get a navy band too. If the owner will not commit to amber app-wide, do not ship it on one screen.

**Risk 2. Too much was taken away for the people who voted for "fun" and "important information".**
The gut vote went to the two busiest, most colorful examples. Example-01 had about 160 words and was called "more fun" [FE §1]. This design answers the owner's four problems by removing things: the total count, the ring, the trends, the word chips, the per-course stats. Crystal and Ben picked a light, playful, many-colored layout. In light mode they get a pale page with one dark navy block, which may read as serious, not playful. And the four responses are a 2 to 2 tie, not a win for dark [FE §2].
*Mitigation.* Run the five-second and first-click tests from [AU §13] with the same four people, in both themes, on the real build, before polishing. Ask "what would you tap first?" and "what is missing?". The card stack, the tip card and the future mnemonic image are where color and play can grow without adding boxes.

**Risk 3. Nothing here has been seen in a browser, and the dark surface steps are small.**
Every number is computed from token values. No real component, font, phone or person has tested it [CS §9]. Two dark-mode steps are subtle: card against page is 1.15:1 (about the same as today), and the hero against the page is 1.58:1 in luminance [CS §5.6, §5.2 #57]. The hero stands out by chroma, by its border, and by the amber and near-white inside it. Chroma does not survive a grayscale test or some low-vision conditions. The glows and shadows are unverified guesses. Phone heights are arithmetic, and Safari's visible height was never measured on a device [LA §12; MI §11].
*Mitigation.* Build step 1 (tokens and theme control) first and look at it on a real phone in a dark room and in daylight. Blur a dark screenshot by 8 px: the button must be the brightest shape and the hero must still read as a panel. If it does not, raise the dark hero's lightness. **That is a token value change and must be re-verified with `color/verify.mjs`.** Have Karen read the page aloud in the theme she picks [AU §10 D72].

---

## 11. What I could not verify

- **No rendering.** This is a paper design. No screenshot of it exists. All heights, widths and area percentages are arithmetic from the scales in section 6.
- **Phone folds.** The 550 px and 635 px visible heights are estimates repeated from the research. No device was used.
- **My extra contrast pairs.** Computed with culori and apca-w3 from the hex values in [CS §4.2]. Same method as the verified table, but not part of its gated run.
- **Glows, shadows, hover motion.** Untuned.
- **Forced colors, `prefers-contrast`, screen readers, RTL.** Reasoned from the research. Not tested.
- **Whether a `height` media query follows Safari's collapsing toolbars.** The "bottom bar is sticky only above 480 px" rule depends on it.
- **`retentionPercent`'s time window**, and how the practice session behaves in the browser. The code sizes a practice session by `deck.trickyCount` (`apps/web/src/routes/_session/-components/session-model.ts:31-32`), which is why the tip card counts one course. I did not run it.
- **Translations.** Every Spanish or Portuguese string mentioned is an unreviewed draft from the research or from me.
- **Refactoring UI and Albers.** Cited through the research files, which themselves cite the books from summaries or memory [RUI §12; CS §9].
- **Study tips.** The two draft tips are common study advice. I did not source them.
- **The research files.** I read the sections cited here, not every line.

---

## Sources

Research files (all under `scratch/research/`): `color-science.md`, `code-audit.md`, `live-audit.md`, `feedback-examples.md`, `memrise-archive.md`, `refactoring-ui.md`, `a11y-usability.md`, `mobile-i18n.md`, `competitors-attention.md`.

Color files: `scratch/color/proposed-tokens.css`, `color/verify.mjs`, `color/preview.png`. My extra pairings: `scratch/design/night-first-pairs.mjs`.

Code read directly (under `dev/memli/`): `packages/ui/src/styles/globals.css`, `packages/ui/src/components/button.tsx`, `apps/web/index.html`, `apps/web/src/routes/_app/-components/dashboard-model.ts`, `dashboard-metrics.ts`, `dashboard-previews.ts`, `AppSidebar.tsx`, and the rule files in `.cursor/rules/`.

Images viewed: `docs/designs/dashboards/example-01.jpeg`, `example-02.png`, `example-04.png`, `example-05.jpg`, and the current dark desktop screenshot.

External sources, as cited by the research files (I did not re-open them):

- Evil Martians, "OKLCH in CSS: why we moved from RGB and HSL". https://evilmartians.com/chronicles/oklch-in-css-why-quit-rgb-hsl
- W3C, WCAG 2.2. https://www.w3.org/TR/WCAG22/
- W3C, Understanding SC 1.4.11 Non-text Contrast. https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html
- W3C, Understanding SC 1.4.1 Use of Color. https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html
- W3C, Understanding SC 2.1.4 Character Key Shortcuts. https://www.w3.org/WAI/WCAG22/Understanding/character-key-shortcuts.html
- W3C, Understanding SC 2.5.8 Target Size (Minimum). https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html
- W3C, Making Content Usable for People with Cognitive and Learning Disabilities. https://www.w3.org/TR/coga-usable/
- Myndex, "APCA in a Nutshell". https://git.apcacontrast.com/documentation/APCA_in_a_Nutshell.html
- Tailwind CSS, "Theme variables" and "Dark mode". https://tailwindcss.com/docs/theme , https://tailwindcss.com/docs/dark-mode
- MDN, `color-scheme`, `prefers-contrast`, `forced-colors`, `theme-color`. https://developer.mozilla.org/en-US/docs/Web/CSS/color-scheme , https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-contrast , https://developer.mozilla.org/en-US/docs/Web/CSS/@media/forced-colors
- web.dev, "Building a theme switch component". https://web.dev/articles/building/a-theme-switch-component
- NN/g, "Dark Mode vs. Light Mode: Which Is Better?". https://www.nngroup.com/articles/dark-mode/
- NN/g, "Usability for Senior Citizens". https://www.nngroup.com/articles/usability-seniors-improvements/
- NN/g, "Low-Contrast Text Is Not the Answer". https://www.nngroup.com/articles/low-contrast/
- NN/g, "Progressive Disclosure". https://www.nngroup.com/articles/progressive-disclosure/
- NN/g, "Visual Hierarchy in UX". https://www.nngroup.com/articles/visual-hierarchy-ux-definition/
- NN/g, "Hamburger Menus and Hidden Navigation Hurt UX Metrics". https://www.nngroup.com/articles/hamburger-menus/
- Laws of UX, Von Restorff effect, Fitts's law, Hick's law. https://lawsofux.com/von-restorff-effect/ , https://lawsofux.com/fittss-law/ , https://lawsofux.com/hicks-law/
- GOV.UK Design System, Button. https://design-system.service.gov.uk/components/button/
- Duolingo blog, "Improving the streak" and "How Duolingo's streak builds habit". https://blog.duolingo.com/improving-the-streak/ , https://blog.duolingo.com/how-duolingo-streak-builds-habit/
- Silverman and Barasch (2023), "On or Off Track: How (Broken) Streaks Affect Consumer Decisions", Journal of Consumer Research 49(6). https://www.colorado.edu/business/faculty-research/2023/04/19/or-track-how-broken-streaks-affect-consumer-decisions
- W3C Internationalization, "Text size in translation". https://www.w3.org/International/articles/article-text-size
- Unicode CLDR, Language Plural Rules. https://www.unicode.org/cldr/charts/latest/supplemental/language_plural_rules.html
- Adam Wathan and Steve Schoger, Refactoring UI. Chapters "Hierarchy is Everything", "Layout and Spacing", "Working with Color", "Creating Depth", "Finishing Touches", as summarized in `refactoring-ui.md`.
- Josef Albers, Interaction of Color (Yale University Press, 1963), as summarized in `color-science.md` section 3.6.

# Dashboard redesign proposal: Calm Focus

One design, not a menu. It is built to fix the owner's problems 1 (too busy) and 4 (no focal point) first. Problems 2 (contrast) and 3 (dark mode) are solved with the verified color system from the color research.

Nothing in the repository was changed. This is a plan.

## How to read the citations

Every claim points to one of the nine research files, or to a code file and line. The research files are in
`scratch/research/`.

| Tag | File |
| --- | --- |
| [code] | `code-audit.md` |
| [live] | `live-audit.md` |
| [fb] | `feedback-examples.md` |
| [mem] | `memrise-archive.md` |
| [rui] | `refactoring-ui.md` |
| [color] | `color-science.md` |
| [a11y] | `a11y-usability.md` |
| [mi] | `mobile-i18n.md` |
| [comp] | `competitors-attention.md` |

"[color] 5.2 #26" means section 5.2, row 26 of that file. Code paths are relative to `dev/memli/`. `-components/` means `apps/web/src/routes/_app/-components/`.

Three kinds of numbers appear below. I label each one.

- **Measured**: taken from a research file that measured the live page or computed it with a script.
- **Verified**: a color pairing that passed the color research's gate script (WCAG 2.2 and APCA).
- **Estimate**: my own arithmetic from the sizes this proposal picks. Nothing here was built or rendered. Every height in the wireframes is an estimate.

---

## 1. North star

**Open Memli, see one number and one button, and be studying within three seconds.**

Why this sentence: every strong learning home screen answers "what do I do now" with one control (Duolingo's next node, Anki's Study Now, RemNote's Practice button) [comp] 1, 3.1. Memli today shows 84 text runs, 12 headings and 31 metric numbers at near-equal weight [code] 2.2, 3. W3C's cognitive guidance asks for key content to "visually stand out" and to be visible without scrolling [a11y] 2.4, COGA 4.3.4.

Three principles follow.

### Principle 1. One answer per screen

The first screen answers one question: what do I study now. It shows one course, one count, one time estimate and one amber button.

- The count is the number of words the button opens. Today the headline says 24 and the button opens 16 [a11y] 0 item 10, [code] 7.3.
- Amber fill appears once per screen. It means "the one thing to do next" and nothing else [color] 7.2.
- Everything that does not help that decision sits lower, behind a labelled disclosure, or on another page.

### Principle 2. Say each fact once, or not here

Today about 9 of the 31 numbers are repeats [code] 3. Minutes, the streak, "16 due", "8 due" and "10 new" each appear twice [code] 2.3. Old Memrise showed each number once and used about 45 to 50 words on its first screen [mem] 0, lesson 2.

- Each fact has one home.
- A fact the learner does not act on from this page leaves the page.
- If a graphic's sentence is cut, the graphic is cut with it [a11y] 8.

### Principle 3. Calm comes from contrast, not from paleness

This is the principle that keeps "calm" from turning into "plain". The people asked did not vote for pale. Example-05 is the calmest page and nobody picked it. Example-03, which the current build is closest to, got zero votes [fb] 1, 4.3, 4.5. Karen's words were about text against background: "the white background makes the words disappear" [fb] 2.

- One deep navy hero is the only saturated surface. Against the light page it is 12.97:1 (computed by the color research's script, [color] 5.2 #57). Today's Today panel is 1.04:1 [live] 7.
- No gray text on neutral surfaces. Hierarchy comes from size and weight. Today 48% to 58% of the text is muted gray [live] 3.5, [fb] 5.1.
- Few things, each of them strong.

---

## 2. Focal hierarchy

### 2.1 The three levels

| Level | Element | What it contains | Why it sits here |
| --- | --- | --- | --- |
| **First glance (exactly one)** | **Today hero** | Course name. The count as the largest text on the page. "About 3 min". The amber "Start review" button. | It merges Today and Continue learning into the single hero card Crystal circled twice, in example-04 and example-05 [fb] 8 circles A and B. The current Continue learning card has no control in the default state [code] 0 item 6. |
| Second glance (two) | **Week strip** | Seven day circles ending today. One sentence: "12 days in a row". | Crystal circled the 7-day check row in example-05 [fb] 8 circle C. It carries the streak, so the streak is said once [comp] 5.3. |
| Second glance | **Other courses** | One compact row per other course: title, one status, one button. | It answers "what else do I have". It keeps the learner's freedom to pick a course, which Duolingo users missed when it was removed [comp] 3.2. |
| Third level | "Learn 10 new words" | A quiet button inside the hero, under the main one. | One recommended action and one quiet alternative (Hick's law) [comp] 4. |
| Third level | "Your progress" disclosure | Today's goal, words learned, tricky words. Closed by default. | Progressive disclosure: defer what is rarely needed, and label the door clearly [a11y] 2.1, [comp] 4. |
| Third level | Theme control | Three radio choices in the sidebar foot (desktop) or the Account menu (phone). | Crystal circled the bottom-left sidebar area in example-02 [fb] 8 circle D. |
| Third level | Greeting | "Hi, Phillip" as a small `h1`. | A pleasantry should not outrank the feature [rui] 3.6. |

### 2.2 What is removed or moved, and where it goes

Nothing silently disappears. Each row names the new home.

| Today | Decision | Where it goes | Why |
| --- | --- | --- | --- |
| Status sentence under the greeting ("About 4 minutes of review keeps your 12-day streak going.") | Removed | Minutes move into the hero. The streak lives in the week strip. | Both facts repeat within 300 px [rui] 7. It makes the streak the reason to study, a mild loss frame [a11y] 9.2. |
| Time-of-day greeting | Simplified | "Hi, {name}". One string. | "Good evening" shows at 02:00. Cut-off hours differ by culture [mi] 5.5. |
| Language filter (5 chips above the hero) | Moved and shrunk | One menu in the "Other courses" header. It shows only when there are more than 5 other courses and at least 2 languages. The `?studying=` URL keeps working in every state. | It costs 80 to 212 px and 5 to 13 tab stops before the main action [mi] 2.2, [live] 8. With a short list, each course row already does the job. |
| "TODAY" eyebrow | Removed | The hero's count is the heading. | A label that adds a heading without meaning [rui] 3.5. Uppercase means nothing in scripts without case [mi] 5.9. |
| "24 cards ready to review" (all courses) | Replaced | "16 words to review" for the course the button opens. | Headline and button must agree [a11y] 11.1 option B. |
| Chips "16 from Spanish Core 1000", "8 from Japanese..." | Removed | The Japanese row shows "8 to review" once. | Repeated counts [code] 2.3. |
| "Starts in Spanish Core 1000." | Removed | The hero's first line is the course name. | A sentence that explains a limitation [mi] 4.3. |
| "Continue learning" heading and Focus deck card | Merged | Into the hero. | A heading for a list of one, on a card with nothing to press [rui] 3.5, [code] 0 item 6. |
| "16 Due", "10 New today" | Removed | Same facts are the hero count and the "Learn 10 new words" button. | Duplicates [code] 3 rows 8, 9. |
| "5% mastered of 1,000 cards", mastery bar, legend (52, 148, 800) | Moved off the dashboard | Future course page (`docs/product-ux.md:128` plans a course library). Until it exists these are not shown. | Two blues at 2.48:1 with a color-only legend [code] 4.3. Detail nobody acts on from here [a11y] 8.1. |
| "Last studied ..." (4 times) | Moved off the dashboard | Future course page. The data stays in `DashboardDeck.lastReviewedAt`. | Nobody acts on it here [a11y] 11.2 row 15. |
| Language code badges (ES, JA, FR, PT) | Removed from the dashboard | Language names appear in the filter menu, from `Intl.DisplayNames`. | ISO codes are jargon and the name is hover-only, so it is invisible on touch [mi] 3.10. Fewer boxes. |
| Per-row "% mastered" and mini bars | Removed | Future course page. | Three numbers and three bars with no action [a11y] 8.1. |
| "This week" card heading | Hidden visually | Stays as a screen-reader heading ("Your week"). | The circles and sentence explain themselves [rui] 3.5. |
| Goal ring, "Daily goal", "26 more cards to reach today's goal." | Moved | "Your progress" disclosure, as one linear bar plus "24 of 50 words today" and "26 to go". | Gauges are harder to read than bars [a11y] 8.2. A second big "24" next to the hero caused confusion [code] 0 item 5. |
| "Streak 12 days" | Merged | The week strip sentence "12 days in a row". | Said once [comp] 5.3. |
| "Words mastered 100" | Moved and reworded | "Your progress" disclosure, as "{count} words learned". | Not needed to decide what to do now [comp] 8.4. |
| "7 words keep slipping" card, sentence, 5 word chips, "and 2 more" | Shrunk and moved | One line in "Your progress": "7 tricky words. A new memory trick can help." The words themselves appear inside the practice session. | The chips look like buttons and are not. The card has no action [live] 4, [a11y] 11.2 rows 39 to 42. |
| "Your progress trends" (Consistency, Retention, New cards) | Moved off the dashboard | Future Progress page. Copy for it is in section 4.7. The data stays in `ProgressTrendsData`. | Three more big numbers with no action [rui] 2.3. Every researcher who looked at it recommended moving it [a11y] 11.2, [comp] 8.4, [mem] lesson 9. |
| "Global average: 75%" | Removed everywhere | Not shown anywhere. | Comparison with strangers can discourage. The product doc already parked the Rank card for this reason [a11y] 9.3 rule 7. |
| Hamburger menu on phones | Replaced | A bottom bar with three labelled items. | Hidden navigation cut discoverability by more than 20% in NN/g's study [mi] 3.2. |
| "View Profile" menu item | Removed for now | Returns when a profile page exists. | It links to `/dashboard`, a placeholder [mi] 9 item 17. |
| The `d` keyboard shortcut | Removed | The visible theme control replaces it. | A single-letter shortcut with no off switch is the pattern WCAG 2.1.4 (Level A) is about [a11y] 3. |
| Crystal's heatmap request | Deferred, with a first step | First step now: the 7-day strip. Later: a 5-week calendar on the Progress page. | The data contract holds only 7 days [code] 7.3. A year grid needs 53 columns and color-only shades [a11y] 8.4. |
| Crystal's Study Tip circle | Deferred | A later tip line in the all-done state. | Third-level content. It would add a box to the first screen [comp] 8.4. |
| Mnemonic image in the hero | Deferred | The hero gains an image zone when the data has one. | `TrickyWord` and `DashboardDeck` have no image field today [code] 7.3. |

---

## 3. Wireframes

All heights are **estimates** from the sizes in section 6. None was rendered. Check them at 375 and 422 px once built, in both themes and in pseudo-localized text.

The design viewport for "above the fold" on a phone is 375 x 550. That is roughly what a 375 x 667 iPhone shows with Safari's bars. The figure comes from secondary sources and was not checked on a device [mi] 2.1.

One layout rule covers every width: **one column, 704 px wide at most (44rem)**. The hero switches from stacked to two zones when its own container is 576 px or wider (a container query, `@xl`). Below `lg` (1024 px) the app chrome is a top bar plus a bottom bar. From `lg` up it is the left sidebar.

### 3.1 Phone, 375 x 812, default state: first screen

```
 x=0                                    375
y=0   +--------------------------------------+
      | [M] Memli                            |  top bar, 56 tall, scrolls away
y=56  +--------------------------------------+
      |                                      |  16
      |  Hi, Phillip                         |  h1, 18px/600, 28 tall
y=100 |                                      |  12
y=112 |  ####################################|
      |  #  Spanish Core 1000              # |  pad 20, then 24 (18px/600)
      |  #                                 # |  8
      |  #  16                             # |  60 (60px/700), alone on its line
      |  #  words to review                # |  24 (18px/600)
      |  #  About 3 min                    # |  24 (18px/400)
      |  #                                 # |  20
      |  #  +---------------------------+  # |
      |  #  |      Start review   ->    |  # |  56, amber, full width
      |  #  +---------------------------+  # |  <- bottom edge at y=348
      |  #                                 # |  8
      |  #  [    Learn 10 new words     ]  # |  44, quiet
      |  #                                 # |  pad 20
y=420 |  ####################################|
      |                                      |  16
y=436 |  +--------------------------------+  |
      |  | (v) (v) (v) (v) (v) (v) ( o )  |  |  day circles, 36 tall
 - - - - - - - - - - - - - - - - - - - - - - -  fold at y=494 (550 minus the bar)
y=494 +--------------------------------------+
      |    Home       Community     Account  |  bottom bar, 56, icon over label
y=550 +--------------------------------------+
```

`#` is the navy hero. `(v)` is a done day, `( o )` is today.

What is above the fold at 375 x 550: the whole hero, both buttons, and the top of the week strip as a scroll cue.

| Check | Today (measured) | This design (estimate) |
| --- | --- | --- |
| Bottom edge of the main button | y = 625 [live] 3.2 | y = 348 |
| Things above the button | 9 (bar, greeting, sentence, 2 chip rows, label, count, minutes, 2 deck chips) [mi] 2.1 | 5 (bar, greeting, course name, count with its label, minutes) |
| Tab stops before the main button | 8 [a11y] 0 item 8 | 5 (skip link, logo, three nav items). One keypress with the skip link. It is the first stop inside `main`. See section 8.2. |
| Words on the first screen | 53 in `main` at 375 x 812 [live] 3.1 | 18 in `main`, 22 counting the logo word and three bar labels |
| Does the button move with data? | Yes. y = 701 with long titles, y = 777 with many decks [live] 3.2 | No. Only a wrapping course title adds 24 px per extra line. |

Small-phone check, 320 x 568, about 450 visible (my estimate from [mi] 3.8). The bottom bar is not sticky below 480 px of height, so all 450 px are free. Inner hero width is 248 px. Button bottom edge stays near y = 348. With a two-line title and a two-line label it is near y = 396. It fits.

### 3.2 Phone: the rest of the page

```
y=436 +--------------------------------+
      | (v) (v) (v) (v) (v) (v) ( o )  |  16 pad, circles 36
      | Sat Sun Mon Tue Wed Thu Fri    |  4, labels 20 (14px/600, today bold)
      |                                |  12
      | (flame) 12 days in a row       |  24 (16px/600), pad 16
y=564 +--------------------------------+
                                          32
y=596   Other courses                     h2, 14px/600, 20 tall, then 12
y=628 +--------------------------------+
      | Japanese Hiragana & Katakana   |  row, about 80 tall on a phone:
      | 8 to review         [ Review ] |  title line, then status + 44px button
      +--------------------------------+  8
      | French Travel Phrases          |
      | 10 new words        [ Learn  ] |
      +--------------------------------+  8
      | Portuguese Essentials          |
      | (v) All done                   |  no button: nothing to do
y=884 +--------------------------------+
                                          32
y=916 +--------------------------------+
      | Your progress                > |  disclosure, closed, 48 tall
y=964 +--------------------------------+
                                          32, then the bottom bar
```

Estimated page height: about 1,050 px, which is about 1.9 screens of 550. Today it is 2,658 px, 3.3 screens of 812 [code] 4.6.

"Your progress", when opened (about 200 px more):

```
      +--------------------------------+
      | Your progress                v |
      |                                |
      | [==========---------------]    |  one bar, 12 tall, outlined track
      | 24 of 50 words today           |
      | 26 to go                       |
      |                                |
      | 200 words learned              |
      |                                |
      | 7 tricky words                 |
      | A new memory trick can help.   |
      +--------------------------------+
```

### 3.3 Tablet, 768 x 1024

Below `lg`, so it uses the phone chrome. Gutter 32. The column is its full 704 px, so the hero is in two zones.

```
y=0   +----------------------------------------------------------+
      | [M] Memli                                                |  56
y=56  +----------------------------------------------------------+
      |   Hi, Phillip                                            |
y=112 |   ######################################################|
      |   #  Spanish Core 1000                                 #|
      |   #  16                         +-------------------+  #|
      |   #  words to review            |  Start review ->  |  #|  56 tall, 288 wide
      |   #  About 3 min                +-------------------+  #|
      |   #                             [ Learn 10 new words ] #|  48 tall
y=340 |   ######################################################|
y=356 |   +----------------------------------------------------+|
      |   | (v)(v)(v)(v)(v)(v)( o )     (flame) 12 days in a row||  one row, 92 tall
y=448 |   +----------------------------------------------------+|
y=496 |   Other courses                                          |
      |   +----------------------------------------------------+|
      |   | Japanese Hiragana & Katakana   8 to review [Review]||  64 each
      |   | French Travel Phrases         10 new words [Learn ]||
      |   | Portuguese Essentials          (v) All done        ||
y=736 |   +----------------------------------------------------+|
y=784 |   [ Your progress                                    > ]|
      |                                                          |
y=968 +----------------------------------------------------------+
      |        Home              Community            Account    |  56, sticky
      +----------------------------------------------------------+
```

Everything fits one screen at 768 x 1024. Today the tablet layout squeezes `main` to 464 px beside a 256 px sidebar and runs 2.15 screens [live] 3.1, 3.3.

Phone in landscape, 667 x 375, about 320 visible (estimate). The hero's container is 635 px, so it is in two zones. Hero height is about 180. The main button sits near y = 148 to 204. It is fully visible. Today it sits at y = 479, below the fold [mi] 2.1. The bottom bar scrolls with the page at this height.

### 3.4 Desktop, 1280 x 800 and wider

```
x=0        256                                                        1280
y=0  +------+---------------------------------------------------------------+
     | [M]  |                                                               |
     | Memli|        Hi, Phillip                                  y=32..60  |
     |      |                                                               |
     | Home |        ############################################  y=84     |
     | Comm-|        #  Spanish Core 1000                       #           |
     | unity|        #  16                  +----------------+  #           |
     |      |        #  words to review     | Start review ->|  #  288 x 56 |
     |      |        #  About 3 min         +----------------+  #           |
     |      |        #                      [Learn 10 new words]#           |
     |      |        ############################################  y=312    |
     |      |        +------------------------------------------+ y=328     |
     |      |        | (v)(v)(v)(v)(v)(v)( o )   12 days in a row|          |
     |      |        +------------------------------------------+ y=420     |
     |      |                                                               |
     |      |        Other courses                                 y=468    |
     |Theme |        +------------------------------------------+ y=500     |
     | (o) Match     | Japanese Hiragana & Katakana  8 to review [Review]|  |
     |  my device    | French Travel Phrases        10 new words [Learn ]|  |
     | ( ) Light     | Portuguese Essentials         (v) All done        |  |
     | ( ) Dark      +------------------------------------------+ y=708     |
     |------|                                                               |
     | (@)  |        [ Your progress                          > ]  y=756    |
y=800+------+---------------------------------------------------------------+
```

The column is 704 px wide, centered in the 1,024 px main area (x = 416 to 1120). On a 1920 px screen it stays 704 px wide and centered.

Above the fold at 1280 x 800: everything. The "Your progress" row ends at about y = 804, so its top is visible and it reads as a door to more.

| Check, desktop first screen | Today (measured) | This design (estimate) |
| --- | --- | --- |
| Words in `main` | 124 at 1280 x 800 [live] 3.1 | 53 |
| Headings | 7 [live] 3.4 | 3 visible (greeting, the count, "Other courses") plus the "Your progress" label |
| Painted boxes of 20 px or more | 28 [live] 3.4 | About 12: hero, 2 hero buttons, strip card, 7 circles counted as one row, 3 rows, 2 row buttons, disclosure |
| Solid shapes in the action color | 8 solid blue [live] 3.4 | 1 amber |
| Main button | 126 x 44 px, 0.54% of the screen, flat [live] 0 | 288 x 56 px, 1.58% of the screen, with a 3 px lower edge |
| Hero against the page | 1.04:1 light, 1.35:1 dark [live] 7 | 12.97:1 light. 1.58:1 dark, where chroma (0.12 against 0.045) and the amber button do the separating [color] 5.2 #57, 4.2 |

At 1440 x 900 the button is 1.24% of the viewport. The competitor research set a target of at least 1.2% [comp] 10.1.

### 3.5 The other states

The hero keeps one structure in every state: first line, big slot, one supporting line, button slot. Only the content changes. COGA asks that controls do not move unexpectedly [a11y] 4, pattern 4.5.1. The state comes from `todayState()` in `-components/dashboard-model.ts:110-132`, unchanged.

| State (`?preview=`) | First line | Big slot | Supporting line | Button slot | Below the hero |
| --- | --- | --- | --- | --- | --- |
| **default** (review) | Course name | "16" then "words to review" | "About 3 min" | Amber "Start review". Quiet "Learn 10 new words" when the course has new words. | Strip, other courses, progress |
| **learn** (nothing to review, new words ready) | Course name | "10" then "new words to learn" | none | Amber "Start learning" | Same |
| **caught-up** | none | A large check mark in a circle, then "All done for now" (24px) | "Your next reviews will show up here." | **No amber button.** Up to two quiet buttons: "Learn 10 more new words", "Practice 4 tricky words". Under them: "Each new word means a few short reviews later." | Same |
| **finished** (caught up, nothing extra to offer) | none | Check mark, "All done for now" | "Your next reviews will show up here." | Empty | Same |
| **no-decks** | none | "You have no courses yet" (24px) | "Pick one to start learning words." | Amber "Find a course" (to `/community`) | Nothing. No strip, no list, no progress. |
| **one-deck** | Course name | As default | As default | As default | Strip and progress. No "Other courses" section. |
| **many-decks** (12) | Course name | As default | As default | As default | Strip. "Other courses" shows the 3 rows that need attention most (`sortDecks` order), then a closed "Show 8 more courses" disclosure. The Language menu appears in the section header. |
| **goal-met** | As its Today state | | | | The strip shows today as done. "Your progress" says "You reached today's goal." |
| **same-language** | As default | | | | No Language menu (one language). |
| **long-titles** | Title wraps, never truncates | | | | Row titles wrap. The button moves down 24 px per extra line. |
| **large-numbers** | As default | "12,480" at 60 px is 204 px wide and fits the 232 px inner width at 320 px [mi] 7.4 | | | |

Why the caught-up state has no amber button. Amber means "the one thing to do next" [color] 7.2. When nothing is waiting, the honest answer is "nothing". The check mark takes the big slot and becomes the focal point. Refactoring UI reaches the same conclusion for this state [rui] 9.4. This bends the owner's rule that a screen's main action is a solid primary. I think it is right, because this screen has no main action. It is listed as a trade-off in section 10.

Why the many-decks state stays calm. The first phone screen is identical with 1 course or 12, because the filter no longer sits above the hero. Today the button drops to y = 777 with 12 decks [live] 3.2. Three rows then "Show more" follows the old Memrise dashboard, which loaded 4 courses first [mem] 2.3, and avoids the "it's all so big" complaint Clozemaster got when every row grew [comp] 3.2.

---

## 4. Copy deck

### 4.1 Decisions about words

| Question | Decision | Evidence |
| --- | --- | --- |
| Deck, course, list or set? | **Course.** One word, everywhere a learner can see or hear it. | Crystal flagged "Deck" [fb] 2. The code already says `courseId` 77 times and `deckId` 0 times [fb] 10.1. The route is `/study/$courseId`. Memrise said "course" through its whole classic era. "Decks" was only its 2019 spin-off, reversed in 2020 [mem] 3.1, 5.1. |
| Cards or words? | **Words.** | A learner is learning words, not cards. Today the same items are "cards" when reviewed and "words" when learned [code] 8.3. |
| Due | **To review.** | "Due" is scheduling jargon [a11y] 12. |
| Mastered | **Learned** on the dashboard. | "Mastered" is a big claim shown as a small percentage [a11y] 12. |
| Streak | **Days in a row.** | Literal. Not certain a non-technical learner knows "streak" [a11y] 12. |
| Caught up | **All done.** | "Caught up" is an idiom [mi] 6 rule R9. |
| Mnemonic | **Memory trick** on the dashboard. | Hard to read and say [a11y] 12. |
| System (theme) | **Match my device.** | "System" is operating-system jargon [a11y] 7.1. |
| Nav item for this page | **Home.** | Today it says "Decks" and opens `/dashboard` [code] 8.1. |

Two things for the owner to confirm before the strings are frozen.

1. "Words" is not always true. The Japanese course teaches kana and the French one teaches phrases [code] 8.3. "Words" is the plain default. If per-course nouns come later, add whole messages per noun. Never insert a noun into a sentence [a11y] 11.5.
2. "Learned" here means words the learner has started (mastered plus still learning). That matches old Memrise's "637 / 4725 words learned" [mem] 2.3 and the accessibility research's advice [a11y] 11.1 decision 2. The split into "known well", "still learning" and "not started" belongs on the course page.

The accessibility research has a five-minute naming question to settle "course" with evidence: ask the same four people "What would you call this?" [a11y] 13.4. Run it before the rename ships.

### 4.2 Rules every string follows

- A whole sentence or phrase per message, in a `messages` object, with `{placeholders}` (`docs/i18n.md`, section 3).
- Every count goes through one plural message that contains the number [mi] 6 rule R2.
- A `one` form never contains a literal "1". Russian uses `one` for 21 [mi] 5.3.
- Zero is a state with its own message, never a plural form. Portuguese and French put 0 in `one` [mi] 5.3.
- Durations, weekday names and language names come from `Intl`, not from the catalog [mi] 6 rule R5.
- User content inside a message is isolated: a tag that renders `<bdi>` in visible text, FSI and PDI characters in `aria-label` strings [mi] 6 rule R12.
- No em dashes. No idioms. No uppercase styling. Sentence case on buttons and menu items.
- English ships with `one` and `other`. Spanish, Portuguese and French also have `many`. Translators add forms. `plural()` falls back to `other` (`apps/web/src/lib/formatters.ts:144-145`).

`<n>` is a rich-text tag for the big number. `<c>` wraps a course title and renders `<bdi>`. Both use the existing `rich()` helper (`apps/web/src/lib/formatters.ts:153-182`).

### 4.3 App shell

| Key | String | Notes |
| --- | --- | --- |
| `skip` | Skip to main content | First focusable element. Visible on focus. |
| `nav.home` | Home | Was "Decks". |
| `nav.community` | Community | Was "Community Gallery". I did not open `/community`. The owner should confirm the word fits what is there. |
| `nav.account` | Account | Bottom bar item on phones. |
| `accountMenu` | Account menu, {username} | `aria-label`. Unchanged idea. |
| `menu.settings` | Settings | Was "Learning Settings". |
| `menu.plan` | Your plan | Was "Subscription / Plan". |
| `menu.signOut` | Sign out | Was "Sign Out". |
| `theme.legend` | Theme | Group label. |
| `theme.system` | Match my device | Default choice. |
| `theme.light` | Light | |
| `theme.dark` | Dark | |
| `pageTitle` | {page} \| Memli | Document title. `{page}` is "Home" here. Today the title is "Memli" on every route [live] 10. |

### 4.4 Greeting

| Key | String | Notes |
| --- | --- | --- |
| `greeting.named` | Hi, `<c>`{name}`</c>` | The name sits in `<bdi>`. Translators own the comma. |
| `greeting.plain` | Hi | When there is no display name. Never "Hi, " [mi] 5.6. |

### 4.5 Today hero

| Key | String | Plural | State |
| --- | --- | --- | --- |
| `review.count.one` | `<n>`{count}`</n>` word to review | one | review |
| `review.count.other` | `<n>`{count}`</n>` words to review | other | review |
| `review.time` | About {duration} | `{duration}` is `Intl` short unit, "3 min". Translator note: "About" may be dropped or become "Aprox." A long word here breaks the line [mi] 5.4 point 11. | review |
| `review.start` | Start review | | review |
| `review.learnNew.one` | Learn {count} new word | one | review, when the course has new words |
| `review.learnNew.other` | Learn {count} new words | other | |
| `learn.count.one` | `<n>`{count}`</n>` new word to learn | one | learn |
| `learn.count.other` | `<n>`{count}`</n>` new words to learn | other | learn |
| `learn.start` | Start learning | | learn |
| `done.title` | All done for now | "For now", not "for today". At 23:50 "today" is nearly false [mi] 5.11. | caught-up, finished |
| `done.detail` | Your next reviews will show up here. | Anki's done message confuses new users because it does not say what happens next [comp] 3.2. | caught-up, finished |
| `done.learnMore.one` | Learn {count} more new word | one | caught-up |
| `done.learnMore.other` | Learn {count} more new words | other | caught-up |
| `done.learnMoreCost` | Each new word means a few short reviews later. | It states the cost of the action, which COGA asks for [a11y] 11.4. | caught-up |
| `done.practice.one` | Practice {count} tricky word | one | caught-up |
| `done.practice.other` | Practice {count} tricky words | other | caught-up |
| `empty.title` | You have no courses yet | | no-decks |
| `empty.detail` | Pick one to start learning words. | | no-decks |
| `empty.find` | Find a course | Was "Browse community decks". | no-decks |

The course title is data, not a message. It renders inside `<bdi>` on the hero's first line.

### 4.6 Week strip and other courses

| Key | String | Plural | Notes |
| --- | --- | --- | --- |
| `week.heading` | Your week | | `h2`, screen readers only. |
| `week.run.one` | {count} day studied | one | English shows it for 1. |
| `week.run.other` | {count} days in a row | other | |
| `week.runNone` | Your first day starts today. | | Streak is 0. A state, not a plural. No "0 days", no loss wording [a11y] 9.3. |
| `week.day.done` | {day}, goal reached | | Screen readers only. `{day}` is the long weekday from `Intl`. |
| `week.day.today` | {day}, today | | |
| `week.day.todayDone` | {day}, today, goal reached | | |
| `week.day.plain` | {day} | | A past day that did not reach the goal. No "missed" [a11y] 8.3. |
| (visible labels) | Sat, Sun, Mon... | | `weekday(date, "short")` from `Intl`. Today they are single letters with two S and two T [code] 8.4. |
| `courses.heading` | Other courses | | Was "Other decks". |
| `courses.review.one` | {count} to review | one | Was "{count} due". |
| `courses.review.other` | {count} to review | other | |
| `courses.new.one` | {count} new word | one | Was "{count} new". |
| `courses.new.other` | {count} new words | other | |
| `courses.done` | All done | | Was "Caught up". Shown with a check icon. |
| `courses.reviewAction` | Review | | Verb. Translator note: this is the button, not a heading [mi] 6 rule R8. |
| `courses.reviewLabel.one` | Review {count} word in {course} | one | `aria-label`. It starts with the visible label (WCAG 2.5.3). `{course}` is wrapped in FSI and PDI. |
| `courses.reviewLabel.other` | Review {count} words in {course} | other | |
| `courses.learnAction` | Learn | | |
| `courses.learnLabel.one` | Learn {count} new word in {course} | one | `aria-label`. |
| `courses.learnLabel.other` | Learn {count} new words in {course} | other | |
| `courses.more.one` | Show {count} more course | one | Disclosure label in the many-courses state. |
| `courses.more.other` | Show {count} more courses | other | |
| `filter.label` | Language | | Was "Studying", which reads like a status [code] 8.4. |
| `filter.all` | All languages | | |
| (language names) | Spanish, Japanese... | | `Intl.DisplayNames`. First letter upper-cased with `toLocaleUpperCase(uiLocale)`, because Spanish, Portuguese and French return lowercase [mi] 5.4 point 6. |

### 4.7 "Your progress" disclosure, and parked strings

| Key | String | Plural | Notes |
| --- | --- | --- | --- |
| `progress.heading` | Your progress | | The disclosure's label. It says what is inside [comp] 4. |
| `progress.goal.one` | {done} of {target} word today | one, keyed on `{target}` | |
| `progress.goal.other` | {done} of {target} words today | other | One message. Today "24" and "of 50" are two fragments [mi] 7.1. |
| `progress.left.one` | {count} to go | one | It does the subtraction for the reader, which COGA asks for [a11y] 4, pattern 4.7.5. |
| `progress.left.other` | {count} to go | other | |
| `progress.goalMet` | You reached today's goal. | | Replaces the two lines above. |
| `progress.goalCleared` | You finished everything for today. | | When the queue was cleared below the target. |
| `progress.learned.one` | {count} word learned | one | |
| `progress.learned.other` | {count} words learned | other | |
| `progress.tricky.one` | {count} tricky word | one | Was "{count} word keeps slipping". |
| `progress.tricky.other` | {count} tricky words | other | |
| `progress.trickyHint` | A new memory trick can help. | | Was "You've forgotten these a few times. A new mnemonic can help them stick." "Forgotten" points at the learner [a11y] 11.2 row 39. |

Parked for the future Progress page (not on the dashboard):

| String | Replaces |
| --- | --- |
| You remembered {percent} of your reviews this month. | RETENTION 84% |
| {count} new words this month (with a `one` form) | NEW CARDS 142, Added this month |
| (cut) | CONSISTENCY, "+2% from last week", "Global average: 75%" |

I did not check which time window `retentionPercent` covers. Confirm "this month" against the data before using that string.

### 4.8 Word counts, before and after

Before figures are measured. After figures are my hand count of the strings above with the default seed data. Allow plus or minus 3.

| Region | Before (visible words) | After | After, how |
| --- | --- | --- | --- |
| Greeting | 13 [a11y] 11.3 | 2 | Hi, Phillip |
| Language filter | 7 | 0 | Not shown with 4 courses |
| Hero (Today plus Continue learning) | about 60 | 16 | Spanish Core 1000 (3), 16 words to review (4), About 3 min (3), Start review (2), Learn 10 new words (4) |
| Week | about 32 | 12 | 7 weekday labels, "12 days in a row" (5) |
| Other courses | about 41 | 21 | Heading (2), three rows (8, 7, 4) |
| Tricky words | 25 | 0 | Inside the closed disclosure |
| Trends | 20 | 0 | Moved to the Progress page |
| "Your progress" label | 0 | 2 | |
| **Total in `main`** | **192 visible, 217 with screen-reader text** [live] 0 | **53** | 73 with the disclosure open |

| Other counts, default state | Before | After |
| --- | --- | --- |
| Words on the first phone screen | 53 in `main` at 375 x 812 [live] 3.1 | 18 in `main` at 375 x 550. 22 with the logo word and three bar labels. |
| Words in the hero | about 60 | 16 (target was 25 or fewer [a11y] 10 D11) |
| Headings | 12 [code] 2.2 | 5: greeting, the count, "Your week" (hidden), "Other courses", "Your progress" |
| Metric numbers | 31, about 9 of them repeats [code] 3 | 6: 16, 3, 10, 12, 8, 10. None repeated. |
| Controls in `main` | 9 | 5: Start review, Learn 10 new words, Review, Learn, Your progress |
| Full-sentence helper copy | 4 sentences, 35 words [code] 2.2 | 0 on the default screen |
| Text runs in muted gray | 38 of 84 [code] 4.1 | 0 |
| Font size and weight pairs | 15 [code] 4.4 | 7 |
| English words in the dashboard and shell catalogs, all states | about 345 [mi] 5.12 | about 230 (hand count) |

The estimate for 16 reviews is 3 minutes: `estimateMinutes(16)` is `ceil(16 x 8 / 60)` (`-components/dashboard-model.ts:5-12`).

---

## 5. Color and theme

### 5.1 The decision

I take the color research's token set as is, with **option B: warm amber on a navy hero** [color] 8.5. No value is changed.

Why it fits this design in particular:

- Calm Focus spends color in one place. Option B gives that place the same job in both themes: amber fill against the hero is 9.18:1 in light and 8.30:1 in dark [color] 8.1.
- Blue cannot do it. Blue on the navy hero is 2.11:1 in light, and there is no good blue for dark mode [color] 8.2, [live] 5.2.
- It matches what Woodson and Karen chose. Example-02's button measures `oklch(0.894 0.132 90)`. The dark `--cta` is `oklch(0.89 0.15 92)` [color] 8.3.
- Dark ink on amber is 11.59:1 in light and 13.98:1 in dark. That is the kind of label Karen can read [color] 5.2 #26.
- Under simulated color-vision deficiency the button stays at 7.25:1 or better against the hero [color] 5.4.

### 5.2 Token map

All values are from [color] 4.2. "V#" is the row in the verified pairing table [color] 5.2 (same row number in the light and dark tables).

**Surfaces**

| Surface | Token | Light | Dark |
| --- | --- | --- | --- |
| Page | `--background` | `oklch(0.965 0.008 264)` #f1f3f9 | `oklch(0.195 0.045 266)` #0b1429 |
| Sidebar, top bar, bottom bar | `--sidebar` | `oklch(0.985 0.004 264)` #f9fafd | `oklch(0.16 0.038 266)` #060c1d |
| Week strip, course rows, progress panel | `--card` | `oklch(1 0 0)` #ffffff | `oklch(0.25 0.05 266)` #16213a |
| Menus (account, language) | `--popover` | `oklch(1 0 0)` | `oklch(0.295 0.053 266)` #202c47 |
| **Hero** | `--hero` | `oklch(0.29 0.105 267)` #14255f | `oklch(0.35 0.12 266)` #1d3478 |
| Quiet button and check circle on the hero | `--hero-chip` | #2e4175 | #374f8b |
| Done day circle, selected theme row, active nav item | `--accent` | `oklch(0.94 0.028 262)` #e1ecff | `oklch(0.34 0.055 266)` #2a3755 |
| Progress bar track | `--viz-track` | `oklch(0.94 0.012 264)` #e7ebf3 | `oklch(0.295 0.053 266)` #202c47 |

**Text**

| Text | Token | On | Light | Dark | Verified |
| --- | --- | --- | --- | --- | --- |
| Greeting, row titles, numbers | `--foreground-strong` | page, card | 16.37:1, 18.16:1 | 17.55:1, 15.33:1 | V1, V2 |
| All other text on neutral surfaces | `--foreground` | page, card, sidebar | 11.04:1 to 12.25:1, Lc 90.8 to 97.9 | 13.39:1 to 16.30:1, Lc 92.3 to 94.4 | V3 to V5 |
| Course name, count, label on the hero | `--hero-foreground` | hero | 13.78:1, Lc 100.5 | 11.09:1, Lc 96.7 | V18 |
| "About 3 min", done-state detail | `--hero-muted-foreground` | hero | 10.37:1, Lc 80.6 | 9.72:1, Lc 87.0 | V19 |
| Quiet button label on the hero | `--hero-foreground` | hero-chip | 9.45:1, Lc 93.6 | 7.58:1, Lc 88.7 | V20 |
| Selected theme row, active nav label, check glyph in a done day | `--accent-foreground` | accent | 7.54:1, Lc 77.9 | 8.52:1, Lc 77.5 | V13 |
| `--muted-foreground` | **not used on the dashboard** | | | | |

Why no muted gray. Muted text is Lc 72 to 84, and the color research says to use it only from 15 to 16 px upward, never at 12 px [color] 5.3. Small and gray at once is the combination that disappears [color] 5.3. With 53 words on the page, size and weight are enough to rank them. This is also what the two chosen examples did: their dimmest text is 13:1 or better [fb] 3.

**Actions**

| Action | Tokens | Light | Dark | Verified |
| --- | --- | --- | --- | --- |
| The one main button: fill | `--cta` | `oklch(0.855 0.17 88)` #fec71d | `oklch(0.89 0.15 92)` #fed756 | fill vs hero 9.18:1 / 8.30:1, V29 |
| Its label | `--cta-foreground` | #0d1529 | #060c1d | 11.59:1, Lc 76.9 / 13.98:1, Lc 84.3, V26 |
| Hover | `--cta-hover` | #fed756 | #fee58f | V27, V30 |
| Pressed | `--cta-active` | #f5b005 | #fec71d | V28 |
| Its 3 px lower edge | `--cta-edge` | #b36300 | #db8903 | See 5.3 |
| Quiet button on the hero | `--hero-chip` fill, `--hero-foreground` label | | | V20 |
| Row buttons "Review", "Learn" | `--card` fill, `--border-strong` edge, `--foreground-strong` label | edge 3.66:1 | edge 4.37:1 | V49, V2 |
| Focus ring, neutral surfaces | `--ring`, 2 px solid, 2 px offset | 6.16:1 to 6.83:1 | 9.16:1 to 11.16:1 | V44 to V46 |
| Focus ring on the hero | `--hero-ring` | 13.78:1 | 11.09:1 | V47 |

**Status and data**

| Thing | Tokens | Verified |
| --- | --- | --- |
| Done day: tinted circle, 2 px edge, check glyph | `--accent` fill, `--brand` edge, `--accent-foreground` glyph | edge vs card V14 (6.83:1 / 9.16:1), glyph V13 |
| Today: empty circle with a 3 px edge | `--brand` | V14 |
| Other past day: empty circle with a 2 px edge | `--border-strong` | V49 |
| Flame icon beside "12 days in a row" | `--streak` | 3.90:1 / 7.66:1, V69 |
| Goal bar fill on its track | `--viz-progress` on `--viz-track` | 5.72:1 / 5.74:1, V76 |
| Goal bar track outline | `--border-strong`, 1 px | See 5.3 |
| "All done" in a row | `--foreground` text plus a check icon. No green. | V4 |

No green or red appears on the dashboard. Green keeps its meaning of "correct answer" for the study session [color] 7.2.

### 5.3 Pairings this design adds that the color research did not gate

I computed these with the color research's own library (`color/lib.mjs`: culori and apca-w3) from its verified hex values. The script is `design/extra-pairs.mjs` beside this file. They are not part of the research's 134 gated pairings, so they **need to be added to `verify.mjs` and re-run**.

| Pairing | Light | Dark | Role | Verdict |
| --- | --- | --- | --- | --- |
| `--cta-edge` against `--hero` | 3.22:1 | 4.18:1 | Depth cue under the button | Passes 3:1. Decorative anyway, since the label identifies the button. |
| `--hero-chip` against `--hero` | 1.46:1 | 1.46:1 | Shape of the quiet button | Faint on purpose. The label is 9.45:1 / 7.58:1. WCAG does not require a boundary on a labelled button [color] 3.3. See trade-offs. |
| `--brand` against `--accent` | 5.74:1 | 6.77:1 | Edge of a done day against its own fill | Passes 3:1. |
| `--accent` against `--card` | 1.19:1 | 1.35:1 | Fill of a done day | Decorative. The check glyph and the edge carry the state. |
| `--border-strong` against `--viz-track` | 3.06:1 | 3.79:1 | Outline of the goal bar track | Passes 3:1, narrowly in light. |
| `--hero-muted-foreground` against `--hero-chip` | 7.11:1, Lc 73.7 | 6.65:1, Lc 79.1 | Not used. Recorded so nobody uses it for small text. | Under Lc 75 in light. Keep `--hero-foreground` on chips. |

Also not verified: the shadow values in section 6.3. They are untuned starting points from the Refactoring UI research.

### 5.4 Where the theme control lives

One component, `ThemeChoice`, used in three places with the same label, options and order (WCAG 3.2.3, 3.2.4) [a11y] 7.3.

| Screen | Place | How |
| --- | --- | --- |
| Desktop, `lg` and up | The foot of the sidebar, above the account button | Always visible. A `fieldset` with the legend "Theme" and three radio rows, each 44 px tall, with an icon and a word. This is the bottom-left area Crystal circled [fb] 8 circle D. The sidebar has about 650 px of unused height there [code] 6.1. |
| Phone and tablet, below `lg` | First group inside the Account menu, opened from the bottom bar | One tap, then choose. |
| `/settings` | The same control with one sentence of help | The expected long-term home. |

Behavior, all from the accessibility research's specification [a11y] 7:

- Three choices always shown as three. Not a button that cycles.
- Default is "Match my device". Today `main.tsx:25` forces light and ignores the device [code] 5.
- Real radio semantics. Tab enters once, arrow keys move.
- The selected row shows a filled dot and a check, plus `bg-accent`. Not a tint alone.
- The existing storage key `theme` and the `light` and `dark` class names stay. The axe specs depend on them [code] 5.
- A small inline script in `<head>` sets the class before first paint. Add `<meta name="color-scheme" content="light dark">`, CSS `color-scheme` per theme, and a `theme-color` meta set to the two `--background` values, #f1f3f9 and #0b1429 [color] 6.4.
- `prefers-contrast: more` and forced colors get the small overrides in [color] 6.7 and [a11y] 7.5.

Why default to the device and not to dark, even though dark won half the vote. People with normal vision read slightly better in light. People with cloudy ocular media read faster in dark. NN/g recommends following the device and letting people switch [a11y] 2.3.

### 5.5 Dark mode is its own design

It is not the light theme inverted [color] 3.5.

| Rule | Light | Dark |
| --- | --- | --- |
| What separates surfaces | A shadow on the hero and cards, plus a real 1 px border | Lightness steps: sidebar 0.16, page 0.195, card 0.25, menu 0.295, hero 0.35 [color] 4.2. Shadows are invisible on navy. |
| What makes the hero special | It is the darkest large shape (L 0.29 on a 0.965 page) | It is the most colorful shape (chroma 0.12 against 0.045 to 0.05) |
| Why it reads navy, not black | | Chroma 0.045 to 0.058 on surfaces. Today's dark page has 0.025, half of example-02's [color] 2.4. |
| Button | amber.400 | amber.300, lighter and less saturated, so it does not vibrate on navy [color] 4.2 |
| Secondary text | not used | not used. Today's dark muted text is Lc 43 to 46 and would need 42 px type to pass [color] 5.3. |
| Day circles and bar | Darker means more | Lighter means more. The order flips by token, not by hand [color] 7.5. |

### 5.6 The 60-30-10 check

The rule has no authoritative source. Treat it as a sanity check [color] 7.1. Areas below are my estimates from the wireframes.

| Share | Role | Desktop 1280 x 800 | Phone first screen 375 x 550 |
| --- | --- | --- | --- |
| Dominant | Neutral page, sidebar, cards | about 84% | about 41% |
| Structure | The navy hero. Blue edges on the day circles. | about 15% (hero 704 x 228) | about 51% (hero 343 x 308) |
| Accent | The amber button. The flame icon. | about 1.6% (288 x 56) | about 8% (303 x 56) |

The phone first screen is more than half navy. That is intended. It is close to what Karen described: a dark field where "the writing pops up" [fb] 2. The real test is simpler than the ratio: squint at a screenshot. If more than one amber shape is visible, something is wrong [color] 7.1.

---

## 6. Type, spacing, depth

### 6.1 Type scale

Five sizes. Two weights, plus bold for the one number. Seven size and weight pairs, down from 15 [code] 4.4. One family, Inter Variable, as today.

| Size | Weight | Line height | Used for |
| --- | --- | --- | --- |
| **60 px** (72 px when the hero's container is 576 px or wider) | 700 | 1.0, tracking -0.03em | The hero count. Nothing else, ever. |
| 24 px | 600 | 1.25 | The hero headline in states with no count: "All done for now", "You have no courses yet" |
| 18 px | 600 | 1.35 | Greeting. Course name in the hero. The label under the count. The main button's label. |
| 18 px | 400 | 1.35 | "About 3 min". Supporting line in the hero. |
| 16 px | 600 | 1.5 | Row titles. Row statuses that need action ("8 to review"). Quiet and row buttons. "12 days in a row". "Your progress". |
| 16 px | 400 | 1.5 | Every sentence. Other statuses ("All done"). Menu rows. |
| 14 px | 600 | 1.45 | The "Other courses" label. Weekday labels. Bottom bar labels. Nothing that is a sentence. |

Rules:

- **Nothing under 14 px.** Today 22 of 84 text runs are 12 px [code] 4.4. NN/g's guidance for older adults is 16 px [a11y] 0 item 2.
- **Every sentence is 16 px or larger.**
- The count is more than three times the next size. Today eight things on the first screen are bold and 20 px or larger [rui] 3.1.
- Weight 500 is not used. Weights 500 and 600 at one size are hard to tell apart [rui] 3.2.
- Tracking follows size, not tag. Remove the `h1` and `h2` letter-spacing rules at `packages/ui/src/styles/globals.css:161-166`. Negative tracking breaks connected scripts such as Arabic [mi] 5.8.
- Remove the global `p { line-height: 1.65 }` at `globals.css:167-169` or scope it to long-form text [rui] 5.5.
- The 14 px labels use `--foreground` at weight 600. The strict APCA lookup asks for 14 to 14.5 px at that weight and contrast [color] 5.3, so this is at the limit. Do not go smaller or lighter.
- Sizes are stepped `rem` values switched by container width. No `clamp()` with viewport units, which can stop text growing under zoom [mi] 3.7.
- The count stands alone on its line. "32 palabras" at 60 px is 345 px wide and does not fit a phone [mi] 7.4.

### 6.2 Spacing

Seven steps. Each has one job [rui] 8.2.

| Step | Job |
| --- | --- |
| 4 px | Circle to its weekday label. Icon to its word. |
| 8 px | Between the two hero buttons. Between course rows. |
| 12 px | A label to the thing it labels ("Other courses" to its list). Greeting to hero. |
| 16 px | Phone gutter. Padding inside cards. Hero to week strip, because they are one thought: today, then this week. |
| 24 px | Hero text block to its buttons (20 on phones). |
| 32 px | Hero padding on wide layouts. Tablet gutter. Section to section on phones. |
| 48 px | Section to section on desktop. |

Space between sections is three to four times the space between a label and its content, so groups read as groups [rui] 4.6. Today one 32 px gap is used between everything [rui] 0.

Control heights are a separate short list: 56 px for the main button, 48 px for bottom bar items and the disclosure row, 44 px for every other button and menu row. Today chips, the hamburger, row buttons and menu rows are 32 to 36 px [live] 4.

### 6.3 Depth, borders, radius

| Element | Light | Dark |
| --- | --- | --- |
| Hero | No border. Shadow level 2. | No shadow. Lightness and chroma do the work. |
| Week strip, course rows, progress panel | White on the L 0.965 page (1.11:1), a real 1 px `--border` (1.49:1), shadow level 1 | Card on page (1.15:1) with a 1 px `--border` (1.73:1) [color] 5.2 #52, #54 |
| Main button | 3 px lower edge in `--cta-edge`. Hover: lighter fill. Pressed: moves down 2 px and the edge shrinks to 1 px. | Same recipe, dark tokens |
| Row buttons | 1 px `--border-strong` | Same |
| Sidebar, bars | A background step only. No border line. | Same |
| Row dividers | None. Rows are separate cards 8 px apart. | Same |

- Shadows use the two-part recipe from the Refactoring UI research: a tight one for the contact edge and a soft one for the cast shadow, tinted with the neutral hue [rui] 8.3. Its values are untuned. Tune them in the browser.
- Use a real `border`, not `ring`. A ring is a `box-shadow`, and forced-colors mode removes box shadows, so cards would lose their edges [a11y] 7.5.
- The main button keeps the base class's `border border-transparent` (`packages/ui/src/components/button.tsx:8`). In forced colors that border becomes its visible outline [color] 6.7.
- The main button is the only element with a hard lower edge. That, plus being the only amber shape, is the owner's "solid primary with depth" [color] 7.6. Today it is flat and gets paler on hover [live] 6.4.
- Line count on the first screen drops from about fourteen faint lines [rui] 9.7 to the outlines of the strip card and the rows.

Radius: three values. 8 px for controls (`rounded-lg`). About 11 px for cards and rows (`rounded-xl`). About 14 px for the hero and the main button (`rounded-2xl`). Circles are full. Today five radius values are in use [code] 4.5.

---

## 7. Component plan

Paths are relative to `dev/memli/`. Rules followed: semantic tokens only, Base UI primitives, shadcn components copied by hand (`.cursor/rules/shadcn-components.mdc`), `messages` objects, discriminated unions for state (`.cursor/rules/react-state.mdc`), `Intl` formatters, and no unused exports (Knip runs in CI).

### 7.1 Existing files

| File | Verdict | What happens |
| --- | --- | --- |
| `-components/TodayPanel.tsx` | **Merge and rename** to `TodayHero.tsx` | One component with an exhaustive `switch` over `TodayState["status"]`: `review`, `learn`, `caught-up`, `no-decks`. Same union as today (`dashboard-model.ts:73-83`). The count comes from `state.focusDeck.dueCount`, not `state.dueCount`, so the headline equals what the button opens. The number and its words become one `rich()` plural message. Deck chips, "Starts in", and the "TODAY" label are deleted. |
| `-components/FocusDeckCard.tsx` | **Remove** | Its job moves into `TodayHero`. Mastery bar and legend wait for the course page. Delete the file so Knip stays clean. |
| `-components/DeckList.tsx` | **Restyle and rename** to `CourseList.tsx` | Rows become: title, one status, one 44 px outline button. No badge, no "Last studied", no mini bar. It receives the courses without the hero's course. First 3 rows, then a native `<details>` for the rest. Keep the row's container query. The button's link stretches over the whole row with a pseudo-element, so the row is one big target while the link's name stays "Review 8 words in ...". |
| `-components/ThisWeek.tsx` | **Split and rename** to `WeekStrip.tsx` | Keeps the day marks and the run sentence. The goal ring, "Daily goal", the goal sentence and "Words mastered" leave. Goal text moves to `ProgressDetails`. Circles use `--accent`, `--brand`, `--border-strong`, never `bg-primary`. |
| `-components/MemoryCallout.tsx` | **Remove** | One line in `ProgressDetails` replaces it. The word chips are deleted. Keep the `lang` rule wherever learning-language words appear again. |
| `-components/ProgressTrends.tsx` | **Remove from the dashboard** | Delete the file. Its copy for the future Progress page is recorded in section 4.7. `ProgressTrendsData` stays in the data contract for #112. |
| `-components/LanguageFilter.tsx` | **Restyle** | From a chip row to one menu trigger in the `CourseList` header: "Language: All languages". Items are links that write `?studying=`, with `aria-current` and a check on the current one. Rendered only when there are more than 5 other courses and 2 or more languages. Links, not a `<select>` that navigates on change (WCAG 3.2.2) [a11y] 3. |
| `-components/DashboardGreeting.tsx` | **Keep, simplify** | One `h1`. Two messages. Props shrink to `name`. The status sentence, the three time-of-day strings and the hour logic are deleted. |
| `-components/AppSidebar.tsx` | **Restyle** | Labels change (Home, Community, Settings, Your plan, Sign out). "View Profile" is removed. The sidebar appears from `lg`, not `md`. Below `lg`: a top bar with the logo, and a bottom bar with Home, Community, Account. One `<nav aria-label="Primary">` restyled by breakpoint, so screen readers never meet two [mi] 4.5. `ThemeChoice` sits in the sidebar foot and in `AccountMenuItems`. The hamburger and its `useState` go. Physical classes become logical (`md:border-r`, `text-left`) [mi] 2.4. |
| `-components/LanguageBadge.tsx`, `LastStudied.tsx` | **Remove if unused** | The dashboard no longer imports them. Delete them if Knip reports no other user. I did not check the session routes for imports. |
| `-components/dashboard-model.ts` | **Keep** | `todayState`, `sortDecks`, `selectFocusDeck`, `deckAction`, `estimateMinutes`, `learningLanguages` and `weekDays` are reused unchanged. See 7.3 for the small changes. |
| `-components/dashboard-metrics.ts` | **Keep unchanged** | The data contract does not change. |
| `-components/dashboard-previews.ts`, `PreviewSwitcher.tsx` | **Keep** | All 11 previews stay. Section 3.5 says what each should show. |
| `apps/web/src/routes/_app/dashboard.tsx` | **Restyle** | One column: greeting, hero, week strip, course list, progress. The two-column grid at `:131` and the `aside` go. DOM order equals visual order at every width. Set the document title. |
| `apps/web/src/routes/_app.tsx` | **Edit** | Add the skip link and `id="main"` on `<main>`. Add `scroll-padding-bottom` for the sticky bottom bar. |

### 7.2 New pieces

| New | Where | Notes |
| --- | --- | --- |
| `TodayHero.tsx` | `-components/` | Described above. Root has the class that sets `--hero-ring` as the focus color for everything inside it. |
| `WeekStrip.tsx` | `-components/` | An `ol` of seven days plus one sentence. Each day has hidden text. The graphic is not interactive. |
| `CourseList.tsx` | `-components/` | Described above. |
| `ProgressDetails.tsx` | `-components/` | A native `<details>` with the `h2` inside its `<summary>`. No React state. The summary row is 48 px tall and fully tappable [mi] 4.4. Goal state is a small discriminated union: `in-progress`, `met`, `cleared`. |
| `ThemeChoice` | `apps/web/src/components/theme-choice.tsx` | Calls the existing `useTheme()` (`theme-provider.tsx:210`), which nothing calls today [code] 5. Radio group. |
| `radio-group.tsx` | `packages/ui/src/components/` | shadcn's Base UI radio group, **copied by hand** from the Manual tab. Replace the `cn` import. No built-in English. |
| Button `variant="cta"` | `packages/ui/src/components/button.tsx` | `bg-cta text-cta-foreground hover:bg-cta-hover active:bg-cta-active` plus the edge shadow. |
| Button `size="hero"` and `size="touch"` | same file | `hero`: min-height 56 px, 18px/600, `rounded-2xl`, text may wrap. `touch`: min-height 44 px, 16px/600. These replace the three hand-written height overrides [code] 0 item 3. |
| Button base fixes | same file | Drop `whitespace-nowrap` for text sizes and use `min-h-*`, so translated labels wrap instead of overflowing. A Spanish label overflowed at 320 px [mi] 2.3. Replace the 50% alpha focus ring (2.4:1) with a 2 px solid outline [color] 4.3. Replace `hover:bg-primary/80` with a `--primary-hover` token. |
| Tokens | `packages/ui/src/styles/globals.css` | The three-tier file from [color] appendix A. Fix the dark variant to `(&:where(.dark, .dark *))`. Delete the wrong hex comments [code] 0 item 10. |
| Theme plumbing | `apps/web/index.html`, `apps/web/src/main.tsx`, `apps/web/src/components/theme-provider.tsx` | Pre-paint script. `color-scheme` and `theme-color` metas. `viewport-fit=cover` for the bottom bar's safe-area padding. `defaultTheme="system"`. Remove the `d` key handler. |

### 7.3 Small model changes

| Change | Why | Size |
| --- | --- | --- |
| Call `weekDays(now, now.getDay() + 1, days, target, clearedToday)` | With that first-day argument the existing function returns the seven days that end today. No change to the function. I checked the arithmetic at `dashboard-model.ts:205-207`: the offset becomes 6. | One call site |
| Add `totalLearned(decks)`: sum of `masteredCount + learningCount` | For "{count} words learned". | 3 lines plus a test |
| Remove `totalMastered`, `masteredRatio`, `deckTotal`, `todayPrimaryAction`, `isSameAction` if Knip reports them unused | Their only callers were the focus card, the mini bars and the ring. | Deletions |
| Stop passing `firstDayOfWeek` from `useFormatters()` to the week component | The rolling week needs no first-day rule. Keep the formatter itself if other code uses it. | One prop |

State rules check:

- No new `useState` is needed. Both disclosures are native `<details>`. The filter is a URL search param, which the rules assign to TanStack Router. The theme lives in the existing provider. The account and language menus are Base UI menus.
- No pure logic with a lifecycle is added, so nothing new goes into `packages/core`.
- Every count goes through `plural()` or `rich()`. Every weekday, duration and language name goes through `useFormatters()`.

### 7.4 Build order

1. Tokens, the Button variants and sizes, and the focus ring. The current page already looks different after this step.
2. Theme plumbing and `ThemeChoice`. This closes problem 3 by itself.
3. `TodayHero` on the `one-deck` and `no-decks` previews first, at 375 px. Start with the feature, not the layout [rui] 2.1.
4. `WeekStrip`, `CourseList`, `ProgressDetails`, then the one-column route.
5. The app shell: labels, bottom bar, breakpoint.
6. Update `apps/web/e2e/dashboard.a11y.spec.ts` for the renamed landmarks. Add the pseudo-localization runs [mi] 8.

---

## 8. Accessibility and i18n notes for this design

### 8.1 What gets better

| Topic | Before | After |
| --- | --- | --- |
| Bypass blocks (2.4.1) | No skip link [live] 8 | "Skip to main content" is the first focusable element. |
| Focus order (2.4.3) | The main action is tab stop 10 on desktop and 9 on phones [live] 8 | It is the first stop inside `main`. |
| Focus visible (2.4.7, 1.4.11) | The ring is 2.37:1 on the main button [live] 6.3 | A 2 px solid outline: 13.78:1 on the hero in light, 11.09:1 in dark. |
| Character key shortcuts (2.1.4) | `d` toggles the theme anywhere | Removed. No single-key shortcuts on the dashboard. |
| Name, role (4.1.2) | Navigation links are announced as buttons (`role="button"` on `<a>`) [code] 9 | Links that navigate are links. Only the disclosures and menu triggers are buttons. |
| Page titled (2.4.2) | "Memli" on every route | "Home \| Memli". |
| Use of color (1.4.1) | Mastery legend is two blues | The legend is gone. Day states differ by shape: check in a filled circle, thick ring, thin ring. A grayscale screenshot loses nothing. |
| Text size | 67 of 94 text elements are 14 px or smaller on a phone [a11y] 0 item 2 | Sentences are 16 px or more. Only labels are 14 px, in the strongest text color. |
| Target size (2.5.8) | 24 px met, most targets 32 to 36 px [live] 4 | 44 px or more for everything a learner taps. 56 px for the main button. |
| Streak ethics | The streak is the reason to study, in the `h1` block | It is one quiet sentence. No "missed" label, no zero, no loss wording [a11y] 9.3. |
| Headings (2.4.6) | "Continue learning" heads a card with nothing to press | Every heading has something under it. |

Reading order for a screen reader in the hero: course name, "16 words to review" (the `h2`), "About 3 min", "Start review" link. That is the order the accessibility research asks for [a11y] 10 D49.

### 8.2 Risks this design introduces

| Risk | Why it is a risk | Guard |
| --- | --- | --- |
| **Sticky bottom bar hides the focused element** | WCAG 2.4.11. A sticky footer is the usual cause [mi] 3.5. | `scroll-padding-bottom` equal to the bar height plus the safe-area inset. The bar is sticky only when the viewport is at least 480 px tall. It is absent on `/study/$courseId`, where the keyboard would cover it [mi] 4.5. Tab through the whole page at 375 px to check. |
| **Tab order of the bottom bar** | It is visually last but is the same `<nav>` as the sidebar, which comes before `main` in the DOM. Tab order then visits the bar before the hero on phones. | Accept it: 3 stops, and the skip link jumps past them. Do not reorder with CSS `order` (WCAG 1.3.2) [a11y] 3. |
| **Content hidden in a disclosure** | People may not find today's goal. Hidden features look unused [mem] 5.2. | Native `<details>`: a real button for assistive technology, and Chromium's find-in-page opens it (from the mobile research's own knowledge, not fetched) [mi] 4.4. The label says what is inside. Never hide the only route to an action there. |
| **A big number without its noun** | A bare "16" means nothing to a screen reader or a translator. | The number and words are one `rich()` message inside one `h2` [mi] 7.2. |
| **The day row carries meaning by shape** | Shapes must be 3:1 to count. | Edges use `--brand` and `--border-strong` (3.66:1 or better, verified). Each day has hidden text. The visible sentence states the run. |
| **Light text on a dark hero, even in the light theme** | People with normal vision read slightly better with dark text on light, and the gap grows as text gets smaller [a11y] 2.3. | All hero text is 16 px or larger, and Lc 80 or higher (verified). The amber button's label is dark on light. No text sits on a photo. |
| **Forced colors** | The navy hero and amber fill are replaced by system colors. The hero loses its fill. | The hero gets a transparent 1 px border, which forced colors paints. The button keeps its transparent border. Not tested in a browser. |
| **Reduced motion** | The check animation and button press move. | Wrap transforms in `motion-safe:`. With reduced motion, show the final state at once [a11y] 3. Nothing loops. |
| **The hero is not a banner** | People ignore things styled like ads [a11y] 2.4. | It sits in the main column, top, with no illustration-only content and no "upgrade" look. |

### 8.3 i18n notes

| Topic | This design | Evidence |
| --- | --- | --- |
| Text growth above the button | Five short strings sit above the button. In pseudo-localized text the old page pushed the button from y = 581 to y = 851. | [mi] 2.3 |
| Short labels grow most | "Review" to "Repasar" is +17%. "Learn" to "Aprender" is +60%. Row buttons have a minimum width, not a fixed one, and may wrap. | [mi] 5.2 |
| Weekday labels | `Intl` short names in seven cells. At 375 px each cell is about 44 px. At 320 px each is about 35 px, and "Wed" at 14 px is about 28 px wide. German "Mo" and Spanish "lun" fit. Portuguese "seg." is tight. If a locale's short form overflows, fall back to `narrow` by container width. | Estimate. Needs the pseudo-localization run P2 [mi] 8.2. |
| No first-day-of-week rule | The row is the last seven days, with today at the end. `es-419` starts weeks on Monday and `es-MX` on Sunday, and a bare `en` assumes the United States. A rolling week avoids the question. | [mi] 5.4 points 8, 9 |
| The count in Arabic and Hebrew | These languages can drop the digit for 1 and 2. Because the number is a tag inside the message, a translator can leave `<n>` out. Then the phrase renders with no giant numeral. Decide what that state looks like before adding either locale. | [mi] 7.1 |
| Non-Latin digits | `ar-EG` and `fa` digits are not in Inter, so the giant numeral changes typeface. Test it. | [mi] 5.8 |
| Course titles and names | Wrapped in `<bdi>`, or FSI and PDI inside `aria-label`. | [mi] 5.7 |
| Gender and address | No string addresses the learner with a gendered word. "Hi" needs no gender. Spanish `tú` forms, no `vos` or `vosotros`. | [mi] 5.6 |
| Adjectives as labels | "{count} new words" keeps the noun, so "new" has something to agree with. | [mi] 5.6 |
| RTL | Logical properties only. The arrow in "Start review" mirrors. The check marks do not. | [mi] 5.7 |
| Day boundary | "All done for now" and "Your next reviews will show up here." avoid the word "today". | [mi] 5.11 |
| Translation cost | About 230 English words across all states, down from about 345. | Hand count against [mi] 5.12 |
| `<html lang>` | Still hard-coded to `en`. It must follow `uiLocale`. Not part of this redesign, but the hero's giant numeral makes font fallback more visible. | [mi] 9 item 3 |

---

## 9. What is fun about it

The research's finding is that fun and busy are different axes. Fun comes from color, shape, depth and voice. Busy comes from the number of things that compete [fb] 9.1. So the fun goes inside the few things that remain. It does not add boxes.

1. **Navy and amber.** The palette is the one two of four people picked by gut [fb] 2. The amber button on navy is the brightest, warmest shape on the screen in both themes.
2. **A button you want to press.** A 3 px lower edge, a lighter face on hover, and a real push down on press. Old Memrise's buttons had the same raised look, and it is the part of that design worth keeping [mem] 4.3.
3. **One giant number.** 60 to 72 px, alone, like example-05's "32 words". It gets smaller every time you study, and that is satisfying.
4. **Checks that land.** When today's goal is reached, today's circle fills and its check draws in once. On run milestones (7, 30, 100 days) the flame gets one short animation. Duolingo reported a 1.7% gain in day-7 retention from animations on select milestone days, not on every day [comp] 5.1, 5.3. Motion is off under reduced-motion and never loops.
5. **The all-done moment.** The big number is replaced by a big check. This is the reward screen. Today it looks like a notice [rui] 9.4.
6. **Dark mode that feels like a place.** Deep navy with real chroma, not gray-black. Woodson's word was "vibe" [fb] 2.
7. **A warm flame.** One small orange icon beside "12 days in a row". It is the only warm thing outside the button.
8. **A plain, friendly voice.** "Hi, Phillip." "All done for now." "A new memory trick can help."

What is **not** in this version, and I say so plainly: pictures. The two winning examples both have a picture on the main card, and Memli today has none [fb] 6.1. Memli's natural picture is a community mnemonic image, and the data does not have one yet [code] 7.3. The hero is built with room for it: on wide layouts a third zone can hold one image. When it arrives, do not show the mnemonic for a word that is about to be reviewed, because that gives away the answer. That caution is from the competitor research's own prior knowledge of the testing effect and was not fetched [comp] 9.1.

No mascot. A single clip-art owl reads as stock art, and owls carry bad luck in parts of Latin America [comp] 9.4, [mi] 5.10.

---

## 10. Trade-offs and risks

### 10.1 Honest list of trade-offs

| # | Trade-off | What is lost | Why I still chose it |
| --- | --- | --- | --- |
| 1 | The hero counts one course, not all of them | The total ("24 across 2 courses") is never shown. A learner with several courses runs several sessions. | The button can only open one course today [code] 7.3. A headline that disagrees with its button is worse. When a cross-course session exists (`PLAN.md:146`), the hero switches to the total with a one-line change. |
| 2 | Stats live behind a disclosure | Today's goal, words learned and tricky words take a tap to see. | Nobody acts on them to decide what to study. Crystal did say example-01 "had the important information on it", so this is a real cost. |
| 3 | No heatmap yet | Crystal named it. She is the Course Director and asked to see an update. | The contract has 7 days of data [code] 7.3. The 7-day row she also circled is the honest first step. |
| 4 | Rolling 7 days, not Monday to Sunday | It differs from the row Crystal circled in example-05. | On a Monday a calendar week shows one circle and six empty ones. A rolling week always shows the recent run and needs no locale rule. |
| 5 | No amber button in the all-done state | It bends the owner's "strong solid primary" rule on one screen. | There is no main action on that screen. Amber would lie. |
| 6 | The quiet hero button is faint (1.46:1 shape) | A low-vision reader sees its label (9.45:1) more than its shape. | Making it stronger creates a second focal point. If testing shows people miss it, add a 1 px `--hero-foreground` outline at reduced weight and re-verify. |
| 7 | No language badge or language name in rows | A course titled "Core 1000" would not show its language here. | Fewer boxes and words. Seed titles all name their language. Revisit if community titles do not. |
| 8 | The filter is absent with few courses | A learner cannot filter 4 courses by language from the page. | Each row is one tap. `?studying=` still works by URL. |
| 9 | "Hi" instead of "Good evening" | A little warmth. Respondents liked example-02's welcome. | One string, never wrong at 02:00, no hour logic [mi] 5.5. |
| 10 | A 704 px column on a 1920 px screen | Wide margins. Power users of old Memrise complained about "huge white spaces" in its 2021 redesign [mem] 5.2. | Text and targets are not enlarged, only fewer. If it feels empty in testing, add a right column at `xl` that holds the open progress panel. |
| 11 | A bottom bar on phones | 56 px of a 550 px screen, and 3 more visible words. | Two destinations hidden behind a 32 px hamburger is worse [mi] 3.2. |
| 12 | Amber for the action, blue for the brand | The study session's Submit button is still blue. For a while the app has two "main button" looks. | `--primary` stays blue, so nothing else changes until each screen opts in [color] 8.3. Plan a follow-up for the session screen. |
| 13 | "Words" for kana and phrases | Slightly wrong for some courses. | The plainest default. See 4.1. |
| 14 | Removed components | `FocusDeckCard`, `MemoryCallout`, `ProgressTrends` and their tests are deleted, not parked in the tree. | Knip fails on unused exports. Their copy is recorded here and in git history. |

### 10.2 The three biggest risks

**Risk 1. Calm reads as plain, and it loses the gut vote again.**
The four votes rewarded color, depth and imagery, not less content. Example-01 has as many words as Memli today and was called "more fun". The calmest example got no votes [fb] 1. This design bets that one saturated navy and amber hero is enough character without a picture. It may not be. On desktop the page is mostly neutral (about 84%), and the old Memrise and Clozemaster redesigns both drew complaints about big type and empty space [mem] 5.2, [comp] 3.2.
*What would reduce it:* build the hero first and show it to the same four people in light and dark, at full size, before building the rest. Run the five-second and first-click tests from [a11y] 13 on the current page first, for a baseline. Add the mnemonic image zone as soon as the data allows.

**Risk 2. Too much is deferred or hidden for the people who asked.**
Crystal asked for three specific things. Dark mode ships. "Deck" becomes "course". But the "GitHub chart at the top" becomes a 7-day row now and a calendar later. Her Study Tip circle is deferred. The stats she may have meant by "the important information" sit behind a closed label. Mnemonics, which are the product's reason to exist, appear on the home page only as one sentence inside that disclosure. Old Memrise users argued that mems looked unused because the interface buried them, and then they were cut [mem] 5.2, lesson 14.
*What would reduce it:* tell Crystal the plan for the chart in the update she asked for. Treat the hero image zone and the Progress page as the next two issues, not as someday.

**Risk 3. The numbers in this proposal are not yet real.**
Nothing was built. Every height is arithmetic. The 550 px fold comes from secondary sources and no real phone was tested [mi] 11. The color tokens were verified by script but never applied to the running app, and never seen on a real screen, in forced colors, or by a person with a color-vision deficiency [color] 9. Six pairings in section 5.3 are outside the gated set. The shadow values are untuned. The Spanish and Portuguese strings used for width checks are unreviewed drafts [mi] 11. And one hero count per course changes how a multi-course learner experiences the app, which no one has tried.
*What would reduce it:* treat the 72-item definition of done in [a11y] 10 as the gate. In particular D3 (whole hero visible at 375 x 550), D7 (count equals what the button opens), D30 (hero wins in a grayscale screenshot of each theme) and D72 (Karen can read everything on her own device, in the theme she chooses).

---

## Sources

Research files (read in full): the nine files listed at the top of this document. Each of them lists its own external sources with URLs and says which it could open.

Project files read for this proposal:

- `dev/memli/apps/web/src/routes/_app/-components/dashboard-model.ts` (lines 5 to 12, 73 to 132, 185 to 225)
- `dev/memli/apps/web/src/routes/_app/dashboard.tsx`
- `dev/memli/packages/ui/src/components/button.tsx` (lines 7 to 43)
- `dev/memli/apps/web/src/lib/formatters.ts` (lines 55 to 75)
- `dev/memli/apps/web/index.html`
- `dev/memli/.cursor/rules/shadcn-components.mdc`, `react-state.mdc`, `architecture-guardrails.mdc`, `i18n-foundations.mdc`, `product-ux.mdc`
- `docs/designs/dashboards/example-04.png`, `example-05.jpg`
- `scratchpad/redesign/live/shots/default-375x812-light-fold.png` (current phone first screen)
- `scratchpad/redesign/color/preview.png` (static mock of the proposed tokens, both themes)

Script written for this proposal:

- `scratch/design/extra-pairs.mjs` (the six extra pairings in section 5.3)

Not opened by me: example-01, example-02 and example-03, the four desktop screenshots of the current page, Crystal's annotated screenshot, and the component files other than those listed. For those I relied on the research files' descriptions and measurements.

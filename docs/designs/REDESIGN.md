# Dashboard redesign plan

A plan to redesign the Memli dashboard (`/dashboard`) so that one thing leads the eye, the page says less, colors separate clearly, and dark mode is a real, visible choice.

This document replaces the layout and visual decisions in [dashboards/PLAN.md](./dashboards/PLAN.md) (issue #47). The data contract, the model functions and the preview states from that plan stay.

**Tracking issue:** [#151](https://github.com/hereisphil/2606-WDV349-CantuPhillip/issues/151). The issue's task list breaks this plan into one commit per task.

**Status:** decisions settled (section 16), nothing built yet. Every size is arithmetic and every contrast number was computed by script, not measured on the redesigned page. Three reviewers checked this document against the measurements and the code. Section 17 lists what is still unverified.

---

## 1. Summary

### What is wrong today

The four problems are one problem: **nothing on the page is allowed to be more important than anything else.**

| Your complaint | What the measurements show |
| --- | --- |
| Too busy, too much copy | 217 words, 12 headings and 31 numbers in the main area. About 9 of the numbers are repeats. "24" appears twice in large bold type and means two different things. |
| Not enough contrast | Text contrast passes everywhere in light mode. The surfaces are the problem. The light surfaces differ by only 1.04:1 to 1.12:1, card edges are about 1.2:1, and nothing has a shadow. |
| No dark mode | Dark tokens exist, but the app forces light, ignores the device setting, and the only switch is a hidden `d` key. In the dark theme, gray text is too dim (APCA Lc 43 to 46 against a target of 75). |
| No focal point | 14 elements use the same solid blue as the main button. "Start review" is 126 x 44 px, about half a percent of a laptop screen, flat, and narrower than the button next to it. |

### What changes

1. **One hero.** The Today panel and the "Continue learning" card merge into one deep navy panel: course name, one big number, one time estimate, one button.
2. **One lit button.** "Start review" becomes a tall amber button with depth. Amber is used for nothing else on the page.
3. **Less than half the words.** About 86 visible words instead of 192. Each fact is said once. Plain words replace jargon ("course" for "deck", "to review" for "due").
4. **A real color system.** Three tiers of OKLCH tokens, with every text and control pairing checked against WCAG 2.2 and APCA in both themes.
5. **Dark mode as its own design.** A deep navy theme with a visible three-choice control: Match my device, Light, Dark.
6. **A phone layout designed for phones.** The hero comes first and both of its buttons fit on the first screen of a small phone. The top bar's buttons grow to 44 px.

**What version one does not do.** It fixes focus, copy and contrast. Its character comes from color and depth. It does not add pictures yet, because the data for them does not exist. Section 15 lists what comes next.

### Targets

| Measure (default state) | Today | Target |
| --- | ---: | ---: |
| Visible words in `main` | 192 | 90 or fewer |
| Headings | 12 | 6 or fewer |
| Numbers shown, counting those inside titles | 37 | 14 or fewer |
| Font size and weight pairs | 15 | 8 or fewer |
| Text smaller than 14 px | 22 runs at 12 px | 0 |
| Shapes filled with the main button's color | 14 | 1 |
| Main button, desktop | 126 x 44 px | at least 280 x 56 px |
| Main button bottom edge, 375 px phone | y 625 | inside 550 px (about y 370) |
| Page height on a 375 px phone | 2,658 px | about 1,430 px |
| Hero against the page (light) | 1.04:1 | 12.97:1 |
| Hero against the page (dark) | 1.35:1 | 1.58:1 as verified. At least 2:1 if the brighter hero in section 7.4 is adopted. |
| Boxes in `main` above the fold (1280 x 720) | 6 | 3 or fewer |
| Buttons and links in `main` above the fold (1280 x 720) | 7 | 4 or fewer |
| Focus ring contrast | about 2.4:1 | 6:1 or better |
| axe violations, all 11 preview states, both themes | 0 | 0 |

### Decisions

All ten decisions in section 16 are settled, on the recommended defaults: amber on a deep navy hero, "course" and "words", "200 of 1,000 words started", and a hero that counts one course. The current brand colors were a direction, not a commitment, so the move to navy and amber is intended.

### Where your request is answered

| You asked for | Where |
| --- | --- |
| Too busy, too much copy | 5.5 (what moves where), 6 (words) |
| Not enough contrast | 7 (color system), 9.3 (depth) |
| Dark mode | 8 |
| One focal point | 4 (principles), 5.1 to 5.3 |
| Friendly for non-technical people | 6.1 (plain words), 9.1 (type sizes), 11.2, 14.2 (tests with people) |
| Mobile | 5.2, 10 |
| Accessibility and WCAG | 11 |
| i18n | 6.2, 12 |
| Old Memrise (video and Wayback pages) | 3.3 |
| Refactoring UI | 9.4, and cited where a rule is applied |
| Color science (OKLCH, HCT, tokens, WCAG and APCA, dark mode, Albers) | 7, 8.1, appendix |

### Terms used in this plan

| Term | Plain meaning |
| --- | --- |
| Token | A named color or size, such as `--card`. Components use the name, so the value can change in one place. |
| OKLCH | A way to write colors as lightness, chroma and hue. Section 7.1 explains it. |
| Chroma | How colorful a color is. Zero is gray. |
| Contrast ratio | WCAG's measure of how far apart two colors are, from 1:1 (identical) to 21:1 (black on white). |
| APCA, Lc | A newer contrast measure that judges dark themes more truthfully. Section 7.2. |
| axe | An automated accessibility checker. The repo already runs it in Playwright tests. |
| Above the fold | Visible without scrolling. |
| Container query | CSS that responds to the width of an element's container, not the window. |
| Pre-paint script | A tiny script in `<head>` that runs before the page is drawn. |
| Forced colors | Windows high-contrast mode. The system replaces your colors with the user's. |
| Pseudo-localization | Fake translations that stretch every string, to find layouts that break before real translations exist. |
| `md`, `lg` | Tailwind's width breakpoints: 768 px and 1024 px. |

---

## 2. How this plan was made

Twelve research and design agents worked in parallel, then their output was merged here.

| Track | What it did |
| --- | --- |
| Code audit | Read every dashboard component, the tokens and the theme provider. Counted strings, numbers, colors and type styles with `file:line` references. |
| Live audit | Opened the running page in a headless browser at 5 widths, 2 themes and 11 preview states. Measured positions, target sizes and every rendered color pair. Ran axe-core. |
| Feedback and examples | Analyzed the five example images and the four responses. |
| Old Memrise | Recovered the 2016 to 2017 dashboard from archived CSS and JavaScript and from the YouTube walkthrough's captions and still frames. |
| Refactoring UI | Applied the book's ideas to this page, element by element. |
| Color science | Built the token system and verified every pairing with code. |
| Accessibility and usability | WCAG 2.2, W3C cognitive guidance, plain language, older adults, streak ethics, test scripts. |
| Mobile and i18n | Phone measurements, pseudo-localization, right-to-left, plural and text-growth rules. |
| Other learning apps | How Duolingo, Anki, WaniKani and others build one focal point, plus the attention research behind it. |
| Three design proposals | "Calm focus", "Playful memory" and "Night first", each a full design built on the research. |

The three proposals were written independently and **agreed on the core**: one navy hero, one amber button, a count that matches what the button opens, "course" instead of "deck", and a three-choice theme control. This plan takes "Night first" as its base and adds pieces from the other two. Section 15 records what was left for later.

The research files, the three proposals and the color scripts are saved in [redesign-research/](./redesign-research/README.md).

Three reviewers then checked the draft: one recomputed every number and color, one checked every claim against the code and the repo's rules, and one reviewed it as a skeptical designer. Their corrections are in this version. The largest changes were dropping a phone bottom bar the proposals had all included, and stating plainly where dark mode is still weak.

---

## 3. What the evidence says

### 3.1 The feedback

You asked "Which one do you like most? Go with your gut feeling."

| Person | Picked | In their words | The need behind it |
| --- | --- | --- | --- |
| Crystal (Course Director) | Example 1 (light, playful) | "More fun and it had the important information on it." "I always choose the dark option." "I like the Github chart at the top." "I am not sure about the word Deck." | Character and color. A dark option. A picture of activity. Plain words. |
| Ben | Example 1 | "Option 1" | No reason given. |
| Woodson | Example 2 (dark navy) | "I like the vibe of it a lot." | Mood and depth. |
| Karen | Example 2 | "You can concentrate on reading instead of looking for them." "The white background makes the words disappear." | Text that stands out from its background. Less hunting. |

What Crystal circled in the other examples:

- **The single hero card**, twice: example 4 (course name, three stats, one button) and example 5 (centered "32 words", one button).
- **The 7-day row of check marks** in example 5.
- **The Study Tip card** in example 2.
- **The Go Pro card at the foot of the sidebar** in example 2. It is unclear whether she liked the card or the spot, so this plan does not build on it.

Four things to keep in mind when reading this feedback:

1. **The visible vote is a 2 to 2 tie**, not a win for dark. The README says example 2 was the most popular overall, so there may be responses beyond the four screenshots.
2. **People voted for color, depth and imagery, not for less content.** Example 1 has about as many words as Memli does today and was called "more fun". The calmest examples (3 and 5) got no votes, and the current build is closest to example 3.
3. **"Fun" and "busy" are different things.** A page can have few words and still have character. That is the goal here.
4. **The line about eyes getting worse was yours, not Karen's.** Her point stands on its own: on light backgrounds "the words blend in".

Four people is a small sample. Treat it as a direction, and test the real build with the scripts in section 14.

### 3.2 Measurements of the current page

All from the live page or the source code.

**Focus**

- "Start review" is 126 x 44 px. On a 1280 x 800 screen that is 0.54% of the area.
- The selected "All languages" chip is 120 x 36 px, the same blue, and sits 32 px above the Today panel. It looks like the main button and comes first in reading order.
- 14 elements share the solid primary blue: the logo, the active chip, the button, the "8 due" badge, five weekday dots and the progress fills.
- The button gets paler on hover, and it has no shadow in any state.
- The "Continue learning" card has no button at all in the default state.

**Copy**

- 217 words in `main` counting screen-reader text, 192 visible. 84 separate runs of text.
- Only 4 of those are helper sentences. The load comes from labels, numbers and repeats.
- Repeated facts: "About 4 minutes" (twice), the streak (twice), "16 due" (twice), "Spanish Core 1000" (three times), "mastered" (six times).
- **The headline says 24 cards, but the button opens a session of 16.** The other 8 belong to a different course.

**Contrast**

- Light text pairs: lowest is 5.59:1. All pass WCAG AA.
- Light surfaces: all between OKLCH lightness 0.962 and 1.0. Today panel against the page is 1.04:1. Card edges are 1.22:1.
- Dark muted text: 4.9:1 to 6.6:1 by WCAG, but only APCA Lc 43 to 46. WCAG 2 overstates contrast for dark pairs, which is why this theme passes on paper and still reads poorly.
- Dark background chroma is 0.025. Example 2's navy measures about 0.043 to 0.053. That is why Memli's dark theme looks black, not navy.
- The focus ring is a 50% transparent ring at about 2.4:1. WCAG asks for 3:1.

**Type**

- 15 size and weight pairs. Three different "big number" sizes (48, 30 and 24 px).
- On a 375 px phone, 67 of 94 text elements are 14 px or smaller, and 25 are 12 px.

**Phone (375 px wide)**

- "Start review" ends at y 625. A small phone shows roughly 550 px with the browser bars visible (an estimate, not a device test), so the button is likely cut off.
- The language filter takes 80 px above the button with 4 languages and 212 px with 12.
- The page is 2,658 px tall, about 3.3 screens. The streak is two screens down.
- The menu button is 32 x 32 px and hides both navigation links.

**Theme plumbing**

- `main.tsx` passes `defaultTheme="light"`, so the device setting is ignored.
- `useTheme()` is never called. No component offers a switch.
- `index.html` has no pre-paint script, no `color-scheme` and no `theme-color`.
- The `d` shortcut has no off switch. That is the pattern WCAG 2.1.4 (Level A) warns about.

### 3.3 Lessons from old Memrise

The logged-in dashboard is not in the Wayback Machine after 2013 because captures redirect to the login page. It was recovered from the archived March 2017 dashboard CSS and JavaScript (which contain the templates and every button label) and from the captions and 19 still frames (14 of them inspected) of the [July 2016 walkthrough video](https://www.youtube.com/watch?v=juNdykvLxLA). The two sources agree. The video was not watched in motion.

| Lesson | Source | What it means for Memli |
| --- | --- | --- |
| The dashboard was a stack of course cards. Each had a title, one line ("637 / 4725 words learned"), one progress bar and a fixed pair of buttons, "Review (597)" and "Learn". | Verified (2017 templates, video frames) | One line and one bar per course. The same two verbs in the same place every time. |
| The first screen held about 45 to 50 words. There was no greeting and no summary panel. | Verified (frames) | Memli can halve its copy and still say more than the original did. |
| The unit was always a "course". "Decks" was a 2019 spin-off that was folded back in February 2020. | Verified (blog and forum archives) | Supports renaming "deck" to "course". |
| Garden verbs ("Ready to plant", "Ready to water") became plain verbs ("Ready to learn", "Ready to review") by May 2015. The seed and flower icons stayed. | Verified (archived strings) | Plain verbs on buttons. Keep any growth metaphor in pictures only. |
| A 7-day goal strip with a streak number sat inside each card. | Verified (templates) | The 7-day row Crystal circled has a history behind it. |
| The 2016 to 2017 look was sky blue, green and light blue, not navy and yellow. White labels on those buttons were about 1.9:1. | Verified (CSS), contrast computed | Do not copy the old colors. They would fail today. |
| Navy came from a night mode (header `#282A6C`) and from the 2019 rebrand (navy `#2C3445`, yellow `#FFC000`). Navy text on that yellow is about 7.6:1. | Verified (CSS), contrast computed | Navy and yellow is a proven, readable pair for this kind of product. |
| In the forum threads that were read, long-time users valued community mems, user-made courses and a compact dashboard. They objected to the 2021 redesign's large type and white space. | Verified for those threads. Forum users are the most invested users, not everyone. | Simplify by ranking things, not by making everything bigger. Keep the course list compact. Do not bury mnemonics. |

**The six public pages from March 2016.** These were fetched from the Wayback Machine and read directly.

| Page | What it showed | What it means for Memli |
| --- | --- | --- |
| Level page (7 March) | One white box held the level name, a progress bar and one green button, "Learn these words". For a logged-in learner the button became "Continue learning". | A precedent for the hero: a name, a bar and one button whose label changes with the state. |
| Level page (video frame) | Each word row showed its next review in plain time: "now", "in about a day". | "Check back later." is vague. A real time ("Next review tomorrow.") is better. It needs a next-review date in the data contract, so it is listed in section 15. |
| Course page (12 March) | A course was 25 numbered level tiles, each with a status word such as "Ready to learn". | "200 of 1,000" moves a tenth of a percent per word. A nearer milestone, like a level, would feel faster. Listed in section 15. |
| About page (18 March) | A word counted as learned after six correct tests. | Do not call a word "learned" after one look. See decision 4. |
| Catalogue (13 March) | Card stats were icons only ("460k", "7h"). The sentence was in a hover tooltip. Titles were capped at two lines. | Do not copy the tooltip pattern. Touch users never see it. Every icon here is paired with a word. |
| Catalogue | A separate "I speak:" control chose the learner's own language, apart from the language being studied. | Keep the filter labeled "Studying". A label that says only "Language" would collide with a future setting for the app's language. |
| Sign-up page (16 March) | One card, three labeled fields, one button, no marketing copy. | A precedent for the no-courses state showing only the hero. |
| Landing page (6 March) | One action, shown twice, and nothing else filled. Extra content sat behind "There's more!". The two buttons had different labels ("Join now" and "Register now"). | Supports one filled button and a closed disclosure. The two labels are the mistake that "one word per idea" avoids. |

This plan learns from those patterns. It does not reuse Memrise's name, art or exact look.

### 3.4 Lessons from other learning apps

- Every strong learning home screen answers "what do I do now" with one control: Duolingo's next lesson node, Anki's Study Now, RemNote's Practice button.
- A target that shares its color and shape with other things cannot be found at a glance. This is the isolation (von Restorff) effect. It is the direct reason to stop using the button's color for chips, dots and bars.
- Duolingo's own published experiments found that separating the streak from the daily goal raised day-14 retention by 3.3%, and that animations at streak milestones made new learners 1.7% more likely to be active seven days later. Memli already keeps the two apart.
- Research on streaks (Silverman and Barasch, 2023, read in summary) found that drawing attention to a broken streak lowers motivation. So this plan never shows a missed day in red, never shows a large zero, and never uses the streak as the reason to study.
- Two cautionary redesigns: WaniKani's 2025 widget dashboard drew layout complaints and still had no official dark mode, and Clozemaster's 2024 enlargement drew "It's all so big!". Both support ranking over enlarging.

---

## 4. Design principles

**1. One light in the room.**
Amber means "do this next" and nothing else. There is exactly one amber shape on the screen. When there is nothing to do, there is no amber at all.

**2. Surfaces carry the structure. Text only has to be read.**
Each region gets its own surface step, so no region needs a heading, a border and a label to announce itself. Text comes in three tones, and small text is never gray.

**3. Say each fact once, in words a new learner already knows.**
Every number has one home. The button's count matches what the button opens. No "deck", "due", "mastered" or "retention".

**4. Growth, never guilt.**
Numbers on this page go up or get done. Nothing is labeled "missed".

---

## 5. The new dashboard

### 5.1 What the eye sees, in order

| Level | Element | Contents |
| --- | --- | --- |
| **First glance (one element)** | **Study hero** | Course name. One big number with its phrase ("16 words to review"). One line of cost ("About 3 minutes"). The amber "Start review" button. One quiet second button ("Learn 10 new words"). One line of progress ("200 of 1,000 words started") with a thin bar. |
| Second glance | **This week** | Seven day marks, "12 days in a row", "24 of 50 words today". |
| Second glance | **Your other courses** | Compact rows: language badge, title, one status line, one quiet button. |
| Third | Greeting | The `h1`, smaller than the hero number. |
| Third | Tip card | One warm card. Tricky words when there are some, a study tip when there are none. |
| Third | Your progress | A closed disclosure at the bottom with the reference numbers. |
| Third | Theme control | Sidebar foot on desktop. A "Theme" button in the top bar on phones. |

Why the hero counts 16 and not 24: the button opens one course (`/study/$courseId`), so the headline must describe that course. The other 8 words show once, on the Japanese row, with their own button. When a cross-course session exists (an open decision in PLAN.md), the hero can show the total again.

Which course is the hero: the existing rule decides (the course with the most words to review, then the most recently studied). The learner can start any other course from its row. When the hero's course is finished and another still has words, the hero changes to that course. The course name is the hero's heading, so the change is visible.

### 5.2 Phone, 375 px wide

Sizes are CSS px and are estimates from the type and spacing scales in section 9.

```
y=0    ┌───────────────────────────────────────┐
       │ [▣] Memli        [☾ Theme] [◯] [☰]   │  56   top bar, scrolls away
y=72   │ Good evening, Phillip                 │  32   h1, 24 px bold
y=120  │ ╔═══════════════════════════════════╗ │
       │ ║ [ES] Spanish Core 1000            ║ │  28   h2, 18 px semibold
       │ ║                                   ║ │
       │ ║ 16                                ║ │  56   the number, 56 px bold
       │ ║ words to review                   ║ │  28   20 px semibold
       │ ║ About 3 minutes                   ║ │  28   18 px regular
       │ ║ ┌───────────────────────────────┐ ║ │
       │ ║ │ ▶  Start review               │ ║ │  56   AMBER, plus a 3 px edge
y≈371  │ ║ └───────────────────────────────┘ ║ │  <- bottom of the main button
       │ ║ ┌───────────────────────────────┐ ║ │
       │ ║ │ Learn 10 new words            │ ║ │  48   tinted navy, 1 px border
y≈431  │ ║ └───────────────────────────────┘ ║ │  <- bottom of the second button
       │ ║ ▓▓▓▓▓▓░░░░░░░░░░░░░░░░░░░░░░░░░░ ║ │   8   bar
       │ ║ 200 of 1,000 words started        ║ │  24
y≈503  │ ╚═══════════════════════════════════╝ │
 - - - - - - - - - - - - - - - - - - - - - - - - -  small-phone fold, about y 550
       │ ┌───────────────────────────────────┐ │
       │ │ This week                         │ │
       │ │ Sun  Mon  Tue  Wed  Thu  Fri  Sat │ │  short names from Intl
       │ │ (✓)  (✓)  (✓)  (✓)  (✓)  (◔)  ( ) │ │  goal reached, today, later
       │ │ 🔥 12 days in a row               │ │
       │ │ 24 of 50 words today              │ │
       │ └───────────────────────────────────┘ │
       │ Your other courses                    │
       │ ┌───────────────────────────────────┐ │
       │ │ [JA] Japanese Hiragana & Katakana │ │
       │ │      8 words to review   [Review] │ │
       │ │ [FR] French Travel Phrases        │ │
       │ │      10 new words         [Learn] │ │
       │ │ [PT] Portuguese Essentials        │ │
       │ │      ✓ All done                   │ │
       │ └───────────────────────────────────┘ │
       │ ┃ 💡 4 tricky words in               │ │  warm tip card
       │ ┃    Spanish Core 1000               │ │
       │ ┃ A new memory trick can help.       │ │
       │ ┃ [Practice]                         │ │
       │ ▸ Your progress                       │  closed disclosure
```

Phone rules:

- **The hero fits the first screen.** A small phone shows roughly 550 px with the browser bars visible (an estimate). The hero ends near y 503 when the greeting and the course name each fit on one line. If both wrap, the hero grows by about 60 px. Both buttons still fit (the second ends near y 491) and only the progress line drops below the fold.
- **The hero never moves.** Today the language filter pushes the button down by 80 to 212 px depending on how many languages you study. The filter moves into the course list, so the button sits at the same height in every state.
- **The main action stays in the page flow.** No sticky "Start review" bar. A sticky bar can cover the focused element (WCAG 2.4.11) and fights the on-screen keyboard.
- **The top bar keeps its two existing buttons** (account and menu) and gains a labeled "Theme" button. All three become 44 px. The menu button is 32 px today.
- **No bottom bar yet.** A bottom bar was considered and deferred. The app has two destinations today, and Community is still a "Coming soon" page outside the app shell. A bar would spend 56 px of the first screen on one real destination. Add it when there are three in-app destinations (section 15).
- **Landscape.** When the hero is at least 520 px wide, its two buttons sit side by side, as on desktop.
- **No horizontal carousel** for courses. Rows stack.

### 5.3 Desktop, 1280 px and wider

```
┌────────────────┬─────────────────────────────────────────────────────────────────────────┐
│ ▣ Memli        │  Good evening, Phillip                                                  │
│                │                                                                         │
│ ▌⌂ Dashboard   │  ╔══════════════════════════════════════════╗  ┌──────────────────────┐ │
│  ◎ Community   │  ║ [ES] Spanish Core 1000                   ║  │ This week            │ │
│                │  ║                                          ║  │ Sun Mon Tue Wed Thu…│ │
│                │  ║ 16                                       ║  │ (✓) (✓) (✓) (✓) (✓)…│ │
│                │  ║ words to review                          ║  │ 🔥 12 days in a row  │ │
│                │  ║ About 3 minutes                          ║  │ 24 of 50 words today │ │
│                │  ║                                          ║  └──────────────────────┘ │
│                │  ║ ┌────────────────────┐ ┌───────────────┐ ║                           │
│                │  ║ │ ▶  Start review    │ │ Learn 10 new… │ ║                           │
│                │  ║ └────────────────────┘ └───────────────┘ ║                           │
│                │  ║ ▓▓▓▓▓▓░░░░░░░░░░░░ 200 of 1,000 words…   ║                           │
│                │  ╚══════════════════════════════════════════╝                           │
│ ┌────────────┐ │                                                                         │
│ │ Theme      │ │  Your other courses                            ┃ 💡 4 tricky words in ┃ │
│ │ ◉ Match my │ │  ┌──────────────────────────────────────────┐  ┃ Spanish Core 1000    ┃ │
│ │   device   │ │  │ [JA] Japanese Hiragana & Katakana        │  ┃ A new memory trick   ┃ │
│ │ ○ Light    │ │  │      8 words to review          [Review] │  ┃ can help. [Practice] ┃ │
│ │ ○ Dark     │ │  │ [FR] French Travel Phrases       [Learn] │  ┗━━━━━━━━━━━━━━━━━━━━━━┛ │
│ └────────────┘ │  │ [PT] Portuguese Essentials   ✓ All done  │                           │
│ ◯ @user      ⌃ │  └──────────────────────────────────────────┘                           │
└────────────────┴─────────────────────────────────────────────────────────────────────────┘
                    ▸ Your progress                                       (below the fold)
```

- Sidebar 256 px. Content is at most 1,152 px wide (two columns of 608 and 320 px plus gutters) and does not stretch further on large monitors. Lines of text stay a readable length.
- Two columns start when the content area is at least 896 px wide. This is a **container query**, so it depends on the space the content has, not on the window.
- The main button is at least 280 x 56 px, about 1.5% of a 1280 x 800 screen. Today it is 0.54%.
- **Above the fold** on a 1280 x 720 window: the hero, This week and the top of the course list. Three boxes, where today there are six.
- **The space under "This week" stays empty.** The hero is taller than the week card. That is fine. A page does not have to fill every corner (Refactoring UI).
- **No picture slot is reserved.** The hero's text is at most 480 px wide. When mnemonic images exist (section 15), a picture takes the free space on the end side.
- **Reading order and tab order follow the picture, row by row.** The DOM order is greeting, hero, This week, courses, tip, progress. The grid places the hero and This week in the first row, and the courses and the tip in the second. No CSS `order` is used (WCAG 1.3.2 and 2.4.3).

**Tablet (768 px).** The sidebar narrows to 224 px and the content is one column: hero, a wide This week strip, the course list, the tip.

### 5.4 States

The hero keeps the same slots in every state. Only the words change, and sometimes the amber button is absent on purpose. All eleven `?preview=` states keep working.

| State | Hero | Rest of the page |
| --- | --- | --- |
| `default` | As drawn. | As drawn. |
| `learn` (nothing to review, new words ready) | "**10** new words to learn". Line: "Nothing to review right now." Amber button: "Start learning". No second button. | Same. |
| `caught-up` | No number. A large check in a tinted circle, "All done for today" (at the greeting's size, 24 or 30 px bold), "Nothing to review right now. Check back later." **No amber button.** Under "Want to keep going?", up to two tinted buttons: "Learn 10 more new words" and "Practice 4 tricky words", with "Each new word means a few short reviews later." | Today's mark is filled. "You finished everything for today." The tip card hides when the hero already offers Practice. |
| `finished` | Same check and headline. One link: "Find another course". | Same as caught-up. With one course, the dashed "Find another course" row is not shown a second time. |
| `goal-met` | Whatever the hero state is. | Today's mark shows a check. "You reached today's goal." |
| `no-decks` | Greeting "Welcome to Memli, {name}". Hero: "Pick your first course", "Courses are word lists with memory tricks from other learners.", amber "Find a course" (to `/community`, as today). | Nothing else renders. An empty week or list reads as failure. |
| `one-deck` | As default. | The course list becomes one dashed row with a link: "Find another course". (PLAN.md hid the list here.) |
| `many-decks` | As default, at the same height as always. | The first 5 rows, then "Show all 11 courses" (the count is the other courses, not the hero's). The Studying menu appears in the list header. |
| `same-language` | As default. | No Studying menu. |
| `long-titles` | The course name wraps. It is never cut off. | Row titles wrap. Row buttons stay at the end. |
| `large-numbers` | "1,284" fits at both number sizes. | Same. The tip card reads the course's own tricky-word count, not the account total. |
| Streak is 0 (needs a twelfth preview) | Normal hero. | The "days in a row" line is hidden. No zero, no red. |
| The hero's course is finished, another has words | The hero changes to the next course by the focus rule. | The finished course moves into the list with "All done". |
| A `?studying=` filter is active | Unchanged. The hero ignores the filter. | The list shows only that language. The Studying menu always shows while a filter is active, so it can be cleared. |

Why the caught-up hero has no amber button: the right next step is to stop. It also teaches the rule. Amber on means there is something to do. Amber off means you are done.

### 5.5 Where everything on the current page goes

Nothing disappears silently.

| Today | Decision | Where it goes |
| --- | --- | --- |
| "About 4 minutes of review keeps your 12-day streak going." | Cut | Minutes are in the hero. Days in a row are in This week. The streak stops being the reason to study. |
| "Studying" and the five language chips above the hero | Moved and shrunk | One "Studying" menu in the course list header. Shown with more than 5 other courses and at least 2 languages, or whenever a filter is active. It filters the list, not the hero. With 5 or fewer other courses, every course is already one tap away. |
| "TODAY" label | Cut | The hero's heading is the course name. |
| "24 cards ready to review" (all courses) | Changed | The hero shows the focus course's count (16). |
| "16 from Spanish Core 1000", "8 from Japanese…" chips | Cut | The hero names the course. The Japanese row shows its own count. |
| "Starts in Spanish Core 1000." | Cut | Not needed. The hero is that course. |
| "Continue learning" card | Merged | Into the hero. |
| "16 Due", "10 New today" big numbers | Cut | Same facts as the hero number and the second button. |
| "5% mastered of 1,000 cards" | Rewritten | "200 of 1,000 words started" in the hero (mastered plus learning). |
| "52 mastered, 148 learning, 800 not started" | Moved | "Your progress", as a small table per course. |
| "Last studied …" (four times) | Removed | The list is already sorted by need. Returns on a course page when one exists. |
| Per-course "% mastered" and mini bars | Moved | The table in "Your progress". |
| Goal ring with "24 of 50" inside | Replaced | Today's day mark fills as a small ring. The sentence "24 of 50 words today" carries the value. |
| "Daily goal" and "26 more cards to reach today's goal." | Cut | 26 is 50 minus 24. One sentence is enough. |
| "Words mastered 100" | Moved | "Your progress": "{count} words learned so far". |
| "7 words keep slipping" card and its word chips | Restyled | The tip card: a count, one sentence, a "Practice" button. The chips looked like buttons and were not. (PLAN.md gave this card no button. The practice mode exists now.) |
| "Your progress trends" strip | Moved | The "Your progress" disclosure, as plain sentences. |
| "Consistency 98%, +2% from last week" | Deleted | The week marks show consistency. |
| "Global average: 75%" | Deleted | No comparison with strangers. |
| The `d` key theme toggle | Deleted | Replaced by the visible Theme control. |
| Phone menu button (32 px) | Kept, enlarged | 44 px, next to a new "Theme" button. |
| Nav labels "Decks", "Community Gallery" | Renamed | "Dashboard", "Community". |

### 5.6 Decisions in PLAN.md that this plan reverses

| PLAN.md decision | New decision | Why |
| --- | --- | --- |
| Today panel and Focus deck are separate regions. | One hero. | The focus card has no button in the default state and repeats three facts. Crystal circled a single hero twice. |
| The greeting carries a status line with the streak in bold. | The greeting is one line. The streak lives only in This week. | The fact was said twice within 300 px, and it framed study as protecting a streak. |
| The Today panel shows the total due across decks. | The hero shows the focus course's count. | The button opens one course. |
| The language filter sits above the Today panel, shows at 2 languages, and narrows the whole page. | The filter sits in the course list, shows with more than 5 other courses, and narrows only the list. | It cost 80 to 212 px above the main action and made the hero jump. |
| Two columns at `xl`, page capped at `max-w-7xl`. | Two columns by container query, content capped at 1,152 px. | The layout should follow the space the content has. |
| The sidebar streak was removed and the greeting kept the streak line (decided). | The streak appears once, in This week. | Same reason as the row above. |
| "Mastered" is the progress word. | "Learned" for the same count, "started" for mastered plus learning. | "5% mastered" is accurate and discouraging on the home screen. |
| Hero photos, the heatmap and the study tip were left out. | A tip card ships now. A picture slot and a month calendar come later. | Crystal circled the tip and named the heatmap. The data for the other two does not exist yet. |

---

## 6. Words

### 6.1 One word per idea

| Old word | New word | Reason |
| --- | --- | --- |
| Deck | **Course** | Crystal flagged "Deck". The code already says `courseId` and the route is `/study/$courseId`. Old Memrise said "course" for its whole classic era. |
| Card | **Word** | Learners learn words. Today "cards" and "words" share one screen. Known gap: the kana course teaches characters, so "words" is loose there. |
| Due | **to review** | Scheduling jargon. |
| Mastered | **learned** | The same count, in a plain word: "100 words learned so far". |
| (new) | **started** | Mastered plus still learning. Used for the hero's progress line: "200 of 1,000 words started". "5% mastered" is true and discouraging on a home screen. "Started" is also true, and it does not claim a word is learned after one look. See decision 4. |
| Streak | **days in a row** | Plain. It carries a translator note: consecutive days. |
| Mnemonic | **memory trick** | Plain. Introduce "mnemonic" once where the product teaches the word. |
| Caught up | **All done** | Not an idiom, so it translates. |
| Words keep slipping | **Tricky words** | One name for one set. |
| System (theme) | **Match my device** | "System" is operating-system jargon. |
| Decks (nav) | **Dashboard** | The item opens the dashboard, not a list of decks. The rest of the product already calls this page "Dashboard" (the marketing nav, "Back to dashboard" in the study session). "Home" already means the marketing home page. |
| Community Gallery | **Community** | One name for `/community`. |
| Retention, Consistency | removed | Replaced by a sentence ("You remembered 84% of your reviews.") or by the week marks. |

Code identifiers such as `DashboardDeck` can stay. They are not user-facing. New files use "course". Five messages in the study session also say "deck" or "card" (three in `study.$courseId.tsx`, two plural pairs in `SessionHeader.tsx`). They change in the same pull request as the hero, so one term is used everywhere.

### 6.2 Rules every string follows

1. Whole-sentence templates with `{placeholders}`. No joining pieces of sentences.
2. A number that is styled differently stays inside its sentence with a tag: `<n>{count}</n> words to review`. The existing `rich()` helper renders it. Translators can then move or drop the number.
3. Every count has `one` and `other` forms. Zero is a separate state, never a plural form (0 counts as "one" in French and Brazilian Portuguese).
4. A `one` form never contains a literal "1". Many languages use the `one` form for 21, 31 and so on, so the number must always come from the placeholder.
5. Numbers, percents, durations, day names and language names come from `Intl`.
6. Sentence case. No uppercase labels. No em dashes. No idioms.
7. No sentence over 12 words. Short sentences are easier to scan and easier to translate.
8. Every button's accessible name starts with its visible text (WCAG 2.5.3).

### 6.3 Copy deck (default state and its neighbors)

| Where | Key | Template |
| --- | --- | --- |
| Greeting | `greeting.morning` / `.afternoon` / `.evening` | `Good morning, {name}` and so on (kept from today) |
| | `welcome` | `Welcome to Memli, {name}` |
| Hero | heading | `{course}` |
| | `review.count` | one: `<n>{count}</n> word to review` / other: `<n>{count}</n> words to review` |
| | `review.duration` | `About {duration}` |
| | `review.start` | `Start review` |
| | `review.startLabel` (accessible name) | one: `Start review, {count} word in {course}` / other: `Start review, {count} words in {course}` |
| | `review.learnNew` | one: `Learn {count} new word` / other: `Learn {count} new words` |
| | `progress` | `{started} of {total} words started` (plural keyed on `{total}`) |
| | `learn.count` | one: `<n>{count}</n> new word to learn` / other: `<n>{count}</n> new words to learn` |
| | `learn.nothingToReview` | `Nothing to review right now.` |
| | `learn.start` | `Start learning` |
| | `done.heading` | `All done for today` |
| | `done.detail` | `Nothing to review right now. Check back later.` |
| | `done.keepGoing` | `Want to keep going?` |
| | `done.learnMore` | one: `Learn {count} more new word` / other: `Learn {count} more new words` |
| | `done.learnMoreCost` | `Each new word means a few short reviews later.` |
| | `done.practice` | one: `Practice {count} tricky word` / other: `Practice {count} tricky words` |
| | `empty.heading` | `Pick your first course` |
| | `empty.detail` | `Courses are word lists with memory tricks from other learners.` |
| | `empty.find` | `Find a course` |
| This week | `heading` | `This week` |
| | `daysInARow` | one: `{count} day studied` / other: `{count} days in a row` (hidden at 0) |
| | `today` | `<n>{done}</n> of {target} words today` |
| | `goalMet` | `You reached today's goal.` |
| | `goalCleared` | `You finished everything for today.` |
| | `todayCleared` | `<n>{done}</n> words today` (when everything was finished under the target, as PLAN.md decided) |
| | day labels (screen reader) | `{day}, goal reached` / `{day}, today` / `{day}, goal not reached` / `{day}` (a day still to come) |
| Courses | `heading` | `Your other courses` |
| | `toReview` | one: `{count} word to review` / other: `{count} words to review` |
| | `newWords` | one: `{count} new word` / other: `{count} new words` |
| | `allDone` | `All done` |
| | `review` / `learn` | `Review` / `Learn` (verbs; translators need that note) |
| | `reviewLabel` (accessible name) | one: `Review {count} word in {course}` / other: `Review {count} words in {course}` |
| | `learnLabel` (accessible name) | one: `Learn {count} new word in {course}` / other: `Learn {count} new words in {course}` |
| | `showAll` | `Show all {count} courses` |
| | `filter.label` / `filter.all` | `Studying` / `All languages` (kept from today) |
| | `findAnother` | `Find another course` |
| Tip card | `tricky.heading` | one: `<n>{count}</n> tricky word in <c>{course}</c>` / other: `<n>{count}</n> tricky words in <c>{course}</c>` |
| | `tricky.detail` | `A new memory trick can help.` |
| | `tricky.practice` | `Practice` |
| | `tip.heading` | `Study tip` |
| | `tip.items` | `Short daily reviews work better than one long one.` (drafts; you approve each tip) |
| Progress | `heading` | `Your progress` |
| | `learned` | `{count} words learned so far` |
| | `remembered` | `You remembered {percent} of your reviews.` |
| | `newThisMonth` | `{count} new words this month` |
| | table headings | `Course`, `Learned`, `Still learning`, `Not started` |
| Shell | `skip` | `Skip to main content` |
| | `title` | `Dashboard · Memli` |
| | nav | `Dashboard`, `Community`, `Menu` (the phone menu button's accessible name) |
| | theme | `Theme`, `Match my device`, `Light`, `Dark` |

Where a row shows only one form to save space (`today`, `showAll`, `learned`, `newThisMonth`), the real message still has `one` and `other` forms.

The greeting keeps its three time-of-day forms because they already exist, and English and Latin American Spanish both have a three-part greeting. If a later locale does not, fall back to one neutral string.

Why the rows do not put the count inside the button, as old Memrise did with "Review (597)": a row with nothing to do ("All done") has no button, so the status line has to exist anyway. Keeping the count in the status line means every row reads the same way, and the short buttons line up. The count is still in each button's accessible name.

### 6.4 Word counts

| Region | Before | After |
| --- | ---: | ---: |
| Greeting | 13 | 3 |
| Language filter | 7 | 0 (hidden in this state) |
| Hero (Today plus Continue learning) | 60 | 22 |
| Other courses | 44 | 26 |
| This week | 48 | 19 |
| Tricky words or tip | 25 | 14 |
| Trends | 20 | 2 ("Your progress", closed) |
| **Total in `main`** | **217** | **about 86 visible** |

"Before" includes screen-reader-only text. Fewer words also means less to translate and fewer plural forms to maintain.

---

## 7. Color system

### 7.1 Why OKLCH

`oklch(L C H)` has three parts. **L** is how light the color looks, from 0 to 1. **C** is chroma, how colorful it is. **H** is the hue angle.

The useful property: **equal L means equal perceived lightness, whatever the hue.** HSL does not give you that. In HSL, yellow at 50% lightness looks far brighter than blue at 50%. In OKLCH you can change the hue and keep contrast predictable, and you can build a ramp by stepping L evenly. Lightening a blue also does not drift it toward purple, which was a known flaw of the older LCH space.

This section follows Evil Martians' article "OKLCH in CSS: why we moved from RGB and HSL" and Björn Ottosson's original Oklab post (section 18).

**What about HCT?** Material Design's HCT space does the same job, and its "tone" value maps directly onto WCAG contrast (a tone difference of about 50 gives 4.5:1). But HCT needs a JavaScript library to compute. OKLCH is built into CSS, and it is what Tailwind v4 and Memli's tokens already use. This plan borrows Material's *idea* of color roles (section 7.3) and keeps OKLCH for the values.

Memli's tokens are already written in OKLCH. What is missing is a system built on it.

### 7.2 Two contrast measures, and why both

- **WCAG 2.2 contrast ratio** (1:1 to 21:1). The baseline you must meet: 4.5:1 for text, 3:1 for large text, control edges, focus rings and meaningful graphics.
- **APCA (Lc)**, a newer perceptual measure, roughly 0 to 106. It was proposed for WCAG 3. No method has been adopted yet, and it is not part of WCAG 2. It matters because WCAG 2 overstates contrast for dark pairs. Memli's current dark gray text passes WCAG at 5.8:1 and scores only Lc 45.

Every pairing in this plan must pass **both**. The thresholds used:

| Kind of pairing | WCAG 2.2 | APCA |
| --- | --- | --- |
| Headings, numbers, reading text on page and card | 7:1 | Lc 90 |
| Secondary text on page, card, sidebar, hero | 4.5:1 | Lc 75 |
| Button labels, at rest and on hover | 4.5:1 | Lc 75 |
| Button labels while pressed | 4.5:1 | Lc 60 |
| Links and status words | 4.5:1 | Lc 60 |
| Control borders, focus rings, icons, chart marks | 3:1 | Lc 30 |

A script (using the `culori` and `apca-w3` packages) checked 81 pairings per theme, 162 in all. 134 of them have a pass mark ("gated"), and all 134 pass. The other 28 are reported without a pass mark because they are decorative: hairlines and the steps between surfaces. All 73 base colors are inside the sRGB range, so no screen needs a fallback.

APCA is used here as a hard gate for text and a guide for everything else. That is a choice (decision 9).

### 7.3 Three tiers of tokens

Material Design's "color roles" idea, applied to the names shadcn already uses.

1. **Primitives.** Seven ramps, 73 colors in all: neutral (12 steps, tinted toward the brand hue), navy (6 steps), and blue, amber, orange, green and red (11 steps each). Defined by lightness steps with managed chroma. They live in `:root` and are **not** exposed to Tailwind as utilities, so there is no `bg-amber-400` class to reach for. (An arbitrary value such as `bg-[var(--amber-400)]` would still work, so code review has to catch that.)
2. **Roles.** Names that say what a color is for: `--background`, `--card`, `--hero`, `--cta`, `--foreground`, `--border-strong`. One block for light, one for dark. The existing shadcn names (`--primary`, `--muted-foreground` and so on) keep working.
3. **Utilities.** `@theme inline` exposes the roles as Tailwind classes: `bg-hero`, `text-cta-foreground`.

Why three tiers: a component that says `bg-hero` does not care what color the hero is. You can retune a ramp, or swap the whole button color, without touching a component.

### 7.4 Surfaces

| Role | Token | Light | Dark |
| --- | --- | --- | --- |
| Sidebar | `--sidebar` | `oklch(0.985 0.004 264)` #f9fafd | `oklch(0.16 0.038 266)` #060c1d |
| Page | `--background` | `oklch(0.965 0.008 264)` #f1f3f9 | `oklch(0.195 0.045 266)` #0b1429 |
| Cards, lists | `--card` | `oklch(1 0 0)` #ffffff | `oklch(0.25 0.05 266)` #16213a |
| Menus | `--popover` | #ffffff | `oklch(0.295 0.053 266)` #202c47 |
| Chips, badges, tracks | `--muted` | `oklch(0.94 0.012 264)` #e7ebf3 | `oklch(0.34 0.055 266)` #2a3755 |
| Selected item | `--accent` | `oklch(0.94 0.028 262)` #e1ecff | `oklch(0.34 0.055 266)` #2a3755 |
| **Hero** | `--hero` | `oklch(0.29 0.105 267)` #14255f | `oklch(0.35 0.12 266)` #1d3478 |
| Tip card | `--warning-container` | `oklch(0.955 0.031 68)` #ffeddb | `oklch(0.28 0.065 46)` #421d09 |

How far apart the surfaces are, before and after:

| Step | Today | Proposed |
| --- | --- | --- |
| Light: page to card (lightness) | 0.985 to 1.0 | 0.965 to 1.0 |
| Light: page to hero | 0.985 to 0.971 (**1.04:1**) | 0.965 to 0.29 (**12.97:1**) |
| Dark: page to card | 0.175 to 0.236 | 0.195 to 0.25 |
| Dark: page to hero | 0.175 to 0.291 | 0.195 to 0.35, and chroma 0.045 to 0.12 |

An honest note: **dark surfaces separate less than light ones, and this is the weakest part of the plan.** The dark page-to-card step is about the same size as today (1.15:1). The dark hero is 1.58:1 against the page and 1.38:1 against a card. The dark theme gains its structure from more chroma, a visible hairline (1.73:1), a bigger chip step and the hero's contents.

**A brighter dark hero, if the first build shows it is needed.** Raising the dark hero to `oklch(0.42 0.135 266)` (#2a4696) gives 2.11:1 against the page. The cost is contrast inside it: white text drops from 11.09:1 to 8.33:1 and the amber button from 8.30:1 to 6.24:1 against the panel. Both still pass. These figures were computed with the same libraries but are outside the gated run, so the script must be rerun if this value is adopted.

The tip card is only 1.03:1 against the light page. It gets a real 1 px border and a 4 px warm edge on its start side (5.01:1 against the page), so it does not rely on its fill.

### 7.5 Text

Three tones on normal surfaces, two on the hero.

| Level | Token | Light | Dark | On card: WCAG, APCA (light / dark) |
| --- | --- | --- | --- | --- |
| Strong: headings | `--foreground-strong` | #0d1529 | #f9fafd | 18.16:1 Lc 105 / 15.33:1 Lc 102 |
| Default: body, labels | `--foreground` | #2a354d | #e7ebf3 | 12.25:1 Lc 98 / 13.39:1 Lc 92 |
| Muted: 16 px and larger only | `--muted-foreground` | #505b72 | #cdd4e3 | 6.82:1 Lc 84 / 10.76:1 Lc 78 |
| On the hero: number, phrase, name | `--hero-foreground` | #f9fafd | #f9fafd | 13.78:1 Lc 101 / 11.09:1 Lc 97 |
| On the hero: time, progress | `--hero-muted-foreground` | #c8dcff | #e1ecff | 10.37:1 Lc 81 / 9.72:1 Lc 87 |

Compare the dark theme today: muted text on a card is 5.81:1 and Lc 45. The new value is 10.76:1 and Lc 78. That is the direct fix for "the words disappear".

Two rules:

- **Small text is never gray.** Muted color starts at 16 px. Anything at 14 px uses the default tone at weight 600.
- **No gray text on the hero.** Secondary text there is a pale tint of the hero's own blue. Gray on a colored background looks washed out. This is Refactoring UI's rule, and Albers explains why (section 7.9).

### 7.6 The main button, and the choice you need to make

A new role, `--cta` ("call to action"), holds the main button's color. `--primary` stays blue, so other screens keep their blue buttons until each one opts in.

One thing does change everywhere: **in the dark theme, `--primary` becomes a paler blue** (#c8dcff, where today it is #6a99ff). Today's dark blue button passes WCAG but its label scores only Lc 50. The paler blue brings the label to Lc 84. The cost is that solid blue buttons in dark mode, including "Reveal answer" in the study session, look softer. A middle value (#77a6ff) keeps the stronger look with a label at 8.05:1 and Lc 56. See decision 10.

Two fully specified options:

| | Option A: blue | Option B: amber on navy (recommended) |
| --- | --- | --- |
| Light fill and label | #1447e6, white label, 6.83:1 | #fec71d, navy ink label, 11.59:1 (Lc 77) |
| Dark fill and label | #c8dcff (pale blue), ink label, 14.04:1 | #fed756, navy ink label, 13.98:1 (Lc 84) |
| Fill against the hero it sits on | 5.74:1 light (pale hero only), 10.01:1 dark | **9.18:1 light, 8.30:1 dark** |
| Can it sit on the navy hero in light mode? | No. Blue on navy is 2.11:1, so the hero must become a pale blue panel (`--hero-soft`), which is only 1.07:1 against the page. | Yes. |
| Under color-blindness simulation | Not the strongest pair. | 7.25:1 to 10.0:1 in every simulation. Blue against yellow is the pair that red-green deficiency preserves. |
| Weak point | In dark mode a saturated blue is 2.0 to 2.7:1 on navy, and a pale blue reads as a soft button. | **1.57:1 on a white card.** It must live on the navy hero or carry its darker edge. |
| Brand | No change. | A shift toward navy and amber. Other screens stay blue until they are redesigned. |

**Recommendation: option B.** It is the only option where light and dark solve "where do I look" the same way. It gives the highest-contrast label of any option, which serves the need for text that stands out. It matches what two respondents picked (example 2's button measures almost the same color). The whole choice is five lines per theme and can be reversed.

**If you choose amber, plan the study session next.** Pressing an amber "Start review" lands on a screen whose main button is blue. Make the session's main button the first follow-up issue.

Orange, as in example 4, was measured and rejected. A white label on orange is 3.90:1, under the 4.5:1 minimum. Orange sits in the middle of the lightness range, so neither white nor dark text is comfortable on it.

Button tokens under option B:

| State | Light | Dark |
| --- | --- | --- |
| Fill `--cta` | `oklch(0.855 0.17 88)` #fec71d | `oklch(0.89 0.15 92)` #fed756 |
| Label `--cta-foreground` | #0d1529 | #060c1d |
| Hover `--cta-hover` | #fed756 (label 13.03:1) | #fee58f (label 15.60:1) |
| Pressed `--cta-active` | #f5b005 (label 9.59:1) | #fec71d (label 12.43:1) |
| 3 px bottom edge `--cta-edge` | #b36300 | #db8903 |

### 7.6.1 A second choice: the hero's color in the light theme

On a phone, the light theme's first screen is about three quarters deep navy. Two of the four respondents picked a white, illustrated example. A lighter option exists for the light theme only:

| | Deep navy (default) | Brand blue |
| --- | --- | --- |
| Hero color | #14255f | #153bb7 (`--blue-800`) |
| Hero against the page | 12.97:1 | 8.08:1 |
| White text on it | 13.78:1 | 8.59:1 |
| Secondary text on it | #c8dcff, 10.37:1 | #e1ecff, 7.54:1 (Lc 81) |
| Amber button against it | 9.18:1 | 5.72:1 |
| Feel | Serious, the same object as in dark mode | Brighter and more playful, closer to the brand blue people already know |

Both pass. Navy gives the button more punch and keeps day and night alike. Brand blue feels lighter. The brand-blue figures were computed with the same libraries but are outside the gated run. Settle this in phase 1 by showing both to Crystal and Ben (decision 2).

### 7.7 One color, one meaning

| Color | Means | Appears as |
| --- | --- | --- |
| Amber | Do this next | One filled button. Nothing else. |
| Saturated navy | Today's study | The hero panel. |
| Blue | Memli, "you are here", your progress | Logo, selected item, links, week marks, focus ring. |
| Orange | A warm aside | The flame icon and the tip card. Never a filled button. |
| Green | Done | "All done" with a check. |
| Red | Not used on this page | |

This is the fix for 14 elements sharing one blue. On the dashboard:

- The selected language option uses a tint, a check icon and bold text, not a solid fill.
- Week marks, the goal arc and bars use chart roles (`--viz-progress`, `--viz-track`), not `--primary`.
- The "Pro" badge in the sidebar is an amber pill with hard-coded palette colors today. It becomes a neutral outline badge so it does not compete with the button.
- Status never relies on color alone. Each has an icon and a word. Success against danger almost merges under red-green simulation, so the check and the word carry the meaning.

### 7.8 Controls and focus

| Element | Token | Against a card (light / dark) |
| --- | --- | --- |
| Control borders (row buttons, inputs, radios, empty day rings) | `--border-strong` #7c869b | 3.66:1 / 4.37:1 |
| Card hairlines (decorative) | `--border` | 1.49:1 / 1.73:1 |
| Focus ring: solid 2 px outline, 2 px offset | `--ring` | 6.16 to 6.83:1 / 9.16 to 11.16:1 |
| Focus ring on the hero | `--hero-ring` #f9fafd | 13.78:1 / 11.09:1 |

On the hero:

| Element | Colors | Contrast |
| --- | --- | --- |
| Second button | Fill `--hero-chip` (the hero mixed with 14% of its text color). Label `--hero-foreground`. A 1 px border in `--hero-muted-foreground`. | Label 9.45:1 / 7.58:1. The fill alone is only 1.46:1 against the hero, so the border (10.37:1 / 9.72:1) is what makes it read as a button. |
| Progress bar | Fill `--hero-foreground`. Track `--hero-chip`. | Fill against track 9.45:1 / 7.58:1. |

- The 50% transparent focus ring is replaced by a solid outline.
- **Amber on white is a design rule, not a WCAG failure.** WCAG 1.4.11 does not require a button's fill to contrast with the page when its label identifies it. The amber label passes on any background. The rule "amber lives on the hero" exists because a 1.57:1 button would not draw the eye, which is the whole point of it.
- **Stop using transparent tints under text.** A 12% success tint with success text gives 4.59:1 on a card, 4.18:1 on the page and 3.91:1 on a chip. The same color, three results. Use the `--*-container` pairs instead (9:1 or better).

### 7.9 What Albers adds

Josef Albers' *Interaction of Color* shows that a color has no fixed appearance. It changes with what surrounds it. Three consequences here:

- **The same amber looks brighter and more yellow on navy than on white.** The dark blue ground pushes it toward its opposite. That is part of why the button works on the hero and not on a card.
- **A gray chip on a blue-tinted panel looks warmer and dirtier than the same gray on white.** So the second button and the bar track on the hero are made by mixing the hero's own color with its text color (`--hero-chip`), not by reusing the page's gray.
- **Judge colors in place.** A swatch on a white artboard tells you little. The color script checks each color against the surface it actually sits on, and the first build step is to look at the tokens in the real app.

(The book was cited through its table of contents and summaries. It was not read in full for this plan.)

### 7.10 Proportions

The 60-30-10 split is a rule of thumb from interior design with no authoritative source, so it is only a sanity check here. On desktop the page is roughly 70% neutral ground, 25% brand structure (mostly the hero) and under 5% warm accent. The amber button is about 1.5%. The accent is far under 10% on purpose: ten percent is a ceiling, and the real check is the blur test in section 11.3.

---

## 8. Dark mode

### 8.1 Never just invert

Inverting the light theme fails for four reasons, and each has a rule here.

| Why inverting fails | Rule |
| --- | --- |
| Shadows do not show on a dark page, so depth is lost. | **Lighter means closer.** Sidebar 0.16, page 0.195, card 0.25, menu 0.295, chip 0.34. |
| Pure black with pure white text glares and smears. | No pure black, no pure white. The darkest surface is `oklch(0.16 0.038 266)`. The lightest text is `oklch(0.985 0.004 264)`. |
| Saturated colors vibrate against dark backgrounds. | Accents get lighter and a little less colorful: the amber goes from L 0.855 to 0.89 and chroma 0.17 to 0.15. |
| A gray that works on white is too dim on navy. | Dark muted text stays at or above L 0.86. In dark mode, rank text by size and weight before color. |

The navy reads as navy because its chroma is 0.038 to 0.058, about double today's 0.025. That matches what was measured in example 2.

**Day and night are the same place.** The hero is a navy panel with an amber button in both themes. In light it is the darkest large shape on a pale page. In dark it is the most colorful shape on a navy page. Switching themes moves nothing.

### 8.2 The theme control

**What it is.** Three choices, each with an icon and a word: **Match my device**, **Light**, **Dark**. Never a single button that cycles through them, because a cycling button hides the options. The default is Match my device.

Why offer both and force neither: Nielsen Norman Group's review of the research found that people with some kinds of low vision read better in dark mode, while people with normal vision read slightly better in light. One respondent said light backgrounds make the words blend in. Another always chooses dark. So both must be first-class, and the device's setting is the default.

**Desktop and tablet.** A small card at the foot of the sidebar, above the account button. A "Theme" legend and three radio rows, each 44 px tall. The sidebar is empty there today. The three choices are always visible: one click.

```
┌──────────────────────┐
│ Theme                │
│ ◉ ▭ Match my device  │   selected: tinted row, filled dot, bold
│ ○ ☀ Light            │
│ ○ ☾ Dark             │
└──────────────────────┘
```

Build it as a native `<fieldset>` with three `<input type="radio">`. Native radios give arrow-key behavior, the "2 of 3, selected" announcement and forced-colors support for free. `packages/ui` has no radio group component today, and this does not need one.

**Phone.** One labeled "Theme" button in the top bar. It opens a menu with the same three choices: two taps. Use the `DropdownMenuRadioGroup` that already exists in `packages/ui`. Screen readers announce these as menu items with a checked state, which is correct for a menu. The menu rows need a 44 px minimum height (they are 24 px today) and logical padding classes.

**Both come from one options array and one `messages` object**, so the labels and order cannot drift apart (WCAG 3.2.4). Choosing an option switches the theme at once. That is allowed because the user asked for exactly that change.

**Where it shows.** The control lives in the app shell, so it appears on the dashboard and settings. The study session, sign-in and marketing pages follow the stored choice but have no control of their own yet.

The selected state shows three ways: a filled dot, bold text and a tinted row.

### 8.3 Plumbing that ships with it

| Change | File |
| --- | --- |
| Default to the device setting. Remove `defaultTheme="light"`. | `apps/web/src/main.tsx` |
| Delete the `d` shortcut. | `apps/web/src/components/theme-provider.tsx` |
| Expose the resolved theme (what "Match my device" currently means), so the phone button can show a sun or a moon. Read it with `useSyncExternalStore` on the `prefers-color-scheme` query. A second `useState` would break the one-`useState` rule. | `theme-provider.tsx`, and the theme-provider notes in `react-state.mdc` and `docs/state-management.md` |
| Add a small inline script in `<head>` that sets the class before first paint, so dark users never see a white flash. | `apps/web/index.html` |
| Add `color-scheme: light` on `:root` and `color-scheme: dark` on `.dark`, so scrollbars and form controls follow the theme. | `globals.css` |
| Add `<meta name="theme-color">` and update it on change: `#f1f3f9` light, `#0b1429` dark. | `index.html`, `theme-provider.tsx` |
| Keep the `localStorage` key `theme` and its values. Both axe specs set it. | `e2e/dashboard.a11y.spec.ts`, `e2e/study.a11y.spec.ts` |
| Change the variant to `@custom-variant dark (&:where(.dark, .dark *));`. Today it is `(&:is(.dark *))`, which misses the `<html>` element itself and adds specificity. `:where()` adds none, so dark styles are easier to override. | `globals.css` |
| Add a small `prefers-contrast: more` block: muted text becomes default text, hairlines reach 3:1. | `globals.css` |
| Delete the hex comments in `globals.css`. They do not match the values. `--primary` is commented `#2563EB` and renders `#1447e6`. | `globals.css` |

Ship sRGB only for now. Wider-gamut (P3) colors would need a fallback for every token and all 73 colors already fit sRGB. Keep separate `:root` and `.dark` blocks. `light-dark()` is worth knowing about, but it cannot express a manual override as cleanly as the class.

---

## 9. Type, spacing and depth

### 9.1 Type scale

Six sizes, three weights, eight pairs. Today: 8 sizes, 4 weights, 15 pairs.

| Size | Weight | Used for |
| --- | --- | --- |
| 56 px, or 72 px when the hero is at least 520 px wide | 700 | The hero number. Nothing else. |
| 24 px on phones, 30 px from 640 px | 700 | The greeting (`h1`), and the hero's headline in states with no number ("All done for today", "Pick your first course"). |
| 20 px | 600 | "words to review". Section headings. |
| 18 px | 600 | Main button label. Course name in the hero. |
| 18 px | 400 | "About 3 minutes". |
| 16 px | 600 | Row titles. Second-level buttons. "All done". |
| 16 px | 400 | Every sentence. |
| 14 px | 600 | Labels only: day names, language codes, the "Theme" legend. Never a sentence, never gray. |

Removed: 12 px text, weight 500, uppercase labels, and the 30 px and 48 px stat sizes.

Why:

- **Nothing under 14 px, and every sentence at 16 px or more.** Guidance for older adults is 16 px minimum, and small text is harder to read in dark mode than in light.
- **One number is huge.** The next largest number on the page is 20 px. Today seven numbers are 24 px bold or larger, so none of them wins.
- **Visual size and heading level are separate.** The course name is the hero's `h2` at 18 px. The big number is styled text inside a paragraph. Screen readers get a sensible outline and the eye gets a clear ranking.
- Use stepped sizes for the number, not `vw` or `clamp()`. Viewport units ignore the user's zoom.
- The sidebar's nav links are 14 px gray today. They become 16 px in the default text tone.

### 9.2 Spacing

An eight-step scale where each step has one job.

| px | Job |
| --- | --- |
| 4 | Icon to its text |
| 8 | Items in a tight set: day marks, a title and its status line |
| 12 | A heading to its content. Buttons side by side. |
| 16 | Parts inside one surface. Phone gutter. Card padding on phones. |
| 24 | Groups inside a surface. Card padding on desktop. |
| 32 | Hero padding on desktop. Column gap. |
| 48 | Section to section |
| 64 | Page bottom |

Today one 32 px gap separates everything, so nothing reads as belonging together. Three distances do most of the work: 12 inside a group, 24 between groups, 48 between sections.

**Control heights:** 56 px main button. 48 px second hero button. 44 px row buttons, radio rows and the disclosure. Nothing a learner taps is under 44 px. Today chips and row buttons are 36 px and the hamburger is 32 px.

### 9.3 Depth

**Dark uses lightness steps and hairlines. Light uses shadows and hairlines.** Each theme uses the cue that works on its own ground.

| Element | Light | Dark |
| --- | --- | --- |
| Cards, course list | White on the page, 1 px border, a small two-part shadow | Lighter than the page, 1 px border, no shadow |
| Hero | A transparent 1 px border (so forced-colors mode can draw an edge). A larger shadow. | A visible 1 px border one step lighter. A soft glow. |
| Main button | 3 px darker bottom edge. A short shadow. | 3 px darker bottom edge. A soft amber glow. |
| Menus | The largest shadow | Lighter again |

- **Real borders, not rings.** Card edges today are `ring-1`, which is a box shadow and vanishes in Windows high-contrast mode.
- **Fewer lines.** About fourteen faint lines on the first screen become six.
- **The main button, in words:** amber fill, navy label at 18 px semibold, a play icon, a 3 px darker bottom edge. Hover: one step lighter and 1 px up. Press: one step darker and 2 px down. No movement when the device asks for reduced motion. This matches your rule for primary buttons: solid, tall, with depth.
- Radius: 8 px for buttons and badges (`rounded-lg`), 11.2 px for cards (`rounded-xl`), 14.4 px for the hero only (`rounded-2xl`). These come from the existing `--radius` of 0.5rem. The hero has the largest radius on the page, one more way it differs.

Shadow and glow values need tuning by eye in the real app. They are decoration and carry no meaning.

### 9.4 Refactoring UI, applied

| Principle | What violates it today | Fix |
| --- | --- | --- |
| Start with a feature, not a layout | The page is a grid of regions with equal weight. | Design the hero first. Everything else is arranged around it. |
| Size is not everything. Use weight and color. | 15 type styles do the ranking. | Three text tones, two weights, one huge number. |
| Emphasize by de-emphasizing | The active chip and the week dots are as loud as the button. | Quiet the competitors. Do not shout louder. |
| Labels are a last resort | "TODAY", "Due", "Streak", "Daily goal", "Words mastered". | Fold labels into values: "16 words to review", "12 days in a row". |
| Do not use gray text on colored backgrounds | Would happen on a navy hero. | A pale tint of the hero's own hue. |
| One primary, then secondary, then tertiary | The secondary button is wider than the primary. | Amber fill, then a tinted hero button, then quiet outlined row buttons. |
| You do not have to fill the whole screen | Content stretches to fill the main column. | A maximum content width. |
| Avoid ambiguous spacing | One 32 px gap everywhere. | 12, 24 and 48. |
| You need more colors than you think | Seven brand colors, two text tones. | Seven ramps, 73 colors. |
| Do not let lightness kill saturation. Grays do not have to be gray. | Dark surfaces at chroma 0.025. | Neutrals tinted toward hue 264 to 266, with more chroma as they darken. |
| Emulate a light source. Shadows show elevation. | No shadows anywhere. | Two-part shadows in light, lightness steps in dark, an edge on the button. |
| Use fewer borders | About fourteen hairlines on the first screen. | Surface steps and spacing first, borders last. |
| Do not overlook empty states | The caught-up state looks like a notice. | A check in a tinted circle, a kind sentence, opt-in actions. |
| Add color with accent borders | Every card is the same white box. | A 4 px warm edge on the tip card. |

---

## 10. Mobile

Phones get their own design pass. Stacking the desktop cards is not enough.

**First-screen budget on a 375 px phone** (about 550 px visible on a small phone, an estimate)

| Block | Ends near |
| --- | ---: |
| Top bar: logo, Theme, account, menu (44 px buttons) | y 56 |
| Greeting, one line | y 104 |
| Hero: name, number, phrase, time, main button | y 371 |
| Hero: second button | y 431 |
| Hero: bar and progress line | y 503 |

**Rules**

- Check that both hero buttons are fully visible at 375 x 550 and at 320 x 450, in English, with long titles, and in pseudo-long text.
- **The hero has one layout step.** Under 520 px wide the buttons stack. At 520 px or more they sit side by side under the text. This is a container query, so a landscape phone and a desktop column behave the same way.
- Container queries for everything inside cards (the hero, the course rows). Viewport breakpoints only for the page skeleton.
- Remove `whitespace-nowrap` and fixed heights from anything that holds translated text. Start with the shared Button: a draft Spanish label overflowed its button at 320 px.
- Targets are 44 px or more at every width and for every pointer. Mouse users do not get smaller targets.
- Reflow at 320 px and at 200% and 400% zoom without sideways scrolling. This already passes today and must keep passing.
- At 320 px, seven short day names may not fit. Fall back to narrow names there, with the full name as each mark's text alternative.
- Hover-only hints do not exist on touch. There are no keyboard shortcuts on the dashboard after the `d` key goes, so there are no `kbd` hints to show.

---

## 11. Accessibility

### 11.1 WCAG 2.2 AA: what the redesign must do

| Criterion | Requirement here |
| --- | --- |
| 1.3.1 Info and relationships | One `h1`. Each region is a `section` labeled by its `h2`. The desktop theme control is a `fieldset` with a legend. The progress numbers are a real table. "Your progress" keeps its `h2` outside the `<summary>`, because a heading inside a summary loses its heading role in some screen readers. The week marks are one list with a text alternative per day. |
| 1.3.2 Meaningful sequence, 2.4.3 Focus order | DOM order follows the picture, row by row. No CSS `order`. The path is: skip link, sidebar or top bar, then `main` in visual order. |
| 1.4.1 Use of color | Every state has a shape or a word: a check in studied days, a thick ring for today, a filled dot for the selected theme, a bar and `aria-current` on the active nav item. |
| 1.4.3 Contrast (text) | All pairs in section 7, checked per theme. |
| 1.4.4, 1.4.10 Resize and reflow | One column at 320 px. No fixed heights on text. |
| 1.4.11 Non-text contrast | Control borders, the focus ring and day marks at 3:1 or better. |
| 1.4.12 Text spacing | Nothing clips when users increase spacing. |
| 2.1.1 Keyboard | Everything works by keyboard. The main action is the first Tab stop inside `main`. From page load that is: Tab to the skip link, Enter, Tab. |
| 2.1.4 Character key shortcuts | The `d` shortcut is removed. |
| 2.4.1 Bypass blocks | A "Skip to main content" link is the first focusable element. |
| 2.4.2 Page titled | "Dashboard · Memli". Every route is titled "Memli" today, and no route sets a title, so this needs TanStack Router's head support added in `__root.tsx`. |
| 2.4.7 Focus visible | A solid 2 px outline with a 2 px offset, 6:1 or better. |
| 2.4.11 Focus not obscured | Nothing is sticky, so nothing can cover a focused control. |
| 2.5.3 Label in name | Accessible names start with the visible text. |
| 2.5.8 Target size | WCAG requires 24 px. This plan uses 44 px for buttons, rows, radios and menu items, which matches the stricter 2.5.5 (Level AAA) and platform guidance for touch. Stand-alone links ("Show all", "Find another course", the skip link) get a 44 px minimum height. |
| 3.1.2 Language of parts | Any text in the language being learned carries `lang`. Course titles written in the app's language do not. |
| 3.2.2 On input | Choosing a theme changes it at once, which is the expected result of that control. The Studying menu is a list of links (it changes the URL), keeps the scroll position, and returns focus to its button. |
| 3.2.3, 3.2.4 Consistent navigation and identification | Same labels and order for the nav and the theme control everywhere. One word per idea. |
| 4.1.2 Name, role, value | **Links are links.** Today every action is a Button that renders a Link, and Base UI adds `role="button"`, so a link is announced as a button. Navigation uses `<Link className={buttonVariants({ variant, size })}>` instead, which keeps the link role. `render={<Link />}` with `nativeButton={false}` stays only where a Base UI part needs it (menu items and triggers). The disclosure is a native `<details>`. |
| 4.1.3 Status messages | No live regions on static content. |
| Motion (`prefers-reduced-motion`) | The button's movement and the ring's fill are off when the device asks. Nothing loops. |

### 11.2 Beyond WCAG

- **One main task.** W3C's guidance for cognitive accessibility asks that the most important thing stands out visually and is visible without scrolling. That is the hero.
- **Every graphic has a sentence that says the same thing.** The bar has "200 of 1,000 words started". The week marks have "12 days in a row". If a sentence is ever cut to save words, its graphic goes with it. The hero bar's track is only 1.46:1 against the hero, which is acceptable only because the sentence carries the value.
- **Forced colors (Windows high contrast).** Cards and the hero use real borders (transparent where no visible edge is wanted), so the system can draw them. The button keeps its transparent border. Focus uses `outline`.
- **Streak ethics.** No streak in the greeting or the hero. A past day under the goal reads "goal not reached", never "missed", and is never red. The line hides at zero. Clearing the queue still counts as reaching the goal, as PLAN.md decided.
- **Light text on a dark hero.** Some people with astigmatism find light-on-dark text blurs. The hero holds about 22 words, the largest type on the page, at 9.7:1 or better. Paragraphs never sit on it.

### 11.3 Definition of done

The redesign is done when all of these are true.

**Focus**

- [ ] The first screen has exactly one amber shape (none in the all-done states).
- [ ] Both hero buttons are fully visible at 375 x 550, in the default, long-titles and pseudo-long cases.
- [ ] The hero's count equals the number of words the button opens.
- [ ] In a grayscale screenshot of each theme, the hero is still the first thing seen.
- [ ] With an 8 px blur, the main button is the most saturated shape, in both themes.

**Copy**

- [ ] 90 visible words or fewer in `main`. 6 headings or fewer. 14 numbers or fewer.
- [ ] No fact appears twice.
- [ ] No "deck", "due", "mastered", "retention" or "streak" in visible text.
- [ ] 3 boxes or fewer and 4 buttons or links or fewer in `main` above the fold at 1280 x 720.
- [ ] No em dashes. No sentence over 12 words.

**Type and targets**

- [ ] No text under 14 px. Every sentence is 16 px or larger.
- [ ] Every button, row action, radio, menu item and stand-alone link is at least 44 px tall.

**Color, checked separately in each theme**

- [ ] Every text pair meets 4.5:1 and its APCA target.
- [ ] Control borders and the focus ring meet 3:1.
- [ ] The token script (`verify.mjs`) passes, including the pairs this design added.
- [ ] Status is never shown by color alone.

**Theme**

- [ ] The control shows three labeled choices: one click on desktop, two taps on phones.
- [ ] The first visit follows the device setting. The choice persists.
- [ ] No flash of the wrong theme on load.
- [ ] The `d` shortcut is gone.

**Keyboard and screen reader**

- [ ] Skip link first. The main action is the first Tab stop in `main` (in `?preview=` pages, after the DEV-only preview switcher).
- [ ] Inside `main`, Tab order follows the picture row by row, at 375 px and at 1280 px.
- [ ] Links are announced as links.
- [ ] axe: 0 violations in all 11 preview states, both themes, at desktop and at 375 px, and once with "Your progress" open (axe skips closed content).

**Layout**

- [ ] No sideways scrolling at 320 px or at 200% zoom.
- [ ] Pseudo-long text (section 12) breaks nothing.

**People**

- [ ] The five-second and first-click tests pass (section 14).
- [ ] Each respondent can read everything on their own device, in the theme they choose.

---

## 12. Internationalization

The foundations are sound: `messages` objects, `Intl` formatters, logical CSS properties. "Fewer words and bigger numbers" adds some specific risks.

| Risk | What to do |
| --- | --- |
| **Short labels grow the most.** "Due" to "Pendientes" is more than three times as long. | Budget by length: 3x for strings up to 10 characters, 2x for 11 to 20, 1.6x for 21 to 50. No fixed widths. Buttons wrap. |
| **A big number plus a word may not fit.** "32 words" at 60 px is 272 px wide. "32 palabras" is 345 px, against about 287 px available. | The numeral stands alone on its line. The words sit under it at body size. |
| **The number and its words are separate fragments today** in three components. | One plural message with a tagged number: `<n>{count}</n> words to review`. |
| **Plural rules differ.** Spanish, Portuguese and French have a "many" form. Zero is "one" in French and Brazilian Portuguese. Arabic and Hebrew drop the digit for 1 and 2. | Zero is always its own state. Never write a literal "1". Let translators place or drop the number. |
| **Bare verbs are ambiguous.** "Review" can be a noun or a verb. | Every key gets a translator note: part of speech and what it acts on. |
| **Single-letter weekdays repeat** (two S, two T in English). | Short names from `Intl` ("Sun", "Mon"). The week start comes from the locale, as today. The `weekday()` formatter supports only `narrow` and `long` today, so it gains `short`. |
| **Names and titles in another script** can scramble a sentence. | Wrap course titles and names in `<bdi>` inside sentences. |
| **Language codes are jargon.** "ES" and "JA" mean little to a new learner. | Keep the badge, and make sure the language name is available as text, not only on hover. Never use flags: they stand for countries, not languages. |
| **Symbols do not travel.** A check mark means "wrong" in Swedish and Finnish schools. Owls are bad omens in several cultures. | Every icon is paired with a word. No mascot. |
| **Idioms and uppercase do not translate.** | "Caught up", "keep slipping" and "stick" are gone. No uppercase labels. |
| **"Words" is loose for kana and phrase courses.** | Accept it for now. If per-course nouns are added later, write whole messages per noun. Never insert a noun into a sentence. |
| **Right-to-left.** | Logical properties only (`ps`, `me`, `border-s`). Two physical classes in `AppSidebar.tsx` and three in `dropdown-menu.tsx` need converting. |

**Pseudo-localization.** Add a DEV-only switch that follows the `?preview=` pattern, for example `?pseudo=long|rtl|cjk`. Run it at 320, 375, 390, 667, 768, 1024 and 1440 px in both themes. Assert in tests that nothing overflows and that the main button stays above the fold.

The UI language and the learning language stay separate, as the repo rules require. The Studying menu is about what you study. The theme and any future UI-language setting are about the app.

---

## 13. Component plan

Repo rules apply throughout: semantic tokens only, Base UI primitives, shadcn components copied by hand (never the CLI), `messages` objects, discriminated unions for state, `Intl` through `useFormatters()`, and no unused exports (Knip runs in CI).

### 13.1 Existing files

| File | Verdict | What happens |
| --- | --- | --- |
| `TodayPanel.tsx` | Merge, then delete | Becomes `StudyHero.tsx`. Its four states keep their `switch` on `state.status`. |
| `FocusDeckCard.tsx` | Merge, then delete | The badge and title become the hero's heading row. The three-part bar becomes one fill. |
| `DeckList.tsx` | Restyle, rename `CourseList.tsx` | Rows lose "Last studied", the mini bar and the percent. One status sentence. 44 px buttons that are real links. Adds "Show all" (its one `useState`) and hosts the Studying menu, which stays uncontrolled because its value lives in the URL. The header renders even when a filter leaves no rows. |
| `ThisWeek.tsx` | Restyle | The goal ring and "Words mastered" go. Today's mark becomes the ring. Short day names. Colors move from `bg-primary` to the chart roles. `weekDays()` and its four statuses (goal reached, not reached, today, to come) are reused unchanged. |
| `MemoryCallout.tsx` | Restyle, rename `TipCard.tsx` | Props become a union: tricky words for one course, or a study tip. Word chips go. Gains a Practice link. |
| `ProgressTrends.tsx` | Restyle, rename `ProgressDisclosure.tsx` | A native `<details>`, closed by default, with three sentences and a per-course table. |
| `LanguageFilter.tsx` | Restyle | From chips to one menu of links. Still writes `?studying=`. Lives in the course list header. It shows when the unfiltered list of other courses has more than 5 rows in 2 or more languages, or when a filter is active. Its options come from the other courses, not the hero's. When the menu would be hidden, a `?studying=` value is treated as stale and removed with the existing replace-navigation. |
| `DashboardGreeting.tsx` | Keep, simplify | The status sentence and its props go. |
| `AppSidebar.tsx` | Restyle | New labels. Nav links at 16 px in the default tone. The theme card above the account button. Below `md`: the existing top bar gains a "Theme" button, and its two buttons grow to 44 px. Physical classes become logical. |
| `LanguageBadge.tsx` | Keep | Add a hero tone. |
| `LastStudied.tsx` | Delete, in the course-list step | `DeckList.tsx` imports it until then. After that nothing does, and Knip would fail. |
| `PreviewSwitcher.tsx`, `dashboard-previews.ts` | Keep | The 11 states and the axe spec keep working. |
| `dashboard-model.ts` | Keep, with changes | **`todayState` changes:** in the `review` state, `dueCount` and `minutes` describe the focus course only (16 and 3, where today they are 24 and 4), and `dueDecks` is removed. Add `startedCount(deck)` (mastered plus learning). `sortDecks`, `weekDays`, `estimateMinutes`, `deckTotal` and `deckAction` are reused unchanged. Knip fails on unused exports, so delete in the hero step: `todayPrimaryAction`, `isSameAction`, `totalDue`. Delete in the next step: `masteredRatio` (unless the progress table uses it), and drop the `export` from `TrickyWord`. `totalMastered` stays for "{count} words learned so far". |
| `lib/formatters.ts` | Keep, small changes | `weekday()` gains `short`. `relativeTime` loses its last caller and goes. |
| `dashboard-metrics.ts` | Keep | No contract change. |
| `dashboard.tsx` | Restyle | New grid with a container query. The filter applies to the list only. |

### 13.2 New pieces

| Piece | Where | Notes |
| --- | --- | --- |
| `StudyHero` | `routes/_app/-components/` | A `section` labeled by the course name. Its layout depends on its own width. The count is rendered with `rich()`. A picture slot that stays empty for now. |
| `ThemeControl` | `apps/web/src/components/theme-control.tsx` | Two presentations from one options array: a native radio `fieldset` for the sidebar and a menu for the phone top bar. It is the first caller of `useTheme()`, so the Knip ignore entry for the theme provider can go. |
| Page title | `routes/__root.tsx` and the dashboard route | No route sets a title today. Add the router's head support. |
| Skip link | `routes/_app.tsx` | Targets `<main id="main" tabIndex={-1}>`. |
| Button `variant="cta"` | `packages/ui` | `bg-cta text-cta-foreground`, the bottom edge, a transparent border. |
| Button `variant="hero-quiet"` | `packages/ui` | The tinted second button on the hero. |
| Button sizes: 44, 48 and 56 px | `packages/ui` | All use `min-h`, `h-auto` and wrapping text. They replace three hand-written 44 px overrides. |
| Focus style, everywhere | `globals.css` base layer, `button.tsx`, `input.tsx`, `badge.tsx` | A solid 2 px outline in `--ring` with a 2 px offset replaces the 50% transparent ring. The global rule matters because plain links, radios and `<summary>` inherit it. |
| Links as links | 7 call sites on the dashboard, 8 more in other route groups | `<Link className={buttonVariants(...)}>`. Update the "Button composition" line in `.cursor/rules/memli-stack.mdc` and the message in the `button-link` lint rule in the same step. |
| Tokens | `packages/ui/src/styles/globals.css` | The three-tier file in the appendix. `--radius`, `--marketing-header-clearance` and the `--color-brand-*` lines stay as they are. |
| Color check script | `packages/ui/scripts/` (proposed) | The script that checks every pairing, moved from `docs/designs/redesign-research/color/`. It needs two dev dependencies, `culori` and `apca-w3`. Confirm before adding them, as the repo rules ask. |

### 13.3 Where each control goes

| Control | Destination | Status |
| --- | --- | --- |
| Start review | `/study/$courseId?mode=review` | Exists. |
| Learn N new words, Start learning | `/study/$courseId?mode=learn` | Exists. |
| Learn N more new words | `/study/$courseId?mode=learn&extra=N` | Exists. |
| Practice (tip card, all-done hero) | `/study/$courseId?mode=practice` | The mode exists. The session sizes it by the course's tricky-word count. |
| Row "Review" and "Learn" | The same routes for that row's course | Exists. |
| Find a course, Find another course | `/community` | **A "Coming soon" page outside the app shell.** This is a known gap, as it is today. In the no-courses state, the page's only amber button leads there. |
| Studying menu options | `/dashboard?studying=xx` | Exists. |
| Community (nav) | `/community` | Leaves the app shell. |

### 13.4 Scope warning

**The token change affects the whole app, not only the dashboard.**

- The page gets one step darker, and dark mode changes everywhere.
- `--input` becomes a solid 3:1 border color. The outline Button and the Input use `bg-input/30` and `bg-input/50` fills in dark mode, which assume today's translucent white. Those fills must be dropped in the same step, or every outline button and input turns gray.
- Dark `--primary` becomes paler (section 7.6), so solid blue buttons in the study session look softer in dark mode.
- The study session's answer verdict uses `/10` tints under text, which section 7.8 retires. Fix it in the token step, because CI runs the study axe spec on every pull request.

Check the study session, sign-in and marketing pages in both themes before merging the token step.

---

## 14. Build order and testing

### 14.1 Phases

Each phase leaves the app working, with typecheck, lint, Knip and the axe specs passing.

| Phase | What | Why this order |
| --- | --- | --- |
| 0 | **Baseline tests.** Run the two people tests on the current page, including the naming question. No branch. | Without a baseline you cannot show the redesign is better. |
| 1 | **Tokens and theme.** Three-tier tokens, the color check script, `color-scheme`, the pre-paint script, `ThemeControl` (sidebar card and phone "Theme" button), remove `d`, fix the `bg-input` fills and the answer-verdict tints. Show the navy and brand-blue heroes to Crystal and Ben. | Dark mode becomes real and visible on its own. It is also the first time the colors are seen in a real browser. |
| 2 | **Buttons and focus.** The `cta` and `hero-quiet` variants, the 44, 48 and 56 px sizes, the global focus outline, links as links, the lint rule update. | Small, shared, and needed by everything after. |
| 3 | **The hero.** Merge Today and Continue learning. `todayState` change. Greeting. The new words, including the five session strings. | The biggest visible change. Show it to the four respondents before going further. |
| 4 | **The rest of the page.** This week, the course list and Studying menu, the tip card, the progress disclosure, the new grid, the page title. | Depends on the hero's final size. |
| 5 | **Phone pass.** 44 px top-bar buttons, the first-screen budget at 320 to 422 px, a 375 px Playwright project for the axe specs. | Phones get their own pass. The desktop-only axe run never sees the phone top bar today. |
| 6 | **Verification and docs.** axe in both themes for all states (and once with "Your progress" open), pseudo-localization, the people tests again. Update `dev/memli/docs/roadmap.md` and `docs/changelog.md`, and add a pointer at the top of `PLAN.md`. | Closes the loop. |

The decisions are settled, so every phase can go ahead in order. Phase 0 still runs the baseline tests, so there is something to compare the redesign with.

How this fits the repo's workflow:

- The work is tracked in [#151](https://github.com/hereisphil/2606-WDV349-CantuPhillip/issues/151). Each task in its checklist is one commit, and its box is checked in the same turn as the commit.
- Work happens on a branch named for the issue (for example `151-web-dashboard_redesign`), cut from a fresh `dev`. A phase can get its own branch and pull request if that keeps reviews small.
- Commits are tagged `[ui]` for `packages/ui` and `[web]` for the app, with `Refs #151`.
- Amber is a brand change. The architecture rules ask that brand changes be coordinated, so say so in the phase 1 issue, and plan the study session and marketing buttons as follow-ups.
- Browser checks follow the repo rule: headless Brave over the DevTools protocol against the local dev server, at phone and desktop widths, in both themes.

### 14.2 Two tests with real people

Run both on the **current** page first, then on the redesign. Use each person's own device and preferred theme. Anyone who prefers dark also does the five-second test once in light, on a different day, because both themes have to work. If you can, add two people who have seen none of the examples.

Say this first, word for word: "I'm testing a design, not you. There are no wrong answers. If something is confusing, that is the design's fault and it is exactly what I need to know."

**Five-second test.** Show a full-screen screenshot for five seconds, hide it, then ask in this order:

1. What is the first thing you remember seeing?
2. What do you think this page is for? What does it want you to do?
3. Was there a button? What did it say?
4. Do you remember any numbers? What were they about?
5. How did the page feel? (Offer no words to choose from.)
6. Was anything hard to read?

| Pass when | Target |
| --- | --- |
| The first thing remembered is the hero (the number, the course or the button) | 3 of 4 |
| The purpose is described as reviewing or studying words | 4 of 4 |
| The button is recalled as "Start review" or close | 3 of 4 |
| Nobody ties the hero number to the goal or the streak | 0 of 4 |
| Nobody says "busy" or "crowded" | 0 of 4 |
| Nobody reports text that was hard to read | 0 of 4, in either theme |

**First-click test.** On the live page, read each task aloud and time the first click or tap. The tasks avoid the words on the buttons.

| Task | Correct first click | Pass |
| --- | --- | --- |
| "You have five minutes free. You want to go over words you have already started." | The main button | 4 of 4, within 5 seconds |
| "Now you would rather pick up some brand new words." | "Learn 10 new words" | 3 of 4, within 10 seconds |
| "You want to work on your Japanese today, not Spanish." | The Japanese row's button | 3 of 4, within 10 seconds |
| "The screen is too bright for you. Change it." | The theme control (on a phone, the Theme button) | 3 of 4, within 10 seconds |
| "Without clicking: how many days in a row have you studied?" | They say 12 | 3 of 4, within 10 seconds |

Then point at "Spanish Core 1000" and ask "What would you call this?" Write down the noun. Then ask "Which fits best: deck, course, list, or set?" This settles Crystal's question with evidence. Ask it in phase 0, before anything is renamed.

Four people is a smoke alarm, not a statistic. One miss is a signal. Two is a problem.

---

## 15. What is fun about it, and what comes later

Be clear about what version one delivers. People voted for color, depth and imagery. Version one delivers color and depth. **It has no pictures**, because the dashboard's data has no images yet. The first follow-up issue should be the picture in the hero.

**In this plan**

1. **A night sky with one lamp.** Deep navy with one amber button glowing on it. It has a mood, which is the word Woodson used.
2. **The lamp goes out when you are done.** In the all-done state the amber is gone and a big check takes its place.
3. **A button you want to press.** It has an edge, it rises on hover and it sinks on press.
4. **Today's circle fills as you study.** Finish a session, come back, and the ring has moved.
5. **A row of checks you earned.** Crystal circled exactly this. Days under the goal are only blank.
6. **One warm card** that changes: a nudge about tricky words when you have some, a study tip when you do not.

**Later, each as its own issue, in suggested order**

| Idea | From | Blocked on |
| --- | --- | --- |
| **A memory postcard in the hero.** A community memory trick for a word you already know: the picture, the word, "You remembered this one". Mnemonics are what only Memli has, and old Memrise users said theirs were buried. Never show the trick for a word that is about to be reviewed, because that gives away the answer. | Playful memory | The dashboard contract has no image field. Needs #50 and #112. |
| **The amber button on the study session**, then the marketing pages. | Color research | Decision 1. Each screen needs a navy band or the button's darker edge. |
| **A month calendar** (Crystal's "Github chart"). Five rows of weeks with a check per day the goal was reached, built as a real table with a one-sentence summary. It gains a row for each week you study, so a new learner never sees an empty grid. | Playful memory, accessibility research | The contract holds 7 days. Needs #112. Lives on a Progress page or inside "Your progress". |
| **A Progress page.** The home for trends, the per-course breakdown and the calendar. | All three | A new route. |
| **A real next-review time** in the all-done state: "Next review tomorrow." | Old Memrise's level page | A next-review date in the contract (#112). |
| **Nearer milestones.** "200 of 1,000" moves slowly. Levels or chapters inside a course would give a closer goal. | Old Memrise's course page | Course structure in the data. |
| **The daily goal in minutes**, with a few choices, as old Memrise offered (5, 15 or 45 minutes a day). | Old Memrise | A settings page and a way to measure time. |
| **Small celebrations** at 7, 30 and 100 days in a row. | Other apps research | After the basics. Motion-safe only. |
| **A growth picture per course** (seed to flower, five stages). | Playful memory | Needs original art drawn well. Weak art would look like clip art. |
| **A bottom bar on phones.** | All three proposals | Three real in-app destinations. Today there is one. |
| **Cross-course review**, so the hero can show the total again. | PLAN.md open decision | A session route beyond `/study/$courseId`. |

No mascot. One clip-art owl reads as stock art, and owls do not mean wisdom everywhere.

---

## 16. Decisions

**Settled on 13 November 2026: all ten on the recommended default.** The current brand colors were a direction, not a commitment, so decision 1 is a planned brand change, not a risk to avoid. The alternatives stay in the table so the reasons are on record.

| # | Decision | Chosen | The alternative, and what each costs |
| --- | --- | --- | --- |
| 1 | **Main button color.** | Amber on the hero, through the `--cta` role. | Blue. Amber is a brand shift, cannot sit on a white card (1.57:1), and leaves the study session with a blue main button until it follows. Blue keeps the brand but needs a pale hero, which brings back "nothing draws the eye". If you will not take amber app-wide eventually, choose blue. |
| 2 | **Hero color in the light theme.** | Deep navy. | Brand blue (section 7.6.1). Navy gives the button the most punch and matches dark mode. Brand blue is brighter and less heavy on a phone. Show both to Crystal and Ben in phase 1. |
| 3 | **"Deck" becomes "course".** | Yes. Confirm with the naming question in phase 0. | Keep "deck". The code, the URL and old Memrise all say "course". |
| 4 | **The hero's progress line counts words started** (mastered plus learning). "Learned" keeps meaning mastered. | "200 of 1,000 words started". | "52 of 1,000 words learned" (strict and slow), or calling all 200 "learned" (friendlier, but it claims a word is learned after one look). |
| 5 | **"Cards" become "words".** | Yes. | Keep "cards". "Words" is loose for the kana course and for phrase courses. |
| 6 | **The hero counts one course (16), not all (24).** | Yes, until cross-course review exists. | Build cross-course review first. Until then nowhere shows the total, and a learner with several courses runs several sessions. |
| 7 | **The Studying filter leaves the top of the page.** | Yes. It moves into the course list and shows only with more than 5 other courses. | Keep a compact switcher near the top. You liked the language switcher in examples 2 and 5. The cost is height above the main button and a hero that jumps. |
| 8 | **The streak leaves the greeting.** | Yes. It shows once, in This week. | Keep it in the greeting, as PLAN.md decided. The cost is saying it twice and framing study as protecting a streak. |
| 9 | **APCA as a hard gate for text.** | Yes: text must pass both WCAG 2.2 and APCA. | WCAG 2.2 only. That is the legal baseline, and it is what let today's dim dark-mode text through. |
| 10 | **Dark-mode blue buttons.** | The paler blue (#c8dcff), so labels pass APCA. | A middle blue (#77a6ff): stronger-looking buttons in the study session, with a label at 8.05:1 and Lc 56. |

Smaller choices made here that you can overrule:

- The time-of-day greeting stays.
- The week row keeps the calendar week from the locale. A rolling "last 7 days" row is the alternative if Mondays look empty.
- The theme card is always visible in the desktop sidebar. A compact control inside the account menu is the alternative if the card feels heavy.
- No bottom bar on phones yet.
- "Consistency" and "Global average" are deleted, not moved.
- The nav item is called "Dashboard", to match the rest of the product.

Not decisions, but consequences you should know about: the token change is app-wide (section 13.4), the heatmap ships as a 7-day row until the data exists, and the hero ships without a picture.

---

## 17. Risks and what is not verified

### 17.1 The three biggest risks

**1. Two looks until amber is rolled out, and an accent that cannot stand on white.**
Amber is chosen. Until the study session and marketing pages follow, the dashboard's main action is amber and theirs is blue. Some old Memrise users disliked the 2019 switch to yellow buttons.
*What reduces it:* make the study session's main button the first follow-up issue. The choice sits behind one role, so it is still cheap to adjust.

**2. Calm may read as plain, and the light theme may read as heavy.**
The gut vote went to the two busiest, most colorful examples. This design answers your four problems mostly by removing things. On a phone, the light theme's first screen is about three quarters deep navy. Crystal and Ben picked a white, illustrated example, and version one gives them neither white nor pictures on that first screen.
*What reduces it:* decision 2 offers a brighter hero for the light theme. Build the hero first and show it to the same four people, in both themes, at full size, before building the rest. Treat the postcard and the Progress page as the next issues, not as someday.

**3. Nothing has been seen in a browser, and dark mode's surfaces are still close together.**
Every size is arithmetic and every contrast number is computed. By this plan's own yardstick (surface steps of 1.04 to 1.12:1 are "the problem"), dark mode improves less than light: card against page is 1.15:1, and the hero against the page is 1.58:1. The dark hero stands out by chroma, by its border and by what is inside it. Chroma does not survive a grayscale test.
*What reduces it:* phase 1 puts the tokens in the real app first. Look at it on a real phone in a dark room and in daylight. If the dark hero does not read as a panel in a blurred screenshot, adopt the brighter hero in section 7.4 (2.11:1) and rerun the color script.

**Known gaps that are not new**

- "Find a course" leads to a "Coming soon" page. In the no-courses state that is the only button on the page.
- Community leaves the app shell.
- The theme control exists only inside the app shell. The study session, sign-in and marketing pages follow the stored choice but cannot change it.

### 17.2 Not verified

- **No rendering.** No screenshot of the redesign exists. A static mock of the tokens was rendered once, and nothing else.
- **No real phone.** The 550 px visible height for a small phone is an estimate from secondary sources. Safari's toolbars and safe areas were not observed.
- **No screen reader, forced-colors or `prefers-contrast` test** of the new design.
- **Extra color pairs.** Pairs this design adds (the hero chip and its border, the tip card, the button edge, the brand-blue hero, the brighter dark hero, the middle dark blue) were computed with the same libraries but are outside the gated run. They must be added to the script.
- **The count of boxes and buttons above the fold** comes from the wireframes, not from a rendered page.
- **Shadows, glows and hover motion** are untuned.
- **Translations.** Every Spanish and Portuguese string used for width checks was an unreviewed draft.
- **Books.** *Refactoring UI* was applied from its official table of contents, two official preview pages and reader summaries. *Interaction of Color* was cited from its table of contents and summaries. Neither was read in full for this plan.
- **Research read in summary only:** the streak papers, the first-click study, and most competitor home screens (no product was logged into).
- **Old Memrise.** The logged-in dashboard is reconstructed from 2017 CSS and JavaScript and 2016 video frames. Exact spacing is not verified, and the video was not watched in motion.
- **The feedback.** Four people, a 2 to 2 tie, thumbnail-size images, and devices and chat themes unknown.
- **Study tips.** The draft tips are common study advice and are not sourced.

---

## 18. Sources

**Color**

- Andrey Sitnik and Travis Turner, Evil Martians, ["OKLCH in CSS: why we moved from RGB and HSL"](https://evilmartians.com/chronicles/oklch-in-css-why-quit-rgb-hsl)
- Björn Ottosson, ["A perceptual color space for image processing"](https://bottosson.github.io/posts/oklab/)
- Material Foundation, [material-color-utilities, color spaces](https://github.com/material-foundation/material-color-utilities/blob/main/concepts/color_spaces.md) (HCT)
- Myndex, ["APCA in a Nutshell"](https://git.apcacontrast.com/documentation/APCA_in_a_Nutshell.html) and the [apca-w3 README](https://github.com/Myndex/apca-w3)
- Tailwind CSS, ["Theme variables"](https://tailwindcss.com/docs/theme) and ["Dark mode"](https://tailwindcss.com/docs/dark-mode)
- MDN, [`color-scheme`](https://developer.mozilla.org/en-US/docs/Web/CSS/color-scheme), [`light-dark()`](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/light-dark), [`prefers-contrast`](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-contrast)
- Apple, Human Interface Guidelines, ["Dark Mode"](https://developer.apple.com/design/human-interface-guidelines/dark-mode)
- Josef Albers, *Interaction of Color*, Yale University Press, 1963
- Software: [culori](https://culorijs.org) 4.0.2 and apca-w3 0.1.9

**Accessibility and usability**

- W3C, [Web Content Accessibility Guidelines 2.2](https://www.w3.org/TR/WCAG22/)
- W3C, [Understanding 1.4.11 Non-text Contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html), [2.1.4 Character Key Shortcuts](https://www.w3.org/WAI/WCAG22/Understanding/character-key-shortcuts.html), [2.5.8 Target Size](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)
- W3C, [Making Content Usable for People with Cognitive and Learning Disabilities](https://www.w3.org/TR/coga-usable/)
- W3C, [Older Users and Web Accessibility](https://www.w3.org/WAI/older-users/)
- Nielsen Norman Group: ["Dark Mode vs. Light Mode"](https://www.nngroup.com/articles/dark-mode/), ["Usability for Older Adults"](https://www.nngroup.com/articles/usability-for-senior-citizens/), ["Low-Contrast Text Is Not the Answer"](https://www.nngroup.com/articles/low-contrast/), ["Progressive Disclosure"](https://www.nngroup.com/articles/progressive-disclosure/), ["Visual Hierarchy in UX"](https://www.nngroup.com/articles/visual-hierarchy-ux-definition/), ["Dashboards: Making Charts and Graphs Easier to Understand"](https://www.nngroup.com/articles/dashboards-preattentive/)
- Christine Perfetti, ["5-Second Tests"](https://articles.centercentre.com/five_second_test/)
- digital.gov, [Plain language guide](https://digital.gov/guides/plain-language)
- web.dev, ["Improved dark mode default styling with the color-scheme CSS property"](https://web.dev/articles/color-scheme)

**Mobile and i18n**

- Steven Hoober, ["Design for Fingers, Touch, and People, Part 1"](https://www.uxmatters.com/mt/archives/2017/03/design-for-fingers-touch-and-people-part-1.php)
- W3C Internationalization: ["Text size in translation"](https://www.w3.org/International/articles/article-text-size), ["Inline markup and bidirectional text in HTML"](https://www.w3.org/International/articles/inline-bidi-markup/), ["Personal names around the world"](https://www.w3.org/International/questions/qa-personal-names)

**Design**

- Adam Wathan and Steve Schoger, [*Refactoring UI*](https://www.refactoringui.com/), including the previews ["Labels are a last resort"](https://www.refactoringui.com/previews/labels-are-a-last-resort) and ["Building your color palette"](https://www.refactoringui.com/previews/building-your-color-palette)

**Learning apps and streaks**

- Duolingo blog: ["Improving the streak"](https://blog.duolingo.com/improving-the-streak/), ["How Duolingo's streak builds habit"](https://blog.duolingo.com/how-duolingo-streak-builds-habit/)
- Jackie Silverman and Alixandra Barasch, "On or Off Track: How (Broken) Streaks Affect Consumer Decisions", *Journal of Consumer Research* 49(6), 2023
- WaniKani Community, ["The New Dashboard is Here"](https://community.wanikani.com/t/the-new-dashboard-is-here/71904)

**Old Memrise**

- ["Memrise review", Pyers English, 19 July 2016](https://www.youtube.com/watch?v=juNdykvLxLA) (captions and still frames)
- [Dashboard CSS, 15 March 2017](https://web.archive.org/web/20170315161754/https://d107cgb5lgj7br.cloudfront.net/garden/dist/css/views/dashboard-7eacacfc4.css) and [dashboard JavaScript, 15 March 2017](https://web.archive.org/web/20170315161753/https://d107cgb5lgj7br.cloudfront.net/garden/dist/js/dashboard-349aefef4.js)
- [Rebrand CSS, 22 October 2019](https://web.archive.org/web/20191022121853/https://static.memrise.com/dist/css/rebrand-adeaf3eab713.css)
- Memrise blog, ["The Creation of Decks and the Future of Memrise", 21 February 2019](https://web.archive.org/web/20190222225614/https://blog.memrise.com/2019/02/21/decksbymemrise/)
- Memrise forum, ["Important announcement about Decks", February 2020](https://web.archive.org/web/20200304114659/https://community.memrise.com/t/important-announcement-about-decks/49470)
- The six Wayback Machine captures from March 2016: the [landing page](https://web.archive.org/web/20160306192808/https://www.memrise.com/), [sign-up](https://web.archive.org/web/20160316115012/https://www.memrise.com/join/), [about](https://web.archive.org/web/20160318075542/http://www.memrise.com/about/), [course catalogue](https://web.archive.org/web/20160313184443/http://www.memrise.com/courses/english/languages/), [course page](https://web.archive.org/web/20160312124128/http://www.memrise.com/course/12/introduction-to-japanese/) and [level page](https://web.archive.org/web/20160307055604/http://www.memrise.com/course/12/introduction-to-japanese/2/)

**Project files**

- [dashboards/README.md](./dashboards/README.md), [dashboards/PLAN.md](./dashboards/PLAN.md) and the five example images
- `dev/memli/packages/ui/src/styles/globals.css`
- `dev/memli/apps/web/src/routes/_app/dashboard.tsx` and `-components/`
- `dev/memli/apps/web/src/components/theme-provider.tsx`
- `dev/memli/docs/i18n.md`, `mobile.md`, `product-ux.md`

---

## Appendix. Proposed tokens

Tier 1 (primitives) and tier 2 (roles). Tier 3 is one `--color-*: var(--*)` line per role inside `@theme inline`, following the pattern already in `globals.css`. The hex comments are generated from the OKLCH values.

```css
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

  /* Aliases for the existing shadcn names. Today these are literal values. */
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
  /* The alias block above resolves per theme, so it is not repeated here. */
}

/* Option A (blue main button): replace the five --cta lines, and also put the
   button on the pale hero (--hero-soft) with dark text. Blue cannot sit on the navy hero.
   light: --cta: var(--blue-700); --cta-foreground: var(--neutral-0);
          --cta-hover: var(--blue-800); --cta-active: var(--blue-900); --cta-edge: var(--blue-900);
   dark:  --cta: var(--blue-200); --cta-foreground: var(--navy-950);
          --cta-hover: var(--blue-100); --cta-active: var(--blue-300); --cta-edge: var(--blue-500); */
```

Notes for whoever applies this:

- The alias block keeps every utility that is in use today working: `text-secondary-foreground`, `text-card-foreground`, `text-popover-foreground`, the `sidebar-*` utilities, `text-streak-foreground` and `bg-chart-1` to `bg-chart-5`. The chart aliases can go once the mastery bars are rewritten.
- `--radius`, `--marketing-header-clearance` and the `--color-brand-*` lines in `@theme` are not shown here and stay as they are.
- `--input` changes from a translucent white to a solid border color in dark mode. Drop the `bg-input/30` and `bg-input/50` fills from the outline Button and the Input in the same step.
- The scripts that produced and checked these values are saved in [redesign-research/color/](./redesign-research/color/). Phase 1 moves the check next to the tokens, so any later change to a value is re-checked.

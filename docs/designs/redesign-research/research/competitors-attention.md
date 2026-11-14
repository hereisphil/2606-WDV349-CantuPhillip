# Competitors and attention: how learning apps make one action dominate

> **Correction.** The brief given to the researchers wrongly described one respondent as older and as having weak eyesight. That remark in the chat was the owner's, about himself. Statements in this file that relied on it have been corrected. See `feedback-examples.md`, section 2.

Research for the Memli `/dashboard` redesign. Research and planning only. Nothing in the repository was edited.

**How to read the evidence tags**

- **[F]** I fetched the page and read it in this session.
- **[S]** I only saw a search-result summary of the page. Treat as likely but not confirmed.
- **[PK]** My own prior knowledge. Not checked against a source in this session.
- **[M]** I measured it on the live page at `http://localhost:5173/dashboard?preview=default`.

Numbers in "Sources" at the end match the bracketed numbers in the text, like [3].

---

## 1. The short version

1. Every successful home screen in this category answers one question with one control. Duolingo has the next node on the path. Anki has "Study Now". RemNote has "Practice X Cards". WaniKani has Reviews. The stats sit around that control, smaller and quieter.
2. Memli's current page has the right content order but the wrong weights. On a 1440 x 900 screen the Start review button is 126 x 44 px, which is 0.43% of the viewport [M]. The same solid blue is also used on the active language chip, five weekday checks, and the goal ring. So the button does not "pop out". It is one blue shape among several.
3. The page repeats itself. "About 4 minutes" appears twice. The streak appears twice. "Spanish Core 1000" appears three times before the Other decks list. Cognitive load research calls this the redundancy effect [20].
4. On a 375 x 812 phone the Start review button sits at y = 751 to 795 [M]. Browser toolbars cover that area on a real phone [PK]. The main action is effectively below the fold.
5. The fix is not more features. It is one hero (count + mnemonic image + one big button), two quiet supporting pieces (this week strip, your decks), and everything else moved down or behind a disclosure.
6. Streak research supports what Memli already decided: keep the streak easy to extend, never punish a diligent learner, and never spotlight a broken streak [7][8][9][22][23].
7. A heatmap is a good motivation device for people with history, and a bad one for new people (an empty grid looks like failure). Use a 7-day strip on the first screen and a 5-week calendar grid as a secondary view. Build it as a real table with text in every cell [15][16][17][18].

---

## 2. Baseline: what the current first screen does

Measured on the live page, default preview, light theme [M].

| Measure | Desktop 1440 x 900 | Phone 375 x 812 |
| --- | --- | --- |
| Words visible in `main` on first screen | 165 | 58 before the button |
| Total words in `main` (including screen-reader-only text) | 229 | 229 |
| Headings (`h1` to `h3`) on first screen | 7 | 2 |
| Start review button size | 126 x 44 px | 279 x 44 px |
| Start review button share of viewport | 0.43% | 4.03% |
| Start review button top edge | y = 484 | y = 751 (bottom edge 795 of 812) |
| Page height | not measured | 2,828 px (3.5 screens) |

The brief's own count is 217 words, 12 headings, 9 interactive controls, 15 font size and weight pairs. My word count is higher because it includes visually hidden text.

**Squint test on the light screenshot** (my reading of the image, method from NN/g [11][12]):

- Largest dark shape: the numeral "24".
- Saturated blue shapes of similar size: the "All languages" chip, the Start review button, five weekday check circles, the goal ring arc. That is four blue clusters. None is clearly the biggest.
- Boxes: Today panel (pale tint), Continue learning card, This week card, tricky words card. Four boxes with near-equal visual weight, and the Today panel has the weakest edge because its tint is close to the page background.

**Repeated facts on the first screen** (from the visible text in the brief):

| Fact | Times shown | Where |
| --- | --- | --- |
| "About 4 minutes" | 2 | greeting line, Today panel |
| 12-day streak | 2 | greeting line, This week card |
| "Spanish Core 1000" | 3 | Today breakdown chip, "Starts in" line, Continue learning card |
| 16 due | 2 | Today breakdown chip, Continue learning card |
| 10 new | 2 | "Learn 10 new words" button, Continue learning card |
| The number 24 | 2, with two different meanings | "24 cards ready to review" and "24 of 50" in the goal ring |

The last row is a seed-data coincidence, but it shows a real risk: two large numerals near each other with different meanings.

---

## 3. Competitor review

### 3.1 Summary table

| Product | Single dominant element | Competing elements on first screen | Review versus learn | Where secondary stats go | Dark mode | Complaints | Evidence |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **Duolingo** | The next node on "the path" | Top bar chips (streak, gems, hearts), bottom tab bar | Merged. Review is mixed into the path so it "feels like forward progress" | Small icon + number chips in the top bar. Quests and leagues moved to tabs | Official dark mode exists [S]. Exact colors not verified | Loss of choice. "forces you down a learning path" | [1][2][3] F |
| **Anki desktop / AnkiWeb / AnkiMobile** | None on the deck list. On the deck overview: "Study Now" | Every deck row has equal weight | Three counts per deck: New, Learn, Due. Blue, red, green | Separate Stats screen | Follows system. Not checked | New users misread the done message as "deck complete" | [4][5][6] F and S |
| **WaniKani** | Historically two big tiles: Lessons and Reviews [PK]. Since Oct 2025 a widget grid | Many widgets, user-arranged | Two separate tiles with counts | Widgets: Review Forecast, Level Progress, others | No official dark mode as of Oct 2025. Users rely on scripts | "cluttered", info pushed down, scripts broke, no reduced motion | [24][25][26] F |
| **Bunpro** | Learn and Review buttons [S] above a forecast graph | Forecast, activity graph, SRS progress tiles, community posts | Two buttons. Review has a drop-down | Graphs below the buttons | Has a dark theme (users mention it) | Users disliked the drop-down. Wanted a non-cumulative forecast | [27] F, [28] S |
| **RemNote** | Blue "Practice [X] Cards" button in a Today's Goal box | 7-day bar graph, document list | Due cards in the main button. New material in a separate "Learn New Content" section | Streak flame in the sidebar. Per-document due counts in the list | Not checked | Not researched | [29] F |
| **Clozemaster** | Play button for the current collection | Ready For Review box, collections list | Play = new sentences (plus some due). Review = separate button | Cog icon in the review box | Not checked | 2024 redesign: "It's all so big!", more scrolling, features hidden | [30] F, [31] S |
| **Memrise (today)** | Not verified. Home tab holds "My Activities" [S] | Tabs: Scenarios, Videos, Conversations | Learn and Review sections inside Scenarios | Not verified | Not checked | Community courses removed from the app on March 31, 2024. Users unhappy | [32] F, [33] S |
| **Headspace** | Today tab: a short list of sessions for morning, afternoon, night [S] | Few. One list | Not applicable | Profile screen | Not checked | Home "is quite long and requires significant scrolling" [S] | [34][35] S |
| **Streaks (habit app)** | A grid of large circles, one per task | Up to 6 circles per page in the 2016-era design. Up to 24 tasks today | Not applicable | Back of the card | Not checked | Not researched | [36] S |
| **Lingvist** | "Learn" button in the bottom bar | Three daily goals | Merged into one stream | Goals: 100 cards, 20 new words, 80% correct | Not checked | Not researched | [37] S |
| **Babbel** | Next lesson (not verified) | Home, Review, Live, Explore tabs | Review is its own tab. "Babbel will recommend vocabulary sessions when you have words to practise" | Not verified | Not checked | Not researched | [38] S |
| **Busuu** | 2023 web home redesigned around a to-do list | Not verified | "Smart Review" in one place | Not verified | Not checked | Not researched | [38] S |
| **Khan Academy** | "Up next" button in course mastery | Course list | Not applicable | Course mastery page | Not checked | Not researched | [39] S |
| **Quizlet, Drops, Brainscape, Mochi** | Not verified in this session | | | | | | PK only, see 3.3 |

### 3.2 Notes on the products with solid evidence

**Duolingo: one path, one next step** [1][2][3]

- The stated reason for the 2022 home redesign: learners said they were "not sure whether they're using Duolingo the 'correct' or 'best' way" [1]. The answer was a "clear path to follow" [1].
- Review is not a separate chore. Practice sessions are built into the path so review feels like forward progress [1].
- Duolingo's VP of Design: "we're not an education company. We're a fun and motivation company." and "Fun is the most important part of the work we do." [3]
- The cost: users lost choice. One wrote that it "forces you down a learning path that Duolingo says is best for you" [2].
- **What Memli should take:** one obvious next step, and review framed as progress. **What to avoid:** removing the learner's freedom to pick a deck. Memli's deck list keeps that freedom, so the list must stay reachable in one scroll.

**Anki: honest counts, weak hierarchy** [4][5][6]

- The deck list shows New, Learn, and Due counts for the day [4]. Colors: blue for new, red for learning, green for review [5].
- Clicking a deck opens the overview with a "Study Now" button [4].
- When the day's cards run out Anki says "Congratulations! You have finished this deck for now." Several forum threads show new users reading this as "the deck is finished" or "something is broken" [6].
- **What Memli should take:** the review versus learn split is a real distinction that learners come to rely on. A done state is a moment to celebrate. **What to avoid:** three colored numbers per row with no words. And done-state copy that does not say when the next cards arrive.

**WaniKani: the widget dashboard and the backlash** [24][25][26]

- On October 6, 2025 WaniKani replaced its dashboard with user-arranged widgets [25].
- Praise: "this is a HUGE improvement!" [25].
- Complaints: a user said the redesign "doesn't seem to do a good job at recreating the dashboard layout that was already there" [25]. Another: "The new widgets do not respect `prefer-reduced-motion`." [25] Another: "Broke modded dark mode and still no official dark mode." [25] Search summaries of later pages of the same thread mention users calling the uniform widgets "cluttered" and saying the information they care about moved further down [26].
- A search summary says some users welcomed a built-in heatmap, which they used to get from a userscript [26]. I could not confirm this in an official WaniKani page.
- **What Memli should take:** people want the heatmap and people want dark mode badly enough to install scripts for both. **What to avoid:** equal-size widgets. Uniform boxes are exactly the "no priority" problem the owner already rejected in the Week 1 prototype (`docs/designs/dashboards/README.md`).

**Clozemaster: bigger is not automatically clearer** [30]

- The October 2024 redesign aimed to make "the play button for the current collection" immediately visible after feedback that the dashboard was cluttered (staff reply) [30].
- Users pushed back: "I now have to scroll down to find collections. It's all so big!" and "the play buttons are so big that it overpowers the progress bars." [30]
- **Lesson for Memli:** enlarge one thing, not everything. If every row gets a big button, nothing is dominant and the list gets longer.

**RemNote: the closest structural match** [29]

- One blue "Practice [X] Cards" button inside a Today's Goal box. It opens a global queue across all topics.
- New material sits in a separate "Learn New Content" section under the goal.
- Two targets: a small "streak goal" that is "the one to hit first", then the full daily goal.
- **What Memli should take:** this is the same two-tier idea Duolingo proved with an experiment (section 5). It also shows the cross-deck "review everything due" button that Memli's PLAN.md lists as an open decision (`docs/designs/dashboards/PLAN.md`, section 8).

**Memrise today: the gap Memli fills** [32][33]

- Community courses left the app and main site on March 31, 2024 [32][33]. Users were unhappy [33].
- Memrise's own page still says "Mems turn vocabulary into something you can see" [32].
- **What this means for Memli:** mnemonic imagery is the differentiator and the nostalgia. It belongs in the hero, not in a side card.

### 3.3 Prior knowledge only (not verified in this session)

Use these as hypotheses, not facts.

- **Quizlet:** home leads with a "jump back in" card for the last set, then recents. [PK]
- **Drops:** sessions are capped at five minutes on the free tier. The time limit is the pitch. [PK]
- **Brainscape:** each deck shows a mastery percentage and a Study button. Learners rate confidence 1 to 5. [PK]
- **Mochi:** a deck list with a due count and a review button per deck. [PK]
- **WaniKani before 2025:** two large colored tiles, Lessons and Reviews, each with a count, above a review forecast and level progress. [PK]
- **Duolingo dark mode:** uses a dark blue-grey, not pure black. Third-party sites disagree on the hex value and I could not reach the official page. [PK, unverified]

---

## 4. Attention science, applied to this page

Each row: what the principle says, the source, and what it means for Memli's dashboard.

| Principle | What it says | Source | What it means here |
| --- | --- | --- | --- |
| **Preattentive attributes** | The eye picks out certain features in under 200 to 250 ms, before attention: hue, intensity, size, orientation, closure, and others. But a target defined by a *combination* of features that others share "normally cannot be detected preattentively." | Healey, NCSU [10] F | Start review is "blue and solid". So are the active chip and the weekday checks. The button is a conjunction target. Make it unique on one feature: the only large saturated fill on the screen. |
| **Visual hierarchy** | Hierarchy comes from contrast with the surroundings, scale, and grouping. Use no more than 3 sizes. Limit large elements to 2. | NN/g [12] F | The page has 15 size and weight pairs. Cut to about 6. Only two things may be large: the count and the button. |
| **Squint or blur test** | Squint, or blur the design 5 to 10 px, to see what is emphasized without reading. A 20 px blur can reveal an unintended focal point. | NN/g [11][12] F | Add a blur check to the definition of done (section 9). |
| **Von Restorff (isolation) effect** | Among similar items, the one that differs is remembered. "Use restraint when placing emphasis on visual elements to avoid them competing with one another." Do not rely on color alone. | Laws of UX [13] F | One isolated element. Every other use of solid primary on the first screen has to change: the chip becomes an outline or a menu, the checks become a quieter tone. |
| **Figure and ground** | The eye splits a scene into a figure with clear edges and a quieter ground. Contrast drives the split. | General design sources only [14] S. I did not find an NN/g or IxDF page in this session. | The Today panel is a pale tint on an off-white page. Its edge is weak, so it does not read as "the figure". Karen said the same thing in plain words: "The white background makes the words disappear. The writing pops up" on the dark one. Give the hero a strong edge: a clear lightness step from the page, or a shadow, in both themes. |
| **Fitts's law** | "The time to acquire a target is a function of the distance to and size of the target." Make targets large, spaced, and easy to reach. | Laws of UX [19] F | 126 px wide is small for the main action. Make it at least 240 px wide on desktop and full width on phones, 48 to 56 px tall. On phones keep it in the thumb zone and above the fold. |
| **Hick's law** | Decision time grows with the number and complexity of choices. "Avoid overwhelming users by highlighting recommended options." | Laws of UX [21] F | Five language chips come before the main action in both reading order and tab order. Move the filter out of the way. Offer one recommended action, one quiet alternative. |
| **Cognitive load theory (Sweller)** | Working memory is limited. Extraneous load is load caused by presentation. The redundancy effect: repeating information the learner must still process hurts. Split attention: making people integrate separate sources hurts. | Secondary summaries only [20] S. I did not retrieve Sweller 1988. | Say each fact once (see the repeated-facts table). Put the time estimate next to the count, not in a different sentence above. Do not make people add "16 from Spanish" and "8 from Japanese" to get 24. |
| **Progressive disclosure** | "defer advanced or rarely used features to a secondary screen". Two rules: get "the right split" and make it "obvious how users progress" to the rest. | NN/g [40] F | Per-deck breakdown, mastery bars, trends, and tricky words move behind clear labels like "See progress". The label must say what is behind it. |
| **Goal-gradient effect** | "The tendency to approach a goal increases with proximity to the goal." Kivetz, Urminsky and Zheng (2006) found coffee-card customers bought faster as they neared the free coffee, and that the illusion of progress speeds people up. | Laws of UX [41] F, Kivetz et al. [42] S | Show today's progress as distance left once the learner has started: "6 to go". The goal ring is the right device, but it should sit with the action, not in a side column. |
| **Endowed progress effect** | A car wash gave out 300 loyalty cards. 8 empty spaces: 19% finished. 10 spaces with 2 already stamped: 34% finished. Same effort required. | Nunes and Dreze (2006), via Coglode [43] F | Count honestly earned head starts. The first card of the day fills the ring a visible amount. A new learner's week strip shows day 1 checked right after the first session. Do not fake progress. |
| **Fogg behavior model** | "Behavior happens when Motivation, Ability, and a Prompt come together at the same time." | behaviormodel.org [44] F | Prompt = the Start review button. Ability = "About 4 minutes" (it tells people the task is small). Motivation = streak and the mnemonic image. All three must be inside the hero, touching each other. Today the time and streak are in the greeting, away from the button. |
| **First click** | In 12 scenario-based tests, a correct first click led to task success 87% of the time. A wrong first click, 46%. A later re-analysis found a smaller gap in some study types. | Bailey and Wolfson (2009), via summaries [45] S | First-click success is the main usability metric for this page (section 9). |

---

## 5. Gamification and streak research

### 5.1 Duolingo's published experiments

| Experiment | Result | Source |
| --- | --- | --- |
| Separate the streak from the daily goal. One lesson extends the streak. | Day-14 retention +3.3%. Daily active learners +1%. New learners on a streak +19%. Learners on a 7+ day streak up by "over 40%". Trade-off: fewer learners hit their daily goal. | Duolingo blog, Nov 19, 2020 [7] F |
| Why they did it | The highest daily goal made people least likely to have a streak. "lowering the barriers to building a consistent daily habit is more important". | [7] F |
| Milestone animation on select streak days | New learners +1.7% more likely to still be active 7 days later. | Duolingo blog, Jan 31, 2022 [8] F |
| Allow two Streak Freezes instead of one | Daily active learners +0.38%. | [8] F |
| Streak Wager (bet gems on keeping a streak 7 more days) | Day-7 retention +14%. | Duolingo blog, May 10, 2017 [9] F |
| Weekend Amulet (streak survives a weekend off) | 4% more likely to return a week later. 5% less likely to lose the streak. | [9] F |

All figures are relative changes reported by the company about its own product. They are not independent research.

### 5.2 Independent research

- **Broken streaks demotivate.** Silverman and Barasch (2023), *Journal of Consumer Research*, seven studies: highlighting an intact streak increases later engagement compared with highlighting a broken one. The effect is stronger when people blame themselves and weaker when a broken streak can be repaired [22] S. I read the abstract through summaries, not the full paper.
- **Slack helps persistence.** Sharif and Shu (2017), *Journal of Marketing Research*: people prefer, and persist more with, goals that include "emergency reserves" (for example 7 days a week with 2 skip days) [23] S. One student replication in a diet context did not find the effect [23] S.
- **Streak anxiety.** I searched for peer-reviewed work on streak anxiety in language apps and found only blogs that cite studies I could not confirm. I am not citing them. Treat "streak anxiety" as a plausible risk supported by the Silverman and Barasch mechanism, not as a measured effect.

### 5.3 What this means for Memli

1. **Keep the existing rule.** PLAN.md already says clearing the queue meets the goal even below the card target. That matches Duolingo's finding that a hard goal blocks habit.
2. **Two tiers, shown as one thing.** Streak = "studied today". Daily goal = "50 cards". The first screen shows only the streak tier (did I study today, yes or no). The card target lives one level down.
3. **Never spotlight a broken streak.** After a missed day, do not show "0 days" in large type or a red gap. Show "Welcome back" and the best recent run. This follows directly from [22].
4. **Mention the streak once on the first screen.** Today it is in the greeting line and in This week. Loss framing ("keeps your 12-day streak going") is mild and acceptable once. Twice is pressure.
5. **Celebrate milestones only.** A short animation at 7, 30, 100 days and on "all caught up". Not every day. Duolingo's +1.7% came from select milestone days [8]. Respect `prefers-reduced-motion`. WaniKani was criticized for skipping this [25].

---

## 6. The GitHub-style heatmap as a motivation device

### 6.1 What the people asked said

- Crystal: "I like the Github chart at the top." (example-01)
- She also circled the 7-day streak checkmarks card in example-05.
- PLAN.md left the yearly heatmap out on purpose because it "competes with the main action" (`docs/designs/dashboards/PLAN.md`, section 2).

Both are right. The answer is size and placement, not yes or no.

### 6.2 When it helps and when it hurts

| Helps | Hurts |
| --- | --- |
| The learner has two or more weeks of history. The grid shows consistency, and one missed day is one pale cell among many. That is gentler than a streak counter that resets to zero. (My reasoning, consistent with [22].) | The learner is new. An empty grid is a wall of grey. It highlights what has not been done, which is the "broken log" condition in [22]. |
| It sits at third-glance weight: small cells, low saturation, as in example-01. | It sits beside the main action at full saturation. 365 cells is 365 shapes. |
| Add-on users report it "encourages me to complete my reviews on time" (Anki Review Heatmap, anecdotal) [18] S. | The streak rule is too strict, or too loose. Anki add-on users argue both ways [18] S. |
| WaniKani and Anki users install scripts to get one [18][26] S. Demand is real. | It is color-only. Three of GitHub's five greens failed 3:1 contrast in Roselli's 2018 audit [16] F. |

### 6.3 Accessible implementation

What GitHub shipped in March 2023 [15] F:

- Screen readers announce "Contribution Graph, table, 54 columns, 8 rows."
- Arrow keys move cell by cell. Home, End, Page Up, Page Down jump within rows and columns.
- Each cell announces a sentence, for example "11 contributions on Monday, February 21, 2022."

What Adrian Roselli recommends, and what he still found wrong in 2023 [16] F:

- Use a real `<table>`. SVG and `div`s carry no structure.
- Header cells with `scope`. A caption (it can be visually hidden if a heading does the visual job).
- Cell names that match the tooltip text.
- A visible focus outline.
- Do not rely on color. His prototype offers a mode where the *filled area* of each square shows volume.
- Borders at 3:1 against the background.
- Test in Windows High Contrast (forced colors). GitHub's cells all look empty there.
- Use relative units so the grid respects text size.

WCAG criteria that apply:

- **1.4.1 Use of Color (A):** "Color is not used as the only visual means of conveying information". A lightness difference counts as a second cue only at 3:1 or more, and not when the user must identify a *specific* color [17] F.
- **1.4.11 Non-text Contrast (AA):** parts of graphics needed to understand the content need 3:1 against adjacent colors. A chart is exempt when "labels and values convey the same information" [46] F. So a text summary and per-cell text make the low-contrast pale cells acceptable.
- **2.5.8 Target Size (AA):** 24 x 24 px if cells are interactive (`dev/memli/docs/product-ux.md`, "Accessibility & inclusion").

### 6.4 Recommended variants for Memli

**A. 7-day strip (first screen, second-glance).** Already exists in This week. Keep it. Simplify it.

- Seven circles in the locale's week order (PLAN.md step 6 already does this with `Intl.Locale`).
- Three states only, each with a non-color cue: studied (filled + check glyph), today not yet (ring outline, heavier stroke), future or no study (thin outline, no fill).
- Past days without study look the same as future days. No red, no "X". This follows [22].
- One sentence above or below: "5 days this week". That sentence is the text alternative, visible to everyone.

**B. 5-week calendar grid (third-glance, behind "See your month" or on a Progress page).**

- 5 rows x 7 columns = 35 cells. Rows are weeks, columns are weekdays. That reads like a wall calendar, which non-technical people already know. GitHub's layout (columns are weeks) is a developer convention.
- Phone math: 7 cells x 32 px + 6 gaps x 6 px = 260 px. Fits a 343 px content width at 375 px with room for row labels.
- Markup: `<table>` with a `<caption>`, weekday names in `<th scope="col">` from `Intl.DateTimeFormat`, and each cell holding visually hidden text such as "Monday, November 9: 32 cards, goal met".
- Not interactive in version one. No tab stops inside the grid. That avoids building roving focus and keeps keyboard users from tabbing through 35 cells.
- Four intensity steps at most, each with a shape cue: empty outline, small dot, half fill, full fill with check.
- Summary sentence, always visible: "You studied 23 of the last 35 days."
- Do not render it until the learner has at least 7 days of history. Before that, show the 7-day strip only.
- Dark mode: the scale runs from near-background to bright. Empty cells are slightly *lighter* than the card, not darker. Do not invert the light palette.

**C. 52-week grid.** Park it for a Progress page. Not on the dashboard.

---

## 7. Deliverable 1: pattern library

Fifteen named home-screen patterns. "Fit for Memli" is my judgment.

| # | Pattern | What it is | Who uses it | When it fits | Fit for Memli |
| --- | --- | --- | --- | --- | --- |
| 1 | **Today hero** | One big number, one line of context, one button | RemNote "Practice [X] Cards" [29]. Anki deck overview "Study Now" [4]. example-05 "32 words" | The product has one daily job | **Yes. First glance.** |
| 2 | **Next node** | A single path. The next step is the only bright thing | Duolingo [1] | Linear curriculum owned by the product | No. Memli decks are learner-chosen. Borrow only "one obvious next step". |
| 3 | **Twin tiles** | Two equal tiles: Learn and Review, each with a count | WaniKani [PK], Bunpro [28] | Both jobs are daily and equally important | Partly. Equal tiles split attention. Use one primary and one quiet secondary. |
| 4 | **Three-count row** | New, Learning, Due numbers per deck, color-coded | Anki, AnkiMobile, AnkiDroid [5] | Expert users with many decks | No for the first screen. Too dense, color-dependent. Keep text chips in the deck list ("8 due"). |
| 5 | **Hero deck card** | One deck shown large with art, progress, and Start | example-02, example-04. Khan "up next" [39] | One deck clearly matters most | **Merge into the Today hero.** A separate focus card repeats the hero's facts. |
| 6 | **Today's plan** | A short ordered to-do list for the day | Busuu web 2023 [38]. Headspace Today [34]. example-04 | Several different daily activities | Later. Memli has two activities. A list of two is just two buttons. |
| 7 | **Week strip** | Seven day markers with checks | example-05. Duolingo streak calendar [PK]. Memli today | Daily habit products | **Yes. Second glance.** |
| 8 | **Activity heatmap** | Many small day cells shaded by volume | GitHub [15]. Anki add-on [18]. WaniKani script [18]. example-01 | Learners with weeks of history | **Yes, as the 5-week variant, third glance.** |
| 9 | **Goal ring** | A circular progress meter for today | example-03. Memli today. Apple Fitness [PK] | A daily numeric target | Fold into the hero or the week strip (today's circle fills as a ring). Not a separate card. |
| 10 | **Two-tier goal** | Small goal keeps the streak. Bigger goal is optional | Duolingo 2020 [7]. RemNote [29] | Habit first, volume second | **Yes. Already in PLAN.md. Show tier one only on the first screen.** |
| 11 | **Top-bar chips** | Streak and currency as small icon + number in the chrome | Duolingo [PK]. RemNote sidebar flame [29] | Stats that must be visible everywhere | Yes for the streak on phones: a flame + number in the header. PLAN.md removed the sidebar streak, so place it in the page header, once. |
| 12 | **Review forecast** | Upcoming reviews by day or hour | WaniKani [24]. Bunpro [27] | Expert SRS users planning load | Not yet. Needs FSRS (#112). And "380 tomorrow" can scare beginners. |
| 13 | **Done state** | A calm or joyful "finished for today" screen | Anki "Congratulations!" [6]. Memli `caught-up` | Always. It is the reward | **Yes. It replaces the hero when nothing is due.** Must say when the next cards arrive. |
| 14 | **Trouble-words callout** | "N words keep slipping" with a route to fix them | example-03. Memrise Difficult Words [32]. Memli today | The product can act on leeches | Keep, as one row. It is also the best doorway to mnemonics. |
| 15 | **Tip or mascot card** | A friendly character or one-line tip | Duolingo's Duo [3]. example-02 Study Tip | A brand with art resources | One-line tip, no mascot yet (section 8.3). Third glance. |
| (anti) | **Widget grid** | Equal user-arranged boxes | WaniKani 2025 [25] | Power users who want control | **No.** It is the equal-weight problem again, and it drew "cluttered" complaints [26]. |

---

## 8. Deliverable 2: focal hierarchy for Memli

### 8.1 The rule

- **First glance: exactly one element.**
- **Second glance: at most two elements.**
- **Everything else: third glance, below the fold, or behind a labeled disclosure.**

### 8.2 First glance: the Today hero

One card. It is the only strong figure on the page.

| Part | Content | Why |
| --- | --- | --- |
| Headline | "24 words to review" as the largest text on the page | One big number is the pattern Crystal circled in example-05. It answers "what do I do now". |
| One context line | "About 4 minutes" | The ability cue in the Fogg model [44]. It sits next to the number, not in the greeting. |
| **The button** | "Start review", solid primary with depth, 48 to 56 px tall, at least 240 px wide, full width on phones | Fitts [19]. Von Restorff [13]. Owner's standing rule: strong solid primary, never an outline. It must be the only solid-primary fill on the first screen. |
| Quiet secondary | "Learn 10 new words" as a low-emphasis button or link | Hick [21]: one recommended option. The owner liked two actions (README, example-01). Keep both, but unequal. |
| Mnemonic image | One community mnemonic image with its word, on the side on desktop, above the headline or omitted on small phones | The differentiator. Crystal circled the hero card in example-04, which includes the mnemonic image. See 8.3 for which image to show. |

Things that leave the hero:

- "TODAY" eyebrow label. The headline already says it.
- "16 from Spanish Core 1000 / 8 from Japanese ..." chips. The deck list shows due counts. If a breakdown is wanted, one line: "From 2 decks".
- "Starts in Spanish Core 1000." Only needed until cross-deck review exists. If it stays, fold it into the button's helper text, not a separate sentence.

The greeting stays as a short `h1` ("Good evening, Phillip") in a smaller size than the hero number. The status sentence under it goes away. Its two facts (minutes, streak) move to the hero and the week strip.

### 8.3 Second glance: two elements

1. **This week strip.** Flame + "12 days" and seven day markers. One row. On desktop it sits to the right of the hero or directly under it. On phones it sits directly under the hero button. Crystal circled exactly this in example-05. It carries the streak, so the streak is mentioned once.
2. **Your decks.** One list of compact rows for all decks, including the focus deck. Each row: language badge, title, one status chip ("16 due", "10 new", "Caught up"), one quiet action. No separate "Continue learning" card. The first row can be slightly taller, but it is the same component.

Why these two: they answer the next two questions after "what do I do now". "Am I keeping it up?" and "What else do I have?"

### 8.4 Third glance or behind a disclosure

| Element today | Where it goes | Reason |
| --- | --- | --- |
| Language filter chips (5 controls before the main action) | A single "Studying: All languages" menu at the top right of the page header | Hick [21]. example-02 and example-05 both put the language switcher top right, and the owner liked that (README). It also removes four solid or outlined pills from the first screen. |
| Continue learning card (16 due, 10 new, 5% mastered, stacked bar, legend) | Collapsed into the first deck row. Full detail lives on the deck page | It repeats the hero. Redundancy [20]. |
| Daily goal ring and "26 more cards to reach today's goal" | Today's circle in the week strip fills as a ring. The number lives in its tooltip and accessible name, and on the Progress view | Two-tier goal [7][29]. One meter, not two. |
| "Words mastered 100" | Progress view | Not needed to decide what to do now. |
| Tricky words card (heading, two sentences, five chips, "and 2 more") | One row under the decks: "7 tricky words. Give them a new mnemonic." with a link | Keeps the doorway to mnemonics. Cuts about 30 words. |
| Progress trends (Consistency, Retention, New cards) | A "Progress" page, or a closed disclosure "Your progress" at the bottom | Progressive disclosure [40]. Label says what is inside. |
| 5-week heatmap | Inside the same Progress disclosure, or opened from the week strip with "See your month" | Section 6. |
| Study tip (Crystal circled it in example-02) | One sentence at the bottom of the page or in the done state | Fun, but third glance. |

### 8.5 The same hierarchy on a phone (375 to 422 px)

Order, top to bottom:

1. Header row: logo or menu, language menu, streak chip.
2. Greeting, one line.
3. Hero: number, "About 4 minutes", full-width Start review, quiet "Learn 10 new words".
4. Week strip.
5. Decks.

The Start review button's bottom edge should land within the first 560 px. Today it lands at 795 px [M]. To get there: remove the status sentence, remove the chip row, remove the "TODAY" label and the per-deck chips, and skip the mnemonic image above the button at heights under about 700 px.

### 8.6 Hierarchy in dark mode

- Two of four respondents chose the dark example. Crystal says she always picks dark. Karen said in dark "the writing pops up".
- In example-02 the yellow Start Study button is the lightest and most saturated shape on a navy field. That is a lightness contrast, a hue contrast, and isolation at once.
- Memli's primary is blue, and the dark background the owner wants is navy. Blue on navy shares a hue family, so the button depends on lightness alone. The dark-theme button must therefore be clearly lighter than everything near it, and nothing else on the first screen may use that fill. The exact tokens belong to the color research. The hierarchy requirement is: in a blurred dark screenshot the button is still the single brightest shape.

### 8.7 The word "Deck"

Crystal: "I am not sure about the word Deck. It may be confusing for some people." Evidence from this research:

- 2016-era Memrise called them courses [PK]. Memrise's current help pages describe bringing user content back as "word lists" [33] S.
- example-05 uses "vocabulary lists". example-04 uses "courses". example-01 uses "Decks & Courses".
- Anki, Brainscape, and Mochi say "deck" [4][PK]. Those are expert tools.

For non-technical learners, "course" or "word list" is the safer label. This choice touches the sidebar ("Decks"), headings, and button names, so it needs one decision for the whole app.

---

## 9. Deliverable 3: fun without clutter

"Fun" was Crystal's reason for choosing example-01. Duolingo's design lead says fun is the most important part of their work [3]. The rule here: fun goes *into* the first-glance and second-glance elements. It does not add new boxes.

### 9.1 Mnemonic imagery as the hero

- Show one mnemonic image in the Today hero. Caption it with the word and, for a mem that is not due, its meaning. Text in the learning language carries `lang` (PLAN.md section 5).
- **Do not show the mnemonic for a card that is due today.** Seeing the answer just before being tested removes the retrieval effort that makes review work. [PK: the testing effect, Roediger and Karpicke 2006. Not fetched in this session.] Pick from: the learner's most recently mastered word, a word they wrote a mnemonic for, or a top-voted community mnemonic from a deck with nothing due.
- Frame it as a reward: "You remembered this one" or "Mem of the day". This is example-05's "Your next memory" idea with a safer source.
- Fallback when there is no image: a large language badge tile in the deck's color. No stock photos. PLAN.md left hero photos out for good reason. A mnemonic image is product content, not decoration.
- The image is decorative for the task, so it must not be the only place a fact appears. Give it real `alt` text from the mnemonic's description.

### 9.2 Type, shape, and color

- Bigger type and bigger buttons were named by the owner as what he liked in example-01 (README). Two large things only [12].
- Rounder corners and a visible shadow on the hero give depth. The owner's standing taste asks for depth on the primary button.
- One warm accent, used for the streak flame only. It should not appear on buttons.
- Language badges can each have their own tint. Small, repeated, low-saturation color reads as playful without creating focal points.

### 9.3 Micro-celebrations

| Moment | Celebration | Evidence |
| --- | --- | --- |
| Session finished, queue empty | The hero becomes the done state: a big check, "All caught up", and when the next words arrive. One short confetti burst, once | Anki's done screen confuses people when it does not say what happens next [6] |
| Streak milestone (7, 30, 100, 365) | A short flame animation on the week strip | Duolingo: +1.7% day-7 retention for new learners [8] |
| First card of the day | The day's circle starts filling | Endowed progress [43], goal gradient [41][42] |
| Returning after a break | "Welcome back." No zero, no red | Silverman and Barasch [22] |

Every animation is off under `prefers-reduced-motion` and none loops.

### 9.4 Mascot: not yet

- Duolingo's characters work because a team maintains them. "There are quite a few people whose job is to help write these stories" [3].
- A single owl clip-art in a tip card reads as stock art. It also becomes one more image competing with the mnemonic picture.
- Memli's personality can come from the community's mnemonics, which no competitor's home screen has, and from short warm copy.
- Revisit a mascot after the rebrand noted in `dev/memli/docs/product-ux.md` ("Brand note").

### 9.5 Copy

- Short, concrete, warm. "24 words to review", "About 4 minutes", "Start review".
- No em dashes in customer-facing copy (owner's standing rule).
- Whole-sentence templates with placeholders, so `es-419` can grow 30 to 40% (PLAN.md section 6). The hero button must wrap or grow, never truncate.

---

## 10. Deliverable 4: measurable success criteria

Run each test on the current page first to get a real baseline. Baselines marked [M] are measured. Others are from the brief.

### 10.1 Counts that can be checked in code or by script

| Metric | Now | Target |
| --- | --- | --- |
| Words visible in `main` on the first screen, desktop 1440 x 900 | 165 [M] | 70 or fewer |
| Words before and including the primary button, phone 375 x 812 | about 60 [M] | 25 or fewer |
| Total words in `main` | 217 (brief), 229 with hidden text [M] | 120 or fewer |
| Headings on the first screen, desktop | 7 [M] | 3 or fewer |
| Bordered or filled boxes on the first screen, desktop | 4 by eye | 3 or fewer (hero, week strip, decks) |
| Solid-primary filled shapes on the first screen | 4 clusters by eye | exactly 1 |
| Distinct font size and weight pairs | 15 (brief) | 6 or fewer |
| Interactive controls before the primary button in tab order (after the skip link and app nav) | 5 language chips | 1 or fewer |
| Primary button size, desktop | 126 x 44 px [M] | at least 240 x 48 px |
| Primary button share of a 1440 x 900 viewport | 0.43% [M] | at least 1.2% |
| Primary button bottom edge, phone 375 x 812 | 795 px [M] | 560 px or less |
| Facts repeated on the first screen | 5 (table in section 2) | 0 |
| Animations with `prefers-reduced-motion: reduce` | not checked | 0 |

### 10.2 Tests with people (five testers is enough to see the pattern)

| Test | How | Target |
| --- | --- | --- |
| **First click** | Show the page. Say: "You have a few minutes. Start studying." Record the first click and the time. | 90% or more click Start review first. Median time 3 seconds or less. Basis: first click right 87% success, wrong 46% [45]. |
| **Five-second recall** | Show the page for 5 seconds, hide it. Ask: "What can you do here?" and "How many words are waiting?" | 4 of 5 name the review action. 3 of 5 recall the count within 5. |
| **Where did you look first** | Ask each tester to point to the first thing they noticed. | 4 of 5 point at the hero. |
| **Squint or blur** | Blur a screenshot 8 px and 20 px, light and dark. | At 8 px the button is the single most saturated shape. At 20 px there is no second focal point [12]. |
| **Non-technical reader** | Ask a person like Karen to read the page aloud in both themes. | No word skipped or squinted at. She can say what "Start review" will do. |
| **Vocabulary** | Ask: "What is a deck?" (or whatever word is chosen). | 4 of 5 answer correctly without help. |

### 10.3 Accessibility gates tied to the hierarchy

- The hero button's fill has at least 3:1 against the hero surface, and the hero surface is visibly distinct from the page in both themes (WCAG 1.4.11 [46]).
- Day markers and heatmap cells carry a non-color cue and text (WCAG 1.4.1 [17]).
- DOM order equals visual order: greeting, hero, week strip, decks (PLAN.md section 3 already requires this).
- The heatmap table exposes a caption and a one-sentence summary.

---

## 11. What I could not access or verify

- **Sweller's 1988 paper.** Only secondary summaries.
- **Silverman and Barasch (2023) and Sharif and Shu (2017) full texts.** Abstract-level summaries only.
- **Kivetz, Urminsky and Zheng (2006) full text.** Summaries from Columbia and Chicago Booth pages via search.
- **Bailey and Wolfson's first-click paper.** Secondary sources, which disagree on the year (2006, 2007, or 2009).
- **A peer-reviewed study of streak anxiety in language apps.** None found. Blog claims were not used.
- **An NN/g or IxDF page on figure and ground, and an NN/g page on preattentive attributes.** Not found. Healey's NCSU page covers preattentive processing.
- **The NN/g squint test video.** I read the page text and the related article, not the video.
- **Headspace's official Today tab article.** HTTP 403. Only search summaries.
- **AnkiMobile's deck list manual page.** HTTP 404 at the URL I tried. Colors confirmed through search summaries of AnkiMobile and AnkiDroid docs.
- **Anki's exact done-screen text in the official manual.** Confirmed only through forum thread titles.
- **Current home screens of Quizlet, Drops, Brainscape, Mochi, Busuu, Babbel, Lingvist, Khan Academy, and Memrise.** I did not log in to any product and saw no current screenshots. Entries are from help pages, forum posts, search summaries, or prior knowledge, as tagged.
- **Dark mode appearance for every product.** Not verified for any of them except the WaniKani and Bunpro forum remarks.
- **WaniKani's built-in heatmap widget.** Mentioned in a search summary of a forum page. Not confirmed in official docs.
- **Duolingo's widget.** No published retention numbers found.
- **The testing-effect citation in 9.1.** Prior knowledge, not fetched.
- **Real-phone visible viewport height.** I measured a 375 x 812 emulated viewport. I did not test on a device with browser toolbars.
- **The "boxes" and "blue clusters" baselines.** Counted by eye from the screenshot, not by script.

---

## 12. Sources

1. Duolingo Blog, "Introducing the new Duolingo home screen" (May 6, 2022; launched Nov 1, 2022). https://blog.duolingo.com/new-duolingo-home-screen-design/ [F]
2. PiunikaWeb, "Duolingo app update with Path UI faces backlash from users" (Oct 17, 2022). https://piunikaweb.com/2022/10/17/duolingo-app-update-with-path-ui-faces-backlash-from-users/ [F]
3. Apple Developer, "Behind the Design: Duolingo". https://developer.apple.com/news/?id=jhkvppla [F]
4. Anki Manual, "Studying". https://docs.ankiweb.net/studying.html [F]
5. AnkiMobile manual, "Deck list" https://docs.ankiweb.net/ankimobile/deck-list ; AnkiDroid docs, "The Deck List" https://krmanik.github.io/ankidroiddocs/deck-picker.html [S]
6. Anki Forums threads about the "Congratulations! You have finished this deck for now" message, for example https://forums.ankiweb.net/t/anki-keeps-saying-congratulations-you-have-finished-this-deck-for-now/65312 and https://forums.ankiweb.net/t/cant-get-started-new-deck-says-finished-for-today/60032 [S]
7. Duolingo Blog, Anton Yu, "Improving the streak: Forming habits one lesson at a time" (Nov 19, 2020). https://blog.duolingo.com/improving-the-streak/ [F]
8. Duolingo Blog, Osman Mansur, "How Duolingo's streak builds habit" (Jan 31, 2022). https://blog.duolingo.com/how-duolingo-streak-builds-habit/ [F]
9. Duolingo Blog, Kai Herng Loh, "How streaks keep Duolingo learners committed to their language goals" (May 10, 2017). https://blog.duolingo.com/how-streaks-keep-duolingo-learners-committed-to-their-language-goals [F]
10. Christopher G. Healey, "Perception in Visualization" (preattentive processing), NC State University. https://www.csc2.ncsu.edu/faculty/healey/PP/ [F]
11. Nielsen Norman Group, "Squint Test" (video page). https://www.nngroup.com/videos/squint-test/ [F, page text only]
12. Nielsen Norman Group, "Visual Hierarchy in UX: Definition". https://www.nngroup.com/articles/visual-hierarchy-ux-definition/ [F]
13. Laws of UX, "Von Restorff Effect". https://lawsofux.com/von-restorff-effect/ [F]
14. Figure and ground, general sources: Toptal, "Gestalt Principles of Design" https://www.toptal.com/designers/ui/gestalt-principles-of-design ; UX Design Institute https://www.uxdesigninstitute.com/blog/gestalt-principles-ux-ui-design/ [S]
15. GitHub Changelog, "Accessibility improvements for the contribution graph" (Mar 2, 2023). https://github.blog/changelog/2023-03-02-accessibility-improvements-for-the-contribution-graph/ [F]
16. Adrian Roselli, "GitHub Contributions Chart" (2018, updated 2023). https://adrianroselli.com/2018/02/github-contributions-chart.html [F]
17. W3C, Understanding SC 1.4.1 Use of Color (WCAG 2.2). https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html [F]
18. Review Heatmap add-on for Anki, https://github.com/glutanimate/review-heatmap ; WaniKani Heatmap userscript thread, https://community.wanikani.com/t/userscript-wanikani-heatmap/34947 ; Anki Forums discussion of streak rules, https://forums.ankiweb.net/t/how-do-i-customize-my-anki-or-set-it-to-show-my-current-streak-longest-streak-etc/5577 [S]
19. Laws of UX, "Fitts's Law". https://lawsofux.com/fittss-law/ [F]
20. Cognitive load theory, secondary summaries: https://en.wikipedia.org/wiki/Cognitive_load ; Sweller, Ayres and Kalyuga, *Cognitive Load Theory* (Springer, 2011), chapters on the split-attention and redundancy effects, https://link.springer.com/chapter/10.1007/978-1-4419-8126-4_11 [S]
21. Laws of UX, "Hick's Law". https://lawsofux.com/hicks-law/ [F]
22. Silverman, J. and Barasch, A. (2023), "On or Off Track: How (Broken) Streaks Affect Consumer Decisions", *Journal of Consumer Research* 49(6), 1095-1117. https://www.colorado.edu/business/faculty-research/2023/04/19/or-track-how-broken-streaks-affect-consumer-decisions ; coverage https://www.psychologytoday.com/us/blog/ulterior-motives/202306/how-broken-streaks-sap-motivation [S]
23. Sharif, M. and Shu, S. (2017), "The Benefits of Emergency Reserves", *Journal of Marketing Research* 54(3), 495-509. https://anderson-review.ucla.edu/emergency-reserves/ [S]
24. WaniKani Knowledge, "Review Forecast" https://knowledge.wanikani.com/getting-started/widgets/review-forecast and "Level Progress" https://knowledge.wanikani.com/widgets/level-progress/ [S]
25. WaniKani Community, "The New Dashboard is Here" (Oct 6, 2025). https://community.wanikani.com/t/the-new-dashboard-is-here/71904 [F, first page]
26. WaniKani Community, "What are everyone's thoughts on the upcoming dashboard changes?" (Oct 1, 2025) https://community.wanikani.com/t/what-are-everyone%E2%80%99s-thoughts-on-the-upcoming-dashboard-changes/71850 [F] ; later pages of [25] [S]
27. Bunpro Community, "Dashboard 2.0 Beta" (Jun 27, 2023). https://community.bunpro.jp/t/dashboard-2-0-beta/66702 [F]
28. Bunpro Community, later pages of [27] and "Reviews 2.0 released" https://community.bunpro.jp/t/reviews-2-0-released/65725 [S]
29. RemNote Help, "The Flashcard Home". https://help.remnote.com/en/articles/7925835-the-flashcard-home [F]
30. Clozemaster Forum, "New Dashboard UI" (Oct 1, 2024). https://forum.clozemaster.com/t/new-dashboard-ui/54907 [F]
31. Clozemaster FAQ, https://www.clozemaster.com/faq [S]
32. Memrise Blog, "Changes to the Memrise app" (updated through 2026). https://memrise.com/blog/changes-to-the-memrise-app [F]
33. Wikipedia, "Memrise" https://en.wikipedia.org/wiki/Memrise ; Memrise community courses help https://explore.memrise.com/community-courses [S]
34. Headspace Help, "Refreshed Today Tab Experience (June 2026)". https://help.headspace.com/hc/en-us/articles/51443842967195-Refreshed-Today-Tab-Experience-June-2026 [S, fetch returned 403]
35. Raw.Studio, "Case Study: How Headspace Designs for Mindfulness" https://raw.studio/blog/how-headspace-designs-for-mindfulness/ [F, little on the home screen] ; Irrational Labs, Headspace case study https://irrationallabs.com/case-studies/headspace-doubled-course-starts/ [S]
36. MacStories, "Streaks 3 Review" https://www.macstories.net/reviews/streaks-3-review/ ; App Store listing https://apps.apple.com/us/app/streaks/id963034692 [S]
37. Lingvist Help, "How should I learn with Lingvist" https://lingvist.com/help/how-should-i-learn-with-lingvist-and-why-does-it-work/ ; Lingvist Blog, "Fewer Cards per Day, Faster Learning?" https://lingvist.com/blog/fewer-cards-per-day-faster-learning/ [S]
38. Babbel reply on Trustpilot about the Review feature https://nz.trustpilot.com/review/babbel.com?page=2 ; Busuu blog on the 2023 web homepage https://blog.busuu.com/?p=3740 [S]
39. Khan Academy Help, "What is my Learner Home page" https://support.khanacademy.org/hc/tr/articles/360030629852-What-is-my-Learner-Home-page-and-what-can-I-do-there [S]
40. Nielsen Norman Group, "Progressive Disclosure". https://www.nngroup.com/articles/progressive-disclosure/ [F]
41. Laws of UX, "Goal-Gradient Effect". https://lawsofux.com/goal-gradient-effect/ [F]
42. Kivetz, R., Urminsky, O. and Zheng, Y. (2006), "The Goal-Gradient Hypothesis Resurrected", *Journal of Marketing Research* 43, 39-58. https://business.columbia.edu/faculty/research/goal-gradient-hypothesis-resurrected-purchase-acceleration-illusionary-goal ; Chicago Booth Review, "Going for the Goal" https://www.chicagobooth.edu/review/going-goal [S]
43. Coglode, "Endowed Progress Effect" (Nunes and Dreze 2006, *Journal of Consumer Research* 32(4), 504-512). https://www.coglode.com/nuggets/endowed-progress-effect [F]
44. BJ Fogg, Fogg Behavior Model. https://www.behaviormodel.org/ [F]
45. First-click testing: User Interviews field guide https://www.userinterviews.com/ux-research-field-guide-chapter/first-click-testing ; MeasuringU re-analysis https://measuringu.com/?p=193 [S]
46. W3C, Understanding SC 1.4.11 Non-text Contrast (WCAG 2.2). https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html [F]

**Project files read**

- `docs/designs/dashboards/README.md`
- `docs/designs/dashboards/PLAN.md`
- `docs/designs/dashboards/example-01.jpeg`, `example-02.png`, `example-04.png`, `example-05.jpg`
- `dev/memli/docs/product-ux.md`
- Crystal's annotated screenshot and the light-theme desktop screenshot named in the brief
- Live page `http://localhost:5173/dashboard?preview=default` at 1440 x 900 and 375 x 812

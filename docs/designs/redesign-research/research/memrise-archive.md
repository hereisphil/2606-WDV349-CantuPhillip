# The old Memrise web app (2013 to 2019): what it showed, and what Memli can learn

Research agent: memrise-archive. Date of research: 2026-11-13.

Purpose: evidence base for the Memli dashboard redesign. The goal is to learn patterns. It is not to copy Memrise's name, art, or exact look.

## 0. How to read this file

- **Verified** means I read it myself in an archived file, a video frame, or a page. The source is named.
- **Inferred** means it is my conclusion from verified facts. It is a design opinion, not a fact.
- **Not verified** means I could not confirm it. I say so.
- All archived files I downloaded are in the scratchpad. `S` below means
  `scratch-path`.

### The three biggest findings

1. **The logged-in dashboard is recoverable.** The page itself (`/home/`) was behind a login and is not archived after 2013. But the Wayback Machine kept its CSS and JavaScript (March 2017 build). The JavaScript contains the templates and every button label. I also pulled 19 still frames from the 2016 YouTube walkthrough, and they match the code. So Section 2 is a verified reconstruction, not a guess.
2. **The 2016 app was not "dark navy with a yellow accent".** In 2016 and 2017 the header was sky blue (`#11a3ed`), the main button was green, and the review button was light blue. Navy appears in two other places: a **night mode** that turned the header navy (`#282A6C`) late in the day (2016), and the **2019 rebrand** (navy `#2C3445`, yellow `#FFC000`, cream `#FCFAF2`). Details in Section 4.
3. **The old dashboard used about 45 to 50 words in the first screen.** Memli's dashboard uses 217 in the main column. The old page got away with so few words because each number appeared once, the count sat inside the button ("Review (597)"), and status was shown with icons and bars, not sentences.

---

## 1. What each archived page showed

I fetched the raw captures with the `id_` modifier using `curl` (WebFetch is blocked for web.archive.org in this environment). Files are in `S/wb/` and the CSS in `S/wbcss/`.

### 1.1 Landing page, 6 March 2016

Source: https://web.archive.org/web/20160306192808/https://www.memrise.com/ (local: `S/wb/home.html`, `S/wbcss/landing.css`)

| Part | What it showed |
|---|---|
| Page title | "Learning, made joyful - Memrise" |
| Header | Fixed bar, 64px tall, max width 960px. Logo on the left. On the right: "Courses" (plain link), "Login" (plain), "Sign up" (green filled button), a flag dropdown with 7 UI languages (Deutsch, English, Español, Język polski, Português Brasileiro, Tiếng Việt, 简体字). |
| Hero | Blue sky gradient (`#36ADED` to `#2183E3`). Big centered heading "Learning," then "made joyful" in an italic serif (Lora). One sentence under it. One green button: "Join now, it's FREE!". Two stats under the button: number of courses, number of words learned. Clouds and a landscape drawing at the bottom of the hero. |
| Benefits | Heading "Memrise helps you learn better". Six short blocks, each a 2 to 4 word heading plus one line: any language, iOS and Android, adaptive learning tech, learn anything, compete with friends, teachers. A "There's more!" expander hides the rest. |
| Mobile band | Orange gradient band (`#F77020` to `#F74A20`), phone and tablet images, two store buttons. |
| Quotes | "What people are saying". Three tweets shown, two hidden behind "Load more quotes". |
| Closing band | "Join millions of learners" with the same green button, now labeled "Register now, it's FREE!". |
| Footer | Four columns of links, logo, two social buttons, language switcher. |

Things to notice (verified in the HTML):
- One call to action, repeated twice. Nothing else on the page is a filled button except "Sign up" in the header, which is the same action.
- Long content is hidden behind expanders ("There's more!", "Load more quotes"). The first view stays short.
- The language switcher is in the header and again in the footer.

### 1.2 Sign-up page, 16 March 2016

Source: https://web.archive.org/web/20160316115012/https://www.memrise.com/join/ (local: `S/wb/join.html`)

- Same blue header. "Sign up" is marked active.
- Clouds in the background. One white card (`.whitebox`) in the middle with the heading "Sign up".
- Two social buttons first ("Login with Google+", "Login with Facebook"), a dashed "or" divider, then three fields with visible labels above them: "Username:", "Email address:", "Password:".
- One checkbox ("I agree to the terms of use") and one green button "Sign up".
- No marketing copy on this page at all. The form is the only thing to look at.

### 1.3 About page, 18 March 2016

Source: https://web.archive.org/web/20160318075542/http://www.memrise.com/about/ (local: `S/wb/about.html`)

- Sub-navigation tabs: About Us, Science, Team, Jobs, Labs, Contact Us.
- Three sections, each with an image on the left, a colored icon, a heading, two or three short paragraphs, and one colored button that expands more text:
  - **Science** (blue lab icon, blue button "Learn more about the science"). Hidden text covers "Elaborate Encoding", "Choreographed Testing", "Scheduled Reminders".
  - **Fun** (green flower icon, green button "Learn more about the garden").
  - **Community** (orange person icon, orange button "Learn more about our beliefs").
- This page is the primary source for the garden metaphor and for "mems". Paraphrased (my words, not theirs):
  - Learning a new word is planting a seed. Each review helps it grow, like watering a flower.
  - A new word needs six correct tests to finish growing. Then it counts as being in long term memory.
  - After that, the word must still be reviewed from time to time, like watering a flower to keep it healthy.
  - "Mems" are the small helpful items shown under a word: mnemonics, etymologies, videos, photos, example sentences. The community makes them.
  - The page states the belief that memory is more like a garden than a storehouse.

### 1.4 Course catalogue (Languages), 13 March 2016

Source: https://web.archive.org/web/20160313184443/http://www.memrise.com/courses/english/languages/ (local: `S/wb/courses.html`, `S/wbcss/browse.css`)

- Page head: "All Courses" back button on the left, green "Create a course" button on the right, a search box ("Search…"), and the heading "Languages Courses" with a round flag.
- Left sidebar (25% width): label "I speak:" with a dropdown of source languages (each with a round flag), then the category tree.
- Main area: a grid of 15 course cards, three per row. Each card (`.course-box`) shows:
  - a square cover photo,
  - a small round flag for the language being learned,
  - the category as a link ("English"), and "by [author]" on the right,
  - the title (two lines at most),
  - two stats with icons only: number of learners ("460k") and estimated hours ("7h"). The full sentence ("460k people are learning this course", "This course takes about 7h") is in the tooltip.
- A video frame from July 2016 (`S/yt/frames/f000110.jpg`) shows the same grid for a logged-in user. It matches.

### 1.5 Course page (Introduction to Japanese), 12 March 2016

Source: https://web.archive.org/web/20160312124128/http://www.memrise.com/course/12/introduction-to-japanese/ (local: `S/wb/course12.html`, `S/wbcss/course.css`)

- Blue page head with: breadcrumb (Courses > Languages > Japanese > Japanese), small course photo, the course name as `h1` (25px), a 3 sentence description.
- For logged-out visitors: "Welcome to Memrise!" plus one line, and one green button "Start learning now!".
- Body: a grid of 25 **level tiles** (each 125 x 189px, white card). Each tile shows the level number in a tab at the top, a pictogram, a status word, and the level title.
  - Status words seen: "Ready to learn" (vocabulary levels, plant pictogram) and "Multimedia" (text or video levels).
- Right column (`.leaderboard-container`): the course leaderboard. It was empty in this capture because it loads with JavaScript.

### 1.6 Level page (Level 2), 7 March 2016

Source: https://web.archive.org/web/20160307055604/http://www.memrise.com/course/12/introduction-to-japanese/2/ (local: `S/wb/course12-2.html`, `S/wbcss/level.css`)

- Slim blue head: course photo, course name, "Created by [author]" with avatar.
- "Level 1" and "Level 3" as large white previous and next buttons on the left and right. Their tooltips name keyboard access keys (Z and C).
- A centered column 640px wide:
  - A white "progress box": "Level 2" with a plant pictogram, the title "Survival Japanese words", a progress bar, and one green button "Learn these words".
  - A line "8 words" on the left and "0 ignored" on the right.
  - A white list of the words. Each row: a small status icon, the foreign word in bold (16px), the translation in regular weight.
  - A legend above the list with two icons: a purple seed "Ready to learn" and a blue water drop "Ready to review".
  - An "Ignore words" mode with checkboxes and a "Save" button.
- A video frame of the same page for a logged-in user (`S/yt/frames/f000622.jpg`) adds: the right side of each row shows a blue drop and a time such as "now" or "in about a day". The main button becomes "Continue learning".

---

## 2. The logged-in dashboard (`/home/`), 2016 to 2017

### 2.1 Evidence used

| Evidence | What it is | Local file |
|---|---|---|
| Dashboard CSS, March 2017 | `https://web.archive.org/web/20170315161754/https://d107cgb5lgj7br.cloudfront.net/garden/dist/css/views/dashboard-7eacacfc4.css` (57,662 bytes) | `S/wbdash/dash-201703.css` |
| Dashboard JS, March 2017 | `https://web.archive.org/web/20170315161753/https://d107cgb5lgj7br.cloudfront.net/garden/dist/js/dashboard-349aefef4.js`. Contains the Mithril templates and all `_t("...")` strings. | `S/wbdash/dash-201703.js` |
| Dashboard CSS, May 2016, Oct 2016 | Same file at two dates, identical size (45,202 bytes). The dashboard styling was stable across 2016. | `S/wbdash/dash-201605.css`, `dash-201610.css` |
| Global CSS, March 2016 | `web-efda38a33.css` (353 KB) | `S/wbcss/web.css` |
| Video frames, July 2016 | 19 stills at 720p from the walkthrough (Section 7). I looked at 14 of them. | `S/yt/frames/*.jpg` |
| Anonymous dashboard, June 2013 | The only archived `/home/` HTML that is a real dashboard (for a not-yet-registered visitor). | `S/wbdash/home-201306.html` |

The 2017 JavaScript and the 2016 video frames agree on layout and labels. That is why I trust the reconstruction.

### 2.2 Page layout, top to bottom

Verified from frames `f000102.jpg`, `f000546.jpg`, `f000230.jpg`, `f000600.jpg`, `f000603.jpg` and the CSS.

| Region | Size (CSS) | Content |
|---|---|---|
| Header bar | fixed, 64px tall, row max 960px, `#11a3ed` | Logo. Three plain links: "Home" (active), "Courses", "Groups". One pink filled button "Go Pro". Avatar with a dropdown on the right. |
| Landscape band | 150px tall, blue gradient `#36ADED` to `#2183E3` | A drawn landscape (hills, trees, rocks), clouds, and a sun. No text. The clouds and sun move at different speeds when you scroll (parallax, in the JS as `scrollCloudsAndSun`). |
| Left sidebar | 195px wide boxes | 1. Profile card. 2. "Streak Clock". 3. Pro upsell (or, for Pro users, a learning graph). 4. "Leaderboard". |
| Main column | cards about 715px wide | A heading that is the name of the current filter (default "Recently learned"), a "Filter results" dropdown on the right, then a stack of course cards. |

There is no greeting, no sentence about today, and no summary panel. The heading is two words.

### 2.3 The course card (the heart of the dashboard)

Verified from the template in `dash-201703.js` (function `w`, the `.course-card-container` view) and frames.

```
+--------------------------------------------------------------------------+
| [photo 95px]  Course title (20px bold)        [goal chip] [trophy] [...] |
|  + flag                                        637 / 4725 words learned  |
|               [==== green progress bar, 8px tall =====------------------] |
|               +--------------------------------------------------------+ |
|               | 5 mins a day |  (✓) o  o  o  o  o  o        |   1      | |
|               | [Edit goal]  |   M  T  W  T  F  S  S        | STREAK   | |
|               |              | [=== orange goal bar ======] |          | |
|               +--------------------------------------------------------+ |
|--------------------------------------------------------------------------|
| grey strip:        [⚡ 179] [🔊] [⏱]  [ Review (597) ]  [   Learn   ]   |
+--------------------------------------------------------------------------+
```

| Element | Exact label or rule (from the JS) | Notes |
|---|---|---|
| Photo | course photo 95px wide, with a 34px round flag overlapping its corner | The flag tells you the language without a word. |
| Title | course name, 20px, weight 700, max two lines, links to the course page | `#333`, turns blue on hover. |
| Progress text | `__learned__ / __all__ words learned` | One line. "all" excludes ignored words. |
| Progress bar | 8px tall, green gradient `#82cc2a` to `#88e11e` on a `#f2f2f2` track | When 100%: the text "Course Complete!" in green appears and the Learn button disappears. |
| Goal chip (top right) | Three states: "Set a daily goal" (no goal), "Today: 0 / 1500 pts" (goal set, not met), "Goal complete!" (orange filled chip) | Clicking the chip shows or hides the goal strip. So the strip is optional detail. |
| Trophy icon | links to the course leaderboard | Icon only. |
| Three dots menu | "Course details", "Share with friends", "Quit course" | Rare actions are tucked away. |
| Goal strip | Left: a 3-bar level icon, "5 mins a day" (or 15, or 45), and "Edit goal". Middle: seven day bubbles with weekday initials, completed days get a check and an orange pill behind them, today is highlighted. Right: the streak number (24px, orange) over the word "STREAK". Bottom: an orange bar for today's progress toward the goal. | Only drawn when a goal is set, the course is not complete, and the user has not collapsed it. |
| Action strip | light grey (`#f8f8f8`) footer of the card, buttons right aligned | Order in the code: difficult words, audio, speed review, review, learn. So **Learn is always the rightmost button**. |

The five action buttons (verified in the JS functions `l`, `c`, `u`, `p`, `m`):

| Button | Visible label | Tooltip (title) | Color | Shown when |
|---|---|---|---|---|
| Learn | "Learn" | "Learn new words" | green `#83cd2b` | course is under 100% |
| Review | "Review (597)" | "Review words you've learned" | light blue `#6ec8f9` | at least one word is due |
| Review (practice) | "Review" | "Practice words you've learned" | plain white button | nothing is due but some words are learned |
| Speed review | clock icon only | "Speed review" | red `#f6724c` | at least one word is learned |
| Difficult words | lightning icon plus a count | "Review your difficult words" | orange `#F99A20` | Pro users with difficult words. For free users it is greyed and links to the upsell. With zero words it is disabled: "No difficult words to review". |
| Audio review | speaker icon only | "Audio review" or "Practice your listening skills" | purple `#BB32D3` | courses with audio. Greyed with an upsell link for free users. |

Key behaviours:
- **The due count is inside the button.** There is no separate "597 cards ready" headline.
- **Buttons appear and disappear with state.** A finished course has no Learn button. A course with nothing due has a quiet white "Review" instead of the blue one. The card never shows a button that does nothing, except for the greyed Pro buttons.
- **The first load fetched only 4 courses** (`fetchCourses(..., offset 0, limit 4)`), then loaded more on demand. A skeleton placeholder (`.loading-item` with `.background-masker` blocks) showed while loading.

### 2.4 The goal picker (modal)

Verified from frame `f000552.jpg` and the `Goal` object in the JS.

- Opens from "Set a daily goal" or "Edit goal". Header: course photo, course name, and one line that says to set a daily goal and hit it every day to win bonuses.
- Exactly three choices, as large rows with a radio dot: "5 mins a day", "15 mins a day", "45 mins a day". Each has a 3-bar icon and one friendly sentence (for example, the 5 minute row tells you this goal fits a busy life).
- Internally the goals are 1,500, 6,000 and 20,000 points (`var o=[1500,6e3,2e4]`). The user sees minutes first. Points appear as the smaller detail.
- One secondary button: "Turn off". Picking a row saves at once and the row says "Saved!". There is no separate Save button.
- The goal and the streak are **per course**, not global.

### 2.5 The sidebar

| Box | Content (verified) |
|---|---|
| Profile | Blue gradient top with the avatar overlapping it. Username (18px, blue). Rank title in small caps (for example "MEMBRAIN"). A row of round badges. Two numbers side by side: "words learned" and "points" (18px, weight 800, blue, with 12px labels). A "View profile" link. |
| Streak Clock | Orange header with a check icon and "Streak Clock". Text: "Time left to complete your daily goals". Two inset blocks: hours and mins. A "Change timezone" link. It counts down to midnight (`time_till_midnight`). |
| Pro box, free users | "Difficult words, audio review, personal learning stats...", then "More learn modes", "More variety", "Faster progress", "from $9 per month only", and a green block button "Go Pro today". |
| Pro box, Pro users | "This month's learning graph": a 30 day grid of small squares in three intensities (classes `low`, `average`, `high`), with weekday initials. Then "Best streak" and "Last 7 days" (time spent). A "More" link to `/home/learning-statistics/`. |
| Leaderboard | Trophy icon and "Leaderboard". Top 3 rows only (rank, avatar, name, points). The user's own row is highlighted in blue. A "More" link to `/home/leaderboard/`. Hovering a row shows a small profile card with a Follow button. The data came from `/ajax/leaderboard/mempals/`, so it ranks you against the people you follow. |

The statistics page also had a full year activity grid, GitHub style (`.attendance-grid` with `.day-boxes .q0` to `.q3`). Its four colors were `#eaeaea`, `#a3daf7`, `#5cbdf2`, `#15A1EC`: one hue (blue), getting darker with activity. This is the same idea Crystal liked in example-01.

### 2.6 Night mode (the dark navy)

Verified in `S/wbcss/web.css` and `S/wbdash/dash-201703.css`, and seen in frame `f000230.jpg`.

- The `<html>` element could carry a class `night`.
- `html.night .header-v2` changed the header from sky blue to navy: `linear-gradient(0deg, rgba(40,41,108,0.94) 4%, #282A6C 100%)`.
- `html.night #page-head` changed the landscape band to a sunset: `linear-gradient(1deg, #b86164 4%, #3c3f81 75%, #282b6c 100%)`. The sun moved lower (`top:126px` instead of `64px`).
- In the frame where the Streak Clock reads "0 hours 24 mins", the header is navy. In frames with 3 hours left it is blue. So the header darkened near the end of the day.
- Not verified: the exact rule that switched it on (the class was likely set by the server).

Why this matters: the old app already had a dark state, and it was the same picture at a different time of day. It was not an inverted palette.

### 2.7 The 2013 dashboard (older, for comparison)

Verified from `S/wbdash/home-201306.html` (an anonymous visitor's dashboard, 1 June 2013).

- Top: avatar, "You", rank "Membryo", and four stats in a row: Following, Followers, Items, Points.
- Tabs: Home, Learning, Mems, Leaderboard.
- A "Pinned" section: the user could pin up to 3 courses for quick access.
- "Courses you might like" below.
- In 2013 the vocabulary was "items", not "words".

---

## 3. Vocabulary

### 3.1 Terms and where they are verified

| Term | Meaning | Verified in |
|---|---|---|
| course | A set of things to learn, made by Memrise or by a user. Never "deck" in this era. | all 2016 captures |
| level | A chapter of a course. Either words to learn or "Multimedia". | `S/wb/course12.html` |
| words (earlier: items, internally: things) | The units you learn. | 2013 capture says "items"; 2015 and later say "words"; CSS classes say `.thing` |
| mem (plural mems) | A community-made memory aid shown under a word: picture, phrase, etymology, video. | About page; transcript 03:33 to 04:16; frame `f000355.jpg` shows "Choose a mem to help you remember:" with a picture mem, its author, and a +38 thumbs up |
| Mempty | The label shown when a word has no mems yet. | transcript 05:00 |
| mempals | People you follow. | JS endpoint `/ajax/leaderboard/mempals/`; 2013 capture URLs |
| Learn / Learn new words | Start new words. | JS |
| Review (N) | Review words that are due. | JS, frames |
| Speed review | A timed, fast review game. | JS tooltip, frame `f000230.jpg`, transcript 02:28 |
| Difficult words | Words you keep getting wrong, marked with a lightning bolt. Extra practice mode for Pro. | JS, frame `f000642.jpg`, transcript 06:38 to 06:54 |
| Ignore | Hide a word you already know from all sessions. | level page capture, transcript 06:12 to 06:34 |
| daily goal, streak, Streak Clock | See 2.3 to 2.5. | JS, frames |
| points | Earned in sessions (speed and accuracy bonuses). Used for goals, ranks, and leaderboards. | frame `f000642.jpg` shows "Speed 1min 40, 98 pts", "Accuracy 84%, 156 pts", "Total points 1613 pts" |
| ranks | Titles earned with points, all puns on "mem": Membryo, Mempee, Memonist, Membrain, Memtor, Memperor, Overlord and others. | CSS class names `.rank-badge-membryo` etc. in `S/wbcss/web.css` |
| Pro / Go Pro / premium | The paid tier. | JS, frames |
| Groups | Classes for teachers, with their own leaderboard. | header in frames |

### 3.2 The garden words, and how they faded

| Date | Level page legend | Unit word | Source |
|---|---|---|---|
| June 2013 | "Ready to plant" / "Ready to water" | items | `S/wbold/lvl-20130601.html` (capture 20130606173916) |
| Feb 2014 | "Ready to plant" / "Ready to water" | items | `S/wbold/lvl-20140601.html` (capture 20140226134016) |
| May 2015 | "Ready to learn" / "Ready to review" | words | `S/wbold/lvl-20150601.html` (capture 20150531083827) |
| Mar 2016 | "Ready to learn" / "Ready to review" | words | `S/wb/course12-2.html` |

So between early 2014 and mid 2015 Memrise **replaced the garden verbs with plain verbs in the interface**, but kept the garden in the pictures:
- purple seed icon = not learned yet, blue water drop = due for review (`.ico-seed`, `.ico-water`),
- a growing plant during a session (frame `f000136.jpg`, `f000150.jpg`), with seven sprite stages in the CSS (`.garden-box .ico-growth.lev0` to `.lev6`, plus `.lev6.due-for-review`),
- a flower in the "Memory strength" column at the end of a session (frame `f000642.jpg`),
- the landscape drawing on the dashboard and at the bottom of every session.

The garden words lived on in marketing and reminders. A March 2016 review is titled after the reminder "Your Plants Need Watering" (latg.org, read through a summarizer).

Not verified: the words "harvest" and "wilting" in the official interface. I only found them in a search snippet about an unofficial browser extension from 2013. Treat them as likely but unconfirmed.

---

## 4. Visual language, with recovered CSS values

### 4.1 Color timeline of the header and main buttons

| Date of CSS | Header | Main green button | Other accents | Page background | Source file |
|---|---|---|---|---|---|
| Mar 2016 | sky blue `#11a3ed` (navy `#282A6C` in night mode) | gradient `#83cd2b` to `#7ec826` | light blue, orange, red, purple, pink buttons | `#f5f5f5` with a noise texture | `S/wbcss/web.css` |
| Jul 2017 | sky blue `#11a3ed` | same | same | same | `S/wb2018/web-201707.css` |
| Apr 2018 | **purple `#7757A8`** | flat `#08b60b` | a yellow button appears (`#FFDC00` to `#EDCD09`) | `#f5f5f5`, texture removed | `S/wb2018/web-201804.css` |
| Oct 2019 | part of the "rebrand" stylesheet | green kept for legacy buttons | **yellow `#FFC000` with navy text `#2C3445`**, navy `#2B3648` | **cream `#FCFAF2`** | `S/wb2018/web-201910.css`, `rebrand-201910.css` |

So the "dark navy and yellow" look that people remember is the **2019 rebrand**, plus the 2016 night mode. The 2016 to 2017 dashboard itself was a bright, many-colored, sky blue design.

### 4.2 2016 palette, with OKLCH and contrast

I converted each hex to OKLCH and computed WCAG 2 contrast ratios myself (script output, not from a source).

| Role | Hex | OKLCH | Where | White text on it |
|---|---|---|---|---|
| Header, links | `#11a3ed` | `oklch(0.682 0.153 240)` | header bar, link color `#15a1ec` | 2.81:1 (fails 4.5:1) |
| Sky gradient | `#36ADED` to `#2183E3` | `oklch(0.711 0.138 237)` to `oklch(0.606 0.169 253)` | landscape band, landing hero | n/a |
| Learn (primary) | `#83cd2b` | `oklch(0.771 0.199 132)` | Learn button, progress bar, Sign up | **1.96:1** (fails) |
| Review | `#6ec8f9` | `oklch(0.796 0.111 234)` | Review (N) button | **1.86:1** (fails) |
| Speed | `#f6724c` to `#e75429` | `oklch(0.703 0.171 37)` | speed review button | 2.83 to 3.69:1 |
| Difficult, goal | `#F99A20`, `#f57c23` | `oklch(0.767 0.164 65)`, `oklch(0.713 0.174 51)` | difficult words, goal chip, streak number, Streak Clock header | 2.17:1 and 2.70:1 |
| Audio | `#9B26AF` | `oklch(0.514 0.215 321)` | audio button | 6.38:1 (passes) |
| Pro | `#f849a3` | `oklch(0.679 0.224 353)` | Go Pro button | 3.24:1 |
| Night navy | `#282A6C` | `oklch(0.326 0.112 277)` | night header | 12.82:1 (passes) |
| Body text | `#3E3E3E` | `oklch(0.364 0 0)` | all body text | on white 10.70:1, on page grey 9.81:1 |
| Muted labels | `#AAAAAA`, `#b2b2b2` | n/a | legend text, weekday initials | **2.32:1 and 2.00:1** (fail) |
| Page | `#f5f5f5` | `oklch(0.970 0 0)` | page background | card white vs page: 1.09:1 |
| Card | `#FFFFFF` with `1px solid #e4e4e4` and a `0 1px 2px rgba(0,0,0,0.08)` shadow | | every box | |

2019 rebrand values for comparison: navy `#2C3445` = `oklch(0.325 0.032 265)`; yellow `#FFC000` = `oklch(0.842 0.173 85)`; cream `#FCFAF2` = `oklch(0.984 0.011 95)`. Navy text on yellow is 7.60:1. Navy on cream is 11.93:1. White on navy is about 12:1.

What the numbers say (inferred):
- The 2016 design looked high-contrast because of **hue and saturation**, not lightness. Its buttons all sit at lightness 0.68 to 0.80 with white labels. Measured, most of them fail WCAG. People with weak eyesight would struggle with those button labels.
- The 2019 rebrand fixed this the right way: **bright fill, dark text** (navy on yellow), and dark navy surfaces with light text.
- The body text was always strong (`#3E3E3E`, about 10:1). Only the muted labels were too pale.

### 4.3 Depth on buttons (the part worth keeping)

Verified in `S/wbcss/web.css` and `landing.css`.

- Every `.button` used three shadows at once:
  `box-shadow: -1px 2px 4px 0 rgba(0,0,0,0.16), inset 0 -2px 7px 0 rgba(0,0,0,0.1), inset 0 2px 0 0 rgba(255,255,255,0.3)`.
  That is: a soft drop shadow, a darker inner bottom, and a light inner top edge. The button looks raised and pressable.
- Plus a subtle top-to-bottom gradient of the same hue, a 1px border in a darker shade of the same hue (`#63a614` on the green), and `text-shadow: 0 1px 2px rgba(0,0,0,0.24)` on the label.
- Hover made the fill a little lighter. Active state removed the gradient lift.
- The landing page button was bigger and bolder: 24px, weight 600, radius 8px, gradient `#67D523` to `#4FC618`, shadows `2px 2px 6px rgba(0,0,0,0.2), inset 0 2px 4px rgba(255,255,255,0.2), inset 0 -3px 0 rgba(0,0,0,0.1)`, hover `scale(1.05)`, active `scale(0.95)`, and a pulse animation.
- Dashboard button text was small: 14px, weight 400, letter-spacing 0.6px, padding `7px 20px`. That makes a button about 32px tall. Too small for touch by today's standard.

### 4.4 Typography

Verified in `S/wbcss/web.css`, `landing.css`, `S/wbdash/dash-201703.css`.

- UI font: **Open Sans** (header, buttons, dashboard cards, sidebar). Body fallback: Helvetica Neue, Helvetica, Arial, with "Kai", "KaiTi" listed for Chinese.
- Accent: **Lora italic** for two words in the landing headline.
- Dosis is imported in every stylesheet. I found no rule that uses it in the files I checked.
- 2019 rebrand: a custom rounded display face ("Boing") for headings and yellow buttons, weight 900, uppercase, plus Noto Sans for Japanese.
- Type scale on the dashboard: 11px (weekday initials), 12px (labels), 14px (body, buttons), 18px (sidebar name and stat numbers, weight 600 to 800), 20px (card title, weight 700), 24px (streak number), 25px (`h1`). That is seven sizes. Memli's dashboard currently has 15 size and weight pairs.
- Body text color `#3E3E3E`, headings `#3E3E3E` bold, `line-height: 1.5em`.

### 4.5 Illustration

- One illustrated band at the top of the dashboard: landscape, clouds, sun. The same landscape ran along the bottom of learning sessions (frames `f000136.jpg`, `f000355.jpg`).
- Course cards used photos uploaded by course authors. Quality varied a lot.
- The plant and flower icons were the only "character". There was no mascot in 2016.
- The art carried the mood. The data areas stayed white and plain.

### 4.6 Layout and responsiveness

- 2016: `html { min-width: 940px }`. The dashboard used fixed widths (sidebar 195px, card main area 578px). It did not adapt to phones. Mobile users were sent to the native apps.
- Media queries existed for the landing page (breakpoints at 699px and 1039px) but the dashboard CSS has almost none.
- By April 2018 the `min-width` was gone from the `html` rule.

---

## 5. What long-time users loved, and what was lost

### 5.1 Timeline

| Date | Event | Source |
|---|---|---|
| 2010 to 2013 | Garden game: every word is a plant that withers if neglected. | Gizmodo, 23 June 2011 (read through a summarizer) |
| 2013 | Dashboard with pinned courses, tabs (Home, Learning, Mems, Leaderboard). Words are "items". | `S/wbdash/home-201306.html` |
| 2014 to 2015 | Plain verbs replace "plant" and "water" in the interface. | Section 3.2 |
| 2016 to 2017 | The dashboard in Section 2: course cards, per-course goal and streak, Streak Clock, leaderboard. | Section 2 |
| Apr 2018 | Purple header, flat green, first yellow button. | `S/wb2018/web-201804.css` |
| 19 to 21 Feb 2019 | "Decks" announced: all community-made courses move to a separate sister site. Website only, no app, no offline. Memrise says it will not invest in new features for it. The post admits the news frustrated many users. | Memrise blog, 21 Feb 2019 (capture 20190222225614, `S/wbforum/decks-blog2.html`) |
| Oct 2019 | Rebrand: navy, yellow, cream, new display font. | `S/wb2018/rebrand-201910.css` |
| Feb 2020 | Decks is closed and community courses return to the main site. Staff say they received a great deal of feedback and that the two belong together. Site closed 25 Feb 2020, 16:00 UK time. | Memrise forum (capture 20200304114659, `S/wbforum/decks-reversal.html`) |
| 26 Nov 2021 | Announcement: from 31 Dec 2021 the "classic" homepage and learning sessions are retired and everyone moves to the redesigned dashboard. Mems are removed. Stated reason: most learners with access did not use them. | Memrise forum (capture 20231130232420, `S/wbforum/rollout2021.html`) |
| 5 Sept 2022 | Mems fully removed. | Wikipedia (summarizer), thread title seen in the forum capture |
| 8 Dec 2023 | Community forum closed. | Wikipedia (summarizer) |
| 31 Mar 2024 | Community courses moved off the app and main site to a separate web address. | explore.memrise.com/community-courses (summarizer) |
| 2026 | Memrise says user-made "word lists" are returning to the app. | same page |

### 5.2 What users said they valued (verified in the forum captures)

From the November 2021 rollout thread (replies dated 29 Nov 2021, each with 17 to 54 likes):

- **Mems were the point.** Several users said mems were the main reason they used, or paid for, the product. One pointed out the site is named after them. Users with ten years of history had made over a thousand each.
- **Community.** One user wrote that mems gave the strongest sense of community: many small contributions building a shared toolbox.
- **Mems were buried before they were cut.** Users argued the low usage numbers were caused by the design: mems were hidden in official courses, and on Android you had to scroll past the translation to see them. A feature that is hard to find looks unused.
- **Density and control on the dashboard.** One long-time user listed what the new dashboard lost: the course filter dropdown, a timer option, compact layout, customization, and working user scripts. Their summary of the new look: "a dashboard made for kiddies learning max 10 courses". They complained about huge white spaces and huge letters.
- **Trust.** Users were angry that a promise to bring mems to the new experience was broken, and that the reasons were not explained.

From the February 2020 Decks reversal thread:

- Users did not want two apps for one habit. The top reply (51 likes) said exactly that.
- Some users preferred the older color scheme with green, blue, red and orange buttons, and disliked the new yellow buttons. One asked for a choice of themes in settings.
- One user asked for the per-course streak display back.

From the February 2019 Decks blog comments:

- A commenter noted that small features important to community content (filtering, rating) had been dropped for years, and named mems as a feature that had already been cut back.

### 5.3 Summary: loved and lost

| Loved in the old web app | What happened later |
|---|---|
| Mems made by the community, with votes | Hidden in official courses, then removed (2021 to 2022) |
| Any topic, any language, user-made courses in the same app | Split out (2019), merged back (2020), split out again (2024) |
| A compact dashboard: one row of actions per course, filter and pin | Replaced by a larger, simpler layout with fewer options (2020 to 2021) |
| Clear, fixed button colors per action | Rebranded to a yellow primary (2019). Some users disliked it. |
| Per-course goals, streak bubbles, points, ranks, leaderboard with friends | Reduced over time. Memrise's current help says it has no leaderboards or friend features (search result summary, not opened). |
| A playful garden and landscape | Art replaced in the rebrand. Garden vocabulary had already faded by 2015. |

Honest limits: forum posters are the most invested users. They are not a sample of all users. Memrise's own stated data was that most learners did not use mems. Both things can be true.

---

## 6. Transferable lessons for the Memli dashboard

Each lesson says what is **verified** about old Memrise and what is my **inferred** advice for Memli. Memli facts come from the task brief and the screenshot of the current page.

### Lesson 1. Put the number inside the button

- Verified: the review button read "Review (597)". There was no separate headline, caption, or source chips for the due count. Template: `_t("Review (__reviewNum__)")`.
- Inferred for Memli: today the Today panel spends 7 lines on one decision: "TODAY", "24", "cards ready to review", "About 4 minutes", two source chips, "Starts in Spanish Core 1000.". Collapse it. One big number, one button that names the action and the amount, for example "Review 24 cards". Move "About 4 minutes" next to the button as the only supporting line. Drop the chips and "Starts in..." from the first view.
- i18n note: Memrise used a named placeholder inside a translatable string. Memli should do the same with ICU plurals, so "1 card" and "24 cards" and languages with more plural forms all work. Do not build the label by joining strings.

### Lesson 2. Say each fact once

- Verified: on the old card, "637 / 4725 words learned" appeared once, next to one bar. The due count appeared once, on the button. First screen total: about 45 to 50 words (my count from frame `f000102.jpg`, including nav and sidebar).
- Inferred for Memli: the current page states the Spanish due count three times (24 total, "16 from Spanish Core 1000", "16 Due") and mastery twice ("5% mastered of 1,000 cards" and "52 mastered, 148 learning, 800 not started"). The streak appears in the greeting line and again in the This week card. Pick one home for each fact. Target under 80 words above the fold.

### Lesson 3. One action per color, always in the same place

- Verified: Learn was always green and always the rightmost button. Review was always blue, to its left. Speed was red, difficult words orange, audio purple. The order is fixed in the code.
- Verified weakness: five saturated buttons in a row competed with each other, and white text on the green and blue failed contrast (1.96:1 and 1.86:1).
- Inferred for Memli: keep the idea, fix the execution. Give **Review** one fixed role color and position on every card and every state, and make it the only solid button on screen. "Learn new words" is second: an outline or soft-tinted button, same position every time. Everything else is a text link or lives in a menu. Never let two solid buttons sit side by side.

### Lesson 4. Let the main column win by size, and keep the side quiet

- Verified: the old sidebar was 195px. The course cards were about 715px. The sidebar boxes used small type (12 to 18px) and no large shapes. Above the fold, the only saturated objects in the main column were the buttons of the first card.
- Inferred for Memli: the 320px aside holds a progress ring with a big "24", seven filled blue circles, and two bold stats. Those are strong shapes right next to the Today panel, and they use the same blue as the primary button. That is a main reason the eye does not settle. Either narrow and mute the aside (grey ring track, outline check marks, smaller numbers), or move the week strip under the hero as one thin row. The primary blue should appear on exactly one large element in the first screen.

### Lesson 5. Keep the 7-day strip, drop the paragraph around it

- Verified: the goal strip was seven day bubbles with weekday initials, a check on completed days, a highlight on today, one streak number with the word "STREAK", and one thin bar for today's progress. No sentences. It could be collapsed by clicking the goal chip.
- Verified: weekday initials came from a locale-aware helper (`getWeekdayName(i, true)`) and the row started from the server's day of week. They were not hard-coded letters.
- Inferred for Memli: Crystal circled the 7-day check card in example-05. Keep that pattern. Remove "26 more cards to reach today's goal." or reduce it to "24 / 50". Generate initials with `Intl.DateTimeFormat` (narrow weekday) and respect the locale's first day of week. Give each day an accessible name ("Monday, goal met"), because a single letter "T" is ambiguous for screen readers and for Tuesday versus Thursday.

### Lesson 6. Offer goals in human units, with three choices

- Verified: the goal picker offered exactly three options, shown as "5 mins a day", "15 mins a day", "45 mins a day", each with one friendly sentence. Points (1,500, 6,000, 20,000) were the hidden mechanics. Choosing saved at once.
- Inferred for Memli: "24 of 50 cards" makes a non-technical person do arithmetic. Lead with time ("About 4 minutes left today") or a simple label (Light, Regular, Serious) and keep the card count as the small print. Three choices are enough.

### Lesson 7. Use plain verbs in labels, and keep the metaphor in the pictures

- Verified: Memrise moved from "Ready to plant / Ready to water" (2013 to early 2014) to "Ready to learn / Ready to review" (by May 2015), and from "items" to "words". The garden stayed as icons: seed, water drop, growing plant, flower.
- Verified: Memrise called the unit a "course" for its whole classic era. "Decks" was only the name of the 2019 spin-off site. In 2026 Memrise's own pages say "word lists".
- Inferred for Memli: this supports Crystal's doubt about the word "Deck". For people who have never used flashcard software, "deck" is jargon. Test "word list" or "course" with a few non-technical people. Whatever the noun, the verbs on buttons should stay "Review" and "Learn". If Memli adopts a growth visual (example-01 had a "memory garden"), use it as a status picture next to plain words, never as the label itself.

### Lesson 8. Turn "tricky words" into one line with a count

- Verified: the old dashboard showed difficult words as one small button: a lightning icon and a number, with the tooltip "Review your difficult words". The end-of-session table marked each difficult word with the same lightning icon.
- Verified weakness: for free users the button was greyed out and linked to an upsell. It looked broken.
- Inferred for Memli: the current card uses a heading, a two-sentence explanation, five word chips, and "and 2 more" (about 30 words). Reduce to one row: icon, "7 tricky words", and a link such as "Add a mnemonic". Show the words after the click. Never show a control that looks disabled as a way to sell something.

### Lesson 9. Progressive disclosure for statistics

- Verified: the old dashboard showed two numbers in the profile box (words learned, points). The learning graph, best streak and time spent were a small sidebar box with a "More" link to a separate statistics page. The year grid lived on that page.
- Verified: rare course actions (details, share, quit) were inside a three-dots menu.
- Inferred for Memli: the "Your progress trends" strip (Consistency 98%, Retention 84%, New cards 142, each with a comparison line) is a second dashboard at the bottom of the first one. Move it to a Progress page, and leave one link. If the owner wants the GitHub-style grid Crystal liked, it belongs there or as one small, single-hue block low on the page. Use one hue with 4 lightness steps, as Memrise did, and make sure adjacent steps differ enough to see (their lightest step against the empty color was only 1.25:1, which is too close).

### Lesson 10. Bright fill needs dark text. Dark surfaces need light text. Do not rely on hue.

- Verified: the 2016 buttons failed WCAG contrast with white labels (Section 4.2). The 2019 rebrand used navy text on yellow (7.60:1) and navy surfaces with white text (about 12:1).
- Verified: cards were separated from the page by a border and a shadow, because white on `#f5f5f5` is only 1.09:1.
- Inferred for Memli: this matches Karen's comment that on light backgrounds "the words blend in". The fix is lightness contrast, not more color. Memli's pale blue Today panel on an off-white page repeats the 2016 mistake of separating areas by faint tint only. Make the hero a clearly different lightness (a deep navy panel with white text in light mode is one option that also echoes what Woodson and Karen liked), and keep muted text at 4.5:1 or better. The old `#AAAAAA` labels (2.32:1) are the thing not to copy.

### Lesson 11. A dark mode can be the same place at night

- Verified: night mode kept the layout and the art and shifted the header to navy `#282A6C` (`oklch(0.326 0.112 277)`) with a warm sunset band. It was not an inversion. The 2019 navy was `#2C3445` (`oklch(0.325 0.032 265)`).
- Inferred for Memli: Memli's dark background is `oklch(0.175 0.025 261)`. Its chroma is so low that it reads as near-black slate. Both Memrise navies sit at lightness about 0.33 with visible blue. For large surfaces a chroma near 0.03 to 0.05 (like the 2019 navy) at a lightness between 0.20 and 0.28 would read as "rich navy" and still leave room for lighter cards above it. Treat these numbers as a starting point for the color agent, not a final answer.
- Inferred: offer the choice in a visible place. Crystal circled the bottom-left sidebar area in example-02. A theme control near the account button there would be easy to find. Also follow the system setting by default.

### Lesson 12. One calm illustration, with meaning

- Verified: one landscape band, no text on it, with a sun whose position related to time of day. Data areas stayed plain white.
- Inferred for Memli: Crystal and Ben chose example-01 because it was "more fun". Fun can come from one place: a small illustration or a mnemonic image inside the hero (Crystal circled the mnemonic image in example-04 and the "Your next memory" card idea in example-05). Do not decorate every card. Memli's unique asset is the mnemonic picture, so that is the natural art. Do not reuse Memrise's landscape or plants.

### Lesson 13. Simplify by hierarchy, not by inflating everything

- Verified: when Memrise simplified its dashboard in 2020 to 2021, power users complained about huge white space, huge letters, a layout that only worked for a handful of courses, and the loss of the filter. The classic dashboard loaded 4 course cards first and had a filter with four options ("With goal set", "Recently learned", "Teaching", "By category").
- Inferred for Memli: reduce words and competing shapes, but keep the list of other decks compact and scannable. Show the focus deck large, then at most 3 or 4 compact rows, then "Show all". Add a filter only in the many-decks state. Check the `?preview=many-decks` and `?preview=one-deck` states so the page works at both ends.

### Lesson 14. Do not hide the thing that makes the product special

- Verified: users argued that mems looked unused because the interface buried them, and then they were cut. They were the product's namesake.
- Inferred for Memli: crowdsourced mnemonics are Memli's reason to exist. The dashboard should show one mnemonic (or one prompt to add one) in the first screen, small and concrete. That also gives the page its one piece of personality.

### Things the old app did that Memli should not copy

| Old behaviour (verified) | Why not |
|---|---|
| Icon-only buttons (speed, audio, difficult) with the name only in a hover tooltip | Fails for touch, for screen readers without proper labels, and for people who do not hover. Memli's rule is kbd hints on hover only, which is fine, but action names must be visible. |
| Buttons about 32px tall, 14px regular-weight labels | Below the 44px target size of WCAG 2.5.5 (AAA) and Memli's own 44px Start review button. Hard to read for weak eyesight. |
| `min-width: 940px`, fixed column widths | No phone layout at all. Memli needs its own pass at 375 to 422px. On a phone the old card would stack as: title and progress, then the Review button full width, then the week strip. |
| A countdown clock framed as time running out, in a hot orange box | Creates pressure. For non-technical and older users, calm wording is safer. If used, phrase it as time left today, without alarm color. |
| A pink "Go Pro" filled button in the header on every page | A second saturated button that competes with the main action on every screen. |
| Greyed Pro buttons mixed into the action row | Looks broken. See Lesson 8. |
| Meaning carried by color alone (green, blue, red, orange, purple buttons) | WCAG 1.4.1 (Use of Color) says color must not be the only way to convey meaning. Pair color with a label or icon. |
| Muted labels at 2:1 contrast | See Lesson 10. |
| Mascot-free but pun-heavy vocabulary (mems, mempals, Mempty, Membrain) | Charming for fans, confusing for newcomers, and hard to translate. Each coined word is a translation problem in every language. |

---

## 7. The YouTube walkthrough

URL: https://www.youtube.com/watch?v=juNdykvLxLA

### What I could get

| Item | Result |
|---|---|
| Title | "Memrise review - English Learning Video Blog - Pyers English" |
| Channel | Kate Lucid (the description names the presenter as Kate Pyers, an online English teacher) |
| Published | 19 July 2016 |
| Length | 482 seconds (8:02) |
| Views | 3,270 at fetch time |
| Description | Three parts: what Memrise is and how to use it, why use it, five tips. |
| Captions | A human-written English caption track exists. I downloaded it with `yt-dlp` and read all of it (`S/yt/kate.en.vtt`). |
| Frames | I extracted 19 still frames at 720p with `ffmpeg` at chosen timestamps (`S/yt/frames/`). I looked at 14 of them. |

### What I could not get

- I did not watch the video in motion and did not hear the audio. I only read captions and looked at stills.
- I did not look at 5 of the 19 frames, and I sampled only moments that the captions suggested were relevant. Screens between those moments are unseen.
- The YouTube "storyboard" previews were too small (160 x 90) to read, so I did not use them.

### What the video shows (captions plus frames)

| Time | Captions say | Frame shows |
|---|---|---|
| 00:55 to 01:02 | She logs in and goes to the Courses tab. | `f000102.jpg`: the dashboard as in Section 2. Heading "Recently learned", one course card with "Goal complete!", "637 / 4725 words learned", the 7-day strip, "1 STREAK", and the button row ending in "Review (597)" and "Learn". |
| 01:06 to 01:16 | Each course shows a title, its creator, the number of subscribers and the hours it takes. | `f000110.jpg`: catalogue grid, three cards per row, language list on the left. |
| 01:26 to 01:53 | Clicking "learn" starts activities: see and hear the word, choose the right option against a time limit, sometimes type the answer. Each correct answer grows a plant. | `f000136.jpg`, `f000150.jpg`: a green session bar titled "Learn 10 new words", a points counter, a small plant icon that grows, a round timer, four numbered answers or a typing box with accent keys, a "See answer" button, and the landscape along the bottom. |
| 02:00 to 02:22 | The course card shows 597 words to review. Memrise tracks words you have not revised and asks you to review them. | `f000203.jpg`: the same card. |
| 02:28 | There is also a speed review option. | `f000230.jpg`: tooltip "Speed review" on the red clock button. Header is navy (night mode). Streak Clock reads "0 hours 24 mins". |
| 03:33 to 04:16 | Mems: any picture or phrase that helps you remember. They are made by different users, so not all are useful. You choose the one you like. | `f000355.jpg`: "Choose a mem to help you remember:" with an image mem, author, age, and a +38 like count. |
| 04:22 to 04:49 | Tip 1: settings. She raised words per learning session from 5 to 10. You can turn tapping tests and audio tests on or off. | not sampled |
| 04:52 to 05:34 | Tip 2: make your own mems. A word with none says "Mempty". You can upload a picture or type text. | not viewed |
| 05:40 to 06:05 | Tip 3: set goals (5, 15 or 45 minutes a day) and compete with friends. | `f000552.jpg`: the goal picker. `f000600.jpg`, `f000603.jpg`: the sidebar Leaderboard with three rows and "More", a hover card with a Follow button, and more course cards showing "Today: 0 / 1500 pts" and "Set a daily goal". |
| 06:05 to 06:34 | Tip 4: hidden functions. On a level page you can ignore words you already know. | `f000622.jpg`: level page with "100 words", "20 ignored", the seed and drop legend, rows with "now" or "in about a day". |
| 06:38 to 06:54 | After a session, difficult words are marked with a thunderbolt. Extra practice for them is a premium feature. | `f000642.jpg`: end-of-session table "Here are the memories you learned" with columns Difficult Words, Memory strength (plant or flower icon), the word, its meaning, Accuracy, Current streak. Points summary above it. |
| 07:00 to 07:25 | Tip 5: choose courses carefully, because members make them and quality varies. | not sampled |

Useful detail for Memli: the reviewer calls several features "hidden" and spends a whole tip on them (ignore, difficult words). Even a fan needed a tutorial to find them. That is a warning about icon-only controls.

---

## 8. What I could not access or confirm

- **The logged-in `/home/` HTML for 2014 to 2019.** Captures redirect to the login page. Section 2 is rebuilt from archived CSS and JS plus video frames. I am confident in the structure and labels. Exact pixel spacing in a live browser is not verified.
- **When night mode switched on.** I saw the CSS and one frame. I did not find the trigger.
- **"Harvest" and "wilting" in the official interface.** Only seen in a search snippet about a third-party extension.
- **Leaderboard period tabs (week, month, all time).** The CSS has a button group for leaderboard controls. I did not recover its labels.
- **The 2018 purple header as rendered.** Known only from CSS (`#7757A8`). No screenshot.
- **The first Decks forum announcement (19 Feb 2019).** The Wayback URL cited by Wikipedia returned "not archived". I read the 21 Feb 2019 blog post instead.
- **Reddit reactions to Decks (Feb 2019).** I saw one thread only as a search result. I did not open it and do not quote it.
- **Wikipedia, Gizmodo, latg.org, explore.memrise.com.** Read through WebFetch, which returns a small model's summary. I did not check their wording against the raw pages. Dates from Wikipedia agree with the forum captures I read directly.
- **The Internet Archive went "Temporarily Offline" during one index query.** One lookup for alternate captures of the Decks forum thread did not complete.
- **Use of the Dosis font.** Imported everywhere, but I found no rule applying it in the files I searched.
- **Contrast figures.** Computed by me with the WCAG 2 formula from recovered hex values. Gradients were measured at their stated end colors. APCA values were not computed.
- **User sentiment.** Forum threads show the loudest and most invested users. They do not measure the whole user base.

---

## Sources

### Wayback Machine captures read directly (raw HTML, CSS, JS)

- Landing, 2016-03-06: https://web.archive.org/web/20160306192808/https://www.memrise.com/
- Join, 2016-03-16: https://web.archive.org/web/20160316115012/https://www.memrise.com/join/
- About, 2016-03-18: https://web.archive.org/web/20160318075542/http://www.memrise.com/about/
- Languages catalogue, 2016-03-13: https://web.archive.org/web/20160313184443/http://www.memrise.com/courses/english/languages/
- Course page, 2016-03-12: https://web.archive.org/web/20160312124128/http://www.memrise.com/course/12/introduction-to-japanese/
- Level page, 2016-03-07: https://web.archive.org/web/20160307055604/http://www.memrise.com/course/12/introduction-to-japanese/2/
- Level page, 2013-06-06: https://web.archive.org/web/20130606173916/http://www.memrise.com/course/12/introduction-to-japanese/2
- Level page, 2014-02-26: https://web.archive.org/web/20140226134016/http://www.memrise.com/course/12/introduction-to-japanese/2/
- Level page, 2015-05-31: https://web.archive.org/web/20150531083827/http://www.memrise.com/course/12/introduction-to-japanese/2/
- Anonymous dashboard, 2013-06-01: https://web.archive.org/web/20130601083503/http://www.memrise.com:80/home/
- Global CSS, 2016-03: https://web.archive.org/web/20160312124128/http://static.memrise.com/dist/css/web-efda38a33.css?v=35
- Course CSS, 2016-03: https://web.archive.org/web/20160312124128/http://static.memrise.com/garden/dist/css/views/course-d5d411553.css?v=35
- Level CSS, 2016-03: https://web.archive.org/web/20160307055604/http://static.memrise.com/garden/dist/css/views/level-cb1caf143.css?v=35
- Browse CSS, 2016-03: https://web.archive.org/web/20160313184443/http://static.memrise.com/garden/dist/css/views/browse-8363da433.css?v=35
- Landing CSS, 2016-03: https://web.archive.org/web/20160306192808/https://d107cgb5lgj7br.cloudfront.net/general/dist/css/landing-fa45646e3.css?v=35
- Dashboard CSS, 2017-03-15: https://web.archive.org/web/20170315161754/https://d107cgb5lgj7br.cloudfront.net/garden/dist/css/views/dashboard-7eacacfc4.css
- Dashboard JS, 2017-03-15: https://web.archive.org/web/20170315161753/https://d107cgb5lgj7br.cloudfront.net/garden/dist/js/dashboard-349aefef4.js
- Dashboard CSS, 2016-05-08: https://web.archive.org/web/20160508140614/http://static.memrise.com/garden/css/views/dashboard.css?v=74eca8feb9
- Dashboard CSS, 2014-04-26: https://web.archive.org/web/20140426191309/http://static.memrise.com/garden/css/views/dashboard.css?v=8f9e65
- Global CSS, 2017-07: https://web.archive.org/web/20170701000000/http://static.memrise.com/dist/css/web-7ae2845e3.css
- Global CSS, 2018-04-30: https://web.archive.org/web/20180430190545/https://static.memrise.com/dist/css/web-f6ca3d7b2c13.css
- Global CSS, 2019-10-22: https://web.archive.org/web/20191022121853/https://static.memrise.com/dist/css/web-34698e8d8913.css
- Rebrand CSS, 2019-10-22: https://web.archive.org/web/20191022121853/https://static.memrise.com/dist/css/rebrand-adeaf3eab713.css
- Catalogue page, 2019-10-22: https://web.archive.org/web/20191022121853/https://www.memrise.com/courses/english/
- Memrise blog, "The Creation of Decks and the Future of Memrise", 21 Feb 2019: https://web.archive.org/web/20190222225614/https://blog.memrise.com/2019/02/21/decksbymemrise/
- Memrise forum, "Important announcement about Decks", Feb 2020: https://web.archive.org/web/20200304114659/https://community.memrise.com/t/important-announcement-about-decks/49470
- Memrise forum, "Rollout of the new dashboard and learning sessions experiences to all our customers", 26 Nov 2021: https://web.archive.org/web/20231130232420/https://community.memrise.com/t/rollout-of-the-new-dashboard-and-learning-sessions-experiences-to-all-our-customers/69305

### Video

- "Memrise review - English Learning Video Blog - Pyers English", Kate Lucid, 19 July 2016: https://www.youtube.com/watch?v=juNdykvLxLA (metadata, full captions, 19 frames)

### Pages read through a summarizer (WebFetch)

- Wikipedia, "Memrise": https://en.wikipedia.org/wiki/Memrise
- Brian Powers, "Your Plants Need Watering: A Review of Memrise", Languages Around the Globe, March 2016: https://latg.org/plants-need-watering-review-of-memrise
- Gizmodo, "Memrise Is a Viva Pinata For Language Students", 23 June 2011: https://gizmodo.com/5815059/memrise-is-a-viva-pinata-for-language-students
- Memrise, community courses page: https://explore.memrise.com/community-courses

### Seen only as search results (not opened, used only as pointers)

- Memrise help and blog pages about the new experience: https://explore.memrise.com/new-experience , https://www.memrise.com/blog/changes-to-the-memrise-app
- Chrome Web Store listing for an unofficial "Memrise Button" extension (source of the unverified "wilting" and "harvest" wording)

### Local evidence (scratchpad)

- Raw page captures: `S/wb/`, `S/wbold/`, `S/wb2018/`
- CSS: `S/wbcss/`, `S/wb2018/*.css`
- Dashboard CSS and JS: `S/wbdash/`
- Forum and blog captures: `S/wbforum/`
- Video captions and frames: `S/yt/kate.en.vtt`, `S/yt/frames/`
- Helper scripts: `S/scripts/`

### Memli files used for comparison

- Current dashboard screenshot (light, top): `session-screenshots/mcp-claude-in-chrome-blob-1794620808250-w52x37.jpg`
- `docs/designs/dashboards/README.md`

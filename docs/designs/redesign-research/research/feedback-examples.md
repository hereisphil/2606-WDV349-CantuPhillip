# Feedback and example dashboards: evidence base

Research file for the `/dashboard` redesign. It covers the five example dashboards, the current Memli page, and the four responses the owner collected.

**How to read this file.** Every claim is tagged one of three ways.

- **[Evidence]** I read it in a file, an image, or a chat screenshot, or I measured it. A source is given.
- **[Measured]** A number I computed from pixels or from the live DOM. Method is in section 12.
- **[Inference]** My own reading as a design researcher. It may be wrong.

Four respondents is a small sample. One of them gave no reason at all. Treat every "people prefer X" line here as a lead to test, not as a fact.

---

## 1. Short version

1. **The vote was for colour, depth and imagery, not for less content.** [Measured] The two picked examples (01 and 02) have the most coloured area and the widest range of light and dark on the canvas. The current Memli page has the least of both. Example-01 has about as many words on one screen as Memli does (about 160 against about 131), and it was still called "more fun".
2. **Nobody picked the example Memli was built from.** [Evidence] Example-03 got zero votes. It is also the only example Crystal did not attach or circle anything in.
3. **Crystal circled one idea twice: a single hero card.** [Evidence] In example-04 and in example-05 she circled the one card that holds the number, the deck name and the one button. The current build splits that into two boxes (Today, then Continue learning).
4. **Karen's complaint is about text against background, not about dark versus light as taste.** [Evidence] "The white background makes the words disappear." "The writing pops up." [Measured] In example-02 the dimmest text I sampled is about 13:1 against its surface. In Memli light, 58% of the visible words are the muted grey at 5.97:1, and 66% of words are 14px or smaller.
5. **The Memli CTA is not the only blue thing.** [Measured] On the first screen, the Start review button holds about 27% of the saturated blue. The active "All languages" pill holds about 22%. The week ring and check dots hold about 24%. Three equal blue masses means no single landing spot.
6. **"Fun" and "not busy" are different axes.** [Inference] Fun comes from colour, pictures, shape and voice. Busy comes from the count of things that compete. You can raise the first and lower the second in the same design.
7. **Rename "Deck".** [Evidence] One respondent flagged it. The code already calls the thing a course in the route (`/study/$courseId`) and in 77 identifiers. Old Memrise URLs used `/course/`. Recommendation: "course" in learner-facing copy.
8. **PLAN.md left out three things that the feedback asks for.** [Evidence] The heatmap (Crystal named it), images on the main card (inside Crystal's example-04 circle, and the biggest element of example-02), and the study tip (Crystal circled it; the owner's README also liked it).

---

## 2. What was asked, of whom, and how

| Item | Detail | Source |
| --- | --- | --- |
| The question | "Which one do you like most? Go with your gut feeling." | [Evidence] chat screenshots `images/2.png`, `images/3.png`, `images/4.webp` |
| What was shown | Five AI-generated dashboard images, each with a different fake brand, different data and different features | [Evidence] `docs/designs/dashboards/README.md:5` |
| Slack order | example-01, example-02, example-03, example-04, then one more behind a "+2" tile | [Evidence] `images/2.png`, `images/3.png` |
| WhatsApp order | Different. The visible grid shows example-05 and example-02 on top, example-01 below, then "+2" | [Evidence] `images/4.webp` |
| Size on first view | Chat thumbnails. In the Slack screenshots each thumbnail is about 228 px wide | [Measured] from `images/1.png` (1632 px wide) |

### The four responses, word for word

| Respondent | What they wrote | Pick | Source |
| --- | --- | --- | --- |
| Crystal (Course Director) | "Ok, my favorite is layout 1. I always choose the dark option show you should have that for which ever option you pick. I think layout 1 was more fun and it had the important information on it. I like the Github chart at the top. I am not sure about the word Deck. It may be confusing for some people. I circled what I liked about the other examples. Maybe use those down the road as components. Let me see an update when you are ready." | example-01, and dark mode on whatever ships | `images/1.png` |
| Woodson | "Second one, I like the vibe of it a lot" | example-02 | `images/2.png` |
| Ben | "Option 1" | example-01 | `images/3.png` |
| Karen | "As like presentation" / "I probably like the blue one" / "You can concentrate on reading instead of looking for them" / "The white background makes the words dissapear" / "The writing pops up" / "Exactly" / "Because the light backgrounds the words blend in" | example-02 | `images/4.webp` |

### Three corrections to the brief I was given

1. **The "deteriorating eyesight" line was typed by the owner, not by Karen.** [Evidence] In `images/4.webp` the message "Yeah that's true! and the more my eyes deteriorate the more I appreciate that LOL" is a green outgoing bubble on the right. Karen then replied "Exactly" and "Because the light backgrounds the words blend in". So Karen agreed with the point. She did not raise her own eyesight. Her contrast complaint stands on its own words.
2. **Among the four responses I can see, the vote is a 2 to 2 tie.** [Evidence] Example-01: Crystal, Ben. Example-02: Woodson, Karen. The README says example-02 was "the most popular" (`README.md:5`) and the owner told Karen "It seems to be the most popular so far". There may be responses I was not given. I cannot confirm "most popular" from the four I have.
3. **PLAN.md did not name the study tip in its "left out on purpose" list.** [Evidence] `PLAN.md:26` lists hero photos, the memory garden, the yearly heatmap, search, upsells and forecasts. The study tip is not on that list. It was dropped silently: the PLAN's "keep" row for example-02 (`PLAN.md:21`) lists the greeting, the active deck and the compact rows only, while the owner's README had praised "the study tip" (`README.md:8`).

### Limits of this evidence

- **It measured first-glance appeal, not ease of use.** [Inference] "Go with your gut" at thumbnail size rewards colour and big shapes. Nobody was asked to find the next action.
- **The five images differ in everything at once.** Brand, data, features, theme and picture content all change. A vote for example-02 could be a vote for the navy, the photo, the yellow button, or the layout. Only Karen and Crystal said which.
- **Viewing conditions are unknown.** I do not know the respondents' devices, screen sizes, or whether they opened the images full size. The owner's own Slack and WhatsApp were in dark theme in the screenshots. If the respondents' were too, a dark image blends with dark chat chrome and a white image glares. That is simultaneous contrast (Albers, *Interaction of Color*: a colour looks different depending on what surrounds it). It could favour example-02. I cannot check it.
- **Ben gave a vote and no reason.** Do not read needs into it.

---

## 3. All six pages at a glance

Numbers are approximate. Word counts are my manual count of the text visible in each image's main area (sidebar excluded). Pixel metrics are explained in section 12.

| Measure | ex-01 Mnemonica | ex-02 LinguaForge | ex-03 Mnemo | ex-04 LingoRecall | ex-05 Luma | Memli now (light) | Memli now (dark) |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Votes (of 4 seen) | 2 | 2 | 0 | 0 (hero circled) | 0 (hero and streak circled) | not shown | not shown |
| Theme | light, cool grey | dark navy | cream | warm cream | pastel off-white | cool off-white | near-black slate |
| Words in main | about 160 | about 100 | about 165 | about 77 (image is cropped) | about 130 | 192 whole page; about 131 on the first screen of the owner's screenshot | same |
| Top-level boxes | 6 | 5, plus 1 in the sidebar | 7 | 7 (2 cropped) | 5 | 8 | 8 |
| Small chips, pills, badges | 6 chips, 4 gallery tiles | 1 pill | 3 status pills, 3 badges, 1 streak pill | 3 pills | 2 chips, 7 day circles | about 19 (5 language pills, 2 deck chips, 5 word chips, 3 status chips, 4 badges) | same |
| Solid filled buttons | 5, in 5 colours | 2 yellow (Start Study, Upgrade), plus the nav pill | 3 indigo | 1 | 1 | 1 CTA, plus 1 filter pill in the same blue | same |
| Accent hues in the UI | about 6 | about 5 | 3, plus 2 badge tints | 1, plus 2 tiny pills | 3 pastels | 1 blue, plus two 14px orange icons | same |
| Pictures | 3 illustrations, 8 plant icons, gallery tiles | 1 photo, 3 flags, owl mascot | none | 1 photo | 2 pictures | none | none |
| Vivid pixels (OKLCH chroma over 0.08) | 5.0% | 16.0% | 3.1% | 2.5% | 1.0% | 1.2% top, 0.4% scrolled | 1.4% |
| Mid-tone pixels (L 0.35 to 0.85) | 17.2% | 16.6% | 8.4% | 10.2% | 7.3% | 4.9% | 6.4% |
| Lightness spread (std. dev. of L) | 0.136 | 0.153 | 0.093 | 0.117 | 0.082 | 0.086 | 0.089 |
| Page to card lightness step | 0.038, plus shadows | cards within about 0.05 of the page, set off by a 1px light border and a gradient page | 0.030 | 0.027, plus shadow, plus a third outer layer | 0.021, plus shadow | 0.015, no shadow | 0.061 |
| Dimmest body text against its surface | about 18.8:1 (all text is near-black) | about 13.4:1 | about 5.8:1 | about 19:1 | about 12.1:1 | 5.97:1 (muted token on page) | 5.78:1 on card, 6.59:1 on page |
| Primary CTA size in the image | 625 x 83 px (about 313 x 42 CSS px if the capture is 2x) | 254 x 62 | 168 x 52 | 254 x 46 | 221 x 57 | 126 x 44 CSS px | same |
| CTA width as share of its card | 29% | 30% | 26% | 43% | 22% | 14% at a 1960 px window, 18% at 1024 px | same |
| CTA fill against its surround (WCAG) | 4.05:1 | 11.85:1 | 6.31:1 | 2.75:1 | 2.30:1 | 6.27:1 | 6.05:1 |
| Largest text (estimate from glyph height) | about 27 CSS px heading | about 46 px heading | about 64 px "84" | about 45 px heading | about 80 px "32 words" | 48 px "24", 30 px h1 (measured in DOM) | same |

**What the table says.** [Measured] The two picked examples lead on three rows: vivid pixels, mid-tone pixels, and lightness spread. Memli is last or next to last on all three. Word count and box count do not separate the picked examples from the unpicked ones. Example-01 is the busiest of the five by boxes, buttons and words.

---

## 4. Example by example

"Eye path" lines are **[Inference]**. I reasoned from size, weight, colour and isolation. I did not run an eye-tracking study or a saliency model.

### 4.1 example-01, "Mnemonica" (light). Picked by Crystal and Ben.

| | |
| --- | --- |
| Eye lands 1st | The big deck card at the lower left. It is the largest box, the only one with a 3px teal outline, it has a mint-tinted panel with the "German Cafe" illustration, and it ends in a full-width blue bar ("Review (45)", about 694 x 86 px). |
| 2nd | The teal "Start Daily Review (124 cards due)" bar near the top left. It is the widest filled shape in the reading start position (625 x 83 px). |
| 3rd | The yellow and red "Study Now" buttons and the piñata illustration, the most saturated multi-colour object on the page. |
| Also pulling | The navy "My Courses" nav pill and navy "Add New Deck" button (the two darkest masses), and the green heatmap at the top right. |
| Words | About 160 in main, on one screen. |
| Boxes | 6 top-level cards. About 18 counting nested chips and gallery tiles. |
| Accent colours | About 6: teal, blue, yellow, red, navy, heatmap green. Plus full-colour illustrations. |
| CTA treatment | Solid teal with a soft shadow, with the count in the label. An outlined "Learn New Words (+15)" sits beside it. But 4 more solid buttons in 4 other colours compete with it. |
| Surface steps | Page L 0.962, cards white (step 0.038), soft drop shadows, tinted inner panels at L 0.93 to 0.96 (mint, yellow, pink, blue). So 3 clear layers plus shadow. |
| Text contrast | All text is near-black, about 18.8:1 on the page. There is no grey "muted" text at all. Weak spot: white on teal is about 3.98:1, under WCAG's 4.5:1 for that label size. |
| What feels fun | Illustrated art per deck. The plant "memory garden" (seed, sprout, grown). A brain emoji and a flame in the greeting. Exclamation marks. Thick rounded buttons with shadow. A colour per deck status. Tiny picture tiles with real words ("das Haus", "la mesa"). |

**Honest read.** [Inference] Example-01 breaks the "one main action" rule badly. It has five filled buttons in five colours, and the same job is offered three times (Start Daily Review, Review (45), Study Now). It still tied for first. That tells us the respondents were rewarding warmth, colour and clear big labels, not focus. Crystal's own words back this: "more fun" and "had the important information on it".

**On "big fonts".** [Inference] The image is 2752 px wide and shows a Safari window. If it is a 2x capture, the heading is about 27 CSS px and the body is about 17 px. So the type is not huge. What reads as "big" is that almost nothing important is under 16 px, card titles are about 22 px, and everything is full black.

**Words this mock uses for the content unit.** [Evidence] "My Courses" (nav), "Create Deck" (nav), "Add New Deck" (button), "My Decks & Courses" (heading). It mixes both words.

### 4.2 example-02, "LinguaForge" (dark navy). Picked by Woodson and Karen.

| | |
| --- | --- |
| Eye lands 1st | The street photo in the hero card. At 296 x 318 px it is the largest area of saturated, many-hued colour. It holds about a third of all vivid pixels on the page. |
| 2nd | The yellow "Start Study" button, 254 x 62 px. It is the only large warm, light shape on a cool dark page. Yellow on navy is close to a complementary pair, and its fill is 11.85:1 against the card. It sits in the same card as the photo, so the first two looks land in one box. |
| 3rd | The white bold "Welcome back, Phillip!" (about 46 px) or the green 72% ring. |
| Also pulling | The yellow "Upgrade" button at the lower left uses the same fill as the CTA. The indigo nav pill. |
| Words | About 100 in main. Sixteen more in the sidebar. |
| Boxes | 5 cards in main (hero, Your Progress, Your Decks, Upcoming Reviews, Study Tip), plus the Go Pro card in the sidebar. |
| Accent colours | About 5: yellow, green, indigo, blue, orange. Plus the photo, three flags and the owl. |
| CTA treatment | Solid yellow, dark label, play icon. A quiet dark "View Progress" button beside it (1.12:1 against the card, so it nearly disappears, which is the point). |
| Surface steps | The page is a navy gradient, about oklch(0.20 to 0.28, 0.06 to 0.09, 260) at the top and oklch(0.26, 0.05, 267) at the bottom. Cards are about oklch(0.21 to 0.25, 0.045, 268). The cards are barely lighter or darker than the page. They are separated by a 1px lighter border and by their content. The Study Tip card is the only warm surface: oklch(0.33, 0.02, 61). |
| Text contrast | Heading white, 15.7:1. Deck meta text ("500 words • 72% mastered") about oklch(0.91, 0.03, 260), 13.4:1. Nav text 16:1. Nothing I sampled is under 13:1. |
| What feels fun | A real photo of a place where the language is spoken. The owl in a graduation cap. A flexed-arm emoji. The flame. The gold-on-navy palette. Coloured progress bars, one hue per deck. |

**Why it reads as focused even with 5 cards.** [Inference] One card has the photo, the largest title and the only warm button. Everything else is cool and quiet. That is Refactoring UI's "emphasize by de-emphasizing" (chapter "Hierarchy is Everything").

**What the navy is, in numbers.** [Measured] Example-02's background chroma is about 0.05 to 0.09. Memli's dark background is oklch(0.175 0.025 261) (`globals.css:111`). So the example navy has two to four times the chroma and is a little lighter (L 0.20 to 0.28 against 0.175). That is the gap between "rich navy" and "near-black slate".

**Words this mock uses.** [Evidence] "Deck" everywhere: "Your Active Deck", "My Decks", "Your Decks", "Manage Decks", "Add a New Deck".

### 4.3 example-03, "Mnemo" (cream). Picked by nobody. The current build is closest to this.

| | |
| --- | --- |
| Eye lands 1st | The "84". At about 64 px it is the largest glyph on the page, in the top left of main. |
| 2nd | The indigo "Start review" button just below it (168 x 52 px). |
| 3rd | The column of indigo buttons on the right ("Review 61", "Review 23") and the goal ring. They use the same solid indigo as the CTA. |
| Words | About 165 in main. The image is taller than the others (1263 px). |
| Boxes | 7 cards (Today, Daily goal, 3 courses, Upcoming reviews, Your memory), plus a nested callout. |
| Accent colours | Indigo, green, amber. Two soft badge tints (peach ES, pale blue JA). |
| CTA treatment | Solid indigo, 6.31:1 against the panel. Outline twin beside it. Two more solid indigo buttons lower down, so the primary colour appears on three buttons. The primary CTA holds about 18% of the vivid ink; the other two hold about 14% each. |
| Surface steps | Page L 0.970, Today panel 0.989, cards 1.0. Steps of 0.02 to 0.03. No shadows. The sidebar is the same colour as the page. |
| Text contrast | Heading 14.3:1. Muted lines about 5.8 to 6.1:1. |
| What feels fun | Little. The amber streak pill with a flame. The peach "ES" tile. The bar chart. |

**Honest read.** [Inference] This is the most usable of the five on paper. One number, one sentence, one button, sensible rows. It is also the one with the least colour, no picture, the thinnest surface steps of the light examples, and grey secondary text. It got no votes, and Crystal circled nothing in it. [Evidence] Her message has four attachments: example-01, example-04, example-05, example-02. Example-03 is not among them (`images/1.png`).

**Words this mock uses.** [Evidence] "course" everywhere: "My courses", "Browse courses", "Your courses", "+ Add a course", "from 2 courses".

### 4.4 example-04, "LingoRecall" (warm cream). No votes. Crystal circled its hero.

| | |
| --- | --- |
| Eye lands 1st | "Good morning, Maya", about 45 px, heavy, near-black, with clear space around it. |
| 2nd | The orange "Start review" bar (254 x 46 px). It is the only solid button on the page, and it holds about 59% of all vivid pixels. |
| 3rd | The orange ring and the mountain photo, both inside the same card. |
| Words | About 77 visible. The image is cropped at the bottom. |
| Boxes | 7 (hero, Today's plan, Memory health, 4 course cards, 2 of them cut off). |
| Accent colours | One: orange. It repeats on the CTA, the ring, the plan dot and the bars. Two tiny pills (yellow "Active", green "healthy"). |
| CTA treatment | Solid orange, 43% of the card's width. Weak spots: the fill is only 2.75:1 against white, and the white label on orange is about 2.67:1, which fails WCAG 1.4.3. Hue isolation carries it, not luminance. |
| Surface steps | Three layers: outer frame L 0.945, app surface 0.973, cards 1.0, plus a soft shadow on the hero. |
| Text contrast | All text is near-black, about 19 to 20:1. No grey text. |
| What feels fun | Warm paper colours. One photo with the word on it ("montaña"). The stat trio reads like a scoreboard. |

**Honest read.** [Inference] This is the best example of "one colour commands". It is also the least finished: "3:00 - AM" times, and filler labels like "Secondary deck" and "Premium deck".

**Words this mock uses.** [Evidence] Both: "My courses" and "Your courses" as headings, "Active deck", "Secondary deck" as labels.

### 4.5 example-05, "Luma" (pastel). No votes. Crystal circled its hero and its streak.

| | |
| --- | --- |
| Eye lands 1st | "32 words", about 80 px, centred, with empty space on every side. It is the best-isolated element in any of the five. |
| 2nd | The teal "Start review" pill directly under it (221 x 57 px). It is the only solid button on the page. |
| 3rd | The lighthouse picture in the right column, or the row of streak check circles. |
| Words | About 130 in main. |
| Boxes | 5 (hero, Continue learning, Building long-term memory, Your rhythm, Your next memory). |
| Accent colours | Teal, lavender, peach. All pastel. |
| CTA treatment | Solid teal pill, centred. Weak spots: fill is 2.30:1 against the panel, and the white label is about 2.47:1, which fails WCAG 1.4.3. |
| Surface steps | Page L 0.964, cards 0.985 (step 0.021), soft shadows, faint pastel blobs in the hero. |
| Text contrast | Strong. Even the small grey lines are 12 to 14:1. |
| What feels fun | Soft. The star logo. "Your next memory" with a painted lighthouse and "el faro". The check circles. Gentle copy ("A little practice today. Stronger memories tomorrow."). |

**Honest read.** [Inference] By pixel metrics this page is as pale as Memli (1.0% vivid, lightness spread 0.082). It still has a clear landing spot, because the number is about four times the body size, it is centred, and it stands alone. So size and isolation can make a focal point without colour. But nobody picked it as a favourite. Pale and calm did not win the gut vote. The owner's own note says "colors easy on the eyes (but perhaps not good for the color blind)" (`README.md:11`).

**Words this mock uses.** [Evidence] "My vocabulary", "vocabulary lists", "Explore courses", and "words" for the count ("32 words", not "32 cards").

---

## 5. The current Memli dashboard

Sources: the four owner screenshots, the live page at `localhost:5173/dashboard` (read-only DOM measurement at 1024 x 768 and 375 x 812), and `packages/ui/src/styles/globals.css`.

| | |
| --- | --- |
| Eye lands 1st | **Split.** [Inference] Four things of similar weight: the "24" (48 px bold), the solid blue "All languages" pill above it, the solid blue "Start review" button below it, and the cluster of blue check circles and ring on the right. |
| 2nd | The h1 "Good evening, Phillip" (30 px bold). |
| 3rd | Unclear. Possibly the "16 / 10" stat pair on the focus card. |
| Words | [Measured] 192 visible words in main (my DOM count, screen-reader-only text excluded; the brief counted 217 with a different method). About 131 on the first screen of the owner's screenshot. 69 above the fold at 1024 x 768. 53 above the fold at 375 x 812. |
| Boxes | 8 top-level (Today, focus deck, deck list, This week, tricky words, 3 trend tiles). About 19 more chips, pills and badges. |
| Accent colours | One. Blue. Plus a 14 px orange flame and a 14 px orange bulb. |
| CTA treatment | Solid blue, 126 x 44 CSS px. Flat, no shadow. Label has no count. An outline twin of the same height sits beside it and is wider (187 px). |
| Surface steps | [Measured from tokens] Page L 0.985, card 1.0, Today panel 0.971. Steps of 0.014 to 0.015, which is 1.04:1. No shadows. Borders are 1.23:1 against the page. |
| Text contrast | [Measured from tokens] Foreground 15.9:1. Muted 5.97:1 on the page, 5.73:1 on the Today tint. Both pass WCAG AA. |
| What feels fun | Nothing is trying to. No picture, no illustration, no warm surface, no second hue. |

### 5.1 Numbers behind "busy"

[Measured] Live DOM at 1024 x 768, light theme.

- **58% of the words are muted grey.** 112 of 192 words use `--muted-foreground`. The single most common style is 14px / 400 / muted: 77 words.
- **66% of the words are 14 px or smaller.** 96 words at 14 px, 31 words at 12 px.
- **23 different size, weight and colour combinations** on one page.
- **12 headings and 9 controls** in main (from the brief). The four filter links plus the active pill come before the CTA in tab order and in reading order.

### 5.2 The same fact, said more than once

[Evidence] From the page text in the brief and the screenshots.

| Fact | Where it appears | Times |
| --- | --- | --- |
| "About 4 minutes" | Greeting line; Today panel | 2 |
| 12-day streak | Greeting line; This week card | 2 |
| "Spanish Core 1000" | Today chip; "Starts in Spanish Core 1000."; focus card title | 3 |
| 16 due in Spanish | Today chip "16 from..."; focus card "16 Due" | 2 |
| 8 due in Japanese | Today chip; deck row "8 due" | 2 |
| 10 new words | Button "Learn 10 new words"; focus card "10 New today" | 2 |
| The number 24 | "24 cards ready to review" (due count); ring "24 of 50" (studied today) | 2, and they mean different things |
| The word "mastered" | "5% mastered", "52 mastered", "Words mastered 100", "20% mastered", "8% mastered" twice | 6 |
| "Last studied ..." | Focus card and each of 3 rows | 4 |

[Inference] The two "24"s are the most confusing pair. One is cards due. The other is cards already studied today. A new user will read them as the same number.

### 5.3 Numbers behind "nothing draws the eye"

[Measured] Share of saturated pixels (chroma over 0.10) on the first screen of the light screenshot.

| Blue thing | Share of the vivid ink |
| --- | --- |
| Start review button | about 27% |
| "All languages" active pill | about 22% |
| This week ring and check dots | about 24% |
| Mastery progress bar | about 8% |
| Logo and active nav | about 4% |

Compare example-04, where the one CTA holds about 59%, and example-02, where the photo and the CTA share one card and together hold about 50%.

Other causes. [Inference]

- The Today panel is 1.04:1 against the page. It does not read as a different place.
- The CTA is 14 to 18% of its panel's width. The picked examples sit at 29 to 30%.
- The "24" is big (48 px), but the h1 above it is also big and bold (30 px), and the same "24" shows up again in the ring.
- The focus card has no button at all. PLAN.md hides it on purpose because the Today button already opens the same session (`PLAN.md:127`). So the second-largest card on the page repeats numbers and offers nothing to do.

### 5.4 Dark theme today

[Measured from tokens and the dark screenshot.]

- Surfaces step better than light: page L 0.175, card 0.236, panel 0.291.
- But the hue is weak: chroma 0.025. Example-02 sits at 0.05 to 0.09.
- Muted text is oklch(0.68 0.025 261), about 5.8:1 on cards. Example-02's secondary text is about L 0.91, 13.4:1.
- My approximate APCA reading for muted text on dark cards is about Lc 45, and for the CTA fill against the page about Lc 48. APCA's public guidance asks for about Lc 60 or more for body-size text. Treat my APCA numbers as rough; see section 12.
- There is no visible switch. A "d" key handler toggles it (`apps/web/src/components/theme-provider.tsx:145`).

### 5.5 Phone

[Measured] At 375 x 812 the "Start review" button sits at y 581 to 625. It is above the fold, but 72% of the way down. Before it come the header, the h1, a two-line status sentence, two rows of language pills, the "TODAY" label, the count, the minutes, and two deck chips. "This week" starts at y 1643, two full screens down. The page is 2,658 px tall.

---

## 6. Why 01 and 02 won, and why the current build feels flat and busy

### 6.1 What the two winners share

| Shared trait | example-01 | example-02 | Memli now |
| --- | --- | --- | --- |
| A picture on the main card | Café illustration | Street photo | none |
| More than one hue | about 6 | about 5 | 1 |
| Vivid area | 5.0% | 16.0% | 1.2% |
| Wide lightness range (spread) | 0.136 | 0.153 | 0.086 |
| No low-contrast grey text | all text near-black | dimmest about 13:1 | 58% of words at 5.97:1 |
| One card clearly bigger than the rest | yes (outlined focus deck) | yes (hero) | Today panel and focus card are about the same size and weight |
| CTA width in its card | 29% | 30% | 14 to 18% |
| Depth | soft shadows, tinted layers | gradient page, bordered cards | flat, 1.04:1 steps |

### 6.2 What the calm examples lacked

- **Example-03:** no picture, three buttons in the primary colour, grey secondary text, 0.03 surface steps. It is the plainest. Zero votes.
- **Example-04:** one accent and one photo, but small and unfinished. Its hero was circled, so the idea landed even though the page did not win.
- **Example-05:** the clearest focal point of all, but pastel and pale. Its hero and streak were circled.

[Inference] The pattern: the calm examples lost as whole pages, but their hero cards were singled out as the parts worth keeping. The loud examples won as whole pages. So the brief for the redesign is "the hero from 04 or 05, in the colour and warmth of 01 or 02".

### 6.3 Why Memli feels flat

[Inference, resting on the measurements above.]

1. **One hue, no picture.** It has the lowest vivid and mid-tone area of all seven pages measured.
2. **Thin surface steps and no shadow in light.** 1.04:1 between page, card and panel. The examples use 0.02 to 0.04 plus shadow, or a third layer.
3. **Mostly small grey text.** WCAG AA passes. Legibility at a glance does not. This is Karen's "the words blend in".
4. **A "safe" brand blue used for everything that is not grey.** Label, pill, button, ring, dots, bar, link.

### 6.4 Why Memli feels busy

[Inference.] It is not the word count. Example-01 and example-03 have as many or more.

1. **Many small things of equal weight.** About 19 chips and pills, 23 text styles, 8 boxes.
2. **Sentences that explain.** "About 4 minutes of review keeps your 12-day streak going." "Starts in Spanish Core 1000." "26 more cards to reach today's goal." "You've forgotten these a few times. A new mnemonic can help them stick." The winners use labels and numbers, not sentences.
3. **Repetition.** Nine facts appear two to six times (table in 5.2).
4. **No one winner.** Three blue masses, two big bold texts, two same-size cards. The eye has to scan, and scanning is what "busy" feels like.

### 6.5 How the PLAN got here

[Evidence] `PLAN.md:18-24` kept four ideas from example-03 (the headline, the ring, the badges, the tricky words callout) and only layout ideas from example-02 (greeting, one prominent deck, compact rows). It took none of example-02's colour, theme or imagery, and it labelled example-02 "(most popular)" in the same table. [Inference] The build is example-03's content inside the Week 1 style tile's blue-and-slate palette. That style tile is one blue, one sky blue, and six greys (`docs/designs/style-tile/StyleTile.png`).

---

## 7. What each respondent valued, stated as needs

| Respondent | What they said (evidence) | Need behind it (inference) | Confidence |
| --- | --- | --- | --- |
| **Karen** | "You can concentrate on reading instead of looking for them." "The white background makes the words disappear." "The writing pops up." "Because the light backgrounds the words blend in." | Text must stand clear of its background with no effort. I should not have to hunt for the words. This applies to the light theme too: it is about figure against ground, not only about offering dark. | High. She gave the reason four ways. |
| **Karen** | "As like presentation" | She judged how it looks, not what it does. | Medium. The phrase is short. |
| **Crystal** | "I always choose the dark option [so] you should have that for which ever option you pick." | A dark theme is a personal default for her on every product. She needs to be able to choose it, and find the control. | High. Stated as a rule. |
| **Crystal** | "layout 1 was more fun" | Opening the app should feel pleasant, a little playful. A study tool should not look like an admin panel. | Medium. "Fun" is not defined. |
| **Crystal** | "it had the important information on it" | I want the essentials on one screen: what is due, where I am, how I am doing. | Medium. |
| **Crystal** | "I like the Github chart at the top." | I want to see my consistency over time as a picture, and near the top. | High for the chart. "At the top" is her words. |
| **Crystal** | "I am not sure about the word Deck. It may be confusing for some people." | Use words a newcomer already knows. | High that she has the doubt. Unknown how common it is. |
| **Crystal** | Circles on 04, 05, 02. "Maybe use those down the road as components." | She thinks in reusable parts. She expects iteration ("Let me see an update when you are ready"). | High. |
| **Woodson** | "I like the vibe of it a lot" | The product should have a mood and a character. | Low. One word. I cannot tell if "vibe" means the navy, the photo, or the whole. |
| **Ben** | "Option 1" | Unknown. | None. A vote only. |

**Two needs appear in more than one voice.**

1. **Strong figure against ground.** Karen says it outright. Crystal's "always dark" is consistent with it. Both example-01 and example-02 have it (all text 13:1 or better).
2. **Character.** Crystal's "fun", Woodson's "vibe". Different words, same gap in the current build.

**One role note.** [Evidence] Crystal is the Course Director and asked to see an update. [Inference] Her three specific asks (dark mode, the chart, the word "Deck") are the ones most likely to be checked.

---

## 8. What Crystal circled, and how each becomes a Memli component

Source: `images/1.png`, enlarged five times. The thumbnails are small (about 228 px wide), so edges are approximate.

| # | Where | What is inside the red shape | Notes |
| --- | --- | --- | --- |
| A | example-04 | The greeting ("Good morning, Maya" and its subline) and the whole hero card: title "Spanish Foundations", the "Mnemonic image" pill, three stats (18 due today, 12 new, 86% retention), the orange "Start review" button, the progress ring, and the mountain photo captioned "montaña". | The ellipse also clips the title of "Today's plan". I read that as overshoot. There is a small red handwritten mark above "86% retention". I could not read it at this size. |
| B | example-05 | The hero panel: "Keep your Spanish fresh", "32 words ready to review", the large "32 words", "From all your vocabulary lists · About 6 minutes", the teal "Start review" pill, "Older words return just when you need them.", the "32 words due today" chip and the per-list breakdown line. | The lower edge crosses the "Continue learning" heading and the top of that card. I read that as overshoot. |
| C | example-05 | The top of "Your rhythm": "7 day streak" and the row of weekday check circles. | Cut off by the thumbnail's right edge. |
| D | example-02 | The bottom-left of the sidebar: the "Go Pro / Unlock advanced features! / Upgrade" card. | Ambiguous. She may like a small card anchored at the foot of the sidebar, or the upsell itself. Her message only says "what I liked". |
| E | example-02 | The "Study Tip" card: bulb icon, yellow "Study Tip" title, a two-line tip, and the owl mascot. | The only warm surface on that page. |
| not circled | example-03 | Nothing. The image was not attached. | |
| not circled | example-01 | Nothing drawn. It is her favourite. In words she praised the "Github chart at the top", "more fun", and "the important information". | |

**What she left uncircled inside the pages she marked up.** [Evidence] In example-02: the photo hero, the yellow button, the ring, the deck rows, upcoming reviews. In example-04: Memory health, the course cards. In example-05: "Your next memory", "Continue learning". [Inference] Do not read much into absences. She was marking highlights in a hurry.

### From circle to component

| Circle | Possible Memli component | What it replaces or reuses | What it needs that Memli lacks today |
| --- | --- | --- | --- |
| A | **Focus hero** (one card: course name, 2 or 3 numbers, one solid button, ring, mnemonic image) | Merges `TodayPanel` and `FocusDeckCard`. All numbers already exist in the `DashboardDeck` contract (`PLAN.md:77-88`). Retention exists in the trends strip (84%). | A mnemonic image for the next card. The session route already has a slot for the Mnemonic Caption Overlay Frame (#50, commit 5ca7558). |
| B | **Review count hero** (centred big number, one support line, one button) | The `review` state of the Today panel's state machine (`PLAN.md:48-55`). | Only layout and type scale. No new data. A and B are two skins of one component: A when one course is in focus, B when cards come from several. |
| C | **Week streak** (streak number and 7 check circles) | The weekday dots already inside `ThisWeek`. | Nothing. Consider lifting it out of the aside so it can sit near the top, and so a phone shows it before two screens of scrolling. |
| D | **Sidebar footer card** (a small card pinned above the account button) | Nothing today. PLAN removed the sidebar streak on every page (`PLAN.md:129`). | Content. Memli has no upsell, and PLAN left upsells out. [Inference] This is a natural home for the visible light and dark switch Crystal asked for, or for a compact daily goal. That pairing is my suggestion, not hers. |
| E | **Tip card** (warm tinted surface, icon, title, one or two lines) | `MemoryCallout` ("7 words keep slipping") sits in the same slot and has the same job: a friendly aside. | A warm surface token. Optionally a mascot or small illustration. Content could rotate: a study tip, the tricky words nudge, or a community mnemonic of the day. |
| words | **Activity heatmap** ("Github chart") | Nothing today. | Review history per day. The contract only holds the last 7 days (`PLAN.md:91`). A real year view needs the scheduler data from #112. A 7-day row (circle C) is the honest first step. |

---

## 9. The tension: "fun" (example-01) against "not busy, one focal point"

### 9.1 Where each quality comes from

[Inference, from the images.]

| "Fun" in example-01 comes from | "Busy" in example-01 comes from |
| --- | --- |
| A picture for each deck | 5 filled buttons in 5 colours |
| Several friendly hues | 3 ways to start the same review |
| Thick, rounded, shadowed buttons | 6 cards, about 18 boxes, about 160 words |
| A metaphor (the garden) | Status chips that repeat the progress bar |
| A warm voice (emoji, "!") | A search box and an "Add" button in the top row |
| Real foreign words in tiles | Two side widgets with unexplained labels |

The two lists barely overlap. **Fun is about colour, pictures, shape and voice. Busy is about how many things compete.** That is why a page can be both (example-01), neither (example-03, the current build), calm but not fun (example-05), or focused with character (example-02's hero).

### 9.2 How to get both

1. **One hero, one filled button.** Everything Crystal circled in 04 and 05. The hero is where the fun lives: the picture, the big number, the warm line of copy.
2. **One colour commands, the others decorate.** Keep one hue for "tap here". Use other hues only on things that are not buttons: language badges, course art, streak checks, the heatmap, the tip card. Example-04 shows the first half (one orange). Example-02 breaks it once (the yellow Upgrade button) and you can feel the pull.
3. **Put pictures inside the main card, not beside it.** PLAN.md left hero photos out because they "compete with the main action" (`PLAN.md:26`). In example-02 and example-04 the picture and the button share a card, so the picture leads the eye to the button. For Memli a mnemonic image is the product, not decoration.
4. **Quiet everything else.** Other courses as plain rows with one status each. Stats below the fold or behind one link. This is Refactoring UI, "Emphasize by de-emphasizing".
5. **Voice in one place.** One warm line in the greeting. No explaining sentences in cards. Follow the owner's rule: no em dashes in customer copy.
6. **Fun that costs no attention.** Depth on the button, rounder corners, a colour per language badge, a small motion on the streak check. These add warmth without adding items.

### 9.3 A budget to hold the line

[Inference. These targets come from the measured examples, not from a standard.]

| Budget | Current | Target | Basis |
| --- | --- | --- | --- |
| Filled buttons above the fold | 2 (CTA and active pill) | 1 | example-04, example-05 |
| CTA share of saturated "action colour" above the fold | about 27% | 50% or more | example-04 at 59% |
| CTA width in the hero | 14 to 18% | 30% or more on desktop, full width on phones | examples 01, 02, 04 |
| Words above the fold, desktop | about 131 | under 100 | example-02's whole page is about 100 |
| Explaining sentences above the fold | 4 | 1 | examples 02 and 04 have 1 |
| Share of words in muted grey | 58% | under 30%, and none that are needed to act | examples 01, 04 use none |
| Text under 14 px | 31 words | labels only | example-01 |
| Vivid area | 1.2% | 3 to 6% in light | examples 01, 03 |
| Pictures | 0 | 1 in the hero | examples 01, 02, 04, 05 |

---

## 10. The word "Deck"

### 10.1 Evidence

- **One person flagged it.** Crystal: "I am not sure about the word Deck. It may be confusing for some people." (`images/1.png`)
- **The UI says "deck".** Sidebar "Decks" (`AppSidebar.tsx:37`). "Other decks" (`DeckList.tsx:13`). "You don't have any decks yet", "Find a deck to start building your vocabulary.", "Browse community decks" (`TodayPanel.tsx:47-49`). "Welcome to Memli. Let's find your first deck." (`DashboardGreeting.tsx:21`).
- **The code says "course" where it matters.** The route is `/study/$courseId` (`study.$courseId.tsx:73`). `courseId` appears 77 times in `apps/web/src` and `packages`. `deckId` appears 0 times. One loader uses both words on adjacent lines: `const course = findCourse(...)`, `const deckCards = findDeckCards(...)` (`study.$courseId.tsx:88-89`). The PLAN's data type is `DashboardDeck` with a `courseId` field (`PLAN.md:77-78`).
- **Old Memrise said "course".** The archive URLs the owner supplied contain `/course/12/introduction-to-japanese/` and `/courses/english/languages/`. A 2016 review and Wikipedia describe Memrise courses split into levels, with "mems" as the mnemonics (see Sources). I could not open the archive pages themselves; the fetch tool is blocked from web.archive.org.
- **"Deck" is Anki's word.** The Anki manual: "A 'deck' is a group of cards." Anki's audience is more technical than Memli's target user.
- **The five mocks do not agree either.** Example-01 and example-04 mix "deck" and "course" on one screen. Example-02 uses "deck" only. Example-03 uses "course" only. Example-05 uses "vocabulary list", "courses" and "words". So Crystal's doubt formed after seeing "Deck" in three of the five images.
- **Memli's own product doc** says the primary user is "someone who wants to learn vocabulary with mnemonics" and asks for "plain language over developer metaphors" (`dev/memli/docs/product-ux.md`, "Primary user" and "Onboarding & empty states").

### 10.2 Options

| Word | For | Against |
| --- | --- | --- |
| **Deck** | Exact for flashcards. Anki users know it. Already in every string. | Needs the reader to know "flashcards come in decks". Has other everyday meanings (a patio, a ship, a slide deck). Flagged by the Course Director. [My knowledge, not verified here] Spanish needs "mazo" or "baraja", which sound like playing cards. |
| **Course** | Matches the route and 77 identifiers. Memrise heritage. Suggests a path with a start and an end, which fits "Continue learning" and "5% of 1,000". [My knowledge] Translates to "curso" with no friction. Used by example-03 and example-04. | Promises teaching and structure. A 30-word community list called a "course" may feel oversold. In a school setting the word already means something else. |
| **List** or **word list** | The plainest. Example-05 uses "vocabulary list". | Sounds static. Loses the sense of progress. Odd for kana or kanji. |
| **Set** | Short and neutral. | Vague. Reads as a product term from another flashcard site. I did not verify that site's exact wording. |
| **Words** (no container noun) | Zero jargon. "Spanish Core 1000 · 1,000 words." | You still need a noun for navigation and empty states. |
| **Collection** | Friendly. | Long. Vague. Poor in a 375 px nav. |

### 10.3 Recommendation

**Use "course" as the learner-facing noun, and use no noun at all where the title can stand alone.**

Reasons, in order of weight.

1. It removes the one word a respondent called confusing.
2. It makes the UI match the URL the learner sees (`/study/...` is keyed by course) and the code's own identifiers.
3. It matches the product Memli descends from.
4. [Inference] It should translate cleanly for `es-419`, which the i18n plan targets.

How it would read. [Inference: draft strings for the plan to refine.]

| Now | Suggested |
| --- | --- |
| Sidebar: "Decks" | "My courses" |
| "Other decks" | "Your other courses" |
| "You don't have any decks yet" | "You haven't picked a course yet" |
| "Browse community decks" | "Browse courses" |
| "16 from Spanish Core 1000" | unchanged (no noun needed) |
| "Starts in Spanish Core 1000." | cut (see 5.2) |

**A related word: "cards".** [Inference; nobody raised this.] The Today panel says "24 cards ready to review" and its second button says "Learn 10 new words". Two nouns for one thing in one box. Example-05 says "32 words". For a non-technical learner, "words" is what they are learning. Kana and kanji are an edge case ("characters"). Suggest "words" on the dashboard and test the kana case.

**Cost and caution.**

- The strings live in per-component `messages` objects, so this is a copy change, not a refactor. Code identifiers such as `DashboardDeck` can stay; they are not user-facing.
- It is one person's doubt. A cheap check: ask the same four people "What would you call this?" with three options (deck, course, word list) before committing.

---

## 11. PLAN.md decisions against the feedback

### 11.1 Confirmed

| PLAN decision | Where | What supports it |
| --- | --- | --- |
| Answer "what should I study right now" first | `PLAN.md:3` | Crystal circled the hero cards in 04 and 05, which do exactly this. Karen: "concentrate on reading instead of looking for them". |
| One deck larger than the rest; others as compact rows | `PLAN.md:20-21` | Both picked examples have one dominant card. |
| Two actions, review and learn, kept separate | `PLAN.md:20` | Present in example-01, the favourite of two. Crystal: "had the important information on it". Indirect support only. |
| Weekday dots and a streak | `PLAN.md:22`, step 6 | Crystal circled the streak and check row in example-05. |
| Due, new and retention side by side | `PLAN.md:23` | That stat trio is inside Crystal's example-04 circle. |
| Dropping the equal-weight deck grid | `PLAN.md:11-12` | Nobody asked for a grid. Example-04's grid of course cards was not circled. |
| Language codes instead of flag emoji | `PLAN.md:14` | No feedback against it. The reasons (flags are countries, Windows does not render them) still hold. |
| Dropping the Rank card | step 7 | Nobody missed it. |
| Dropping search and forecasts | `PLAN.md:26` | Nobody mentioned either. |

### 11.2 Contradicted or challenged

| PLAN decision | Where | What the feedback says | Strength |
| --- | --- | --- | --- |
| **Left out the yearly heatmap** | `PLAN.md:26` | Crystal: "I like the Github chart at the top." | Direct. One person, named explicitly. |
| **Left out hero photos** because they "compete with the main action" | `PLAN.md:26` | The mnemonic image is inside Crystal's example-04 circle. The photo is the largest element of example-02, which two people picked. | Indirect. Nobody said "I like the photo". |
| **Dropped the study tip** (silently) | `PLAN.md:21` against `README.md:8` | Crystal circled it. The owner's README liked it. | Direct. |
| **Today panel and focus deck as two boxes** | `PLAN.md:33-34` | Both hero circles (04 and 05) are a single card. PLAN's own step 4 admits the focus card must hide its action because the Today button does the same thing (`PLAN.md:127`). | Strong. Feedback and the plan's own note point the same way. |
| **A quiet type scale and plain neutral surfaces** (taken from example-03) | `PLAN.md:22` | The owner's README praised "big font, big buttons" in example-01 (`README.md:7`). Example-01 got two votes; example-03 got none. | Medium. |
| **Dark mode as a contrast checkbox** | step 10 | Crystal wants dark as a first-class choice. Two of four picked the dark image. There is still no visible control. | Direct. |
| **Contrast rule was "4.5:1 text" only** | `PLAN.md:103` | The page passes that rule and Karen's complaint still applies to it. WCAG 4.5:1 was a floor, and the plan had no rule for surfaces, for text size, or for APCA. | Direct, for light backgrounds in general. She did not see the Memli build. |
| **Explaining copy for precision** ("Starts in {deck}", the per-deck breakdown, the status sentence) | `PLAN.md:32`, `PLAN.md:57` | The owner now finds the page too wordy. The picked examples use labels and numbers. | Owner's own judgement, supported by counts. |
| **Aside drops below the decks until `xl`** | `PLAN.md:40` | Crystal liked the chart "at the top". On a phone "This week" starts 1,643 px down. | Medium. |
| **Left out the memory garden** | `PLAN.md:26` | Not named by anyone. It is part of what makes example-01 "fun", and plants were old Memrise's signature. | Weak. Listed for completeness. |
| **Left out upsells** | `PLAN.md:26` | Crystal circled the Go Pro card area. It is unclear whether she liked the upsell or the placement. | Ambiguous. Do not act on it as "add an upsell". |

### 11.3 Neither confirmed nor contradicted

- **The tricky words callout** (`PLAN.md:37`). Nobody mentioned it. It occupies the slot the Study Tip would take.
- **The learning-language filter** (step 9). Nobody mentioned it. [Measured] It is the first control on the page and uses the CTA's blue, so it costs focus. The README liked a language switcher "at the top-right" (`README.md:8`), which is a quieter place than above the hero.
- **The trends strip.** Nobody mentioned it.
- **The daily goal ring.** Rings appear in examples 02, 03 and 04. One is inside the example-04 circle. Crystal's separate streak circle (C) had no ring.

---

## 12. Method and its limits

**Pixel sampling.** I sampled each image with a Python script (Pillow). Surfaces are the median of a 7 x 7 patch at a point I chose. Text colours are the darkest (or lightest) 0.25% of pixels inside a box around a text run. I converted sRGB to OKLCH with the standard OKLab matrices, and computed WCAG 2 contrast ratios.

- The Memli screenshots and two examples are JPEGs. Compression shifts colours a little.
- Thin text is anti-aliased, so sampled text colours run slightly light on light themes. For Memli I used the CSS tokens instead of pixels wherever a token exists.
- The examples are AI images, not real CSS. Their "tokens" are whatever the image shows.
- Example-02's page is a gradient. "Page" values depend on where you sample.

**APCA.** I used a simplified version of the public SAPC formula. I did not validate it against the reference library. Treat Lc values as rough, to the nearest 5.

**Vivid, mid-tone and spread.** Each image was shrunk to 240 px wide. "Vivid" is the share of pixels with OKLCH chroma over 0.08. "Mid-tone" is the share with L between 0.35 and 0.85. "Spread" is the standard deviation of L. These are my own simple proxies for "colourful" and "has depth". They are not a standard metric. Browser chrome was cropped from example-01 and the outer frame from example-04.

**Ink share.** The share of vivid pixels (threshold 0.10) inside a box I drew around each element. The teal buttons in examples 01 and 05 have chroma about 0.093, just under that threshold, so I did not report their shares.

**Sizes.** Example sizes are pixels in the image file. Font sizes for the examples are estimates from cap height divided by 0.72. Memli sizes are from `getComputedStyle` and `getBoundingClientRect` on the live page.

**Word counts.** For the examples I transcribed the visible text and counted by hand, so allow plus or minus 10%. For Memli I walked the text nodes in `main` and skipped `.sr-only`. The brief's figure (217) used a different method; I report mine (192) and note the gap.

**Eye paths.** Reasoned, not measured.

---

## 13. What I could not access or confirm

- **The Wayback Machine pages.** The fetch tool cannot reach web.archive.org. I relied on the URL paths the owner supplied and on a web search for Memrise's terms.
- **The YouTube walkthrough.** Not viewed for this assignment.
- **Any responses beyond these four.** The README says "several people". I only have Crystal, Woodson, Ben and Karen.
- **Crystal's handwritten mark** above "86% retention" in example-04. Illegible at thumbnail size.
- **Exactly what circle D means.** The upsell card, or the sidebar-foot position.
- **Respondents' devices, screen sizes and app themes**, and whether they opened the images full size.
- **Karen's age or eyesight.** The eyesight remark in the chat was the owner's. Nothing in the screenshot states her age or technical level; that description came from the brief.
- **Whether example-01 is a 2x capture.** My CSS-pixel estimates for it assume it is.
- **Spanish terms for "deck"** ("mazo", "baraja"). From my own knowledge, not checked against a source in this session.
- **Refactoring UI section titles.** Cited from memory of the book. There is no copy in the repository to check page numbers against.
- **The Figma prototype links** in `docs/designs/prototypes/prototype.md`. Not opened; I used the exported PNGs.

---

## 14. What this means for the redesign

Each line is a recommendation with its basis. All are for the plan to weigh, not decisions.

1. **Merge Today and Continue learning into one hero card.** Basis: circles A and B; `PLAN.md:127`; the repetition table in 5.2.
2. **Make the CTA the only filled action-colour shape above the fold, and make it wide.** Restyle the active language pill and the week checks so they stop using solid primary. Basis: ink share in 5.3; CTA width row in section 3; the owner's "strong solid primary button with depth" rule.
3. **Design dark as a navy theme with a visible switch.** Aim near example-02: surfaces around L 0.20 to 0.28 with chroma 0.045 to 0.06, secondary text near L 0.85 to 0.9. Basis: Crystal; Karen; 4.2 and 5.4.
4. **Fix "the words disappear" in light too.** Fewer muted words, a darker muted token, body text at 16 px, a stronger page-to-card step, and a shadow on the hero. Basis: Karen; 5.1; section 3 rows on text contrast and surface steps.
5. **Cut copy by removing repeats, not by removing facts.** Each fact once. Basis: 5.2.
6. **Add colour that is not a button.** A tint per language badge, a mnemonic image in the hero, a warm tip card. Basis: 6.1; 9.2.
7. **Bring back an activity picture near the top.** Start with the 7-day check row, which the data already supports. Plan the year heatmap for when #112 supplies history. Basis: Crystal; circle C; `PLAN.md:91`.
8. **Say "course", not "deck", and "words", not "cards", in learner-facing copy.** Basis: section 10.
9. **Build Crystal's circles as named components.** Focus hero, week streak, tip card, sidebar footer card. Basis: section 8; her "use those down the road as components".
10. **Move stats out of the first screen.** Trends, the mastery breakdown and "last studied" lines go below the fold or behind one link. Basis: 6.4; 9.3.
11. **Give phones their own pass.** Get the CTA into the upper half of a 375 x 812 screen and the streak onto the first screen. Basis: 5.5; the owner's standing rule.
12. **Test the next round differently.** Show the real build in light and dark, at full size, and ask "what would you tap first?" as well as "which do you like?". Basis: the limits in section 2.

---

## Sources

### Files in the repository

- `docs/designs/dashboards/README.md` (lines 3 to 11)
- `docs/designs/dashboards/PLAN.md` (lines 3, 11 to 14, 18 to 26, 30 to 40, 48 to 57, 77 to 91, 97 to 105, 124 to 142)
- `docs/designs/dashboards/example-01.jpeg`, `example-02.png`, `example-03.png`, `example-04.png`, `example-05.jpg`
- `docs/designs/prototypes/images/03 - User dashboard page.png` (the Week 1 equal-weight deck grid), plus `01 - Landing page.png`, `05 - Study session answer page.png`, `07 - Study session final page.png`
- `docs/designs/prototypes/prototype.md`
- `docs/designs/style-tile/StyleTile.png` and `StyleTile.md`
- `dev/memli/packages/ui/src/styles/globals.css` (light tokens lines 72 to 107, dark tokens lines 110 to 146)
- `dev/memli/apps/web/src/routes/_app/-components/TodayPanel.tsx` (lines 10 to 50), `AppSidebar.tsx` (line 37), `DeckList.tsx` (line 13), `DashboardGreeting.tsx` (line 21), `FocusDeckCard.tsx` (lines 37 to 48)
- `dev/memli/apps/web/src/routes/_session/study.$courseId.tsx` (lines 73, 88 to 89)
- `dev/memli/apps/web/src/components/theme-provider.tsx` (line 145, the "d" shortcut)
- `dev/memli/docs/product-ux.md` ("Primary user", "Onboarding & empty states", "Parked ideas")

### Feedback screenshots

- `feedback-screenshots/1.png` (Crystal, with circles)
- `.../images/2.png` (Woodson), `.../images/3.png` (Ben), `.../images/4.webp` (Karen), in the same folder

### Current page

- Owner screenshots: `session-screenshots/mcp-claude-in-chrome-blob-1794620808250-w52x37.jpg` (light top), `...808251-9n2vo7.jpg` (light scrolled), `...808251-y0r2td.jpg` (dark top), `...808251-rmffph.jpg` (dark scrolled)
- Live page, read only: `http://localhost:5173/dashboard` at 1024 x 768 and 375 x 812

### My measurement scripts

- `scratch/research/scripts/sample.py` (surface and text colours, WCAG and APCA)
- `.../research/scripts/tokens.py` (contrast from the CSS tokens)
- `.../research/scripts/colorful.py` (vivid, mid-tone, spread)
- `.../research/scripts/ink.py` (share of vivid ink per element)

### External

- Anki Manual, "Getting Started": "A 'deck' is a group of cards." https://docs.ankiweb.net/getting-started
- Wikipedia, "Memrise" (courses, levels, "mems" as user-made mnemonics). https://en.wikipedia.org/wiki/Memrise
- "Your Plants Need Watering: A Review of Memrise", 24 March 2016 (period review; title reflects the garden metaphor). https://www.latg.org/blog/2016/03/24/plants-need-watering-review-of-memrise/
- Wayback Machine URLs supplied by the owner, cited for their paths only (`/course/12/introduction-to-japanese/`, `/courses/english/languages/`). Page contents not read. https://web.archive.org/web/20160312124128/http://www.memrise.com/course/12/introduction-to-japanese/ and https://web.archive.org/web/20160313184443/http://www.memrise.com/courses/english/languages/
- Adam Wathan and Steve Schoger, *Refactoring UI*, chapter "Hierarchy is Everything" (sections "Emphasize by de-emphasizing", "Size isn't everything", "Semantics are secondary") and chapter "Creating Depth". Cited from memory.
- Josef Albers, *Interaction of Color* (simultaneous contrast: a colour's apparent lightness depends on its surround). Cited from memory.
- WCAG 2.2, Success Criterion 1.4.3 Contrast (Minimum), 4.5:1 for normal text. https://www.w3.org/TR/WCAG22/#contrast-minimum

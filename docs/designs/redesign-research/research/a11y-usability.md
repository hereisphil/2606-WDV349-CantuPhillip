# Accessibility and usability research for the `/dashboard` redesign

> **Correction.** The brief given to the researchers wrongly described one respondent as older and as having weak eyesight. That remark in the chat was the owner's, about himself. Statements in this file that relied on it have been corrected. See `feedback-examples.md`, section 2.

Scope: research only. Nothing in the repository was changed. This file is the evidence base for the accessibility, plain-language and user-testing parts of the redesign plan.

How to read the citations:

- `[S12]` points to the numbered list in "Sources" at the end.
- `PLAN.md:103` means line 103 of `docs/designs/dashboards/PLAN.md`.
- "code audit" means `scratch/research/code-audit.md`, written by another researcher in this same project. I reuse its measurements and say so each time.
- "Measured" means I measured it myself on the running dev server (`http://localhost:5173/dashboard`, light theme) on 2026-11-13, at 375 x 812 and 320 x 800, with `getBoundingClientRect` and `getComputedStyle`.
- Where I could not open a source, I say so. See "Could not verify" near the end.

---

## 0. The twelve findings that matter most

1. **The four owner problems are one problem seen four ways.** W3C's cognitive accessibility guidance asks for the most important action to "visually stand out" and be "visible to users without needing to scroll" [S2, pattern 4.3.4]. The current page gives 84 text fragments, 12 headings and 37 numbers the same weight (code audit, section 2.2). Fix the hierarchy and the "busy", "low contrast" and "nothing draws the eye" complaints shrink together.
2. **Text is too small for the people the owner asked.** At 375 px wide, 67 of 94 text-bearing elements in `<main>` are 14 px or smaller. 25 of them are 12 px (measured; the count includes about 11 screen-reader-only labels, and small text is still the majority without them). NN/g's guidance for older adults is a default of at least 12 point, which is 16 CSS px [S9]. Karen told the owner the words "disappear". Size is half of that. Contrast is the other half.
3. **Karen's comment matches a pattern reported in low-vision research.** (Nothing in the feedback says it applies to her personally.) Research that NN/g summarises found that people with cloudy ocular media (cataracts, for example) read faster with light text on a dark background. People with normal vision do slightly better in light mode [S10]. W3C's low-vision needs document says some users "need to change the background to a darker color" [S4, section 2.4.2]. So dark mode is an accessibility feature here.
4. **The current dark theme would not help her yet.** In dark mode the muted text scores about Lc 43 to 46 on APCA, and 38 of 84 text runs are muted, many at 12 to 14 px (code audit, section 4.3). APCA's own guidance puts Lc 60 as the minimum for content text that is not body text, and Lc 75 for body text [S31]. WCAG 2.x passes these pairs. APCA says they are weak.
5. **Dark must be offered, not forced.** NN/g: "we don't recommend switching to dark mode by default if your target audience includes the general population", and they "strongly recommend" letting users switch [S10]. The right default is "match my device". Today the app forces light and ignores the device setting (code audit, section 5).
6. **The theme control needs three plain choices and real radio semantics.** "System" is jargon. Use "Match my device", "Light", "Dark". Put it where Crystal circled (bottom of the sidebar) and in the phone account menu, with the same name in both places (WCAG 3.2.3, 3.2.4).
7. **The single-letter "d" shortcut should go.** It is the exact pattern WCAG 2.1.4 (Level A) is about: a letter-only shortcut with no way to turn it off [S23]. Once a visible control exists it has no job.
8. **A keyboard user passes 8 tab stops before "Start review"** on the phone layout (measured: logo, account, menu, five language links). There is no skip link (measured, and code audit section 9). The redesign should make the main action the first stop inside `<main>`.
9. **On a phone the main button sits low.** At 375 x 812 the top of "Start review" is 581 px down and its bottom edge is at 625 px (measured). A 375 x 667 phone shows roughly 550 px of page once the browser's own bars are counted (my estimate, not measured), so the button starts below the fold there. With WCAG text spacing applied, the button slides to the very bottom edge of an 812 px screen (seen in a screenshot). The redesign must fit the whole hero, button included, above the fold.
10. **The headline and the button disagree.** The page says "24 cards ready to review". The button opens only the 16 Spanish cards (code audit, section 7.3; `PLAN.md:57`). COGA asks designers to "clearly state the results" of actions [S2, pattern 4.8.3]. The honest fix until a cross-course session exists: the hero names the course and counts only that course.
11. **Streak copy should stop leaning on loss.** A seven-study paper found that a broken streak lowers later engagement, more so when people blame themselves, and less so when the streak can be repaired [S26]. Older users blame themselves for problems 90% of the time [S9]. A missed day does not materially hurt habit formation [S28]. So: no guilt copy, a forgiving streak, and no "goal missed" labels.
12. **Crystal's heatmap is the riskiest request for accessibility.** A GitHub-style grid encodes amount by color alone, has tiny cells, and does not reflow at 320 px. It can be done well as a small month calendar with a check mark per studied day, a one-sentence summary, and text for every cell. Details in section 8.

---

## 1. Who we are designing for

The owner's four respondents are the nearest thing to user research this project has. Two of them describe needs that the literature backs.

| Person | What they said | What the research says | What it means here |
| --- | --- | --- | --- |
| Karen | "The white background makes the words disappear. The writing pops up." | Some readers do better with light text on a dark background: people with cloudy ocular media read faster in dark mode [S10], and contrast sensitivity commonly drops with age [S5]. Nothing in the feedback says either applies to her. Low-contrast text causes eye strain and makes users "blame themselves" [S11]. | Dark theme is a need. So are bigger text and stronger text contrast in both themes. |
| Crystal (Course Director) | "I always choose the dark option." "Not sure about the word Deck." Liked the single hero card, the centered "32 words" panel, the 7-day checks, the bottom-left sidebar area. | COGA: "Use common and clear words" [S2, 4.4.1]. One clear main action [S2, 4.3.4]. | Dark theme. Replace "deck". One hero. A visible control at the bottom of the sidebar. |
| Woodson | Liked the dark example's "vibe". | Preference is a valid reason to offer dark mode [S10]. | Dark theme that feels designed, not inverted. |
| Ben | Picked example-01 (big type, big buttons). | NN/g: primary calls to action "deserve a larger tap target" [S12]. | Big type and one big button. |

What NN/g found about adults 65 and over (2013 study, quoted from [S9]; the 2019 update [S8] confirms the direction without repeating the numbers):

- They were 43% slower than users aged 21 to 55 (7:49 against 5:28 per task).
- They completed 55.3% of tasks against 74.5%.
- 90% blamed themselves when something went wrong, against 58% of younger users.
- They were about twice as likely to give up.
- 45% were reluctant to try new things or explore other paths.
- Guidance: default text of at least 12 point, large click targets, white space between links, and stable designs because many keep written notes of the steps.

The 2019 update adds that interface text is "often too small and lightly colored", that error messages get lost "among a profusion of other design elements", and that older users "make more mistakes" [S8].

W3C's summary of ageing and the web lists four changes: reduced contrast sensitivity, color perception and near focus; reduced dexterity ("difficult to ... click small targets"); hearing loss; and "reduced short-term memory, difficulty concentrating, and being easily distracted" [S5].

Three design consequences follow, and all three are testable (see section 10):

1. **Bigger and darker text.** 16 px minimum for any sentence. Nothing under 14 px.
2. **One obvious thing to do.** A slow, cautious user who blames herself needs the next step to be unmissable.
3. **Nothing that punishes.** No guilt copy, no red "missed" marks, no surprise changes between visits.

---

## 2. What the research says about the owner's four problems

### 2.1 "The page looks too busy. Too much copy."

The code audit counted 217 words in `<main>` (about 197 visible), 12 headings, 84 separate text runs and 37 numbers on the default page. Only 35 of those words are full sentences. So the noise is fragments, labels and numbers, not paragraphs.

What the sources say:

| Source | Finding | Applied to this page |
| --- | --- | --- |
| COGA 4.6.3 "Avoid Too Much Content" and user story "I need less content without extra options and features" [S2] | Extra content costs attention that some users do not have. | Cut regions and repeated facts first. Rewording comes second. |
| COGA 4.4.10 "Use White Spacing": "Put white space around objects and text" so "the page does not get overwhelming" [S2] | Space is how chunks become visible. | Fewer boxes with more space between them. |
| COGA 4.4.13 and user story "I need words rather than numbers and numerical concepts" [S2] | Numbers are harder than words for some readers. | 37 numbers is too many. Percentages ("5% mastered", "84% retention") are the hardest kind. |
| NN/g F-pattern [S13] | The F-pattern "is the default pattern when there are no strong cues to attract the eyes". People "miss big chunks of content" and content on the right can go unseen. | Without one strong cue, readers skim the top-left and miss the rest. Today the top-left is the greeting and filter chips, not the action. |
| NN/g layer-cake pattern [S14] | "By far the most effective way to scan pages." It needs headings that are easy to spot and that match what is under them. | Keep a few clear headings. Twelve headings in one screen stop working as a map. |
| NN/g progressive disclosure [S15] | It "defers advanced or rarely used features to a secondary screen" and "improves 3 of usability's 5 components: learnability, efficiency of use, and error rate". Two conditions: "the right split" and it must be "obvious how users progress". | Move the mastery breakdown, trends and per-course history to a course page or a progress page. Leave one clear link. |
| Hick's law [S17] | "The time it takes to make a decision increases with the number and complexity of choices." Advice: "highlighting recommended options". | 9 controls in `<main>` today, 5 of them filter chips above the main action. Make one choice the default and visually recommended. |
| Choice overload [S18][S19] | "Too many options hurts users' decision-making ability." NN/g: "As the number of choices increases, so does the effort". | The page asks: which language, review or learn, which deck. The app already knows the answer (`selectFocusDeck`). Show the answer. |
| NN/g dashboards [S16] | Dashboards are "focused on a single task: communicating critical information" and should need "a minimum of interaction or cognitive processing". | The dashboard's single task is "start today's study". Stats are support. |
| digital.gov plain language [S7] | "Consider whether you need every word." "Omit information that the audience doesn't need to know." | The repeated facts (code audit 2.3) are words the audience does not need. |

One caution from Refactoring UI, cited from memory of the chapter "Hierarchy is Everything" (section "Labels are a last resort"): a label can go when the value explains itself. It cannot go when two values look alike. This page shows a big "24" twice with different meanings (cards due and cards studied; code audit finding 5). Cutting labels there would make it worse. Cut the duplicate number instead.

### 2.2 "Not enough contrast in colors."

There are two different contrast problems, and they need different fixes.

**A. Surfaces do not separate.** The code audit found panel against page at 1.04:1 and card borders at 1.22:1 to 1.28:1 in light mode. Every text pair passes WCAG AA. So the complaint is about regions, not letters. WCAG 1.4.11 only demands 3:1 for "visual information required to identify user interface components and states" and "parts of graphics required to understand the content" [S20]. It does not demand that a card has a visible edge. But COGA's "important information stands out" [S2, user story 3.2.1] and NN/g's visual hierarchy guidance ("If everything is contrasted, then nothing stands out" [S21]) both do. The color research file owns the token values. The usability requirement is: the hero must differ from everything else by a clear step in lightness, not by a tint.

**B. Small, muted text.** NN/g's low-contrast article lists what it costs: "users experience eye strain", "users who cannot perceive an element on the page cannot use it", "many users blame themselves", and on phones "low-contrast text is nearly impossible" in glare. Its first recommendation is the one this page needs: "Reduce information density" instead of dimming text [S11]. Today 38 of 84 text runs use the muted color (code audit 4.3). The redesign should have fewer secondary facts, and the ones that remain should be large enough that muted color is not needed to rank them.

A third, smaller contrast problem is in the graphics. From the code audit (section 4.3): the progress track against the card is 1.12:1, the missed-day dot 1.11:1, "learning" against "mastered" 2.48:1, and the focus ring about 2.4:1. Section 8 covers these.

### 2.3 "We need to offer dark mode."

Evidence summary from NN/g's review of the research [S10]:

- Normal vision: "light mode won across all dimensions" in the studies reviewed. "The smaller the font, the better it is for users to see the text in light mode."
- Cloudy ocular media (cataracts and similar): "each of the 7 participants with cloudy ocular media had better reading rates with dark modes" (Legge et al., 1985, as reported by NN/g).
- Recommendation: do not make dark the default for a general audience, and do let users switch. Use the operating system's setting where it exists.

W3C's low-vision needs document adds that some people cannot tolerate a bright screen and "need to change the background to a darker color", while "many older people" need high contrast, and others need low brightness for both text and background [S4, sections 2.4.2 and 3.1.2]. No single theme serves everyone. That is the argument for three choices.

Two things follow that are easy to miss:

1. **Small text is worse in dark mode.** The light-mode advantage grows as text gets smaller [S10]. A dark theme with 12 px muted labels is the worst case. Dark mode raises the stakes on the type-size fix.
2. **Dark mode must pass on its own.** The code audit shows the dark primary button label at APCA Lc 50.5 and muted text at Lc 43 to 46. Each theme needs its own contrast check, on its own surfaces.

Section 7 is the full specification for the control.

### 2.4 "The eye is not immediately drawn to one component."

| Source | Finding | Applied here |
| --- | --- | --- |
| Von Restorff (isolation) effect [S22] | "The one that differs from the rest is most likely to be remembered." Advice: "Use restraint when placing emphasis" and avoid "relying exclusively on color". | Only one element may be "the different one". Today 14 elements share the primary blue (code audit finding 1). |
| NN/g visual hierarchy [S21] | Tools: color and contrast, scale, grouping. Use "no more than 3 sizes". Limit large elements to two. "If everything is contrasted, then nothing stands out." | 15 size and weight pairs today (shared context). Three text sizes plus one hero number is the target. |
| COGA 4.3.4 [S2] | "Make key content visually stand out. Key content should be visible to users without needing to scroll the page." | Hero above the fold on a phone. Today the button ends at 625 px (measured), which is below the fold on a small phone. |
| GOV.UK Design System, Button [S24] | "Avoid using multiple default buttons on a single page. Having more than one main call to action reduces their impact, and makes it harder for users to know what to do next." | One solid primary button on the page. Everything else is visibly quieter. |
| Material Design 2, Buttons [S25] | "A layout should contain a single prominent button that makes it clear that other buttons have less importance in the hierarchy." (Wording confirmed through a search result, not by opening the page.) | Same rule from a second design system. |
| NN/g touch targets [S12] | Minimum 1 cm x 1 cm. Primary calls to action "deserve a larger tap target". | "Start review" is 44 px tall, the same height as "Learn 10 new words" (measured). Make the primary taller and wider than anything else. |
| NN/g banner blindness [S27] | People ignore things that look like ads or sit where ads sit. In one study "the number of fixations in the right rail was 33 times smaller than its size might have warranted". Also: content that is made to stand out with color "often has the opposite effect". | Never put the main action in the right column. Keep the hero in the main column, top-left on desktop. Do not style it like a promo banner (no illustration-only card, no "upgrade" look). |
| First-click research [S29] | When the first click is right, about 87% of users finish the task. When it is wrong, about 46% do. (Bailey and Wolfson, 2009, as reported by MeasuringU. I could not open the original.) | The first click on this page decides the session. Section 13 gives a test for it. |

Refactoring UI makes the same case in "Hierarchy is Everything" (sections "Emphasize by de-emphasizing" and "Semantics are secondary"), cited from memory: you often cannot make the main thing louder, so make its neighbours quieter, and style buttons by their rank on the page, not by their meaning.

---

## 3. WCAG 2.2 success criteria that bear on this dashboard

`PLAN.md` section 5 (lines 95 to 105) and step 10 (lines 138 to 142) already record: one `h1`, labelled sections, no stray live regions, text for progress bars, color never the only signal for chips and week dots, unique button names, `lang` on learning-language text, 4.5:1 text contrast in both themes, 24 px targets with 44 px primary actions, no horizontal scroll at 320 px and 200% zoom, reduced motion on the ring, and a clean axe run in both themes. I do not repeat those. The table below is about what a redesign **adds** or **could break**.

Levels: A and AA are the target. AAA rows are marked. Exact wording is from the W3C "Understanding" pages where I opened them [S20][S23][S32 to S38]. Other rows are from my knowledge of WCAG 2.2 [S1] and are worded as summaries.

| SC | What it requires | Where the page stands today | What the redesign risks | How the redesign meets it |
| --- | --- | --- | --- | --- |
| 1.1.1 Non-text Content (A) | Every meaningful image has a text alternative. Decorative ones are hidden. | No content images. Icons are `aria-hidden` (code audit 9). | Course art, hero photos or mnemonic images, as in examples 01, 02 and 04. | Decorative art gets `alt=""`. A mnemonic image that carries meaning gets real alt text, written with the mnemonic. Decide this in the data contract, not per page. |
| 1.3.1 Info and Relationships (A) | Structure shown visually is also in the markup. | Good: sections, lists, `dl` for trends (`PLAN.md:130`). | A hero built from styled `div`s. A stats row with no list or `dl`. A calendar grid with no table semantics. | Hero is a `section` named by its heading. Stats are a `dl` or list. A calendar is a `table` with day headers. |
| 1.3.2 Meaningful Sequence (A) | Reading order in the DOM makes sense. | DOM order matches visual order (`PLAN.md:30`). | Using CSS `order` or grid placement to lift the hero or a streak card above something that comes first in the DOM. | Reorder the DOM, never only the CSS. On phones the order is: greeting, hero, other courses, this week. |
| 1.4.1 Use of Color (A) | Color is not the only way information is shown. | Chips have text, week dots have a check and a hidden label. The mastery legend uses two blues only (code audit 9). | A heatmap (amount by shade). Status dots. A colored streak flame as the only "active" signal. | Every color-coded state also has a shape, icon or word. See section 8. |
| 1.4.3 Contrast (Minimum) (AA) | Text 4.5:1. Large text (24 px, or 18.66 px bold) 3:1. | Passes in both themes. Lowest is 4.89:1 (code audit 4.3). | A warm accent button with white text. White on orange-500 is 2.80:1 and fails. White on orange-600 is 3.56:1 and fails for normal-size text. Dark text on yellow-400 is 11.66:1 and passes (my calculation, sRGB hex values). Text over a photo. A new navy theme. | Check every text and surface pair in both themes with the contrast script. If the button is yellow or orange, its label is dark. No text directly on photos. |
| 1.4.4 Resize Text (AA) | Text can grow to 200% without loss. | Passes at 200% zoom (`PLAN.md:141`). | Fixed-height hero, text inside a fixed-size ring, pill buttons with fixed width. | No fixed heights on anything that holds text. Sizes in `rem`. |
| 1.4.5 Images of Text (AA) | Use real text, not pictures of text. | No images. | AI-made course art with words baked in (example-01 style). | Art contains no words. Titles are HTML. |
| 1.4.10 Reflow (AA) | No two-direction scrolling at 320 CSS px wide (equal to 1280 px at 400% zoom). Content that needs two dimensions, such as data tables, is exempt [S33]. | Measured: no horizontal overflow at 320 px. | A 53-week heatmap. A wide stats row. A two-column hero. | One column at 320 px. A calendar shows at most 7 columns. If a year view is ever built, it goes in its own scroll container on its own page. |
| 1.4.11 Non-text Contrast (AA) | 3:1 for what is needed to identify a control or its state, and for parts of graphics needed to understand them. Graphics with the same information in visible text are exempt [S20]. | Focus ring about 2.4:1. Progress track 1.12:1. Missed-day dot 1.11:1 (code audit 4.3). Bars have text beside them, so they are exempt today. | Removing the text beside a bar to cut copy makes the bar the only carrier, and then 3:1 applies. A selected theme option shown by a faint tint. | Focus ring at full-strength color, 3:1 or more against both the page and the button. Selected states use a 3:1 border or a check mark. If a bar's text goes, the bar goes too. |
| 1.4.12 Text Spacing (AA) | No loss of content when line height is 1.5, paragraph spacing 2x, letter spacing 0.12 em, word spacing 0.16 em [S34]. | Measured at 375 px: no clipping and no horizontal scroll. The page just gets longer, which pushes "Start review" to the bottom edge of an 812 px screen. | Single-line truncation of course titles. Text inside the ring. Fixed-height rows. | No `truncate` on titles (they already wrap, `PLAN.md:135`). Rows grow. Retest with the spacing bookmarklet. |
| 1.4.13 Content on Hover or Focus (AA) | Extra content that appears on hover or focus must be dismissible, hoverable and persistent. Browser `title` tooltips are exempt [S35]. | No custom hover content. Language badges use `title` (code audit 8.4). | Tooltips on heatmap cells, on icon-only buttons, or to explain "retention". Keyboard hints that appear on hover. | Prefer visible text over tooltips. If a tooltip is used, it stays while hovered, closes on Esc, and also opens on focus. A hint that does not cover other content (the `kbd` pattern in `_session/RevealButton.tsx`) is fine. |
| 2.1.1 Keyboard (A) | Everything works from a keyboard. | Passes (`PLAN.md:140`). | A custom segmented theme control. Heatmap cells that only react to hover. A card that is clickable as a whole with a `div` handler. | Native elements: `<a>`, `<button>`, `<input type="radio">`. If the whole hero is clickable, the click target is still the real link inside it. |
| 2.1.4 Character Key Shortcuts (A) | A letter-only shortcut must be possible to turn off or remap, or work only on focus [S23]. | Fails in spirit: "d" toggles the theme anywhere, with no off switch (code audit 5). Speech-input users can trigger it by talking. | A new "press R to review" shortcut on the dashboard. | Remove "d". Any dashboard shortcut works only while its button has focus (Enter and Space already do). |
| 2.3.3 Animation from Interactions (AAA) and `prefers-reduced-motion` | Motion triggered by interaction can be turned off. Color and opacity fades are not "motion animation" [S38]. | Ring respects reduced motion (`PLAN.md:142`). | Count-up numbers, confetti on goal met, a ring that sweeps, cards that slide in, a button that lifts. | Wrap every transform, scale or position animation in `motion-safe:`. With reduced motion: final state at once, fades only. Nothing loops. Anything that moves for more than 5 seconds can be paused (2.2.2, A). |
| 2.4.1 Bypass Blocks (A) | A way to skip repeated blocks. | No skip link (measured). Landmarks exist, which is a sufficient technique for screen readers but not for sighted keyboard users. | A longer sidebar (theme control, more nav) adds tab stops before `<main>`. | Add a "Skip to main content" link as the first focusable element. |
| 2.4.2 Page Titled (A) | The title describes the page. | "Memli" on every route (measured). | Unchanged unless fixed. | "Home, Memli" (or the chosen page name). |
| 2.4.3 Focus Order (A) | Focus moves in an order that keeps meaning. | Order follows the layout. Measured on the phone layout: logo, account, menu, 5 language links, Start review, Learn. | Moving the filter, adding a theme control, or a sticky bottom bar can put the main action late or out of order. | Inside `<main>` the first stop is the primary action. Filters come after the hero. |
| 2.4.6 Headings and Labels (AA) | Headings and labels describe their topic. | "Continue learning" heads a card with nothing to click in the default state (code audit finding 6). "Studying" reads like a status. | Clever or playful headings ("Your memory garden"). | Headings say what is under them in plain words. See the copy pass in section 11. |
| 2.4.7 Focus Visible (AA) | Keyboard focus is visible. | Every stop shows a ring (`PLAN.md:140`). The ring is faint, about 2.4:1 (code audit 4.3). | A dark navy theme with a blue ring. A shadowed button where the ring merges with the shadow. | Ring: 2 px or more, solid, offset by 2 px, 3:1 against what is behind it in both themes. This also meets the size part of 2.4.13 Focus Appearance (AAA). |
| 2.4.11 Focus Not Obscured (Minimum) (AA) | A focused element is not entirely hidden by author content. Sticky headers and footers are the usual cause [S36]. | No sticky bars on the dashboard that I saw. | A sticky bottom "Start review" bar or a bottom tab bar on phones. A sticky phone header. | If anything is sticky, add `scroll-padding-top` and `scroll-padding-bottom` equal to its height (technique C43). Test by tabbing through the whole page at 375 px. |
| 2.5.3 Label in Name (A) | The accessible name contains the visible label. Best practice: it starts with it [S37]. | Good: "Review" is named "Review 8 cards in ..." (code audit 9). | Renaming buttons without renaming their `aria-label`. An icon-plus-text theme button whose `aria-label` says something else. | Every `aria-label` starts with the exact visible text. Lint or test for it. |
| 2.5.8 Target Size (Minimum) (AA) | 24 x 24 CSS px, or enough spacing that a 24 px circle on each target does not overlap another [S32]. | Measured at 320 px: the smallest targets are the logo link (81 x 28) and the menu button (32 x 32). Language chips are 36 px tall. Row buttons are 36 px tall. All pass. | Heatmap cells (GitHub-size cells are far below 24 px). Small icon buttons. A compact three-way theme switch. | Every target 24 x 24 at least. For this audience go further: 44 px for anything a learner taps often, 56 px for the primary action (2.5.5 Target Size Enhanced is 44 px, AAA). |
| 3.1.2 Language of Parts (AA) | Text in another language is marked. | Done for tricky words (code audit 9). | New places where learning-language words appear: a "word of the day", a mnemonic preview. | Same `lang` rule everywhere the word is shown. |
| 3.2.2 On Input (A) | Changing a control does not cause an unexpected change of context. | The filter is links, so it is fine. | Turning the language filter into a `<select>` that navigates on change. | Keep links or a menu of links. If a select is used, focus stays on it and the page does not jump. |
| 3.2.3 Consistent Navigation (AA) | Repeated navigation appears in the same order on every page. | Sidebar is shared. | A theme control that is in the sidebar on one page and in a header on another. | One place on desktop (sidebar foot), one on phones (account menu), on every app page. |
| 3.2.4 Consistent Identification (AA) | Things with the same function have the same name. | Fails in spirit: "Community Gallery" and "Browse community decks" lead to the same place. "Tricky words" and "words keep slipping" are the same set. Card and word are mixed (code audit 8). | Renaming "deck" on the dashboard but not in the session or sign-up copy. | One term per concept across the whole app. See the jargon table in section 12. |
| 3.3.1, 3.3.2, 3.3.3 (A, A, AA) | Errors are identified, inputs have labels or instructions, and fixes are suggested. | No inputs on the dashboard today. | A theme control and, later, an editable daily goal add inputs. | Radio group with a visible group label. A goal field with a visible label, a stated range, and an error that says what to change. |
| 4.1.2 Name, Role, Value (A) | Custom controls expose name, role and state. | Links are announced as buttons (`role="button"` on `<a>`, code audit 9). | A segmented theme control built from `div`s. A disclosure ("Show details") without `aria-expanded`. | Native radios for the theme. `<button aria-expanded>` or `<details>` for disclosures. Navigation actions are links that look like buttons, without `role="button"`. |
| 4.1.3 Status Messages (AA) | Messages about results or progress reach assistive technology without moving focus. A change of context is not a status message [S39]. | Nothing changes without user action. No live regions (measured: 0). That is correct today (`PLAN.md:98`). | Real data in MS 3: loading, errors, "goal reached" appearing in place, counts updating after a session. | Loading uses `aria-busy` and a polite status. "Goal reached" that appears while the page is open uses `role="status"`. Returning from a session is a navigation, so it needs no live region. |

---

## 4. COGA applied to this page

W3C's "Making Content Usable for People with Cognitive and Learning Disabilities" [S2] is a Working Group Note, not a standard. It is the best single source for "non-tech-savvy". The patterns below are the ones this dashboard touches. Quoted lines are the "What to Do" or "User Need" text.

| COGA pattern | What it says | Where the dashboard stands | What the redesign does |
| --- | --- | --- | --- |
| 4.2.1 Make the Purpose of Your Page Clear | "Help the user know the purpose of the content." | The loudest element is a greeting. The purpose (study now) is one of several panels. | The hero states the purpose in one sentence and one button. |
| 4.3.4 Make it easy to find the most important actions and information on the page | "Make key content visually stand out. Key content should be visible to users without needing to scroll the page." | Button bottom edge at 625 px on a 375 x 812 phone (measured). | Whole hero above the fold on a small phone (D3 in section 10). |
| 4.4.1 Use Clear Words | "Use common and clear words in all content." | deck, due, mastered, retention, consistency, mnemonic, caught up (code audit 8). | Jargon table, section 12. |
| 4.4.4 Use Literal Language | Avoid idioms and metaphors. | "keep slipping", "caught up", "help them stick". | "tricky words", "all done", "help you remember". |
| 4.4.5 Keep Text Succinct | "Use short blocks of text." | Mostly short already. The problem is count, not length. | Fewer fragments. No sentence over 12 words. |
| 4.4.10 Use White Spacing | "Put white space around objects and text." | Seven boxed regions close together. | Three or four regions with clear gaps. |
| 4.4.13 Provide Alternatives for Numerical Concepts | "Provide alternatives for numbers and numerical concepts." | 37 numbers, 7 percentages. | Counts instead of percentages ("200 of 1,000 words"). A bar next to every ratio. Words for states ("All done"). |
| 4.7.5 Do Not Rely on Users Calculations or Memorizing Information | The page should do the arithmetic. | "24 of 50" makes the reader subtract, but "26 more cards" already answers it. | Keep the answer ("26 to go"). This is the one "duplicate" worth keeping. |
| 4.2.7 Use Icons that Help the User | Icons support text. They do not replace it. | Flame and bulb icons have text beside them. | The theme control shows words with its sun and moon icons. Language badges show the language name, not only "ES". |
| 4.5.1 Ensure Controls and Content Do Not Move Unexpectedly | Layout should be stable. | The focus card's button appears and disappears by state (code audit finding 6). | The hero always has its button in the same place, in every state. |
| 4.8.3 Clearly State the Results and Disadvantages of Actions | Say what will happen. | "Start review" opens 16 of the 24 cards. "Each new word adds a few short reviews" is a good example already in the code. | Hero counts what the button opens. Keep the cost note on "learn more". |
| 4.6.1 Limit Interruptions | Do not pull attention away from the task. | None today. | No pop-ups, streak warnings or upsell banners on load. |
| 4.9.4 Support a Personalized and Familiar Interface | Let people keep settings and a familiar layout. | Theme is saved (code audit 5). | Theme choice and layout stay stable across visits. NN/g found older users keep written notes of steps [S9]. |

---

## 5. Plain-language rules to write by

| Rule | Source | How it applies |
| --- | --- | --- |
| Write for the reader you have. | digital.gov: "Use language your audience understands and feels comfortable with." [S7] | The reader is Karen, not a spaced-repetition hobbyist. |
| Plain English helps experts too. | GOV.UK: "people with higher levels of literacy prefer plain English" and in one study "80% of people preferred sentences written in clear English" [S6] | Plain copy will not annoy Woodson or Ben. |
| Short sentences. | GOV.UK: "Try to split up sentences that are over 25 words long." [S6] digital.gov: "Express only one idea in each sentence." [S7] | The dashboard limit should be tighter: 12 words. |
| Short, common words. | GOV.UK: "Do not use formal or long words when easy or short ones will do." [S6] | "learned" over "mastered". "remembered" over "retention". |
| Replace jargon or define it. | digital.gov: "Try to substitute everyday language for jargon as often as possible." "When you have no way to express an idea except to use technical language, make sure to define your terms." [S7] | "Mnemonic" is the product's own word. Keep it only with a plain partner ("memory trick"). |
| One name per thing. | digital.gov: "You can confuse your audience if you use different terms for the same concept or object." [S7] | Card and word. Tricky and slipping. Community Gallery and community decks. |
| Front-load. | NN/g: start headings "with the most informative words" [S13]. | "16 words to review", not "Today: cards ready for you". The number and the noun come first. |
| Sentence case for buttons, and say what they do. | GOV.UK Design System: "Write button text in sentence case, describing the action it performs." [S24] | "Start review", "Sign out". The account menu uses Title Case today (code audit 6.1). |
| Reading age. | GOV.UK is widely reported to aim for a reading age of 9. I confirmed this only through a 2022 archived copy surfaced by search, not on the live page [S6]. | Use it as a guide: would a 9-year-old know every word on the dashboard except course names? |

House rules that already exist and still apply: no em dashes in customer-facing copy (owner's standing rule), whole-sentence templates with `{placeholders}` and plural forms (`PLAN.md:111-112`, `dev/memli/docs/i18n.md` section 3), room for text that is 30 to 40% longer in `es-419` (`PLAN.md:114`).

---

## 6. Scanning behaviour: where the eye goes and what to put there

- **Top-left of the main column gets the most looks** on a page with weak cues [S13]. Put the hero there. Today that spot holds the greeting and five filter chips.
- **The right column is at risk of being skipped** [S27]. That is fine for "This week", which is support. It would be wrong for the main action.
- **Headings are the map** [S14]. Keep them few, distinct, and honest about what is beneath them.
- **One distinct element is remembered** [S22]. Reserve the solid primary color and the largest size for the hero's button and number.
- **A dashboard should be read "at a glance"** [S16]. NN/g adds that length and position are read accurately, while area and angle are not, that pie and donut charts "should be avoided most of the time", and that gauges "are also harder to interpret than linear graphs". This matters for the goal ring (section 8).

---

## 7. Theme switching: an accessible specification

### 7.1 What the control is

- **Three choices, always visible as three:** "Match my device", "Light", "Dark". Not a button that cycles. A cycling button hides two of the three options and changes its own label, which makes it harder to predict and harder to target by voice (2.5.3).
- **Plain label for the group:** "Theme". "Appearance" is also common. Avoid "System", "Auto" and "Mode" as option names. "System" means nothing to a non-technical learner.
- **Icons plus words.** A sun, a moon and a device icon help recognition. They never stand alone (COGA 4.2.7 [S2]).

### 7.2 Semantics and keyboard

| Requirement | Detail | SC |
| --- | --- | --- |
| Native radio group | `<fieldset>` with a `<legend>` ("Theme") and three `<input type="radio">`, styled as a segmented control. Or `role="radiogroup"` with `role="radio"` and `aria-checked` if a library part is used (the dropdown radio parts exist: code audit 6.2). | 1.3.1, 4.1.2 |
| Keyboard | Tab enters the group once. Arrow keys move and select. This is the standard radio group pattern [S40]. | 2.1.1 |
| State | The checked radio is the state. A screen reader then announces something like "Dark, radio button, checked, 3 of 3" (typical wording, not tested). No `aria-live` is needed. web.dev's theme switch uses `aria-live` because it is a single toggle button [S41]. A radio group does not need that. | 4.1.2, 4.1.3 |
| Selected look | A 3:1 border or fill change plus a check or filled dot. Not a faint tint alone. | 1.4.1, 1.4.11 |
| Size | Each option at least 44 px tall. | 2.5.8 |
| Name | The accessible name of each option is its visible word. | 2.5.3 |

### 7.3 Where it lives

| Surface | Place | Why |
| --- | --- | --- |
| Desktop | Bottom of the sidebar, above the account button | Always visible. This is the bottom-left area Crystal circled in example-02. The code audit found about 650 px of unused space there (section 6.1). |
| Phone | Inside the account menu, as the first group | The top bar is full at 375 px (code audit 6.2). One tap on the avatar reveals it. |
| Settings page | Same control, with one sentence of help | The expected long-term home. |

The control has the same label, same options and same order in all three places (3.2.3, 3.2.4).

### 7.4 Behaviour

| Requirement | Detail | Source |
| --- | --- | --- |
| Default is "Match my device" | Reads `prefers-color-scheme`. Today the app passes `defaultTheme="light"` and ignores the device (code audit 5). | [S10] |
| Follows the device live | When the device switches (sunset schedules), the page follows, if the choice is "Match my device". The provider already listens for this (code audit 5). | [S41] |
| Persists | Saved under the existing `localStorage` key `theme`. The axe specs depend on that key (code audit 5). | |
| No flash | A small blocking inline script in `<head>` sets the class before first paint. web.dev: "a small amount of blocking JavaScript" with "the goal to set the HTML attribute `data-theme` as early as possible" [S41]. Add `<meta name="color-scheme" content="light dark">` so the browser paints the right canvas color before CSS loads [S42]. | [S41][S42] |
| Native parts follow | Set CSS `color-scheme` per theme so scrollbars and form controls match [S42]. Measured today: `color-scheme` is `normal`. | [S42] |
| No animated switch | Colors change at once. The provider already disables transitions during the change (code audit 5). | 2.3.3 |
| Phone browser chrome | A `theme-color` meta per theme. | code audit 5 |
| No single-letter shortcut | Remove "d". | 2.1.4 [S23] |

### 7.5 More contrast and forced colors

These are separate from light and dark. A user can ask for either on top of any theme.

**`prefers-contrast: more`** ("Baseline: Widely available" since May 2022 [S43]):

- Secondary text uses the main text color.
- Borders and dividers reach 3:1 or more.
- No translucent surfaces.
- This is a small set of token overrides, not a third theme.

**`forced-colors: active`** (Windows contrast themes). The browser replaces `color`, `background-color`, `border-color`, `outline-color`, SVG `fill` and `stroke` with the user's palette, and forces `box-shadow` to `none` [S44]. The effects on this page:

| Element | What happens | Fix |
| --- | --- | --- |
| Cards | Their only edge is a 1 px `ring`, which is a `box-shadow` (code audit 4.5). It vanishes. Cards lose their edges. | Give cards a real 1 px border. It can be transparent in normal modes. Forced colors paints it. |
| Primary button depth | The shadow goes. The fill is replaced. | The button already has `border border-transparent` (measured: `1px solid rgba(0,0,0,0)`), which becomes a visible outline. Keep that border when adding depth. |
| Focus ring | A ring made with `box-shadow` disappears. Microsoft's guidance is to add a transparent `outline`, which forced colors makes visible [S45]. | Use `outline` for focus, not only `ring`. |
| Progress bars, goal ring, week dots | Fills are background colors, so fill and track become the same color. | Text beside each graphic carries the value (already true). For the fill, either add a border or use `forced-color-adjust: none` with system colors such as `Highlight` and `CanvasText` [S44][S45]. |
| Calendar or heatmap | All shades collapse to one. | A check glyph in each studied day. See section 8. |

MDN's advice is to use the media query for small fixes, not for "a separate design" [S44].

I did not test forced colors in a browser. The table is reasoning from the documented behaviour.

---

## 8. Accessible data visualizations

The general rule from W3C's complex images tutorial: a chart needs a short description and "a textual representation of the essential information conveyed by the image", available to everyone [S46]. On this dashboard that means: **every graphic has a sentence next to it that says the same thing.** The graphic is then decoration for screen readers (`aria-hidden`) and exempt from 1.4.11 [S20]. This is how the page works today, and it should stay that way.

The danger in a "less copy" redesign is deleting the sentence and keeping the picture. Rule: **if the text goes, the graphic goes with it.**

### 8.1 Progress bar (course progress)

| Point | Recommendation | Why |
| --- | --- | --- |
| One meaning per bar | One fill that means "learned so far". Drop the three-segment bar from the dashboard. | "Learning" against "mastered" is two blues at 2.48:1 and the legend relies on color alone (code audit 4.3, 9). Fails 1.4.1 in spirit. |
| Sentence beside it | "200 of 1,000 words learned". A count, not a percentage. | COGA 4.4.13 [S2]. |
| Visible track | The empty part must be visible. Track or its border at 3:1 against the card. Fill at 3:1 against the track. | Today the track is 1.12:1 (code audit 4.3). A bar whose end cannot be seen shows no proportion. |
| Role | If the bar ever stands alone, use `role="progressbar"` with `aria-valuenow`, `aria-valuemin`, `aria-valuemax` and `aria-valuetext` ("200 of 1,000 words learned"). Do not use `meter` for this: "The meter should not be used to indicate progress, such as loading or percent completion of a task" [S47]. | 4.1.2 |
| No fixed width | Bars stretch with their container. | `w-16` mini bars are fixed today (code audit 9, i18n notes). |
| Bars in list rows | Remove them from the "other courses" rows, with their "% mastered" text. | Three more numbers and three more bars for information the learner does not act on from this page. Progressive disclosure [S15]. |

### 8.2 Goal ring

- NN/g: gauges "are also harder to interpret than linear graphs", and donuts "should be avoided most of the time" [S16]. A ring works here only because the number in the middle does the telling. Treat the ring as a frame for the number.
- At most one ring on the page.
- The text in the ring must not be 12 px. Today "of 50" is the small line inside a 96 px ring (code audit 9). Put "24 of 50" beside the ring at 16 px or more if it does not fit inside at that size. Longer languages will not fit ("de 50", "sur 50", larger numbers).
- `aria-hidden` on the SVG. One sentence carries it: "24 of 50 words today".
- No sweep animation with reduced motion (already done).
- Track visible at 3:1 against the card.

### 8.3 The 7-day row (Crystal circled this in example-05)

It is already the most accessible graphic on the page: a check icon plus a hidden label per day (`PLAN.md:100`). What to change:

| Today | Problem | Change |
| --- | --- | --- |
| S M T W T F S | Two S and two T. Long names are screen-reader only (code audit 8.4). | Short names from `Intl` ("Mon", "Tue") where there is room. Two letters at the least. |
| Missed-day dot is `bg-muted`, 1.11:1 | Invisible to low-vision users. | An empty ring with a 3:1 border. No fill. No cross. |
| Hidden label "goal missed" | Reads as blame. | "Monday, no study" or "Monday, rest day". |
| Four states (met, missed, in progress, upcoming) | Hard to tell apart by shape. | Three shapes: filled with check (done), thick ring (today), thin ring (other days). |
| Today's dot | A 2 px ring only. | Add the word "Today" under it. |

### 8.4 A "GitHub chart" (Crystal's request)

What makes the GitHub-style grid risky here:

| Risk | SC or source |
| --- | --- |
| Amount is shown by shade only. Five shades cannot each be 3:1 apart. | 1.4.1, 1.4.11 |
| Cells are small. If they are interactive they must be 24 px or meet the spacing rule. | 2.5.8 [S32] |
| 53 columns do not fit 320 px. | 1.4.10 [S33] |
| Per-day detail usually lives in a hover tooltip. | 1.4.13 [S35], 2.1.1 |
| If every cell is focusable, that is hundreds of tab stops. | 2.4.3 |
| In forced colors every cell becomes the same color. | [S44] |
| The layout (weeks as columns) is familiar to developers. It is not a calendar anyone else has seen. | COGA "Use a Familiar Hierarchy and Design" [S2, 4.2.2] |
| Empty squares make missed days the most visible thing. | Section 9 |

An accessible version that keeps what Crystal liked (a picture of your consistency):

1. **Make it a month calendar.** Seven columns, weeks as rows, day-name headers. Everyone knows how to read it. It fits 320 px (7 x 40 px = 280 px).
2. **Two states, not five shades.** Studied (filled, with a check) or not (empty ring). If intensity is wanted later, use three steps at most and still keep the check.
3. **A sentence above it.** "You studied on 21 of the last 30 days." That sentence is the text alternative.
4. **Real table markup** with a caption, `<th>` day headers, and each cell holding visible or screen-reader text ("Monday 9 November, 24 words").
5. **Cells are not interactive.** No tooltips. If per-day detail is needed, it goes on a Progress page as a table ("View as table").
6. **In dark mode, define the scale again.** Do not invert it. More study is the stronger color in both themes.
7. **Place it as support, not at the top.** It is a reward for looking, not the thing to do. On the dashboard, the 7-day row can stand in for it, with the month calendar on a Progress page.

I did not check how GitHub itself implements its graph for assistive technology.

---

## 9. Streaks and gamification: what the research supports

### 9.1 What is known

| Claim | Evidence | Strength |
| --- | --- | --- |
| Showing an intact streak raises later engagement. Showing a broken one lowers it. | Silverman and Barasch, Journal of Consumer Research, 2023, seven studies: "intact streaks highlighted via behavioral logs increase consumers' subsequent engagement". The effect "is independent of actual past behavior and depends solely on how that behavior is represented". [S26] | Peer reviewed. I read the abstract, not the full paper. |
| A broken streak hurts more when people blame themselves. | Same paper: the effect is "amplified when consumers attribute a break in the streak to themselves". [S26] | Same. |
| Being able to repair a streak softens the drop. | Same paper: "attenuated when consumers can 'repair' a broken streak". [S26] | Same. |
| Goals with a little slack are preferred and lead to more persistence. | Sharif and Shu, Journal of Marketing Research, 2017. In a field experiment with step goals, people with "emergency reserves" reached their goal on up to 40% more days. A later replication in dieting did not find more persistence after failure. [S30] | Peer reviewed, read through summaries. Mixed replication. |
| Missing one day does not materially hurt habit formation. | Lally et al., European Journal of Social Psychology, 2010 (DOI 10.1002/ejsp.674). The average time to automaticity was 66 days with a range of 18 to 254. [S28] | Peer reviewed, read through secondary reports. UCL's own page returned an error when I tried it. |
| Streaks work on loss aversion. | Duolingo's own blog calls it "an internal bias in your brain that makes you particularly averse to losing something, like a learning streak". It reports that learners with a 7-day streak are "3.6 times more likely to complete their course" and that allowing two streak freezes raised daily active learners by 0.38%. [S48] | A company describing its own product. The numbers are about engagement, not learning. Correlation, not cause. |
| Game elements can backfire in education software. | Almeida et al., 2023 systematic mapping: "badges, leaderboards, competitions, and points are the game design elements most often reported as causing negative effects". The effects named most often were "lack of effect, worsened performance, motivational issues". [S49] | Peer reviewed mapping study, read from the abstract. Streaks are not singled out. |
| Motivation that lasts comes from autonomy, competence and relatedness. Pressure and contingent rewards produce "controlled" motivation. | Self-determination theory. Support for the three needs fosters "the most volitional and high quality forms of motivation". The control orientation is one "in which the focus is on rewards, gains, and approval". [S50] | A well-established theory. Its application to streaks is my inference. |

What I did not find: a peer-reviewed study that measures anxiety caused by streaks in language apps. Claims of that kind online are commentary. A vendor study of 859 streak designs argues that "streak design runs on a fear that research doesn't support" [S51]. It is a design blog, not research, and I use it only for its examples of kinder patterns (automatic freezes, repair, pausing).

### 9.2 Why this matters more for this audience

- Older users blame themselves 90% of the time when something goes wrong [S9]. Self-blame is exactly the condition that makes a broken streak most demotivating [S26].
- A spaced-repetition app has a second trap. A good learner has fewer reviews. `PLAN.md:61-64` already solved this for the daily goal: clearing the queue counts as meeting the goal. The streak should follow the same rule (`PLAN.md:64`).
- The current greeting makes the streak the reason to study: "About 4 minutes of review keeps your 12-day streak going." That is a mild loss frame, at the very top of the page, in the `h1` block.

### 9.3 Rules for the redesign

1. **The reason to study is the words, not the streak.** The hero says what is ready and how long it takes. The streak is a quiet fact in "This week".
2. **Count up, never threaten.** "12 days in a row". Never "Don't lose your streak", never a countdown, never red.
3. **Forgive by design.** One of: a weekly goal ("5 of 7 days"), an automatic rest day, or a repair on return. The evidence for slack and repair is in [S26] and [S30].
4. **Clearing everything counts.** A day with nothing left to do keeps the streak (`PLAN.md:64`).
5. **A broken streak gets a neutral welcome.** "Welcome back. 16 words to review." The old number can stay as a fact the learner owns: "Longest run: 12 days". No "you lost".
6. **No "missed" labels.** Empty days are empty, not failed (section 8.3).
7. **No comparison with other people on this page.** "Global average: 75%" goes. `dev/memli/docs/product-ux.md` already parked the Rank card for the same reason ("comparison can discourage newer learners").
8. **Show competence.** "100 words learned" is a number that only goes up. It answers the need for competence in self-determination theory [S50] better than a streak does.
9. **Leave the learner in charge.** A daily goal the learner sets. Later, a setting to hide the streak.
10. **No celebration that moves without consent.** Goal-reached feedback is a calm state change. Any motion sits behind `motion-safe` (section 3, 2.3.3).

---

## 10. (a) Definition of done

Every line is a statement that is true or false for the finished page. "Default state" means `/dashboard?preview=default`. "All states" means all eleven `?preview=` values in both themes.

### Focus and hierarchy

- [ ] **D1.** The default state has exactly one solid, filled primary button. No other element uses the same fill color at a size above 24 x 24 px.
- [ ] **D2.** The primary button is the largest control on the page: at least 56 px tall, and at least 1.5 times the area of the next largest control.
- [ ] **D3.** In a 375 x 550 viewport the whole hero is visible without scrolling: course name, count, time estimate and the full primary button. 550 px is roughly what a 375 x 667 phone shows once browser bars are counted (my estimate). Also check 390 x 844 and 412 x 915 on real devices. (Today the button's bottom edge is at 625 px.)
- [ ] **D4.** At 1280 x 720 the hero is in the main column, starts in the top third of the viewport, and is not in the right-hand column.
- [ ] **D5.** The hero has the same structure and button position in every state. Only the words change.
- [ ] **D6.** The number in the hero is the largest text on the page. No other number is within 60% of its size.
- [ ] **D7.** The count in the hero equals the number of items the primary button opens.
- [ ] **D8.** Five-second test passes (section 13).
- [ ] **D9.** First-click test passes (section 13).

### Copy

- [ ] **D10.** The default state shows 90 visible words or fewer inside `<main>`. (Today about 197.)
- [ ] **D11.** The hero shows 25 words or fewer.
- [ ] **D12.** The default state shows 14 numbers or fewer. (Today 37.) No fact appears twice, except "26 to go" beside "24 of 50".
- [ ] **D13.** The default state has 6 headings or fewer. (Today 12.) Exactly one `h1`.
- [ ] **D14.** No sentence is longer than 12 words.
- [ ] **D15.** None of these words appears in text a learner can see or hear on the dashboard, the sidebar or the account menu: deck, due, mastered, retention, consistency, global average, FSRS, leech, queue, session, system. "Mnemonic" appears only together with a plain explanation.
- [ ] **D16.** One item noun is used everywhere a learner can see ("words"), and one container noun ("course", if the test in section 13 confirms it). A grep for the old terms in `messages` objects returns nothing.
- [ ] **D17.** No em dash in any `messages` string.
- [ ] **D18.** Buttons and menu items are in sentence case.
- [ ] **D19.** No percentage is shown without a count or a bar beside it. No comparison with other learners is shown.

### Type and targets

- [ ] **D20.** No text is smaller than 14 px. Every full sentence is 16 px or larger. (Today 25 text elements are 12 px and 42 are 14 px at 375 px wide.)
- [ ] **D21.** The page uses at most three text sizes plus the hero number.
- [ ] **D22.** Every pointer target is at least 24 x 24 CSS px. Every target a learner taps to study or navigate is at least 44 px tall.
- [ ] **D23.** Adjacent targets are at least 8 px apart.

### Contrast and color (both themes, checked separately)

- [ ] **D24.** Every text and background pair is 4.5:1 or more (3:1 for text 24 px or larger). The color research file may set stricter APCA targets. Those apply as well.
- [ ] **D25.** The primary button's label is 4.5:1 or more against its fill in both themes. If the fill is yellow or orange, the label is dark.
- [ ] **D26.** The focus indicator is a solid outline at least 2 px thick with 3:1 against its background, on every focusable element, in both themes.
- [ ] **D27.** Every selected, current or checked state is visible without color: a border, a check, a filled dot or a weight change.
- [ ] **D28.** No information is carried by color alone. A grayscale screenshot of the page loses no meaning.
- [ ] **D29.** Progress tracks and empty-day rings are 3:1 against their card.
- [ ] **D30.** The hero differs from the page background by a clear lightness step, and stays the most prominent region in a grayscale screenshot of each theme.

### Theme

- [ ] **D31.** A theme control is visible without opening anything on desktop, and within one tap on phones.
- [ ] **D32.** It offers exactly three options with visible text: "Match my device", "Light", "Dark".
- [ ] **D33.** It is a radio group. A screen reader announces the group name, each option, and which is checked. Arrow keys change it.
- [ ] **D34.** With no saved choice, the page follows the device setting.
- [ ] **D35.** The choice survives a reload and a new tab.
- [ ] **D36.** A hard reload in dark shows no light frame. Check with a screen recording stepped frame by frame, with the network throttled.
- [ ] **D37.** `color-scheme` is set per theme. Native scrollbars and form controls match.
- [ ] **D38.** Pressing "d" does nothing.
- [ ] **D39.** The control has the same label, options and order wherever it appears.
- [ ] **D40.** With `prefers-contrast: more`, secondary text uses the main text color and borders are 3:1 or more.
- [ ] **D41.** With forced colors on (Windows contrast theme, or DevTools emulation), every card has a visible edge, the primary button has a visible boundary, focus is visible, and studied days can still be told from other days.

### Keyboard and screen reader

- [ ] **D42.** A "Skip to main content" link is the first focusable element.
- [ ] **D43.** The first Tab stop inside `<main>` is the primary action.
- [ ] **D44.** Tab order equals visual order at 375 px and at 1280 px.
- [ ] **D45.** Nothing sticky ever fully covers a focused element. Tab through the whole page at 375 px to check.
- [ ] **D46.** Every `aria-label` begins with the element's visible text.
- [ ] **D47.** Actions that navigate are announced as links. Actions that change something in place are announced as buttons.
- [ ] **D48.** The document title names the page.
- [ ] **D49.** With VoiceOver, reading the hero from its heading gives: course name, count of words to review, time estimate, the primary action.
- [ ] **D50.** No live region announces static content. Any message that appears without a navigation uses `role="status"`.

### Reflow, zoom and spacing

- [ ] **D51.** No horizontal scrolling at 320 px wide, in all states.
- [ ] **D52.** No clipped or overlapping text at 200% browser zoom, in all states.
- [ ] **D53.** With WCAG text spacing applied (line height 1.5, paragraph 2 em, letter 0.12 em, word 0.16 em), no text is clipped or overlaps.
- [ ] **D54.** With every string 40% longer (pseudo-locale), nothing is cut off and the primary button still fits on one or two lines.

### Motion

- [ ] **D55.** With `prefers-reduced-motion: reduce`, nothing moves, scales or slides. Color and opacity may fade.
- [ ] **D56.** Nothing animates for more than 5 seconds or loops.

### Graphics

- [ ] **D57.** Every bar, ring, dot row or calendar has a visible sentence that states the same fact.
- [ ] **D58.** No graphic is interactive unless it is keyboard operable and each target is 24 px or more.
- [ ] **D59.** At most one ring and one bar style are used on the page.

### Streak ethics

- [ ] **D60.** No copy mentions losing, breaking or missing a streak or a goal, in visible text or in screen-reader text.
- [ ] **D61.** The streak is not in the hero and not in the `h1` block.
- [ ] **D62.** A day with nothing left to study counts toward the streak and the goal.
- [ ] **D63.** Returning after a gap shows a neutral welcome and the normal hero.

### i18n

- [ ] **D64.** Every string is a whole-sentence template in a `messages` object. No sentence is split across elements. A styled number sits inside its sentence through a rich-text tag.
- [ ] **D65.** Every count message has plural forms.
- [ ] **D66.** Day names, numbers, durations and language names come from `Intl` with the UI locale.
- [ ] **D67.** No uppercase styling is used to carry meaning.
- [ ] **D68.** Layout uses logical properties only.
- [ ] **D69.** Learning-language text carries `lang`.

### Process

- [ ] **D70.** `dashboard.a11y.spec.ts` (axe, WCAG 2.2 AA) passes for all states in both themes.
- [ ] **D71.** A manual keyboard pass and a VoiceOver pass are recorded for the default, caught-up and no-courses states.
- [ ] **D72.** Karen can read every piece of text on her own device at her normal distance, in the theme she chooses, without zooming.

---

## 11. (b) Plain-language pass over the current copy

### 11.1 Two decisions the copy depends on

**Decision 1: what the hero counts.** "Start review" opens only the focus course (code audit 7.3). Two honest options:

| Option | Hero says | When it is right |
| --- | --- | --- |
| A. All courses | "24 words to review. About 4 minutes." | Only once one session can cover every course (`PLAN.md:146`, still open). |
| **B. Next course (recommended now)** | "Spanish Core 1000. 16 words to review. About 3 minutes." | Today. The button and the headline agree. The other 8 words show in the Japanese row, with their own button. |

Option B also merges "Today" and "Continue learning" into one card. That removes a whole region, the "16 from", "8 from" and "Starts in" lines, and the card that has no button. It is the single hero card Crystal circled in example-04. The time estimate for 16 cards comes from `estimateMinutes`. I wrote "3 minutes" as a stand-in and did not run the function.

**Decision 2: what "learned" counts.** Today: 52 mastered, 148 learning, 800 not started. "5% mastered" is accurate and discouraging. "200 of 1,000 words learned" (mastered plus learning) is accurate if "learned" means "you have started it". The mastered and learning split moves to the course page. The owner must pick the definition. The copy below assumes the second.

### 11.2 String by string (default state)

Verdicts: **Keep**, **Cut**, **Rewrite**. Rewrites are whole-sentence templates. `one` and `other` are plural forms. `<n>` is a rich-text tag for styling the number without splitting the sentence.

| # | Today | Verdict | New template | Why |
| --- | --- | --- | --- | --- |
| 1 | Good evening, Phillip | Keep | `Good evening, {name}` | Warm, 3 words. Respondents liked the welcome in example-02. Make it visually modest so it does not compete with the hero. |
| 2 | About 4 minutes of review keeps your 12-day streak going. | Cut | (none) | Repeats the minutes and the streak. Makes the streak the reason to study (section 9). |
| 3 | Studying: All languages, French, Japanese, Portuguese, Spanish | Rewrite and move | Label: `Language` Options: `All languages`, then names from `Intl` | Five controls sit above the main action today. "Studying" reads like a status (code audit 8.4). Move it beside the course list. Use one menu when there are more than three languages. Still hidden when there is only one. |
| 4 | TODAY | Cut | (none) | An uppercase eyebrow adds a heading without adding meaning. The section is named by the hero heading. |
| 5 | 24 cards ready to review | Rewrite | `one: <n>{count}</n> word to review` `other: <n>{count}</n> words to review` | "Words" is what learners say. Front-loaded number. One sentence, so a translator can reorder it. |
| 6 | About 4 minutes | Keep | `About {duration}` | Tells the cost before the click. COGA 4.6.4 asks for information that lets a user prepare for a task [S2]. |
| 7 | 16 from Spanish Core 1000 | Cut | (none) | Not needed once the hero names the course (Option B). |
| 8 | 8 from Japanese Hiragana & Katakana | Cut | (none) | Shown once, in the Japanese row. |
| 9 | Start review | Keep | `Start review` | Two words, a verb first, sentence case. |
| 10 | Learn 10 new words | Keep, quieter | `one: Learn {count} new word` `other: Learn {count} new words` | Clear already. Must look secondary: outline or text style, 44 px. |
| 11 | Starts in Spanish Core 1000. | Cut | (none) | The hero heading is the course. |
| 12 | Continue learning | Cut | (none) | The card merges into the hero. This heading promised an action the card did not have. |
| 13 | ES | Keep as decoration | (badge, `aria-hidden`) | A color and letter cue. The language name must also appear as text when the course title does not include it. |
| 14 | Spanish Core 1000 | Keep | `{course}` | Content. It becomes the hero's first line. |
| 15 | Last studied 2 hours ago | Cut from the dashboard | (course page) | Nobody acts on it here. Four copies today. |
| 16 | 16 Due | Cut | (none) | Same fact as line 5. |
| 17 | 10 New today | Cut | (none) | Same fact as line 10. |
| 18 | 5% mastered of 1,000 cards | Rewrite | `{learned} of {total} words learned` | A count, not a percentage. One sentence. |
| 19 | 52 mastered, 148 learning, 800 not started | Cut from the dashboard | (course page: `{count} known well`, `{count} still learning`, `{count} not started`) | Three numbers that can be worked out from each other. Detail for a second screen. |
| 20 | Other decks | Rewrite | `Your other courses` | "Deck" is the word Crystal questioned. |
| 21 | JA / FR / PT | Keep as decoration | (badge) | As line 13. |
| 22 | Japanese Hiragana & Katakana (and the other two titles) | Keep | `{course}` | Content. |
| 23 | Last studied yesterday / 3 days ago / 2 weeks ago | Cut | (none) | As line 15. |
| 24 | 8 due | Rewrite | `one: {count} to review` `other: {count} to review` | Same words as the hero. |
| 25 | 10 new | Rewrite | `one: {count} new word` `other: {count} new words` | Complete phrase. |
| 26 | Caught up | Rewrite | `All done` | Literal, not an idiom. |
| 27 | 20% mastered / 8% mastered / 8% mastered | Cut | (none) | Three numbers and three bars that nobody acts on here. |
| 28 | Review (row button) | Keep | `Review` with name `Review {count} words in {course}` | The name starts with the visible label (2.5.3). |
| 29 | Learn (row button) | Keep | `Learn` with name `Learn {count} new words in {course}` | Same. |
| 30 | This week | Keep | `This week` | Clear. |
| 31 | 24 of 50 | Keep | `{done} of {target}` | Keep as one message, not two spans. |
| 32 | Daily goal | Rewrite | `Today's goal` | Says which day the number is about. |
| 33 | 26 more cards to reach today's goal. | Rewrite | `one: {count} to go` `other: {count} to go` | Keeps the subtraction done for the reader (COGA 4.7.5). Drops six words. |
| 34 | S M T W T F S | Rewrite | `Intl` short names: Sun Mon Tue Wed Thu Fri Sat | Two S and two T today. |
| 35 | (hidden) Monday, goal missed | Rewrite | `{day}, no study` | No blame in screen-reader text either. |
| 36 | Streak / 12 days | Rewrite | `one: {count} day studied` `other: {count} days in a row` | Literal. No label needed above it. |
| 37 | Words mastered / 100 | Rewrite | `one: {count} word learned` `other: {count} words learned` | Matches line 18. A number that only grows. |
| 38 | 7 words keep slipping | Rewrite | `one: {count} tricky word` `other: {count} tricky words` | One name for this set. The code already says "tricky" elsewhere. |
| 39 | You've forgotten these a few times. A new mnemonic can help them stick. | Rewrite | `A new memory trick can help.` | "Forgotten" points at the learner. "Mnemonic" and "stick" are jargon and idiom. |
| 40 | aprovechar, ぬ, embarazada, れ, desarrollar | Cut from the dashboard | (shown inside the practice session) | The chips look like buttons and are not. NN/g calls this a false affordance [S11]. |
| 41 | and 2 more | Cut | (none) | Goes with line 40. |
| 42 | (no button today) | Add when it exists | `Practice` with name `Practice {count} tricky words` | A callout with nothing to do is noise. Hide the whole callout until the practice session ships. |
| 43 | Your progress trends | Cut the section | Link: `See your progress` | Progressive disclosure [S15]. The numbers move to a Progress page. |
| 44 | CONSISTENCY 98% +2% from last week | Cut | (none) | The week row and the streak already show consistency. |
| 45 | RETENTION 84% | Rewrite, on the Progress page | `You remembered {percent} of your reviews this month.` | "Retention" is analyst vocabulary. |
| 46 | Global average: 75% | Cut everywhere | (none) | Comparison with strangers (section 9.3, rule 7). |
| 47 | NEW CARDS 142 Added this month | Rewrite, on the Progress page | `one: {count} new word this month` `other: {count} new words this month` | One sentence. "Words", not "cards". |

### 11.3 Word count

| Region | Today (visible) | After |
| --- | --- | --- |
| Greeting | 13 | 3 |
| Language filter | 7 | 2 ("All languages", beside the course list) |
| Hero (Today plus Continue learning) | about 60 | 21 |
| Other courses | about 41 | 22 |
| This week | about 32 | 25 |
| Tricky words | 25 | 0 now, 10 once it has a button |
| Trends | 20 | 3 (one link) |
| **Total** | **about 197** | **76 now, 86 with the tricky-words callout** |

**Target: 90 visible words or fewer on the default state, 25 or fewer in the hero, 14 numbers or fewer.** That is less than half of today's count.

The hero's 21 words: "Spanish Core 1000" (3), "16 words to review" (4), "About 3 minutes" (3), "Start review" (2), "Learn 10 new words" (4), "200 of 1,000 words learned" (5).

### 11.4 Other states

These strings are not on the default page. They follow the same rules.

| Key (file) | Today | New template |
| --- | --- | --- |
| `caughtUp` (TodayPanel) | You're all caught up | `All done for today` |
| `caughtUpDetail` | New reviews show up here as your memory needs them. Check back later today. | `Nothing to review right now. Check back later today.` |
| `caughtUp` (greeting) | Nothing is due right now. Your memory is in good shape. | Cut. The hero says it. |
| `keepGoing` | Want to keep going in {deck}? | `Want to keep going?` |
| `learnMore` | Learn {count} more new words | Keep. |
| `learnMoreCost` | Each new word adds a few short reviews over the coming weeks. | `Each new word means a few short reviews later.` Keep the idea. It states the cost of the action (COGA 4.8.3). |
| `practiceTricky` | Practice {count} tricky words | Keep. |
| `nothingDue` | Nothing to review right now | Keep. |
| `newReady` | {count} new words are ready in {deck}. | `one: {count} new word to learn` `other: {count} new words to learn` (the hero already names the course) |
| `noDecks` | You don't have any decks yet | `You have no courses yet` |
| `noDecksDetail` | Find a deck to start building your vocabulary. | `Pick a course to start learning words.` |
| `browseCommunity` | Browse community decks | `Find a course` |
| `welcome` | Welcome to Memli. Let's find your first deck. | `Welcome to Memli. Let's find your first course.` |
| `startStreak` | About {duration} of review starts a new streak today. | Cut. No streak pressure in the greeting. |
| `goalMet` | Today's goal is done. Extra study still counts. | `You reached today's goal.` |
| `goalCleared` | You finished everything scheduled today, so the goal counts as done. | `You finished everything for today.` |
| `caughtUp` (FocusDeckCard) | Nothing due in this deck. New reviews arrive as you need them. | Cut with the card. |
| `moreDecks` | and {count} more decks | Cut with the chips. |

Sidebar and menu:

| Today | New | Why |
| --- | --- | --- |
| Decks (opens `/dashboard`) | `Home` | The label does not match the page it opens (code audit 8.1). |
| Community Gallery | `Community` | One name for `/community`. I did not open that page, so the owner should confirm the word fits. |
| View Profile | `Profile` | Sentence case, shorter. |
| Learning Settings | `Settings` | Matches the page's own title. |
| Subscription / Plan | `Your plan` | No slash. |
| Sign Out | `Sign out` | Sentence case [S24]. |
| (new) | `Theme` with `Match my device`, `Light`, `Dark` | Section 7. |

### 11.5 i18n notes on the rewrites

- Every count message needs `one` and `other` now, and more forms later. Spanish uses `one`, `many` and `other`. Four messages have only `other` today (code audit 9).
- Keep the number inside the sentence with a rich-text tag. The audit found three sentences split across spans ("24" + "cards ready to review", "24" + "of 50", "5% mastered" + "of 1,000 cards").
- "Words" is not always true. The Japanese course teaches kana, and the French one teaches phrases (code audit 8.3). For now "words" is the plain default. If per-course nouns are added later, add whole messages per noun (`wordsToReview`, `charactersToReview`, `phrasesToReview`). Do not insert a noun into a sentence. Gender and plural agreement will break in Spanish.
- Spanish runs longer: "Start review" becomes something like "Empezar repaso", and "16 words to review" something like "16 palabras para repasar". The primary button must be allowed to wrap to two lines and grow.
- Day names from `Intl` short format vary in length. The week row must wrap or shrink its gaps, not truncate.

---

## 12. (c) Jargon table

| Term today | Where | Problem | Plain replacement |
| --- | --- | --- | --- |
| Deck | Nav, "Other decks", 11 strings (code audit 8.1) | Flashcard-app vocabulary. Crystal: "It may be confusing for some people." The code already says `courseId` and `/study/$courseId`. | **Course.** Confirm with the naming question in section 13. Fallback: "list". |
| Card | "cards ready to review", "of 1,000 cards", "New cards" | A learner is learning words, not cards. Mixed with "words" on the same screen. | **Word** (words). |
| Due | "16 Due", "8 due", "Nothing is due" | Scheduling jargon. Sounds like a bill or homework. | **To review** ("8 to review"). |
| New today / new | "10 New today", "10 new" | Four phrasings for one idea (code audit 8.4). | **New words** ("10 new words"). |
| Mastered | "5% mastered", "Words mastered" | A big claim, undefined, and shown as a small percentage. | **Learned** on the dashboard. **Known well** on the course page. |
| Learning (as a state) | Legend "148 learning" | Easy to confuse with "learned". | **Still learning** (course page only). |
| Not started / unseen | Legend | Fine. | **Not started** (course page only). |
| Retention | Trends | Analyst word. | **Remembered** ("You remembered 84% of your reviews"). |
| Consistency | Trends | Abstract, and a percentage of something unstated. | Cut. The week row shows it. |
| Global average | Trends | Comparison with strangers. | Cut. |
| Streak | This week, greeting | Known to app users. Not certain for a non-technical older learner. | **Days in a row** ("12 days in a row"). |
| Daily goal | This week | Clear, but does not say which day the number is about. | **Today's goal.** |
| Mnemonic | Tricky-words callout, and the product itself | Hard to read and to say. It is also the product's key idea. | **Memory trick** on the dashboard. Where the product teaches the word, pair them once: "a memory trick (a mnemonic)". |
| Keep slipping / tricky words | Callout and caught-up panel | Two names for one set. "Slipping" is an idiom. | **Tricky words.** |
| Caught up | Chips and panel | Idiom. | **All done.** |
| Studying | Filter label | Reads as a status, not a choice. | **Language.** |
| ES, JA, FR, PT | Badges | ISO codes. The full name is hidden in a tooltip. | Keep the badge as decoration. Show the language name in text. |
| S M T W T F S | Week row | Ambiguous letters. | **Sun Mon Tue Wed Thu Fri Sat** from `Intl`. |
| Review / Learn / Practice | Three study modes | Fine as verbs. "Practice" only appears in one state. | Keep all three. Use each for one thing only: Review is words seen before, Learn is new words, Practice is tricky words. |
| Community Gallery / community decks | Nav and empty state | Two names for one page. | **Community** (nav), **Find a course** (button). |
| System (theme option, in code) | Not shown yet | Operating-system jargon. | **Match my device.** |
| Pro | Badge | Fine. A product name. | Keep. |
| FSRS, leech, queue, session, cleared | Docs and code only | Internal. They must not reach the UI. | Never shown. "Session" becomes "review" in learner copy. |

---

## 13. (d) Two tests the owner can run with the same four people

### 13.1 What these tests can and cannot tell you

- A five-second test checks **what people take in at a glance**. Christine Perfetti, who described the method, wrote that it "is best when we use it on pages designed with a single primary purpose" and is not suited to home pages that "serve many different tasks" [S52]. That is a useful standard in itself: the redesigned dashboard should behave like a single-purpose page.
- A first-click test checks **where people go first**. A correct first click goes with about 87% task success, a wrong one with about 46% [S29].
- Four people is a small group. Vendor guides suggest 15 to 20 for numbers you can trust. With four, treat the result as a smoke alarm. One miss is a signal. Two is a problem.
- These four have already seen the five examples, and some will have seen the current page. That makes the redesign easier to pass. To offset it, add two people who have seen nothing, if possible.

### 13.2 Set-up (the same for both tests)

- **Baseline first.** Run both tests on the **current** dashboard before the redesign starts, so there is something to compare with. Use the light and dark screenshots that already exist.
- **Their device, their theme.** Test on the device each person normally uses. Use the theme they prefer: dark for Crystal, Woodson and Karen, and ask Ben. Karen also does the five-second test a second time in light, on a different day, because the light theme has to work for her too.
- **Use a static image for the five-second test.** A full-screen screenshot of the default state at their screen size. No browser bars from another site, no dev tools.
- **Use the real page or a click-through prototype for the first-click test.** Record the screen if they agree.
- **One person at a time.** Do not let them watch each other.
- **Say this before you start, word for word:**

> "I'm testing a design, not you. There are no wrong answers. If something is confusing, that is the design's fault and it is exactly what I need to know."

That line matters. Older users blame themselves for problems 90% of the time [S9].

### 13.3 Five-second test

**Script.**

> "I'm going to show you a screen for five seconds. Don't try to memorize it. Just look at it the way you would look at any page. Then I'll take it away and ask you a few questions."

Show the screenshot. Count five seconds silently. Hide it. Ask the questions in this order. Do not prompt, and do not show the screen again. Write down their exact words.

1. "What is the first thing you remember seeing?"
2. "What do you think this page is for? What does it want you to do?"
3. "Was there a button? What did it say?"
4. "Do you remember any numbers? What were they about?"
5. "Anything else you remember?"
6. "How did the page feel: calm, busy, or in between?"
7. "Was anything hard to read?"

Open questions come first so that later questions do not plant answers.

**Pass criteria (redesign).**

| # | Criterion | Pass |
| --- | --- | --- |
| F1 | Q1: the first thing remembered is the hero (the number of words, the course name, or the main button). | 3 of 4, and Karen is one of them |
| F2 | Q2: the purpose is described as reviewing, studying or practising words. | 4 of 4 |
| F3 | Q3: the button is recalled as "Start review" or a close paraphrase ("start", "review", "begin"). | 3 of 4 |
| F4 | Q4: the hero number is recalled within plus or minus 2, and tied to words to review. | 2 of 4 |
| F5 | Q4: nobody attaches the hero number to something else (the goal, the streak). | 0 of 4 confuse it |
| F6 | Q6: nobody says "busy", "a lot", "crowded" or similar. | 0 of 4 |
| F7 | Q7: nobody reports text that was hard to read. Karen's answer decides this one, in both themes. | 0 of 4 |

**Fail signals.** Any first memory that is the sidebar, the week card, the language filter or a chart. Any answer to Q2 like "it shows my stats".

### 13.4 First-click test

Show the live page or prototype. Read each task aloud. Start a timer when you finish the sentence. Stop it at their first click or tap. Note **where** they clicked and **how long** it took. Do not let them continue into the next screen. Go back to the dashboard for the next task.

The tasks avoid the words on the buttons so that people cannot match text.

| # | Say this | Correct first click | Pass |
| --- | --- | --- | --- |
| T1 | "You have five minutes free. You want to go over the words you have already started. Show me where you would click first." | The primary button ("Start review") | 4 of 4, each within 5 seconds |
| T2 | "Now you would rather pick up some brand new words. Where would you click first?" | "Learn 10 new words" | 3 of 4, within 10 seconds |
| T3 | "You want to work on your Japanese today, not Spanish. Where would you click first?" | The button on the Japanese row, or the language control | 3 of 4, within 10 seconds |
| T4 | "The screen is too bright for you. (If they are in dark: too dark for you.) Change it." | The theme control. On a phone, the account menu counts as a correct first click if the control is inside. | 3 of 4, within 10 seconds. Karen must pass. |
| T5 | "Without clicking anything: how many days in a row have you studied?" | They say the number shown (12 in the default data) | 3 of 4, within 10 seconds |

**Then four short comprehension questions,** with the page still visible:

1. "In your own words, what does this line mean?" (Point at "16 words to review".) Pass: 4 of 4 say something like "words I learned before that I should go over again".
2. "If you press this button, what happens, and how long will it take?" (Point at the primary button.) Pass: 4 of 4 mention reviewing words and give the time shown.
3. "What would you call this?" (Point at "Spanish Core 1000". Do not say "deck" or "course".) Write down the noun they use.
4. "Which word fits best: deck, course, list, or set?" Write down their pick.

Questions 3 and 4 settle Crystal's concern about "deck" with evidence. If three of four say "course" or choose it, use "course". If answers scatter, use the most common free answer from question 3.

**Overall pass.** T1 is 4 of 4. No more than one other task fails. Comprehension questions 1 and 2 are both 4 of 4.

### 13.5 Recording sheet

Copy one per person, per version (current, redesign).

| Field | Notes |
| --- | --- |
| Person, date, device, screen size, theme | |
| Version tested | current / redesign |
| Five-second Q1 to Q7 | exact words |
| T1 first click and seconds | |
| T2 first click and seconds | |
| T3 first click and seconds | |
| T4 first click and seconds | |
| T5 answer and seconds | |
| Comprehension 1 to 4 | exact words |
| Anything they said unprompted | |

### 13.6 Two quick self-checks before asking anyone

1. **Grayscale check.** Take a screenshot in each theme and remove the color. If the hero is not still the first thing you see, the hierarchy depends on hue alone (1.4.1, and the von Restorff advice not to rely "exclusively on color" [S22]).
2. **Blur check.** Blur the same screenshot until the text is unreadable. One shape should stand out: the hero with its button. This is a common designer's habit. I have no formal source for it.

---

## 14. Could not verify

- **WCAG wording.** I opened the W3C Understanding pages for 1.4.10, 1.4.11, 1.4.12, 1.4.13, 2.1.4, 2.3.3, 2.4.11, 2.5.3, 2.5.8 and 4.1.3. The other rows in section 3 are summaries from my knowledge of WCAG 2.2 and are not quoted.
- **GOV.UK reading age of 9.** The guidance has moved to `guidance.publishing.service.gov.uk`. The "clear language" page I opened does not state a reading age. The "age 9" figure comes from a 2022 archived copy and from council style guides, found through search. A 2025 Department for Education post says its own standard removed reading age.
- **NN/g 2013 numbers.** Taken from the 2013 article, which NN/g marks as superseded by the 2019 one. The 2019 article does not repeat them. Wayback Machine pages could not be fetched from this environment.
- **Bailey and Wolfson 2009 (first click).** Reported by MeasuringU and others. I could not open the original paper.
- **Iyengar and Lepper 2000 (jam study).** I confirmed the citation and the 6 against 24 design. I could not confirm the purchase percentages, so I did not use them.
- **Lally et al. 2010.** Confirmed through secondary reports. The UCL news page returned HTTP 403.
- **Silverman and Barasch 2023.** Abstract only.
- **Sharif and Shu 2017.** Search summaries and a UCLA write-up only.
- **Almeida et al. 2023.** Abstract only.
- **Material Design quote.** Seen in a search result snippet, not on the page itself.
- **Refactoring UI.** Section names are cited from memory. I did not have the book open and give no page numbers.
- **Legge et al. 1985 and Piepenbrock et al. 2013.** Cited as NN/g reports them. I did not read the papers. NN/g notes Legge used CRT screens, which may have biased the result toward dark mode.
- **Streak anxiety.** I found no peer-reviewed study that measures it in language apps.
- **Dark theme, forced colors, `prefers-contrast`.** Not tested in a browser. I did not toggle the theme, because that writes to `localStorage` on a shared dev server. Dark-mode numbers come from the code audit.
- **Screen readers and axe.** Not run. Statements about announcements are based on standard behaviour.
- **Focus ring contrast.** `:focus-visible` cannot be triggered from script, so I rely on the code audit's "about 2.4:1".
- **Desktop tab order.** I measured the phone layout (the browser pane was 628 px wide). The count for desktop would add the two sidebar links and comes from the code audit's sidebar inventory.
- **Time estimate for 16 cards.** "About 3 minutes" is a stand-in. I did not run `estimateMinutes`.
- **How GitHub builds its contribution graph for assistive technology.** Not checked.
- **`/community`.** Not opened. The suggested nav label "Community" should be checked against what that page contains.
- **APCA thresholds.** Quoted from the APCA documentation page I opened [S31]. The color research file should own the final targets.

---

## 15. Sources

W3C

- [S1] WCAG 2.2 Recommendation. https://www.w3.org/TR/WCAG22/
- [S2] Making Content Usable for People with Cognitive and Learning Disabilities (COGA), W3C Working Group Note. https://www.w3.org/TR/coga-usable/
- [S4] Accessibility Requirements for People with Low Vision. https://www.w3.org/TR/low-vision-needs/
- [S5] Older Users and Web Accessibility. https://www.w3.org/WAI/older-users/
- [S20] Understanding SC 1.4.11 Non-text Contrast. https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html
- [S23] Understanding SC 2.1.4 Character Key Shortcuts. https://www.w3.org/WAI/WCAG22/Understanding/character-key-shortcuts.html
- [S32] Understanding SC 2.5.8 Target Size (Minimum). https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html
- [S33] Understanding SC 1.4.10 Reflow. https://www.w3.org/WAI/WCAG22/Understanding/reflow.html
- [S34] Understanding SC 1.4.12 Text Spacing. https://www.w3.org/WAI/WCAG22/Understanding/text-spacing.html
- [S35] Understanding SC 1.4.13 Content on Hover or Focus. https://www.w3.org/WAI/WCAG22/Understanding/content-on-hover-or-focus.html
- [S36] Understanding SC 2.4.11 Focus Not Obscured (Minimum). https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html
- [S37] Understanding SC 2.5.3 Label in Name. https://www.w3.org/WAI/WCAG22/Understanding/label-in-name.html
- [S38] Understanding SC 2.3.3 Animation from Interactions. https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html
- [S39] Understanding SC 4.1.3 Status Messages. https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html
- [S40] ARIA Authoring Practices Guide, Radio Group pattern. https://www.w3.org/WAI/ARIA/apg/patterns/radio/ (not opened in this session; cited for the standard keyboard behaviour)
- [S46] WAI Images Tutorial, Complex Images. https://www.w3.org/WAI/tutorials/images/complex/
- [S47] ARIA Authoring Practices Guide, Meter pattern. https://www.w3.org/WAI/ARIA/apg/patterns/meter/

Plain language

- [S6] GOV.UK, Writing to GOV.UK standards, Clear language. https://guidance.publishing.service.gov.uk/writing-to-gov-uk-standards/writing-guidelines/clear-language/ (the older address https://www.gov.uk/guidance/content-design/writing-for-gov-uk now redirects)
- [S7] digital.gov, Plain language guide (successor to plainlanguage.gov). https://digital.gov/guides/plain-language with sub-pages https://digital.gov/guides/plain-language/principles , https://digital.gov/guides/plain-language/principles/avoid-jargon , https://digital.gov/guides/plain-language/principles/short-simple , https://digital.gov/guides/plain-language/writing , https://digital.gov/guides/plain-language/writing/clear-short
- [S24] GOV.UK Design System, Button. https://design-system.service.gov.uk/components/button/

Nielsen Norman Group

- [S8] Lexie Kane, "Usability for Older Adults: Challenges and Changes", 8 September 2019. https://www.nngroup.com/articles/usability-for-senior-citizens/
- [S9] Jakob Nielsen, "Usability for Senior Citizens: Improved, But Still Lacking", 28 May 2013. https://www.nngroup.com/articles/usability-seniors-improvements/
- [S10] Raluca Budiu, "Dark Mode vs. Light Mode: Which Is Better?", 2 February 2020. https://www.nngroup.com/articles/dark-mode/
- [S11] Katie Sherwin, "Low-Contrast Text Is Not the Answer", 7 June 2015. https://www.nngroup.com/articles/low-contrast/
- [S12] Aurora Harley, "Touch Targets on Touchscreens", 5 May 2019. https://www.nngroup.com/articles/touch-target-size/
- [S13] Kara Pernice, "F-Shaped Pattern of Reading on the Web: Misunderstood, But Still Relevant (Even on Mobile)", 12 November 2017. https://www.nngroup.com/articles/f-shaped-pattern-reading-web-content/
- [S14] Kara Pernice, "The Layer-Cake Pattern of Scanning Content on the Web", 4 August 2019. https://www.nngroup.com/articles/layer-cake-pattern-scanning/
- [S15] Jakob Nielsen, "Progressive Disclosure", 3 December 2006. https://www.nngroup.com/articles/progressive-disclosure/
- [S16] Page Laubheimer, "Dashboards: Making Charts and Graphs Easier to Understand", 18 June 2017. https://www.nngroup.com/articles/dashboards-preattentive/
- [S19] Hoa Loranger, "Simplicity Wins over Abundance of Choice", 22 November 2015. https://www.nngroup.com/articles/simplicity-vs-choice/
- [S21] Kelley Gordon, "Visual Hierarchy in UX: Definition", 17 January 2021. https://www.nngroup.com/articles/visual-hierarchy-ux-definition/
- [S27] Kara Pernice, "Banner Blindness Revisited: Users Dodge Ads on Mobile and Desktop", 22 April 2018. https://www.nngroup.com/articles/banner-blindness-old-and-new-findings/

Laws of UX and design systems

- [S17] Hick's Law. https://lawsofux.com/hicks-law/
- [S18] Choice Overload. https://lawsofux.com/choice-overload/
- [S22] Von Restorff Effect. https://lawsofux.com/von-restorff-effect/
- [S25] Material Design 2, Buttons, "Hierarchy and placement". https://material.io/go/design-buttons (quote seen in a search snippet only)

Testing methods

- [S29] Jeff Sauro, MeasuringU, first-click testing, 19 October 2011. https://measuringu.com/first-click/ (reports the 87% and 46% figures and links to Bailey and Wolfson, "FirstClick Usability Testing", 2009, webusability.com, which I could not open)
- [S52] Christine Perfetti, "5-Second Tests: Measuring Your Site's Content Pages", 11 September 2007. https://articles.centercentre.com/five_second_test/

Theme, contrast modes and color

- [S31] APCA in a Nutshell (use-case ranges Lc 90, 75, 60, 45, 30, 15). https://git.apcacontrast.com/documentation/APCA_in_a_Nutshell
- [S41] Adam Argyle, "Building a theme switch component", web.dev. https://web.dev/articles/building/a-theme-switch-component
- [S42] web.dev, "Improved dark mode default styling with the color-scheme CSS property and the corresponding meta tag". https://web.dev/articles/color-scheme
- [S43] MDN, `prefers-contrast`. https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-contrast
- [S44] MDN, `forced-colors`. https://developer.mozilla.org/en-US/docs/Web/CSS/@media/forced-colors
- [S45] Microsoft Edge Blog, "Styling for Windows high contrast with new standards for forced colors", 17 September 2020. https://blogs.windows.com/msedgedev/2020/09/17/styling-for-windows-high-contrast-with-new-standards-for-forced-colors/

Streaks, habits and motivation

- [S26] Jackie Silverman and Alixandra Barasch, "On or Off Track: How (Broken) Streaks Affect Consumer Decisions", Journal of Consumer Research 49(6), 2023, 1095 to 1117. Abstract: https://www.colorado.edu/business/faculty-research/2023/04/19/or-track-how-broken-streaks-affect-consumer-decisions and https://academic.oup.com/jcr/article-abstract/49/6/1095/6623414
- [S28] Phillippa Lally, Cornelia van Jaarsveld, Henry Potts and Jane Wardle, "How are habits formed: Modelling habit formation in the real world", European Journal of Social Psychology, 2010. DOI 10.1002/ejsp.674. Read through secondary reports, for example https://bps.org.uk/research-digest/how-form-habit
- [S30] Marissa Sharif and Suzanne Shu, "The Benefits of Emergency Reserves: Greater Preference and Persistence for Goals That Have Slack with a Cost", Journal of Marketing Research 54(3), 2017, 495 to 509. Summary: https://anderson-review.ucla.edu/emergency-reserves/
- [S48] Osman Mansur, "The habit-building research behind your Duolingo streak", Duolingo Blog, 31 January 2022. https://blog.duolingo.com/how-duolingo-streak-builds-habit
- [S49] Almeida et al., "Negative Effects of Gamification in Education Software: Systematic Mapping and Practitioner Perceptions", 2023. https://arxiv.org/abs/2305.08346
- [S50] Center for Self-Determination Theory, "Theory". https://selfdeterminationtheory.org/theory/
- [S51] Rebekah Bek, "Streaks are about losing: a study of 859 streak designs", Mobbin (design blog, undated). https://mobbin.com/blog/streaks-are-about-losing-a-study-of-859-streak-designs

Project files

- `docs/designs/dashboards/PLAN.md` (sections 3, 5, 6, 7)
- `docs/designs/dashboards/README.md`
- `dev/memli/docs/product-ux.md` (Parked ideas; Accessibility and inclusion baseline)
- `dev/memli/docs/i18n.md` (section 3, sentence templates and the lint rule)
- `scratch/research/code-audit.md` (measurements reused here, each marked "code audit")
- Annotated feedback screenshot: `feedback-screenshots/1.png`
- Current-page screenshots listed in the task brief (light top, light scrolled, dark top opened)

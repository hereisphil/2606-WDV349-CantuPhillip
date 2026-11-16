# Mobile and i18n research for the dashboard redesign

> **Correction.** The brief given to the researchers wrongly described one respondent as older and as having weak eyesight. That remark in the chat was the owner's, about himself. Statements in this file that relied on it have been corrected. See `feedback-examples.md`, section 2.

Scope: evidence for the `/dashboard` redesign plan. Research only. Nothing in the repository was edited.

Paths below are relative to `dev/memli/` unless they start with `docs/designs`.

How to read the source tags: `[M3]` and `[I2]` point to the Sources list at the end. `file:line` points to the code as it is on `dev` today.

---

## 0. The ten findings that matter most

1. **On a real small phone the main button is probably below the fold.** At 375 x 667 the "Start review" button sits at y = 581 to 625 (measured). Safari's toolbars leave roughly 550 px of visible height on that device (secondary sources, not measured on a device). At 320 x 568 it sits at y = 672. In landscape 667 x 375 it sits at y = 479. See section 2.
2. **Text expansion pushes it further down.** With pseudo-localized text (longer strings, accents) the same button moved from y = 581 to y = 851 at 375 px wide. Nothing overflowed sideways, but the page grew 27% taller. See section 2.3.
3. **The language filter is the biggest space thief above the button.** It takes 80 px with 4 languages and 212 px with 12 languages, all above the Today panel (measured). See section 2.2.
4. **Buttons cannot wrap.** The shared `Button` has `whitespace-nowrap` (`packages/ui/src/components/button.tsx:8`). A real Spanish label, "Aprender 10 palabras nuevas más", overflowed its button at 320 px (scroll width 240 px in a 222 px box, measured).
5. **Two navigation links are hidden behind a hamburger on phones** (`AppSidebar.tsx:177-204`). NN/g says to show links when there are four or fewer [M3]. A 3-item bottom bar is the option that also survives Spanish and Portuguese label lengths (measured in section 4.5).
6. **There is no way to change the theme on a phone.** The only control is the `d` key (`apps/web/src/components/theme-provider.tsx:131-163`). That shortcut also fails WCAG 2.1.4 (Level A) because it is a single letter that cannot be turned off or remapped [W8].
7. **"Big number plus short label" is good for i18n only if the number and label come from one message.** Today the number and the words are two separate fragments (`TodayPanel.tsx:101-108`). The project already has the fix: `rich()` in `apps/web/src/lib/formatters.ts:153-182`. See section 7.
8. **A big numeral must stand alone.** "32 words" at 60 px bold is 272 px wide. "32 palabras" is 345 px. The space inside the hero card on a 375 px phone is about 287 px (measured widths, section 7.4). So the style in `example-05` breaks in Spanish and Portuguese. The numeral alone ("24" is 77 px, "12,480" is 204 px) is safe.
9. **Spanish, Portuguese and French have three plural categories in current CLDR, not two.** `one`, `many`, `other`. Portuguese and French also put 0 in `one`. Confirmed by the CLDR chart [I2] and by running `Intl.PluralRules` in the dev browser. See section 5.3.
10. **`safe-area-inset-*` values will not work for a bottom bar until the viewport meta tag opts in.** `apps/web/index.html:6` has no `viewport-fit=cover`, no `color-scheme` meta and no `theme-color` meta. The theme class is also applied after React mounts (`theme-provider.tsx:112`), so dark-mode users on slow phones can see a light flash first.

---

## 1. What I did and what I could not do

| Step | How |
| --- | --- |
| Read project docs | `docs/mobile.md`, `docs/i18n.md`, `docs/product-ux.md`, `docs/designs/dashboards/PLAN.md` (all sections, with focus on 5 and 6) |
| Read the code | `apps/web/src/routes/_app.tsx`, `_app/dashboard.tsx`, every file in `_app/-components/`, `apps/web/src/lib/formatters.ts`, `apps/web/src/lib/dates.ts`, `apps/web/src/components/theme-provider.tsx`, `apps/web/index.html`, `packages/ui/src/styles/globals.css`, `packages/ui/src/components/button.tsx` |
| Measured the live page | Dev server at `localhost:5173/dashboard`, emulated viewports 375 x 667, 390 x 844, 320 x 568, 667 x 375, in the app's built-in browser pane (Chrome 156 engine). Positions come from `getBoundingClientRect()`. |
| Pseudo-localization trial | Replaced the text nodes inside `<main>` in the running page with longer, accented strings. This is a DOM-level simulation, not a real catalog. |
| RTL trial | Set `dir="rtl"` on `<html>` in the running page and looked at the result. |
| `Intl` probe | Ran `Intl.PluralRules`, `NumberFormat`, `RelativeTimeFormat`, `DateTimeFormat`, `DisplayNames`, `ListFormat`, `DurationFormat` and `Intl.Locale#getWeekInfo` for `en`, `es-419`, `es-MX`, `es`, `pt-BR`, `fr`, `de`, `ja`, `ru`, `pl`, `ar` in the same browser. |
| Text width probe | `canvas.measureText` with the loaded Inter Variable font, for English, Spanish and Portuguese candidate strings. |
| Web research | Fetched the pages in the Sources list. |

Limits. No real phone was used. Safari on iOS, safe-area insets, toolbar collapse and the on-screen keyboard were not observed. The Spanish and Portuguese strings are my drafts to size the layout. They are not reviewed translations. Section 11 lists everything I could not verify.

---

## 2. The current dashboard on small screens (measured)

### 2.1 Where things land

All numbers are CSS pixels from the top of the document, default preview data.

| Viewport | Top bar height | Greeting `h1` top | "Today" heading top | "Start review" top to bottom | Fits the emulated first screen? | Document height | Horizontal scroll |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 375 x 667 | 69 | 101 | 358 | 581 to 625 | Yes, by 42 px | 2,658 (about 4 screens) | None |
| 390 x 844 | 69 | 101 | 358 | 581 to 625 | Yes | 2,658 | None |
| 320 x 568 | 69 | 101 | 402 | 672 to 716 | **No** | 2,929 | None |
| 667 x 375 (landscape) | 69 | 101 | 291 | 479 to 523 | **No** | 2,050 | None |

What this means:

- The emulated 667 px height is the whole screen. A browser never gives a page the whole screen. Secondary sources put Safari's visible height on a 375 x 667 iPhone at about 547 to 559 px when its toolbars show, and about 663 to 664 px on a 390 x 844 iPhone (search results from device-size reference sites; I could not confirm on a device). If those figures are right, "Start review" (bottom edge at 625) is **cut off on the 375 x 667 phone** and fits on the 390 x 844 phone with about 40 px to spare.
- The owner's standing rule is to check what fits above the fold at 375 to 422 px. Today the first screen at 375 px shows: logo bar, greeting, a two-line status sentence, two rows of language chips, the "TODAY" label, the number, "About 4 minutes", two deck chips. The button is the tenth thing down.
- In landscape the first screen shows the greeting, the chips and the word "TODAY". Nothing else.
- Reflow is fine. There is no sideways scrolling at 320 px. That matches the claim in `docs/designs/dashboards/PLAN.md:141` and satisfies WCAG 1.4.10 [W4].

### 2.2 The language filter

`LanguageFilter` sits above the Today panel (`dashboard.tsx:133-135`). It wraps its chips (`LanguageFilter.tsx:34`).

| Preview | Chips | Filter block height at 375 px | "Start review" top |
| --- | --- | --- | --- |
| default (4 languages) | 5 | 80 | 581 |
| many-decks (12 languages) | 13 | 212 | 947 (with the DEV preview bar open, which adds about 204 px) |

The chips are 36 px tall (`h-9`, `LanguageFilter.tsx:12`). That passes the 24 px minimum [W1] and misses the 44 px enhanced size. The chip has a fixed height and also `wrap-break-word`. If a long language name ever wraps inside a chip, the fixed height will clip or overflow it. Use `min-h-*` instead of `h-*` on anything that holds translated text.

### 2.3 Pseudo-localization trial

I replaced every text node in `<main>` (except nodes inside a `lang` attribute) with an accented, padded copy. Padding followed the idea in the W3C article that short strings grow most [I1]: about +100% for strings up to 10 characters, +60% up to 20, +40% beyond.

| Check at 375 x 667 | English | Pseudo-localized |
| --- | --- | --- |
| Document width | 375 | 375 (no sideways scroll) |
| Document height | 2,658 | 3,384 (+27%) |
| "Start review" top | 581 | 851 |
| Language filter | 2 rows | 4 rows (one chip per row for the long ones) |
| Row buttons "Review" / "Learn" | 74 / 64 px wide | 138 / 119 px wide, still inside the row |

So the layout bends without breaking. That is the good news, and it is the result of the choices in `PLAN.md` section 6. The bad news is that every extra line of text above the button pushes the main action further off the first screen. Cutting copy helps English a little. It helps Spanish and Portuguese a lot.

A targeted test with real Spanish at 320 px (caught-up preview):

| Button | English | Spanish draft | Result |
| --- | --- | --- | --- |
| Keep-going 1 | Learn 10 more new words | Aprender 10 palabras nuevas más | **Overflows.** Scroll width 240 px, box 222 px, `white-space: nowrap`. |
| Keep-going 2 | Practice 4 tricky words | Practicar 4 palabras difíciles | Fits with 0 px to spare. |

### 2.4 RTL trial

With `dir="rtl"` on `<html>`:

- The whole layout mirrored. Logo moved right, menu left, badges and progress bars started from the right. No sideways scroll.
- The dashboard components already use logical classes (`ps-11`, `me-1`). Physical leftovers are in shared pieces: `md:border-r` and `text-left` in `AppSidebar.tsx:139` and `:216`; `ml-auto`, `pr-8 pl-1.5`, `right-2` in `packages/ui/src/components/dropdown-menu.tsx:131,174,181,217,223,256`; `right-0` in `packages/ui/src/components/avatar.tsx:69`; `pr-2` / `pl-2` icon paddings in `button.tsx:25-29`.
- English text inside an RTL page showed the classic bidi scramble: "from Spanish Core 1000 16", ".day streak", "2%+". That is expected for untranslated English. It is also a preview of a real bug: a deck title or username written in one direction, dropped into a sentence written in the other. See rule R12 in section 6.
- The `TrendingUp` icon did not flip. It points up and to the right, which reads as "back" in RTL.

### 2.5 Touch targets today

| Control | Size | 24 px minimum [W1] | 44 px (Apple default [M6], WCAG enhanced) | 48 dp (Android [M7]) |
| --- | --- | --- | --- | --- |
| Account avatar button (phone) | 44 x 44 | Pass | Pass | Miss by 4 |
| Hamburger button | 32 x 32 (`size="icon"`) | Pass | **Miss** | Miss |
| Language chips | 36 tall | Pass | Miss | Miss |
| Start review, Learn N new words | 44 tall, full width on phones | Pass | Pass | Miss by 4 |
| Row "Review" / "Learn" | 36 tall (`size="lg"` is `h-9`) | Pass | Miss | Miss |

`docs/product-ux.md:175` sets 24 px as the project floor and says not to chase 44 px "unless a control is touch-critical". On the dashboard, the touch-critical controls are the main action, the navigation, and the row actions. I recommend 48 px for those on coarse pointers. Reasons are in section 3.3.

---

## 3. Mobile research

### 3.1 How people hold phones, and what the "thumb zone" really says

- Hoober watched 1,333 people using phones in public. Of the 780 who were touching the screen: 49% used one hand, 36% cradled the phone in one hand and touched with the other, 15% used two hands. People "change the way they're holding their phone very often" [M1].
- The famous green, yellow and red thumb-reach drawings come from that article. In a 2017 comment on the same page the author asks readers to ignore them and says "People touch the center of the screen" [M1].
- His follow-up says people "prefer to view and touch the center of the screen", calls the thumb-sweep chart "well-known, but incorrect", and gives sizes by position: targets in the center can be as small as 7 mm, targets in the corners need about 12 mm. He recommends primary content in the center, secondary actions and tabs along the top and bottom edges, and tertiary functions in menus opened from a corner [M2].

What to take from this for the dashboard:

1. Put the Today number and the main button in the vertical middle of the first screen, not at the very top and not glued to the bottom.
2. Navigation belongs on an edge. Top or bottom both match the research. Bottom is closer to a resting thumb for the 49% who use one hand.
3. Edge and corner controls need to be bigger than center controls, because accuracy drops there. That argues for 48 px nav items and a 48 px account button.
4. Do not justify a design with a red and green thumb map. Its own author has withdrawn it.

### 3.2 Bottom navigation or a hamburger

- NN/g tested 179 people on 6 sites. On phones, hidden navigation was used in 57% of cases and combo navigation (some links visible) in 86%. Hidden navigation made phone tasks 15% slower and cut content discoverability by more than 20%. Their rule: "If your site has 4 or fewer top-level navigation links, display them as visible links" [M3]. The study did not test visible-only navigation on phones.
- Android's guidance: "The navigation bar can hold three to five navigation destinations", it "translates to the navigation rail for large screens", and a drawer is "not as ideal" on compact sizes "because users must reach for the top bar" [M4]. It also says not to use a bottom bar on large screens [M4]. I could not load the Material 3 page itself (it needs JavaScript).
- Apple: "Use a tab bar to support navigation, not to provide actions." Keep it visible across sections. "Include tab labels" and "Use single words whenever possible" [M5].
- NN/g on icons: only a few icons are universal, "a text label must be present alongside an icon", and labels "should be visible at all times" [M9].

The app has two destinations today, both hidden in the phone menu: "Decks" (which links to `/dashboard`) and "Community Gallery" (`AppSidebar.tsx:48-61`). The account menu holds Profile, Learning Settings, Subscription / Plan and Sign Out (`AppSidebar.tsx:103-129`). That is three top-level places. By the NN/g rule they should be visible.

### 3.3 Touch target sizes

| Source | Size | Notes |
| --- | --- | --- |
| WCAG 2.2 SC 2.5.8 (AA) | 24 x 24 CSS px | Exceptions: spacing (a 24 px circle on each small target must not touch another target), inline links in a sentence, an equivalent control elsewhere, browser-default controls, essential presentation [W1] |
| WCAG 2.2 SC 2.5.5 (AAA) | 44 x 44 CSS px | Named in the 2.5.8 Understanding page as the size for important controls [W1]. I did not fetch the 2.5.5 page separately. |
| Apple HIG | 44 x 44 pt default, 28 x 28 pt minimum on iOS | Also: about 12 pt of padding around bezeled controls, about 24 pt around controls without a bezel [M6] |
| Android | 48 x 48 dp, 8 dp apart | "results in a physical size of about 9mm" [M7] |
| Hoober | 7 mm center, 12 mm corners | Physical sizes; he argues pixel rules are a rough stand-in [M2] |

Recommendation for this dashboard:

- Main action: at least 48 px tall on phones (56 px looks right for a hero button and matches the "strong solid primary button" taste).
- Bottom bar items and the account button: at least 48 x 48.
- Row actions in the deck list: 44 px tall on coarse pointers. Tailwind has `pointer-coarse:` for exactly this [M12], so desktop rows can stay compact.
- Keep at least 8 px between neighbors.
- Zoom does not help a small target pass. The rule is measured in CSS pixels [W1].

### 3.4 Safe areas and viewport units

- `env(safe-area-inset-bottom)` gives the distance that keeps content clear of a notch or home indicator. MDN's own example is a sticky footer with `padding-bottom: calc(1em + env(safe-area-inset-bottom))` [M8].
- On iOS these insets only become non-zero when the page opts in with `viewport-fit=cover` in the viewport meta tag. The MDN page I fetched did not state this; it is from my own knowledge of WebKit's documentation and should be checked on a device. `apps/web/index.html:6` does not have it.
- `100vh` on phones is "too tall on load" because it ignores the browser's toolbars. `svh` is the viewport with toolbars showing, `lvh` with toolbars hidden, `dvh` follows the current state. `dvh` updates are throttled, not smooth. The on-screen keyboard "is not considered part of the UA UI", so none of these units shrink when it opens. Supported in Chrome 108, Firefox 101, Safari 15.4 [M10].
- The app shell already uses `min-h-dvh` and `md:h-dvh` (`_app.tsx:11`, `AppSidebar.tsx:139`). Good. For a "fits the first screen" promise, size against `svh`, because that is what the learner sees on arrival.
- Keyboard: since Chrome 108 on Android, and always on iOS Safari, the keyboard resizes only the visual viewport. `position: fixed` elements "remain in place and can be obscured" by the keyboard [M11]. The dashboard has no text inputs, so a bottom bar is safe here. The study screen (`/study/$courseId`) has a typed-answer form, so a bottom bar must not appear there.

### 3.5 Sticky bars and their risks

A sticky "Start review" bar is tempting. I recommend against it on the dashboard. A sticky bottom **navigation** bar is fine with guards.

| Risk | Evidence | Mitigation |
| --- | --- | --- |
| Hides the focused control from keyboard users | WCAG 2.4.11 (AA): a focused component must not be "entirely hidden due to author-created content". Sticky footers and headers are named as the usual cause. Technique C43 uses `scroll-padding` [W3]. | `scroll-padding-bottom` on the scroller equal to the bar height plus the safe-area inset |
| Eats a small or zoomed viewport | At 400% zoom a 1280 x 1024 window becomes 320 x 256 CSS px [W4]. A 56 px bar is 22% of that. Two bars are 44%. | Only stick when the viewport is tall enough (for example `min-height: 30rem`). Below that, the bar scrolls with the page. |
| Covered by the keyboard | Fixed elements can be obscured by the on-screen keyboard [M11] | No bottom bar on screens with text inputs |
| Fights the home indicator | Needs the safe-area inset [M8] | `padding-bottom: env(safe-area-inset-bottom)` plus `viewport-fit=cover` |
| Layout jump while toolbars collapse | `dvh` updates are throttled [M10] | Use `position: sticky` or `fixed` with `bottom: 0`. Do not compute heights from `dvh`. |
| Two things competing for the eye | The owner's problem 4 | One sticky element at most. The main action lives in the page, in the hero. |

Why no sticky main button: if the hero is designed to the budget in section 4.2, the button is already on the first screen. Once the learner scrolls, they are reading secondary content by choice. The DEV-only "Previews" and "TanStack Router" pills already show what a floating bottom layer does to this page: they cover the "Learn 10 new words" button in the 375 px screenshot.

### 3.6 Container queries and breakpoints in Tailwind v4

- Breakpoints are mobile-first: `sm` 40rem, `md` 48rem, `lg` 64rem, `xl` 80rem, `2xl` 96rem. "Unprefixed utilities take effect on all screen sizes" [M12a].
- Container queries are built in: mark a parent `@container`, then use `@sm:` (24rem), `@md:` (28rem), `@lg:` (32rem), `@xl:` (36rem), `@2xl:` (42rem) and so on. They are also mobile-first. There are `@max-*` variants, named containers (`@container/main`, `@sm/main:`), and arbitrary sizes (`@min-[475px]:`) [M12a].
- The code already does this well: `DeckList.tsx:151-156` switches its row layout on the list's own width, and `ThisWeek.tsx:176-177` does the same for the card.

Rule of thumb for the redesign:

| Decide with | For | Why |
| --- | --- | --- |
| Viewport breakpoints (`md:`, `xl:`) | Page skeleton: sidebar or bottom bar, one or two columns | These depend on the device, not on a component |
| Container queries (`@md:`) | Everything inside a card: hero row vs stack, deck row columns, stat tiles in 1, 2 or 3 columns | The same card lives in a 327 px phone column, a 512 px tablet column and an 880 px desktop column. The 16rem sidebar makes viewport width a poor guess at card width. `PLAN.md:40` already hit this. |
| Media features (`pointer-coarse:`, `landscape:`, a custom `min-height` variant) | Target sizes, kbd hints, sticky behavior | These are about the input device and the viewport height, not the width |

### 3.7 Fluid type with `clamp()`

- Text sized from viewport width can stop growing when a person zooms, which risks WCAG 1.4.4 (text must resize to 200% [W5]). Adrian Roselli's advice: be careful with `vw`, be more careful with `clamp()`, and "never set the maximum font size to a value below twice the base font size". His simplest answer is not to set a maximum at all [M13].
- WCAG lists F94, "incorrect use of viewport units to resize text", as a failure of 1.4.4 [W5].

For the hero numeral: use stepped `rem` sizes switched by container width (for example `text-5xl @sm:text-6xl @lg:text-7xl`). It is simpler than `clamp()`, it always scales with zoom, and it reacts to the card's width instead of the window's. If `clamp()` is used anyway, both ends must be in `rem` and the preferred value must include a `rem` term.

### 3.8 Above the fold, reflow, zoom

- WCAG 1.4.10 Reflow (AA): no two-direction scrolling at a width of 320 CSS px, which equals a 1280 px window at 400% zoom [W4]. The page passes today.
- WCAG 1.4.4 Resize Text (AA): 200% without loss of content. Failure F69 is text that is "clipped, truncated or obscured" when resized [W5]. The risk in this codebase is every fixed height that holds text: `h-11` buttons with `whitespace-nowrap`, `h-9` chips, `h-8` and `h-10` language badges, the 96 px goal ring with text inside it (`ThisWeek.tsx:65,87-94`).
- WCAG 1.4.12 Text Spacing (AA): no loss when line height is 1.5, letter spacing 0.12em, word spacing 0.16em [W10]. Same fixed-height risk.
- "Above the fold" is not a WCAG idea. It is a usability goal: the first screen should answer "what do I do now". At 400% zoom the first screen is 320 x 256. Nothing meaningful fits. The goal there is correct order, so that the number and the button are the first things a person reaches by scrolling or tabbing.

Above-the-fold targets for the redesign:

| Viewport | Likely visible height | Must be fully visible |
| --- | --- | --- |
| 375 x 667 | about 550 (unverified) | Top bar, greeting, hero numeral and label, main button |
| 390 x 844 | about 664 (unverified) | The above, plus the secondary action and the week strip |
| 320 x 568 | about 450 (my estimate) | Top bar, greeting, hero numeral and label, main button |
| 667 x 375 landscape | about 320 (my estimate) | Hero numeral and main button side by side |

### 3.9 Landscape phones and tablets

- WCAG 1.3.4 Orientation (AA): content must not be locked to portrait or landscape. People with a phone mounted on a wheelchair cannot rotate it [W6].
- At 667 px wide the page is below `md`, so it uses the phone layout in a 375 px tall window. At 844 px wide (a 390 x 844 phone turned sideways) it is above `md`, so it gets the 16rem desktop sidebar and a 588 px main column, in a window about 340 px tall.
- At 768 x 1024 (tablet portrait) the main column is 512 px. That is narrower than a phone in landscape. The two-column split waits for `xl` (`dashboard.tsx:131`), so tablets get one long column.

Recommendations:

1. Let the hero switch to a row (number and label on one side, buttons on the other) when its own width passes about 28rem. A container query does this for landscape phones, tablets and desktop in one rule.
2. Between `md` and `xl`, shrink the sidebar to an icon-plus-label rail of about 80 px. Android's guidance says a rail suits medium sizes [M4]. That gives a 768 px tablet a 688 px main column.
3. Never use a bottom bar on large screens [M4].
4. Tablets with a keyboard report a coarse primary pointer and a fine secondary one. `any-pointer-fine:` detects that [M12]. Use it for keyboard hints, not `md:`.

### 3.10 Hover-only affordances on touch

- In Tailwind v4, `hover:` compiles to `@media (hover: hover) { &:hover }` [M12]. So hover styles do not stick after a tap on a phone. Good.
- WCAG 1.4.13 covers content that appears on hover or focus: it must be dismissible, hoverable and persistent [W7].
- `LanguageBadge.tsx:27-34` shows "ES" and puts the real name ("Spanish") in a `title` attribute and in screen-reader-only text. A `title` tooltip never appears on touch. So a sighted phone user sees only "ES", "JA", "ZH", "DE". Those codes are ISO jargon. "JA" is not what most people expect for Japanese, and "ZH" means nothing to a non-technical learner. Show the language name as visible text at least once per deck.
- The owner's rule "kbd hints only on hover or focus" works well with this: gate hints with `any-pointer-fine:` so touch-only devices never render them.
- In the emulated phone viewport the browser reported `(hover: hover)` false, `(pointer: coarse)` true, `(any-pointer: coarse)` true. So these variants can be tested in the dev browser.

### 3.11 Performance on mid-range Android

Google's "good" thresholds, measured at the 75th percentile of page loads: LCP within 2.5 s, INP 200 ms or less, CLS 0.1 or less [M15]. I did not run Lighthouse or a throttled profile, so the items below are risks, not measurements.

| Area | What the code does today | Risk on a slow phone | Suggestion |
| --- | --- | --- | --- |
| Web font | Inter Variable through `@fontsource-variable/inter` (`globals.css:4`). Seven `@font-face` blocks split by `unicode-range`, all `font-display: swap`. The Latin file is 48 KB, Latin Extended 85 KB. | With `swap`, text paints in the fallback and then jumps when Inter arrives. The fallback is plain `sans-serif` (`globals.css:12`), which is Roboto on Android with different widths. That is a layout shift on the biggest text on the page. | web.dev: preload only the most important font, and use `size-adjust` on a fallback face to make the swap invisible [M14]. Generate the override numbers with a tool; do not guess them. |
| Extra subsets | Latin Extended (85 KB) loads the first time a character such as ł, ő or ş appears, for example in a Polish or Turkish deck term. | A second font download in the middle of a session | Accept it, or render learning-language terms in the system font |
| Scripts Inter does not have | Kana, hanzi, hangul, Arabic fall through to `sans-serif`. | The system picks the font. For Han characters the choice depends on `lang` [I8]. | Keep `lang` on every learning-language string. Add per-language stacks with `:lang(ja)`, `:lang(zh-Hans)`, `:lang(ko)`, `:lang(ar)` instead of listing one CJK font in the global stack. |
| Theme | The `dark` class is added in a React effect after mount (`theme-provider.tsx:102-113`). `index.html` has no inline theme script, no `color-scheme` meta, no `theme-color` meta. | A dark-mode learner sees a white page first, then it flips. On a slow phone that is a visible flash. | A tiny inline script in `<head>` that sets the class before first paint, plus the two meta tags |
| Data loading (issue #112) | Seeded data today, real queries later (`PLAN.md:151`) | If the hero's height depends on data, the page shifts when data arrives | Give the hero a fixed minimum height and a skeleton with the same box |
| Long lists | Twelve decks make a 4,176 px page (measured) | Rendering work and scrolling cost | Show a few rows and link to the full list. `content-visibility: auto` on below-the-fold sections is a cheap extra. |
| Images | None today. The examples people liked have deck art and mnemonic images. | Images become the LCP element and can shift layout | `width` and `height` on every image, `loading="lazy"` below the fold, modern formats, small thumbnails |
| Motion | The goal ring animates `stroke-dashoffset` and respects reduced motion (`ThisWeek.tsx:84`) | Low | Keep |

---

## 4. Mobile-first layout specification

This is a proposal for the plan to accept, change or reject. It is built from the measurements above.

### 4.1 Principles

1. One job on the first screen: how much is waiting, and one button to start.
2. Design at 320 px first, check at 375 and 390, then let containers widen.
3. The numeral is the only very large thing. Everything else is at most `text-lg`.
4. Nothing that holds text has a fixed height or `nowrap`.
5. Every size decision inside a card is a container query.

### 4.2 First screen on a phone, in DOM order, at 375 px wide

| # | Block | Contents | Height | Running total |
| --- | --- | --- | --- | --- |
| 1 | Top bar (not sticky) | Logo on the start side. Account button (48 x 48) on the end side. No hamburger. | 56 | 56 |
| 2 | Greeting | `h1`, one line at 24 px, wraps to two for long names. No status sentence. | 60 including spacing | 116 |
| 3 | Hero card "Today" | Padding 20. Row: "Today" label on the start side, language control on the end side (44 tall). Numeral (60 px, one line, 64). Label "cards to review" (28). Meta "About 4 min" (24). Gap 16. **Main button, full width, 56 tall.** Gap 8. Secondary action as a quiet text button (44). Padding 20. | about 324 | 440 |
| 4 | Week strip | Seven day marks and the streak number in one compact card | about 88 plus a 16 gap | 544 |
| | Bottom bar (sticky when the viewport is at least 480 px tall) | Three labeled items | 56 plus safe-area inset | |

Checks against the targets in section 3.8:

- 375 x 667, about 550 visible, minus a 56 px bottom bar leaves 494. The hero ends at 440. The top edge of the week strip shows, which tells the learner there is more below.
- 320 x 568, about 450 visible, minus 56 leaves 394. The main button's bottom edge is at about 368. It fits. The secondary action is cut, which is acceptable.
- 390 x 844, about 664 visible, minus 56 leaves 608. Everything through the week strip (544) fits.
- Spanish: "Buenas noches, Maximiliano" is 335 px at 24 px bold and the column is 327 px, so the greeting wraps to two lines (+32 px). The button still fits at 375. "tarjetas por repasar" is 169 px at 18 px. "Aprender 10 palabras nuevas" is 222 px at 16 px. Both fit the 287 px inner width (measured, section 7.4).

### 4.3 What happens to each current region on a phone

| Current region | Today (375 px) | Proposal | Why |
| --- | --- | --- | --- |
| Greeting status sentence (`DashboardGreeting.tsx:15-21`) | Two lines, 52 px | Remove on all sizes. Minutes move into the hero. The streak lives in the week strip. | It repeats numbers that appear again below. It is the longest sentence on the page and the hardest to translate (duration, streak and a `<b>` tag in one string). |
| Language filter (`LanguageFilter.tsx`) | 80 to 212 px above the hero | One control inside the hero's top row. Up to 3 languages: keep chips. More: a native `<select>` labeled "Studying". | It changes the hero number, so it must come before the number in DOM order. A native select gives a full-screen OS picker with large targets, works with every screen reader, and costs 0 extra rows. |
| Per-deck chips ("16 from Spanish Core 1000") (`TodayPanel.tsx:113-132`) | 2 rows, 88 px | Remove from the hero. The deck rows below already show each deck's due count. | Repeats data. Deck titles are the longest strings on the page. |
| "Starts in Spanish Core 1000." (`TodayPanel.tsx:152-156`) | 1 line | Remove once cross-deck review exists (`PLAN.md:146`). Until then, fold the deck name into the meta line. | A sentence that explains a limitation |
| Focus deck card (`FocusDeckCard.tsx`) | About 380 px: badge, title, two big numbers, bar, three-item legend | Becomes the first row of the deck list, visually stronger than the rest. Its legend moves behind a `<details>` or to the deck page. | "16 Due" repeats the hero. Three numbers in a legend is detail, not a call to act. |
| Other decks (`DeckList.tsx`) | 155 px per row | Rows stay. Show the first 3, then one "All decks" link or a "Show more" button. Row action is 44 px tall on coarse pointers. | Twelve decks make a 4,176 px page |
| This week (`ThisWeek.tsx`) | About 390 px, far below the decks (heading at y = 1,643) | Compact strip directly under the hero: 7 day marks plus the streak. The goal ring shrinks to a thin bar or a 48 px ring, or moves to the progress section. | Crystal circled the 7-day check strip. It is small, positive, and works as a scroll cue. |
| Tricky words (`MemoryCallout.tsx`) | About 200 px | One row: "7 tricky words" and a chevron, once there is a session to open. Until then, a short card after the deck list. | It has no action today (`PLAN.md:130`) |
| Progress trends (`ProgressTrends.tsx`) | 3 stacked cards, about 420 px | A `<details>` section closed by default on phones, open from `md`. Inside: 3 tiles in a row when the container is at least 20rem per 3 tiles, else stacked. | It is reference data. It is the bottom of the priority list in `PLAN.md:38`. |

### 4.4 Horizontal scrollers and accordions: when, and what they cost

**Horizontal scroller** (a single row that scrolls sideways)

| Candidate | Use it? | Notes |
| --- | --- | --- |
| Language chips | Only as a fallback. Prefer the select. | With 12 languages, most chips are off screen |
| Deck cards as a carousel | No | NN/g: "most people stop after viewing 3 to 4 different pages", and "If you have a high number of items, use a list view instead" [M7b] |
| Trend tiles | Acceptable. A wrap or stack is simpler. | Three items is within the 3 to 4 step limit [M7b] |
| Week strip | No need | Seven 28 px marks fit a 232 px inner width at 320 px |

Accessibility cost of any horizontal scroller:

1. **Discoverability.** Off-screen items are easy to miss. A partly visible next item is a strong cue; dots are "weak signifiers" [M7b].
2. **Keyboard.** A scroller with no focusable children could not be scrolled by keyboard until Chrome made such scrollers focusable (announced for Chrome 130, pushed to 132) [M16]. For other browsers, add `tabindex="0"`, a role and a label. If the items are links, they are focusable already.
3. **Reflow.** WCAG 1.4.10 forbids two-direction scrolling at 320 px. The Understanding page allows a carousel as long as "each individual panel" fits a 320 px viewport [W4]. So each chip or tile must fit on its own.
4. **Dragging.** WCAG 2.5.7 does not apply to browser scrolling or to CSS `overflow`. It does apply if a script takes over the scrolling [W9]. Use native `overflow-x: auto` with `scroll-snap`. Do not build a drag carousel in JavaScript.
5. **Edge swipes.** On iOS the same swipe can mean "back" near the screen edge. Leave a gutter [M7b].
6. **RTL.** The start edge flips. Use logical properties and never compute `scrollLeft` by hand.
7. **Focus.** Focused items must scroll into view and not hide under a sticky bar [W3].

**Accordion** (tap a heading to show or hide)

| Candidate | Use it? |
| --- | --- |
| Progress trends on phones | Yes |
| The focus deck's mastery legend | Yes, or move it to the deck page |
| Anything the learner needs in order to decide what to do next | No |

Accessibility and usability cost:

1. NN/g: accordions suit phones because they shorten the page and act as a mini table of contents. The costs are extra taps, hidden content, and getting lost after opening a long section [M7a].
2. Use the native `<details>` and `<summary>`. It is a real button for assistive technology, needs no JavaScript, and Chromium's find-in-page can open it. Put the heading inside the `<summary>`.
3. Do not auto-close other sections. Do not move focus. Do not scroll the page when one opens [M7a].
4. The summary row must be at least 44 px tall and its whole width must be tappable.
5. Never hide the only route to an action inside one.

### 4.5 Where navigation lives on a phone

Recommendation: a bottom bar with three labeled items, shown below `md`, sticky only when the viewport is at least 480 px tall.

| Item | Goes to | es-419 draft | pt-BR draft | Widest label at 12 px |
| --- | --- | --- | --- | --- |
| Home | `/dashboard` | Inicio | Início | 34 px |
| Community | `/community` | Comunidad | Comunidade | 73 px |
| Account (or "You") | Sheet or page with profile, settings, theme, plan, sign out | Cuenta | Conta | 48 px |

Why this and not the alternatives:

| Option | Fits at 375 px in English | Fits in Spanish | Verdict |
| --- | --- | --- | --- |
| Today: hamburger with 2 links | Yes | Yes | Hides both destinations. NN/g says show them [M3]. The 32 px button misses 44 px. |
| Two text links in the top bar | Barely. Logo 83 + "Decks" 42 + "Community Gallery" 128 + avatar 44 + padding and gaps 68 = 365 | **No.** "Galería de la comunidad" is 161 px, total 398 | Breaks under text expansion |
| Bottom bar, 3 items, icon over label | Yes. Each slot is 125 px at 375 and 106 px at 320 | Yes. Longest label tried is 85 px ("Configurações", if a Settings item is added) | Recommended |

Details:

- Icon plus a visible text label on every item. One word each [M5] [M9].
- `aria-current="page"` on the active item. The active state needs more than color: a filled icon or a pill behind it.
- Each item at least 48 px tall. Bar padding-bottom `env(safe-area-inset-bottom)`. Add `viewport-fit=cover` to `index.html`.
- Markup: `<nav aria-label="Primary">`, the same label the rail uses today (`AppSidebar.tsx:33`). Render one `<nav>` and restyle it by breakpoint, so screen readers never meet two "Primary" landmarks.
- DOM order: keep the nav before `<main>` so keyboard and screen-reader users reach it first, and add a "Skip to content" link. Visual position at the bottom is CSS only.
- Do not show it on `/study/$courseId`. The answer form needs the keyboard, and fixed bars are covered by keyboards [M11]. Apple's guidance to keep a tab bar visible has an exception for focused, modal-like views [M5]. A study session is one.
- Below 480 px of height (landscape phones, 400% zoom), the bar is not sticky. It scrolls with the page.
- From `md` up, the bar becomes the rail or sidebar. Never a bottom bar on large screens [M4].
- The first item is labeled "Decks" today but links to the dashboard (`AppSidebar.tsx:50-51`). Crystal also questioned the word "Deck". "Home" is the usual name for this place and translates to one short word.

Trade-off to be honest about: the bar costs 56 px of a roughly 550 px screen. Two real destinations is the minimum that justifies it. If the plan decides the app will stay at two destinations for a long time, the fallback is the current top bar with the hamburger enlarged to 44 px and opened as a sheet. I still recommend the bottom bar, because the roadmap adds a decks library and settings (`docs/product-ux.md:126-131`).

### 4.6 Where the theme control lives on a phone

Today there is none. The default is "system" (`theme-provider.tsx:87`), which is the right default.

Recommendation:

1. **A labeled three-way choice: System, Light, Dark.** Text labels, not only a sun and a moon. Icons need labels [M9], and text labels translate cleanly (Sistema, Claro, Oscuro / Escuro).
2. **Phone:** the first group inside the Account destination, titled "Appearance" or "Theme". A radio group, each row at least 48 px tall.
3. **Desktop:** the same group in the account menu at the bottom of the sidebar. Crystal circled the bottom-left sidebar area of `example-02`. An extra quick toggle in the sidebar footer is optional.
4. **Also in `/settings`** when that page is built (`_app/settings.tsx` is a placeholder).
5. **Fix the `d` shortcut.** Either remove it, or add a setting to turn it off, or require a modifier key. As it stands it fails WCAG 2.1.4 [W8]. A speech-input user who says a word with a "d" in it can flip the theme by accident.
6. **Persist and apply before first paint** (section 3.11).
7. Karen picked the dark example because "the writing pops up". She will not hunt through menus. On first run, consider one line under the hero or in onboarding: "Prefer a dark screen? Change it in Account." Remove it after one dismissal.

A sun-and-moon icon button in the phone top bar is a reasonable extra. It should not be the only control, because it cannot express "follow my phone".

---

## 5. i18n research

### 5.1 Three kinds of language

`docs/i18n.md:9-25` already separates UI locale, learning language and content locale. The dashboard code follows it: `viewer.uiLocale` drives every formatter (`formatters.ts:198-201`), `deck.learningLanguage` drives badges and the filter, and tricky words carry `lang` (`MemoryCallout.tsx:59`).

What the redesign must keep true:

| Thing on screen | Language it is in | Needs `lang`? |
| --- | --- | --- |
| Buttons, labels, greeting, numbers, dates | UI locale | Set once on `<html>`. `index.html:2` is hard-coded to `en`. It must follow `uiLocale` (`docs/i18n.md:107-109`). |
| Language names in the filter ("Spanish", "español") | UI locale, from `Intl.DisplayNames` | No |
| Deck titles | Whatever the author wrote. Unknown. | `dir="auto"` or `<bdi>`. `lang` only if the deck stores a content locale. |
| Terms, example sentences, mnemonics | Learning language or content locale | Yes, always. It drives font choice for CJK, speech, and hyphenation [I8]. |
| Usernames and display names | Unknown | `<bdi>` |

The filter says "Studying" (`LanguageFilter.tsx:7`) so it is not mistaken for a UI language switch. Keep that. The theme control and a future UI language control belong in Account, away from it.

### 5.2 Text expansion

The W3C article quotes IBM's table. The figures are the size of the translation as a percentage of the English [I1]:

| English length | Translation size |
| --- | --- |
| Up to 10 characters | 200 to 300% |
| 11 to 20 | 180 to 200% |
| 21 to 30 | 160 to 180% |
| 31 to 50 | 140 to 160% |
| 51 to 70 | 151 to 170% (printed this way in the source) |
| Over 70 | 130% |

Key lines: "the smaller the source message, the higher the likely translation length", and "Allow text to reflow and avoid small fixed-width containers or tight squeezes where possible" [I1]. Its example is the word "views": Portuguese "visualizações" is 2.6 times as long, Italian 3 times.

`PLAN.md:114` budgets "30 to 40% longer text for es-419". That is right for sentences. It is far too low for the short labels the redesign is moving toward. My drafts for this dashboard (unreviewed):

| English | Chars | es-419 draft | Chars | Growth | pt-BR draft | Chars | Growth |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Due | 3 | Pendientes | 10 | +233% | Pendentes | 9 | +200% |
| New | 3 | Nuevas | 6 | +100% | Novas | 5 | +67% |
| Learn | 5 | Aprender | 8 | +60% | Aprender | 8 | +60% |
| Home | 4 | Inicio | 6 | +50% | Início | 6 | +50% |
| Streak | 6 | Racha | 5 | -17% | Sequência | 9 | +50% |
| Review | 6 | Repasar | 7 | +17% | Revisar | 7 | +17% |
| Start review | 12 | Empezar repaso | 14 | +17% | Começar revisão | 15 | +25% |
| All languages | 13 | Todos los idiomas | 17 | +31% | Todos os idiomas | 16 | +23% |
| cards to review | 15 | tarjetas por repasar | 20 | +33% | cartões para revisar | 20 | +33% |
| 7 tricky words | 14 | 7 palabras difíciles | 20 | +43% | 7 palavras difíceis | 19 | +36% |
| Learn 10 new words | 18 | Aprender 10 palabras nuevas | 27 | +50% | Aprender 10 palavras novas | 26 | +44% |
| Good evening, Phillip | 21 | Buenas noches, Phillip | 22 | +5% | Boa noite, Phillip | 18 | -14% |

Where it breaks on this dashboard:

1. **Buttons.** `whitespace-nowrap` plus `h-11` (`button.tsx:8`, `TodayPanel.tsx:52`). Measured overflow at 320 px.
2. **Chips and badges.** `Badge` is `h-5` with `whitespace-nowrap` (`packages/ui/src/components/badge.tsx:9`). "Caught up" is fine. A German or Finnish equivalent may not be.
3. **Stat tiles in a row.** At 320 px three tiles get about 69 px each. "Pendientes" is 63 px at 12 px. "Tarjetas nuevas" is 91 px. It must be allowed to wrap, or the tiles must stack.
4. **A numeral and a noun at the same giant size.** See finding 8 and section 7.4.
5. **The goal ring.** "of 50" inside a 96 px circle (`ThisWeek.tsx:87-94`). "de 50" fits. Longer forms will not. Move the words outside the ring.
6. **Uppercase eyebrow labels with wide tracking** ("TODAY", "CONSISTENCY"; `TodayPanel.tsx:294`, `ProgressTrends.tsx:31`). Uppercase plus letter-spacing makes text about 15 to 25% wider (my estimate). See also section 5.9.

### 5.3 Plural categories

From the CLDR chart [I2] and from `Intl.PluralRules` in the dev browser:

| Locale | Categories | 0 | 1 | 2 | 5 | 21 | 24 | 1,000,000 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| en | one, other | other | one | other | other | other | other | other |
| es, es-419, es-MX | one, **many**, other | other | one | other | other | other | other | many |
| pt-BR | one, **many**, other | **one** | one | other | other | other | other | many |
| fr | one, many, other | **one** | one | other | other | other | other | many |
| ja | other | other | other | other | other | other | other | other |
| ru | one, few, many, other | many | one | few | many | **one** | few | many |
| pl | one, few, many, other | many | one | few | many | many | few | many |
| ar | zero, one, two, few, many, other | zero | one | two | few | many | many | other |

Consequences for the copy deck:

1. The brief's "one and other for en and es" is slightly out of date. Spanish has `many` for round millions ("1.000.000 de días" [I2]). A due count will never reach it, but a community total could. `plural()` falls back to `other` when a form is missing (`formatters.ts:144-145`), which is acceptable.
2. In Portuguese and French, 0 is `one`. A message that prints zero through the plural path would say "0 cartão". The dashboard already avoids this by switching to a separate "caught up" state (`dashboard-model.ts:110-117`). Keep that: **zero is a state, not a count.**
3. In Russian, 21 is `one`. So a `one` string must never contain a literal "1". Every `one` form in the dashboard uses `{count}`. Good. Keep it as a rule.
4. Some messages only have `other`: `keepStreak` (`DashboardGreeting.tsx:15-18`), `due` and `new` (`DeckList.tsx:14-15`), `more` (`MemoryCallout.tsx:15`). English gets away with it ("12-day streak", "8 due"). Spanish does not: "racha de 1 día" against "racha de 12 días". The type allows translators to add forms (`formatters.ts:7-9`), so this is a note for the catalog, not a code bug.
5. ICU's guidance: put the plural on the outside and "write full sentences in their sub-messages". "A message has to be written and translated as a single unit" [I3]. `dueLabel` (`TodayPanel.tsx:12-15`) is a fragment without its number. Section 7 fixes that.

### 5.4 Numbers, percents, durations, relative time, weekdays, first day

Output of the project's own formatter calls in the dev browser:

| | en | es-419 | es (Spain) | pt-BR | fr | de | ja | ar |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1000 | 1,000 | 1,000 | 1000 | 1.000 | 1 000 | 1.000 | 1,000 | 1,000 |
| 12345.6 | 12,345.6 | 12,345.6 | 12.345,6 | 12.345,6 | 12 345,6 | 12.345,6 | 12,345.6 | 12,345.6 |
| 5% | 5% | 5% | 5 % | 5% | 5 % | 5 % | 5% | 5‎%‎ (with direction marks) |
| 4 minutes | 4 minutes | 4 minutos | 4 minutos | 4 minutos | 4 minutes | 4 Minuten | 4 分 | 4 دقائق |
| 1 minute | 1 minute | 1 minuto | 1 minuto | 1 minuto | 1 minute | 1 Minute | 1 分 | **دقيقة** (no digit) |
| 4 min (short) | 4 min | 4 min | 4 min | 4 min | 4 min | 4 Min. | 4 分 | 4 د |
| 2 hours ago | 2 hours ago | hace 2 horas | hace 2 horas | há 2 horas | il y a 2 heures | vor 2 Stunden | 2 時間前 | **قبل ساعتين** (no digit) |
| 1 day ago (auto) | yesterday | ayer | ayer | ontem | hier | gestern | 昨日 | أمس |
| 12,800 compact | 13K | 13 k | 13 mil | 13 mil | 13 k | 12.800 | 1.3万 | 13 ألف |
| First day of week | Sunday (7) | **Monday (1)** | Monday | Sunday (7) | Monday | Monday | Sunday | Saturday (6) |
| Narrow weekdays from Sunday | S M T W T F S | D L M M J V S | D L M X J V S | D S T Q Q S S | D L M M J V S | S M D M D F S | 日 月 火 水 木 金 土 | ح ن ث ر خ ج س |
| Language names | Spanish, Japanese | español, japonés | español, japonés | espanhol, japonês | espagnol, japonais | Spanisch, Japanisch | スペイン語, 日本語 | الإسبانية, اليابانية |

Also: `es-MX` starts the week on Sunday while `es-419` starts on Monday. `ar-EG` and `fa` print non-Latin digits (٢٤, ۲۴). `en-IN` groups as 12,40,000.

What this means:

1. **Never build a number by hand.** No `{value}%`, no `toFixed`, no manual thousands separators. The lint rule covers `toFixed` and `toLocale*` (`docs/i18n.md:101`). It lets a literal `%` through in JSX (`docs/i18n.md:89`). Tighten that or state the rule in the copy deck.
2. **Units come from `Intl`, not from the catalog.** `formatters.ts:98-112` already does this for minutes and hours. Add `day` for the streak. That removes `streakDays` (`ThisWeek.tsx:37-40`) from the catalog and makes it correct in every language CLDR covers.
3. **A formatted value may contain no digit at all.** Arabic "one minute" is a single word. Hebrew "two days" is a single word (`יומיים`, checked). Any design that splits "the number" from "the unit" with string slicing will break. Use `formatToParts` and accept that the integer part can be missing.
4. **Short unit forms save space and look the same in many languages.** "4 min" is identical in en, es, pt, fr. For a meta line, short is better than long.
5. **Compact numbers are not a universal fix.** German does not compact 12,800. Japanese groups by ten-thousands. Use compact only above about 100,000, and expose the exact value to screen readers.
6. **Language names from `Intl.DisplayNames` are lowercase in Spanish, Portuguese and French.** As chip labels they will read "español", "japonés". If the design wants a capital, uppercase the first grapheme with the UI locale (`toLocaleUpperCase(uiLocale)`). I tested this and got "Japonés". Do not use CSS `capitalize`: MDN warns it is wrong in many languages and you should avoid it when you do not know the language [I11]. Note that `toLocaleUpperCase` is not on the banned list in `docs/i18n.md:101`, so this is allowed.
7. **Narrow weekday letters are ambiguous in every language.** English has two T and two S. es-419 has two M. pt-BR has three S and two Q. The code handles this for screen readers with a hidden long name (`ThisWeek.tsx:112-141`). For sighted users, mark today with more than bold text: a ring and the word "Today".
8. **First day of week.** `Intl.Locale#getWeekInfo()` is now marked "Baseline 2026, newly available since July 2026" on MDN [I7]. The comment at `formatters.ts:61` says Firefox lacks it. That may be out of date. Keep the fallback for older browsers. A bare `en` resolves to the United States and Sunday. A British or Australian learner with `en` would get the wrong week. Either store a region in `uiLocale` or avoid the question (next point).
9. **A rolling "last 7 days" strip needs no first-day rule.** Today sits at the end. There are no empty "upcoming" circles. It is also less noisy. The fixed Monday-to-Sunday strip in `example-05` is what Crystal circled, so this is a choice for the plan.
10. **Relative time.** `numeric: "auto"` gives "yesterday", "ayer", "ontem". `relativeTime` (`formatters.ts:114-122`) uses 30-day months and 365-day years, which is fine for "last studied". The template "Last studied {time}" (`LastStudied.tsx:6`) glues a formatted phrase into a sentence. It works in es ("Último estudio hace 2 horas") and pt. It is a soft form of concatenation and translators need a comment that says what `{time}` will look like.
11. **"About {duration}"** (`TodayPanel.tsx:16`). Spanish "Unos 4 minutos" needs gender agreement with the unit: "Unas 3 horas". A translator who knows that will choose "Aproximadamente", which is 190 px wide at 14 px against 109 px for "About 4 minutes". Prefer a symbol-free short form: "About 4 min", "Aprox. 4 min", or drop "About".

### 5.5 Greetings by time of day

The greeting has three forms cut at 05:00, 12:00 and 18:00 local time (`DashboardGreeting.tsx:28-37`).

- Spanish has the same three slots but the borders differ. One Open University course puts the switch to "Buenas noches" at around 8 o'clock. Other sources tie it to daylight or to lunch, and give later times in Mexico and Colombia. These are secondary sources of mixed quality [I14].
- "Buenas noches" is both a greeting and a farewell. English "Good night" is only a farewell. So the slot names must mean time of day, not English phrases.
- Japanese has no common "good afternoon" as such. こんにちは covers the day and こんばんは the evening (my knowledge, not sourced).
- At 02:00 the page says "Good evening". That is odd in any language.

Options, in order of i18n safety:

| Option | Example | i18n cost |
| --- | --- | --- |
| A. One neutral greeting | "Hi, Phillip" / "Hola, Phillip" / "Olá, Phillip" | One string. No hour logic. Always correct. |
| B. Three slots with cut-offs stored in the catalog | Per-locale hours | Three strings plus numbers a translator must set |
| C. Three slots, fixed hours (today) | As is | Wrong at the edges in some cultures |

I recommend A for the redesign. It removes logic, it is shorter (helps problem 1), and it cannot be culturally wrong. If the owner wants warmth, B is the correct way to keep it.

### 5.6 Names and gender

- W3C: do not assume a "first name". Some people have one name. Family-name-first is normal in Japan, Korea and Hungary. Ask "how that person would like you to address them". Names can be long. A one-letter name is a name [I5].
- The viewer already has a separate `displayName` (`apps/web/src/components/session-provider.tsx:10,21`). Good. The greeting must allow it to wrap and must have a no-name form ("Hi"), not "Hi, ".
- Wrap the name in `<bdi>` so an Arabic or Hebrew name does not reorder the punctuation around it [I4].
- Comma placement and vocative forms differ by language. The whole greeting must be one template with `{name}` inside it. It is today (`DashboardGreeting.tsx:10-14`).
- **Gender agreement.** English "Welcome back" is neutral. Spanish "Bienvenido" / "Bienvenida" is not. The app does not know the learner's gender and should not ask for it only to greet them. Write around it: "Qué bueno verte" (Spanish), "Que bom te ver" (Portuguese). If a gendered form is ever truly needed, ICU `select` is the tool [I3].
- **Adjectives used as labels agree with a hidden noun.** "New" must be "Nuevas" for cards or words (feminine in Spanish) and "Nuevos" for decks (masculine). "Mastered" is "Dominadas". Every short label needs a translator comment naming the noun it describes.
- English "you" hides a choice other languages must make. `docs/i18n.md:166` asks for respectful second person and no single-country slang. Informal "tú" is the usual choice for learning apps in Latin America. Avoid "vos" and "vosotros" forms. Record the decision in the copy deck.

### 5.7 Bidi and RTL readiness

RTL is not an early goal (`docs/i18n.md:51`), but a learner can study Arabic or Hebrew from day one, and deck titles, terms and usernames can be RTL inside an LTR page.

- W3C: for inserted text of unknown direction, add `dir="auto"` to the element that holds it, or wrap it in `<bdi>`. A name followed by a number is the classic failure [I4]. The dashboard has exactly this shape: "{count} from {deck}" (`TodayPanel.tsx:17`), "Starts in {deck}." (`:27`), "Review {count} cards in {deck}" (`FocusDeckCard.tsx:36-39`).
- `format()` returns a plain string (`formatters.ts:134-142`), so it cannot wrap `{deck}` in an element. `rich()` can: write `Starts in <deck>{deck}</deck>.` and render the tag as `<bdi>`. The tag is matched in the template before values are inserted (`formatters.ts:164-176`), so a deck title that contains angle brackets is not parsed as markup.
- For `aria-label` strings, which cannot hold elements, wrap the value in the Unicode isolate characters FSI (U+2068) and PDI (U+2069). This is standard bidi practice; I did not fetch a source for it.
- Layout: use logical utilities (`ms-`, `me-`, `ps-`, `pe-`, `start-`, `end-`, `text-start`, `border-s`, `rounded-s`). Tailwind's `rtl:` and `ltr:` variants exist [M12], but logical utilities need no variants. The leftovers are listed in section 2.4.
- What mirrors and what does not (general practice, not sourced here): back arrows, chevrons, progress bars and trend lines mirror. Clocks, check marks, play buttons and circular rings do not. The goal ring should stay clockwise.

### 5.8 CJK, long words, line breaking, fonts

- Chinese and Japanese can break between almost any two characters, with rules that keep certain punctuation off the start or end of a line. Thai, Lao and Khmer have no spaces and need dictionary-based breaking. German and Finnish build very long single words. Hyphenation only works when the language is declared [I9] [I8]. The W3C line-breaking article was served to me in Chinese, so I rely on its structure and examples, not on exact quotes.
- CSS tools (from my knowledge of MDN; not fetched for this report): `overflow-wrap: break-word` or `anywhere` as the last resort so nothing overflows; `hyphens: auto` for long Latin-script words, which needs a correct `lang`; `word-break: keep-all` to stop Korean breaking inside words; `line-break: strict` for Japanese punctuation rules; `text-wrap: balance` or `pretty` for headings.
- The code uses `wrap-break-word` on titles and chips (`FocusDeckCard.tsx:160`, `DeckList.tsx:120`, `LanguageFilter.tsx:12`) and `text-pretty` on headings. The long-titles preview exists to test it. Keep all of that.
- Do not truncate with an ellipsis as the default. Truncation hides the end of a word, and in many languages the end carries the meaning. WCAG allows an ellipsis only if the full text can be revealed [W10].
- **Fonts.** Inter covers Latin, Greek, Cyrillic and Vietnamese (seven subsets in the installed package). Kana, hanzi, hangul, Arabic, Hebrew, Thai and Devanagari fall back to the system. The fallback for Han characters depends on `lang`: the same code point is drawn differently for Chinese and Japanese readers [I8]. So `lang` on learning-language text is a rendering requirement, not only an accessibility one. Deck titles have no `lang` today (`PLAN.md:102` explains why), so a title written in Japanese may show Chinese-style glyphs on some devices.
- Mixed scripts on one line have different heights. Kana and Arabic sit taller or deeper than Latin. Chips that hold learning-language words need `min-height` and generous line height. A line height of 1 will clip Arabic and Thai.
- `globals.css` sets `letter-spacing: -0.03em` on every `h1` and `-0.015em` on every `h2` (around lines 161-166). MDN: "Some written languages should not have any letter spacing applied", with Arabic as the example, because connected letters "may lead to the text looking broken" [I10]. Scope tracking to Latin, Greek and Cyrillic with `:lang()`, or apply it through a class that is not used on user content.
- Non-Latin digits (ar-EG, fa, hi) will not render in Inter. A giant hero numeral will change typeface. Test it.

### 5.9 Uppercase

"TODAY", "CONSISTENCY", "RETENTION", "NEW CARDS" use CSS `uppercase` with `tracking-wide`.

- `text-transform` follows language rules only if `lang` is correct: Turkish i and İ, German ß to SS, Dutch IJ, Greek accents dropped [I11].
- Japanese, Chinese, Korean, Arabic, Hebrew and Thai have no letter case. In those languages an "eyebrow" label loses the only thing that set it apart.
- MDN: large amounts of uppercase text "may be difficult for people with cognitive concerns such as Dyslexia to read" [I11].
- Arabic must not be letter-spaced [I10].

Recommendation: do not use case to build hierarchy. Use size, weight and color, which work in every script. This also fits the redesign's contrast goal.

### 5.10 Icons, metaphors and color

| Item | Where | Issue | Evidence | Recommendation |
| --- | --- | --- | --- | --- |
| Flags for languages | `example-05` (Spain flag next to "Spanish") | A flag is a country, not a language. Wrong for Latin America. | `PLAN.md:14` already rejects flags. Secondary sources say W3C guidance is the same; I could not open a current W3C page that states it [I12]. | Language name as text. Never a flag. |
| Language codes "ES", "JA" | `LanguageBadge.tsx` | Neutral across cultures, but jargon. The name appears only on hover or to screen readers. | Section 3.10 | Show the name as text. Keep the code as decoration if wanted. |
| Owl | `example-02` study tip | "The modern West generally associates owls with wisdom." In Africa "harbingers of bad luck, ill health, or death". The Aztecs and Maya "considered the owl a symbol of death". A Mexican saying, "Cuando el tecolote canta, el indio muere", is still in use [I15]. | Wikipedia, a tertiary source | Do not use an owl as a mascot for a product aimed at Latin America. Also, Duolingo owns the owl in learners' minds. |
| Flame for a streak | `ThisWeek.tsx:208` | A learned convention from other apps, not a natural symbol | NN/g: icons need visible labels [M9] | Keep the icon only with the word "Streak" beside it |
| Check mark for "goal met" | `ThisWeek.tsx:139` | In Japan "the O mark is used instead of the check mark, and the X or ✓ mark are commonly used for wrong". In Sweden and Norway a ✓ marks a wrong answer. In Finland it stands for "wrong" [I16]. | Wikipedia | For "day done" a check is acceptable with a filled color and a hidden label. In the study session, never use ✓ alone for "correct". Use words. |
| Lightbulb for tricky words | `MemoryCallout.tsx:40` | "Idea" metaphor from English | No source | Low risk. Keep the text heading. |
| Thumbs up | Not used | Rude in some regions (commonly reported; not verified) | None | Avoid for grading |
| Red and green | Trends, grading | In mainland China, Japan, South Korea and Taiwan, red marks a rising stock price and green a falling one [I13]. Red-green color blindness also makes the pair hard to tell apart. | Secondary | Never signal with color alone. `docs/product-ux.md:173` says the same. Pair with a sign, an arrow or a word. |
| Trending-up arrow | `ProgressTrends.tsx:64` | Decorative. Does not mirror in RTL. | Section 2.4 | Remove. It adds no meaning. |

### 5.11 Dates, streaks and time zones

- W3C: use UTC to store and exchange instants. Identify zones with IANA time zone IDs, not offsets, because an offset cannot tell you future or past local times. A date without a time (a "floating" date) must not be converted through time zones. The document lists as a real-world failure a site that "shows gaps when the user travels, even though the customer logged in every day" [I6].
- Anki moves the day boundary to 4 AM by default, so someone "studying around midnight" does not get two days of cards in one sitting. The boundary "is relative to your current time zone" [I17].

State of the code:

- `localDateKey()` builds the day key from the browser's local clock (`apps/web/src/lib/dates.ts:2-7`). `addDays()` uses calendar arithmetic, so daylight-saving days are handled (`dates.ts:10-12`).
- `PLAN.md:91` says `dailyGoal.days` is keyed by the learner's local date so the week strip "doesn't depend on the browser's time zone matching the server's".
- The streak number itself is a seeded value (`session-provider.tsx:25`). Issue #112 will compute it on the server.

Risks to carry into the plan (most are for #112, but the redesign makes the streak more prominent, so they matter more):

| Risk | Example | Rule |
| --- | --- | --- |
| Server counts days in UTC | A learner in Mexico City studies at 19:00 Monday. In UTC that is Tuesday. Wednesday looks skipped. | Store each review as a UTC instant. Store the learner's IANA zone. Compute the local day on the server from both. |
| Travel | Study at 23:00 in New York, land in London, study at 07:00. One or two days? | Decide a rule and write it down. The simplest: each review keeps the local date it had when it happened. |
| Midnight | A night owl studies at 00:20 and "loses" yesterday | A day-rollover hour like Anki's 4 AM |
| Device clock | The dashboard highlights "today" from the device. The server disagrees. | The server returns "today" as a floating date. The client only formats. |
| "Check back later today" (`TodayPanel.tsx:34-35`) | At 23:50 "later today" is false | Avoid day words in static copy |
| Daylight saving | A 23-hour or 25-hour day | Never add 24 hours to get tomorrow. The code already avoids this. |
| Week start | Section 5.4 points 8 and 9 | Rolling 7 days, or store a region |

### 5.12 Why numerals plus short labels localize better than sentences, and where they do not

Why they do:

1. **Numbers are formatted by the platform.** Digits, separators and percent signs come from `Intl`. There is nothing to translate.
2. **Units are too.** Minutes, hours and days come from CLDR in hundreds of languages, with the right plural.
3. **A label that names a metric has no grammar tie to the number.** "Streak", "Due", "New" stay the same whether the number is 1 or 100.
4. **Fewer words means less to translate and less to get wrong.** The dashboard's `messages` objects, plus the sidebar's, hold about 345 English words across about 106 strings (counted with a small script over the `messages` objects; plural variants count separately). `TodayPanel.tsx` alone is 108 words. Only about 217 of those words are on screen in the default state, so a translator pays for every state, not only the one in the screenshot. Translation is priced and reviewed per word. Every sentence removed also removes a plural matrix: a string with a count needs up to 4 forms in Russian or Polish and 6 in Arabic.
5. **Short labels are reused.** "Review", "Learn", "Due" appear many times. One translation serves all, if the meaning is truly the same in each place.
6. **Layout is predictable.** A numeral's width changes by a few characters. A sentence's length changes by 30 to 200%.

Where they do not (the risks in the proposed direction):

| Risk | Example | Mitigation |
| --- | --- | --- |
| Short strings expand the most | "Due" to "Pendientes" (+233%) [I1] | Design tiles for a 12-character label. Allow two lines. Test with pseudo-localization. |
| One-word labels are ambiguous to a translator | "New": new what? Gender? "Due": adjective or noun? "Review": verb or noun? | A description for every key: where it appears, part of speech, what it refers to |
| Reusing one key in two grammatical roles | "Review" as a button (verb, "Repasar") and as a heading (noun, "Repaso") | One key per role, even if the English is identical |
| The noun next to the number is a counted noun | "24 / cards to review" needs one, few, many, other | One plural message that contains both (section 7) |
| Splitting the number from the words | Arabic and Hebrew drop the digit for 1 and 2. Some languages put a word before the number. | Tag the number inside the message. Do not render it as a separate fragment. |
| Abbreviations | "min", "avg" | W3C: "Other languages may not be able to replicate such an abbreviation" [I1]. Use `Intl` short units, which are localized abbreviations. Never invent your own. |
| Symbols in place of words | "24 · 4 min", "16 / 10" | A dot or slash carries no meaning for a screen reader. Use separate elements with their own labels. |
| Terse copy reads as cold or rude | Imperatives without softening | Tone review per locale. Spanish imperative "Empieza" (tú) against infinitive "Empezar". Pick one form for all buttons. |
| Screen readers lose context | A bare "24" | Keep it in one sentence in the DOM, or use `dl`, `dt`, `dd` so label and value are tied |

---

## 6. i18n rules for the new copy deck

Each rule has a short reason. "Must" rules are checks a reviewer can apply.

**Structure**

- **R1. One message per complete thought.** Never join two translated pieces in JSX. Why: word order differs, and translators must see the whole unit [I3].
- **R2. Counts go through one plural message that includes the number.** `{ one: "<n>{count}</n> card to review", other: "<n>{count}</n> cards to review" }`. Why: section 7.
- **R3. A `one` form never contains a literal "1". Zero is a separate state, never a plural form.** Why: Russian 21 is `one`; Portuguese 0 is `one` (section 5.3).
- **R4. Prefer "metric label plus formatted value" over a counted noun.** "Streak" plus `12 days` from `Intl`. Why: no hand-written plurals.
- **R5. Durations, days, percents, dates, lists and language names come from `Intl` with the UI locale.** Never type a unit, a `%`, a comma between list items, or a language name into the catalog.
- **R6. Join independent facts with separate elements, not with punctuation inside a string.** "About 4 min" and "2 decks" are two `<span>` elements or a `dl`. If a sentence list is needed, use `Intl.ListFormat` ("A, B y C" in Spanish, "A、B、C" in Japanese, measured).

**Words**

- **R7. Every key carries a description:** screen, element type, part of speech, the noun it modifies, the maximum comfortable length, and a screenshot when possible.
- **R8. One key per grammatical role.** "Review" the button and "Review" the heading are two keys.
- **R9. No idioms, no wordplay, no metaphors that need English.** "Keep slipping", "in good shape", "stick", "caught up" are all idioms in today's copy (`MemoryCallout.tsx:10-14`, `DashboardGreeting.tsx:20`, `TodayPanel.tsx:33`). Prefer "7 tricky words", "Nothing to review", "All done for today".
- **R10. No gendered address.** Write greetings and praise that need no gender (section 5.6).
- **R11. No hand-made abbreviations and no letter-case tricks.** No "avg", no "wk". No reliance on ALL CAPS for meaning.
- **R12. User content inside a message is isolated.** Deck titles, usernames and terms are wrapped with a tag that renders `<bdi>`, or with FSI and PDI in attribute strings.
- **R13. No em dashes in customer-facing copy** (the owner's standing rule). Also avoid typographic tricks that differ by locale: Spanish needs opening "¡" and "¿", French puts a space before "!" and "?". Leave punctuation to the translator and keep it inside the message.
- **R14. Second person, informal, region-neutral for es-419.** No "vos", no "vosotros". Record the choice once.
- **R15. Avoid day words in static copy** ("today", "tonight", "tomorrow") unless the value is computed.

**Layout**

- **R16. Budget for growth by length:** up to 10 characters, allow 3 times; 11 to 20, allow 2 times; 21 to 50, allow 1.6 times; longer, allow 1.3 times [I1].
- **R17. Nothing that holds translated text has a fixed height, a fixed width, `nowrap` or `truncate`.** Use `min-h-*`, wrapping and `overflow-wrap`.
- **R18. Buttons wrap to two lines before they overflow.** The main button label should be 2 words in English so that it stays on one line in most languages.
- **R19. The hero numeral stands alone on its line.** The noun goes under it at body size (finding 8).
- **R20. Logical properties only.** `ms`, `me`, `ps`, `pe`, `start`, `end`, `text-start`, `border-s`.
- **R21. Hierarchy comes from size, weight and color, not from uppercase or letter-spacing.**

**Language tagging**

- **R22. `<html lang>` follows the UI locale.** Learning-language text always has its own `lang`. Unknown-language user text gets `dir="auto"`.
- **R23. Never use a flag for a language.** Show the language name in the UI locale.
- **R24. Icons that carry meaning always have a visible text label.** Color is never the only signal.

**Process**

- **R25. The English catalog is frozen before translation starts, and every string ships through pseudo-localization first** (section 8).
- **R26. Count the words.** Add a script that totals words per screen. The redesign should cut the dashboard's translatable words by at least half. That is a direct saving in translation and review for every future locale.

---

## 7. Big number, small label, no concatenation

### 7.1 What the code does today

`TodayPanel.tsx:101-108`:

```tsx
<span className="font-heading text-5xl ...">{number(dueCount)}</span>{" "}
<span className="text-lg font-medium">{plural(dueCount, messages.dueLabel)}</span>
```

with `dueLabel: { one: "card ready to review", other: "cards ready to review" }` (`:12-15`).

This is better than string concatenation, because the plural form is chosen by `Intl.PluralRules`. It still has three problems:

1. **Fixed order.** The number is always first in the DOM. A translator cannot move it or put a word before it.
2. **A fragment.** The translator sees "cards ready to review" with no number and no hint that one is glued on in code. ICU: write full sentences in sub-messages [I3].
3. **The digit is forced.** Arabic writes "one minute" and "two minutes" with no digit (measured: `دقيقة`, `دقيقتان`). The same happens with counted nouns in Arabic and Hebrew. The fragment approach always prints a digit.

The same pattern appears in `GoalRing` ("24" then "of 50", `ThisWeek.tsx:87-94`) and in `MasteryBar` ("5% mastered" then "of 1,000 cards", `FocusDeckCard.tsx:67-74`).

### 7.2 The fix that already exists in the project

`rich()` accepts a plural message and renders named tags (`formatters.ts:153-182`). The greeting already uses it for `<b>` (`DashboardGreeting.tsx:15-18,61-64`).

```ts
// messages
due: {
  one: "<n>{count}</n> card to review",
  other: "<n>{count}</n> cards to review",
}
```

```tsx
const tags = {
  n: (chunk: string) => (
    <span className="block font-heading text-6xl font-bold tabular-nums">{chunk}</span>
  ),
}

<p className="text-lg font-medium">
  {rich(messages.due, tags, { count: dueCount })}
</p>
```

What this gives:

- One message. The translator sees the whole phrase and can put `<n>` anywhere, or leave it out for a dual form.
- The number is formatted with the UI locale before it is inserted (`formatters.ts:136-140`).
- The big style is applied by the tag, not by position.
- One `<p>` in the DOM, so a screen reader reads "24 cards to review" as one phrase.
- `display: block` on the numeral puts it on its own line. If a translation has words before the number, they sit on a line above it. That still looks intentional.

Example catalogs (drafts):

| Locale | one | other | few / many |
| --- | --- | --- | --- |
| en | `<n>{count}</n> card to review` | `<n>{count}</n> cards to review` | |
| es-419 | `<n>{count}</n> tarjeta por repasar` | `<n>{count}</n> tarjetas por repasar` | many: `<n>{count}</n> de tarjetas por repasar` |
| pt-BR | `<n>{count}</n> cartão para revisar` | `<n>{count}</n> cartões para revisar` | |
| ru (shape only) | `<n>{count}</n> карточка` | | few: `карточки`, many: `карточек` |

When this project adopts an i18n library (`docs/i18n.md:113-128`), the same idea maps one to one: ICU `{count, plural, one {<n>#</n> card to review} other {<n>#</n> cards to review}}` with rich-text tags in FormatJS, or the equivalent in Lingui or Paraglide. `formatters.ts:11` notes that the tag syntax was chosen to match those libraries.

### 7.3 Value and unit from `Intl`

For "4 min" or "12 days", where a small unit sits beside a larger number:

```ts
const parts = new Intl.NumberFormat(uiLocale, { style: "unit", unit: "day", unitDisplay: "long" })
  .formatToParts(streakDays)
```

Measured results:

| Locale and value | Parts |
| --- | --- |
| en, 4 minutes | integer "4", literal " ", unit "minutes" |
| es-419, 4 minutes | integer "4", literal " ", unit "minutos" |
| ja, 4 minutes | integer "4", literal " ", unit "分" |
| ko, 12 days | integer "12", unit "일" (no space) |
| ar, 4 minutes | integer "4", literal " ", unit "دقائق" |
| ar, 1 minute | unit "دقيقة" only |
| he, 2 days | unit "יומיים" only |

Rules for the component that renders these parts:

1. Render the parts in the order given. Do not reorder.
2. Style the `integer`, `group`, `decimal` and `fraction` parts as the number. Style `unit` as the label.
3. If there is no `integer` part, style the whole string as the number. Do not print a "1".
4. Keep the `literal` parts. Some locales have a space, some do not.
5. Put the plain `format()` string in an `aria-label`, or keep everything in one text flow, so speech output is natural.

### 7.4 Why the numeral must stand alone (measured widths, Inter Variable)

| Text at 60 px bold | Width | Fits 287 px (inside the hero at 375) | Fits 232 px (at 320) |
| --- | --- | --- | --- |
| 24 | 77 | Yes | Yes |
| 1,284 | 163 | Yes | Yes |
| 12,480 | 204 | Yes | Yes |
| 32 words | 272 | Barely | **No** |
| 32 palabras | 345 | **No** | **No** |
| 32 palavras | 342 | **No** | **No** |

| Text | Size | Width |
| --- | --- | --- |
| cards to review / tarjetas por repasar / cartões para revisar | 18 px medium | 132 / 169 / 172 |
| Start review / Empezar repaso / Começar revisão | 16 px medium | 92 / 124 / 129 |
| Learn 10 new words / Aprender 10 palabras nuevas | 16 px medium | 153 / 222 |
| Aprender 10 palabras nuevas más | 16 px medium | 259 (overflows a 222 px button) |
| Due / Pendientes / Pendentes | 12 px | 23 / 63 / 60 |
| New cards / Tarjetas nuevas | 12 px medium | 61 / 91 |
| About 4 minutes / Unos 4 minutos / Aproximadamente 4 minutos | 14 px | 109 / 104 / 190 |
| Good evening, Phillip / Buenas noches, Maximiliano | 24 px bold | 247 / 335 |

### 7.5 Stat pairs without sentences

For "16 Due" and "10 New", the code uses `dl` with `dt` and `dd` and flips them visually with `flex-col-reverse` (`FocusDeckCard.tsx:166-181`, `ThisWeek.tsx:204-223`). That is the right pattern. The label names a metric, so it needs no plural. Keep it, with rule R7 so translators know "New" means "new cards".

Check with a screen reader that the reversed visual order reads as "Due, 16" and not as two unrelated items.

---

## 8. Pseudo-localization test plan

Goal: find layout and code problems before any real translation exists. It costs nothing per run and catches most i18n bugs.

### 8.1 Build one DEV-only switch

`useFormatters()` is the single place every string passes through (`format`, `plural`, `rich`). A DEV-only pseudo mode can transform templates there. It should follow the existing `?preview=` pattern (`dashboard.tsx:47-58`, `import.meta.env.DEV` guard), for example `?pseudo=long|rtl|cjk`. Production bundles must not contain it.

The transform must:

1. Leave `{placeholders}` and `<tags>` untouched.
2. Replace Latin letters with accented look-alikes (a to á, n to ñ, c to ç, o to ö) so that unaccented text on screen means a hard-coded string.
3. Pad by length: 3 times for up to 10 characters, 2 times for 11 to 20, 1.6 times for 21 to 50, 1.3 times beyond [I1].
4. Wrap each message in brackets, `[like this]`. Missing brackets mean truncation. Two bracket pairs in one sentence mean concatenation.
5. Not touch learning-language content or deck titles. Those come from data.

### 8.2 The runs

| Run | Setup | What to look for |
| --- | --- | --- |
| P1 Long | `?pseudo=long` with `uiLocale` still `en` | Overflow, clipped buttons, wrapped chips, where the main button lands |
| P2 Real locale formatting | `uiLocale` set to `es-419`, then `pt-BR`, `de`, `ja`, `ar`, `ru` (the seeded viewer is in `session-provider.tsx:24`) with English strings | Numbers, percents, dates, weekday letters, first day of week, language names, lowercase chip labels |
| P3 RTL | `?pseudo=rtl`: `dir="rtl"` on `<html>` plus the long transform | Mirroring, leftover physical classes, icon direction, bidi scramble around deck titles and numbers |
| P4 CJK and tall scripts | Replace letters with full-width characters or kana, no spaces. Add decks titled in Japanese, Arabic and Thai. | Line breaking without spaces, clipped ascenders and descenders, font fallback, numeral font |
| P5 Plural sweep | Counts 0, 1, 2, 5, 11, 21, 101, 1,000, 1,000,000 with `uiLocale` `ru`, `pl`, `ar`, `pt-BR` | Which category is chosen. Missing forms fall back to `other`. No "0 card". No literal "1". |
| P6 Extreme data | Existing previews `long-titles`, `large-numbers`, `many-decks`, combined with P1 | Hero numeral at 6 digits, a 60-character deck title in a row, 12 languages in the filter |
| P7 Names | Display names: a 1-letter name, a 40-character name, a name with an apostrophe, an Arabic name, an empty name | Greeting wraps, no "Hi, ", no reordering |
| P8 Time | Device time zones `America/Mexico_City`, `Asia/Tokyo`, `Pacific/Auckland`. Clock at 00:10, 03:50, 23:50. A daylight-saving change day. | Today marker, streak, greeting, "last studied" |

### 8.3 Viewports and settings for every run

- Widths 320, 375, 390, 667 (landscape), 768, 1024, 1440.
- Browser zoom 200% and 400% at 1280 px wide (WCAG 1.4.4 and 1.4.10 [W5] [W4]).
- Text spacing overrides from WCAG 1.4.12 [W10].
- Light and dark themes.
- Coarse pointer (emulated phone) and fine pointer.

### 8.4 Pass criteria

1. No horizontal page scroll at 320 px. `document.documentElement.scrollWidth === innerWidth`.
2. No element with `scrollWidth > clientWidth` except deliberate scrollers and screen-reader-only text.
3. Every message shows both brackets.
4. No unaccented Latin text except brand names, data, and formatter output.
5. The main button is fully visible on first load at 375 x 550 in P1 and P3.
6. Every control keeps its minimum size after wrapping (24 px everywhere, 44 to 48 px for the main action and navigation).
7. axe reports no violations in P1 and P3.
8. In P3, no element sits on the wrong side, and numbers next to deck titles read in the right order.
9. In P5, every plural category that the locale has is exercised at least once.

### 8.5 Automate what is cheap

- A Playwright (or the existing headless Brave) script that loads each run at each width and asserts criteria 1, 2 and 5. `PLAN.md:138` shows the project already runs axe this way.
- A unit test for `plural()` and `rich()` over the count list in P5 for `ru`, `pl`, `ar`, `pt-BR`.
- A script that counts words in every `messages` object, to track rule R26.

### 8.6 What the manual trial in this research already showed

| Trial | Result |
| --- | --- |
| P1 at 375 px (DOM-level) | No sideways scroll. Page 27% taller. Main button moved from y = 581 to y = 851. Filter grew from 2 rows to 4. |
| Real Spanish at 320 px | "Aprender 10 palabras nuevas más" overflowed its button |
| P3 at 375 px | Layout mirrored cleanly. Bidi scramble around "{count} from {deck}". Trend icon did not mirror. |
| P2 formatters | Table in section 5.4 |

---

## 9. Issues found in the current code

Ordered by how much they affect the redesign. None of these were changed.

| # | Where | Issue | Suggested direction |
| --- | --- | --- | --- |
| 1 | `packages/ui/src/components/button.tsx:8` | `whitespace-nowrap` on every button. Translated labels overflow (measured). | Allow wrapping for text buttons. `min-h` instead of `h`. |
| 2 | `apps/web/src/components/theme-provider.tsx:131-163` | Single-letter `d` shortcut with no off switch. Fails WCAG 2.1.4 (A) [W8]. No visible theme control, so no control at all on phones. | Section 4.6 |
| 3 | `apps/web/index.html:2,6` | `lang="en"` is static. Viewport has no `viewport-fit=cover`. No `color-scheme` or `theme-color` meta. No pre-paint theme script. | Sections 3.4 and 3.11 |
| 4 | `_app/-components/AppSidebar.tsx:177-204` | Phone navigation hides 2 links in a menu. The trigger is 32 x 32. | Section 4.5 |
| 5 | `_app/dashboard.tsx:133-135`, `LanguageFilter.tsx:12` | The filter takes 80 to 212 px above the main action. Chips have a fixed `h-9`. | Section 4.3 |
| 6 | `TodayPanel.tsx:12-15,101-108`; `ThisWeek.tsx:19-20,87-94`; `FocusDeckCard.tsx:22-26,67-74` | Number and words rendered as separate fragments | Section 7.2 |
| 7 | `TodayPanel.tsx:17,27`; `FocusDeckCard.tsx:36-47`; `DeckList.tsx:19-27` | Deck titles interpolated as plain text. No bidi isolation. | Rule R12 |
| 8 | `LanguageBadge.tsx:27-34` | Language name only in `title` and screen-reader text. Invisible on touch. | Section 3.10 |
| 9 | `DashboardGreeting.tsx:28-37` | Fixed hour cut-offs for greetings. "Good evening" at 02:00. | Section 5.5 |
| 10 | `DashboardGreeting.tsx:15-18`; `DeckList.tsx:14-15`; `MemoryCallout.tsx:15` | Plural messages with only `other`. Fine in English. Translators must add forms. | Note in the copy deck |
| 11 | `ThisWeek.tsx:37-40` | "{count} day / days" written by hand | `Intl` unit `day` |
| 12 | `TodayPanel.tsx:16` | "About {duration}" forces gender agreement or a very long word in Spanish | Short unit, or drop "About" |
| 13 | `TodayPanel.tsx:294`; `ProgressTrends.tsx:31` | Uppercase plus wide tracking | Section 5.9 |
| 14 | `packages/ui/src/styles/globals.css` (base `h1`, `h2` rules) | Negative letter-spacing on all headings in all scripts | Scope by `:lang()` |
| 15 | `globals.css:12` | Font stack is Inter then `sans-serif`. No metric-matched fallback. No per-language stacks. | Section 3.11 |
| 16 | `AppSidebar.tsx:139,216`; `dropdown-menu.tsx:131,174,181,217,223,256`; `avatar.tsx:69`; `button.tsx:25-29` | Physical direction classes | Logical classes |
| 17 | `AppSidebar.tsx:50-51,107` | "Decks" links to `/dashboard`. "View Profile" links to `/dashboard`. | Name the destination "Home". Hide Profile until it exists. |
| 18 | `formatters.ts:61` | Comment says Firefox lacks week info. MDN now lists it as newly available in all browsers (July 2026) [I7]. | Update the comment. Keep the fallback. |
| 19 | `docs/i18n.md:89` | The lint rule lets a literal `%` through in JSX | State in the rule that percents come from `percent()` |
| 20 | `docs/designs/dashboards/PLAN.md:114` | "30 to 40% longer" understates growth for short labels | Use the length-based budget in R16 |

Things the current code gets right and the redesign must not lose: every string in a `messages` object; `Intl` for numbers, percents, durations, relative time, weekdays and language names; week start from the locale; `lang` on tricky words; unique accessible names on repeated buttons; logical spacing classes in the dashboard components; container queries in the deck list and week card; `tabular-nums`; reduced-motion handling; wrapping for long titles; `min-h-dvh` in the shell.

---

## 10. Checklist for the final plan

Mobile

- [ ] Main button fully visible at 375 x 550 and at 320 x 450, in English and in pseudo-long
- [ ] Hero numeral alone on its line; label below at body size
- [ ] Greeting one line, no status sentence
- [ ] Language filter folded into the hero's top row
- [ ] Week strip directly under the hero
- [ ] Bottom bar with 3 labeled items below `md`; rail from `md`; never both
- [ ] Bottom bar: 48 px items, safe-area padding, sticky only above 480 px height, absent on the study screen
- [ ] `viewport-fit=cover`, `color-scheme` and `theme-color` meta, pre-paint theme script
- [ ] Theme: System, Light, Dark with text labels in Account; `d` shortcut fixed
- [ ] Main action 56 px; row actions 44 px on coarse pointers
- [ ] Container queries for everything inside cards
- [ ] `scroll-padding-bottom` for the sticky bar
- [ ] No horizontal scroller for decks; `<details>` for trends on phones
- [ ] Landscape: hero in a row; tablets: icon rail
- [ ] Kbd hints gated by `any-pointer-fine`

i18n

- [ ] Rules R1 to R26 adopted in the copy deck
- [ ] Hero count as one `rich()` plural message
- [ ] Streak days through `Intl`
- [ ] `<bdi>` around deck titles and names
- [ ] No uppercase eyebrows
- [ ] Neutral greeting, or per-locale cut-offs
- [ ] Language shown by name, never by flag; code badge optional
- [ ] Pseudo-localization switch and runs P1 to P8
- [ ] Translator descriptions for every key
- [ ] Word count per screen tracked

---

## 11. What I could not verify

1. **Real devices.** All measurements are from an emulated viewport in a desktop Chromium browser. I did not see Safari on iOS, a real Android phone, safe-area insets, toolbar collapse or the on-screen keyboard.
2. **Visible viewport heights.** "About 550 px" for a 375 x 667 iPhone and "about 664 px" for a 390 x 844 iPhone come from search results on device-size sites (values between 547 and 559, and 663 to 664). No primary source. The 450 px and 320 px figures for 320 x 568 and landscape are my estimates.
3. **`viewport-fit=cover` being required for safe-area insets.** From my own knowledge. The MDN `env()` page I fetched does not say it.
4. **Material Design 3 navigation bar page and the Material 2 bottom navigation page.** Both need JavaScript and returned no text. I used the Android Developers page instead [M4].
5. **WCAG 2.5.5 (44 px).** Taken from the 2.5.8 Understanding page, not from its own page.
6. **W3C on flags.** I found only secondary sources that say W3C advises against flags for languages.
7. **W3C line-breaking article.** The server returned the Chinese translation. I used its structure. The CSS property notes (`word-break`, `overflow-wrap`, `hyphens`, `line-break`) are from my knowledge of MDN and were not fetched.
8. **Translations.** Every Spanish and Portuguese string is my draft. The widths and growth percentages depend on them. The pt-BR word for "streak" in particular needs a native reviewer.
9. **Performance.** No Lighthouse run, no CPU or network throttling, no field data. Section 3.11 lists risks, not results.
10. **Pseudo-localization.** Done by replacing DOM text in the running page, not through the message catalog. It cannot reach `aria-label` text and it treats each text node as a message.
11. **Cultural claims** about owls, check marks and red and green come from Wikipedia and general web sources [I13] [I15] [I16]. The thumbs-up claim has no source. Japanese greeting usage is from my own knowledge.
12. **Spanish greeting cut-off times** come from language-learning sites of mixed quality [I14].
13. **The claim that Chromium's find-in-page opens `<details>`,** and the FSI and PDI advice for attribute strings, are from my own knowledge.
14. **Word counts** for the `messages` objects (about 345 words, about 106 strings) come from a quick regular-expression script. It counts each plural variant as its own string and may miscount a few quoted keys.
15. **Tailwind v4 `hover:` behavior** is taken from the reference table on the docs page, which shows `@media (hover: hover)`. The prose does not state it.
16. **The Refactoring UI book, the Memrise archive, and color science** are other researchers' assignments. I did not cover them.

---

## Sources

### Project files (read in full)

- `dev/memli/docs/mobile.md`, `dev/memli/docs/i18n.md`, `dev/memli/docs/product-ux.md`
- `docs/designs/dashboards/PLAN.md`; `docs/designs/dashboards/example-05.jpg`; the annotated feedback screenshot
- `dev/memli/apps/web/src/routes/_app.tsx`, `_app/dashboard.tsx`, and in `_app/-components/`: `AppSidebar.tsx`, `DashboardGreeting.tsx`, `TodayPanel.tsx`, `FocusDeckCard.tsx`, `DeckList.tsx`, `LanguageBadge.tsx`, `LanguageFilter.tsx`, `LastStudied.tsx`, `ThisWeek.tsx`, `MemoryCallout.tsx`, `ProgressTrends.tsx`, `dashboard-model.ts`
- `dev/memli/apps/web/src/lib/formatters.ts`, `apps/web/src/lib/dates.ts`, `apps/web/src/components/theme-provider.tsx`, `apps/web/index.html`
- `dev/memli/packages/ui/src/styles/globals.css`, `packages/ui/src/components/button.tsx`, `badge.tsx`, `dropdown-menu.tsx`, `avatar.tsx`
- `@fontsource-variable/inter` 5.2.8 `index.css` and file sizes

### Mobile

- [M1] Steven Hoober, "How Do Users Really Hold Mobile Devices?", UXmatters, 2013, including the author's 2017 comment. https://www.uxmatters.com/mt/archives/2013/02/how-do-users-really-hold-mobile-devices.php
- [M2] Steven Hoober, "Design for Fingers, Touch, and People, Part 1", UXmatters, 2017. https://www.uxmatters.com/mt/archives/2017/03/design-for-fingers-touch-and-people-part-1.php
- [M3] Nielsen Norman Group, "Hamburger Menus and Hidden Navigation Hurt UX Metrics". https://www.nngroup.com/articles/hamburger-menus/
- [M4] Android Developers, "Layouts and navigation patterns". https://developer.android.com/design/ui/mobile/guides/layout-and-content/layout-and-nav-patterns
- [M5] Apple Human Interface Guidelines, "Tab bars". https://developer.apple.com/design/human-interface-guidelines/tab-bars (read through the page's JSON data endpoint)
- [M6] Apple Human Interface Guidelines, "Accessibility". https://developer.apple.com/design/human-interface-guidelines/accessibility (read through the JSON data endpoint)
- [M7] Android Accessibility Help, "Touch target size". https://support.google.com/accessibility/android/answer/7101858
- [M7a] Nielsen Norman Group, "Accordions on Mobile". https://www.nngroup.com/articles/mobile-accordions/
- [M7b] Nielsen Norman Group, "Carousels on Mobile Devices". https://www.nngroup.com/articles/mobile-carousels/
- [M8] MDN, `env()`. https://developer.mozilla.org/en-US/docs/Web/CSS/env
- [M9] Nielsen Norman Group, "Icon Usability". https://www.nngroup.com/articles/icon-usability/
- [M10] web.dev, "The large, small, and dynamic viewport units". https://web.dev/blog/viewport-units
- [M11] Chrome for Developers, "Prepare for viewport resize behavior changes coming to Chrome on Android". https://developer.chrome.com/blog/viewport-resize-behavior
- [M12a] Tailwind CSS, "Responsive design". https://tailwindcss.com/docs/responsive-design
- [M12] Tailwind CSS, "Hover, focus, and other states". https://tailwindcss.com/docs/hover-focus-and-other-states
- [M13] Adrian Roselli, "Responsive Type and Zoom". https://adrianroselli.com/2019/12/responsive-type-and-zoom.html
- [M14] web.dev, "Best practices for fonts". https://web.dev/articles/font-best-practices
- [M15] web.dev, "Web Vitals". https://web.dev/articles/vitals
- [M16] Chrome for Developers, "Keyboard focusable scrollers". https://developer.chrome.com/blog/keyboard-focusable-scrollers

### WCAG 2.2 Understanding documents

- [W1] SC 2.5.8 Target Size (Minimum). https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html
- [W3] SC 2.4.11 Focus Not Obscured (Minimum). https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html
- [W4] SC 1.4.10 Reflow. https://www.w3.org/WAI/WCAG22/Understanding/reflow.html
- [W5] SC 1.4.4 Resize Text. https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html
- [W6] SC 1.3.4 Orientation. https://www.w3.org/WAI/WCAG22/Understanding/orientation.html
- [W7] SC 1.4.13 Content on Hover or Focus. https://www.w3.org/WAI/WCAG22/Understanding/content-on-hover-or-focus.html
- [W8] SC 2.1.4 Character Key Shortcuts. https://www.w3.org/WAI/WCAG22/Understanding/character-key-shortcuts.html
- [W9] SC 2.5.7 Dragging Movements. https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements.html
- [W10] SC 1.4.12 Text Spacing. https://www.w3.org/WAI/WCAG22/Understanding/text-spacing.html

### i18n

- [I1] W3C Internationalization, "Text size in translation". https://www.w3.org/International/articles/article-text-size
- [I2] Unicode CLDR, "Language Plural Rules" chart. https://www.unicode.org/cldr/charts/latest/supplemental/language_plural_rules.html
- [I3] ICU User Guide, "Formatting Messages". https://unicode-org.github.io/icu/userguide/format_parse/messages/
- [I4] W3C Internationalization, "Inline markup and bidirectional text in HTML". https://www.w3.org/International/articles/inline-bidi-markup/
- [I5] W3C Internationalization, "Personal names around the world". https://www.w3.org/International/questions/qa-personal-names
- [I6] W3C, "Working with Time and Time Zones". https://www.w3.org/TR/timezone/
- [I7] MDN, `Intl.Locale.prototype.getWeekInfo()`. https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Locale/getWeekInfo
- [I8] W3C Internationalization, "Why use the language attribute?". https://www.w3.org/International/questions/qa-lang-why
- [I9] W3C Internationalization, "Approaches to line breaking". https://www.w3.org/International/articles/typography/linebreak (served in Chinese)
- [I10] MDN, `letter-spacing`. https://developer.mozilla.org/en-US/docs/Web/CSS/letter-spacing
- [I11] MDN, `text-transform`. https://developer.mozilla.org/en-US/docs/Web/CSS/text-transform
- [I12] Flags and languages, secondary sources found by search: https://456bereastreet.com/archive/200604/indicating_language_choice_flags_text_both_neither and https://simplelocalize.io/blog/posts/flags-as-language-in-language-selector/
- [I13] Color meanings, secondary sources found by search: https://en.wikipedia.org/wiki/Color_symbolism and https://localizejs.com/articles/the-meaning-of-colors-across-cultures
- [I14] Spanish greetings, secondary sources found by search: https://www.open.edu/openlearn/mod/oucontent/view.php?id=106695&section=6 and https://www.spanishdict.com/guide/good-evening-in-spanish
- [I15] Wikipedia, "Owl", section on symbolism and mythology. https://en.wikipedia.org/wiki/Owl
- [I16] Wikipedia, "Check mark". https://en.wikipedia.org/wiki/Check_mark
- [I17] Anki Manual, "Preferences" ("Next day starts at"). https://docs.ankiweb.net/preferences.html
- MDN `Intl` reference pages (not fetched; behavior confirmed by running the APIs in the dev browser, Chrome 156 engine): `Intl.PluralRules`, `Intl.NumberFormat` and `formatToParts`, `Intl.RelativeTimeFormat`, `Intl.DateTimeFormat`, `Intl.DisplayNames`, `Intl.ListFormat`, `Intl.DurationFormat`. https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl

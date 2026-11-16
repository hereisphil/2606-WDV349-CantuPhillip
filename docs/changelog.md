# Changelog: 2606-WDV349-CantuPhillip 🚀

## Project & Portfolio

### Phillip Cantu

![Degree Program](https://img.shields.io/badge/degree-web%20development-blue.svg) 

Each week, and/or each major change, I will update this file by summarizing activity and progress made. This changelog is the source of truth for all changes to the app.

## 16 November 2026

### `FEATURE` Study session

`/study/$courseId` is a full study loop. A learner sees a word, types the answer or reveals it, sees a mnemonic, says how it went, and moves on until the session ends.

* **Session layout.** Study sessions drop the app sidebar. A sticky header holds Exit (and Escape), the course title, words left, a progress bar and the Theme menu. Refs [#48](https://github.com/hereisphil/2606-WDV349-CantuPhillip/issues/48) via [PR #145](https://github.com/hereisphil/2606-WDV349-CantuPhillip/pull/145)
* **Study card.** The term with its part of speech and a pronunciation button, a typed answer checked for typos and missing accents (Correct, typo, accent, Not quite), and a Reveal answer path on Space. Response time pauses while the tab is hidden. Refs [#49](https://github.com/hereisphil/2606-WDV349-CantuPhillip/issues/49) via [PR #150](https://github.com/hereisphil/2606-WDV349-CantuPhillip/pull/150)
* **Mnemonic frame.** Under the revealed answer: a 4:3 picture with a fallback, the story with the term and its sound-alike keyword highlighted, the author and upvotes, and arrows through each word's community mnemonics. Stories are stored as typed parts, never parsed markup. Refs [#50](https://github.com/hereisphil/2606-WDV349-CantuPhillip/issues/50) via [PR #155](https://github.com/hereisphil/2606-WDV349-CantuPhillip/pull/155)
* **Outcome dock and summary.** Plain, first-person choices instead of Anki grade names, each saying when the word comes back ("Back in 5 days"). Enter confirms the default and 1 to 4 pick by position. The session ends with "All done!", words studied, the share remembered the first time, active minutes and the next review. Refs [#51](https://github.com/hereisphil/2606-WDV349-CantuPhillip/issues/51) via [PR #159](https://github.com/hereisphil/2606-WDV349-CantuPhillip/pull/159)

### `FEATURE` FSRS scheduling in `@workspace/core`

`packages/core` is back with the logic the study loop runs on, so the browser and the API grade and schedule the same way.

* The Evaluator rates a typed answer exact, near or wrong. The Rating Mapper turns Memli's outcomes (missed, tough, got it, easy) into FSRS ratings. Scheduling is FSRS-7 through `ts-fsrs`, seeded so the same review always gives the same schedule. A pure session reducer sends a missed word to the back of the queue until it sticks.
* Response time only ever nudges silently and never lowers a grade. A lint rule keeps `ts-fsrs` out of `apps/web`.
* Node 26 LTS is pinned locally and in CI, because `ts-fsrs` v6 needs Node 24 or later.
* See merged **[PR #149](https://github.com/hereisphil/2606-WDV349-CantuPhillip/pull/149)** — Refs [#132](https://github.com/hereisphil/2606-WDV349-CantuPhillip/issues/132)

### `FEATURE` Hono API and saved reviews

Progress now survives a refresh. `apps/api` is a Hono app on a Cloudflare Worker with a Drizzle schema on D1, and the web app reads and writes through it.

* `GET /api/courses`, `GET /api/courses/:courseId/study`, `POST /api/reviews` and `GET /api/history` validate input and output with shared `@workspace/schemas` Zod contracts and answer errors as stable codes (`{ "error": { "code": "..." } }`). Vite proxies `/api/*`, so the browser stays same-origin.
* D1 holds four seeded courses (16 words, 6 mnemonics) for `usr_prototype_01`, all eleven FSRS-7 fields per word, and a `reviews` log written in the same batch as the progress. The server's clock decides when a review happened, and a client-made `reviewId` makes a retry count once.
* The dashboard's week, days of study, reviews remembered and new words this month come from real history in the learner's time zone. No prototype data is left on the live dashboard.
* "Deck" is now "course" in code, schemas, tables and docs, matching the UI.
* CI fails when the Drizzle schema changes without a migration, and a test guards against D1's cascade delete when a table is rebuilt.
* See merged **[PR #160](https://github.com/hereisphil/2606-WDV349-CantuPhillip/pull/160)** and **[PR #161](https://github.com/hereisphil/2606-WDV349-CantuPhillip/pull/161)** — Refs [#106](https://github.com/hereisphil/2606-WDV349-CantuPhillip/issues/106), [#112](https://github.com/hereisphil/2606-WDV349-CantuPhillip/issues/112)

### `ANNOUNCEMENT` Staging runs the API

[memli-staging.thereisphil.workers.dev](https://memli-staging.thereisphil.workers.dev/) now serves the whole Week 3 build. The gate Worker checks basic auth, then sends `/api/*` to `memli-api-staging` through a service binding, so the API has no public URL. The staging deploy applies D1 migrations, deploys the API, then deploys the gate. Production has no API yet and answers `/api/*` with a JSON 503.

* See merged **[PR #164](https://github.com/hereisphil/2606-WDV349-CantuPhillip/pull/164)**, **[PR #166](https://github.com/hereisphil/2606-WDV349-CantuPhillip/pull/166)** and **[PR #167](https://github.com/hereisphil/2606-WDV349-CantuPhillip/pull/167)** — Refs [#165](https://github.com/hereisphil/2606-WDV349-CantuPhillip/issues/165)

### `DX` Guardrails and upkeep

* **Accessibility and i18n in CI.** jsx-a11y rules, a ban on hard-coded UI strings and on formatting outside `Intl`, and Playwright + axe (WCAG 2.2 AA) on every preview in both themes. See merged **[PR #142](https://github.com/hereisphil/2606-WDV349-CantuPhillip/pull/142)**
* **Design floors.** Lint rules block text under 14 px, physical direction classes, CSS `order`, raw colors, buttons under 44 px and em dashes in UI copy. Specs check rendered sizes and retired words on every preview. See merged **[PR #157](https://github.com/hereisphil/2606-WDV349-CantuPhillip/pull/157)** — Refs [#156](https://github.com/hereisphil/2606-WDV349-CantuPhillip/issues/156)
* **Typecheck that checks.** `bun run typecheck` in `apps/web` had been checking no files. It now checks both of its projects. See merged **[PR #154](https://github.com/hereisphil/2606-WDV349-CantuPhillip/pull/154)** — Refs [#153](https://github.com/hereisphil/2606-WDV349-CantuPhillip/issues/153)
* **Shorter comments.** A lint rule caps comments at two lines, and every `useEffect` was reviewed. See merged **[PR #162](https://github.com/hereisphil/2606-WDV349-CantuPhillip/pull/162)** — Refs [#146](https://github.com/hereisphil/2606-WDV349-CantuPhillip/issues/146)
* **Dependencies.** Everything in range is updated, Worker types come from `wrangler types` (CI fails when they're stale), and a weekly workflow opens one update PR into `dev`. See merged **[PR #163](https://github.com/hereisphil/2606-WDV349-CantuPhillip/pull/163)** — Refs [#148](https://github.com/hereisphil/2606-WDV349-CantuPhillip/issues/148)

### `DOCUMENTATION` Week 3 milestone summary

Replaced the `359 MS 3` plan with a summary of what landed. Both items that slipped from Week 2, the session layout (#48) and the study card (#49), shipped first. The mnemonic frame (#50), outcome dock (#51), FSRS core (#132), Hono API and D1 (#106) and saved reviews (#112) all shipped, and staging runs the API (#165). The Module 3 innovation research and the API compliance and security audit are still open under #111.

* Refs [#111](https://github.com/hereisphil/2606-WDV349-CantuPhillip/issues/111)

***

## 14 November 2026

### `FEATURE` Dashboard redesign

`/dashboard` now has one focal point. A navy study hero names the course, shows one large number ("16 words to review") and the time it takes, and holds the only amber button on the screen, "Start review". Its count always matches the session the button opens. Everything else got quieter and plainer.

* **Dark mode is real.** The app follows the device setting with no flash of the wrong theme, and a visible Theme control (Match my device, Light, Dark) sits at the foot of the sidebar and in the phone top bar. The old hidden `d` key is gone.
* **Color rebuilt.** Three-tier OKLCH tokens (primitives, light and dark roles, utilities) with a deep navy dark theme. A Vitest check measures every text and control pairing against WCAG 2.2 and APCA in both themes (216 checks). Focus is a solid 2 px outline everywhere.
* **Plain words.** Course, words, to review, learned and Dashboard replace deck, cards, due, mastered and Decks. The greeting is one line. About 84 words in the main area, down from 217.
* **Calmer page.** This week shows seven day marks (a check for a goal day, a ring for a partial day, an empty circle for no study) and "12 days of study", which forgives one day off ("never miss twice"). Other courses are compact rows with one status line and a 44 px Review or Learn link, five at a time; a Studying menu filters them when there are many. One warm tip card offers to practice the tricky words. "Your progress" is a closed disclosure with a table.
* **Built for everyone.** Links are links, every target is 44 px, a skip link comes first, the page title is "Dashboard · Memli", the hero fits a phone's first screen, and a DEV-only `?pseudo=long|cjk|rtl` switch checks layouts for translation. axe runs on every preview state in both themes at desktop and 375 px.
* Plan and research: [`docs/designs/REDESIGN.md`](./designs/REDESIGN.md) and [`docs/designs/redesign-research/`](./designs/redesign-research/README.md). See merged **[PR #152](https://github.com/hereisphil/2606-WDV349-CantuPhillip/pull/152)** — Refs [#151](https://github.com/hereisphil/2606-WDV349-CantuPhillip/issues/151)

***

## 07 November 2026

### `FEATURE` Study dashboard

`/dashboard` now answers "what should I study right now, and how long will it take?" instead of showing an equal-weight deck grid. A Today panel leads with the cards due, the time they take, and one primary action. The deck that needs attention most gets a larger card, and the rest sit in compact rows sorted by need. A This week aside shows the daily goal, the streak, and words that keep slipping. Learners with decks in two or more languages can filter by the language they're studying.

* The daily goal counts new cards as well as reviews, and finishing everything scheduled counts as meeting it, so a learner who remembers well isn't penalized when FSRS schedules fewer reviews. A caught-up learner can opt into 10 more new words or tricky-word practice.
* Strings are whole-sentence templates formatted through `Intl` (numbers, plurals, durations, relative times, weekday names), ready for an i18n library.
* Checked with axe in light and dark themes, a keyboard walk, 320 px and 200% zoom, and reduced motion. Dark muted text and the Pro badge now meet 4.5:1 contrast.
* The plan and a DEV-only `?preview=` switcher for each edge state live in [`docs/designs/dashboards/PLAN.md`](./designs/dashboards/PLAN.md). The data stays a typed prototype seed until the API lands (#112).
* See merged **[PR #140](https://github.com/hereisphil/2606-WDV349-CantuPhillip/pull/140)** — Refs [#47](https://github.com/hereisphil/2606-WDV349-CantuPhillip/issues/47)

### `DOCUMENTATION` Week 2 milestone progress

Recorded what `359 MS 2` actually shipped versus what slipped. The week landed the prioritized learner dashboard (#47 via PR #140) and the earlier FSRS plan reset in `@workspace/core` (#130). Dashboard metrics (#46) already closed under `359 MS 1`. Session layout (#48) and core study card display (#49) moved to `359 MS 3`; `/study/$courseId` stays a mode-aware placeholder (`review` / `learn` / `practice`) until those land. Module 2 business-case and product-metrics notes remain under [#109](https://github.com/hereisphil/2606-WDV349-CantuPhillip/issues/109).

* Refs [#109](https://github.com/hereisphil/2606-WDV349-CantuPhillip/issues/109)

***

## 01 November 2026

### `FEATURE` Dashboard metrics

`/dashboard` shows how many cards are due, terms learned, the daily goal, and progress for consistency, retention, new cards, and rank. Those counts stay a typed prototype seed until the API lands (#112). This work now sits in `359 MS 1`.

* See merged **[PR #128](https://github.com/hereisphil/2606-WDV349-CantuPhillip/pull/128)** — Refs [#46](https://github.com/hereisphil/2606-WDV349-CantuPhillip/issues/46)

### `DOCUMENTATION` Week 1 milestone summary

Replaced the `359 MS 1` plan with a short summary of what landed: `Section`, `Heading`, and `Text` (#105), the prototype sign-in bypass (#110), the dashboard shell and metrics overview (#45, #46), and the Change Order (#104).

* Refs [#104](https://github.com/hereisphil/2606-WDV349-CantuPhillip/issues/104)

***

## 2 November 2026

### `DX` Reset `@workspace/core`; adopt FSRS (`ts-fsrs`)

Cleared premature hand-rolled SM-2 scaffolding from `packages/core` (nothing in `apps/web` imported it yet). Left a plan-only README: wrap [`ts-fsrs`](https://github.com/open-spaced-repetition/ts-fsrs) inside `@workspace/core` when MS 3 needs grading. Aligned `dev/memli/docs/`, root course docs, and Cursor rules.

* Refs [#130](https://github.com/hereisphil/2606-WDV349-CantuPhillip/issues/130)

***

## 28 October 2026

### `DOCUMENTATION` WDV359 Change Order & Prototype-First Roadmap

Added `## Change Order` sections to [`docs/ProjectProposal.md`](./ProjectProposal.md) and [`docs/TechStack.md`](./TechStack.md) for Project & Portfolio V (`1.4 Requirements - Change Order`), and aligned the 4 weekly milestones (`359 MS 1`–`359 MS 4`) around a **Prototype-First** sequence:

* **Weeks 1–3 (`359 MS 1`–`359 MS 3`)** focus entirely on the core language-learning prototype: reusable `<Section>`, `<Heading>`, and `<Text>` primitives in `@workspace/ui` (#105), a temporary `/signin` Prototype Mode bypass with a seeded test user (`usr_prototype_01`) via `useViewer()` (#110), the `/dashboard` shell and deck grid (#45–#47), the `/study/$courseId` flashcard & mnemonic session UI (#48–#51), and persistent FSRS review tracking via Hono + Drizzle + Cloudflare D1 (#106, #112) — SRS scheduler decision later recorded as `ts-fsrs` in `@workspace/core` (#130).
* **Week 4 (`359 MS 4`)** replaces the prototype bypass with real Better Auth Email/Password (#108) and Google OAuth / Passkeys (#107), gates `TanStackRouterDevtools` to development only (#113), and promotes the verified Beta release (`dev → stage → main`, #114–#115).
* Removed unused WDV349 boilerplate directories (`dev/portfolio/` and `.github/ISSUE_TEMPLATE/`) and updated repository and monorepo documentation (`README.md`, `dev/memli/docs/`, `.cursor/rules/`).

***

## 27 October 2026

### `DX` Verify before deploy

Pull requests into `dev`, `stage`, and `main` now run a `validate` check (`.github/workflows/verify.yml`): Prettier, TypeScript (app packages and the Worker entry, which Turbo does not typecheck), ESLint, Vitest, Knip, a production build, and a Wrangler staging dry-run. Staging and production deploys run that same check before they ship.

* The staging workflow records a GitHub deployment on the `staging` environment. It had been pointed at `stage`, so a required deployment on `main` could never succeed. Production records the `production` environment.
* `stage` requires the `validate` check, signed commits, and a linear history. Squash merges keep that history and let GitHub sign the commit it creates.

### `SECURITY` Ready for a public repo

The root README now leads with Memli and no longer includes a student number. Staging basic-auth credentials stay in Cloudflare only: `dev/memli/.cf` is untracked and gitignored, and this changelog no longer points at it.

***

## 26 October 2026

### `DX` Vite cache ignored

Ignored `.vite`. Vite writes that directory beside the app only when it cannot find `node_modules`. The optimizer cache already lives under `node_modules`.

* See merged **[PR #99](https://github.com/hereisphil/2606-WDV349-CantuPhillip/pull/99)**

***

## 18 September 2026

### `FEATURE` Homepage rhythm

Brought the hero to eye level, enlarged the type, added a secondary call to action and Why Memli cards, and softened the page surface.

* See merged **[PR #96](https://github.com/hereisphil/2606-WDV349-CantuPhillip/pull/96)** — Closes [#95](https://github.com/hereisphil/2606-WDV349-CantuPhillip/issues/95)

### `DOCUMENTATION` Product decisions written down

Added roadmap, architecture, product UX, i18n, and mobile notes under `dev/memli/docs/`, plus short Cursor rules so later work follows those decisions instead of re-deciding them in chat.

### `DX` Merged branches delete themselves

A workflow deletes a feature branch after its pull request merges, and leaves `main`, `dev`, `stage`, `research`, `changelog`, and `portfolio` alone.

* See merged **[PR #97](https://github.com/hereisphil/2606-WDV349-CantuPhillip/pull/97)** — Closes [#94](https://github.com/hereisphil/2606-WDV349-CantuPhillip/issues/94)

***

## 29 August 2026

### `DX` Shared Zod schemas

Added `@workspace/schemas` with the sign-in schema and web environment validation, so those contracts are not copied into the UI package.

* Closes [#83](https://github.com/hereisphil/2606-WDV349-CantuPhillip/issues/83)

### `DX` Spaced-repetition tests

Added `@workspace/core` and Vitest. The first tests cover SM-2 card grading. Domain logic stays out of React so a later API or mobile client can reuse it.

* Closes [#84](https://github.com/hereisphil/2606-WDV349-CantuPhillip/issues/84)

***

## 25 August 2026

### `DX` Knip

Added Knip to flag unused files, exports, and dependencies, and removed unused UI packages (`zod`, `geist`, `lucide-react`, and a few tooling deps that did not belong in `@workspace/ui`). CI runs it now; it is still not a local git hook.

* Closes [#82](https://github.com/hereisphil/2606-WDV349-CantuPhillip/issues/82)

***

## 02 August 2026

### `DX` One TypeScript config, format, and git hooks

* `@workspace/typescript-config` is the strict base that `web`, `ui`, and the Worker extend. Closes [#79](https://github.com/hereisphil/2606-WDV349-CantuPhillip/issues/79).
* Prettier has an ignore file and `format:check`. ESLint stays compatible with it. Closes [#80](https://github.com/hereisphil/2606-WDV349-CantuPhillip/issues/80).
* Lefthook formats and lints staged Memli files before commit, and typechecks before push. Hooks live at the repo root because Git hooks are repo-scoped. Closes [#81](https://github.com/hereisphil/2606-WDV349-CantuPhillip/issues/81).

***

## 01 August 2026

### `FEATURE` Marketing layout on a phone

Rebuilt the marketing nav with scroll-to-top and an accessible hamburger menu (animated open/close). Moved the Why Mnemonics heading and copy above the flashcard demo so the section reads on a narrow screen. The Vite dev server listens on the local network so a phone on the same Wi-Fi can open it.

### `DX` Shared ESLint and editor rules

Added `@workspace/eslint-config` and applied it to `web` and `ui`, including explicit return types. Added Cursor rules for this repo: branch names, commit messages, and no commit or push unless asked. Documented which GitHub account can access this repo.

* Closes [#78](https://github.com/hereisphil/2606-WDV349-CantuPhillip/issues/78)

***

## 29 June 2026

### `SECURITY` Staging Password Protection

Added HTTP Basic Auth in front of the **staging** environment so pre-release builds stay private. Production is unaffected and remains publicly accessible.

* Added a zero-dependency Cloudflare Worker guard at `dev/memli/src/index.ts` that intercepts staging requests and prompts for credentials before serving the Vite build.
* Updated `wrangler.jsonc` to register the Worker entrypoint, add the `ASSETS` binding, and scope `run_worker_first: true` to the staging environment so the guard runs *before* static assets are served (the default serves assets first and would bypass the gate).
* Credentials live only as Cloudflare secrets (`BASIC_AUTH_USER` / `BASIC_AUTH_PASS`). They are not stored in the repository.

### `ANNOUNCEMENT` Rebrand: Mnemno → Memli

Rebranded the entire web app from **Mnemno** to **Memli**. The name change had been flagged as likely in the README, and this resolves it.

* Renamed the monorepo directory from `dev/mnemno` to `dev/memli`.
* Updated all user-facing brand text across the UI (nav, footer, sign-in, about page, page title, copyright).
* Updated the root package name and Cloudflare Worker names (`memli` / `memli-staging`) in `wrangler.jsonc`. Live URLs become [memli.thereisphil.workers.dev](https://memli.thereisphil.workers.dev/) and [memli-staging.thereisphil.workers.dev](https://memli-staging.thereisphil.workers.dev/) on next deploy.
* Refreshed the root README with the new name, paths, and URLs.

***

## 28 June 2026

### `FEATURE` Sign-In Page

Built out the sign-in screen using shadcn/ui Card, Input, and Label components. Added a Back to Home link and wired up a shared footer nav.

* See merged **[PR #64](https://github.com/hereisphil/2606-WDV349-CantuPhillip/pull/64)** (*Sign-in page*) — Closes [#44](https://github.com/hereisphil/2606-WDV349-CantuPhillip/issues/44)

### `FEATURE` Landing Page Sections

Finished the marketing landing page with Hero, Why Mnemonics, and Features sections in prototype order. Added a static FlashcardDemo component and updated Nav/Footer to use hash links instead of buttons.

* See merged **[PR #63](https://github.com/hereisphil/2606-WDV349-CantuPhillip/pull/63)** (*Hero component*) — Closes [#43](https://github.com/hereisphil/2606-WDV349-CantuPhillip/issues/43)

### `REFACTOR` Shared Footer Nav

Created `site-footer-nav.tsx` as a reusable footer link component. Refactored the marketing footer and sign-in page to use it.

***

## 27 June 2026

### `ANNOUNCEMENT` Cloudflare Deployment

Set up Wrangler and GitHub Actions for automatic deploys to Cloudflare Workers.

* **Staging:** [mnemno-staging.thereisphil.workers.dev](https://mnemno-staging.thereisphil.workers.dev/) — deploys on push to `stage`
* **Production:** [mnemno.thereisphil.workers.dev](https://mnemno.thereisphil.workers.dev/) — deploys on push to `main`

### `FEATURE` Nav & Footer

Built the marketing navbar with logo, main nav links, and a Get Started CTA. Scaffolded the footer with about, community, pricing, privacy, and terms links. Also stubbed out `/contact` and `/faq` routes to keep the build clean.

* See merged **[PR #58](https://github.com/hereisphil/2606-WDV349-CantuPhillip/pull/58)** (*Nav component*) — Closes [#42](https://github.com/hereisphil/2606-WDV349-CantuPhillip/issues/42)

### `FEATURE` Hero Section (WIP)

Completed the main heading, subtext, and CTA for the Hero. Slight variation from the prototype — no badge and no caption under the CTA.

### `DOCUMENTATION` README Update

Updated the repo README with live app URLs and deployment info.

* Closes [#52](https://github.com/hereisphil/2606-WDV349-CantuPhillip/issues/52)

***

## 26 June 2026

### `FEATURE` TanStack Router

Installed and configured TanStack Router with pathless layouts for marketing, auth, and app sections. Created the root layout wrapper and basic static routes. Set the app to default to light theme.

* See merged **[PR #55](https://github.com/hereisphil/2606-WDV349-CantuPhillip/pull/55)** (*TanStack Router*) — Closes [#41](https://github.com/hereisphil/2606-WDV349-CantuPhillip/issues/41)

### `DOCUMENTATION` R6 Research Notes

Finished notes on ESLint, Husky, and Git hooks.

* See merged **[PR #54](https://github.com/hereisphil/2606-WDV349-CantuPhillip/pull/54)** (*R6-Notes*)

***

## 25 June 2026

### `FIX` Prototype Image Display

Fixed a few prototype images that weren't showing on GitHub. The filenames had square brackets `[]` in them which broke the markdown image paths.

***

## 21 June 2026

### `ANNOUNCEMENT` Monorepo Initialized

I successfully launched the core project codebase architecture for Mnemno, bootstrapping a highly optimized modern monorepo build setup using the official **shadcn/ui** Vite installation instructions ([here](https://ui.shadcn.com/docs/installation/vite)).

* Deployed `dev/mnemno` structural repository.
* Updated the `globals.css` to match my prototype's style tile.
* All other configeration came pre-configured through the shadcn/ui installation.
  * See merged **[PR #39](https://github.com/hereisphil/2606-WDV349-CantuPhillip/pull/39)** (*Issue32 shadcnui scaffold*)

### `DOCUMENTATION` Milestone 3 Planning Backlog Published

I mapped out the front-end core features directly to GitHub Issues.

* **Frontend Issues Deployed:** Opened 6 dedicated system feature track issues detailing exact execution parameters:
  * `Routes #33`: Type-safe route parameters handled via TanStack Router.
  * `Component #34`: Marketing landing views and interactive concept layouts.
  * `Component #35`: Isolated client auth panels layout screens.
  * `Page #36`: Responsive user decks dashboard and statistics widgets.
  * `State #37`: Client identity session state wrapping Better Auth hooks.
  * `State #38`: Optimistic UI card caching filters using TanStack Query.
* See Milestone: [Front-end I](https://github.com/hereisphil/2606-WDV349-CantuPhillip/milestone/6), and Milestone: [Front-end II](https://github.com/hereisphil/2606-WDV349-CantuPhillip/milestone/7).

***

## 19 June 2026

### `DOCUMENTATION` Milestone 3 Design Theory & Production Planning Research Logs Merged

I finalized and compiled the deep structural research files exploring product delivery lifecycles, atomic components, and interaction behaviors.

* **Design Heuristics (R4-Notes.md):** Documented visual safety parameters targeting the mitigation of coercive dark design patterns, integration rules for accessible focus-trapped dialog modals, and the application of Laws of UX (Miller's and Fitts's Laws).
* **Plans for Production (R5-Notes.md):** Synthesized structural REST API mapping patterns, task scaling metrics using GitHub Issues, and modular layout rules matching Atomic Web Design configurations.
  * See merged **[PR #30](https://github.com/hereisphil/2606-WDV349-CantuPhillip/pull/30)** (*Research*) — Successfully resolves and **Closes [#23](https://github.com/hereisphil/2606-WDV349-CantuPhillip/issues/23) and [#25**](https://github.com/hereisphil/2606-WDV349-CantuPhillip/issues/25).

***

## 18 June 2026

### `DESIGN` Wireframe to Prototype Migration

I cleaned up of the project repository's design folder tree and created an interactive Figma Prototype of the Mnemo app.

* **Prototype Files:** Added 8 high-fidelity layout screens mapping core workspace views (`01 - Landing page.png` through `08 - Style Tile.png`) into a clean repository folder structure located at `docs/designs/prototypes/images/`.
  * See merged **[PR #29](https://github.com/hereisphil/2606-WDV349-CantuPhillip/pull/29)** (*Designs*).

***

## 12 June 2026

### `DOCUMENTATION` Milestone 2 Research Logs Merged

Finalized and merged the academic technical research files into the dev branch.

* **Structure & UI Flow (R2-Notes):** Data regarding low-fidelity wireframing strategies, anti-patterns within the "Greybox" philosophy, and responsive website constraints.
* **Style & Identity Systems (R3-Notes):** Documented visual design principles analyzing Style Tiles, brand font selection psychology, color symbolism, and background textures.
* **Workflow Verification:** Successfully reviewed and merged via following FBWF principles.
  * See merged [PR #16](https://github.com/hereisphil/2606-WDV349-CantuPhillip/pull/16) (*Merge R2/R3-Notes.md*)

### `DESIGN` Low-Fidelity Interactive Wireframes Deployed

Successfully mapped out the UI/UX for the Mnemno core application interfaces.

* **Assets:** Generated and uploaded the Markdown file (`wireframe.md`), AI-prompt source (`prompt.txt`), and images (`.webp`).
* **Location Mapping:** Files are committed directly into the designated project directory at `docs/wires/`.
  * See merged [PR #17](https://github.com/hereisphil/2606-WDV349-CantuPhillip/pull/17) (*Added wireframe.md, prompt.txt, and webp files*)

### `DESIGN` Brand Style Tile

Published the initial style tile with the intended look-and-feel.

* **Brand Kit Publication:** Generated `StyleTile.md` and included an image (`StyleTile.png`) to establish baseline color typography hierarchies, UI components, and theme states.
* **Directory:** All documentation and assets are stored within `/docs/designs/style-tile`.
  * See merged [PR #18](https://github.com/hereisphil/2606-WDV349-CantuPhillip/pull/18) (*Style Tile*)

### `ANNOUNCEMENT` GFiletree Schema Updated

Updated our repository file tree map to preserve strict tracking with the newly introduced design, style, and wireframe assets.

* See merged [PR #21](https://github.com/hereisphil/2606-WDV349-CantuPhillip/pull/21) (*Update Filetree*)

***

## 06 June 2026

### `ANNOUNCEMENT` Branches initialized & Documentation updated

* **Trunk Line & Environment Routing:** Established stable branch tracks:
  * `main`: Production-ready layer; completely locked to ensure zero unstable deployments.
  * `stage`: The pre-flight staging area used for end-to-end integration verification before production.
  * `dev`: The central staging sandbox where upcoming features are pull-requested, combined, and sanity-checked.
* **Isolated Feature Tracks:** Configured rolling workspace tracks built off the `dev` branch:
  * `research`: Ongoing technical learning, syntax tracking, and code safety analysis (`docs/research/R1-Notes.md`).
  * `proposal`: Scoping, target market definition, and product positioning tracking (`docs/ProjectProposal.md`).
  * `portfolio`: Dedicated asset bucket (`dev/portfolio`) for code curation, refactoring, and portfolio review work throughout the course cycle.
  * `changelog`: Current active branch hosting system modifications and historical engineering tracking records (`docs/changelog.md`).
  * `filetree`: Tracking the entire ecosystem of the repo's file direcotry (`docs/file.tree`).
* **Docs: Tech Stack Defined:** formally outlined the modern, edge-native technical architecture for Mnemno
  * See closed [PR #6](https://github.com/hereisphil/2606-WDV349-CantuPhillip/pull/6)
  * See [docs/TechStack.md](./docs/TechStack.md) for full details.
* **Docs: Project Proposal Published:** formalized the directional scope, user metrics, and baseline requirements for the community-driven mnemonic language platform.
  * See closed [PR #6](https://github.com/hereisphil/2606-WDV349-CantuPhillip/pull/6)
  * See [docs/TechStack.md](./docs/TechStack.md) for full details.
* **Docs: Assigned and Personal Research Completed:** documented reserach on Feature Branch Workflow (FBWF) and Minimum Release Age in Bun Runtime.
  * See [docs/research/R1-Notes.md](./docs/research/R#-Notes.md) for full details, on the `research` and `dev` branches.
* **Docs: Changelog created:** formulally documented weekly changes.
  * See [docs/changelog.md](./docs/changelog.md) for full details, on the `changelog` branch and `dev` branches.

# Mnemno: The Community Mnemonic Language Platform

## Application Definition Statement

Mnemno, pronounced "NEM-no", is an open, community-driven language learning web application designed to restore the crowd-sourced, association-based learning patterns popularized by early mnemonic platforms. While modern language apps rely heavily on automated, repetitive drill mechanics that lead to user burnout, Mnemno centers the learning process around user-generated mnemonics that are visual images, stories, and humorous hooks. The app is then supercharged by a science-backed Spaced Repetition System (SRS). The platform will deliver instantaneous flashcard interactions with rich media, allowing users to effortlessly build, share, and quick retain vast vocabularies and/or concepts.

## Target Market

The primary and secondary target market for Mnemno consists of highly motivated, independent adult language learners, polyglots, and standardized language exam students (e.g., JLPT, TOPIK, CEFR frameworks) aged 18–35.

* Demographics: Tech-literate students or young working professionals. They possess a high school or university education, work across various sectors (with a heavy lean toward tech, international business, and digital nomads), and spend their leisure time on self-improvement, cognitive training, and digital communities (Reddit, Discord).
* Primary Research: I will post on Reddit!
* Secondary Research: Language acquisition studies confirm that multi-sensory association (combining textual data with vivid visual imagery or narrative mnemonics) dramatically lowers cognitive load and shortens the path to long-term memory integration when paired with an optimal Leitner or SuperMemo-based SRS algorithm.

### References

Grand View Research. (2025, May). Online Language Learning Market (2025 - 2030). <https://www.grandviewresearch.com/industry-analysis/online-language-learning-market-report>

Valamis. (2025, April 7). Microlearning: What is it, benefits, and examples. <https://www.valamis.com/hub/microlearning>

Eurolinguiste. (n.d.). Memrise is Doing Away with User-Generated Content… Now What? <https://eurolinguiste.com/memrise-is-doing-away-with-user-generated-content-now-what>

## User Profile / Persona

* **Name**: Alex Michaels
* **Age**: 26
* **Occupation**: Junior Software Engineer / Digital Nomad
* **Education**: B.S. in Computer Science
* **Income Level**: $75,000/year
* **Hobbies**: Weightlifting, foreign cinema, traveling, reading.
* **Goals**: Achieve conversational fluency in Korean within 12 months to comfortably navigate local neighborhoods and connect deeper with the culture.
* **Frustrations with Existing Solutions**: Finds mainstream apps (like Duolingo) too slow, overly gamified, and restrictive. Used to love old-school Memrise because of the crazy, user-created "mems" that made abstract characters stick instantly, but feels alienated now that those features are completely gone. Needs a highly efficient, customizable tool he can use during quick 15-minute breaks that respects his intelligence and learning style. He's tried Anki but he feels that it's both complicated and boring.

## Use Cases

### Use Case 1: Studying an Existing Lesson via the SRS Loop

1. **Initiate**: The user logs into the dashboard via Better Auth and selects their active "Core Korean Verbs" course.
2. **Review Query**: The client application requests the next set of due cards using a TanStack Query hook, hitting the Hono edge API, which instantly pulls from Cloudflare D1 based on the user's past performance timestamps.
3. **Card Display**: The user is shown a target prompt. They type their answer and press Enter or click to reveal the answer, displaying the definition alongside a community-voted visual "mem" (served instantly from Backblaze B2).
4. **Grading**: The system self-grades their recollection as a "pass" or "no pass" and tracks this in the SRS algorithm to determine when the user should be shown the same card again.
5. **Mutation**: The application fires an optimistic state update. Drizzle ORM updates the UserProgress table on the edge with a new calculated interval, and the next card instantly slides into view without any screen flashing or reloading.

### Use Case 2: Creating and Attaching a Custom "Mem" (Mnemonic)

1. **Navigate**: While reviewing a difficult vocabulary card ("공항" - Airport), the user notices the default mnemonic isn't clicking for them.
2. **Trigger Creation**: The user clicks the "Create New Mem" button, opening an accessible shadcn/ui modal dialog.
3. **Input Data**: The user types out a quick, humorous association story: "A Gong sounds at the Hangar when you arrive at the airport."
4. **Media Upload**: The user drags and drops a custom meme image into the upload box.
5. **Processing**: The frontend sends the image to be compressed and then to the backend bucket (Backblaze B2), stores the text metadata via Hono in D1, and attaches it to the user's profile for that specific card.
6. **Publish**: The new "mem" is saved to the user's private deck and simultaneously published to the course's community pool for other students to discover, use, and upvote.

## Problem Statement

Modern language learning software has pivoted away from cognitive science and community-driven content in favor of aggressive monetization and corporate uniformity. Independent language learners face an industry-wide gap where platforms have deleted user-generated mnemonic tools ("mems"), forcing students into rigid, pre-made flashcard tracks that do not match individual memory hooks. Studies confirm that without these associative hooks or mnemonics, learners experience rapid mental fatigue, stagnant retention rates, and high drop-off rates during the intermediate plateaus of language acquisition.

## Pain Points

* **The Loss of Personalization**: Learners cannot easily anchor abstract foreign words to things they already know (pop culture references, personal jokes, specific visual memes), resulting in sterile rote memorization that doesn't stick.
* **High Latency in Interactive Apps**: Heavy, monolithic multi-page apps suffer from noticeable database query lags and asset load delays when flipping through hundreds of media-heavy flashcards, breaking the mental state of "flow" essential for fast cognitive drills.
* **Algorithmic Disconnect**: Existing open-source alternatives (like basic Anki setups) have incredibly steep learning curves, lack native modern web UI frameworks, and do not easily facilitate the rapid global sharing of learning assets or courses.

## Solution Statement

Mnemno solves this by combining a modern, accessible user interface with a completely open architecture for community mnemonics. Unlike static flashcard apps, every single item in Mnemno can support an infinite gallery of user-submitted textual and visual "mems," allowing students to browse and select the exact psychological hook that works for their brain.

Architecturally, instead of relying on traditional slow-booting stacks, Mnemno utilizes a cutting-edge edge monorepo (React + Hono + Cloudflare D1). Because the entire application database logic runs on a globally distributed CDN edge right next to the user, card mutations, grading steps, and media calls happen with sub-millisecond execution times. This delivers a level of responsiveness that competing platforms cannot achieve.

## Competition

* **[Anki](https://apps.ankiweb.net/)** _(Indirect/Direct)_: Highly powerful and flexible SRS, but suffers from an archaic UI/UX, complex syncing configurations, a steep learning curve for non-technical users, and zero native community-driven asset discovery within the app. There is a separate website to download other decks, but that too suffers from the same bad UI/UX.
* **[Duolingo](https://www.duolingo.com/)** / **[Memrise](https://memrise.com/)** _(Direct)_: Massive market share, but highly locked down. They have abandoned crowd-sourced mnemonics entirely in favor of corporate, AI-generated linear paths that prioritize superficial streaks over true deep lexical retention. To be honest, at least for Duolingo, most of its users are not my target market because many are happy with "casually learning" and wouldn't be a fit for a more serious app like Mnemno.
* **[Quizlet](https://quizlet.com/)** _(Indirect)_: Excellent UX for basic term memorization, but lacks a strict, mathematically sound Spaced Repetition System algorithm out of the box and does not treat relational mnemonic metadata as a priority.

## Features & Functionality

* **Community Courses & Levels**: In order to study specialized topics, users need the ability to build, categorize, and discover custom language courses partitioned into bite-sized levels. The platform will support full relational sorting of user-generated content.
* **The "Mem" Engine**: In order to prevent rote-learning burnout, users need to upload images and compose short stories linked directly to flashcards. This module manages user contributions, upvotes, and personal selections.
* **Edge-Native SRS Engine**: In order to optimize cognitive retention, users need a system that calculates exactly when a card is due for review. Built with Drizzle ORM, this engine dynamically updates intervals, ease factors, and timestamps seamlessly on every card grade event.
* **Type-Safe RPC API & Dashboard**: In order to track progress across devices with zero lag, developers and users need unified data contracts. Hono handles fast routing and serves data instantly to a TanStack-driven client panel.

## Integrations

* **Mnemno Core Edge API (First-Party)**: A high-performance REST/RPC API layer built using Hono, deployed as a Cloudflare Worker, exposing strict JSON endpoints for course metadata, user progress metrics, and authentication validations.
* **Backblaze B2 Object Storage via Cloudflare Bandwidth Alliance (Third-Party)**: Used for storing, serving, and caching user-generated visual mnemonics globally. This compliance adheres fully to standard S3-compatible object access policies, providing free egress routing through Cloudflare’s CDN layers for exceptional global delivery speeds.

---

## Change Order

> **Date:** October 28, 2026 · **Course:** Project & Portfolio V (WDV359) — Module 1 (`1.4 Requirements - Change Order`)

### 1. Confirmation of Project Scope

I confirm that this **Project Proposal** ([`docs/ProjectProposal.md`](./ProjectProposal.md)) and the companion **Tech Stack** specification ([`docs/TechStack.md`](./TechStack.md)) accurately summarize the core vision, target audience, and edge-native architecture of the application (originally drafted as **Mnemno**, rebranded in code to **Memli** under [`dev/memli/`](../dev/memli/), with a planned public release brand of **FluentVine**). To guarantee a complete, high-quality interactive **Prototype and MVP** over the next four weeks, I am proposing targeted adjustments to feature sequencing and scope as detailed in **Section 3** below.

### 2. Estimate of Work Remaining

Roughly **35% of the foundational work is complete** from Month 1 (WDV349) and pre-course engineering, leaving **~65% of the application work to be completed across the 4-week WDV359 schedule** (`359 MS 1` through `359 MS 4`):

* **Already Completed (~35%):**
  * **Design & UX Foundations:** Low-fidelity wireframes ([`docs/designs/wires/wireframe.md`](./designs/wires/wireframe.md)), visual Style Tile ([`docs/designs/style-tile/StyleTile.md`](./designs/style-tile/StyleTile.md)), and high-fidelity interactive Figma prototype ([`docs/designs/prototypes/prototype.md`](./designs/prototypes/prototype.md)).
  * **Monorepo & Deployment Pipeline:** Turborepo + Bun workspace (`dev/memli`), automated GitHub Actions verification (`.github/workflows/verify.yml`), and live Cloudflare Workers deployments for Staging (`memli-staging.thereisphil.workers.dev` behind HTTP Basic Auth) and Production (`memli.thereisphil.workers.dev`).
  * **Marketing Site, Static Auth UI & Core SRS Math:** Responsive marketing landing page (`/`), `/signin` form UI with shared Zod schemas (`@workspace/schemas`), and a pure TypeScript SuperMemo SM-2 spaced-repetition engine (`gradeCard()` in `@workspace/core`) verified with Vitest unit tests.
* **Work Remaining (~65% — 4 Weekly Milestones):**
  * **Week 1 — `359 MS 1 [Design Primitives + Prototype Bypass + App Shell]` (Due Nov 2):**
    * Extract reusable `<Section>`, `<Heading>`, and `<Text>` primitives into `@workspace/ui` and refactor existing stub tags without adding new marketing copy ([#105](https://github.com/hereisphil/2606-WDV349-CantuPhillip/issues/105)).
    * Temporarily disable the `/signin` form inputs, add a **"Skip & Continue to Prototype →"** button that navigates to `/dashboard`, and provide a seeded test learner (`usr_prototype_01`) via a typed `SessionContext` / `useViewer()` provider ([#110](https://github.com/hereisphil/2606-WDV349-CantuPhillip/issues/110)).
    * Build the `/dashboard` authenticated application shell and sidebar navigation ([#45](https://github.com/hereisphil/2606-WDV349-CantuPhillip/issues/45)) and finalize Module 1 Kickoff & Change Order documentation ([#104](https://github.com/hereisphil/2606-WDV349-CantuPhillip/issues/104)).
  * **Week 2 — `359 MS 2 [Dashboard Decks + Study Session & Card UI]` (Due Nov 9):**
    * Build the `/dashboard` User Metrics & Progress Overview banner ([#46](https://github.com/hereisphil/2606-WDV349-CantuPhillip/issues/46)) and Study Deck Card Item & Layout Grid ([#47](https://github.com/hereisphil/2606-WDV349-CantuPhillip/issues/47)).
    * Build the `/study/$courseId` Session Layout Scaffolding ([#48](https://github.com/hereisphil/2606-WDV349-CantuPhillip/issues/48)) and interactive Core Study Card Display ([#49](https://github.com/hereisphil/2606-WDV349-CantuPhillip/issues/49)), alongside Module 2 Business Case & Product Metrics research ([#109](https://github.com/hereisphil/2606-WDV349-CantuPhillip/issues/109)).
  * **Week 3 — `359 MS 3 [Mnemonic Engine + Persistent SRS Loop]` (Due Nov 16):**
    * Build the Mnemonic Caption & Image Overlay Frame ([#50](https://github.com/hereisphil/2606-WDV349-CantuPhillip/issues/50)) and Session Grading Controls Dock (`Forgot`, `Hard`, `Good`, `Easy`) wired to `@workspace/core` `gradeCard()` ([#51](https://github.com/hereisphil/2606-WDV349-CantuPhillip/issues/51)).
    * Scaffold the `apps/api` Hono backend + Drizzle ORM / Cloudflare D1 schema ([#106](https://github.com/hereisphil/2606-WDV349-CantuPhillip/issues/106)), persist seeded mnemonic decks and SRS review intervals for the prototype test user ([#112](https://github.com/hereisphil/2606-WDV349-CantuPhillip/issues/112)), and complete Module 3 Innovation Research & API Compliance Audit ([#111](https://github.com/hereisphil/2606-WDV349-CantuPhillip/issues/111)).
  * **Week 4 — `359 MS 4 [MVP Polish, Auth Integration & Beta Showcase]` (Due Nov 22):**
    * Replace the `/signin` prototype bypass with real Better Auth Email/Password ([#108](https://github.com/hereisphil/2606-WDV349-CantuPhillip/issues/108)) and Google OAuth / Passkey sign-in ([#107](https://github.com/hereisphil/2606-WDV349-CantuPhillip/issues/107)).
    * Gate `TanStackRouterDevtools` to development only and run the accessibility & Beta Release Audit ([#113](https://github.com/hereisphil/2606-WDV349-CantuPhillip/issues/113)), verify on Staging and promote `dev → stage → main` ([#114](https://github.com/hereisphil/2606-WDV349-CantuPhillip/issues/114)), and complete the Module 4 Showcase & Postmortem ([#115](https://github.com/hereisphil/2606-WDV349-CantuPhillip/issues/115)).

### 3. Proposed Changes to Original Project Scope

1. **Prototype-First Priority (Core SRS + Mnemonic Study Loop Before Real Authentication):**
   * **Change:** User authentication (sign-up, sign-in, sign-out, OAuth) is removed from the critical path of Weeks 1–3. Instead, `/signin` will have its form disabled with a **"Skip & Continue to Prototype →"** button that enters `/dashboard` as an automatically signed-in seeded test user (`usr_prototype_01`).
   * **Rationale:** The core value of Memli is **studying a language with Spaced Repetition (SM-2) and visual/narrative Mnemonic Images**. Front-loading authentication risks burning early milestones on boilerplate credential flows before the flashcard engine exists. By reading user identity through a clean `SessionContext` / `useViewer()` hook and keying database progress to `usr_prototype_01`, the entire prototype works end-to-end first while remaining 100% ready for Week 4's Better Auth + OAuth drop-in replacement.
2. **Freeze on Marketing & Secondary Content Pages:**
   * **Change:** The marketing homepage (`/`) remains as-is, and placeholder marketing/legal routes (`/about`, `/contact`, `/community`, `/blog`, `/pricing`, `/privacy`, `/terms`) will **not** be expanded with new content during WDV359 (only receiving the mechanical tag swap to `<Section>`, `<Heading>`, and `<Text>` in [#105](https://github.com/hereisphil/2606-WDV349-CantuPhillip/issues/105)).
   * **Rationale:** Eliminates non-essential copywriting and layout work so all frontend engineering focuses on `/dashboard` and `/study/$courseId`.
3. **Seeded Visual Mnemonics Before Live B2 Media Upload Pipeline (Use Case 2 Scoping):**
   * **Change:** For the 4-week prototype/MVP, **Use Case 1** (*Studying an Existing Lesson via the SRS Loop with Visual & Story Mnemonics*) is the primary deliverable. Flashcards will ship with rich pre-seeded visual mnemonic images and association stories stored in D1/static assets ([#50](https://github.com/hereisphil/2606-WDV349-CantuPhillip/issues/50), [#112](https://github.com/hereisphil/2606-WDV349-CantuPhillip/issues/112)), while live client-side image compression and Backblaze B2 bucket uploads (**Use Case 2**) are deferred until after the core SRS persistence loop is complete.
   * **Rationale:** Guarantees learners can experience mnemonic-powered spaced repetition immediately without blocking the prototype on third-party object storage upload pipelines.
4. **Brand Evolution & Repository Streamlining:**
   * **Change:** Documented the transition from **Mnemno** to **Memli** (`dev/memli`) with a planned future rebrand to **FluentVine** ([`dev/memli/docs/roadmap.md`](../dev/memli/docs/roadmap.md)), and removed unused WDV349 boilerplate directories (`dev/portfolio/` and `.github/ISSUE_TEMPLATE/`).

### Supplemental Links & Research References

* **Product & Architecture Decision Docs:** [`dev/memli/docs/roadmap.md`](../dev/memli/docs/roadmap.md) · [`dev/memli/docs/architecture.md`](../dev/memli/docs/architecture.md) · [`dev/memli/docs/product-ux.md`](../dev/memli/docs/product-ux.md) · [`dev/memli/docs/i18n.md`](../dev/memli/docs/i18n.md)
* **Course Research Logs:** [R1 — Feature Branch Workflow](./research/R1-Notes.md) · [R2 — Application Structure & Wireframing](./research/R2-Notes.md) · [R3 — Style & Visual Identity](./research/R3-Notes.md) · [R4 — Design Theory & UX Engineering](./research/R4-Notes.md) · [R5 — Production Planning, APIs & Components](./research/R5-Notes.md) · [R6 — Preparing for Alpha](./research/R6-Notes.md)
* **Algorithm & Domain Reference:** Wozniak, P. A. (1990). *Optimization of learning: SuperMemo SM-2 Algorithm* — implemented in [`dev/memli/packages/core/src/srs/grade-card.ts`](../dev/memli/packages/core/src/srs/grade-card.ts)
* **Project Tracking:** [GitHub Milestones (`359 MS 1`–`359 MS 4`)](https://github.com/hereisphil/2606-WDV349-CantuPhillip/milestones) · [Capstone Project Board](https://github.com/users/hereisphil/projects/1/views/1) · [Changelog](./changelog.md)


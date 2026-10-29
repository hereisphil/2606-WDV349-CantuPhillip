# Tech Stack

This document outlines the proposed modern, edge-native architecture for the classic mnemonic-based language learning platform. By moving away from standard monolithic setups, this architecture optimizes for sub-millisecond edge execution, global data distribution, and a highly streamlined developer experience (DX).

> Thursday, June 4, 2026

## Application Design

What tool(s) will you use to create click-through designs of the application? List any UI kits you would like to utilize as well.

* **[Figma Community](https://www.figma.com/community)**: I will use the public Figma Community and find a prototype that's close to what I'm envisioning. I will then edit it as I see fit. This will allow for much faster iteration then if I were to try to "rack my brain" creating my down design from stratch. Additionally, this will prevent any "AI Slop" by utilizing someone's handmade work... theoretically 👀
* **[Tailwind CSS](https://tailwindcss.com/)**: For the actual implementation, I will use Tailwind CSS. Given the interactive nature of a flashcard app, utility-first CSS ensures zero styling overhead, tiny bundle sizes, and quick styling iterations. Plus, it's what my go-to component library uses.
* **[Shadcn/ui](https://ui.shadcn.com/)**: I plan to leverage shadcn/ui (built on top of Base UI primitives) for accessible, unstyled core components like dialogs, menus, and forms. This ensures the app meets strict web accessibility standards right out of the gate while allowing total design freedom for custom "mem" (mnemonic) card displays.

## Front End Framework

List your approach for front end development. For example, React is an often used front-end solution for projects in addition to using moduleCSS, PropTypes, and an ESLint style guide.

* **[React + Vite](https://react.dev/learn/build-a-react-app-from-scratch#vite)**: I am using React paired with Vite as the build tool. Avoiding heavy, opinionated meta-frameworks like Next.js gives me total control over the client-side state and keeps production builds incredibly lean.
* **[TanStack Router](https://tanstack.com/router/latest)**: I will implement TanStack Router for type-safe, client-side routing. It provides native search param validation, which is incredibly useful for passing application state (like current card index, filter states, or course IDs) directly through the URL.
* **TypeScript & Linters**: The entire frontend is written in TypeScript. Strict code styling and code quality will be enforced via a unified ESLint and Prettier configuration to maintain a clean, readable codebase.

## State Management

What is your proposed solution for managing data? This could mean utilizing a database, local-storage, and in general state management libraries for the application (e.g. Redux).

* **[TanStack Query (Client-State & Caching)](https://tanstack.com/query/latest)**: Instead of using a heavy global state manager like Redux, I will use TanStack Query to manage server-state. Spaced repetition systems rely heavily on fast mutation feedback (e.g., grading a card "easy" or "hard"). TanStack Query handles caching, background revalidation, and optimistic updates perfectly out of the box, making the UI feel instantaneous.
* **[Cloudflare D1 (Database)](https://developers.cloudflare.com/d1/)**: On the backend, global data persistent state will live in Cloudflare D1, a native SQLite-based relational database running directly on Cloudflare’s edge network.
* **[Backblaze B2 (Object Storage)](https://www.backblaze.com/docs/cloud-storage-about-backblaze-b2-cloud-storage)**: User-submitted mnemonic images ("mems") will be stored in Backblaze B2. It integrates beautifully with Cloudflare via the Bandwidth Alliance, eliminating egress fees and serving media globally with ultra-low latency.
* **[Zod (Schema Validation)](https://zod.dev/)**: I intend to use Zod schemas shared across the frontend and backend to validate data structures both at the API boundary and inside client components.

## Node

Node is often used to serve both an API and to render a front-end. This includes using best practices, npm, and npx. What do you propose?

* **[Bun Run-Time](https://bun.com/)**: I propose substituting Node entirely for Bun as the JavaScript runtime and package manager. Bun provides incredibly fast installation speeds, a built-in test runner, and native support for TypeScript files without requiring pre-compilation steps.
* **[Turborepo Monorepo](https://turborepo.dev/)**: Instead of a standard single-folder structure, the project will be structured as a monorepo managed by Turborepo. This allows me to house the frontend application and the backend API in isolated packages while easily sharing TypeScript types and Zod schemas between them, maximizing code reuse and type safety.

## Express

Express is a popular framework to power an API. Describe your idea for building similar functionality offered by express: e.g. middleware, routes, controllers, sending and receiving JSON data.

* **[Hono Framework](https://hono.dev/)**: I am using Hono instead of Express. Hono is a lightning-fast, web-standard-compliant framework designed specifically for edge runtimes like Cloudflare Workers.
* **Edge-Native Benefits**: Unlike Express, which relies heavily on Node.js deep internals, Hono utilizes standard Web APIs (Fetch, Request, Response). This allows the entire backend API to boot instantly with zero cold starts, executing logic at the CDN edge closest to the user.
* **Middleware & Type-Safety**: Hono offers Express-like routing, middleware (for JWT/Auth handling and CORS), and body parsing, but with end-to-end type safety. By exporting the API's type definitions, the frontend can fetch data with a fully typed RPC client, completely eliminating runtime API contract mismatches.

## SQL/Postgres/Sequelize

A popular solution for relational database work is to utilize Sequelize as an ORM. Are you familiar with migrations, models, and seeding? What tools and solutions do you propose for your application? For example, utilizing an ORM to build out models with full validated CRUD.

* **[Drizzle ORM](https://orm.drizzle.team/)**: Rather than using Sequelize or Prisma, I propose Drizzle ORM. Drizzle is a lightweight, TypeScript-first ORM that embraces standard SQL syntax. It features an incredibly small footprint, making it perfectly suited for edge deployment environments where bundle size limits apply.  
* **Migrations & Seed Data**: Drizzle includes a robust CLI tool ([drizzle-kit](https://orm.drizzle.team/docs/kit-overview)) that generates SQL migration files automatically based on TypeScript schema changes. I will use this to manage database mutations safely and script seed data for initial courses, levels, and flashcards.
* **Relational Schema & Validation**: My app requires complex relational data modeling to track Spaced Repetition logic. Models will include:
  * **Users**: To handle profiles and authentication (via [Better Auth](https://better-auth.com/)).
  * **Courses & Levels**: To structure the language learning paths.
  * **Flashcards**: To hold the target words, definitions, and default mnemonics.
  * **UserProgress**: To manage relational tracking of intervals, ease factors, and next-review timestamps for the SRS algorithm.

All data operations will feature strict input validation powered by Zod inference.

> P.S. certain text have been hyper-linked to their official pages or documentation

---

## Change Order

> **Date:** October 28, 2026 · **Course:** Project & Portfolio V (WDV359) — Module 1 (`1.4 Requirements - Change Order`)

### 1. Confirmation of Tech Stack & Scope

I confirm that this **Tech Stack** document ([`docs/TechStack.md`](./TechStack.md)) and the **Project Proposal** ([`docs/ProjectProposal.md`](./ProjectProposal.md)) accurately summarize the technical architecture and scope of **Memli** (`dev/memli/`). The core stack—**React + Vite**, **TanStack Router & TanStack Query**, **Tailwind CSS + shadcn/ui (Base UI)**, **Bun + Turborepo**, **Hono**, **Cloudflare Workers & D1**, **Drizzle ORM**, **Zod**, and **Better Auth**—remains the foundation, with the architectural refinements and Prototype-First execution order detailed below.

### 2. Estimate of Technical Work Remaining

Approximately **35% of the technical architecture is already built and deployed**, leaving **~65% of the full-stack implementation across the 4-week WDV359 schedule** (`359 MS 1`–`359 MS 4`):

* **Already Implemented in [`dev/memli/`](../dev/memli/):**
  * **Monorepo & CI/CD Tooling:** Bun + Turborepo workspace with shared `@workspace/typescript-config` and `@workspace/eslint-config`, Prettier, Lefthook Git hooks ([`lefthook.yml`](../lefthook.yml)), Knip unused-code checks, Vitest, and GitHub Actions workflows ([`verify.yml`](../.github/workflows/verify.yml), [`staging.yml`](../.github/workflows/staging.yml), [`production.yml`](../.github/workflows/production.yml)) deploying to Cloudflare Workers with an edge Basic Auth gate on Staging ([`dev/memli/src/index.ts`](../dev/memli/src/index.ts)).
  * **Shared Domain & Schema Packages:**
    * `@workspace/core` ([`dev/memli/packages/core/`](../dev/memli/packages/core/)): Pure TypeScript SuperMemo SM-2 algorithm (`gradeCard()`, `createInitialCardProgress()`) with Vitest test coverage.
    * `@workspace/schemas` ([`dev/memli/packages/schemas/`](../dev/memli/packages/schemas/)): Shared Zod validation contracts (`signInSchema`, `webEnvSchema`).
    * `@workspace/ui` ([`dev/memli/packages/ui/`](../dev/memli/packages/ui/)): Shared web component library built on shadcn/ui and Base UI primitives.
  * **Web Client Foundation (`apps/web`):** File-based TanStack Router setup (`_marketing`, `_auth`, `_app`), completed marketing landing page (`/`), and `/signin` form validation.
* **Remaining Technical Work (~4 Weeks):**
  * **Week 1 (`359 MS 1` — Due Nov 2):** Build reusable CVA-based `<Section>`, `<Heading>`, and `<Text>` primitives in `@workspace/ui` ([#105](https://github.com/hereisphil/2606-WDV349-CantuPhillip/issues/105)); implement the `/signin` Prototype Mode bypass button and `SessionContext` / `useViewer()` seeded test user (`usr_prototype_01`) ([#110](https://github.com/hereisphil/2606-WDV349-CantuPhillip/issues/110)); build the `/dashboard` application shell ([#45](https://github.com/hereisphil/2606-WDV349-CantuPhillip/issues/45)).
  * **Week 2 (`359 MS 2` — Due Nov 9):** Build `/dashboard` User Metrics Banner ([#46](https://github.com/hereisphil/2606-WDV349-CantuPhillip/issues/46)) and Study Deck Grid ([#47](https://github.com/hereisphil/2606-WDV349-CantuPhillip/issues/47)); build `/study/$courseId` Session Layout ([#48](https://github.com/hereisphil/2606-WDV349-CantuPhillip/issues/48)) and interactive Flashcard Display ([#49](https://github.com/hereisphil/2606-WDV349-CantuPhillip/issues/49)).
  * **Week 3 (`359 MS 3` — Due Nov 16):** Build the Mnemonic Caption Overlay Frame ([#50](https://github.com/hereisphil/2606-WDV349-CantuPhillip/issues/50)) and Session Grading Controls Dock wired to `@workspace/core` `gradeCard()` ([#51](https://github.com/hereisphil/2606-WDV349-CantuPhillip/issues/51)); scaffold `apps/api` (Hono + Drizzle ORM + local D1/SQLite) and deck/review Zod contracts in `@workspace/schemas` ([#106](https://github.com/hereisphil/2606-WDV349-CantuPhillip/issues/106)); persist seeded mnemonic decks and SRS review state via TanStack Query ([#112](https://github.com/hereisphil/2606-WDV349-CantuPhillip/issues/112)); complete Module 3 API validation & compliance audit ([#111](https://github.com/hereisphil/2606-WDV349-CantuPhillip/issues/111)).
  * **Week 4 (`359 MS 4` — Due Nov 22):** Wire Better Auth Email/Password ([#108](https://github.com/hereisphil/2606-WDV349-CantuPhillip/issues/108)) and Google OAuth / Passkeys ([#107](https://github.com/hereisphil/2606-WDV349-CantuPhillip/issues/107)) into `apps/api` and `useViewer()`; gate `TanStackRouterDevtools` to `import.meta.env.DEV` ([#113](https://github.com/hereisphil/2606-WDV349-CantuPhillip/issues/113)); verify on Staging and promote `dev → stage → main` ([#114](https://github.com/hereisphil/2606-WDV349-CantuPhillip/issues/114)).

### 3. Proposed Technical Changes to Original Scope

1. **Formalized Monorepo Package Split (`@workspace/core`, `@workspace/schemas`, `@workspace/ui`):**
   * Added dedicated packages for pure domain logic (`packages/core`, zero React/DOM dependencies) and shared Zod schemas (`packages/schemas`), keeping `packages/ui` strictly for web components. This ensures the Hono API (`apps/api`), web client (`apps/web`), and future React Native client (`apps/mobile`) execute identical SRS math and schema validation ([`dev/memli/docs/architecture.md`](../dev/memli/docs/architecture.md)).
2. **Prototype Session Boundary (`useViewer()`) Before Better Auth Integration:**
   * Rather than blocking frontend and SRS development on authentication setup in Week 1, the app will introduce a typed `SessionContext` / `useViewer()` provider returning a seeded test user (`usr_prototype_01`) and a **"Skip & Continue to Prototype →"** bypass on `/signin` ([#110](https://github.com/hereisphil/2606-WDV349-CantuPhillip/issues/110)). Drizzle ORM tables in Week 3 ([#106](https://github.com/hereisphil/2606-WDV349-CantuPhillip/issues/106), [#112](https://github.com/hereisphil/2606-WDV349-CantuPhillip/issues/112)) will key `user_progress` records to `usr_prototype_01`, allowing Better Auth (Email/Password, Google OAuth, and Passkeys) to drop in cleanly during Week 4 ([#108](https://github.com/hereisphil/2606-WDV349-CantuPhillip/issues/108), [#107](https://github.com/hereisphil/2606-WDV349-CantuPhillip/issues/107)) without refactoring UI components.
3. **Seeded Mnemonic Media Before Direct Backblaze B2 Uploads:**
   * Initial visual mnemonics in Week 3 ([#50](https://github.com/hereisphil/2606-WDV349-CantuPhillip/issues/50), [#112](https://github.com/hereisphil/2606-WDV349-CantuPhillip/issues/112)) will use seeded image URLs and stories stored in Cloudflare D1 so the end-to-end SRS study loop is prioritized over custom media upload pipelines; direct Backblaze B2 uploads are deferred to post-prototype iteration.
4. **Internationalization-Ready Schema Conventions (`uiLocale` vs. `learningLanguage` vs. `contentLocale`):**
   * All new Drizzle models and `@workspace/schemas` contracts will separate UI language (`uiLocale`), target study language (`learningLanguage`), and mnemonic language (`contentLocale`), preparing the data layer for Phase 2 Latin American Spanish (`es-419`) support ([`dev/memli/docs/i18n.md`](../dev/memli/docs/i18n.md)).

### Supplemental Links & Research References

* **Architecture & Tooling Docs:** [`dev/memli/docs/roadmap.md`](../dev/memli/docs/roadmap.md) · [`dev/memli/docs/architecture.md`](../dev/memli/docs/architecture.md) · [`dev/memli/docs/dx-tooling.md`](../dev/memli/docs/dx-tooling.md) · [`dev/memli/docs/i18n.md`](../dev/memli/docs/i18n.md) · [`dev/memli/docs/mobile.md`](../dev/memli/docs/mobile.md)
* **Implemented Packages:** [`dev/memli/packages/core/`](../dev/memli/packages/core/) · [`dev/memli/packages/schemas/`](../dev/memli/packages/schemas/) · [`dev/memli/packages/ui/`](../dev/memli/packages/ui/)
* **Research Notes:** [R1 — Feature Branch Workflow & Bun Release Age](./research/R1-Notes.md) · [R4 — Design Theory & Accessible Modals](./research/R4-Notes.md) · [R5 — REST API Design & Atomic Components](./research/R5-Notes.md) · [R6 — Turborepo, ESLint & Pre-commit Hooks](./research/R6-Notes.md)


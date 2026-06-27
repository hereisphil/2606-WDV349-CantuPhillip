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

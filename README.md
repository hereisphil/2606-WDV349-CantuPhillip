# Memli

**Memli** is the language-learning app I am building. It brings back crowd-sourced, association-based study: learners write and share their own mnemonics (images, stories, and jokes) instead of drilling a fixed card deck. A spaced-repetition system (SRS) decides what comes back up and when.

I started this as my Full Sail University Web Development capstone. Research and early prototypes live in [`docs/`](./docs/). The app itself is the monorepo in [`dev/memli/`](./dev/memli/).


---

## Live Application

| Environment | URL |
| --- | --- |
| **Staging** | [memli-staging.thereisphil.workers.dev](https://memli-staging.thereisphil.workers.dev/) |
| **Production** | [memli.thereisphil.workers.dev](https://memli.thereisphil.workers.dev/) |

> **Note:** Staging asks for a password before it serves the app. Those credentials are Cloudflare secrets, not files in this repo. Production is public.

**Repository:** [github.com/hereisphil/2606-WDV349-CantuPhillip](https://github.com/hereisphil/2606-WDV349-CantuPhillip)

---

## Documentation

### Planning & Architecture

* **[Project Proposal](./docs/ProjectProposal.md)** — Application definition, target market, user persona, use cases, problem/solution statements, competition analysis, and feature scope.
* **[Tech Stack](./docs/TechStack.md)** — Edge-native architecture: React + Vite, TanStack Router/Query, Hono, Cloudflare D1, Drizzle ORM, Backblaze B2, Better Auth, and Bun/Turborepo monorepo tooling.
* **[Changelog](./docs/changelog.md)** — Weekly progress log and source of truth for major changes to the Memli app.

### Design

* **[Wireframes](./docs/designs/wires/wireframe.md)** — Low-fidelity Visily wireframes for the landing page, auth screen, user dashboard, and study session.
* **[Prototype](./docs/designs/prototypes/prototype.md)** — High-fidelity Figma prototype with interactive study session flows (typing test, listening test, answer reveal, session complete).
* **[Style Tile](./docs/designs/style-tile/StyleTile.md)** — Typography, color palette, and UI primitive guidelines derived from the wireframes.

### Research

Weekly research notes covering class assignments and independent study:

* [R1 — Feature Branch Workflow](./docs/research/R1-Notes.md)
* [R2 — Application Structure & Lo-Fi Wireframing](./docs/research/R2-Notes.md)
* [R3 — Style, Branding & Visual Identity](./docs/research/R3-Notes.md)
* [R4 — Design Theory & UX Engineering](./docs/research/R4-Notes.md)
* [R5 — Production Planning, APIs & Components](./docs/research/R5-Notes.md)
* [R6 — Preparing for Alpha (Component Mapping & Issue Tracking)](./docs/research/R6-Notes.md)

---

## Repository Structure

```
2606-WDV349-CantuPhillip/
├── docs/                      # Course documentation, research, designs, and changelog
│   ├── ProjectProposal.md     # Product scope, persona, use cases & WDV359 Change Order
│   ├── TechStack.md           # Edge-native stack specification & WDV359 Change Order
│   ├── changelog.md           # Weekly progress log
│   ├── designs/               # Wireframes, Figma prototypes, and style tile
│   └── research/              # Weekly R#-Notes.md research files
└── dev/
    └── memli/                 # Memli Turborepo + Bun monorepo
        ├── apps/web/          # Vite + React frontend (TanStack Router)
        ├── packages/core/     # Pure TypeScript domain logic (SM-2 SRS engine + Vitest)
        ├── packages/schemas/  # Shared Zod validation contracts & env schemas
        ├── packages/ui/       # Shared web component library (shadcn/ui + Base UI)
        └── docs/              # Product & architecture decision records (roadmap, UX, i18n)
```

---

## Local Development

The web app lives in [`dev/memli/`](./dev/memli/) — a Turborepo monorepo managed with Bun.

**Prerequisites:** [Bun](https://bun.com/) 1.3+ and Node.js 20+

```bash
cd dev/memli
bun install
bun run typecheck  # Typecheck all workspaces
bun run lint       # Lint all workspaces
bun run test       # Run Vitest unit tests (@workspace/core SRS engine)
bun run knip       # Check for unused files, exports, and dependencies
bun run build      # Production build
```

**Dev & Preview Commands:**

```bash
bun run dev          # Run the dev server on: http://localhost:5173
bun run preview      # Run the prod server on: http://localhost:4173
```

**GitHub Actions:**

- Pull requests into `dev`, `stage`, and `main` run [verify.yml](./.github/workflows/verify.yml) (format, types, lint, tests, Knip, build, and a Wrangler dry-run). Staging and production deploys run that same check before they ship.
- Pushes to the `stage` branch trigger automatic staging deployment via [staging.yml](./.github/workflows/staging.yml).
- Pushes to the `main` branch trigger automatic production deployment via [production.yml](./.github/workflows/production.yml).
- After a pull request merges, [delete-merged-branch.yml](./.github/workflows/delete-merged-branch.yml) deletes the feature branch. Long-lived branches (`main`, `dev`, `stage`, `research`, `changelog`) are left in place.

---

## Branch Strategy

| Branch | Purpose |
| --- | --- |
| `main` | Production-ready; locked to prevent unstable deployments |
| `stage` | Pre-flight staging area for integration verification |
| `dev` | Central sandbox where features are combined and sanity-checked |

Feature work branches off `dev` and merges back through pull requests following the Feature Branch Workflow documented in [R1-Notes](./docs/research/R1-Notes.md).

---

## Follow along

Work is tracked on the public [project board](https://github.com/users/hereisphil/projects/1/views/1) (titled Capstone on GitHub). The default view is the **Issue Board**: backlog of issues and features, what is ready to pick up, what is in progress, and what is in review. The **Roadmap** view on that same project is the estimated timeline.

The [Changelog](./docs/changelog.md) is the week-by-week record of what already shipped.

---

## Author

Hi! 👋 I'm **Phillip Cantu**. Feel free to reach out to me on:

- **[X @relentlessphil](https://x.com/relentlessphil)**
- **[LinkedIn](https://linkedin.com/in/phillipcantu)**
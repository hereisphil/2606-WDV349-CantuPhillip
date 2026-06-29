# Project & Portfolio IV

## Phillip Cantu

### Full Sail University<br />Web Development Program<br />Student Number: 5394162

---

**Memli** is an open, community-driven language learning web application built to restore the crowd-sourced, association-based learning patterns popularized by early mnemonic platforms. While modern language apps rely heavily on automated, repetitive drill mechanics that lead to user burnout, Memli centers the learning process around user-generated mnemonics such as: visual images, stories, and humorous hooks, that's supercharged by a science-backed Spaced Repetition System (SRS).

This repository is the capstone project for Full Sail University's Web Development degree program. The first three weeks focused on research and prototyping inside [`docs/`](./docs/). Development of the live application began as a monorepo inside [`dev/memli/`](./dev/memli/).

**Note:**<br />Formerly named "Mnemno"; rebranded to "Memli".

---

## Live Application

| Environment | URL |
| --- | --- |
| **Staging** | [memli-staging.thereisphil.workers.dev](https://memli-staging.thereisphil.workers.dev/) |
| **Production** | [memli.thereisphil.workers.dev](https://memli.thereisphil.workers.dev/) |

> **Note:** The **staging** environment is password-protected with HTTP Basic Auth so pre-release builds stay private to me and my instructor. Production stays publicly accessible. The staging login is recorded in [`dev/memli/.cf`](./dev/memli/.cf).

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
├── docs/                  # Research, design, planning, and changelog
│   ├── ProjectProposal.md
│   ├── TechStack.md
│   ├── changelog.md
│   ├── designs/           # Wireframes, prototypes, style tile
│   └── research/          # Weekly R#-Notes.md files
└── dev/
    ├── memli/             # Memli monorepo (the web app)
    │   ├── apps/web/      # Vite + React frontend (TanStack Router)
    │   └── packages/ui/   # Shared shadcn/ui component library
    └── portfolio/         # Miscellaneous portfolio work
```

---

## Local Development

The web app lives in [`dev/memli/`](./dev/memli/) — a Turborepo monorepo bootstrapped with the [shadcn/ui Vite template](https://ui.shadcn.com/docs/installation/vite).

**Prerequisites:** [Bun](https://bun.com/) 1.3+ and Node.js 20+

```bash
cd dev/memli
bun install
bun run lint       # Lint all workspaces
bun run build      # Production build
```

**commands:**

```bash
bun run dev          # Run the dev server on: http://localhost:5173
bun run preview      # Run the prod sever on: http://localhost:4173
```

**GitHub Actions:**

- Pushes to the `stage` branch trigger automatic staging deployment via [staging.yml](./.github/workflows/staging.yml).
- Pushes to the `main` branch trigger automatic production deployment via [production.yml](./.github/workflows/production.yml).

---

## Branch Strategy

| Branch | Purpose |
| --- | --- |
| `main` | Production-ready; locked to prevent unstable deployments |
| `stage` | Pre-flight staging area for integration verification |
| `dev` | Central sandbox where features are combined and sanity-checked |

Feature work branches off `dev` and merges back through pull requests following the Feature Branch Workflow documented in [R1-Notes](./docs/research/R1-Notes.md).

---

## Current Status (WIP)

The monorepo scaffold is in place with marketing pages (landing, about, pricing, community, blog, contact), TanStack routing, and a marketing shell. Prototype (static) development is underway. Still mapping Figma protoype components.

See the [Changelog](./docs/changelog.md) for the latest updates.

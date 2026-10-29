# Product & architecture docs

This folder is the **source of truth** for long-lived product and architecture decisions for the community mnemonic language-learning product currently branded **Memli** (planned rebrand: **FluentVine**).

GitHub milestones and issues track *when* and *what* to build next. These docs track *why* and *how the system should work*. Cursor rules under `.cursor/rules/` encode only the constraints that must hold **while writing code today**.

## Start here

1. **[Roadmap](./roadmap.md)** — phased plan; hub that links to every topic below.
2. Skim the deep-dives for any area you are about to implement.

## Document index

| Doc | Purpose |
| --- | --- |
| [roadmap.md](./roadmap.md) | Phases, sequencing, what *not* to do yet, links outward |
| [architecture.md](./architecture.md) | Target system shape: marketing, web app, API, mobile, domains |
| [product-ux.md](./product-ux.md) | Consumer UX rules: `/`, auth redirects, logged-in marketing access |
| [i18n.md](./i18n.md) | Localization strategy (LATAM-first: `en` + `es-419`) |
| [mobile.md](./mobile.md) | React Native / Expo plan and what to share from the monorepo |
| [state-management.md](./state-management.md) | Who owns each kind of React state; `useReducer`-first, lint-enforced; when to add `use-effect-reducer` |
| [dx-tooling.md](./dx-tooling.md) | Dev-only tools (e.g. Reactotron), when to introduce them |

## How to use these docs

- **Before a large change:** read the relevant deep-dive and the matching roadmap phase.
- **When deciding “should we split / subdomain / add a package?”:** prefer [architecture.md](./architecture.md) and [product-ux.md](./product-ux.md) over chat history or another product’s monorepo layout.
- **When touching strings, schemas, or user-facing copy:** read [i18n.md](./i18n.md).
- **When a component needs state (a second `useState`, a loading flag, a multi-step flow):** read [state-management.md](./state-management.md) first.
- **When the brand becomes FluentVine:** update branding in code, README, Cursor rules, and a short “Brand” note in [roadmap.md](./roadmap.md); keep doc *filenames* stable so links and issues do not rot.

## What does *not* live here

| Concern | Where it lives instead |
| --- | --- |
| Day-to-day stack conventions (TanStack Router, shadcn, Bun) | `.cursor/rules/memli-stack.mdc`, root [README.md](../README.md) |
| Commit / branch / GitHub auth workflow | `.cursor/rules/*` |
| Executable work items | GitHub issues & milestones (to be linked from the roadmap) |
| API endpoint catalogs | Future `apps/api` docs once the Hono service exists |

## Maintenance

- Prefer **editing these files** when a decision changes; do not leave contradictory guidance only in a closed PR or chat.
- Keep docs **decisive**: state the chosen default, then note rejected alternatives briefly.
- Avoid duplicating the full roadmap into Cursor rules—rules should stay short and always-applicable.

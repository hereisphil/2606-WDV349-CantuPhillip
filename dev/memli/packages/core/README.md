# `@workspace/core` (planned)

Pure TypeScript **domain logic** for Memli — no React, no DOM, no React Native, no I/O.

This directory is intentionally empty of code right now. Nothing in `apps/web` imports `@workspace/core` yet; the Hono API (`apps/api`) does not exist. Do **not** reintroduce a hand-rolled scheduler until a real consumer needs it (study session + persistence in MS 3).

## Why this package exists (later)

| Concern | Lives here | Does not live here |
| --- | --- | --- |
| SRS scheduling / grading transitions | ✓ | — |
| Study-session reducers (pure `status` × event) | ✓ | React wrappers in `apps/web` |
| HTTP DTOs, Zod env schemas | — | `packages/schemas` |
| UI components | — | `packages/ui` / `apps/web` |

Web, API, and future mobile all call the same functions so formulas never fork.

## SRS plan: wrap `ts-fsrs`, do not reinvent SM-2

Earlier scaffolding shipped a custom SuperMemo **SM-2** `gradeCard()`. That was premature and is removed.

**Chosen approach:** implement `@workspace/core` as a thin, Memli-shaped wrapper around [`ts-fsrs`](https://github.com/open-spaced-repetition/ts-fsrs) (Free Spaced Repetition Scheduler).

### Why FSRS over hand-rolled SM-2

- SM-2 is short to type, but easy to get subtly wrong (ease-factor “hell”, weak overdue handling, awkward knobs for different learner types).
- FSRS is the modern default in the spaced-repetition ecosystem; `ts-fsrs` is pure TypeScript and fits Workers + web + React Native.
- Defaults are strong for learners who never open settings; power users get real dials later without rewriting storage.

### Product defaults (when implemented)

- **Casual / never-touch-settings:** binary UI (`pass` / `fail`) mapped to FSRS grades (`Good` / `Again`), trained default parameters.
- **One simple preference:** desired retention (e.g. casual / balanced / exam), not Anki-style ease tweaks.
- **Power users (later):** optional 4-button grades (`Again` / `Hard` / `Good` / `Easy`), learning steps, max interval, etc. — still behind this package’s API, not raw `ts-fsrs` calls from UI.

### Architecture rules

- Apps import **`@workspace/core` only** — never import `ts-fsrs` from `apps/web` / `apps/api` / mobile.
- Return structured results (grades, due dates, card state). **No user-visible copy** (see `docs/i18n.md`).
- Persist the FSRS card state shape (stability, difficulty, state, reps, lapses, due, last review, …) when designing Drizzle/D1 tables in #106 / #112 — do not bake SM-2’s `intervalDays` / `easeFactor` / `repetitions` as the long-term schema.

## When to restore a real package

Re-add `package.json`, `tsconfig`, Vitest, and `src/` the first time MS 3 work needs grading or a session reducer (issues such as #50, #51, #106, #112). Suggested first exports:

1. Thin FSRS wrappers (`gradeCard` / create / serialize progress) with Vitest.
2. Pure study-session reducer next to them (see `docs/state-management.md`).

Until then this folder is documentation only — not a Bun workspace package.

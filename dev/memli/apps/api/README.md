# `apps/api`

The Memli backend: a [Hono](https://hono.dev/) app that runs on Cloudflare Workers. The web app talks to it today, and the mobile app will later ([`docs/architecture.md`](../../docs/architecture.md)).

So far (#106): a health check, the error format, and a local D1 database with the tables for courses, cards, mnemonics and FSRS progress. Routes that read and write them come with #112.

## Run it locally

The first time, and after pulling a new migration, set up the local database from `apps/api`:

```bash
bun run db:setup
```

Then, from `dev/memli`:

```bash
bun run dev
```

Turbo starts both apps:

| App | Command | Address |
| --- | --- | --- |
| `apps/web` | `vite` | `http://localhost:5173` |
| `apps/api` | `wrangler dev` | `http://localhost:8787` |

`wrangler dev` runs the Worker in `workerd`, the same runtime Cloudflare runs in production, so local behavior matches the deploy. The port is pinned in [`wrangler.jsonc`](./wrangler.jsonc).

To run the API alone: `bun run dev` from `apps/api`.

## How the web app reaches it: the `/api` proxy

The browser only ever talks to the web origin. Vite forwards anything under `/api` to this app ([`apps/web/vite.config.ts`](../web/vite.config.ts)):

```text
browser ──► http://localhost:5173/api/*  ──(Vite proxy)──►  http://localhost:8787/api/*
browser ──► http://localhost:5173/*      ──► the React app
```

So web code calls a relative path and never names a host or a port:

```ts
const res = await fetch("/api/health")
```

Why a proxy instead of calling `localhost:8787` from the browser:

- **No CORS.** A page on port 5173 calling port 8787 is cross-origin. Through the proxy, every request is same-origin.
- **First-party cookies.** Session cookies from Better Auth (#108) will just work, with no `SameSite=None` workarounds.
- **One path everywhere.** The app is mounted with `basePath("/api")`, so nothing rewrites paths. The same `/api/*` works behind the proxy and on a same-origin deploy.

Check it by hand with both servers running:

```bash
curl http://localhost:5173/api/health
```

It answers `{"status":"ok"}`. A `502` from that address means Vite is up but the API is not.

## Routes

| Route | Answers | Contract |
| --- | --- | --- |
| `GET /api/health` | `200 {"status":"ok"}` | `@workspace/schemas/api/health` |

`/api/health` is a liveness check: the Worker is up and routing. It does not touch the database.

## Errors are codes, not sentences

Every response that is not a success has the same body:

```json
{ "error": { "code": "NOT_FOUND" } }
```

The server never writes the sentence a learner reads. The web app maps the code to copy in the learner's UI language, so adding Spanish later touches no API code ([`docs/i18n.md`](../../docs/i18n.md)).

| Code | Status | When |
| --- | --- | --- |
| `NOT_FOUND` | 404 | No route matched, or the thing asked for does not exist |
| `INTERNAL_ERROR` | 500 | A route threw. The details go to the log, never the response |

In a route, send an error with the helper from [`src/lib/errors.ts`](./src/lib/errors.ts):

```ts
import { errorResponse } from "./lib/errors"

app.get("/courses/:id", (c) => {
  // ...
  return errorResponse(c, "NOT_FOUND")
})
```

Unknown routes and thrown errors are already handled for the whole app (`app.notFound`, `app.onError`), so a route never needs its own `try` / `catch` just to shape the response.

To add a code:

1. Add it to `apiErrorCodeSchema` in [`packages/schemas/src/api/error.ts`](../../packages/schemas/src/api/error.ts). Clients take the list from there.
2. Give it a status in `STATUS` in `src/lib/errors.ts`. TypeScript fails the build until you do.

A code is a contract. Adding one is safe. Renaming or removing one breaks every client that maps it.

## Database: D1 + Drizzle

D1 is Cloudflare's database, and it is SQLite. Locally, `wrangler` keeps it in a file under `.wrangler/state` (gitignored), and `wrangler dev` hands it to the Worker as `env.DB`. Nothing exists on Cloudflare yet; that comes with the first API deploy.

[Drizzle](https://orm.drizzle.team/) describes the tables in TypeScript ([`src/db/schema.ts`](./src/db/schema.ts)) and writes the SQL migrations from them. Wrangler applies the migrations.

```text
src/db/schema.ts ──(bun run db:generate)──► drizzle/migrations/*.sql ──(bun run db:migrate)──► local D1
```

### Tables

| Table | One row per | Notes |
| --- | --- | --- |
| `users` | learner | Better Auth's core `user` fields, plus `ui_locale`. See below |
| `courses` | course | `learning_language` and `answer_language`, never one `language` |
| `cards` | word in a course | `position` orders new words; `answers` is a JSON array |
| `mnemonics` | memory hook on a card | `story` is JSON parts, never markup; `content_locale`; `author_id` goes `null` if the author leaves |
| `user_progress` | learner and card | Core's `CardProgress`, one column per field. No row means never seen |

Deleting a course removes its cards, their mnemonics, and everyone's progress on them. Deleting a learner removes their progress and keeps their mnemonics without an author.

### FSRS progress

`user_progress` has a column for each of the eleven `CardProgress` fields: `state`, `due`, `last_review`, `stability`, `stability_fast`, `difficulty`, `reps`, `lapses`, `learning_step`, `scheduled_days`, plus the card. FSRS-7 needs all of them to schedule the next review, so none may be dropped. [`src/db/progress.ts`](./src/db/progress.ts) converts a row to and from `CardProgress`; a test proves the round trip loses nothing after real reviews.

The index on `(user_id, due)` answers the question every session starts with: what is due for this learner now?

### Timestamps

Integers of milliseconds since 1970, UTC, which Drizzle reads as `Date`. They compare as numbers, so "due before now" is an index range scan. The API turns them into the ISO strings `@workspace/schemas` uses.

### Allowed values live in one place

Enum columns (`part_of_speech`, `gender`, `state`) take their values from the Zod enums in `@workspace/schemas` and get a SQL `CHECK` constraint. The database refuses a value the API would refuse, even from a hand-written insert.

### Ready for Better Auth (#108)

`users` has exactly Better Auth's core user fields (`id`, `name`, `email`, `emailVerified`, `image`, `createdAt`, `updatedAt`). In MS 4:

- point Better Auth at it with `user: { modelName: "users" }`;
- declare `uiLocale` under `user.additionalFields`;
- run `bun run db:generate` again for the `session`, `account` and `verification` tables it adds.

Nothing in the current tables changes.

### The prototype learner

[`seed/prototype.sql`](./seed/prototype.sql) creates `usr_prototype_01`, the learner `useViewer()` has stood in for since MS 1, as a real `users` row. It is local data only, never a migration, so it can never reach a real database. Running it again updates the row instead of adding another. Starter courses come with #112.

### Changing the schema

1. Edit `src/db/schema.ts`.
2. `bun run db:generate` writes the next migration in `drizzle/migrations/`. Read the SQL.
3. `bun run db:migrate` applies it to your local database.
4. Commit the schema and the migration together.

Never edit a migration that is already committed; write a new one. CI regenerates the migrations and fails if anything changes, so a schema edit without its migration cannot merge. Prettier skips `drizzle/` for the same reason.

### Tests

[`src/db/migrations.test.ts`](./src/db/migrations.test.ts) runs the real migration and seed on an in-memory SQLite database (Node's built-in `node:sqlite`, no extra package) and checks keys, cascades and `CHECK` constraints.

To start over locally, delete `.wrangler/state` and run `bun run db:setup`.

## Layout

| File | Purpose |
| --- | --- |
| `src/app.ts` | The Hono app and its routes. Tests import this. |
| `src/lib/errors.ts` | `errorResponse`, plus the app-wide not-found and error handlers. |
| `src/env.ts` | What Cloudflare passes the Worker: the `DB` binding. |
| `src/db/schema.ts` | The tables, in Drizzle. |
| `src/db/progress.ts` | `user_progress` rows to and from core's `CardProgress`. |
| `drizzle/migrations/` | Generated SQL migrations. Never edited by hand. |
| `seed/prototype.sql` | Local data: the prototype learner. |
| `src/index.ts` | The Worker entry. It only exports the app. |
| `src/*.test.ts` | Vitest. `app.request("/api/...")` calls a route with no server running. |
| `wrangler.jsonc` | Worker name, entry, compatibility date, D1 binding, dev port. |

## Scripts

| Script | Purpose |
| --- | --- |
| `bun run dev` | `wrangler dev` on port 8787 |
| `bun run db:setup` | Apply migrations and seed the local database. Safe to run again |
| `bun run db:generate` | Write a migration from `src/db/schema.ts` |
| `bun run db:migrate` | Apply new migrations to the local database |
| `bun run db:seed` | Create or update the prototype learner |
| `bun run test` | Vitest |
| `bun run typecheck` | `tsc --noEmit` with Workers types |
| `bun run lint` | ESLint |
| `bun run build` | `wrangler deploy --dry-run`: bundles the Worker and uploads nothing. It fails if an import cannot run on Workers. |

## Rules

- Domain logic comes from `@workspace/core`. Request and response shapes come from `@workspace/schemas`. Do not fork either here.
- Errors go out through `errorResponse` as stable **codes**, never finished English sentences.
- No React, DOM or `@workspace/ui` imports. ESLint enforces it.

## Not yet

- **Deploying.** Nothing ships this Worker yet. Staging and production still deploy only the web assets from the root [`wrangler.jsonc`](../../wrangler.jsonc). The D1 `database_id` is a placeholder until a real database is created.
- **Review history.** `user_progress` holds where each card stands, not how it got there. Days of study, retention, and FSRS parameter training need a review log table (#112).
- **Local secrets.** When the API needs them, they go in `apps/api/.dev.vars`, which is gitignored.

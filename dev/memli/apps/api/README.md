# `apps/api`

The Memli backend: a [Hono](https://hono.dev/) app that runs on Cloudflare Workers. The web app talks to it today, and the mobile app will later ([`docs/architecture.md`](../../docs/architecture.md)).

So far: a health check, the error format, and a local D1 database with the tables for courses, cards, mnemonics, FSRS progress (#106) and the review log (#112). It is seeded with a learner and four starter courses, and three routes list courses, hand out a study session and save reviews (#112).

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
| `GET /api/courses` | Every course, with the viewer's progress in each | `@workspace/schemas/api/courses` |
| `GET /api/courses/:courseId/study` | One session's cards, each with the viewer's progress | `@workspace/schemas/api/study` |
| `POST /api/reviews` | Saves reviews; answers each card's new progress | `@workspace/schemas/srs/review` |
| `GET /api/history` | The viewer's week, days of study, retention and new words this month | `@workspace/schemas/api/history` |

`/api/health` is a liveness check: the Worker is up and routing. It does not touch the database.

Every answer carries `Cache-Control: no-store`. The data is one learner's and changes with each review, so nothing between the Worker and the app may keep a copy.

### `GET /api/courses`

What the dashboard shows: each course, plus seven numbers for the viewer.

```json
{
  "courses": [
    {
      "courseId": "spanish-core-1000",
      "title": "Spanish Core 1000",
      "learningLanguage": "es",
      "answerLanguage": "en",
      "dueCount": 0,
      "newAvailable": 4,
      "masteredCount": 0,
      "learningCount": 1,
      "unseenCount": 4,
      "trickyCount": 0,
      "lastReviewedAt": "2026-11-15T03:25:51.774Z"
    }
  ]
}
```

The route only loads rows. `summarizeCourseProgress` in `@workspace/core/study/course-progress` does the counting, so "due", "mastered" and "tricky" mean the same thing in the API, the web app and the mobile app.

### `GET /api/courses/:courseId/study`

The cards for one session, in the order to study them. `?mode=` picks the kind:

| `mode` | Cards | Order |
| --- | --- | --- |
| `review` (default) | Seen and due now | Most overdue first |
| `learn` | Never seen, up to 10 a day | Course order |
| `practice` | Tricky: forgotten 3 times or more, not yet mastered | Most forgotten first |

`?extra=5` adds new cards past the daily limit (`learn` only, 1 to 100). An unknown course answers `NOT_FOUND`; a bad `mode`, `extra` or `timeZone` answers `INVALID_REQUEST`. A session with nothing waiting answers `200` with `"cards": []`.

### Time zones and "today"

`GET /api/courses`, `GET /api/courses/:courseId/study` and `GET /api/history` take `?timeZone=`, an IANA zone like `America/Mexico_City` (default `UTC`). The web app sends the browser's. "Today", "this week" and "this month" are the learner's calendar days, not the server's: a review at 9 pm in Mexico City is on that day, though it is already tomorrow in UTC.

The daily limit of 10 new words subtracts the words already met for the first time today, there. So `newAvailable` and a `learn` session shrink as the learner learns, and the dashboard count still matches the session.

### `GET /api/history`

What the dashboard's "This week" and "Your progress" show, worked out by `summarizeHistory` in `@workspace/core/study/history` from the review log:

```json
{
  "dailyGoal": 50,
  "days": [{ "date": "2026-11-15", "wordsStudied": 3 }],
  "daysOfStudy": 1,
  "retentionPercent": 100,
  "newWordsThisMonth": 3
}
```

| Field | Rule |
| --- | --- |
| `days` | Today and the six days before it. Different words per day: a missed word answered again counts once |
| `daysOfStudy` | REDESIGN.md section 5.7: any study counts, one day off is forgiven, today is never a miss yet |
| `retentionPercent` | Reviews of words already met that were not missed, last 30 days. A first sighting is not a test of memory. `null` before any |
| `newWordsThisMonth` | Different words met for the first time this calendar month |

Days of study can reach back years, so the route never loads every review for it. It asks for the distinct **quarter hours** with any review (`studyQuarterHours`), and core turns each into a date in the learner's zone. Every zone's offset from UTC is a whole number of quarter hours (India is +5:30, Nepal +5:45), so a quarter hour never straddles anyone's midnight. That is at most 96 rows per study day. Everything else reads the last 33 days of reviews.

The quarter-hour divisor is written into the SQL, not bound: D1 binds a JavaScript number as a float, and `integer / float` is not integer division, so nothing would be grouped. A test caught exactly that.

Each card is a `Card` from `@workspace/schemas` with its mnemonics nested, most upvoted first, plus `progress`. A card the viewer has never seen arrives with fresh `new` progress, so the session reducer in `@workspace/core` can use every card as it comes.

The server chooses the cards with core's `sessionCards`, the same rules that produce the counts above. So the number on a dashboard button is always the number of cards its session holds.

It chooses first, from card ids and progress alone, then loads the full content of the chosen cards only. A 1,000-word course costs what a 10-word session needs.

### `POST /api/reviews`

```json
{
  "reviews": [
    {
      "reviewId": "7d3c1e9a-2b4f-4c6d-8e1a-5f9b0c2d3e4f",
      "cardId": "es-gato",
      "outcome": "got_it",
      "reviewedAt": "2026-11-15T03:25:51.000Z",
      "durationMs": 2100
    }
  ]
}
```

It answers the progress of every card the request named, once per card: `{ "progress": [ ... ] }`.

Each review saves two things together: the card's new state in `user_progress`, and one row in `reviews` (the review log, below).

- **A client reports what happened, never the result.** The route loads its own saved progress and schedules with core's `applyOutcome`. Extra fields in the body (a made-up `stability`, say) are dropped by the schema.
- **The server's clock decides when.** Devices' clocks disagree, and FSRS measures memory by the time since the last review. The last review in a request happened now, by the server's clock. Earlier ones in the same request keep their distance from it, because the gap between two reviews on one device is real even when its clock is wrong. One review per request, the usual case, is simply stamped now. See [`src/lib/review-batch.ts`](./src/lib/review-batch.ts).
- **In order, oldest first.** A missed word comes back in the same session, so one card can appear twice.
- **All or nothing.** One unknown card answers `NOT_FOUND` and saves nothing. The writes go in one D1 batch, which is a transaction.
- **Safe to send twice.** `reviewId` is a UUID the client makes for each review (`crypto.randomUUID()`). If a request is sent again, after a dropped connection say, the server sees ids it already has, skips those reviews, and answers the same progress. Without it, a retry would count the review twice and push the card's next date out.
- **The response time is capped again.** `durationMs` goes through core's `capElapsedMs` (30 seconds at most) on the server too. The app already caps it, but the server never takes a client's word for a number.
- A body that is not JSON, or that the schema refuses, answers `INVALID_REQUEST`.

### Who is asking

There is no sign-in until Better Auth (#108), so every request is the prototype learner, `usr_prototype_01`. Routes ask [`src/lib/viewer.ts`](./src/lib/viewer.ts) and never name a user id themselves; #108 changes that one function. Until then this API must not be deployed: anyone who can reach it is that learner.

### Checking a request

Routes never read a raw body or query string. `validate` in [`src/lib/validate.ts`](./src/lib/validate.ts) runs a schema from `@workspace/schemas` first:

```ts
routes.post("/", validate("json", submitReviewsRequestSchema), async (c) => {
  const { reviews } = c.req.valid("json") // typed, and already checked
})
```

Use `"json"` for a body and `"query"` for a query string.

### D1's limit of 100 values per statement

D1 allows 100 bound values (`?`) in one statement. A query that lists ids, `WHERE id IN (?, ?, ...)`, fails past that. `idGroups` in [`src/db/client.ts`](./src/db/client.ts) splits a list of ids into groups of 90, one query each. Plain SQLite has no such limit, which is why the route tests run on a real D1 (see Tests).

## Errors are codes, not sentences

Every response that is not a success has the same body:

```json
{ "error": { "code": "NOT_FOUND" } }
```

The server never writes the sentence a learner reads. The web app maps the code to copy in the learner's UI language, so adding Spanish later touches no API code ([`docs/i18n.md`](../../docs/i18n.md)).

| Code | Status | When |
| --- | --- | --- |
| `INVALID_REQUEST` | 400 | The body or query string is not what the route accepts |
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
| `reviews` | review | The review log: outcome, rating, response time, and the card before the review. Never changed |

Deleting a course removes its cards, their mnemonics, and everyone's progress and reviews on them. Deleting a learner removes their progress and reviews, and keeps their mnemonics without an author.

### FSRS progress

`user_progress` has a column for each of the eleven `CardProgress` fields: `state`, `due`, `last_review`, `stability`, `stability_fast`, `difficulty`, `reps`, `lapses`, `learning_step`, `scheduled_days`, plus the card. FSRS-7 needs all of them to schedule the next review, so none may be dropped. [`src/db/progress.ts`](./src/db/progress.ts) converts a row to and from `CardProgress`; a test proves the round trip loses nothing after real reviews.

The index on `(user_id, due)` answers the question every session starts with: what is due for this learner now?

### Review log

`user_progress` says where a card stands now. `reviews` says how it got there: one row per review, written once and never changed.

| Column | Holds |
| --- | --- |
| `id` | The client's `reviewId`, a UUID. The primary key, so one review is one row |
| `user_id`, `card_id` | Who reviewed what |
| `outcome` | What the learner chose: `missed`, `tough`, `got_it` or `easy` |
| `rating` | The FSRS rating the outcome became, 1 to 4 |
| `reviewed_at` | When, by the server's clock |
| `duration_ms` | Response time, capped at 30 seconds. `NULL` when unknown |
| `prior_*` | The card as it was *before* the review: state, due, last review, stability, fast stability, difficulty, learning step, scheduled days |

It is core's review log (`applyOutcome(...).log`), one column per field; [`src/db/reviews.ts`](./src/db/reviews.ts) converts it.

Why keep the card from before the review, when `user_progress` has the result? Because the result is already somewhere: it is the next review's `prior_` values, or `user_progress` for the latest. The state going in is what cannot be worked out afterwards, and it is what the future uses need:

- **Undo** puts a card back as it was.
- **FSRS parameter training** learns from "the card looked like this, and the learner then remembered or forgot it".
- **Days of study, retention and new words per day** on the dashboard are counts over these rows. The index on `(user_id, reviewed_at)` reads one learner's history in time order.

`GET /api/history` and the daily new-word limit read it, besides the duplicate check. Undo and parameter training will.

The log row and the progress update go in one D1 batch. Because the review id is the primary key, a second copy of the same review is refused by the database itself, and the batch takes its progress update down with it. That holds even when two copies of a request race each other past the route's own check.

### Timestamps

Integers of milliseconds since 1970, UTC, which Drizzle reads as `Date`. They compare as numbers, so "due before now" is an index range scan. The API turns them into the ISO strings `@workspace/schemas` uses.

### Allowed values live in one place

Enum columns (`part_of_speech`, `gender`, `state`) take their values from the Zod enums in `@workspace/schemas` and get a SQL `CHECK` constraint. The database refuses a value the API would refuse, even from a hand-written insert.

### Language columns

Four columns hold a language, and each says which one ([`docs/i18n.md`](../../docs/i18n.md)). No table has a plain `language` column.

| Column | Means |
| --- | --- |
| `users.ui_locale` | The app's own language for this learner |
| `courses.learning_language` | What the course teaches |
| `courses.answer_language` | What its answers and translations are written in |
| `mnemonics.content_locale` | What the story and picture description are written in |

All four are `NOT NULL` and hold a canonical BCP 47 tag (`es`, `pt-BR`, `es-419`), the rule `languageTagSchema` uses. SQL has no `Intl`, so the database checks the shape: it refuses `''`, `English`, `ES`, `pt-br` and `pt_BR`, and a test proves it agrees with `languageTagSchema` on every sample.

The rule is enforced by **triggers** in [`0002_language_tag_checks.sql`](./drizzle/migrations/0002_language_tag_checks.sql), not `CHECK` constraints. Adding a `CHECK` to an existing SQLite table means rebuilding it, and that is not safe on D1 (see "Changing the schema"). A trigger is added in place. Drizzle does not model triggers, so the columns in `src/db/schema.ts` point to that file.

A test lists every column whose name contains `language` or `locale` and fails if one is missing its two triggers (before insert, before update). A new language column needs a name that says what it is about, and a migration like `0002`.

### Ready for Better Auth (#108)

`users` has exactly Better Auth's core user fields (`id`, `name`, `email`, `emailVerified`, `image`, `createdAt`, `updatedAt`). In MS 4:

- point Better Auth at it with `user: { modelName: "users" }`;
- declare `uiLocale` under `user.additionalFields`;
- run `bun run db:generate` again for the `session`, `account` and `verification` tables it adds.

Nothing in the current tables changes.

### Seed data

[`seed/prototype.sql`](./seed/prototype.sql) fills the local database. It is local data only, never a migration, so it can never reach a real database.

| Table | Seeded rows |
| --- | --- |
| `users` | `usr_prototype_01`, the learner `useViewer()` has stood in for since MS 1, plus five mnemonic authors (`usr_seed_*`) |
| `courses` | Spanish Core 1000, Japanese Hiragana & Katakana, French Travel Phrases, Portuguese Essentials |
| `cards` | 16 words: 5 Spanish, 4 Japanese, 4 French, 3 Portuguese |
| `mnemonics` | 6 stories on three Spanish cards, two with a picture |
| `user_progress` | None. Every card starts new; reviews fill it in |

Things worth knowing:

- **Every row is an upsert.** `INSERT ... ON CONFLICT (id) DO UPDATE` adds the row the first time and updates it after that. So `bun run db:seed` is safe to run again, picks up your edits to the file, and never touches `user_progress`: reseeding keeps your reviews.
- **A mnemonic's author is a `users` row.** The name shown under a story is that user's `name`, which is why the seed has five more users than learners.
- **Each language is its own column.** A course has `learning_language` and `answer_language`; a mnemonic has `content_locale`. None of them is a learner's `ui_locale` ([`docs/i18n.md`](../../docs/i18n.md)).
- **Some Spanish cards have no mnemonic, and some mnemonics have no picture**, on purpose, so those screens show up in a real course.
- **Pictures** are files in [`apps/web/public/mnemonics`](../web/public/mnemonics). `image_src` is the path the browser asks for.

To add a word, add a row to the `cards` insert with the next `position` in its course. The comments at the top of the file cover the two quoting rules (SQL doubles a quote, JSON uses double quotes).

### Changing the schema

1. Edit `src/db/schema.ts`.
2. `bun run db:generate` writes the next migration in `drizzle/migrations/`. Read the SQL.
3. `bun run db:migrate` applies it to your local database.
4. Commit the schema and the migration together.

Never edit a migration that is already committed; write a new one. CI regenerates the migrations and fails if anything changes, so a schema edit without its migration cannot merge. Prettier skips `drizzle/` for the same reason.

**Watch for table rebuilds.** SQLite cannot change most constraints in place, so for those `drizzle-kit` writes a rebuild: `PRAGMA foreign_keys=OFF`, create `__new_<table>`, copy the rows, drop the old table, rename. On D1 that destroys data. D1 runs each migration as one transaction, where that pragma does nothing, so dropping the old table fires every `ON DELETE CASCADE`. Rebuilding `courses` deletes every card, mnemonic, progress row and review; `PRAGMA defer_foreign_keys` does not stop it either. Both were tried while writing `0002`.

If a generated migration has `__new_` in it and the table has children, do not commit it. Reach the same rule another way: a trigger (as in `0002`), a new column, or a new table. For hand-written SQL, `bunx drizzle-kit generate --custom --name <name>` makes an empty migration that CI's regenerate check accepts.

[`src/db/migrations-d1.test.ts`](./src/db/migrations-d1.test.ts) guards this. It applies the first migration to a real D1, seeds it, then applies each later one and fails if any table lost rows.

### Tests

Two kinds of database, for two kinds of test.

**Schema and seed tests** run on an in-memory SQLite database (Node's built-in `node:sqlite`, no extra package), built from the real migration files by [`src/db/test-database.ts`](./src/db/test-database.ts). They are instant.

- [`src/db/migrations.test.ts`](./src/db/migrations.test.ts) checks keys, cascades, `CHECK` constraints and the language triggers.
- [`src/db/seed.test.ts`](./src/db/seed.test.ts) runs the seed, reads the rows back in the shape the API will send, and parses them with the Zod schemas in `@workspace/schemas`. The seed is SQL written by hand, so this is what catches a misspelled part of speech, broken JSON, or a picture that does not exist. It also seeds twice to prove nothing is duplicated and progress survives.

**Migration safety** ([`src/db/migrations-d1.test.ts`](./src/db/migrations-d1.test.ts)) also needs a real D1, because plain SQLite applies `PRAGMA foreign_keys=OFF` and would hide the data loss described in "Changing the schema".

**Route tests** ([`src/routes/*.test.ts`](./src/routes)) need what a route needs: a D1 binding. [`src/db/test-d1.ts`](./src/db/test-d1.ts) gets one from wrangler's `getPlatformProxy`, which starts `workerd`, the runtime `wrangler dev` and Cloudflare use, with an in-memory database. So the tests call the real routes on a real D1, limits included, and never touch your local database. They add their own rows with Drizzle; one group runs the real seed.

The server's clock is faked in these tests (`vi.useFakeTimers({ toFake: ["Date"] })`), so "a card comes due later" is a line of code, not a wait.

To start over locally, delete `.wrangler/state` and run `bun run db:setup`.

## Layout

| File | Purpose |
| --- | --- |
| `src/app.ts` | The Hono app. It mounts the routes. Tests import this. |
| `src/routes/courses.ts` | `GET /api/courses` and `GET /api/courses/:courseId/study`. |
| `src/routes/reviews.ts` | `POST /api/reviews`. |
| `src/routes/history.ts` | `GET /api/history`. |
| `src/lib/errors.ts` | `errorResponse`, plus the app-wide not-found and error handlers. |
| `src/lib/validate.ts` | `validate`: checks a body or query string against a schema. |
| `src/lib/viewer.ts` | Who is asking. The prototype learner until #108. |
| `src/lib/review-batch.ts` | Pure: reported reviews to new progress, on the server's clock. |
| `src/env.ts` | What Cloudflare passes the Worker: the `DB` binding. |
| `src/db/client.ts` | Drizzle around the D1 binding, `runTogether` (one transaction) and `idGroups`. |
| `src/db/schema.ts` | The tables, in Drizzle. |
| `src/db/content.ts` | Reads courses, cards and mnemonics as `@workspace/schemas` shapes. |
| `src/db/progress.ts` | Reads and saves `user_progress` as core's `CardProgress`. |
| `src/db/reviews.ts` | Writes the review log with progress; reads it back for history and the daily limit. |
| `drizzle/migrations/` | Generated SQL migrations. Never edited by hand. |
| `seed/prototype.sql` | Local data: the prototype learner, starter courses, cards and mnemonics. |
| `src/db/test-database.ts` | For tests: an in-memory SQLite database from the real migrations and seed. |
| `src/db/test-d1.ts` | For route and migration tests: a real in-memory D1, plus rows to fill it. |
| `src/index.ts` | The Worker entry. It only exports the app. |
| `src/**/*.test.ts` | Vitest. `app.request("/api/...")` calls a route with no server running. |
| `wrangler.jsonc` | Worker name, entry, compatibility date, D1 binding, dev port. |

## Scripts

| Script | Purpose |
| --- | --- |
| `bun run dev` | `wrangler dev` on port 8787 |
| `bun run db:setup` | Apply migrations and seed the local database. Safe to run again |
| `bun run db:generate` | Write a migration from `src/db/schema.ts` |
| `bun run db:migrate` | Apply new migrations to the local database |
| `bun run db:seed` | Create or update the seeded learner, courses, cards and mnemonics |
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
- **Sign-in.** Every request is the prototype learner until Better Auth (#108). See "Who is asking".
- **Undo and FSRS parameter training.** The review log has what both need; nothing uses it for them yet.
- **"Cleared" on past days.** A day the learner finished everything under the goal shows a check today, but not once it is past: that needs what was due at the end of each day, which nothing records yet.
- **A daily goal per learner.** Everyone's is 50 words (`DAILY_GOAL_WORDS` in core).
- **Enrollment.** `GET /api/courses` lists every course. There is no "my courses" yet.
- **Local secrets.** When the API needs them, they go in `apps/api/.dev.vars`, which is gitignored.

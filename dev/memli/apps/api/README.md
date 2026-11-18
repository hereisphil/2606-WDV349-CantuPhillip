# `apps/api`

The Memli backend: a [Hono](https://hono.dev/) app that runs on Cloudflare Workers. The web app talks to it today, and the mobile app will later ([`docs/architecture.md`](../../docs/architecture.md)).

So far: a health check, the error format, and a local D1 database with the tables for courses, cards, mnemonics, FSRS progress (#106) and the review log (#112). It is seeded with a learner and four starter courses, and three routes list courses, hand out a study session and save reviews (#112).

## Run it locally

The first time, from `apps/api`, make your local secrets file. It is gitignored:

```bash
cp .dev.vars.example .dev.vars
```

Put your own value in it (`openssl rand -base64 32`). Then, the first time and after pulling a new migration, set up the local database:

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
| `GET`, `POST /api/auth/*` | Sign-up, sign-in, the session and sign out, by Better Auth | `@workspace/schemas/auth/sign-up`, `auth/sign-in` |

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

### `/api/auth/*`: sign-in (#108)

[Better Auth](https://www.better-auth.com/) owns every route under `/api/auth`. [`src/lib/auth.ts`](./src/lib/auth.ts) configures it, and `app.ts` hands it the request.

| Route | Does |
| --- | --- |
| `POST /api/auth/sign-up/email` | Creates a learner from `name`, `email` and `password`, and signs them in |
| `POST /api/auth/sign-in/email` | Signs in with `email` and `password` |
| `GET /api/auth/get-session` | The signed-in learner and their session, or `null` |
| `POST /api/auth/sign-out` | Deletes the session on the server and clears the cookie |

The web app will call these through Better Auth's client, not by hand.

- **A session is a cookie.** `HttpOnly`, `SameSite=Lax`, and `Secure` whenever `BETTER_AUTH_URL` is `https`. It lasts 7 days and renews after a day of use.
- **Passwords** are 8 to 128 characters with a capital letter, a lowercase letter and a symbol, the rules in `@workspace/schemas/auth/sign-up`. Better Auth checks the length (`PASSWORD_TOO_SHORT`, `PASSWORD_TOO_LONG`). A hook in `auth.ts` checks the rest on sign-up, password change and password reset, and answers `400` with `PASSWORD_TOO_WEAK`. Sign-in never checks them, so no one is locked out by a rule change. Better Auth stores a scrypt hash in `accounts.password`. On Workers it hashes with `node:crypto`, which is why `wrangler.jsonc` turns on `nodejs_compat`.
- **A breached password is refused.** Better Auth's `haveibeenpwned` plugin asks `api.pwnedpasswords.com` about every new password and answers `400` with `PASSWORD_COMPROMISED` on a match. It sends the first five characters of the password's SHA-1 hash, never the password. If that service is down, sign-up answers `500` and makes no account. Tests never call it: `src/test-setup.ts` swaps in a stand-in from [`src/lib/test-breach-list.ts`](./src/lib/test-breach-list.ts).
- **A name** is trimmed and cut at 64 characters, at sign-up and on a later rename, because it is shown under the learner's mnemonics. A blank name is refused.
- **`uiLocale` starts as `en`** and a sign-up body cannot set it. Neither can it set `emailVerified`.
- **A wrong password and an unknown email answer the same**: `401` with `INVALID_EMAIL_OR_PASSWORD`.
- **Tries are limited per address**, counted in the `rate_limits` table so every Worker instance sees the same count. Sign-in allows 3 tries in 10 seconds, and sign-up 5 new accounts a minute. A refusal is `429` with `X-Retry-After` in seconds. The address is Cloudflare's `cf-connecting-ip` header, never `X-Forwarded-For`, which any client can set. Locally there is no such header, so every request shares one count.
- **Writes must come from the app's own origin.** A `POST` carrying a cookie, or sent by a page on another site, answers `403` unless its `Origin` is `BETTER_AUTH_URL`. Better Auth turns this check off by itself under a test runner, so `auth.ts` sets it on by name and the tests run against the real thing.
- **Errors here are Better Auth's shape**, `{ "code": "…", "message": "…" }`, not the `{ "error": { "code" } }` of Memli's own routes. The web app maps the `code` to copy and never shows the English `message`.

Two settings come from the environment, checked by `apiEnvSchema` in `@workspace/schemas/env/api`:

| Name | What | Where it is set |
| --- | --- | --- |
| `BETTER_AUTH_SECRET` | Signs session cookies. At least 32 characters | `.dev.vars` locally; `wrangler secret put BETTER_AUTH_SECRET --env staging` on Cloudflare. Never in the repo |
| `BETTER_AUTH_URL` | The origin learners see, with no path. The only origin sign-in trusts | `vars` in [`wrangler.jsonc`](./wrangler.jsonc), one per environment |

Locally `BETTER_AUTH_URL` is the web app's `http://localhost:5173`, not this Worker's port, because the browser reaches the API through the Vite proxy. With a missing or short secret, every `/api/auth/*` request answers `INTERNAL_ERROR` and the reason is in the log.

### Who is asking

Every route under `/api/courses`, `/api/reviews` and `/api/history` needs a session. `requireViewer` in [`src/lib/viewer.ts`](./src/lib/viewer.ts) asks Better Auth for the session behind the request's cookie. With none, or one that has ended, the route answers `401` with `UNAUTHORIZED` and never runs. Otherwise it remembers the learner's id, and the route reads it with `viewerId(c)`.

Routes never take a user id from the body, the query string or a path. So one learner can never read or change another's progress, and a test proves it ([`src/lib/viewer.test.ts`](./src/lib/viewer.test.ts)). `GET /api/health` and `/api/auth/*` need no session.

In tests, `api.request(path, init)` is signed in as the viewer (`usr_prototype_01`) once that learner exists. Pass a third argument to be someone else, or `null` for no session.

### Checking a request

Routes never read a raw body, query string or path param. `validate` in [`src/lib/validate.ts`](./src/lib/validate.ts) runs a schema from `@workspace/schemas` first:

```ts
routes.post("/", validate("json", submitReviewsRequestSchema), async (c) => {
  const { reviews } = c.req.valid("json") // typed, and already checked
})
```

Use `"json"` for a body, `"query"` for a query string and `"param"` for path params like `:courseId`.

A `"json"` body must be sent as `Content-Type: application/json` (a charset is fine), or the route answers `INVALID_REQUEST`. A cross-site form can only send form or plain-text bodies, so this also refuses a forged write. Ids are capped at 64 characters by `idSchema` in `@workspace/schemas`, so no request can make the Worker read an unbounded string. The full list of what the API enforces, and what is still open, is in [`docs/security.md`](../../docs/security.md).

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
| `UNAUTHORIZED` | 401 | No session, or one that has ended. The learner signs in again |
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

D1 is Cloudflare's database, and it is SQLite. Locally, `wrangler` keeps it in a file under `.wrangler/state` (gitignored), and `wrangler dev` hands it to the Worker as `env.DB`. Staging uses `memli-staging` on Cloudflare (`env.staging` in [`wrangler.jsonc`](./wrangler.jsonc)). Production has no database yet.

[Drizzle](https://orm.drizzle.team/) describes the tables in TypeScript ([`src/db/schema.ts`](./src/db/schema.ts)) and writes the SQL migrations from them. Wrangler applies the migrations.

```text
src/db/schema.ts ──(bun run db:generate)──► drizzle/migrations/*.sql ──(bun run db:migrate)──► local D1
```

### Tables

| Table | One row per | Notes |
| --- | --- | --- |
| `users` | learner | Better Auth's core `user` fields, plus `ui_locale`. See below |
| `sessions` | signed-in browser | Better Auth's `session`. `token` is what the cookie carries; sign out deletes the row |
| `accounts` | way a learner signs in | Better Auth's `account`. For email sign-in, `provider_id` is `credential` and `password` is a scrypt hash |
| `verifications` | short-lived token | Better Auth's `verification`, for things like a password reset |
| `rate_limits` | client address and path | Better Auth's `rateLimit`: how many tries, and when the last one was (#169) |
| `courses` | course | `learning_language` and `answer_language`, never one `language` |
| `cards` | word in a course | `position` orders new words; `answers` is a JSON array |
| `mnemonics` | memory hook on a card | `story` is JSON parts, never markup; `content_locale`; `author_id` goes `null` if the author leaves |
| `user_progress` | learner and card | Core's `CardProgress`, one column per field. No row means never seen |
| `reviews` | review | The review log: outcome, rating, response time, and the card before the review. Never changed |

Deleting a course removes its cards, their mnemonics, and everyone's progress and reviews on them. Deleting a learner removes their sessions, accounts, progress and reviews, and keeps their mnemonics without an author.

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

### Better Auth's tables (#108)

`users` has exactly Better Auth's core user fields (`id`, `name`, `email`, `emailVerified`, `image`, `createdAt`, `updatedAt`), so sign-in needed no change to it. `uiLocale` is declared under `user.additionalFields` in [`src/lib/auth.ts`](./src/lib/auth.ts).

`sessions`, `accounts`, `verifications` and `rate_limits` are Better Auth's other models, written by hand in `src/db/schema.ts` like every other table, so Drizzle stays the one source of migrations. The Drizzle adapter's `usePlural` maps Better Auth's `user`, `session`, `account`, `verification` and `rateLimit` to these plural names. Better Auth checks its models against the schema the first time it runs, so a missing column fails loudly.

When a Better Auth plugin needs a new table or column (passkeys in #107, say), add it to `src/db/schema.ts` and to the `schema` handed to the adapter, then `bun run db:generate`.

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
| `src/lib/viewer.ts` | `requireViewer`, which needs a session, and `viewerId`, who is asking. |
| `src/lib/auth.ts` | Better Auth's configuration: sign-up, sign-in and sessions under `/api/auth/*`. |
| `src/test-setup.ts` | Runs before every test. Stands in for the breached-password service. |
| `src/lib/review-batch.ts` | Pure: reported reviews to new progress, on the server's clock. |
| `src/env.ts` | What Cloudflare passes the Worker (`DB`, `BETTER_AUTH_URL`, `BETTER_AUTH_SECRET`), and what middleware passes a route (`viewerId`). |
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
| `wrangler.jsonc` | Worker name, entry, compatibility date and flags, D1 binding, `BETTER_AUTH_URL`, required secrets, dev port. |
| `.dev.vars.example` | The local secrets to copy into `.dev.vars`. |
| `worker-configuration.d.ts` | Generated by `bun run cf-typegen`. Workers runtime types for this compatibility date, plus the global `Env` with `DB`. Never edited by hand. |

## Scripts

| Script | Purpose |
| --- | --- |
| `bun run dev` | `wrangler dev` on port 8787 |
| `bun run db:setup` | Apply migrations and seed the local database. Safe to run again |
| `bun run db:generate` | Write a migration from `src/db/schema.ts` |
| `bun run db:migrate` | Apply new migrations to the local database |
| `bun run db:seed` | Create or update the seeded learner, courses, cards and mnemonics |
| `bun run test` | Vitest |
| `bun run cf-typegen` | `wrangler types`: regenerate `worker-configuration.d.ts`. Run it after changing `wrangler.jsonc` or upgrading wrangler |
| `bun run typecheck` | `tsc --noEmit` with the generated Workers types |
| `bun run lint` | ESLint |
| `bun run build` | `wrangler deploy --dry-run`: bundles the Worker and uploads nothing. It fails if an import cannot run on Workers. |
| `bun run db:migrate:staging` | Apply new migrations to `memli-staging`. The staging deploy runs it first |
| `bun run db:seed:staging` | Seed `memli-staging`. Run by hand after changing the seed; deploys don't |
| `bun run deploy:staging` | Deploy `memli-api-staging`. The staging deploy runs it before the gate Worker |

## Rules

- Domain logic comes from `@workspace/core`. Request and response shapes come from `@workspace/schemas`. Do not fork either here.
- Errors go out through `errorResponse` as stable **codes**, never finished English sentences.
- No React, DOM or `@workspace/ui` imports. ESLint enforces it.

## Not yet

- **Production.** Only staging runs this Worker (#165). [`staging.yml`](../../../../.github/workflows/staging.yml) migrates `memli-staging`, deploys `memli-api-staging`, then deploys the root gate Worker, which sends `/api/*` to it through its `API` binding after the password check. Production waits for sign-in (#108); until then its `/api/*` answers a JSON 503.
- **Undo and FSRS parameter training.** The review log has what both need; nothing uses it for them yet.
- **"Cleared" on past days.** A day the learner finished everything under the goal shows a check today, but not once it is past: that needs what was due at the end of each day, which nothing records yet.
- **A daily goal per learner.** Everyone's is 50 words (`DAILY_GOAL_WORDS` in core).
- **Enrollment.** `GET /api/courses` lists every course. There is no "my courses" yet.

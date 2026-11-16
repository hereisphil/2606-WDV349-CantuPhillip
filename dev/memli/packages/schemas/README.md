# `@workspace/schemas`

Shared [Zod](https://zod.dev/) schemas for Memli — the FE/BE contract layer.

Use this package for validation at API boundaries, forms, and env parsing. **Do not** put Zod in `@workspace/ui`.

## Exports

| Import | Use for |
|--------|---------|
| `@workspace/schemas/api/courses` | `GET /api/courses` response: `CourseSummary`, a course plus the viewer's counts in it |
| `@workspace/schemas/api/error` | The API's error body and its stable error codes |
| `@workspace/schemas/api/health` | `GET /api/health` response |
| `@workspace/schemas/api/history` | `GET /api/history`: its `timeZone` query and `StudyHistoryData` (the week, days of study, retention, new words) |
| `@workspace/schemas/api/study` | `GET /api/courses/:courseId/study`: the `mode` and `extra` query, and `StudySession` (cards with progress) |
| `@workspace/schemas/auth/sign-in` | Sign-in form input |
| `@workspace/schemas/content/course` | `Course` (title, `learningLanguage`, `answerLanguage`) and `CourseCards` (the cards to study). A course, never a "deck", in code as on screen |
| `@workspace/schemas/content/card` | `Card`: the term, accepted answers, grammar codes, example, mnemonics |
| `@workspace/schemas/content/mnemonic` | `Mnemonic` and its story parts |
| `@workspace/schemas/srs/progress` | `CardProgress` as data: the eleven FSRS-7 fields |
| `@workspace/schemas/srs/review` | Review outcomes and the review submission request and response |
| `@workspace/schemas/locale/language-tag` | A canonical BCP 47 tag, used by every language field |
| `@workspace/schemas/locale/time-zone` | An IANA time zone, for "today" where the learner is |
| `@workspace/schemas/env/web` | Vite `import.meta.env` validation |

Each file exports the schema (`cardSchema`) and its type (`Card`). Import the type alone with `import type` when you only need the shape: it costs nothing at runtime.

## Usage

```ts
import { signInSchema } from "@workspace/schemas/auth/sign-in"

const result = signInSchema.safeParse({ email, password })
```

## Language fields

Never one `language` field ([`docs/i18n.md`](../../docs/i18n.md)). Each says what it is about:

| Field | On | Means |
|-------|----|-------|
| `learningLanguage` | Course | What the course teaches: the language of each card's `term` and example sentence |
| `answerLanguage` | Course, CourseCards | What each card's `answers` and example translation are written in |
| `contentLocale` | Mnemonic | What the story and image description are written in |
| `uiLocale` | The viewer (Better Auth, #108) | The app's own language. Never stored on content |

All four take the same value, a canonical BCP 47 tag (`es`, `pt-BR`, `es-419`), so filtering by language is a plain equality check. `pt-br` and `english` are rejected.

[`src/locale/language-fields.test.ts`](./src/locale/language-fields.test.ts) keeps it that way. It walks every schema this package exports, nested fields included, and fails if a field is named just `language`, `lang` or `locale`, or if a field ending in `Language` or `Locale` accepts anything but a canonical tag. New files and fields are covered without being listed. The D1 tables have the same rule (`apps/api/README.md`, "Language columns").

## Reviews: outcomes in, progress out

A client never sends FSRS numbers. It sends what happened (`reviewId`, `cardId`, `outcome`, `reviewedAt`, `durationMs`), and the API loads its own saved progress and schedules with `@workspace/core`'s `applyOutcome`. A tampered request can report a wrong outcome, but it cannot set its own stability or due date. Extra fields are dropped when parsed.

Outcomes are core's codes (`missed`, `tough`, `got_it`, `easy`), never raw ratings 1 to 4.

`reviewId` is a UUID the app makes for each review with `crypto.randomUUID()`. It lets the API record a review once even when the request is sent twice. The session reducer in core stays pure and makes no ids; the app adds one when it sends the review.

## Keeping in step with `@workspace/core`

`ReviewOutcome`, `CardProgress`, `StudyMode` and the course counts (`CourseProgressSummary`) exist in core as TypeScript types and here as schemas. Core stays free of Zod, and this package stays free of FSRS. [`apps/api/src/contracts.test.ts`](../../apps/api/src/contracts.test.ts) checks that they match: change one without the other and `bun run typecheck` fails.

## Why these are hand-written, not derived from Drizzle tables

The tables (#106, in `apps/api`) and these contracts have different jobs. A table stores one row per mnemonic; a contract sends a card with its mnemonics nested, sorted and ready to show. Deriving the contract from the tables would tie every client, the mobile app included, to how the database happens to be laid out, and would make this shared package depend on the API. The API maps rows to these shapes. It may still use `drizzle-zod` inside itself to check rows.

## Tests

```bash
bun run test
```

Vitest, in `src/**/*.test.ts`.

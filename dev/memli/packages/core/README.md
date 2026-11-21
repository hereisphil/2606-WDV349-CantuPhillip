# `@workspace/core`

Pure TypeScript **domain logic** for Memli: answer checking, FSRS scheduling, response-time nudges, and the study-session state machine. No React, no DOM, no React Native, no I/O, and no clock: every function that needs the time takes `now`.

The web app, the Hono API (`apps/api`, #106) and the future mobile app call the same functions, so the rules never fork. Apps import `@workspace/core` only, **never `ts-fsrs` directly**.

## Product stance: not an Anki clone

Memli is for everyday learners and schools. Beginners shouldn't have to pick among cryptic `Again / Hard / Good / Easy` buttons. The default is **assistive grading**: the app checks typed answers, tells a typo from a struggle, and nudges (never punishes) based on response time. FSRS does the scheduling math; this package is the **human interface** to it.

Power-user modes, Speed Review, classroom strict mode and exact-spelling strict mode are Going Beyond work (#133–#137, #147).

## Pipeline

```text
typed answer + elapsedMs (measured by the app, paused while the tab is hidden)
        │
        ▼
  Evaluator ─────────────► exact | near (accent / typo) | wrong
        │
        ▼
  outcomeChoices ────────► what the learner may pick   ◄── suggestOutcome (timing nudge)
        │
        ▼  learner confirms
  Rating Mapper ─────────► missed | tough | got_it | easy  →  FSRS rating 1–4
        │
        ▼
  FSRS-7 (ts-fsrs) ──────► new CardProgress + review log
```

The session reducer runs the whole loop for a queue of cards.

## Exports

| Import | What it gives you |
| --- | --- |
| `@workspace/core/answer/evaluate` | `evaluateAnswer` and the `Evaluation` type |
| `@workspace/core/srs/outcome` | `ReviewOutcome`, `outcomeChoices`, `applyOutcome`, `previewOutcomeDue` |
| `@workspace/core/srs/progress` | `CardProgress`, `createProgress`, `isDue`, plus rating-level `applyRating` / `previewDue` |
| `@workspace/core/study/timing` | `capElapsedMs`, `suggestOutcome`, `MAX_INFORMATIVE_MS` |
| `@workspace/core/study/course-progress` | `summarizeCourseProgress`, `sessionCards`, `StudyMode`, `isSeen`, `isMastered`, `isTricky` and their thresholds |
| `@workspace/core/study/history` | `summarizeHistory`, `daysOfStudy`, `newWordsStartedOn`, `localDate`, `shiftDate`, `DAILY_GOAL_WORDS` |
| `@workspace/core/study/session-reducer` | `startSession`, `sessionReducer`, `SessionCard`, `SessionState`, `SessionEvent`, `SessionReview` |
| `@workspace/core/form/form-reducer` | `createFormReducer`, `startForm`, `FormState`, `FormEvent`, `FieldErrors`, `Validate` |

Apps should schedule through **outcomes** (`applyOutcome`), not ratings. The rating-level helpers stay exported for the API and tests.

### Evaluator — `answer/evaluate`

`evaluateAnswer(expected, typed, options?)` compares a typed answer with one or more accepted answers:

- **`exact`**: the same, ignoring case, extra spaces and punctuation (`"  QUÉ  tal "` matches `"¿Qué tal?"`).
- **`near`, `reason: "accent"`**: right apart from accents (`ano` for `año`). Never silently exact.
- **`near`, `reason: "typo"`**: a few typos, counted after ignoring accents with an in-house Damerau–Levenshtein (a swap of neighbouring letters is one typo). By default none are forgiven for 1–3 characters, 1 for 4–7, and 2 for 8 or more. `typoRatio` and `maxTypos` change that.
- **`wrong`**: anything further off, or blank.

`matched` is the accepted answer, as written on the card, that the learner came closest to. Language-specific rules are #135.

### Rating Mapper — `srs/outcome`

Outcomes are stable codes; `apps/web` maps them to localized labels.

| Outcome | FSRS rating | Typical label |
| --- | --- | --- |
| `missed` | 1 | "Missed it" |
| `tough` | 2 | "I wasn't sure" |
| `got_it` | 3 | "Got it" / "Just a typo — I knew it" |
| `easy` | 4 | "Easy" |

`outcomeChoices(evaluation)` lists what the learner may pick, best default first:

| Answer | Choices |
| --- | --- |
| exact | `got_it`, `easy` |
| near | `got_it` (typo), `tough` (struggle) |
| wrong | `missed` |
| revealed without typing (`null`) | all four, worst first |

`applyOutcome(progress, outcome, now)` returns `{ progress, log }`; the log includes the outcome. `previewOutcomeDue(progress, now)` gives the next due date for each outcome, for hints like "see this again in 5 days".

### FSRS scheduling — `srs/progress`

`CardProgress` is plain JSON (UTC ISO timestamps), so the same value works in React state, TanStack Query, HTTP and a D1 row. `@workspace/schemas/srs/progress` validates it at the HTTP boundary. Persist all eleven fields:

| Field | Meaning |
| --- | --- |
| `cardId` | The card this progress is for |
| `state` | `new`, `learning`, `review` or `relearning` |
| `due` | When it should next be reviewed |
| `lastReview` | `null` until the first review |
| `stability` | Days until recall probability falls to 90% |
| `stabilityFast` | FSRS-7's short-term stability |
| `difficulty` | 1 (easy) to 10 (hard); 0 before the first review |
| `reps`, `lapses` | Reviews, and times forgotten after being learned |
| `learningStep` | Position in the learning or relearning steps |
| `scheduledDays` | Days between `lastReview` and `due` (fractional) |

The scheduler is ts-fsrs v6's **FSRS-7** preset with 90% desired retention, built synchronously so a reducer never awaits. A test checks it schedules exactly like `DefaultScheduler()`. Other details:

- **Fuzz is on**: intervals of 2.5+ days shift slightly so cards learned together don't come due together. It's seeded by card ID and review count, so the same review always gives the same result.
- **Clock skew**: a review dated before the card's last review is treated as happening at the last one. The API should still stamp reviews with the server's time (#112).
- **Review logs** record the card *before* the review, for undo and future parameter training.
- FSRS-7 is bold with first reviews: a brand-new card rated `got_it` is due in about 4.8 days, `easy` in about 54. See the note in #51.

### Silent timing — `study/timing`

- `capElapsedMs(ms)` drops broken measurements (negative, `NaN`, infinite) and caps long gaps at 30 s. Store the result as a review's `durationMs`.
- `suggestOutcome({ evaluation, elapsedMs, progress })` returns an outcome to pre-highlight, or `null`. A quick exact answer suggests `easy` (never on a first review); a quick near answer suggests `got_it`, a slow one `tough`. "Quick" is 2 s plus 0.3 s per character. Timing never lowers a grade on its own.

Measuring the time and pausing it while the tab is hidden are app concerns.

### Study session — `study/session-reducer`

```ts
// apps/web — the React wrapper is one line
const [session, dispatch] = useReducer(sessionReducer, cards, startSession)
```

```text
prompt ──SUBMIT / REVEAL──▶ answered ──RESOLVE──▶ prompt (next card)
                                              └──▶ complete ──RESTART──▶ prompt
```

- Cards are generic: core needs `progress` and `answers`; apps add the prompt, mnemonic, audio and so on.
- `SUBMIT` evaluates the typed answer; `REVEAL` skips evaluation. Both cap `elapsedMs`.
- `RESOLVE` ignores outcomes `outcomeChoices` doesn't allow. A `missed` card goes to the back of the queue until it is no longer missed.
- `reviews` keeps every review (including each miss) with its `durationMs`, ready for `POST /api/reviews`.
- Derive, don't store: the current card is `queue[0]`, and choices and suggestions are computed from `evaluation` during render.
- Any other `status × event` pair leaves the state unchanged; the tests cover every pair.

### A form sent to a server: `form/form-reducer`

The state machine behind `/signin` and `/signup` (#108), and any later form that is checked and then sent.

```ts
const reducer = createFormReducer<"email" | "password">(validate)
const [form, dispatch] = useReducer(reducer, { email: "", password: "" }, startForm)
```

| Status | Means | Leaves on |
| --- | --- | --- |
| `idle` | Being filled in. `fieldErrors` holds what the last submit got wrong | `SUBMITTED` |
| `submitting` | Valid and on its way. The app sends `fields` now | `SUBMIT_SUCCEEDED`, `SUBMIT_FAILED` |
| `error` | The server refused, with its stable `code` | `FIELD_CHANGED`, `SUBMITTED` |
| `success` | Done. Nothing changes it | Never |

- `validate` comes from the app (a Zod schema's verdict, messages by field), so no schema and no copy live in core.
- `SUBMITTED` validates. An invalid form stays `idle` with every field's errors. Typing in a field clears that field's errors.
- `SUBMITTED` while `submitting` returns the same state, so the app can tell a second submit from a first and send nothing.
- The app starts the request from its submit handler by asking the reducer what the submit does. No effect watches `status` (`docs/state-management.md`).

### Course progress and session cards — `study/course-progress`

Two questions, one set of rules: where does a learner stand in a course, and which cards does a session hold?

| Word | Rule | Constant |
| --- | --- | --- |
| seen | Reviewed at least once (`state` is not `new`) | |
| due | Seen, and `due` has passed | |
| mastered | In `review` with stability of 21 days or more | `MASTERED_STABILITY_DAYS` |
| tricky | Forgotten 3 times or more, and not mastered | `TRICKY_LAPSES` |
| new today | Unseen, up to 10 less the words first met today | `DAILY_NEW_CARD_LIMIT` |

`summarizeCourseProgress(cardCount, progress, now)` returns the dashboard's counts: `dueCount`, `newAvailable`, `masteredCount`, `learningCount`, `unseenCount`, `trickyCount`, `lastReviewedAt`. Mastered, learning and unseen always add up to the course.

`sessionCards(cards, mode, { now, extra })` returns one session's cards in study order:

| `mode` | Cards | Order |
| --- | --- | --- |
| `review` | Seen and due | Most overdue first |
| `learn` | Unseen, up to the daily limit plus `extra` | Course order |
| `practice` | Tricky | Most forgotten first |

A test holds the two together: a session always has exactly as many cards as its count says. The three thresholds are product decisions in one place; change the constant and every client follows.

Both take how many words the learner already met for the first time today in that course (`newStartedToday`), and give only what is left of the daily limit.

### Study history — `study/history`

What the dashboard shows about past study, from the review log. Days are calendar days in the learner's time zone, so every function that needs a day takes `timeZone` as well as `now`.

- `localDate(instant, timeZone)` is the date there, `"YYYY-MM-DD"`. `shiftDate(date, days)` moves along the calendar.
- `daysOfStudy(studyDates, today)` follows REDESIGN.md section 5.7: any study counts, one day off is forgiven and not counted, two in a row end the count, and today is never a miss before it ends.
- `summarizeHistory({ reviews, studyDates, now, timeZone })` gives the last 7 days (different words per day), days of study, retention (reviews of words already met that were not missed, over 30 days; `null` before any) and new words this month.
- `newWordsStartedOn(reviews, date, timeZone)` counts first sightings on a date, by course, for the daily limit.
- `DAILY_GOAL_WORDS` is 50, one goal for everyone until learners can set their own.

## Development

```bash
bun run test --filter=@workspace/core
```

ESLint blocks React, React DOM, React Native and `@workspace/ui` imports in `src/`.

## History

Earlier scaffolding shipped a hand-rolled SuperMemo **SM-2** `gradeCard()`. It was premature and removed in #130, then this package was rebuilt around `ts-fsrs` in #132.

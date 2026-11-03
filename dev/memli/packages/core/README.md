# `@workspace/core` (planned)

Pure TypeScript **domain logic** for Memli — no React, no DOM, no React Native, no I/O.

This directory is intentionally empty of code right now. Nothing in `apps/web` imports `@workspace/core` yet; the Hono API (`apps/api`) does not exist. Restore a real package in **MS 3** when the study loop needs it ([#132](https://github.com/hereisphil/2606-WDV349-CantuPhillip/issues/132)).

## Why this package exists

| Concern | Lives here | Does not live here |
| --- | --- | --- |
| FSRS scheduling (`ts-fsrs` wrapper) | ✓ | — |
| Answer **Evaluator** + **Rating Mapper** | ✓ | — |
| In-house string distance / accent normalize | ✓ | — |
| Silent timing helpers (cap `elapsedMs`, suggest outcome) | ✓ | Tab blur / pause UI in `apps/web` |
| Study-session reducers (pure `status` × event) | ✓ | React wrappers in `apps/web` |
| HTTP DTOs, Zod env schemas | — | `packages/schemas` |
| UI components / visible copy | — | `packages/ui` / `apps/web` (see `docs/i18n.md`) |

Web, API, and future mobile call the same functions so formulas never fork.

## Product stance: not an Anki clone

Memli is for everyday learners and schools. Beginners should not pick among cryptic `Again / Hard / Good / Easy` labels. The mass-market default is **assistive / objective grading** (typing tasks, typo vs. struggle, silent response-time *nudges*). FSRS still owns the math; this package owns the **human interface** to that math.

Power-user modes, Speed Review countdown UI, and blur-on-pause / classroom strict mode are **Going Beyond** (post-capstone) — see milestone *Going Beyond [Post-Capstone Product Depth]* and issues such as #133–#137.

## Pipeline: Evaluator → Rating Mapper → FSRS

```text
typed/chosen answer + capped elapsedMs
        │
        ▼
   Evaluator  ──►  exact | near | wrong
        │
        ▼
 Rating Mapper ──►  Memli outcome (e.g. missed | tough | got_it | easy)
        │              (stable codes — UI localizes the labels)
        ▼
  ts-fsrs Rating 1–4  ──►  updated card progress (due, stability, …)
```

Apps never import `ts-fsrs` directly. They import **`@workspace/core` only**.

### Evaluator (MS 3)

- Compare expected vs. actual after Unicode normalize + accent strip (`NFD`).
- In-house **Damerau–Levenshtein** (adjacent transpositions count as one edit). Do **not** depend on unmaintained packages such as `fastest-levenshtein`.
- Emit `exact` | `near` | `wrong` (near threshold configurable; accent-only misses lean `near`).

### Rating Mapper (MS 3)

- Map Memli outcomes to FSRS ratings under the hood.
- Prefer stable **outcome codes** from core; `apps/web` supplies learner-facing strings (“Got it”, “Just a typo”, …).
- Typical MVP wiring (exact labels TBD with #51):
  - wrong → missed → FSRS Again
  - near + “I knew it / typo” → got_it → Good
  - near + “I wasn’t sure” → tough → Hard
  - exact (+ optional easy nudge from timing) → got_it / easy → Good / Easy

### Silent telemetry helpers (MS 3 domain; Everyday UI)

- Accept `elapsedMs` from prompt → submit/reveal.
- **Cap outliers** (e.g. treat very long gaps as non-informative) so bathroom breaks do not tank a card.
- Optionally return a *suggested* Memli outcome (nudge / pre-highlight) — never a punishment.
- Tab-hide / Pause / blur-on-pause are **web concerns**; they should stop or exclude timing before calling these helpers. Speed Review countdown + classroom blur modes: Going Beyond (#134).

### FSRS wrapper

- Wrap [`ts-fsrs`](https://github.com/open-spaced-repetition/ts-fsrs); create / apply rating / serialize card state.
- Persist FSRS fields in D1 (#106 / #112): `stability`, `difficulty`, `state`, `reps`, `lapses`, `due`, `lastReview` (plus optional capped `durationMs` / outcome code on review logs).
- Do **not** bake SM-2’s `intervalDays` / `easeFactor` / `repetitions` as the long-term schema.

Earlier scaffolding shipped a hand-rolled SuperMemo **SM-2** `gradeCard()`; that was premature and was removed in #130.

## When to restore a real package

Tracked by **#132** (MS 3). Re-add `package.json`, `tsconfig`, Vitest, and `src/` with roughly:

1. `ts-fsrs` scheduling helpers + serializable progress  
2. Evaluator (Damerau–Levenshtein + accent strip) + Rating Mapper  
3. Silent telemetry suggestion helpers  
4. Pure study-session reducer (see `docs/state-management.md`) next to the above  

Until then this folder is documentation only — not a Bun workspace package.

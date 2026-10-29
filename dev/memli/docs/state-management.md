# State management

**Status:** decided (2026-10, [#121](https://github.com/hereisphil/2606-WDV349-CantuPhillip/issues/121)).  
**Related:** [roadmap.md](./roadmap.md) · [architecture.md](./architecture.md) · [mobile.md](./mobile.md) · [dx-tooling.md](./dx-tooling.md)  
**Enforced by:** `.cursor/rules/react-state.mdc` (agent guidance) and `memli/no-use-state-sprawl` in `@workspace/eslint-config/react` (lint, runs in Lefthook and `verify.yml`).

This document records *why* Memli routes React state the way it does. The short, always-on version agents read while coding is the Cursor rule.

---

## Decision

1. **Every piece of client state has a designated owner** (table below). Picking the owner comes before writing a hook.
2. **`useReducer` with a discriminated union is the default** for anything with a lifecycle or for two or more values that change together.
3. **`useState` is allowed for exactly one uncoupled primitive per component** — a toggle, a single controlled input. The second `useState` in a component is a lint error.
4. **Pure transitions live in `packages/core`** with Vitest coverage, next to `gradeCard()`. `apps/web` adds only the React wrapper.
5. **`use-effect-reducer` is not installed yet.** It is adopted the first time a transition must trigger a side effect (see [When to install `use-effect-reducer`](#when-to-install-use-effect-reducer)).

### State-owner table

| Kind of state | Owner | Rejected alternative |
| --- | --- | --- |
| Data from the API — decks, cards, review history, viewer | **TanStack Query** (`useQuery`, `useMutation`, optimistic updates) | `useState` + `useEffect(fetch)`; hand-rolled `isLoading` / `isError` / `data` |
| Shareable or bookmarkable — card index, deck filters, active tab | **TanStack Router** search params (validated, typed) | mirroring the URL into component state |
| Lifecycle or coupled values — study session, grading dock, form submission | **`useReducer`** + discriminated union on `status` | several `useState` booleans |
| Transition that must fire a side effect — audio, timers, persist | `useReducer` **+ `use-effect-reducer`** (`exec` in the reducer) | set a flag in the reducer, watch it with `useEffect` |
| One uncoupled primitive — `isOpen`, one input | **`useState`** | a reducer for a boolean (ceremony, no gain) |
| Cross-cutting app context — theme, viewer session | React context providing a *reducer-shaped* value (`{ state, dispatch }` or a small typed API) | global store libraries (Redux, Zustand) — nothing in Phase 1 needs one |

---

## Why

### The failure mode we are designing against

Left to defaults, both agents and humans reach for `useState` and chain it with `useEffect`. On anything with a lifecycle that produces three predictable problems:

- **Boolean soup / impossible states.** `isRevealed`, `isGraded`, `isComplete`, `isPlayingAudio` as independent booleans. Nothing stops `isRevealed && isComplete`, and every component that reads them has to re-derive what "phase" the UI is in.
- **Synchronisation cascades.** `useEffect(() => { if (isGraded) setIsRevealed(false) }, [isGraded])` — effects that exist only to keep one piece of state consistent with another. Race conditions, stale closures, extra renders.
- **Scattered transitions.** The logic for "what happens when the learner grades a card" is smeared across click handlers, instead of living in one place that can be read and tested.

A reducer separates *what happened* (`{ type: "GRADE", grade: "pass" }`) from *how state responds*, and a discriminated union makes the invalid combinations unrepresentable in the type system.

### Why this fits Memli unusually well

- **`gradeCard()` is already a reducer.** `packages/core/src/srs/grade-card.ts` is a pure `(CardProgress, ReviewGrade) => CardProgress` transition with Vitest coverage. A study-session reducer is the same idea one level up, and its `GRADE` branch calls `gradeCard()`.
- **The study flow is a state machine.** The Figma prototype already enumerates the states: prompt → typing/listening test → answer reveal → graded → next card or session complete. Issues #48, #49, #51 build exactly this. Deciding the shape *before* those land is far cheaper than refactoring after.
- **Shareable with mobile.** [architecture.md](./architecture.md) says *share domain, not DOM*. A pure session reducer in `packages/core` is reusable by the Phase 4 React Native app and by the API. `useState` scattered across web components is not.
- **The other owners already exist.** TanStack Query and Router search params are in [TechStack.md](../../../docs/TechStack.md). This decision does not add a state library; it writes down which existing tool owns what.

### Why lint, not only a rule

Matt Pocock's framing ("pit of success" → "black hole of success"): a prose rule is a social contract, and agents do not feel the friction that would make a human respect it. The lint rule makes the wrong shape *fail*, on every commit (Lefthook) and every PR (`verify.yml`), with the error message pointing back here. The Cursor rule explains the intent; ESLint removes the option.

---

## The pit (what makes the right thing the easy thing)

| Layer | Mechanism | Where |
| --- | --- | --- |
| Lint | `memli/no-use-state-sprawl`: max one `useState` per component/hook; `useState({ a, b })` with 2+ keys is also an error | `packages/eslint-config/rules/no-use-state-sprawl.js`, on by default in `react.js` |
| Lint | `react-hooks/exhaustive-deps` → `error`; React Compiler rules (`set-state-in-effect`, `set-state-in-render`, `purity`, `refs`) already `error` via `recommended` | `packages/eslint-config/react.js` |
| Tests | Reducers in `packages/core` ship with a `.test.ts` covering every event from every `status` | `packages/core` (only package with Vitest — intentional pull) |
| Types | `status`-discriminated unions; exhaustive `switch` on `state.status` then `event.type` | reducer files |
| Agent rule | `.cursor/rules/react-state.mdc` (always-on): owner table, reducer shape, do-not list | `.cursor/rules/` |
| Reference | The first real reducer (study session, #48/#49) becomes the copy-from example; until then the sketch in the Cursor rule is the template | `packages/core/src/study/` (future) |

### Exempt zones (opt-out, not opt-in)

The shared `react` config turns the rule **on everywhere** so new route groups and future apps inherit it. Consumers opt out explicitly, with a comment saying why:

| Zone | Why exempt | Revisit |
| --- | --- | --- |
| `packages/ui/**` | shadcn / Base UI primitives manage their own internal open/focus state | Never (library code) |
| `apps/web/src/routes/_marketing/**` | Presentational toggles only (`Nav.tsx` `mobileOpen`), no lifecycle | If marketing grows interactive flows |
| `apps/web/src/routes/_auth/**` | `signin.tsx` is frozen in prototype mode (#110); see below | **#108 — Better Auth** |

`apps/web/src/routes/_app/**` and `apps/web/src/components/**` are **not** exempt. That is where the product lives.

---

## Reducer conventions

```ts
// packages/core/src/study/session-reducer.ts (shape — final API lands with #48/#49)
import { gradeCard, type ReviewGrade } from "../srs/grade-card"

export type SessionState =
  | { status: "prompt"; index: number; cards: StudyCard[] }
  | { status: "revealed"; index: number; cards: StudyCard[]; answer: string }
  | { status: "complete"; cards: StudyCard[] }

export type SessionEvent =
  | { type: "REVEAL"; answer: string }
  | { type: "GRADE"; grade: ReviewGrade }
  | { type: "RESTART" }

export function sessionReducer(
  state: SessionState,
  event: SessionEvent
): SessionState {
  switch (state.status) {
    case "prompt":
      if (event.type === "REVEAL") {
        return { ...state, status: "revealed", answer: event.answer }
      }
      return state
    case "revealed":
      if (event.type === "GRADE") {
        const cards = state.cards.map((card, i) =>
          i === state.index
            ? { ...card, progress: gradeCard(card.progress, event.grade) }
            : card
        )
        const next = state.index + 1
        return next >= cards.length
          ? { status: "complete", cards }
          : { status: "prompt", index: next, cards }
      }
      return state
    case "complete":
      return event.type === "RESTART"
        ? { status: "prompt", index: 0, cards: state.cards }
        : state
  }
}
```

```tsx
// apps/web/src/routes/_app/study.$courseId.tsx — thin wrapper, no logic
const [session, dispatch] = useReducer(sessionReducer, initialSession)

<Button onClick={() => dispatch({ type: "GRADE", grade: "pass" })}>Got it</Button>
```

Rules of thumb:

- **Discriminate on `status`.** Each variant carries only the data valid in that phase (`answer` exists only in `revealed`).
- **Events are `{ type: "UPPER_SNAKE", ...payload }`.** Components dispatch; they never compute next state.
- **Unknown `status × event` combinations return `state` unchanged** — and have a test asserting that.
- **Derive, don't store.** `remaining = cards.length - index` is computed in render, not kept in state.
- **No React in `packages/core`.** The reducer file imports nothing from `react`. The hook call lives in `apps/web`.
- **Server cache stays in TanStack Query.** A session reducer holds the *in-flight session*; the persisted review history is a query. Persisting a grade is a mutation the component (or, later, a reducer effect) calls.

---

## When to install `use-effect-reducer`

[`use-effect-reducer`](https://github.com/davidkpiano/useEffectReducer) (David Khourshid) adds a third `exec` argument to a reducer so a side effect is declared *at the transition that causes it*, instead of setting a flag and watching it with `useEffect`. Effects run after React commits, get an `AbortSignal`, and `exec.replace()` cancels a previous instance.

**Status today:** not installed. `useReducer` covers everything in `359 MS 1`–`MS 2`.

**Install it (`bun add use-effect-reducer@0.8.0` in `apps/web`, pinned exact) the first time any of these appears:**

- Play the audio clip when the listening test enters `revealed`.
- Auto-advance to the next card N seconds after `GRADE`.
- Persist a grade via a TanStack Query mutation *from inside the transition* rather than from the click handler.
- Any `useEffect(() => { if (state.status === "x") doSideEffect() }, [state.status])` — that line is the signal.

**How to use it when the time comes:**

- Keep the pure transition in `packages/core` unchanged.
- The `apps/web` wrapper reducer calls the core reducer and adds `exec({ type: "playAudio", src })` calls; effect implementations go in the `effects` map passed to `useEffectReducer`.
- TanStack Query still owns the server cache — effects *call* `mutate`, they do not re-implement loading/error.

**Why not now, and the risk to watch:** v0.8.0 (2026-10-28) is the first release since 2020; it is 0.x with one maintainer, ~25 KB unpacked, `peer react >=18`, and explicitly handles React 19 `<Activity>` / StrictMode remounts. Pin exact, keep usage behind the "transition needs an effect" bar, and swapping it (for XState, or inlining the few hundred lines) stays cheap. XState itself is deliberately not adopted in Phase 1 — heavier than the problem.

---

## Existing code and migration

The decision applies **going forward**. Existing components are not refactored for ideology.

| File | Today | Decision |
| --- | --- | --- |
| `routes/_marketing/-components/Nav.tsx` | one `useState` (`mobileOpen`) + two `useEffect`s | **Keep.** Single toggle is the allowed `useState` case; the effects are DOM sync (focus trap, scroll lock), not state sync. |
| `components/theme-provider.tsx` | one `useState` + three `useEffect`s; `localStorage.setItem` in two places | **Keep.** Passes lint. Would be a tidy `use-effect-reducer` demo (`SET_THEME`, `TOGGLE`, `STORAGE_SYNC` + one `persist` effect) but it works and is shadcn-derived. |
| `routes/_auth/signin.tsx` | four coupled `useState` calls: `email`, `password`, `fieldErrors`, `formMessage` | **Exempt now; migrate at #108.** See below. |

### `signin.tsx` — not now, but at Better Auth (#108)

Why not now: the form is disabled during prototype mode (#110) and gets a "Skip & Continue to Prototype" button; churning it twice is waste. The `_auth/**` glob is opted out in `apps/web/eslint.config.js` with a comment pointing here.

Why it must change at #108: those four hooks are already coupled (changing a field clears its error; submit clears the message). Wiring Better Auth adds `isSubmitting`, a server error, and a redirect-on-success — exactly the boolean soup this decision exists to prevent. The migration:

1. Remove the `_auth/**` exemption from `apps/web/eslint.config.js` (lint now fails on `signin.tsx`).
2. Replace the four `useState`s with one reducer: `status: "idle" | "submitting" | "error" | "success"`, `fields`, `fieldErrors`, `message`; events `FIELD_CHANGED`, `SUBMITTED`, `SUBMIT_SUCCEEDED`, `SUBMIT_FAILED`.
3. Keep Zod validation (`signInSchema`) inside the `SUBMITTED` transition; the Better Auth call is the effect (plain `useEffect` keyed on `status === "submitting"`, or `use-effect-reducer` if it has been installed by then).

---

## Rejected alternatives

| Option | Why not |
| --- | --- |
| Ban `useState` entirely (lint on every file) | Ceremony for a single toggle and for shadcn internals with zero architectural gain. The *value* is discriminated unions and named events, not the hook's name. |
| Prose rule only, no lint | A social contract agents do not feel. Lint makes the wrong shape fail on every commit and PR. |
| Install `use-effect-reducer` now | Nothing in `MS 1`–`MS 2` needs transition-triggered effects. Adding a 0.x dependency speculatively is the opposite of the "pit". |
| XState / a global store | Heavier than Phase 1's problem; TanStack Query already owns the server cache. Revisit if the session machine outgrows a reducer. |
| A form library (TanStack Form, react-hook-form) for `signin.tsx` | One form today. Reconsider at #108 if the reducer gets unwieldy; the reducer shape is still the baseline. |

---

## Related rules

- `.cursor/rules/react-state.mdc` — the always-on summary agents read while coding
- `.cursor/rules/memli-stack.mdc` — stack conventions; its State section points here
- `.cursor/rules/architecture-guardrails.mdc` — `packages/core` stays free of React/DOM/RN

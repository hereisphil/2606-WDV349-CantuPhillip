# DX tooling

**Related:** [roadmap.md](./roadmap.md) · [mobile.md](./mobile.md) · [architecture.md](./architecture.md)

Developer experience tools should make debugging faster **without** changing learner UX or production performance.

---

## Current baseline (web)

Already in play or available without new products:

| Tool | Role |
| --- | --- |
| Browser DevTools | Network, performance, DOM |
| React DevTools | Component tree / props |
| TanStack Router Devtools | Route matches / debug (currently mounted in web root) |
| Vitest | `packages/core` domain tests |
| TypeScript + ESLint + Prettier + Lefthook | Quality gates |
| Knip | Unused code/deps hygiene |

These cover a large fraction of web debugging needs for Phase 1.

---

## Reactotron

[Reactotron](https://docs.infinite.red/reactotron/) (Infinite Red) is a desktop inspector for React and React Native apps. The companion package for web is `reactotron-react-js` (devDependency). Native uses the React Native variant.

### Intent for this project

| Question | Answer |
| --- | --- |
| Does it improve learner UX? | No — and it must not affect it |
| Production performance impact if gated correctly? | None |
| When to add? | **Optionally** on web; **prefer** introducing when **React Native** work begins (Phase 4/5), where payoff is higher |
| Production builds? | **Never** connect / ship Reactotron |

### Required gating pattern (web / Vite)

Reactotron must load only in development. Do not follow quickstarts that unconditionally `import "./ReactotronConfig"` in the production entry path.

Illustrative pattern:

```ts
// main.tsx (illustrative — adapt when implemented)
if (import.meta.env.DEV) {
  await import("./ReactotronConfig")
}
```

Rules:

- Add as **`-D` / devDependency** only
- No `Reactotron.log` in shared `packages/core`
- Guard any debug overlays so they cannot appear in staging/production unless explicitly intended for internal builds

### What it is good for

- Structured timeline logging beyond `console.log`
- Network inspection workflows
- React Native state/debugging when the mobile app exists
- Redux/state plugins **if** such state lands (not required by current stack)

### What it is not

- A substitute for automated tests
- A reason to delay product features
- Something learners should ever see

---

## Other DX additions (guidelines)

Before adding a new global DX tool:

1. Does an existing tool already cover 80% of the need?
2. Can it be limited to `import.meta.env.DEV` / `__DEV__`?
3. Will it confuse Cursor agents or CI (e.g. mandatory GUI apps)?
4. Is there a clear owner doc snippet in this file?

Prefer **tests in `packages/core`** and **typed schemas** over more inspectors when the bug is domain logic.

---

## Staging vs production

| Build | Routers Devtools | Reactotron | Verbose logging |
| --- | --- | --- | --- |
| Local dev | OK | OK if installed | OK |
| Staging | Prefer off or flag-gated | Off by default | Careful with PII |
| Production | Off | Off | Errors only, no secrets |

TanStack Router Devtools should not ship to production users; gate or drop from production entry when polishing deploys.

---

## Phase mapping

| Phase | DX focus |
| --- | --- |
| 1 | Tests, types, schemas, existing browser/router tools |
| 4–5 | Consider Reactotron with mobile; keep DEV-only |
| Anytime | Resist production leakage of debug tooling |

---

## Related rules

If Reactotron is added, update `.cursor/rules/` with a short “DEV-only inspectors” note or extend `architecture-guardrails.mdc` so agents never wire it into production entry points.

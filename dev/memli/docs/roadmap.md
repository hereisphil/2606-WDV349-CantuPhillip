# Roadmap

**Status:** living plan (not a sprint board).  
**Brand today:** Memli · **Planned brand:** FluentVine (domain examples below use `{brand}.com` / `fluentvine.com` as the intended production shape).  
**Last aligned with product discussion:** 2026-10.

This document is the **hub**. It sequences work and points at deeper docs. It does not replace GitHub milestones/issues for tracking execution.

---

## North-star outcomes

1. **Best UX for non-technical learners** — one consumer hostname; users never need to remember `app.*`.
2. **Clear separation of concerns over time** — marketing site, authenticated web app, shared API, and eventually mobile — without fragmenting the user journey across subdomains.
3. **Ship a real learning loop first** — decks, visual/story mnemonics, and SM-2 SRS review — before real auth boilerplate or speculative platform splits.
4. **LATAM-ready foundations** — plan and prepare i18n early; full translation can follow once UI chrome stabilizes.
5. **Mobile when the API and domain model are stable** — React Native shares logic and schemas, not web DOM components.

---

## Current state (as of this writing)

| Area | Reality today |
| --- | --- |
| Monorepo | Turborepo + Bun under `dev/memli/` |
| Web | Single Vite + React app: `apps/web` |
| Shared packages | `packages/core` (pure TS SM-2 SRS + Vitest), `packages/schemas` (Zod contracts), `packages/ui` (shadcn/Base UI web components) |
| Routing | TanStack Router route groups: `_marketing`, `_auth`, `_app` |
| Marketing vs app | **Logical** split only (same deployable, same origin) |
| API | Not yet a separate `apps/api` Hono service (scheduled in `359 MS 3`) |
| Mobile | Not started |
| i18n | English UI; no i18n framework yet |
| DX inspectors | TanStack Router Devtools in web; Reactotron deferred |

This is intentional. The route groups already encode the eventual marketing/app boundary without paying the cost of two frontends yet.

---

## Principles that govern every phase

These are non-negotiable unless an ADR explicitly overturns them. Details live in linked docs.

| Principle | Summary | Deep dive |
| --- | --- | --- |
| One consumer site | Marketing + web app on `{brand}.com` (paths, not `app.` subdomain) | [architecture.md](./architecture.md), [product-ux.md](./product-ux.md) |
| `/` stays reachable | Never lock logged-in users out of marketing; no “logout to see the homepage” trap | [product-ux.md](./product-ux.md) |
| API may use a subdomain | `api.{brand}.com` is fine — humans do not type it | [architecture.md](./architecture.md) |
| UI locale ≠ learning language | Spanish chrome while studying Japanese must be possible | [i18n.md](./i18n.md) |
| Share domain, not DOM | `packages/core` + `packages/schemas` are the mobile/web bridge; shadcn stays web | [mobile.md](./mobile.md), [architecture.md](./architecture.md) |
| State has an owner | Server → TanStack Query, URL → Router params, lifecycle → `useReducer` in `packages/core`; one `useState` per component, lint-enforced | [state-management.md](./state-management.md) |
| Dev tools stay in DEV | Reactotron and similar must not ship to production bundles | [dx-tooling.md](./dx-tooling.md) |

---

## Phase overview

```text
Phase 0  Brand & docs hygiene          (ongoing; FluentVine cutover when ready)
Phase 1  Core web product + Hono API   ← primary focus now / next
Phase 2  i18n foundations + es-419     (prepare during Phase 1; expand after chrome stabilizes)
Phase 3  Marketing / app deployable split (Astro marketing + React app, same domain)
Phase 4  Mobile (Expo / React Native)
Phase 5  DX hardening (Reactotron with mobile, etc.)
```

Phases can **overlap lightly** (e.g. i18n schema habits during Phase 1), but **do not** pull Phase 3–4 implementation forward at the expense of the learning loop.

---

## Phase 0 — Brand & documentation hygiene

**Goal:** Keep naming and docs honest during the Memli → FluentVine transition.

### Do

- Treat **FluentVine** as the planned public brand; keep code/package names stable until a dedicated branding pass.
- Update user-visible strings, meta titles, logos, and Cursor brand rules in one coordinated pass when the name is final.
- Keep this `docs/` tree as the decision log; link GitHub epics here when they exist.

### Do not

- Rename every internal package mid-feature (“memli” → “fluentvine” churn) unless the branding milestone is actively in progress.
- Scatter brand-only renames across unrelated PRs.

### Exit criteria

- [ ] Public name, domain, and logo decided
- [ ] README + marketing chrome + Cursor brand section updated together
- [ ] This roadmap’s brand note refreshed

---

## Phase 1 — Core web product + shared Hono API

**Goal:** A learner can study language decks with visual/narrative mnemonics and complete persistent SM-2 SRS review sessions on the web, backed by a shared Hono + Drizzle + D1 API and real authentication.

### Prototype-First execution sequence (WDV359 Milestones `359 MS 1`–`359 MS 4`)

To guarantee the core learning loop ships first without getting blocked on authentication or secondary marketing copy:

1. **`359 MS 1` (Week 1 — Design Primitives + Prototype Bypass + App Shell):**
   - Extract reusable web primitives (`Section`, `Heading`, `Text`) into `@workspace/ui` (#105) and freeze secondary marketing stub pages (tag refactor only, no new copy).
   - Disable the `/signin` form inputs, add a **"Skip & Continue to Prototype →"** button to `/dashboard`, and provide a seeded test learner (`usr_prototype_01`) via a typed `SessionContext` / `useViewer()` hook (#110).
   - Build the `/dashboard` authenticated application shell (#45).
2. **`359 MS 2` (Week 2 — Dashboard Decks + Study Session & Card UI):**
   - Build the `/dashboard` User Metrics Banner (#46) and Study Deck Grid (#47) linking to `/study/$courseId`.
   - Build the `/study/$courseId` Session Layout (#48) and interactive Core Study Card Display (#49).
3. **`359 MS 3` (Week 3 — Mnemonic Engine + Persistent SRS Loop):**
   - Build the Mnemonic Caption & Image Overlay Frame (#50) and Session Grading Controls Dock (#51) wired to `@workspace/core` `gradeCard()`.
   - Scaffold `apps/api` (Hono + Drizzle ORM + Cloudflare D1/SQLite) and shared deck/review schemas in `@workspace/schemas` (#106), persisting seeded mnemonic decks and SRS review intervals for `usr_prototype_01` (#112).
4. **`359 MS 4` (Week 4 — MVP Polish, Auth Integration & Beta Showcase):**
   - Replace the `/signin` prototype bypass with real Better Auth Email/Password (#108) and Google OAuth / Passkeys (#107) by swapping the inside of `useViewer()`.
   - Gate `TanStackRouterDevtools` to `import.meta.env.DEV` (#113) and promote `dev → stage → main` (#114).

### Product / UX (still one React app)

- Keep `_marketing`, `_auth`, `_app` in `apps/web`.
- Canonical post-auth landing route is `/dashboard` (active study sessions run at `/study/$courseId`).
- Logged-in marketing nav shows **Open app** / **Dashboard**, not a forced redirect away from `/`.
- See [product-ux.md](./product-ux.md).

### Backend

- Introduce `apps/api` (Hono) as the shared backend.
- Production shape: `api.{brand}.com` (or equivalent). Same-origin `/api` proxy in local/dev is acceptable.
- Auth session strategy chosen once (cookie domain, CORS, CSRF) with **web + future mobile** in mind — see [architecture.md](./architecture.md) and [mobile.md](./mobile.md).
- Domain logic that can stay pure TypeScript continues to live in `packages/core` (SRS already started here).
- Request/response and env validation continue to expand in `packages/schemas`.

### i18n habits (prep only)

Even before an i18n library:

- Do not put English UI copy inside `packages/core`.
- Prefer API **error codes** over finalized English sentences from the server.
- When modeling content, assume decks/cards/mnemonics will need a **content language** field.
- See [i18n.md](./i18n.md).

### Explicitly out of scope for Phase 1

- Astro marketing app
- `app.{brand}.com`
- React Native app shell
- Reactotron
- Full Spanish translation of all marketing pages

### Exit criteria

- [ ] Auth works against Hono API
- [ ] Dashboard + review session loop usable on web
- [ ] `packages/core` SRS covered by tests for grading behavior you rely on
- [ ] UX rules for `/` and post-login navigation respected
- [ ] Schemas/API avoid baking “one language field” that conflates UI locale and learning language

---

## Phase 2 — i18n foundations + Latin America

**Goal:** The product can present UI in Latin American Spanish without a rewrite, and learning content is language-aware.

**Primary locale pair:** `en` + `es-419` (Latin American Spanish).  
**Later candidate:** `pt-BR` if Brazil is confirmed as a major market (Portuguese — not a Spanish variant).

### Do

- Introduce an i18n approach for web UI chrome (library choice documented in [i18n.md](./i18n.md) when selected).
- Extract stable app strings (auth, dashboard, session, settings).
- Ship a locale preference (profile and/or `Accept-Language` with explicit user override).
- Ensure content entities carry locale/language metadata.
- Use `Intl` for dates/numbers; store instants in UTC/ISO.

### Do not

- Block Phase 1 on perfect translations.
- Over-split `es-MX` vs `es-AR` on day one.
- Translate the entire marketing site before the app chrome is stable (marketing i18n pairs well with Phase 3).

### Exit criteria

- [ ] UI locale and learning language are distinct in settings and data model
- [ ] `es-419` covers primary authenticated chrome
- [ ] New user-facing strings have a clear place to land (no drive-by hardcoded English in new features without messages)
- [ ] Content model supports non-English decks/mnemonics

Deep dive: [i18n.md](./i18n.md).

---

## Phase 3 — Marketing (Astro) + App (React), same domain

**Goal:** Improve marketing performance and SEO **without** changing the consumer URL mental model.

### Target UX (unchanged from Phase 1)

- `{brand}.com/` → marketing (Astro), always available
- `{brand}.com/dashboard` (and other app paths) → React app
- Optional soft “welcome back” on `/` with **Open app** CTA — never a hard lock-in redirect that makes marketing unreachable
- Auth routes either stay on the app deployable or are carefully shared — document the choice in [architecture.md](./architecture.md) at implementation time

### Target engineering

| Deployable | Role | User-facing host |
| --- | --- | --- |
| `apps/marketing` (Astro) | Landing, pricing, blog, about, legal | `{brand}.com` (mostly `/`, `/pricing`, …) |
| `apps/web` (React / TanStack) | Authenticated product | `{brand}.com/dashboard`, `/learn`, … |
| `apps/api` (Hono) | Shared backend | `api.{brand}.com` |

Edge/reverse-proxy routing keeps **one site** in the browser’s address bar. Subdomains are **not** required for marketing vs app.

### Why wait until after Phase 1

- Splitting earlier doubles frontend surface area before the product loop exists.
- SEO/perf gains matter most when marketing content and traffic exist.
- Route groups in today’s `apps/web` already mirror the future split.

### Exit criteria

- [ ] Marketing HTML is prerendered/SSG for key pages
- [ ] App JS is not required to first-paint the homepage
- [ ] Same-domain navigation feels seamless (shared brand tokens, no jarring theme break)
- [ ] Logged-in users can still open `/` and reach marketing content
- [ ] Deploy/routing docs updated for the proxy split

Deep dive: [architecture.md](./architecture.md), [product-ux.md](./product-ux.md).

---

## Phase 4 — Mobile (React Native / Expo)

**Goal:** Learners can review on iOS and Android — the habit loop language apps need.

### Do

- Add `apps/mobile` (Expo recommended unless requirements force otherwise).
- Reuse `packages/core` and `packages/schemas` aggressively.
- Share **design tokens** (color, type, space); build RN UI primitives separately (`packages/ui` / shadcn remain web-only).
- Authenticate against the same Hono API.

### Do not

- Expect to reuse shadcn/Base UI DOM components on native.
- Start mobile before API contracts and SRS behavior are trustworthy.
- Introduce Reactotron as a blocker — it is optional DX (Phase 5 / alongside mobile).

### Exit criteria

- [ ] Sign-in + sync + review session on device against staging/production API
- [ ] Shared grading logic comes from `packages/core`, not a forked mobile copy
- [ ] Basic offline or poor-network story considered (even if v1 is online-only — document the choice)

Deep dive: [mobile.md](./mobile.md).

---

## Phase 5 — DX hardening (including Reactotron)

**Goal:** Better debugging for complex client state and native builds — without affecting production UX.

- Reactotron is **dev-only**, gated behind development builds.
- Prefer introducing it when **React Native** work begins (highest payoff); optional earlier for web if it helps, still DEV-gated.
- Production bundles must not include Reactotron connect code.

Deep dive: [dx-tooling.md](./dx-tooling.md).

---

## Suggested monorepo shape (target)

```text
dev/memli/   # or future fluentvine root name
  apps/
    marketing/     # Phase 3 — Astro
    web/           # React product (exists today; sheds marketing routes in Phase 3)
    api/           # Phase 1 — Hono
    mobile/        # Phase 4 — Expo / RN
  packages/
    core/          # pure domain (SRS, etc.) — share everywhere
    schemas/       # Zod / shared contracts — share everywhere
    ui/            # web shadcn — web only
    ui-native/     # optional Phase 4+
    typescript-config/
    eslint-config/
  docs/            # you are here
```

Today only `apps/web` exists among the apps; that is expected.

---

## Decision log (short)

| Decision | Choice | Rejected alternative | Why |
| --- | --- | --- | --- |
| Marketing vs app URLs | Same hostname, path-based | `app.{brand}.com` for humans | Non-technical users should not manage subdomains |
| API hostname | `api.{brand}.com` OK | Forcing everything same-origin forever | API subdomain is invisible to learners; fine for CORS/cookies design |
| Homepage when logged in | `/` remains marketing (or soft welcome + CTA) | Hard redirect `/` → dashboard always | Avoid Vercel-style “can’t see marketing without logout” |
| Marketing tech (future) | Astro SSG/SSR | Keep heavy SPA forever for marketing | Perf + SEO for acquisition pages |
| When to split frontends | After core learning loop | Split immediately | Focus and shipping risk |
| Mobile | React Native (Expo) | Separate native rewrite / delay forever | Share TS domain; phones are core for language habits |
| First non-English UI | `es-419` | Many regional `es-*` at once | LATAM reach without combinatorial explosion |
| Reactotron | Dev-only; lean toward RN timing | Always-on in production | Zero user impact; DX only |

When a major decision flips, update this table and the relevant deep-dive in the same PR.

---

## Mapping to GitHub (next step)

Execution tracking should use:

- **Milestones** ≈ phases above
- **Epic issues** ≈ one per major theme (architecture split, API, i18n, mobile, Reactotron)
- **Child issues** ≈ only when work is near-term

Do **not** open dozens of Astro/RN tickets during Phase 1. Link epics back to this file when GitHub tracking is created.

---

## Related Cursor rules

Always-on coding guardrails (short form of the principles above):

- `.cursor/rules/product-ux.mdc`
- `.cursor/rules/i18n-foundations.mdc`
- `.cursor/rules/architecture-guardrails.mdc`
- `.cursor/rules/memli-stack.mdc` (stack + brand)

If a rule and a doc disagree, **fix the mismatch** — docs win for intent; rules win for “what the agent must not do in this PR.”

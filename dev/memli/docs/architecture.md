# Architecture

**Related:** [roadmap.md](./roadmap.md) · [product-ux.md](./product-ux.md) · [mobile.md](./mobile.md) · [i18n.md](./i18n.md)

This document describes the **target system shape** and the rules for evolving toward it. It is deliberately stricter about *user-facing* topology than about *internal* package layout.

---

## Goals

1. **One mental model for learners:** “I go to FluentVine / Memli on the web.”
2. **Separate deployables when they earn their keep** (SEO/perf, release cadence, native runtimes) — not for subdomain theater.
3. **One backend** for web and mobile.
4. **Share TypeScript domain and contracts** across clients; do not share web DOM UI with native.

---

## Target topology

```text
                    ┌─────────────────────────────────────────┐
                    │         {brand}.com  (learners)         │
                    │  /  /pricing  /blog     /dashboard …    │
                    └───────────────┬─────────────┬───────────┘
                                    │             │
                         edge routing / reverse proxy
                                    │             │
                    ┌───────────────▼──┐     ┌────▼──────────────┐
                    │ apps/marketing   │     │ apps/web          │
                    │ Astro (Phase 3)  │     │ React + TanStack  │
                    └──────────────────┘     └─────────┬────────┘
                                                       │
                     ┌─────────────────────────────────┼──────────────────────┐
                     │                                 │                      │
                     │                    ┌────────────▼──────────┐           │
                     │                    │ api.{brand}.com       │           │
                     │                    │ apps/api  (Hono)      │           │
                     │                    └────────────▲──────────┘           │
                     │                                 │                      │
                     │                    ┌────────────┴──────────┐           │
                     │                    │ apps/mobile (Phase 4) │───────────┘
                     │                    │ Expo / React Native   │
                     │                    └───────────────────────┘
                     │
                     └──── packages/core + packages/schemas shared by clients
```

### Hostname policy

| Surface | Hostname | Notes |
| --- | --- | --- |
| Marketing + web app | `{brand}.com` | **Required** for consumer UX. Path-based separation. |
| API | `api.{brand}.com` | **Allowed and preferred** for the shared backend. Users rarely type this. |
| Mobile | N/A (store apps) | Talks to API host; may use deep links to `{brand}.com` |
| Optional future agent / other product | Separate host only if it is truly a different product | Do not invent hosts for convenience |

#### Explicitly rejected for the main product

- `app.{brand}.com` as the place humans must learn to visit for the product  
- Forcing logout to view marketing  
- Separate “marketing domain” and “product domain” that feel like different companies

Subdomains are an **infrastructure** tool (API, maybe previews), not a UX navigation model.

---

## Today vs target

### Today (Phase 1-compatible)

Single deployable web app with **logical** boundaries:

| Route group | Responsibility | Examples |
| --- | --- | --- |
| `_marketing` | Acquisition & content | `/`, `/pricing`, `/about`, `/blog` |
| `_auth` | Sign-in / sign-up | `/signin` |
| `_app` | Authenticated product | `/dashboard`, future `/learn` |

This is the correct interim architecture. Do not split Astro/React solely because another monorepo (e.g. Hgraph-style `services/marketing` + `services/app`) uses separate hosts.

### Target (Phase 3+)

| App | Stack | Serves |
| --- | --- | --- |
| `apps/marketing` | Astro | Static/SSG marketing & content |
| `apps/web` | Vite/React + TanStack Router | Authenticated SPA (and auth screens as decided) |
| `apps/api` | Hono | JSON API, auth, business operations |
| `apps/mobile` | Expo / React Native | iOS + Android clients |

Edge configuration (Cloudflare Workers/Routes, or equivalent) maps paths on `{brand}.com` to the correct deployable.

---

## Why Astro for marketing (eventually)

The current `apps/web` is a **client-rendered Vite SPA**: `index.html` mounts `#root`, then React renders. That is fine for product UI; it is weaker for:

- **LCP / first paint** on landing pages (JS before content)
- **SEO** and social link previews (crawlers/previews prefer real HTML)
- **Bundle discipline** (marketing visitors should not pay for dashboard code)

Astro (SSG/SSR) fixes those for marketing **without** requiring `app.` subdomain. The React app remains the right tool for interactive study flows.

### When the split is justified

Split when most of these are true:

- Core learning loop works on web against the API
- Marketing pages and SEO matter for acquisition
- Homepage weight or crawlability is a real problem
- You can afford dual frontend CI/deploy complexity

Until then, keep route groups and invest in the product.

---

## Hono API (`apps/api`)

### Role

- Source of truth for auth sessions / tokens (exact scheme TBD in implementation)
- Decks, cards, mnemonics, review grading persistence
- Shared by `apps/web` and later `apps/mobile`
- May call into `packages/core` for pure domain operations (e.g. SRS grading) so mobile/web/API never diverge on formulas

### Hosting shape

- **Production:** `api.{brand}.com`
- **Local:** `localhost` port or Vite/ wrangler proxy to `/api` — either is fine; document in API README when created

### Contract sharing

- Zod (and related) schemas in `packages/schemas`
- Clients validate/parse the same shapes where useful
- Prefer **stable error codes** in API responses; clients map codes → localized strings ([i18n.md](./i18n.md))

### Auth implications for multi-client

Design auth knowing three consumers will exist:

1. Web app on `{brand}.com`
2. Marketing site on the same site (mostly unauthenticated; may show session-aware CTAs)
3. Native apps (often bearer tokens / secure storage rather than first-party cookies alone)

Do not paint into a cookies-only corner that makes mobile miserable — or a tokens-only corner that makes web XSS-sensitive without thought. Record the chosen pattern in this doc when implemented.

---

## Packages and sharing matrix

| Package | Web | API | Mobile | Notes |
| --- | --- | --- | --- | --- |
| `packages/core` | ✓ | ✓ | ✓ | Pure TS domain; **no React, no DOM, no RN** |
| `packages/schemas` | ✓ | ✓ | ✓ | Zod contracts, env schemas (split per-app env exports as needed) |
| `packages/ui` | ✓ | — | — | shadcn / Base UI — **web only** |
| `packages/ui-native` | — | — | ✓ | Optional; RN primitives |
| Design tokens (future small package or shared JSON) | ✓ | — | ✓ | Colors, type scale, space — not components |

### Rules

- **New domain logic** → prefer `packages/core` + tests.
- **New HTTP/API shapes** → `packages/schemas`.
- **New button/input** → `packages/ui` for web; never assume it ports to RN.
- **Do not** put marketing page sections into `core`.

---

## Routing & path conventions (product)

Exact paths can evolve; conventions should not.

| Concern | Convention |
| --- | --- |
| Marketing home | `/` always addressable as marketing (see [product-ux.md](./product-ux.md)) |
| Post-login default | `/dashboard` **or** `/learn` — choose one primary; redirects may alias |
| Auth | `/signin`, `/signup` (names flexible; stay under obvious paths) |
| App namespace (optional later) | If path collisions appear, mount product under `/app/*` **on the same host** — still not `app.` subdomain |
| API | Not under learner-facing documentation as a thing to memorize |

If Phase 3 needs `/app/*` to simplify proxy rules, that is an infrastructure convenience and must remain linked from marketing as “Open app,” not as a second brand website.

---

## Edge routing sketch (Phase 3)

Illustrative only — implement with whatever hosts the site (e.g. Cloudflare):

```text
{brand}.com/dashboard*  →  web worker/pages (React)
{brand}.com/learn*      →  web
{brand}.com/signin*     →  web   # or shared decision
{brand}.com/signup*     →  web
{brand}.com/*           →  marketing (Astro)  # default
api.{brand}.com/*       →  api (Hono)
```

Order matters: specific app prefixes before the marketing catch-all.

---

## Environments

| Env | Purpose |
| --- | --- |
| Local | Bun + Vite (+ future API/mobile simulators) |
| Staging | Safe integration; separate API URL |
| Production | `{brand}.com` + `api.{brand}.com` |

Env validation belongs in `packages/schemas` (see existing `schemas` env patterns for web). Each app gets explicit required vars — do not share one mega-env blindly across marketing/web/api/mobile.

---

## Security & privacy (architecture-level)

- Assume community mnemonics and user-generated content will need moderation hooks later; keep author + locale metadata in the model.
- Localization and regional markets may imply privacy policy / data residency questions later — not blockers for Phase 1, but avoid hard-coding “US-only” assumptions into copy and legal routes without review.
- Dev inspectors (Reactotron) never run in production ([dx-tooling.md](./dx-tooling.md)).

---

## Comparison: Hgraph-style vs FluentVine/Memli

| Hgraph-style (multi-product) | This product (consumer learning) |
| --- | --- |
| `marketing`, `app`, `api`, `agent` as separate hosts/brands | One learner-facing site + API host |
| Audiences include developers / multiple products | Non-technical language learners |
| Subdomains aid org/product separation | Subdomains for humans add friction |

Borrow **monorepo discipline** and **shared API** ideas. Do not borrow **app subdomain UX** for the main product.

---

## Open decisions (resolve at implementation time)

Record the outcome here when chosen:

| Topic | Options | Status |
| --- | --- | --- |
| Post-login canonical path | `/dashboard` vs `/learn` | **Chosen: `/dashboard`** (active study sessions use `/study/$courseId`) |
| Auth mechanism | Cookie session vs JWT/bearer hybrid | Better Auth in `359 MS 4` (seeded `useViewer()` test user `usr_prototype_01` in `359 MS 1`–`359 MS 3`) |
| Auth route ownership after Astro split | App only vs lightweight marketing links out | Open — default lean: app owns auth pages |
| App path prefix | Root paths vs `/app/*` | Open — only if proxy/SEO needs it |
| Hosting | Cloudflare-centric (already in repo tooling) vs other | Lean current stack unless requirements change |

---

## Related rules

- `.cursor/rules/architecture-guardrails.mdc` — do not introduce `app.` subdomain UX or premature Astro split
- `.cursor/rules/product-ux.mdc` — homepage and nav behavior
- `.cursor/rules/memli-stack.mdc` — current implementation stack

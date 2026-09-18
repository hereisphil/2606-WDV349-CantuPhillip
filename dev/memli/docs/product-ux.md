# Product UX

**Related:** [roadmap.md](./roadmap.md) · [architecture.md](./architecture.md)

UX is the **highest priority** for consumer-facing decisions. This document locks the navigation and session behaviors that prevent “clever” architecture from harming non-technical learners.

**Brand note:** Copy may say Memli today and FluentVine after rebrand; the rules are brand-agnostic.

---

## Primary user

Someone who wants to **learn vocabulary with mnemonics**, not someone who wants to understand deployables, subdomains, or “which site am I on?”

Design for:

- One website to remember
- Obvious “start learning” / “continue” actions
- Marketing that remains available after signup (trust, pricing, blog, sharing links with friends)

---

## The one-site rule

Learners use **`{brand}.com`**.  

They do **not** need:

- `app.{brand}.com`
- Bookmarks to a different hostname for “the real product”
- Instructions like “make sure you’re on the app subdomain”

The API may live on `api.{brand}.com`. That hostname is for clients and developers, not for learner navigation.

---

## Homepage (`/`) policy

### Required behavior

1. **`/` is always a valid marketing entry** (or a soft logged-in welcome that still exposes marketing intent).
2. **Never** require logout to view marketing content.
3. **Never** hard-lock `/` so that every authenticated visit is forced into the dashboard with no way back except logout.

### Allowed behaviors

| Behavior | Allowed? | Notes |
| --- | --- | --- |
| Anonymous `/` → full marketing landing | ✓ | Default |
| Logged-in `/` → same marketing landing + **Open app** / **Dashboard** in nav | ✓ | Preferred simple model |
| Logged-in `/` → soft “Welcome back” hero + primary **Open app** CTA + links to pricing/blog | ✓ | Optional polish |
| Logged-in `/` → HTTP hard redirect to `/dashboard` with no marketing access | ✗ | Vercel-style footgun |
| Logged-in `/pricing` → forced redirect to app | ✗ | Marketing pages stay public |

### Why this matters

Products that steal the homepage after login train users to fight their tools (“I just wanted the pricing page”). Language learners will share the root URL; it must remain a safe landing for everyone.

---

## Authentication flows

### Sign-in / sign-up entry

- Marketing CTAs (“Get started”, “Sign in”) go to auth routes (`/signin`, etc.).
- Auth screens should feel on-brand; a light **Back to home** pattern already exists and should continue.

### After successful login

- Send the user to the **canonical app home**: `/dashboard` **or** `/learn` (pick one; document in [architecture.md](./architecture.md) open decisions when chosen).
- Deep-link return URLs are fine (`?redirect=/decks/123`) when safe and same-origin.

### After logout

- Land on `/` or `/signin` — either is acceptable; prefer `/` if you want a calm “you’re done” moment.

### Session-aware marketing chrome

When a session exists, marketing nav should emphasize:

- **Open app** or **Dashboard** (primary)
- Account / sign out as secondary

When anonymous:

- **Sign in** / **Get started**

Do not replace the entire marketing nav with the authenticated app shell on `/`.

---

## App chrome vs marketing chrome

| Surface | Chrome |
| --- | --- |
| Marketing routes | Marketing `Nav` + `Footer` (current `_marketing` layout) |
| Auth routes | Minimal / branded; back to home; not the full app sidebar |
| App routes | App shell (sidebar/top bar as designed); not the marketing mega-footer |

Crossing from marketing → app should feel like entering the product, not like visiting a second website with a different visual identity. Shared **tokens and logo** matter more than shared layout components.

---

## Information architecture (learner-facing)

Suggested durable map (names can vary):

```text
Marketing
  /                 home
  /pricing
  /about
  /community
  /blog
  /contact
  /privacy  /terms

Auth
  /signin  /signup  (+ password reset later)

Product
  /dashboard        home base (or /learn)
  /decks…           library
  /learn or /review session engine
  /settings         includes UI language + learning goals (see i18n.md)
```

Avoid burying “continue studying” behind unrelated marketing modules.

---

## Onboarding & empty states

When UX copy is written:

- Prefer plain language over developer metaphors (“deploy”, “workspace”, “org”).
- Empty deck lists should teach the next action (“Create a deck” / “Browse community”) in the user’s **UI locale** once i18n exists.
- Mnemonics examples on marketing pages should eventually consider LATAM cultural fit ([i18n.md](./i18n.md)) — not only literal translation.

---

## Performance UX (perceived)

Even before the Astro split:

- Marketing pages should not feel like a blank screen for seconds if avoidable (skeletons, prioritized content).
- The study session UI should optimize **interaction responsiveness** (grading, flip, next card) over marketing flourish.
- Do not block first contentful marketing paint on authenticated API calls; session-aware CTAs can hydrate after.

After Phase 3, marketing first paint should work with minimal JS; app routes can remain SPA-heavy.

---

## Accessibility & inclusion (baseline)

- Semantic headings and labels on auth and session controls
- Keyboard path through grading controls when those ship
- Do not rely on color alone for grade correctness states
- Respect locale and `lang` attributes as i18n lands

---

## Anti-patterns checklist

Reject PRs / designs that:

- [ ] Introduce `app.` as the human-facing product home without an extraordinary reason
- [ ] Hard-redirect authenticated users away from all marketing URLs
- [ ] Make pricing or docs unreachable while logged in
- [ ] Use different unrelated visual brands for marketing vs app on the same domain
- [ ] Require users to know about API subdomains
- [ ] Conflate “language I’m learning” with “language of the UI” in settings UX

---

## Phase mapping

| Phase | UX focus |
| --- | --- |
| 1 | Enforce `/` + post-login rules inside the single React app |
| 2 | Locale switcher / settings copy; keep flows identical across `en` / `es-419` |
| 3 | Preserve the same URLs and behaviors across Astro + React proxy split |
| 4 | Mobile: familiar IA (dashboard, review); web remains canonical for marketing |

---

## Related rules

`.cursor/rules/product-ux.mdc` must stay aligned with this document.

# Mobile (React Native / Expo)

**Related:** [roadmap.md](./roadmap.md) · [architecture.md](./architecture.md) · [i18n.md](./i18n.md) · [dx-tooling.md](./dx-tooling.md)

Language learning is a **phone-native habit** (commutes, short review sessions). A React Native app is part of the long-term plan — sequenced **after** the web learning loop and shared API are trustworthy.

---

## Why mobile

- Spaced repetition thrives on frequent, short sessions
- Competitors learners already know (Duolingo-class apps) set a mobile expectation
- Push notifications (later) and on-the-go review are harder to match on desktop-only

Mobile is **not** a substitute for a good web app: marketing, account management, and deck editing may remain web-strong. Review/study should be excellent on phones.

---

## When to start (Phase 4)

Start `apps/mobile` when:

1. Hono API auth + deck/review endpoints are stable enough to version
2. SRS behavior in `packages/core` is tested and used by the API/web
3. You can dedicate focus without abandoning web quality

Do **not** start mobile in parallel with green-field API + first study UI unless staffing suddenly appears — for a solo/Full Sail pace, sequence wins.

---

## Recommended approach

| Choice | Recommendation | Rationale |
| --- | --- | --- |
| Framework | **Expo** (React Native) unless a hard requirement forces bare RN | Faster DX, OTA updates story, enough native escape hatches for v1 |
| Monorepo home | `apps/mobile` | Same Turbo/Bun workspace patterns as web/api |
| Backend | Same `apps/api` / `api.{brand}.com` | One product brain |
| UI kit | RN primitives + optional NativeWind / Tamagui / etc. | **Not** shadcn DOM components |

Exact UI library is an implementation decision; record it here when chosen:

| Decision | Choice | Date |
| --- | --- | --- |
| Expo vs bare RN | _TBD — lean Expo_ | |
| Styling approach | _TBD_ | |

---

## What to share vs reimplement

### Share aggressively

| Asset | Package / location | Notes |
| --- | --- | --- |
| SRS / domain logic | `packages/core` | No React imports |
| Zod contracts & DTO shapes | `packages/schemas` | Auth, decks, review payloads |
| Error codes | schemas + API | Map to localized strings on device |
| Design tokens | future shared tokens module | Color, spacing, type scale values |
| i18n message keys | shared catalogs if practical | See [i18n.md](./i18n.md) |

### Do not expect to share as-is

| Asset | Why |
| --- | --- |
| `packages/ui` (shadcn / Base UI) | DOM + web Tailwind assumptions |
| TanStack Router file routes | Different navigation model (`react-navigation` / Expo Router) |
| Marketing Astro pages | Not a native concern; use links / custom tabs to `{brand}.com` if needed |
| Web-only env schemas | Split `env/web`, `env/mobile`, `env/api` exports |

### Visual parity goal

**Same brand language**, not pixel-identical components. A native `Button` should feel like FluentVine/Memli; it does not need to import `@workspace/ui/components/button`.

---

## Auth on mobile

Web cookie sessions often do not map 1:1 to native. Architecture must allow:

- Secure token storage on device
- Refresh / revoke flows
- Deep links back to `{brand}.com` for legal pages, password reset, or marketing

The auth design chosen in Phase 1 should be written with this section in mind ([architecture.md](./architecture.md) open decisions).

---

## Navigation & IA

Mirror the learner mental model from web:

- Home / dashboard
- Decks
- Review session
- Settings (UI locale vs learning language)

Marketing content generally stays on the website; the app can open in-app browser or system browser for pricing/blog if needed.

---

## Offline & reliability (decide explicitly)

v1 may be **online-only**. If so, say so in UX (clear error when offline) rather than silently failing.

A later iteration may queue review grades offline — domain logic in `packages/core` should stay pure so sync layers can wrap it.

| Decision | Choice | Date |
| --- | --- | --- |
| v1 offline support | _TBD — lean online-only with clear errors_ | |

---

## i18n on mobile

- Default from OS locale when no profile preference exists
- After login, honor saved **UI locale**
- Keep **learning language** independent ([i18n.md](./i18n.md))
- `es-419` remains the first non-English target

---

## Tooling

- Use React Native DevTools / Flipper alternatives as the ecosystem evolves
- **Reactotron** is a strong fit once mobile exists — DEV-only ([dx-tooling.md](./dx-tooling.md))
- E2E (Detox/Maestro) is optional until the review loop is real

---

## Suggested milestone breakdown (when Phase 4 starts)

1. Expo app boots in monorepo; talks to staging API health endpoint  
2. Sign-in + session persistence  
3. List decks + start review session using shared schemas/core  
4. Settings: UI locale + learning preferences  
5. Polish, store listings, push notifications (later)

---

## Anti-patterns

- [ ] Forking SRS math into a mobile-only file “just for now”
- [ ] Waiting for perfect Astro marketing split before starting mobile (mobile depends on API/domain, not Astro)
- [ ] Trying to render web shadcn components inside WebViews as the primary UI
- [ ] Shipping Reactotron enabled in production/store builds
- [ ] Building mobile against an undocumented, unstable API

---

## Related rules

`.cursor/rules/architecture-guardrails.mdc` — keep `core` / `schemas` platform-agnostic so mobile remains feasible.

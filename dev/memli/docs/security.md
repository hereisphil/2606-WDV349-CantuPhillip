# Security & compliance

What Memli enforces today, where each rule lives in the code, and what is still open. The first audit was the Module 3 compliance and security audit (#111, November 2026). The research behind it is in [`docs/research/R9-Notes.md`](../../../docs/research/R9-Notes.md) at the repository root.

Update this file when a rule changes. A rule listed here should have a test or a CI check behind it.

## The API (`apps/api`)

### Every input is checked

| Rule | Where | Test |
| --- | --- | --- |
| Every body, query string and path param goes through a `@workspace/schemas` Zod schema before a route reads it | `validate()` in `apps/api/src/lib/validate.ts` | `routes/*.test.ts`, "answers INVALID_REQUEST for …" |
| A JSON body must be sent as `Content-Type: application/json`. A cross-site form can only send form or plain-text bodies, so this also refuses a forged write | `isJson()` in `validate.ts` | `reviews.test.ts` |
| Ids (course, card, mnemonic) are 1 to 64 characters | `idSchema` in `packages/schemas/src/content/id.ts` | `courses.test.ts`, `reviews.test.ts`, `course.test.ts` |
| One `POST /api/reviews` holds at most 500 reviews, and each `reviewId` is a UUID | `submitReviewsRequestSchema` in `packages/schemas/src/srs/review.ts` | `reviews.test.ts` |
| Time zones must be real IANA zones | `timeZoneSchema` | `courses.test.ts`, `history.test.ts` |
| SQL is always parameterized. Routes call Drizzle, never build SQL strings | `apps/api/src/db/*` | — |

### The client reports, the server decides

- A review says what happened (the card and the outcome), never a schedule. The server loads the saved progress and runs FSRS with `@workspace/core` (`apps/api/src/lib/review-batch.ts`).
- The server's clock decides when a review happened. Client times only keep the gaps between reviews in one request, never more than a day.
- A client-made `reviewId` makes a retried request count once.
- Response times are capped again on the server (`capElapsedMs`).

### Errors never leak

- Every error is `{ "error": { "code": "…" } }` with a stable code (`apps/api/src/lib/errors.ts`). No sentences, stack traces or SQL errors.
- A thrown error is logged on the server and answered as `INTERNAL_ERROR` (`app.onError`). Unknown routes answer `NOT_FOUND`.

### Origin and exposure

- **No CORS on purpose.** The web app and the API share one origin. Locally, Vite proxies `/api/*`. On staging, the gate Worker sends `/api/*` to the API through a service binding.
- **No public URL.** `memli-api-staging` has `workers_dev: false` and `preview_urls: false` (`apps/api/wrangler.jsonc`). It is only reachable through the gate Worker.
- **Staging is gated.** The gate Worker (`dev/memli/src/index.ts`) checks basic auth with a timing-safe compare, and it fails closed if its secrets are missing.
- **Nothing is cached.** Every API answer sends `Cache-Control: no-store`.
- **Production has no API yet.** Its `/api/*` answers a JSON 503 until sign-in (#108) lands.

### Community content

Mnemonics are the one place strangers' content will reach other learners.

- **No HTML from data.** A mnemonic story is typed parts (`plain`, `term`, `keyword`), never markup (`packages/schemas/src/content/mnemonic.ts`). React escapes text, and the web app has no `dangerouslySetInnerHTML`.
- **Bounded fields.** At most 24 story parts of up to 280 characters, alt text up to 250, display names up to 64.
- **Pictures only from Memli's own origin.** An image `src` must be a root path like `/mnemonics/gato.svg`. Another host, `//host`, `/\host`, `javascript:` and `data:` URLs are refused, so a picture can't track who views it. When image uploads land, their host is added to `mnemonicImageSrcSchema` on purpose (#170).
- The seed file is checked against these schemas in `apps/api/src/db/seed.test.ts`, so seeded content follows the same rules.

## Supply chain and pipeline

| Practice | Where |
| --- | --- |
| Skip any package version younger than 3 days, and save exact versions on `bun add` | `bunfig.toml` (`minimumReleaseAge`, `exact`) |
| CI installs only what the lockfile says | `bun install --frozen-lockfile` in every workflow |
| Dependency install scripts don't run (no `trustedDependencies`) | Bun's default |
| Weekly dependency update PR, through the same checks; majors and holds are written down | `.github/workflows/dependency-update.yml`, [dependencies.md](./dependencies.md) |
| Unused dependencies fail CI | Knip in `validate` |
| Read-only `GITHUB_TOKEN` on verify and deploy jobs | `permissions: contents: read` |
| `stage` needs the `validate` check, signed commits and a linear history | Branch protection |
| Secrets live in Cloudflare and GitHub Actions only; `.env*`, `.dev.vars*` and `.cf` are ignored | `.gitignore` |
| Node 26 LTS everywhere | `.nvmrc`, `engines`, workflows |

## Compliance

- **Accessibility:** axe (WCAG 2.2 AA) runs in CI on every preview in both themes.
- **Terms, privacy and community rules:** not written yet. `/terms` and `/privacy` say "Coming soon" (#170). Before any sign-up: a 13+ age requirement (COPPA), a license to show learners' mnemonics, a way to report copyrighted or harmful content, a Code of Conduct, and a privacy policy that lists the reviews log and how to export or delete data (GDPR / CCPA).
- **Deleting an account** keeps the author's mnemonics with `author: null`.

## Sign-in checklist (Week 4: #108, #107)

Real sign-in replaces `usr_prototype_01`. Better Auth already does much of this by default. The job is to keep those defaults on, set the few that don't fit Cloudflare Workers, and prove each one with a test. #108 and #107 aren't done until every box here is checked or has a written reason.

### Secrets and config

- [ ] `BETTER_AUTH_SECRET` is a long random value, set with `wrangler secret put` for staging and production, and in `.dev.vars` locally (git-ignored). Never in the repo.
- [ ] The Google client secret (#107) is a secret the same way. The client ID can live in `wrangler.jsonc`.
- [ ] The API's environment is checked by a schema in `@workspace/schemas`, like `env/web.ts`, so a missing secret fails at startup, not on a learner's first sign-in.
- [ ] `baseURL` is set per environment and is `https` outside local development, which is what makes Better Auth mark cookies `Secure`.
- [ ] `trustedOrigins` lists exactly the app's origin for each environment. No wildcards, and no `localhost` on staging or production.

### Cookies and sessions

- [ ] Session cookies are `HttpOnly`, `Secure` and `SameSite=Lax`. These are Better Auth's defaults: don't loosen them, and never use `SameSite=None`.
- [ ] A test reads the `Set-Cookie` header after sign-in and checks all three attributes.
- [ ] Decide the session length. Better Auth's default is 7 days, renewed after a day of use. Sign out (#45) deletes the session on the server, not just the cookie.
- [ ] `viewerId()` in `apps/api/src/lib/viewer.ts` reads the session. With no session, a route answers a new `UNAUTHORIZED` code (401), added to `apiErrorCodeSchema` and mapped to copy in the web app.
- [ ] Every query stays filtered by the viewer's id. A test signs in as one learner and proves they can't read or write another learner's progress or reviews.

### CSRF and origin

- [ ] Leave Better Auth's origin check on: never set `disableCSRFCheck` or `disableOriginCheck`.
- [x] Memli's own routes accept only `application/json` bodies (done in #111).
- [ ] Memli's own write routes check the `Origin` header too (#169).

### Rate limiting

- [ ] Turn Better Auth's rate limiter on explicitly for staging and production. It's only on by default when it detects production, and that detection is Node-style, so don't count on it inside a Worker.
- [ ] Store its counts in D1 (`rateLimit.storage: "database"`, with a migration). The default is memory, and memory isn't shared across Worker instances, so the limit would barely apply.
- [ ] Read the client IP from Cloudflare's header: `advanced.ipAddress.ipAddressHeaders: ["cf-connecting-ip"]`. The default, `X-Forwarded-For`, can be set by any client, so an attacker could pretend to be a new IP on every try.
- [ ] Keep the strict default on email sign-in (3 tries per 10 seconds), and add `rateLimit.customRules` for sign-up and passkey sign-in.
- [ ] Rate limit Memli's own `POST /api/reviews` (#169).
- [ ] A test proves a burst of sign-in attempts gets refused.

### Passwords and accounts (#108)

- [ ] Keep Better Auth's password hashing (scrypt). Never write our own.
- [ ] `signUpSchema` sets a minimum and maximum password length, with no "must contain a symbol" rules. Consider Better Auth's breached-password check.
- [ ] Sign-in failures say one thing, "That email or password isn't right," never which part was wrong.
- [ ] Decide on email verification. With `requireEmailVerification` on (or `autoSignIn` off), sign-up answers the same way whether or not an email is already registered, so nobody can use the form to check who has an account. It needs an email provider, so it may land after the beta. Write the decision down either way.

### Google OAuth (#107)

- [ ] Keep Better Auth's OAuth `state` and PKCE. Both are on by default.
- [ ] Register the exact redirect URI for each environment in Google Cloud. No wildcards.
- [ ] A `callbackURL` after sign-in is a path in the app, or a `trustedOrigins` origin. Never an address from a query string, so the sign-in page can't be used to send learners to another site.
- [ ] Only link a Google sign-in to an existing email account when Google says the email is verified.

### Passkeys (#107)

- [ ] Set the relying party ID and origin per environment. Staging and production have different domains, so a passkey made on one won't work on the other, and that's expected.
- [ ] Only a signed-in learner can add a passkey.

### Logs and privacy

- [ ] Never log passwords, tokens, cookies or the body of an `/api/auth/*` request. `handleError` logs only the thrown error.
- [ ] Better Auth's session rows can keep an IP address and user agent. The Privacy Policy (#170) lists them, along with how long they're kept.
- [ ] Deleting an account removes sessions, accounts and progress, and keeps mnemonics with `author: null`.

## Open issues

| Issue | What |
| --- | --- |
| #168 | Security headers and a Content Security Policy on the Worker and the API |
| #169 | Rate limiting, an `Origin` check, and cookie and OAuth rules before real sign-in (#108, #107) |
| #170 | Terms of Service, Privacy Policy and a Community Code of Conduct |
| #171 | Pin GitHub Actions to commit SHAs |

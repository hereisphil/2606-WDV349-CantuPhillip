# Security & compliance

What Memli enforces today, where each rule lives in the code, and what is still open. The first audit was the Module 3 compliance and security audit (#111, November 2026). The research behind it is in [`docs/research/R9-Notes.md`](../../../docs/research/R9-Notes.md) at the repository root.

Update this file when a rule changes. A rule listed here should have a test or a CI check behind it.

## The API (`apps/api`)

### Every input is checked

| Rule | Where | Test |
| --- | --- | --- |
| Every body, query string and path param goes through a `@workspace/schemas` Zod schema before a route reads it | `validate()` in `apps/api/src/lib/validate.ts` | `routes/*.test.ts`, "answers INVALID_REQUEST for …" |
| A write (`POST`, `PUT`, `PATCH`, `DELETE`) must carry the app's own `Origin`, or it answers `FORBIDDEN` | `requireSameOrigin` in `apps/api/src/lib/same-origin.ts` | `same-origin.test.ts` |
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
- **Nothing is cached.** Every API answer sends `Cache-Control: no-store`. Whether the public catalog may be cached at the edge is part of the rendering research (#178).
- **Every route with a learner's data needs a session** (`requireViewer`, #108). `/api/health` and `/api/auth/*` answer without one.
- **The course catalog is public on purpose** (#174). `GET /api/catalog` and `GET /api/catalog/:courseId` answer anyone, so a visitor can browse courses before signing up. They send only published courses, each one's details and its first five words, never a draft and never anything about a learner. With a session they also say which courses that learner added (`optionalViewer` in `apps/api/src/lib/viewer.ts`); a visitor gets `added: false`. Tested in `apps/api/src/routes/catalog.test.ts`.
- **A draft stays hidden on every route** (#174). The catalog, `PUT …/enrollment`, `GET /api/courses/:courseId/study` and `POST /api/reviews` all answer `NOT_FOUND` for a draft, the same as for a course that does not exist. A learner who added a course before it became a draft keeps studying it (`findStudyableCourse` and `studyableCourseIdsByCard` in `apps/api/src/db/content.ts`). The study and review routes once looked a course up by id alone, so a learner who guessed a draft's id could read it and add it; a security audit found that on 2026-11-20. Tested in `apps/api/src/routes/courses.test.ts` and `reviews.test.ts`.
- **Production has no API yet.** Its `/api/*` answers a JSON 503 until the release (#114).

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
- **Terms and community rules** (#170): `/terms` covers the 13+ age requirement (COPPA), the license to show learners' mnemonics, reporting, and DMCA notices. `/code-of-conduct` says what a mnemonic may and may not be. Both are in `apps/web/src/routes/_marketing/`. Reports and notices go to hello@phillipcantu.com, and Arizona law applies.
- **Privacy policy** (#170): `/privacy` lists every table that holds personal data, Cloudflare and Have I Been Pwned, how long each thing is kept, and how to ask for a copy or a deletion (GDPR / CCPA). Its promises rely on the daily cleanup (see Rate limiting). If a table, a third party or a retention period changes, change `privacy.tsx` in the same pull request.
- [ ] **Register a DMCA designated agent before #114 opens sign-up.** The Terms describe DMCA notices, but the safe harbor only protects Memli once an agent is registered in the Copyright Office's [DMCA Designated Agent Directory](https://copyright.gov/dmca-directory/). Online only, $6, and it expires 3 years after it was filed or last changed (a reminder email comes first). The directory is public: a P.O. box is allowed for the agent's address. Afterwards, name the agent in the "Copyright complaints" section of `terms.tsx`, exactly as registered.
- **Deleting an account** keeps the author's mnemonics with `author: null`.

## Sign-in checklist (Week 4: #108, #107)

Real sign-in replaces `usr_prototype_01`. Better Auth already does much of this by default. The job is to keep those defaults on, set the few that don't fit Cloudflare Workers, and prove each one with a test. #108 and #107 aren't done until every box here is checked or has a written reason.

### Secrets and config

- [x] `BETTER_AUTH_SECRET` is a long random value, set with `wrangler secret put` for staging and production, and in `.dev.vars` locally (git-ignored). Never in the repo. Staging's is set on `memli-api-staging` (2026-11-17). Production has no API Worker yet: #114 sets its secret when it creates one. `apiEnvSchema` refuses one under 32 characters, and the repo holds only the `.dev.vars.example` placeholder.
- [ ] The Google client secret (#107) is a secret the same way. The client ID can live in `wrangler.jsonc`. Not in the beta: Google sign-in (#107) moved to Going Beyond, and this stays open for it.
- [x] The API's environment is checked by a schema in `@workspace/schemas` (`env/api.ts`). A Worker has no startup step, so a missing or short secret fails every `/api/auth/*` request with `INTERNAL_ERROR`, from the first one after a deploy. Tested in `apps/api/src/lib/auth.test.ts`.
- [x] `baseURL` is set per environment (`BETTER_AUTH_URL` in `apps/api/wrangler.jsonc`) and is `https` outside local development, which is what makes Better Auth mark cookies `Secure`. `apiEnvSchema` refuses plain `http` on any host but `localhost`. Production gets its value with its API environment (#114).
- [x] `trustedOrigins` lists exactly the app's origin for each environment. No wildcards, and no `localhost` on staging or production. The list is left empty on purpose: Better Auth then trusts only `baseURL`'s origin, so there is one value to get right.

### Cookies and sessions

- [x] Session cookies are `HttpOnly`, `Secure` and `SameSite=Lax`. These are Better Auth's defaults: don't loosen them, and never use `SameSite=None`.
- [x] A test reads the `Set-Cookie` header after sign-up on the staging origin and checks all three attributes (`apps/api/src/lib/auth-guards.test.ts`).
- [x] Decide the session length. Kept Better Auth's default for the beta: 7 days, renewed after a day of use. Sign out (#45) deletes the session on the server, not just the cookie (`apps/api/src/lib/auth.test.ts`), and the app forgets the learner only once the server has done so.
- [x] `viewerId()` in `apps/api/src/lib/viewer.ts` reads the session, through `requireViewer` on every data route. With no session, or an ended one, a route answers the new `UNAUTHORIZED` code (401) from `apiErrorCodeSchema`. The web app maps it with the session swap in #108.
- [x] Every query stays filtered by the viewer's id. `apps/api/src/lib/viewer.test.ts` signs in as two learners and proves one can't read the other's progress or history, and that a `userId` in a request body is ignored.

### CSRF and origin

- [x] Leave Better Auth's origin check on: never set `disableCSRFCheck` or `disableOriginCheck` to `true`. Both are set to `false` by name, because Better Auth skips the origin check by itself under a test runner. Tests refuse a write from another origin, with no origin, and from another site's page.
- [x] Memli's own routes accept only `application/json` bodies (done in #111).
- [x] Memli's own write routes check the `Origin` header too (#169). `requireSameOrigin` in `apps/api/src/lib/same-origin.ts` refuses any write outside `/api/auth/*` whose `Origin` isn't `BETTER_AUTH_URL`'s, a missing one included, with `403 FORBIDDEN`. Reads are left alone: without CORS, another site's page can't read the answer.

### Rate limiting

- [x] Turn Better Auth's rate limiter on explicitly. It's only on by default when it detects production, and that detection is Node-style, so don't count on it inside a Worker. It is on everywhere, local development included, so there is no environment check to get wrong.
- [x] Store its counts in D1 (`rateLimit.storage: "database"`, the `rate_limits` table in migration `0004`). The default is memory, and memory isn't shared across Worker instances, so the limit would barely apply.
- [x] Read the client IP from Cloudflare's header: `advanced.ipAddress.ipAddressHeaders: ["cf-connecting-ip"]`. The default, `X-Forwarded-For`, can be set by any client, so an attacker could pretend to be a new IP on every try. A test sends a new `X-Forwarded-For` on every try and is still refused.
- [x] Keep the strict default on email sign-in (3 tries per 10 seconds), and add `rateLimit.customRules` for sign-up (5 new accounts a minute from one address). The passkey sign-in rule lands with passkeys (#107).
- [x] Rate limit Memli's own `POST /api/reviews` (#169): 60 requests a minute per learner and 1,200 per address, so a classroom behind one network still fits. A refusal is `429 RATE_LIMITED` with `Retry-After`. The counts live in the same D1 `rate_limits` table as sign-in's (`limitRequests` in `apps/api/src/lib/rate-limit.ts`), counted in one statement so simultaneous requests can't slip past. Cloudflare's rate limiting binding was considered and not used: its docs don't say whether it is free, and it counts per location, not globally.
- [x] Rate limit adding and removing a course (#174): `PUT` and `DELETE /api/courses/:courseId/enrollment` allow 60 requests a minute per learner and 1,200 per address, the same shape as reviews (`ENROLLMENT_LIMITS` in `apps/api/src/routes/courses.ts`). They need a session and the app's own `Origin` like every write, tested in `apps/api/src/routes/enrollment.test.ts`.
- [x] Rate limit the public catalog routes (#174): 300 requests a minute per address, since a visitor has no learner id to count (`limitAddress` in `apps/api/src/lib/rate-limit.ts`, `CATALOG_LIMIT` in `apps/api/src/routes/catalog.ts`). It costs one D1 write per request, on routes anyone can call. Serving the catalog as static or cached pages would remove that cost: see #178.
- [x] A test proves a burst of sign-in attempts gets refused, and that the learner can try again once the window ends.
- [x] Rate-limit rows hold an IP address, so they don't stay forever (#170). A daily cron (`0 4 * * *` in `apps/api/wrangler.jsonc`) deletes rows idle for more than 24 hours, expired sessions and expired verification codes (`deleteExpiredRows` in `apps/api/src/lib/cleanup.ts`, tested in `cleanup.test.ts`). The Privacy Policy promises these limits.

### Passwords and accounts (#108)

- [x] Keep Better Auth's password hashing (scrypt). Never write our own. A test checks that `accounts.password` is a hash.
- [x] `signUpSchema` sets a minimum and maximum password length (8 and 128), and Better Auth is given the same two numbers. A password also needs a capital letter, a lowercase letter and a symbol (decided 2026-11-17, replacing the earlier "no must-contain rules" line). `meetsPasswordRules` in `@workspace/schemas/auth/sign-up` is the one definition: the form uses it, and the API runs it on sign-up, password change and password reset, answering `PASSWORD_TOO_WEAK`.
- [x] A new password found in a known breach is refused with `PASSWORD_COMPROMISED` (Better Auth's `haveibeenpwned` plugin, turned on 2026-11-17). It runs on sign-up, password change and password reset, never on sign-in. Only the first five characters of the password's SHA-1 hash go to `api.pwnedpasswords.com`, which answers with every hash ending that shares them, so the service never learns the password or whether it matched. If the service is down, the request fails with a 500 and no account is made: it fails closed. The Privacy Policy (#170) names this service.
- [x] Sign-in failures say one thing, "That email or password isn't right," never which part was wrong. The API answers `INVALID_EMAIL_OR_PASSWORD` for both, and `/signin` maps that one code to that one sentence (`apps/web/e2e/auth.spec.ts`).
- [x] Decide on email verification. Decided 2026-11-17: not for the beta, because it needs an email service and a domain. Until #175, sign-up answers `USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL` for a registered email, so the form can reveal who has an account. The beta is invite-only, which limits who can try. #175 adds the email service, `requireEmailVerification` (sign-up then answers the same either way) and password reset.

### Google OAuth (#107)

Not in the beta. #107 moved to Going Beyond on 2026-11-17, so these stay open for it.

- [ ] Keep Better Auth's OAuth `state` and PKCE. Both are on by default.
- [ ] Register the exact redirect URI for each environment in Google Cloud. No wildcards.
- [ ] A `callbackURL` after sign-in is a path in the app, or a `trustedOrigins` origin. Never an address from a query string, so the sign-in page can't be used to send learners to another site.
- [ ] Only link a Google sign-in to an existing email account when Google says the email is verified.

### Passkeys (#107)

Not in the beta, for the same reason as Google sign-in.

- [ ] Set the relying party ID and origin per environment. Staging and production have different domains, so a passkey made on one won't work on the other, and that's expected.
- [ ] Only a signed-in learner can add a passkey.

### Logs and privacy

- [x] Never log passwords, tokens, cookies or the body of an `/api/auth/*` request. `handleError` logs only the thrown error, and Memli logs nothing else. A test runs sign-up, refused sign-ups, wrong and right sign-ins, a cross-origin write, a rate-limited burst and sign-out, and proves no log line holds a password, a session token or a cookie name (`apps/api/src/lib/auth.test.ts`, "the logs").
- [x] Better Auth's session rows keep an IP address (from `cf-connecting-ip`) and a user agent until the session ends or expires (7 days after the last visit). The daily cleanup deletes an expired row within a day. The Privacy Policy lists both (#170).
- [x] Deleting an account removes sessions, accounts, progress and reviews, and keeps mnemonics with `author: null`. The tables cascade that way, and a test deletes a signed-up learner and checks each one (`apps/api/src/lib/auth.test.ts`, "deleting a learner"). There is no "Delete my account" button yet: Better Auth's `deleteUser` is off. The Privacy Policy tells a learner to email from their account's address, and the account is deleted by hand.

## Open issues

| Issue | What |
| --- | --- |
| #168 | Security headers and a Content Security Policy on the Worker and the API |
| #169 | Rate limiting, an `Origin` check, and cookie and OAuth rules before real sign-in (#108, #107) |
| #170 | Terms of Service, Privacy Policy and a Community Code of Conduct |
| #175 | Email verification and password reset, so sign-up stops revealing existing accounts |
| #178 | Research: which pages are server-rendered or static, including what the public catalog may cache |
| #176 | Measure password hashing against the Workers CPU limit on staging |
| #171 | Pin GitHub Actions to commit SHAs |

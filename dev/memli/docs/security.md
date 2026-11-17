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

## Open issues

| Issue | What |
| --- | --- |
| #168 | Security headers and a Content Security Policy on the Worker and the API |
| #169 | Rate limiting, an `Origin` check, and cookie and OAuth rules before real sign-in (#108, #107) |
| #170 | Terms of Service, Privacy Policy and a Community Code of Conduct |
| #171 | Pin GitHub Actions to commit SHAs |

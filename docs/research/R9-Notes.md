# Project & Portfolio

* **Research Notes**
* **Phillip Cantu**
* **Assignment Due Date:  Nov 16, 2026**

## Main Topic - Innovation, Compliance & Security

Last week in `R8-Notes.md`, I admitted that everything was still running on a hardcoded prototype user. There was no Hono server, no D1 database, and `ts-fsrs` wasn't even installed yet. That changed this week. Memli has a real study loop now: you type an answer, see a mnemonic (okay, no mnemonics deployed, I got a couple locally), say how it went, and FSRS schedules the word. Every review is saved to D1 through a Hono API, and staging runs the whole thing behind the password gate.

So this week's research landed at a good time. The second the app started storing real data, "compliance and security" stopped being a someday problem. The question this week is basically: _what's standing between Memli and a real launch that isn't a feature?_ Laws, user trust, and the stuff attackers poke at.

I want to keep this one honest too. Some of this I've already handled (sometimes by accident, sometimes on purpose). Some of it I haven't touched, and that's what the issue list at the bottom is for.

---

### Innovation (What's Actually New Here)

Before getting into the scary stuff, I want to write down what I think the innovation is, since that's what all this security work is protecting.

None of the pieces on their own are new. Mnemonics are ancient. Spaced repetition has been around for decades. Anki has FSRS. Old Memrise had community mems. What's new is putting them together in a way that doesn't feel like homework (but still more "homework-y" than Duolingo):

1. **Mnemonics and FSRS in the same loop.** When a word doesn't stick, the fix (a memory hook a person made) shows up at the exact moment you missed it. Then FSRS brings that word back right before you'd forget it again. Most apps do one or the other.
2. **Grading a person can actually understand.** Anki asks you to pick "Again / Hard / Good / Easy," which may confuse a lot of people. Memli asks plain questions like "Yes, I knew it" or "Yes, just a typo," and the app checks your typed answer first so it can tell a typo from a real miss. A small Rating Mapper in `@workspace/core` turns that into the 1 to 4 rating FSRS wants. The learner never has to know FSRS exists.
3. **The schedule lives on the server, at the edge.** The browser only reports _what happened_. The Hono API on Cloudflare runs the same `@workspace/core` code and decides the next due date with its own clock. That's an innovation thing (one shared brain for web now and mobile later), but it's also a security thing, which leads right into the rest of this.

---

### Compliance & Security Research

I spent most of my time on the [OWASP Top 10](https://owasp.org/Top10/) and the [Electronic Frontier Foundation](https://www.eff.org/issues/privacy). OWASP is the "here's how apps actually get broken" list. EFF is more the "here's what users deserve" side: privacy, free expression, and not hoarding data you don't need. Between the two, I got a decent checklist for Memli.

#### What I already have going for me

I went through the code and here's what's already in decent shape:

* **Every API input is checked.** All the routes run requests through shared Zod schemas from `@workspace/schemas` (`apps/api/src/lib/validate.ts`). Bad input gets a plain `400 INVALID_REQUEST`. A single request can't send more than 500 reviews, so nobody can make the Worker do unlimited work.
* **Errors don't leak.** The API only ever answers with a stable code like `{ "error": { "code": "NOT_FOUND" } }` (`apps/api/src/lib/errors.ts`). If something throws, the details go to the server log and the client gets `INTERNAL_ERROR`. No stack traces, no SQL errors. This lines up with OWASP's newer category about mishandling exceptional conditions.
* **The client can't cheat the schedule.** A review only says the word and the outcome ("missed", "got it"). The server loads the saved progress, uses its own clock, and runs FSRS itself. A made-up due date never reaches the database. A client-made `reviewId` also means a retried request only counts once.
* **Mnemonic stories can't inject HTML.** A story is stored as typed parts (`plain`, `term`, `keyword`), not as markup (`packages/schemas/src/content/mnemonic.ts`). React escapes text by default, and there's no `dangerouslySetInnerHTML` anywhere in the web app. That's the main XSS hole for community content, and it's closed at the data level.
* **No CORS by design.** The web app and the API are the same origin. Vite proxies `/api/*` locally, and on staging the gate Worker passes `/api/*` straight to the API through a service binding. The API doesn't even have a public URL, so there's no wide-open `Access-Control-Allow-Origin: *` to worry about.
* **Staging is locked.** The gate Worker checks basic auth with a timing-safe compare, and it fails closed if the secrets are missing.
* **Nothing gets cached.** API answers send `Cache-Control: no-store`, since they're one learner's data.
* **Supply chain.** Back in R1, I set Bun to skip any package version less than 3 days old (`minimumReleaseAge`), and to save exact versions. OWASP now has "Software Supply Chain Failures" as its own category in the Top 10, so that rabbit hole paid off.

#### What I haven't done yet (the honest part)

* **There's no real login.** `viewerId()` always returns `usr_prototype_01`. That's on purpose, and Better Auth is Week 4 (#108, #107). But it means OWASP's #1, **Broken Access Control**, is the big one to get right next. Every route already asks `viewerId()` for the user instead of trusting an id from the request, so the fix should happen in one place.
* **No rate limiting.** Anyone past the staging gate could hammer `POST /api/reviews`. That's not a big deal with one prototype user. It's a very big deal with a sign-in form.
* **No security headers.** There's no Content Security Policy, no `X-Frame-Options` or `frame-ancestors`, no `Referrer-Policy`. OWASP files this under **Security Misconfiguration**, and it's cheap to fix in the Worker.
* **Mnemonic fields aren't tight enough for strangers yet.** Story text has no max length, and an image `src` is any non-empty string. That's fine while I'm the only one writing seeded mems. It's not fine once the community can post.
* **CSRF, once cookies exist.** Right now there are no cookies, so there's nothing to forge. Once Better Auth sets a session cookie, the API should check the `Origin` header and only accept real JSON. `SameSite=Lax` helps a lot, but I don't want it to be the only thing standing there.

#### Compliance (The Non-Code Stuff)

This was the part I'd thought about the least. A few things jumped out:

* **Terms of Service and Privacy Policy.** The footer already links to `/terms` and `/privacy`... and both pages say "Coming Soon." That's fine for a class prototype, but laws like California's CalOPPA expect a real privacy policy before an app collects personal info like emails.
* **Copyright on user-made mnemonics.** This is the big one for Memli specifically. If people upload images, some of them _will_ be copyrighted (memes, movie stills, etc.). The Terms need to say users own what they post but give Memli a license to show it, and there needs to be a DMCA-style way to report and take down content. EFF's take on this, that platforms should respond to real complaints without becoming over-eager censors, is the balance I want.
* **Code of Conduct.** Community mems are basically a small social network. GitHub's docs on [adding a Code of Conduct](https://docs.github.com/en/communities/setting-up-your-project-for-healthy-contributions/adding-a-code-of-conduct-to-your-project) made me realize I need one for the _app_, not just the repo. Mnemonics are often weird or a little crude on purpose (that's why they work!), so the line between "memorable" and "hateful" needs to be written down before I'm moderating it.
* **Age.** Language learners include kids. COPPA in the US is strict about collecting data from anyone under 13. The simplest honest path for now is a 13+ age requirement in the Terms, and maybe a kid-safe mode way later.
* **Privacy rights (GDPR / CCPA).** People should be able to export and delete their data. The schema already planned for this a little: a mnemonic's `author` becomes `null` when the author deletes their account, so the hook can stay without the person. The reviews log is the thing I'd want to think about more, since it's detailed (every answer, with response time). EFF's whole data minimization point applies here: only keep what actually helps the learner.
* **Accessibility.** The ADA isn't technically "security," but it's compliance. I'm already running axe (WCAG 2.2 AA) in CI on every preview, so this one's in a good spot.

---

### Issue List (Compliance & Security Issues for GitHub)

Per Step 2 of the assignment, here are the issues I'd file from this week's research. Per Step 3, they're not on a milestone or the roadmap yet. All three are filed on GitHub with the `backlog` label.

#### Issue 1 ([#168](https://github.com/hereisphil/2606-WDV349-CantuPhillip/issues/168)): `[Security] Add security headers and a Content Security Policy to the Worker`

* **Type:** Security / OWASP A02 Security Misconfiguration
* **Description:**
  Neither the gate Worker (`dev/memli/src/index.ts`) nor the API sets security headers today. Add them in one place so every response gets them: a strict `Content-Security-Policy` (scripts and images from our own origin, plus the future image host), `frame-ancestors 'none'`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, and `Strict-Transport-Security`.
* **Done when:** A test checks the headers on an HTML page and an `/api/*` answer, and the app still loads with no CSP errors in the console on staging.

#### Issue 2 ([#169](https://github.com/hereisphil/2606-WDV349-CantuPhillip/issues/169)): `[Security] Rate limiting and CSRF guards before real sign-in (Week 4)`

* **Type:** Security / OWASP A07 Authentication Failures, A01 Broken Access Control
* **Description:**
  Before Better Auth (#108, #107) goes live, put guards on the API: rate limit sign-in and `POST /api/reviews` per user and IP (Cloudflare has a rate limiting binding for Workers; check it stays free), check the `Origin` header on every write, and only accept `application/json`. Pair this with session cookies set as `HttpOnly`, `Secure`, `SameSite=Lax`, and OAuth with `state` and PKCE.
* **Done when:** Tests prove a request from another origin and a burst of requests are both refused with a stable error code.

#### Issue 3 ([#170](https://github.com/hereisphil/2606-WDV349-CantuPhillip/issues/170)): `[Compliance] Terms of Service, Privacy Policy and a Community Code of Conduct for mnemonics`

* **Type:** Compliance / Legal / Trust & Safety
* **Description:**
  Replace the "Coming Soon" `/terms` and `/privacy` pages with real ones before any learner signs up. The Terms should cover a 13+ age requirement, who owns a user's mnemonics and the license Memli needs to show them, and how to report copyrighted or harmful content. Add a Code of Conduct for community mems (what's fine because it's memorable, what's not). The Privacy Policy should list what we store (including the reviews log), why, and how to export or delete it.
* **Also:** Tighten `mnemonicSchema` before community posting opens: max lengths on story parts and alt text, and an image `src` that only allows our own image host.
* **Done when:** Both pages are live, the footer links work, and the sign-up flow asks the learner to accept the Terms.

---

#### Reference Links

**OWASP Foundation**<br />[OWASP Top 10](https://owasp.org/Top10/) · [Cheat Sheet Series](https://cheatsheetseries.owasp.org/)

**Electronic Frontier Foundation**<br />[Privacy](https://www.eff.org/issues/privacy) · [Free Speech](https://www.eff.org/issues/free-speech)

**GitHub Docs**<br />[Adding a Code of Conduct to Your Project](https://docs.github.com/en/communities/setting-up-your-project-for-healthy-contributions/adding-a-code-of-conduct-to-your-project) · [Using GitHub Copilot Code Review](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/request-a-code-review/use-code-review)

**Memli Internal Documentation**<br />[Project Proposal & Change Order](../ProjectProposal.md) · [Tech Stack & Change Order](../TechStack.md) · [R8: Metrics, Analysis & Making the Business Case](./R8-Notes.md) · [Changelog](../changelog.md)

---

## Personal Research: The Security Best Practices I'm Already Doing

Here's a write up the security habits that are already in the repo, not just the ones on my to-do list. A lot of these started as "huh, that seems smart" in R1 or during my apprenticeships. For example, I learned about pre-commit & pre-push hooks, and Zod from Flatiron and then GitHub workflows and a staging environment from Hgraph. This week I went back and checked whether each current practice still holds up to the research I did, and what it actually protects against.

Most of them land in the same OWASP category: **Software Supply Chain Failures**. That's the idea that your app is only as safe as every package, tool, and pipeline that touches it. For a solo dev, that's where I'm most exposed. I can't review 1,000+ packages in `node_modules` by hand. So instead of trusting everything, I set things up so bad stuff has a harder time getting in at all.

### 1. Minimum Release Age in Bun (The Cooldown)

This is the one from R1. When a popular npm package gets hijacked, the bad version usually gets caught and pulled within hours or a couple of days. Most of the damage hits people who happen to install it in that window. A **minimum release age** just means: don't install anything that brand new. Let the rest of the internet find the problem first.

Back in R1, Gemini told me Bun didn't support this, which turned out to be wrong. It's built right into `bunfig.toml`. Here's what's in `dev/memli/bunfig.toml` today:

```toml
[install]
# Save exact versions (no ^ range) to package.json on `bun add`.
exact = true

# Filter out any package version published less than 3 days ago.
# 259200 seconds = 3 days (60s * 60m * 24h * 3d)
minimumReleaseAge = 259200
```

What I didn't know in R1 is how it shows up day to day. When I run `bun outdated`, any release that's too new is marked with a `*`, so I can see an update exists without being able to pull it yet. I wrote that down in `dev/memli/docs/dependencies.md` so future-me doesn't think something is broken.

`exact = true` is the other half. From now on, `bun add` saves an exact version like `"4.4.3"` instead of a range like `"^4.4.3"`. Some older packages (Zod, for one) still have `^` ranges from before I turned this on, and that's fine, because the lockfile below decides what actually installs.

### 2. The Lockfile Is the Law in CI

Every GitHub Actions job installs with:

```bash
bun install --frozen-lockfile
```

That makes the install fail if `package.json` and `bun.lock` don't match, instead of quietly resolving something new. So what CI tests, and what gets deployed to Cloudflare, is exactly what's in the lockfile I committed. No "it worked on my machine, but CI grabbed a different version."

### 3. Updates Happen on a Schedule, Through a PR

Being careful about updates doesn't mean never updating. Old packages with known vulnerabilities are a security problem too. So in this Milestone 3 I added a weekly workflow (`.github/workflows/dependency-update.yml`). Every Monday it runs `bun run deps:update`, moves packages to the newest version their range allows, and opens one PR into `dev`.

The nice part is it goes through the exact same gates as my own code: the 3-day cooldown still applies, and the `validate` check has to pass before anything merges. Major versions stay a human decision. `docs/dependencies.md` has a "Deliberate holds" table explaining why I'm holding things like TypeScript 7 (it breaks type-aware ESLint for now). That way, holding back on a version is a written decision, not me just forgetting.

### 4. Bun Doesn't Run Random Install Scripts

This one I kind of got for free. A classic npm attack hides malware in a package's `postinstall` script, which npm runs automatically on install. Bun doesn't run lifecycle scripts for dependencies unless the package is on its small default list or I add it to `trustedDependencies` in `package.json`. I haven't added any. So even if a sketchy package slipped past the cooldown, its install script wouldn't just run on my laptop.

### 5. Fewer Packages = Fewer Doors

Every dependency is another package that could get hijacked. Knip (from R6 and #82) runs in CI and fails if there are unused files, exports, or dependencies. It already caught a bunch of unused UI packages early on. I also have a lint rule that bans importing the npm package called `cn`. The shadcn registry sometimes adds it by mistake, but our `cn` class-name helper is a local function in `@workspace/ui`, so that package is a stranger's code we never needed. Another rule keeps `ts-fsrs` out of `apps/web` entirely, so the browser bundle only gets what it needs.

### 6. Secrets Never Touch the Repo

* The staging password and Cloudflare tokens live only as Cloudflare secrets and GitHub Actions secrets.
* `.gitignore` blocks `.env*`, `.dev.vars*` (Wrangler's local secrets file), and `dev/memli/.cf`.
* Last month I went through the repo to get it ready to go public, and made sure the README and changelog didn't point at anything sensitive.

### 7. Locked-Down Pipelines and Branches

* **Least privilege in GitHub Actions.** `verify`, `staging`, and `production` all set `permissions: contents: read`, so a compromised step in those jobs can't push code. Only the workflows that actually need to write (deleting merged branches, opening the update PR, closing a finished milestone) get write access, and only to what they touch.
* **Nothing ships without `validate`.** Prettier, typecheck, ESLint, Vitest, Knip, a production build, axe, and a Wrangler dry run, on every PR and again before every deploy.
* **`stage` is protected.** It requires the `validate` check, **signed commits**, and a linear history. Signed commits prove a commit really came from me (or from GitHub's own squash merge).
* **Local hooks with Lefthook.** In R6 I researched Husky, but I ended up going with **Lefthook** (one YAML file, and it works well with the monorepo). It runs ESLint and Prettier on staged files before a commit and typechecks before a push.

### 8. A Pinned, Supported Runtime

Node is pinned to 26 LTS in `.nvmrc`, in `engines`, and in every workflow (`actions/setup-node@v7`). An LTS version keeps getting security patches, and pinning it means my laptop, CI, and the deploy all run the same thing.

### What I'd Tighten Next

Being honest again: I pin my GitHub Actions by major version tag (`actions/checkout@v4`), not by commit SHA. GitHub's own hardening guide recommends SHAs for third-party actions, since a tag can be moved to point at different code. That's a small change, and it's next on my list after #168 to #170.

### Reference Links

**Bun Documentation**<br />[Minimum release age](https://bun.com/docs/pm/cli/install#minimum-release-age) · [Lifecycle scripts & trustedDependencies](https://bun.com/docs/pm/lifecycle)

**OWASP Foundation**<br />[OWASP Top 10](https://owasp.org/Top10/)

**GitHub Docs**<br />[Security hardening for GitHub Actions](https://docs.github.com/en/actions/security-for-github-actions/security-guides/security-hardening-for-github-actions) · [About protected branches](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)

**Lefthook**<br />[Lefthook on GitHub](https://github.com/evilmartians/lefthook)

**My Earlier Research**<br />[R1: Securing NPM Packages](./R1-Notes.md) · [R6: Monorepos, ESLint & Git Hooks](./R6-Notes.md)

**Note:**<br />None of these are fancy. Most are one line in a config file. But stacked together, a bad package has to get past a 3-day cooldown, a frozen lockfile, blocked install scripts, Knip, and a required CI check before it gets anywhere near staging. That's the kind of "security by default" I want, especially as a solo dev who can't watch everything at once.

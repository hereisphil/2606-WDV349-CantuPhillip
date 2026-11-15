# `apps/api`

The Memli backend: a [Hono](https://hono.dev/) app that runs on Cloudflare Workers. The web app talks to it today, and the mobile app will later ([`docs/architecture.md`](../../docs/architecture.md)).

It is a shell for now (#106): a health check and the error format. The Drizzle + D1 tables land in the last task of the same issue.

## Run it locally

From `dev/memli`:

```bash
bun run dev
```

Turbo starts both apps:

| App | Command | Address |
| --- | --- | --- |
| `apps/web` | `vite` | `http://localhost:5173` |
| `apps/api` | `wrangler dev` | `http://localhost:8787` |

`wrangler dev` runs the Worker in `workerd`, the same runtime Cloudflare runs in production, so local behavior matches the deploy. The port is pinned in [`wrangler.jsonc`](./wrangler.jsonc).

To run the API alone: `bun run dev` from `apps/api`.

## How the web app reaches it: the `/api` proxy

The browser only ever talks to the web origin. Vite forwards anything under `/api` to this app ([`apps/web/vite.config.ts`](../web/vite.config.ts)):

```text
browser ──► http://localhost:5173/api/*  ──(Vite proxy)──►  http://localhost:8787/api/*
browser ──► http://localhost:5173/*      ──► the React app
```

So web code calls a relative path and never names a host or a port:

```ts
const res = await fetch("/api/health")
```

Why a proxy instead of calling `localhost:8787` from the browser:

- **No CORS.** A page on port 5173 calling port 8787 is cross-origin. Through the proxy, every request is same-origin.
- **First-party cookies.** Session cookies from Better Auth (#108) will just work, with no `SameSite=None` workarounds.
- **One path everywhere.** The app is mounted with `basePath("/api")`, so nothing rewrites paths. The same `/api/*` works behind the proxy and on a same-origin deploy.

Check it by hand with both servers running:

```bash
curl http://localhost:5173/api/health
```

It answers `{"status":"ok"}`. A `502` from that address means Vite is up but the API is not.

## Routes

| Route | Answers | Contract |
| --- | --- | --- |
| `GET /api/health` | `200 {"status":"ok"}` | `@workspace/schemas/api/health` |

`/api/health` is a liveness check: the Worker is up and routing. It does not touch the database.

## Errors are codes, not sentences

Every response that is not a success has the same body:

```json
{ "error": { "code": "NOT_FOUND" } }
```

The server never writes the sentence a learner reads. The web app maps the code to copy in the learner's UI language, so adding Spanish later touches no API code ([`docs/i18n.md`](../../docs/i18n.md)).

| Code | Status | When |
| --- | --- | --- |
| `NOT_FOUND` | 404 | No route matched, or the thing asked for does not exist |
| `INTERNAL_ERROR` | 500 | A route threw. The details go to the log, never the response |

In a route, send an error with the helper from [`src/lib/errors.ts`](./src/lib/errors.ts):

```ts
import { errorResponse } from "./lib/errors"

app.get("/courses/:id", (c) => {
  // ...
  return errorResponse(c, "NOT_FOUND")
})
```

Unknown routes and thrown errors are already handled for the whole app (`app.notFound`, `app.onError`), so a route never needs its own `try` / `catch` just to shape the response.

To add a code:

1. Add it to `apiErrorCodeSchema` in [`packages/schemas/src/api/error.ts`](../../packages/schemas/src/api/error.ts). Clients take the list from there.
2. Give it a status in `STATUS` in `src/lib/errors.ts`. TypeScript fails the build until you do.

A code is a contract. Adding one is safe. Renaming or removing one breaks every client that maps it.

## Layout

| File | Purpose |
| --- | --- |
| `src/app.ts` | The Hono app and its routes. Tests import this. |
| `src/lib/errors.ts` | `errorResponse`, plus the app-wide not-found and error handlers. |
| `src/index.ts` | The Worker entry. It only exports the app. |
| `src/*.test.ts` | Vitest. `app.request("/api/...")` calls a route with no server running. |
| `wrangler.jsonc` | Worker name, entry, compatibility date, dev port. |

## Scripts

| Script | Purpose |
| --- | --- |
| `bun run dev` | `wrangler dev` on port 8787 |
| `bun run test` | Vitest |
| `bun run typecheck` | `tsc --noEmit` with Workers types |
| `bun run lint` | ESLint |
| `bun run build` | `wrangler deploy --dry-run`: bundles the Worker and uploads nothing. It fails if an import cannot run on Workers. |

## Rules

- Domain logic comes from `@workspace/core`. Request and response shapes come from `@workspace/schemas`. Do not fork either here.
- Errors go out through `errorResponse` as stable **codes**, never finished English sentences.
- No React, DOM or `@workspace/ui` imports. ESLint enforces it.

## Not yet

- **Deploying.** Nothing ships this Worker yet. Staging and production still deploy only the web assets from the root [`wrangler.jsonc`](../../wrangler.jsonc).
- **Local secrets.** When the API needs them, they go in `apps/api/.dev.vars`, which is gitignored.

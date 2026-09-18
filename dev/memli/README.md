# Memli — community mnemonic language learning (monorepo)

Vite + React web app (`apps/web`), shared UI (`packages/ui`), Turborepo + Bun.

**Planned public brand:** FluentVine (see docs). Product and architecture decisions live in [`docs/`](./docs/README.md) — start with the [roadmap](./docs/roadmap.md).

## Setup

```bash
cd dev/memli
bun install
```

`bun install` runs `lefthook install` via the `prepare` script so Git hooks are registered at the **repository root** (Git hooks are always repo-scoped).

## Scripts

| Script | Purpose |
|--------|---------|
| `bun run dev` | Start web (Turbo) |
| `bun run lint` | ESLint via Turbo |
| `bun run format` / `format:check` | Prettier write / check |
| `bun run typecheck` | TypeScript via Turbo |
| `bun run test` | Vitest via Turbo (`@workspace/core` SRS logic) |
| `bun run knip` | Unused deps, exports, and files |
| `bun run build` | Production build |

## Git hooks (Lefthook)

Config lives at the **repository root** ([`lefthook.yml`](../../lefthook.yml)) because Git hooks are always repo-scoped; commands are limited to `dev/memli/` (and ESLint runs from `apps/web` / `packages/ui` so each flat config resolves).

| Hook | What runs |
|------|-----------|
| **pre-commit** | Prettier + ESLint on **staged** Memli files (parallel, auto-fix + re-stage) |
| **pre-push** | `bun run typecheck` in `dev/memli` |

### Skip hooks (intentionally)

```bash
# Skip Lefthook for one command
LEFTHOOK=0 git commit -m "..."
LEFTHOOK=0 git push

# Or Git's bypass (skips all hooks, including Lefthook)
git commit --no-verify
git push --no-verify
```

Prefer `LEFTHOOK=0` when you only need to skip Memli quality gates. Re-install hooks after clone if needed:

```bash
cd dev/memli && bunx lefthook install
```

## Knip (unused code / deps)

```bash
cd dev/memli
bun run knip
```

Config: [`knip.json`](./knip.json). Treat a clean Knip run as the bar before wiring it into pre-push/CI. `useTheme` is ignored as intentional ThemeProvider API until a UI control consumes it. Shared Zod schemas live in `@workspace/schemas` (#83), not in `@workspace/ui`.

## Tests (Vitest)

```bash
cd dev/memli
bun run test
```

Pure SRS/domain logic lives in [`packages/core`](./packages/core) and is tested with Vitest. We intentionally skip marketing UI and route components; see the package README for scope.

## Adding shadcn/ui components

From the monorepo root (`dev/memli`):

```bash
bunx shadcn@latest add button -c apps/web
```

Components land in `packages/ui/src/components`. Import with:

```tsx
import { Button } from "@workspace/ui/components/button"
```

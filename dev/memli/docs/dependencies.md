# Dependencies

**Related:** [dx-tooling.md](./dx-tooling.md) · [roadmap.md](./roadmap.md) · issue #148

How Memli keeps its packages current, and which upgrades are on hold and why.

---

## How versions are chosen

| Piece | What it decides |
| --- | --- |
| `package.json` ranges (`^`, `~`, a bare major) | Which versions a package may move to. Keep each range's style when you edit it |
| `bun.lock` | The exact versions installed, locally and in CI (`bun install --frozen-lockfile`) |
| `bunfig.toml` `exact = true` | `bun add` saves an exact pin. That is why some packages are pinned: it records how they were added, not a decision to hold them |
| `bunfig.toml` `minimumReleaseAge` | Bun skips any release younger than 3 days, a buffer against a compromised or broken publish. `bun outdated` marks those rows with `*` |

---

## Weekly update (automatic)

[`.github/workflows/dependency-update.yml`](../../../.github/workflows/dependency-update.yml) runs every Monday at 13:00 UTC, and on demand from the Actions tab. It runs `bun run deps:update` on a fresh `dev` and opens or refreshes one PR, **[DX] Weekly dependency update**, from `dx-weekly_dependency_update` into `dev`.

`bun run deps:update` ([`scripts/update-deps.sh`](../scripts/update-deps.sh)):

1. Runs `bun update` in the root and every workspace (it only touches the one it runs in).
2. Restores every `package.json`, because `exact = true` makes `bun update` rewrite ranges as pins. The lockfile keeps the new versions.
3. Regenerates both `worker-configuration.d.ts` files (`bun run cf-typegen`), since a new wrangler brings new runtime types.
4. Prints the direct bumps by comparing lockfiles. Bun's own output leaves some out.

It never crosses a major version or moves an exact pin. Those stay manual (below).

**Setup it needs:**

- "Allow GitHub Actions to create and approve pull requests" in Settings → Actions → General. Without it the PR step fails with a 403.
- The workflow on `main`. GitHub runs schedules from the default branch only.

**CI on the PR.** PRs and pushes made with `GITHUB_TOKEN` don't fire `pull_request` workflows, so the job starts `verify.yml` on its branch with `workflow_dispatch`. The `validate` result shows on the PR as usual.

**Reviewing it:**

- Merge it once `validate` is green, before the next Monday. Each run rebuilds the branch from `dev` and force-pushes, which drops any commit added to it by hand.
- Read the release notes for anything that touches studying, saving reviews or the API.
- If Prettier or the router plugin changed their output, `validate` fails on format. Run `bun run format` (and `bun run build` for `routeTree.gen.ts`) on the branch and commit.

---

## Manual updates

### In range, now

```bash
cd dev/memli
bun run deps:update
```

It refuses to run with uncommitted `package.json` or `bun.lock` changes, since step 2 restores those files. Then run the same gate as CI: `format:check`, `typecheck`, `bunx tsc --noEmit`, `lint`, `test`, `knip`, `build`, and `bun run test:a11y` in `apps/web`.

**Playwright after a lockfile change.** The first run re-optimizes Vite's dependencies, and on that cold start the retry-timing tests in `api-sync.spec.ts` can fail. Run the suite again before blaming the upgrade. Don't edit `vite.config.ts` mid-run either: Vite restarts its server.

### A major version or an exact pin

One package per commit, so each can be reverted alone.

1. Read the changelog from the current version to the target. Search the code for any API it changes.
2. Edit the range by hand in every workspace that lists the package, keeping its style (`"24"` → `"26"`, `"^24"` → `"^26"`, an exact pin stays exact). Then `bun install`.
3. Check peer ranges: `grep -o '"<package>@<version>"[^]]*' bun.lock`.
4. Run the full gate above. Commit with `[DX]` and the issue it advances.

`@types/node` follows the Node major in `.nvmrc`. Move them together.

---

## Deliberate holds

`bun outdated -r` should list only these, plus `*` rows that are simply too new.

| Package | Held at | Why | Revisit when |
| --- | --- | --- | --- |
| `typescript` | 6.0.3 (`~6`) | `typescript-eslint` peers on `typescript >=4.8.4 <6.1.0`, canary included (checked at 8.72.2 and 8.72.3-alpha.8). TypeScript 7 ships its compiler API only under `unstable/*`, and type-aware lint rules need it | `typescript-eslint` accepts 7 in its peer range |
| `drizzle-orm`, `drizzle-kit` | 0.45.4, 0.31.11 (exact) | 1.0 is still a release candidate. `drizzle-kit` writes the migrations that the "Migrations Match Schema" CI step diffs, so a bump can change generated SQL | 1.0 is stable. Move both together, then run `bun run db:generate` in `apps/api` and read any new migration (`apps/api/README.md`, table rebuilds) |

Exact pins that are current, not held: `hono`, `@tanstack/react-query`. Bump them on purpose, as above.

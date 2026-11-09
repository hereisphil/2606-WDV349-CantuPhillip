# Memli PR conventions

Shared by the `pr`, `pr-watch`, and `pr-merge` skills. Read this before opening or merging a PR.

## Repo & auth

- Repo: `hereisphil/2606-WDV349-CantuPhillip`
- Always unset forced tokens so `gh` uses the `hereisphil` login:

```bash
env -u GITHUB_TOKEN -u GH_TOKEN gh <command> --repo hereisphil/2606-WDV349-CantuPhillip
```

## Branch flow

| PR | Base ← head | Issue link keyword | Board effect |
|----|-------------|--------------------|--------------|
| Feature | `dev` ← feature branch | `Refs #N` | In progress → Review on merge |
| Promote | `stage` ← `dev` | (none; sweep) | Review → Staging; **issues close** |
| Release | `main` ← `stage` | (none; sweep) | Staging → Done |

Default for these skills: **feature → `dev`**. Do not open or merge a `dev → stage` or `stage → main` promotion unless the user explicitly asks for a promotion.

## Before opening

1. Confirm the user asked to open/push a PR (`no-auto-commit.mdc`).
2. Working tree clean (or only intentional uncommitted files the user knows about).
3. Branch pushed: `git push -u origin HEAD` if needed.
4. Base is `dev` unless the user names another base.

## PR title & body

Title: short summary matching the change (prefer the `[area]` style from `commit-messages.mdc` when it fits).

Body (HEREDOC):

```markdown
## Summary
- <1–3 bullets of what / why>

## Test plan
- [ ] <checks the reviewer or CI should cover>

Refs #N
```

Rules:

- Use `Refs #N` (any case; optional colon). **Never** `Closes` / `Fixes` / `Resolves` on PRs into `dev` — that would skip Staging review when GitHub auto-closes on `main`.
- Link every issue the PR advances. Board sync keys off these keywords in title, body, or commits.

## CI

Required check context: **`validate`** (workflow `CI Verification` / `verify.yml`).

Watch with:

```bash
env -u GITHUB_TOKEN -u GH_TOKEN gh pr checks <number> --repo hereisphil/2606-WDV349-CantuPhillip --watch
```

Or poll `gh pr view <n> --json statusCheckRollup,state,mergeable,url` until `validate` is success or failure.

## Merge (feature → `dev` only)

Only when:

1. User invoked `pr-merge` (or clearly asked to merge if CI is green).
2. `validate` succeeded.
3. PR is mergeable (no blocking conflicts).
4. Base is `dev` (refuse silent promotion merges).

This repo allows merge commits only. Squash and rebase are disabled in the GitHub settings.

```bash
env -u GITHUB_TOKEN -u GH_TOKEN gh pr merge <number> --repo hereisphil/2606-WDV349-CantuPhillip --merge
```

Do not pass `--squash` or `--rebase`. Do not `--admin` or skip checks.

## Report back

Always return: PR URL, base←head, linked `Refs #N`, CI result (pending / pass / fail + job URL if failed), and merge result if applicable.

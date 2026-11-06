---
name: pr-merge
description: >-
  Open a Memli feature PR into dev (or attach to an existing PR), watch
  validate CI, merge with a merge commit only if checks pass and the base is
  dev, then report results. Use when the user invokes /pr-merge or clearly
  asks to merge if CI is green — never from vague "ship it" alone.
---

# pr-merge

Open (or reuse) a feature PR, watch CI, merge only if green. Feature → `dev` only.

## Steps

1. Read [../pr-conventions/reference.md](../pr-conventions/reference.md) and follow it.
2. Confirm the user invoked `pr-merge` or explicitly asked to merge if CI passes.
3. Create or reuse the feature PR (same as `pr` / `pr-watch`).
4. Watch until `validate` completes.
5. If `validate` failed or the PR is not mergeable: report failure, **do not merge**.
6. If green and base is `dev`: `gh pr merge <n> --merge`.
7. Report: PR URL, CI result, merge commit/URL (or why merge was skipped).

## Do not

- Pass `--squash` or `--rebase`. This repo allows merge commits only.
- Merge on red, pending, or conflicted PRs.
- Merge promotion PRs (`dev→stage` / `stage→main`) unless the user explicitly asked for that promotion and named it.
- Treat "ship it", "looks good", or finishing a task as permission to merge without an explicit merge request.

---
name: pr-merge
description: >-
  Open a Memli feature PR into dev (or attach to an existing PR), watch
  validate CI, merge with a merge commit only if checks pass and the base is
  dev, then checkout/pull dev and delete the merged local branch. Use when the
  user invokes /pr-merge or clearly asks to merge if CI is green — never from
  vague "ship it" alone.
---

# pr-merge

Open (or reuse) a feature PR, watch CI, merge only if green. Feature → `dev` only.
After a successful merge, land the local workspace back on an up-to-date `dev`
and remove the feature branch that just merged.

## Steps

1. Read [../pr-conventions/reference.md](../pr-conventions/reference.md) and follow it.
2. Confirm the user invoked `pr-merge` or explicitly asked to merge if CI passes.
3. Note the current feature branch name (`git branch --show-current` or the PR head) before merging — you need it for cleanup.
4. Create or reuse the feature PR (same as `pr` / `pr-watch`).
5. Watch until `validate` completes.
6. If `validate` failed or the PR is not mergeable: report failure, **do not merge**.
7. If green and base is `dev`: `gh pr merge <n> --merge`.
8. After a successful merge only:
   - `git checkout dev`
   - `git pull origin dev` (fast-forward to include the merge)
   - `git branch -D <merged-feature-branch>` for the local branch that was just merged (skip if already gone; do not delete `dev` / `stage` / `main`)
9. Report: PR URL, CI result, merge commit/URL, and that local `dev` is current with the feature branch deleted (or why merge/cleanup was skipped).

## Do not

- Pass `--squash` or `--rebase`. This repo allows merge commits only.
- Merge on red, pending, or conflicted PRs.
- Merge promotion PRs (`dev→stage` / `stage→main`) unless the user explicitly asked for that promotion and named it.
- Treat "ship it", "looks good", or finishing a task as permission to merge without an explicit merge request.
- Delete remote feature branches unless the user asked (local `-D` only after merge).
- Run the post-merge checkout/pull/delete steps when the merge was skipped or failed.

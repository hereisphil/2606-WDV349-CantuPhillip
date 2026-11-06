---
name: pr
description: >-
  Open a Memli feature pull request into dev with Refs #N linking, correct
  hereisphil gh auth, and a Summary/Test plan body. Use when the user asks to
  open a PR, create a pull request, or invokes /pr — not for watching CI or
  merging.
---

# pr

Open a feature PR. Do not watch CI and do not merge.

## Steps

1. Read [../pr-conventions/reference.md](../pr-conventions/reference.md) and follow it.
2. Confirm the user explicitly asked to open a PR.
3. Ensure the feature branch is pushed; base defaults to `dev`.
4. Create the PR with `gh pr create` (HEREDOC body, `Refs #N`, Summary + Test plan).
5. Report the PR URL and linked issues. Stop.

## Do not

- Watch or wait on checks (`pr-watch` / `pr-merge`).
- Merge.
- Pass `--squash` or `--rebase`. This repo allows merge commits only (`gh pr merge --merge`).
- Open a promotion PR (`dev→stage` / `stage→main`) unless the user asked for a promotion.

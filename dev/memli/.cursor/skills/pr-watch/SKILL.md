---
name: pr-watch
description: >-
  Open a Memli feature PR into dev (or attach to an existing PR), watch the
  validate CI check, and report pass/fail with links. Use when the user asks to
  open a PR and watch CI, wait on checks, or invokes /pr-watch — not for merging.
---

# pr-watch

Open (or reuse) a feature PR, watch CI, report results. Do not merge.

## Steps

1. Read [../pr-conventions/reference.md](../pr-conventions/reference.md) and follow it.
2. If no PR exists for this branch, create one exactly as the `pr` skill would.
3. If a PR already exists, use it (`gh pr view --json number,url,statusCheckRollup`).
4. Watch until `validate` completes (`gh pr checks <n> --watch` or poll status).
5. Report: PR URL, CI outcome, failing job URL/logs summary if red. Stop.

## Do not

- Merge, even when green (`pr-merge`).
- Retry flaky CI in a loop unless the user asks.
- Open a promotion PR unless the user asked for a promotion.

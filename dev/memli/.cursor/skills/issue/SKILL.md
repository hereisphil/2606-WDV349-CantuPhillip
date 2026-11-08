---
name: issue
description: >-
  Begin a Memli GitHub issue: pull fresh `dev`, open a correctly named feature
  branch, then implement only the first remaining task. Use when the user
  invokes /issue or /issue N (e.g. /issue 109). With no number, pick the best
  incomplete open issue by reading task checkboxes — issues stay open until
  they merge to stage.
---

# issue

Start work on one GitHub issue: land on a clean feature branch, then immediately
implement **only the first remaining unchecked task**.

## Triggers

| Invocation | Behavior |
|------------|----------|
| `/issue N` | Begin issue **N** (after confirming unfinished tasks), then do the first remaining task only. |
| `/issue` | Review open issues, pick the best unfinished one, begin it, then do the first remaining task only. |

## Repo & auth

- Repo: `hereisphil/2606-WDV349-CantuPhillip`
- Always unset forced tokens:

```bash
env -u GITHUB_TOKEN -u GH_TOKEN gh <command> --repo hereisphil/2606-WDV349-CantuPhillip
```

## Incomplete vs still-open

Issues stay **open until they merge to `stage`**. An open issue can already be
finished in `dev`. Treat an issue as **done for picking / starting** when:

1. Every checkbox under `## Tasks` (and `## Side Work`, if present) is `[x]`, **or**
2. There is no Tasks list, but every `## Done when` checkbox is `[x]`, **or**
3. Milestone / PR evidence shows the work already shipped and only board-close is pending (e.g. all tasks checked, merged PR into `dev`).

Skip those when auto-picking. If the user named one with `/issue N` and it looks finished, say so and stop — do not open a branch unless they insist.

Also skip: closed issues, issues on **Going Beyond** unless the user named them, and issues with no remaining actionable work.

## Pick order (`/issue` with no number)

1. Load open milestones and their descriptions (note any "Do first" / carryover lines).
2. List open issues on the **current / nearest-due course milestone** first (e.g. `359 MS 2`, then `359 MS 3`).
3. Filter to **incomplete** issues (unchecked Tasks remain).
4. Prefer milestone "do first" / blocker issues over later ones; then lower issue numbers that unblock others; then docs/DX only when they are the milestone's remaining work (e.g. only #109 left on MS 2).
5. State the pick in one short sentence (why this issue, what was skipped as already done).

## Begin the issue

1. Confirm working tree is clean (or only intentional local files the user knows about). If dirty with unrelated work, stop and ask.
2. `git checkout dev && git pull origin dev`
3. Name the branch `{issue#}-{type}-{slug}` per `git-workflow.mdc`:
   - **type** from title/labels: `docs`, `web`, `dx`, `ui`, `api`, `auth`, `core`, `deploy`, …
   - **slug**: short `snake_case` from the title (not the whole title)
4. `git checkout -b <branch>`
5. Read the issue body. Identify the **first unchecked** item under `## Tasks` (skip already `[x]` items; ignore `## Done when` for sequencing).
6. Briefly state Goal, which task is first, and what remains after it — then **immediately begin implementing that first task only**. Stop when that task is done (or blocked); do not continue to the next task in the same turn unless the user asks.

## Report

- Issue number, title, URL
- Milestone
- Branch name
- First task started (and remaining unchecked tasks)
- If auto-picked: one line on why, plus any open-but-complete issues skipped

## Do not

- Commit, push, or open a PR as part of this skill (unless the user separately asks).
- Implement more than the first remaining task in one `/issue` run.
- Start on a stale `dev` without pulling.
- Reuse an unrelated existing feature branch.
- Pick a completed-but-still-open issue when `/issue` has no number.
- Close the issue (board closes on `stage` merge).
- Use `Closes` / `Fixes` language while starting work.

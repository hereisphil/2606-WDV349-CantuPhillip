# Memli — Claude Code instructions

The rules for this project live in `.cursor/rules/` so Cursor and Claude Code share one source of truth. Edit the `.mdc` files there, not copies here. Each one is always-on: follow all of them.

@.cursor/rules/teach-first.mdc
@.cursor/rules/memli-stack.mdc
@.cursor/rules/architecture-guardrails.mdc
@.cursor/rules/product-ux.mdc
@.cursor/rules/react-state.mdc
@.cursor/rules/i18n-foundations.mdc
@.cursor/rules/git-workflow.mdc
@.cursor/rules/commit-messages.mdc
@.cursor/rules/no-auto-commit.mdc
@.cursor/rules/browser-verification.mdc

## Skills

`.claude/skills` links to `.cursor/skills`, so `/issue`, `/pr`, `/pr-watch`, and `/pr-merge` work in both tools. `pr-conventions/reference.md` is shared reference for the PR skills, not a skill of its own.

## Claude Code notes

- Paths in the rules (`docs/…`, `apps/web/…`, `packages/…`) are relative to `dev/memli/`. Course documentation (proposal, designs, research) lives in the repository root `docs/`.
- When a new rule file is added to `.cursor/rules/`, add an `@` import for it above.

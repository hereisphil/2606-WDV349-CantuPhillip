# `@workspace/eslint-config`

Shared ESLint flat configs for the Memli monorepo.

## Exports

| Import | Use for |
|--------|---------|
| `@workspace/eslint-config/base` | Non-React TypeScript packages |
| `@workspace/eslint-config/react` | React apps / UI libraries (Vite) |
| `@workspace/eslint-config/plugin` | Local `memli/*` rules (already registered by `react`) |

## Usage

```js
// apps/web/eslint.config.js
import { defineConfig, globalIgnores } from "eslint/config"
import reactConfig from "@workspace/eslint-config/react"

export default defineConfig([
  ...reactConfig,
  globalIgnores(["routeTree.gen.ts"]),
  {
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
])
```

Strict custom rules (unused vars + `_` prefix, no `any`, explicit return types, type-only imports, `no-console`, `eqeqeq`, etc.) live here so every package stays consistent.

`eslint-config-prettier` is applied last in `base.js` so ESLint never fights Prettier on formatting.

## Accessibility (`jsx-a11y-x/*`)

`react` applies the `recommended` config from [`eslint-plugin-jsx-a11y-x`](https://github.com/es-tooling/eslint-plugin-jsx-a11y-x), a community fork of `eslint-plugin-jsx-a11y` with the same rules. The original doesn't support ESLint 10 yet ([jsx-a11y#1075](https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/issues/1075)); switch back if it ships support, renaming the `jsx-a11y-x/` prefix to `jsx-a11y/`.

The rules only know HTML elements, so `settings["jsx-a11y-x"].components` maps our wrappers to the element they render: `Button` → `button`, `Input` → `input`, `Label` → `label`, `AvatarImage` → `img`. TanStack `Link` is deliberately not mapped: it takes `to` instead of `href`, and `render={<Link to="…" />}` gets its text from the `Button`, so every rule about anchors would report a false positive. The axe check covers rendered links instead.

Lint can't judge contrast, focus order, or whether names are unique across a page. Those are covered by the Playwright + axe suite in `apps/web` (`bun run test:a11y`), which the `validate` job runs against `/dashboard` and every `?preview=` state in light and dark. An `eslint-disable-next-line` needs a `--` reason, as on the shared `Label` wrapper, whose `htmlFor` arrives through spread props.

## Local rules (`memli/*`)

Rules that encode Memli decisions live in `rules/` and are exposed through `plugin.js`.

| Rule | Default in `react` | What it enforces |
|------|--------------------|------------------|
| `memli/no-use-state-sprawl` | `["error", { max: 1 }]` | At most one `useState` per component/hook, and no `useState` initialised with a multi-key object literal. Anything with a lifecycle or coupled values must be a `useReducer` with a discriminated union. |
| `memli/button-link` | `"error"` | `Button` rendering a `Link` or `<a>` sets `nativeButton={false}`, and the Radix `asChild` prop is rejected. |
| `memli/no-literal-ui-strings` | off (`apps/web` turns it on for `src/routes/_app/**`) | No hard-coded UI text in JSX or in `aria-label` / `title` / `alt` / `placeholder` (and a few other ARIA text attributes), and no labels built with template literals or `+`. Copy comes from a `messages` object or a formatter. Option: `{ allow: ["Memli"] }` for exact strings that never translate. |

The `react` config turns `no-use-state-sprawl` **on everywhere**; consumers opt *out* for exempt zones (shadcn internals in `packages/ui`, `_marketing` / `_auth` in `apps/web`). Rationale and the state-owner table: [`docs/state-management.md`](../../docs/state-management.md).

`no-literal-ui-strings` works the other way: consumers opt *in* per folder, because marketing copy and shadcn internals aren't translatable yet. How to satisfy it: [`docs/i18n.md`](../../docs/i18n.md) section 3.

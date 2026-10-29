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

## Local rules (`memli/*`)

Rules that encode Memli decisions live in `rules/` and are exposed through `plugin.js`.

| Rule | Default in `react` | What it enforces |
|------|--------------------|------------------|
| `memli/no-use-state-sprawl` | `["error", { max: 1 }]` | At most one `useState` per component/hook, and no `useState` initialised with a multi-key object literal. Anything with a lifecycle or coupled values must be a `useReducer` with a discriminated union. |

The `react` config turns the rule **on everywhere**; consumers opt *out* for exempt zones (shadcn internals in `packages/ui`, `_marketing` / `_auth` in `apps/web`). Rationale and the state-owner table: [`docs/state-management.md`](../../docs/state-management.md).

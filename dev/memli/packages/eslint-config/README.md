# `@workspace/eslint-config`

Shared ESLint flat configs for the Memli monorepo.

## Exports

| Import | Use for |
|--------|---------|
| `@workspace/eslint-config/base` | Non-React TypeScript packages |
| `@workspace/eslint-config/react` | React apps / UI libraries (Vite) |

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

# `@workspace/typescript-config`

Shared TypeScript `tsconfig` bases for the Memli monorepo.

## Exports

| Import | Use for |
|--------|---------|
| `@workspace/typescript-config/base.json` | Shared strict + bundler defaults |
| `@workspace/typescript-config/react-library.json` | React packages (`packages/ui`) |
| `@workspace/typescript-config/vite-app.json` | Vite React app source (`apps/web`) |
| `@workspace/typescript-config/node.json` | Node/Vite config files (`vite.config.ts`) |
| `@workspace/typescript-config/workers.json` | Cloudflare Workers entry (`src/` at monorepo root) |

## Usage

```json
{
  "extends": "@workspace/typescript-config/vite-app.json",
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"]
}
```

Keep path aliases and `include`/`exclude` in each package — they are workspace-specific. Shared compiler options live here.

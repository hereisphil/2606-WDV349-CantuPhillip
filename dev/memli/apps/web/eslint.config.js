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
  // TanStack file routes export `Route` — not a React component
  {
    files: ["src/routes/**/*.{ts,tsx}"],
    rules: {
      "react-refresh/only-export-components": "off",
    },
  },
  // Signed-in app copy goes through `messages` objects (docs/i18n.md). Marketing and auth copy come later.
  {
    files: ["src/routes/_app/**/*.tsx"],
    rules: {
      "memli/no-literal-ui-strings": "error",
    },
  },
  // React state guardrail exemptions (docs/state-management.md).
  {
    files: [
      "src/routes/_marketing/**/*.{ts,tsx}",
      "src/routes/_auth/**/*.{ts,tsx}",
    ],
    rules: {
      "memli/no-use-state-sprawl": "off",
    },
  },
])

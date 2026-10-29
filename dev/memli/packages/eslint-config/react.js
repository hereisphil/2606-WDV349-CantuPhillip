import reactHooks from "eslint-plugin-react-hooks"
import reactRefresh from "eslint-plugin-react-refresh"
import globals from "globals"
import { defineConfig } from "eslint/config"
import base from "./base.js"
import memli from "./plugin.js"

/**
 * Shared React + Vite ESLint flat config (extends base).
 * React state guardrails (see docs/state-management.md):
 */
export default defineConfig([
  ...base,
  {
    files: ["**/*.{ts,tsx}"],
    extends: [reactHooks.configs.flat.recommended, reactRefresh.configs.vite],
    plugins: { memli },
    languageOptions: {
      globals: globals.browser,
    },
    rules: {
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "error",
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      "memli/no-use-state-sprawl": ["error", { max: 1 }],
    },
  },
])

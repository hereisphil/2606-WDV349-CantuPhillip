import jsxA11y from "eslint-plugin-jsx-a11y-x"
import reactHooks from "eslint-plugin-react-hooks"
import reactRefresh from "eslint-plugin-react-refresh"
import globals from "globals"
import { defineConfig } from "eslint/config"
import base from "./base.js"
import memli from "./plugin.js"

/** State owner rules: `docs/state-management.md`. */
export default defineConfig([
  ...base,
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
      jsxA11y.configs.recommended,
    ],
    plugins: { memli },
    languageOptions: {
      globals: globals.browser,
    },
    settings: {
      "jsx-a11y-x": {
        components: {
          AvatarImage: "img",
          Button: "button",
          Input: "input",
          Label: "label",
        },
      },
    },
    rules: {
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "error",
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      "memli/button-link": "error",
      "memli/no-use-state-sprawl": ["error", { max: 1 }],
    },
  },
])

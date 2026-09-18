import js from "@eslint/js"
import eslintConfigPrettier from "eslint-config-prettier"
import tseslint from "typescript-eslint"
import { defineConfig, globalIgnores } from "eslint/config"

/**
 * Shared non-React TypeScript ESLint flat config.
 * Consumers should set `languageOptions.parserOptions.tsconfigRootDir`
 * in their local eslint.config.js when they need project-aware parsing.
 */
export default defineConfig([
  globalIgnores(["dist", ".turbo", "node_modules", "coverage"]),
  {
    files: ["**/*.{ts,tsx,js,jsx}"],
    extends: [js.configs.recommended, tseslint.configs.recommended],
    rules: {
      // Prefer the TS-aware unused-vars rule (see strict-eslint-examples.md)
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/explicit-function-return-type": [
        "error",
        {
          allowExpressions: true,
          allowTypedFunctionExpressions: true,
        },
      ],
      "@typescript-eslint/consistent-type-imports": [
        "error",
        {
          prefer: "type-imports",
        },
      ],
      // TanStack Router / declaration merging sometimes uses empty interfaces
      "@typescript-eslint/no-empty-object-type": "off",
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "no-debugger": "error",
      eqeqeq: ["error", "always"],
    },
  },
  // Must be last so Prettier wins formatting conflicts
  eslintConfigPrettier,
])

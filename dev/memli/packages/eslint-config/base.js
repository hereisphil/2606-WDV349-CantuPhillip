import js from "@eslint/js"
import eslintConfigPrettier from "eslint-config-prettier"
import tseslint from "typescript-eslint"
import { defineConfig, globalIgnores } from "eslint/config"

/**
 * Consumers set `languageOptions.parserOptions.tsconfigRootDir` in their
 * local eslint.config.js when they need project-aware parsing.
 */
export default defineConfig([
  globalIgnores(["dist", ".turbo", "node_modules", "coverage"]),
  {
    files: ["**/*.{ts,tsx,js,jsx}"],
    extends: [js.configs.recommended, tseslint.configs.recommended],
    rules: {
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
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "no-debugger": "error",
      eqeqeq: ["error", "always"],
      // The shadcn registry imports `cn` from an unrelated npm package (.cursor/rules/shadcn-components.mdc).
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "cn",
              message:
                'The npm package `cn` is not our class-name helper; the shadcn registry adds it by mistake. Use `import { cn } from "@workspace/ui/lib/utils"`.',
            },
          ],
        },
      ],
    },
  },
  // Must be last so Prettier wins formatting conflicts
  eslintConfigPrettier,
])

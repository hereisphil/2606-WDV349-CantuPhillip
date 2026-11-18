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
  // Scheduling goes through @workspace/core's outcomes (#132). The typescript-eslint copy of the
  // rule is used so it doesn't replace the base config's `no-restricted-imports` (the `cn` guard).
  {
    files: ["src/**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["ts-fsrs", "ts-fsrs/*"],
              message:
                "Schedule through @workspace/core (srs/outcome, srs/progress), never ts-fsrs directly.",
            },
          ],
        },
      ],
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
    files: ["src/routes/_app/**/*.tsx", "src/routes/_session/**/*.tsx"],
    rules: {
      "memli/no-literal-ui-strings": "error",
    },
  },
  // Numbers and dates are formatted for the UI locale with `Intl` (docs/i18n.md).
  {
    files: ["src/**/*.{ts,tsx}"],
    ignores: ["src/lib/formatters.ts"],
    rules: {
      "no-restricted-properties": [
        "error",
        ...[
          "toLocaleString",
          "toLocaleDateString",
          "toLocaleTimeString",
          "toDateString",
          "toTimeString",
        ].map((property) => ({
          property,
          message:
            "Format dates and numbers with `useFormatters()` so they follow the UI locale. If none fits, add one to src/lib/formatters.ts.",
        })),
        {
          property: "toFixed",
          message:
            "`toFixed` always uses a period as the decimal separator. Use `number()` or `percent()` from `useFormatters()`.",
        },
      ],
    },
  },
  // Design floors for learner-facing screens (.cursor/rules/ui-design.mdc).
  {
    files: [
      "src/routes/_app/**/*.{ts,tsx}",
      "src/routes/_session/**/*.{ts,tsx}",
      "src/components/**/*.{ts,tsx}",
    ],
    // Marketing chrome keeps its own look until it gets a design pass.
    ignores: ["src/components/site-*.tsx"],
    rules: {
      "memli/no-restricted-classes": "error",
      "memli/touch-button-size": "error",
    },
  },
  // DEV-only tools never reach learners, so they stay small and out of the way.
  {
    files: [
      "src/components/dev-previews-menu.tsx",
      "src/routes/_app/-components/PreviewSwitcher.tsx",
      "src/routes/_session/-components/StudyPreviewSwitcher.tsx",
    ],
    rules: {
      "memli/no-restricted-classes": "off",
      "memli/touch-button-size": "off",
    },
  },
  // No em dashes in copy: they read as a pause only in English, and screen readers skip them.
  {
    files: ["src/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-syntax": [
        "error",
        ...[
          "Literal[value=/\u2014/]",
          "TemplateElement[value.raw=/\u2014/]",
          "JSXText[value=/\u2014/]",
        ].map((selector) => ({
          selector,
          message: "No em dashes in copy. Use a period, a comma or a colon.",
        })),
      ],
    },
  },
  // React state guardrail exemptions (docs/state-management.md).
  {
    files: ["src/routes/_marketing/**/*.{ts,tsx}"],
    rules: {
      "memli/no-use-state-sprawl": "off",
    },
  },
])

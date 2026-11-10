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

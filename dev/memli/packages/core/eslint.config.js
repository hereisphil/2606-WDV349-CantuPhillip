import { defineConfig } from "eslint/config"
import baseConfig from "@workspace/eslint-config/base"

export default defineConfig([
  ...baseConfig,
  {
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  // Core is shared by web, API, and mobile, so it stays free of any UI runtime
  // (docs/architecture.md).
  {
    files: ["src/**/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: [
                "react",
                "react/*",
                "react-dom",
                "react-dom/*",
                "react-native",
                "react-native/*",
                "@workspace/ui",
                "@workspace/ui/*",
              ],
              message:
                "@workspace/core is pure domain logic. Keep React, DOM, and React Native code in the apps.",
            },
          ],
        },
      ],
    },
  },
])

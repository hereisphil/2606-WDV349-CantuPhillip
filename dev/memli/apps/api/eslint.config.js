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
  // The API runs on Cloudflare Workers and serves web and mobile alike, so it
  // never pulls in a UI runtime (docs/architecture.md).
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
                "apps/api is the backend. Share logic through @workspace/core and contracts through @workspace/schemas.",
            },
          ],
        },
      ],
    },
  },
])

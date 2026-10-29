import { defineConfig } from "eslint/config"
import reactConfig from "@workspace/eslint-config/react"

export default defineConfig([
  ...reactConfig,
  {
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: import.meta.dirname,
      },
    },
    // shadcn/Base UI primitives manage their own internal open/focus state;
    // the useReducer-first guardrail targets product flows in apps/web.
    rules: {
      "memli/no-use-state-sprawl": "off",
    },
  },
])

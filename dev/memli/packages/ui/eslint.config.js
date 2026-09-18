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
  },
])

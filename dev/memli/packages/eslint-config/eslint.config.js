import { defineConfig } from "eslint/config"
import globals from "globals"
import baseConfig from "./base.js"

export default defineConfig([
  ...baseConfig,
  // Plain JS rule modules, typed by JSDoc where it helps.
  {
    languageOptions: { globals: globals.node },
    rules: { "@typescript-eslint/explicit-function-return-type": "off" },
  },
])

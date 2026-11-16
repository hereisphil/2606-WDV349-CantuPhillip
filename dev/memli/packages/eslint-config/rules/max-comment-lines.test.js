import { describe, it } from "node:test"
import { RuleTester } from "eslint"
import rule from "./max-comment-lines.js"

RuleTester.describe = describe
RuleTester.it = it
RuleTester.itOnly = it.only

const tester = new RuleTester({
  languageOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    parserOptions: { ecmaFeatures: { jsx: true } },
  },
})

const tooLong = (lines) => ({ messageId: "tooLong", data: { lines, max: 2 } })

tester.run("max-comment-lines", rule, {
  valid: [
    { name: "one line comment", code: "// Short.\nconst a = 1" },
    { name: "two line comments", code: "// One.\n// Two.\nconst a = 1" },
    {
      name: "two-line JSDoc, ignoring the bare open and close lines",
      code: "/**\n * One.\n * Two.\n */\nfunction a() {}",
    },
    { name: "one-line JSDoc", code: "/** Short. */\nconst a = 1" },
    {
      name: "a blank line splits two comments",
      code: "// One.\n// Two.\n\n// Three.\nconst a = 1",
    },
    {
      name: "code between comments splits them",
      code: "// One.\n// Two.\nconst a = 1 // Three.\n// Four.\nconst b = 2",
    },
    {
      name: "trailing comments on separate lines of code",
      code: "const a = 1 // One.\nconst b = 2 // Two.\nconst c = 3 // Three.",
    },
    {
      name: "directives don't count and split comments",
      code: "// One.\n// Two.\n// eslint-disable-next-line no-console -- reason\nconsole.log(1)",
    },
    {
      name: "@ts-expect-error doesn't count",
      code: "// One.\n// @ts-expect-error -- reason\nconst a = 1",
    },
    {
      name: "JSX comments split by braces",
      code: "const a = (\n  <div>\n    {/* One. */}\n    {/* Two. */}\n    {/* Three. */}\n  </div>\n)",
    },
    {
      name: "max option raises the limit",
      code: "// One.\n// Two.\n// Three.\nconst a = 1",
      options: [{ max: 3 }],
    },
  ],
  invalid: [
    {
      name: "three line comments in a row",
      code: "// One.\n// Two.\n// Three.\nconst a = 1",
      errors: [tooLong(3)],
    },
    {
      name: "three-line JSDoc",
      code: "/**\n * One.\n * Two.\n * Three.\n */\nfunction a() {}",
      errors: [tooLong(3)],
    },
    {
      name: "a blank line inside a block counts",
      code: "/**\n * One.\n *\n * Two.\n */\nfunction a() {}",
      errors: [tooLong(3)],
    },
    {
      name: "a block followed by line comments",
      code: "/* One.\n   Two. */\n// Three.\nconst a = 1",
      errors: [tooLong(3)],
    },
    {
      name: "a multi-line JSX comment",
      code: "const a = (\n  <div>\n    {/* One.\n        Two.\n        Three. */}\n  </div>\n)",
      errors: [tooLong(3)],
    },
    {
      name: "comments at the end of a file",
      code: "const a = 1\n// One.\n// Two.\n// Three.",
      errors: [tooLong(3)],
    },
  ],
})

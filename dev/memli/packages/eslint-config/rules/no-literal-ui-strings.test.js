import { describe, it } from "node:test"
import { RuleTester } from "eslint"
import rule from "./no-literal-ui-strings.js"

RuleTester.describe = describe
RuleTester.it = it
RuleTester.itOnly = it.only

const tester = new RuleTester({
  languageOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    parserOptions: {
      ecmaFeatures: {
        jsx: true,
      },
    },
  },
})

tester.run("no-literal-ui-strings", rule, {
  valid: [
    {
      name: "text from a messages object",
      code: `
        const messages = { heading: "Other decks" }
        function Decks() {
          return <h2>{messages.heading}</h2>
        }
      `,
    },
    {
      name: "a formatter call as text and as a label",
      code: `
        function Row({ count, deck }) {
          return (
            <Button aria-label={plural(count, messages.reviewLabel, { deck })}>
              {format(messages.review, { count })}
            </Button>
          )
        }
      `,
    },
    {
      name: "whitespace, punctuation, and numbers",
      code: `
        function Ring({ done }) {
          return <p>{done}{" "}<span>/</span> 50 · — %</p>
        }
      `,
    },
    {
      name: "non-text attributes keep string literals",
      code: `
        function Chip() {
          return (
            <a
              className="rounded-full px-3"
              href="/dashboard"
              aria-current="page"
              aria-labelledby="studying-label"
              lang="es"
              role="group"
            />
          )
        }
      `,
    },
    {
      name: "a template literal without letters",
      code: `
        function Bar({ ratio }) {
          return <span>{\`\${ratio * 100}%\`}</span>
        }
      `,
    },
    {
      name: "strings outside JSX",
      code: `
        const greeting = "Good morning, {name}"
        function label(name) {
          return \`Hello \${name}\`
        }
      `,
    },
    {
      name: "allowed brand text",
      code: `
        function Brand() {
          return <span title="Memli">Memli</span>
        }
      `,
      options: [{ allow: ["Memli"] }],
    },
  ],
  invalid: [
    {
      name: "literal JSX text",
      code: `
        function Menu() {
          return <MenuItem>Sign Out</MenuItem>
        }
      `,
      errors: [{ messageId: "literal", data: { text: "Sign Out" } }],
    },
    {
      name: "a string literal child",
      code: `
        function Empty() {
          return <p>{"Nothing here yet"}</p>
        }
      `,
      errors: [{ messageId: "literal" }],
    },
    {
      name: "a literal aria-label",
      code: `
        function Close() {
          return <button aria-label="Close dialog" />
        }
      `,
      errors: [{ messageId: "literal", data: { text: "Close dialog" } }],
    },
    {
      name: "a literal title and alt in expression containers",
      code: `
        function Avatar() {
          return <img title={"Profile"} alt={\`Your avatar\`} />
        }
      `,
      errors: [{ messageId: "literal" }, { messageId: "literal" }],
    },
    {
      name: "a template-literal label",
      code: `
        function Account({ username }) {
          return <button aria-label={\`Account menu, @\${username}\`} />
        }
      `,
      errors: [{ messageId: "built" }],
    },
    {
      name: "a concatenated label",
      code: `
        function Account({ username }) {
          return <button aria-label={"Account menu, " + username} />
        }
      `,
      errors: [{ messageId: "built" }],
    },
    {
      name: "a template-literal child",
      code: `
        function Session({ count }) {
          return <p>{\`\${count} extra new cards\`}</p>
        }
      `,
      errors: [{ messageId: "built" }],
    },
    {
      name: "both branches of a conditional",
      code: `
        function Mode({ learn }) {
          return <p>{learn ? "learn-new-words" : "review"}</p>
        }
      `,
      errors: [{ messageId: "literal" }, { messageId: "literal" }],
    },
    {
      name: "the right side of a logical expression",
      code: `
        function Hint({ show }) {
          return <p>{show && "Try again"}</p>
        }
      `,
      errors: [{ messageId: "literal" }],
    },
    {
      name: "non-Latin text",
      code: `
        function Greeting() {
          return <p>こんにちは</p>
        }
      `,
      errors: [{ messageId: "literal" }],
    },
  ],
})

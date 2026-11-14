/**
 * Design floors for learner-facing screens, checked on Tailwind class names
 * in any string or template literal. See `.cursor/rules/ui-design.mdc`.
 */

const PALETTE =
  "red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|slate|gray|zinc|neutral|stone|white|black"
const COLOR_UTILITY =
  "bg|text|border(?:-[xytbselr])?|ring(?:-offset)?|outline|fill|stroke|from|via|to|decoration|shadow|divide|accent|caret|placeholder"

const PALETTE_COLOR = new RegExp(
  `^(?:${COLOR_UTILITY})-(?:${PALETTE})(?:-\\d{2,3})?(?:/.+)?$`
)
const ARBITRARY_COLOR = new RegExp(
  `^(?:${COLOR_UTILITY})-\\[(?:#[0-9a-fA-F]{3,8}|(?:oklch|oklab|rgb|rgba|hsl|hsla|lab|lch|color)\\(.*\\))\\]$`
)
const ARBITRARY_TEXT_SIZE = /^text-\[(\d*\.?\d+)(px|rem)\]$/
const ORDER = /^order-(?:first|last|\d+|\[.+\]|\(.+\))$/
// A Tailwind length, so prose such as "left-handed" is not mistaken for a class.
const LENGTH = "(?:\\d[\\d./]*|px|full|auto|\\[.+\\]|\\(.+\\))"

/** Physical class prefix -> logical one. `$1` is the rest of the class. */
const PHYSICAL = [
  [new RegExp(`^ml-(${LENGTH})$`), "ms-$1"],
  [new RegExp(`^mr-(${LENGTH})$`), "me-$1"],
  [new RegExp(`^pl-(${LENGTH})$`), "ps-$1"],
  [new RegExp(`^pr-(${LENGTH})$`), "pe-$1"],
  [new RegExp(`^scroll-ml-(${LENGTH})$`), "scroll-ms-$1"],
  [new RegExp(`^scroll-mr-(${LENGTH})$`), "scroll-me-$1"],
  [new RegExp(`^scroll-pl-(${LENGTH})$`), "scroll-ps-$1"],
  [new RegExp(`^scroll-pr-(${LENGTH})$`), "scroll-pe-$1"],
  [new RegExp(`^left-(${LENGTH})$`), "start-$1"],
  [new RegExp(`^right-(${LENGTH})$`), "end-$1"],
  [/^text-left$/, "text-start"],
  [/^text-right$/, "text-end"],
  [/^float-left$/, "float-start"],
  [/^float-right$/, "float-end"],
  [/^clear-left$/, "clear-start"],
  [/^clear-right$/, "clear-end"],
  [/^border-l(-.+)?$/, "border-s$1"],
  [/^border-r(-.+)?$/, "border-e$1"],
  [/^rounded-l(-.+)?$/, "rounded-s$1"],
  [/^rounded-r(-.+)?$/, "rounded-e$1"],
  [/^rounded-tl(-.+)?$/, "rounded-ss$1"],
  [/^rounded-tr(-.+)?$/, "rounded-se$1"],
  [/^rounded-bl(-.+)?$/, "rounded-es$1"],
  [/^rounded-br(-.+)?$/, "rounded-ee$1"],
]

// `left-1/2` with `-translate-x-1/2` centers the same way in both directions.
const DIRECTION_FREE = /^(?:left|right)-1\/2$/

/** Splits `sm:hover:-ml-2!` into its variants (`sm:hover:`), sign and utility (`ml-2`). */
function parseClass(token) {
  let depth = 0
  let cut = 0
  for (let index = 0; index < token.length; index += 1) {
    const char = token[index]
    if (char === "[" || char === "(") {
      depth += 1
    } else if (char === "]" || char === ")") {
      depth -= 1
    } else if (char === ":" && depth === 0) {
      cut = index + 1
    }
  }
  const variants = token.slice(0, cut)
  let utility = token.slice(cut)
  let prefix = ""
  let suffix = ""
  while (utility.startsWith("!") || utility.startsWith("-")) {
    prefix += utility[0]
    utility = utility.slice(1)
  }
  if (utility.endsWith("!")) {
    suffix = "!"
    utility = utility.slice(0, -1)
  }
  return { variants, prefix, utility, suffix }
}

function isSmallText(utility) {
  if (utility === "text-xs") {
    return true
  }
  const match = ARBITRARY_TEXT_SIZE.exec(utility)
  if (match === null) {
    return false
  }
  const size = Number(match[1])
  return match[2] === "px" ? size < 14 : size < 0.875
}

function logicalClass(utility) {
  if (DIRECTION_FREE.test(utility)) {
    return null
  }
  for (const [pattern, replacement] of PHYSICAL) {
    if (pattern.test(utility)) {
      return utility.replace(pattern, replacement)
    }
  }
  return null
}

/** @type {import("eslint").Rule.RuleModule} */
const rule = {
  meta: {
    type: "problem",
    fixable: "code",
    docs: {
      description:
        "Design floors on Tailwind classes: no text under 14 px, logical direction classes, no CSS order, role color tokens only.",
    },
    schema: [
      {
        type: "object",
        properties: {
          allow: { type: "array", items: { type: "string" } },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      smallText:
        "`{{name}}` is under 14 px. Use `text-sm` (14 px, short labels only) or `text-base` (16 px, every sentence).",
      physical:
        "`{{name}}` is a physical direction, so it does not flip in right-to-left languages. Use `{{fix}}`.",
      order:
        "`{{name}}` makes the tab order differ from what is on screen (WCAG 2.4.3). Write the elements in reading order and place them with grid rows and columns.",
      palette:
        "`{{name}}` is a raw color. Use a role token (`bg-card`, `text-muted-foreground`, `bg-warning-container`) so both themes and the contrast test cover it. For a new color, add a token to packages/ui/src/styles/globals.css and a pairing to tokens.test.ts.",
    },
  },

  create(context) {
    const allow = new Set(context.options[0]?.allow ?? [])
    const sourceCode = context.sourceCode

    function check(node, text) {
      // Where `text` starts in the file, or -1 when escapes make offsets unreliable.
      const offset = sourceCode.getText(node).indexOf(text)

      for (const match of text.matchAll(/\S+/g)) {
        const name = match[0]
        if (allow.has(name)) {
          continue
        }
        const { variants, prefix, utility, suffix } = parseClass(name)

        if (isSmallText(utility)) {
          context.report({ node, messageId: "smallText", data: { name } })
          continue
        }
        if (ORDER.test(utility)) {
          context.report({ node, messageId: "order", data: { name } })
          continue
        }
        if (PALETTE_COLOR.test(utility) || ARBITRARY_COLOR.test(utility)) {
          context.report({ node, messageId: "palette", data: { name } })
          continue
        }

        const logical = logicalClass(utility)
        if (logical === null) {
          continue
        }
        const fix = `${variants}${prefix}${logical}${suffix}`
        context.report({
          node,
          messageId: "physical",
          data: { name, fix },
          fix:
            offset === -1
              ? null
              : (fixer) => {
                  const start = node.range[0] + offset + match.index
                  return fixer.replaceTextRange(
                    [start, start + name.length],
                    fix
                  )
                },
        })
      }
    }

    return {
      Literal(node) {
        if (typeof node.value === "string") {
          check(node, node.value)
        }
      },
      TemplateElement(node) {
        check(node, node.value.raw)
      },
    }
  },
}

export default rule

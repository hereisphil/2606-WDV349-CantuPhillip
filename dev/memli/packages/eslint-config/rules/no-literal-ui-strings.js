/** UI copy comes from a `messages` object or a formatter, never inline. See `dev/memli/docs/i18n.md`. */

const TEXT_ATTRIBUTES = new Set([
  "alt",
  "aria-description",
  "aria-label",
  "aria-placeholder",
  "aria-roledescription",
  "aria-valuetext",
  "placeholder",
  "title",
])

const LETTER = /\p{L}/u

function hasLetter(text) {
  return LETTER.test(text)
}

function attributeName(attribute) {
  if (attribute.name.type === "JSXIdentifier") {
    return attribute.name.name
  }
  return null
}

/** @type {import("eslint").Rule.RuleModule} */
const rule = {
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Disallow hard-coded UI text and string-built labels in JSX so copy stays translatable.",
    },
    schema: [
      {
        type: "object",
        properties: {
          allow: {
            type: "array",
            items: { type: "string" },
            uniqueItems: true,
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      literal:
        'Hard-coded UI text "{{text}}". Move it to the component\'s `messages` object so it can be translated.',
      built:
        "UI text is built with a template literal or `+`. Use a whole-sentence `messages` template with `format()` or `plural()` so translators can reorder it.",
    },
  },

  create(context) {
    const allowed = new Set(context.options[0]?.allow ?? [])

    function reportLiteral(node, raw) {
      const text = raw.trim().replace(/\s+/g, " ")
      if (!hasLetter(text) || allowed.has(text)) {
        return
      }
      context.report({ node, messageId: "literal", data: { text } })
    }

    /** Reports string literals, template literals, and `+` concatenation in an expression. */
    function checkExpression(node) {
      if (node === null || node === undefined) {
        return
      }
      switch (node.type) {
        case "Literal":
          if (typeof node.value === "string") {
            reportLiteral(node, node.value)
          }
          return
        case "TemplateLiteral":
          if (node.expressions.length === 0) {
            reportLiteral(node, node.quasis[0]?.value.cooked ?? "")
          } else if (
            node.quasis.some((quasi) => hasLetter(quasi.value.cooked ?? ""))
          ) {
            context.report({ node, messageId: "built" })
          }
          return
        case "BinaryExpression":
          if (
            node.operator === "+" &&
            [node.left, node.right].some(
              (side) =>
                (side.type === "Literal" &&
                  typeof side.value === "string" &&
                  hasLetter(side.value)) ||
                side.type === "TemplateLiteral"
            )
          ) {
            context.report({ node, messageId: "built" })
          }
          return
        case "ConditionalExpression":
          checkExpression(node.consequent)
          checkExpression(node.alternate)
          return
        case "LogicalExpression":
          checkExpression(node.right)
          return
        default:
          return
      }
    }

    return {
      JSXText(node) {
        reportLiteral(node, node.value)
      },
      JSXExpressionContainer(node) {
        if (
          node.parent.type === "JSXElement" ||
          node.parent.type === "JSXFragment"
        ) {
          checkExpression(node.expression)
        }
      },
      JSXAttribute(node) {
        const name = attributeName(node)
        if (
          name === null ||
          !TEXT_ATTRIBUTES.has(name) ||
          node.value === null
        ) {
          return
        }
        if (node.value.type === "Literal") {
          reportLiteral(node.value, String(node.value.value))
        } else if (node.value.type === "JSXExpressionContainer") {
          checkExpression(node.value.expression)
        }
      },
    }
  },
}

export default rule

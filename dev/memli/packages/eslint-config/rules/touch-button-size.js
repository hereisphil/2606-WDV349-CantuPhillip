/**
 * Every button a learner taps is at least 44 px tall. `Button` and
 * `buttonVariants` default to 32 px, so learner-facing screens name a touch
 * size. See `.cursor/rules/ui-design.mdc`.
 */

const DEFAULT_SIZES = ["touch", "touch-lg", "touch-xl", "icon-touch"]

function findProperty(objectExpression, name) {
  return objectExpression.properties.find(
    (property) =>
      property.type === "Property" &&
      !property.computed &&
      (property.key.name === name || property.key.value === name)
  )
}

/** @type {import("eslint").Rule.RuleModule} */
const rule = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Button and buttonVariants must name a touch size (44 px or taller).",
    },
    schema: [
      {
        type: "object",
        properties: {
          sizes: { type: "array", items: { type: "string" } },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      missing:
        "This button gets the default size, which is 32 px tall. Set `size` to one of: {{sizes}}.",
      small:
        '`size="{{size}}"` is under 44 px tall. Use one of: {{sizes}}. To change how a touch size looks, add `className`.',
    },
  },

  create(context) {
    const allowed = context.options[0]?.sizes ?? DEFAULT_SIZES
    const sizes = allowed.join(", ")

    function checkValue(node, value) {
      if (typeof value === "string" && !allowed.includes(value)) {
        context.report({
          node,
          messageId: "small",
          data: { size: value, sizes },
        })
      }
    }

    return {
      JSXOpeningElement(node) {
        if (node.name.type !== "JSXIdentifier" || node.name.name !== "Button") {
          return
        }
        // `{...props}` may carry a size; only a spread-free Button is judged for a missing one.
        const hasSpread = node.attributes.some(
          (attribute) => attribute.type === "JSXSpreadAttribute"
        )
        const size = node.attributes.find(
          (attribute) =>
            attribute.type === "JSXAttribute" && attribute.name.name === "size"
        )
        if (size === undefined) {
          if (!hasSpread) {
            context.report({ node, messageId: "missing", data: { sizes } })
          }
          return
        }
        if (size.value?.type === "Literal") {
          checkValue(size, size.value.value)
        } else if (
          size.value?.type === "JSXExpressionContainer" &&
          size.value.expression.type === "Literal"
        ) {
          checkValue(size, size.value.expression.value)
        }
      },

      CallExpression(node) {
        if (
          node.callee.type !== "Identifier" ||
          node.callee.name !== "buttonVariants"
        ) {
          return
        }
        const [options] = node.arguments
        if (options === undefined) {
          context.report({ node, messageId: "missing", data: { sizes } })
          return
        }
        if (options.type !== "ObjectExpression") {
          return
        }
        const size = findProperty(options, "size")
        if (size === undefined) {
          const hasSpread = options.properties.some(
            (property) => property.type === "SpreadElement"
          )
          if (!hasSpread) {
            context.report({ node, messageId: "missing", data: { sizes } })
          }
          return
        }
        if (size.value.type === "Literal") {
          checkValue(size, size.value.value)
        }
      },
    }
  },
}

export default rule

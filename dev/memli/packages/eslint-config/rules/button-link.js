/** Base UI Button is a `<button>`. A link needs `nativeButton={false}`. `asChild` is Radix. See `.cursor/rules/memli-stack.mdc`. */

function isButtonElement(node) {
  return node.name.type === "JSXIdentifier" && node.name.name === "Button"
}

function attributeName(attribute) {
  if (attribute.type !== "JSXAttribute") {
    return null
  }

  if (attribute.name.type !== "JSXIdentifier") {
    return null
  }

  return attribute.name.name
}

function isFalseLiteral(value) {
  return (
    value?.type === "JSXExpressionContainer" &&
    value.expression.type === "Literal" &&
    value.expression.value === false
  )
}

function elementName(node) {
  if (node?.type !== "JSXElement") {
    return null
  }

  const name = node.openingElement.name
  if (name.type !== "JSXIdentifier") {
    return null
  }

  return name.name
}

function isLinkElement(node) {
  const name = elementName(node)
  return name === "Link" || name === "a"
}

function renderIsLink(expression) {
  if (isLinkElement(expression)) {
    return true
  }

  if (
    expression?.type !== "ArrowFunctionExpression" &&
    expression?.type !== "FunctionExpression"
  ) {
    return false
  }

  if (isLinkElement(expression.body)) {
    return true
  }

  if (expression.body.type !== "BlockStatement") {
    return false
  }

  return expression.body.body.some(
    (statement) =>
      statement.type === "ReturnStatement" && isLinkElement(statement.argument)
  )
}

/** @type {import("eslint").Rule.RuleModule} */
const rule = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Require nativeButton={false} when Button renders a link, and reject the Radix asChild prop.",
    },
    schema: [],
    messages: {
      asChild:
        "`asChild` is a Radix prop. Compose Base UI Button with `render={<Link />} nativeButton={false}`.",
      nativeButton:
        "Button is rendering a link without `nativeButton={false}`, so it still emits a `<button>`. Set `nativeButton={false}`.",
    },
  },

  create(context) {
    return {
      JSXOpeningElement(node) {
        if (!isButtonElement(node)) {
          return
        }

        let renderAttribute = null
        let nativeButtonIsFalse = false

        for (const attribute of node.attributes) {
          const name = attributeName(attribute)
          if (name === "asChild") {
            context.report({ node: attribute, messageId: "asChild" })
          }

          if (name === "render") {
            renderAttribute = attribute
          }

          if (name === "nativeButton" && isFalseLiteral(attribute.value)) {
            nativeButtonIsFalse = true
          }
        }

        if (!renderAttribute || nativeButtonIsFalse) {
          return
        }

        const expression =
          renderAttribute.value?.type === "JSXExpressionContainer"
            ? renderAttribute.value.expression
            : null

        if (renderIsLink(expression)) {
          context.report({ node: renderAttribute, messageId: "nativeButton" })
        }
      },
    }
  },
}

export default rule

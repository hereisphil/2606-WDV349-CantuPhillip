/**
 * Navigation is a link, not a button. A Base UI Button that renders a Link
 * gets `role="button"` (or emits a `<button>`), so screen readers announce a
 * link as a button. Style the link instead: `<Link className={cn(buttonVariants(...))}>`.
 * `asChild` is Radix, not Base UI. See `.cursor/rules/memli-stack.mdc`.
 */

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
        "Navigation must be a link styled with buttonVariants, not a Button that renders a link. Rejects the Radix asChild prop.",
    },
    schema: [],
    messages: {
      asChild:
        "`asChild` is a Radix prop. For navigation, use a link styled like a button: `<Link className={cn(buttonVariants({ variant, size }))}>`.",
      linkButton:
        "A Button that renders a link is announced as a button. Use the link itself, styled like a button: `<Link className={cn(buttonVariants({ variant, size }))}>`.",
    },
  },

  create(context) {
    return {
      JSXOpeningElement(node) {
        if (!isButtonElement(node)) {
          return
        }

        let renderAttribute = null

        for (const attribute of node.attributes) {
          const name = attributeName(attribute)
          if (name === "asChild") {
            context.report({ node: attribute, messageId: "asChild" })
          }

          if (name === "render") {
            renderAttribute = attribute
          }
        }

        if (!renderAttribute) {
          return
        }

        const expression =
          renderAttribute.value?.type === "JSXExpressionContainer"
            ? renderAttribute.value.expression
            : null

        if (renderIsLink(expression)) {
          context.report({ node: renderAttribute, messageId: "linkButton" })
        }
      },
    }
  },
}

export default rule

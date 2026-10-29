/**
 *
 * Pushes component state toward `useReducer` + discriminated unions by making
 * "boolean soup" impossible to write without a lint error.
 *
 * `useReducer` is the default for anything with a lifecycle. `useState` is
 * reserved for a single, uncoupled primitive (`isOpen`, a controlled input).
 *
 * Rationale and the state-owner routing table: `docs/state-management.md`
 * and `.cursor/rules/react-state.mdc`.
 */

const FUNCTION_TYPES = new Set([
  "FunctionDeclaration",
  "FunctionExpression",
  "ArrowFunctionExpression",
])

function isUseStateCallee(callee) {
  if (callee.type === "Identifier") {
    return callee.name === "useState"
  }

  if (
    callee.type === "MemberExpression" &&
    !callee.computed &&
    callee.property.type === "Identifier"
  ) {
    return callee.property.name === "useState"
  }

  return false
}

function enclosingFunction(node) {
  let current = node.parent
  while (current) {
    if (FUNCTION_TYPES.has(current.type)) {
      return current
    }
    current = current.parent
  }
  return null
}

function isMultiKeyObjectLiteral(node) {
  return node?.type === "ObjectExpression" && node.properties.length >= 2
}

/** @type {import("eslint").Rule.RuleModule} */
const rule = {
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Limit useState to a single uncoupled primitive per component; coupled or lifecycle state must use useReducer with a discriminated union.",
    },
    schema: [
      {
        type: "object",
        properties: {
          max: { type: "integer", minimum: 1 },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      tooMany:
        "{{count}} useState calls in one component/hook (max {{max}}). Coupled state belongs in a single useReducer with a discriminated-union state and named events. See docs/state-management.md.",
      objectState:
        "useState initialised with a multi-key object. Model this as a useReducer state with a `status` discriminant instead of an object you spread into. See docs/state-management.md.",
    },
  },

  create(context) {
    const max = context.options[0]?.max ?? 1
    // enclosing function node -> useState CallExpression nodes inside it
    const callsByFunction = new Map()

    return {
      CallExpression(node) {
        if (!isUseStateCallee(node.callee)) {
          return
        }

        const fn = enclosingFunction(node)
        if (fn) {
          const list = callsByFunction.get(fn) ?? []
          list.push(node)
          callsByFunction.set(fn, list)
        }

        if (isMultiKeyObjectLiteral(node.arguments[0])) {
          context.report({ node, messageId: "objectState" })
        }
      },

      "Program:exit"() {
        for (const calls of callsByFunction.values()) {
          if (calls.length <= max) {
            continue
          }

          for (const call of calls.slice(max)) {
            context.report({
              node: call,
              messageId: "tooMany",
              data: { count: String(calls.length), max: String(max) },
            })
          }
        }
      },
    }
  },
}

export default rule

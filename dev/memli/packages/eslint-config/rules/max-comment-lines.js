/**
 * Comments stay short (#146). For the long version, link a doc or a URL.
 * Back-to-back `//` lines count as one comment; directives don't count.
 */

const DIRECTIVE =
  /^\s*(?:eslint(?:-disable|-enable|-env)?\b|globals?\b|exported\b|@ts-|prettier-ignore|#__PURE__|@__PURE__|\/\s*<reference)/

function isDirective(comment) {
  return comment.type === "Shebang" || DIRECTIVE.test(comment.value)
}

// A block's bare `/**` and ` */` lines are not content.
function contentLines(comment) {
  if (comment.type === "Line") {
    return 1
  }

  const lines = comment.value
    .split(/\r?\n/)
    .map((line) => line.replace(/^\s*\*?/, "").trim())
  const first = lines.findIndex((line) => line !== "")
  if (first === -1) {
    return 1
  }

  const last = lines.findLastIndex((line) => line !== "")
  return last - first + 1
}

/** @type {import("eslint").Rule.RuleModule} */
const rule = {
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Keep each comment to a few lines. Back-to-back line comments count as one comment.",
    },
    schema: [
      {
        type: "object",
        properties: { max: { type: "integer", minimum: 1 } },
        additionalProperties: false,
      },
    ],
    messages: {
      tooLong:
        "This comment is {{lines}} lines. Keep comments to {{max}}, and link a doc or URL for the long version.",
    },
  },

  create(context) {
    const max = context.options[0]?.max ?? 2
    const sourceCode = context.sourceCode

    // Next line, with no code in between.
    function continuesGroup(previous, comment) {
      if (!previous || comment.loc.start.line !== previous.loc.end.line + 1) {
        return false
      }

      const code = sourceCode.getTokenAfter(previous)
      return !code || code.range[0] >= comment.range[1]
    }

    function report(group) {
      const lines = group.reduce(
        (sum, comment) => sum + contentLines(comment),
        0
      )
      if (lines <= max) {
        return
      }

      context.report({
        loc: { start: group[0].loc.start, end: group.at(-1).loc.end },
        messageId: "tooLong",
        data: { lines, max },
      })
    }

    return {
      Program() {
        let group = []

        for (const comment of sourceCode.getAllComments()) {
          if (isDirective(comment)) {
            report(group)
            group = []
            continue
          }

          if (continuesGroup(group.at(-1), comment)) {
            group.push(comment)
            continue
          }

          report(group)
          group = [comment]
        }

        report(group)
      },
    }
  },
}

export default rule

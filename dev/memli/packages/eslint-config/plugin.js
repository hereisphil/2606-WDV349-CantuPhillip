import buttonLink from "./rules/button-link.js"
import maxCommentLines from "./rules/max-comment-lines.js"
import noLiteralUiStrings from "./rules/no-literal-ui-strings.js"
import noRestrictedClasses from "./rules/no-restricted-classes.js"
import noUseStateSprawl from "./rules/no-use-state-sprawl.js"
import touchButtonSize from "./rules/touch-button-size.js"

const plugin = {
  meta: {
    name: "eslint-plugin-memli",
    version: "0.0.0",
  },
  rules: {
    "button-link": buttonLink,
    "max-comment-lines": maxCommentLines,
    "no-literal-ui-strings": noLiteralUiStrings,
    "no-restricted-classes": noRestrictedClasses,
    "no-use-state-sprawl": noUseStateSprawl,
    "touch-button-size": touchButtonSize,
  },
}

export default plugin

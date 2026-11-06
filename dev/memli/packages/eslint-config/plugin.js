import buttonLink from "./rules/button-link.js"
import noUseStateSprawl from "./rules/no-use-state-sprawl.js"

const plugin = {
  meta: {
    name: "eslint-plugin-memli",
    version: "0.0.0",
  },
  rules: {
    "button-link": buttonLink,
    "no-use-state-sprawl": noUseStateSprawl,
  },
}

export default plugin

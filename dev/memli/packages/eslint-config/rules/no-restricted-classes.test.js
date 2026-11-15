import { describe, it } from "node:test"
import { RuleTester } from "eslint"
import rule from "./no-restricted-classes.js"

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

tester.run("no-restricted-classes", rule, {
  valid: [
    {
      name: "role tokens, logical classes and 14 px text",
      code: `const a = <p className="ms-2 pe-4 text-start text-sm text-muted-foreground bg-card border-s-2 rounded-s-lg start-0" />`,
    },
    {
      name: "color keywords that are not a palette",
      code: `const a = <p className="bg-transparent text-current border-inherit" />`,
    },
    {
      name: "centering with left-1/2",
      code: `const a = <div className="absolute left-1/2 -translate-x-1/2" />`,
    },
    {
      name: "order-none, which only resets",
      code: `const a = <div className="md:order-none" />`,
    },
    {
      name: "prose that looks like a class prefix",
      code: `const messages = { hand: "Turn on left-handed mode", note: "The border-line cases" }`,
    },
    {
      name: "arbitrary text size at or above 14 px",
      code: `const a = <p className="text-[14px] text-[0.875rem] text-[1.5rem]" />`,
    },
    {
      name: "text-<length> and text-<token> are not confused",
      code: `const a = <p className="text-streak text-hero-foreground text-balance" />`,
    },
    {
      name: "an allowed class",
      code: `const a = <p className="text-xs" />`,
      options: [{ allow: ["text-xs"] }],
    },
  ],
  invalid: [
    {
      name: "12 px text",
      code: `const a = <p className="font-medium text-xs" />`,
      errors: [{ messageId: "smallText" }],
    },
    {
      name: "arbitrary small text behind a variant",
      code: `const a = <p className={cn("sm:text-[13px]", "text-[0.8rem]")} />`,
      errors: [{ messageId: "smallText" }, { messageId: "smallText" }],
    },
    {
      name: "physical margin behind a variant is fixed",
      code: `const a = <span className="text-sm sm:mr-2" />`,
      output: `const a = <span className="text-sm sm:me-2" />`,
      errors: [{ messageId: "physical" }],
    },
    {
      name: "negative, important and arbitrary values keep their shape",
      code: `const a = <span className="-ml-2 !pl-[3px] right-4 pr-1.5!" />`,
      output: `const a = <span className="-ms-2 !ps-[3px] end-4 pe-1.5!" />`,
      errors: [
        { messageId: "physical" },
        { messageId: "physical" },
        { messageId: "physical" },
        { messageId: "physical" },
      ],
    },
    {
      name: "text alignment, borders and corners",
      code: `const a = <span className="text-left border-l-4 rounded-tl-lg rounded-r" />`,
      output: `const a = <span className="text-start border-s-4 rounded-ss-lg rounded-e" />`,
      errors: [
        { messageId: "physical" },
        { messageId: "physical" },
        { messageId: "physical" },
        { messageId: "physical" },
      ],
    },
    {
      name: "a physical class inside a template literal",
      code: "const a = `flex ${gap} ml-2`",
      output: "const a = `flex ${gap} ms-2`",
      errors: [{ messageId: "physical" }],
    },
    {
      name: "an arbitrary variant in front",
      code: `const a = <span className="[&_svg]:mr-1 has-data-[icon=inline-end]:pr-2" />`,
      output: `const a = <span className="[&_svg]:me-1 has-data-[icon=inline-end]:pe-2" />`,
      errors: [{ messageId: "physical" }, { messageId: "physical" }],
    },
    {
      name: "CSS order",
      code: `const a = <div className="order-last sm:order-2 -order-1" />`,
      errors: [
        { messageId: "order" },
        { messageId: "order" },
        { messageId: "order" },
      ],
    },
    {
      name: "palette colors",
      code: `const a = <div className="bg-red-600 text-white hover:bg-blue-500/20 border-s-amber-300" />`,
      errors: [
        { messageId: "palette" },
        { messageId: "palette" },
        { messageId: "palette" },
        { messageId: "palette" },
      ],
    },
    {
      name: "arbitrary colors",
      code: `const a = <div className="bg-[#0f172a] text-[oklch(0.7_0.1_250)]" />`,
      errors: [{ messageId: "palette" }, { messageId: "palette" }],
    },
    {
      name: "class maps outside JSX",
      code: `const sizes = { small: "text-xs", wide: "pl-4" }`,
      output: `const sizes = { small: "text-xs", wide: "ps-4" }`,
      errors: [{ messageId: "smallText" }, { messageId: "physical" }],
    },
  ],
})

import { describe, it } from "node:test"
import { RuleTester } from "eslint"
import rule from "./touch-button-size.js"

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

tester.run("touch-button-size", rule, {
  valid: [
    {
      name: "a touch-sized button",
      code: `const a = <Button size="touch">Save</Button>`,
    },
    {
      name: "a touch-sized icon button",
      code: `const a = <Button size="icon-touch" aria-label={messages.next} />`,
    },
    {
      name: "a size held in a variable",
      code: `const a = <Button size={size}>Save</Button>`,
    },
    {
      name: "a button that takes its props from a spread",
      code: `const a = <Button {...props}>Save</Button>`,
    },
    {
      name: "a link styled as a touch-sized button",
      code: `const a = <Link className={cn(buttonVariants({ variant: "cta", size: "touch-xl" }))} />`,
    },
    {
      name: "other components with a size prop",
      code: `const a = <BrandMark size="hero" />`,
    },
    {
      name: "a custom list of sizes",
      code: `const a = <Button size="lg">Save</Button>`,
      options: [{ sizes: ["lg"] }],
    },
  ],
  invalid: [
    {
      name: "a button with no size",
      code: `const a = <Button variant="outline">Save</Button>`,
      errors: [{ messageId: "missing" }],
    },
    {
      name: "a small button",
      code: `const a = <Button size="sm">Save</Button>`,
      errors: [{ messageId: "small" }],
    },
    {
      name: "a 32 px icon button resized with a class",
      code: `const a = <Button size="icon" className="size-11" />`,
      errors: [{ messageId: "small" }],
    },
    {
      name: "a size in braces",
      code: `const a = <Button size={"icon-lg"} />`,
      errors: [{ messageId: "small" }],
    },
    {
      name: "buttonVariants with no arguments",
      code: `const a = <Link className={cn(buttonVariants())} />`,
      errors: [{ messageId: "missing" }],
    },
    {
      name: "buttonVariants with no size",
      code: `const a = buttonVariants({ variant: "outline" })`,
      errors: [{ messageId: "missing" }],
    },
    {
      name: "buttonVariants with a small size",
      code: `const a = buttonVariants({ variant: "outline", size: "sm" })`,
      errors: [{ messageId: "small" }],
    },
  ],
})

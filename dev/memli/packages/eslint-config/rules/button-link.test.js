import { describe, it } from "node:test"
import { RuleTester } from "eslint"
import rule from "./button-link.js"

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

tester.run("button-link", rule, {
  valid: [
    {
      name: "a button with no render prop",
      code: `
        function Save() {
          return <Button type="submit">Save</Button>
        }
      `,
    },
    {
      name: "a button rendering a non-link element",
      code: `
        function Label() {
          return <Button render={<span />}>Save</Button>
        }
      `,
    },
    {
      name: "a button rendering a Link with nativeButton false",
      code: `
        function Home() {
          return (
            <Button render={<Link to="/" />} nativeButton={false}>
              Home
            </Button>
          )
        }
      `,
    },
    {
      name: "a button rendering an anchor with nativeButton false",
      code: `
        function Home() {
          return <Button render={<a href="/" />} nativeButton={false}>Home</Button>
        }
      `,
    },
    {
      name: "a render function that returns a Link, with nativeButton false",
      code: `
        function Home() {
          return (
            <Button
              render={(props) => <Link {...props} to="/" />}
              nativeButton={false}
            >
              Home
            </Button>
          )
        }
      `,
    },
    {
      name: "a menu item rendering a Link",
      code: `
        function Item() {
          return <DropdownMenuItem render={<Link to="/dashboard" />}>Dashboard</DropdownMenuItem>
        }
      `,
    },
    {
      name: "a member component named Button",
      code: `
        function Item() {
          return <Menu.Button asChild>Open</Menu.Button>
        }
      `,
    },
  ],
  invalid: [
    {
      name: "asChild shorthand",
      code: `
        function Home() {
          return <Button asChild><Link to="/">Home</Link></Button>
        }
      `,
      errors: [{ messageId: "asChild" }],
    },
    {
      name: "asChild set to true",
      code: `
        function Home() {
          return <Button asChild={true}>Home</Button>
        }
      `,
      errors: [{ messageId: "asChild" }],
    },
    {
      name: "Link render without nativeButton",
      code: `
        function Home() {
          return <Button render={<Link to="/" />}>Home</Button>
        }
      `,
      errors: [{ messageId: "nativeButton" }],
    },
    {
      name: "anchor render without nativeButton",
      code: `
        function Home() {
          return <Button render={<a href="/" />}>Home</Button>
        }
      `,
      errors: [{ messageId: "nativeButton" }],
    },
    {
      name: "Link render with nativeButton true",
      code: `
        function Home() {
          return <Button render={<Link to="/" />} nativeButton={true}>Home</Button>
        }
      `,
      errors: [{ messageId: "nativeButton" }],
    },
    {
      name: "Link render with a non-literal nativeButton",
      code: `
        function Home({ native }) {
          return <Button render={<Link to="/" />} nativeButton={native}>Home</Button>
        }
      `,
      errors: [{ messageId: "nativeButton" }],
    },
    {
      name: "a render function that returns a Link, without nativeButton",
      code: `
        function Home() {
          return (
            <Button render={() => { return <Link to="/" /> }}>
              Home
            </Button>
          )
        }
      `,
      errors: [{ messageId: "nativeButton" }],
    },
    {
      name: "asChild and a Link render report both",
      code: `
        function Home() {
          return <Button asChild render={<Link to="/" />}>Home</Button>
        }
      `,
      errors: [{ messageId: "asChild" }, { messageId: "nativeButton" }],
    },
  ],
})

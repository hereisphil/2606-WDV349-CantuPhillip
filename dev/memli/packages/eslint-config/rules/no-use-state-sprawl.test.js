import { describe, it } from "node:test"
import { RuleTester } from "eslint"
import rule from "./no-use-state-sprawl.js"

RuleTester.describe = describe
RuleTester.it = it
RuleTester.itOnly = it.only

const tester = new RuleTester({
  languageOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
})

tester.run("no-use-state-sprawl", rule, {
  valid: [
    {
      name: "a component with no useState",
      code: `
        function Panel() {
          return null
        }
      `,
    },
    {
      name: "one primitive useState",
      code: `
        function Panel() {
          const [open, setOpen] = useState(false)
          return open
        }
      `,
    },
    {
      name: "one React.useState call",
      code: `
        function Panel() {
          const [open, setOpen] = React.useState(false)
          return open
        }
      `,
    },
    {
      name: "one useState initialised with a single-key object",
      code: `
        function Panel() {
          const [draft, setDraft] = useState({ email: "" })
          return draft
        }
      `,
    },
    {
      name: "one useState initialised from an existing value",
      code: `
        function Panel({ saved }) {
          const [draft, setDraft] = useState(saved)
          return draft
        }
      `,
    },
    {
      name: "one useState initialised with an array",
      code: `
        function Panel() {
          const [items, setItems] = useState([])
          return items
        }
      `,
    },
    {
      name: "one useState in the component and one in a nested function",
      code: `
        function Panel() {
          const [open, setOpen] = useState(false)
          function helper() {
            const [label, setLabel] = useState("")
            return label
          }
          return open || helper()
        }
      `,
    },
    {
      name: "two useState calls when max is 2",
      code: `
        function Panel() {
          const [open, setOpen] = useState(false)
          const [label, setLabel] = useState("")
          return open || label
        }
      `,
      options: [{ max: 2 }],
    },
  ],
  invalid: [
    {
      name: "two useState calls in one component",
      code: `
        function Panel() {
          const [open, setOpen] = useState(false)
          const [label, setLabel] = useState("")
          return open || label
        }
      `,
      errors: [
        {
          messageId: "tooMany",
          data: { count: "2", max: "1" },
        },
      ],
    },
    {
      name: "useState and React.useState count together",
      code: `
        function Panel() {
          const [open, setOpen] = React.useState(false)
          const [label, setLabel] = useState("")
          return open || label
        }
      `,
      errors: [
        {
          messageId: "tooMany",
          data: { count: "2", max: "1" },
        },
      ],
    },
    {
      name: "a third useState is reported when max is 2",
      code: `
        function Panel() {
          const [open, setOpen] = useState(false)
          const [label, setLabel] = useState("")
          const [count, setCount] = useState(0)
          return open || label || count
        }
      `,
      options: [{ max: 2 }],
      errors: [
        {
          messageId: "tooMany",
          data: { count: "3", max: "2" },
        },
      ],
    },
    {
      name: "every useState past the max is reported",
      code: `
        function Panel() {
          const [open, setOpen] = useState(false)
          const [label, setLabel] = useState("")
          const [count, setCount] = useState(0)
          return open || label || count
        }
      `,
      errors: [
        {
          messageId: "tooMany",
          data: { count: "3", max: "1" },
        },
        {
          messageId: "tooMany",
          data: { count: "3", max: "1" },
        },
      ],
    },
    {
      name: "useState initialised with a multi-key object",
      code: `
        function Panel() {
          const [form, setForm] = useState({ email: "", password: "" })
          return form
        }
      `,
      errors: [{ messageId: "objectState" }],
    },
    {
      name: "a spread plus another key is still a multi-key object",
      code: `
        function Panel({ defaults }) {
          const [form, setForm] = useState({ ...defaults, open: false })
          return form
        }
      `,
      errors: [{ messageId: "objectState" }],
    },
    {
      name: "a second useState that is also a multi-key object reports both",
      code: `
        function Panel() {
          const [open, setOpen] = useState(false)
          const [form, setForm] = useState({ email: "", password: "" })
          return open || form
        }
      `,
      errors: [
        { messageId: "objectState" },
        {
          messageId: "tooMany",
          data: { count: "2", max: "1" },
        },
      ],
    },
    {
      name: "two useState calls in a nested function",
      code: `
        function Panel() {
          const [open, setOpen] = useState(false)
          function helper() {
            const [email, setEmail] = useState("")
            const [password, setPassword] = useState("")
            return email || password
          }
          return open || helper()
        }
      `,
      errors: [
        {
          messageId: "tooMany",
          data: { count: "2", max: "1" },
        },
      ],
    },
  ],
})

import { describe, expect, it } from "vitest"

import {
  createFormReducer,
  startForm,
  type FormEvent,
  type FormState,
} from "./form-reducer"

type Field = "email" | "password"
type State = FormState<Field>
type Event = FormEvent<Field>

const filled = { email: "ana@memli.test", password: "Correct-horse" }
const empty = { email: "", password: "" }

// Stands in for a Zod schema: both fields are required.
const reducer = createFormReducer<Field>((fields) => {
  const errors = {
    ...(fields.email === "" && { email: ["Enter your email."] }),
    ...(fields.password === "" && { password: ["Enter a password."] }),
  }
  return Object.keys(errors).length === 0 ? null : errors
})

const idle: State = startForm(filled)
const submitting: State = { status: "submitting", fields: filled }
const refused: State = { status: "error", fields: filled, code: "REFUSED" }
const success: State = { status: "success", fields: filled }

const typed: Event = { type: "FIELD_CHANGED", field: "email", value: "b@c.d" }
const submitted: Event = { type: "SUBMITTED" }
const succeeded: Event = { type: "SUBMIT_SUCCEEDED" }
const failed: Event = { type: "SUBMIT_FAILED", code: "REFUSED" }

describe("startForm", () => {
  it("starts idle with no errors", () => {
    expect(startForm(empty)).toEqual({
      status: "idle",
      fields: empty,
      fieldErrors: {},
    })
  })
})

describe("FIELD_CHANGED", () => {
  it("updates the field", () => {
    expect(reducer(idle, typed)).toEqual({
      status: "idle",
      fields: { ...filled, email: "b@c.d" },
      fieldErrors: {},
    })
  })

  it("clears that field's errors and keeps the others", () => {
    const invalid = reducer(startForm(empty), submitted)

    expect(reducer(invalid, typed)).toMatchObject({
      status: "idle",
      fieldErrors: { password: ["Enter a password."] },
    })
  })

  it("clears the server's refusal", () => {
    expect(reducer(refused, typed)).toEqual({
      status: "idle",
      fields: { ...filled, email: "b@c.d" },
      fieldErrors: {},
    })
  })

  it.each([
    ["submitting", submitting],
    ["success", success],
  ])("is ignored while %s", (_status, state) => {
    expect(reducer(state, typed)).toBe(state)
  })
})

describe("SUBMITTED", () => {
  it("starts sending a valid form", () => {
    expect(reducer(idle, submitted)).toEqual(submitting)
  })

  it("stays idle with every field's errors when the form is not valid", () => {
    expect(reducer(startForm(empty), submitted)).toEqual({
      status: "idle",
      fields: empty,
      fieldErrors: {
        email: ["Enter your email."],
        password: ["Enter a password."],
      },
    })
  })

  it("sends again after a refusal", () => {
    expect(reducer(refused, submitted)).toEqual(submitting)
  })

  it.each([
    ["submitting", submitting],
    ["success", success],
  ])("is ignored while %s, so nothing is sent twice", (_status, state) => {
    expect(reducer(state, submitted)).toBe(state)
  })
})

describe("SUBMIT_SUCCEEDED and SUBMIT_FAILED", () => {
  it("finish a request that is out", () => {
    expect(reducer(submitting, succeeded)).toEqual(success)
    expect(reducer(submitting, failed)).toEqual(refused)
  })

  it.each([
    ["idle", idle],
    ["error", refused],
    ["success", success],
  ])("are ignored while %s", (_status, state) => {
    expect(reducer(state, succeeded)).toBe(state)
    expect(reducer(state, failed)).toBe(state)
  })
})

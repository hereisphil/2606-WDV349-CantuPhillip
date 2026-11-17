import { describe, expect, it } from "vitest"

import { signUpSchema } from "./sign-up"

const valid = {
  name: "Ana",
  email: "ana@memli.test",
  password: "correct horse battery",
}

describe("signUpSchema", () => {
  it("accepts a name, an email and a long enough password", () => {
    expect(signUpSchema.parse({ ...valid, name: "  Ana " }).name).toBe("Ana")
  })

  it.each([
    ["a blank name", { name: "   " }],
    ["a name over 64 characters", { name: "N".repeat(65) }],
    ["an email that is not one", { email: "ana" }],
    ["a password under 8 characters", { password: "short" }],
    ["a password over 128 characters", { password: "x".repeat(129) }],
  ])("refuses %s", (_label, change) => {
    expect(signUpSchema.safeParse({ ...valid, ...change }).success).toBe(false)
  })

  it("has no rule about symbols or capitals", () => {
    expect(
      signUpSchema.safeParse({ ...valid, password: "aaaaaaaa" }).success
    ).toBe(true)
  })
})

import { describe, expect, it } from "vitest"

import {
  meetsPasswordRules,
  passwordSchema,
  signUpSchema,
  TERMS_VERSION,
} from "./sign-up"

const valid = {
  name: "Ana",
  email: "ana@memli.test",
  password: "Correct-horse-battery",
  acceptedTermsVersion: TERMS_VERSION,
}

describe("signUpSchema", () => {
  it("accepts a name, an email and a strong enough password", () => {
    expect(signUpSchema.parse({ ...valid, name: "  Ana " }).name).toBe("Ana")
  })

  it.each([
    ["a blank name", { name: "   " }],
    ["a name over 64 characters", { name: "N".repeat(65) }],
    ["an email that is not one", { email: "ana" }],
    ["a password under 8 characters", { password: "Sh-ort" }],
    ["a password over 128 characters", { password: `A-${"x".repeat(127)}` }],
    ["a password with no capital letter", { password: "correct-horse" }],
    ["a password with no lowercase letter", { password: "CORRECT-HORSE" }],
    ["a password with no symbol", { password: "CorrectHorse1" }],
    ["unticked Terms", { acceptedTermsVersion: "" }],
    ["an older version of the Terms", { acceptedTermsVersion: "2026-01-01" }],
  ])("refuses %s", (_label, change) => {
    expect(signUpSchema.safeParse({ ...valid, ...change }).success).toBe(false)
  })
})

describe("passwordSchema", () => {
  it("names every rule a password misses, one message each", () => {
    const result = passwordSchema.safeParse("correcthorse")

    expect(result.error?.issues.map((issue) => issue.message)).toEqual([
      "Add a capital letter.",
      "Add a symbol, like ! or #.",
    ])
  })
})

describe("meetsPasswordRules", () => {
  it.each(["Correct-horse", "Contraseña¿segura", "Ünïcode!ok", "A_b"])(
    "accepts %s",
    (password) => {
      expect(meetsPasswordRules(password)).toBe(true)
    }
  )

  it("does not count a digit or a space as a symbol", () => {
    expect(meetsPasswordRules("Correct horse 1")).toBe(false)
  })
})

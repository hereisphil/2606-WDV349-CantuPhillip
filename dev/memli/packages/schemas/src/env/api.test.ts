import { describe, expect, it } from "vitest"

import { apiEnvSchema } from "./api"

const valid = {
  BETTER_AUTH_SECRET: "0123456789abcdef0123456789abcdef",
  BETTER_AUTH_URL: "https://memli.example",
}

describe("apiEnvSchema", () => {
  it("accepts a long secret and an https origin", () => {
    expect(apiEnvSchema.safeParse(valid).success).toBe(true)
  })

  it.each(["http://localhost:5173", "http://127.0.0.1:4173"])(
    "accepts %s, a developer's own machine",
    (BETTER_AUTH_URL) => {
      expect(
        apiEnvSchema.safeParse({ ...valid, BETTER_AUTH_URL }).success
      ).toBe(true)
    }
  )

  it.each([
    ["a missing secret", { BETTER_AUTH_SECRET: undefined }],
    ["a short secret", { BETTER_AUTH_SECRET: "too-short" }],
    ["a missing origin", { BETTER_AUTH_URL: undefined }],
    ["plain http on a real host", { BETTER_AUTH_URL: "http://memli.example" }],
    ["something that is not a URL", { BETTER_AUTH_URL: "memli.example" }],
  ])("refuses %s", (_label, change) => {
    expect(apiEnvSchema.safeParse({ ...valid, ...change }).success).toBe(false)
  })
})

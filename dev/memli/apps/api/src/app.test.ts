import { describe, expect, it } from "vitest"

import { app } from "./app"

describe("api app", () => {
  it("answers under the /api base path", async () => {
    const res = await app.request("/api")

    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ service: "memli-api" })
  })

  it("serves nothing outside /api", async () => {
    const res = await app.request("/")

    expect(res.status).toBe(404)
  })
})

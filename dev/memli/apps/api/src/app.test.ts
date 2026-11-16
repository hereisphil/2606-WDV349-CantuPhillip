import { apiErrorSchema } from "@workspace/schemas/api/error"
import { healthResponseSchema } from "@workspace/schemas/api/health"
import { describe, expect, it } from "vitest"

import { app } from "./app"

describe("GET /api/health", () => {
  it("says the API is up", async () => {
    const res = await app.request("/api/health")

    expect(res.status).toBe(200)
    expect(healthResponseSchema.parse(await res.json())).toEqual({
      status: "ok",
    })
  })
})

describe("unknown routes", () => {
  it("answers 404 with the NOT_FOUND code under /api", async () => {
    const res = await app.request("/api/nope")

    expect(res.status).toBe(404)
    expect(apiErrorSchema.parse(await res.json())).toEqual({
      error: { code: "NOT_FOUND" },
    })
  })

  it("answers the same way outside /api", async () => {
    const res = await app.request("/")

    expect(res.status).toBe(404)
    expect(apiErrorSchema.parse(await res.json())).toEqual({
      error: { code: "NOT_FOUND" },
    })
  })
})

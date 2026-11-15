import { apiErrorSchema } from "@workspace/schemas/api/error"
import { Hono } from "hono"
import { afterEach, describe, expect, it, vi } from "vitest"

import { errorResponse, handleError } from "./errors"

afterEach(() => {
  vi.restoreAllMocks()
})

describe("errorResponse", () => {
  it("sends the code with its HTTP status", async () => {
    const app = new Hono().get("/deck", (c) => errorResponse(c, "NOT_FOUND"))

    const res = await app.request("/deck")

    expect(res.status).toBe(404)
    expect(res.headers.get("content-type")).toContain("application/json")
    expect(await res.json()).toEqual({ error: { code: "NOT_FOUND" } })
  })
})

describe("handleError", () => {
  it("turns a thrown error into INTERNAL_ERROR and keeps the details in the log", async () => {
    const logged = vi.spyOn(console, "error").mockImplementation(() => {})
    const failure = new Error("SQLITE_ERROR: no such table: decks")
    const app = new Hono().get("/boom", () => {
      throw failure
    })
    app.onError(handleError)

    const res = await app.request("/boom")
    const text = await res.text()

    expect(res.status).toBe(500)
    expect(apiErrorSchema.parse(JSON.parse(text))).toEqual({
      error: { code: "INTERNAL_ERROR" },
    })
    expect(text).not.toContain("SQLITE_ERROR")
    expect(logged).toHaveBeenCalledWith(failure)
  })
})

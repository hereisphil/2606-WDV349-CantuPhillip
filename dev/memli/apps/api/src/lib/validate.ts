import type { MiddlewareHandler } from "hono"

import type { AppEnv } from "../env"
import { errorResponse } from "./errors"

/** The part of a Zod schema this file uses, so the API needs no Zod import. */
type Schema<T> = {
  safeParse: (value: unknown) => { success: true; data: T } | { success: false }
}

/**
 * Middleware that checks a request's JSON body or query string against a
 * schema from `@workspace/schemas` before the route runs.
 *
 *   routes.post("/", validate("json", submitReviewsRequestSchema), (c) => {
 *     const { reviews } = c.req.valid("json") // typed, and already checked
 *   })
 *
 * Anything the schema refuses, a body that is not JSON included, answers
 * 400 INVALID_REQUEST, so a route never sees a request it cannot trust. The
 * route gets the parsed value: defaults are filled in and fields the schema
 * does not know are dropped.
 */
export function validate<Target extends "json" | "query", T extends object>(
  target: Target,
  schema: Schema<T>
  // `out` is what `c.req.valid(target)` returns in the route.
): MiddlewareHandler<AppEnv, string, { out: Record<Target, T> }> {
  return async (c, next) => {
    const value: unknown =
      target === "json"
        ? await c.req.json<unknown>().catch(() => undefined)
        : c.req.query()

    const result = schema.safeParse(value)
    if (!result.success) return errorResponse(c, "INVALID_REQUEST")

    c.req.addValidatedData(target, result.data)
    return next()
  }
}

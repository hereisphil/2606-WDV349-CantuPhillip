import type { MiddlewareHandler } from "hono"

import type { AppEnv } from "../env"
import { errorResponse } from "./errors"

/** The part of a Zod schema this file uses, so the API needs no Zod import. */
type Schema<T> = {
  safeParse: (value: unknown) => { success: true; data: T } | { success: false }
}

/**
 * Checks the JSON body or query against a schema; a refusal answers 400
 * INVALID_REQUEST. See apps/api/README.md, "Checking a request".
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

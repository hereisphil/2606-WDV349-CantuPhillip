import type { Context, MiddlewareHandler } from "hono"

import type { AppEnv } from "../env"
import { errorResponse } from "./errors"

/** The part of a Zod schema this file uses, so the API needs no Zod import. */
type Schema<T> = {
  safeParse: (value: unknown) => { success: true; data: T } | { success: false }
}

type Target = "json" | "query" | "param"

/**
 * A body must say it is JSON. A cross-site form can only send form or plain
 * text bodies, so this also refuses a forged write (#169).
 */
function isJson(c: Context<AppEnv>): boolean {
  const type = c.req.header("Content-Type") ?? ""
  return type.split(";")[0]?.trim().toLowerCase() === "application/json"
}

async function read(c: Context<AppEnv>, target: Target): Promise<unknown> {
  switch (target) {
    case "json":
      return isJson(c)
        ? c.req.json<unknown>().catch(() => undefined)
        : undefined
    case "query":
      return c.req.query()
    case "param":
      return c.req.param()
  }
}

/**
 * Checks the JSON body, query or path params against a schema; a refusal
 * answers 400 INVALID_REQUEST. See apps/api/README.md, "Checking a request".
 */
export function validate<T extends Target, Out extends object>(
  target: T,
  schema: Schema<Out>
  // `out` is what `c.req.valid(target)` returns in the route.
): MiddlewareHandler<AppEnv, string, { out: Record<T, Out> }> {
  return async (c, next) => {
    const result = schema.safeParse(await read(c, target))
    if (!result.success) return errorResponse(c, "INVALID_REQUEST")

    c.req.addValidatedData(target, result.data)
    return next()
  }
}

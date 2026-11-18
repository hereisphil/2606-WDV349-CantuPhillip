import type { Context, MiddlewareHandler } from "hono"

import type { AppEnv } from "../env"
import { auth } from "./auth"
import { errorResponse } from "./errors"

/**
 * Lets a request through only with a live session, and remembers whose it
 * is. Without one the route answers 401 UNAUTHORIZED and never runs.
 */
export const requireViewer: MiddlewareHandler<AppEnv> = async (c, next) => {
  const session = await auth(c.env).api.getSession({
    headers: c.req.raw.headers,
  })
  if (session === null) return errorResponse(c, "UNAUTHORIZED")

  c.set("viewerId", session.user.id)
  return next()
}

/**
 * The signed-in learner. Routes never read a user id from the request, so
 * one learner can never ask for another's data (docs/security.md).
 */
export function viewerId(c: Context<AppEnv>): string {
  const id = c.get("viewerId") as string | undefined
  // Only a route mounted without `requireViewer` gets here: a bug, not a 401.
  if (id === undefined) throw new Error("viewerId() needs requireViewer")
  return id
}

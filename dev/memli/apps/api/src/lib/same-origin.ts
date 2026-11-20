import { parseApiEnv } from "@workspace/schemas/env/api"
import type { MiddlewareHandler } from "hono"

import type { AppEnv } from "../env"
import { errorResponse } from "./errors"

// Reads never change anything, so only these need proof of where they came from.
const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"])

/**
 * Refuses a write unless its `Origin` is Memli's own (`BETTER_AUTH_URL`), so
 * another site's page can't act with a learner's cookie (#169).
 */
export const requireSameOrigin: MiddlewareHandler<AppEnv> = async (c, next) => {
  // Better Auth checks the origin of its own routes (src/lib/auth.ts).
  if (SAFE_METHODS.has(c.req.method) || c.req.path.startsWith("/api/auth/")) {
    return next()
  }

  const expected = new URL(parseApiEnv(c.env).BETTER_AUTH_URL).origin
  // Every browser sends `Origin` on a POST, so a missing one is refused too.
  if (c.req.header("Origin") !== expected) {
    return errorResponse(c, "FORBIDDEN")
  }
  return next()
}

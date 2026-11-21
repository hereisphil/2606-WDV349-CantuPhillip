import { parseApiEnv } from "@workspace/schemas/env/api"
import type { MiddlewareHandler } from "hono"

import type { AppEnv } from "../env"
import { errorResponse } from "./errors"

// Reads never change anything, so only these need proof of where they came from.
const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"])

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1"])

/** A home or office network address: 10.x, 172.16 to 172.31, or 192.168.x. */
function isPrivateIPv4(host: string): boolean {
  const parts = host.split(".")
  if (parts.length !== 4 || !parts.every((part) => /^\d{1,3}$/.test(part))) {
    return false
  }
  const [a = 0, b = 0] = parts.map(Number)
  return (
    a === 10 || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168)
  )
}

/**
 * True for Memli's own origin. On a developer's machine, also for the same dev
 * server opened from a phone on the local network, like `http://192.168.1.5:5173`.
 */
export function isTrustedOrigin(
  origin: string | null | undefined,
  appUrl: string
): boolean {
  if (origin === null || origin === undefined || !URL.canParse(origin)) {
    return false
  }
  const from = new URL(origin)
  const app = new URL(appUrl)
  // A browser sends a bare origin. Anything else, like a path, is refused.
  if (from.origin !== origin) return false
  if (origin === app.origin) return true
  return (
    LOCAL_HOSTS.has(app.hostname) &&
    from.protocol === "http:" &&
    from.port === app.port &&
    isPrivateIPv4(from.hostname)
  )
}

/**
 * Refuses a write unless its `Origin` is Memli's own (`BETTER_AUTH_URL`), so
 * another site's page can't act with a learner's cookie (#169).
 */
export const requireSameOrigin: MiddlewareHandler<AppEnv> = async (c, next) => {
  // Better Auth checks the origin of its own routes (src/lib/auth.ts).
  if (SAFE_METHODS.has(c.req.method) || c.req.path.startsWith("/api/auth/")) {
    return next()
  }

  // Every browser sends `Origin` on a POST, so a missing one is refused too.
  const { BETTER_AUTH_URL } = parseApiEnv(c.env)
  if (!isTrustedOrigin(c.req.header("Origin"), BETTER_AUTH_URL)) {
    return errorResponse(c, "FORBIDDEN")
  }
  return next()
}

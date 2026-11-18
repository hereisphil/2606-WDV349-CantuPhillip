import { sql } from "drizzle-orm"
import type { MiddlewareHandler } from "hono"

import { database, type Database } from "../db/client"
import { rateLimits } from "../db/schema"
import type { AppEnv } from "../env"
import { errorResponse } from "./errors"
import { viewerId } from "./viewer"

/** At most `max` requests in each window of `windowSeconds`. */
export type Limit = { windowSeconds: number; max: number }

export type Decision =
  { allowed: true } | { allowed: false; retryAfter: number }

/**
 * Counts one request against `key` in D1, where every Worker instance sees
 * the same count. One statement, so two requests at once can't both slip by.
 */
export async function consume(
  db: Database,
  key: string,
  { windowSeconds, max }: Limit,
  now: number
): Promise<Decision> {
  const windowMs = windowSeconds * 1000
  // `last_request` holds when this key's window started. A finished window
  // starts again at 1.
  const windowOver = sql`${now} - ${rateLimits.lastRequest} >= ${windowMs}`
  const [row] = await db
    .insert(rateLimits)
    .values({ id: key, key, count: 1, lastRequest: now })
    .onConflictDoUpdate({
      target: rateLimits.key,
      set: {
        count: sql`case when ${windowOver} then 1 else ${rateLimits.count} + 1 end`,
        lastRequest: sql`case when ${windowOver} then ${now} else ${rateLimits.lastRequest} end`,
      },
    })
    .returning({ count: rateLimits.count, startedAt: rateLimits.lastRequest })

  if (row === undefined || row.count <= max) return { allowed: true }
  const retryAfter = Math.ceil((row.startedAt + windowMs - now) / 1000)
  return { allowed: false, retryAfter: Math.max(1, retryAfter) }
}

/**
 * Limits a route per learner and per address. Mount after `requireViewer`.
 * A refusal is `429 RATE_LIMITED` with `Retry-After` in seconds.
 */
export function limitRequests(
  route: string,
  limits: { perLearner: Limit; perAddress: Limit }
): MiddlewareHandler<AppEnv> {
  return async (c, next) => {
    const db = database(c.env.DB)
    const now = Date.now()
    // Cloudflare sets this itself. Locally there is none, so one count is shared.
    const address = c.req.header("cf-connecting-ip") ?? "local"

    const decisions = await Promise.all([
      consume(
        db,
        `memli|${route}|learner:${viewerId(c)}`,
        limits.perLearner,
        now
      ),
      consume(db, `memli|${route}|address:${address}`, limits.perAddress, now),
    ])
    const refused = decisions.filter((decision) => !decision.allowed)
    if (refused.length === 0) return next()

    const wait = Math.max(...refused.map((decision) => decision.retryAfter))
    c.header("Retry-After", String(wait))
    return errorResponse(c, "RATE_LIMITED")
  }
}

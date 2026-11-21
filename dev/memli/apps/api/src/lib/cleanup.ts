import { lt } from "drizzle-orm"

import type { Database } from "../db/client"
import { rateLimits, sessions, verifications } from "../db/schema"

/**
 * How long a rate-limit row outlives its last request. The longest window is
 * a minute, so a day is plenty, and the Privacy Policy promises it (#170).
 */
export const RATE_LIMIT_ROW_MS = 24 * 60 * 60 * 1000

/**
 * Deletes rows that only hold an IP address or a secret past their use: idle
 * rate-limit counts, and expired sessions and verification codes. Run daily.
 */
export async function deleteExpiredRows(
  db: Database,
  now: number
): Promise<void> {
  await db.batch([
    db
      .delete(rateLimits)
      .where(lt(rateLimits.lastRequest, now - RATE_LIMIT_ROW_MS)),
    db.delete(sessions).where(lt(sessions.expiresAt, new Date(now))),
    db.delete(verifications).where(lt(verifications.expiresAt, new Date(now))),
  ])
}

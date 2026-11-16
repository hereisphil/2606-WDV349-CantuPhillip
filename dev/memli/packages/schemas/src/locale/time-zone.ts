import { z } from "zod"

/**
 * An IANA time zone, like `America/Mexico_City` or `UTC`: where the learner
 * is, so "today" and "this week" mean their days, not the server's. The web
 * app sends `Intl.DateTimeFormat().resolvedOptions().timeZone`.
 *
 * Accepted when the runtime's `Intl` knows it, which is the same check that
 * decides whether the server can use it.
 */
export const timeZoneSchema = z.string().min(1).refine(isTimeZone, {
  error: "Expected an IANA time zone, like America/Mexico_City",
})

function isTimeZone(timeZone: string): boolean {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone })
    return true
  } catch {
    return false
  }
}

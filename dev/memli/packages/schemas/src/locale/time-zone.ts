import { z } from "zod"

/**
 * An IANA time zone, so "today" means the learner's day, not the server's.
 * Accepted when the runtime's `Intl` knows it, the same check the server needs.
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

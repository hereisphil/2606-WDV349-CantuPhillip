import { z } from "zod"

import { timeZoneSchema } from "../locale/time-zone"

/** The query string of `GET /api/history`. */
export const historyQuerySchema = z.object({
  timeZone: timeZoneSchema.default("UTC"),
})

export type HistoryQuery = z.infer<typeof historyQuerySchema>

const calendarDate = z.iso.date()
const count = z.int().nonnegative()

/**
 * `GET /api/history`: the viewer's study history from their review log, in
 * their time zone. `@workspace/core`'s `summarizeHistory` works it out.
 */
export const studyHistorySchema = z.object({
  /** Words per day studied counts toward. */
  dailyGoal: count,
  /** Today and the six days before it, oldest first. */
  days: z
    .array(
      z.object({
        /** "YYYY-MM-DD", where the viewer is. */
        date: calendarDate,
        /** Different words studied or reviewed that day. */
        wordsStudied: count,
      })
    )
    .readonly(),
  /** Days of study, REDESIGN.md section 5.7. */
  daysOfStudy: count,
  /** Reviews remembered over the last 30 days, 0 to 100. `null` before any. */
  retentionPercent: z.int().min(0).max(100).nullable(),
  /** Different words met for the first time this calendar month. */
  newWordsThisMonth: count,
})

export type StudyHistoryData = z.infer<typeof studyHistorySchema>

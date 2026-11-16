import { z } from "zod"

import { courseSchema } from "../content/course"
import { timeZoneSchema } from "../locale/time-zone"

/**
 * The query string of `GET /api/courses`. The time zone decides when the
 * viewer's day started, so words already begun today count against the
 * daily new-word limit.
 */
export const coursesQuerySchema = z.object({
  timeZone: timeZoneSchema.default("UTC"),
})

export type CoursesQuery = z.infer<typeof coursesQuerySchema>

const count = z.int().nonnegative()

/**
 * One course and where the viewer stands in it. The counts come from
 * `@workspace/core`'s `summarizeCourseProgress`, the same rules that pick a
 * session's cards, so a count always matches the session its button opens.
 */
export const courseSummarySchema = courseSchema.extend({
  /** Seen cards that are due now. What a `review` session holds. */
  dueCount: count,
  /**
   * New cards the viewer can still start today: the daily limit, less words
   * already begun today. What a `learn` session holds.
   */
  newAvailable: count,
  masteredCount: count,
  /** Seen, but not mastered yet. */
  learningCount: count,
  /** Never studied. Mastered, learning and unseen add up to the course. */
  unseenCount: count,
  /** Cards the viewer keeps forgetting. What a `practice` session holds. */
  trickyCount: count,
  /** UTC ISO 8601, or `null` when the course has never been studied. */
  lastReviewedAt: z.iso.datetime().nullable(),
})

export type CourseSummary = z.infer<typeof courseSummarySchema>

/** `GET /api/courses`: every course, with the viewer's progress in each. */
export const coursesResponseSchema = z.object({
  courses: z.array(courseSummarySchema),
})

export type CoursesResponse = z.infer<typeof coursesResponseSchema>

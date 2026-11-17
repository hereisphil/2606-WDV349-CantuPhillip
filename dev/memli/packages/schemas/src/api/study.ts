import { z } from "zod"

import { cardSchema } from "../content/card"
import { courseSchema } from "../content/course"
import { idSchema } from "../content/id"
import { timeZoneSchema } from "../locale/time-zone"
import { cardProgressSchema } from "../srs/progress"

/** Core's `StudyMode`: due cards, new cards, or ones often forgotten. */
export const studyModeSchema = z.enum(["review", "learn", "practice"])

export type StudyModeData = z.infer<typeof studyModeSchema>

/** The path params of `GET /api/courses/:courseId/study`. */
export const studyParamsSchema = z.object({
  courseId: idSchema,
})

export type StudyParams = z.infer<typeof studyParamsSchema>

/**
 * The query string of `GET /api/courses/:courseId/study`. A query string is
 * all text, so `extra` is coerced from `"10"` to `10`.
 */
export const studyQuerySchema = z.object({
  mode: studyModeSchema.default("review"),
  /** New cards to add past today's limit. Only `learn` uses it. */
  extra: z.coerce.number().int().positive().max(100).optional(),
  /** Where the viewer is, for "today" in the daily new-word limit. */
  timeZone: timeZoneSchema.default("UTC"),
})

export type StudyQuery = z.infer<typeof studyQuerySchema>

/**
 * A card with the viewer's progress on it: everything the session reducer in
 * `@workspace/core` needs. A card they have never seen arrives as `new`.
 */
export const studyCardSchema = cardSchema.extend({
  progress: cardProgressSchema,
})

export type StudyCardData = z.infer<typeof studyCardSchema>

/**
 * `GET /api/courses/:courseId/study`: one session's cards in study order. The
 * server picks them, so a client never decides what is due. May be empty.
 */
export const studySessionSchema = z.object({
  course: courseSchema,
  mode: studyModeSchema,
  cards: z.array(studyCardSchema),
})

export type StudySession = z.infer<typeof studySessionSchema>

import { z } from "zod"

import { idSchema } from "../content/id"

/** The path params of `PUT` and `DELETE /api/courses/:courseId/enrollment`. */
export const enrollmentParamsSchema = z.object({
  courseId: idSchema,
})

export type EnrollmentParams = z.infer<typeof enrollmentParamsSchema>

/**
 * What both routes answer: whether the course is on the viewer's dashboard
 * now (#174). Both are safe to repeat, so a retry gets the same answer.
 */
export const enrollmentSchema = z.object({
  courseId: idSchema,
  added: z.boolean(),
  /** UTC ISO 8601: when it was first added. `null` once removed. */
  addedAt: z.iso.datetime().nullable(),
})

export type Enrollment = z.infer<typeof enrollmentSchema>

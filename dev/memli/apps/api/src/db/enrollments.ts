import { and, eq } from "drizzle-orm"

import type { Database } from "./client"
import { enrollments } from "./schema"

/**
 * The courses on a learner's dashboard (#174). Adding and removing them lives
 * here too, so the dashboard and the catalog read the same rows.
 */

/** The ids of every course the learner has added. */
export async function addedCourseIds(
  db: Database,
  userId: string
): Promise<Set<string>> {
  const rows = await db
    .select({ courseId: enrollments.courseId })
    .from(enrollments)
    .where(eq(enrollments.userId, userId))
  return new Set(rows.map((row) => row.courseId))
}

export async function hasAdded(
  db: Database,
  userId: string,
  courseId: string
): Promise<boolean> {
  const [row] = await db
    .select({ courseId: enrollments.courseId })
    .from(enrollments)
    .where(
      and(eq(enrollments.userId, userId), eq(enrollments.courseId, courseId))
    )
    .limit(1)
  return row !== undefined
}

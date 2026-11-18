import { and, eq, sql } from "drizzle-orm"

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

/**
 * Adds a course to the learner's dashboard and answers when it was first
 * added. Adding it again changes nothing, so a retry keeps the first date.
 */
export async function addToDashboard(
  db: Database,
  userId: string,
  courseId: string,
  now: Date
): Promise<Date> {
  const [row] = await db
    .insert(enrollments)
    .values({ userId, courseId, addedAt: now })
    .onConflictDoUpdate({
      target: [enrollments.userId, enrollments.courseId],
      // A no-op update, so `returning` sends the row that was already there.
      set: { addedAt: sql`${enrollments.addedAt}` },
    })
    .returning({ addedAt: enrollments.addedAt })
  return row?.addedAt ?? now
}

/**
 * Takes a course off the learner's dashboard. Their progress stays, so
 * adding it back picks up where they left off. Safe when it was not added.
 */
export async function removeFromDashboard(
  db: Database,
  userId: string,
  courseId: string
): Promise<void> {
  await db
    .delete(enrollments)
    .where(
      and(eq(enrollments.userId, userId), eq(enrollments.courseId, courseId))
    )
}

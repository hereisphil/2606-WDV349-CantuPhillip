import type { CardProgress } from "@workspace/core/srs/progress"
import { and, eq, inArray } from "drizzle-orm"

import { idGroups, type Database, type Statement } from "./client"
import { cards, userProgress } from "./schema"

export type UserProgressRow = typeof userProgress.$inferSelect
type NewUserProgressRow = typeof userProgress.$inferInsert

/**
 * A `user_progress` row as core's `CardProgress`. D1's `Date` and core's ISO
 * strings both keep milliseconds, so nothing is lost either way.
 */
export function progressFromRow(row: UserProgressRow): CardProgress {
  return {
    cardId: row.cardId,
    state: row.state,
    due: row.due.toISOString(),
    lastReview: row.lastReview?.toISOString() ?? null,
    stability: row.stability,
    stabilityFast: row.stabilityFast,
    difficulty: row.difficulty,
    reps: row.reps,
    lapses: row.lapses,
    learningStep: row.learningStep,
    scheduledDays: row.scheduledDays,
  }
}

/** Core's `CardProgress` for one learner, ready to insert or upsert. */
export function progressToRow(
  userId: string,
  progress: CardProgress,
  now: Date
): NewUserProgressRow {
  return {
    userId,
    cardId: progress.cardId,
    state: progress.state,
    due: new Date(progress.due),
    lastReview:
      progress.lastReview === null ? null : new Date(progress.lastReview),
    stability: progress.stability,
    stabilityFast: progress.stabilityFast,
    difficulty: progress.difficulty,
    reps: progress.reps,
    lapses: progress.lapses,
    learningStep: progress.learningStep,
    scheduledDays: progress.scheduledDays,
    updatedAt: now,
  }
}

/** One learner's saved progress in every course, by course id. */
export async function progressByCourse(
  db: Database,
  userId: string
): Promise<Map<string, CardProgress[]>> {
  const rows = await db
    .select({ courseId: cards.courseId, progress: userProgress })
    .from(userProgress)
    .innerJoin(cards, eq(cards.id, userProgress.cardId))
    .where(eq(userProgress.userId, userId))

  const byCourse = new Map<string, CardProgress[]>()
  for (const { courseId, progress } of rows) {
    const list = byCourse.get(courseId) ?? []
    list.push(progressFromRow(progress))
    byCourse.set(courseId, list)
  }
  return byCourse
}

/** One learner's saved progress in one course. Unseen cards have none. */
export async function courseProgress(
  db: Database,
  userId: string,
  courseId: string
): Promise<CardProgress[]> {
  const rows = await db
    .select({ progress: userProgress })
    .from(userProgress)
    .innerJoin(cards, eq(cards.id, userProgress.cardId))
    .where(and(eq(userProgress.userId, userId), eq(cards.courseId, courseId)))
  return rows.map(({ progress }) => progressFromRow(progress))
}

/** One learner's saved progress on these cards. Unseen cards have none. */
export async function progressForCards(
  db: Database,
  userId: string,
  cardIds: readonly string[]
): Promise<CardProgress[]> {
  const groups = await Promise.all(
    idGroups(cardIds).map((ids) =>
      db
        .select()
        .from(userProgress)
        .where(
          and(
            eq(userProgress.userId, userId),
            inArray(userProgress.cardId, ids)
          )
        )
    )
  )
  return groups.flat().map(progressFromRow)
}

/**
 * One upsert per card on the `(user_id, card_id)` key, saving a learner's
 * progress. Built here, run by `runTogether`.
 */
export function progressUpserts(
  db: Database,
  userId: string,
  progress: readonly CardProgress[],
  now: Date
): Statement[] {
  return progress.map((cardProgress) => {
    const row = progressToRow(userId, cardProgress, now)
    const { userId: _userId, cardId: _cardId, ...changes } = row
    return db
      .insert(userProgress)
      .values(row)
      .onConflictDoUpdate({
        target: [userProgress.userId, userProgress.cardId],
        set: changes,
      })
  })
}

import type { CardProgress } from "@workspace/core/srs/progress"

import type { userProgress } from "./schema"

export type UserProgressRow = typeof userProgress.$inferSelect
type NewUserProgressRow = typeof userProgress.$inferInsert

/**
 * A `user_progress` row as core's `CardProgress`. Timestamps come out of D1
 * as `Date` (milliseconds) and go to core as ISO strings, so nothing is lost
 * either way: core writes ISO strings with milliseconds too.
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

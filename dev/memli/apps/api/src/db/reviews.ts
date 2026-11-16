import type { CardProgress } from "@workspace/core/srs/progress"
import type { HistoryReview } from "@workspace/core/study/history"
import { and, eq, gte, inArray, sql } from "drizzle-orm"

import type { RecordedReview } from "../lib/review-batch"
import { idGroups, runTogether, type Database } from "./client"
import { progressUpserts } from "./progress"
import { cards, reviews } from "./schema"

type NewReviewRow = typeof reviews.$inferInsert

/** A recorded review as a `reviews` row. Timestamps go in as `Date`. */
function reviewToRow(userId: string, review: RecordedReview): NewReviewRow {
  return {
    id: review.reviewId,
    userId,
    cardId: review.cardId,
    outcome: review.outcome,
    rating: review.rating,
    reviewedAt: new Date(review.reviewedAt),
    durationMs: review.durationMs,
    priorState: review.state,
    priorDue: new Date(review.due),
    priorLastReview:
      review.lastReview === null ? null : new Date(review.lastReview),
    priorStability: review.stability,
    priorStabilityFast: review.stabilityFast,
    priorDifficulty: review.difficulty,
    priorLearningStep: review.learningStep,
    priorScheduledDays: review.scheduledDays,
  }
}

/** Which of these review ids the server has already recorded. */
export async function recordedReviewIds(
  db: Database,
  reviewIds: readonly string[]
): Promise<Set<string>> {
  const groups = await Promise.all(
    idGroups(reviewIds).map((ids) =>
      db
        .select({ id: reviews.id })
        .from(reviews)
        .where(inArray(reviews.id, ids))
    )
  )
  return new Set(groups.flat().map((row) => row.id))
}

/**
 * Saves the log rows and each card's new progress, both or neither. The review
 * id is the primary key, so a racing duplicate fails and is never counted twice.
 */
export async function saveReviews(
  db: Database,
  userId: string,
  recorded: readonly RecordedReview[],
  progress: readonly CardProgress[],
  now: Date
): Promise<void> {
  await runTogether(db, [
    ...recorded.map((review) =>
      db.insert(reviews).values(reviewToRow(userId, review))
    ),
    ...progressUpserts(db, userId, progress, now),
  ])
}

export type CourseReview = HistoryReview & { courseId: string }

/**
 * One learner's reviews since `since`, oldest first, with each card's course.
 * SQL has no time zones, so callers ask a little early and core keeps the days.
 */
export async function reviewsSince(
  db: Database,
  userId: string,
  since: Date,
  options: { firstSightingsOnly?: boolean } = {}
): Promise<CourseReview[]> {
  const rows = await db
    .select({
      cardId: reviews.cardId,
      courseId: cards.courseId,
      reviewedAt: reviews.reviewedAt,
      outcome: reviews.outcome,
      priorState: reviews.priorState,
    })
    .from(reviews)
    .innerJoin(cards, eq(cards.id, reviews.cardId))
    .where(
      and(
        eq(reviews.userId, userId),
        gte(reviews.reviewedAt, since),
        options.firstSightingsOnly === true
          ? eq(reviews.priorState, "new")
          : undefined
      )
    )
    .orderBy(reviews.reviewedAt)
  return rows.map((row) => ({
    ...row,
    reviewedAt: row.reviewedAt.toISOString(),
  }))
}

/** Every time offset in use is a whole number of quarter hours. */
const QUARTER_HOUR_MS = 15 * 60 * 1000

/**
 * The quarter hours with any review, newest first. No UTC offset splits one, so
 * core can date each in any zone. See apps/api/README.md, `GET /api/history`.
 */
export async function studyQuarterHours(
  db: Database,
  userId: string
): Promise<Date[]> {
  // Inlined, not bound: D1 binds a JS number as a float, which breaks integer
  // division. It is our constant, never input, so `sql.raw` is safe.
  const bucket = sql<number>`cast(${reviews.reviewedAt} / ${sql.raw(String(QUARTER_HOUR_MS))} as integer)`
  const rows = await db
    .selectDistinct({ bucket })
    .from(reviews)
    .where(eq(reviews.userId, userId))
    .orderBy(sql`1 desc`)
  return rows.map((row) => new Date(Number(row.bucket) * QUARTER_HOUR_MS))
}

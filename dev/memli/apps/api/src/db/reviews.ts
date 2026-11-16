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
 * Saves a request's reviews: one log row per review, and each card's new
 * progress. Both or neither.
 *
 * A review id is the table's primary key, so if two copies of one request
 * race each other, the second insert fails and takes its progress update
 * down with it. A review can never be counted twice.
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
 * One learner's reviews since `since`, oldest first, with each card's
 * course: the rows the study history and the daily new-word limit read.
 *
 * Only the columns those need. Days are decided in the learner's time zone
 * by `@workspace/core`, which SQL cannot do, so the API asks for a little
 * more time than it needs and core keeps the right days.
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
 * The quarter hours in which one learner reviewed anything, as instants,
 * newest first: enough for days of study to find every study day, however
 * far back it reaches.
 *
 * Why quarter hours: a day of study is a date where the learner is, and
 * SQLite cannot convert to a time zone. Every zone's offset from UTC is a
 * whole number of quarter hours (India is +5:30, Nepal +5:45), so a quarter
 * hour never straddles anyone's midnight. Core turns each one into a date.
 * It is at most 96 rows a day of study, instead of every review.
 */
export async function studyQuarterHours(
  db: Database,
  userId: string
): Promise<Date[]> {
  // Written into the SQL, not bound: D1 binds a JS number as a float, and
  // `integer / float` is not integer division, so nothing would be grouped.
  // A constant of ours, never input, so `sql.raw` is safe here.
  const bucket = sql<number>`cast(${reviews.reviewedAt} / ${sql.raw(String(QUARTER_HOUR_MS))} as integer)`
  const rows = await db
    .selectDistinct({ bucket })
    .from(reviews)
    .where(eq(reviews.userId, userId))
    .orderBy(sql`1 desc`)
  return rows.map((row) => new Date(Number(row.bucket) * QUARTER_HOUR_MS))
}

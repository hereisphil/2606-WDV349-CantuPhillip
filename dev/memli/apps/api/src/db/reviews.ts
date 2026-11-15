import type { CardProgress } from "@workspace/core/srs/progress"
import { inArray } from "drizzle-orm"

import type { RecordedReview } from "../lib/review-batch"
import { idGroups, runTogether, type Database } from "./client"
import { progressUpserts } from "./progress"
import { reviews } from "./schema"

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

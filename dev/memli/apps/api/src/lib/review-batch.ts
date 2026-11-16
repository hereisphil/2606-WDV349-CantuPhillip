import { applyOutcome } from "@workspace/core/srs/outcome"
import { createProgress, type CardProgress } from "@workspace/core/srs/progress"
import type { SessionReview } from "@workspace/core/study/session-reducer"
import { capElapsedMs } from "@workspace/core/study/timing"
import type { ReviewSubmission } from "@workspace/schemas/srs/review"

/**
 * Turns reported reviews into each card's new progress and one log entry per
 * review. Pure: the route loads the progress and passes the server's `now`.
 */

/**
 * One `reviews` row: core's log entry (outcome, rating, the card before it),
 * plus the response time and the client's review id.
 */
export type RecordedReview = SessionReview & { readonly reviewId: string }

export type AppliedReviews = {
  /** Each reviewed card's progress afterwards, once per card. */
  readonly progress: CardProgress[]
  /** One entry per review, in the order they were applied. */
  readonly recorded: RecordedReview[]
}

// No study session lasts a day. A gap longer than that is a broken clock.
const MAX_GAP_MS = 24 * 60 * 60 * 1000

/**
 * Server-clock times: the last review is `now` and earlier ones keep their gaps,
 * never backwards nor over a day. See apps/api/README.md, `POST /api/reviews`.
 */
export function reviewTimes(reviewedAt: readonly string[], now: Date): Date[] {
  const last = reviewedAt.at(-1)
  if (last === undefined) return []
  const lastMs = Date.parse(last)

  let previousMs = -Infinity
  return reviewedAt.map((iso) => {
    const behindMs = Math.min(Math.max(0, lastMs - Date.parse(iso)), MAX_GAP_MS)
    previousMs = Math.max(previousMs, now.getTime() - behindMs)
    return new Date(previousMs)
  })
}

/**
 * Applies reviews oldest first, scheduling from saved progress: a client reports
 * outcomes, never a schedule. Response times are capped again, never trusted.
 */
export function applyReviews(
  saved: readonly CardProgress[],
  reviews: readonly ReviewSubmission[],
  now: Date
): AppliedReviews {
  const progress = new Map(saved.map((card) => [card.cardId, card]))
  const times = reviewTimes(
    reviews.map((review) => review.reviewedAt),
    now
  )

  const recorded = reviews.map((review, index): RecordedReview => {
    const at = times[index] ?? now
    const before =
      progress.get(review.cardId) ?? createProgress(review.cardId, at)
    const after = applyOutcome(before, review.outcome, at)
    progress.set(review.cardId, after.progress)
    return {
      ...after.log,
      reviewId: review.reviewId,
      durationMs:
        review.durationMs === null ? null : capElapsedMs(review.durationMs),
    }
  })

  const reviewed = new Set(reviews.map((review) => review.cardId))
  return {
    progress: [...reviewed].flatMap((cardId) => progress.get(cardId) ?? []),
    recorded,
  }
}

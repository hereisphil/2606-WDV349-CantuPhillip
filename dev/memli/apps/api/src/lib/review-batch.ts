import { applyOutcome } from "@workspace/core/srs/outcome"
import { createProgress, type CardProgress } from "@workspace/core/srs/progress"
import type { SessionReview } from "@workspace/core/study/session-reducer"
import { capElapsedMs } from "@workspace/core/study/timing"
import type { ReviewSubmission } from "@workspace/schemas/srs/review"

/**
 * Turns the reviews a client reports into what the server saves: each card's
 * new progress, and one log entry per review. Pure: the route loads the
 * progress and passes in the server's `now`.
 */

/**
 * One review, ready for the `reviews` table: core's log entry (the outcome,
 * the rating it became, and the card as it was before), plus the response
 * time and the client's id for it.
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
 * When each review happened, by the server's clock.
 *
 * Devices' clocks disagree, and FSRS measures memory by the time since the
 * last review, so a client's `reviewedAt` is never stored as it is. The last
 * review in the request happened now, by the server's clock. Earlier ones
 * keep their distance from it, because the gap between two reviews on one
 * device is real even when that device's clock is wrong.
 *
 * A request with one review, the usual case, is simply stamped `now`. Times
 * never run backwards and never reach further back than a day.
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
 * Applies reviews in order, oldest first.
 *
 * `saved` is the learner's progress on the reviewed cards; a card with none
 * is new. The schedule is computed here with `@workspace/core`, from what
 * the server has saved. A client reports an outcome, never a schedule.
 *
 * The response time is capped again here with core's `capElapsedMs`: the app
 * already does it, but the server never takes a client's word for a number.
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

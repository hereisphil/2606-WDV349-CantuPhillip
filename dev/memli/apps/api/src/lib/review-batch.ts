import { applyOutcome } from "@workspace/core/srs/outcome"
import { createProgress, type CardProgress } from "@workspace/core/srs/progress"
import type { ReviewSubmission } from "@workspace/schemas/srs/review"

/**
 * Turns the reviews a client reports into saved progress. Pure: the route
 * loads the progress and passes in the server's `now`.
 */

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
 * Applies reviews in order, oldest first, and returns each reviewed card's
 * progress afterwards, once per card.
 *
 * `saved` is the learner's progress on the reviewed cards; a card with none
 * is new. The schedule is computed here with `@workspace/core`, from what
 * the server has saved. A client reports an outcome, never a schedule.
 */
export function applyReviews(
  saved: readonly CardProgress[],
  reviews: readonly ReviewSubmission[],
  now: Date
): CardProgress[] {
  const progress = new Map(saved.map((card) => [card.cardId, card]))
  const times = reviewTimes(
    reviews.map((review) => review.reviewedAt),
    now
  )

  reviews.forEach((review, index) => {
    const at = times[index] ?? now
    const before =
      progress.get(review.cardId) ?? createProgress(review.cardId, at)
    progress.set(
      review.cardId,
      applyOutcome(before, review.outcome, at).progress
    )
  })

  const reviewed = new Set(reviews.map((review) => review.cardId))
  return [...reviewed].flatMap((cardId) => progress.get(cardId) ?? [])
}

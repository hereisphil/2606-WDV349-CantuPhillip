import type { SessionCard, SessionReview } from "./session-reducer"

/** What a finished session adds up to, for the summary screen. */
export type SessionSummary = {
  /** Words finished. A requeued word counts once. */
  readonly words: number
  /** Words whose first review this session was not a miss. */
  readonly rememberedFirstTime: number
  /** The earliest time any of these words is due again; `null` with no words. */
  readonly nextDue: string | null
}

/**
 * Sums up a session from the reducer's `complete` state. Pure, so the API
 * and a future mobile app can show the same numbers.
 */
export function summarizeSession(
  finished: readonly SessionCard[],
  reviews: readonly SessionReview[]
): SessionSummary {
  const firstOutcome = new Map<string, SessionReview["outcome"]>()
  for (const review of reviews) {
    if (!firstOutcome.has(review.cardId)) {
      firstOutcome.set(review.cardId, review.outcome)
    }
  }

  let rememberedFirstTime = 0
  let nextDue: string | null = null
  for (const card of finished) {
    const outcome = firstOutcome.get(card.progress.cardId)
    if (outcome !== undefined && outcome !== "missed") {
      rememberedFirstTime += 1
    }
    // ISO 8601 UTC strings sort in time order.
    if (nextDue === null || card.progress.due < nextDue) {
      nextDue = card.progress.due
    }
  }

  return { words: finished.length, rememberedFirstTime, nextDue }
}

import type { Evaluation } from "../answer/evaluate"
import {
  applyRating,
  previewDue,
  type CardProgress,
  type FsrsRating,
  type ReviewLog,
} from "./progress"

/**
 * How a card went, in Memli's terms. These are stable codes, not copy: apps
 * map them to localized labels ("Got it", "Just a typo — I knew it", …).
 *
 * - `missed`: didn't know it.
 * - `tough`: got there, but it was a struggle or a guess.
 * - `got_it`: knew it.
 * - `easy`: knew it instantly.
 */
export type ReviewOutcome = "missed" | "tough" | "got_it" | "easy"

/** The Rating Mapper: the one place a Memli outcome becomes an FSRS rating. */
const RATING_FOR_OUTCOME = {
  missed: 1,
  tough: 2,
  got_it: 3,
  easy: 4,
} as const satisfies Record<ReviewOutcome, FsrsRating>

/** Every outcome, from worst to best. */
const ALL_OUTCOMES = [
  "missed",
  "tough",
  "got_it",
  "easy",
] as const satisfies readonly ReviewOutcome[]

export type OutcomeLog = ReviewLog & { readonly outcome: ReviewOutcome }

export type OutcomeReview = {
  readonly progress: CardProgress
  readonly log: OutcomeLog
}

/**
 * The outcomes a learner can choose between after answering, best default
 * first. The UI shows these and never asks a question the answer already
 * settled.
 *
 * - typed and `exact` → `got_it` (default) or `easy`
 * - typed and `near` → `got_it` ("just a typo, I knew it") or `tough`
 *   ("I wasn't sure"); the learner decides, so neither is pre-chosen by
 *   evaluation alone
 * - typed and `wrong` → `missed` only
 * - revealed without typing (`null`) → all four, for the learner to judge
 */
export function outcomeChoices(
  evaluation: Evaluation | null
): readonly ReviewOutcome[] {
  if (evaluation === null) return ALL_OUTCOMES
  switch (evaluation.verdict) {
    case "exact":
      return ["got_it", "easy"]
    case "near":
      return ["got_it", "tough"]
    case "wrong":
      return ["missed"]
  }
}

/** Schedule a card from how it went. The log records the outcome too. */
export function applyOutcome(
  progress: CardProgress,
  outcome: ReviewOutcome,
  now: Date
): OutcomeReview {
  const { progress: next, log } = applyRating(
    progress,
    RATING_FOR_OUTCOME[outcome],
    now
  )
  return { progress: next, log: { ...log, outcome } }
}

/**
 * When the card would next be due for each outcome, without reviewing it,
 * for hints like "see this again in 5 days".
 */
export function previewOutcomeDue(
  progress: CardProgress,
  now: Date
): Record<ReviewOutcome, string> {
  const due = previewDue(progress, now)
  return {
    missed: due[RATING_FOR_OUTCOME.missed],
    tough: due[RATING_FOR_OUTCOME.tough],
    got_it: due[RATING_FOR_OUTCOME.got_it],
    easy: due[RATING_FOR_OUTCOME.easy],
  }
}

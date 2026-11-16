import type { Evaluation } from "../answer/evaluate"
import { normalizeAnswer } from "../answer/normalize"
import type { ReviewOutcome } from "../srs/outcome"
import type { CardProgress } from "../srs/progress"

// Timing only suggests an outcome; the learner confirms, so a break never
// costs a card. Apps measure it, paused while the tab is hidden.

/** Past this, a response time says more about the learner's day than the card. */
export const MAX_INFORMATIVE_MS = 30_000

/** Time to read the prompt and start answering. */
const BASE_MS = 2_000
const PER_CHARACTER_MS = 300

/**
 * A review's `durationMs`: whole ms, capped at `MAX_INFORMATIVE_MS`, `null`
 * for a broken timer. Rounded because the API takes whole milliseconds.
 */
export function capElapsedMs(elapsedMs: number): number | null {
  if (!Number.isFinite(elapsedMs) || elapsedMs < 0) return null
  return Math.round(Math.min(elapsedMs, MAX_INFORMATIVE_MS))
}

export type SuggestOutcomeInput = {
  readonly evaluation: Evaluation | null
  /** From `capElapsedMs`. */
  readonly elapsedMs: number | null
  readonly progress: CardProgress
}

/**
 * An outcome to pre-highlight, or `null`. Never `easy` on a first review, as
 * FSRS-7 puts a first "easy" about 54 days out. Rules: packages/core/README.md.
 */
export function suggestOutcome({
  evaluation,
  elapsedMs,
  progress,
}: SuggestOutcomeInput): ReviewOutcome | null {
  if (evaluation === null || evaluation.verdict === "wrong") return null
  if (elapsedMs === null || elapsedMs >= MAX_INFORMATIVE_MS) return null

  const quick =
    BASE_MS +
    PER_CHARACTER_MS * Array.from(normalizeAnswer(evaluation.matched)).length
  if (evaluation.verdict === "exact") {
    return elapsedMs <= quick && progress.state !== "new" ? "easy" : null
  }
  if (elapsedMs <= quick) return "got_it"
  if (elapsedMs >= quick * 2) return "tough"
  return null
}

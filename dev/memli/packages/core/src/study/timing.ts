import type { Evaluation } from "../answer/evaluate"
import { normalizeAnswer } from "../answer/normalize"
import type { ReviewOutcome } from "../srs/outcome"
import type { CardProgress } from "../srs/progress"

/**
 * Silent response-time helpers. Timing only ever *suggests* an outcome for
 * the UI to pre-highlight; the learner always confirms. It never lowers a
 * grade on its own, so a phone call or a bathroom break can't cost a card.
 *
 * Measuring is the app's job: time from showing the prompt to submit or
 * reveal, paused while the tab is hidden, then passed through `capElapsedMs`.
 */

/** Past this, a response time says more about the learner's day than the card. */
export const MAX_INFORMATIVE_MS = 30_000

/** Time to read the prompt and start answering. */
const BASE_MS = 2_000
/** Typing time per character of the expected answer. */
const PER_CHARACTER_MS = 300

/**
 * A response time worth keeping, or `null` if there is none.
 *
 * Negative, `NaN` and infinite values (a broken timer) become `null`. Long
 * gaps are capped at `MAX_INFORMATIVE_MS`, which is also the value to store
 * as a review's `durationMs`.
 */
export function capElapsedMs(elapsedMs: number): number | null {
  if (!Number.isFinite(elapsedMs) || elapsedMs < 0) return null
  return Math.min(elapsedMs, MAX_INFORMATIVE_MS)
}

export type SuggestOutcomeInput = {
  readonly evaluation: Evaluation | null
  /** From `capElapsedMs`. */
  readonly elapsedMs: number | null
  readonly progress: CardProgress
}

/**
 * An outcome to pre-highlight, or `null` for no nudge.
 *
 * - exact and quick → `easy`, except on a card's first review: FSRS-7 puts
 *   a first "easy" about 54 days out, so that has to be a deliberate choice.
 * - near and quick → `got_it` (likely just a typo); near and slow →
 *   `tough` (likely a struggle). Both are offered either way.
 * - Anything else, including a capped (too long to tell) time, a wrong
 *   answer, or a card revealed without typing → no nudge.
 *
 * "Quick" scales with the answer's length: 2 s to start plus 0.3 s per
 * character. "Slow" is twice that.
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

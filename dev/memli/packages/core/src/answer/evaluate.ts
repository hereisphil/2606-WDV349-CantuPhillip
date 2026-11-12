import { damerauLevenshtein } from "./edit-distance"
import { normalizeAnswer, stripAccents } from "./normalize"

/**
 * How a typed answer compares with the expected one.
 *
 * - `exact`: the same, ignoring case, spacing and punctuation.
 * - `near`: right apart from accents (`reason: "accent"`) or a few typos
 *   (`reason: "typo"`, counted after accents are ignored).
 * - `wrong`: anything further off, or blank.
 *
 * `matched` is the accepted answer, as written on the card, that the learner
 * came closest to.
 */
export type Evaluation =
  | { readonly verdict: "exact"; readonly matched: string }
  | {
      readonly verdict: "near"
      readonly matched: string
      readonly reason: "accent" | "typo"
      /** Edits needed once accents are ignored; 0 for `reason: "accent"`. */
      readonly typos: number
    }
  | { readonly verdict: "wrong" }

export type EvaluateOptions = {
  /**
   * Share of the expected answer's characters that may be typos.
   * Default 0.25: none for 1–3 characters, 1 for 4–7, 2 for 8 or more.
   */
  readonly typoRatio?: number
  /** Most typos forgiven however long the answer is. Default 2. */
  readonly maxTypos?: number
}

const DEFAULT_TYPO_RATIO = 0.25
const DEFAULT_MAX_TYPOS = 2

/**
 * Compare what the learner typed with a card's accepted answer or answers.
 * Pure and locale-independent; per-language rules are post-capstone (#135).
 */
export function evaluateAnswer(
  expected: string | readonly string[],
  actual: string,
  options: EvaluateOptions = {}
): Evaluation {
  const accepted = typeof expected === "string" ? [expected] : expected
  if (accepted.length === 0) {
    throw new RangeError("evaluateAnswer needs at least one expected answer")
  }

  const typed = normalizeAnswer(actual)
  if (typed === "") return { verdict: "wrong" }

  let best: Evaluation = { verdict: "wrong" }
  for (const answer of accepted) {
    const result = compare(answer, typed, options)
    if (rank(result) < rank(best)) best = result
    if (best.verdict === "exact") break
  }
  return best
}

function compare(
  answer: string,
  typed: string,
  options: EvaluateOptions
): Evaluation {
  const target = normalizeAnswer(answer)
  if (target === "") return { verdict: "wrong" }
  if (target === typed) return { verdict: "exact", matched: answer }

  const plainTarget = stripAccents(target)
  const typos = damerauLevenshtein(plainTarget, stripAccents(typed))
  if (typos === 0) {
    return { verdict: "near", matched: answer, reason: "accent", typos }
  }
  if (typos <= allowedTypos(plainTarget, options)) {
    return { verdict: "near", matched: answer, reason: "typo", typos }
  }
  return { verdict: "wrong" }
}

function allowedTypos(target: string, options: EvaluateOptions): number {
  const ratio = options.typoRatio ?? DEFAULT_TYPO_RATIO
  const max = options.maxTypos ?? DEFAULT_MAX_TYPOS
  return Math.min(max, Math.floor(Array.from(target).length * ratio))
}

/** Lower is better: exact, then accent-only, then fewest typos, then wrong. */
function rank(evaluation: Evaluation): number {
  switch (evaluation.verdict) {
    case "exact":
      return 0
    case "near":
      return 1 + evaluation.typos
    case "wrong":
      return Number.POSITIVE_INFINITY
  }
}

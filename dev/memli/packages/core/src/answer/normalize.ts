/**
 * The forms of an answer the Evaluator compares. Each step forgives
 * something a learner shouldn't lose a card over.
 */

/**
 * Case, spacing and punctuation never count against a learner, so
 * "¿Qué tal?" and "  qué   TAL " are the same answer.
 *
 * Punctuation becomes a space rather than vanishing, so "arc-en-ciel" matches
 * "arc en ciel" exactly and "l'eau" is one edit from "leau".
 */
export function normalizeAnswer(value: string): string {
  return value
    .normalize("NFC")
    .toLowerCase()
    .replace(/\p{P}+/gu, " ")
    .replace(/\s+/gu, " ")
    .trim()
}

/**
 * `normalizeAnswer` with accents removed: "año" → "ano", "ça" → "ca".
 * An answer that only matches in this form is close, not exact.
 */
export function stripAccents(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{M}+/gu, "")
    .normalize("NFC")
}

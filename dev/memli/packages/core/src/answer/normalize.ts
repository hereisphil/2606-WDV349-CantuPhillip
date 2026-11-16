/**
 * Ignores case, spacing and punctuation. Punctuation becomes a space, so
 * "arc-en-ciel" matches "arc en ciel" exactly.
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

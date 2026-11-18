/**
 * Copy for each code the auth routes can refuse with. The API sends codes,
 * never sentences, so this is the one place to translate (docs/i18n.md).
 */
const refusals: Partial<Record<string, string>> = {
  // One sentence for both, so the form never says which part was wrong.
  INVALID_EMAIL_OR_PASSWORD: "That email or password isn't right.",
  INVALID_EMAIL: "Enter a valid email address.",
  RATE_LIMITED: "Too many tries. Wait a moment, then try again.",
  NETWORK_ERROR: "We couldn't reach Memli. Check your connection.",
}

const fallback = "Something went wrong. Try again."

export function refusalMessage(code: string): string {
  return refusals[code] ?? fallback
}

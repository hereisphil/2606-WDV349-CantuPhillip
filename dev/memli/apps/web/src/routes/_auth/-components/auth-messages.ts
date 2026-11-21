/**
 * Copy for each code the auth routes can refuse with. The API sends codes,
 * never sentences, so this is the one place to translate (docs/i18n.md).
 */
const refusals: Partial<Record<string, string>> = {
  // One sentence for both, so the form never says which part was wrong.
  INVALID_EMAIL_OR_PASSWORD: "That email or password isn't right.",
  INVALID_EMAIL: "Enter a valid email address.",
  USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL:
    "That email already has an account. Sign in instead.",
  PASSWORD_COMPROMISED:
    "That password appeared in a data breach. Choose another one.",
  PASSWORD_TOO_WEAK: "Add a capital letter, a lowercase letter and a symbol.",
  PASSWORD_TOO_SHORT: "Password must be at least 8 characters.",
  PASSWORD_TOO_LONG: "Use 128 characters or fewer.",
  NAME_RESERVED: "That name is kept for the Memli team. Choose another one.",
  TERMS_NOT_ACCEPTED: "Check the box to accept the Terms of Service.",
  RATE_LIMITED: "Too many tries. Wait a moment, then try again.",
  NETWORK_ERROR: "We couldn't reach Memli. Check your connection.",
}

const fallback = "Something went wrong. Try again."

export function refusalMessage(code: string): string {
  return refusals[code] ?? fallback
}

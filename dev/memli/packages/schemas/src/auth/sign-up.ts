import { z } from "zod"

export const PASSWORD_MIN_LENGTH = 8
export const PASSWORD_MAX_LENGTH = 128

/**
 * The Terms of Service a learner accepts at sign-up: their "last updated"
 * date. Change it whenever the Terms change in a way that matters (#170).
 */
export const TERMS_VERSION = "2026-11-20"

/** The same ceiling as a mnemonic author's display name. */
export const DISPLAY_NAME_MAX_LENGTH = 64

/**
 * What a password needs besides its length. Unicode classes, so "É" is a
 * capital letter and "¿" is a symbol, the same in every learner's alphabet.
 */
const PASSWORD_RULES = [
  { pattern: /\p{Lu}/u, message: "Add a capital letter." },
  { pattern: /\p{Ll}/u, message: "Add a lowercase letter." },
  { pattern: /[\p{P}\p{S}]/u, message: "Add a symbol, like ! or #." },
] as const

/**
 * True when a password has a capital letter, a lowercase letter and a symbol.
 * The API runs it on every new password, so the form is never the only check.
 */
export function meetsPasswordRules(password: string): boolean {
  return PASSWORD_RULES.every(({ pattern }) => pattern.test(password))
}

/** A new password: its length, then one message for each rule it misses. */
export const passwordSchema = PASSWORD_RULES.reduce(
  (schema, { pattern, message }) => schema.regex(pattern, message),
  z
    .string()
    .min(PASSWORD_MIN_LENGTH, "Password must be at least 8 characters.")
    .max(PASSWORD_MAX_LENGTH, "Use 128 characters or fewer.")
)

/** Sign-up form input, and the body of `POST /api/auth/sign-up/email`. */
export const signUpSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Enter your name.")
    .max(DISPLAY_NAME_MAX_LENGTH, "Use 64 characters or fewer."),
  email: z.email("Enter a valid email address."),
  password: passwordSchema,
  /** The Terms the learner ticked: `TERMS_VERSION`, or "" when unticked. */
  acceptedTermsVersion: z.literal(
    TERMS_VERSION,
    "Check the box to accept the Terms of Service."
  ),
})

export type SignUpInput = z.infer<typeof signUpSchema>

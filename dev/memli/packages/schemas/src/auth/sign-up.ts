import { z } from "zod"

/**
 * Length only, never "must contain a symbol": long passwords beat complex
 * ones. The API hands the same limits to Better Auth (docs/security.md).
 */
export const PASSWORD_MIN_LENGTH = 8
export const PASSWORD_MAX_LENGTH = 128

/** The same ceiling as a mnemonic author's display name. */
export const DISPLAY_NAME_MAX_LENGTH = 64

/** Sign-up form input, and the body of `POST /api/auth/sign-up/email`. */
export const signUpSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Enter your name.")
    .max(DISPLAY_NAME_MAX_LENGTH, "Use 64 characters or fewer."),
  email: z.email("Enter a valid email address."),
  password: z
    .string()
    .min(PASSWORD_MIN_LENGTH, "Password must be at least 8 characters.")
    .max(PASSWORD_MAX_LENGTH, "Use 128 characters or fewer."),
})

export type SignUpInput = z.infer<typeof signUpSchema>

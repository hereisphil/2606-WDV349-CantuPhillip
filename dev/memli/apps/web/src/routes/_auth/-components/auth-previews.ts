import {
  startForm,
  type FormEvent,
  type FormState,
} from "@workspace/core/form/form-reducer"
import { TERMS_VERSION } from "@workspace/schemas/auth/sign-up"
import type { AuthResult } from "@/lib/auth"

// Development-only `?preview=` states for /signin and /signup. Plain data, so
// a production build, where nothing reads them, drops them.

export type AuthPreview = {
  /** One line on what to check, shown in the switcher. */
  description: string
  /** What the form shows: its own field checks, a server refusal, or waiting. */
  shows: "field-errors" | "submitting" | { refusal: string }
  /** Field values to start from, over a filled-in form. */
  fields?: Readonly<Record<string, string>>
}

const filled = {
  name: "Ana",
  email: "ana@memli.test",
  password: "Correct-horse-battery",
  acceptedTermsVersion: TERMS_VERSION,
}

export const signInPreviews = {
  "field-errors": {
    description: "Sent empty: each field says what it needs",
    shows: "field-errors",
    fields: { email: "", password: "" },
  },
  "wrong-password": {
    description: "Wrong email or password: one sentence for both",
    shows: { refusal: "INVALID_EMAIL_OR_PASSWORD" },
  },
  "rate-limited": {
    description: "Too many tries from this address (429)",
    shows: { refusal: "RATE_LIMITED" },
  },
  offline: {
    description: "No answer from the API",
    shows: { refusal: "NETWORK_ERROR" },
  },
  "unknown-error": {
    description: "A code the app has no copy for",
    shows: { refusal: "SOMETHING_NEW" },
  },
  submitting: {
    description: "Waiting for the API: fields and button locked",
    shows: "submitting",
  },
} as const satisfies Record<string, AuthPreview>

export const signUpPreviews = {
  "field-errors": {
    description: "Sent empty: each field says what it needs",
    shows: "field-errors",
    fields: { name: "", email: "", password: "", acceptedTermsVersion: "" },
  },
  "terms-unticked": {
    description: "Everything filled in but the Terms box",
    shows: "field-errors",
    fields: { acceptedTermsVersion: "" },
  },
  "password-rules": {
    description: "A password that misses two rules, caught before sending",
    shows: "field-errors",
    fields: { password: "correcthorse" },
  },
  "email-taken": {
    description: "That email already has an account",
    shows: { refusal: "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL" },
  },
  "breached-password": {
    description: "The password is in a known breach",
    shows: { refusal: "PASSWORD_COMPROMISED" },
  },
  "rate-limited": {
    description: "Too many sign-ups from this address (429)",
    shows: { refusal: "RATE_LIMITED" },
  },
  offline: {
    description: "No answer from the API",
    shows: { refusal: "NETWORK_ERROR" },
  },
  submitting: {
    description: "Waiting for the API: fields and button locked",
    shows: "submitting",
  },
} as const satisfies Record<string, AuthPreview>

export type SignInPreviewName = keyof typeof signInPreviews
export type SignUpPreviewName = keyof typeof signUpPreviews

export function isSignInPreviewName(
  value: unknown
): value is SignInPreviewName {
  return typeof value === "string" && Object.hasOwn(signInPreviews, value)
}

export function isSignUpPreviewName(
  value: unknown
): value is SignUpPreviewName {
  return typeof value === "string" && Object.hasOwn(signUpPreviews, value)
}

/** The form state a preview opens in, reached through the real reducer. */
export function previewState<Field extends string>(
  reducer: (
    state: FormState<Field>,
    event: FormEvent<Field>
  ) => FormState<Field>,
  initial: Readonly<Record<Field, string>>,
  preview: AuthPreview
): FormState<Field> {
  const fields = { ...initial } as Record<Field, string>
  for (const field of Object.keys(initial) as Field[]) {
    fields[field] =
      preview.fields?.[field] ?? filled[field as keyof typeof filled]
  }
  const submitted = reducer(startForm(fields), { type: "SUBMITTED" })
  if (preview.shows === "field-errors") return submitted
  if (preview.shows === "submitting") return { status: "submitting", fields }
  return reducer(
    { status: "submitting", fields },
    { type: "SUBMIT_FAILED", code: preview.shows.refusal }
  )
}

/** A preview never calls the API: sending again just waits. */
export function neverAnswers(): Promise<AuthResult> {
  return new Promise(() => {})
}

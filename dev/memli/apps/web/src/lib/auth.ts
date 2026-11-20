import type { SignInInput } from "@workspace/schemas/auth/sign-in"
import type { SignUpInput } from "@workspace/schemas/auth/sign-up"
import { createAuthClient } from "better-auth/client"

/**
 * Sign-in through Better Auth's client, on the same-origin `/api/auth/*`
 * paths. An answer is a stable code, never a sentence: screens map it to copy.
 */
const client = createAuthClient()

export type AuthResult = { ok: true } | { ok: false; code: string }

/** The part of the client's answer this file reads. */
type ClientAnswer = {
  error: { code?: string | undefined; status: number } | null
}

async function resultOf(call: Promise<ClientAnswer>): Promise<AuthResult> {
  try {
    const { error } = await call
    if (error === null) return { ok: true }
    // The limiter answers 429 with no code of its own (apps/api/README.md).
    if (error.status === 429) return { ok: false, code: "RATE_LIMITED" }
    return { ok: false, code: error.code ?? "UNKNOWN" }
  } catch {
    return { ok: false, code: "NETWORK_ERROR" }
  }
}

/** `POST /api/auth/sign-in/email`. Sets the session cookie on success. */
export function signIn(fields: SignInInput): Promise<AuthResult> {
  return resultOf(client.signIn.email(fields))
}

/** `POST /api/auth/sign-up/email`. Creates the learner and signs them in. */
export function signUp(fields: SignUpInput): Promise<AuthResult> {
  return resultOf(client.signUp.email(fields))
}

/** `POST /api/auth/sign-out`. Deletes the session on the server and clears the cookie. */
export function signOut(): Promise<AuthResult> {
  return resultOf(client.signOut())
}

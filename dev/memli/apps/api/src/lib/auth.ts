import {
  DISPLAY_NAME_MAX_LENGTH,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  TERMS_VERSION,
  meetsPasswordRules,
} from "@workspace/schemas/auth/sign-up"
import { parseApiEnv } from "@workspace/schemas/env/api"
import type { BetterAuthOptions } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { APIError, createAuthMiddleware } from "better-auth/api"
// `minimal` leaves out Kysely, which the Drizzle adapter never uses.
import { betterAuth } from "better-auth/minimal"
import { haveIBeenPwned } from "better-auth/plugins/haveibeenpwned"

import { database } from "../db/client"
import {
  accounts,
  rateLimits,
  sessions,
  users,
  verifications,
} from "../db/schema"
import { isTrustedOrigin } from "./same-origin"

type Auth = ReturnType<typeof betterAuth<BetterAuthOptions>>

// New accounts from one address: room for a household, not for a script.
const SIGN_UP_LIMIT = { window: 60, max: 5 }

// Every route that sets a password, and the body field that carries it.
const NEW_PASSWORD_FIELD: Partial<Record<string, string>> = {
  "/sign-up/email": "password",
  "/change-password": "newPassword",
  "/reset-password": "newPassword",
}

/** The password a request wants to set, if it is one of those routes. */
function newPassword(path: string, body: unknown): unknown {
  const field = NEW_PASSWORD_FIELD[path]
  if (field === undefined || typeof body !== "object" || body === null) {
    return undefined
  }
  return (body as Record<string, unknown>)[field]
}

/** True when a sign-up body accepts the current Terms of Service (#170). */
function acceptsTerms(body: unknown): boolean {
  return (
    typeof body === "object" &&
    body !== null &&
    (body as Record<string, unknown>).acceptedTermsVersion === TERMS_VERSION
  )
}

/** A display name as Memli stores it: trimmed and bounded. */
function tidyName(name: string): string {
  return name.trim().slice(0, DISPLAY_NAME_MAX_LENGTH)
}

/**
 * Sign-in, on Better Auth's defaults. The reason for each setting, and what
 * must stay on, is the sign-in checklist in docs/security.md.
 */
function authOptions(env: Env): BetterAuthOptions {
  const { BETTER_AUTH_SECRET, BETTER_AUTH_URL } = parseApiEnv(env)

  return {
    appName: "Memli",
    // The trusted origin, and `https` is what marks cookies `Secure`.
    baseURL: BETTER_AUTH_URL,
    // Locally, also the dev server opened from a phone (`isTrustedOrigin`).
    trustedOrigins: (request) => {
      const origin = request?.headers.get("Origin")
      return isTrustedOrigin(origin, BETTER_AUTH_URL) ? [origin] : []
    },
    secret: BETTER_AUTH_SECRET,
    database: drizzleAdapter(database(env.DB), {
      provider: "sqlite",
      // Memli's tables are plural: `users`, `sessions`, `accounts`.
      usePlural: true,
      schema: { users, sessions, accounts, verifications, rateLimits },
    }),
    emailAndPassword: {
      enabled: true,
      minPasswordLength: PASSWORD_MIN_LENGTH,
      maxPasswordLength: PASSWORD_MAX_LENGTH,
    },
    user: {
      additionalFields: {
        // The app's language for this learner. Never set from a sign-up body.
        uiLocale: {
          type: "string",
          required: false,
          defaultValue: "en",
          input: false,
        },
        // Which Terms the learner accepted, and when. Only the server sets them.
        termsVersion: { type: "string", required: false, input: false },
        termsAcceptedAt: { type: "date", required: false, input: false },
      },
    },
    databaseHooks: {
      user: {
        create: {
          // Bounds the name shown under mnemonics; `false` refuses a blank one.
          // Records the Terms that `hooks.before` checked: Google (#107) must ask too.
          before: async (user) => {
            const name = tidyName(user.name)
            if (name === "") return false
            return {
              data: {
                ...user,
                name,
                termsVersion: TERMS_VERSION,
                termsAcceptedAt: new Date(),
              },
            }
          },
        },
        // The same bound when a learner renames themselves later.
        update: {
          before: async (user) => {
            if (typeof user.name !== "string") return true
            const name = tidyName(user.name)
            return name === "" ? false : { data: { ...user, name } }
          },
        },
      },
    },
    hooks: {
      // Memli's own sign-up rules on top of Better Auth's: the current Terms,
      // and a password with a capital, a lowercase letter and a symbol.
      before: createAuthMiddleware(async (ctx) => {
        if (ctx.path === "/sign-up/email" && !acceptsTerms(ctx.body)) {
          throw new APIError("BAD_REQUEST", {
            code: "TERMS_NOT_ACCEPTED",
            message: "Accept the Terms of Service to sign up",
          })
        }
        const password = newPassword(ctx.path, ctx.body)
        if (typeof password === "string" && !meetsPasswordRules(password)) {
          throw new APIError("BAD_REQUEST", {
            code: "PASSWORD_TOO_WEAK",
            message:
              "Password needs a capital, a lowercase letter and a symbol",
          })
        }
      }),
    },
    rateLimit: {
      // Said out loud: the default only turns on when it detects production,
      // and that detection is Node's, not a Worker's.
      enabled: true,
      // Memory is not shared across Worker instances, so the counts go in D1.
      storage: "database",
      // Sign-in keeps Better Auth's own rule: 3 tries in 10 seconds.
      customRules: { "/sign-up/email": SIGN_UP_LIMIT },
    },
    advanced: {
      // Cloudflare sets this header itself. Any client can send the default,
      // `X-Forwarded-For`, and so pretend to be a new address on every try.
      ipAddress: { ipAddressHeaders: ["cf-connecting-ip"] },
      // Both default to off under a test runner. Never turn either on.
      disableOriginCheck: false,
      disableCSRFCheck: false,
    },
    // Refuses a new password found in a known breach. Only the first five
    // characters of its SHA-1 hash leave the Worker (docs/security.md).
    plugins: [haveIBeenPwned()],
    telemetry: { enabled: false },
  }
}

// A Worker only learns its environment per request, so build once per `env`.
const cache = new WeakMap<Env, Auth>()

/** Better Auth for this Worker's environment. */
export function auth(env: Env): Auth {
  const cached = cache.get(env)
  if (cached !== undefined) return cached

  const created = betterAuth(authOptions(env))
  cache.set(env, created)
  return created
}

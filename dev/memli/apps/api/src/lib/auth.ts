import {
  DISPLAY_NAME_MAX_LENGTH,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  meetsPasswordRules,
} from "@workspace/schemas/auth/sign-up"
import { parseApiEnv } from "@workspace/schemas/env/api"
import type { BetterAuthOptions } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { APIError, createAuthMiddleware } from "better-auth/api"
// `minimal` leaves out Kysely, which the Drizzle adapter never uses.
import { betterAuth } from "better-auth/minimal"

import { database } from "../db/client"
import {
  accounts,
  rateLimits,
  sessions,
  users,
  verifications,
} from "../db/schema"

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
    // The only trusted origin, and `https` is what marks cookies `Secure`.
    baseURL: BETTER_AUTH_URL,
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
      },
    },
    databaseHooks: {
      user: {
        create: {
          // A name is shown under a learner's mnemonics, so it is bounded
          // however the learner signed up. `false` refuses a blank one.
          before: async (user) => {
            const name = tidyName(user.name)
            return name === "" ? false : { data: { ...user, name } }
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
      // Better Auth checks a password's length. This adds Memli's own rules:
      // a capital letter, a lowercase letter and a symbol.
      before: createAuthMiddleware(async (ctx) => {
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

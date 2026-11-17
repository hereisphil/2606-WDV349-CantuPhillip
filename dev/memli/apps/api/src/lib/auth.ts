import {
  DISPLAY_NAME_MAX_LENGTH,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
} from "@workspace/schemas/auth/sign-up"
import { parseApiEnv } from "@workspace/schemas/env/api"
import type { BetterAuthOptions } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
// `minimal` leaves out Kysely, which the Drizzle adapter never uses.
import { betterAuth } from "better-auth/minimal"

import { database } from "../db/client"
import { accounts, sessions, users, verifications } from "../db/schema"

type Auth = ReturnType<typeof betterAuth<BetterAuthOptions>>

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
      schema: { users, sessions, accounts, verifications },
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
            const name = user.name.trim().slice(0, DISPLAY_NAME_MAX_LENGTH)
            return name === "" ? false : { data: { ...user, name } }
          },
        },
      },
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

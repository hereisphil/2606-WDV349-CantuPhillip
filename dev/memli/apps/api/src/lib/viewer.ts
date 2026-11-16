import type { Context } from "hono"

import type { AppEnv } from "../env"

/**
 * Who is asking. Until Better Auth (#108) there is no sign-in, so every
 * request is the prototype learner from seed/prototype.sql.
 *
 * Routes call this and never name a user id themselves. #108 changes this one
 * function to read the session, and every route follows.
 */
export function viewerId(_c: Context<AppEnv>): string {
  return "usr_prototype_01"
}

import type { Context } from "hono"

import type { AppEnv } from "../env"

/**
 * The prototype learner until Better Auth (#108). Routes never name a user id
 * themselves, so #108 only changes this function.
 */
export function viewerId(_c: Context<AppEnv>): string {
  return "usr_prototype_01"
}

import { z } from "zod"

import { languageTagSchema } from "../locale/language-tag"

/**
 * `GET /api/auth/get-session`: the signed-in learner, or `null`. Only the
 * fields the app reads; Better Auth sends more, and they are dropped.
 */
export const sessionResponseSchema = z
  .object({
    user: z.object({
      id: z.string().min(1),
      name: z.string(),
      email: z.email(),
      /** The app's own language for this learner. */
      uiLocale: languageTagSchema,
    }),
  })
  .nullable()

export type SessionResponse = z.infer<typeof sessionResponseSchema>

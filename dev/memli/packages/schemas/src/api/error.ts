import { z } from "zod"

/**
 * Every error the API can send. A code is a stable identifier, never a
 * sentence: clients map it to copy in the learner's UI language
 * (docs/i18n.md). Renaming one is a breaking change; adding one is not.
 */
export const apiErrorCodeSchema = z.enum([
  /** The request's body or query string is not what the route accepts. */
  "INVALID_REQUEST",
  /** No route matched, or the thing asked for does not exist. */
  "NOT_FOUND",
  /** The server failed. The details are in its log, never in the response. */
  "INTERNAL_ERROR",
])

export type ApiErrorCode = z.infer<typeof apiErrorCodeSchema>

/** The body of every non-2xx API response. */
export const apiErrorSchema = z.object({
  error: z.object({
    code: apiErrorCodeSchema,
  }),
})

export type ApiError = z.infer<typeof apiErrorSchema>

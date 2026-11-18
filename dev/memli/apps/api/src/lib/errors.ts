import type { ApiError, ApiErrorCode } from "@workspace/schemas/api/error"
import type { Context, ErrorHandler, NotFoundHandler } from "hono"
import type { ContentfulStatusCode } from "hono/utils/http-status"

// One HTTP status per code, decided here once. `satisfies` makes TypeScript
// fail the build when a new code is added to the schema without a status.
const STATUS = {
  INVALID_REQUEST: 400,
  NOT_FOUND: 404,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  RATE_LIMITED: 429,
  INTERNAL_ERROR: 500,
} as const satisfies Record<ApiErrorCode, ContentfulStatusCode>

/**
 * The only way a route should send an error: a stable code and its status,
 * never a sentence. `return errorResponse(c, "NOT_FOUND")`.
 */
export function errorResponse(c: Context, code: ApiErrorCode): Response {
  const body: ApiError = { error: { code } }
  return c.json(body, STATUS[code])
}

export const handleNotFound: NotFoundHandler = (c) =>
  errorResponse(c, "NOT_FOUND")

/**
 * A route threw. The details go to the log; the client gets only the code,
 * so a stack trace or SQL error never leaks into a response.
 */
export const handleError: ErrorHandler = (err, c) => {
  console.error(err)
  return errorResponse(c, "INTERNAL_ERROR")
}

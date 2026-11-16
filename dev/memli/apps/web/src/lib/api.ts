import { apiErrorSchema, type ApiErrorCode } from "@workspace/schemas/api/error"

/**
 * Talks to `apps/api` on relative `/api/...` paths, which Vite proxies in dev.
 * Components go through `queries.ts`, not this (docs/state-management.md).
 */

/** The part of a Zod schema this file uses. */
type Schema<T> = { parse: (value: unknown) => T }

/** `NETWORK_ERROR`: no answer came back. `INVALID_RESPONSE`: a success answer that isn't JSON. */
type ClientErrorCode = "NETWORK_ERROR" | "INVALID_RESPONSE"

/**
 * A request that failed. `code` is the API's stable error code, which the UI
 * maps to copy, or a ClientErrorCode when the API itself never answered.
 */
export class ApiError extends Error {
  readonly code: ApiErrorCode | ClientErrorCode
  /** The HTTP status, or `null` when no answer came back. */
  readonly status: number | null

  constructor(code: ApiErrorCode | ClientErrorCode, status: number | null) {
    super(code)
    this.name = "ApiError"
    this.code = code
    this.status = status
  }
}

/**
 * Parses the answer with its `@workspace/schemas` contract, so contract drift
 * fails loudly here, not as `undefined` three components later.
 */
export async function apiRequest<T>(
  path: string,
  schema: Schema<T>,
  init: RequestInit = {}
): Promise<T> {
  let res: Response
  try {
    res = await fetch(path, {
      ...init,
      headers: {
        Accept: "application/json",
        ...(init.body === undefined
          ? {}
          : { "Content-Type": "application/json" }),
      },
    })
  } catch {
    throw new ApiError("NETWORK_ERROR", null)
  }

  // JSON never parses to `undefined`, so it marks an answer that isn't JSON.
  const body: unknown = await res.json().catch(() => undefined)
  if (!res.ok) {
    const error = apiErrorSchema.safeParse(body)
    throw new ApiError(
      error.success ? error.data.error.code : "INTERNAL_ERROR",
      res.status
    )
  }
  // Staging once answered /api/* with index.html and a 200 (#165).
  if (body === undefined) throw new ApiError("INVALID_RESPONSE", res.status)
  return schema.parse(body)
}

/** A network drop or 5xx may pass on a retry; a 4xx never will. */
export function shouldRetry(failureCount: number, error: unknown): boolean {
  const clientError =
    error instanceof ApiError &&
    error.status !== null &&
    error.status >= 400 &&
    error.status < 500
  return !clientError && failureCount < 3
}

import { apiErrorSchema, type ApiErrorCode } from "@workspace/schemas/api/error"

/**
 * Talks to `apps/api` on relative `/api/...` paths, which Vite proxies in dev.
 * Components go through `queries.ts`, not this (docs/state-management.md).
 */

/** The part of a Zod schema this file uses. */
type Schema<T> = { parse: (value: unknown) => T }

/**
 * A request that failed. `code` is the API's stable error code, which the UI
 * maps to copy, or `NETWORK_ERROR` when no answer came back at all.
 */
export class ApiError extends Error {
  readonly code: ApiErrorCode | "NETWORK_ERROR"
  /** The HTTP status, or `null` when no answer came back. */
  readonly status: number | null

  constructor(code: ApiErrorCode | "NETWORK_ERROR", status: number | null) {
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

  const body: unknown = await res.json().catch(() => null)
  if (!res.ok) {
    const error = apiErrorSchema.safeParse(body)
    throw new ApiError(
      error.success ? error.data.error.code : "INTERNAL_ERROR",
      res.status
    )
  }
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

import {
  MutationCache,
  QueryCache,
  QueryClient,
  queryOptions,
  type FetchQueryOptions,
} from "@tanstack/react-query"
import type { StudyMode } from "@workspace/core/study/course-progress"
import { coursesResponseSchema } from "@workspace/schemas/api/courses"
import { studyHistorySchema } from "@workspace/schemas/api/history"
import { sessionResponseSchema } from "@workspace/schemas/auth/session"
import {
  studySessionSchema,
  type StudySession,
} from "@workspace/schemas/api/study"
import {
  submitReviewsResponseSchema,
  type ReviewSubmission,
  type SubmitReviewsResponse,
} from "@workspace/schemas/srs/review"

import { ApiError, apiRequest, shouldRetry } from "./api"

/**
 * Every API call as TanStack Query definitions; routes never `fetch`. Keys
 * live here so code that invalidates names the same key the query uses.
 */

/**
 * `onUnauthorized` runs when any request answers UNAUTHORIZED: the session
 * ended while the learner was in the app.
 */
export function createQueryClient({
  onUnauthorized,
}: {
  onUnauthorized: () => void
}): QueryClient {
  const onError = (error: unknown): void => {
    if (error instanceof ApiError && error.code === "UNAUTHORIZED") {
      onUnauthorized()
    }
  }
  return new QueryClient({
    queryCache: new QueryCache({ onError }),
    mutationCache: new MutationCache({ onError }),
    defaultOptions: {
      queries: { retry: shouldRetry },
      mutations: { retry: shouldRetry },
    },
  })
}

export type ViewerPlan = "free" | "pro"

/** The signed-in learner, as every screen reads them. */
export type Viewer = {
  id: string
  /** The name they signed up with, shown on the dashboard and in menus. */
  displayName: string
  email: string
  plan: ViewerPlan
  uiLocale: string
}

/**
 * `GET /api/auth/get-session`: the viewer, or `null` when signed out. Route
 * guards read it before a page loads (src/lib/session.ts).
 */
export const sessionQuery = queryOptions({
  queryKey: ["session"],
  queryFn: async (): Promise<Viewer | null> => {
    const session = await apiRequest(
      "/api/auth/get-session",
      sessionResponseSchema
    )
    if (session === null) return null
    const { id, name, email, uiLocale } = session.user
    // Everyone is on the free plan until there is billing.
    return { id, displayName: name, email, plan: "free", uiLocale }
  },
  staleTime: 5 * 60_000,
})

/**
 * Where the viewer is, so "today" and "this week" are their days. Sent with
 * every request that counts days, and part of those queries' keys.
 */
const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
const timeZoneParam = `timeZone=${encodeURIComponent(timeZone)}`

/**
 * `GET /api/courses` with the viewer's counts. Fresh for 10 s, then refetched
 * on return, because words come due as time passes.
 */
export const coursesQuery = queryOptions({
  queryKey: ["courses", timeZone],
  queryFn: async () =>
    (await apiRequest(`/api/courses?${timeZoneParam}`, coursesResponseSchema))
      .courses,
  staleTime: 10_000,
})

/**
 * `GET /api/history`: the week, days of study, retention and new words
 * this month, from the review log.
 */
export const historyQuery = queryOptions({
  queryKey: ["history", timeZone],
  queryFn: () =>
    apiRequest(`/api/history?${timeZoneParam}`, studyHistorySchema),
  staleTime: 10_000,
})

export type StudySessionParams = {
  courseId: string
  mode: StudyMode
  extra?: number | undefined
}

/**
 * `GET /api/courses/:courseId/study`. Always stale: the words in an old
 * answer may have been studied since.
 */
type StudySessionKey = readonly [
  "study-session",
  courseId: string,
  mode: StudyMode,
  extra: number,
]

export function studySessionQuery({
  courseId,
  mode,
  extra,
}: StudySessionParams): FetchQueryOptions<
  StudySession,
  Error,
  StudySession,
  StudySessionKey
> {
  const search = new URLSearchParams({ mode, timeZone })
  if (extra !== undefined) search.set("extra", String(extra))
  return {
    queryKey: ["study-session", courseId, mode, extra ?? 0],
    queryFn: () =>
      apiRequest(
        `/api/courses/${encodeURIComponent(courseId)}/study?${search.toString()}`,
        studySessionSchema
      ),
    staleTime: 0,
  }
}

/** `POST /api/reviews`. Safe to send again: each review carries its own id. */
export function submitReviews(
  reviews: ReviewSubmission[]
): Promise<SubmitReviewsResponse> {
  return apiRequest("/api/reviews", submitReviewsResponseSchema, {
    method: "POST",
    body: JSON.stringify({ reviews }),
  })
}

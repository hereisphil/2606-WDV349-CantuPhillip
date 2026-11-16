import {
  QueryClient,
  queryOptions,
  type FetchQueryOptions,
} from "@tanstack/react-query"
import type { StudyMode } from "@workspace/core/study/course-progress"
import { coursesResponseSchema } from "@workspace/schemas/api/courses"
import { studyHistorySchema } from "@workspace/schemas/api/history"
import {
  studySessionSchema,
  type StudySession,
} from "@workspace/schemas/api/study"
import {
  submitReviewsResponseSchema,
  type ReviewSubmission,
  type SubmitReviewsResponse,
} from "@workspace/schemas/srs/review"

import { apiRequest, shouldRetry } from "./api"

/**
 * Every API call the web app makes, as TanStack Query definitions. Routes
 * and components import these, never `fetch`.
 *
 * Query keys live here too, so code that refreshes data after a change
 * names the same key the query uses.
 */

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: shouldRetry },
      mutations: { retry: shouldRetry },
    },
  })
}

/**
 * Where the viewer is, so "today" and "this week" are their days. Sent with
 * every request that counts days, and part of those queries' keys.
 */
const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
const timeZoneParam = `timeZone=${encodeURIComponent(timeZone)}`

/**
 * `GET /api/courses`: every course with the viewer's counts in it. Fresh for
 * 10 seconds. After that, coming back to the tab or the page fetches again,
 * because words come due as time passes.
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
 * `GET /api/courses/:courseId/study`: one session's cards, picked by the
 * server. Always stale, so starting a session always asks the server: the
 * words in an old answer may have been studied since.
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

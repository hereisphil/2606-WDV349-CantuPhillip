import { useEffect, useRef } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import type { SessionReview } from "@workspace/core/study/session-reducer"
import type { ReviewSubmission } from "@workspace/schemas/srs/review"
import { coursesQuery, historyQuery, submitReviews } from "@/lib/queries"

type SaveReviews = {
  /** Some reviews could not be saved, even after retrying. */
  failed: boolean
  /** Tries the unsaved reviews again. */
  retry: () => void
}

/**
 * Saves each review to `POST /api/reviews` as soon as the learner settles
 * it, so closing the tab half way loses nothing already answered.
 *
 * The session reducer stays pure: it only collects `reviews`. This hook
 * watches that list and sends what has not been saved yet. Reviews that
 * arrive while a request is out go in the next one.
 *
 * Each review gets one `reviewId`, made the first time it is sent and reused
 * on every retry. The API records a review once per id, so a retry after a
 * dropped connection never counts it twice.
 *
 * Reviews are tracked by object, not by position, because "Study these words
 * again" starts a fresh list.
 */
export function useSaveReviews(
  reviews: readonly SessionReview[],
  { enabled }: { enabled: boolean }
): SaveReviews {
  const queryClient = useQueryClient()
  const ids = useRef(new WeakMap<SessionReview, string>())
  const saved = useRef(new WeakSet<SessionReview>())

  const { mutate, isPending, isError, reset } = useMutation({
    // The response is ignored: the dashboard refetches its own counts below.
    mutationFn: submitReviews,
    // Runs even if the learner has left the page, so the dashboard is fresh
    // by the time it opens.
    onSuccess: () =>
      Promise.all(
        [coursesQuery.queryKey, historyQuery.queryKey].map((queryKey) =>
          queryClient.invalidateQueries({ queryKey, refetchType: "all" })
        )
      ),
  })

  useEffect(() => {
    if (!enabled || isPending || isError) return
    const unsaved = reviews.filter((review) => !saved.current.has(review))
    if (unsaved.length === 0) return

    const submissions = unsaved.map((review): ReviewSubmission => {
      let reviewId = ids.current.get(review)
      if (reviewId === undefined) {
        reviewId = crypto.randomUUID()
        ids.current.set(review, reviewId)
      }
      return {
        reviewId,
        cardId: review.cardId,
        outcome: review.outcome,
        reviewedAt: review.reviewedAt,
        durationMs: review.durationMs,
      }
    })
    mutate(submissions, {
      onSuccess: () => {
        for (const review of unsaved) saved.current.add(review)
      },
    })
  }, [enabled, isPending, isError, reviews, mutate])

  return { failed: isError, retry: reset }
}

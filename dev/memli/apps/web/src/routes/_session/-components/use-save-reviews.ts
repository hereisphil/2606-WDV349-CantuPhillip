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
 * Saves each review as it settles. Its `reviewId` is reused on retries so the API never counts it twice.
 * Reviews are tracked by object, not position, because "Study these words again" starts a fresh list.
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

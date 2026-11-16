import { z } from "zod"

import { cardProgressSchema } from "./progress"

/**
 * How a card went, in Memli's terms: core's `ReviewOutcome`. Stable codes,
 * not copy; apps map them to labels ("Got it", "I wasn't sure", …).
 */
export const reviewOutcomeSchema = z.enum(["missed", "tough", "got_it", "easy"])

export type ReviewOutcomeData = z.infer<typeof reviewOutcomeSchema>

/**
 * One finished review: what happened, never the result. The server schedules
 * with core's `applyOutcome`, so a client can't send a made-up due date.
 */
export const reviewSubmissionSchema = z.object({
  /** Made by the client, so a retried request isn't counted twice. */
  reviewId: z.uuid(),
  cardId: z.string().min(1),
  outcome: reviewOutcomeSchema,
  /** When the learner settled the outcome, UTC ISO 8601. */
  reviewedAt: z.iso.datetime(),
  /**
   * Response time in milliseconds; `null` when unknown. The session reducer
   * caps it with core's `capElapsedMs`, and the server caps it again.
   */
  durationMs: z.int().nonnegative().nullable(),
})

export type ReviewSubmission = z.infer<typeof reviewSubmissionSchema>

// Far above a real session (a few dozen reviews, plus repeats of missed
// words), low enough that one request cannot make the Worker do unbounded work.
const MAX_REVIEWS_PER_REQUEST = 500

/**
 * A batch of reviews, oldest first, applied in order. A missed word comes back
 * in the same session, so one card can appear more than once.
 */
export const submitReviewsRequestSchema = z.object({
  reviews: z
    .array(reviewSubmissionSchema)
    .nonempty()
    .max(MAX_REVIEWS_PER_REQUEST),
})

export type SubmitReviewsRequest = z.infer<typeof submitReviewsRequestSchema>

/**
 * Each named card's progress after its reviews. An already-recorded review
 * changes nothing, but its card's progress still comes back.
 */
export const submitReviewsResponseSchema = z.object({
  progress: z.array(cardProgressSchema),
})

export type SubmitReviewsResponse = z.infer<typeof submitReviewsResponseSchema>

import { z } from "zod"

import { cardProgressSchema } from "./progress"

/**
 * How a card went, in Memli's terms: core's `ReviewOutcome`. Stable codes,
 * not copy; apps map them to labels ("Got it", "I wasn't sure", …).
 */
export const reviewOutcomeSchema = z.enum(["missed", "tough", "got_it", "easy"])

export type ReviewOutcomeData = z.infer<typeof reviewOutcomeSchema>

/**
 * One review the learner finished. Only what happened, never the result:
 * the server loads its own saved progress and schedules with
 * `@workspace/core`'s `applyOutcome`. A client can report an outcome, but it
 * cannot hand the server a made-up stability or due date.
 */
export const reviewSubmissionSchema = z.object({
  /**
   * A UUID the client makes for this one review (`crypto.randomUUID()`). If a
   * request is sent again, after a dropped connection say, the server sees an
   * id it already has and does not count the review twice.
   */
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
 * A batch of reviews, oldest first. A missed word comes back in the same
 * session, so one card can appear more than once; the server applies them in
 * order.
 */
export const submitReviewsRequestSchema = z.object({
  reviews: z
    .array(reviewSubmissionSchema)
    .nonempty()
    .max(MAX_REVIEWS_PER_REQUEST),
})

export type SubmitReviewsRequest = z.infer<typeof submitReviewsRequestSchema>

/**
 * The progress of every card the request named, once per card, after its
 * reviews. A review the server had already recorded changes nothing, and its
 * card's progress still comes back.
 */
export const submitReviewsResponseSchema = z.object({
  progress: z.array(cardProgressSchema),
})

export type SubmitReviewsResponse = z.infer<typeof submitReviewsResponseSchema>

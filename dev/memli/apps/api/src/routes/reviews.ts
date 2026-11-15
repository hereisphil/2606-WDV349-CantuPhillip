import {
  submitReviewsRequestSchema,
  type SubmitReviewsResponse,
} from "@workspace/schemas/srs/review"
import { Hono } from "hono"

import { database } from "../db/client"
import { existingCardIds } from "../db/content"
import { progressForCards } from "../db/progress"
import { recordedReviewIds, saveReviews } from "../db/reviews"
import type { AppEnv } from "../env"
import { errorResponse } from "../lib/errors"
import { applyReviews } from "../lib/review-batch"
import { validate } from "../lib/validate"
import { viewerId } from "../lib/viewer"

/** Mounted at `/api/reviews`. */
export const reviewRoutes = new Hono<AppEnv>()

// Records reviews the viewer finished and answers with each card's progress.
reviewRoutes.post(
  "/",
  validate("json", submitReviewsRequestSchema),
  async (c) => {
    const db = database(c.env.DB)
    // The server's clock, never the client's (see lib/review-batch.ts).
    const now = new Date()
    const userId = viewerId(c)
    const { reviews } = c.req.valid("json")
    const cardIds = [...new Set(reviews.map((review) => review.cardId))]

    const [known, saved, recorded] = await Promise.all([
      existingCardIds(db, cardIds),
      progressForCards(db, userId, cardIds),
      recordedReviewIds(
        db,
        reviews.map((review) => review.reviewId)
      ),
    ])
    // One unknown card refuses the whole request, so nothing is half saved.
    if (known.size !== cardIds.length) return errorResponse(c, "NOT_FOUND")

    // A request sent twice names the same review ids. Each review counts
    // once: skip the ones already recorded, and a repeat inside this request.
    const seen = new Set(recorded)
    const fresh = reviews.filter((review) => {
      if (seen.has(review.reviewId)) return false
      seen.add(review.reviewId)
      return true
    })

    const applied = applyReviews(saved, fresh, now)
    await saveReviews(db, userId, applied.recorded, applied.progress, now)

    // Every card the request named, reviewed just now or already recorded.
    const after = new Map(
      [...saved, ...applied.progress].map((card) => [card.cardId, card])
    )
    const body: SubmitReviewsResponse = {
      progress: cardIds.flatMap((cardId) => after.get(cardId) ?? []),
    }
    return c.json(body)
  }
)

import {
  submitReviewsRequestSchema,
  type SubmitReviewsResponse,
} from "@workspace/schemas/srs/review"
import { Hono } from "hono"

import { database } from "../db/client"
import { existingCardIds } from "../db/content"
import { progressForCards, saveProgress } from "../db/progress"
import type { AppEnv } from "../env"
import { errorResponse } from "../lib/errors"
import { applyReviews } from "../lib/review-batch"
import { validate } from "../lib/validate"
import { viewerId } from "../lib/viewer"

/** Mounted at `/api/reviews`. */
export const reviewRoutes = new Hono<AppEnv>()

// Records reviews the viewer finished and answers with each card's new progress.
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

    const [known, saved] = await Promise.all([
      existingCardIds(db, cardIds),
      progressForCards(db, userId, cardIds),
    ])
    // One unknown card refuses the whole request, so nothing is half saved.
    if (known.size !== cardIds.length) return errorResponse(c, "NOT_FOUND")

    const progress = applyReviews(saved, reviews, now)
    await saveProgress(db, userId, progress, now)

    const body: SubmitReviewsResponse = { progress }
    return c.json(body)
  }
)

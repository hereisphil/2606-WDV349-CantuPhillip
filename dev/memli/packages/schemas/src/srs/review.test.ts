import { describe, expect, it } from "vitest"

import { submitReviewsRequestSchema } from "./review"

const review = {
  reviewId: "0b7e2a52-6c1f-4d0e-9a57-3f8a1c2d4e5f",
  cardId: "es-gato",
  outcome: "got_it",
  reviewedAt: "2026-11-14T20:00:00.000Z",
  durationMs: 2_400,
}

describe("submitReviewsRequestSchema", () => {
  it("accepts a missed word reviewed again later in the same session", () => {
    const missedThenGot = [
      { ...review, outcome: "missed" },
      { ...review, reviewedAt: "2026-11-14T20:01:00.000Z" },
    ]

    expect(
      submitReviewsRequestSchema.safeParse({ reviews: missedThenGot }).success
    ).toBe(true)
  })

  it("accepts an unknown response time", () => {
    expect(
      submitReviewsRequestSchema.safeParse({
        reviews: [{ ...review, durationMs: null }],
      }).success
    ).toBe(true)
  })

  it("takes outcomes, never raw FSRS ratings", () => {
    expect(
      submitReviewsRequestSchema.safeParse({
        reviews: [{ ...review, outcome: 3 }],
      }).success
    ).toBe(false)
  })

  it("ignores scheduling fields a client tries to send", () => {
    const parsed = submitReviewsRequestSchema.parse({
      reviews: [{ ...review, stability: 9_999, due: "2099-01-01T00:00:00Z" }],
    })

    expect(parsed.reviews[0]).toEqual(review)
  })

  it("rejects a timestamp that is not UTC", () => {
    expect(
      submitReviewsRequestSchema.safeParse({
        reviews: [{ ...review, reviewedAt: "2026-11-14T14:00:00-06:00" }],
      }).success
    ).toBe(false)
  })

  it("needs a review id that is a UUID", () => {
    const { reviewId: _reviewId, ...noId } = review

    for (const bad of [noId, { ...review, reviewId: "review-1" }]) {
      expect(
        submitReviewsRequestSchema.safeParse({ reviews: [bad] }).success
      ).toBe(false)
    }
  })

  it("rejects an empty batch", () => {
    expect(submitReviewsRequestSchema.safeParse({ reviews: [] }).success).toBe(
      false
    )
  })

  it("caps a batch at 500 reviews", () => {
    const reviews = (count: number): (typeof review)[] =>
      Array.from({ length: count }, () => review)

    expect(
      submitReviewsRequestSchema.safeParse({ reviews: reviews(500) }).success
    ).toBe(true)
    expect(
      submitReviewsRequestSchema.safeParse({ reviews: reviews(501) }).success
    ).toBe(false)
  })
})

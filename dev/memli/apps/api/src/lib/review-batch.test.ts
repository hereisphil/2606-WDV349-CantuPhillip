import { applyOutcome } from "@workspace/core/srs/outcome"
import { createProgress } from "@workspace/core/srs/progress"
import type { ReviewSubmission } from "@workspace/schemas/srs/review"
import { describe, expect, it } from "vitest"

import { applyReviews, reviewTimes } from "./review-batch"

const now = new Date("2026-11-14T20:00:00.000Z")
const minute = 60_000

/** A time on the client's clock, `minutes` from the server's `now`. */
function clientTime(minutes: number): string {
  return new Date(now.getTime() + minutes * minute).toISOString()
}

function minutesFromNow(times: Date[]): number[] {
  return times.map((time) => (time.getTime() - now.getTime()) / minute)
}

function review(
  cardId: string,
  outcome: ReviewSubmission["outcome"],
  minutes = 0
): ReviewSubmission {
  return { cardId, outcome, reviewedAt: clientTime(minutes), durationMs: null }
}

describe("reviewTimes", () => {
  it("stamps a single review with the server's time, whatever the client says", () => {
    // A clock three days slow, and one a year fast.
    expect(reviewTimes([clientTime(-3 * 24 * 60)], now)).toEqual([now])
    expect(reviewTimes([clientTime(365 * 24 * 60)], now)).toEqual([now])
  })

  it("puts the last review at now and keeps the gaps before it", () => {
    // The whole session is an hour fast; its spacing is still real.
    const times = reviewTimes(
      [clientTime(50), clientTime(55), clientTime(60)],
      now
    )

    expect(minutesFromNow(times)).toEqual([-10, -5, 0])
  })

  it("never dates a review after now", () => {
    const times = reviewTimes([clientTime(30), clientTime(0)], now)

    expect(minutesFromNow(times)).toEqual([0, 0])
  })

  it("never runs backwards", () => {
    const times = reviewTimes(
      [clientTime(-5), clientTime(-20), clientTime(0)],
      now
    )

    expect(minutesFromNow(times)).toEqual([-5, -5, 0])
  })

  it("reaches back a day at most", () => {
    const times = reviewTimes([clientTime(-30 * 24 * 60), clientTime(0)], now)

    expect(minutesFromNow(times)).toEqual([-24 * 60, 0])
  })

  it("has no times for no reviews", () => {
    expect(reviewTimes([], now)).toEqual([])
  })
})

describe("applyReviews", () => {
  it("starts a card the learner has never seen as new", () => {
    const [progress] = applyReviews([], [review("es-gato", "got_it")], now)

    expect(progress).toEqual(
      applyOutcome(createProgress("es-gato", now), "got_it", now).progress
    )
  })

  it("builds on the saved progress, never on anything the client sends", () => {
    const saved = applyOutcome(
      createProgress("es-gato", now),
      "got_it",
      new Date(now.getTime() - 5 * 24 * 60 * minute)
    ).progress
    const tampered = {
      ...review("es-gato", "got_it"),
      stability: 9999,
      due: "2099-01-01T00:00:00.000Z",
    }

    const [progress] = applyReviews([saved], [tampered], now)

    expect(progress).toEqual(applyOutcome(saved, "got_it", now).progress)
  })

  it("applies a card's reviews in order and answers once per card", () => {
    const reviews = [
      review("es-gato", "missed", -10),
      review("es-casa", "easy", -6),
      review("es-gato", "got_it", 0),
    ]

    const progress = applyReviews([], reviews, now)

    const tenMinutesAgo = new Date(now.getTime() - 10 * minute)
    const missed = applyOutcome(
      createProgress("es-gato", tenMinutesAgo),
      "missed",
      tenMinutesAgo
    ).progress
    expect(progress.map((card) => card.cardId)).toEqual(["es-gato", "es-casa"])
    expect(progress[0]).toEqual(applyOutcome(missed, "got_it", now).progress)
    expect(progress[0]?.reps).toBe(2)
  })

  it("leaves cards that were not reviewed out of the answer", () => {
    const other = createProgress("es-casa", now)

    const progress = applyReviews([other], [review("es-gato", "tough")], now)

    expect(progress.map((card) => card.cardId)).toEqual(["es-gato"])
  })
})

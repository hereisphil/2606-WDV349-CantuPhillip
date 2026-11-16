import { describe, expect, it } from "vitest"
import {
  applyRating,
  createProgress,
  isDue,
  previewDue,
  type CardProgress,
  type FsrsRating,
} from "./progress"
import { scheduler } from "./scheduler"

const start = new Date("2026-11-10T15:00:00.000Z")
const hour = 60 * 60 * 1000

/** Rate the card in order, each time an hour after it came due. */
function study(
  ratings: readonly FsrsRating[],
  progress = createProgress("card_1", start)
): { progress: CardProgress; now: Date } {
  let now = start
  for (const rating of ratings) {
    progress = applyRating(progress, rating, now).progress
    now = new Date(new Date(progress.due).getTime() + hour)
  }
  return { progress, now }
}

describe("createProgress", () => {
  it("starts a new card that is due now", () => {
    expect(createProgress("card_1", start)).toEqual({
      cardId: "card_1",
      state: "new",
      due: "2026-11-10T15:00:00.000Z",
      lastReview: null,
      stability: 0,
      stabilityFast: 0,
      difficulty: 0,
      reps: 0,
      lapses: 0,
      learningStep: 0,
      scheduledDays: 0,
    })
  })

  it("rejects an invalid date", () => {
    expect(() => createProgress("card_1", new Date("nope"))).toThrow(RangeError)
  })
})

describe("applyRating", () => {
  it("matches raw ts-fsrs at every step, so nothing is lost in the JSON shape", () => {
    let progress = createProgress("card_1", start)
    let card = scheduler.newCard({ now: start, cardId: "card_1" })
    let now = start

    // Covers new, learning, review and relearning states.
    for (const rating of [3, 3, 1, 1, 3, 2, 4, 1, 3] as const) {
      // Persist and reload between reviews, the way D1 or HTTP would.
      const stored = JSON.parse(JSON.stringify(progress)) as CardProgress
      progress = applyRating(stored, rating, now).progress
      card = scheduler.review({ card, grade: rating, now }).card

      expect(progress).toEqual({
        cardId: "card_1",
        state: ["new", "learning", "review", "relearning"][card.state],
        due: card.dueAt.toISOString(),
        lastReview: card.lastReviewAt?.toISOString() ?? null,
        stability: card.stability,
        stabilityFast: card.stabilityFast,
        difficulty: card.difficulty,
        reps: card.reps,
        lapses: card.lapses,
        learningStep: card.learningStep,
        scheduledDays: card.scheduledDays,
      })
      now = new Date(card.dueAt.getTime() + hour)
    }
  })

  it("moves a forgotten review card to relearning and counts a lapse", () => {
    const { progress, now } = study([3, 3])
    expect(progress.state).toBe("review")

    const next = applyRating(progress, 1, now).progress
    expect(next.state).toBe("relearning")
    expect(next.lapses).toBe(progress.lapses + 1)
    expect(next.reps).toBe(progress.reps + 1)
  })

  it("logs the card as it was before the review", () => {
    const { progress, now } = study([3, 3])
    const { log } = applyRating(progress, 4, now)

    expect(log).toEqual({
      cardId: "card_1",
      rating: 4,
      reviewedAt: now.toISOString(),
      state: progress.state,
      due: progress.due,
      lastReview: progress.lastReview,
      stability: progress.stability,
      stabilityFast: progress.stabilityFast,
      difficulty: progress.difficulty,
      learningStep: progress.learningStep,
      scheduledDays: progress.scheduledDays,
    })
  })

  it("never changes its input and gives the same answer every time", () => {
    const { progress, now } = study([3])
    const frozen = Object.freeze({ ...progress })

    const first = applyRating(frozen, 3, now)
    expect(applyRating(frozen, 3, now)).toEqual(first)
    expect(frozen).toEqual(progress)
  })

  it("treats a review dated before the last one as happening at the last one", () => {
    const { progress } = study([3, 3])
    const lastReview = new Date(progress.lastReview ?? "")
    const skewed = new Date(lastReview.getTime() - 24 * hour)

    expect(applyRating(progress, 3, skewed)).toEqual(
      applyRating(progress, 3, lastReview)
    )
  })

  it("rejects an invalid date or stored timestamp", () => {
    const progress = createProgress("card_1", start)
    expect(() => applyRating(progress, 3, new Date("nope"))).toThrow(RangeError)
    expect(() =>
      applyRating({ ...progress, due: "yesterday-ish" }, 3, start)
    ).toThrow(RangeError)
  })
})

describe("previewDue", () => {
  it("shows the due date each rating would give, latest for the easiest", () => {
    const { progress, now } = study([3, 3])
    const due = previewDue(progress, now)

    for (const rating of [1, 2, 3, 4] as const) {
      expect(due[rating]).toBe(applyRating(progress, rating, now).progress.due)
    }
    expect(due[1] <= due[2] && due[2] <= due[3] && due[3] <= due[4]).toBe(true)
  })
})

describe("isDue", () => {
  it("is due from its due time onward", () => {
    const { progress } = study([3])
    const due = new Date(progress.due).getTime()

    expect(isDue(progress, new Date(due - 1))).toBe(false)
    expect(isDue(progress, new Date(due))).toBe(true)
    expect(isDue(progress, new Date(due + hour))).toBe(true)
  })
})

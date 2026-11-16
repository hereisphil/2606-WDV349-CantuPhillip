import { describe, expect, it } from "vitest"
import { evaluateAnswer } from "../answer/evaluate"
import {
  applyOutcome,
  outcomeChoices,
  previewOutcomeDue,
  type ReviewOutcome,
} from "./outcome"
import { applyRating, createProgress, previewDue } from "./progress"

const start = new Date("2026-11-10T15:00:00.000Z")

/** A card that has been reviewed twice and is in the review state. */
function reviewedCard(): {
  progress: ReturnType<typeof createProgress>
  now: Date
} {
  let progress = createProgress("card_1", start)
  for (let i = 0; i < 2; i += 1) {
    progress = applyRating(progress, 3, new Date(progress.due)).progress
  }
  return { progress, now: new Date(progress.due) }
}

describe("outcomeChoices", () => {
  it("offers got it or easy for an exact answer", () => {
    expect(outcomeChoices(evaluateAnswer("gato", "gato"))).toEqual([
      "got_it",
      "easy",
    ])
  })

  it("asks typo or struggle for a near answer", () => {
    expect(outcomeChoices(evaluateAnswer("año", "ano"))).toEqual([
      "got_it",
      "tough",
    ])
    expect(outcomeChoices(evaluateAnswer("manzana", "manzanna"))).toEqual([
      "got_it",
      "tough",
    ])
  })

  it("only allows missed for a wrong answer", () => {
    expect(outcomeChoices(evaluateAnswer("perro", "gato"))).toEqual(["missed"])
  })

  it("lets the learner judge a revealed card from all four, worst first", () => {
    expect(outcomeChoices(null)).toEqual(["missed", "tough", "got_it", "easy"])
  })
})

describe("applyOutcome", () => {
  it.each([
    ["missed", 1],
    ["tough", 2],
    ["got_it", 3],
    ["easy", 4],
  ] as const)("schedules %s like FSRS rating %i", (outcome, rating) => {
    const { progress, now } = reviewedCard()
    const viaOutcome = applyOutcome(progress, outcome, now)
    const viaRating = applyRating(progress, rating, now)

    expect(viaOutcome.progress).toEqual(viaRating.progress)
    expect(viaOutcome.log).toEqual({ ...viaRating.log, outcome })
  })

  it("sends a missed card back to relearning", () => {
    const { progress, now } = reviewedCard()
    expect(applyOutcome(progress, "missed", now).progress.state).toBe(
      "relearning"
    )
  })
})

describe("previewOutcomeDue", () => {
  it("keys each due date by outcome, later for better outcomes", () => {
    const { progress, now } = reviewedCard()
    const byOutcome = previewOutcomeDue(progress, now)
    const byRating = previewDue(progress, now)

    expect(byOutcome).toEqual({
      missed: byRating[1],
      tough: byRating[2],
      got_it: byRating[3],
      easy: byRating[4],
    })
    const order: ReviewOutcome[] = ["missed", "tough", "got_it", "easy"]
    const dates = order.map((outcome) => byOutcome[outcome])
    expect([...dates].sort()).toEqual(dates)
  })
})

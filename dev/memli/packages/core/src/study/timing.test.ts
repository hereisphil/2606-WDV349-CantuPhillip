import { describe, expect, it } from "vitest"
import { evaluateAnswer } from "../answer/evaluate"
import { applyOutcome } from "../srs/outcome"
import { createProgress } from "../srs/progress"
import { MAX_INFORMATIVE_MS, capElapsedMs, suggestOutcome } from "./timing"

const start = new Date("2026-11-10T15:00:00.000Z")
const newCard = createProgress("card_1", start)
const seenCard = applyOutcome(newCard, "got_it", start).progress

// "gato" is 4 characters: quick up to 2000 + 4 × 300 = 3200 ms, slow from 6400 ms.
const exact = evaluateAnswer("gato", "gato")
const near = evaluateAnswer("gato", "gaot")

describe("capElapsedMs", () => {
  it("keeps a normal response time", () => {
    expect(capElapsedMs(0)).toBe(0)
    expect(capElapsedMs(4_250)).toBe(4_250)
  })

  it("caps a long gap so a break can't skew anything", () => {
    expect(capElapsedMs(MAX_INFORMATIVE_MS + 1)).toBe(MAX_INFORMATIVE_MS)
    expect(capElapsedMs(10 * 60 * 1000)).toBe(MAX_INFORMATIVE_MS)
  })

  it("drops a broken measurement", () => {
    expect(capElapsedMs(-1)).toBeNull()
    expect(capElapsedMs(Number.NaN)).toBeNull()
    expect(capElapsedMs(Number.POSITIVE_INFINITY)).toBeNull()
  })
})

describe("suggestOutcome", () => {
  it("suggests easy for a quick exact answer on a card seen before", () => {
    expect(
      suggestOutcome({
        evaluation: exact,
        elapsedMs: 3_200,
        progress: seenCard,
      })
    ).toBe("easy")
  })

  it("never suggests easy on a card's first review", () => {
    expect(
      suggestOutcome({ evaluation: exact, elapsedMs: 1_000, progress: newCard })
    ).toBeNull()
  })

  it("gives no nudge for a slower exact answer, since got it is already the default", () => {
    expect(
      suggestOutcome({
        evaluation: exact,
        elapsedMs: 3_201,
        progress: seenCard,
      })
    ).toBeNull()
  })

  it("reads a quick near answer as a typo and a slow one as a struggle", () => {
    const at = (elapsedMs: number): ReturnType<typeof suggestOutcome> =>
      suggestOutcome({ evaluation: near, elapsedMs, progress: seenCard })

    expect(at(3_200)).toBe("got_it")
    expect(at(5_000)).toBeNull() // in between: no guess
    expect(at(6_400)).toBe("tough")
  })

  it("allows more time for a longer answer", () => {
    const long = evaluateAnswer("la biblioteca", "la biblioteca")
    // 13 characters: quick up to 2000 + 13 × 300 = 5900 ms.
    expect(
      suggestOutcome({ evaluation: long, elapsedMs: 5_900, progress: seenCard })
    ).toBe("easy")
  })

  it("gives no nudge when the time can't be trusted", () => {
    for (const elapsedMs of [null, MAX_INFORMATIVE_MS]) {
      expect(
        suggestOutcome({ evaluation: near, elapsedMs, progress: seenCard })
      ).toBeNull()
    }
  })

  it("gives no nudge for a wrong or reveal-only answer", () => {
    for (const evaluation of [evaluateAnswer("perro", "gato"), null]) {
      expect(
        suggestOutcome({ evaluation, elapsedMs: 500, progress: seenCard })
      ).toBeNull()
    }
  })
})

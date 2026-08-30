import { describe, expect, it } from "vitest"
import { createInitialCardProgress, gradeCard } from "./grade-card"

describe("gradeCard (SM-2)", () => {
  it("schedules first successful review in 1 day", () => {
    const next = gradeCard(createInitialCardProgress(), "pass")

    expect(next).toEqual({
      intervalDays: 1,
      easeFactor: 2.5,
      repetitions: 1,
    })
  })

  it("schedules second successful review in 6 days", () => {
    const afterFirstPass = gradeCard(createInitialCardProgress(), "pass")
    const next = gradeCard(afterFirstPass, "pass")

    expect(next.intervalDays).toBe(6)
    expect(next.repetitions).toBe(2)
  })

  it("resets interval and repetitions on fail", () => {
    const learned = {
      intervalDays: 15,
      easeFactor: 2.36,
      repetitions: 3,
    }

    const next = gradeCard(learned, "fail")

    expect(next.intervalDays).toBe(1)
    expect(next.repetitions).toBe(0)
    expect(next.easeFactor).toBeLessThan(learned.easeFactor)
    expect(next.easeFactor).toBeGreaterThanOrEqual(1.3)
  })

  it("grows interval from the third successful review onward", () => {
    let progress = createInitialCardProgress()
    progress = gradeCard(progress, "pass")
    progress = gradeCard(progress, "pass")
    const next = gradeCard(progress, "pass")

    expect(next.intervalDays).toBe(Math.round(6 * next.easeFactor))
    expect(next.repetitions).toBe(3)
  })
})

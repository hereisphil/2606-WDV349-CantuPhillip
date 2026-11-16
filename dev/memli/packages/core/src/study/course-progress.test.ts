import { describe, expect, it } from "vitest"
import { applyOutcome, type ReviewOutcome } from "../srs/outcome"
import { createProgress, type CardProgress } from "../srs/progress"
import {
  DAILY_NEW_CARD_LIMIT,
  MASTERED_STABILITY_DAYS,
  TRICKY_LAPSES,
  isMastered,
  isSeen,
  isTricky,
  sessionCards,
  summarizeCourseProgress,
  type StudyMode,
} from "./course-progress"

const start = new Date("2026-11-10T15:00:00.000Z")
const day = 24 * 60 * 60 * 1000

function later(days: number): Date {
  return new Date(start.getTime() + days * day)
}

function fresh(cardId: string): CardProgress {
  return createProgress(cardId, start)
}

/** A card reviewed once, at `start`. */
function reviewed(cardId: string, outcome: ReviewOutcome): CardProgress {
  return applyOutcome(fresh(cardId), outcome, start).progress
}

/** A card in the review state with the numbers a test cares about. */
function settled(
  cardId: string,
  overrides: Partial<CardProgress> = {}
): CardProgress {
  return {
    ...reviewed(cardId, "got_it"),
    state: "review",
    stability: 5,
    due: later(5).toISOString(),
    ...overrides,
  }
}

describe("isSeen", () => {
  it("is false until the first review", () => {
    expect(isSeen(fresh("a"))).toBe(false)
    expect(isSeen(reviewed("a", "missed"))).toBe(true)
  })
})

describe("isMastered", () => {
  it("needs three weeks of stability in the review state", () => {
    const stable = { stability: MASTERED_STABILITY_DAYS }

    expect(isMastered(settled("a", stable))).toBe(true)
    expect(isMastered(settled("a", { stability: 20.9 }))).toBe(false)
    expect(isMastered(settled("a", { ...stable, state: "relearning" }))).toBe(
      false
    )
  })
})

describe("isTricky", () => {
  it("is a word forgotten a few times", () => {
    expect(isTricky(settled("a", { lapses: TRICKY_LAPSES - 1 }))).toBe(false)
    expect(isTricky(settled("a", { lapses: TRICKY_LAPSES }))).toBe(true)
  })

  it("stops once the word is mastered", () => {
    const mastered = settled("a", {
      lapses: TRICKY_LAPSES + 4,
      stability: MASTERED_STABILITY_DAYS,
    })

    expect(isTricky(mastered)).toBe(false)
  })
})

describe("summarizeCourseProgress", () => {
  it("treats a course nobody has studied as all unseen", () => {
    expect(summarizeCourseProgress(5, [], start)).toEqual({
      dueCount: 0,
      newAvailable: 5,
      masteredCount: 0,
      learningCount: 0,
      unseenCount: 5,
      trickyCount: 0,
      lastReviewedAt: null,
    })
  })

  it("offers no more new cards than the daily limit", () => {
    const { newAvailable, unseenCount } = summarizeCourseProgress(
      1000,
      [],
      start
    )

    expect([newAvailable, unseenCount]).toEqual([DAILY_NEW_CARD_LIMIT, 1000])
  })

  it("splits the course into mastered, learning and unseen", () => {
    const progress = [
      settled("a", { stability: 40 }),
      settled("b"),
      reviewed("c", "missed"),
    ]

    const summary = summarizeCourseProgress(10, progress, start)

    expect(summary).toMatchObject({
      masteredCount: 1,
      learningCount: 2,
      unseenCount: 7,
    })
    expect(
      summary.masteredCount + summary.learningCount + summary.unseenCount
    ).toBe(10)
  })

  it("counts a card as due only once its time has come", () => {
    const progress = [settled("a", { due: later(2).toISOString() })]

    expect(summarizeCourseProgress(1, progress, later(1)).dueCount).toBe(0)
    expect(summarizeCourseProgress(1, progress, later(2)).dueCount).toBe(1)
  })

  it("reports the latest review in the course", () => {
    const progress = [
      settled("a", { lastReview: later(1).toISOString() }),
      settled("b", { lastReview: later(3).toISOString() }),
      settled("c", { lastReview: later(2).toISOString() }),
    ]

    expect(summarizeCourseProgress(3, progress, later(4)).lastReviewedAt).toBe(
      later(3).toISOString()
    )
  })

  it("ignores saved progress for a card that was never reviewed", () => {
    expect(summarizeCourseProgress(2, [fresh("a")], start)).toMatchObject({
      dueCount: 0,
      learningCount: 0,
      unseenCount: 2,
    })
  })
})

describe("sessionCards", () => {
  const course = [
    { progress: settled("due-yesterday", { due: later(-1).toISOString() }) },
    { progress: fresh("new-1") },
    { progress: settled("due-last-week", { due: later(-7).toISOString() }) },
    { progress: settled("not-due", { due: later(3).toISOString() }) },
    { progress: fresh("new-2") },
    { progress: settled("slips", { lapses: 3 }) },
    { progress: settled("slips-most", { lapses: 6 }) },
  ]
  const ids = (mode: StudyMode, extra?: number): string[] =>
    sessionCards(course, mode, { now: start, extra }).map(
      ({ progress }) => progress.cardId
    )

  it("review holds what is due, most overdue first, and nothing new", () => {
    expect(ids("review")).toEqual(["due-last-week", "due-yesterday"])
  })

  it("learn holds unseen cards in course order", () => {
    expect(ids("learn")).toEqual(["new-1", "new-2"])
  })

  it("practice holds tricky cards, most forgotten first", () => {
    expect(ids("practice")).toEqual(["slips-most", "slips"])
  })

  it("learn stops at the daily limit unless the learner asks for more", () => {
    const big = Array.from({ length: 30 }, (_, index) => ({
      progress: fresh(`new-${String(index)}`),
    }))
    const size = (extra?: number): number =>
      sessionCards(big, "learn", { now: start, extra }).length

    expect(size()).toBe(DAILY_NEW_CARD_LIMIT)
    expect(size(5)).toBe(DAILY_NEW_CARD_LIMIT + 5)
    expect(size(500)).toBe(30)
  })

  it("only learn uses `extra`", () => {
    expect(ids("review", 10)).toEqual(ids("review"))
    expect(ids("practice", 10)).toEqual(ids("practice"))
  })

  it("holds exactly what the summary counts", () => {
    const summary = summarizeCourseProgress(
      course.length,
      course.map(({ progress }) => progress),
      start
    )

    expect(ids("review")).toHaveLength(summary.dueCount)
    expect(ids("learn")).toHaveLength(summary.newAvailable)
    expect(ids("practice")).toHaveLength(summary.trickyCount)
  })

  it("leaves the course it was given untouched", () => {
    const before = course.map(({ progress }) => progress.cardId)
    ids("review")

    expect(course.map(({ progress }) => progress.cardId)).toEqual(before)
  })
})

describe("words already started today", () => {
  const unseen = Array.from({ length: 30 }, (_, index) => ({
    progress: fresh(`new-${String(index)}`),
  }))

  it("leave less of the daily limit, in the count and the session alike", () => {
    const summary = summarizeCourseProgress(30, [], start, 7)
    const session = sessionCards(unseen, "learn", {
      now: start,
      newStartedToday: 7,
    })

    expect(summary.newAvailable).toBe(DAILY_NEW_CARD_LIMIT - 7)
    expect(session).toHaveLength(summary.newAvailable)
  })

  it("leave none once the limit is used up, though the learner can ask for more", () => {
    expect(summarizeCourseProgress(30, [], start, 12).newAvailable).toBe(0)
    expect(
      sessionCards(unseen, "learn", { now: start, newStartedToday: 12 })
    ).toHaveLength(0)
    expect(
      sessionCards(unseen, "learn", {
        now: start,
        newStartedToday: 12,
        extra: 5,
      })
    ).toHaveLength(5)
  })
})

import { describe, expect, it } from "vitest"
import {
  DAILY_GOAL_WORDS,
  daysOfStudy,
  localDate,
  newWordsStartedOn,
  shiftDate,
  summarizeHistory,
  type HistoryReview,
} from "./history"

describe("localDate", () => {
  // 03:30 UTC on 15 November is still the 14th in Mexico City (UTC-6).
  const instant = new Date("2026-11-15T03:30:00.000Z")

  it("is the calendar date where the learner is", () => {
    expect(localDate(instant, "UTC")).toBe("2026-11-15")
    expect(localDate(instant, "America/Mexico_City")).toBe("2026-11-14")
    expect(localDate(instant, "Asia/Tokyo")).toBe("2026-11-15")
  })

  it("handles zones with half-hour offsets", () => {
    // India is UTC+5:30: 18:29 UTC is 23:59 local, 18:30 is the next day.
    expect(localDate(new Date("2026-11-14T18:29:00Z"), "Asia/Kolkata")).toBe(
      "2026-11-14"
    )
    expect(localDate(new Date("2026-11-14T18:30:00Z"), "Asia/Kolkata")).toBe(
      "2026-11-15"
    )
  })
})

describe("shiftDate", () => {
  it("crosses months, years and leap days", () => {
    expect(shiftDate("2026-11-30", 1)).toBe("2026-12-01")
    expect(shiftDate("2027-01-01", -1)).toBe("2026-12-31")
    expect(shiftDate("2028-03-01", -1)).toBe("2028-02-29")
  })
})

describe("daysOfStudy (REDESIGN.md 5.7)", () => {
  const today = "2026-11-15"
  const days = (...ago: number[]): string[] =>
    ago.map((n) => shiftDate(today, -n))

  it("is zero with no study", () => {
    expect(daysOfStudy([], today)).toBe(0)
  })

  it("counts any day with study, today included", () => {
    expect(daysOfStudy(days(0, 1, 2), today)).toBe(3)
  })

  it("never treats today as a miss before it ends", () => {
    expect(daysOfStudy(days(1, 2, 3), today)).toBe(3)
  })

  it("forgives one day off, and does not count it", () => {
    expect(daysOfStudy(days(0, 2, 3), today)).toBe(3)
    expect(daysOfStudy(days(0, 2, 4, 6), today)).toBe(4)
  })

  it("ends at two days off in a row", () => {
    expect(daysOfStudy(days(0, 1, 4, 5, 6), today)).toBe(2)
  })

  it("ends when yesterday and the day before were both off", () => {
    expect(daysOfStudy(days(3, 4), today)).toBe(0)
  })

  it("forgives yesterday while today is still open", () => {
    expect(daysOfStudy(days(2, 3), today)).toBe(2)
  })

  it("does not care about order or repeats", () => {
    expect(daysOfStudy([...days(2, 0, 1), ...days(1)], today)).toBe(3)
  })
})

describe("newWordsStartedOn", () => {
  it("counts first sightings today, by course, once per word", () => {
    const review = (
      cardId: string,
      courseId: string,
      reviewedAt: string,
      priorState: HistoryReview["priorState"] = "new"
    ): HistoryReview & { courseId: string } => ({
      cardId,
      courseId,
      reviewedAt,
      outcome: "got_it",
      priorState,
    })

    const started = newWordsStartedOn(
      [
        review("es-1", "es", "2026-11-15T15:00:00Z"),
        review("es-1", "es", "2026-11-15T15:05:00Z", "learning"),
        review("es-2", "es", "2026-11-15T16:00:00Z"),
        review("fr-1", "fr", "2026-11-15T17:00:00Z"),
        // Yesterday in Mexico City, though the 15th in UTC.
        review("es-3", "es", "2026-11-15T03:00:00Z"),
      ],
      "2026-11-15",
      "America/Mexico_City"
    )

    expect(Object.fromEntries(started)).toEqual({ es: 2, fr: 1 })
  })
})

describe("summarizeHistory", () => {
  const now = new Date("2026-11-15T18:00:00.000Z")
  const timeZone = "America/Mexico_City"
  const review = (
    cardId: string,
    reviewedAt: string,
    outcome: HistoryReview["outcome"] = "got_it",
    priorState: HistoryReview["priorState"] = "review"
  ): HistoryReview => ({ cardId, reviewedAt, outcome, priorState })

  it("starts empty for a new learner", () => {
    expect(
      summarizeHistory({ reviews: [], studyDates: [], now, timeZone })
    ).toEqual({
      dailyGoal: DAILY_GOAL_WORDS,
      days: [
        { date: "2026-11-09", wordsStudied: 0 },
        { date: "2026-11-10", wordsStudied: 0 },
        { date: "2026-11-11", wordsStudied: 0 },
        { date: "2026-11-12", wordsStudied: 0 },
        { date: "2026-11-13", wordsStudied: 0 },
        { date: "2026-11-14", wordsStudied: 0 },
        { date: "2026-11-15", wordsStudied: 0 },
      ],
      daysOfStudy: 0,
      retentionPercent: null,
      newWordsThisMonth: 0,
    })
  })

  it("counts different words per local day, a repeat once", () => {
    const { days } = summarizeHistory({
      reviews: [
        review("a", "2026-11-15T16:00:00Z", "missed"),
        review("a", "2026-11-15T16:05:00Z"),
        review("b", "2026-11-15T16:10:00Z"),
        // 02:00 UTC on the 15th is 20:00 on the 14th in Mexico City.
        review("c", "2026-11-15T02:00:00Z"),
        // Before the week: left out.
        review("d", "2026-11-01T16:00:00Z"),
      ],
      studyDates: [],
      now,
      timeZone,
    })

    expect(days.at(-1)).toEqual({ date: "2026-11-15", wordsStudied: 2 })
    expect(days.at(-2)).toEqual({ date: "2026-11-14", wordsStudied: 1 })
    expect(days.reduce((sum, day) => sum + day.wordsStudied, 0)).toBe(3)
  })

  it("measures memory only on words already met, over the last 30 days", () => {
    const { retentionPercent } = summarizeHistory({
      reviews: [
        review("a", "2026-11-14T16:00:00Z", "got_it"),
        review("b", "2026-11-13T16:00:00Z", "tough"),
        review("c", "2026-11-12T16:00:00Z", "missed"),
        review("d", "2026-11-11T16:00:00Z", "easy"),
        // A first sighting, missed: not a test of memory.
        review("e", "2026-11-15T16:00:00Z", "missed", "new"),
        // Older than 30 days: left out.
        review("f", "2026-10-01T16:00:00Z", "missed"),
      ],
      studyDates: [],
      now,
      timeZone,
    })

    expect(retentionPercent).toBe(75)
  })

  it("counts words met for the first time this local month", () => {
    const { newWordsThisMonth } = summarizeHistory({
      reviews: [
        review("a", "2026-11-02T16:00:00Z", "got_it", "new"),
        review("b", "2026-11-10T16:00:00Z", "missed", "new"),
        review("b", "2026-11-10T16:01:00Z", "got_it", "learning"),
        // 1 November, 03:00 UTC is still 31 October in Mexico City.
        review("c", "2026-11-01T03:00:00Z", "got_it", "new"),
      ],
      studyDates: [],
      now,
      timeZone,
    })

    expect(newWordsThisMonth).toBe(2)
  })

  it("passes the study dates to days of study, from the local today", () => {
    const { daysOfStudy: count } = summarizeHistory({
      reviews: [],
      studyDates: ["2026-11-15", "2026-11-14", "2026-11-12"],
      now,
      timeZone,
    })

    expect(count).toBe(3)
  })
})

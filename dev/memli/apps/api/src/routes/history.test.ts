import { DAILY_GOAL_WORDS, localDate } from "@workspace/core/study/history"
import { apiErrorSchema } from "@workspace/schemas/api/error"
import {
  studyHistorySchema,
  type StudyHistoryData,
} from "@workspace/schemas/api/history"
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest"

import { studyQuarterHours } from "../db/reviews"
import {
  VIEWER_ID,
  addPublishedCourse,
  addReviewLog,
  addUsers,
  startTestApi,
  type TestApi,
} from "../db/test-d1"

// 18:00 UTC on Sunday 15 November is noon in Mexico City (UTC-6).
const now = new Date("2026-11-15T18:00:00.000Z")
const mexico = "America/Mexico_City"

let api: TestApi

beforeAll(async () => {
  api = await startTestApi()
})

afterAll(async () => {
  await api.stop()
})

beforeEach(async () => {
  vi.useFakeTimers({ toFake: ["Date"], now })
  await api.reset()
  await addUsers(api.db)
  await addPublishedCourse(api.db, "spanish", 20)
})

afterEach(() => {
  vi.useRealTimers()
})

async function history(timeZone = mexico): Promise<StudyHistoryData> {
  const res = await api.request(
    `/api/history?timeZone=${encodeURIComponent(timeZone)}`
  )
  expect(res.status).toBe(200)
  return studyHistorySchema.parse(await res.json())
}

describe("GET /api/history", () => {
  it("is empty for a learner who has not studied", async () => {
    const result = await history()

    expect(result).toMatchObject({
      dailyGoal: DAILY_GOAL_WORDS,
      daysOfStudy: 0,
      retentionPercent: null,
      newWordsThisMonth: 0,
    })
    expect(result.days.map((day) => day.date)).toEqual([
      "2026-11-09",
      "2026-11-10",
      "2026-11-11",
      "2026-11-12",
      "2026-11-13",
      "2026-11-14",
      "2026-11-15",
    ])
    expect(result.days.every((day) => day.wordsStudied === 0)).toBe(true)
  })

  it("reflects reviews saved through POST /api/reviews", async () => {
    const res = await api.request("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        reviews: ["spanish-1", "spanish-2", "spanish-1"].map((cardId) => ({
          reviewId: crypto.randomUUID(),
          cardId,
          outcome: "got_it",
          reviewedAt: now.toISOString(),
          durationMs: 1_000,
        })),
      }),
    })
    expect(res.status).toBe(200)

    const result = await history()

    expect(result.days.at(-1)).toEqual({ date: "2026-11-15", wordsStudied: 2 })
    expect(result).toMatchObject({ daysOfStudy: 1, newWordsThisMonth: 2 })
    // The third review tested spanish-1 again, and it was remembered.
    expect(result.retentionPercent).toBe(100)
  })

  it("puts each review on the learner's own calendar day", async () => {
    // 03:00 UTC on the 15th is 21:00 on the 14th in Mexico City.
    await addReviewLog(api.db, [
      { cardId: "spanish-1", at: "2026-11-15T03:00:00Z" },
    ])

    const inMexico = await history(mexico)
    const inUtc = await history("UTC")

    expect(inMexico.days.at(-2)).toEqual({
      date: "2026-11-14",
      wordsStudied: 1,
    })
    expect(inMexico.days.at(-1)?.wordsStudied).toBe(0)
    expect(inUtc.days.at(-1)).toEqual({ date: "2026-11-15", wordsStudied: 1 })
  })

  it("counts days of study with one day off forgiven, however far back", async () => {
    // Studied today, the 13th and the 12th, then 30 days in a row in
    // October, with two days off between them: only 3 count.
    const october = Array.from({ length: 30 }, (_, index) => ({
      cardId: "spanish-1",
      at: `2026-10-${String(index + 1).padStart(2, "0")}T18:00:00Z`,
    }))
    await addReviewLog(api.db, [
      { cardId: "spanish-1", at: "2026-11-15T17:00:00Z" },
      { cardId: "spanish-2", at: "2026-11-13T17:00:00Z" },
      { cardId: "spanish-3", at: "2026-11-12T17:00:00Z" },
      // The 10th and 11th were off: the count stops here.
      { cardId: "spanish-4", at: "2026-11-09T17:00:00Z" },
      ...october,
    ])

    expect((await history()).daysOfStudy).toBe(3)
  })

  it("keeps a long run of study days, with single days off forgiven", async () => {
    // Every other day for 60 days: 30 study days, none of the gaps double.
    const everyOtherDay = Array.from({ length: 30 }, (_, index) => ({
      cardId: "spanish-1",
      at: new Date(now.getTime() - index * 2 * 86_400_000).toISOString(),
    }))
    await addReviewLog(api.db, everyOtherDay)

    expect((await history()).daysOfStudy).toBe(30)
  })

  it("measures memory on words already met, not first sightings", async () => {
    await addReviewLog(api.db, [
      { cardId: "spanish-1", at: "2026-11-14T17:00:00Z", outcome: "got_it" },
      { cardId: "spanish-2", at: "2026-11-14T17:01:00Z", outcome: "missed" },
      { cardId: "spanish-3", at: "2026-11-14T17:02:00Z", outcome: "easy" },
      { cardId: "spanish-4", at: "2026-11-14T17:03:00Z", outcome: "tough" },
      {
        cardId: "spanish-5",
        at: "2026-11-14T17:04:00Z",
        outcome: "missed",
        priorState: "new",
      },
    ])

    expect((await history()).retentionPercent).toBe(75)
  })

  it("counts new words in the learner's calendar month", async () => {
    await addReviewLog(api.db, [
      { cardId: "spanish-1", at: "2026-11-02T17:00:00Z", priorState: "new" },
      { cardId: "spanish-2", at: "2026-11-14T17:00:00Z", priorState: "new" },
      // 1 November 03:00 UTC is still October in Mexico City.
      { cardId: "spanish-3", at: "2026-11-01T03:00:00Z", priorState: "new" },
      { cardId: "spanish-4", at: "2026-10-20T17:00:00Z", priorState: "new" },
    ])

    expect((await history(mexico)).newWordsThisMonth).toBe(2)
    expect((await history("UTC")).newWordsThisMonth).toBe(3)
  })

  it.each(["Mars/Olympus_Mons", ""])(
    "answers INVALID_REQUEST for timeZone=%j",
    async (timeZone) => {
      const res = await api.request(`/api/history?timeZone=${timeZone}`)

      expect(res.status).toBe(400)
      expect(apiErrorSchema.parse(await res.json())).toEqual({
        error: { code: "INVALID_REQUEST" },
      })
    }
  )

  it("uses UTC when no time zone is given", async () => {
    await addReviewLog(api.db, [
      { cardId: "spanish-1", at: "2026-11-15T03:00:00Z" },
    ])

    const res = await api.request("/api/history")
    const result = studyHistorySchema.parse(await res.json())

    expect(result.days.at(-1)).toEqual({ date: "2026-11-15", wordsStudied: 1 })
  })
})

describe("study days from quarter hours", () => {
  it("keep half-hour time zones on the right date", async () => {
    // India is UTC+5:30: 18:40 UTC is 00:10 the next day, 18:20 is 23:50.
    // An hour-long bucket would put both at 23:30 local, the same day.
    await addReviewLog(api.db, [
      { cardId: "spanish-1", at: "2026-11-14T18:40:00Z" },
      { cardId: "spanish-2", at: "2026-11-13T18:20:00Z" },
    ])

    const dates = (await studyQuarterHours(api.db, VIEWER_ID)).map((instant) =>
      localDate(instant, "Asia/Kolkata")
    )

    expect(dates).toEqual(["2026-11-15", "2026-11-13"])
  })

  it("list each quarter hour once, newest first", async () => {
    await addReviewLog(api.db, [
      { cardId: "spanish-1", at: "2026-11-14T10:01:00Z" },
      { cardId: "spanish-2", at: "2026-11-14T10:14:00Z" },
      { cardId: "spanish-3", at: "2026-11-14T10:16:00Z" },
    ])

    const instants = await studyQuarterHours(api.db, VIEWER_ID)

    expect(instants.map((instant) => instant.toISOString())).toEqual([
      "2026-11-14T10:15:00.000Z",
      "2026-11-14T10:00:00.000Z",
    ])
  })
})

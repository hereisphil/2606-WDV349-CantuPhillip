import { applyOutcome } from "@workspace/core/srs/outcome"
import { createProgress } from "@workspace/core/srs/progress"
import { coursesResponseSchema } from "@workspace/schemas/api/courses"
import { apiErrorSchema } from "@workspace/schemas/api/error"
import { studySessionSchema } from "@workspace/schemas/api/study"
import {
  submitReviewsResponseSchema,
  type ReviewSubmission,
} from "@workspace/schemas/srs/review"
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

import { progressFromRow } from "../db/progress"
import { userProgress } from "../db/schema"
import {
  VIEWER_ID,
  addCourse,
  addUsers,
  startTestApi,
  type TestApi,
} from "../db/test-d1"

const now = new Date("2026-11-14T20:00:00.000Z")
const minute = 60_000

let api: TestApi

beforeAll(async () => {
  api = await startTestApi()
})

afterAll(async () => {
  await api.stop()
})

beforeEach(async () => {
  // Only `Date` is faked: the server's clock is what this route reads.
  vi.useFakeTimers({ toFake: ["Date"], now })
  await api.reset()
  await addUsers(api.db)
})

afterEach(() => {
  vi.useRealTimers()
})

function review(
  cardId: string,
  outcome: ReviewSubmission["outcome"] = "got_it",
  reviewedAt: Date = now
): ReviewSubmission {
  return {
    cardId,
    outcome,
    reviewedAt: reviewedAt.toISOString(),
    durationMs: 4_000,
  }
}

function post(body: unknown): Promise<Response> {
  return api.request("/api/reviews", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: typeof body === "string" ? body : JSON.stringify(body),
  })
}

async function submit(
  reviews: ReviewSubmission[]
): Promise<ReturnType<typeof submitReviewsResponseSchema.parse>["progress"]> {
  const res = await post({ reviews })
  expect(res.status).toBe(200)
  return submitReviewsResponseSchema.parse(await res.json()).progress
}

async function savedRows(): Promise<(typeof userProgress.$inferSelect)[]> {
  return api.db.select().from(userProgress)
}

describe("POST /api/reviews", () => {
  it("schedules a new card with core and saves it for the viewer", async () => {
    await addCourse(api.db, "spanish", 2)
    const expected = applyOutcome(
      createProgress("spanish-1", now),
      "got_it",
      now
    ).progress

    const progress = await submit([review("spanish-1")])

    expect(progress).toEqual([expected])
    const rows = await savedRows()
    expect(rows.map(progressFromRow)).toEqual([expected])
    expect(rows[0]).toMatchObject({ userId: VIEWER_ID, updatedAt: now })
  })

  it("stamps the review with the server's clock, not the client's", async () => {
    await addCourse(api.db, "spanish", 1)
    const slowClock = new Date("2020-01-01T00:00:00.000Z")

    const [progress] = await submit([review("spanish-1", "got_it", slowClock)])

    expect(progress?.lastReview).toBe(now.toISOString())
  })

  it("builds the next review on what was saved", async () => {
    await addCourse(api.db, "spanish", 1)
    const [first] = await submit([review("spanish-1")])
    if (first === undefined) throw new Error("No progress came back")
    const later = new Date(first.due)
    vi.setSystemTime(later)

    const [second] = await submit([review("spanish-1", "easy")])

    expect(second).toEqual(applyOutcome(first, "easy", later).progress)
    expect(second?.reps).toBe(2)
    expect(await savedRows()).toHaveLength(1)
  })

  it("applies a missed word's two reviews in order, minutes apart", async () => {
    await addCourse(api.db, "spanish", 2)
    const earlier = new Date(now.getTime() - 5 * minute)
    const missed = applyOutcome(
      createProgress("spanish-1", earlier),
      "missed",
      earlier
    ).progress

    const progress = await submit([
      review("spanish-1", "missed", earlier),
      review("spanish-2", "easy", new Date(now.getTime() - 2 * minute)),
      review("spanish-1", "got_it", now),
    ])

    expect(progress.map((card) => card.cardId)).toEqual([
      "spanish-1",
      "spanish-2",
    ])
    expect(progress[0]).toEqual(applyOutcome(missed, "got_it", now).progress)
    expect(await savedRows()).toHaveLength(2)
  })

  it("refuses the whole request when one card does not exist", async () => {
    await addCourse(api.db, "spanish", 1)

    const res = await post({
      reviews: [review("spanish-1"), review("spanish-999")],
    })

    expect(res.status).toBe(404)
    expect(apiErrorSchema.parse(await res.json())).toEqual({
      error: { code: "NOT_FOUND" },
    })
    expect(await savedRows()).toEqual([])
  })

  it.each([
    ["a body that is not JSON", "reviews=1"],
    ["no reviews", { reviews: [] }],
    [
      "an outcome core does not know",
      { reviews: [{ ...review("a"), outcome: "good" }] },
    ],
    ["a raw FSRS rating", { reviews: [{ ...review("a"), outcome: 3 }] }],
    [
      "a time that is not ISO 8601",
      { reviews: [{ ...review("a"), reviewedAt: "yesterday" }] },
    ],
    ["a negative duration", { reviews: [{ ...review("a"), durationMs: -1 }] }],
  ])("answers INVALID_REQUEST for %s", async (_name, body) => {
    const res = await post(body)

    expect(res.status).toBe(400)
    expect(apiErrorSchema.parse(await res.json())).toEqual({
      error: { code: "INVALID_REQUEST" },
    })
    expect(await savedRows()).toEqual([])
  })

  it("saves a batch larger than D1 lets one query list", async () => {
    // D1 allows 100 bound values per statement; this request names 120 cards.
    const cardIds = await addCourse(api.db, "spanish", 120)

    const progress = await submit(cardIds.map((cardId) => review(cardId)))

    expect(progress.map((card) => card.cardId)).toEqual(cardIds)
    expect(await savedRows()).toHaveLength(120)
  })
})

describe("after a review", () => {
  async function spanish(): Promise<
    ReturnType<typeof coursesResponseSchema.parse>["courses"][number]
  > {
    const res = await api.request("/api/courses")
    const [course] = coursesResponseSchema.parse(await res.json()).courses
    if (course === undefined) throw new Error("No course came back")
    return course
  }

  it("the course list shows the progress, and the card comes due later", async () => {
    await addCourse(api.db, "spanish", 3)
    expect(await spanish()).toMatchObject({ unseenCount: 3, learningCount: 0 })

    const [progress] = await submit([review("spanish-1")])

    expect(await spanish()).toMatchObject({
      dueCount: 0,
      newAvailable: 2,
      learningCount: 1,
      unseenCount: 2,
      lastReviewedAt: now.toISOString(),
    })

    vi.setSystemTime(new Date(String(progress?.due)))

    expect(await spanish()).toMatchObject({ dueCount: 1 })
  })

  it("the card leaves the learn session and joins the review session when due", async () => {
    await addCourse(api.db, "spanish", 2)
    const [progress] = await submit([review("spanish-1")])
    const cardIds = async (mode: string): Promise<string[]> => {
      const res = await api.request(`/api/courses/spanish/study?mode=${mode}`)
      return studySessionSchema
        .parse(await res.json())
        .cards.map((card) => card.cardId)
    }

    expect(await cardIds("learn")).toEqual(["spanish-2"])
    expect(await cardIds("review")).toEqual([])

    vi.setSystemTime(new Date(String(progress?.due)))

    expect(await cardIds("review")).toEqual(["spanish-1"])
  })
})

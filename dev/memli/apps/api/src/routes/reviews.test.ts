import { applyOutcome } from "@workspace/core/srs/outcome"
import { createProgress } from "@workspace/core/srs/progress"
import { coursesResponseSchema } from "@workspace/schemas/api/courses"
import { apiErrorSchema } from "@workspace/schemas/api/error"
import { studySessionSchema } from "@workspace/schemas/api/study"
import {
  submitReviewsResponseSchema,
  type ReviewSubmission,
} from "@workspace/schemas/srs/review"
import { asc, eq } from "drizzle-orm"
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
import { saveReviews } from "../db/reviews"
import { enrollments, reviews as reviewLog, userProgress } from "../db/schema"
import { applyReviews } from "../lib/review-batch"
import {
  AUTHOR_ID,
  VIEWER_ID,
  addCourse,
  addEnrollment,
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
    reviewId: crypto.randomUUID(),
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

/** The review log, oldest first. */
async function loggedRows(): Promise<(typeof reviewLog.$inferSelect)[]> {
  return api.db.select().from(reviewLog).orderBy(asc(reviewLog.reviewedAt))
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
    // A new review of the same card, with its own id, does count.
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
    expect(await loggedRows()).toEqual([])
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
    [
      "a review id that is not a UUID",
      { reviews: [{ ...review("a"), reviewId: "1" }] },
    ],
    ["no review id", { reviews: [{ ...review("a"), reviewId: undefined }] }],
    [
      "a card id longer than any real one",
      { reviews: [{ ...review("a"), cardId: "c".repeat(65) }] },
    ],
  ])("answers INVALID_REQUEST for %s", async (_name, body) => {
    const res = await post(body)

    expect(res.status).toBe(400)
    expect(apiErrorSchema.parse(await res.json())).toEqual({
      error: { code: "INVALID_REQUEST" },
    })
    expect(await savedRows()).toEqual([])
  })

  it.each([
    ["no content type", undefined],
    ["plain text, as a cross-site form can send", "text/plain"],
    ["a form", "application/x-www-form-urlencoded"],
  ])(
    "answers INVALID_REQUEST for a JSON body sent as %s",
    async (_name, type) => {
      const [cardId = ""] = await addCourse(api.db, "spanish", 1)

      const res = await api.request("/api/reviews", {
        method: "POST",
        headers: type === undefined ? {} : { "Content-Type": type },
        body: JSON.stringify({ reviews: [review(cardId)] }),
      })

      expect(res.status).toBe(400)
      expect(apiErrorSchema.parse(await res.json())).toEqual({
        error: { code: "INVALID_REQUEST" },
      })
      expect(await savedRows()).toEqual([])
    }
  )

  it("accepts a JSON content type with a charset", async () => {
    const [cardId = ""] = await addCourse(api.db, "spanish", 1)

    const res = await api.request("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({ reviews: [review(cardId)] }),
    })

    expect(res.status).toBe(200)
  })

  it("saves a request larger than D1 lets one query list", async () => {
    // D1 allows 100 bound values per statement; this request names 120 cards
    // and 120 review ids, and saves 240 rows in one batch.
    const cardIds = await addCourse(api.db, "spanish", 120)

    const progress = await submit(cardIds.map((cardId) => review(cardId)))

    expect(progress.map((card) => card.cardId)).toEqual(cardIds)
    expect(await savedRows()).toHaveLength(120)
    expect(await loggedRows()).toHaveLength(120)
  })
})

describe("the review log", () => {
  it("keeps one row per review: the outcome, its rating, and the card before", async () => {
    await addCourse(api.db, "spanish", 1)
    const earlier = new Date(now.getTime() - 5 * minute)
    const missed = review("spanish-1", "missed", earlier)
    const gotIt = review("spanish-1", "got_it", now)
    const afterMiss = applyOutcome(
      createProgress("spanish-1", earlier),
      "missed",
      earlier
    ).progress

    await submit([missed, gotIt])

    expect(await loggedRows()).toEqual([
      {
        id: missed.reviewId,
        userId: VIEWER_ID,
        cardId: "spanish-1",
        outcome: "missed",
        rating: 1,
        reviewedAt: earlier,
        durationMs: 4_000,
        priorState: "new",
        priorDue: earlier,
        priorLastReview: null,
        priorStability: 0,
        priorStabilityFast: 0,
        priorDifficulty: 0,
        priorLearningStep: 0,
        priorScheduledDays: 0,
      },
      {
        id: gotIt.reviewId,
        userId: VIEWER_ID,
        cardId: "spanish-1",
        outcome: "got_it",
        rating: 3,
        reviewedAt: now,
        durationMs: 4_000,
        priorState: afterMiss.state,
        priorDue: new Date(afterMiss.due),
        priorLastReview: earlier,
        priorStability: afterMiss.stability,
        priorStabilityFast: afterMiss.stabilityFast,
        priorDifficulty: afterMiss.difficulty,
        priorLearningStep: afterMiss.learningStep,
        priorScheduledDays: afterMiss.scheduledDays,
      },
    ])
  })

  it("caps a response time the client did not cap", async () => {
    await addCourse(api.db, "spanish", 2)

    await submit([
      { ...review("spanish-1"), durationMs: 600_000 },
      { ...review("spanish-2"), durationMs: null },
    ])

    const durations = new Map(
      (await loggedRows()).map((row) => [row.cardId, row.durationMs])
    )
    expect(durations.get("spanish-1")).toBe(30_000)
    expect(durations.get("spanish-2")).toBeNull()
  })
})

describe("a request sent twice", () => {
  it("counts each review once and answers the same progress", async () => {
    await addCourse(api.db, "spanish", 1)
    const reviews = [review("spanish-1")]

    const first = await submit(reviews)
    vi.setSystemTime(new Date(now.getTime() + minute))
    const again = await submit(reviews)

    expect(again).toEqual(first)
    expect(again[0]?.reps).toBe(1)
    expect(await loggedRows()).toHaveLength(1)
    expect((await savedRows())[0]?.updatedAt).toEqual(now)
  })

  it("records only the reviews it has not seen", async () => {
    await addCourse(api.db, "spanish", 2)
    const sent = review("spanish-1")
    await submit([sent])

    const progress = await submit([sent, review("spanish-2", "easy")])

    expect(progress.map((card) => [card.cardId, card.reps])).toEqual([
      ["spanish-1", 1],
      ["spanish-2", 1],
    ])
    expect(await loggedRows()).toHaveLength(2)
  })

  it("saves nothing when two copies race and the second reaches the database", async () => {
    // Both copies passed the route's check before either saved. The review id
    // is the primary key, so the second log row fails its whole batch.
    await addCourse(api.db, "spanish", 1)
    const sent = review("spanish-1")
    const [saved] = await submit([sent])
    if (saved === undefined) throw new Error("No progress came back")
    const copy = applyReviews([saved], [sent], now)

    await expect(
      saveReviews(api.db, VIEWER_ID, copy.recorded, copy.progress, now, [
        "spanish",
      ])
    ).rejects.toThrow()

    expect((await savedRows()).map(progressFromRow)).toEqual([saved])
    expect(await loggedRows()).toHaveLength(1)
  })

  it("counts a review once when one request names it twice", async () => {
    await addCourse(api.db, "spanish", 1)
    const sent = review("spanish-1")

    const [progress] = await submit([sent, sent])

    expect(progress?.reps).toBe(1)
    expect(await loggedRows()).toHaveLength(1)
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
    await addEnrollment(api.db, "spanish")
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

describe("studying a course adds it to the dashboard", () => {
  async function dashboard(userId: string = VIEWER_ID): Promise<string[]> {
    const rows = await api.db
      .select({ courseId: enrollments.courseId, addedAt: enrollments.addedAt })
      .from(enrollments)
      .where(eq(enrollments.userId, userId))
    return rows.map((row) => `${row.courseId} ${row.addedAt.toISOString()}`)
  }

  it("adds the course with the first saved review, stamped by the server", async () => {
    await addCourse(api.db, "spanish", 2)

    await submit([review("spanish-1")])

    expect(await dashboard()).toEqual([`spanish ${now.toISOString()}`])
  })

  it("keeps the day a course was first added", async () => {
    await addCourse(api.db, "spanish", 2)
    await addEnrollment(api.db, "spanish")
    const [added] = await dashboard()

    vi.setSystemTime(now.getTime() + 2 * 24 * 60 * minute)
    await submit([review("spanish-1")])

    expect(await dashboard()).toEqual([added])
  })

  it("adds each course a request reviews, once", async () => {
    await addCourse(api.db, "spanish", 2)
    await addCourse(api.db, "french", 1)

    await submit([review("spanish-1"), review("spanish-2"), review("french-1")])

    expect((await dashboard()).map((row) => row.split(" ")[0]).sort()).toEqual([
      "french",
      "spanish",
    ])
  })

  it("never brings back a removed course for a retried old review", async () => {
    await addCourse(api.db, "spanish", 1)
    const sent = review("spanish-1")
    await submit([sent])
    await api.db.delete(enrollments)

    await submit([sent])

    expect(await dashboard()).toEqual([])
  })

  it("adds nothing when the request is refused", async () => {
    await addCourse(api.db, "spanish", 1)

    const res = await api.request("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reviews: [review("spanish-1"), review("nope")] }),
    })

    expect(res.status).toBe(404)
    expect(await dashboard()).toEqual([])
  })

  it("touches only the reviewer's dashboard", async () => {
    await addCourse(api.db, "spanish", 1)

    await submit([review("spanish-1")])

    expect(await dashboard(AUTHOR_ID)).toEqual([])
  })
})

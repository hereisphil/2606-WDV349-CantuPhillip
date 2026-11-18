import { coursesResponseSchema } from "@workspace/schemas/api/courses"
import { apiErrorSchema } from "@workspace/schemas/api/error"
import { studyHistorySchema } from "@workspace/schemas/api/history"
import type { ReviewSubmission } from "@workspace/schemas/srs/review"
import { eq } from "drizzle-orm"
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest"

import { reviews, sessions, userProgress } from "../db/schema"
import {
  AUTHOR_ID,
  TEST_ORIGIN,
  VIEWER_ID,
  addCourse,
  addEnrollment,
  addUsers,
  startTestApi,
  type TestApi,
} from "../db/test-d1"

/** Who a request is from, and that it only ever reaches its own data. */

// The seeded mnemonic author doubles as a second learner here.
const OTHER_ID = AUTHOR_ID

let api: TestApi

beforeAll(async () => {
  api = await startTestApi()
})

afterAll(async () => {
  await api.stop()
})

beforeEach(async () => {
  await api.reset()
  await addUsers(api.db)
  await addCourse(api.db, "spanish", 3)
})

function review(cardId: string): ReviewSubmission {
  return {
    reviewId: crypto.randomUUID(),
    cardId,
    outcome: "got_it",
    reviewedAt: new Date().toISOString(),
    durationMs: 3_000,
  }
}

function postReviews(
  body: unknown,
  as: string | null = VIEWER_ID
): Promise<Response> {
  return api.request(
    "/api/reviews",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
    as
  )
}

async function expectUnauthorized(res: Response): Promise<void> {
  expect(res.status).toBe(401)
  expect(apiErrorSchema.parse(await res.json())).toEqual({
    error: { code: "UNAUTHORIZED" },
  })
}

describe("without a session", () => {
  it.each(["/api/courses", "/api/courses/spanish/study", "/api/history"])(
    "GET %s answers UNAUTHORIZED",
    async (path) => {
      await expectUnauthorized(await api.request(path, {}, null))
    }
  )

  it("GET /api/catalog still answers: anyone can browse the courses", async () => {
    const res = await api.request("/api/catalog", {}, null)

    expect(res.status).toBe(200)
  })

  it("POST /api/reviews answers UNAUTHORIZED and saves nothing", async () => {
    await expectUnauthorized(
      await postReviews({ reviews: [review("spanish-1")] }, null)
    )
    expect(await api.db.select().from(reviews)).toHaveLength(0)
  })

  it("still answers GET /api/health, which holds no one's data", async () => {
    const res = await api.request("/api/health", {}, null)

    expect(res.status).toBe(200)
  })

  it("refuses a cookie whose signature is wrong", async () => {
    const res = await api.request("/api/courses", {
      headers: {
        Cookie: "better-auth.session_token=test-session-usr_prototype_01.Zm9v",
      },
    })

    await expectUnauthorized(res)
  })

  it("refuses a session that has ended", async () => {
    await api.request("/api/courses")
    await api.db
      .update(sessions)
      .set({ expiresAt: new Date("2000-01-01T00:00:00.000Z") })
      .where(eq(sessions.userId, VIEWER_ID))

    await expectUnauthorized(await api.request("/api/courses"))
  })
})

describe("with a real sign-in", () => {
  it("reads the courses with the cookie Better Auth set", async () => {
    const signUp = await api.request(
      "/api/auth/sign-up/email",
      {
        method: "POST",
        headers: { "Content-Type": "application/json", Origin: TEST_ORIGIN },
        body: JSON.stringify({
          name: "Ana",
          email: "ana@memli.test",
          password: "Correct-horse-battery",
        }),
      },
      null
    )
    const cookie = signUp.headers
      .getSetCookie()
      .map((value) => value.split(";")[0])
      .join("; ")

    const res = await api.request("/api/courses", {
      headers: { Cookie: cookie },
    })

    expect(res.status).toBe(200)
    // A new learner has added nothing yet, so the dashboard starts empty.
    expect(coursesResponseSchema.parse(await res.json()).courses).toEqual([])
  })
})

describe("one learner never reaches another's data", () => {
  beforeEach(async () => {
    const res = await postReviews({ reviews: [review("spanish-1")] }, OTHER_ID)
    expect(res.status).toBe(200)
  })

  it("saves a review for the learner who sent it", async () => {
    const saved = await api.db.select().from(userProgress)

    expect(saved.map((row) => row.userId)).toEqual([OTHER_ID])
  })

  it("counts only the viewer's own progress in GET /api/courses", async () => {
    await addEnrollment(api.db, "spanish")
    const res = await api.request("/api/courses")
    const [course] = coursesResponseSchema.parse(await res.json()).courses

    expect(course?.unseenCount).toBe(3)
    expect(course?.lastReviewedAt).toBeNull()
  })

  it("shows only the viewer's own week in GET /api/history", async () => {
    const res = await api.request("/api/history")
    const history = studyHistorySchema.parse(await res.json())

    expect(history.days.every((day) => day.wordsStudied === 0)).toBe(true)
    expect(history.newWordsThisMonth).toBe(0)
  })

  it("ignores a user id in the body: the session decides", async () => {
    const res = await postReviews({
      userId: OTHER_ID,
      reviews: [review("spanish-2")],
    })
    expect(res.status).toBe(200)

    const saved = await api.db
      .select()
      .from(userProgress)
      .where(eq(userProgress.cardId, "spanish-2"))
    expect(saved.map((row) => row.userId)).toEqual([VIEWER_ID])
  })
})

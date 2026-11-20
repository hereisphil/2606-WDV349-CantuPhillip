import { createProgress } from "@workspace/core/srs/progress"
import {
  enrollmentSchema,
  type Enrollment,
} from "@workspace/schemas/api/enrollment"
import { apiErrorSchema } from "@workspace/schemas/api/error"
import { and, eq } from "drizzle-orm"
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

import { enrollments, rateLimits, userProgress } from "../db/schema"
import {
  AUTHOR_ID,
  VIEWER_ID,
  addCourse,
  addEnrollment,
  addProgress,
  addUsers,
  publishCourse,
  startTestApi,
  type TestApi,
} from "../db/test-d1"
import { ENROLLMENT_LIMITS } from "./courses"

const now = new Date("2026-11-18T12:00:00.000Z")

let api: TestApi

beforeAll(async () => {
  api = await startTestApi()
})

afterAll(async () => {
  await api.stop()
})

beforeEach(async () => {
  // Only `Date` is faked: the route stamps `addedAt` with the server's clock.
  vi.useFakeTimers({ toFake: ["Date"], now })
  await api.reset()
  await addUsers(api.db)
  await addCourse(api.db, "spanish", 2)
  await publishCourse(api.db, "spanish")
})

afterEach(() => {
  vi.useRealTimers()
})

function send(
  method: "PUT" | "DELETE",
  courseId: string,
  init: RequestInit = {},
  as?: string | null
): Promise<Response> {
  return api.request(
    `/api/courses/${courseId}/enrollment`,
    { ...init, method },
    as
  )
}

async function expectOk(res: Response): Promise<Enrollment> {
  expect(res.status).toBe(200)
  return enrollmentSchema.parse(await res.json())
}

async function expectError(
  res: Response,
  status: number,
  code: string
): Promise<void> {
  expect(res.status).toBe(status)
  expect(apiErrorSchema.parse(await res.json())).toEqual({ error: { code } })
}

/** The courses on a learner's dashboard, straight from the table. */
async function addedBy(userId: string = VIEWER_ID): Promise<string[]> {
  const rows = await api.db
    .select({ courseId: enrollments.courseId })
    .from(enrollments)
    .where(eq(enrollments.userId, userId))
  return rows.map((row) => row.courseId).sort()
}

describe("PUT /api/courses/:courseId/enrollment", () => {
  it("adds a published course to the viewer's dashboard", async () => {
    expect(await expectOk(await send("PUT", "spanish"))).toEqual({
      courseId: "spanish",
      added: true,
      addedAt: now.toISOString(),
    })
    expect(await addedBy()).toEqual(["spanish"])
  })

  it("is safe to repeat, and keeps the day it was first added", async () => {
    await send("PUT", "spanish")
    vi.setSystemTime(new Date("2026-11-20T08:00:00.000Z"))

    const again = await expectOk(await send("PUT", "spanish"))

    expect(again.addedAt).toBe(now.toISOString())
    expect(await addedBy()).toEqual(["spanish"])
  })

  it("shows up as added in the catalog", async () => {
    await send("PUT", "spanish")

    const res = await api.request("/api/catalog/spanish")
    expect(await res.json()).toMatchObject({ added: true })
  })

  it("answers NOT_FOUND for a draft, as for a course that does not exist", async () => {
    await addCourse(api.db, "draft", 1)

    await expectError(await send("PUT", "draft"), 404, "NOT_FOUND")
    await expectError(await send("PUT", "nope"), 404, "NOT_FOUND")
    expect(await addedBy()).toEqual([])
  })

  it("touches only the viewer's own dashboard", async () => {
    await send("PUT", "spanish")

    expect(await addedBy(AUTHOR_ID)).toEqual([])
  })
})

describe("DELETE /api/courses/:courseId/enrollment", () => {
  it("takes the course off the dashboard and keeps the viewer's progress", async () => {
    await addEnrollment(api.db, "spanish")
    await addProgress(api.db, [createProgress("spanish-1", now)])

    expect(await expectOk(await send("DELETE", "spanish"))).toEqual({
      courseId: "spanish",
      added: false,
      addedAt: null,
    })
    expect(await addedBy()).toEqual([])
    const progress = await api.db
      .select({ cardId: userProgress.cardId })
      .from(userProgress)
    expect(progress).toEqual([{ cardId: "spanish-1" }])
  })

  it("is safe to repeat, and to send for a course never added", async () => {
    await addEnrollment(api.db, "spanish")

    await expectOk(await send("DELETE", "spanish"))
    expect((await expectOk(await send("DELETE", "spanish"))).added).toBe(false)
  })

  it("removes a course that became a draft after it was added", async () => {
    await addCourse(api.db, "retired", 1)
    await addEnrollment(api.db, "retired")

    await expectOk(await send("DELETE", "retired"))
    expect(await addedBy()).toEqual([])
  })

  it("leaves another learner's dashboard alone", async () => {
    await addEnrollment(api.db, "spanish")
    await addEnrollment(api.db, "spanish", AUTHOR_ID)

    await send("DELETE", "spanish")

    expect(await addedBy(AUTHOR_ID)).toEqual(["spanish"])
  })

  it("answers NOT_FOUND for a course that does not exist", async () => {
    await expectError(await send("DELETE", "nope"), 404, "NOT_FOUND")
  })
})

describe("adding a course back", () => {
  it("picks up where the learner left off, with a new date added", async () => {
    await send("PUT", "spanish")
    await addProgress(api.db, [createProgress("spanish-1", now)])
    await send("DELETE", "spanish")
    const later = new Date("2026-11-25T09:00:00.000Z")
    vi.setSystemTime(later)

    const back = await expectOk(await send("PUT", "spanish"))

    expect(back.addedAt).toBe(later.toISOString())
    const progress = await api.db
      .select()
      .from(userProgress)
      .where(
        and(
          eq(userProgress.userId, VIEWER_ID),
          eq(userProgress.cardId, "spanish-1")
        )
      )
    expect(progress).toHaveLength(1)
  })
})

describe("guards", () => {
  it.each(["PUT", "DELETE"] as const)(
    "%s answers UNAUTHORIZED without a session, and changes nothing",
    async (method) => {
      await addEnrollment(api.db, "spanish")

      await expectError(
        await send(method, "spanish", {}, null),
        401,
        "UNAUTHORIZED"
      )
      expect(await addedBy()).toEqual(["spanish"])
    }
  )

  it.each(["PUT", "DELETE"] as const)(
    "%s answers FORBIDDEN from another site's page",
    async (method) => {
      await expectError(
        await send(method, "spanish", {
          headers: { Origin: "https://evil.example" },
        }),
        403,
        "FORBIDDEN"
      )
      expect(await addedBy()).toEqual([])
    }
  )

  it("answers INVALID_REQUEST for a course id longer than any real one", async () => {
    await expectError(await send("PUT", "c".repeat(65)), 400, "INVALID_REQUEST")
  })

  it("refuses a learner past the minute's limit", async () => {
    // Stands in for 60 requests: the count the limiter would have reached.
    const key = `memli|enrollment|learner:${VIEWER_ID}`
    await api.db.insert(rateLimits).values({
      id: key,
      key,
      count: ENROLLMENT_LIMITS.perLearner.max,
      lastRequest: Date.now(),
    })

    const res = await send("PUT", "spanish")

    expect(res.headers.get("Retry-After")).not.toBeNull()
    await expectError(res, 429, "RATE_LIMITED")
    expect(await addedBy()).toEqual([])
  })
})

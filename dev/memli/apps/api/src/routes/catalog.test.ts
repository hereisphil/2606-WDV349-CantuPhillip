import {
  catalogCourseDetailSchema,
  catalogResponseSchema,
  type CatalogCourseDetail,
  type CatalogResponse,
} from "@workspace/schemas/api/catalog"
import { apiErrorSchema } from "@workspace/schemas/api/error"
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest"

import { rateLimits } from "../db/schema"
import {
  AUTHOR_ID,
  addCourse,
  addEnrollment,
  addMnemonic,
  addUsers,
  publishCourse,
  startTestApi,
  type TestApi,
} from "../db/test-d1"
import { CATALOG_LIMIT } from "./catalog"

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
})

/** A request with no session: someone who has not signed in. */
const VISITOR = null

/** As the viewer by default. Pass `VISITOR` to ask without a session. */
async function getCatalog(
  as?: typeof VISITOR
): Promise<CatalogResponse["courses"]> {
  const res = await api.request("/api/catalog", {}, as)
  expect(res.status).toBe(200)
  return catalogResponseSchema.parse(await res.json()).courses
}

async function getOverview(
  courseId: string,
  as?: typeof VISITOR
): Promise<CatalogCourseDetail> {
  const res = await api.request(`/api/catalog/${courseId}`, {}, as)
  expect(res.status).toBe(200)
  return catalogCourseDetailSchema.parse(await res.json())
}

async function expectError(
  res: Response,
  status: number,
  code: string
): Promise<void> {
  expect(res.status).toBe(status)
  expect(apiErrorSchema.parse(await res.json())).toEqual({ error: { code } })
}

describe("GET /api/catalog", () => {
  it("answers an empty list when nothing is published", async () => {
    await addCourse(api.db, "draft", 3)

    expect(await getCatalog()).toEqual([])
  })

  it("lists published courses by title, with their word counts", async () => {
    await addCourse(api.db, "spanish", 3)
    await addCourse(api.db, "french", 2)
    await addCourse(api.db, "draft", 1)
    await publishCourse(api.db, "spanish", { title: "Spanish Basics" })
    await publishCourse(api.db, "french", { title: "French Basics" })

    expect(await getCatalog()).toEqual([
      {
        courseId: "french",
        title: "French Basics",
        learningLanguage: "es",
        answerLanguage: "en",
        description: "Words for french.",
        wordCount: 2,
        added: false,
      },
      {
        courseId: "spanish",
        title: "Spanish Basics",
        learningLanguage: "es",
        answerLanguage: "en",
        description: "Words for spanish.",
        wordCount: 3,
        added: false,
      },
    ])
  })

  it("marks only the courses the viewer added", async () => {
    for (const courseId of ["spanish", "french"]) {
      await addCourse(api.db, courseId, 1)
      await publishCourse(api.db, courseId)
    }
    await addEnrollment(api.db, "spanish")
    // Another learner's dashboard says nothing about the viewer's.
    await addEnrollment(api.db, "french", AUTHOR_ID)

    const added = (await getCatalog()).map(({ courseId, added }) => ({
      courseId,
      added,
    }))
    expect(added).toEqual([
      { courseId: "french", added: false },
      { courseId: "spanish", added: true },
    ])
  })

  it("shows a visitor the same courses, with none added", async () => {
    await addCourse(api.db, "spanish", 2)
    await addCourse(api.db, "draft", 1)
    await publishCourse(api.db, "spanish")
    await addEnrollment(api.db, "spanish")

    expect(await getCatalog(VISITOR)).toEqual([
      { ...(await getCatalog())[0], added: false },
    ])
  })

  it("refuses an address past the minute's limit", async () => {
    // Stands in for 300 requests: the count the limiter would have reached.
    const key = "memli|catalog|address:local"
    await api.db.insert(rateLimits).values({
      id: key,
      key,
      count: CATALOG_LIMIT.max,
      lastRequest: Date.now(),
    })

    const res = await api.request("/api/catalog", {}, VISITOR)

    expect(res.headers.get("Retry-After")).not.toBeNull()
    await expectError(res, 429, "RATE_LIMITED")
  })

  it("counts a published course with no words as zero", async () => {
    await addCourse(api.db, "empty", 0)
    await publishCourse(api.db, "empty")

    expect((await getCatalog())[0]?.wordCount).toBe(0)
  })
})

describe("GET /api/catalog/:courseId", () => {
  it("sends the overview: details, where the words came from, and a sample", async () => {
    await addCourse(api.db, "spanish", 7)
    await publishCourse(api.db, "spanish", {
      attribution: "Example sentences from Tatoeba, CC BY 2.0 FR",
    })

    const overview = await getOverview("spanish")

    expect(overview).toMatchObject({
      courseId: "spanish",
      description: "Words for spanish.",
      wordCount: 7,
      added: false,
      publishedAt: "2026-11-01T00:00:00.000Z",
      source: "Written for Memli",
      license: "CC BY-SA 4.0",
      attribution: "Example sentences from Tatoeba, CC BY 2.0 FR",
    })
    expect(overview.sampleWords.map((word) => word.cardId)).toEqual([
      "spanish-1",
      "spanish-2",
      "spanish-3",
      "spanish-4",
      "spanish-5",
    ])
  })

  it("sends each sample word without its example or stories", async () => {
    await addCourse(api.db, "spanish", 2)
    await publishCourse(api.db, "spanish")
    await addMnemonic(api.db, { id: "mn-1", cardId: "spanish-1", upvotes: 1 })

    const res = await api.request("/api/catalog/spanish")
    const body = (await res.json()) as { sampleWords: unknown[] }

    expect(body.sampleWords).toEqual([
      {
        cardId: "spanish-1",
        term: "palabra 1",
        partOfSpeech: "noun",
        gender: "feminine",
        answers: ["word 1"],
        phonetic: "/paˈlaβɾa/",
      },
      {
        cardId: "spanish-2",
        term: "palabra 2",
        partOfSpeech: "noun",
        answers: ["word 2"],
        phonetic: "/paˈlaβɾa/",
      },
    ])
  })

  it("says when the viewer has added the course, and when the license asks no credit", async () => {
    await addCourse(api.db, "spanish", 1)
    await publishCourse(api.db, "spanish")
    await addEnrollment(api.db, "spanish")

    expect(await getOverview("spanish")).toMatchObject({
      added: true,
      attribution: null,
    })
  })

  it("shows a visitor the same overview, not added", async () => {
    await addCourse(api.db, "spanish", 3)
    await publishCourse(api.db, "spanish")
    await addEnrollment(api.db, "spanish")

    expect(await getOverview("spanish", VISITOR)).toEqual({
      ...(await getOverview("spanish")),
      added: false,
    })
  })

  it("hides a draft from a visitor too", async () => {
    await addCourse(api.db, "draft", 1)

    await expectError(
      await api.request("/api/catalog/draft", {}, VISITOR),
      404,
      "NOT_FOUND"
    )
  })

  it("answers NOT_FOUND for a draft, as for a course that does not exist", async () => {
    await addCourse(api.db, "draft", 1)

    await expectError(await api.request("/api/catalog/draft"), 404, "NOT_FOUND")
    await expectError(await api.request("/api/catalog/nope"), 404, "NOT_FOUND")
  })

  it("answers INVALID_REQUEST for a course id longer than any real one", async () => {
    await expectError(
      await api.request(`/api/catalog/${"c".repeat(65)}`),
      400,
      "INVALID_REQUEST"
    )
  })
})

describe("with the seeded database", () => {
  beforeEach(async () => {
    await api.reset()
    await api.seed()
  })

  it("lists the four starter courses by title, all added by the prototype learner", async () => {
    const courses = await getCatalog()

    expect(
      courses.map(({ title, wordCount, added }) => [title, wordCount, added])
    ).toEqual([
      ["French Travel Phrases", 4, true],
      ["Japanese Hiragana & Katakana", 4, true],
      ["Portuguese Essentials", 3, true],
      ["Spanish Core 1000", 5, true],
    ])
  })

  it("lists them for a visitor, with none added", async () => {
    const courses = await getCatalog(VISITOR)

    expect(courses).toHaveLength(4)
    expect(courses.every((course) => !course.added)).toBe(true)
  })

  it("sends every starter course's overview in a shape the contract accepts", async () => {
    for (const { courseId, wordCount } of await getCatalog()) {
      const overview = await getOverview(courseId)

      expect(overview.sampleWords).toHaveLength(Math.min(wordCount, 5))
    }
  })
})

import { applyOutcome, type ReviewOutcome } from "@workspace/core/srs/outcome"
import { createProgress, type CardProgress } from "@workspace/core/srs/progress"
import { coursesResponseSchema } from "@workspace/schemas/api/courses"
import { apiErrorSchema } from "@workspace/schemas/api/error"
import { studySessionSchema } from "@workspace/schemas/api/study"
import { eq } from "drizzle-orm"
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

import { users } from "../db/schema"
import {
  AUTHOR_ID,
  addCourse,
  addReviewLog,
  addMnemonic,
  addProgress,
  addUsers,
  startTestApi,
  type TestApi,
} from "../db/test-d1"

const now = new Date("2026-11-14T20:00:00.000Z")
const day = 24 * 60 * 60 * 1000

function daysAgo(days: number): Date {
  return new Date(now.getTime() - days * day)
}

/** A card reviewed once, `days` ago. */
function reviewed(
  cardId: string,
  days: number,
  outcome: ReviewOutcome = "got_it"
): CardProgress {
  const at = daysAgo(days)
  return applyOutcome(createProgress(cardId, at), outcome, at).progress
}

let api: TestApi

beforeAll(async () => {
  api = await startTestApi()
})

afterAll(async () => {
  await api.stop()
})

beforeEach(async () => {
  // Only `Date` is faked: the server's clock is what these routes read.
  vi.useFakeTimers({ toFake: ["Date"], now })
  await api.reset()
  await addUsers(api.db)
})

afterEach(() => {
  vi.useRealTimers()
})

async function getCourses(): Promise<
  ReturnType<typeof coursesResponseSchema.parse>["courses"]
> {
  const res = await api.request("/api/courses")
  expect(res.status).toBe(200)
  return coursesResponseSchema.parse(await res.json()).courses
}

async function getStudy(
  path: string
): Promise<ReturnType<typeof studySessionSchema.parse>> {
  const res = await api.request(`/api/courses/${path}`)
  expect(res.status).toBe(200)
  return studySessionSchema.parse(await res.json())
}

describe("GET /api/courses", () => {
  it("answers an empty list when there are no courses", async () => {
    expect(await getCourses()).toEqual([])
  })

  it("shows a course nobody has studied as all new", async () => {
    await addCourse(api.db, "spanish", 3)

    expect(await getCourses()).toEqual([
      {
        courseId: "spanish",
        title: "Course spanish",
        learningLanguage: "es",
        answerLanguage: "en",
        dueCount: 0,
        newAvailable: 3,
        masteredCount: 0,
        learningCount: 0,
        unseenCount: 3,
        trickyCount: 0,
        lastReviewedAt: null,
      },
    ])
  })

  it("counts a course with no cards as zeros", async () => {
    await addCourse(api.db, "empty", 0)

    expect(await getCourses()).toMatchObject([
      { courseId: "empty", newAvailable: 0, unseenCount: 0 },
    ])
  })

  it("counts the viewer's progress, course by course", async () => {
    const [first, second] = await addCourse(api.db, "spanish", 4)
    await addCourse(api.db, "french", 2)
    // One reviewed long ago and due again, one reviewed just now and not due.
    const due = reviewed(String(first), 30)
    const fresh = reviewed(String(second), 0)
    await addProgress(api.db, [due, fresh])

    const [french, spanish] = await getCourses()

    expect(spanish).toMatchObject({
      courseId: "spanish",
      dueCount: 1,
      newAvailable: 2,
      learningCount: 2,
      unseenCount: 2,
      lastReviewedAt: fresh.lastReview,
    })
    expect(french).toMatchObject({
      courseId: "french",
      dueCount: 0,
      unseenCount: 2,
      lastReviewedAt: null,
    })
  })

  it("makes a card due once its time comes", async () => {
    const [cardId] = await addCourse(api.db, "spanish", 1)
    const progress = reviewed(String(cardId), 0)
    await addProgress(api.db, [progress])

    expect((await getCourses())[0]?.dueCount).toBe(0)

    vi.setSystemTime(new Date(progress.due))

    expect((await getCourses())[0]?.dueCount).toBe(1)
  })

  it("ignores everyone else's progress", async () => {
    const [cardId] = await addCourse(api.db, "spanish", 2)
    await addProgress(api.db, [reviewed(String(cardId), 30)], AUTHOR_ID)

    expect(await getCourses()).toMatchObject([{ dueCount: 0, unseenCount: 2 }])
  })

  it("tells caches to keep nothing", async () => {
    const res = await api.request("/api/courses")

    expect(res.headers.get("cache-control")).toBe("no-store")
  })
})

describe("GET /api/courses/:courseId/study", () => {
  it("answers NOT_FOUND for a course that does not exist", async () => {
    const res = await api.request("/api/courses/nope/study")

    expect(res.status).toBe(404)
    expect(apiErrorSchema.parse(await res.json())).toEqual({
      error: { code: "NOT_FOUND" },
    })
  })

  it.each(["mode=cram", "mode=learn&extra=0", "mode=learn&extra=lots"])(
    "answers INVALID_REQUEST for ?%s",
    async (query: string) => {
      await addCourse(api.db, "spanish", 1)

      const res = await api.request(`/api/courses/spanish/study?${query}`)

      expect(res.status).toBe(400)
      expect(apiErrorSchema.parse(await res.json())).toEqual({
        error: { code: "INVALID_REQUEST" },
      })
    }
  )

  it("reviews by default, and has nothing for a learner who has not started", async () => {
    await addCourse(api.db, "spanish", 3)

    expect(await getStudy("spanish/study")).toEqual({
      course: {
        courseId: "spanish",
        title: "Course spanish",
        learningLanguage: "es",
        answerLanguage: "en",
      },
      mode: "review",
      cards: [],
    })
  })

  it("learn sends unseen cards in course order, each as new progress", async () => {
    const [first, second, third] = await addCourse(api.db, "spanish", 3)
    await addProgress(api.db, [reviewed(String(second), 1)])

    const { cards } = await getStudy("spanish/study?mode=learn")

    expect(cards.map((card) => card.cardId)).toEqual([first, third])
    expect(cards[0]).toEqual({
      cardId: "spanish-1",
      term: "palabra 1",
      partOfSpeech: "noun",
      gender: "feminine",
      answers: ["word 1"],
      phonetic: "/paˈlaβɾa/",
      example: { text: "Una palabra.", translation: "A word." },
      mnemonics: [],
      progress: createProgress("spanish-1", now),
    })
    // No gender is no key at all, never `null`.
    expect(cards[1]).not.toHaveProperty("gender")
  })

  it("review sends what is due, most overdue first, with the saved progress", async () => {
    const [a, b, c] = await addCourse(api.db, "spanish", 4)
    const overdue = reviewed(String(a), 20)
    const mostOverdue = reviewed(String(b), 40)
    await addProgress(api.db, [overdue, mostOverdue, reviewed(String(c), 0)])

    const { cards } = await getStudy("spanish/study?mode=review")

    expect(cards.map((card) => card.progress)).toEqual([mostOverdue, overdue])
  })

  it("practice sends tricky cards, most forgotten first", async () => {
    const [a, b, c] = await addCourse(api.db, "spanish", 3)
    await addProgress(api.db, [
      { ...reviewed(String(a), 1), lapses: 3 },
      { ...reviewed(String(b), 1), lapses: 7 },
      { ...reviewed(String(c), 1), lapses: 1 },
    ])

    const { cards } = await getStudy("spanish/study?mode=practice")

    expect(cards.map((card) => card.cardId)).toEqual([b, a])
  })

  it("nests a card's mnemonics, most upvoted first", async () => {
    const [cardId] = await addCourse(api.db, "spanish", 1)
    const card = String(cardId)
    await addMnemonic(api.db, { id: "mn-low", cardId: card, upvotes: 2 })
    await addMnemonic(api.db, {
      id: "mn-top",
      cardId: card,
      upvotes: 90,
      picture: true,
    })
    await addMnemonic(api.db, {
      id: "mn-orphan",
      cardId: card,
      upvotes: 40,
      authorId: null,
    })

    const { cards } = await getStudy("spanish/study?mode=learn")

    expect(cards[0]?.mnemonics).toEqual([
      {
        mnemonicId: "mn-top",
        contentLocale: "en",
        story: [
          { kind: "plain", text: "A " },
          { kind: "keyword", text: "pal" },
          { kind: "plain", text: " says a " },
          { kind: "term", text: "palabra" },
        ],
        author: { displayName: "lucia_m" },
        upvotes: 90,
        image: { src: "/mnemonics/gato.svg", alt: "A cat at a gala." },
      },
      expect.objectContaining({ mnemonicId: "mn-orphan", author: null }),
      expect.objectContaining({ mnemonicId: "mn-low" }),
    ])
  })

  it("keeps a mnemonic whose author deleted their account", async () => {
    const [cardId] = await addCourse(api.db, "spanish", 1)
    await addMnemonic(api.db, {
      id: "mn-1",
      cardId: String(cardId),
      upvotes: 1,
    })
    await api.db.delete(users).where(eq(users.id, AUTHOR_ID))

    const { cards } = await getStudy("spanish/study?mode=learn")

    expect(cards[0]?.mnemonics).toMatchObject([
      { mnemonicId: "mn-1", author: null },
    ])
  })

  it("learn stops at the daily limit unless the learner asks for more", async () => {
    await addCourse(api.db, "spanish", 25)

    const usual = await getStudy("spanish/study?mode=learn")
    const more = await getStudy("spanish/study?mode=learn&extra=5")

    expect([usual.cards.length, more.cards.length]).toEqual([10, 15])
  })

  it("handles a session larger than D1 lets one query list", async () => {
    // D1 allows 100 bound values per statement; this session has 110 ids.
    const cardIds = await addCourse(api.db, "spanish", 120)

    const { cards } = await getStudy("spanish/study?mode=learn&extra=100")

    expect(cards.map((card) => card.cardId)).toEqual(cardIds.slice(0, 110))
  })
})

describe("with the seeded database", () => {
  beforeEach(async () => {
    await api.reset()
    await api.seed()
  })

  it("lists the four starter courses, all new", async () => {
    const courses = await getCourses()

    expect(courses.map((course) => course.courseId)).toEqual([
      "french-travel-phrases",
      "japanese-kana",
      "portuguese-essentials",
      "spanish-core-1000",
    ])
    expect(courses.map((course) => course.newAvailable)).toEqual([4, 4, 3, 5])
  })

  it("sends every course's cards in a shape the contract accepts", async () => {
    for (const course of await getCourses()) {
      const { cards } = await getStudy(`${course.courseId}/study?mode=learn`)

      expect(cards).toHaveLength(course.newAvailable)
    }
  })

  it("sends gato's three mnemonics with their authors", async () => {
    const { cards } = await getStudy("spanish-core-1000/study?mode=learn")

    expect(
      cards[0]?.mnemonics?.map((mnemonic) => mnemonic.author?.displayName)
    ).toEqual(["lucia_m", "kenji.k", "sam_studies"])
  })
})

describe("the daily new-word limit", () => {
  it("subtracts words already started today, where the learner is", async () => {
    const cardIds = await addCourse(api.db, "spanish", 30)
    // Four first sightings today in Mexico City, one late last night there.
    await addReviewLog(api.db, [
      ...cardIds.slice(0, 4).map((cardId) => ({
        cardId,
        at: "2026-11-14T19:00:00.000Z",
        priorState: "new" as const,
      })),
      // 02:00 UTC on the 14th is 20:00 on the 13th in Mexico City.
      {
        cardId: String(cardIds[4]),
        at: "2026-11-14T02:00:00.000Z",
        priorState: "new",
      },
    ])
    const tz = "timeZone=America/Mexico_City"

    const res = await api.request(`/api/courses?${tz}`)
    const [course] = coursesResponseSchema.parse(await res.json()).courses
    const session = await getStudy(`spanish/study?mode=learn&${tz}`)

    expect(course?.newAvailable).toBe(6)
    expect(session.cards).toHaveLength(6)
  })

  it("answers INVALID_REQUEST for a time zone that does not exist", async () => {
    const res = await api.request("/api/courses?timeZone=Mars/Olympus_Mons")

    expect(res.status).toBe(400)
  })
})

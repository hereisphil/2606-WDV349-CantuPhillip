import {
  catalogParamsSchema,
  SAMPLE_WORD_COUNT,
  type CatalogCourseDetail,
  type CatalogResponse,
} from "@workspace/schemas/api/catalog"
import { Hono } from "hono"

import { database } from "../db/client"
import {
  cardCount,
  cardCountByCourse,
  findPublishedCourse,
  firstWords,
  listPublishedCourses,
  type PublishedCourse,
} from "../db/content"
import { addedCourseIds, hasAdded } from "../db/enrollments"
import type { AppEnv } from "../env"
import { errorResponse } from "../lib/errors"
import { limitAddress } from "../lib/rate-limit"
import { validate } from "../lib/validate"
import { optionalViewer, optionalViewerId } from "../lib/viewer"

/**
 * Mounted at `/api/catalog`: the published courses anyone can browse (#174).
 * Public: a visitor gets the same answer as a learner, with nothing added.
 */
export const catalogRoutes = new Hono<AppEnv>()

/**
 * A page load is one request, so this leaves room for a classroom behind one
 * network. Anyone can call these routes, so the limit is per address alone.
 */
export const CATALOG_LIMIT = { windowSeconds: 60, max: 300 }

catalogRoutes.use(limitAddress("catalog", CATALOG_LIMIT))
catalogRoutes.use(optionalViewer)

/** What the catalog shows of a course, whichever route sends it. */
function listed(
  course: PublishedCourse,
  wordCount: number,
  added: boolean
): CatalogResponse["courses"][number] {
  const { courseId, title, learningLanguage, answerLanguage, description } =
    course
  return {
    courseId,
    title,
    learningLanguage,
    answerLanguage,
    description,
    wordCount,
    added,
  }
}

// Every published course, by title, and whether the viewer has added it.
catalogRoutes.get("/", async (c) => {
  const db = database(c.env.DB)
  const learner = optionalViewerId(c)
  const [courses, wordCounts, added] = await Promise.all([
    listPublishedCourses(db),
    cardCountByCourse(db),
    // A visitor has no dashboard, so nothing is added.
    learner === null ? new Set<string>() : addedCourseIds(db, learner),
  ])

  const body: CatalogResponse = {
    courses: courses.map((course) =>
      listed(
        course,
        wordCounts.get(course.courseId) ?? 0,
        added.has(course.courseId)
      )
    ),
  }
  return c.json(body)
})

// One published course's overview. A draft answers NOT_FOUND, like no course.
catalogRoutes.get(
  "/:courseId",
  validate("param", catalogParamsSchema),
  async (c) => {
    const db = database(c.env.DB)
    const { courseId } = c.req.valid("param")

    const course = await findPublishedCourse(db, courseId)
    if (course === null) return errorResponse(c, "NOT_FOUND")

    const learner = optionalViewerId(c)
    const [wordCount, sampleWords, added] = await Promise.all([
      cardCount(db, courseId),
      firstWords(db, courseId, SAMPLE_WORD_COUNT),
      learner === null ? false : hasAdded(db, learner, courseId),
    ])

    const body: CatalogCourseDetail = {
      ...listed(course, wordCount, added),
      publishedAt: course.publishedAt.toISOString(),
      source: course.source,
      license: course.license,
      attribution: course.attribution,
      sampleWords,
    }
    return c.json(body)
  }
)

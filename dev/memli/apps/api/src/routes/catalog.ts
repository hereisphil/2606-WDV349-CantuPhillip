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
import { validate } from "../lib/validate"
import { requireViewer, viewerId } from "../lib/viewer"

/** Mounted at `/api/catalog`: the published courses a learner can add (#174). */
export const catalogRoutes = new Hono<AppEnv>()

// "Added" is per learner, so the catalog needs a session too.
catalogRoutes.use(requireViewer)

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
  const [courses, wordCounts, added] = await Promise.all([
    listPublishedCourses(db),
    cardCountByCourse(db),
    addedCourseIds(db, viewerId(c)),
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

    const [wordCount, sampleWords, added] = await Promise.all([
      cardCount(db, courseId),
      firstWords(db, courseId, SAMPLE_WORD_COUNT),
      hasAdded(db, viewerId(c), courseId),
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

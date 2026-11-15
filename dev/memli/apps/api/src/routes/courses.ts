import { createProgress } from "@workspace/core/srs/progress"
import {
  sessionCards,
  summarizeCourseProgress,
} from "@workspace/core/study/course-progress"
import type { CoursesResponse } from "@workspace/schemas/api/courses"
import {
  studyQuerySchema,
  type StudySession,
} from "@workspace/schemas/api/study"
import { Hono } from "hono"

import { database } from "../db/client"
import {
  cardCountByCourse,
  cardIdsInOrder,
  cardsById,
  findCourse,
  listCourses,
} from "../db/content"
import { courseProgress, progressByCourse } from "../db/progress"
import type { AppEnv } from "../env"
import { errorResponse } from "../lib/errors"
import { validate } from "../lib/validate"
import { viewerId } from "../lib/viewer"

/** Mounted at `/api/courses`. */
export const courseRoutes = new Hono<AppEnv>()

// Every course, with where the viewer stands in each: what the dashboard shows.
courseRoutes.get("/", async (c) => {
  const db = database(c.env.DB)
  const now = new Date()

  const [courses, cardCounts, progress] = await Promise.all([
    listCourses(db),
    cardCountByCourse(db),
    progressByCourse(db, viewerId(c)),
  ])

  const body: CoursesResponse = {
    courses: courses.map((course) => ({
      ...course,
      ...summarizeCourseProgress(
        cardCounts.get(course.courseId) ?? 0,
        progress.get(course.courseId) ?? [],
        now
      ),
    })),
  }
  return c.json(body)
})

// One session's cards for a course: ?mode=review (default), learn or practice.
courseRoutes.get(
  "/:courseId/study",
  validate("query", studyQuerySchema),
  async (c) => {
    const db = database(c.env.DB)
    const now = new Date()
    const courseId = c.req.param("courseId")
    const { mode, extra } = c.req.valid("query")

    const course = await findCourse(db, courseId)
    if (course === null) return errorResponse(c, "NOT_FOUND")

    // Choose first, from ids and progress alone. Then load the full content
    // of the chosen cards only, so a 1,000-word course costs what a
    // 10-word session needs.
    const [cardIds, saved] = await Promise.all([
      cardIdsInOrder(db, courseId),
      courseProgress(db, viewerId(c), courseId),
    ])
    const savedByCard = new Map(saved.map((card) => [card.cardId, card]))
    const chosen = sessionCards(
      cardIds.map((cardId) => ({
        // No saved progress means the viewer has never seen the card.
        progress: savedByCard.get(cardId) ?? createProgress(cardId, now),
      })),
      mode,
      { now, extra }
    )

    const content = await cardsById(
      db,
      chosen.map(({ progress }) => progress.cardId)
    )
    const body: StudySession = {
      course,
      mode,
      cards: chosen.flatMap(({ progress }) => {
        const card = content.get(progress.cardId)
        return card === undefined ? [] : [{ ...card, progress }]
      }),
    }
    return c.json(body)
  }
)

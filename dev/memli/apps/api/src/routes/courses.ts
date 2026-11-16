import { createProgress } from "@workspace/core/srs/progress"
import {
  sessionCards,
  summarizeCourseProgress,
} from "@workspace/core/study/course-progress"
import { localDate, newWordsStartedOn } from "@workspace/core/study/history"
import {
  coursesQuerySchema,
  type CoursesResponse,
} from "@workspace/schemas/api/courses"
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
import { reviewsSince, type CourseReview } from "../db/reviews"
import type { Database } from "../db/client"
import type { AppEnv } from "../env"
import { errorResponse } from "../lib/errors"
import { validate } from "../lib/validate"
import { viewerId } from "../lib/viewer"

/** Mounted at `/api/courses`. */
export const courseRoutes = new Hono<AppEnv>()

// Today, wherever the viewer is, is never longer than this ago.
const TWO_DAYS_MS = 2 * 24 * 60 * 60 * 1000

/**
 * Words the viewer met for the first time today, where they are, by course.
 * The daily new-word limit subtracts them.
 */
async function newWordsStartedToday(
  db: Database,
  userId: string,
  now: Date,
  timeZone: string
): Promise<Map<string, number>> {
  const firstSightings: CourseReview[] = await reviewsSince(
    db,
    userId,
    new Date(now.getTime() - TWO_DAYS_MS),
    { firstSightingsOnly: true }
  )
  return newWordsStartedOn(firstSightings, localDate(now, timeZone), timeZone)
}

// Every course, with where the viewer stands in each: what the dashboard shows.
courseRoutes.get("/", validate("query", coursesQuerySchema), async (c) => {
  const db = database(c.env.DB)
  const now = new Date()
  const userId = viewerId(c)
  const { timeZone } = c.req.valid("query")

  const [courses, cardCounts, progress, startedToday] = await Promise.all([
    listCourses(db),
    cardCountByCourse(db),
    progressByCourse(db, userId),
    newWordsStartedToday(db, userId, now, timeZone),
  ])

  const body: CoursesResponse = {
    courses: courses.map((course) => ({
      ...course,
      ...summarizeCourseProgress(
        cardCounts.get(course.courseId) ?? 0,
        progress.get(course.courseId) ?? [],
        now,
        startedToday.get(course.courseId) ?? 0
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
    const { mode, extra, timeZone } = c.req.valid("query")
    const userId = viewerId(c)

    const course = await findCourse(db, courseId)
    if (course === null) return errorResponse(c, "NOT_FOUND")

    // Choose first, from ids and progress alone. Then load the full content
    // of the chosen cards only, so a 1,000-word course costs what a
    // 10-word session needs.
    const [cardIds, saved, startedToday] = await Promise.all([
      cardIdsInOrder(db, courseId),
      courseProgress(db, userId, courseId),
      mode === "learn"
        ? newWordsStartedToday(db, userId, now, timeZone)
        : new Map<string, number>(),
    ])
    const savedByCard = new Map(saved.map((card) => [card.cardId, card]))
    const chosen = sessionCards(
      cardIds.map((cardId) => ({
        // No saved progress means the viewer has never seen the card.
        progress: savedByCard.get(cardId) ?? createProgress(cardId, now),
      })),
      mode,
      { now, extra, newStartedToday: startedToday.get(courseId) ?? 0 }
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

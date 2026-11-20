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
  enrollmentParamsSchema,
  type Enrollment,
} from "@workspace/schemas/api/enrollment"
import {
  studyParamsSchema,
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
  findPublishedCourse,
  findStudyableCourse,
  listAddedCourses,
} from "../db/content"
import { addToDashboard, removeFromDashboard } from "../db/enrollments"
import { courseProgress, progressByCourse } from "../db/progress"
import { reviewsSince, type CourseReview } from "../db/reviews"
import type { Database } from "../db/client"
import type { AppEnv } from "../env"
import { errorResponse } from "../lib/errors"
import { limitRequests } from "../lib/rate-limit"
import { validate } from "../lib/validate"
import { requireViewer, viewerId } from "../lib/viewer"

/** Mounted at `/api/courses`. */
export const courseRoutes = new Hono<AppEnv>()

// Every route here is one learner's data, so each needs a session.
courseRoutes.use(requireViewer)

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

// The courses the viewer added, with where they stand in each: the dashboard.
courseRoutes.get("/", validate("query", coursesQuerySchema), async (c) => {
  const db = database(c.env.DB)
  const now = new Date()
  const userId = viewerId(c)
  const { timeZone } = c.req.valid("query")

  const [courses, cardCounts, progress, startedToday] = await Promise.all([
    listAddedCourses(db, userId),
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
  validate("param", studyParamsSchema),
  validate("query", studyQuerySchema),
  async (c) => {
    const db = database(c.env.DB)
    const now = new Date()
    const { courseId } = c.req.valid("param")
    const { mode, extra, timeZone } = c.req.valid("query")
    const userId = viewerId(c)

    // A draft the viewer never added answers NOT_FOUND, like no course at all.
    const course = await findStudyableCourse(db, userId, courseId)
    if (course === null) return errorResponse(c, "NOT_FOUND")

    // Choose from ids and progress alone, then load only the chosen cards'
    // content, so a 1,000-word course costs what a 10-word session needs.
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

/**
 * Adding and removing are one tap each, so a learner never needs many. An
 * address allows a classroom of them behind one network.
 */
export const ENROLLMENT_LIMITS = {
  perLearner: { windowSeconds: 60, max: 60 },
  perAddress: { windowSeconds: 60, max: 1_200 },
}

courseRoutes.use(
  "/:courseId/enrollment",
  limitRequests("enrollment", ENROLLMENT_LIMITS)
)

// Adds a published course to the viewer's dashboard. Safe to repeat.
courseRoutes.put(
  "/:courseId/enrollment",
  validate("param", enrollmentParamsSchema),
  async (c) => {
    const db = database(c.env.DB)
    const { courseId } = c.req.valid("param")

    // A draft can't be added, the same as a course that does not exist.
    const course = await findPublishedCourse(db, courseId)
    if (course === null) return errorResponse(c, "NOT_FOUND")

    const addedAt = await addToDashboard(db, viewerId(c), courseId, new Date())
    const body: Enrollment = {
      courseId,
      added: true,
      addedAt: addedAt.toISOString(),
    }
    return c.json(body)
  }
)

// Takes a course off the viewer's dashboard and keeps their progress.
courseRoutes.delete(
  "/:courseId/enrollment",
  validate("param", enrollmentParamsSchema),
  async (c) => {
    const db = database(c.env.DB)
    const { courseId } = c.req.valid("param")

    // Any course, drafts included: a course unpublished later can still go.
    const course = await findCourse(db, courseId)
    if (course === null) return errorResponse(c, "NOT_FOUND")

    await removeFromDashboard(db, viewerId(c), courseId)
    const body: Enrollment = { courseId, added: false, addedAt: null }
    return c.json(body)
  }
)

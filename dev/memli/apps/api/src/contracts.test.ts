import { applyOutcome, type ReviewOutcome } from "@workspace/core/srs/outcome"
import { createProgress, type CardProgress } from "@workspace/core/srs/progress"
import type {
  CourseProgressSummary,
  StudyMode,
} from "@workspace/core/study/course-progress"
import type { SessionReview } from "@workspace/core/study/session-reducer"
import type { StudyHistory } from "@workspace/core/study/history"
import type { CourseSummary } from "@workspace/schemas/api/courses"
import type { StudyHistoryData } from "@workspace/schemas/api/history"
import type { StudyModeData } from "@workspace/schemas/api/study"
import type { Course } from "@workspace/schemas/content/course"
import {
  cardProgressSchema,
  type CardProgressData,
} from "@workspace/schemas/srs/progress"
import {
  reviewSubmissionSchema,
  type ReviewOutcomeData,
  type ReviewSubmission,
} from "@workspace/schemas/srs/review"
import { describe, expect, expectTypeOf, it } from "vitest"

/**
 * The HTTP contracts (@workspace/schemas) must agree with @workspace/core.
 * Type checks run in `bun run typecheck`; the rest in `bun run test`.
 */
describe("schemas match @workspace/core", () => {
  it("has the same review outcomes", () => {
    expectTypeOf<ReviewOutcomeData>().toEqualTypeOf<ReviewOutcome>()
  })

  it("has the same progress fields", () => {
    expectTypeOf<Readonly<CardProgressData>>().toEqualTypeOf<CardProgress>()
  })

  it("has the same study modes", () => {
    expectTypeOf<StudyModeData>().toEqualTypeOf<StudyMode>()
  })

  it("has the same course progress counts", () => {
    // A course summary is a course plus exactly what core counts.
    expectTypeOf<
      Readonly<Omit<CourseSummary, keyof Course>>
    >().toEqualTypeOf<CourseProgressSummary>()
  })

  it("has the same study history", () => {
    // Each fits the other: the same fields, whatever is marked readonly.
    expectTypeOf<StudyHistory>().toExtend<StudyHistoryData>()
    expectTypeOf<StudyHistoryData>().toExtend<StudyHistory>()
  })

  it("accepts the progress core creates and schedules", () => {
    const now = new Date("2026-11-14T20:00:00.000Z")
    const fresh = createProgress("es-gato", now)
    const reviewed = applyOutcome(fresh, "got_it", now).progress

    expect(cardProgressSchema.parse(fresh)).toEqual(fresh)
    expect(cardProgressSchema.parse(reviewed)).toEqual(reviewed)
  })

  it("can build a review submission from a session review", () => {
    // What the web app will send for each review the session reducer records.
    // The app adds the id; the reducer stays pure and makes nothing random.
    const toSubmission = (review: SessionReview): ReviewSubmission => ({
      reviewId: "0b7e2a52-6c1f-4d0e-9a57-3f8a1c2d4e5f",
      cardId: review.cardId,
      outcome: review.outcome,
      reviewedAt: review.reviewedAt,
      durationMs: review.durationMs,
    })
    const now = new Date("2026-11-14T20:00:00.000Z")
    const { log } = applyOutcome(createProgress("es-gato", now), "tough", now)

    const submission = toSubmission({ ...log, durationMs: 4_000 })

    expect(reviewSubmissionSchema.parse(submission)).toEqual({
      reviewId: "0b7e2a52-6c1f-4d0e-9a57-3f8a1c2d4e5f",
      cardId: "es-gato",
      outcome: "tough",
      reviewedAt: "2026-11-14T20:00:00.000Z",
      durationMs: 4_000,
    })
  })
})

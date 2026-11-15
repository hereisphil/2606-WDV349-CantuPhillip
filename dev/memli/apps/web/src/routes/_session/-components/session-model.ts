import {
  prototypeDashboardMetrics,
  type DashboardCourse,
} from "../../_app/-components/dashboard-metrics"

export type StudyMode = "review" | "learn" | "practice"

/** The course behind a study session. #112 swaps the seeded courses for the API. */
export function findCourse(courseId: string): DashboardCourse | null {
  return (
    prototypeDashboardMetrics.courses.find(
      (course) => course.courseId === courseId
    ) ?? null
  )
}

/**
 * How many cards the session starts with. `extra` adds new cards past
 * today's limit, and only applies to `learn`.
 */
export function sessionQueueSize(
  course: DashboardCourse,
  mode: StudyMode,
  extra: number | undefined
): number {
  switch (mode) {
    case "review":
      return course.dueCount
    case "learn":
      return Math.min(course.unseenCount, course.newAvailable + (extra ?? 0))
    case "practice":
      return course.trickyCount
  }
}

import { addDays, localDateKey } from "@/lib/dates"
import type { DailyStudy, DashboardCourse } from "./dashboard-metrics"

// Rough review pace until #112 can measure it from review history.
const SECONDS_PER_REVIEW = 8

function estimateMinutes(cardCount: number): number {
  if (cardCount <= 0) {
    return 0
  }
  return Math.max(1, Math.ceil((cardCount * SECONDS_PER_REVIEW) / 60))
}

export function totalMastered(courses: readonly DashboardCourse[]): number {
  return courses.reduce((sum, course) => sum + course.masteredCount, 0)
}

function compareRecency(a: DashboardCourse, b: DashboardCourse): number {
  if (a.lastReviewedAt === b.lastReviewedAt) {
    return 0
  }
  if (a.lastReviewedAt === null) {
    return 1
  }
  if (b.lastReviewedAt === null) {
    return -1
  }
  return b.lastReviewedAt.localeCompare(a.lastReviewedAt)
}

/** Most due first; then courses with new cards; ties go to the most recently studied. */
function compareByNeed(a: DashboardCourse, b: DashboardCourse): number {
  if (a.dueCount !== b.dueCount) {
    return b.dueCount - a.dueCount
  }
  const aHasNew = a.newAvailable > 0
  const bHasNew = b.newAvailable > 0
  if (a.dueCount === 0 && aHasNew !== bHasNew) {
    return aHasNew ? -1 : 1
  }
  return compareRecency(a, b)
}

export function sortCourses(
  courses: readonly DashboardCourse[]
): DashboardCourse[] {
  return [...courses].sort(compareByNeed)
}

/** Each learning language once, in the order its first course appears. */
function learningLanguages(courses: readonly DashboardCourse[]): string[] {
  return [...new Set(courses.map((course) => course.learningLanguage))]
}

export function selectFocusCourse(
  courses: readonly DashboardCourse[]
): DashboardCourse | null {
  return sortCourses(courses)[0] ?? null
}

/** Every course but the hero's, most in need first. */
export function otherCourses(
  courses: readonly DashboardCourse[]
): DashboardCourse[] {
  const focus = selectFocusCourse(courses)
  return sortCourses(courses).filter(
    (course) => course.courseId !== focus?.courseId
  )
}

/** Above this many other courses, the list offers the Studying menu. */
const MAX_UNFILTERED_COURSES = 5

/** The Studying menu's languages. Empty when every course is one tap away. */
export function studyingLanguages(
  others: readonly DashboardCourse[]
): string[] {
  const languages = learningLanguages(others)
  return others.length > MAX_UNFILTERED_COURSES && languages.length >= 2
    ? languages
    : []
}

export function courseTotal(course: DashboardCourse): number {
  return course.masteredCount + course.learningCount + course.unseenCount
}

/** Words the learner has met: mastered plus still learning. */
export function startedCount(course: DashboardCourse): number {
  return course.masteredCount + course.learningCount
}

export type TodayState =
  | {
      status: "review"
      /** Due in the focus course only: the session its button opens. */
      dueCount: number
      minutes: number
      focusCourse: DashboardCourse
    }
  | { status: "learn"; course: DashboardCourse }
  | {
      status: "caught-up"
      /** The hero's course: where "keep going" leads, or the focus course. */
      course: DashboardCourse
      keepGoing: KeepGoing | null
    }
  | { status: "no-courses" }

/** Opt-in study for a learner who has finished everything scheduled today. */
export type KeepGoing = {
  course: DashboardCourse
  /** New cards past today's limit, 0 when the course has none left. */
  extraNew: number
  trickyCount: number
}

// Past this, the extra reviews new cards create start to pile up.
const EXTRA_NEW_CARDS = 10

function keepGoing(courses: readonly DashboardCourse[]): KeepGoing | null {
  const course = sortCourses(courses).find(
    (candidate) => candidate.unseenCount > 0 || candidate.trickyCount > 0
  )
  if (course === undefined) {
    return null
  }
  return {
    course,
    extraNew: Math.min(EXTRA_NEW_CARDS, course.unseenCount),
    trickyCount: course.trickyCount,
  }
}

export function todayState(courses: readonly DashboardCourse[]): TodayState {
  const focusCourse = selectFocusCourse(courses)
  if (focusCourse === null) {
    return { status: "no-courses" }
  }

  // The focus course is the one with the most due, so if it has none, nothing is due.
  // Only its count is shown, so the number matches the session the button opens.
  if (focusCourse.dueCount > 0) {
    return {
      status: "review",
      dueCount: focusCourse.dueCount,
      minutes: estimateMinutes(focusCourse.dueCount),
      focusCourse,
    }
  }

  if (focusCourse.newAvailable > 0) {
    return { status: "learn", course: focusCourse }
  }

  const more = keepGoing(courses)
  return {
    status: "caught-up",
    course: more?.course ?? focusCourse,
    keepGoing: more,
  }
}

/** What the tip card shows. `null` hides it. */
export type Tip =
  | { kind: "tricky"; course: DashboardCourse }
  | { kind: "study" }

/**
 * Tricky words of the course most in need (so the hero's comes first), else a study tip.
 * Hidden when the all-done hero already offers to practice the same words.
 */
export function tipFor(
  courses: readonly DashboardCourse[],
  today: TodayState
): Tip | null {
  const course = sortCourses(courses).find(
    (candidate) => candidate.trickyCount > 0
  )
  if (course === undefined) {
    return { kind: "study" }
  }
  const heroPractices =
    today.status === "caught-up" &&
    today.keepGoing !== null &&
    today.keepGoing.trickyCount > 0 &&
    today.keepGoing.course.courseId === course.courseId
  return heroPractices ? null : { kind: "tricky", course }
}

export type CourseAction = {
  courseId: string
  mode: "review" | "learn"
  count: number
}

/** Review when anything is due, otherwise learn new cards, otherwise nothing. */
export function courseAction(course: DashboardCourse): CourseAction | null {
  if (course.dueCount > 0) {
    return { courseId: course.courseId, mode: "review", count: course.dueCount }
  }
  if (course.newAvailable > 0) {
    return {
      courseId: course.courseId,
      mode: "learn",
      count: course.newAvailable,
    }
  }
  return null
}

function dayOn(
  days: readonly DailyStudy[],
  date: Date
): DailyStudy | undefined {
  const key = localDateKey(date)
  return days.find((day) => day.date === key)
}

export function studiedOn(days: readonly DailyStudy[], date: Date): number {
  return dayOn(days, date)?.cardsStudied ?? 0
}

/** How much work a day saw. The rule and the marks are in REDESIGN.md section 5.7. */
export type WeekDayStatus = "met" | "partial" | "none" | "upcoming"

export type WeekDay = {
  date: Date
  isToday: boolean
  status: WeekDayStatus
  /** Words studied or reviewed that day. */
  studied: number
}

/**
 * The calendar week containing `now`, starting on `firstDayOfWeek` (1 = Monday … 7 = Sunday).
 * A day is "met" by reaching the target or clearing everything scheduled. Days without a record had no study.
 */
export function weekDays(
  now: Date,
  firstDayOfWeek: number,
  days: readonly DailyStudy[],
  target: number,
  clearedToday: boolean
): WeekDay[] {
  const todayKey = localDateKey(now)
  const offset = (now.getDay() - (firstDayOfWeek % 7) + 7) % 7
  const start = addDays(now, -offset)

  return Array.from({ length: 7 }, (_, index) => {
    const date = addDays(start, index)
    const key = localDateKey(date)
    const isToday = key === todayKey
    const day = dayOn(days, date)
    const studied = day?.cardsStudied ?? 0
    const cleared = isToday ? clearedToday : (day?.cleared ?? false)
    const status: WeekDayStatus =
      key > todayKey
        ? "upcoming"
        : cleared || studied >= target
          ? "met"
          : studied > 0
            ? "partial"
            : "none"
    return { date, isToday, status, studied }
  })
}

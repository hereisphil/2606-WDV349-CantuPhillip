import type { CourseSummary } from "@workspace/schemas/api/courses"
import type { StudyHistoryData } from "@workspace/schemas/api/history"
import { addDays, localDateKey } from "@/lib/dates"

/** A course from `GET /api/courses` (#112). Only a study session needs `answerLanguage`, so previews leave it out. */
export type DashboardCourse = Omit<CourseSummary, "answerLanguage">

export type DailyStudy = {
  /** Calendar date in the learner's time zone, "YYYY-MM-DD". */
  date: string
  /** Reviews plus first-time new cards. */
  cardsStudied: number
  /**
   * Nothing was left due and the new-card limit was used up by the end of
   * the day. Counts as meeting the goal. Today reads the live course counts.
   */
  cleared: boolean
}

export type ProgressTrendsData = {
  /** Reviews remembered over the last 30 days. `null` before any. */
  retentionPercent: number | null
  newCardsThisMonth: number
}

export type DashboardMetrics = {
  courses: readonly DashboardCourse[]
  dailyGoal: {
    /** Cards studied per day, reviews and new cards together. */
    target: number
    /** The last 7 days including today, oldest first. Missing days had no study. */
    days: readonly DailyStudy[]
  }
  /** Days of study, REDESIGN.md section 5.7. */
  daysOfStudy: number
  progressTrends: ProgressTrendsData
}

// Relative to page load so "2 hours ago" stays true whenever the prototype is opened.
const seededAt = Date.now()

export function hoursAgo(hours: number): string {
  return new Date(seededAt - hours * 60 * 60 * 1000).toISOString()
}

function recentDays(
  cardsOldestFirst: readonly number[],
  clearedDaysAgo: readonly number[] = []
): DailyStudy[] {
  const today = new Date(seededAt)
  const lastIndex = cardsOldestFirst.length - 1
  return cardsOldestFirst.map((cardsStudied, index) => ({
    date: localDateKey(addDays(today, index - lastIndex)),
    cardsStudied,
    cleared: clearedDaysAgo.includes(lastIndex - index),
  }))
}

// The `?preview=` snapshots start from this. The live dashboard never reads it.
export const prototypeDashboardMetrics = {
  courses: [
    {
      courseId: "spanish-core-1000",
      title: "Spanish Core 1000",
      learningLanguage: "es",
      dueCount: 16,
      newAvailable: 10,
      masteredCount: 52,
      learningCount: 148,
      unseenCount: 800,
      trickyCount: 4,
      lastReviewedAt: hoursAgo(2),
    },
    {
      courseId: "japanese-kana",
      title: "Japanese Hiragana & Katakana",
      learningLanguage: "ja",
      dueCount: 8,
      newAvailable: 5,
      masteredCount: 18,
      learningCount: 40,
      unseenCount: 34,
      trickyCount: 3,
      lastReviewedAt: hoursAgo(26),
    },
    {
      courseId: "french-travel-phrases",
      title: "French Travel Phrases",
      learningLanguage: "fr",
      dueCount: 0,
      newAvailable: 10,
      masteredCount: 20,
      learningCount: 30,
      unseenCount: 200,
      trickyCount: 0,
      lastReviewedAt: hoursAgo(72),
    },
    {
      courseId: "portuguese-essentials",
      title: "Portuguese Essentials",
      learningLanguage: "pt",
      dueCount: 0,
      newAvailable: 0,
      masteredCount: 10,
      learningCount: 30,
      unseenCount: 80,
      trickyCount: 0,
      lastReviewedAt: hoursAgo(24 * 14),
    },
  ],
  dailyGoal: {
    target: 50,
    days: recentDays([12, 50, 64, 31, 0, 55, 24], [3]),
  },
  daysOfStudy: 12,
  progressTrends: {
    retentionPercent: 84,
    newCardsThisMonth: 142,
  },
} as const satisfies DashboardMetrics

/**
 * Courses from `GET /api/courses`, the rest from `GET /api/history` (the review log).
 * Past days are never `cleared`: the log can't tell yet. Today reads live course counts (`todayState`).
 */
export function metricsFromApi(
  courses: readonly DashboardCourse[],
  history: StudyHistoryData
): DashboardMetrics {
  return {
    courses,
    dailyGoal: {
      target: history.dailyGoal,
      days: history.days.map((day) => ({
        date: day.date,
        cardsStudied: day.wordsStudied,
        cleared: false,
      })),
    },
    daysOfStudy: history.daysOfStudy,
    progressTrends: {
      retentionPercent: history.retentionPercent,
      newCardsThisMonth: history.newWordsThisMonth,
    },
  }
}

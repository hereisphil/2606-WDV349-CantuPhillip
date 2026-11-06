import { addDays, localDateKey } from "@/lib/dates"

/**
 * Dashboard contract. #112 replaces {@link prototypeDashboardMetrics}
 * with Hono/D1 data of this same shape. Component markup stays put.
 */
export type DashboardDeck = {
  courseId: string
  title: string
  /** BCP 47 tag for the deck's content. Never the viewer's `uiLocale`. */
  learningLanguage: string
  dueCount: number
  /** New cards the learner can start today, after the daily new-card limit. */
  newAvailable: number
  masteredCount: number
  learningCount: number
  unseenCount: number
  /** ISO 8601 UTC, or null when the deck has never been studied. */
  lastReviewedAt: string | null
}

export type DailyReviews = {
  /** Calendar date in the learner's time zone, "YYYY-MM-DD". */
  date: string
  reviewsCompleted: number
}

export type ProgressTrendsData = {
  consistencyPercent: number
  consistencyWeeklyChangePercent: number
  retentionPercent: number
  retentionGlobalAveragePercent: number
  newCardsThisMonth: number
  rankLabel: string
  rankCohort: string
}

export type DashboardMetrics = {
  decks: readonly DashboardDeck[]
  dailyGoal: {
    reviewTarget: number
    /** The last 7 days including today, oldest first. Missing days had no reviews. */
    days: readonly DailyReviews[]
  }
  progressTrends: ProgressTrendsData
}

// Relative to page load so "2 hours ago" stays true whenever the prototype is opened.
const seededAt = Date.now()

function hoursAgo(hours: number): string {
  return new Date(seededAt - hours * 60 * 60 * 1000).toISOString()
}

function recentDays(reviewsOldestFirst: readonly number[]): DailyReviews[] {
  const today = new Date(seededAt)
  const lastIndex = reviewsOldestFirst.length - 1
  return reviewsOldestFirst.map((reviewsCompleted, index) => ({
    date: localDateKey(addDays(today, index - lastIndex)),
    reviewsCompleted,
  }))
}

// Prototype stand-in for usr_prototype_01. #112 replaces this value.
export const prototypeDashboardMetrics = {
  decks: [
    {
      courseId: "spanish-core-1000",
      title: "Spanish Core 1000",
      learningLanguage: "es",
      dueCount: 16,
      newAvailable: 10,
      masteredCount: 52,
      learningCount: 148,
      unseenCount: 800,
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
      lastReviewedAt: hoursAgo(24 * 14),
    },
  ],
  dailyGoal: {
    reviewTarget: 50,
    days: recentDays([12, 50, 64, 31, 50, 55, 24]),
  },
  progressTrends: {
    consistencyPercent: 98,
    consistencyWeeklyChangePercent: 2,
    retentionPercent: 84,
    retentionGlobalAveragePercent: 75,
    newCardsThisMonth: 142,
    rankLabel: "Top 5%",
    rankCohort: "Among Spanish learners",
  },
} as const satisfies DashboardMetrics

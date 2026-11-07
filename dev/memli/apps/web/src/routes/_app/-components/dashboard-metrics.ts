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
  /** Cards in this deck the learner keeps forgetting. */
  trickyCount: number
  /** ISO 8601 UTC, or null when the deck has never been studied. */
  lastReviewedAt: string | null
}

export type DailyStudy = {
  /** Calendar date in the learner's time zone, "YYYY-MM-DD". */
  date: string
  /** Reviews plus first-time new cards. */
  cardsStudied: number
  /**
   * Nothing was left due and the new-card limit was used up by the end of
   * the day. Counts as meeting the goal. Today reads the live deck counts.
   */
  cleared: boolean
}

/** A card the learner keeps forgetting (FSRS calls these leeches). */
export type TrickyWord = {
  cardId: string
  courseId: string
  term: string
  /** BCP 47 tag of `term`, so screen readers pronounce it correctly. */
  learningLanguage: string
  lapses: number
}

export type ProgressTrendsData = {
  consistencyPercent: number
  consistencyWeeklyChangePercent: number
  retentionPercent: number
  retentionGlobalAveragePercent: number
  newCardsThisMonth: number
}

export type DashboardMetrics = {
  decks: readonly DashboardDeck[]
  dailyGoal: {
    /** Cards studied per day, reviews and new cards together. */
    target: number
    /** The last 7 days including today, oldest first. Missing days had no study. */
    days: readonly DailyStudy[]
  }
  trickyWords: {
    total: number
    /** The most-forgotten few, most lapses first. */
    words: readonly TrickyWord[]
  }
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
    days: recentDays([12, 50, 64, 31, 50, 55, 24], [3]),
  },
  trickyWords: {
    total: 7,
    words: [
      {
        cardId: "es-aprovechar",
        courseId: "spanish-core-1000",
        term: "aprovechar",
        learningLanguage: "es",
        lapses: 6,
      },
      {
        cardId: "ja-nu",
        courseId: "japanese-kana",
        term: "ぬ",
        learningLanguage: "ja",
        lapses: 5,
      },
      {
        cardId: "es-embarazada",
        courseId: "spanish-core-1000",
        term: "embarazada",
        learningLanguage: "es",
        lapses: 5,
      },
      {
        cardId: "ja-re",
        courseId: "japanese-kana",
        term: "れ",
        learningLanguage: "ja",
        lapses: 4,
      },
      {
        cardId: "es-desarrollar",
        courseId: "spanish-core-1000",
        term: "desarrollar",
        learningLanguage: "es",
        lapses: 4,
      },
    ],
  },
  progressTrends: {
    consistencyPercent: 98,
    consistencyWeeklyChangePercent: 2,
    retentionPercent: 84,
    retentionGlobalAveragePercent: 75,
    newCardsThisMonth: 142,
  },
} as const satisfies DashboardMetrics

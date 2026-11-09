import {
  hoursAgo,
  prototypeDashboardMetrics as base,
  type DashboardDeck,
  type DashboardMetrics,
} from "./dashboard-metrics"

/** A seeded dashboard state for `?preview=` in development builds. */
export type DashboardPreview = {
  metrics: DashboardMetrics
  /** Overrides the viewer's streak, which lives on the session, not the dashboard. */
  streakDays?: number
}

const noTrickyWords = { total: 0, words: [] }

function withToday(cardsStudied: number): DashboardMetrics["dailyGoal"] {
  const days = base.dailyGoal.days
  return {
    ...base.dailyGoal,
    days: days.map((day, index) =>
      index === days.length - 1 ? { ...day, cardsStudied } : day
    ),
  }
}

function deck(
  courseId: string,
  title: string,
  learningLanguage: string,
  counts: Partial<DashboardDeck> = {}
): DashboardDeck {
  return {
    courseId,
    title,
    learningLanguage,
    dueCount: 0,
    newAvailable: 10,
    masteredCount: 20,
    learningCount: 40,
    unseenCount: 140,
    trickyCount: 0,
    lastReviewedAt: hoursAgo(48),
    ...counts,
  }
}

function buildManyDecks(): DashboardDeck[] {
  return [
    ...base.decks,
    deck("german-a1", "German A1 Foundations", "de", {
      dueCount: 5,
      lastReviewedAt: hoursAgo(5),
    }),
    deck("italian-food", "Italian at the Table", "it", { dueCount: 3 }),
    deck("korean-hangul", "Korean Hangul in a Week", "ko", { dueCount: 2 }),
    deck("mandarin-hsk1", "Mandarin HSK 1", "zh", { newAvailable: 0 }),
    deck("arabic-script", "Arabic Script Basics", "ar", {
      lastReviewedAt: null,
      masteredCount: 0,
      learningCount: 0,
    }),
    deck("dutch-verbs", "Dutch Irregular Verbs", "nl", {
      lastReviewedAt: hoursAgo(24 * 40),
    }),
    deck("swedish-travel", "Swedish for Travelers", "sv", { newAvailable: 0 }),
    deck("polish-cases", "Polish Noun Cases", "pl", { dueCount: 1 }),
  ]
}

/** Several decks in one learning language, so the language filter stays hidden. */
function buildSameLanguageDecks(): DashboardDeck[] {
  return [
    ...base.decks.slice(0, 1),
    deck("spanish-verbs", "Spanish Verb Conjugations", "es", {
      dueCount: 12,
      trickyCount: 2,
      lastReviewedAt: hoursAgo(20),
    }),
    deck("spanish-travel", "Spanish for Travelers", "es", {
      dueCount: 4,
      lastReviewedAt: hoursAgo(30),
    }),
    deck("spanish-food", "Spanish at the Table", "es", {
      newAvailable: 8,
      lastReviewedAt: hoursAgo(72),
    }),
    deck("spanish-idioms", "Everyday Spanish Idioms", "es", {
      newAvailable: 0,
      lastReviewedAt: hoursAgo(24 * 6),
    }),
    deck("spanish-subjunctive", "The Spanish Subjunctive", "es", {
      lastReviewedAt: null,
      masteredCount: 0,
      learningCount: 0,
    }),
    deck("spanish-false-friends", "Spanish False Friends", "es", {
      newAvailable: 0,
      masteredCount: 90,
      learningCount: 10,
      unseenCount: 0,
      lastReviewedAt: hoursAgo(24 * 21),
    }),
    deck("spanish-numbers", "Spanish Numbers & Time", "es", {
      dueCount: 2,
      lastReviewedAt: hoursAgo(24 * 3),
    }),
  ]
}

export const previewNames = [
  "default",
  "no-decks",
  "learn",
  "caught-up",
  "finished",
  "goal-met",
  "one-deck",
  "many-decks",
  "same-language",
  "long-titles",
  "large-numbers",
] as const

export type PreviewName = (typeof previewNames)[number]

function buildPreviews(): Record<PreviewName, DashboardPreview> {
  return {
    default: { metrics: base },
    "no-decks": {
      metrics: {
        ...base,
        decks: [],
        dailyGoal: { ...base.dailyGoal, days: [] },
        trickyWords: noTrickyWords,
      },
      streakDays: 0,
    },
    learn: {
      metrics: {
        ...base,
        decks: base.decks.map((d) => ({ ...d, dueCount: 0 })),
      },
    },
    "caught-up": {
      metrics: {
        ...base,
        decks: base.decks.map((d) => ({ ...d, dueCount: 0, newAvailable: 0 })),
      },
    },
    finished: {
      metrics: {
        ...base,
        decks: [
          deck("spanish-core-1000", "Spanish Core 1000", "es", {
            newAvailable: 0,
            masteredCount: 640,
            learningCount: 360,
            unseenCount: 0,
            lastReviewedAt: hoursAgo(1),
          }),
        ],
        dailyGoal: withToday(18),
        trickyWords: noTrickyWords,
      },
    },
    "goal-met": {
      metrics: {
        ...base,
        decks: base.decks.map((d) => ({ ...d, dueCount: 0 })),
        dailyGoal: withToday(56),
      },
    },
    "one-deck": {
      metrics: {
        ...base,
        decks: base.decks.slice(0, 1),
        trickyWords: {
          total: 4,
          words: base.trickyWords.words.filter(
            (word) => word.courseId === "spanish-core-1000"
          ),
        },
      },
      streakDays: 1,
    },
    "many-decks": { metrics: { ...base, decks: buildManyDecks() } },
    "same-language": {
      metrics: {
        ...base,
        decks: buildSameLanguageDecks(),
        trickyWords: {
          total: 6,
          words: base.trickyWords.words.filter(
            (word) => word.learningLanguage === "es"
          ),
        },
      },
    },
    "long-titles": {
      metrics: {
        ...base,
        decks: [
          deck(
            "spanish-healthcare",
            "Spanish for Healthcare Professionals: Clinical Vocabulary, Patient Interviews, and Emergency Phrases",
            "es",
            { dueCount: 14, lastReviewedAt: hoursAgo(1) }
          ),
          deck(
            "german-compounds",
            "Donaudampfschifffahrtsgesellschaftskapitänsmützen und andere zusammengesetzte Wörter",
            "de",
            { dueCount: 9 }
          ),
          deck(
            "japanese-business",
            "Japanese Business Etiquette, Keigo, and Formal Email Writing for the Workplace",
            "ja",
            { newAvailable: 0 }
          ),
        ],
      },
    },
    "large-numbers": {
      metrics: {
        ...base,
        decks: base.decks.map((d, index) =>
          index === 0
            ? {
                ...d,
                dueCount: 1284,
                newAvailable: 250,
                masteredCount: 12450,
                learningCount: 8320,
                unseenCount: 4230,
              }
            : d
        ),
        dailyGoal: {
          target: 300,
          days: base.dailyGoal.days.map((day, index, days) => ({
            ...day,
            cardsStudied:
              index === days.length - 1 ? 318 : day.cardsStudied * 6,
          })),
        },
        trickyWords: { ...base.trickyWords, total: 1532 },
        progressTrends: { ...base.progressTrends, newCardsThisMonth: 24318 },
      },
      streakDays: 1000,
    },
  }
}

// Pure so production builds, which never read it, drop the snapshots entirely.
export const dashboardPreviews = /* @__PURE__ */ buildPreviews()

export function isPreviewName(value: unknown): value is PreviewName {
  return previewNames.some((name) => name === value)
}

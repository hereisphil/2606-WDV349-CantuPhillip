import type { DueReviewData } from "./DueReviewAlert"
import type { LearningQuickStatsData } from "./LearningQuickStats"
import type { ProgressTrendsData } from "./ProgressTrends"

/**
 * Dashboard metric contract. #112 replaces {@link prototypeDashboardMetrics}
 * with Hono/D1 aggregates of this same shape. Component markup stays put.
 */
export type DashboardMetrics = {
  dueReview: DueReviewData
  quickStats: LearningQuickStatsData
  progressTrends: ProgressTrendsData
}

// Prototype stand-in for usr_prototype_01. #112 replaces this value.
export const prototypeDashboardMetrics = {
  dueReview: {
    dueCount: 24,
  },
  quickStats: {
    termsLearned: 100,
    dailyReviewsCompleted: 24,
    dailyReviewTarget: 50,
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

import {
  prototypeDashboardMetrics,
  type DashboardDeck,
} from "../../_app/-components/dashboard-metrics"

export type StudyMode = "review" | "learn" | "practice"

/** The deck behind a study session. #112 swaps the seeded decks for the API. */
export function findCourse(courseId: string): DashboardDeck | null {
  return (
    prototypeDashboardMetrics.decks.find(
      (deck) => deck.courseId === courseId
    ) ?? null
  )
}

/**
 * How many cards the session starts with. `extra` adds new cards past
 * today's limit, and only applies to `learn`.
 */
export function sessionQueueSize(
  deck: DashboardDeck,
  mode: StudyMode,
  extra: number | undefined
): number {
  switch (mode) {
    case "review":
      return deck.dueCount
    case "learn":
      return Math.min(deck.unseenCount, deck.newAvailable + (extra ?? 0))
    case "practice":
      return deck.trickyCount
  }
}

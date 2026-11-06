import type { DashboardDeck } from "./dashboard-metrics"

// Rough review pace until #112 can measure it from review history.
const SECONDS_PER_REVIEW = 8

export function estimateMinutes(cardCount: number): number {
  if (cardCount <= 0) {
    return 0
  }
  return Math.max(1, Math.ceil((cardCount * SECONDS_PER_REVIEW) / 60))
}

export function totalDue(decks: readonly DashboardDeck[]): number {
  return decks.reduce((sum, deck) => sum + deck.dueCount, 0)
}

export function totalMastered(decks: readonly DashboardDeck[]): number {
  return decks.reduce((sum, deck) => sum + deck.masteredCount, 0)
}

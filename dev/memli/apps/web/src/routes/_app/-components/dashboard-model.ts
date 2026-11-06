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

function compareRecency(a: DashboardDeck, b: DashboardDeck): number {
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

/** Most due first; then decks with new cards; ties go to the most recently studied. */
function compareByNeed(a: DashboardDeck, b: DashboardDeck): number {
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

function selectFocusDeck(
  decks: readonly DashboardDeck[]
): DashboardDeck | null {
  return [...decks].sort(compareByNeed)[0] ?? null
}

export type TodayState =
  | {
      status: "review"
      dueCount: number
      minutes: number
      dueDecks: DashboardDeck[]
      focusDeck: DashboardDeck
    }
  | { status: "learn"; deck: DashboardDeck }
  | { status: "caught-up" }
  | { status: "no-decks" }

export function todayState(decks: readonly DashboardDeck[]): TodayState {
  const focusDeck = selectFocusDeck(decks)
  if (focusDeck === null) {
    return { status: "no-decks" }
  }

  const dueCount = totalDue(decks)
  if (dueCount > 0) {
    return {
      status: "review",
      dueCount,
      minutes: estimateMinutes(dueCount),
      dueDecks: decks.filter((deck) => deck.dueCount > 0).sort(compareByNeed),
      focusDeck,
    }
  }

  if (focusDeck.newAvailable > 0) {
    return { status: "learn", deck: focusDeck }
  }

  return { status: "caught-up" }
}

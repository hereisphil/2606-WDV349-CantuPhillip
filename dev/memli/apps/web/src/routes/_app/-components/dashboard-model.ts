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

export function sortDecks(decks: readonly DashboardDeck[]): DashboardDeck[] {
  return [...decks].sort(compareByNeed)
}

export function selectFocusDeck(
  decks: readonly DashboardDeck[]
): DashboardDeck | null {
  return sortDecks(decks)[0] ?? null
}

export function deckTotal(deck: DashboardDeck): number {
  return deck.masteredCount + deck.learningCount + deck.unseenCount
}

/** 0–1. A deck with no cards counts as 0% mastered. */
export function masteredRatio(deck: DashboardDeck): number {
  const total = deckTotal(deck)
  return total > 0 ? deck.masteredCount / total : 0
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
      dueDecks: sortDecks(decks).filter((deck) => deck.dueCount > 0),
      focusDeck,
    }
  }

  if (focusDeck.newAvailable > 0) {
    return { status: "learn", deck: focusDeck }
  }

  return { status: "caught-up" }
}

export type DeckAction = {
  courseId: string
  mode: "review" | "learn"
  count: number
}

/** Review when anything is due, otherwise learn new cards, otherwise nothing. */
export function deckAction(deck: DashboardDeck): DeckAction | null {
  if (deck.dueCount > 0) {
    return { courseId: deck.courseId, mode: "review", count: deck.dueCount }
  }
  if (deck.newAvailable > 0) {
    return { courseId: deck.courseId, mode: "learn", count: deck.newAvailable }
  }
  return null
}

/** Where the Today panel's primary action leads, so other regions don't repeat it. */
export function todayPrimaryAction(state: TodayState): DeckAction | null {
  switch (state.status) {
    case "review":
      return deckAction(state.focusDeck)
    case "learn":
      return deckAction(state.deck)
    case "caught-up":
    case "no-decks":
      return null
  }
}

export function isSameAction(
  a: DeckAction | null,
  b: DeckAction | null
): boolean {
  return (
    a !== null && b !== null && a.courseId === b.courseId && a.mode === b.mode
  )
}

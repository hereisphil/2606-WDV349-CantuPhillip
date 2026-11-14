import { addDays, localDateKey } from "@/lib/dates"
import type { DailyStudy, DashboardDeck } from "./dashboard-metrics"

// Rough review pace until #112 can measure it from review history.
const SECONDS_PER_REVIEW = 8

function estimateMinutes(cardCount: number): number {
  if (cardCount <= 0) {
    return 0
  }
  return Math.max(1, Math.ceil((cardCount * SECONDS_PER_REVIEW) / 60))
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

/** Each learning language once, in the order its first deck appears. */
export function learningLanguages(decks: readonly DashboardDeck[]): string[] {
  return [...new Set(decks.map((deck) => deck.learningLanguage))]
}

export function selectFocusDeck(
  decks: readonly DashboardDeck[]
): DashboardDeck | null {
  return sortDecks(decks)[0] ?? null
}

export function deckTotal(deck: DashboardDeck): number {
  return deck.masteredCount + deck.learningCount + deck.unseenCount
}

/** Words the learner has met: mastered plus still learning. */
export function startedCount(deck: DashboardDeck): number {
  return deck.masteredCount + deck.learningCount
}

export type TodayState =
  | {
      status: "review"
      /** Due in the focus course only: the session its button opens. */
      dueCount: number
      minutes: number
      focusDeck: DashboardDeck
    }
  | { status: "learn"; deck: DashboardDeck }
  | {
      status: "caught-up"
      /** The hero's course: where "keep going" leads, or the focus course. */
      deck: DashboardDeck
      keepGoing: KeepGoing | null
    }
  | { status: "no-decks" }

/** Opt-in study for a learner who has finished everything scheduled today. */
export type KeepGoing = {
  deck: DashboardDeck
  /** New cards past today's limit, 0 when the deck has none left. */
  extraNew: number
  trickyCount: number
}

// Past this, the extra reviews new cards create start to pile up.
const EXTRA_NEW_CARDS = 10

function keepGoing(decks: readonly DashboardDeck[]): KeepGoing | null {
  const deck = sortDecks(decks).find(
    (candidate) => candidate.unseenCount > 0 || candidate.trickyCount > 0
  )
  if (deck === undefined) {
    return null
  }
  return {
    deck,
    extraNew: Math.min(EXTRA_NEW_CARDS, deck.unseenCount),
    trickyCount: deck.trickyCount,
  }
}

export function todayState(decks: readonly DashboardDeck[]): TodayState {
  const focusDeck = selectFocusDeck(decks)
  if (focusDeck === null) {
    return { status: "no-decks" }
  }

  // The focus course is the one with the most due, so if it has none, nothing is due.
  // Only its count is shown, so the number matches the session the button opens.
  if (focusDeck.dueCount > 0) {
    return {
      status: "review",
      dueCount: focusDeck.dueCount,
      minutes: estimateMinutes(focusDeck.dueCount),
      focusDeck,
    }
  }

  if (focusDeck.newAvailable > 0) {
    return { status: "learn", deck: focusDeck }
  }

  const more = keepGoing(decks)
  return { status: "caught-up", deck: more?.deck ?? focusDeck, keepGoing: more }
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
 * The calendar week containing `now`, starting on `firstDayOfWeek`
 * (1 = Monday … 7 = Sunday). A day meets the goal by reaching the target
 * or by clearing everything scheduled. Otherwise, past days and today are
 * "partial" when some words were studied and "none" when none were.
 * Days without a record had no study.
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

import type { ReviewOutcome } from "../srs/outcome"
import type { ProgressState } from "../srs/progress"

/**
 * A learner's study history from their review log: the words studied each
 * day, days of study, how often reviews were remembered, and new words this
 * month. Pure, like the rest of core: the API loads the reviews and passes
 * in `now` and the learner's time zone.
 *
 * Days are calendar days where the learner is. A review at 11 pm in Mexico
 * City is on that day, even though it is already tomorrow in UTC.
 */

/** Words a day of study aims for. One goal for everyone until learners can set their own. */
export const DAILY_GOAL_WORDS = 50

/** How far back "reviews remembered" looks. */
export const RETENTION_WINDOW_DAYS = 30

/** The days the week view can show: today and the six before it. */
export const HISTORY_DAYS = 7

/** What the history needs from one review-log row. */
export type HistoryReview = {
  readonly cardId: string
  /** UTC ISO 8601. */
  readonly reviewedAt: string
  readonly outcome: ReviewOutcome
  /** The card's state going into the review. `new` means first seen. */
  readonly priorState: ProgressState
}

export type StudyDay = {
  /** Calendar date where the learner is, "YYYY-MM-DD". */
  readonly date: string
  /** Different words studied or reviewed that day. A word seen twice counts once. */
  readonly wordsStudied: number
}

export type StudyHistory = {
  /** Words per day studied counts toward. */
  readonly dailyGoal: number
  /** Today and the six days before it, oldest first. */
  readonly days: readonly StudyDay[]
  /** REDESIGN.md section 5.7. */
  readonly daysOfStudy: number
  /**
   * Reviews of words already met that were not missed, as a whole percent,
   * over the last 30 days. `null` with no such reviews yet.
   */
  readonly retentionPercent: number | null
  /** Different words met for the first time this calendar month. */
  readonly newWordsThisMonth: number
}

/** The calendar date of an instant in a time zone, "YYYY-MM-DD". */
export function localDate(instant: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(instant)
  const part = (type: Intl.DateTimeFormatPartTypes): string =>
    parts.find((p) => p.type === type)?.value ?? ""
  return `${part("year")}-${part("month")}-${part("day")}`
}

/** A "YYYY-MM-DD" date `days` later (or earlier, when negative). */
export function shiftDate(date: string, days: number): string {
  const [year = 0, month = 1, day = 1] = date.split("-").map(Number)
  return new Date(Date.UTC(year, month - 1, day + days))
    .toISOString()
    .slice(0, 10)
}

/**
 * Days of study (REDESIGN.md section 5.7), counting back from `today`:
 *
 * 1. Any study counts: one word reviewed or learned makes a study day.
 * 2. Never miss twice: one day off is forgiven, a second in a row ends the count.
 * 3. Only study days are counted, never a forgiven day off.
 * 4. Today is never a miss yet.
 *
 * `studyDates` are the calendar dates with any study, in any order.
 */
export function daysOfStudy(
  studyDates: Iterable<string>,
  today: string
): number {
  const studied = new Set(studyDates)
  let earliest: string | null = null
  for (const date of studied) {
    if (earliest === null || date < earliest) earliest = date
  }
  if (earliest === null) return 0

  let count = 0
  let missedInARow = 0
  // "YYYY-MM-DD" strings sort in date order, so the walk stops at the first study day.
  for (let date = today; date >= earliest; date = shiftDate(date, -1)) {
    if (studied.has(date)) {
      count += 1
      missedInARow = 0
    } else if (date !== today) {
      // Today is skipped, not missed: it is not over yet.
      missedInARow += 1
      if (missedInARow === 2) break
    }
  }
  return count
}

/**
 * Words met for the first time on `date`, by course. The daily new-word
 * limit counts them, so a learner who started 10 today is offered no more.
 */
export function newWordsStartedOn(
  reviews: readonly (HistoryReview & { readonly courseId: string })[],
  date: string,
  timeZone: string
): Map<string, number> {
  const cardsByCourse = new Map<string, Set<string>>()
  for (const review of reviews) {
    if (review.priorState !== "new") continue
    if (localDate(new Date(review.reviewedAt), timeZone) !== date) continue
    const cards = cardsByCourse.get(review.courseId) ?? new Set<string>()
    cards.add(review.cardId)
    cardsByCourse.set(review.courseId, cards)
  }
  return new Map(
    [...cardsByCourse].map(([courseId, cards]) => [courseId, cards.size])
  )
}

/**
 * Sums up the history.
 *
 * `reviews` must cover at least the last 31 days, so the month and the
 * retention window are whole. `studyDates` are every date with study, which
 * days of study can reach back through.
 */
export function summarizeHistory({
  reviews,
  studyDates,
  now,
  timeZone,
}: {
  reviews: readonly HistoryReview[]
  studyDates: Iterable<string>
  now: Date
  timeZone: string
}): StudyHistory {
  const today = localDate(now, timeZone)
  const month = today.slice(0, 7)
  const firstDay = shiftDate(today, -(HISTORY_DAYS - 1))
  const retentionSince = now.getTime() - RETENTION_WINDOW_DAYS * 86_400_000

  const wordsByDay = new Map<string, Set<string>>()
  const newThisMonth = new Set<string>()
  let recalls = 0
  let remembered = 0

  for (const review of reviews) {
    const at = new Date(review.reviewedAt)
    const date = localDate(at, timeZone)
    if (date >= firstDay && date <= today) {
      const words = wordsByDay.get(date) ?? new Set<string>()
      words.add(review.cardId)
      wordsByDay.set(date, words)
    }
    if (review.priorState === "new") {
      if (date.slice(0, 7) === month) newThisMonth.add(review.cardId)
    } else if (at.getTime() >= retentionSince) {
      // A first sighting is not a test of memory; every later review is.
      recalls += 1
      if (review.outcome !== "missed") remembered += 1
    }
  }

  return {
    dailyGoal: DAILY_GOAL_WORDS,
    days: Array.from({ length: HISTORY_DAYS }, (_, index) => {
      const date = shiftDate(firstDay, index)
      return { date, wordsStudied: wordsByDay.get(date)?.size ?? 0 }
    }),
    daysOfStudy: daysOfStudy(studyDates, today),
    retentionPercent:
      recalls === 0 ? null : Math.round((remembered / recalls) * 100),
    newWordsThisMonth: newThisMonth.size,
  }
}

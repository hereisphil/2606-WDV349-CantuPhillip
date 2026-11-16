import { isDue, type CardProgress } from "../srs/progress"

/**
 * Where a learner stands in a course, and which cards a study session holds.
 * One set of rules for both, so a count on the dashboard always matches the
 * session its button opens.
 *
 * Pure: the API (or a mobile app working offline) loads the progress and
 * passes it in with `now`.
 */

/** New words offered per course each day. Learning more is the learner's choice (`extra`). */
export const DAILY_NEW_CARD_LIMIT = 10

/**
 * A word counts as learned once FSRS expects it to be remembered for three
 * weeks. Stability is measured in days, so this is the usual flashcard line
 * between a "young" and a "mature" card.
 */
export const MASTERED_STABILITY_DAYS = 21

/** Forgotten this many times after being learned, a word is tricky. */
export const TRICKY_LAPSES = 3

/** The three kinds of session: what is due, new words, or tricky words. */
export type StudyMode = "review" | "learn" | "practice"

/** The learner has reviewed this card at least once. */
export function isSeen(progress: CardProgress): boolean {
  return progress.state !== "new"
}

export function isMastered(progress: CardProgress): boolean {
  return (
    progress.state === "review" && progress.stability >= MASTERED_STABILITY_DAYS
  )
}

/**
 * The learner keeps forgetting it (FSRS calls these leeches). A word stops
 * being tricky once it is mastered, even though its lapses never go down.
 */
export function isTricky(progress: CardProgress): boolean {
  return progress.lapses >= TRICKY_LAPSES && !isMastered(progress)
}

export type CourseProgressSummary = {
  /** Seen cards that are due now. What a `review` session holds. */
  readonly dueCount: number
  /** New cards the learner can start today. What a `learn` session holds. */
  readonly newAvailable: number
  readonly masteredCount: number
  /** Seen, but not mastered yet. */
  readonly learningCount: number
  /** Never studied. Mastered, learning and unseen add up to the course. */
  readonly unseenCount: number
  /** What a `practice` session holds. */
  readonly trickyCount: number
  /** The latest review in the course; `null` if it has never been studied. */
  readonly lastReviewedAt: string | null
}

/**
 * New words the learner can still start today: the daily limit, less the
 * ones already started today, and never more than are left.
 */
function newWordsLeftToday(unseen: number, startedToday: number): number {
  return Math.min(unseen, Math.max(0, DAILY_NEW_CARD_LIMIT - startedToday))
}

/**
 * Sums up one course for one learner.
 *
 * `cardCount` is every card in the course. `progress` is the learner's saved
 * progress on them: one entry per card they have studied, none for the rest.
 * `newStartedToday` is how many of its words they met for the first time
 * today (`newWordsStartedOn` in `history.ts`).
 */
export function summarizeCourseProgress(
  cardCount: number,
  progress: readonly CardProgress[],
  now: Date,
  newStartedToday = 0
): CourseProgressSummary {
  const seen = progress.filter(isSeen)
  const masteredCount = seen.filter(isMastered).length
  const unseenCount = Math.max(0, cardCount - seen.length)

  let lastReviewedAt: string | null = null
  for (const { lastReview } of seen) {
    // ISO 8601 UTC strings sort in time order.
    if (
      lastReview !== null &&
      (lastReviewedAt === null || lastReview > lastReviewedAt)
    ) {
      lastReviewedAt = lastReview
    }
  }

  return {
    dueCount: seen.filter((card) => isDue(card, now)).length,
    newAvailable: newWordsLeftToday(unseenCount, newStartedToday),
    masteredCount,
    learningCount: seen.length - masteredCount,
    unseenCount,
    trickyCount: seen.filter(isTricky).length,
    lastReviewedAt,
  }
}

export type SessionCardsOptions = {
  readonly now: Date
  /** New cards past today's limit. Only `learn` uses it. */
  readonly extra?: number | undefined
  /** Words in this course first met today. Only `learn` uses it. */
  readonly newStartedToday?: number | undefined
}

/**
 * The cards one session holds, in the order to study them.
 *
 * `cards` is the whole course in course order, each with the learner's
 * progress (`createProgress` for a card they have never seen).
 *
 * - `review`: seen cards that are due, most overdue first.
 * - `learn`: unseen cards in course order, up to what is left of today's
 *   limit, plus `extra`.
 * - `practice`: tricky cards, most forgotten first.
 */
export function sessionCards<T extends { readonly progress: CardProgress }>(
  cards: readonly T[],
  mode: StudyMode,
  { now, extra, newStartedToday }: SessionCardsOptions
): T[] {
  switch (mode) {
    case "review":
      return cards
        .filter(({ progress }) => isSeen(progress) && isDue(progress, now))
        .sort((a, b) => compareText(a.progress.due, b.progress.due))
    case "learn": {
      const unseen = cards.filter(({ progress }) => !isSeen(progress))
      const allowed =
        newWordsLeftToday(unseen.length, newStartedToday ?? 0) +
        Math.max(0, extra ?? 0)
      return unseen.slice(0, allowed)
    }
    case "practice":
      return cards
        .filter(({ progress }) => isSeen(progress) && isTricky(progress))
        .sort((a, b) => b.progress.lapses - a.progress.lapses)
  }
}

function compareText(a: string, b: string): number {
  if (a === b) return 0
  return a < b ? -1 : 1
}

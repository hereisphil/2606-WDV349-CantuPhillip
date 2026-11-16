import { isDue, type CardProgress } from "../srs/progress"

// One set of rules for course progress and session cards, so a dashboard
// count always matches the session its button opens.

/** New words offered per course each day. Learning more is the learner's choice (`extra`). */
export const DAILY_NEW_CARD_LIMIT = 10

/** Stability in days that counts as mastered: the usual "mature card" line. */
export const MASTERED_STABILITY_DAYS = 21

/** Forgotten this many times after being learned, a word is tricky. */
export const TRICKY_LAPSES = 3

export type StudyMode = "review" | "learn" | "practice"

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
 * Sums up one course for one learner. `progress` has entries only for studied
 * cards; `newStartedToday` comes from `newWordsStartedOn` in history.ts.
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
 * One session's cards in study order. `cards` is the whole course in order,
 * unseen ones with `createProgress`. Modes: packages/core/README.md.
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

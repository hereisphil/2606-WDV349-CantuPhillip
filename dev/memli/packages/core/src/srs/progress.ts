import { State } from "ts-fsrs"
import { scheduler } from "./scheduler"

/**
 * An FSRS rating, 1 (forgot) to 4 (effortless). Learners never pick this
 * directly: the Rating Mapper turns a Memli outcome into one.
 */
export type FsrsRating = 1 | 2 | 3 | 4

export type ProgressState = "new" | "learning" | "review" | "relearning"

/**
 * One learner's memory of one card. Plain JSON, so the same value works in
 * React state, TanStack Query, an HTTP body, and a D1 row. Timestamps are UTC
 * ISO 8601 strings.
 */
export type CardProgress = {
  readonly cardId: string
  readonly state: ProgressState
  /** When the card should next be reviewed. */
  readonly due: string
  /** `null` until the first review. */
  readonly lastReview: string | null
  /** Days until recall probability falls to 90%. */
  readonly stability: number
  /** FSRS-7's short-term stability, which tracks same-day reviews. */
  readonly stabilityFast: number
  /** 1 (easy) to 10 (hard); 0 before the first review. */
  readonly difficulty: number
  readonly reps: number
  /** Times the card was forgotten after it had been learned. */
  readonly lapses: number
  /** Position in the learning or relearning steps. */
  readonly learningStep: number
  /** Days between `lastReview` and `due`. Fractional under FSRS-7. */
  readonly scheduledDays: number
}

/**
 * One review, for the learner's review history. The card fields describe the
 * card as it was *before* the review, which is what undo and future FSRS
 * parameter training need.
 */
export type ReviewLog = {
  readonly cardId: string
  readonly rating: FsrsRating
  readonly reviewedAt: string
  readonly state: ProgressState
  readonly due: string
  readonly lastReview: string | null
  readonly stability: number
  readonly stabilityFast: number
  readonly difficulty: number
  readonly learningStep: number
  readonly scheduledDays: number
}

export type RatedReview = {
  readonly progress: CardProgress
  readonly log: ReviewLog
}

type FsrsCard = ReturnType<typeof scheduler.newCard>

const STATE_FROM_FSRS = {
  [State.New]: "new",
  [State.Learning]: "learning",
  [State.Review]: "review",
  [State.Relearning]: "relearning",
} as const satisfies Record<State, ProgressState>

const STATE_TO_FSRS = {
  new: State.New,
  learning: State.Learning,
  review: State.Review,
  relearning: State.Relearning,
} as const satisfies Record<ProgressState, State>

/** ts-fsrs's coarser status. Relearning cards are back in the learning steps. */
const SCHEDULE_STATUS = {
  new: "new",
  learning: "learning",
  review: "review",
  relearning: "learning",
} as const satisfies Record<ProgressState, FsrsCard["scheduleStatus"]>

/** A card the learner has never studied, due now. */
export function createProgress(cardId: string, now: Date): CardProgress {
  return fromFsrsCard(scheduler.newCard({ now: checkedDate(now), cardId }))
}

/**
 * Schedule a card after a review. Returns new progress and a log entry; the
 * input is never changed.
 *
 * A `now` earlier than the last review (another device's clock, a replayed
 * request) is treated as a review at the moment of the last one.
 */
export function applyRating(
  progress: CardProgress,
  rating: FsrsRating,
  now: Date
): RatedReview {
  const card = toFsrsCard(progress)
  const result = scheduler.review({
    card,
    grade: rating,
    now: reviewTime(card, now),
  })
  return {
    progress: fromFsrsCard(result.card),
    log: {
      cardId: progress.cardId,
      rating,
      reviewedAt: result.revlog.reviewTime.toISOString(),
      state: STATE_FROM_FSRS[result.revlog.state],
      due: result.revlog.dueAt.toISOString(),
      lastReview: result.revlog.lastReviewAt?.toISOString() ?? null,
      stability: result.revlog.stability,
      stabilityFast: result.revlog.stabilityFast,
      difficulty: result.revlog.difficulty,
      learningStep: result.revlog.learningStep,
      scheduledDays: result.revlog.scheduledDays,
    },
  }
}

/** When the card would next be due for each rating, without reviewing it. */
export function previewDue(
  progress: CardProgress,
  now: Date
): Record<FsrsRating, string> {
  const card = toFsrsCard(progress)
  const due: Partial<Record<FsrsRating, string>> = {}
  for (const item of scheduler.preview({ card, now: reviewTime(card, now) })) {
    due[item.grade] = item.card.dueAt.toISOString()
  }
  return due as Record<FsrsRating, string>
}

export function isDue(progress: CardProgress, now: Date): boolean {
  return parseIso(progress.due).getTime() <= checkedDate(now).getTime()
}

function toFsrsCard(progress: CardProgress): FsrsCard {
  return {
    cardId: progress.cardId,
    state: STATE_TO_FSRS[progress.state],
    scheduleStatus: SCHEDULE_STATUS[progress.state],
    dueAt: parseIso(progress.due),
    lastReviewAt:
      progress.lastReview === null ? null : parseIso(progress.lastReview),
    stability: progress.stability,
    stabilityFast: progress.stabilityFast,
    difficulty: progress.difficulty,
    reps: progress.reps,
    lapses: progress.lapses,
    learningStep: progress.learningStep,
    scheduledDays: progress.scheduledDays,
  }
}

function fromFsrsCard(card: FsrsCard): CardProgress {
  return {
    cardId: String(card.cardId),
    state: STATE_FROM_FSRS[card.state],
    due: card.dueAt.toISOString(),
    lastReview: card.lastReviewAt?.toISOString() ?? null,
    stability: card.stability,
    stabilityFast: card.stabilityFast,
    difficulty: card.difficulty,
    reps: card.reps,
    lapses: card.lapses,
    learningStep: card.learningStep,
    scheduledDays: card.scheduledDays,
  }
}

/** ts-fsrs rejects a review dated before the card's last review. */
function reviewTime(card: FsrsCard, now: Date): Date {
  const checked = checkedDate(now)
  return card.lastReviewAt !== null && checked < card.lastReviewAt
    ? card.lastReviewAt
    : checked
}

function checkedDate(date: Date): Date {
  if (Number.isNaN(date.getTime())) {
    throw new RangeError("Expected a valid Date")
  }
  return date
}

function parseIso(value: string): Date {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    throw new RangeError(`Expected an ISO 8601 timestamp, got "${value}"`)
  }
  return date
}

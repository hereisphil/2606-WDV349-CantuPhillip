import { evaluateAnswer, type Evaluation } from "../answer/evaluate"
import {
  applyOutcome,
  outcomeChoices,
  type OutcomeLog,
  type ReviewOutcome,
} from "../srs/outcome"
import type { CardProgress } from "../srs/progress"
import { capElapsedMs } from "./timing"

/**
 * The pure study-session state machine (docs/state-management.md). Apps add
 * only the React wrapper: `useReducer(sessionReducer, cards, startSession)`.
 *
 *   prompt ──SUBMIT / REVEAL──▶ answered ──RESOLVE──▶ prompt (next card)
 *                                                └──▶ complete ──RESTART──▶ prompt
 *
 * Any other event leaves the state unchanged.
 */

/** The least a card needs to be studied. Apps extend it with the prompt, mnemonic, audio… */
export type SessionCard = {
  readonly progress: CardProgress
  /** Accepted answers for typing; any one counts. */
  readonly answers: readonly string[]
}

/** One review in this session, ready to persist. */
export type SessionReview = OutcomeLog & {
  /** Response time from `capElapsedMs`; `null` when unknown. */
  readonly durationMs: number | null
}

type InProgress<T extends SessionCard> = {
  /** Cards still to study; the first is on screen. */
  readonly queue: readonly [T, ...T[]]
  /** Cards finished, with updated progress, in the order they finished. */
  readonly finished: readonly T[]
  /** Every review so far, including each miss of a requeued card. */
  readonly reviews: readonly SessionReview[]
}

export type SessionState<T extends SessionCard> =
  | ({ readonly status: "prompt" } & InProgress<T>)
  | ({
      readonly status: "answered"
      /** What the learner typed; `null` if they revealed without typing. */
      readonly answer: string | null
      /** `null` if revealed without typing. */
      readonly evaluation: Evaluation | null
      readonly elapsedMs: number | null
    } & InProgress<T>)
  | {
      readonly status: "complete"
      readonly finished: readonly T[]
      readonly reviews: readonly SessionReview[]
    }

export type SessionEvent =
  /** The learner typed an answer. `elapsedMs` is raw; the reducer caps it. */
  | {
      readonly type: "SUBMIT"
      readonly answer: string
      readonly elapsedMs: number | null
    }
  /** The learner revealed the answer without typing. */
  | { readonly type: "REVEAL"; readonly elapsedMs: number | null }
  /**
   * The learner settled how it went. Must be one of `outcomeChoices` for the
   * answer, or the event is ignored. `missed` sends the card to the back of
   * the queue until it is no longer missed.
   */
  | {
      readonly type: "RESOLVE"
      readonly outcome: ReviewOutcome
      readonly now: Date
    }
  /** Study the same cards again. */
  | { readonly type: "RESTART" }

/** The first state for a list of cards, in order. No cards means complete. */
export function startSession<T extends SessionCard>(
  cards: readonly T[]
): SessionState<T> {
  const [first, ...rest] = cards
  if (first === undefined) {
    return { status: "complete", finished: [], reviews: [] }
  }
  return {
    status: "prompt",
    queue: [first, ...rest],
    finished: [],
    reviews: [],
  }
}

export function sessionReducer<T extends SessionCard>(
  state: SessionState<T>,
  event: SessionEvent
): SessionState<T> {
  switch (state.status) {
    case "prompt":
      switch (event.type) {
        case "SUBMIT":
          return {
            status: "answered",
            queue: state.queue,
            finished: state.finished,
            reviews: state.reviews,
            answer: event.answer,
            evaluation: evaluateAnswer(state.queue[0].answers, event.answer),
            elapsedMs: cappedOrNull(event.elapsedMs),
          }
        case "REVEAL":
          return {
            status: "answered",
            queue: state.queue,
            finished: state.finished,
            reviews: state.reviews,
            answer: null,
            evaluation: null,
            elapsedMs: cappedOrNull(event.elapsedMs),
          }
        default:
          return state
      }
    case "answered":
      return event.type === "RESOLVE" ? resolve(state, event) : state
    case "complete":
      return event.type === "RESTART" ? startSession(state.finished) : state
  }
}

function resolve<T extends SessionCard>(
  state: Extract<SessionState<T>, { status: "answered" }>,
  event: Extract<SessionEvent, { type: "RESOLVE" }>
): SessionState<T> {
  if (!outcomeChoices(state.evaluation).includes(event.outcome)) return state

  const [current, ...rest] = state.queue
  const { progress, log } = applyOutcome(
    current.progress,
    event.outcome,
    event.now
  )
  const card: T = { ...current, progress }
  const reviews = [...state.reviews, { ...log, durationMs: state.elapsedMs }]

  const missed = event.outcome === "missed"
  const queue = missed ? [...rest, card] : rest
  const finished = missed ? state.finished : [...state.finished, card]

  const [next, ...later] = queue
  return next === undefined
    ? { status: "complete", finished, reviews }
    : { status: "prompt", queue: [next, ...later], finished, reviews }
}

function cappedOrNull(elapsedMs: number | null): number | null {
  return elapsedMs === null ? null : capElapsedMs(elapsedMs)
}

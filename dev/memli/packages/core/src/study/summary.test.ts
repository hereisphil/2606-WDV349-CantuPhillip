import { describe, expect, it } from "vitest"
import { createProgress } from "../srs/progress"
import {
  sessionReducer,
  startSession,
  type SessionCard,
  type SessionEvent,
  type SessionState,
} from "./session-reducer"
import { summarizeSession } from "./summary"

const now = new Date("2026-11-10T15:00:00.000Z")

function card(id: string, answer: string): SessionCard {
  return { progress: createProgress(id, now), answers: [answer] }
}

const answerAs = (
  answer: string,
  outcome: "missed" | "tough" | "got_it" | "easy"
): SessionEvent[] => [
  { type: "SUBMIT", answer, elapsedMs: 2_000 },
  { type: "RESOLVE", outcome, now },
]

function complete(
  cards: readonly SessionCard[],
  events: readonly SessionEvent[]
): Extract<SessionState<SessionCard>, { status: "complete" }> {
  const state = events.reduce(sessionReducer<SessionCard>, startSession(cards))
  if (state.status !== "complete") {
    throw new Error(`Expected a complete session, got ${state.status}`)
  }
  return state
}

describe("summarizeSession", () => {
  it("counts every finished word once, even one that was missed first", () => {
    const { finished, reviews } = complete(
      [card("cat", "gato"), card("dog", "perro")],
      [
        ...answerAs("gato", "got_it"),
        ...answerAs("nope", "missed"),
        ...answerAs("perro", "got_it"),
      ]
    )
    expect(summarizeSession(finished, reviews)).toMatchObject({
      words: 2,
      rememberedFirstTime: 1,
    })
  })

  it("counts a tough first review as remembered", () => {
    const { finished, reviews } = complete(
      [card("cat", "gato")],
      [
        { type: "REVEAL", elapsedMs: 2_000 },
        { type: "RESOLVE", outcome: "tough", now },
      ]
    )
    expect(summarizeSession(finished, reviews).rememberedFirstTime).toBe(1)
  })

  it("finds the earliest next review", () => {
    const { finished, reviews } = complete(
      [card("cat", "gato"), card("dog", "perro")],
      [...answerAs("gato", "easy"), ...answerAs("perro", "got_it")]
    )
    const dues = finished.map((done) => done.progress.due).sort()
    expect(summarizeSession(finished, reviews).nextDue).toBe(dues[0])
  })

  it("has nothing due for an empty session", () => {
    expect(summarizeSession([], [])).toEqual({
      words: 0,
      rememberedFirstTime: 0,
      nextDue: null,
    })
  })
})

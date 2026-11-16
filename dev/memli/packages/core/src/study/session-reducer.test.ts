import { describe, expect, it } from "vitest"
import { createProgress } from "../srs/progress"
import {
  sessionReducer,
  startSession,
  type SessionCard,
  type SessionEvent,
  type SessionState,
} from "./session-reducer"

type TestCard = SessionCard & { readonly prompt: string }

const now = new Date("2026-11-10T15:00:00.000Z")

function card(id: string, prompt: string, answer: string): TestCard {
  return { progress: createProgress(id, now), answers: [answer], prompt }
}

const cat = card("card_cat", "cat", "gato")
const dog = card("card_dog", "dog", "perro")

const submit = (
  answer: string,
  elapsedMs: number | null = 2_000
): SessionEvent => ({
  type: "SUBMIT",
  answer,
  elapsedMs,
})
const reveal: SessionEvent = { type: "REVEAL", elapsedMs: 2_000 }
const resolve = (
  outcome: "missed" | "tough" | "got_it" | "easy"
): SessionEvent => ({ type: "RESOLVE", outcome, now })
const restart: SessionEvent = { type: "RESTART" }

function run(
  state: SessionState<TestCard>,
  ...events: SessionEvent[]
): SessionState<TestCard> {
  return events.reduce(sessionReducer<TestCard>, state)
}

const prompt = startSession([cat, dog])
const answered = run(prompt, submit("gato"))
const complete = run(
  prompt,
  submit("gato"),
  resolve("got_it"),
  submit("perro"),
  resolve("got_it")
)

describe("startSession", () => {
  it("puts the first card on screen", () => {
    expect(prompt).toEqual({
      status: "prompt",
      queue: [cat, dog],
      finished: [],
      reviews: [],
    })
  })

  it("is complete straight away with no cards", () => {
    expect(startSession([])).toEqual({
      status: "complete",
      finished: [],
      reviews: [],
    })
  })
})

describe("prompt", () => {
  it("SUBMIT evaluates the typed answer against the current card", () => {
    expect(run(prompt, submit("gaot", 2_500))).toEqual({
      status: "answered",
      queue: [cat, dog],
      finished: [],
      reviews: [],
      answer: "gaot",
      evaluation: {
        verdict: "near",
        matched: "gato",
        reason: "typo",
        typos: 1,
      },
      elapsedMs: 2_500,
    })
  })

  it("SUBMIT caps the response time and drops a broken one", () => {
    expect(run(prompt, submit("gato", 5 * 60 * 1000))).toMatchObject({
      elapsedMs: 30_000,
    })
    expect(run(prompt, submit("gato", -1))).toMatchObject({ elapsedMs: null })
    expect(run(prompt, submit("gato", null))).toMatchObject({ elapsedMs: null })
  })

  it("REVEAL shows the answer without evaluating anything", () => {
    expect(run(prompt, reveal)).toEqual({
      status: "answered",
      queue: [cat, dog],
      finished: [],
      reviews: [],
      answer: null,
      evaluation: null,
      elapsedMs: 2_000,
    })
  })

  it.each([
    ["RESOLVE", resolve("got_it")],
    ["RESTART", restart],
  ])("ignores %s", (_, event) => {
    expect(sessionReducer(prompt, event)).toBe(prompt)
  })
})

describe("answered", () => {
  it("RESOLVE schedules the card and moves to the next one", () => {
    const next = run(answered, resolve("got_it"))
    if (next.status !== "prompt") throw new Error("expected prompt")

    expect(next.queue).toEqual([dog])
    expect(next.finished).toHaveLength(1)
    expect(next.finished[0]?.prompt).toBe("cat")
    expect(next.finished[0]?.progress.reps).toBe(1)
    expect(next.reviews).toEqual([
      expect.objectContaining({
        cardId: "card_cat",
        outcome: "got_it",
        rating: 3,
        durationMs: 2_000,
      }),
    ])
  })

  it("RESOLVE on the last card completes the session", () => {
    expect(complete.status).toBe("complete")
    if (complete.status !== "complete") return
    expect(complete.finished.map((c) => c.prompt)).toEqual(["cat", "dog"])
    expect(complete.reviews.map((r) => r.cardId)).toEqual([
      "card_cat",
      "card_dog",
    ])
  })

  it("RESOLVE missed sends the card to the back until it is no longer missed", () => {
    const afterMiss = run(prompt, submit("nope"), resolve("missed"))
    if (afterMiss.status !== "prompt") throw new Error("expected prompt")
    expect(afterMiss.queue.map((c) => c.prompt)).toEqual(["dog", "cat"])
    expect(afterMiss.finished).toEqual([])
    expect(afterMiss.queue[1]?.progress.lapses).toBe(0)
    expect(afterMiss.queue[1]?.progress.reps).toBe(1)

    const end = run(
      afterMiss,
      submit("perro"),
      resolve("got_it"),
      submit("gato"), // the requeued cat, now answered
      resolve("got_it")
    )
    expect(end.status).toBe("complete")
    if (end.status !== "complete") return
    expect(end.finished.map((c) => c.prompt)).toEqual(["dog", "cat"])
    expect(end.reviews.map((r) => [r.cardId, r.outcome])).toEqual([
      ["card_cat", "missed"],
      ["card_dog", "got_it"],
      ["card_cat", "got_it"],
    ])
  })

  it("RESOLVE missed on the only card shows it again", () => {
    const solo = startSession([cat])
    const again = run(solo, reveal, resolve("missed"))
    expect(again).toMatchObject({ status: "prompt", finished: [] })
    if (again.status !== "prompt") return
    expect(again.queue.map((c) => c.prompt)).toEqual(["cat"])
  })

  it("RESOLVE ignores an outcome the answer doesn't allow", () => {
    const wrong = run(prompt, submit("perro"))
    expect(sessionReducer(wrong, resolve("got_it"))).toBe(wrong)

    const exact = run(prompt, submit("gato"))
    expect(sessionReducer(exact, resolve("missed"))).toBe(exact)
  })

  it("RESOLVE accepts any outcome after a reveal", () => {
    for (const outcome of ["missed", "tough", "got_it", "easy"] as const) {
      expect(run(prompt, reveal, resolve(outcome)).status).toBe("prompt")
    }
  })

  it.each([
    ["SUBMIT", submit("gato")],
    ["REVEAL", reveal],
    ["RESTART", restart],
  ])("ignores %s", (_, event) => {
    expect(sessionReducer(answered, event)).toBe(answered)
  })
})

describe("complete", () => {
  it("RESTART studies the finished cards again, keeping their progress", () => {
    const again = run(complete, restart)
    expect(again).toMatchObject({ status: "prompt", finished: [], reviews: [] })
    if (again.status !== "prompt" || complete.status !== "complete") return
    expect(again.queue).toEqual(complete.finished)
  })

  it.each([
    ["SUBMIT", submit("gato")],
    ["REVEAL", reveal],
    ["RESOLVE", resolve("got_it")],
  ])("ignores %s", (_, event) => {
    expect(sessionReducer(complete, event)).toBe(complete)
  })
})

it("never changes the state it is given", () => {
  const frozen = Object.freeze(startSession([cat, dog]))
  const copy = structuredClone(frozen)
  run(frozen, submit("gato"), resolve("got_it"))
  expect(frozen).toEqual(copy)
})

import { describe, expect, it } from "vitest"

import { studyQuerySchema, studySessionSchema } from "./study"

describe("studyQuerySchema", () => {
  it("defaults to a review session", () => {
    expect(studyQuerySchema.parse({})).toEqual({ mode: "review" })
  })

  it("reads `extra` from the text a query string carries", () => {
    expect(studyQuerySchema.parse({ mode: "learn", extra: "10" })).toEqual({
      mode: "learn",
      extra: 10,
    })
  })

  it("refuses a mode core does not know", () => {
    expect(studyQuerySchema.safeParse({ mode: "cram" }).success).toBe(false)
  })

  it.each(["0", "-5", "2.5", "ten", "101"])(
    "refuses extra=%s",
    (extra: string) => {
      expect(studyQuerySchema.safeParse({ extra }).success).toBe(false)
    }
  )
})

describe("studySessionSchema", () => {
  it("allows no cards, for a session with nothing waiting", () => {
    const session = {
      course: {
        courseId: "spanish-core-1000",
        title: "Spanish Core 1000",
        learningLanguage: "es",
        answerLanguage: "en",
      },
      mode: "review",
      cards: [],
    }

    expect(studySessionSchema.parse(session)).toEqual(session)
  })
})

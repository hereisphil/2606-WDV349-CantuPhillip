import { describe, expect, it } from "vitest"
import { evaluateAnswer } from "./evaluate"
import { normalizeAnswer, stripAccents } from "./normalize"

describe("normalizeAnswer", () => {
  it("ignores case, extra spaces and punctuation", () => {
    expect(normalizeAnswer("  ¿Qué   TAL? ")).toBe("qué tal")
    expect(normalizeAnswer("arc-en-ciel")).toBe("arc en ciel")
  })

  it("treats composed and decomposed accents as the same text", () => {
    expect(normalizeAnswer("año")).toBe(normalizeAnswer("año"))
  })
})

describe("stripAccents", () => {
  it("removes accents and keeps the base letters", () => {
    expect(stripAccents("año ça über été")).toBe("ano ca uber ete")
  })
})

describe("evaluateAnswer", () => {
  it("is exact when only case, spacing or punctuation differ", () => {
    expect(evaluateAnswer("¿Qué tal?", "  QUÉ  tal ")).toEqual({
      verdict: "exact",
      matched: "¿Qué tal?",
    })
  })

  it("is near, not exact, when only accents are missing or wrong", () => {
    expect(evaluateAnswer("año", "ano")).toEqual({
      verdict: "near",
      matched: "año",
      reason: "accent",
      typos: 0,
    })
    expect(evaluateAnswer("café", "cafè").verdict).toBe("near")
    expect(evaluateAnswer("¿Qué tal?", "que tal")).toMatchObject({
      verdict: "near",
      reason: "accent",
    })
  })

  it("forgives a typo in a longer word", () => {
    expect(evaluateAnswer("manzana", "manzanna")).toEqual({
      verdict: "near",
      matched: "manzana",
      reason: "typo",
      typos: 1,
    })
    expect(evaluateAnswer("gracias", "garcias")).toMatchObject({
      verdict: "near",
      typos: 1,
    })
  })

  it("counts typos after ignoring accents", () => {
    expect(evaluateAnswer("canción", "cancin")).toMatchObject({
      verdict: "near",
      reason: "typo",
      typos: 1,
    })
  })

  it("forgives nothing in a 1–3 letter word, where one letter is another word", () => {
    expect(evaluateAnswer("sol", "sal")).toEqual({ verdict: "wrong" })
  })

  it("scales the typos it forgives with length, up to the cap", () => {
    // 4–7 characters: 1 typo
    expect(evaluateAnswer("gato", "gaot").verdict).toBe("near")
    expect(evaluateAnswer("gato", "gtao").verdict).toBe("near")
    expect(evaluateAnswer("gato", "pata").verdict).toBe("wrong")
    // 8+ characters: 2 typos
    expect(evaluateAnswer("biblioteca", "bibloteka").verdict).toBe("near")
    // never more than 2
    expect(
      evaluateAnswer("internacionalización", "internasionalisasion").verdict
    ).toBe("wrong")
  })

  it("takes a custom typo ratio and cap", () => {
    expect(evaluateAnswer("gato", "gaot", { typoRatio: 0 }).verdict).toBe(
      "wrong"
    )
    expect(
      evaluateAnswer("internacionalización", "internasionalisasion", {
        maxTypos: 3,
      }).verdict
    ).toBe("near")
  })

  it("is wrong for a different word or a blank answer", () => {
    expect(evaluateAnswer("perro", "gato")).toEqual({ verdict: "wrong" })
    expect(evaluateAnswer("perro", "   ")).toEqual({ verdict: "wrong" })
    expect(evaluateAnswer("perro", "?!")).toEqual({ verdict: "wrong" })
  })

  it("picks the closest of several accepted answers", () => {
    const accepted = ["the car", "the automobile"]
    expect(evaluateAnswer(accepted, "the automobile")).toEqual({
      verdict: "exact",
      matched: "the automobile",
    })
    expect(evaluateAnswer(accepted, "the automobil")).toMatchObject({
      verdict: "near",
      matched: "the automobile",
    })
  })

  it("prefers an exact match over a near one, and accents over typos", () => {
    expect(evaluateAnswer(["cafe", "café"], "café")).toEqual({
      verdict: "exact",
      matched: "café",
    })
    expect(evaluateAnswer(["mañana", "manzana"], "manana")).toMatchObject({
      verdict: "near",
      matched: "mañana",
      reason: "accent",
    })
  })

  it("rejects a card with no accepted answers", () => {
    expect(() => evaluateAnswer([], "hola")).toThrow(RangeError)
  })
})

import { describe, expect, it } from "vitest"
import { damerauLevenshtein } from "./edit-distance"

describe("damerauLevenshtein", () => {
  it.each([
    ["", "", 0],
    ["", "abc", 3],
    ["abc", "", 3],
    ["gato", "gato", 0],
    ["gato", "pato", 1], // substitute
    ["gato", "gatos", 1], // insert
    ["gatos", "gato", 1], // delete
    ["the", "teh", 1], // swap neighbours counts once
    ["perro", "pero", 1],
    ["kitten", "sitting", 3],
    ["ca", "abc", 3], // optimal string alignment: no substring edited twice
  ])("%j → %j is %i", (a, b, distance) => {
    expect(damerauLevenshtein(a, b)).toBe(distance)
  })

  it("is symmetric", () => {
    expect(damerauLevenshtein("recibir", "recivir")).toBe(
      damerauLevenshtein("recivir", "recibir")
    )
  })

  it("counts a character outside the Basic Multilingual Plane once", () => {
    expect(damerauLevenshtein("a😀b", "ab")).toBe(1)
  })
})

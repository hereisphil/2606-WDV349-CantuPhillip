import { describe, expect, it } from "vitest"

import {
  displayNameSchema,
  isReservedDisplayName,
  tidyDisplayName,
} from "./display-name"

// Hidden characters are written as escapes, so this file shows what it tests.
const ZWNJ = "\u200C"
const ZWJ = "\u200D"

describe("tidyDisplayName", () => {
  it.each([
    ["a right-to-left override", "\u202Eilim", "ilim"],
    ["a bidi isolate", "Ana\u2067\u2069", "Ana"],
    ["a left-to-right mark", "\u200EAna", "Ana"],
    ["a zero-width space", "A\u200Bna", "Ana"],
    ["a word joiner", "A\u2060na", "Ana"],
    ["a byte order mark", "\uFEFFAna", "Ana"],
    ["a soft hyphen", "A\u00ADna", "Ana"],
    ["a control character", "Ana\u0000\u0007", "Ana"],
    ["a private-use glyph", "Ana\uF8FF", "Ana"],
    ["a Hangul filler", "\u3164Ana", "Ana"],
    ["a blank braille cell", "\u2800", ""],
    ["a tag character", "Ana\u{E0041}", "Ana"],
    ["a line break", "Ana\nLópez", "Ana López"],
    ["a line separator", "Ana\u2028López", "Ana López"],
    ["a run of spaces", "  Ana \t  López  ", "Ana López"],
    ["a space left by a hidden character", "Ana \u200B López", "Ana López"],
    ["a joiner at an edge", `${ZWJ}Ana${ZWNJ}`, "Ana"],
    ["a joiner by a space", `Ana ${ZWJ}López`, "Ana López"],
  ])("drops %s", (_label, name, tidy) => {
    expect(tidyDisplayName(name)).toBe(tidy)
  })

  it.each([
    ["a Persian name with a zero-width non-joiner", `مهر${ZWNJ}ناز`],
    ["a Hindi name with a zero-width joiner", `क्${ZWJ}षमा`],
    ["a family emoji", `Ana 👨${ZWJ}👩${ZWJ}👧`],
    ["an emoji style selector", "Ana \u2764\uFE0F"],
    ["a Vietnamese name", "Nguyễn Thị Ánh"],
    ["a Japanese name", "山田 花子"],
    ["an Arabic name", "ليلى"],
  ])("keeps %s", (_label, name) => {
    expect(tidyDisplayName(name)).toBe(name)
  })

  it("keeps a few stacked accents but no more", () => {
    expect(tidyDisplayName(`a${"\u0301".repeat(40)}`)).toBe(
      `a${"\u0301".repeat(4)}`
    )
  })

  it("cuts at 64 characters, never inside an emoji", () => {
    expect(tidyDisplayName("N".repeat(500))).toBe("N".repeat(64))
    expect(tidyDisplayName(`${"N".repeat(63)}👍`)).toBe("N".repeat(63))
    const family = `👨${ZWJ}👩${ZWJ}👧`
    expect(tidyDisplayName(`${"N".repeat(60)}${family}`)).toBe("N".repeat(60))
  })
})

describe("isReservedDisplayName", () => {
  it.each([
    "Memli",
    "MEMLI",
    "memli",
    "Memli Team",
    "The Memli team",
    "memli_official",
    "M e m l i",
    "M.e.m.l.i",
    "MemIi",
    "Meml1",
    "Mem|i",
    "Mernli",
    "Mémlì",
    "M\u0435mli",
    "\u041C\u0435\u043Cli",
    "Ｍｅｍｌｉ",
    "𝐌𝐞𝐦𝐥𝐢",
    "ᴍᴇᴍʟɪ",
    "Mem\u200Bli",
  ])("refuses %s", (name) => {
    expect(isReservedDisplayName(name)).toBe(true)
  })

  it.each([
    "Ana",
    "Emily",
    "Emilia",
    "Mel",
    "Mimi",
    "Melissa",
    "Lemli",
    "memo",
  ])("allows %s", (name) => {
    expect(isReservedDisplayName(name)).toBe(false)
  })
})

describe("displayNameSchema", () => {
  it("hands back the name with its hidden characters dropped", () => {
    expect(displayNameSchema.parse(" A\u200Bna\u202E ")).toBe("Ana")
  })

  it("asks for a name when only hidden characters were typed", () => {
    const result = displayNameSchema.safeParse("\u200B\u3164\u2800")

    expect(result.error?.issues.map((issue) => issue.message)).toEqual([
      "Enter your name.",
    ])
  })

  it("says a name is kept for the Memli team", () => {
    const result = displayNameSchema.safeParse("Memli Team")

    expect(result.error?.issues.map((issue) => issue.message)).toEqual([
      "That name is kept for the Memli team. Choose another one.",
    ])
  })

  it("still says when a name is over 64 characters", () => {
    expect(displayNameSchema.safeParse("N".repeat(65)).success).toBe(false)
  })
})

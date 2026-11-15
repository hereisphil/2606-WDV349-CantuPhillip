import { describe, expect, it } from "vitest"

import { languageTagSchema } from "./language-tag"

describe("languageTagSchema", () => {
  it.each(["en", "es", "es-419", "pt-BR", "ja", "zh-Hant-TW"])(
    "accepts %s",
    (tag) => {
      expect(languageTagSchema.safeParse(tag).success).toBe(true)
    }
  )

  it.each([
    ["pt-br", "lowercase region"],
    ["EN", "uppercase language"],
    ["en_US", "underscore"],
    ["english", "a language name"],
    ["", "empty"],
  ])("rejects %s (%s)", (tag) => {
    expect(languageTagSchema.safeParse(tag).success).toBe(false)
  })
})

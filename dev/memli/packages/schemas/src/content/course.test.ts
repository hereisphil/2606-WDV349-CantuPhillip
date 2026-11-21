import { describe, expect, it } from "vitest"

import { cardSchema } from "./card"
import { courseCardsSchema, courseSchema } from "./course"
import { mnemonicSchema } from "./mnemonic"

const gato = {
  cardId: "es-gato",
  term: "gato",
  partOfSpeech: "noun",
  gender: "masculine",
  answers: ["cat"],
  phonetic: "/ˈɡato/",
  example: {
    text: "El gato está durmiendo en el sofá.",
    translation: "The cat is sleeping on the sofa.",
  },
  mnemonics: [
    {
      mnemonicId: "mn-es-gato-1",
      contentLocale: "en",
      story: [
        { kind: "plain", text: "A cat crashes a fancy " },
        { kind: "keyword", text: "gala" },
        { kind: "plain", text: ". Gala-cat, " },
        { kind: "term", text: "gato" },
        { kind: "plain", text: "!" },
      ],
      author: { displayName: "lucia_m" },
      upvotes: 1240,
      image: { src: "/mnemonics/gato.svg", alt: "A cat at a gala." },
    },
  ],
}

describe("courseSchema", () => {
  it("keeps the learning language and the answer language apart", () => {
    const course = courseSchema.parse({
      courseId: "japanese-basics",
      title: "Japanese Basics",
      learningLanguage: "ja",
      answerLanguage: "en",
    })

    expect(course).toMatchObject({
      learningLanguage: "ja",
      answerLanguage: "en",
    })
  })

  it("has no single `language` field to conflate the two", () => {
    expect(Object.keys(courseSchema.shape)).not.toContain("language")
  })
})

describe("cardSchema", () => {
  it("accepts a full card with mnemonics", () => {
    expect(cardSchema.parse(gato)).toEqual(gato)
  })

  it("accepts a card with no gender and no mnemonics yet", () => {
    const { gender: _gender, mnemonics: _mnemonics, ...bare } = gato

    expect(cardSchema.safeParse(bare).success).toBe(true)
  })

  it("needs at least one accepted answer", () => {
    expect(cardSchema.safeParse({ ...gato, answers: [] }).success).toBe(false)
  })

  it("only takes part-of-speech codes, not labels", () => {
    expect(
      cardSchema.safeParse({ ...gato, partOfSpeech: "Noun" }).success
    ).toBe(false)
  })
})

describe("mnemonicSchema", () => {
  const [mnemonic] = gato.mnemonics

  it("needs a story with at least one part", () => {
    expect(mnemonicSchema.safeParse({ ...mnemonic, story: [] }).success).toBe(
      false
    )
  })

  it("needs a content locale that is a real language tag", () => {
    expect(
      mnemonicSchema.safeParse({ ...mnemonic, contentLocale: "English" })
        .success
    ).toBe(false)
  })

  it("rejects a picture with no description", () => {
    expect(
      mnemonicSchema.safeParse({
        ...mnemonic,
        image: { src: "/mnemonics/gato.svg", alt: "" },
      }).success
    ).toBe(false)
  })

  it.each([
    ["another host", "https://tracker.example/pixel.png"],
    ["a protocol-relative host", "//tracker.example/pixel.png"],
    ["a backslash host", "/\\tracker.example/pixel.png"],
    ["a script URL", "javascript:alert(1)"],
    ["a data URL", "data:image/svg+xml,<svg onload=alert(1)>"],
    ["a relative path", "mnemonics/gato.svg"],
    ["a path with spaces", "/mnemonics/gato cat.svg"],
    ["another folder on Memli's origin", "/api/courses"],
    ["a file at the root", "/gato.svg"],
    ["a way out of the folder", "/mnemonics/../api/courses"],
    ["an encoded way out", "/mnemonics/%2e%2e/api/courses.svg"],
    ["a subfolder", "/mnemonics/uploads/gato.svg"],
    ["a query string", "/mnemonics/gato.svg?track=1"],
    ["a capital letter", "/mnemonics/Gato.svg"],
    ["an HTML file", "/mnemonics/gato.html"],
    ["a file with no type", "/mnemonics/gato"],
    ["a double extension", "/mnemonics/gato.svg.html"],
  ])("only takes a picture Memli ships, not %s", (_name, src) => {
    expect(
      mnemonicSchema.safeParse({
        ...mnemonic,
        image: { src, alt: "A cat at a gala." },
      }).success
    ).toBe(false)
  })

  it.each([
    "/mnemonics/gato.svg",
    "/mnemonics/la-casa-2.png",
    "/mnemonics/perro.webp",
  ])("takes %s", (src) => {
    expect(
      mnemonicSchema.safeParse({
        ...mnemonic,
        image: { src, alt: "A cat at a gala." },
      }).success
    ).toBe(true)
  })

  it("caps how long a story part can be", () => {
    expect(
      mnemonicSchema.safeParse({
        ...mnemonic,
        story: [{ kind: "plain", text: "a".repeat(281) }],
      }).success
    ).toBe(false)
  })

  it("caps how many parts a story can have", () => {
    const part = { kind: "plain", text: "Gala-cat! " }

    expect(
      mnemonicSchema.safeParse({ ...mnemonic, story: Array(25).fill(part) })
        .success
    ).toBe(false)
  })

  it("caps how long an id can be", () => {
    expect(
      mnemonicSchema.safeParse({ ...mnemonic, mnemonicId: "m".repeat(65) })
        .success
    ).toBe(false)
  })
})

describe("courseCardsSchema", () => {
  it("never allows an empty course, so a session always has a first card", () => {
    expect(
      courseCardsSchema.safeParse({ answerLanguage: "en", cards: [] }).success
    ).toBe(false)
  })
})

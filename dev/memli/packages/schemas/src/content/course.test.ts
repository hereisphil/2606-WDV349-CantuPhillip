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
})

describe("courseCardsSchema", () => {
  it("never allows an empty course, so a session always has a first card", () => {
    expect(
      courseCardsSchema.safeParse({ answerLanguage: "en", cards: [] }).success
    ).toBe(false)
  })
})

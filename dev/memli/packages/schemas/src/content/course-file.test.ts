/// <reference types="node" />
import { readFileSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"

import {
  COURSE_FILE_FORMAT,
  MAX_STARTER_MNEMONICS,
  courseFileSchema,
  type CourseFile,
} from "./course-file"

/** The example the docs show, so the docs can never drift from the schema. */
const examplePath = join(
  import.meta.dirname,
  "../../../../docs/course-file.example.json"
)
const example = JSON.parse(readFileSync(examplePath, "utf8")) as CourseFile

/** The example with one change, for a test that wants it refused. */
function withChange(change: (file: CourseFile) => void): unknown {
  const copy = structuredClone(example)
  change(copy)
  return copy
}

/** Where each problem is, as `cards.1.cardId`. */
function problems(file: unknown): string[] {
  const result = courseFileSchema.safeParse(file)
  return result.success
    ? []
    : result.error.issues.map((issue) => issue.path.join("."))
}

describe("courseFileSchema", () => {
  it("accepts the example in docs/course-file.example.json", () => {
    expect(problems(example)).toEqual([])
    expect(example.format).toBe(COURSE_FILE_FORMAT)
  })

  it("keeps the words in file order: that is the order learners meet them", () => {
    const file = courseFileSchema.parse(example)

    expect(file.cards.map((card) => card.term)).toEqual([
      "cocinar",
      "cuchara",
      "tengo hambre",
    ])
  })

  it("lets a license that asks no credit leave out the attribution", () => {
    expect(
      problems(withChange((file) => delete file.course.attribution))
    ).toEqual([])
  })

  it("refuses an unknown key, so a misspelled one never vanishes", () => {
    expect(
      problems(
        withChange((file) => {
          Object.assign(file.course, { attributon: "Typo" })
          Object.assign(file.cards[0] ?? {}, { anwers: ["cook"] })
        })
      )
    ).toEqual(["course", "cards.0"])
  })

  it("refuses another format or version", () => {
    expect(
      problems(
        withChange((file) => Object.assign(file, { format: "memli-course/2" }))
      )
    ).toEqual(["format"])
  })

  it.each(["description", "source", "license"] as const)(
    "refuses a course with no %s, or a blank one",
    (detail) => {
      expect(
        problems(
          withChange((file) => Object.assign(file.course, { [detail]: "  " }))
        )
      ).toEqual([`course.${detail}`])
      expect(
        problems(
          withChange(
            (file) =>
              delete (file.course as Partial<CourseFile["course"]>)[detail]
          )
        )
      ).toEqual([`course.${detail}`])
    }
  )

  it("refuses a course with no words", () => {
    expect(problems(withChange((file) => (file.cards = [])))).toEqual(["cards"])
  })

  it("points at each word that reuses a cardId", () => {
    expect(
      problems(
        withChange((file) => {
          const [first, second, third] = file.cards
          if (first && second && third) {
            second.cardId = first.cardId
            third.cardId = first.cardId
          }
        })
      )
    ).toEqual(["cards.1.cardId", "cards.2.cardId"])
  })

  it("points at a mnemonic that reuses a mnemonicId, across words", () => {
    expect(
      problems(
        withChange((file) => {
          const story = file.cards[0]?.mnemonics?.[0]
          if (story && file.cards[1]) file.cards[1].mnemonics = [{ ...story }]
        })
      )
    ).toEqual(["cards.1.mnemonics.0.mnemonicId"])
  })

  it(`allows ${String(MAX_STARTER_MNEMONICS)} starter mnemonics a word, no more`, () => {
    const story = example.cards[0]?.mnemonics?.[0]
    const many = (count: number): unknown =>
      withChange((file) => {
        if (story && file.cards[0]) {
          file.cards[0].mnemonics = Array.from(
            { length: count },
            (_, index) => ({
              ...story,
              mnemonicId: `mn-${String(index)}`,
            })
          )
        }
      })

    expect(problems(many(MAX_STARTER_MNEMONICS))).toEqual([])
    expect(problems(many(MAX_STARTER_MNEMONICS + 1))).toEqual([
      "cards.0.mnemonics",
    ])
  })

  it("refuses a mnemonic with an author or votes: those belong to learners", () => {
    expect(
      problems(
        withChange((file) =>
          Object.assign(file.cards[0]?.mnemonics?.[0] ?? {}, {
            author: { displayName: "Memli" },
            upvotes: 100,
          })
        )
      )
    ).toEqual(["cards.0.mnemonics.0"])
  })

  it("refuses a picture from another site, as the API does", () => {
    expect(
      problems(
        withChange((file) =>
          Object.assign(file.cards[0]?.mnemonics?.[0] ?? {}, {
            image: { src: "https://example.com/cat.png", alt: "A cat." },
          })
        )
      )
    ).toEqual(["cards.0.mnemonics.0.image.src"])
  })

  it("refuses a language name where a language tag belongs", () => {
    expect(
      problems(
        withChange((file) =>
          Object.assign(file.course, { learningLanguage: "Spanish" })
        )
      )
    ).toEqual(["course.learningLanguage"])
  })
})

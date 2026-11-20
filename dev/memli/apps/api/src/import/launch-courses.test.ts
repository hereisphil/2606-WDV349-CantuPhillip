/// <reference types="node" />
import { readdirSync, readFileSync } from "node:fs"
import { basename, join } from "node:path"
import {
  courseFileSchema,
  type CourseFile,
} from "@workspace/schemas/content/course-file"
import { describe, expect, it } from "vitest"

import { apiRoot, migratedDatabase, seed } from "../db/test-database"
import {
  importChecks,
  importStatements,
  planImport,
  type CheckRow,
} from "./course-import"

/**
 * The launch courses in apps/api/courses (#174): what a beginner meets first,
 * so mostly nouns and verbs they can use, never a word-frequency list.
 */

const coursesDir = join(apiRoot, "courses")
const files = readdirSync(coursesDir)
  .filter((name) => name.endsWith(".json"))
  .sort()

function read(name: string): CourseFile {
  return courseFileSchema.parse(
    JSON.parse(readFileSync(join(coursesDir, name), "utf8"))
  )
}

/** A beginner's first words should be things and actions, not grammar. */
const MIN_NOUNS_AND_VERBS = 0.75

it("has at least two launch courses", () => {
  expect(files.length).toBeGreaterThanOrEqual(2)
})

describe.each(files)("%s", (name) => {
  const file = read(name)
  const { course, cards } = file

  it("is named after its course", () => {
    expect(basename(name, ".json")).toBe(course.courseId)
  })

  it("is published under an open license, with credit", () => {
    expect(course.published).toBe(true)
    expect(course.license).toBe("CC BY 4.0")
    expect(course.attribution).toContain(course.title)
  })

  it("has enough words for a week or more of study", () => {
    expect(cards.length).toBeGreaterThanOrEqual(100)
  })

  it("is mostly nouns and verbs, not grammar words", () => {
    const useful = cards.filter(
      (card) => card.partOfSpeech === "noun" || card.partOfSpeech === "verb"
    )
    expect(useful.length / cards.length).toBeGreaterThanOrEqual(
      MIN_NOUNS_AND_VERBS
    )
  })

  it("teaches each word once", () => {
    const terms = cards.map((card) => card.term.toLocaleLowerCase())
    expect(
      terms.filter((term, index) => terms.indexOf(term) !== index)
    ).toEqual([])
  })

  it("names each card after its course and language", () => {
    const prefix = `${course.learningLanguage}-${course.courseId.split("-").at(-1) ?? ""}-`
    expect(cards.filter((card) => !card.cardId.startsWith(prefix))).toEqual([])
  })

  it("gives every noun a gender, and nothing else one", () => {
    const wrong = cards.filter(
      (card) => (card.partOfSpeech === "noun") !== (card.gender !== undefined)
    )
    expect(wrong.map((card) => card.term)).toEqual([])
  })

  it("writes each pronunciation in IPA slashes", () => {
    const wrong = cards.filter((card) => !/^\/[^/]+\/$/.test(card.phonetic))
    expect(wrong.map((card) => card.term)).toEqual([])
  })

  it("puts the word itself in each starter story", () => {
    const wrong = cards.filter((card) =>
      (card.mnemonics ?? []).some(
        (mnemonic) =>
          !mnemonic.story.some(
            (part) => part.kind === "term" && part.text === card.term
          )
      )
    )
    expect(wrong.map((card) => card.term)).toEqual([])
  })

  it("starts with starter stories, so the first words have one", () => {
    expect(cards.slice(0, 10).every((card) => card.mnemonics?.length)).toBe(
      true
    )
  })
})

describe("all launch courses together", () => {
  it("use ids no other course has, and import cleanly beside the seed", () => {
    const db = migratedDatabase()
    seed(db)
    const now = new Date("2026-11-18T12:00:00.000Z")

    for (const name of files) {
      const file = read(name)
      const rows = importChecks(file).flatMap(
        (query) => db.prepare(query).all() as CheckRow[]
      )
      expect(planImport(file, rows), name).toEqual({
        removedCards: [],
        takenCardIds: [],
        takenMnemonicIds: [],
      })
      for (const statement of importStatements(file, {
        now,
        removeMissing: false,
      })) {
        db.exec(statement)
      }
    }

    const counts = db
      .prepare(
        "SELECT course_id, count(*) AS words FROM cards WHERE course_id LIKE '%-starter' GROUP BY course_id ORDER BY course_id"
      )
      .all()
      .map((row) => ({ ...row }))
    expect(counts).toEqual(
      files.map((name) => ({
        course_id: basename(name, ".json"),
        words: read(name).cards.length,
      }))
    )
  })
})

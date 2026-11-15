/// <reference types="node" />
import { existsSync } from "node:fs"
import { join } from "node:path"
import type { DatabaseSync } from "node:sqlite"
import {
  courseCardsSchema,
  courseSchema,
} from "@workspace/schemas/content/course"
import { beforeEach, describe, expect, it } from "vitest"

import { apiRoot, countRows, migratedDatabase, seed } from "./test-database"

/**
 * Runs `seed/prototype.sql` on the real migrations and reads the rows back
 * the way the API will send them. The seed is SQL written by hand, so this is
 * what catches a misspelled part of speech, broken JSON or a missing picture.
 */

type Row = Record<string, unknown>

let db: DatabaseSync

beforeEach(() => {
  db = migratedDatabase()
  seed(db)
})

function all(sql: string, ...params: string[]): Row[] {
  return db.prepare(sql).all(...params)
}

function seededCourses(): Row[] {
  return all(`
    SELECT id AS courseId, title, learning_language AS learningLanguage,
      answer_language AS answerLanguage
    FROM courses ORDER BY id`)
}

/** A card's mnemonics in the shape of `mnemonicSchema`, most upvoted first. */
function mnemonicsOf(cardId: string): Row[] {
  return all(
    `SELECT m.id, m.content_locale, m.story, m.upvotes, m.image_src,
       m.image_alt, u.name AS author_name
     FROM mnemonics m LEFT JOIN users u ON u.id = m.author_id
     WHERE m.card_id = ? ORDER BY m.upvotes DESC`,
    cardId
  ).map((row) => ({
    mnemonicId: row.id,
    contentLocale: row.content_locale,
    story: JSON.parse(String(row.story)) as unknown,
    author: { displayName: row.author_name },
    upvotes: row.upvotes,
    ...(row.image_src !== null && {
      image: { src: row.image_src, alt: row.image_alt },
    }),
  }))
}

/** A course's cards in the shape of `cardSchema`, in study order. */
function cardsOf(courseId: string): Row[] {
  return all(
    "SELECT * FROM cards WHERE course_id = ? ORDER BY position",
    courseId
  ).map((row) => ({
    cardId: row.id,
    term: row.term,
    partOfSpeech: row.part_of_speech,
    ...(row.gender !== null && { gender: row.gender }),
    answers: JSON.parse(String(row.answers)) as unknown,
    phonetic: row.phonetic,
    example: { text: row.example_text, translation: row.example_translation },
    mnemonics: mnemonicsOf(String(row.id)),
  }))
}

describe("the seeded prototype learner", () => {
  it("is a real users row, the one useViewer() stands in for", () => {
    expect(
      all(
        "SELECT id, name, email, ui_locale FROM users WHERE id = ?",
        "usr_prototype_01"
      ).map((row) => ({ ...row }))
    ).toEqual([
      {
        id: "usr_prototype_01",
        name: "Phillip",
        email: "learner@prototype.memli.test",
        ui_locale: "en",
      },
    ])
  })

  it("starts with no progress, so every seeded card is new", () => {
    expect(countRows(db, "user_progress")).toBe(0)
  })
})

describe("the seeded courses", () => {
  it("are valid courses, each with a learning and an answer language", () => {
    const courses = seededCourses()

    expect(courses.length).toBeGreaterThan(0)
    for (const course of courses) {
      expect(courseSchema.safeParse(course).error?.issues).toBeUndefined()
    }
  })

  it("hold only valid cards and mnemonics, and are never empty", () => {
    for (const course of seededCourses()) {
      const courseCards = {
        answerLanguage: course.answerLanguage,
        cards: cardsOf(String(course.courseId)),
      }

      expect(
        courseCardsSchema.safeParse(courseCards).error?.issues,
        String(course.courseId)
      ).toBeUndefined()
    }
  })

  it("number each course's cards from 1 with no gaps", () => {
    for (const course of seededCourses()) {
      const positions = all(
        "SELECT position FROM cards WHERE course_id = ? ORDER BY position",
        String(course.courseId)
      ).map((row) => row.position)

      expect(positions, String(course.courseId)).toEqual(
        positions.map((_, index) => index + 1)
      )
    }
  })
})

describe("the seeded mnemonics", () => {
  it("come with a picture and without one, so both layouts have a card", () => {
    const [counts] = all(`
      SELECT count(image_src) AS pictured, count(*) - count(image_src) AS plain
      FROM mnemonics`)

    expect(Number(counts?.pictured)).toBeGreaterThan(0)
    expect(Number(counts?.plain)).toBeGreaterThan(0)
  })

  it("only point at pictures the web app serves", () => {
    const webPublic = join(apiRoot, "../web/public")
    const missing = all(
      "SELECT image_src FROM mnemonics WHERE image_src IS NOT NULL"
    )
      .map((row) => String(row.image_src))
      .filter((src) => !existsSync(join(webPublic, src)))

    expect(missing).toEqual([])
  })

  it("leave some cards without one, so that state shows in a real course", () => {
    const [bare] = all(`
      SELECT count(*) AS n FROM cards
      WHERE id NOT IN (SELECT card_id FROM mnemonics)`)

    expect(Number(bare?.n)).toBeGreaterThan(0)
  })
})

describe("seeding again", () => {
  const tables = ["users", "courses", "cards", "mnemonics"]
  const counts = (): number[] => tables.map((table) => countRows(db, table))

  it("adds no duplicate rows", () => {
    const before = counts()
    seed(db)

    expect(counts()).toEqual(before)
  })

  it("keeps the learner's progress", () => {
    db.exec(`
      INSERT INTO user_progress (user_id, card_id, state, due, last_review,
        stability, stability_fast, difficulty, reps, lapses, learning_step,
        scheduled_days)
      VALUES ('usr_prototype_01', 'es-gato', 'review', 1794700000000,
        1794600000000, 3.2, 0.4, 5.1, 2, 0, 0, 1.15)`)
    seed(db)

    expect(
      all("SELECT card_id, reps FROM user_progress").map((row) => ({ ...row }))
    ).toEqual([{ card_id: "es-gato", reps: 2 }])
  })

  it("picks up an edit to a seeded row", () => {
    db.exec("UPDATE cards SET term = 'perro' WHERE id = 'es-gato'")
    seed(db)

    expect(all("SELECT term FROM cards WHERE id = 'es-gato'")[0]?.term).toBe(
      "gato"
    )
  })
})

import type { DatabaseSync } from "node:sqlite"
import { languageTagSchema } from "@workspace/schemas/locale/language-tag"
import { beforeEach, describe, expect, it } from "vitest"

import { countRows, migratedDatabase } from "./test-database"

/**
 * The real migrations on in-memory SQLite: keys, cascades and CHECK constraints.
 * The rows are this file's own; `seed.test.ts` covers the seed.
 */

let db: DatabaseSync

beforeEach(() => {
  db = migratedDatabase()
  db.exec(`
    INSERT INTO users (id, name, email)
      VALUES ('usr_prototype_01', 'Phillip', 'learner@prototype.memli.test');
    INSERT INTO courses (id, title, learning_language, answer_language)
      VALUES ('spanish-core-1000', 'Spanish Core 1000', 'es', 'en');
    INSERT INTO cards (id, course_id, position, term, part_of_speech, gender,
      answers, phonetic, example_text, example_translation)
      VALUES ('es-gato', 'spanish-core-1000', 1, 'gato', 'noun', 'masculine',
        '["cat"]', '/ˈɡato/', 'El gato duerme.', 'The cat sleeps.');
  `)
})

const progressRow = `
  INSERT INTO user_progress (user_id, card_id, state, due, last_review,
    stability, stability_fast, difficulty, reps, lapses, learning_step,
    scheduled_days)
  VALUES ('usr_prototype_01', 'es-gato', 'review', 1794700000000, 1794600000000,
    3.2, 0.4, 5.1, 2, 0, 0, 1.15)`

const count = (table: string): number => countRows(db, table)

describe("user_progress", () => {
  it("stores one row per learner and card", () => {
    db.exec(progressRow)

    expect(() => db.exec(progressRow)).toThrow(/UNIQUE constraint failed/)
  })

  it("keeps fractional FSRS-7 values", () => {
    db.exec(progressRow)

    expect(
      db
        .prepare("SELECT stability_fast, scheduled_days FROM user_progress")
        .get()
    ).toEqual({ stability_fast: 0.4, scheduled_days: 1.15 })
  })

  it("refuses a state core does not know", () => {
    expect(() =>
      db.exec(progressRow.replace("'review'", "'mastered'"))
    ).toThrow(/user_progress_state_check/)
  })

  it("refuses progress for a card that does not exist", () => {
    expect(() =>
      db.exec(progressRow.replace("'es-gato'", "'es-perro'"))
    ).toThrow(/FOREIGN KEY constraint failed/)
  })

  it("goes away with the learner", () => {
    db.exec(progressRow)
    db.exec("DELETE FROM users WHERE id = 'usr_prototype_01'")

    expect(count("user_progress")).toBe(0)
  })
})

describe("courses, cards and mnemonics", () => {
  it("deleting a course removes its cards and everyone's progress on them", () => {
    db.exec(progressRow)
    db.exec("DELETE FROM courses WHERE id = 'spanish-core-1000'")

    expect([count("cards"), count("user_progress")]).toEqual([0, 0])
  })

  it("keeps a mnemonic when its author leaves, without the author", () => {
    db.exec(`
      INSERT INTO mnemonics (id, card_id, author_id, content_locale, story)
        VALUES ('mn-1', 'es-gato', 'usr_prototype_01', 'en',
          '[{"kind":"plain","text":"A cat at a "},{"kind":"keyword","text":"gala"}]');
      DELETE FROM users WHERE id = 'usr_prototype_01';
    `)

    expect(db.prepare("SELECT id, author_id FROM mnemonics").get()).toEqual({
      id: "mn-1",
      author_id: null,
    })
  })

  it("refuses a picture with no description", () => {
    expect(() =>
      db.exec(`
        INSERT INTO mnemonics (id, card_id, content_locale, story, image_src)
          VALUES ('mn-2', 'es-gato', 'en', '[{"kind":"plain","text":"x"}]',
            '/mnemonics/gato.svg')`)
    ).toThrow(/mnemonics_image_check/)
  })

  it("refuses a card with no accepted answer", () => {
    expect(() =>
      db.exec(`
        INSERT INTO cards (id, course_id, position, term, part_of_speech,
          answers, phonetic, example_text, example_translation)
          VALUES ('es-casa', 'spanish-core-1000', 2, 'casa', 'noun', '[]',
            '/ˈkasa/', 'Mi casa.', 'My house.')`)
    ).toThrow(/cards_answers_check/)
  })

  it("refuses two cards in the same place in a course", () => {
    expect(() =>
      db.exec(`
        INSERT INTO cards (id, course_id, position, term, part_of_speech,
          answers, phonetic, example_text, example_translation)
          VALUES ('es-perro', 'spanish-core-1000', 1, 'perro', 'noun', '["dog"]',
            '/ˈpero/', 'El perro.', 'The dog.')`)
    ).toThrow(/UNIQUE constraint failed: cards.course_id, cards.position/)
  })
})

describe("reviews", () => {
  const reviewRow = `
    INSERT INTO reviews (id, user_id, card_id, outcome, rating, reviewed_at,
      duration_ms, prior_state, prior_due, prior_last_review, prior_stability,
      prior_stability_fast, prior_difficulty, prior_learning_step,
      prior_scheduled_days)
    VALUES ('0b7e2a52-6c1f-4d0e-9a57-3f8a1c2d4e5f', 'usr_prototype_01',
      'es-gato', 'got_it', 3, 1794700000000, 4200, 'new', 1794700000000, NULL,
      0, 0, 0, 0, 0)`

  it("records a review once, by its id", () => {
    db.exec(reviewRow)

    expect(() => db.exec(reviewRow)).toThrow(
      /UNIQUE constraint failed: reviews.id/
    )
  })

  it("keeps many reviews of one card", () => {
    db.exec(reviewRow)
    db.exec(reviewRow.replace("0b7e2a52", "1c8f3b63"))

    expect(count("reviews")).toBe(2)
  })

  it.each([
    ["an outcome core does not know", "'got_it'", "'good'", /outcome_check/],
    ["a rating outside 1 to 4", "'got_it', 3", "'got_it', 5", /rating_check/],
    ["a negative response time", "4200", "-1", /duration_check/],
    ["a state core does not know", "'new'", "'fresh'", /prior_state_check/],
  ])("refuses %s", (_name, from, to, error) => {
    expect(() => db.exec(reviewRow.replace(from, to))).toThrow(error)
  })

  it("allows an unknown response time", () => {
    db.exec(reviewRow.replace("4200", "NULL"))

    expect(count("reviews")).toBe(1)
  })

  it("goes away with the learner, and with the card", () => {
    db.exec(reviewRow)
    db.exec(reviewRow.replace("0b7e2a52", "1c8f3b63"))

    db.exec("DELETE FROM cards WHERE id = 'es-gato'")
    expect(count("reviews")).toBe(0)

    db.exec(`
      INSERT INTO cards (id, course_id, position, term, part_of_speech,
        answers, phonetic, example_text, example_translation)
        VALUES ('es-gato', 'spanish-core-1000', 1, 'gato', 'noun', '["cat"]',
          '/ˈɡato/', 'El gato duerme.', 'The cat sleeps.')`)
    db.exec(reviewRow)
    db.exec("DELETE FROM users WHERE id = 'usr_prototype_01'")
    expect(count("reviews")).toBe(0)
  })
})

describe("language columns", () => {
  // Every column that holds a language, and a row that sets it.
  const columns = [
    {
      column: "users.ui_locale",
      insert: (tag: string) => `
        INSERT INTO users (id, name, email, ui_locale)
          VALUES ('usr_2', 'Ana', 'ana@memli.test', ${tag})`,
      update: (tag: string) =>
        `UPDATE users SET ui_locale = ${tag} WHERE id = 'usr_prototype_01'`,
    },
    {
      column: "courses.learning_language",
      insert: (tag: string) => `
        INSERT INTO courses (id, title, learning_language, answer_language)
          VALUES ('c2', 'Course', ${tag}, 'en')`,
      update: (tag: string) => `UPDATE courses SET learning_language = ${tag}`,
    },
    {
      column: "courses.answer_language",
      insert: (tag: string) => `
        INSERT INTO courses (id, title, learning_language, answer_language)
          VALUES ('c2', 'Course', 'es', ${tag})`,
      update: (tag: string) => `UPDATE courses SET answer_language = ${tag}`,
    },
    {
      column: "mnemonics.content_locale",
      insert: (tag: string) => `
        INSERT INTO mnemonics (id, card_id, content_locale, story)
          VALUES ('mn-2', 'es-gato', ${tag}, '[{"kind":"plain","text":"x"}]')`,
      update: (tag: string) => `
        INSERT INTO mnemonics (id, card_id, content_locale, story)
          VALUES ('mn-3', 'es-gato', 'en', '[{"kind":"plain","text":"x"}]');
        UPDATE mnemonics SET content_locale = ${tag}`,
    },
  ]

  const valid = ["es", "en", "pt-BR", "es-419", "zh-Hant", "zh-Hant-TW", "yue"]
  const invalid = [
    "",
    "ES",
    "Es",
    "english",
    "pt-br",
    "pt_BR",
    "en-",
    "en--US",
    "e",
    "es ",
  ]

  it("uses the same rule as languageTagSchema for every sample", () => {
    // The database and the schemas must agree, or a row could be stored
    // that the API cannot send.
    expect(
      valid.filter((tag) => !languageTagSchema.safeParse(tag).success)
    ).toEqual([])
    expect(
      invalid.filter((tag) => languageTagSchema.safeParse(tag).success)
    ).toEqual([])
  })

  describe.each(columns)("$column", ({ column, insert, update }) => {
    const rule = `${column.replace(".", "_")}_check`

    it.each(valid)("accepts %j", (tag) => {
      expect(() => db.exec(insert(`'${tag}'`))).not.toThrow()
      expect(() => db.exec(update(`'${tag}'`))).not.toThrow()
    })

    it.each(invalid)("refuses %j on insert and on update", (tag) => {
      expect(() => db.exec(insert(`'${tag}'`))).toThrow(rule)
      expect(() => db.exec(update(`'${tag}'`))).toThrow(rule)
    })
  })

  it("are never one unqualified `language` column, and all are checked", () => {
    const languageColumns = db
      .prepare(
        `SELECT m.name AS tableName, p.name AS columnName
         FROM sqlite_master m, pragma_table_info(m.name) p
         WHERE m.type = 'table'
           AND (p.name LIKE '%language%' OR p.name LIKE '%locale%' OR p.name = 'lang')
         ORDER BY 1, 2`
      )
      .all()
      .map((row) => `${String(row.tableName)}.${String(row.columnName)}`)
    const triggers = new Set(
      db
        .prepare("SELECT name FROM sqlite_master WHERE type = 'trigger'")
        .all()
        .map((row) => String(row.name))
    )

    // A new language column must say what its language is about, and be
    // added to this test and to a trigger migration like 0002.
    expect(languageColumns).toEqual(columns.map(({ column }) => column).sort())
    for (const column of languageColumns) {
      const rule = `${column.replace(".", "_")}_check`
      expect(triggers).toContain(`${rule}_insert`)
      expect(triggers).toContain(`${rule}_update`)
    }
  })
})

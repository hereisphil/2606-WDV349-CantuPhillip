import type { DatabaseSync } from "node:sqlite"
import { beforeEach, describe, expect, it } from "vitest"

import { countRows, migratedDatabase } from "./test-database"

/**
 * Runs the real migrations on an in-memory SQLite database and checks the
 * rules a schema file alone cannot prove: keys, cascades and CHECK
 * constraints. The rows here are this file's own, so the tests do not depend
 * on what the seed holds (`seed.test.ts` covers that).
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

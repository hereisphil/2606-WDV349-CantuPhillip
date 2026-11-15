/// <reference types="node" />
import { readdirSync, readFileSync } from "node:fs"
import { join } from "node:path"
import { DatabaseSync } from "node:sqlite"
import { beforeEach, describe, expect, it } from "vitest"

/**
 * Runs the real migration and seed files on an in-memory SQLite database, the
 * engine under D1, and checks the rules a schema file alone cannot prove:
 * keys, cascades and CHECK constraints. Node's built-in `node:sqlite` needs
 * no extra package and no running Worker.
 */

const root = join(import.meta.dirname, "../..")
const migrationsDir = join(root, "drizzle/migrations")

function migratedDatabase(): DatabaseSync {
  const db = new DatabaseSync(":memory:")
  // D1 enforces foreign keys; plain SQLite needs asking.
  db.exec("PRAGMA foreign_keys = ON")
  const files = readdirSync(migrationsDir).filter((f) => f.endsWith(".sql"))
  for (const file of files.sort()) {
    const sql = readFileSync(join(migrationsDir, file), "utf8")
    for (const statement of sql.split("--> statement-breakpoint")) {
      db.exec(statement)
    }
  }
  db.exec(readFileSync(join(root, "seed/prototype.sql"), "utf8"))
  return db
}

let db: DatabaseSync

beforeEach(() => {
  db = migratedDatabase()
  db.exec(`
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

function count(table: string): number {
  const row = db.prepare(`SELECT count(*) AS n FROM ${table}`).get()
  return Number(row?.n)
}

describe("the seeded prototype learner", () => {
  it("is a real users row, the one useViewer() stands in for", () => {
    expect(
      db
        .prepare("SELECT id, name, email, ui_locale FROM users")
        .all()
        .map((row) => ({ ...row }))
    ).toEqual([
      {
        id: "usr_prototype_01",
        name: "Phillip",
        email: "learner@prototype.memli.test",
        ui_locale: "en",
      },
    ])
  })

  it("can be seeded again without a duplicate", () => {
    db.exec(readFileSync(join(root, "seed/prototype.sql"), "utf8"))

    expect(count("users")).toBe(1)
  })
})

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

/// <reference types="node" />
import { readFileSync } from "node:fs"
import { join } from "node:path"
import type { DatabaseSync } from "node:sqlite"
import {
  courseFileSchema,
  type CourseFile,
} from "@workspace/schemas/content/course-file"
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest"
import { unstable_splitSqlQuery } from "wrangler"

import { startD1 } from "../db/test-d1"
import {
  apiRoot,
  countRows,
  migratedDatabase,
  migrationStatements,
} from "../db/test-database"
import {
  MEMLI_AUTHOR,
  importChecks,
  importStatements,
  planImport,
  type CheckRow,
} from "./course-import"

/** The documented example: dev/memli/docs/course-file.example.json. */
const example = courseFileSchema.parse(
  JSON.parse(
    readFileSync(join(apiRoot, "../../docs/course-file.example.json"), "utf8")
  )
)
const first = new Date("2026-11-18T12:00:00.000Z")
const later = new Date("2026-11-25T12:00:00.000Z")

let db: DatabaseSync

beforeEach(() => {
  db = migratedDatabase()
})

function load(file: CourseFile, now = first, removeMissing = false): void {
  for (const statement of importStatements(file, { now, removeMissing })) {
    db.exec(statement)
  }
}

function plan(file: CourseFile): ReturnType<typeof planImport> {
  const rows = importChecks(file).flatMap(
    (query) => db.prepare(query).all() as CheckRow[]
  )
  return planImport(file, rows)
}

/** The example with changes, as a fresh copy. */
function edited(change: (file: CourseFile) => void): CourseFile {
  const copy = structuredClone(example)
  change(copy)
  return courseFileSchema.parse(copy)
}

function cardsInOrder(): { id: string; position: number }[] {
  return db
    .prepare(
      "SELECT id, position FROM cards WHERE course_id = 'spanish-kitchen' ORDER BY position"
    )
    .all() as { id: string; position: number }[]
}

function addProgress(cardId: string): void {
  db.exec(`
    INSERT INTO users (id, name, email) VALUES ('usr_ana', 'Ana', 'ana@memli.test')
      ON CONFLICT DO NOTHING;
    INSERT INTO user_progress (user_id, card_id, state, due, last_review,
      stability, stability_fast, difficulty, reps, lapses, learning_step,
      scheduled_days)
    VALUES ('usr_ana', '${cardId}', 'review', 1794700000000, 1794600000000,
      3.2, 0.4, 5.1, 2, 0, 0, 1.15)`)
}

describe("importing a course file", () => {
  it("adds the course, published, with its details", () => {
    load(example)

    expect(db.prepare("SELECT * FROM courses").get()).toMatchObject({
      id: "spanish-kitchen",
      title: "Spanish in the Kitchen",
      learning_language: "es",
      answer_language: "en",
      published_at: first.getTime(),
      source: "Written for Memli",
      license: "CC BY 4.0",
      attribution: "Spanish in the Kitchen, by Memli, under CC BY 4.0.",
    })
  })

  it("numbers the words from 1 in file order", () => {
    load(example)

    expect(cardsInOrder()).toEqual([
      { id: "es-kitchen-cocinar", position: 1 },
      { id: "es-kitchen-cuchara", position: 2 },
      { id: "es-kitchen-tengo-hambre", position: 3 },
    ])
    expect(
      db
        .prepare(
          "SELECT answers, gender FROM cards WHERE id = 'es-kitchen-cuchara'"
        )
        .get()
    ).toEqual({ answers: '["spoon"]', gender: "feminine" })
  })

  it("credits starter mnemonics to Memli, with no votes", () => {
    load(example)

    expect(
      db
        .prepare(
          `SELECT m.id, u.name, m.upvotes FROM mnemonics m
           JOIN users u ON u.id = m.author_id`
        )
        .all()
        .map((row) => ({ ...row }))
    ).toEqual([
      { id: "mn-es-kitchen-cocinar-1", name: MEMLI_AUTHOR.name, upvotes: 0 },
    ])
  })

  it("keeps quotes and accents as written", () => {
    load(
      edited((file) => {
        file.course.title = "Rosa's Kitchen: ¿qué comemos?"
      })
    )

    expect(db.prepare("SELECT title FROM courses").get()).toEqual({
      title: "Rosa's Kitchen: ¿qué comemos?",
    })
  })
})

describe("importing again", () => {
  it("changes nothing when the file hasn't changed, and keeps the first published date", () => {
    load(example, first)
    const counts = (): number[] =>
      ["users", "courses", "cards", "mnemonics"].map((table) =>
        countRows(db, table)
      )
    const before = counts()

    load(example, later)

    expect(counts()).toEqual(before)
    expect(db.prepare("SELECT published_at FROM courses").get()).toEqual({
      published_at: first.getTime(),
    })
  })

  it("keeps learners' progress and the votes on starter mnemonics", () => {
    load(example)
    addProgress("es-kitchen-cuchara")
    db.exec("UPDATE mnemonics SET upvotes = 7")

    load(example, later)

    expect(countRows(db, "user_progress")).toBe(1)
    expect(db.prepare("SELECT upvotes FROM mnemonics").get()).toEqual({
      upvotes: 7,
    })
  })

  it("follows a new order, and progress stays with each word", () => {
    load(example)
    addProgress("es-kitchen-tengo-hambre")

    load(
      edited((file) => {
        file.cards.reverse()
      }),
      later
    )

    expect(cardsInOrder()).toEqual([
      { id: "es-kitchen-tengo-hambre", position: 1 },
      { id: "es-kitchen-cuchara", position: 2 },
      { id: "es-kitchen-cocinar", position: 3 },
    ])
    expect(db.prepare("SELECT card_id FROM user_progress").get()).toEqual({
      card_id: "es-kitchen-tengo-hambre",
    })
  })

  it("hides an unpublished course, and dates it anew when published again", () => {
    load(example, first)
    load(
      edited((file) => {
        file.course.published = false
      }),
      later
    )
    expect(db.prepare("SELECT published_at FROM courses").get()).toEqual({
      published_at: null,
    })

    load(example, later)
    expect(db.prepare("SELECT published_at FROM courses").get()).toEqual({
      published_at: later.getTime(),
    })
  })

  it("drops a starter mnemonic the file no longer has, never a learner's", () => {
    load(example)
    db.exec(`
      INSERT INTO users (id, name, email) VALUES ('usr_ana', 'Ana', 'ana@memli.test');
      INSERT INTO mnemonics (id, card_id, author_id, content_locale, story)
        VALUES ('mn-ana-1', 'es-kitchen-cocinar', 'usr_ana', 'en',
          '[{"kind":"plain","text":"Ana''s story"}]')`)

    load(
      edited((file) => {
        delete file.cards[0]?.mnemonics
      }),
      later
    )

    expect(
      db
        .prepare("SELECT id FROM mnemonics")
        .all()
        .map((row) => row.id)
    ).toEqual(["mn-ana-1"])
  })
})

describe("before importing", () => {
  it("finds nothing to worry about in a new course", () => {
    expect(plan(example)).toEqual({
      removedCards: [],
      takenCardIds: [],
      takenMnemonicIds: [],
    })
  })

  it("names words the file dropped, and deletes them only when told to", () => {
    load(example)
    addProgress("es-kitchen-cuchara")
    const shorter = edited((file) => {
      file.cards.splice(1, 1)
    })

    expect(plan(shorter).removedCards).toEqual(["es-kitchen-cuchara"])

    load(shorter, later, true)
    expect(cardsInOrder().map((card) => card.id)).toEqual([
      "es-kitchen-cocinar",
      "es-kitchen-tengo-hambre",
    ])
    expect(countRows(db, "user_progress")).toBe(0)
  })

  it("names a card id another course already uses", () => {
    db.exec(`
      INSERT INTO courses (id, title, learning_language, answer_language)
        VALUES ('other', 'Other', 'es', 'en');
      INSERT INTO cards (id, course_id, position, term, part_of_speech,
        answers, phonetic, example_text, example_translation)
        VALUES ('es-kitchen-cuchara', 'other', 1, 'cuchara', 'noun',
          '["spoon"]', '/x/', 'Una cuchara.', 'A spoon.')`)

    expect(plan(example).takenCardIds).toEqual(["es-kitchen-cuchara"])
  })

  it("names a mnemonic id a learner already uses", () => {
    load(
      edited((file) => {
        delete file.cards[0]?.mnemonics
      })
    )
    db.exec(`
      INSERT INTO users (id, name, email) VALUES ('usr_ana', 'Ana', 'ana@memli.test');
      INSERT INTO mnemonics (id, card_id, author_id, content_locale, story)
        VALUES ('mn-es-kitchen-cocinar-1', 'es-kitchen-cocinar', 'usr_ana', 'en',
          '[{"kind":"plain","text":"Mine"}]')`)

    expect(plan(example).takenMnemonicIds).toEqual(["mn-es-kitchen-cocinar-1"])
  })
})

describe("as one SQL file", () => {
  it("splits back into the same statements, even with ; and ' in the text", () => {
    // `wrangler d1 execute --file` splits the file this way before running it.
    const tricky = edited((file) => {
      file.course.description = "Cook; eat; repeat. Don't skip the 'sobremesa'."
    })
    const statements = importStatements(tricky, {
      now: first,
      removeMissing: true,
    })

    expect(unstable_splitSqlQuery(`${statements.join(";\n")};`)).toEqual(
      statements
    )
  })
})

describe("on a real D1", () => {
  let d1: Awaited<ReturnType<typeof startD1>>

  beforeAll(async () => {
    d1 = await startD1()
    await d1.run(migrationStatements())
  })

  afterAll(async () => {
    await d1.stop()
  })

  it("loads the example as one batch, twice", async () => {
    const statements = importStatements(example, {
      now: first,
      removeMissing: false,
    })
    await d1.run(statements)
    await d1.run(statements)

    const row = await d1.env.DB.prepare(
      "SELECT count(*) AS n FROM cards WHERE course_id = 'spanish-kitchen'"
    ).first<{ n: number }>()
    expect(row?.n).toBe(3)
  })
})

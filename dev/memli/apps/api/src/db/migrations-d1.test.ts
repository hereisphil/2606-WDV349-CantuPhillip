import { afterAll, beforeAll, describe, expect, it } from "vitest"

import { startD1 } from "./test-d1"
import { migrations } from "./test-database"

/**
 * Every migration keeps existing rows on a real D1, where a table rebuild
 * cascades deletes. See apps/api/README.md, "Changing the schema".
 */

const tables = [
  "users",
  "courses",
  "cards",
  "mnemonics",
  "user_progress",
  "reviews",
  "enrollments",
] as const

const [first, ...later] = migrations()

let d1: Awaited<ReturnType<typeof startD1>>

beforeAll(async () => {
  d1 = await startD1()
})

afterAll(async () => {
  await d1.stop()
})

async function tableExists(table: string): Promise<boolean> {
  const row = await d1.env.DB.prepare(
    `SELECT count(*) AS n FROM sqlite_master WHERE type = 'table' AND name = ?`
  )
    .bind(table)
    .first<{ n: number }>()
  return row?.n === 1
}

/**
 * Rows in 0000's shape, not the seed's (README, "Changing the schema"). The
 * French course has no progress, so 0006 must not enroll anyone in it.
 */
const firstMigrationRows = [
  `INSERT INTO users (id, name, email) VALUES
     ('usr_prototype_01', 'Phillip', 'learner@prototype.memli.test'),
     ('usr_seed_lucia_m', 'lucia_m', 'lucia_m@seed.memli.test')`,
  `INSERT INTO courses (id, title, learning_language, answer_language) VALUES
     ('spanish-core-1000', 'Spanish Core 1000', 'es', 'en'),
     ('french-travel-phrases', 'French Travel Phrases', 'fr', 'en')`,
  `INSERT INTO cards (id, course_id, position, term, part_of_speech, gender,
     answers, phonetic, example_text, example_translation) VALUES
     ('es-gato', 'spanish-core-1000', 1, 'gato', 'noun', 'masculine',
       '["cat"]', '/ˈɡato/', 'El gato duerme.', 'The cat sleeps.'),
     ('es-casa', 'spanish-core-1000', 2, 'casa', 'noun', 'feminine',
       '["house"]', '/ˈkasa/', 'Mi casa.', 'My house.'),
     ('fr-gare', 'french-travel-phrases', 1, 'gare', 'noun', 'feminine',
       '["station"]', '/ɡaʁ/', 'La gare est loin.', 'The station is far.')`,
  `INSERT INTO mnemonics (id, card_id, author_id, content_locale, story)
     VALUES ('mn-1', 'es-gato', 'usr_seed_lucia_m', 'en',
       '[{"kind":"plain","text":"A cat at a "},{"kind":"keyword","text":"gala"}]')`,
  `INSERT INTO user_progress (user_id, card_id, state, due, last_review,
     stability, stability_fast, difficulty, reps, lapses, learning_step,
     scheduled_days)
   VALUES ('usr_prototype_01', 'es-gato', 'review', 1794700000000,
     1794600000000, 3.2, 0.4, 5.1, 2, 0, 0, 1.15)`,
]

async function counts(): Promise<Record<string, number>> {
  const result: Record<string, number> = {}
  for (const table of tables) {
    // Older migrations may not have every table yet.
    if (await tableExists(table)) {
      const rows = await d1.env.DB.prepare(
        `SELECT count(*) AS n FROM ${table}`
      ).first<{ n: number }>()
      result[table] = rows?.n ?? 0
    }
  }
  return result
}

describe("migrations on a database that has data", () => {
  it("start from the first migration and rows in its shape", async () => {
    if (first === undefined) throw new Error("No migrations found")
    await d1.run(first.statements)
    await d1.run(firstMigrationRows)

    expect(await counts()).toMatchObject({
      users: 2,
      courses: 2,
      cards: 3,
      mnemonics: 1,
      user_progress: 1,
    })
  })

  it.each(later.map((migration) => [migration.name, migration] as const))(
    "%s keeps every row",
    async (_name, migration) => {
      const before = await counts()

      await d1.run(migration.statements)
      const after = await counts()

      // A migration may add rows (0006 does), never lose them.
      const lost = Object.entries(before).filter(
        ([table, n]) => (after[table] ?? 0) < n
      )
      expect(lost).toEqual([])
    }
  )

  it("leave every learner with progress enrolled in that course", async () => {
    // The rows went in before `enrollments` existed, so only 0006 adds these.
    const { results } = await d1.env.DB.prepare(
      "SELECT user_id, course_id FROM enrollments"
    ).all()

    expect(results).toEqual([
      { user_id: "usr_prototype_01", course_id: "spanish-core-1000" },
    ])
  })
})

import { afterAll, beforeAll, describe, expect, it } from "vitest"

import { startD1 } from "./test-d1"
import { migrations } from "./test-database"

/**
 * Every migration keeps the rows already in the database, checked on a real
 * D1 the way `wrangler d1 migrations apply` runs it: each file as one batch,
 * which is a transaction.
 *
 * Plain SQLite cannot catch this. drizzle-kit rebuilds a table to change a
 * constraint, wrapped in `PRAGMA foreign_keys=OFF`. That pragma does nothing
 * inside a transaction, so on D1 dropping the old table fires every
 * `ON DELETE CASCADE`: rebuilding `courses` deletes every card, mnemonic,
 * progress row and review. A migration that does that fails here.
 */

const tables = [
  "users",
  "courses",
  "cards",
  "mnemonics",
  "user_progress",
  "reviews",
] as const

const [first, ...later] = migrations()

let d1: Awaited<ReturnType<typeof startD1>>

beforeAll(async () => {
  d1 = await startD1()
})

afterAll(async () => {
  await d1.stop()
})

async function counts(): Promise<Record<string, number>> {
  const result: Record<string, number> = {}
  for (const table of tables) {
    // Older migrations may not have every table yet.
    const row = await d1.env.DB.prepare(
      `SELECT count(*) AS n FROM sqlite_master WHERE type = 'table' AND name = ?`
    )
      .bind(table)
      .first<{ n: number }>()
    if (row?.n === 1) {
      const rows = await d1.env.DB.prepare(
        `SELECT count(*) AS n FROM ${table}`
      ).first<{ n: number }>()
      result[table] = rows?.n ?? 0
    }
  }
  return result
}

describe("migrations on a database that has data", () => {
  it("start from the first migration and the seed", async () => {
    if (first === undefined) throw new Error("No migrations found")
    await d1.run(first.statements)
    await d1.seed()
    await d1.run([
      `INSERT INTO user_progress (user_id, card_id, state, due, last_review,
         stability, stability_fast, difficulty, reps, lapses, learning_step,
         scheduled_days)
       VALUES ('usr_prototype_01', 'es-gato', 'review', 1794700000000,
         1794600000000, 3.2, 0.4, 5.1, 2, 0, 0, 1.15)`,
    ])

    expect(await counts()).toMatchObject({ cards: 16, user_progress: 1 })
  })

  it.each(later.map((migration) => [migration.name, migration] as const))(
    "%s keeps every row",
    async (_name, migration) => {
      const before = await counts()

      await d1.run(migration.statements)

      expect(await counts()).toMatchObject(before)
    }
  )
})

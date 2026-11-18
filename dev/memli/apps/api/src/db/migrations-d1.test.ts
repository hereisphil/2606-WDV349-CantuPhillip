import { afterAll, beforeAll, describe, expect, it } from "vitest"
import { unstable_splitSqlQuery } from "wrangler"

import { startD1 } from "./test-d1"
import { migrations, seedSql } from "./test-database"

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
 * The seed's inserts into tables that exist already. The seed is written for
 * the latest schema, and a table added later has no rows to lose anyway.
 */
async function seedExistingTables(): Promise<void> {
  const statements: string[] = []
  for (const statement of unstable_splitSqlQuery(seedSql())) {
    const table = /INSERT INTO (\w+)/i.exec(statement)?.[1]
    if (table === undefined || (await tableExists(table))) {
      statements.push(statement)
    }
  }
  await d1.run(statements)
}

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
  it("start from the first migration and the seed", async () => {
    if (first === undefined) throw new Error("No migrations found")
    await d1.run(first.statements)
    await seedExistingTables()
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
      const after = await counts()

      // A migration may add rows (0006 does), never lose them.
      const lost = Object.entries(before).filter(
        ([table, n]) => (after[table] ?? 0) < n
      )
      expect(lost).toEqual([])
    }
  )

  it("leave every learner with progress enrolled in that course", async () => {
    // The seed ran before `enrollments` existed, so only 0006 can add this.
    const { results } = await d1.env.DB.prepare(
      "SELECT user_id, course_id FROM enrollments"
    ).all()

    expect(results).toEqual([
      { user_id: "usr_prototype_01", course_id: "spanish-core-1000" },
    ])
  })
})

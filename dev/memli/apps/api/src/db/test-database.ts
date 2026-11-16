/// <reference types="node" />
import { readdirSync, readFileSync } from "node:fs"
import { join } from "node:path"
import { DatabaseSync } from "node:sqlite"

/**
 * The real migrations and seed on in-memory `node:sqlite`, the engine under D1:
 * instant, with no Worker. Route tests need a real D1 instead: `test-d1.ts`.
 */

/** `apps/api`. */
export const apiRoot = join(import.meta.dirname, "../..")

const migrationsDir = join(apiRoot, "drizzle/migrations")

export type Migration = { name: string; statements: string[] }

/** Every migration file, in the order they apply, split into statements. */
export function migrations(): Migration[] {
  return readdirSync(migrationsDir)
    .filter((file) => file.endsWith(".sql"))
    .sort()
    .map((name) => ({
      name,
      statements: readFileSync(join(migrationsDir, name), "utf8").split(
        "--> statement-breakpoint"
      ),
    }))
}

/** Every statement of every migration, in the order they apply. */
export function migrationStatements(): string[] {
  return migrations().flatMap((migration) => migration.statements)
}

/** `seed/prototype.sql`, what `bun run db:seed` runs on the local D1. */
export function seedSql(): string {
  return readFileSync(join(apiRoot, "seed/prototype.sql"), "utf8")
}

/** An empty database with every migration applied. */
export function migratedDatabase(): DatabaseSync {
  const db = new DatabaseSync(":memory:")
  // D1 enforces foreign keys; plain SQLite needs asking.
  db.exec("PRAGMA foreign_keys = ON")
  for (const statement of migrationStatements()) {
    db.exec(statement)
  }
  return db
}

export function seed(db: DatabaseSync): void {
  db.exec(seedSql())
}

export function countRows(db: DatabaseSync, table: string): number {
  const row = db.prepare(`SELECT count(*) AS n FROM ${table}`).get()
  return Number(row?.n)
}

/// <reference types="node" />
import { readdirSync, readFileSync } from "node:fs"
import { join } from "node:path"
import { DatabaseSync } from "node:sqlite"

/**
 * The real migration and seed files on an in-memory SQLite database, the
 * engine under D1. Node's built-in `node:sqlite` needs no extra package and
 * no running Worker. For tests only.
 */

/** `apps/api`. */
export const apiRoot = join(import.meta.dirname, "../..")

const migrationsDir = join(apiRoot, "drizzle/migrations")

/** An empty database with every migration applied, in order. */
export function migratedDatabase(): DatabaseSync {
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
  return db
}

/** Runs `seed/prototype.sql`, what `bun run db:seed` runs on the local D1. */
export function seed(db: DatabaseSync): void {
  db.exec(readFileSync(join(apiRoot, "seed/prototype.sql"), "utf8"))
}

export function countRows(db: DatabaseSync, table: string): number {
  const row = db.prepare(`SELECT count(*) AS n FROM ${table}`).get()
  return Number(row?.n)
}

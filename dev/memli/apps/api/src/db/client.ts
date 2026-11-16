import type { BatchItem } from "drizzle-orm/batch"
import { drizzle, type DrizzleD1Database } from "drizzle-orm/d1"

/** Drizzle around the Worker's D1 binding: typed queries, same database. */
export type Database = DrizzleD1Database

export function database(d1: D1Database): Database {
  return drizzle(d1)
}

/** A query that has been built but not run yet. */
export type Statement = BatchItem<"sqlite">

/**
 * Runs statements as one D1 batch, which is a transaction: every one of them
 * takes effect or none does. So a failure half way never leaves, say, a
 * review logged without its card's progress saved.
 */
export async function runTogether(
  db: Database,
  statements: readonly Statement[]
): Promise<void> {
  const [first, ...rest] = statements
  if (first !== undefined) {
    await db.batch([first, ...rest])
  }
}

/**
 * D1 allows 100 bound values (`?`) in one statement. A query that lists ids
 * (`WHERE id IN (?, ?, …)`) has to be split into groups below that, with
 * room left for the query's other values.
 */
const MAX_IDS_PER_QUERY = 90

/** `items` in groups small enough to list in one D1 statement. */
export function idGroups<T>(items: readonly T[]): T[][] {
  const groups: T[][] = []
  for (let start = 0; start < items.length; start += MAX_IDS_PER_QUERY) {
    groups.push(items.slice(start, start + MAX_IDS_PER_QUERY))
  }
  return groups
}

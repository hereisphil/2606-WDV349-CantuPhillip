/// <reference types="node" />
import { join } from "node:path"
import type { CardProgress } from "@workspace/core/srs/progress"
import { getPlatformProxy, unstable_splitSqlQuery } from "wrangler"

import { app } from "../app"
import type { Env } from "../env"
import { database, runTogether, type Database } from "./client"
import { progressUpserts } from "./progress"
import { cards, courses, mnemonics, users } from "./schema"
import { apiRoot, migrationStatements, seedSql } from "./test-database"

/**
 * A real D1 database for route tests. For tests only.
 *
 * `getPlatformProxy` is wrangler's way to use a Worker's bindings from Node:
 * it reads wrangler.jsonc and starts `workerd`, the runtime `wrangler dev`
 * and Cloudflare use, so `env.DB` here behaves like the real one, limits
 * included. `persist: false` keeps it in memory: nothing touches the local
 * database in .wrangler/state.
 */
export type TestApi = {
  /** Drizzle on the test database, to add rows and read them back. */
  db: Database
  /** Calls a route the way a client would, with the test database bound. */
  request: (path: string, init?: RequestInit) => Promise<Response>
  /** Empties every table. */
  reset: () => Promise<void>
  /** Runs `seed/prototype.sql`, split the way `bun run db:seed` splits it. */
  seed: () => Promise<void>
  /** Stops `workerd`. Call it in `afterAll`. */
  stop: () => Promise<void>
}

export async function startTestApi(): Promise<TestApi> {
  const { env, dispose } = await getPlatformProxy<Env>({
    configPath: join(apiRoot, "wrangler.jsonc"),
    persist: false,
  })
  const run = (statements: string[]): Promise<unknown> =>
    env.DB.batch(statements.map((statement) => env.DB.prepare(statement)))

  await run(migrationStatements())

  return {
    db: database(env.DB),
    request: async (path, init) => app.request(path, init, env),
    // Deleting a course or a user takes everything that hangs off it along.
    reset: async () => {
      await run(["DELETE FROM courses", "DELETE FROM users"])
    },
    seed: async () => {
      await run(unstable_splitSqlQuery(seedSql()))
    },
    stop: dispose,
  }
}

export const VIEWER_ID = "usr_prototype_01"
export const AUTHOR_ID = "usr_author"

/** The viewer and one mnemonic author. */
export async function addUsers(db: Database): Promise<void> {
  await db.insert(users).values([
    { id: VIEWER_ID, name: "Phillip", email: "learner@memli.test" },
    { id: AUTHOR_ID, name: "lucia_m", email: "lucia_m@memli.test" },
  ])
}

/**
 * A Spanish course with `cardCount` cards, `<courseId>-1` to
 * `<courseId>-N` in course order. Returns the card ids.
 */
export async function addCourse(
  db: Database,
  courseId: string,
  cardCount: number
): Promise<string[]> {
  await db.insert(courses).values({
    id: courseId,
    title: `Course ${courseId}`,
    learningLanguage: "es",
    answerLanguage: "en",
  })
  const rows = Array.from({ length: cardCount }, (_, index) => {
    const position = index + 1
    return {
      id: `${courseId}-${String(position)}`,
      courseId,
      position,
      term: `palabra ${String(position)}`,
      partOfSpeech: "noun" as const,
      // Only the first card has a gender, so both shapes are covered.
      gender: position === 1 ? ("feminine" as const) : null,
      answers: [`word ${String(position)}`] as [string],
      phonetic: "/paˈlaβɾa/",
      exampleText: "Una palabra.",
      exampleTranslation: "A word.",
    }
  })
  await runTogether(
    db,
    rows.map((row) => db.insert(cards).values(row))
  )
  return rows.map((row) => row.id)
}

export async function addMnemonic(
  db: Database,
  values: {
    id: string
    cardId: string
    upvotes: number
    authorId?: string | null
    picture?: boolean
  }
): Promise<void> {
  await db.insert(mnemonics).values({
    id: values.id,
    cardId: values.cardId,
    authorId: values.authorId === undefined ? AUTHOR_ID : values.authorId,
    contentLocale: "en",
    story: [
      { kind: "plain", text: "A " },
      { kind: "keyword", text: "pal" },
      { kind: "plain", text: " says a " },
      { kind: "term", text: "palabra" },
    ],
    upvotes: values.upvotes,
    ...(values.picture === true && {
      imageSrc: "/mnemonics/gato.svg",
      imageAlt: "A cat at a gala.",
    }),
  })
}

/** Saves progress for the viewer, as a finished review would. */
export async function addProgress(
  db: Database,
  progress: readonly CardProgress[],
  userId: string = VIEWER_ID
): Promise<void> {
  await runTogether(db, progressUpserts(db, userId, progress, new Date()))
}

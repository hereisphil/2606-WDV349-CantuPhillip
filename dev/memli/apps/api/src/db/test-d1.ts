/// <reference types="node" />
import { join } from "node:path"
import type { CardProgress } from "@workspace/core/srs/progress"
import { getPlatformProxy, unstable_splitSqlQuery } from "wrangler"

import { app } from "../app"
import { database, runTogether, type Database } from "./client"
import { progressUpserts } from "./progress"
import { cards, courses, mnemonics, reviews, users } from "./schema"
import { apiRoot, migrationStatements, seedSql } from "./test-database"

/**
 * A real in-memory D1 for route tests, via wrangler's `getPlatformProxy` and
 * `workerd`, limits included. See apps/api/README.md, "Tests".
 */
export type TestApi = {
  /** Drizzle on the test database, to add rows and read them back. */
  db: Database
  /** What `request` hands the app. Spread it to try another environment. */
  env: Env
  /** Calls a route the way a client would, with the test database bound. */
  request: (path: string, init?: RequestInit) => Promise<Response>
  /** Empties every table. */
  reset: () => Promise<void>
  /** Runs `seed/prototype.sql`, split the way `bun run db:seed` splits it. */
  seed: () => Promise<void>
  /** Stops `workerd`. Call it in `afterAll`. */
  stop: () => Promise<void>
}

/** An empty in-memory D1 and `workerd` behind it. Nothing is migrated yet. */
export async function startD1(): Promise<{
  env: Env
  /** Runs statements as one batch, a transaction, the way migrations run. */
  run: (statements: readonly string[]) => Promise<unknown>
  /** Runs `seed/prototype.sql`, split the way `bun run db:seed` splits it. */
  seed: () => Promise<unknown>
  stop: () => Promise<void>
}> {
  const { env, dispose } = await getPlatformProxy<Env>({
    configPath: join(apiRoot, "wrangler.jsonc"),
    persist: false,
  })
  const run = (statements: readonly string[]): Promise<unknown> =>
    env.DB.batch(statements.map((statement) => env.DB.prepare(statement)))
  return {
    env,
    run,
    seed: () => run(unstable_splitSqlQuery(seedSql())),
    stop: dispose,
  }
}

export async function startTestApi(): Promise<TestApi> {
  const { env, run, seed, stop } = await startD1()

  await run(migrationStatements())

  // Set here, never read from a developer's .dev.vars, so CI runs the same.
  const testEnv: Env = {
    ...env,
    BETTER_AUTH_SECRET: TEST_AUTH_SECRET,
    BETTER_AUTH_URL: TEST_ORIGIN,
  }

  return {
    db: database(env.DB),
    env: testEnv,
    request: async (path, init) => app.request(path, init, testEnv),
    // Deleting a course or a user takes everything that hangs off it along.
    reset: async () => {
      await run([
        "DELETE FROM courses",
        "DELETE FROM users",
        "DELETE FROM verifications",
        "DELETE FROM rate_limits",
      ])
    },
    seed: async () => {
      await seed()
    },
    stop,
  }
}

/** The web app's local origin: what a browser sends as `Origin`. */
export const TEST_ORIGIN = "http://localhost:5173"
const TEST_AUTH_SECRET = "test-only-secret-never-used-outside-vitest"

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

/**
 * Review-log rows for history tests; `new` marks a first sighting. Real
 * reviews go through `POST /api/reviews`.
 */
export async function addReviewLog(
  db: Database,
  entries: readonly {
    cardId: string
    at: string
    outcome?: "missed" | "tough" | "got_it" | "easy"
    priorState?: "new" | "learning" | "review" | "relearning"
  }[]
): Promise<void> {
  await runTogether(
    db,
    entries.map((entry) =>
      db.insert(reviews).values({
        id: crypto.randomUUID(),
        userId: VIEWER_ID,
        cardId: entry.cardId,
        outcome: entry.outcome ?? "got_it",
        rating: 3,
        reviewedAt: new Date(entry.at),
        durationMs: 2_000,
        priorState: entry.priorState ?? "review",
        priorDue: new Date(entry.at),
        priorLastReview: null,
        priorStability: 1,
        priorStabilityFast: 1,
        priorDifficulty: 5,
        priorLearningStep: 0,
        priorScheduledDays: 1,
      })
    )
  )
}

/// <reference types="node" />
import { join } from "node:path"
import type { CardProgress } from "@workspace/core/srs/progress"
import { eq } from "drizzle-orm"
import { getPlatformProxy, unstable_splitSqlQuery } from "wrangler"

import { app } from "../app"
import { database, runTogether, type Database } from "./client"
import { progressUpserts } from "./progress"
import {
  cards,
  courses,
  enrollments,
  mnemonics,
  reviews,
  sessions,
  users,
} from "./schema"
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
  /**
   * Calls a route as a client would. Signed in as `as` (the viewer by
   * default) when that learner exists; `null` sends no session.
   */
  request: (
    path: string,
    init?: RequestInit,
    as?: string | null
  ) => Promise<Response>
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

  const db = database(env.DB)

  return {
    db,
    env: testEnv,
    request: async (path, init, as = VIEWER_ID) => {
      const headers = new Headers(init?.headers)
      // A browser on the app's own page sends this with every write.
      const method = init?.method ?? "GET"
      if (method !== "GET" && !headers.has("Origin")) {
        headers.set("Origin", TEST_ORIGIN)
      }
      const cookie = as === null ? null : await sessionCookie(db, as)
      // A test that sends its own cookie keeps it.
      if (cookie !== null && !headers.has("Cookie")) {
        headers.set("Cookie", cookie)
      }
      return app.request(path, { ...init, headers }, testEnv)
    },
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

// Better Auth's cookie on an http origin, as the browser sends it.
const SESSION_COOKIE = "better-auth.session_token"

/**
 * Signs a session token the way Better Auth does (better-call's
 * `signCookieValue`). `src/lib/viewer.test.ts` proves a real sign-in works too.
 */
async function signToken(token: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(TEST_AUTH_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  )
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(token)
  )
  const base64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
  return encodeURIComponent(`${token}.${base64}`)
}

/**
 * A session cookie for `userId`, with its row in `sessions`, or `null` when
 * that learner doesn't exist. Lasts past any faked clock in these tests.
 */
async function sessionCookie(
  db: Database,
  userId: string
): Promise<string | null> {
  const [user] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.id, userId))
  if (user === undefined) return null

  const token = `test-session-${userId}`
  await db
    .insert(sessions)
    .values({
      id: token,
      userId,
      token,
      expiresAt: new Date("2100-01-01T00:00:00.000Z"),
    })
    .onConflictDoNothing()
  return `${SESSION_COOKIE}=${await signToken(token)}`
}
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

/** Lists a course from `addCourse` in the catalog, with every detail it needs. */
export async function publishCourse(
  db: Database,
  courseId: string,
  details: { title?: string; attribution?: string } = {}
): Promise<void> {
  await db
    .update(courses)
    .set({
      ...(details.title !== undefined && { title: details.title }),
      description: `Words for ${courseId}.`,
      publishedAt: new Date("2026-11-01T00:00:00.000Z"),
      source: "Written for Memli",
      license: "CC BY-SA 4.0",
      attribution: details.attribution ?? null,
    })
    .where(eq(courses.id, courseId))
}

/**
 * A course from `addCourse`, already published: one any learner may study.
 * Use `addCourse` alone for a draft.
 */
export async function addPublishedCourse(
  db: Database,
  courseId: string,
  cardCount: number
): Promise<string[]> {
  const cardIds = await addCourse(db, courseId, cardCount)
  await publishCourse(db, courseId)
  return cardIds
}

/** Puts a course on a learner's dashboard, as `PUT …/enrollment` will. */
export async function addEnrollment(
  db: Database,
  courseId: string,
  userId: string = VIEWER_ID
): Promise<void> {
  await db.insert(enrollments).values({ userId, courseId })
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

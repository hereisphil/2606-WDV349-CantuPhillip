import {
  grammaticalGenderSchema,
  partOfSpeechSchema,
} from "@workspace/schemas/content/card"
import type { MnemonicStoryPart } from "@workspace/schemas/content/mnemonic"
import { progressStateSchema } from "@workspace/schemas/srs/progress"
import { reviewOutcomeSchema } from "@workspace/schemas/srs/review"
import { sql, type SQL } from "drizzle-orm"
import {
  check,
  index,
  integer,
  primaryKey,
  real,
  sqliteTable,
  text,
  uniqueIndex,
  type AnySQLiteColumn,
} from "drizzle-orm/sqlite-core"

/**
 * The Memli database: Cloudflare D1, which is SQLite. Column names are
 * snake_case in SQL and camelCase in TypeScript.
 *
 * Timestamps are integers of milliseconds since 1970 (UTC), which Drizzle
 * reads back as `Date`. Integers sort and compare as numbers, so "every card
 * due before now" is a plain range scan on an index. The API converts them to
 * the ISO strings `@workspace/schemas` uses.
 */

const now = sql`(cast(unixepoch('subsecond') * 1000 as integer))`

// Shared by every table, as Drizzle's docs suggest for repeated columns.
const updatedAt = integer("updated_at", { mode: "timestamp_ms" })
  .notNull()
  .default(now)
const timestamps = {
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .default(now),
  updatedAt,
}

/**
 * A Zod enum's values as the non-empty tuple Drizzle's `enum` option wants.
 * Zod types `.options` as a plain array, so the check proves it at startup.
 */
function enumValues<T extends string>(schema: {
  readonly options: readonly T[]
}): [T, ...T[]] {
  const [first, ...rest] = schema.options
  if (first === undefined)
    throw new Error("A Zod enum used as a column is empty")
  return [first, ...rest]
}

const PARTS_OF_SPEECH = enumValues(partOfSpeechSchema)
const GENDERS = enumValues(grammaticalGenderSchema)
const PROGRESS_STATES = enumValues(progressStateSchema)
const OUTCOMES = enumValues(reviewOutcomeSchema)

/**
 * `column IN ('a', 'b', …)`, from a Zod enum's options. The database refuses
 * a value the schemas would refuse, even from a hand-written SQL insert. The
 * values are our own constants, never user input, so `sql.raw` is safe here.
 */
function oneOf(column: AnySQLiteColumn, values: readonly string[]): SQL {
  const list = values.map((value) => `'${value}'`).join(", ")
  return sql`${column} in ${sql.raw(`(${list})`)}`
}

/**
 * A learner. Shaped like Better Auth's core `user` model (#108): id, name,
 * email, emailVerified, image, createdAt and updatedAt, with Better Auth
 * pointed at this table by `user: { modelName: "users" }`. Better Auth adds
 * its own `session`, `account` and `verification` tables next to it; nothing
 * here needs to change.
 *
 * `uiLocale` is the app's language for this learner, declared to Better Auth
 * as an additional field. It is never a course's language.
 */
export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  /** What the app calls the learner ("Phillip"). Better Auth's `name`. */
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" })
    .notNull()
    .default(false),
  image: text("image"),
  uiLocale: text("ui_locale").notNull().default("en"),
  ...timestamps,
})

/** What learners study. Never called a deck (`.cursor/rules/ui-design.mdc`). */
export const courses = sqliteTable(
  "courses",
  {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    /** What the course teaches: the language of each card's term. */
    learningLanguage: text("learning_language").notNull(),
    /** What the answers and example translations are written in. */
    answerLanguage: text("answer_language").notNull(),
    ...timestamps,
  },
  (t) => [index("courses_learning_language_idx").on(t.learningLanguage)]
)

/** One word to learn. What the course teaches, never how well anyone knows it. */
export const cards = sqliteTable(
  "cards",
  {
    id: text("id").primaryKey(),
    courseId: text("course_id")
      .notNull()
      .references(() => courses.id, { onDelete: "cascade" }),
    /** Order within the course. New words are introduced in this order. */
    position: integer("position").notNull(),
    term: text("term").notNull(),
    partOfSpeech: text("part_of_speech", {
      enum: PARTS_OF_SPEECH,
    }).notNull(),
    gender: text("gender", { enum: GENDERS }),
    /** Accepted meanings, a JSON array; the first is shown on reveal. */
    answers: text("answers", { mode: "json" })
      .$type<[string, ...string[]]>()
      .notNull(),
    phonetic: text("phonetic").notNull(),
    exampleText: text("example_text").notNull(),
    exampleTranslation: text("example_translation").notNull(),
    ...timestamps,
  },
  (t) => [
    uniqueIndex("cards_course_position_idx").on(t.courseId, t.position),
    check("cards_part_of_speech_check", oneOf(t.partOfSpeech, PARTS_OF_SPEECH)),
    check(
      "cards_gender_check",
      sql`${t.gender} is null or ${oneOf(t.gender, GENDERS)}`
    ),
    check("cards_answers_check", sql`json_array_length(${t.answers}) > 0`),
  ]
)

/** A community memory hook for one card. */
export const mnemonics = sqliteTable(
  "mnemonics",
  {
    id: text("id").primaryKey(),
    cardId: text("card_id")
      .notNull()
      .references(() => cards.id, { onDelete: "cascade" }),
    /** Who wrote it. Kept as `null` if the author deletes their account. */
    authorId: text("author_id").references(() => users.id, {
      onDelete: "set null",
    }),
    /** What the story and image description are written in. */
    contentLocale: text("content_locale").notNull(),
    /** The story as data, a JSON array of parts, never markup. */
    story: text("story", { mode: "json" })
      .$type<[MnemonicStoryPart, ...MnemonicStoryPart[]]>()
      .notNull(),
    /** A running count for now. A votes table replaces it when voting ships. */
    upvotes: integer("upvotes").notNull().default(0),
    imageSrc: text("image_src"),
    /** Describes the picture, in `contentLocale`. Required with a picture. */
    imageAlt: text("image_alt"),
    ...timestamps,
  },
  (t) => [
    index("mnemonics_card_idx").on(t.cardId),
    check("mnemonics_upvotes_check", sql`${t.upvotes} >= 0`),
    check("mnemonics_story_check", sql`json_array_length(${t.story}) > 0`),
    check(
      "mnemonics_image_check",
      sql`(${t.imageSrc} is null) = (${t.imageAlt} is null)`
    ),
  ]
)

/**
 * One learner's memory of one card: `@workspace/core`'s `CardProgress`, one
 * column per field. All eleven are needed to schedule the next review, so
 * none may be dropped. `src/db/progress.ts` converts a row to and from
 * `CardProgress`.
 *
 * No row means the learner has never seen the card.
 */
export const userProgress = sqliteTable(
  "user_progress",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    cardId: text("card_id")
      .notNull()
      .references(() => cards.id, { onDelete: "cascade" }),
    state: text("state", { enum: PROGRESS_STATES }).notNull(),
    due: integer("due", { mode: "timestamp_ms" }).notNull(),
    lastReview: integer("last_review", { mode: "timestamp_ms" }),
    stability: real("stability").notNull(),
    stabilityFast: real("stability_fast").notNull(),
    difficulty: real("difficulty").notNull(),
    reps: integer("reps").notNull(),
    lapses: integer("lapses").notNull(),
    learningStep: integer("learning_step").notNull(),
    scheduledDays: real("scheduled_days").notNull(),
    updatedAt,
  },
  (t) => [
    primaryKey({ columns: [t.userId, t.cardId] }),
    // "What is due for this learner?" is the query every study session starts with.
    index("user_progress_user_due_idx").on(t.userId, t.due),
    check("user_progress_state_check", oneOf(t.state, PROGRESS_STATES)),
    check(
      "user_progress_counts_check",
      sql`${t.reps} >= 0 and ${t.lapses} >= 0 and ${t.learningStep} >= 0`
    ),
  ]
)

/**
 * Every review a learner has finished, one row each, never changed
 * afterwards. `user_progress` says where a card stands now; this says how it
 * got there. Days of study, retention, undo and FSRS parameter training all
 * read from here.
 *
 * It is `@workspace/core`'s review log. The `prior_` columns are the card as
 * it was *before* the review, which is what undo and training need: the
 * result of a review is the next row's `prior_` values, or `user_progress`.
 */
export const reviews = sqliteTable(
  "reviews",
  {
    /**
     * A UUID the client makes, one per review. A request sent twice (a retry
     * after a dropped connection) names the same ids, so the server can tell
     * and records each review once.
     */
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    cardId: text("card_id")
      .notNull()
      .references(() => cards.id, { onDelete: "cascade" }),
    /** How it went, in Memli's terms: what the learner chose. */
    outcome: text("outcome", { enum: OUTCOMES }).notNull(),
    /** The FSRS rating the outcome became, 1 (forgot) to 4 (effortless). */
    rating: integer("rating").notNull(),
    /** When it happened, by the server's clock. */
    reviewedAt: integer("reviewed_at", { mode: "timestamp_ms" }).notNull(),
    /** Response time, capped by core's `capElapsedMs`. `null` when unknown. */
    durationMs: integer("duration_ms"),
    priorState: text("prior_state", { enum: PROGRESS_STATES }).notNull(),
    priorDue: integer("prior_due", { mode: "timestamp_ms" }).notNull(),
    /** `null` on a card's first review. */
    priorLastReview: integer("prior_last_review", { mode: "timestamp_ms" }),
    priorStability: real("prior_stability").notNull(),
    priorStabilityFast: real("prior_stability_fast").notNull(),
    priorDifficulty: real("prior_difficulty").notNull(),
    priorLearningStep: integer("prior_learning_step").notNull(),
    priorScheduledDays: real("prior_scheduled_days").notNull(),
  },
  (t) => [
    // "What did this learner study, and when?" in time order.
    index("reviews_user_reviewed_at_idx").on(t.userId, t.reviewedAt),
    check("reviews_outcome_check", oneOf(t.outcome, OUTCOMES)),
    check("reviews_rating_check", sql`${t.rating} between 1 and 4`),
    check(
      "reviews_duration_check",
      sql`${t.durationMs} is null or ${t.durationMs} >= 0`
    ),
    check("reviews_prior_state_check", oneOf(t.priorState, PROGRESS_STATES)),
  ]
)

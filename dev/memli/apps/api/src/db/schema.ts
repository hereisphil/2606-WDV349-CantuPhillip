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
 * Timestamps are integer milliseconds (UTC), read as `Date`, so "due before
 * now" is an index range scan. See apps/api/README.md, "Timestamps".
 */

/*
 * Language tags are checked by triggers in 0002_language_tag_checks.sql, not
 * CHECK: adding one rebuilds the table, which on D1 deletes every child row.
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
 * `column IN ('a', 'b', …)` from a Zod enum, so SQL refuses what the schemas
 * refuse. The values are our constants, never input, so `sql.raw` is safe.
 */
function oneOf(column: AnySQLiteColumn, values: readonly string[]): SQL {
  const list = values.map((value) => `'${value}'`).join(", ")
  return sql`${column} in ${sql.raw(`(${list})`)}`
}

/**
 * A learner, shaped like Better Auth's `user` model (#108, apps/api/README.md).
 * `uiLocale` is the app's language for this learner, never a course's.
 */
export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" })
    .notNull()
    .default(false),
  image: text("image"),
  /** A language tag; checked by a trigger (see the note at the top). */
  uiLocale: text("ui_locale").notNull().default("en"),
  ...timestamps,
})

/**
 * Better Auth's `session` model: one row per signed-in browser (#108).
 * Deleted on sign out; `token` is what the session cookie carries.
 */
export const sessions = sqliteTable(
  "sessions",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    token: text("token").notNull().unique(),
    expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
    /** Personal data: listed in the Privacy Policy (#170). */
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    ...timestamps,
  },
  (t) => [index("sessions_user_idx").on(t.userId)]
)

/**
 * Better Auth's `account` model: one way a learner signs in. For email
 * sign-in, `providerId` is `credential` and `password` holds the scrypt hash.
 */
export const accounts = sqliteTable(
  "accounts",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    /** The learner's id at the provider; their own user id for `credential`. */
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: integer("access_token_expires_at", {
      mode: "timestamp_ms",
    }),
    refreshTokenExpiresAt: integer("refresh_token_expires_at", {
      mode: "timestamp_ms",
    }),
    scope: text("scope"),
    /** A scrypt hash, never the password. Only on `credential` accounts. */
    password: text("password"),
    ...timestamps,
  },
  (t) => [index("accounts_user_idx").on(t.userId)]
)

/** Better Auth's `verification` model: short-lived tokens, such as a password reset. */
export const verifications = sqliteTable(
  "verifications",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
    ...timestamps,
  },
  (t) => [index("verifications_identifier_idx").on(t.identifier)]
)

/** What learners study. Never called a deck (`.cursor/rules/ui-design.mdc`). */
export const courses = sqliteTable(
  "courses",
  {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    /** What the course teaches: the language of each card's term. A language tag. */
    learningLanguage: text("learning_language").notNull(),
    /** What the answers and example translations are written in. A language tag. */
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
    /** What the story and image description are written in. A language tag. */
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
 * Core's `CardProgress`, one column per field; FSRS-7 needs all eleven.
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
 * Core's review log: one row per review, never changed. `prior_*` is the card
 * before it, for undo and FSRS training (apps/api/README.md, "Review log").
 */
export const reviews = sqliteTable(
  "reviews",
  {
    /** The client's UUID for the review, so a retried request records it once. */
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

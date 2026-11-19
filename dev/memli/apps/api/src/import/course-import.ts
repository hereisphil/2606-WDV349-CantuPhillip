import type { CourseFile } from "@workspace/schemas/content/course-file"

/**
 * Turns a course file into SQL for `wrangler d1 execute` (#174). Pure, so the
 * tests run it on SQLite. How it works: apps/api/README.md, "Importing a course".
 */

/** The author every starter mnemonic is credited to. It has no way to sign in. */
export const MEMLI_AUTHOR = {
  id: "usr_memli",
  name: "Memli",
  // `.invalid` can never be a real address (RFC 2606), so no one can claim it.
  email: "authors@memli.invalid",
} as const

/** A SQL string literal. Quotes are doubled; no other character is special. */
function text(value: string): string {
  return `'${value.replaceAll("'", "''")}'`
}

function textOrNull(value: string | undefined): string {
  return value === undefined ? "NULL" : text(value)
}

/** Ids per statement in a check, so no statement nears D1's 100 KB limit. */
const IDS_PER_CHECK = 1_000

function inGroups(ids: readonly string[]): string[] {
  const groups: string[] = []
  for (let start = 0; start < ids.length; start += IDS_PER_CHECK) {
    groups.push(
      ids
        .slice(start, start + IDS_PER_CHECK)
        .map(text)
        .join(", ")
    )
  }
  return groups
}

function mnemonicIds(file: CourseFile): string[] {
  return file.cards.flatMap((card) =>
    (card.mnemonics ?? []).map((mnemonic) => mnemonic.mnemonicId)
  )
}

/** A row the checks read back: what kind of finding it is, and its id. */
export type CheckRow = {
  kind: "existing" | "foreign-card" | "foreign-mnemonic"
  id: string
}

/**
 * Read-only queries to run before importing. Each answers rows of `CheckRow`:
 * the course's current words, and ids in the file that belong to someone else.
 */
export function importChecks(file: CourseFile): string[] {
  const courseId = text(file.course.courseId)
  return [
    `SELECT 'existing' AS kind, id FROM cards WHERE course_id = ${courseId}`,
    ...inGroups(file.cards.map((card) => card.cardId)).map(
      (ids) =>
        `SELECT 'foreign-card' AS kind, id FROM cards WHERE id IN (${ids}) AND course_id <> ${courseId}`
    ),
    ...inGroups(mnemonicIds(file)).map(
      (ids) =>
        `SELECT 'foreign-mnemonic' AS kind, m.id FROM mnemonics m JOIN cards c ON c.id = m.card_id WHERE m.id IN (${ids}) AND (m.author_id IS NOT ${text(MEMLI_AUTHOR.id)} OR c.course_id <> ${courseId})`
    ),
  ]
}

export type ImportPlan = {
  /** Words in the database that the file no longer has. */
  removedCards: string[]
  /** Card ids in the file that another course already uses. */
  takenCardIds: string[]
  /** Mnemonic ids in the file that a learner or another course already uses. */
  takenMnemonicIds: string[]
}

/** Reads the checks' rows: what this import would remove, and what it can't take. */
export function planImport(
  file: CourseFile,
  rows: readonly CheckRow[]
): ImportPlan {
  const inFile = new Set(file.cards.map((card) => card.cardId))
  const ids = (kind: CheckRow["kind"]): string[] =>
    rows
      .filter((row) => row.kind === kind)
      .map((row) => row.id)
      .sort()
  return {
    removedCards: ids("existing").filter((id) => !inFile.has(id)),
    takenCardIds: ids("foreign-card"),
    takenMnemonicIds: ids("foreign-mnemonic"),
  }
}

/**
 * The statements that load the file, in order, safe to run again. Words keep
 * their ids, so learners' progress stays; only `removeMissing` deletes any.
 */
export function importStatements(
  file: CourseFile,
  { now, removeMissing }: { now: Date; removeMissing: boolean }
): string[] {
  const { course, cards } = file
  const courseId = text(course.courseId)
  // Every row this import writes carries this stamp, so the rest can be found after.
  const stamp = String(now.getTime())
  const statements: string[] = []

  statements.push(
    `INSERT INTO users (id, name, email, email_verified, ui_locale)
VALUES (${text(MEMLI_AUTHOR.id)}, ${text(MEMLI_AUTHOR.name)}, ${text(MEMLI_AUTHOR.email)}, 1, 'en')
ON CONFLICT (id) DO UPDATE SET name = excluded.name`
  )

  // A course already published keeps its date; unpublishing hides it again.
  statements.push(
    `INSERT INTO courses (id, title, learning_language, answer_language, description, published_at, source, license, attribution, updated_at)
VALUES (${courseId}, ${text(course.title)}, ${text(course.learningLanguage)}, ${text(course.answerLanguage)}, ${text(course.description)}, ${course.published ? stamp : "NULL"}, ${text(course.source)}, ${text(course.license)}, ${textOrNull(course.attribution)}, ${stamp})
ON CONFLICT (id) DO UPDATE SET
  title = excluded.title,
  learning_language = excluded.learning_language,
  answer_language = excluded.answer_language,
  description = excluded.description,
  published_at = CASE WHEN excluded.published_at IS NULL THEN NULL ELSE coalesce(courses.published_at, excluded.published_at) END,
  source = excluded.source,
  license = excluded.license,
  attribution = excluded.attribution,
  updated_at = excluded.updated_at`
  )

  // Out of the way first, so a reordered word can take a place another still holds.
  statements.push(
    `UPDATE cards SET position = -position WHERE course_id = ${courseId} AND position > 0`
  )

  cards.forEach((card, index) => {
    statements.push(
      `INSERT INTO cards (id, course_id, position, term, part_of_speech, gender, answers, phonetic, example_text, example_translation, updated_at)
VALUES (${text(card.cardId)}, ${courseId}, ${String(index + 1)}, ${text(card.term)}, ${text(card.partOfSpeech)}, ${textOrNull(card.gender)}, ${text(JSON.stringify(card.answers))}, ${text(card.phonetic)}, ${text(card.example.text)}, ${text(card.example.translation)}, ${stamp})
ON CONFLICT (id) DO UPDATE SET
  position = excluded.position,
  term = excluded.term,
  part_of_speech = excluded.part_of_speech,
  gender = excluded.gender,
  answers = excluded.answers,
  phonetic = excluded.phonetic,
  example_text = excluded.example_text,
  example_translation = excluded.example_translation,
  updated_at = excluded.updated_at
WHERE cards.course_id = excluded.course_id`
    )
    for (const mnemonic of card.mnemonics ?? []) {
      statements.push(
        `INSERT INTO mnemonics (id, card_id, author_id, content_locale, story, upvotes, image_src, image_alt, updated_at)
VALUES (${text(mnemonic.mnemonicId)}, ${text(card.cardId)}, ${text(MEMLI_AUTHOR.id)}, ${text(mnemonic.contentLocale)}, ${text(JSON.stringify(mnemonic.story))}, 0, ${textOrNull(mnemonic.image?.src)}, ${textOrNull(mnemonic.image?.alt)}, ${stamp})
ON CONFLICT (id) DO UPDATE SET
  content_locale = excluded.content_locale,
  story = excluded.story,
  image_src = excluded.image_src,
  image_alt = excluded.image_alt,
  updated_at = excluded.updated_at
WHERE mnemonics.author_id = excluded.author_id AND mnemonics.card_id = excluded.card_id`
      )
    }
  })

  // Starter stories the file no longer has. Learners' own are never touched.
  statements.push(
    `DELETE FROM mnemonics WHERE author_id = ${text(MEMLI_AUTHOR.id)} AND updated_at <> ${stamp} AND card_id IN (SELECT id FROM cards WHERE course_id = ${courseId})`
  )

  // Words the file no longer has are still at a negative place. Deleting one
  // deletes every learner's progress on it, so it takes `removeMissing`.
  if (removeMissing) {
    statements.push(
      `DELETE FROM cards WHERE course_id = ${courseId} AND position < 0`
    )
  }

  return statements
}

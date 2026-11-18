import type { SampleWord } from "@workspace/schemas/api/catalog"
import type { Card } from "@workspace/schemas/content/card"
import type { Course } from "@workspace/schemas/content/course"
import type { Mnemonic } from "@workspace/schemas/content/mnemonic"
import { and, asc, count, desc, eq, inArray, isNotNull } from "drizzle-orm"

import { idGroups, type Database } from "./client"
import { cards, courses, mnemonics, users } from "./schema"

/**
 * Reads courses, cards and mnemonics as `@workspace/schemas` shapes, each card
 * with its mnemonics nested and sorted, ready to show.
 */

type CourseRow = typeof courses.$inferSelect
type CardRow = typeof cards.$inferSelect

function courseFromRow(row: CourseRow): Course {
  return {
    courseId: row.id,
    title: row.title,
    learningLanguage: row.learningLanguage,
    answerLanguage: row.answerLanguage,
  }
}

function cardFromRow(row: CardRow, cardMnemonics: Mnemonic[]): Card {
  return {
    cardId: row.id,
    term: row.term,
    partOfSpeech: row.partOfSpeech,
    // Left out, not null, for words and languages with no gender.
    ...(row.gender !== null && { gender: row.gender }),
    answers: row.answers,
    phonetic: row.phonetic,
    example: { text: row.exampleText, translation: row.exampleTranslation },
    mnemonics: cardMnemonics,
  }
}

export async function listCourses(db: Database): Promise<Course[]> {
  const rows = await db.select().from(courses).orderBy(asc(courses.id))
  return rows.map(courseFromRow)
}

/** A course the catalog lists, with the details a published course must have. */
export type PublishedCourse = Course & {
  description: string
  publishedAt: Date
  source: string
  license: string
  attribution: string | null
}

/**
 * `null` for a draft. The triggers in 0008_published_courses.sql keep a
 * published row complete; the checks here only narrow the types.
 */
function publishedFromRow(row: CourseRow): PublishedCourse | null {
  const { description, publishedAt, source, license } = row
  if (
    publishedAt === null ||
    description === null ||
    source === null ||
    license === null
  ) {
    return null
  }
  return {
    ...courseFromRow(row),
    description,
    publishedAt,
    source,
    license,
    attribution: row.attribution,
  }
}

/** Every published course, by title. Drafts are left out. */
export async function listPublishedCourses(
  db: Database
): Promise<PublishedCourse[]> {
  const rows = await db
    .select()
    .from(courses)
    .where(isNotNull(courses.publishedAt))
    .orderBy(asc(courses.title), asc(courses.id))
  return rows.flatMap((row) => publishedFromRow(row) ?? [])
}

/** A published course, or `null` for a draft or a course that does not exist. */
export async function findPublishedCourse(
  db: Database,
  courseId: string
): Promise<PublishedCourse | null> {
  const [row] = await db
    .select()
    .from(courses)
    .where(and(eq(courses.id, courseId), isNotNull(courses.publishedAt)))
    .limit(1)
  return row === undefined ? null : publishedFromRow(row)
}

export async function findCourse(
  db: Database,
  courseId: string
): Promise<Course | null> {
  const [row] = await db
    .select()
    .from(courses)
    .where(eq(courses.id, courseId))
    .limit(1)
  return row === undefined ? null : courseFromRow(row)
}

/** How many cards each course has, by course id. A course with none is absent. */
export async function cardCountByCourse(
  db: Database
): Promise<Map<string, number>> {
  const rows = await db
    .select({ courseId: cards.courseId, total: count() })
    .from(cards)
    .groupBy(cards.courseId)
  return new Map(rows.map((row) => [row.courseId, row.total]))
}

export async function cardCount(
  db: Database,
  courseId: string
): Promise<number> {
  const [row] = await db
    .select({ total: count() })
    .from(cards)
    .where(eq(cards.courseId, courseId))
  return row?.total ?? 0
}

/** A course's first `limit` words, in course order, without their stories. */
export async function firstWords(
  db: Database,
  courseId: string,
  limit: number
): Promise<SampleWord[]> {
  const rows = await db
    .select()
    .from(cards)
    .where(eq(cards.courseId, courseId))
    .orderBy(asc(cards.position))
    .limit(limit)
  return rows.map((row) => {
    const { cardId, term, partOfSpeech, gender, answers, phonetic } =
      cardFromRow(row, [])
    return {
      cardId,
      term,
      partOfSpeech,
      ...(gender !== undefined && { gender }),
      answers,
      phonetic,
    }
  })
}

/** A course's card ids in the order new words are introduced. */
export async function cardIdsInOrder(
  db: Database,
  courseId: string
): Promise<string[]> {
  const rows = await db
    .select({ id: cards.id })
    .from(cards)
    .where(eq(cards.courseId, courseId))
    .orderBy(asc(cards.position))
  return rows.map((row) => row.id)
}

export async function existingCardIds(
  db: Database,
  cardIds: readonly string[]
): Promise<Set<string>> {
  const groups = await Promise.all(
    idGroups(cardIds).map((ids) =>
      db.select({ id: cards.id }).from(cards).where(inArray(cards.id, ids))
    )
  )
  return new Set(groups.flat().map((row) => row.id))
}

/**
 * Full cards by id, each with its mnemonics, most upvoted first. Ids that do
 * not exist are simply absent from the map.
 */
export async function cardsById(
  db: Database,
  cardIds: readonly string[]
): Promise<Map<string, Card>> {
  const groups = idGroups(cardIds)
  const [cardRows, mnemonicRows] = await Promise.all([
    Promise.all(
      groups.map((ids) => db.select().from(cards).where(inArray(cards.id, ids)))
    ),
    Promise.all(
      groups.map((ids) =>
        db
          .select({ mnemonic: mnemonics, authorName: users.name })
          .from(mnemonics)
          // A left join keeps a mnemonic whose author has left.
          .leftJoin(users, eq(users.id, mnemonics.authorId))
          .where(inArray(mnemonics.cardId, ids))
          // The id breaks ties, so the order never changes between requests.
          .orderBy(desc(mnemonics.upvotes), asc(mnemonics.id))
      )
    ),
  ])

  const mnemonicsByCard = new Map<string, Mnemonic[]>()
  for (const { mnemonic, authorName } of mnemonicRows.flat()) {
    const list = mnemonicsByCard.get(mnemonic.cardId) ?? []
    list.push({
      mnemonicId: mnemonic.id,
      contentLocale: mnemonic.contentLocale,
      story: mnemonic.story,
      author: authorName === null ? null : { displayName: authorName },
      upvotes: mnemonic.upvotes,
      ...(mnemonic.imageSrc !== null &&
        mnemonic.imageAlt !== null && {
          image: { src: mnemonic.imageSrc, alt: mnemonic.imageAlt },
        }),
    })
    mnemonicsByCard.set(mnemonic.cardId, list)
  }

  return new Map(
    cardRows
      .flat()
      .map((row) => [
        row.id,
        cardFromRow(row, mnemonicsByCard.get(row.id) ?? []),
      ])
  )
}

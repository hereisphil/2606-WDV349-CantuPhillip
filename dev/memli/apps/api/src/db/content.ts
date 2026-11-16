import type { Card } from "@workspace/schemas/content/card"
import type { Course } from "@workspace/schemas/content/course"
import type { Mnemonic } from "@workspace/schemas/content/mnemonic"
import { asc, count, desc, eq, inArray } from "drizzle-orm"

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

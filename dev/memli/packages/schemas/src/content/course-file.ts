import { z } from "zod"

import { cardSchema } from "./card"
import { courseSchema } from "./course"
import { mnemonicSchema } from "./mnemonic"

/**
 * One course as a file, for the import script (dev/memli/docs/course-files.md).
 * Hand-written, so unknown keys are refused: a typo fails, never vanishes.
 */

/** Names the format and its version, so a later version can be told apart. */
export const COURSE_FILE_FORMAT = "memli-course/1"

/** Words in one course. A large frequency list, with room to spare. */
export const MAX_COURSE_WORDS = 5_000

/** Starter mnemonics per word: a few to begin with, the community adds more. */
export const MAX_STARTER_MNEMONICS = 3

/** Required text with no blank value; the database refuses blank ones too. */
const text = (max: number): z.ZodString => z.string().trim().min(1).max(max)

/** The course itself: its catalog details always, so it can be published. */
export const courseFileCourseSchema = z.strictObject({
  ...courseSchema.shape,
  /** A sentence or two for the catalog, in `answerLanguage`. */
  description: text(280),
  /** Listed in the catalog once imported. `false` imports it as a hidden draft. */
  published: z.boolean(),
  /** Who wrote the words, or the dataset they came from. */
  source: text(200),
  /** As learners see it: `CC BY-SA 4.0`, `All rights reserved`. */
  license: text(100),
  /** The credit line the license asks for. Leave it out when it asks none. */
  attribution: text(500).optional(),
})

/** A starter mnemonic: no author or votes, which belong to learners. */
export const courseFileMnemonicSchema = z.strictObject({
  mnemonicId: mnemonicSchema.shape.mnemonicId,
  contentLocale: mnemonicSchema.shape.contentLocale,
  story: mnemonicSchema.shape.story,
  image: mnemonicSchema.shape.image,
})

/** One word. Its place in `cards` is its position: the order learners meet it. */
export const courseFileCardSchema = z.strictObject({
  ...cardSchema.omit({ mnemonics: true }).shape,
  example: z.strictObject(cardSchema.shape.example.shape),
  mnemonics: z
    .array(courseFileMnemonicSchema)
    .max(MAX_STARTER_MNEMONICS)
    .optional(),
})

/** Indexes of every value seen more than once, so the error can point at each. */
function duplicates(values: readonly string[]): number[] {
  const seen = new Set<string>()
  return values.flatMap((value, index) => {
    if (seen.has(value)) return [index]
    seen.add(value)
    return []
  })
}

export const courseFileSchema = z
  .strictObject({
    format: z.literal(COURSE_FILE_FORMAT),
    course: courseFileCourseSchema,
    cards: z.array(courseFileCardSchema).min(1).max(MAX_COURSE_WORDS),
  })
  .superRefine(({ cards }, ctx) => {
    // Ids are primary keys: two words or two stories can't share one.
    for (const index of duplicates(cards.map((card) => card.cardId))) {
      ctx.addIssue({
        code: "custom",
        message: "Each word needs its own cardId",
        path: ["cards", index, "cardId"],
      })
    }
    const mnemonics = cards.flatMap((card, cardIndex) =>
      (card.mnemonics ?? []).map((mnemonic, index) => ({
        id: mnemonic.mnemonicId,
        path: ["cards", cardIndex, "mnemonics", index, "mnemonicId"],
      }))
    )
    for (const index of duplicates(mnemonics.map((row) => row.id))) {
      ctx.addIssue({
        code: "custom",
        message: "Each mnemonic needs its own mnemonicId",
        path: mnemonics[index]?.path ?? ["cards"],
      })
    }
  })

export type CourseFile = z.infer<typeof courseFileSchema>

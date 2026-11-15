import { z } from "zod"

import { languageTagSchema } from "../locale/language-tag"
import { cardSchema } from "./card"

/**
 * A set of words in one language, explained in another. "Course" everywhere,
 * in code and data as on screen: learners never need to know it works like a
 * flashcard deck, and it will grow into more than one.
 *
 * Neither language is the viewer's `uiLocale`. A Brazilian learner can use
 * the app in Portuguese while studying Japanese explained in English.
 */
export const courseSchema = z.object({
  courseId: z.string().min(1),
  title: z.string().min(1),
  /** What the course teaches: the language of each card's `term`. */
  learningLanguage: languageTagSchema,
  /** What each card's `answers` and example translation are written in. */
  answerLanguage: languageTagSchema,
})

export type Course = z.infer<typeof courseSchema>

/** The cards to study in one course. Never empty, so a session always has a first card. */
export const courseCardsSchema = z.object({
  answerLanguage: languageTagSchema,
  cards: z.array(cardSchema).nonempty(),
})

export type CourseCards = z.infer<typeof courseCardsSchema>

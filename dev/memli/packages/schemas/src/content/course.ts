import { z } from "zod"

import { languageTagSchema } from "../locale/language-tag"
import { cardSchema } from "./card"

/**
 * Words in one language, explained in another; neither is the `uiLocale`
 * (docs/i18n.md). Never "deck": see .cursor/rules/ui-design.mdc.
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

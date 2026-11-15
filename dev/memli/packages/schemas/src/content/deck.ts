import { z } from "zod"

import { languageTagSchema } from "../locale/language-tag"
import { cardSchema } from "./card"

/**
 * A set of words in one language, explained in another. Learners see it
 * called a "course" (docs/designs/REDESIGN.md); the data keeps "deck".
 *
 * Neither language is the viewer's `uiLocale`. A Brazilian learner can use
 * the app in Portuguese while studying Japanese explained in English.
 */
export const deckSchema = z.object({
  deckId: z.string().min(1),
  title: z.string().min(1),
  /** What the deck teaches: the language of each card's `term`. */
  learningLanguage: languageTagSchema,
  /** What each card's `answers` and example translation are written in. */
  answerLanguage: languageTagSchema,
})

export type Deck = z.infer<typeof deckSchema>

/** The cards to study in one deck. Never empty, so a session always has a first card. */
export const deckCardsSchema = z.object({
  answerLanguage: languageTagSchema,
  cards: z.array(cardSchema).nonempty(),
})

export type DeckCards = z.infer<typeof deckCardsSchema>

import { z } from "zod"

import { mnemonicSchema } from "./mnemonic"

/** Grammar fields are stable codes; the UI maps them to labels in the UI locale. */
export const partOfSpeechSchema = z.enum([
  "noun",
  "verb",
  "adjective",
  "adverb",
  "phrase",
])

export type PartOfSpeech = z.infer<typeof partOfSpeechSchema>

export const grammaticalGenderSchema = z.enum([
  "masculine",
  "feminine",
  "neuter",
])

export type GrammaticalGender = z.infer<typeof grammaticalGenderSchema>

/**
 * One word to learn: what the deck teaches, never how well a learner knows
 * it. That is `CardProgress` (`@workspace/schemas/srs/progress`).
 */
export const cardSchema = z.object({
  cardId: z.string().min(1),
  /** The word or phrase being learned, in the deck's `learningLanguage`. */
  term: z.string().min(1),
  partOfSpeech: partOfSpeechSchema,
  /** Only for languages and words that have one. */
  gender: grammaticalGenderSchema.optional(),
  /**
   * Accepted meanings in the deck's `answerLanguage`; typing any one counts.
   * The first is the one shown on reveal. Same field `@workspace/core`'s
   * `SessionCard` uses, so a card can feed the session reducer as is.
   */
  answers: z.array(z.string().min(1)).nonempty(),
  /** IPA, or a romanization for non-Latin scripts. Shown on reveal. */
  phonetic: z.string().min(1),
  /** A sentence using the term, and what it means. Shown on reveal. */
  example: z.object({
    /** In the deck's `learningLanguage`. */
    text: z.string().min(1),
    /** In the deck's `answerLanguage`. */
    translation: z.string().min(1),
  }),
  /**
   * Shown on reveal, most upvoted first; the learner can cycle through the
   * rest. Empty or missing when the card has none yet.
   */
  mnemonics: z.array(mnemonicSchema).optional(),
})

export type Card = z.infer<typeof cardSchema>

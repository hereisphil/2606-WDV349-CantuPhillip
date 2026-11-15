import { z } from "zod"

import { languageTagSchema } from "../locale/language-tag"

/**
 * One run of a mnemonic story. A story is data, not markup, so community
 * text is never parsed as HTML.
 *
 * - `plain`: story text, in the mnemonic's `contentLocale`.
 * - `term`: the word being learned, in the deck's `learningLanguage`.
 * - `keyword`: the sound-alike hook that links the term to its meaning.
 */
export const mnemonicStoryPartSchema = z.object({
  kind: z.enum(["plain", "term", "keyword"]),
  text: z.string().min(1),
})

export type MnemonicStoryPart = z.infer<typeof mnemonicStoryPartSchema>

/** A memory hook for one card, written by the community (#50). */
export const mnemonicSchema = z.object({
  mnemonicId: z.string().min(1),
  /**
   * What the story and image description are written in. Often the deck's
   * `answerLanguage`, but not always: a Spanish speaker can share a story in
   * Spanish on an English-to-Japanese deck.
   */
  contentLocale: languageTagSchema,
  story: z.array(mnemonicStoryPartSchema).nonempty(),
  author: z.object({
    displayName: z.string().min(1),
  }),
  /** Learners who found it useful. A card lists its mnemonics by this, highest first. */
  upvotes: z.int().nonnegative(),
  /** Picture for the hook. Optional: a story works without one. */
  image: z
    .object({
      src: z.string().min(1),
      /** Describes the picture, in `contentLocale`. */
      alt: z.string().min(1),
    })
    .optional(),
})

export type Mnemonic = z.infer<typeof mnemonicSchema>

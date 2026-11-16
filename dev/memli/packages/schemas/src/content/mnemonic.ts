import { z } from "zod"

import { languageTagSchema } from "../locale/language-tag"

/**
 * One run of a mnemonic story: data, not markup, so community text is never
 * parsed as HTML. `term` is in the course's `learningLanguage`.
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
   * What the story and alt text are written in. Often, but not always, the
   * course's `answerLanguage`.
   */
  contentLocale: languageTagSchema,
  story: z.array(mnemonicStoryPartSchema).nonempty(),
  /** Who wrote it. `null` once the author has deleted their account. */
  author: z
    .object({
      displayName: z.string().min(1),
    })
    .nullable(),
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

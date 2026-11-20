import { z } from "zod"

import { languageTagSchema } from "../locale/language-tag"
import { idSchema } from "./id"

// Room for a good story, with a ceiling that community posting (#170) can't
// stretch. A story is a handful of short parts, never an essay.
const MAX_STORY_PARTS = 24
const MAX_STORY_PART_LENGTH = 280
const MAX_ALT_LENGTH = 250
const MAX_DISPLAY_NAME_LENGTH = 64

/**
 * A picture Memli ships in `apps/web/public/mnemonics/`, like `/mnemonics/gato.svg`.
 * No other host or folder (docs/security.md, "Community content").
 */
export const mnemonicImageSrcSchema = z
  .string()
  .max(128)
  .regex(/^\/mnemonics\/[a-z0-9]+(?:-[a-z0-9]+)*\.(?:svg|png|webp)$/)

/**
 * One run of a mnemonic story: data, not markup, so community text is never
 * parsed as HTML. `term` is in the course's `learningLanguage`.
 */
export const mnemonicStoryPartSchema = z.object({
  kind: z.enum(["plain", "term", "keyword"]),
  text: z.string().min(1).max(MAX_STORY_PART_LENGTH),
})

export type MnemonicStoryPart = z.infer<typeof mnemonicStoryPartSchema>

/** A memory hook for one card, written by the community (#50). */
export const mnemonicSchema = z.object({
  mnemonicId: idSchema,
  /**
   * What the story and alt text are written in. Often, but not always, the
   * course's `answerLanguage`.
   */
  contentLocale: languageTagSchema,
  story: z.array(mnemonicStoryPartSchema).nonempty().max(MAX_STORY_PARTS),
  /** Who wrote it. `null` once the author has deleted their account. */
  author: z
    .object({
      displayName: z.string().min(1).max(MAX_DISPLAY_NAME_LENGTH),
    })
    .nullable(),
  /** Learners who found it useful. A card lists its mnemonics by this, highest first. */
  upvotes: z.int().nonnegative(),
  /** Picture for the hook. Optional: a story works without one. */
  image: z
    .object({
      src: mnemonicImageSrcSchema,
      /** Describes the picture, in `contentLocale`. */
      alt: z.string().min(1).max(MAX_ALT_LENGTH),
    })
    .optional(),
})

export type Mnemonic = z.infer<typeof mnemonicSchema>

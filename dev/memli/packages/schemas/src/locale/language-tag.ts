import { z } from "zod"

/**
 * A canonical BCP 47 tag (`pt-BR`, not `pt-br`) for every language field
 * (docs/i18n.md), so filtering by language is a plain equality check.
 */
export const languageTagSchema = z.string().refine(isCanonicalLanguageTag, {
  error: "Expected a canonical BCP 47 language tag, like es or pt-BR",
})

export type LanguageTag = z.infer<typeof languageTagSchema>

// Every registered language has a 2- or 3-letter code. BCP 47 also allows 5 to
// 8 letters, none assigned, which is how "english" would sneak through.
const PRIMARY_LANGUAGE = /^[a-z]{2,3}(?:-|$)/

function isCanonicalLanguageTag(tag: string): boolean {
  if (!PRIMARY_LANGUAGE.test(tag)) return false
  try {
    // Throws on a malformed tag; returns the canonical spelling otherwise.
    return Intl.getCanonicalLocales(tag)[0] === tag
  } catch {
    return false
  }
}

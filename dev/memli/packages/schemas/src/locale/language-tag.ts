import { z } from "zod"

/**
 * A BCP 47 language tag in canonical form: `es`, `pt-BR`, `es-419`.
 *
 * Every language field uses this, whatever it means: `learningLanguage` (what
 * a deck teaches), `answerLanguage` (what its meanings are written in),
 * `contentLocale` (what a mnemonic is written in) and `uiLocale` (the app's
 * own language). They are separate fields because they are separate facts
 * (docs/i18n.md); the shape of the value is the same.
 *
 * Canonical form only (`pt-BR`, not `pt-br`), so the same language is always
 * the same string and filtering by language is a plain equality check.
 */
export const languageTagSchema = z.string().refine(isCanonicalLanguageTag, {
  error: "Expected a canonical BCP 47 language tag, like es or pt-BR",
})

export type LanguageTag = z.infer<typeof languageTagSchema>

// Every registered language has a 2- or 3-letter code. BCP 47's grammar also
// allows 5 to 8 letters, which is how "english" would sneak through, but none
// are assigned.
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

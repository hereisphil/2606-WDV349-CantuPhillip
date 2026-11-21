import { z } from "zod"

/** The same ceiling as a mnemonic author's display name. */
export const DISPLAY_NAME_MAX_LENGTH = 64

// Controls, private-use glyphs, invisible characters (bidi marks included) and
// the blank braille cell, a common way to fake an empty name.
const HIDDEN = /[\p{Cc}\p{Co}\p{Default_Ignorable_Code_Point}\u2800]/gu

// Persian, Hindi and emoji need the zero-width joiners, and emoji their style.
function isKept(char: string): boolean {
  const code = char.codePointAt(0) ?? 0
  return (
    code === 0x200c || code === 0x200d || (code >= 0xfe00 && code <= 0xfe0f)
  )
}

// A joiner joins two characters, so one at an edge or by a space is dropped.
const LOOSE_JOINER = /(^|\s)[\u200C\u200D]+|[\u200C\u200D]+(?=\s|$)/gu
// Real scripts stack at most a few accents. More only spills over other text.
const STACKED_MARKS = /(\p{M}{4})\p{M}+/gu

const graphemes = new Intl.Segmenter("und", { granularity: "grapheme" })

/** At most `max` UTF-16 units, cut between letters, never inside an emoji. */
function cut(text: string, max: number): string {
  let kept = ""
  for (const { segment } of graphemes.segment(text)) {
    if (kept.length + segment.length > max) break
    kept += segment
  }
  return kept
}

/** One line, no hidden characters, single spaces, trimmed. */
function visibleName(name: string): string {
  return name
    .replace(/\s+/gu, " ")
    .replace(HIDDEN, (char) => (isKept(char) ? char : ""))
    .replace(/([\u200C\u200D])[\u200C\u200D]+/gu, "$1")
    .replace(LOOSE_JOINER, "$1")
    .replace(STACKED_MARKS, "$1")
    .replace(/\s+/gu, " ")
    .trim()
}

/**
 * A display name as Memli stores and shows it: `visibleName`, cut to at most
 * 64 characters. The API runs it on every name it saves (#170).
 */
export function tidyDisplayName(name: string): string {
  return cut(visibleName(name), DISPLAY_NAME_MAX_LENGTH).trim()
}

// Letters that pass for Latin ones: Cyrillic, Greek, then Latin small capitals,
// written as escapes so each one is plain to see. Then digits and a bar.
const LOOK_ALIKES: Partial<Record<string, string>> = {
  "\u0430": "a",
  "\u0435": "e",
  "\u0456": "i",
  "\u04CF": "l",
  "\u0458": "j",
  "\u043C": "m",
  "\u043E": "o",
  "\u0440": "p",
  "\u0441": "c",
  "\u0445": "x",
  "\u0443": "y",
  "\u03B1": "a",
  "\u03B5": "e",
  "\u03B9": "i",
  "\u03BA": "k",
  "\u03BC": "m",
  "\u03BD": "v",
  "\u03BF": "o",
  "\u03C1": "p",
  "\u03C4": "t",
  "\u03C5": "u",
  "\u03C7": "x",
  "\u0131": "i",
  "\u0269": "i",
  "\u026A": "i",
  "\u029F": "l",
  "\u1D0D": "m",
  "\u1D07": "e",
  "|": "l",
  "1": "l",
  "0": "o",
  "3": "e",
}

/** What a name looks like at a glance: no accents, case, spacing or tricks. */
function skeleton(name: string): string {
  return Array.from(
    name.normalize("NFKD").replace(/\p{M}/gu, "").toLowerCase(),
    (char) => LOOK_ALIKES[char] ?? char
  )
    .join("")
    .replace(/[^\p{L}\p{N}]/gu, "")
    .replaceAll("rn", "m")
    .replaceAll("i", "l")
}

const RESERVED = ["memli"].map(skeleton)

/**
 * True when a name looks like Memli's own, like "Memli Team" or "MEMLl", so no
 * learner passes for the official author of a mnemonic.
 */
export function isReservedDisplayName(name: string): boolean {
  const seen = skeleton(name)
  return RESERVED.some((reserved) => seen.includes(reserved))
}

/** A display name from a form: hidden characters dropped, then checked. */
export const displayNameSchema = z
  .string()
  .transform(visibleName)
  .pipe(
    z
      .string()
      .min(1, "Enter your name.")
      .max(DISPLAY_NAME_MAX_LENGTH, "Use 64 characters or fewer.")
      .refine(
        (name) => !isReservedDisplayName(name),
        "That name is kept for the Memli team. Choose another one."
      )
  )

/**
 * Damerau–Levenshtein distance: the fewest single-character insertions,
 * deletions, substitutions, or swaps of two neighbouring characters that turn
 * `a` into `b`. A swap counts as one edit, so the common typo "teh" is one
 * edit from "the" (plain Levenshtein would say two).
 *
 * This is the optimal string alignment form, the usual choice for typos: no
 * substring is edited twice. Works on Unicode code points, so a character
 * outside the Basic Multilingual Plane counts once.
 */
export function damerauLevenshtein(a: string, b: string): number {
  const source = Array.from(a)
  const target = Array.from(b)
  if (source.length === 0) return target.length
  if (target.length === 0) return source.length

  // Three rolling rows: two back (for swaps), previous, current.
  let twoBack: number[] = []
  let previous = Array.from({ length: target.length + 1 }, (_, j) => j)
  for (let i = 1; i <= source.length; i += 1) {
    const current = [i]
    for (let j = 1; j <= target.length; j += 1) {
      const cost = source[i - 1] === target[j - 1] ? 0 : 1
      let best = Math.min(
        previous[j] + 1, // delete
        current[j - 1] + 1, // insert
        previous[j - 1] + cost // substitute or match
      )
      if (
        i > 1 &&
        j > 1 &&
        source[i - 1] === target[j - 2] &&
        source[i - 2] === target[j - 1]
      ) {
        best = Math.min(best, twoBack[j - 2] + 1) // swap
      }
      current[j] = best
    }
    twoBack = previous
    previous = current
  }
  return previous[target.length]
}

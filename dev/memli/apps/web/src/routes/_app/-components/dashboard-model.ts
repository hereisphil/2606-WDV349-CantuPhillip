// Rough review pace until #112 can measure it from review history.
const SECONDS_PER_REVIEW = 8

export function estimateMinutes(cardCount: number): number {
  if (cardCount <= 0) {
    return 0
  }
  return Math.max(1, Math.ceil((cardCount * SECONDS_PER_REVIEW) / 60))
}

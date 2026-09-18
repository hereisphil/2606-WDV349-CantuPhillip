export type ReviewGrade = "pass" | "fail"

export type CardProgress = {
  intervalDays: number
  easeFactor: number
  repetitions: number
}

const DEFAULT_EASE_FACTOR = 2.5
const MIN_EASE_FACTOR = 1.3

/** Maps Memli's binary grade to an SM-2 quality score (0–5). */
function qualityForGrade(grade: ReviewGrade): number {
  return grade === "pass" ? 4 : 1
}

function nextEaseFactor(current: number, quality: number): number {
  const delta = 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)
  return Math.max(MIN_EASE_FACTOR, current + delta)
}

/** Pure SM-2 interval update for a single review. */
export function gradeCard(
  progress: CardProgress,
  grade: ReviewGrade
): CardProgress {
  const quality = qualityForGrade(grade)

  if (quality < 3) {
    return {
      intervalDays: 1,
      easeFactor: nextEaseFactor(progress.easeFactor, quality),
      repetitions: 0,
    }
  }

  const easeFactor = nextEaseFactor(progress.easeFactor, quality)
  const repetitions = progress.repetitions + 1

  let intervalDays: number
  if (repetitions === 1) {
    intervalDays = 1
  } else if (repetitions === 2) {
    intervalDays = 6
  } else {
    intervalDays = Math.round(progress.intervalDays * easeFactor)
  }

  return {
    intervalDays,
    easeFactor,
    repetitions,
  }
}

export function createInitialCardProgress(): CardProgress {
  return {
    intervalDays: 0,
    easeFactor: DEFAULT_EASE_FACTOR,
    repetitions: 0,
  }
}

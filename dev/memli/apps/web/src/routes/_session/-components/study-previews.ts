/** What the session layout renders. Previews replace the seeded values. */
export type SessionView = {
  title: string
  /** Cards in the session queue when it started. */
  total: number
  /** Cards finished so far. */
  completed: number
}

export const studyPreviewNames = [
  "default",
  "midway",
  "last-card",
  "complete",
  "one-card",
  "empty",
  "long-title",
  "large-queue",
] as const

export type StudyPreviewName = (typeof studyPreviewNames)[number]

type StudyPreview = (seeded: SessionView) => SessionView

/** Fixed totals so every preview looks the same whichever deck is open. */
export const studyPreviews: Record<StudyPreviewName, StudyPreview> = {
  default: (seeded) => seeded,
  midway: (seeded) => ({ ...seeded, total: 16, completed: 7 }),
  "last-card": (seeded) => ({ ...seeded, total: 16, completed: 15 }),
  complete: (seeded) => ({ ...seeded, total: 16, completed: 16 }),
  "one-card": (seeded) => ({ ...seeded, total: 1, completed: 0 }),
  empty: (seeded) => ({ ...seeded, total: 0, completed: 0 }),
  "long-title": (seeded) => ({
    ...seeded,
    title:
      "Japanese Hiragana & Katakana: Everyday Words, Place Names, and Restaurant Menus",
    total: 16,
    completed: 5,
  }),
  "large-queue": (seeded) => ({ ...seeded, total: 1250, completed: 312 }),
}

export function isStudyPreviewName(value: unknown): value is StudyPreviewName {
  return studyPreviewNames.some((name) => name === value)
}

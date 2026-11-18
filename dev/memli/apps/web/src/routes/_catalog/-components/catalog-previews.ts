import type { CatalogCourse } from "@workspace/schemas/api/catalog"

/** A seeded catalog state for `?preview=` in development builds. */
export type CatalogPreview = {
  courses: CatalogCourse[]
  /** Shows the page for a catalog that couldn't load. */
  loadFailed?: true
  /** Shows the page while the courses are on their way. */
  loading?: true
}

function course(
  courseId: string,
  title: string,
  learningLanguage: string,
  details: Partial<CatalogCourse> = {}
): CatalogCourse {
  return {
    courseId,
    title,
    learningLanguage,
    answerLanguage: "en",
    description: "Everyday words you will hear first, each with a story.",
    wordCount: 120,
    added: false,
    ...details,
  }
}

const starter: CatalogCourse[] = [
  course("french-travel-phrases", "French Travel Phrases", "fr", {
    description:
      "The French you need on a trip: greetings, train stations and paying the bill.",
    wordCount: 140,
    added: true,
  }),
  course("japanese-kana", "Japanese Hiragana & Katakana", "ja", {
    description: "Your first Japanese words, written in hiragana and katakana.",
    wordCount: 92,
  }),
  course("portuguese-essentials", "Portuguese Essentials", "pt", {
    description:
      "A few Portuguese words for saying thanks, ordering food and starting to talk.",
    wordCount: 110,
  }),
  course("spanish-core-1000", "Spanish Core 1000", "es", {
    description:
      "Everyday Spanish words you will hear first, each with a story to help it stick.",
    wordCount: 1000,
    added: true,
  }),
]

export const catalogPreviewNames = [
  "default",
  "long-text",
  "one-language",
  "empty",
  "loading",
  "load-error",
] as const

export type CatalogPreviewName = (typeof catalogPreviewNames)[number]

function buildPreviews(): Record<CatalogPreviewName, CatalogPreview> {
  return {
    default: { courses: starter },
    "long-text": {
      courses: [
        course(
          "german-a1",
          "German A1 Foundations for Travelers, Students and Anyone Moving to Berlin",
          "de",
          {
            description:
              "Greetings, numbers, food and directions. Short words first, then the long compound ones Germans love, such as Donaudampfschifffahrtsgesellschaft.",
            wordCount: 12_480,
            added: true,
          }
        ),
        ...starter,
      ],
    },
    "one-language": {
      courses: [
        starter[3] as CatalogCourse,
        course("spanish-travel", "Spanish for Travel", "es", { wordCount: 85 }),
      ],
    },
    empty: { courses: [] },
    loading: { courses: [], loading: true },
    "load-error": { courses: [], loadFailed: true },
  }
}

export const catalogPreviews = /* @__PURE__ */ buildPreviews()

export function isCatalogPreviewName(
  value: unknown
): value is CatalogPreviewName {
  return (
    typeof value === "string" &&
    (catalogPreviewNames as readonly string[]).includes(value)
  )
}

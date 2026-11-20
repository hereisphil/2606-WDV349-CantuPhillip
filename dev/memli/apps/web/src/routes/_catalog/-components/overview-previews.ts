import type { CatalogCourseDetail } from "@workspace/schemas/api/catalog"
import type { OverviewOutcome, OverviewViewer } from "./OverviewActions"

/** A seeded overview state for `?preview=` in development builds. */
export type OverviewPreview = {
  course: CatalogCourseDetail
  /** Who is looking: previews pick it, so either set of buttons can be seen signed in or out. */
  viewer: OverviewViewer
  /** What the last button did, to show its message. */
  outcome?: OverviewOutcome
  loadFailed?: true
  notFound?: true
  loading?: true
}

const spanish: CatalogCourseDetail = {
  courseId: "spanish-core-1000",
  title: "Spanish Core 1000",
  learningLanguage: "es",
  answerLanguage: "en",
  description:
    "Everyday Spanish words you will hear first, each with a story to help it stick.",
  wordCount: 1000,
  added: false,
  publishedAt: "2026-11-17T12:26:40.000Z",
  source: "Written for Memli",
  license: "All rights reserved",
  attribution: null,
  sampleWords: [
    {
      cardId: "es-gato",
      term: "gato",
      partOfSpeech: "noun",
      gender: "masculine",
      answers: ["cat"],
      phonetic: "/ˈɡato/",
    },
    {
      cardId: "es-casa",
      term: "casa",
      partOfSpeech: "noun",
      gender: "feminine",
      answers: ["house", "home"],
      phonetic: "/ˈkasa/",
    },
    {
      cardId: "es-comer",
      term: "comer",
      partOfSpeech: "verb",
      answers: ["to eat", "eat"],
      phonetic: "/koˈmeɾ/",
    },
    {
      cardId: "es-rapido",
      term: "rápido",
      partOfSpeech: "adjective",
      answers: ["fast", "quick"],
      phonetic: "/ˈrapiðo/",
    },
    {
      cardId: "es-que-tal",
      term: "¿qué tal?",
      partOfSpeech: "phrase",
      answers: ["how are you?", "how's it going?"],
      phonetic: "/ke ˈtal/",
    },
  ],
}

const added = { ...spanish, added: true }

export const overviewPreviewNames = [
  "visitor",
  "learner",
  "added",
  "added-all-done",
  "just-added",
  "just-removed",
  "save-failed",
  "long-text",
  "not-found",
  "loading",
  "load-error",
] as const

export type OverviewPreviewName = (typeof overviewPreviewNames)[number]

const learner = { signedIn: true, next: null } as const

function buildPreviews(): Record<OverviewPreviewName, OverviewPreview> {
  return {
    visitor: { course: spanish, viewer: { signedIn: false } },
    learner: { course: spanish, viewer: learner },
    added: {
      course: added,
      viewer: { signedIn: true, next: { mode: "review", count: 16 } },
    },
    "added-all-done": { course: added, viewer: learner },
    "just-added": {
      course: added,
      viewer: { signedIn: true, next: { mode: "learn", count: 10 } },
      outcome: "added",
    },
    "just-removed": {
      course: spanish,
      viewer: learner,
      outcome: "removed",
    },
    "save-failed": { course: spanish, viewer: learner, outcome: "failed" },
    "long-text": {
      course: {
        ...spanish,
        courseId: "german-a1",
        title:
          "German A1 Foundations for Travelers, Students and Anyone Moving to Berlin",
        learningLanguage: "de",
        description:
          "Greetings, numbers, food and directions. Short words first, then the long compound ones Germans love, such as Donaudampfschifffahrtsgesellschaft.",
        wordCount: 12_480,
        source: "Words from the Tatoeba Project, tatoeba.org",
        license: "CC BY 2.0 FR",
        attribution:
          "Example sentences from the Tatoeba Project (tatoeba.org), used under CC BY 2.0 FR.",
        sampleWords: [
          {
            cardId: "de-1",
            term: "Donaudampfschifffahrtsgesellschaft",
            partOfSpeech: "noun",
            gender: "feminine",
            answers: ["Danube steamship company"],
            phonetic: "/ˈdoːnaʊ̯ˌdampfʃɪfˌfaːɐ̯t͡sɡəˌzɛlʃaft/",
          },
          {
            cardId: "de-2",
            term: "Entschuldigung",
            partOfSpeech: "phrase",
            answers: ["excuse me", "sorry"],
            phonetic: "/ɛntˈʃʊldɪɡʊŋ/",
          },
        ],
      },
      viewer: { signedIn: false },
    },
    "not-found": { course: spanish, viewer: learner, notFound: true },
    loading: { course: spanish, viewer: learner, loading: true },
    "load-error": { course: spanish, viewer: learner, loadFailed: true },
  }
}

export const overviewPreviews = /* @__PURE__ */ buildPreviews()

export function isOverviewPreviewName(
  value: unknown
): value is OverviewPreviewName {
  return (
    typeof value === "string" &&
    (overviewPreviewNames as readonly string[]).includes(value)
  )
}

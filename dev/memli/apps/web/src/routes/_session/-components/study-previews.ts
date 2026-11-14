import type { SessionEvent } from "@workspace/core/study/session-reducer"
import type { StudyCard } from "./study-cards"

/** What the session header renders. `view` overrides replace the derived values. */
export type SessionView = {
  title: string
  /** Cards in the session queue when it started. */
  total: number
  /** Cards finished so far. */
  completed: number
}

/**
 * A seeded study session for `?preview=` in development builds.
 *
 * Previews are real sessions: the cards go through `startSession`, then
 * `events` replay through `@workspace/core`'s reducer and Evaluator. So a
 * preview can only show a state the app can actually reach, and a verdict
 * comes from the same code a learner's answer does.
 */
export type StudyPreview = {
  group: StudyPreviewGroup
  /** One line on what to check, shown as the switcher link's tooltip. */
  description: string
  /**
   * The session's cards, given every seeded card in the open deck. Leave it
   * out to use the real queue for the deck and mode.
   */
  cards?: (deck: readonly StudyCard[]) => readonly StudyCard[]
  /** Set with `cards` that bring their own content, so `lang` stays right on any deck. */
  languages?: { learning: string; answer: string }
  /** Replayed in order after the session starts. */
  events?: (cards: readonly StudyCard[]) => readonly SessionEvent[]
  /** Header-only overrides, for queues longer than the seeded cards. */
  view?: (derived: SessionView) => SessionView
}

export const studyPreviewGroups = {
  progress: "Progress",
  card: "Card",
  answer: "Answer",
} as const

type StudyPreviewGroup = keyof typeof studyPreviewGroups

// Fixture cards that every deck lacks: an accent, a 4+ letter answer for a typo, long text, non-Latin script.
const spanish = { learning: "es", answer: "en" } as const

const cafe: StudyCard = {
  cardId: "preview-cafe",
  term: "café",
  partOfSpeech: "noun",
  gender: "masculine",
  answers: ["café", "coffee"],
  phonetic: "/kaˈfe/",
  example: {
    text: "¿Quieres un café con leche?",
    translation: "Do you want a coffee with milk?",
  },
}

const casa: StudyCard = {
  cardId: "preview-casa",
  term: "casa",
  partOfSpeech: "noun",
  gender: "feminine",
  answers: ["house", "home"],
  phonetic: "/ˈkasa/",
  example: {
    text: "Mi casa es tu casa.",
    translation: "My house is your house.",
  },
}

const longContent: StudyCard = {
  cardId: "preview-long",
  term: "¿Dónde está el baño más cercano, por favor?",
  partOfSpeech: "phrase",
  answers: [
    "where is the nearest bathroom, please",
    "where is the closest bathroom, please",
  ],
  phonetic: "/ˈdonde esˈta el ˈbaɲo mas θeɾˈkano poɾ faˈβoɾ/",
  example: {
    text: "Disculpe, ¿dónde está el baño más cercano, por favor? Llevamos dos horas en el autobús.",
    translation:
      "Excuse me, where is the nearest bathroom, please? We've been on the bus for two hours.",
  },
}

const kana: StudyCard = {
  cardId: "preview-kana",
  term: "ありがとうございます",
  partOfSpeech: "phrase",
  answers: ["thank you very much", "thank you"],
  phonetic: "arigatō gozaimasu",
  example: {
    text: "てつだってくれて ありがとうございます。",
    translation: "Thank you very much for helping me.",
  },
}

/** Answers the first `count` cards correctly, moving the session on that many. */
function finish(cards: readonly StudyCard[], count: number): SessionEvent[] {
  return cards.slice(0, count).flatMap((card): SessionEvent[] => [
    { type: "SUBMIT", answer: card.answers[0], elapsedMs: null },
    { type: "RESOLVE", outcome: "got_it", now: new Date() },
  ])
}

function submit(answer: string): SessionEvent[] {
  return [{ type: "SUBMIT", answer, elapsedMs: null }]
}

export const studyPreviews = {
  // Progress: the header bar and session lifecycle, using the open deck's cards.
  default: {
    group: "progress",
    description: "The real session for this deck and mode",
  },
  midway: {
    group: "progress",
    description: "Half the deck answered",
    cards: (deck) => deck,
    events: (cards) => finish(cards, Math.floor(cards.length / 2)),
  },
  "last-card": {
    group: "progress",
    description: "Every card but the last answered",
    cards: (deck) => deck,
    events: (cards) => finish(cards, cards.length - 1),
  },
  complete: {
    group: "progress",
    description: "Every card answered",
    cards: (deck) => deck,
    events: (cards) => finish(cards, cards.length),
  },
  "one-card": {
    group: "progress",
    description: "A one-card session",
    cards: (deck) => deck.slice(0, 1),
  },
  empty: {
    group: "progress",
    description: "Nothing to study",
    cards: () => [],
  },
  "long-title": {
    group: "progress",
    description: "A deck title too long for the header",
    view: (derived) => ({
      ...derived,
      title:
        "Japanese Hiragana & Katakana: Everyday Words, Place Names, and Restaurant Menus",
    }),
  },
  "large-queue": {
    group: "progress",
    description: "Four-digit counts in the header",
    view: (derived) => ({ ...derived, total: 1250, completed: 312 }),
  },

  // Card: prompt content that the seeded decks don't cover.
  "long-text": {
    group: "card",
    description: "A long phrase, answer and example",
    cards: () => [longContent],
    languages: spanish,
  },
  "non-latin": {
    group: "card",
    description: "Japanese kana, no grammatical gender",
    cards: () => [kana],
    languages: { learning: "ja", answer: "en" },
  },

  // Answer: every way a card can be answered, through the real Evaluator.
  revealed: {
    group: "answer",
    description: "Revealed without typing: no verdict",
    cards: (deck) => deck,
    events: () => [{ type: "REVEAL", elapsedMs: null }],
  },
  correct: {
    group: "answer",
    description: "Typed the answer exactly",
    cards: (deck) => deck,
    events: (cards) => submit(cards[0]?.answers[0] ?? ""),
  },
  typo: {
    group: "answer",
    description: "One typo in a 4+ letter answer (hous)",
    cards: () => [casa],
    languages: spanish,
    events: () => submit("hous"),
  },
  accent: {
    group: "answer",
    description: "Right apart from accents (cafe)",
    cards: () => [cafe],
    languages: spanish,
    events: () => submit("cafe"),
  },
  wrong: {
    group: "answer",
    description: "A wrong answer",
    cards: (deck) => deck,
    events: () => submit("banana"),
  },
  "long-revealed": {
    group: "answer",
    description: "Long text after a typed answer",
    cards: () => [longContent],
    languages: spanish,
    events: () => submit("where is the nearest bathroom please"),
  },
} as const satisfies Record<string, StudyPreview>

export type StudyPreviewName = keyof typeof studyPreviews

export const studyPreviewNames = Object.keys(
  studyPreviews
) as StudyPreviewName[]

export function isStudyPreviewName(value: unknown): value is StudyPreviewName {
  return studyPreviewNames.some((name) => name === value)
}

import type { SessionEvent } from "@workspace/core/study/session-reducer"
import { findDeckCards, type Mnemonic, type StudyCard } from "./study-cards"

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
  mnemonic: "Mnemonic",
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

// The seeded gato card, whose mnemonic has a picture, so the preview works on any deck.
const gato: StudyCard = findDeckCards("spanish-core-1000")?.cards[0] ?? casa

// The story every fixture mnemonic tells, so each preview only changes what it tests.
const casaStory: Omit<Mnemonic, "mnemonicId"> = {
  contentLocale: "en",
  story: [
    { kind: "plain", text: "You keep your " },
    { kind: "keyword", text: "cash" },
    { kind: "plain", text: " in your " },
    { kind: "term", text: "casa" },
    { kind: "plain", text: ", the safest place in the house." },
  ],
  author: { displayName: "dan.learns" },
  upvotes: 860,
}

// A mnemonic whose picture never loads, so the fallback can be checked.
const brokenImage: StudyCard = {
  ...casa,
  cardId: "preview-broken-image",
  mnemonics: [
    {
      ...casaStory,
      mnemonicId: "preview-broken-image-1",
      image: {
        src: "/missing-mnemonic.png",
        alt: "A picture that fails to load.",
      },
    },
  ],
}

// A mnemonic with no picture at all.
const noImage: StudyCard = {
  ...casa,
  cardId: "preview-no-image",
  mnemonics: [{ ...casaStory, mnemonicId: "preview-no-image-1" }],
}

// A story written in another language than the deck's answers, with a long author name.
const otherLanguage: StudyCard = {
  ...gato,
  cardId: "preview-other-language",
  mnemonics: [
    {
      mnemonicId: "preview-other-language-1",
      contentLocale: "pt-BR",
      story: [
        { kind: "plain", text: "O " },
        { kind: "term", text: "gato" },
        { kind: "plain", text: " de sombreiro vai à " },
        { kind: "keyword", text: "gala" },
        { kind: "plain", text: " e todo mundo aplaude." },
      ],
      author: { displayName: "maria.eduarda.estuda.idiomas.todos.os.dias" },
      upvotes: 1048576,
      image: {
        src: "/mnemonics/gato.svg",
        alt: "Um gato laranja de gravata-borboleta, com um sombreiro enorme numa gala.",
      },
    },
  ],
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
  // `suggestOutcome` calls "hous" quick under 3.5 s and slow from 7 s.
  "typo-quick": {
    group: "answer",
    description: "A quick typo: the dock suggests it was just a typo",
    cards: () => [casa],
    languages: spanish,
    events: () => [{ type: "SUBMIT", answer: "hous", elapsedMs: 2_000 }],
  },
  "typo-slow": {
    group: "answer",
    description: "A slow typo: the dock suggests it was hard",
    cards: () => [casa],
    languages: spanish,
    events: () => [{ type: "SUBMIT", answer: "hous", elapsedMs: 9_000 }],
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

  // Mnemonic: the frame under the revealed answer.
  "mnemonic-image": {
    group: "mnemonic",
    description: "Three mnemonics to cycle through; the first has a picture",
    cards: () => [gato],
    languages: spanish,
    events: () => [{ type: "REVEAL", elapsedMs: null }],
  },
  "mnemonic-no-image": {
    group: "mnemonic",
    description:
      "One mnemonic, no picture: the term fills the frame, no arrows",
    cards: () => [noImage],
    languages: spanish,
    events: () => [{ type: "REVEAL", elapsedMs: null }],
  },
  "mnemonic-broken-image": {
    group: "mnemonic",
    description: "A picture that fails to load falls back to the term",
    cards: () => [brokenImage],
    languages: spanish,
    events: () => [{ type: "REVEAL", elapsedMs: null }],
  },
  "mnemonic-other-language": {
    group: "mnemonic",
    description: "A story in Brazilian Portuguese with a long author name",
    cards: () => [otherLanguage],
    languages: spanish,
    events: () => [{ type: "REVEAL", elapsedMs: null }],
  },
} as const satisfies Record<string, StudyPreview>

export type StudyPreviewName = keyof typeof studyPreviews

export const studyPreviewNames = Object.keys(
  studyPreviews
) as StudyPreviewName[]

export function isStudyPreviewName(value: unknown): value is StudyPreviewName {
  return studyPreviewNames.some((name) => name === value)
}

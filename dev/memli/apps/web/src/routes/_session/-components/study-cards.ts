/**
 * Card content for a study session. #112 replaces {@link seededDeckCards}
 * with cards from the API in this same shape.
 *
 * Grammar fields are stable codes; the UI maps them to labels in the UI
 * locale (docs/i18n.md).
 */
type PartOfSpeech = "noun" | "verb" | "adjective" | "adverb" | "phrase"

type GrammaticalGender = "masculine" | "feminine" | "neuter"

export type StudyCard = {
  cardId: string
  /** The word or phrase being learned, in the deck's `learningLanguage`. */
  term: string
  partOfSpeech: PartOfSpeech
  /** Only for languages and words that have one. */
  gender?: GrammaticalGender | undefined
  /**
   * Accepted meanings in the deck's `answerLanguage`; typing any one counts.
   * The first is the one shown on reveal. Same field `@workspace/core`'s
   * `SessionCard` uses, so these cards can feed the session reducer.
   */
  answers: readonly [string, ...string[]]
  /** IPA, or a romanization for non-Latin scripts. Shown on reveal. */
  phonetic: string
  /** A sentence using the term, and what it means. Shown on reveal. */
  example: {
    text: string
    translation: string
  }
}

export type DeckCards = {
  /** BCP 47 tag of `answers` and example translations. Never the viewer's `uiLocale`. */
  answerLanguage: string
  /** Never empty, so a session always has a first card. */
  cards: readonly [StudyCard, ...StudyCard[]]
}

// Prototype stand-in for the seeded mnemonic decks (#112), keyed by courseId.
const seededDeckCards: Record<string, DeckCards> = {
  "spanish-core-1000": {
    answerLanguage: "en",
    cards: [
      {
        cardId: "es-gato",
        term: "gato",
        partOfSpeech: "noun",
        gender: "masculine",
        answers: ["cat"],
        phonetic: "/ˈɡato/",
        example: {
          text: "El gato está durmiendo en el sofá.",
          translation: "The cat is sleeping on the sofa.",
        },
      },
      {
        cardId: "es-casa",
        term: "casa",
        partOfSpeech: "noun",
        gender: "feminine",
        answers: ["house", "home"],
        phonetic: "/ˈkasa/",
        example: {
          text: "Mi casa es tu casa.",
          translation: "My house is your house.",
        },
      },
      {
        cardId: "es-comer",
        term: "comer",
        partOfSpeech: "verb",
        answers: ["to eat", "eat"],
        phonetic: "/koˈmeɾ/",
        example: {
          text: "Vamos a comer a las dos.",
          translation: "We're going to eat at two.",
        },
      },
      {
        cardId: "es-rapido",
        term: "rápido",
        partOfSpeech: "adjective",
        answers: ["fast", "quick"],
        phonetic: "/ˈrapido/",
        example: {
          text: "El tren es muy rápido.",
          translation: "The train is very fast.",
        },
      },
      {
        cardId: "es-que-tal",
        term: "¿Qué tal?",
        partOfSpeech: "phrase",
        answers: ["how are you", "how's it going"],
        phonetic: "/ke ˈtal/",
        example: {
          text: "Hola, Ana, ¿qué tal?",
          translation: "Hi, Ana, how's it going?",
        },
      },
    ],
  },
  "japanese-kana": {
    answerLanguage: "en",
    cards: [
      {
        cardId: "ja-neko",
        term: "ねこ",
        partOfSpeech: "noun",
        answers: ["cat"],
        phonetic: "neko",
        example: { text: "ねこが すきです。", translation: "I like cats." },
      },
      {
        cardId: "ja-mizu",
        term: "みず",
        partOfSpeech: "noun",
        answers: ["water"],
        phonetic: "mizu",
        example: { text: "みずを ください。", translation: "Water, please." },
      },
      {
        cardId: "ja-arigatou",
        term: "ありがとう",
        partOfSpeech: "phrase",
        answers: ["thank you", "thanks"],
        phonetic: "arigatō",
        example: {
          text: "てつだってくれて ありがとう。",
          translation: "Thanks for helping me.",
        },
      },
      {
        cardId: "ja-kamera",
        term: "カメラ",
        partOfSpeech: "noun",
        answers: ["camera"],
        phonetic: "kamera",
        example: {
          text: "カメラを かいました。",
          translation: "I bought a camera.",
        },
      },
    ],
  },
  "french-travel-phrases": {
    answerLanguage: "en",
    cards: [
      {
        cardId: "fr-bonjour",
        term: "bonjour",
        partOfSpeech: "phrase",
        answers: ["hello", "good morning"],
        phonetic: "/bɔ̃.ʒuʁ/",
        example: {
          text: "Bonjour, une table pour deux, s'il vous plaît.",
          translation: "Hello, a table for two, please.",
        },
      },
      {
        // A long phrase, so the prompt's wrapping gets exercised.
        cardId: "fr-ou-est-la-gare",
        term: "Où se trouve la gare la plus proche ?",
        partOfSpeech: "phrase",
        answers: [
          "where is the nearest train station",
          "where is the nearest station",
        ],
        phonetic: "/u sə tʁuv la ɡaʁ la ply pʁɔʃ/",
        example: {
          text: "Excusez-moi, où se trouve la gare la plus proche ?",
          translation: "Excuse me, where is the nearest train station?",
        },
      },
      {
        cardId: "fr-gare",
        term: "gare",
        partOfSpeech: "noun",
        gender: "feminine",
        answers: ["train station", "station"],
        phonetic: "/ɡaʁ/",
        example: {
          text: "La gare est à cinq minutes.",
          translation: "The station is five minutes away.",
        },
      },
      {
        cardId: "fr-addition",
        term: "addition",
        partOfSpeech: "noun",
        gender: "feminine",
        answers: ["bill", "check", "the bill"],
        phonetic: "/a.di.sjɔ̃/",
        example: {
          text: "L'addition, s'il vous plaît.",
          translation: "The bill, please.",
        },
      },
    ],
  },
  "portuguese-essentials": {
    answerLanguage: "en",
    cards: [
      {
        cardId: "pt-obrigado",
        term: "obrigado",
        partOfSpeech: "phrase",
        answers: ["thank you", "thanks"],
        phonetic: "/obɾiˈɡadu/",
        example: {
          text: "Obrigado pela ajuda!",
          translation: "Thanks for the help!",
        },
      },
      {
        cardId: "pt-pao",
        term: "pão",
        partOfSpeech: "noun",
        gender: "masculine",
        answers: ["bread"],
        phonetic: "/ˈpɐ̃w̃/",
        example: {
          text: "Quero pão com manteiga.",
          translation: "I want bread with butter.",
        },
      },
      {
        cardId: "pt-falar",
        term: "falar",
        partOfSpeech: "verb",
        answers: ["to speak", "speak", "to talk", "talk"],
        phonetic: "/faˈlaʁ/",
        example: {
          text: "Você fala inglês?",
          translation: "Do you speak English?",
        },
      },
    ],
  },
}

/** The cards behind a deck, or null when it has none seeded. */
export function findDeckCards(courseId: string): DeckCards | null {
  return seededDeckCards[courseId] ?? null
}

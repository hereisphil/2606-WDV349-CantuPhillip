import { createProgress } from "@workspace/core/srs/progress"
import type { SessionCard } from "@workspace/core/study/session-reducer"
import type { Card } from "@workspace/schemas/content/card"
import type { DeckCards } from "@workspace/schemas/content/deck"

/**
 * Card content for a study session. The shapes live in `@workspace/schemas`,
 * so the API (#112) sends exactly what this file seeds today.
 */
export type { DeckCards }
export type {
  Mnemonic,
  MnemonicStoryPart,
} from "@workspace/schemas/content/mnemonic"

/** A card's content, as the study screens use it. */
export type StudyCard = Card

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
        mnemonics: [
          {
            mnemonicId: "mn-es-gato-1",
            contentLocale: "en",
            story: [
              {
                kind: "plain",
                text: "A cat in a giant sombrero crashes a fancy ",
              },
              { kind: "keyword", text: "gala" },
              // U+2011, a non-breaking hyphen, keeps "Gala‑cat" on one line.
              { kind: "plain", text: ". Gala\u2011cat, " },
              { kind: "term", text: "gato" },
              { kind: "plain", text: "!" },
            ],
            author: { displayName: "lucia_m" },
            upvotes: 1240,
            image: {
              src: "/mnemonics/gato.svg",
              alt: "A ginger cat in a bow tie, wearing a giant sombrero at a gala.",
            },
          },
          {
            mnemonicId: "mn-es-gato-2",
            contentLocale: "en",
            story: [
              { kind: "plain", text: "A cat knocks over your " },
              { kind: "keyword", text: "gateau" },
              { kind: "plain", text: " and licks the frosting. Bad " },
              { kind: "term", text: "gato" },
              { kind: "plain", text: "!" },
            ],
            author: { displayName: "kenji.k" },
            upvotes: 312,
          },
          {
            mnemonicId: "mn-es-gato-3",
            contentLocale: "en",
            story: [
              { kind: "plain", text: "The cat is the " },
              { kind: "keyword", text: "gatekeeper" },
              { kind: "plain", text: ": no one gets past the " },
              { kind: "term", text: "gato" },
              { kind: "plain", text: "." },
            ],
            author: { displayName: "sam_studies" },
            upvotes: 1,
          },
        ],
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
        mnemonics: [
          {
            mnemonicId: "mn-es-casa-1",
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
            image: {
              src: "/mnemonics/casa.svg",
              alt: "A house with a box of cash sitting on its roof.",
            },
          },
          {
            mnemonicId: "mn-es-casa-2",
            contentLocale: "en",
            story: [
              { kind: "plain", text: "Your house is your " },
              { kind: "keyword", text: "castle" },
              { kind: "plain", text: ", and every " },
              { kind: "term", text: "casa" },
              { kind: "plain", text: " is a castle to someone." },
            ],
            author: { displayName: "lucia_m" },
            upvotes: 94,
          },
        ],
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
        // A mnemonic without a picture, so the fallback shows in a real deck.
        mnemonics: [
          {
            mnemonicId: "mn-es-comer-1",
            contentLocale: "en",
            story: [
              { kind: "plain", text: "Dinner's ready: " },
              { kind: "keyword", text: "come here" },
              { kind: "plain", text: " and eat! " },
              { kind: "term", text: "Comer" },
              { kind: "plain", text: " means to eat." },
            ],
            author: { displayName: "profe_ana" },
            upvotes: 57,
          },
        ],
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

/** A card with the FSRS progress `@workspace/core`'s session reducer schedules. */
export type SessionStudyCard = StudyCard & SessionCard

/**
 * Seeds every card as brand new. #112 loads each card's saved progress
 * for usr_prototype_01 instead.
 */
export function withNewProgress(
  cards: readonly StudyCard[],
  now: Date
): SessionStudyCard[] {
  return cards.map((card) => ({
    ...card,
    progress: createProgress(card.cardId, now),
  }))
}

/** The cards behind a deck, or null when it has none seeded. */
export function findDeckCards(courseId: string): DeckCards | null {
  return seededDeckCards[courseId] ?? null
}

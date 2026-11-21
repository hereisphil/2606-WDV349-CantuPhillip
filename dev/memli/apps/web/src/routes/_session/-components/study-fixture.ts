import { createProgress } from "@workspace/core/srs/progress"
import type { StudySession } from "@workspace/schemas/api/study"
import type { Card } from "@workspace/schemas/content/card"

// A course to study with no API: dev study previews while signed out, and
// the e2e API stand-in (e2e/api.ts).

/**
 * The first five Spanish words, as in apps/api/seed, with 3, 2, 1, 0 and 0
 * mnemonics so every mnemonic state shows.
 */
const spanishCards: Card[] = [
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
    // A mnemonic without a picture, so the fallback shows in a real course.
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
]

/** What `GET /api/courses/spanish-core-1000/study?mode=learn` answers for a new learner. */
export function spanishLearnSession(now = new Date()): StudySession {
  return {
    course: {
      courseId: "spanish-core-1000",
      title: "Spanish Core 1000",
      learningLanguage: "es",
      answerLanguage: "en",
    },
    mode: "learn",
    cards: spanishCards.map((card) => ({
      ...card,
      progress: createProgress(card.cardId, now),
    })),
  }
}

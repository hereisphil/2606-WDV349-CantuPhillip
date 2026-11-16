import { test as base, type Page } from "@playwright/test"
import { createProgress } from "@workspace/core/srs/progress"
import type { CourseSummary } from "@workspace/schemas/api/courses"
import type { StudyHistoryData } from "@workspace/schemas/api/history"
import type { StudySession } from "@workspace/schemas/api/study"
import type { Card } from "@workspace/schemas/content/card"
import type { ReviewSubmission } from "@workspace/schemas/srs/review"

/**
 * A stand-in for `apps/api` in the end-to-end specs. Every request to
 * `/api/*` is answered here, in the browser, so the specs never need a
 * database or a Worker, run in parallel without sharing state, and always
 * start from the same data. The real API has its own tests on a real D1
 * (`apps/api/README.md`).
 *
 * The answers are typed with the contracts in `@workspace/schemas`, so a
 * contract change that the fixture misses fails typecheck here too.
 *
 * Specs import `test` and `expect` from this file instead of
 * `@playwright/test`. `test.use({ api: { ... } })` changes what the stand-in
 * answers for one spec.
 */

const hour = 60 * 60 * 1000
const hoursAgo = (hours: number): string =>
  new Date(Date.now() - hours * hour).toISOString()

/** The dashboard's four courses, with counts that exercise its states. */
const courses: CourseSummary[] = [
  {
    courseId: "spanish-core-1000",
    title: "Spanish Core 1000",
    learningLanguage: "es",
    answerLanguage: "en",
    dueCount: 16,
    newAvailable: 10,
    masteredCount: 52,
    learningCount: 148,
    unseenCount: 800,
    trickyCount: 4,
    lastReviewedAt: hoursAgo(2),
  },
  {
    courseId: "japanese-kana",
    title: "Japanese Hiragana & Katakana",
    learningLanguage: "ja",
    answerLanguage: "en",
    dueCount: 8,
    newAvailable: 5,
    masteredCount: 18,
    learningCount: 40,
    unseenCount: 34,
    trickyCount: 3,
    lastReviewedAt: hoursAgo(26),
  },
  {
    courseId: "french-travel-phrases",
    title: "French Travel Phrases",
    learningLanguage: "fr",
    answerLanguage: "en",
    dueCount: 0,
    newAvailable: 10,
    masteredCount: 20,
    learningCount: 30,
    unseenCount: 200,
    trickyCount: 0,
    lastReviewedAt: hoursAgo(72),
  },
  {
    courseId: "portuguese-essentials",
    title: "Portuguese Essentials",
    learningLanguage: "pt",
    answerLanguage: "en",
    dueCount: 0,
    newAvailable: 0,
    masteredCount: 10,
    learningCount: 30,
    unseenCount: 80,
    trickyCount: 0,
    lastReviewedAt: hoursAgo(24 * 14),
  },
]

/** A calendar date where the browser is, `daysAgo` days back, "YYYY-MM-DD". */
function localDaysAgo(daysAgo: number): string {
  const date = new Date()
  date.setDate(date.getDate() - daysAgo)
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${String(date.getFullYear())}-${month}-${day}`
}

/** A week with a goal day, partial days and a day off, oldest first. */
export function history(): StudyHistoryData {
  const words = [12, 50, 64, 31, 0, 55, 24]
  return {
    dailyGoal: 50,
    days: words.map((wordsStudied, index) => ({
      date: localDaysAgo(words.length - 1 - index),
      wordsStudied,
    })),
    daysOfStudy: 12,
    retentionPercent: 84,
    newWordsThisMonth: 142,
  }
}

/**
 * The five Spanish words a learner meets first, as in apps/api/seed:
 * gato (three mnemonics, one with a picture), casa (two), comer (one with no
 * picture), and rápido and ¿Qué tal? (none).
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

/** What `GET /api/courses/spanish-core-1000/study?mode=learn` answers. */
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

export type ApiStub = {
  /** Answers `GET /api/courses` with a server error. */
  coursesFail?: boolean
  /** Replaces what `GET /api/history` answers. */
  history?: Partial<StudyHistoryData>
  /** Answers `POST /api/reviews` with a server error. */
  reviewsFail?: boolean
}

/** Answers every `/api/*` request the app makes. */
async function stubApi(
  page: Page,
  stub: ApiStub,
  reviews: ReviewSubmission[]
): Promise<void> {
  const serverError = {
    status: 500,
    json: { error: { code: "INTERNAL_ERROR" } },
  }

  // Matched on the path, not a glob: Vite serves this repo's own modules
  // under URLs like /@fs/.../packages/schemas/src/api/courses.ts.
  const path = (pattern: RegExp) => (url: URL) => pattern.test(url.pathname)

  // Anything not stubbed below is a missing route, so a spec fails loudly.
  await page.route(path(/^\/api\//), (route) =>
    route.fulfill({ status: 404, json: { error: { code: "NOT_FOUND" } } })
  )
  await page.route(path(/^\/api\/courses$/), (route) =>
    route.fulfill(stub.coursesFail ? serverError : { json: { courses } })
  )
  await page.route(path(/^\/api\/history$/), (route) =>
    route.fulfill({ json: { ...history(), ...stub.history } })
  )
  await page.route(path(/^\/api\/courses\/[^/]+\/study$/), (route) => {
    const url = new URL(route.request().url())
    if (url.pathname !== "/api/courses/spanish-core-1000/study") {
      return route.fulfill({
        status: 404,
        json: { error: { code: "NOT_FOUND" } },
      })
    }
    const session = spanishLearnSession()
    const mode = url.searchParams.get("mode") ?? "review"
    // A new learner has words to learn and nothing yet to review or practice.
    return route.fulfill({
      json: mode === "learn" ? session : { ...session, mode, cards: [] },
    })
  })
  await page.route(path(/^\/api\/reviews$/), async (route) => {
    const body = route.request().postDataJSON() as {
      reviews: ReviewSubmission[]
    }
    reviews.push(...body.reviews)
    await route.fulfill(
      stub.reviewsFail ? serverError : { json: { progress: [] } }
    )
  })
}

export const test = base.extend<{
  /** What the API stand-in answers. Change it with `test.use({ api })`. */
  api: ApiStub
  /** Every review the page sent to `POST /api/reviews`, in order. */
  sentReviews: ReviewSubmission[]
}>({
  api: [{}, { option: true }],
  // Playwright reads a fixture's needs from its first parameter, which must
  // be an object pattern, even an empty one. The second hands the value to
  // the test; Playwright's docs call it `use`, a name React's lint reserves.
  // eslint-disable-next-line no-empty-pattern
  sentReviews: async ({}, provide) => {
    await provide([])
  },
  page: async ({ page, api, sentReviews }, provide) => {
    await stubApi(page, api, sentReviews)
    await provide(page)
  },
})

export { expect } from "@playwright/test"

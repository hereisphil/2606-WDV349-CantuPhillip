import { eq } from "drizzle-orm"
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest"

import { cardsById, firstWords } from "./content"
import { cards, mnemonics, users } from "./schema"
import {
  AUTHOR_ID,
  addMnemonic,
  addPublishedCourse,
  addUsers,
  startTestApi,
  type TestApi,
} from "./test-d1"

/** A row its schema refuses never reaches the app (#170). */

let api: TestApi
let log: ReturnType<typeof vi.spyOn>

beforeAll(async () => {
  api = await startTestApi()
})

afterAll(async () => {
  await api.stop()
})

beforeEach(async () => {
  await api.reset()
  await addUsers(api.db)
  await addPublishedCourse(api.db, "spanish", 3)
  await addMnemonic(api.db, { id: "mn-good", cardId: "spanish-1", upvotes: 1 })
  log = vi.spyOn(console, "error").mockImplementation(() => undefined)
})

afterEach(() => {
  log.mockRestore()
})

const secret = "a story only its author has seen"

type MnemonicChange = Partial<typeof mnemonics.$inferInsert>

async function addBadMnemonic(change: MnemonicChange): Promise<void> {
  await addMnemonic(api.db, { id: "mn-bad", cardId: "spanish-1", upvotes: 9 })
  await api.db.update(mnemonics).set(change).where(eq(mnemonics.id, "mn-bad"))
}

describe("a mnemonic row", () => {
  it.each<[string, MnemonicChange]>([
    [
      "a picture outside /mnemonics/",
      { imageSrc: "/api/courses", imageAlt: "A cat." },
    ],
    [
      "a picture on another site",
      { imageSrc: "https://evil.example/cat.svg", imageAlt: "A cat." },
    ],
    ["a story part with no text", { story: [{ kind: "plain" }] as never }],
    [
      "more than 24 story parts",
      { story: Array(25).fill({ kind: "plain", text: "a" }) as never },
    ],
    [
      "a story part that isn't plain, term or keyword",
      { story: [{ kind: "html", text: secret }] as never },
    ],
    ["an empty story part", { story: [{ kind: "plain", text: "" }] }],
    [
      "a story part over 280 characters",
      { story: [{ kind: "plain", text: "a".repeat(281) }] },
    ],
    [
      "alt text over 250 characters",
      { imageSrc: "/mnemonics/gato.svg", imageAlt: "a".repeat(251) },
    ],
    ["fractional upvotes", { upvotes: 1.5 }],
  ])(
    "is left out with %s, and the card keeps its good ones",
    async (_label, change) => {
      await addBadMnemonic(change)

      const card = (await cardsById(api.db, ["spanish-1"])).get("spanish-1")

      expect(card?.mnemonics?.map((m) => m.mnemonicId)).toEqual(["mn-good"])
      expect(log).toHaveBeenCalledWith(
        expect.stringMatching(/^Left out mnemonic mn-bad: /)
      )
    }
  )

  it("is logged by id and field, never with the learner's text", async () => {
    await addBadMnemonic({ story: [{ kind: "html", text: secret }] as never })

    await cardsById(api.db, ["spanish-1"])

    expect(log).toHaveBeenCalledWith(
      "Left out mnemonic mn-bad: story.0.kind (invalid_value)"
    )
    expect(JSON.stringify(log.mock.calls)).not.toContain(secret)
  })
})

it("leaves out a mnemonic whose author's name breaks the 64-character rule", async () => {
  await addMnemonic(api.db, { id: "mn-bad", cardId: "spanish-1", upvotes: 9 })
  await api.db
    .update(users)
    .set({ name: "a".repeat(65) })
    .where(eq(users.id, AUTHOR_ID))

  const card = (await cardsById(api.db, ["spanish-1"])).get("spanish-1")

  expect(card?.mnemonics).toEqual([])
  expect(log).toHaveBeenCalledWith(
    "Left out mnemonic mn-bad: author.displayName (too_big)"
  )
})

describe("a card row", () => {
  beforeEach(async () => {
    await api.db
      .update(cards)
      .set({ answers: [""] as never })
      .where(eq(cards.id, "spanish-2"))
  })

  it("is left out of a session's cards when its schema refuses it", async () => {
    const found = await cardsById(api.db, [
      "spanish-1",
      "spanish-2",
      "spanish-3",
    ])

    expect([...found.keys()]).toEqual(["spanish-1", "spanish-3"])
    expect(log).toHaveBeenCalledWith(
      "Left out card spanish-2: answers.0 (too_small)"
    )
  })

  it("is left out of the catalog's sample words", async () => {
    const words = await firstWords(api.db, "spanish", 3)

    expect(words.map((word) => word.cardId)).toEqual(["spanish-1", "spanish-3"])
  })

  it("leaves the study session to go on without it", async () => {
    const res = await api.request(
      "/api/courses/spanish/study?mode=learn&timeZone=UTC"
    )

    expect(res.status).toBe(200)
    const body = (await res.json()) as { cards: { cardId: string }[] }
    expect(body.cards.map((card) => card.cardId)).not.toContain("spanish-2")
  })
})

describe("Memli's own content", () => {
  it("loads every seeded card and mnemonic, with nothing left out", async () => {
    await api.reset()
    await api.seed()
    const ids = (await api.db.select({ id: cards.id }).from(cards)).map(
      (row) => row.id
    )
    const stored = await api.db.select({ id: mnemonics.id }).from(mnemonics)

    const found = await cardsById(api.db, ids)

    expect(ids.length).toBeGreaterThan(0)
    expect(found.size).toBe(ids.length)
    const loaded = [...found.values()].flatMap((card) => card.mnemonics ?? [])
    expect(loaded).toHaveLength(stored.length)
    expect(log).not.toHaveBeenCalled()
  })
})

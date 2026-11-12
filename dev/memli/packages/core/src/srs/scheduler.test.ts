import { DefaultScheduler } from "ts-fsrs"
import { describe, expect, it } from "vitest"
import { scheduler } from "./scheduler"

describe("scheduler", () => {
  // Guards against drift when ts-fsrs is upgraded: Memli's synchronous
  // scheduler must keep scheduling exactly like the library's FSRS-7 preset.
  it("schedules exactly like ts-fsrs's DefaultScheduler for FSRS-7 with fuzz", async () => {
    const reference = await DefaultScheduler({
      version: "FSRS-7",
      enableFuzz: true,
    })
    let now = new Date("2026-11-10T15:00:00.000Z")
    let ours = scheduler.newCard({ now, cardId: "card_1" })
    let theirs = reference.newCard({ now, cardId: "card_1" })
    expect(ours).toEqual(theirs)

    for (const grade of [3, 3, 1, 3, 4, 2, 1, 1, 3, 4] as const) {
      const a = scheduler.review({ card: ours, grade, now })
      const b = reference.review({ card: theirs, grade, now })
      expect(a).toEqual(b)
      ours = a.card
      theirs = b.card
      // Come back an hour after the card is due.
      now = new Date(a.card.dueAt.getTime() + 60 * 60 * 1000)
    }
  })

  it("spreads cards learned together across different days", () => {
    const now = new Date("2026-11-10T15:00:00.000Z")
    const due = new Set<string>()

    for (let i = 0; i < 20; i += 1) {
      let card = scheduler.newCard({ now, cardId: `card_${i}` })
      // Two "got it"s push the interval past the 2.5 days fuzz starts at.
      for (const _ of [1, 2]) {
        card = scheduler.review({ card, grade: 3, now: card.dueAt }).card
      }
      due.add(card.dueAt.toISOString())
    }

    expect(due.size).toBeGreaterThan(1)
  })
})

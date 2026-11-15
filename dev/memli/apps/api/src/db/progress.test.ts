import { applyOutcome } from "@workspace/core/srs/outcome"
import { createProgress, type CardProgress } from "@workspace/core/srs/progress"
import { describe, expect, it } from "vitest"

import {
  progressFromRow,
  progressToRow,
  type UserProgressRow,
} from "./progress"

const now = new Date("2026-11-14T20:00:00.000Z")

// What D1 hands back: the insert, with every column filled in.
function stored(progress: CardProgress): UserProgressRow {
  const row = progressToRow("usr_prototype_01", progress, now)
  return {
    ...row,
    lastReview: row.lastReview ?? null,
    updatedAt: row.updatedAt ?? now,
  }
}

describe("user_progress rows", () => {
  it("keep a brand-new card exactly", () => {
    const fresh = createProgress("es-gato", now)

    expect(progressFromRow(stored(fresh))).toEqual(fresh)
  })

  it("keep every FSRS-7 field after reviews, fractional days included", () => {
    let progress = createProgress("es-gato", now)
    for (const [outcome, minutes] of [
      ["missed", 0],
      ["got_it", 3],
      ["got_it", 60 * 24 * 2],
      ["tough", 60 * 24 * 9],
    ] as const) {
      const at = new Date(now.getTime() + minutes * 60_000)
      progress = applyOutcome(progress, outcome, at).progress

      expect(progressFromRow(stored(progress))).toEqual(progress)
    }
    expect(progress.lastReview).not.toBeNull()
  })

  it("belong to one learner", () => {
    const row = progressToRow(
      "usr_prototype_01",
      createProgress("es-gato", now),
      now
    )

    expect(row).toMatchObject({ userId: "usr_prototype_01", cardId: "es-gato" })
  })
})

import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest"

import { rateLimits, sessions, verifications } from "../db/schema"
import { addUsers, startTestApi, VIEWER_ID, type TestApi } from "../db/test-d1"
import { deleteExpiredRows, RATE_LIMIT_ROW_MS } from "./cleanup"

const now = new Date("2026-11-20T04:00:00.000Z").getTime()
const minute = 60_000

let api: TestApi

beforeAll(async () => {
  api = await startTestApi()
})

afterAll(async () => {
  await api.stop()
})

beforeEach(async () => {
  await api.reset()
  await addUsers(api.db)
})

describe("deleteExpiredRows", () => {
  it("deletes rate-limit rows idle for more than a day, and keeps the rest", async () => {
    await api.db.insert(rateLimits).values([
      {
        id: "old",
        key: "old",
        count: 3,
        lastRequest: now - RATE_LIMIT_ROW_MS - minute,
      },
      {
        id: "recent",
        key: "recent",
        count: 3,
        lastRequest: now - RATE_LIMIT_ROW_MS + minute,
      },
    ])

    await deleteExpiredRows(api.db, now)

    const left = await api.db.select({ key: rateLimits.key }).from(rateLimits)
    expect(left).toEqual([{ key: "recent" }])
  })

  it("deletes expired sessions, with their IP address and user agent", async () => {
    const session = {
      userId: VIEWER_ID,
      ipAddress: "203.0.113.7",
      userAgent: "Mozilla/5.0",
    }
    await api.db.insert(sessions).values([
      {
        ...session,
        id: "ended",
        token: "ended",
        expiresAt: new Date(now - minute),
      },
      {
        ...session,
        id: "live",
        token: "live",
        expiresAt: new Date(now + minute),
      },
    ])

    await deleteExpiredRows(api.db, now)

    const left = await api.db.select({ id: sessions.id }).from(sessions)
    expect(left).toEqual([{ id: "live" }])
  })

  it("deletes expired verification codes", async () => {
    await api.db.insert(verifications).values([
      {
        id: "ended",
        identifier: "a",
        value: "x",
        expiresAt: new Date(now - minute),
      },
      {
        id: "live",
        identifier: "b",
        value: "y",
        expiresAt: new Date(now + minute),
      },
    ])

    await deleteExpiredRows(api.db, now)

    const left = await api.db
      .select({ id: verifications.id })
      .from(verifications)
    expect(left).toEqual([{ id: "live" }])
  })
})

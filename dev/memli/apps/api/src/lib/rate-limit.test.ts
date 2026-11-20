import { apiErrorSchema } from "@workspace/schemas/api/error"
import type { ReviewSubmission } from "@workspace/schemas/srs/review"
import { Hono } from "hono"
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

import { rateLimits } from "../db/schema"
import {
  AUTHOR_ID,
  VIEWER_ID,
  addPublishedCourse,
  addUsers,
  startTestApi,
  type TestApi,
} from "../db/test-d1"
import type { AppEnv } from "../env"
import { REVIEW_LIMITS } from "../routes/reviews"
import { consume, limitAddress, limitRequests } from "./rate-limit"

const now = new Date("2026-11-17T12:00:00.000Z")
const threePerTen = { windowSeconds: 10, max: 3 }

let api: TestApi

beforeAll(async () => {
  api = await startTestApi()
})

afterAll(async () => {
  await api.stop()
})

beforeEach(async () => {
  // Only `Date` is faked: the limiter reads the clock to end a window.
  vi.useFakeTimers({ toFake: ["Date"], now })
  await api.reset()
})

afterEach(() => {
  vi.useRealTimers()
})

async function tries(count: number, key = "k"): Promise<boolean[]> {
  const allowed: boolean[] = []
  for (let attempt = 0; attempt < count; attempt += 1) {
    const decision = await consume(api.db, key, threePerTen, Date.now())
    allowed.push(decision.allowed)
  }
  return allowed
}

describe("consume", () => {
  it("allows up to the limit in a window, then refuses", async () => {
    expect(await tries(5)).toEqual([true, true, true, false, false])
  })

  it("says how long to wait, counted from the window's start", async () => {
    await tries(3)
    vi.setSystemTime(now.getTime() + 4_000)

    expect(await consume(api.db, "k", threePerTen, Date.now())).toEqual({
      allowed: false,
      retryAfter: 6,
    })
  })

  it("starts a new window once the old one is over", async () => {
    await tries(4)
    vi.setSystemTime(now.getTime() + 10_000)

    expect(await tries(4)).toEqual([true, true, true, false])
  })

  it("counts each key on its own", async () => {
    await tries(4, "a")

    expect(await tries(1, "b")).toEqual([true])
  })

  it("lets no more than the limit through when requests arrive at once", async () => {
    const decisions = await Promise.all(
      Array.from({ length: 10 }, () =>
        consume(api.db, "k", threePerTen, Date.now())
      )
    )

    expect(decisions.filter((decision) => decision.allowed)).toHaveLength(3)
    const [row] = await api.db.select().from(rateLimits)
    expect(row?.count).toBe(10)
  })
})

describe("limitRequests", () => {
  // A stand-in for a route behind `requireViewer`: the learner comes from a header.
  const app = new Hono<AppEnv>()
    .use(async (c, next) => {
      c.set("viewerId", c.req.header("x-test-learner") ?? VIEWER_ID)
      return next()
    })
    .use(
      limitRequests("test", {
        perLearner: threePerTen,
        perAddress: { windowSeconds: 10, max: 5 },
      })
    )
    .get("/", (c) => c.text("ok"))

  async function statuses(
    count: number,
    headers: (attempt: number) => Record<string, string>
  ): Promise<number[]> {
    const result: number[] = []
    for (let attempt = 0; attempt < count; attempt += 1) {
      const res = await app.request("/", { headers: headers(attempt) }, api.env)
      result.push(res.status)
    }
    return result
  }

  it("limits one learner, wherever they are", async () => {
    const result = await statuses(4, (attempt) => ({
      "cf-connecting-ip": `203.0.113.${String(attempt)}`,
    }))

    expect(result).toEqual([200, 200, 200, 429])
  })

  it("limits one address, whoever is behind it", async () => {
    const result = await statuses(6, (attempt) => ({
      "cf-connecting-ip": "203.0.113.7",
      "x-test-learner": `learner-${String(attempt)}`,
    }))

    expect(result).toEqual([200, 200, 200, 200, 200, 429])
  })

  it("answers RATE_LIMITED with Retry-After in seconds", async () => {
    await statuses(3, () => ({}))

    const res = await app.request("/", {}, api.env)

    expect(res.status).toBe(429)
    expect(res.headers.get("Retry-After")).toBe("10")
    expect(apiErrorSchema.parse(await res.json())).toEqual({
      error: { code: "RATE_LIMITED" },
    })
  })
})

describe("limitAddress", () => {
  // A stand-in for a public route: no session, so no learner to count.
  const app = new Hono<AppEnv>()
    .use(limitAddress("public-test", threePerTen))
    .get("/", (c) => c.text("ok"))

  function ask(address: string): Promise<Response> {
    return Promise.resolve(
      app.request("/", { headers: { "cf-connecting-ip": address } }, api.env)
    )
  }

  it("limits one address with no session, and leaves the next one alone", async () => {
    const result: number[] = []
    for (let attempt = 0; attempt < 4; attempt += 1) {
      result.push((await ask("203.0.113.7")).status)
    }

    expect(result).toEqual([200, 200, 200, 429])
    expect((await ask("203.0.113.8")).status).toBe(200)
  })

  it("answers RATE_LIMITED with Retry-After, and lets the address back in later", async () => {
    for (let attempt = 0; attempt < 3; attempt += 1) {
      await ask("203.0.113.7")
    }

    const res = await ask("203.0.113.7")
    expect(res.headers.get("Retry-After")).toBe("10")
    expect(apiErrorSchema.parse(await res.json())).toEqual({
      error: { code: "RATE_LIMITED" },
    })

    vi.setSystemTime(now.getTime() + 10_000)
    expect((await ask("203.0.113.7")).status).toBe(200)
  })
})

describe("POST /api/reviews", () => {
  beforeEach(async () => {
    await addUsers(api.db)
    await addPublishedCourse(api.db, "spanish", 1)
  })

  function postReview(as: string): Promise<Response> {
    const review: ReviewSubmission = {
      reviewId: crypto.randomUUID(),
      cardId: "spanish-1",
      outcome: "got_it",
      reviewedAt: new Date().toISOString(),
      durationMs: 3_000,
    }
    return api.request(
      "/api/reviews",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviews: [review] }),
      },
      as
    )
  }

  it("refuses a learner's request past the minute's limit, and only theirs", async () => {
    const { max } = REVIEW_LIMITS.perLearner
    for (let attempt = 0; attempt < max; attempt += 1) {
      expect((await postReview(VIEWER_ID)).status).toBe(200)
    }

    const refused = await postReview(VIEWER_ID)
    expect(refused.status).toBe(429)
    expect(apiErrorSchema.parse(await refused.json())).toEqual({
      error: { code: "RATE_LIMITED" },
    })
    expect((await postReview(AUTHOR_ID)).status).toBe(200)

    vi.setSystemTime(now.getTime() + 60_000)
    expect((await postReview(VIEWER_ID)).status).toBe(200)
    // Over 60 real requests: slow when every package's tests run at once.
  }, 30_000)
})

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

import { app } from "../app"
import { rateLimits, sessions, users } from "../db/schema"
import { TEST_ORIGIN, startTestApi, type TestApi } from "../db/test-d1"

/** The guards around sign-in from docs/security.md: limits, origin, cookies. */

const now = new Date("2026-11-17T12:00:00.000Z")
const STAGING_ORIGIN = "https://memli-staging.thereisphil.workers.dev"

const learner = {
  name: "Ana",
  email: "ana@memli.test",
  password: "Correct-horse-battery",
}
const wrong = { email: learner.email, password: "not the password" }

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

function post(
  path: string,
  body: unknown,
  headers: Record<string, string> = {}
): Promise<Response> {
  return api.request(`/api/auth${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: TEST_ORIGIN,
      ...headers,
    },
    body: JSON.stringify(body),
  })
}

function cookiesOf(res: Response): string {
  return res.headers
    .getSetCookie()
    .map((cookie) => cookie.split(";")[0])
    .join("; ")
}

async function codeOf(res: Response): Promise<unknown> {
  const body: { code?: unknown } = await res.json()
  return body.code
}

/** `count` sign-in tries from one address, one after another. */
async function signInTries(
  count: number,
  headers: Record<string, string>
): Promise<number[]> {
  const statuses: number[] = []
  for (let attempt = 0; attempt < count; attempt += 1) {
    const res = await post("/sign-in/email", wrong, headers)
    statuses.push(res.status)
  }
  return statuses
}

describe("rate limiting", () => {
  const fromOneAddress = { "cf-connecting-ip": "203.0.113.7" }

  it("refuses the fourth sign-in try in 10 seconds", async () => {
    const statuses = await signInTries(4, fromOneAddress)

    expect(statuses).toEqual([401, 401, 401, 429])
  })

  it("says when to try again, and lets the learner in after that", async () => {
    await signInTries(3, fromOneAddress)
    const refused = await post("/sign-in/email", wrong, fromOneAddress)
    expect(Number(refused.headers.get("X-Retry-After"))).toBeGreaterThan(0)

    vi.setSystemTime(now.getTime() + 11_000)

    expect(await signInTries(1, fromOneAddress)).toEqual([401])
  })

  it("counts each address on its own", async () => {
    await signInTries(4, fromOneAddress)

    const other = await signInTries(1, { "cf-connecting-ip": "198.51.100.9" })
    expect(other).toEqual([401])
  })

  it("ignores X-Forwarded-For, which any client can set", async () => {
    const statuses: number[] = []
    for (let attempt = 0; attempt < 4; attempt += 1) {
      const res = await post("/sign-in/email", wrong, {
        ...fromOneAddress,
        "X-Forwarded-For": `10.0.0.${String(attempt)}`,
      })
      statuses.push(res.status)
    }

    expect(statuses).toEqual([401, 401, 401, 429])
  })

  it("keeps its counts in D1, where every Worker instance sees them", async () => {
    await signInTries(2, fromOneAddress)

    const rows = await api.db.select().from(rateLimits)
    expect(rows).toHaveLength(1)
    expect(rows[0]?.count).toBe(2)
  })

  it("refuses the sixth sign-up from one address in a minute", async () => {
    const statuses: number[] = []
    for (let attempt = 0; attempt < 6; attempt += 1) {
      const res = await post(
        "/sign-up/email",
        { ...learner, email: `ana${String(attempt)}@memli.test` },
        fromOneAddress
      )
      statuses.push(res.status)
    }

    expect(statuses).toEqual([200, 200, 200, 200, 200, 429])
    expect(await api.db.select().from(users)).toHaveLength(5)
  })
})

describe("requests from another origin", () => {
  it("refuses a write that carries the learner's cookie", async () => {
    const signUp = await post("/sign-up/email", learner)

    const res = await post(
      "/sign-out",
      {},
      { Cookie: cookiesOf(signUp), Origin: "https://evil.example" }
    )

    expect(res.status).toBe(403)
    expect(await codeOf(res)).toBe("INVALID_ORIGIN")
    expect(await api.db.select().from(sessions)).toHaveLength(1)
  })

  it("refuses a write with a cookie and no origin at all", async () => {
    const signUp = await post("/sign-up/email", learner)

    const res = await api.request("/api/auth/sign-out", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookiesOf(signUp),
      },
      body: "{}",
    })

    expect(res.status).toBe(403)
    expect(await api.db.select().from(sessions)).toHaveLength(1)
  })

  it("refuses a sign-in that another site's page sent", async () => {
    await post("/sign-up/email", learner)

    const res = await post(
      "/sign-in/email",
      { email: learner.email, password: learner.password },
      {
        Origin: "https://evil.example",
        "Sec-Fetch-Site": "cross-site",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Dest": "empty",
      }
    )

    expect(res.status).toBe(403)
    expect(res.headers.getSetCookie()).toEqual([])
  })
})

describe("the session cookie", () => {
  it("is HttpOnly, Secure and SameSite=Lax on an https origin", async () => {
    const res = await app.request(
      "/api/auth/sign-up/email",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Origin: STAGING_ORIGIN,
        },
        body: JSON.stringify(learner),
      },
      { ...api.env, BETTER_AUTH_URL: STAGING_ORIGIN }
    )

    const [cookie] = res.headers.getSetCookie()
    expect(cookie).toMatch(/^__Secure-better-auth\.session_token=/)
    const attributes = cookie?.split("; ").slice(1)
    expect(attributes).toContain("HttpOnly")
    expect(attributes).toContain("Secure")
    expect(attributes).toContain("SameSite=Lax")
    expect(attributes).toContain("Path=/")
  })

  it("is HttpOnly and SameSite=Lax locally, where there is no https", async () => {
    const res = await post("/sign-up/email", learner)

    const attributes = res.headers.getSetCookie()[0]?.split("; ").slice(1)
    expect(attributes).toContain("HttpOnly")
    expect(attributes).toContain("SameSite=Lax")
  })
})

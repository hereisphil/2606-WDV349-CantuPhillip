import { apiErrorSchema } from "@workspace/schemas/api/error"
import type { ReviewSubmission } from "@workspace/schemas/srs/review"
import { TERMS_VERSION } from "@workspace/schemas/auth/sign-up"
import { eq } from "drizzle-orm"
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest"

import { app } from "../app"
import { reviews, users } from "../db/schema"
import {
  TEST_ORIGIN,
  addPublishedCourse,
  addUsers,
  startTestApi,
  type TestApi,
} from "../db/test-d1"
import { isTrustedOrigin } from "./same-origin"

/** Writes must come from Memli's own pages (#169). */

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
  await addPublishedCourse(api.db, "spanish", 2)
})

function body(): string {
  const review: ReviewSubmission = {
    reviewId: crypto.randomUUID(),
    cardId: "spanish-1",
    outcome: "got_it",
    reviewedAt: new Date().toISOString(),
    durationMs: 3_000,
  }
  return JSON.stringify({ reviews: [review] })
}

async function expectForbidden(res: Response): Promise<void> {
  expect(res.status).toBe(403)
  expect(apiErrorSchema.parse(await res.json())).toEqual({
    error: { code: "FORBIDDEN" },
  })
  expect(await api.db.select().from(reviews)).toHaveLength(0)
}

describe("a write to Memli's own routes", () => {
  it("is saved when it comes from the app's own origin", async () => {
    const res = await api.request("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json", Origin: TEST_ORIGIN },
      body: body(),
    })

    expect(res.status).toBe(200)
  })

  it.each([
    ["another site", "https://evil.example"],
    ["a look-alike host", "http://localhost:5173.evil.example"],
    ["another port", "http://localhost:5174"],
    ["an opaque origin", "null"],
    ["a public address on the dev port", "http://8.8.8.8:5173"],
    ["a look-alike network host", "http://192.168.1.5.evil.example:5173"],
    ["the local network on another port", "http://192.168.1.5:5174"],
  ])(
    "is refused from %s, even with the learner's cookie",
    async (_label, origin) => {
      const res = await api.request("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json", Origin: origin },
        body: body(),
      })

      await expectForbidden(res)
    }
  )

  it("is saved from the dev server opened on a phone on the local network", async () => {
    const res = await api.request("/api/reviews", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: "http://192.168.1.105:5173",
      },
      body: body(),
    })

    expect(res.status).toBe(200)
  })

  it("is refused with no Origin at all", async () => {
    // Straight to the app: the test helper adds an Origin to every write.
    const res = await app.request(
      "/api/reviews",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: body(),
      },
      api.env
    )

    await expectForbidden(res)
  })
})

describe("what the check leaves alone", () => {
  it("lets a read through from anywhere: the browser keeps the answer from that page", async () => {
    const res = await api.request("/api/courses", {
      headers: { Origin: "https://evil.example" },
    })

    expect(res.status).toBe(200)
  })

  it("leaves /api/auth/* to Better Auth's own check", async () => {
    const res = await app.request(
      "/api/auth/sign-up/email",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Ana",
          email: "ana@memli.test",
          password: "Correct-horse-battery",
          acceptedTermsVersion: TERMS_VERSION,
        }),
      },
      api.env
    )

    expect(res.status).toBe(200)
  })
})

describe("the local network", () => {
  it.each([
    "http://10.0.0.7:5173",
    "http://172.16.4.2:5173",
    "http://172.31.255.1:5173",
    "http://192.168.1.105:5173",
  ])("is trusted on a developer's machine: %s", (origin) => {
    expect(isTrustedOrigin(origin, "http://localhost:5173")).toBe(true)
  })

  it.each([
    ["outside 172.16 to 172.31", "http://172.32.0.1:5173"],
    ["https, which the dev server doesn't serve", "https://192.168.1.105:5173"],
    ["with a path", "http://192.168.1.105:5173/signup"],
    ["with a login in the URL", "http://me@192.168.1.105:5173"],
  ])("is refused %s", (_label, origin) => {
    expect(isTrustedOrigin(origin, "http://localhost:5173")).toBe(false)
  })

  it("is never trusted once Memli is deployed", () => {
    for (const appUrl of ["https://memli.app", "https://localhost.memli.app"]) {
      expect(isTrustedOrigin("http://192.168.1.105:5173", appUrl)).toBe(false)
      expect(isTrustedOrigin("http://192.168.1.105", appUrl)).toBe(false)
    }
  })

  it("can sign up on the dev server opened from a phone", async () => {
    const res = await api.request(
      "/api/auth/sign-up/email",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Origin: "http://192.168.1.105:5173",
        },
        body: JSON.stringify({
          name: "Ana",
          email: "ana@memli.test",
          password: "Correct-horse-battery",
          acceptedTermsVersion: TERMS_VERSION,
        }),
      },
      null
    )

    expect(res.status).toBe(200)
    expect(
      await api.db.select().from(users).where(eq(users.email, "ana@memli.test"))
    ).toHaveLength(1)
  })

  it("still can't sign up from another site", async () => {
    const res = await api.request(
      "/api/auth/sign-up/email",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Origin: "https://evil.example",
        },
        body: JSON.stringify({
          name: "Ana",
          email: "ana@memli.test",
          password: "Correct-horse-battery",
          acceptedTermsVersion: TERMS_VERSION,
        }),
      },
      null
    )

    expect(res.status).toBe(403)
  })
})

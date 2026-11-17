import { apiErrorSchema } from "@workspace/schemas/api/error"
import { eq } from "drizzle-orm"
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest"

import { app } from "../app"
import { accounts, sessions, users } from "../db/schema"
import { TEST_ORIGIN, startTestApi, type TestApi } from "../db/test-d1"

const learner = {
  name: "Ana",
  email: "ana@memli.test",
  password: "Correct-horse-battery",
}

let api: TestApi

beforeAll(async () => {
  api = await startTestApi()
})

afterAll(async () => {
  await api.stop()
})

beforeEach(async () => {
  await api.reset()
})

/** A JSON POST to Better Auth, sent the way the web app's browser sends it. */
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

/** The `name=value` pairs of a response's cookies, ready to send back. */
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

describe("POST /api/auth/sign-up/email", () => {
  it("creates the learner and signs them in", async () => {
    const res = await post("/sign-up/email", learner)

    expect(res.status).toBe(200)
    expect(cookiesOf(res)).toContain("better-auth.session_token=")

    const [user] = await api.db.select().from(users)
    expect(user).toMatchObject({
      name: "Ana",
      email: "ana@memli.test",
      emailVerified: false,
      uiLocale: "en",
    })
    expect(await api.db.select().from(sessions)).toHaveLength(1)
  })

  it("stores a hash, never the password", async () => {
    await post("/sign-up/email", learner)

    const [account] = await api.db.select().from(accounts)
    expect(account?.providerId).toBe("credential")
    expect(account?.password).toBeTruthy()
    expect(account?.password).not.toContain(learner.password)
  })

  it("ignores fields a learner may not set", async () => {
    await post("/sign-up/email", {
      ...learner,
      uiLocale: "xx",
      emailVerified: true,
    })

    const [user] = await api.db.select().from(users)
    expect(user).toMatchObject({ uiLocale: "en", emailVerified: false })
  })

  it("trims a name and cuts it at 64 characters", async () => {
    await post("/sign-up/email", { ...learner, name: `  ${"N".repeat(500)}` })

    const [user] = await api.db.select().from(users)
    expect(user?.name).toBe("N".repeat(64))
  })

  it("refuses a blank name", async () => {
    const res = await post("/sign-up/email", { ...learner, name: "   " })

    expect(res.ok).toBe(false)
    expect(await api.db.select().from(users)).toHaveLength(0)
  })

  it("refuses an email that is not one", async () => {
    const res = await post("/sign-up/email", { ...learner, email: "ana" })

    expect(res.status).toBe(400)
    expect(await api.db.select().from(users)).toHaveLength(0)
  })

  it.each([
    ["shorter than 8 characters", "Sh-ort", "PASSWORD_TOO_SHORT"],
    ["over 128 characters", `A-${"x".repeat(127)}`, "PASSWORD_TOO_LONG"],
    ["with no capital letter", "correct-horse", "PASSWORD_TOO_WEAK"],
    ["with no lowercase letter", "CORRECT-HORSE", "PASSWORD_TOO_WEAK"],
    ["with no symbol", "CorrectHorse1", "PASSWORD_TOO_WEAK"],
  ])("refuses a password %s", async (_label, password, code) => {
    const res = await post("/sign-up/email", { ...learner, password })

    expect(res.status).toBe(400)
    expect(await codeOf(res)).toBe(code)
    expect(await api.db.select().from(users)).toHaveLength(0)
  })
})

describe("POST /api/auth/sign-in/email", () => {
  beforeEach(async () => {
    await post("/sign-up/email", learner)
  })

  it("signs in with the right password, and the session names the learner", async () => {
    const signIn = await post("/sign-in/email", {
      email: learner.email,
      password: learner.password,
    })
    expect(signIn.status).toBe(200)

    const session = await api.request("/api/auth/get-session", {
      headers: { Cookie: cookiesOf(signIn) },
    })
    const body: { user?: { email?: string } } | null = await session.json()
    expect(body?.user?.email).toBe(learner.email)
  })

  it("says the same thing for a wrong password and an unknown email", async () => {
    const wrongPassword = await post("/sign-in/email", {
      email: learner.email,
      password: "not the password",
    })
    const unknownEmail = await post("/sign-in/email", {
      email: "nobody@memli.test",
      password: learner.password,
    })

    expect(wrongPassword.status).toBe(401)
    expect(unknownEmail.status).toBe(401)
    expect(await codeOf(wrongPassword)).toBe("INVALID_EMAIL_OR_PASSWORD")
    expect(await codeOf(unknownEmail)).toBe("INVALID_EMAIL_OR_PASSWORD")
  })

  it("has no session without a cookie", async () => {
    const res = await api.request("/api/auth/get-session")

    expect(await res.json()).toBeNull()
  })
})

describe("a signed-in learner changing their account", () => {
  let cookie: string

  beforeEach(async () => {
    cookie = cookiesOf(await post("/sign-up/email", learner))
  })

  it("can't change to a password that breaks the rules", async () => {
    const res = await post(
      "/change-password",
      { currentPassword: learner.password, newPassword: "correct-horse" },
      { Cookie: cookie }
    )

    expect(res.status).toBe(400)
    expect(await codeOf(res)).toBe("PASSWORD_TOO_WEAK")
  })

  it("can change to one that follows them", async () => {
    const res = await post(
      "/change-password",
      { currentPassword: learner.password, newPassword: "Another-horse" },
      { Cookie: cookie }
    )

    expect(res.status).toBe(200)
  })

  it("gets a new name trimmed and cut at 64 characters too", async () => {
    const res = await post(
      "/update-user",
      { name: ` ${"M".repeat(500)}` },
      { Cookie: cookie }
    )
    expect(res.status).toBe(200)

    const [user] = await api.db.select().from(users)
    expect(user?.name).toBe("M".repeat(64))
  })
})

describe("POST /api/auth/sign-out", () => {
  it("deletes the session on the server, not just the cookie", async () => {
    const signUp = await post("/sign-up/email", learner)
    const cookie = cookiesOf(signUp)

    const res = await post("/sign-out", {}, { Cookie: cookie })
    expect(res.status).toBe(200)

    const [user] = await api.db
      .select()
      .from(users)
      .where(eq(users.email, learner.email))
    expect(user).toBeDefined()
    expect(await api.db.select().from(sessions)).toHaveLength(0)

    const session = await api.request("/api/auth/get-session", {
      headers: { Cookie: cookie },
    })
    expect(await session.json()).toBeNull()
  })
})

describe("the API's environment", () => {
  it("answers INTERNAL_ERROR, and nothing else, when the secret is missing", async () => {
    const res = await app.request(
      "/api/auth/get-session",
      {},
      { ...api.env, BETTER_AUTH_SECRET: undefined }
    )

    expect(res.status).toBe(500)
    expect(apiErrorSchema.parse(await res.json())).toEqual({
      error: { code: "INTERNAL_ERROR" },
    })
  })
})

import type { HealthResponse } from "@workspace/schemas/api/health"
import { Hono } from "hono"

import type { AppEnv } from "./env"
import { auth } from "./lib/auth"
import { handleError, handleNotFound } from "./lib/errors"
import { courseRoutes } from "./routes/courses"
import { historyRoutes } from "./routes/history"
import { reviewRoutes } from "./routes/reviews"

/**
 * The Memli API. Every route lives under `/api`, so the same paths work behind
 * the Vite dev proxy and on a same-origin deploy, with no path rewriting.
 */
export const app = new Hono<AppEnv>().basePath("/api")

app.notFound(handleNotFound)
app.onError(handleError)

// Answers are one learner's data and change with every review, so nothing
// between the Worker and the app may keep a copy.
app.use(async (c, next) => {
  await next()
  c.header("Cache-Control", "no-store")
})

// Liveness only: the Worker is up and routing. It does not touch the database.
app.get("/health", (c) => {
  const body: HealthResponse = { status: "ok" }
  return c.json(body)
})

// Better Auth owns everything under /api/auth: sign-up, sign-in, sign out.
app.on(["GET", "POST"], "/auth/*", (c) => auth(c.env).handler(c.req.raw))

app.route("/courses", courseRoutes)
app.route("/reviews", reviewRoutes)
app.route("/history", historyRoutes)

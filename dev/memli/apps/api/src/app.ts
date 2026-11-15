import type { HealthResponse } from "@workspace/schemas/api/health"
import { Hono } from "hono"

import { handleError, handleNotFound } from "./lib/errors"

/**
 * The Memli API. Every route lives under `/api`, so the same paths work behind
 * the Vite dev proxy and on a same-origin deploy, with no path rewriting.
 */
export const app = new Hono().basePath("/api")

app.notFound(handleNotFound)
app.onError(handleError)

// Liveness only: the Worker is up and routing. It does not touch the database.
app.get("/health", (c) => {
  const body: HealthResponse = { status: "ok" }
  return c.json(body)
})

import { Hono } from "hono"

/**
 * The Memli API. Every route lives under `/api`, so the same paths work behind
 * the Vite dev proxy and on a same-origin deploy, with no path rewriting.
 */
export const app = new Hono().basePath("/api")

// Says which service answered. Useful for checking the dev proxy by hand.
app.get("/", (c) => c.json({ service: "memli-api" }))

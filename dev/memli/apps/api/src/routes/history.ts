import { localDate, summarizeHistory } from "@workspace/core/study/history"
import {
  historyQuerySchema,
  type StudyHistoryData,
} from "@workspace/schemas/api/history"
import { Hono } from "hono"

import { database } from "../db/client"
import { reviewsSince, studyQuarterHours } from "../db/reviews"
import type { AppEnv } from "../env"
import { validate } from "../lib/validate"
import { requireViewer, viewerId } from "../lib/viewer"

/** Mounted at `/api/history`. */
export const historyRoutes = new Hono<AppEnv>()

// Every route here is one learner's data, so each needs a session.
historyRoutes.use(requireViewer)

// A local month and the 30-day retention window both fit in 32 days, with a
// day to spare for the widest time-zone offsets.
const WINDOW_MS = 33 * 24 * 60 * 60 * 1000

// The viewer's study history: the week, days of study, retention, new words.
historyRoutes.get("/", validate("query", historyQuerySchema), async (c) => {
  const db = database(c.env.DB)
  const now = new Date()
  const userId = viewerId(c)
  const { timeZone } = c.req.valid("query")

  const [reviews, quarterHours] = await Promise.all([
    reviewsSince(db, userId, new Date(now.getTime() - WINDOW_MS)),
    studyQuarterHours(db, userId),
  ])

  const body: StudyHistoryData = summarizeHistory({
    reviews,
    studyDates: quarterHours.map((instant) => localDate(instant, timeZone)),
    now,
    timeZone,
  })
  return c.json(body)
})

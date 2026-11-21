import { app } from "./app"
import { database } from "./db/client"
import { deleteExpiredRows } from "./lib/cleanup"

// A Cloudflare Worker's entry: `fetch` for requests, `scheduled` for the daily cron.
export default {
  fetch: app.fetch,
  scheduled(_controller, env, ctx) {
    ctx.waitUntil(deleteExpiredRows(database(env.DB), Date.now()))
  },
} satisfies ExportedHandler<Env>

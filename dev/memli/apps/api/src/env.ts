/**
 * What the Worker gets from Cloudflare, declared in wrangler.jsonc. In
 * `wrangler dev`, `DB` is the local D1 database in .wrangler/state.
 */
export type Env = {
  DB: D1Database
}

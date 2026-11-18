/**
 * `Bindings` is the global `Env` that `wrangler types` writes from
 * wrangler.jsonc. `Variables` is what middleware hands the routes.
 */
export type AppEnv = {
  Bindings: Env
  Variables: {
    /** The signed-in learner, set by `requireViewer` (src/lib/viewer.ts). */
    viewerId: string
  }
}

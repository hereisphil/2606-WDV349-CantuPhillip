import { z } from "zod"

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1"])

/** `https` everywhere but a developer's own machine, so cookies are `Secure`. */
function isSecureOrLocal(value: string): boolean {
  // Zod runs this even when `z.url()` has already refused the value.
  if (!URL.canParse(value)) return false
  const { protocol, hostname } = new URL(value)
  return protocol === "https:" || LOCAL_HOSTS.has(hostname)
}

/**
 * What `apps/api` needs besides its bindings. A missing or weak value fails
 * loudly on the first request that signs anyone in (docs/security.md).
 */
export const apiEnvSchema = z.object({
  /** Signs session cookies. `wrangler secret put`, or `.dev.vars` locally. */
  BETTER_AUTH_SECRET: z.string().min(32),
  /** The origin learners see, with no path: sign-in trusts only this origin. */
  BETTER_AUTH_URL: z.url().refine(isSecureOrLocal),
})

export type ApiEnv = z.infer<typeof apiEnvSchema>

export function parseApiEnv(env: unknown): ApiEnv {
  return apiEnvSchema.parse(env)
}

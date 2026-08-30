import { z } from "zod"

/** Vite `import.meta.env` shape relied on in the web app. */
export const webEnvSchema = z.object({
  MODE: z.enum(["development", "production", "test"]),
  DEV: z.boolean(),
  PROD: z.boolean(),
})

export type WebEnv = z.infer<typeof webEnvSchema>

export function parseWebEnv(env: unknown): WebEnv {
  return webEnvSchema.parse(env)
}

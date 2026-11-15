import { z } from "zod"

/** `GET /api/health`: the API is up and answering. */
export const healthResponseSchema = z.object({
  status: z.literal("ok"),
})

export type HealthResponse = z.infer<typeof healthResponseSchema>

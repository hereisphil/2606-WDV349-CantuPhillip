import { z } from "zod"

/** Longest id the API accepts. Seeded ids are under 30 characters. */
export const MAX_ID_LENGTH = 64

/** A course, card or mnemonic id: never empty, and never unbounded. */
export const idSchema = z.string().min(1).max(MAX_ID_LENGTH)

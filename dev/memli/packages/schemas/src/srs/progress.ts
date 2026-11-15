import { z } from "zod"

/** A UTC ISO 8601 timestamp, as `Date.prototype.toISOString` writes it. */
const utcTimestamp = z.iso.datetime()

export const progressStateSchema = z.enum([
  "new",
  "learning",
  "review",
  "relearning",
])

/**
 * One learner's memory of one card: the FSRS-7 state `@workspace/core`
 * schedules with. It must stay the same shape as core's `CardProgress`;
 * a type test in apps/api fails if the two drift apart.
 *
 * All eleven fields are needed to schedule the next review. Dropping one
 * (FSRS-7's `stabilityFast`, say) silently changes every future interval.
 */
export const cardProgressSchema = z.object({
  cardId: z.string().min(1),
  state: progressStateSchema,
  /** When the card should next be reviewed. */
  due: utcTimestamp,
  /** `null` until the first review. */
  lastReview: utcTimestamp.nullable(),
  /** Days until recall probability falls to 90%. */
  stability: z.number().nonnegative(),
  /** FSRS-7's short-term stability, which tracks same-day reviews. */
  stabilityFast: z.number().nonnegative(),
  /** 1 (easy) to 10 (hard); 0 before the first review. */
  difficulty: z.number().min(0).max(10),
  reps: z.int().nonnegative(),
  /** Times the card was forgotten after it had been learned. */
  lapses: z.int().nonnegative(),
  /** Position in the learning or relearning steps. */
  learningStep: z.int().nonnegative(),
  /** Days between `lastReview` and `due`. Fractional under FSRS-7. */
  scheduledDays: z.number().nonnegative(),
})

export type CardProgressData = z.infer<typeof cardProgressSchema>

import {
  DEFAULT_MAXIMUM_INTERVAL,
  dateChrono,
  defaultLearningSteps,
  defaultRelearningSteps,
  defineScheduler,
  schedulerDesiredRetentionMiddleware,
  schedulerFuzzingMiddleware,
  schedulerLearningStepsMiddleware,
  schedulerMaximumIntervalMiddleware,
  schedulerMonotonicIntervalMiddleware,
  schedulerScheduledDaysMiddleware,
  schedulerStatsMiddleware,
} from "ts-fsrs"
import { FSRS7_DEFAULT_WEIGHTS, FSRS7Model } from "ts-fsrs/models/fsrs-7"

/** Target chance of remembering a card when it comes due. Higher means more reviews. */
const DESIRED_RETENTION = 0.9

/**
 * Memli's FSRS-7 scheduler: `DefaultScheduler({ enableFuzz: true })` built
 * synchronously so a reducer never awaits. scheduler.test.ts checks they match.
 */
export const scheduler = defineScheduler({
  model: FSRS7Model,
  chrono: dateChrono,
})
  .use(
    schedulerDesiredRetentionMiddleware,
    schedulerFuzzingMiddleware,
    schedulerStatsMiddleware,
    schedulerScheduledDaysMiddleware,
    schedulerLearningStepsMiddleware,
    schedulerMaximumIntervalMiddleware,
    schedulerMonotonicIntervalMiddleware
  )
  .create({
    config: {
      // FSRS-7 tracks memory in fractions of a day, so same-day reviews count.
      fractionalDays: true,
      weights: FSRS7_DEFAULT_WEIGHTS,
      enableShortTerm: true,
      desiredRetention: DESIRED_RETENTION,
      learningSteps: [...defaultLearningSteps],
      relearningSteps: [...defaultRelearningSteps],
      // FSRS-7 may skip a fixed learning step when memory is already strong.
      allowModelOverride: true,
      // Shifts intervals of 2.5+ days so cards learned together spread out.
      // Seeded by card ID and review count, so it stays deterministic.
      enableFuzz: true,
      maximumInterval: DEFAULT_MAXIMUM_INTERVAL,
    },
  })

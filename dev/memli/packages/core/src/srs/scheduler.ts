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
 * Memli's FSRS-7 scheduler, the only place `ts-fsrs` is configured.
 *
 * It matches what ts-fsrs's `DefaultScheduler()` builds for FSRS-7 (same
 * model, default weights, middleware and settings; `scheduler.test.ts`
 * checks this). `DefaultScheduler()` is async only because it lazy-loads the
 * model. A study-session reducer has to grade a card without awaiting, so this
 * imports the model directly and builds the scheduler once, synchronously.
 *
 * Fuzz stays off, so the same review always produces the same schedule.
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
      enableFuzz: false,
      maximumInterval: DEFAULT_MAXIMUM_INTERVAL,
    },
  })

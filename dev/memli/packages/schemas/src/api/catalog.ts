import { z } from "zod"

import { cardSchema } from "../content/card"
import { courseSchema } from "../content/course"
import { idSchema } from "../content/id"

/** How many words `GET /api/catalog/:courseId` shows as a sample. */
export const SAMPLE_WORD_COUNT = 5

/**
 * A published course as the catalog lists it (#174). Drafts never appear,
 * so every course here has a description.
 */
export const catalogCourseSchema = courseSchema.extend({
  /** A sentence or two, in the course's `answerLanguage`. */
  description: z.string().min(1),
  wordCount: z.int().nonnegative(),
  /** Whether the course is on the viewer's dashboard. */
  added: z.boolean(),
})

export type CatalogCourse = z.infer<typeof catalogCourseSchema>

/** `GET /api/catalog`: every published course, by title. */
export const catalogResponseSchema = z.object({
  courses: z.array(catalogCourseSchema),
})

export type CatalogResponse = z.infer<typeof catalogResponseSchema>

/** The path params of `GET /api/catalog/:courseId`. */
export const catalogParamsSchema = z.object({
  courseId: idSchema,
})

export type CatalogParams = z.infer<typeof catalogParamsSchema>

/** A word as the overview previews it: the word and its meanings, no story. */
export const sampleWordSchema = cardSchema.pick({
  cardId: true,
  term: true,
  partOfSpeech: true,
  gender: true,
  answers: true,
  phonetic: true,
})

export type SampleWord = z.infer<typeof sampleWordSchema>

/**
 * `GET /api/catalog/:courseId`: one published course's overview, with where
 * its words came from and the first few of them.
 */
export const catalogCourseDetailSchema = catalogCourseSchema.extend({
  /** UTC ISO 8601: when the catalog started listing it. */
  publishedAt: z.iso.datetime(),
  /** Who wrote the words, or the dataset they came from. */
  source: z.string().min(1),
  /** As learners see it: `CC BY-SA 4.0`, `All rights reserved`. */
  license: z.string().min(1),
  /** The credit line the license asks for, or `null` when it asks for none. */
  attribution: z.string().min(1).nullable(),
  /** The course's first words, in the order a learner meets them. */
  sampleWords: z.array(sampleWordSchema).max(SAMPLE_WORD_COUNT),
})

export type CatalogCourseDetail = z.infer<typeof catalogCourseDetailSchema>

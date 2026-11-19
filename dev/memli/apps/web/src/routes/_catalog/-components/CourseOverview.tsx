import type { JSX, ReactNode } from "react"
import { Link } from "@tanstack/react-router"
import { Check, ChevronLeft } from "lucide-react"
import type { CatalogCourseDetail } from "@workspace/schemas/api/catalog"
import { Heading } from "@workspace/ui/components/heading"
import { Text } from "@workspace/ui/components/text"
import { useFormatters } from "@/lib/formatters"
import { LanguageBadge } from "@/routes/_app/-components/LanguageBadge"

const messages = {
  back: "All courses",
  words: {
    one: "{count} word",
    other: "{count} words",
  },
  added: "Added",
  addedLabel: "On your dashboard",
  sampleHeading: "First words",
  sampleIntro: "You'll meet these first.",
  aboutHeading: "About this course",
  source: "Source",
  license: "License",
  credit: "Credit",
} as const

/** Back to the catalog: shown on the overview and on its not-found state. */
export function BackToCourses(): JSX.Element {
  return (
    <Link
      to="/courses"
      className="inline-flex min-h-11 items-center gap-1 self-start text-base font-semibold text-link"
    >
      <ChevronLeft aria-hidden="true" className="size-5" />
      {messages.back}
    </Link>
  )
}

/**
 * One course's page (#174): what it teaches, its first words and where they
 * came from. `actions` is the buttons, which depend on who is looking.
 */
export function CourseOverview({
  course,
  actions,
}: {
  course: CatalogCourseDetail
  actions: ReactNode
}): JSX.Element {
  const { plural } = useFormatters()

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <BackToCourses />
        <div className="flex items-start gap-4">
          <LanguageBadge tag={course.learningLanguage} size="lg" />
          <div className="flex min-w-0 flex-col gap-2">
            <Heading level={1} size="2" className="text-pretty wrap-break-word">
              {course.title}
            </Heading>
            <Text variant="lead" className="text-pretty wrap-break-word">
              {course.description}
            </Text>
            <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-base text-foreground tabular-nums">
              <span>{plural(course.wordCount, messages.words)}</span>
              {course.added ? (
                <span
                  title={messages.addedLabel}
                  className="inline-flex items-center gap-1.5 font-semibold"
                >
                  <Check aria-hidden="true" className="size-4 text-success" />
                  {messages.added}
                </span>
              ) : null}
            </p>
          </div>
        </div>
      </div>

      {actions}

      {course.sampleWords.length === 0 ? null : (
        <section
          aria-labelledby="sample-heading"
          className="flex flex-col gap-3"
        >
          <div className="flex flex-col gap-1">
            <Heading id="sample-heading" level={2} size="3">
              {messages.sampleHeading}
            </Heading>
            <Text variant="muted">{messages.sampleIntro}</Text>
          </div>
          <ul className="divide-y rounded-xl border bg-card shadow-xs dark:shadow-none">
            {course.sampleWords.map((word) => (
              <li
                key={word.cardId}
                className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 px-4 py-3"
              >
                <span className="flex min-w-0 flex-col">
                  <span
                    lang={course.learningLanguage}
                    className="text-lg font-semibold wrap-break-word text-foreground-strong"
                  >
                    {word.term}
                  </span>
                  <span
                    translate="no"
                    className="text-base wrap-break-word text-muted-foreground"
                  >
                    {word.phonetic}
                  </span>
                </span>
                <span
                  lang={course.answerLanguage}
                  className="text-base wrap-break-word text-foreground"
                >
                  {word.answers[0]}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section aria-labelledby="about-heading" className="flex flex-col gap-3">
        <Heading id="about-heading" level={2} size="3">
          {messages.aboutHeading}
        </Heading>
        <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-6 gap-y-2 text-base">
          <dt className="font-semibold text-foreground">{messages.source}</dt>
          <dd className="wrap-break-word text-foreground">{course.source}</dd>
          <dt className="font-semibold text-foreground">{messages.license}</dt>
          <dd className="wrap-break-word text-foreground">{course.license}</dd>
          {course.attribution === null ? null : (
            <>
              <dt className="font-semibold text-foreground">
                {messages.credit}
              </dt>
              <dd className="wrap-break-word text-foreground">
                {course.attribution}
              </dd>
            </>
          )}
        </dl>
      </section>
    </div>
  )
}

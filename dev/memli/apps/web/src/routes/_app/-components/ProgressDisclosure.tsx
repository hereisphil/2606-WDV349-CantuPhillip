import { useId, type JSX } from "react"
import { ChevronDown } from "lucide-react"
import { useFormatters } from "@/lib/formatters"
import type { DashboardDeck, ProgressTrendsData } from "./dashboard-metrics"

const messages = {
  heading: "Your progress",
  learned: {
    one: "{count} word learned so far",
    other: "{count} words learned so far",
  },
  remembered: "You remembered {percent} of your reviews.",
  newThisMonth: {
    one: "{count} new word this month",
    other: "{count} new words this month",
  },
  tableCaption: "Words in each course",
  course: "Course",
  learnedColumn: "Learned",
  learning: "Still learning",
  notStarted: "Not started",
} as const

const cellClass = "px-2 py-2.5 text-end tabular-nums sm:px-3"

/**
 * Reference numbers, closed by default. Plain sentences and one table; no
 * comparisons with other learners.
 */
export function ProgressDisclosure({
  retentionPercent,
  newCardsThisMonth,
  wordsLearned,
  courses,
}: Pick<ProgressTrendsData, "retentionPercent" | "newCardsThisMonth"> & {
  wordsLearned: number
  courses: readonly DashboardDeck[]
}): JSX.Element {
  const { number, percent, plural, format } = useFormatters()
  const captionId = useId()

  return (
    <section aria-labelledby="progress-heading" className="flex flex-col">
      {/* The heading stays outside <summary>: a heading inside one loses its role in some screen readers. */}
      <h2 id="progress-heading" className="sr-only">
        {messages.heading}
      </h2>
      <details className="group">
        <summary className="flex min-h-11 w-fit cursor-pointer list-none items-center gap-2 rounded-lg pe-2 font-heading text-xl font-semibold text-foreground-strong [&::-webkit-details-marker]:hidden">
          <ChevronDown
            aria-hidden="true"
            className="size-5 -rotate-90 transition-transform group-open:rotate-0 motion-reduce:transition-none"
          />
          {messages.heading}
        </summary>
        <div className="flex flex-col gap-6 pt-4">
          <ul className="flex flex-col gap-1 text-base text-foreground">
            <li>{plural(wordsLearned, messages.learned)}</li>
            <li>
              {format(messages.remembered, {
                percent: percent(retentionPercent / 100),
              })}
            </li>
            <li>{plural(newCardsThisMonth, messages.newThisMonth)}</li>
          </ul>
          {/* Data tables may scroll sideways on a narrow screen (WCAG 1.4.10); the page itself never does.
              The box is focusable so keyboard users can scroll it. */}
          <div
            role="region"
            aria-labelledby={captionId}
            // eslint-disable-next-line jsx-a11y-x/no-noninteractive-tabindex -- a scrollable region must take focus so keyboard users can scroll it (axe scrollable-region-focusable)
            tabIndex={0}
            className="max-w-3xl overflow-x-auto rounded-xl"
          >
            <table className="w-full border-collapse bg-card text-base">
              <caption
                id={captionId}
                className="pb-2 text-start font-semibold text-foreground-strong"
              >
                {messages.tableCaption}
              </caption>
              <thead>
                <tr className="border-b border-border-strong text-sm font-semibold text-foreground">
                  <th scope="col" className="px-2 py-2.5 text-start sm:px-3">
                    {messages.course}
                  </th>
                  <th scope="col" className={cellClass}>
                    {messages.learnedColumn}
                  </th>
                  <th scope="col" className={cellClass}>
                    {messages.learning}
                  </th>
                  <th scope="col" className={cellClass}>
                    {messages.notStarted}
                  </th>
                </tr>
              </thead>
              <tbody>
                {courses.map((course) => (
                  <tr
                    key={course.courseId}
                    className="border-b border-border last:border-b-0"
                  >
                    <th
                      scope="row"
                      className="min-w-28 px-2 py-2.5 text-start font-medium wrap-break-word text-foreground-strong sm:px-3"
                    >
                      {course.title}
                    </th>
                    <td className={cellClass}>
                      {number(course.masteredCount)}
                    </td>
                    <td className={cellClass}>
                      {number(course.learningCount)}
                    </td>
                    <td className={cellClass}>{number(course.unseenCount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </details>
    </section>
  )
}

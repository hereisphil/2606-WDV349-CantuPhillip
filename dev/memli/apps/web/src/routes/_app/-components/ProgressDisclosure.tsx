import { useId, type JSX } from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@workspace/ui/lib/utils"
import { useFormatters } from "@/lib/formatters"
import type { DashboardDeck, ProgressTrendsData } from "./dashboard-metrics"

const messages = {
  heading: "Your progress",
  // Label and value pairs, not sentences: each number is read with its label.
  stats: {
    learned: "Words learned",
    remembered: "Reviews remembered",
    newThisMonth: "New words this month",
  },
  tableCaption: "Words in each course",
  course: "Course",
  learnedColumn: "Learned",
  learning: "Still learning",
  notStarted: "Not started",
} as const

// Same surface as the course list, so the page has one kind of card.
const cardClass = "rounded-xl border bg-card shadow-xs dark:shadow-none"
// 16 px at the card's edges, like the stats above. Each number column only
// pads its start side: a phone keeps 10 px between columns so the table fits a
// 360 px screen, and course names get the rest.
const courseCellClass = "py-3 ps-4 pe-0"
const numberCellPadding = "py-3 ps-2.5 pe-0 last:pe-4 @[34rem]:ps-4"
// Numbers and their headings share the end edge, so every column lines up.
const numberCellClass = cn(numberCellPadding, "text-end align-top tabular-nums")
const numberHeadClass = cn(
  numberCellPadding,
  "text-end align-bottom @[34rem]:w-32"
)

/** One number with its label: a row on a phone, a tile from a 544 px card. */
function Stat({ label, value }: { label: string; value: string }): JSX.Element {
  return (
    <div className="flex items-baseline justify-between gap-4 px-4 py-3 @[34rem]:flex-col-reverse @[34rem]:items-start @[34rem]:justify-end @[34rem]:gap-1 @[34rem]:px-5 @[34rem]:py-4">
      <dt className="min-w-0 text-base text-pretty text-foreground">{label}</dt>
      <dd className="shrink-0 font-heading text-2xl leading-none font-bold text-foreground-strong tabular-nums @[34rem]:text-3xl @[34rem]:leading-none">
        {value}
      </dd>
    </div>
  )
}

/**
 * Reference numbers, closed by default: three numbers with their labels and
 * one table per course. No comparisons with other learners.
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
  const { number, percent } = useFormatters()
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
        <div className="@container flex flex-col gap-4 pt-3">
          <dl
            className={cn(
              cardClass,
              "grid divide-y @[34rem]:grid-cols-3 @[34rem]:divide-x @[34rem]:divide-y-0"
            )}
          >
            <Stat label={messages.stats.learned} value={number(wordsLearned)} />
            <Stat
              label={messages.stats.remembered}
              value={percent(retentionPercent / 100)}
            />
            <Stat
              label={messages.stats.newThisMonth}
              value={number(newCardsThisMonth)}
            />
          </dl>
          {/* Data tables may scroll sideways on a narrow screen (WCAG 1.4.10); the page itself never does.
              The box is focusable so keyboard users can scroll it. */}
          <div
            role="region"
            aria-labelledby={captionId}
            // eslint-disable-next-line jsx-a11y-x/no-noninteractive-tabindex -- a scrollable region must take focus so keyboard users can scroll it (axe scrollable-region-focusable)
            tabIndex={0}
            className={cn(cardClass, "overflow-x-auto")}
          >
            <table className="w-full border-collapse text-base text-foreground">
              <caption
                id={captionId}
                className="px-4 pt-4 pb-1 text-start font-heading font-semibold text-foreground-strong"
              >
                {messages.tableCaption}
              </caption>
              <thead>
                <tr className="border-b border-border-strong text-sm font-semibold">
                  <th
                    scope="col"
                    className={cn(courseCellClass, "text-start align-bottom")}
                  >
                    {messages.course}
                  </th>
                  <th scope="col" className={numberHeadClass}>
                    {messages.learnedColumn}
                  </th>
                  <th scope="col" className={numberHeadClass}>
                    {messages.learning}
                  </th>
                  <th scope="col" className={numberHeadClass}>
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
                      className={cn(
                        courseCellClass,
                        "min-w-28 text-start align-top font-semibold wrap-anywhere text-foreground-strong"
                      )}
                    >
                      {course.title}
                    </th>
                    <td className={numberCellClass}>
                      {number(course.masteredCount)}
                    </td>
                    <td className={numberCellClass}>
                      {number(course.learningCount)}
                    </td>
                    <td className={numberCellClass}>
                      {number(course.unseenCount)}
                    </td>
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

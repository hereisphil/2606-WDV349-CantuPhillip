import type { JSX } from "react"
import { Check } from "lucide-react"
import type { CatalogCourse } from "@workspace/schemas/api/catalog"
import { useFormatters } from "@/lib/formatters"
import { LanguageBadge } from "@/routes/_app/-components/LanguageBadge"

const messages = {
  words: {
    one: "{count} word",
    other: "{count} words",
  },
  added: "Added",
  addedLabel: "On your dashboard",
} as const

function CatalogRow({ course }: { course: CatalogCourse }): JSX.Element {
  const { plural } = useFormatters()

  return (
    <li className="flex items-start gap-3 px-4 py-4">
      <LanguageBadge tag={course.learningLanguage} />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        {/* Plain text, not a heading: the list groups the rows (as on the dashboard). */}
        <p className="text-base font-semibold text-pretty wrap-break-word text-foreground-strong">
          {course.title}
        </p>
        <p className="text-base text-pretty wrap-break-word text-muted-foreground">
          {course.description}
        </p>
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
    </li>
  )
}

/** The published courses, one row each. "Added" shows only to a signed-in learner. */
export function CatalogList({
  courses,
}: {
  courses: readonly CatalogCourse[]
}): JSX.Element {
  return (
    <ul className="divide-y rounded-xl border bg-card shadow-xs dark:shadow-none">
      {courses.map((course) => (
        <CatalogRow key={course.courseId} course={course} />
      ))}
    </ul>
  )
}

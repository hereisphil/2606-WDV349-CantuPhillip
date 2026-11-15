import { useId, useState, type JSX, type ReactNode } from "react"
import { Link } from "@tanstack/react-router"
import { Check, ChevronDown } from "lucide-react"
import { Button, buttonVariants } from "@workspace/ui/components/button"
import { Heading } from "@workspace/ui/components/heading"
import { cn } from "@workspace/ui/lib/utils"
import { useFormatters } from "@/lib/formatters"
import type { DashboardCourse } from "./dashboard-metrics"
import { courseAction, type CourseAction } from "./dashboard-model"
import { LanguageBadge } from "./LanguageBadge"

const messages = {
  heading: "Your other courses",
  toReview: {
    one: "{count} word to review",
    other: "{count} words to review",
  },
  newWords: {
    one: "{count} new word",
    other: "{count} new words",
  },
  allDone: "All done",
  // Verbs: the action, not a noun.
  review: "Review",
  reviewLabel: {
    one: "Review {count} word in {course}",
    other: "Review {count} words in {course}",
  },
  learn: "Learn",
  learnLabel: {
    one: "Learn {count} new word in {course}",
    other: "Learn {count} new words in {course}",
  },
  showAll: {
    one: "Show all {count} course",
    other: "Show all {count} courses",
  },
  showFewer: "Show fewer courses",
  findAnother: "Find another course",
} as const

/** Rows shown before "Show all". */
const VISIBLE_ROWS = 5

const actionMessages = {
  review: { text: messages.review, label: messages.reviewLabel },
  learn: { text: messages.learn, label: messages.learnLabel },
} as const

function RowStatus({ action }: { action: CourseAction | null }): JSX.Element {
  const { plural } = useFormatters()

  if (action === null) {
    return (
      <p className="flex items-center gap-1.5 text-base font-semibold text-foreground">
        <Check aria-hidden="true" className="size-4 text-success" />
        {messages.allDone}
      </p>
    )
  }

  return (
    <p className="text-base text-foreground tabular-nums">
      {plural(
        action.count,
        action.mode === "review" ? messages.toReview : messages.newWords
      )}
    </p>
  )
}

function CourseRow({ course }: { course: DashboardCourse }): JSX.Element {
  const { plural } = useFormatters()
  const action = courseAction(course)

  return (
    // Wraps when a long translated button and the title cannot share a line: the button moves under it.
    <li className="flex flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3">
      <LanguageBadge tag={course.learningLanguage} />
      <div className="flex min-w-0 flex-1 basis-40 flex-col gap-0.5">
        {/* Plain text, not a heading: the list already groups the rows, and the page keeps six headings or fewer. */}
        <p className="text-base font-semibold text-pretty wrap-break-word text-foreground-strong">
          {course.title}
        </p>
        <RowStatus action={action} />
      </div>
      {/* The count stays in the status line so every row reads the same way; the button's name repeats it. */}
      {action === null ? null : (
        <Link
          to="/study/$courseId"
          params={{ courseId: action.courseId }}
          search={{ mode: action.mode }}
          aria-label={plural(action.count, actionMessages[action.mode].label, {
            course: course.title,
          })}
          className={cn(
            buttonVariants({ variant: "outline", size: "touch" }),
            "ms-auto"
          )}
        >
          {actionMessages[action.mode].text}
        </Link>
      )}
    </li>
  )
}

/**
 * The learner's courses other than the hero's, most in need first. The
 * Studying menu (`filter`) sits in the header and narrows only this list.
 */
export function CourseList({
  courses,
  filter,
  showFindAnother,
  className,
}: {
  courses: readonly DashboardCourse[]
  filter: ReactNode
  /** With no other courses, a dashed row offers to find one, unless the hero already does. */
  showFindAnother: boolean
  /** Grid placement from the page. */
  className?: string | undefined
}): JSX.Element | null {
  const { plural } = useFormatters()
  const [expanded, setExpanded] = useState(false)
  const listId = useId()

  if (courses.length === 0 && !showFindAnother) {
    return null
  }

  const hidden = courses.length - VISIBLE_ROWS
  const shown = expanded ? courses : courses.slice(0, VISIBLE_ROWS)

  return (
    <section
      aria-labelledby="courses-heading"
      className={cn("flex flex-col gap-4", className)}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Heading id="courses-heading" level={2} size="3">
          {messages.heading}
        </Heading>
        {filter}
      </div>
      {courses.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-border-strong p-4">
          <Link
            to="/community"
            className="inline-flex min-h-11 items-center text-base font-semibold text-link underline underline-offset-4"
          >
            {messages.findAnother}
          </Link>
        </div>
      ) : (
        <ul
          id={listId}
          className="divide-y rounded-xl border bg-card shadow-xs dark:shadow-none"
        >
          {shown.map((course) => (
            <CourseRow key={course.courseId} course={course} />
          ))}
        </ul>
      )}
      {hidden > 0 ? (
        <Button
          variant="ghost"
          size="touch"
          aria-expanded={expanded}
          aria-controls={listId}
          onClick={() => {
            setExpanded((open) => !open)
          }}
          className="self-start"
        >
          {expanded
            ? messages.showFewer
            : plural(courses.length, messages.showAll)}
          <ChevronDown
            aria-hidden="true"
            className={cn(
              "transition-transform motion-reduce:transition-none",
              expanded && "rotate-180"
            )}
          />
        </Button>
      ) : null}
    </section>
  )
}

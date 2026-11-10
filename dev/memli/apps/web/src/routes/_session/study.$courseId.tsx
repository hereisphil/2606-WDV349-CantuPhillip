import type { JSX } from "react"
import { Link, createFileRoute, notFound } from "@tanstack/react-router"
import { Button } from "@workspace/ui/components/button"
import { Heading } from "@workspace/ui/components/heading"
import { Text } from "@workspace/ui/components/text"
import {
  findCourse,
  sessionQueueSize,
  type StudyMode,
} from "./-components/session-model"
import { SessionHeader } from "./-components/SessionHeader"

type StudySearch = {
  mode: StudyMode
  /** New cards to add past today's limit. Only meaningful with `mode: "learn"`. */
  extra?: number | undefined
}

const messages = {
  mode: {
    review: "Review",
    learn: "Learn new words",
    practice: "Practice tricky words",
  },
  cardPlaceholder: "Your cards appear here with #49.",
  empty: {
    heading: "Nothing to study here right now",
    body: "This deck has no cards waiting for this kind of session. Pick another from your dashboard.",
  },
  notFound: {
    heading: "We couldn't find that deck",
    body: "It may have been removed, or the link is out of date.",
  },
  back: "Back to dashboard",
} as const

function parseMode(value: unknown): StudyMode {
  return value === "learn" || value === "practice" ? value : "review"
}

function parseExtra(value: unknown): number | undefined {
  return typeof value === "number" && Number.isInteger(value) && value > 0
    ? value
    : undefined
}

export const Route = createFileRoute("/_session/study/$courseId")({
  // `extra` is always set, even to undefined, because the router merges raw params into this result.
  validateSearch: (search: Record<string, unknown>): StudySearch => {
    const mode = parseMode(search.mode)
    return {
      mode,
      extra: mode === "learn" ? parseExtra(search.extra) : undefined,
    }
  },
  loader: ({ params }) => {
    const course = findCourse(params.courseId)
    if (course === null) {
      throw notFound()
    }
    return course
  },
  component: StudySession,
  notFoundComponent: CourseNotFound,
})

function StudySession(): JSX.Element {
  const course = Route.useLoaderData()
  const { mode, extra } = Route.useSearch()
  const total = sessionQueueSize(course, mode, extra)

  return (
    <>
      <SessionHeader title={course.title} total={total} completed={0} />
      <main className="flex flex-1 justify-center px-4 py-10 sm:px-6 sm:py-16">
        <div className="flex w-full max-w-xl flex-col gap-6">
          {total > 0 ? (
            <section
              aria-labelledby="session-mode"
              className="flex min-h-64 flex-col items-center justify-center gap-3 rounded-xl border border-border bg-card p-8 text-center"
            >
              <p
                id="session-mode"
                className="text-xs font-medium tracking-widest text-muted-foreground uppercase"
              >
                {messages.mode[mode]}
              </p>
              <Text variant="muted">{messages.cardPlaceholder}</Text>
            </section>
          ) : (
            <EmptyState
              heading={messages.empty.heading}
              body={messages.empty.body}
            />
          )}
        </div>
      </main>
    </>
  )
}

function EmptyState({
  heading,
  body,
}: {
  heading: string
  body: string
}): JSX.Element {
  return (
    <div className="flex flex-col items-center gap-4 rounded-xl border border-border bg-card p-8 text-center">
      <Heading level={2} size="3">
        {heading}
      </Heading>
      <Text variant="muted">{body}</Text>
      <Button render={<Link to="/dashboard" />} nativeButton={false}>
        {messages.back}
      </Button>
    </div>
  )
}

function CourseNotFound(): JSX.Element {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-16 sm:px-6">
      <div className="w-full max-w-xl">
        <EmptyState
          heading={messages.notFound.heading}
          body={messages.notFound.body}
        />
      </div>
    </main>
  )
}

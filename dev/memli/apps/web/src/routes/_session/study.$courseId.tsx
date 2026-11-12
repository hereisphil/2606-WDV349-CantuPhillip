import type { JSX } from "react"
import { Link, createFileRoute, notFound } from "@tanstack/react-router"
import { Button } from "@workspace/ui/components/button"
import { Heading } from "@workspace/ui/components/heading"
import { Text } from "@workspace/ui/components/text"
import { CardPrompt } from "./-components/CardPrompt"
import {
  findCourse,
  sessionQueueSize,
  type StudyMode,
} from "./-components/session-model"
import { SessionHeader } from "./-components/SessionHeader"
import { findDeckCards } from "./-components/study-cards"
import {
  isStudyPreviewName,
  studyPreviews,
  type SessionView,
  type StudyPreviewName,
} from "./-components/study-previews"
import { StudyPreviewSwitcher } from "./-components/StudyPreviewSwitcher"

type StudySearch = {
  mode: StudyMode
  /** New cards to add past today's limit. Only meaningful with `mode: "learn"`. */
  extra?: number | undefined
  /** Development-only seeded session state. */
  preview?: StudyPreviewName | undefined
}

const messages = {
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
  // Every key is always set, even to undefined, because the router merges raw params into this result.
  // `import.meta.env.DEV` guards keep the preview snapshots out of production bundles.
  validateSearch: (search: Record<string, unknown>): StudySearch => {
    const mode = parseMode(search.mode)
    return {
      mode,
      extra: mode === "learn" ? parseExtra(search.extra) : undefined,
      preview:
        import.meta.env.DEV && isStudyPreviewName(search.preview)
          ? search.preview
          : undefined,
    }
  },
  loader: ({ params }) => {
    const course = findCourse(params.courseId)
    const deckCards = findDeckCards(params.courseId)
    if (course === null || deckCards === null) {
      throw notFound()
    }
    return { course, deckCards }
  },
  component: StudySession,
  notFoundComponent: CourseNotFound,
})

function StudySession(): JSX.Element {
  const { course, deckCards } = Route.useLoaderData()
  const { mode, extra, preview } = Route.useSearch()
  // `completed` stays 0, and the first card stays on screen, until #49's session reducer supplies them.
  const seeded: SessionView = {
    title: course.title,
    total: sessionQueueSize(course, mode, extra),
    completed: 0,
  }
  const { title, total, completed } =
    import.meta.env.DEV && preview !== undefined
      ? studyPreviews[preview](seeded)
      : seeded

  return (
    <>
      <SessionHeader title={title} total={total} completed={completed} />
      <main className="flex flex-1 justify-center px-4 py-10 sm:px-6 sm:py-16">
        <div className="flex w-full max-w-xl flex-col gap-6">
          {import.meta.env.DEV && preview !== undefined ? (
            <StudyPreviewSwitcher
              courseId={course.courseId}
              current={preview}
            />
          ) : null}
          {total > 0 ? (
            <CardPrompt
              card={deckCards.cards[0]}
              mode={mode}
              learningLanguage={course.learningLanguage}
              answerLanguage={deckCards.answerLanguage}
            />
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

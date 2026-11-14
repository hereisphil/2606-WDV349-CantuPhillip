import { useCallback, useReducer, type JSX } from "react"
import { Link, createFileRoute, notFound } from "@tanstack/react-router"
import {
  sessionReducer,
  startSession,
  type SessionState,
} from "@workspace/core/study/session-reducer"
import { Button } from "@workspace/ui/components/button"
import { Heading } from "@workspace/ui/components/heading"
import { Text } from "@workspace/ui/components/text"
import type { DashboardDeck } from "../_app/-components/dashboard-metrics"
import { AnswerBreakdown } from "./-components/AnswerBreakdown"
import { CardPrompt } from "./-components/CardPrompt"
import { MnemonicSlot } from "./-components/MnemonicSlot"
import { OutcomeDockSlot } from "./-components/OutcomeDockSlot"
import { AnswerVerdict } from "./-components/AnswerVerdict"
import { PromptActions } from "./-components/PromptActions"
import {
  findCourse,
  sessionQueueSize,
  type StudyMode,
} from "./-components/session-model"
import { SessionHeader } from "./-components/SessionHeader"
import {
  findDeckCards,
  withNewProgress,
  type DeckCards,
  type SessionStudyCard,
} from "./-components/study-cards"
import {
  isStudyPreviewName,
  studyPreviews,
  type SessionView,
  type StudyPreview,
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
  complete: {
    heading: "Session complete",
    body: "You've been through every card in this session.",
  },
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

  return (
    // Keyed so switching deck, session kind or preview starts a fresh session instead of keeping the old reducer state.
    <SessionWorkspace
      key={`${course.courseId}:${mode}:${String(extra)}:${preview ?? ""}`}
      course={course}
      deckCards={deckCards}
      mode={mode}
      queueSize={sessionQueueSize(course, mode, extra)}
      preview={preview}
    />
  )
}

type SessionWorkspaceProps = {
  course: DashboardDeck
  deckCards: DeckCards
  mode: StudyMode
  /** Cards this kind of session should hold, from the deck's counts. */
  queueSize: number
  preview: StudyPreviewName | undefined
}

/** The development preview in use, if any. */
function previewOf(
  name: StudyPreviewName | undefined
): StudyPreview | undefined {
  return import.meta.env.DEV && name !== undefined
    ? studyPreviews[name]
    : undefined
}

/**
 * The first session state: the seeded cards, capped at what the deck has
 * waiting. A preview may swap the cards and replay events through the reducer.
 */
function initialSession({
  deckCards,
  queueSize,
  preview,
}: Pick<
  SessionWorkspaceProps,
  "deckCards" | "queueSize" | "preview"
>): SessionState<SessionStudyCard> {
  const seeded = previewOf(preview)
  const cards =
    seeded?.cards?.(deckCards.cards) ?? deckCards.cards.slice(0, queueSize)
  const events = seeded?.events?.(cards) ?? []
  return events.reduce(
    sessionReducer<SessionStudyCard>,
    startSession(withNewProgress(cards, new Date()))
  )
}

function SessionWorkspace({
  course,
  deckCards,
  mode,
  queueSize,
  preview,
}: SessionWorkspaceProps): JSX.Element {
  // The study-session state machine from @workspace/core: prompt → answered → … → complete.
  const [session, dispatch] = useReducer(
    sessionReducer<SessionStudyCard>,
    { deckCards, queueSize, preview },
    initialSession
  )
  const seeded = previewOf(preview)
  const learningLanguage =
    seeded?.languages?.learning ?? course.learningLanguage
  const answerLanguage = seeded?.languages?.answer ?? deckCards.answerLanguage

  // Stable, so the reveal shortcut's key listener isn't re-added on every render.
  const onReveal = useCallback((elapsedMs: number | null) => {
    dispatch({ type: "REVEAL", elapsedMs })
  }, [])

  // Derive, don't store (docs/state-management.md).
  const queued = session.status === "complete" ? 0 : session.queue.length
  const derived: SessionView = {
    title: course.title,
    total: session.finished.length + queued,
    completed: session.finished.length,
  }
  const { title, total, completed } = seeded?.view?.(derived) ?? derived

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
          {total === 0 ? (
            <EmptyState
              heading={messages.empty.heading}
              body={messages.empty.body}
            />
          ) : session.status === "complete" ? (
            // Placeholder until the session summary (`07 - Study session final page.png`) is built.
            <EmptyState
              heading={messages.complete.heading}
              body={messages.complete.body}
            />
          ) : (
            <>
              <CardPrompt
                card={session.queue[0]}
                mode={mode}
                learningLanguage={learningLanguage}
                answerLanguage={answerLanguage}
                revealed={session.status === "answered"}
              />
              {session.status === "answered" ? (
                <>
                  <AnswerBreakdown
                    card={session.queue[0]}
                    learningLanguage={learningLanguage}
                    answerLanguage={answerLanguage}
                    verdict={
                      session.evaluation !== null && session.answer !== null ? (
                        <AnswerVerdict
                          evaluation={session.evaluation}
                          answer={session.answer}
                          answerLanguage={answerLanguage}
                        />
                      ) : null
                    }
                  >
                    <MnemonicSlot
                      card={session.queue[0]}
                      learningLanguage={learningLanguage}
                      answerLanguage={answerLanguage}
                    />
                  </AnswerBreakdown>
                  <OutcomeDockSlot
                    evaluation={session.evaluation}
                    elapsedMs={session.elapsedMs}
                    progress={session.queue[0].progress}
                    onResolve={(outcome) => {
                      dispatch({ type: "RESOLVE", outcome, now: new Date() })
                    }}
                  />
                </>
              ) : (
                <PromptActions
                  key={session.queue[0].cardId}
                  answerLanguage={answerLanguage}
                  onSubmit={(answer, elapsedMs) => {
                    dispatch({ type: "SUBMIT", answer, elapsedMs })
                  }}
                  onReveal={onReveal}
                />
              )}
            </>
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

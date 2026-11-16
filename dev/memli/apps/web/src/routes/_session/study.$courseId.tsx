import { useCallback, useReducer, useRef, type JSX } from "react"
import { flushSync } from "react-dom"
import {
  Link,
  createFileRoute,
  notFound,
  useRouter,
  type ErrorComponentProps,
} from "@tanstack/react-router"
import type { ReviewOutcome } from "@workspace/core/srs/outcome"
import type { StudyMode } from "@workspace/core/study/course-progress"
import {
  sessionReducer,
  startSession,
  type SessionState,
} from "@workspace/core/study/session-reducer"
import type { Course } from "@workspace/schemas/content/course"
import { Button, buttonVariants } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"
import { Heading } from "@workspace/ui/components/heading"
import { Text } from "@workspace/ui/components/text"
import { ApiError } from "@/lib/api"
import { studySessionQuery } from "@/lib/queries"
import { AnswerBreakdown } from "./-components/AnswerBreakdown"
import { CardPrompt } from "./-components/CardPrompt"
import { MnemonicFrame } from "./-components/MnemonicFrame"
import { OutcomeDock } from "./-components/OutcomeDock"
import { AnswerVerdict } from "./-components/AnswerVerdict"
import { PromptActions } from "./-components/PromptActions"
import { SessionHeader } from "./-components/SessionHeader"
import { SessionSummary } from "./-components/SessionSummary"
import { useActiveTime } from "./-components/use-active-time"
import {
  withNewProgress,
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
import { useSaveReviews } from "./-components/use-save-reviews"

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
    body: "This course has no words waiting for this kind of session. Pick another from your dashboard.",
  },
  notFound: {
    heading: "We couldn't find that course",
    body: "It may have been removed, or the link is out of date.",
  },
  back: "Back to dashboard",
  loadError: {
    heading: "We couldn't load this session",
    body: "Check your connection, then try again.",
  },
  saveFailed: "Some answers didn't save yet.",
  retry: "Try again",
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
  loaderDeps: ({ search }) => ({ mode: search.mode, extra: search.extra }),
  // A session is what was waiting when it started. Never show an old one
  // again: its words may have been studied since.
  staleTime: 0,
  gcTime: 0,
  loader: async ({ context, params, deps }) => {
    try {
      return await context.queryClient.fetchQuery(
        studySessionQuery({ courseId: params.courseId, ...deps })
      )
    } catch (error) {
      if (error instanceof ApiError && error.code === "NOT_FOUND") {
        throw notFound()
      }
      throw error
    }
  },
  component: StudySession,
  notFoundComponent: CourseNotFound,
  errorComponent: SessionLoadError,
})

function StudySession(): JSX.Element {
  const { course, cards } = Route.useLoaderData()
  const { mode, extra, preview } = Route.useSearch()

  return (
    // Keyed so switching course, session kind or preview starts a fresh session instead of keeping the old reducer state.
    <SessionWorkspace
      key={`${course.courseId}:${mode}:${String(extra)}:${preview ?? ""}`}
      course={course}
      cards={cards}
      mode={mode}
      preview={preview}
    />
  )
}

type SessionWorkspaceProps = {
  course: Course
  /** The session's cards from the API, in order, each with its progress. */
  cards: readonly SessionStudyCard[]
  mode: StudyMode
  preview: StudyPreviewName | undefined
}

function previewOf(
  name: StudyPreviewName | undefined
): StudyPreview | undefined {
  return import.meta.env.DEV && name !== undefined
    ? studyPreviews[name]
    : undefined
}

/** The API's cards with their saved progress. A preview may swap in fixture cards (as new) and replay events. */
function initialSession({
  cards,
  preview,
}: Pick<
  SessionWorkspaceProps,
  "cards" | "preview"
>): SessionState<SessionStudyCard> {
  const seeded = previewOf(preview)
  const previewCards = seeded?.cards?.(cards)
  const start =
    previewCards === undefined
      ? cards
      : withNewProgress(previewCards, new Date())
  const events = seeded?.events?.(start) ?? []
  return events.reduce(sessionReducer<SessionStudyCard>, startSession(start))
}

function SessionWorkspace({
  course,
  cards,
  mode,
  preview,
}: SessionWorkspaceProps): JSX.Element {
  const [session, dispatch] = useReducer(
    sessionReducer<SessionStudyCard>,
    { cards, preview },
    initialSession
  )
  const seeded = previewOf(preview)
  // A preview's reviews are made up, so they are never saved.
  const saving = useSaveReviews(session.reviews, {
    enabled: seeded === undefined,
  })
  const learningLanguage =
    seeded?.languages?.learning ?? course.learningLanguage
  const answerLanguage = seeded?.languages?.answer ?? course.answerLanguage

  // Stable, so the reveal shortcut's key listener isn't re-added on every render.
  const onReveal = useCallback((elapsedMs: number | null) => {
    dispatch({ type: "REVEAL", elapsedMs })
  }, [])

  // Time on screen this visit. Hidden-tab time is left out.
  const activeMs = useActiveTime()
  // Active time when this round began, like a stopwatch lap, so a summary
  // after "Study these words again" counts that round only.
  const roundStartMs = useRef(0)
  const roundMs = useCallback((): number | null => {
    const now = activeMs()
    return now === null ? null : now - roundStartMs.current
  }, [activeMs])

  // The prompt card on screen, so focus can move to the next word.
  const promptRef = useRef<HTMLElement>(null)
  // Starting over hands focus to the first word, as moving on does.
  const onRestart = useCallback(() => {
    roundStartMs.current = activeMs() ?? 0
    flushSync(() => {
      dispatch({ type: "RESTART" })
    })
    promptRef.current?.focus({ preventScroll: true })
    promptRef.current?.scrollIntoView({ block: "start" })
  }, [activeMs])
  // Stable, so the dock's key listener isn't re-added on every render.
  const onResolve = useCallback((outcome: ReviewOutcome) => {
    // flushSync renders the next card now so focus can move to it. Otherwise focus
    // is lost with the dock's button and keyboard users restart from the page top.
    flushSync(() => {
      dispatch({ type: "RESOLVE", outcome, now: new Date() })
    })
    const prompt = promptRef.current
    if (prompt !== null) {
      prompt.focus({ preventScroll: true })
      prompt.scrollIntoView({ block: "start" })
    }
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
          {saving.failed ? <SaveFailedNotice onRetry={saving.retry} /> : null}
          {total === 0 ? (
            <EmptyState
              heading={messages.empty.heading}
              body={messages.empty.body}
            />
          ) : session.status === "complete" ? (
            <SessionSummary
              finished={session.finished}
              reviews={session.reviews}
              activeMs={roundMs}
              learningLanguage={learningLanguage}
              onRestart={onRestart}
            />
          ) : (
            <>
              <CardPrompt
                ref={promptRef}
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
                    <MnemonicFrame
                      card={session.queue[0]}
                      learningLanguage={learningLanguage}
                      answerLanguage={answerLanguage}
                    />
                  </AnswerBreakdown>
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
      {/* Outside <main> so it can span the bottom of the screen, as the header spans the top. */}
      {total > 0 && session.status === "answered" ? (
        <OutcomeDock
          // Keyed so a requeued word that comes straight back gets a fresh dock.
          key={session.reviews.length}
          evaluation={session.evaluation}
          elapsedMs={session.elapsedMs}
          progress={session.queue[0].progress}
          onResolve={onResolve}
        />
      ) : null}
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
      <Link to="/dashboard" className={cn(buttonVariants({ size: "touch" }))}>
        {messages.back}
      </Link>
    </div>
  )
}

/** Reviews that could not be saved after retrying. They are kept and sent again. */
function SaveFailedNotice({ onRetry }: { onRetry: () => void }): JSX.Element {
  return (
    <div
      role="alert"
      className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-4"
    >
      <Text>{messages.saveFailed}</Text>
      <Button size="touch" variant="outline" onClick={onRetry}>
        {messages.retry}
      </Button>
    </div>
  )
}

function SessionLoadError({ reset }: ErrorComponentProps): JSX.Element {
  const router = useRouter()
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-16 sm:px-6">
      <div
        role="alert"
        className="flex w-full max-w-xl flex-col items-center gap-4 rounded-xl border border-border bg-card p-8 text-center"
      >
        <Heading level={1} size="3">
          {messages.loadError.heading}
        </Heading>
        <Text variant="muted">{messages.loadError.body}</Text>
        <div className="flex flex-wrap justify-center gap-3">
          <Button
            size="touch"
            onClick={() => {
              reset()
              void router.invalidate()
            }}
          >
            {messages.retry}
          </Button>
          <Link
            to="/dashboard"
            className={cn(
              buttonVariants({ size: "touch", variant: "outline" })
            )}
          >
            {messages.back}
          </Link>
        </div>
      </div>
    </main>
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

import { useEffect, type JSX } from "react"
import { useSuspenseQuery } from "@tanstack/react-query"
import {
  createFileRoute,
  useRouter,
  type ErrorComponentProps,
} from "@tanstack/react-router"
import { Button } from "@workspace/ui/components/button"
import { Heading } from "@workspace/ui/components/heading"
import { Section } from "@workspace/ui/components/section"
import { Spinner } from "@workspace/ui/components/spinner"
import { Text } from "@workspace/ui/components/text"
import { useViewer } from "@/components/session-provider"
import { coursesQuery, historyQuery } from "@/lib/queries"
import {
  metricsFromApi,
  type DashboardMetrics,
} from "./-components/dashboard-metrics"
import {
  learningLanguages,
  selectFocusCourse,
  sortCourses,
  tipFor,
  todayState,
  totalMastered,
} from "./-components/dashboard-model"
import {
  dashboardPreviews,
  isPreviewName,
  type DashboardPreview,
  type PreviewName,
} from "./-components/dashboard-previews"
import { DashboardGreeting } from "./-components/DashboardGreeting"
import { CourseList } from "./-components/CourseList"
import { LanguageFilter } from "./-components/LanguageFilter"
import { PreviewSwitcher } from "./-components/PreviewSwitcher"
import { ProgressDisclosure } from "./-components/ProgressDisclosure"
import { StudyHero } from "./-components/StudyHero"
import { ThisWeek } from "./-components/ThisWeek"
import { TipCard } from "./-components/TipCard"

const messages = {
  title: "Dashboard · Memli",
  loading: "Loading your courses",
  error: {
    heading: "We couldn't load your courses",
    body: "Check your connection, then try again.",
    retry: "Try again",
  },
} as const

/** Above this many other courses, the list offers the Studying menu. */
const MAX_UNFILTERED_COURSES = 5

type DashboardSearch = {
  preview?: PreviewName | undefined
  /** BCP 47 tag of the learning language to focus on. Absent means all. */
  studying?: string | undefined
}

const languageTagPattern = /^[a-z]{2,3}(-[A-Za-z0-9]{2,8})*$/

// `import.meta.env.DEV` guards keep the preview snapshots out of production bundles.
// Every key is always set, even to undefined, because the router merges raw params into this result.
export const Route = createFileRoute("/_app/dashboard")({
  validateSearch: (search: Record<string, unknown>): DashboardSearch => ({
    preview:
      import.meta.env.DEV && isPreviewName(search.preview)
        ? search.preview
        : undefined,
    studying:
      typeof search.studying === "string" &&
      languageTagPattern.test(search.studying)
        ? search.studying
        : undefined,
  }),
  head: () => ({ meta: [{ title: messages.title }] }),
  // A preview is a fixed snapshot and never asks the API.
  loaderDeps: ({ search }) => ({ preview: search.preview }),
  loader: async ({ context, deps }) => {
    if (deps.preview === undefined) {
      await Promise.all([
        context.queryClient.ensureQueryData(coursesQuery),
        context.queryClient.ensureQueryData(historyQuery),
      ])
    }
  },
  component: Dashboard,
  pendingComponent: DashboardPending,
  errorComponent: DashboardError,
})

function Dashboard(): JSX.Element {
  const { preview } = Route.useSearch()
  if (import.meta.env.DEV && preview !== undefined) {
    const seeded: DashboardPreview = dashboardPreviews[preview]
    return <DashboardView metrics={seeded.metrics} />
  }
  return <LiveDashboard />
}

/** Both queries stay subscribed, so numbers refresh on tab focus and after reviews save (`use-save-reviews.ts`). */
function LiveDashboard(): JSX.Element {
  const { data: courses } = useSuspenseQuery(coursesQuery)
  const { data: history } = useSuspenseQuery(historyQuery)
  return <DashboardView metrics={metricsFromApi(courses, history)} />
}

function DashboardView({
  metrics,
}: {
  metrics: DashboardMetrics
}): JSX.Element {
  const viewer = useViewer()
  const search = Route.useSearch()
  const preview = search.preview
  const {
    courses: allCourses,
    dailyGoal,
    daysOfStudy,
    progressTrends,
  } = metrics
  const now = new Date()

  // The hero, the week and the tip cover every course. The Studying menu
  // narrows only the list of other courses (REDESIGN.md 5.4).
  const today = todayState(allCourses)
  const focusCourse = selectFocusCourse(allCourses)
  const otherCourses = sortCourses(allCourses).filter(
    (course) => course.courseId !== focusCourse?.courseId
  )
  const languages = learningLanguages(otherCourses)
  // With five or fewer other courses, every course is already one tap away.
  const showFilter =
    otherCourses.length > MAX_UNFILTERED_COURSES && languages.length >= 2
  const studying =
    showFilter &&
    search.studying !== undefined &&
    languages.includes(search.studying)
      ? search.studying
      : undefined
  // A ?studying= value the menu cannot show is stale: drop it so the URL matches the page.
  const staleStudying = search.studying !== undefined && studying === undefined
  const navigate = Route.useNavigate()
  useEffect(() => {
    if (staleStudying) {
      void navigate({
        search: (prev) => ({ ...prev, studying: undefined }),
        replace: true,
      })
    }
  }, [staleStudying, navigate])
  const listedCourses =
    studying === undefined
      ? otherCourses
      : otherCourses.filter((course) => course.learningLanguage === studying)
  const tip = tipFor(allCourses, today)
  // The finished hero already links to "Find another course".
  const heroFindsAnother =
    today.status === "caught-up" && today.keepGoing === null

  return (
    <Section
      padding="compact"
      // Phones: 16 px gutter and a tighter top, so both hero buttons fit the first screen (REDESIGN.md 5.2).
      className="flex flex-col gap-4 px-4 pt-4 sm:gap-8 sm:px-6 sm:pt-8"
    >
      {import.meta.env.DEV && preview !== undefined ? (
        <PreviewSwitcher current={preview} />
      ) : null}
      <DashboardGreeting
        name={viewer.displayName}
        hasCourses={allCourses.length > 0}
        now={now}
      />
      {focusCourse === null ? (
        <div className="max-w-2xl">
          <StudyHero state={today} />
        </div>
      ) : (
        <>
          {/* DOM order is reading order, with no CSS order. The hero spans rows 1 and 2, and only row 2 is flexible,
              so row 1 is exactly as tall as This week and the tip starts right under it. */}
          <div className="@container">
            <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-x-8 gap-y-10 @[56rem]:grid-cols-[minmax(0,1fr)_20rem] @[56rem]:grid-rows-[auto_1fr_auto_auto]">
              <div className="@[56rem]:col-start-1 @[56rem]:row-span-2 @[56rem]:row-start-1">
                <StudyHero state={today} />
              </div>
              <div className="@[56rem]:col-start-2 @[56rem]:row-start-1">
                <ThisWeek
                  days={dailyGoal.days}
                  target={dailyGoal.target}
                  now={now}
                  clearedToday={today.status === "caught-up"}
                  streakDays={daysOfStudy}
                />
              </div>
              <CourseList
                courses={listedCourses}
                filter={
                  showFilter ? (
                    <LanguageFilter languages={languages} current={studying} />
                  ) : null
                }
                showFindAnother={!heroFindsAnother}
                className="@[56rem]:col-start-1 @[56rem]:row-start-3"
              />
              {tip === null ? null : (
                // Spans the courses' row too, so a tall tip never pushes the courses down.
                <div className="@[56rem]:col-start-2 @[56rem]:row-span-2 @[56rem]:row-start-2">
                  <TipCard tip={tip} />
                </div>
              )}
              <div className="@[56rem]:col-start-1 @[56rem]:row-start-4">
                <ProgressDisclosure
                  retentionPercent={progressTrends.retentionPercent}
                  newCardsThisMonth={progressTrends.newCardsThisMonth}
                  wordsLearned={totalMastered(allCourses)}
                  courses={sortCourses(allCourses)}
                />
              </div>
            </div>
          </div>
        </>
      )}
    </Section>
  )
}

/** Shown only if the courses take more than a second to arrive. */
function DashboardPending(): JSX.Element {
  return (
    <Section padding="compact" className="px-4 pt-4 sm:px-6 sm:pt-8">
      <div
        role="status"
        className="flex items-center gap-3 text-muted-foreground"
      >
        <Spinner />
        <Text variant="muted">{messages.loading}</Text>
      </div>
    </Section>
  )
}

function DashboardError({ reset }: ErrorComponentProps): JSX.Element {
  const router = useRouter()
  return (
    <Section padding="compact" className="px-4 pt-4 sm:px-6 sm:pt-8">
      <div
        role="alert"
        className="flex max-w-xl flex-col items-start gap-4 rounded-xl border border-border bg-card p-6"
      >
        <Heading level={1} size="3">
          {messages.error.heading}
        </Heading>
        <Text variant="muted">{messages.error.body}</Text>
        <Button
          size="touch"
          onClick={() => {
            reset()
            void router.invalidate()
          }}
        >
          {messages.error.retry}
        </Button>
      </div>
    </Section>
  )
}

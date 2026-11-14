import { useEffect, type JSX } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { Section } from "@workspace/ui/components/section"
import { useViewer } from "@/components/session-provider"
import { prototypeDashboardMetrics } from "./-components/dashboard-metrics"
import {
  learningLanguages,
  selectFocusDeck,
  sortDecks,
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
  component: Dashboard,
})

function Dashboard(): JSX.Element {
  const viewer = useViewer()
  const search = Route.useSearch()
  const preview = search.preview
  const seeded: DashboardPreview =
    import.meta.env.DEV && preview !== undefined
      ? dashboardPreviews[preview]
      : { metrics: prototypeDashboardMetrics }
  const { decks: allDecks, dailyGoal, progressTrends } = seeded.metrics
  const streakDays = seeded.streakDays ?? viewer.streakDays
  const now = new Date()

  // The hero, the week and the tip cover every course. The Studying menu
  // narrows only the list of other courses (REDESIGN.md 5.4).
  const today = todayState(allDecks)
  const focusDeck = selectFocusDeck(allDecks)
  const otherCourses = sortDecks(allDecks).filter(
    (deck) => deck.courseId !== focusDeck?.courseId
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
      : otherCourses.filter((deck) => deck.learningLanguage === studying)
  const tip = tipFor(allDecks, today)
  // The finished hero already links to "Find another course".
  const heroFindsAnother =
    today.status === "caught-up" && today.keepGoing === null

  return (
    <Section padding="compact" className="flex flex-col gap-8">
      {import.meta.env.DEV && preview !== undefined ? (
        <PreviewSwitcher current={preview} />
      ) : null}
      <DashboardGreeting
        name={viewer.displayName}
        hasDecks={allDecks.length > 0}
        now={now}
      />
      {focusDeck === null ? (
        <div className="max-w-2xl">
          <StudyHero state={today} />
        </div>
      ) : (
        <>
          {/*
            DOM order is reading order: hero, This week, courses, tip. From an
            896 px content width the grid puts the hero and This week in the
            first row and the courses and the tip in the second. No CSS order.
          */}
          <div className="@container">
            <div className="grid items-start gap-x-8 gap-y-10 @[56rem]:grid-cols-[minmax(0,1fr)_20rem]">
              <StudyHero state={today} />
              <ThisWeek
                days={dailyGoal.days}
                target={dailyGoal.target}
                now={now}
                clearedToday={today.status === "caught-up"}
                streakDays={streakDays}
              />
              <CourseList
                courses={listedCourses}
                filter={
                  showFilter ? (
                    <LanguageFilter languages={languages} current={studying} />
                  ) : null
                }
                showFindAnother={!heroFindsAnother}
              />
              {tip === null ? null : (
                // Stays in the side column even when there is no course list.
                <div className="@[56rem]:col-start-2">
                  <TipCard tip={tip} />
                </div>
              )}
            </div>
          </div>
          <ProgressDisclosure
            retentionPercent={progressTrends.retentionPercent}
            newCardsThisMonth={progressTrends.newCardsThisMonth}
            wordsLearned={totalMastered(allDecks)}
            courses={sortDecks(allDecks)}
          />
        </>
      )}
    </Section>
  )
}

import { useEffect, type JSX } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { Section } from "@workspace/ui/components/section"
import { useViewer } from "@/components/session-provider"
import { prototypeDashboardMetrics } from "./-components/dashboard-metrics"
import {
  deckAction,
  isSameAction,
  learningLanguages,
  selectFocusDeck,
  sortDecks,
  todayPrimaryAction,
  todayState,
  totalDue,
  totalMastered,
} from "./-components/dashboard-model"
import {
  dashboardPreviews,
  isPreviewName,
  type DashboardPreview,
  type PreviewName,
} from "./-components/dashboard-previews"
import { DashboardGreeting } from "./-components/DashboardGreeting"
import { DeckList } from "./-components/DeckList"
import { FocusDeckCard } from "./-components/FocusDeckCard"
import { LanguageFilter } from "./-components/LanguageFilter"
import { MemoryCallout } from "./-components/MemoryCallout"
import { PreviewSwitcher } from "./-components/PreviewSwitcher"
import { ProgressTrends } from "./-components/ProgressTrends"
import { ThisWeek } from "./-components/ThisWeek"
import { TodayPanel } from "./-components/TodayPanel"

const messages = {
  aside: "Your progress",
} as const

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
  const {
    decks: allDecks,
    dailyGoal,
    trickyWords,
    progressTrends,
  } = seeded.metrics
  const streakDays = seeded.streakDays ?? viewer.streakDays
  const now = new Date()

  // The filter narrows what to study. The streak and goal count every language.
  const languages = learningLanguages(allDecks)
  const studying =
    languages.length > 1 &&
    search.studying !== undefined &&
    languages.includes(search.studying)
      ? search.studying
      : undefined
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
  const decks =
    studying === undefined
      ? allDecks
      : allDecks.filter((deck) => deck.learningLanguage === studying)
  const today = todayState(decks)
  const focusDeck = selectFocusDeck(decks)
  const tricky =
    studying === undefined
      ? trickyWords
      : {
          total: decks.reduce((sum, deck) => sum + deck.trickyCount, 0),
          words: trickyWords.words.filter(
            (word) => word.learningLanguage === studying
          ),
        }

  return (
    <Section width="wide" padding="compact" className="flex flex-col gap-8">
      {import.meta.env.DEV && preview !== undefined ? (
        <PreviewSwitcher current={preview} />
      ) : null}
      <DashboardGreeting
        name={viewer.displayName}
        hasDecks={allDecks.length > 0}
        dueCount={totalDue(allDecks)}
        streakDays={streakDays}
        now={now}
      />
      {focusDeck === null ? (
        <div className="max-w-2xl">
          <TodayPanel state={today} />
        </div>
      ) : (
        <>
          <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_20rem]">
            <div className="flex min-w-0 flex-col gap-8">
              {languages.length > 1 ? (
                <LanguageFilter languages={languages} />
              ) : null}
              <TodayPanel state={today} />
              <FocusDeckCard
                deck={focusDeck}
                now={now}
                showAction={
                  !isSameAction(
                    deckAction(focusDeck),
                    todayPrimaryAction(today)
                  )
                }
              />
              <DeckList
                decks={sortDecks(decks).filter(
                  (deck) => deck.courseId !== focusDeck.courseId
                )}
                now={now}
              />
            </div>
            <aside aria-label={messages.aside} className="flex flex-col gap-6">
              <ThisWeek
                days={dailyGoal.days}
                target={dailyGoal.target}
                now={now}
                clearedToday={todayState(allDecks).status === "caught-up"}
                streakDays={streakDays}
                wordsMastered={totalMastered(allDecks)}
              />
              <MemoryCallout total={tricky.total} words={tricky.words} />
            </aside>
          </div>
          <ProgressTrends {...progressTrends} />
        </>
      )}
    </Section>
  )
}

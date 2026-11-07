import type { JSX } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { Section } from "@workspace/ui/components/section"
import { useViewer } from "@/components/session-provider"
import { prototypeDashboardMetrics } from "./-components/dashboard-metrics"
import {
  deckAction,
  isSameAction,
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
import { MemoryCallout } from "./-components/MemoryCallout"
import { PreviewSwitcher } from "./-components/PreviewSwitcher"
import { ProgressTrends } from "./-components/ProgressTrends"
import { ThisWeek } from "./-components/ThisWeek"
import { TodayPanel } from "./-components/TodayPanel"

const messages = {
  aside: "Your progress",
} as const

// `import.meta.env.DEV` guards keep the preview snapshots out of production bundles.
export const Route = createFileRoute("/_app/dashboard")({
  validateSearch: (
    search: Record<string, unknown>
  ): { preview?: PreviewName } =>
    import.meta.env.DEV && isPreviewName(search.preview)
      ? { preview: search.preview }
      : {},
  component: Dashboard,
})

function Dashboard(): JSX.Element {
  const viewer = useViewer()
  const { preview } = Route.useSearch()
  const seeded: DashboardPreview =
    import.meta.env.DEV && preview !== undefined
      ? dashboardPreviews[preview]
      : { metrics: prototypeDashboardMetrics }
  const { decks, dailyGoal, trickyWords, progressTrends } = seeded.metrics
  const streakDays = seeded.streakDays ?? viewer.streakDays
  const dueCount = totalDue(decks)
  const today = todayState(decks)
  const focusDeck = selectFocusDeck(decks)
  const now = new Date()

  return (
    <Section width="wide" padding="compact" className="flex flex-col gap-8">
      {import.meta.env.DEV && preview !== undefined ? (
        <PreviewSwitcher current={preview} />
      ) : null}
      <DashboardGreeting
        name={viewer.displayName}
        hasDecks={decks.length > 0}
        dueCount={dueCount}
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
                clearedToday={today.status === "caught-up"}
                streakDays={streakDays}
                wordsMastered={totalMastered(decks)}
              />
              <MemoryCallout
                total={trickyWords.total}
                words={trickyWords.words}
              />
            </aside>
          </div>
          <ProgressTrends {...progressTrends} />
        </>
      )}
    </Section>
  )
}

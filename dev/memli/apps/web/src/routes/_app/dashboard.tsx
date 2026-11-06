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
import { DashboardGreeting } from "./-components/DashboardGreeting"
import { DeckList } from "./-components/DeckList"
import { FocusDeckCard } from "./-components/FocusDeckCard"
import { ProgressTrends } from "./-components/ProgressTrends"
import { ThisWeek } from "./-components/ThisWeek"
import { TodayPanel } from "./-components/TodayPanel"

export const Route = createFileRoute("/_app/dashboard")({
  component: Dashboard,
})

function Dashboard(): JSX.Element {
  const viewer = useViewer()
  const { decks, dailyGoal, progressTrends } = prototypeDashboardMetrics
  const dueCount = totalDue(decks)
  const today = todayState(decks)
  const focusDeck = selectFocusDeck(decks)
  const now = new Date()

  return (
    <Section width="wide" padding="compact" className="flex flex-col gap-8">
      <DashboardGreeting
        name={viewer.displayName}
        dueCount={dueCount}
        streakDays={viewer.streakDays}
        now={now}
      />
      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="flex min-w-0 flex-col gap-8">
          <TodayPanel state={today} />
          {focusDeck === null ? null : (
            <FocusDeckCard
              deck={focusDeck}
              now={now}
              showAction={
                !isSameAction(deckAction(focusDeck), todayPrimaryAction(today))
              }
            />
          )}
          <DeckList
            decks={sortDecks(decks).filter(
              (deck) => deck.courseId !== focusDeck?.courseId
            )}
            now={now}
          />
        </div>
        <ThisWeek
          days={dailyGoal.days}
          reviewTarget={dailyGoal.reviewTarget}
          now={now}
          streakDays={viewer.streakDays}
          wordsMastered={totalMastered(decks)}
        />
      </div>
      <ProgressTrends {...progressTrends} />
    </Section>
  )
}

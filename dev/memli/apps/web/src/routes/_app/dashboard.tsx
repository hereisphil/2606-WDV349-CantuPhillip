import type { JSX } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { Heading } from "@workspace/ui/components/heading"
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
import { LearningQuickStats } from "./-components/LearningQuickStats"
import { ProgressTrends } from "./-components/ProgressTrends"
import { TodayPanel } from "./-components/TodayPanel"

export const Route = createFileRoute("/_app/dashboard")({
  component: Dashboard,
})

function Dashboard(): JSX.Element {
  const viewer = useViewer()
  const { decks, dailyGoal, progressTrends } = prototypeDashboardMetrics
  const dueCount = totalDue(decks)
  const termsLearned = totalMastered(decks)
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
        <aside aria-labelledby="glance-heading" className="flex flex-col gap-4">
          <Heading id="glance-heading" level={2} size="3">
            At a glance
          </Heading>
          <LearningQuickStats
            termsLearned={termsLearned}
            dailyReviewsCompleted={dailyGoal.reviewsCompleted}
            dailyReviewTarget={dailyGoal.reviewTarget}
          />
        </aside>
      </div>
      <ProgressTrends {...progressTrends} />
    </Section>
  )
}

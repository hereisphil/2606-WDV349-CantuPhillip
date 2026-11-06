import type { JSX } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { Heading } from "@workspace/ui/components/heading"
import { Section } from "@workspace/ui/components/section"
import { Text } from "@workspace/ui/components/text"
import { useViewer } from "@/components/session-provider"
import { prototypeDashboardMetrics } from "./-components/dashboard-metrics"
import { totalDue, totalMastered } from "./-components/dashboard-model"
import { DashboardGreeting } from "./-components/DashboardGreeting"
import { DueReviewAlert } from "./-components/DueReviewAlert"
import { LearningQuickStats } from "./-components/LearningQuickStats"
import { ProgressTrends } from "./-components/ProgressTrends"

export const Route = createFileRoute("/_app/dashboard")({
  component: Dashboard,
})

function Dashboard(): JSX.Element {
  const viewer = useViewer()
  const { decks, dailyGoal, progressTrends } = prototypeDashboardMetrics
  const dueCount = totalDue(decks)
  const termsLearned = totalMastered(decks)

  return (
    <Section width="full" padding="compact" className="flex flex-col gap-8">
      <DashboardGreeting
        name={viewer.displayName}
        dueCount={dueCount}
        streakDays={viewer.streakDays}
        now={new Date()}
      />
      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="flex min-w-0 flex-col gap-8">
          <DueReviewAlert dueCount={dueCount} termsLearned={termsLearned} />
          <section aria-labelledby="decks-heading">
            <Heading id="decks-heading" level={2} size="3">
              Your decks
            </Heading>
            <Text variant="muted" className="mt-2">
              Your vocabulary collections will show up here.
            </Text>
          </section>
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

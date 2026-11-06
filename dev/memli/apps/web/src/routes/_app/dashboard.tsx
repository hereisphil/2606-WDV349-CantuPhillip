import type { JSX } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { Heading } from "@workspace/ui/components/heading"
import { Section } from "@workspace/ui/components/section"
import { Text } from "@workspace/ui/components/text"
import { useViewer } from "@/components/session-provider"
import { prototypeDashboardMetrics } from "./-components/dashboard-metrics"
import { DashboardGreeting } from "./-components/DashboardGreeting"
import { DueReviewAlert } from "./-components/DueReviewAlert"
import { LearningQuickStats } from "./-components/LearningQuickStats"
import { ProgressTrends } from "./-components/ProgressTrends"

export const Route = createFileRoute("/_app/dashboard")({
  component: Dashboard,
})

function Dashboard(): JSX.Element {
  const viewer = useViewer()
  const metrics = prototypeDashboardMetrics

  return (
    <Section width="full" padding="compact" className="flex flex-col gap-8">
      <DashboardGreeting
        name={viewer.displayName}
        dueCount={metrics.dueReview.dueCount}
        streakDays={viewer.streakDays}
        now={new Date()}
      />
      <DueReviewAlert
        {...metrics.dueReview}
        termsLearned={metrics.quickStats.termsLearned}
        stats={<LearningQuickStats {...metrics.quickStats} />}
      />
      <div>
        <Heading level={2} size="3">
          Decks
        </Heading>
        <Text variant="muted" className="mt-2">
          Your vocabulary collections will show up here.
        </Text>
      </div>
      <ProgressTrends {...metrics.progressTrends} />
    </Section>
  )
}

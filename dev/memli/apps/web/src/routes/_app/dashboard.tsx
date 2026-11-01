import type { JSX } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { Heading } from "@workspace/ui/components/heading"
import { Section } from "@workspace/ui/components/section"
import { Text } from "@workspace/ui/components/text"
import { prototypeDashboardMetrics } from "./-components/dashboard-metrics"
import { DueReviewAlert } from "./-components/DueReviewAlert"
import { LearningQuickStats } from "./-components/LearningQuickStats"
import { ProgressTrends } from "./-components/ProgressTrends"

export const Route = createFileRoute("/_app/dashboard")({
  component: Dashboard,
})

function Dashboard(): JSX.Element {
  const metrics = prototypeDashboardMetrics

  return (
    <Section width="full" padding="compact" className="flex flex-col gap-8">
      <DueReviewAlert
        {...metrics.dueReview}
        stats={<LearningQuickStats {...metrics.quickStats} />}
      />
      <div>
        <Heading>Decks</Heading>
        <Text variant="muted" className="mt-2">
          Your vocabulary collections will show up here.
        </Text>
      </div>
      <ProgressTrends {...metrics.progressTrends} />
    </Section>
  )
}
